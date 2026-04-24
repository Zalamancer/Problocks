# Lighting, Shadows, Color Space

Lighting is where most "kid-style" generations die. One `DirectionalLight` +
one `AmbientLight` gives you dead, stark scenes. The fix is a **three-light
rig** plus proper tonemapping + color space + soft shadows.

## The three-light rig

```js
// 1. Hemisphere — sky warmth + ground bounce. The #1 missing light in bad
//    generations. Makes shadows feel warm underneath, cool on top.
const hemi = new THREE.HemisphereLight(
  0xb0d6ff,   // sky color (dusty blue)
  0x6b7a3a,   // ground color (olive)
  0.6,        // intensity
);
scene.add(hemi);

// 2. Key — warm directional "sun". Casts shadows.
const key = new THREE.DirectionalLight(0xffeedd, 1.0);
key.position.set(30, 50, 20);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);   // drop to 1024 on N4000
key.shadow.bias = -0.0005;
key.shadow.normalBias = 0.02;
key.shadow.camera.near = 1;
key.shadow.camera.far = 120;
key.shadow.camera.left = -60;
key.shadow.camera.right = 60;
key.shadow.camera.top = 60;
key.shadow.camera.bottom = -60;
scene.add(key);

// 3. Cool ambient fill — lifts the shadow side without killing contrast.
const ambient = new THREE.AmbientLight(0x404060, 0.3);
scene.add(ambient);

// 4. (optional) Rim — back-light from opposite side of key, no shadow.
//    Adds a silhouette halo; very Roblox-screenshot.
const rim = new THREE.DirectionalLight(0xcfe6ff, 0.4);
rim.position.set(-30, 40, -20);
scene.add(rim);
```

Rules of thumb:

- Key intensity 1.0, fill 0.3, hemi 0.6, rim 0.4 — proportions matter more
  than absolute values
- Sky color slightly desaturated (`#b0d6ff`, not `#87ceeb`) — pure sky-blue
  tints everything too aggressively
- Ground color is the color of the **ground the light is bouncing off**,
  not gray — olive for grass, sandy for desert, ice-blue for snow
- `shadow.bias = -0.0005` eliminates shadow-acne without causing peter-panning;
  `normalBias = 0.02` is the belt for characters with round geometry

## Shadow setup on the renderer

```js
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;   // the only acceptable type
```

`PCFSoftShadowMap` is mandatory for kid-style. `BasicShadowMap` gives you the
1999 aliased-edge look; `VSMShadowMap` is heavy and often blurry in the wrong
way. `PCFSoftShadowMap` is the Pokopia/Roblox soft shadow.

On low-end hardware, keep `PCFSoft` but drop `shadow.mapSize` from 2048 to
1024 or 512. Visual difference is subtle; perf difference is dramatic.

## Contact shadows (the fake-AO trick)

A dark soft blob directly under each character makes them feel grounded even
when real shadows aren't reaching (e.g. shadow map too coarse, overcast
lighting). Cheap and extremely effective:

```js
function addContactShadow(target, radius = 0.6, opacity = 0.35) {
  const geo = new THREE.CircleGeometry(radius, 24);
  const mat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity,
    depthWrite: false,  // don't block other geometry
  });
  const disc = new THREE.Mesh(geo, mat);
  disc.rotation.x = -Math.PI / 2;
  disc.position.y = 0.01;
  target.add(disc);
  return disc;
}
```

For a softer edge use a **radial gradient texture** instead of a flat color —
3-stop gradient from black (center) to transparent (edge) on a PlaneGeometry.

In react-three-fiber, drei ships `<ContactShadows>` which is a higher-quality
screen-space technique; prefer that when you're in r3f land.

## Color space & tonemapping

This is what separates a 2026 Three.js scene from a 2019 one. One line each,
massive visual payoff:

```js
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
```

**sRGB output** — without it, colors look dim and muddy. This was the default
pre-r152; r152+ changed defaults, and older tutorials use `outputEncoding =
sRGBEncoding` which was removed in r162. Always set `outputColorSpace`
explicitly.

**ACES filmic tonemapping** — maps HDR → LDR in the way film does. Bright
highlights roll off gracefully instead of clipping to white, dark areas keep
detail instead of crushing to black. `NeutralToneMapping` (r157+) is the
newer alternative; slightly less cinematic but more accurate color response.

**Exposure 1.0** is fine for most scenes. Bump to 1.2–1.4 for a brighter
"daytime cereal-ad" look; drop to 0.7–0.8 for indoor/overcast.

### Texture color spaces

Any color texture (albedo, matcap, environment) → `colorSpace = SRGBColorSpace`.

Any data texture (normal map, roughness, AO, gradient map for toon shader) →
`colorSpace = NoColorSpace` (i.e. linear, since it's data not color).

```js
const albedo = loader.load('/tex/wood.png');
albedo.colorSpace = THREE.SRGBColorSpace;

const normal = loader.load('/tex/wood_n.png');
normal.colorSpace = THREE.NoColorSpace;
```

Mis-tagged textures are a top-10 reason scenes look "off" — normals get
gamma-corrected and end up wrong, or colors get double-corrected and look
washed out.

## Fog — cheap atmosphere + cheap LOD

```js
scene.fog = new THREE.FogExp2('#b0d6ff', 0.015);
// or
scene.fog = new THREE.Fog('#b0d6ff', 10, 60);
```

Fog color should match the sky color. Two bonuses:

1. Softens the transition to the horizon so the scene doesn't look like a
   stage set with a hard edge
2. Hides distant LOD popping — you can cull/downgrade far objects under
   cover of fog

Don't use fog in night scenes (looks like smog) — swap to a darker scene
background + sparse hemi and let distance dim naturally.

## Loading Three.js from a CDN

If you're building an HTML demo or standalone page (not using the npm build),
use the **importmap pattern**, not the old script tag:

```html
<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"
  }
}
</script>
<script type="module">
  import * as THREE from 'three';
  import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
  import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
  // ...
</script>
```

Why: `three.min.js` from cdnjs doesn't bundle addons, and the cdnjs addon
paths are inconsistent. The jsdelivr `three/addons/` prefix maps to the
official `examples/jsm/` directory in the npm package, so every addon in the
Three.js repo is addressable.

When replacing the old `new THREE.OrbitControls(...)`, you import it directly:

```js
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
const controls = new OrbitControls(camera, renderer.domElement);
```

## Debugging the lighting

If a scene looks wrong, flip these on temporarily:

```js
scene.add(new THREE.HemisphereLightHelper(hemi, 2));
scene.add(new THREE.DirectionalLightHelper(key, 5));
scene.add(new THREE.CameraHelper(key.shadow.camera));
```

The last one (shadow camera frustum) is the biggest revealer — if your
objects are outside the frustum, they cast no shadow. Tune `shadow.camera.top/
bottom/left/right` until the frustum snugly contains your scene.

## Celeron N4000 budget

Rough budget for 60 FPS on a Chromebook:

- 1 HemisphereLight (free)
- 1 DirectionalLight with shadow, `mapSize 1024`
- 1 AmbientLight (free)
- Optional 1 non-shadow rim light (cheap)
- No point lights, no spot lights (expensive + flicker)
- `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))` — cap at 2
- `antialias: true` is fine at 1024×768; drop at 1080p+ if perf suffers
- Post-processing: keep at most **one** pass (outline or bloom or TAA, not
  all three). Inverted-hull outlines do not count — they're mesh-based.
