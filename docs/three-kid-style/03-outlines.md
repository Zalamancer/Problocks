# Outlines

The single most-skipped technique in default 3D generations, and arguably the
biggest gap between "a Three.js scene" and "a Roblox / Pokopia / BOTW / Ni No
Kuni scene". Without outlines, meshes blur into each other and the toy-like
reading fails.

Three viable methods, ranked by how often you should reach for them:

## Method 1 — Inverted-hull (the default)

Duplicate each mesh, flip normals so the inside is rendered, push vertices
slightly along their normals, colour it black. You see the pushed shell behind
the original, creating a constant-thickness outline.

**Pros:** cheap (it's just extra draw calls, no post-processing), composes
with any camera / materials, works on Chromebooks, per-object opt-in.

**Cons:** doesn't outline intersections between objects (two characters
touching look like one silhouette), hard edges can flicker on very thin geom,
requires `side: BackSide`.

### Basic version — uniform thickness

```js
function addInvertedHullOutline(mesh, options = {}) {
  const {
    color = 0x1a1a22,       // soft charcoal, not pure black
    thickness = 0.03,       // world-units push
    renderOrder = -1,       // draw before original
  } = options;

  const outlineMat = new THREE.MeshBasicMaterial({
    color,
    side: THREE.BackSide,
    fog: false,             // don't blend outline into fog
  });

  const outline = new THREE.Mesh(mesh.geometry, outlineMat);

  // Scale along normals — cheap approximation of real normal-extrusion.
  // Good for blob-like geometry; for hard edges use the shader version below.
  const bbox = new THREE.Box3().setFromObject(mesh);
  const size = bbox.getSize(new THREE.Vector3());
  const avgSize = (size.x + size.y + size.z) / 3;
  const scaleFactor = 1 + thickness / avgSize;
  outline.scale.setScalar(scaleFactor);

  outline.renderOrder = renderOrder;
  mesh.add(outline);
  return outline;
}
```

Call once per mesh you want outlined. Don't outline the ground, fog-distant
props, or tiny eye/cheek details.

### Better version — shader normal extrusion

True normal extrusion produces a constant-thickness outline regardless of
mesh shape. Use `ShaderMaterial`:

```js
const outlineShaderMat = new THREE.ShaderMaterial({
  uniforms: {
    thickness: { value: 0.025 },
    outlineColor: { value: new THREE.Color(0x1a1a22) },
  },
  vertexShader: `
    uniform float thickness;
    void main() {
      vec3 pushed = position + normal * thickness;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pushed, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 outlineColor;
    void main() {
      gl_FragColor = vec4(outlineColor, 1.0);
    }
  `,
  side: THREE.BackSide,
});
```

The shader pushes each vertex along its local normal by `thickness` world
units. Thickness is usually 0.02–0.04. On very small meshes (eyes), drop to
0.008. On huge walls, bump to 0.08.

### Screen-space thickness (bonus)

Default thickness is in world units, so far objects get thinner outlines. If
you want **constant screen-space thickness** (the modern-Roblox look), divide
by view-space depth:

```glsl
vec4 viewPos = modelViewMatrix * vec4(position, 1.0);
float depth = -viewPos.z;
vec3 pushed = position + normal * thickness * depth;
```

Now an outline on an object 1 unit away and 20 units away look identically
thick on screen. This is the Nintendo / Pokopia rig.

### Why not pure black

Outlines at `#000000` on a warm scene look pasted-on. A soft charcoal like
`#1a1a22` or `#2a2a2f` blends with shadows and reads natural. Go even warmer
(`#2a1f1d`) in sunset scenes.

## Method 2 — `OutlineEffect` addon

Three.js ships `OutlineEffect` as an addon — it's a renderer-level wrapper
that adds an inverted-hull pass automatically to every mesh. Zero per-mesh
code.

```js
import { OutlineEffect } from 'three/addons/effects/OutlineEffect.js';

const effect = new OutlineEffect(renderer, {
  defaultThickness: 0.003,            // screen-space
  defaultColor: [0.1, 0.1, 0.12],
  defaultAlpha: 1.0,
  defaultKeepAlive: false,
});

// Replace render call:
// renderer.render(scene, camera);
effect.render(scene, camera);

// Per-mesh override:
mesh.material.userData.outlineParameters = {
  thickness: 0.005,
  color: [0.05, 0.0, 0.0],
  alpha: 0.8,
  visible: true,
};
```

**Pros:** drop-in, no per-mesh setup, handles normals correctly.
**Cons:** outlines every mesh by default (explicitly disable ground, sky,
fog-distant props per-material via `visible: false`). Doesn't compose well
with other post-process passes.

Use this for prototypes. For production studio code, prefer explicit Method
1 because it's per-object opt-in.

## Method 3 — Post-process edge detection

Render scene normals + depth into an MRT, sobel-filter them in a fullscreen
pass to find discontinuities, composite as a dark overlay.

**Pros:** detects intersections between objects (two characters touching are
outlined separately), outlines crease edges on a single mesh, consistent
thickness.

**Cons:** expensive (extra render target + fullscreen pass), doesn't work on
the Chromebook tier, requires post-processing pipeline (`EffectComposer`).

Use this only in "cinematic screenshot" or "high-quality thumbnail" rendering
paths, not the live viewport.

Rough setup (using `postprocessing` library or the built-in `EffectComposer`):

```js
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const outline = new OutlinePass(
  new THREE.Vector2(innerWidth, innerHeight),
  scene,
  camera
);
outline.edgeStrength = 3.0;
outline.edgeThickness = 1.0;
outline.visibleEdgeColor.set('#1a1a22');
outline.hiddenEdgeColor.set('#000000');
outline.selectedObjects = [...sceneObjectsToOutline];
composer.addPass(outline);

// Replace renderer.render with composer.render()
```

Note: `OutlinePass` is a *selection* highlight, not a universal outline — you
pass it an array of objects to outline. Good for hover/select UI, not for
every-mesh outlines.

## Per-type recommendations

| Object type | Method | Notes |
|---|---|---|
| Character (player, NPC, pet) | **Method 1 shader version** | thickness 0.03, charcoal color |
| Prop (tree, bush, rock, furniture) | **Method 1 basic** | thickness 0.025 |
| Tiny detail (eye pupil, blush, button) | **No outline** | outlines make them muddy |
| Ground / terrain | **No outline** | outlines create sharp horizon |
| Sky / skybox | **No outline** | backmost layer, outline would wrap world |
| UI / HUD 3D element | **Method 2 or none** | depends on HUD style |
| Hover / select highlight | **Method 3 (`OutlinePass`)** | what it was designed for |
| Fog-distant props | **No outline** | fog already hides them; outlines fight fog |

## Outline color recipe

Don't hardcode a single outline color. Instead, **darken each material's base
color by ~60%**:

```js
function outlineColorFor(baseColor) {
  const hsl = {};
  new THREE.Color(baseColor).getHSL(hsl);
  const result = new THREE.Color();
  result.setHSL(hsl.h, hsl.s * 0.8, Math.max(0.05, hsl.l * 0.2));
  return result;
}
```

A coral character gets a brownish outline; a mint tree gets a dark-green
outline; a butter-yellow prop gets a dark-ochre outline. This reads *much*
more natural than pure black everywhere and is a trick Ghibli / Pokopia /
Monster Hunter Stories use pervasively.

## Compositing order

When you have an inverted-hull outline + contact shadow + the main mesh:

```
renderOrder:
  -1   outline (back side)
   0   main mesh (default)
   1   contact shadow disc (transparent, depthWrite false)
```

Getting this wrong causes z-fighting between outline and mesh, or contact
shadow disappearing under the outline.

## Common failures

- **Outline visible inside the mesh** → `side` is not `BackSide`, or
  `renderOrder` is wrong so outline draws after mesh
- **Outline thickness looks wildly different per mesh** → using the basic
  scale-based trick on meshes of very different sizes; switch to shader
  normal extrusion for consistency
- **Character's head outline is missing at the top** → normals at a sphere's
  top pole are pinched; use a higher-segment sphere (48×32) or add a tiny bit
  of `scale` offset in world Y
- **Outline flickers on thin geometry (e.g. eyebrows)** → push thickness too
  close to the geometry's thinnest dimension; either thicken the geometry or
  remove outline on that part
- **Outlines don't appear on a GLTF import** → imported meshes share
  materials; when you clone for outline, also set
  `outlineMesh.frustumCulled = false` if culling is biting you
