# Geometry & Materials

What to reach for instead of `BoxGeometry` + `MeshStandardMaterial` defaults.

## Rounded boxes (the #1 fix)

Replacing every `BoxGeometry` with a rounded equivalent is ~40% of the "hard
edges → toy-like" transformation on its own. Three options:

### Option A — `RoundedBoxGeometry` addon (preferred)

Ships with Three.js. Uses an internal box + vertex displacement so UVs and
normals stay sane.

```js
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// width, height, depth, segments (bevel detail), radius (bevel size)
const geo = new RoundedBoxGeometry(1, 1, 1, 4, 0.15);
```

Rule of thumb for the radius:

- **0.08–0.12** — subtle softening (walls, large blocks)
- **0.15–0.22** — noticeable Pokopia-style rounding (character body parts, props)
- **0.25+** — very blobby, almost a rounded-rect; good for oversized cute props

`segments: 4` is the sweet spot — enough bevel detail to read smooth, cheap
enough for hundreds of instances.

### Option B — Extruded `Shape` with bevel

Use when you need a non-rectangular rounded profile (pitched roof, polygonal
rounded platform). Gives you full control over the outline.

```js
const shape = new THREE.Shape();
shape.moveTo(-w/2, 0);
shape.lineTo(w/2, 0);
shape.lineTo(0, h);
shape.closePath();
const geo = new THREE.ExtrudeGeometry(shape, {
  depth: d,
  bevelEnabled: true,
  bevelThickness: 0.12,
  bevelSize: 0.12,
  bevelSegments: 3,
});
geo.center();
```

`bevelThickness + bevelSize` both at ~0.12 is what gives you the *rounded
Adopt-Me roof* look instead of a CAD-ish triangular prism.

### Option C — Manual bevel (last resort)

Write your own fat triangle generator. Don't do this unless the first two
fail — they rarely do.

## Segment counts — the invisible killer

Three.js defaults to **8 radial segments** on cylinders and cones. That's the
main source of "I can see the facets" ugliness. Fix at the geometry level:

| Geometry | Default | Kid-style minimum |
|---|---|---|
| `SphereGeometry` | 32 × 16 | 32 × 24 |
| `CylinderGeometry` | 8 | 32 |
| `ConeGeometry` | 8 | 32 |
| `CapsuleGeometry` | 4 × 8 | 8 × 32 |
| `TorusGeometry` | 8 × 6 | 32 × 16 |
| `PlaneGeometry` (water, terrain) | 1 × 1 | use segments if you deform |

For very distant props, drop segments (16, 12) — don't uniformly 32 the whole
scene or you'll crush the N4000 Chromebooks. Helper:

```js
function kidSphere(r, detail = 1) {
  const seg = detail >= 2 ? 48 : detail >= 1 ? 32 : 16;
  return new THREE.SphereGeometry(r, seg, Math.round(seg * 0.75));
}
```

## Materials — the decision tree

Three materials cover 95% of kid-style work. Pick by asking "what is this?":

### `MeshToonMaterial` — the default for characters & important props

Banded shading. Three to four flat bands of color. This is what gives you the
Pokopia / Ghibli / *Breath of the Wild* look.

```js
// Build a 4-step gradient map once, reuse everywhere
function buildToonGradient(steps = 4) {
  const size = steps;
  const data = new Uint8Array(size);
  for (let i = 0; i < size; i++) data[i] = Math.floor((i / (size - 1)) * 255);
  const tex = new THREE.DataTexture(data, size, 1, THREE.RedFormat);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  return tex;
}

const toonGradient = buildToonGradient(4);
const mat = new THREE.MeshToonMaterial({ color: 0xff7a6b, gradientMap: toonGradient });
```

Gotchas:

- **3 steps** reads as "cartoon cell-shaded"
- **4 steps** (the default here) reads as "soft toy"
- **5+ steps** blurs back toward MeshLambert — defeats the point
- Must have directional lighting hitting the object to see the banding; under
  pure ambient it looks flat

### `MeshMatcapMaterial` — the cheat code

A matcap (material capture) texture bakes lighting + shading + rim into a
single sphere-mapped texture. One texture replaces your whole lighting setup
for that material. Great for stylized props where you want consistency across
lighting conditions.

```js
const loader = new THREE.TextureLoader();
const matcap = loader.load('/matcaps/toon-coral.png');
matcap.colorSpace = THREE.SRGBColorSpace;
const mat = new THREE.MeshMatcapMaterial({ matcap });
```

Free matcap libraries: [nidorx/matcaps](https://github.com/nidorx/matcaps) —
hundreds of free 256×256 PNGs covering toon, clay, metal, glass, velvet.

When to use matcap over toon:

- You want a specific baked look (glossy plastic, velvet, clay) that's hard to
  express with toon + lights
- You need rendering to look identical under any lighting (thumbnails,
  preview windows where the scene lighting might differ)
- Performance-critical scenes on Chromebooks — matcaps skip most shading math

When **not** to use matcap:

- Objects need to receive real shadows from other objects (matcap ignores them)
- Objects need to change appearance with time of day / scene lighting

### `MeshStandardMaterial` (desaturated + soft) — environments only

Use for large environmental surfaces (terrain, walls) where toon banding would
look weird on huge gradients. Settings that keep it kid-style:

```js
const mat = new THREE.MeshStandardMaterial({
  color: 0xb8c97a,      // desaturated
  roughness: 0.85,      // matte
  metalness: 0.0,
  flatShading: false,
});
```

Avoid `metalness > 0` entirely in kid-style scenes unless you genuinely want a
gold coin or similar feature.

### `MeshLambertMaterial` — the cheap fallback

Used in `renderer3d.js` ground plane. Fine for large receive-shadow-only
surfaces on low-end hardware. Pairs with any of the above for other objects.

## Palette — warm desaturated

Saturated primaries (`#ff0000`, `#00ff00`) read as debug-render. Shift every
color toward warm + desaturated:

| Role | Hex | Notes |
|---|---|---|
| Coral / accent red | `#ff7a6b` | Characters, hearts, flag |
| Mint / accent green | `#9fd86c` | Grass, foliage highlights |
| Butter / accent yellow | `#ffe58a` | Sun, flowers, lamp glow |
| Dusty sky | `#b0d6ff` | Sky background, water, ice |
| Warm ivory | `#fff4e6` | House walls, character skin tone |
| Soft charcoal | `#2a2a2f` | Never pure black — used for hair, darker trim |
| Dusty rose | `#f5b8c4` | Cheek blush, flower petals, balloons |
| Sage | `#7fa17a` | Tree trunks, ground variant |

Generate a coordinated palette by picking any two of these as primary + accent
and sampling neighbors in HSL space (± 15° hue, ± 10% saturation, ± 15%
lightness).

## Shadow scheme for geometry

Per-mesh (not per-light) config:

```js
mesh.castShadow = true;      // props, characters
mesh.receiveShadow = true;   // ground, platforms, walls
```

Character eyes, cheek blush, and tiny decorative dots → `castShadow = false`
(saves fillrate, and their shadows look like specks of dust).

## Common mistakes

- **Mixing toon and standard on the same character** → the toon parts read as
  cartoon, the standard parts as realistic, and the character looks
  schizophrenic. Pick one per character.
- **`flatShading: true` on smooth geometry** → the faceted Low-Poly look is a
  *different* aesthetic than kid-style. Don't set `flatShading` unless you
  genuinely want that crystalline faceted reading.
- **Sharing materials without cloning** when you want per-instance color
  changes → mutating one instance's `.color` changes them all. Call
  `material.clone()` before mutating.
- **Skipping `material.gradientMap.colorSpace = THREE.NoColorSpace`** on the
  toon gradient → it gets auto-sRGB-converted in r152+ and your bands shift.
  Keep it as `NoColorSpace` since it's a lookup, not a color.
