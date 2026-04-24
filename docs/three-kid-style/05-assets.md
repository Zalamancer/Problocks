# Assets & r3f Scaffold

Ready-made kid-style 3D assets (CC0 or CC-BY), plus the pattern for importing
them **without breaking your toon look**.

## CC0 / free asset libraries

All of these are effectively free Pokopia/Roblox-style libraries. Prefer them
over generating meshes procedurally when the shape exists.

### Quaternius — the single best starting point

- URL: https://quaternius.com/
- License: CC0 (public domain, no attribution required)
- Style: perfectly consistent low-poly, kid-friendly, slightly stylized
- Packs: Ultimate Stylized Nature, Animated Animals, Modular Characters,
  Medieval Town, Spaceships, Food, Furniture, Vehicles
- Format: GLTF / FBX / OBJ
- Best for: anything "generic kid-friendly 3D asset" — if you need a tree, a
  cow, a wagon, a jeep, or a modular character, start here

### Kenney — environment kits + characters

- URL: https://kenney.nl/assets?q=3d
- License: CC0
- Style: slightly blockier than Quaternius, super consistent per-pack
- Packs: Nature Kit, Castle Kit, City Kit, Platformer Kit, Prototype Kit,
  Character Kit
- Format: GLTF / OBJ / FBX
- Best for: environment-kit-bashing (stacking grid-aligned modular parts
  into a level). Prototype Kit is invaluable for greyboxing.

### KayKit — stylized dungeon / adventure

- URL: https://kaylousberg.itch.io/
- License: CC0 (or cheap CC-BY)
- Style: more stylized-toon than Quaternius, more varied silhouettes
- Packs: Dungeon Pack, Adventurers, Skeletons, Mini-Game Variety, Character Pack
- Format: GLTF
- Best for: RPG-style adventures, monsters, fantasy

### Poly Pizza — aggregator

- URL: https://poly.pizza/
- License: Mix (CC-BY, CC0) — each model tagged individually
- Contains: thousands of community uploads plus the Google Poly archive
- Best for: finding one specific thing you can't get elsewhere ("cartoon
  donut", "low-poly hot air balloon")

### Sketchfab — everything else

- URL: https://sketchfab.com/3d-models?features=downloadable&licenses=322a749bcfa841b29dff1e8a1bb74b0b
  (filter: downloadable + CC0)
- License: mixed — always check per-model
- Style: wildly varied; filter by "low poly" + "cute"

## GLTF re-materialization pattern

This is the most important thing in this file. Loading a GLTF directly into
a toon scene almost always breaks the aesthetic — the GLTF ships with
`MeshStandardMaterial` (realistic PBR), which doesn't match your toon
characters / toon environment.

Fix: walk the scene graph, replace every `MeshStandardMaterial` with
`MeshToonMaterial` using the original base color.

```js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const toonGradient = buildToonGradient(4);   // from 01-geometry-materials.md

const loader = new GLTFLoader();
loader.load('/assets/quaternius/fox.glb', (gltf) => {
  gltf.scene.traverse((obj) => {
    if (!obj.isMesh) return;
    obj.castShadow = true;
    obj.receiveShadow = true;

    // Replace material
    const oldMat = obj.material;
    const color = oldMat.color ?? new THREE.Color(0xffffff);
    const map = oldMat.map ?? null;
    const newMat = new THREE.MeshToonMaterial({
      color,
      map,
      gradientMap: toonGradient,
    });
    if (map) map.colorSpace = THREE.SRGBColorSpace;
    obj.material = newMat;

    // Optional: add inverted-hull outline
    addInvertedHullOutline(obj);
  });
  scene.add(gltf.scene);
});
```

For large models with many materials, cache: `new Map<originalUuid, toonMat>`
so the second, third, and nth mesh sharing the same source material reuse the
same toon material.

### Handling per-mesh color without a texture

Quaternius models use flat colors in the material (no texture). Kenney uses
a single atlas texture with UV-based colors. Different handling:

- **Flat-color model (Quaternius)** → swap material, keep `.color`
- **Atlas-textured model (Kenney)** → swap material, keep `.map`
- **Multi-texture PBR (sketchfab realistic)** → strip all maps except
  `.map`, swap material. You're losing info but that's the point — the model
  wasn't kid-style.

### Handling skinned meshes (animated characters)

`MeshToonMaterial` supports skinning. Swap as above. But if you swap a
`MeshStandardMaterial` that used `morphTargets`, you need to pass the morph
flags to the new material:

```js
const newMat = new THREE.MeshToonMaterial({
  color,
  skinning: oldMat.skinning,           // r152+ deprecated, auto-detected now
  morphTargets: oldMat.morphTargets,
  morphNormals: oldMat.morphNormals,
  gradientMap: toonGradient,
});
```

Three.js r152+ auto-detects these flags; on older versions you must set them.

## react-three-fiber scaffold

If you're using r3f / drei (which you should consider for the Problocks 3D
freeform studio), a lot of kid-style becomes one-liners:

```jsx
import { Canvas } from '@react-three/fiber';
import {
  OrbitControls,
  ContactShadows,
  Outlines,
  SoftShadows,
  Environment,
  Gltf,
} from '@react-three/drei';

export function KidStyleScene() {
  return (
    <Canvas shadows camera={{ position: [8, 8, 12], fov: 50 }}>
      <SoftShadows size={25} samples={16} />
      <hemisphereLight args={[0xb0d6ff, 0x6b7a3a, 0.6]} />
      <directionalLight
        position={[30, 50, 20]}
        intensity={1.0}
        color={0xffeedd}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
      />
      <ambientLight color={0x404060} intensity={0.3} />

      <mesh castShadow receiveShadow position={[0, 1, 0]}>
        <RoundedBox args={[1, 1, 1, 4, 0.15]} />
        <meshToonMaterial color="#ff7a6b" gradientMap={toonGradient} />
        <Outlines thickness={2} color="#1a1a22" />
      </mesh>

      <ContactShadows opacity={0.4} blur={2.5} far={10} />
      <Environment preset="park" />   {/* for subtle rim reflections */}
      <OrbitControls />
    </Canvas>
  );
}
```

drei primitives worth knowing:

| Component | Kid-style use |
|---|---|
| `<RoundedBox>` | 01 rounded geometry, one-line |
| `<Outlines>` | 03 inverted-hull outlines per-object, one-line |
| `<ContactShadows>` | 02 fake AO under objects, screen-space quality |
| `<SoftShadows>` | High-quality PCF shadows via drei override |
| `<Environment>` | HDRI-based reflection for subtle rim; use `preset="park"` |
| `<Gltf>` | Wraps GLTFLoader with suspense; still need re-materialization |
| `<Float>` | Wraps child with idle bob; good for props |
| `<Billboard>` | Always-face-camera for cheek blush / sprite decals |

## When to hand-model vs use a library

Quick rubric:

- **Use a library asset** when the shape is generic and not brand-identifying
  (trees, rocks, mushrooms, generic NPCs, vehicles, food, furniture).
- **Hand-model** when the shape is specific to your game's IP or it's
  primitive-shaped anyway (the player character, a quest-giver with a
  distinctive silhouette, game-specific props like your custom crate/coin).

For Problocks specifically: the wardrobe avatars, crates, and existing
primitives in `PartPreview.tsx` are hand-modeled; library assets should slot
in as level-building blocks (trees, fences, houses) for the 3D freeform
studio.

## License compliance quick-ref

| License | Attribution required? | Commercial OK? | Modify OK? |
|---|---|---|---|
| CC0 | No | Yes | Yes |
| CC-BY | **Yes** (per model) | Yes | Yes |
| CC-BY-SA | Yes (and share-alike) | Yes | Yes (same license) |
| CC-BY-NC | Yes | **No** | Yes |
| All Rights Reserved | — | — | **No** |

For Problocks, stick to **CC0** for anything that ships to students. Tracking
attribution for 50+ CC-BY models across a live-service product is a compliance
headache you don't need. Quaternius + Kenney cover ~80% of what you'd reach
for, both CC0.

## Where to put asset files

Structure that works well:

```
public/3d-assets/
  ├── quaternius/
  │   ├── trees/
  │   │   ├── oak.glb
  │   │   └── pine.glb
  │   ├── animals/
  │   │   ├── fox.glb
  │   │   └── bunny.glb
  │   └── LICENSE.txt            ← CC0 notice
  ├── kenney/
  │   ├── nature-kit.glb         ← single packed file from a kit
  │   └── LICENSE.txt
  └── custom/
      └── problocks-crate.glb    ← hand-modeled, project-specific
```

Each library gets its own subfolder with a license file. Makes audits trivial.
Use `<Gltf src="/3d-assets/quaternius/trees/oak.glb" />` or load via
`GLTFLoader`.

## Tiny gotchas collected from the wild

- **GLB's `doubleSide` flag** on leaves gets ignored when you swap material;
  re-enable via `newMat.side = THREE.DoubleSide` per mesh if `oldMat.side ===
  THREE.DoubleSide`.
- **Y-up vs Z-up** — Three.js is Y-up, some exporters default to Z-up. If an
  asset loads "lying on its face", rotate the root by `-Math.PI/2` on X.
- **Scale mismatch** — Quaternius models are ~1 unit = 1m. Kenney kits are
  often 1 unit = 1 grid cell (~2m). If your scene units assume 1m, scale
  Kenney by 0.5.
- **Centred origin** — not all exported models have a clean (0, y=feet,
  0) origin. Check and `geometry.translate(...)` if needed before instancing.
- **Big files** — Quaternius "Ultimate Nature" is ~50 MB. Either unpack per-
  model or use Draco/Meshopt compression (`gltf-transform compress`) and drop
  to ~10 MB with no visible quality loss.
