// createVoxelEngine — the single factory the studio calls to drop a
// Minecraft-style voxel world onto a canvas. Keeps to the public API
// shape from docs/voxel-engine-external-repo-plan.md so this folder
// can be lifted into a separate repo later without churn:
//
//   const engine = createVoxelEngine({ canvas, THREE, assets, world, callbacks })
//   engine.start() / engine.pause() / engine.dispose() / engine.serialize()
//
// Everything not specific to React / Next.js lives here and in the
// sibling modules, so there is nothing app-coupled to strip out when
// (if) we ship it as its own package.

import { createAtlasTexture } from './atlas.js';
import { World, CHUNK, WORLD_H } from './world.js';
import { generateTerrain, spawnPoint } from './terrain.js';
import { meshChunk, chunkKey, parseChunkKey, allChunks } from './mesher.js';
import { raycastVoxel } from './raycast.js';
import { createFlyControls } from './controls.js';
import { HOTBAR, BLOCK, BLOCK_DEFS, isSolid } from './blocks.js';

/**
 * @param {Object} cfg
 * @param {HTMLCanvasElement} cfg.canvas
 * @param {*}                 cfg.THREE    — injected so host owns the version
 * @param {Object}            [cfg.world]  — serialized world to restore
 * @param {(s:Object)=>void}  [cfg.onBlockChange] — fired on place/break
 */
export function createVoxelEngine({ canvas, THREE, world: savedWorld, onBlockChange }) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,            // cheap on integrated GPUs
    powerPreference: 'high-performance',
    stencil: false,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x87ceeb); // sky blue
  if ('outputColorSpace' in renderer && THREE.SRGBColorSpace) {
    renderer.outputColorSpace = THREE.SRGBColorSpace;
  }

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x87ceeb, 40, 120);

  // Ambient + a single sun. Lambert shading keeps the cost low relative
  // to StandardMaterial and still gives voxel faces real definition.
  scene.add(new THREE.AmbientLight(0xffffff, 0.65));
  const sun = new THREE.DirectionalLight(0xffffff, 0.9);
  sun.position.set(0.6, 1.0, 0.4);
  scene.add(sun);

  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 400);
  const spawn = spawnPoint();
  camera.position.set(spawn.x, spawn.y, spawn.z);

  // Build world + seed with terrain (or restore from save).
  const world = new World();
  const restored = savedWorld ? world.loadSerialized(savedWorld) : false;
  if (!restored) generateTerrain(world);

  // One shared material, one shared atlas texture.
  const atlas = createAtlasTexture(THREE);
  const material = new THREE.MeshLambertMaterial({
    map: atlas,
    side: THREE.FrontSide,
  });

  // Chunk meshes live in a Map keyed by "cx,cy,cz". A parallel dirty
  // set tracks which chunks need remeshing — processed up to N per
  // frame so we never stall the main thread.
  const meshes = new Map();
  const dirty = new Set();

  function ensureMesh(cx, cy, cz) {
    const geom = meshChunk(world, cx, cy, cz, THREE);
    const key = chunkKey(cx, cy, cz);
    let mesh = meshes.get(key);
    if (mesh) {
      mesh.geometry.dispose();
      mesh.geometry = geom;
    } else {
      mesh = new THREE.Mesh(geom, material);
      mesh.position.set(cx * CHUNK, cy * CHUNK, cz * CHUNK);
      mesh.frustumCulled = true;
      scene.add(mesh);
      meshes.set(key, mesh);
    }
  }

  // Mesh everything up front. World is small enough that this fits in
  // a single frame on a Celeron N4000 with face-culled meshing.
  for (const [cx, cy, cz] of allChunks()) ensureMesh(cx, cy, cz);

  // Pointer-lock camera + jump/gravity (world passed in so controls do
  // ground collision instead of free-fly).
  const controls = createFlyControls({ canvas, camera, world, isSolid });

  // Hotbar — index into HOTBAR; persists across pointer-lock toggles.
  let hotbarIndex = 0;
  function hotbarBlock() { return HOTBAR[hotbarIndex]; }

  function onHotbarKey(e) {
    const n = Number(e.key);
    if (Number.isFinite(n) && n >= 1 && n <= HOTBAR.length) {
      hotbarIndex = n - 1;
      notifyUI();
    }
  }
  function onWheel(e) {
    if (!controls.isLocked) return;
    hotbarIndex = (hotbarIndex + (e.deltaY > 0 ? 1 : -1) + HOTBAR.length) % HOTBAR.length;
    notifyUI();
  }

  // UI hook — the React wrapper reads this to render a minimal HUD
  // without having to poke into engine internals.
  let uiListener = null;
  function notifyUI() {
    if (!uiListener) return;
    const id = hotbarBlock();
    uiListener({
      hotbarIndex,
      blockId: id,
      blockName: BLOCK_DEFS[id]?.name ?? 'Unknown',
    });
  }

  function onMouseDown(e) {
    if (!controls.isLocked) return;
    const look = controls.getLook();
    const hit = raycastVoxel(world, camera.position, look, 6);
    if (!hit) return;
    if (e.button === 0) {
      // Break.
      const dirtyKeys = world.setBlock(hit.hit.x, hit.hit.y, hit.hit.z, BLOCK.AIR);
      dirtyKeys.forEach((k) => dirty.add(k));
      fireChange();
    } else if (e.button === 2) {
      // Place.
      const p = hit.place;
      if (p.y < 0 || p.y >= WORLD_H) return;
      // Don't place inside the player's own head/feet — treat a 1-block
      // radius around the camera as off-limits so users can't seal
      // themselves in by accident.
      const dx = p.x + 0.5 - camera.position.x;
      const dy = p.y + 0.5 - camera.position.y;
      const dz = p.z + 0.5 - camera.position.z;
      if (dx * dx + dy * dy + dz * dz < 0.9) return;
      const dirtyKeys = world.setBlock(p.x, p.y, p.z, hotbarBlock());
      dirtyKeys.forEach((k) => dirty.add(k));
      fireChange();
    }
  }
  function onContextMenu(e) { e.preventDefault(); }

  function fireChange() {
    if (onBlockChange) {
      try { onBlockChange({ serialized: world.serialize() }); }
      catch (err) { console.warn('[voxel] onBlockChange threw', err); }
    }
  }

  window.addEventListener('keydown', onHotbarKey);
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('contextmenu', onContextMenu);
  canvas.addEventListener('wheel', onWheel, { passive: true });

  // Resize handling via ResizeObserver — survives StudioLayout panel
  // drags without needing a window resize event.
  let ro = null;
  function resize() {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  if (typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(resize);
    ro.observe(canvas);
  } else {
    window.addEventListener('resize', resize);
  }

  // Main loop. Re-meshes up to MESH_BUDGET dirty chunks per frame so
  // burst edits don't land as one mega-stall.
  const MESH_BUDGET = 2;
  let running = false;
  let rafHandle = 0;
  let lastT = 0;

  function frame(t) {
    if (!running) return;
    rafHandle = requestAnimationFrame(frame);
    const now = t * 0.001;
    const dt = Math.min(0.05, lastT ? now - lastT : 0.016);
    lastT = now;

    // Drain the dirty queue up to budget.
    if (dirty.size > 0) {
      let processed = 0;
      for (const key of dirty) {
        if (processed >= MESH_BUDGET) break;
        const [cx, cy, cz] = parseChunkKey(key);
        ensureMesh(cx, cy, cz);
        dirty.delete(key);
        processed++;
      }
    }

    controls.update(dt);
    renderer.render(scene, camera);
  }

  function start() {
    if (running) return;
    running = true;
    lastT = 0;
    rafHandle = requestAnimationFrame(frame);
    notifyUI();
  }
  function pause() {
    running = false;
    if (rafHandle) cancelAnimationFrame(rafHandle);
  }
  function dispose() {
    pause();
    controls.dispose();
    window.removeEventListener('keydown', onHotbarKey);
    canvas.removeEventListener('mousedown', onMouseDown);
    canvas.removeEventListener('contextmenu', onContextMenu);
    canvas.removeEventListener('wheel', onWheel);
    if (ro) ro.disconnect();
    else window.removeEventListener('resize', resize);
    for (const m of meshes.values()) {
      m.geometry.dispose();
      scene.remove(m);
    }
    meshes.clear();
    material.dispose();
    atlas.dispose();
    renderer.dispose();
  }

  return {
    start, pause, dispose,
    serialize: () => world.serialize(),
    setUIListener: (fn) => { uiListener = fn; notifyUI(); },
  };
}
