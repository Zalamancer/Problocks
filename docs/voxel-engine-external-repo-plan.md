# Building a Voxel (Minecraft-like) Engine in a Separate Repo

How to build a new 3D block/voxel game engine in an isolated repo and later drop it into Problocks cleanly.

The goal is to build it in isolation but constrain yourself up front so the "paste back in" step is trivial.

## 1. Know the integration contract before you start

Look at how existing viewport modes plug in today:

- `src/lib/game-engine/index.ts` — public entry
- `src/lib/game-engine/scene.js`, `entities.js`, `physics.js`, `particles.js` — the modules the studio imports
- How `NodeCanvas` / the 3D preview mounts the engine onto a `<canvas>`

Whatever that shape is (e.g. `createEngine({ canvas, assets, onReady }) → { update, render, dispose, loadScene, … }`) — **that is the API the new repo must output.** Everything else is implementation detail.

## 2. New repo structure (framework-free)

```
problocks-voxel/
├── README.md               ← public API + how to run the demo
├── package.json            ← only "three" as a peer dep, no React, no Next
├── index.html              ← standalone demo page loads from CDN
├── demo/main.js            ← how the studio will call it (reference integration)
├── src/
│   ├── index.js            ← the ONE entry point the studio will import
│   ├── engine/             ← chunk manager, mesher, world, tick loop
│   ├── render/             ← Three.js meshing, frustum culling, LOD
│   ├── world/              ← chunk storage, serialization, gen
│   ├── input/              ← camera controls, block place/break
│   └── assets/             ← block registry, texture atlas builder
└── tests/                  ← pure unit tests on mesher / chunk math
```

Hard rules for the repo:

- **No React, no Next.js, no Zustand, no Tailwind, no `@/` paths.** Everything imports by relative path.
- **Three.js is a peer dependency**, loaded via CDN in the demo and expected to be provided by the host app in production.
- **The canvas is always passed in.** Engine never creates one or touches `document.body`.
- **No DOM/window access** outside `src/input/` (and even there, gate it behind an adapter).
- **No globals.** Export one factory from `src/index.js`.
- **Assets come in as plain objects / URLs.** No `fetch` hardcoded to a specific path.

## 3. Define the API upfront and freeze it

In `README.md`, commit to the exact shape the studio will call, e.g.:

```js
import { createVoxelEngine } from 'problocks-voxel'

const engine = createVoxelEngine({
  canvas,              // HTMLCanvasElement, passed in
  THREE,               // injected so host controls the version
  assets: { blocks },  // block registry the studio already owns
  world: savedWorld,   // serialized chunks or null
  onReady,
  onBlockChange,       // for saving back to the project
})

engine.start()
engine.pause()
engine.dispose()
engine.serialize() // → savedWorld
```

If this signature stays stable, integration is literally: copy `src/` into `src/lib/game-engine/voxel/`, add one import in the viewport switch, done.

## 4. Performance gates are part of the contract

Target is Celeron N4000 / 4GB Chromebooks. Write these into the README as acceptance criteria so the AI building it optimizes from day one, not after:

- 60 FPS with N chunks loaded on integrated graphics
- Greedy meshing (merges flat runs of same block)
- Chunk meshes rebuilt off the main thread or batched per frame
- Face culling of hidden faces between neighbor blocks (the same "remove cylinder top/bottom when stacked" trick already used in Problocks)
- Texture atlas, not per-block materials
- InstancedMesh / BufferGeometry only, no per-block `Mesh`

## 5. Prompt for the AI building the new repo

Give it something like this:

> Build a standalone Three.js voxel engine in a new repo. It will later be dropped into an existing Next.js app as one folder under `src/lib/game-engine/voxel/`, so:
>
> - Framework-free. No React, no Next, no bundler-specific imports, no `@/` paths.
> - Three.js is a peer dep, injected by the host. Demo page loads it from CDN.
> - One entry: `createVoxelEngine({ canvas, THREE, assets, world, callbacks })` returning `{ start, pause, dispose, serialize }`.
> - Engine never touches `document` outside an input adapter. Canvas is passed in.
> - Must hit 60 FPS on Celeron N4000 / Intel UHD 600 / 4GB RAM. Use greedy meshing, face culling between adjacent blocks, texture atlas, InstancedMesh/BufferGeometry only.
> - Chunk-based world, serializable to plain JSON.
> - `index.html` + `demo/main.js` is the reference for exactly how the host app will call it.
> - Max 300–500 lines per file. One responsibility per file.

## 6. The move-back step

When it's done, copy `problocks-voxel/src/` into `Problocks/src/lib/game-engine/voxel/`, add the peer `THREE` injection at the call site, and wire one new viewport option. Because the new repo never imported anything app-specific, there's nothing to untangle — the `demo/main.js` becomes your template for the Problocks viewport component.

Two things that will bite you if skipped:

1. **Pin the Three.js version** to whatever Problocks uses today. Different versions = geometry API drift.
2. **Match the existing asset/block type shape** (see `src/lib/medieval-assets.ts` and other registries) so the studio's asset panel works without a translation layer.
