# Three.js Kid-Style Skill

A reference for generating **low-poly, kid-friendly, smooth, Roblox/Pokopia-style**
Three.js scenes — the aesthetic where things look soft, toy-like, and likeable
instead of hard-edged, plastic, or CAD-ish.

Use this doc as:

1. A **paste-in preamble** for prompts that generate Three.js code (see the
   quick preamble below — dense, ≤ 20 lines, override the model's defaults).
2. A **reference library** when writing or reviewing 3D code in this repo
   (studio 3D freeform view, game engine `renderer3d.js`, wardrobe avatars,
   crates, preview thumbnails).

## Why default generations look wrong

| Default reached for | Why it looks bad | Fix |
|---|---|---|
| `BoxGeometry(w,h,d)` | Hard 90° corners — nothing in Roblox/Pokopia has those | `RoundedBoxGeometry` or extruded `Shape` with bevel |
| `SphereGeometry(r)` | Default 32 segs is fine; but pairs with cyl(8) | Force cylinder 32 radial segments |
| `CylinderGeometry(r,r,h)` | Defaults to 8 radial segments — faceted | Always pass `radialSegments: 32` |
| `MeshPhongMaterial` | Waxy plastic look, 2004-era | `MeshToonMaterial` or `MeshMatcapMaterial` |
| `MeshStandardMaterial` (raw) | Correct but realistic; reads as "not a toy" | Toon or matcap for characters; desaturate PBR |
| `DirectionalLight + AmbientLight` only | Stark shadows, dead fills, no sky warmth | Hemi + warm key + cool fill |
| No outlines | Shapes blur together; loses "Roblox feel" | Inverted-hull shell on characters/important props |
| Pure saturated `#ff0000 #00ff00` | Reads as debug-render | Warm desaturated palette (coral/mint/butter) |

## Quick-preamble (paste into the prompt)

Paste this block as system-style instructions whenever asking Claude to produce
Three.js code. Short enough to actually be read; dense enough to override the
defaults the model would otherwise reach for.

```
Apply kid-style Three.js defaults:
- Replace BoxGeometry with RoundedBoxGeometry (radius 0.12–0.2, 4 bevel segs)
- Spheres: 32 widthSegments / 24 heightSegments minimum
- Cylinders/cones/capsules: 32 radialSegments minimum
- Material: MeshToonMaterial with 4-step gradient map, or MeshMatcapMaterial
- Lighting: HemisphereLight(warm sky #b0d6ff, cool ground #6b7a3a, 0.6) + warm
  DirectionalLight key (color #ffeedd, intensity 1.0, position 30/50/20) +
  cool ambient fill (color #404060, intensity 0.3)
- Shadows: PCFSoftShadowMap, shadow.bias -0.0005, shadow.normalBias 0.02
- Every character/important prop gets an inverted-hull outline: duplicate mesh,
  BackSide material, black color, scale along normals by 0.02–0.04
- Palette: warm desaturated — coral #ff7a6b, mint #9fd86c, butter #ffe58a,
  dusty sky #b0d6ff, warm ivory #fff4e6, soft charcoal #2a2a2f
- Character proportions: head 1.3–1.6× body width, stubby limbs, huge round
  eyes, tiny mouth, optional cheek blush (flat pink sphere)
- Idle animation: volume-preserving squash-stretch bob (scaleY 1.0→0.92→1.0
  over 1.5s, scaleX/Z compensate to preserve volume), blink every 4s for 100ms,
  head slerps toward cursor damped (0.1 lerp)
- Output color space: renderer.outputColorSpace = THREE.SRGBColorSpace,
  renderer.toneMapping = THREE.ACESFilmicToneMapping, exposure 1.0
- When loading GLTF: walk scene, replace all MeshStandardMaterial with
  MeshToonMaterial using the original color, enable cast/receive shadow
```

## Directory map

| File | What's in it |
|---|---|
| [01-geometry-materials.md](01-geometry-materials.md) | Rounded boxes, segment counts, toon/matcap/soft-PBR decision tree, palette |
| [02-lighting-shadows.md](02-lighting-shadows.md) | Hemi + key + fill, PCFSoft shadows, tonemapping, color space, contact shadows |
| [03-outlines.md](03-outlines.md) | Inverted-hull (full code), `OutlineEffect` addon, post-process edge detection |
| [04-animation.md](04-animation.md) | Squash-stretch, blink, head-follow-cursor, secondary motion, easing curves |
| [05-assets.md](05-assets.md) | Quaternius / Kenney / KayKit / Poly Pizza CC0 packs, GLTF re-materialization |

Each file is standalone — you can paste any one of them into a prompt as a
focused reference without needing the others.

## Problocks-specific notes

- **Three.js version**: the game engine runtime (`src/lib/game-engine/renderer3d.js`)
  uses `THREE` as a global from a CDN bundle. The studio-side code
  (`AvatarScene.tsx`, `Crate3D.tsx`, `RobloxAvatar.tsx`, voxel engine, preview
  thumbnails) uses `import * as THREE from 'three'` via npm. Both flows apply.
- **Target hardware**: Celeron N4000 Chromebooks (4 GB RAM). Follow the
  quality-tier pattern in `renderer3d.js` — offer `shadowMapSize`, `antialias`,
  `maxPixelRatio`, `shadowType` knobs, and degrade gracefully. Inverted-hull
  outlines are effectively free; post-process outlines are not — prefer the
  former on low-end hardware.
- **Reuse existing thumbnail/preview patterns**: `AssetThumbnail.tsx` already
  uses a shared-renderer pool. If you add a new thumbnailable asset type, plug
  into that pool instead of spinning up a new renderer per thumbnail.
- **Don't reinvent Three.js loading**: avoid pulling `three.min.js` from cdnjs
  — `OrbitControls` and other addons aren't bundled and the addon paths on
  cdnjs are inconsistent. Prefer `https://cdn.jsdelivr.net/npm/three@0.160/…`
  with an `<script type="importmap">` block when a CDN is needed. See
  [02-lighting-shadows.md](02-lighting-shadows.md) for the full snippet.
