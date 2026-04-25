/**
 * Kid-style 3D engine — a framework-free Three.js factory that boots a
 * Roblox/Pokopia-looking scene given a <canvas>. Same architectural
 * shape as the voxel engine: returns an object with start/dispose so
 * the React shell is a thin lifecycle wrapper.
 *
 * Everything the engine does is a direct application of the rules in
 * docs/three-kid-style/02-lighting-shadows.md and 03-outlines.md.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PALETTE, groundMaterial, toonMaterial } from './materials';
import { animateRoot } from './animations';
import { isCachedGeometry, kidSphere, kidInstanced, type InstanceTransform } from './geometry';
import { onThemeChange, setActiveTheme, type ThemeId } from './themes';

export interface KidEngineOptions {
  canvas: HTMLCanvasElement;
  /**
   * Quality tier — matches the renderer3d.js `config.quality` pattern
   * so we can ship the same scene at different fidelity on N4000
   * Chromebooks vs a desktop.
   */
  quality?: Partial<QualityTier>;
}

export interface QualityTier {
  shadows: boolean;
  shadowMapSize: 512 | 1024 | 2048;
  antialias: boolean;
  maxPixelRatio: number;
  /** PCFSoftShadowMap is the only acceptable kid-style type. Basic is a fallback. */
  shadowType: 'pcf-soft' | 'basic';
}

const DEFAULT_QUALITY: QualityTier = {
  shadows: true,
  shadowMapSize: 1024,
  antialias: true,
  maxPixelRatio: 2,
  shadowType: 'pcf-soft',
};

export interface KidEngine {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  /** Container for user-placed objects. Keep engine props (lights, ground) on `scene` directly. */
  root: THREE.Group;
  ground: THREE.Mesh;
  start: () => void;
  stop: () => void;
  dispose: () => void;
  resize: () => void;
  /** Raycast from an NDC point against the root's children. Returns first hit. */
  raycastRoot: (ndc: THREE.Vector2) => THREE.Intersection | null;
  /** Intersect a ray from NDC with the ground plane. Returns world point or null. */
  raycastGround: (ndc: THREE.Vector2) => THREE.Vector3 | null;
  /** Override the per-frame callback; receives dt. Null restores default (controls.update). */
  setPerFrame: (cb: ((dt: number) => void) | null) => void;
  /** Swap the scene palette. Rebuilds the sky gradient + ambient clouds
      so the new theme shows immediately. Prefab re-coloring is the
      store's responsibility (bump geomRev for a rehydrate pass). */
  setTheme: (id: ThemeId) => void;
}

export function createKidEngine(opts: KidEngineOptions): KidEngine {
  const quality: QualityTier = { ...DEFAULT_QUALITY, ...opts.quality };
  const canvas = opts.canvas;

  // --- renderer ---
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: quality.antialias,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, quality.maxPixelRatio));
  renderer.shadowMap.enabled = quality.shadows;
  // r163 deprecated PCFSoftShadowMap — PCFShadowMap is still soft (the newer
  // shadow pipeline defaults to PCF filtering for all but Basic). Basic is
  // kept as an explicit opt-in for the Chromebook fallback tier.
  renderer.shadowMap.type =
    quality.shadowType === 'pcf-soft' ? THREE.PCFShadowMap : THREE.BasicShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  // Exposure 1.15 — the Adopt-Me "daytime cereal-ad" look. Drops to 1.0
  // for moodier scenes, up to 1.3 for actual sunlight photography vibe.
  renderer.toneMappingExposure = 1.15;

  // --- scene ---
  const scene = new THREE.Scene();
  // Vertical sky gradient (Pokopia look): deeper blue at zenith, hazy
  // near the horizon so trees fade into sky instead of clipping against
  // a flat wall of colour. Generated as a 2×256 CanvasTexture; cheaper
  // than a skybox sphere and still lets `scene.fog` paint the horizon.
  scene.background = createSkyGradient();
  // Fog pushed further out so vivid palette reads at full saturation
  // near the character and only softens at the perimeter.
  scene.fog = new THREE.Fog(PALETTE.fogFar, 45, 110);

  // --- camera ---
  // 42° FOV + further-back position is the Adopt-Me/Roblox plot
  // framing: the whole plot fits comfortably on screen without feeling
  // like a dollhouse. lookAt(0, 2, 0) raises the pivot to roughly the
  // character's head height.
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 500);
  camera.position.set(14, 10, 16);
  camera.lookAt(0, 2, 0);

  // --- three-light rig (bright Adopt-Me) ---
  // Warm sky / olive ground hemisphere: pushes warm light into the tops
  // of objects and an olive-green bounce into their undersides, so even
  // unshadowed meshes have directional tone instead of looking flat.
  const hemi = new THREE.HemisphereLight(0xfffbe8, 0xb0d0a0, 0.7);
  scene.add(hemi);

  // Warm key light: the bright cereal-ad sun. Intensity 1.3 is loud but
  // PCF soft shadows + ACES rolloff prevent blown highlights.
  const key = new THREE.DirectionalLight(0xfff4d0, 1.3);
  key.position.set(10, 14, 6);
  if (quality.shadows) {
    key.castShadow = true;
    key.shadow.mapSize.set(quality.shadowMapSize, quality.shadowMapSize);
    key.shadow.bias = -0.0005;
    key.shadow.normalBias = 0.02;
    // Shadow radius softens PCF samples — 6 is where Adopt-Me soft-edge
    // shadows land before going blobby. Only affects the PCF tier.
    key.shadow.radius = 6;
    // Tight frustum around the 22u × 22u plot — waste no shadow-map
    // resolution on empty land outside the scene.
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 40;
    key.shadow.camera.left = -18;
    key.shadow.camera.right = 18;
    key.shadow.camera.top = 18;
    key.shadow.camera.bottom = -18;
  }
  scene.add(key);

  // Cool fill: a cool-blue directional in the opposite quadrant so shadow
  // sides aren't dead. Not a shadow caster; just lifts the blue channel.
  const fill = new THREE.DirectionalLight(0xb8d8ff, 0.4);
  fill.position.set(-6, 5, -4);
  scene.add(fill);

  // --- ground ---
  // Two layers: outer darker-green surround extending to fog ("land
  // beyond the plot"), and a brighter plot grass slab raised 0.05 to
  // read as a distinct parcel. Matches the Adopt-Me plot framing even
  // before a curb/fence is placed.
  const outerGround = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 80, 1, 1),
    groundMaterial(PALETTE.grassDark),
  );
  outerGround.rotation.x = -Math.PI / 2;
  outerGround.receiveShadow = quality.shadows;
  outerGround.name = 'outer-ground';
  scene.add(outerGround);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(22, 22, 1, 1),
    groundMaterial(PALETTE.grass),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0.02;
  ground.receiveShadow = quality.shadows;
  ground.name = 'ground';
  scene.add(ground);

  // --- ambient clouds ---
  // Chunky low-poly cumulus blobs ringing the plot at sky altitude.
  // Static, non-shadow-casting; purpose is purely to hint at depth in
  // the sky gradient and break up the flat blue.
  let clouds = makeAmbientClouds();
  scene.add(clouds);

  // --- theme subscription ---
  // When the store swaps the active theme, the PALETTE proxy already
  // returns new values — but the scene-level assets (sky gradient
  // texture, ambient cloud meshes, outer/plot ground materials) were
  // built once with the previous palette. Rebuild them here so a theme
  // swap reads as a whole-world mood change, not just "new prefabs".
  const unsubscribeTheme = onThemeChange(() => {
    // Dispose the old gradient texture so we don't leak CanvasTextures.
    (scene.background as THREE.Texture | null)?.dispose?.();
    scene.background = createSkyGradient();
    if (scene.fog) (scene.fog as THREE.Fog).color.set(PALETTE.fogFar);
    (outerGround.material as THREE.MeshLambertMaterial).color.set(PALETTE.grassDark);
    (ground.material as THREE.MeshLambertMaterial).color.set(PALETTE.grass);
    scene.remove(clouds);
    // InstancedMeshes share a geometry + material; disposing here is
    // safe because the clouds group owns its own sphere/material
    // instance (kidInstanced returns fresh InstancedMesh each call).
    clouds.traverse((obj) => {
      const m = obj as THREE.InstancedMesh;
      if (m.isInstancedMesh) {
        m.geometry?.dispose?.();
        const mat = m.material as THREE.Material | THREE.Material[];
        if (Array.isArray(mat)) mat.forEach((mm) => mm.dispose?.());
        else mat?.dispose?.();
      }
    });
    clouds = makeAmbientClouds();
    scene.add(clouds);
  });

  // --- root container for user objects ---
  const root = new THREE.Group();
  root.name = 'root';
  scene.add(root);

  // --- orbit controls ---
  // Target 2u up to frame a standing character; tight min/max clamps
  // match the 22u plot so users can't pull the camera beyond what's
  // meant to be visible. 85° max polar stops tipping under the ground.
  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 2, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.screenSpacePanning = false;
  controls.minDistance = 8;
  controls.maxDistance = 30;
  controls.maxPolarAngle = Math.PI * 0.47;
  // Disable OrbitControls' default wheel-to-zoom — we install our own
  // wheel handler below that maps a Mac-style two-finger trackpad
  // swipe to ORBIT (the default OrbitControls behavior is "wheel
  // always zooms" which is wrong for trackpad users). Mouse wheel +
  // pinch + shift-wheel are still respected.
  controls.enableZoom = false;

  // Custom wheel routing — runs through OrbitControls' public
  // rotateLeft / rotateUp so its damping + spherical bookkeeping stays
  // in charge. Direct camera.position manipulation (the prior version)
  // fought update()'s clamp-and-write path, which is why orbit only
  // "worked for a split second" before snapping back.
  //
  //   • ctrlKey or metaKey   — pinch / Cmd+wheel → zoom
  //   • shiftKey             — pan
  //   • deltaMode === 0      — trackpad two-finger swipe → orbit
  //   • deltaMode !== 0      — mouse wheel notch → zoom
  //
  // Mouse wheel users on Mac can hold Cmd to force zoom even on a
  // trackpad; keyboard-less users (touch) won't reach this path.
  const onWheel = (e: WheelEvent) => {
    if (controls.enabled === false) return;
    e.preventDefault();

    const isPinch = e.ctrlKey || e.metaKey;
    const isShiftPan = e.shiftKey;
    // Trackpad signal: deltaMode=0 (DOM_DELTA_PIXEL). Mouse wheel notches
    // are usually deltaMode=1 (LINE) or 2 (PAGE). Some browsers report
    // deltaMode=0 for mouse wheel too — guard against that with a
    // magnitude heuristic (mouse notches are typically |deltaY| >= 60
    // in px, trackpad swipes are smaller per-frame).
    const trackpadLike =
      e.deltaMode === 0 && (Math.abs(e.deltaY) < 50 || e.deltaX !== 0);

    if (isPinch || (!isShiftPan && !trackpadLike)) {
      // ZOOM — scale offset toward target. Pinch sensitivity is higher
      // because trackpad pinch deltaY is typically large per frame.
      const offset = new THREE.Vector3().subVectors(camera.position, controls.target);
      const factor = 1 + (e.deltaY * (isPinch ? 0.01 : 0.0015));
      offset.multiplyScalar(factor);
      const len = offset.length();
      if (len < controls.minDistance) offset.setLength(controls.minDistance);
      if (len > controls.maxDistance) offset.setLength(controls.maxDistance);
      camera.position.copy(controls.target).add(offset);
      camera.lookAt(controls.target);
    } else if (isShiftPan) {
      // PAN — shift+swipe pans on camera-screen axes, scaled by
      // current distance so the felt-speed stays constant.
      const offset = new THREE.Vector3().subVectors(camera.position, controls.target);
      const dist = offset.length();
      const panRight = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 0);
      const panUp = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 1);
      const k = dist * 0.0015;
      const delta = new THREE.Vector3()
        .copy(panRight).multiplyScalar(-e.deltaX * k)
        .addScaledVector(panUp, e.deltaY * k);
      controls.target.add(delta);
      camera.position.add(delta);
      camera.lookAt(controls.target);
    } else if (controls.enableRotate !== false) {
      // ORBIT — feed deltas through OrbitControls' own rotation API.
      // _sphericalDelta accumulates in the controls; controls.update()
      // (called every frame in the engine loop) integrates with damping
      // and clamps to min/maxPolarAngle automatically.
      const speed = 0.005;
      controls.rotateLeft(e.deltaX * speed);
      controls.rotateUp(e.deltaY * speed);
    } else {
      // Rotate locked (top-down / iso preset) — fall through to zoom.
      const offset = new THREE.Vector3().subVectors(camera.position, controls.target);
      const factor = 1 + (e.deltaY * 0.0015);
      offset.multiplyScalar(factor);
      const len = offset.length();
      if (len < controls.minDistance) offset.setLength(controls.minDistance);
      if (len > controls.maxDistance) offset.setLength(controls.maxDistance);
      camera.position.copy(controls.target).add(offset);
      camera.lookAt(controls.target);
    }
  };
  canvas.addEventListener('wheel', onWheel, { passive: false });

  // --- raycasting helpers (picking + ground drop) ---
  const raycaster = new THREE.Raycaster();
  function raycastRoot(ndc: THREE.Vector2): THREE.Intersection | null {
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObjects(root.children, true);
    // Skip outlines — they're BackSide and would give weird hit points.
    for (const h of hits) {
      if (!h.object.name.endsWith('__outline')) return h;
    }
    return null;
  }
  function raycastGround(ndc: THREE.Vector2): THREE.Vector3 | null {
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObject(ground, false);
    return hits[0]?.point ?? null;
  }

  // --- resize ---
  function resize() {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();

  const observer =
    typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => resize())
      : null;
  observer?.observe(canvas);

  // --- pointer tracking for head-follow animations ---
  const pointer = new THREE.Vector2();
  let pointerActive = false;
  function onPointerMove(e: PointerEvent) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    pointerActive = true;
  }
  function onPointerLeave() { pointerActive = false; }
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerleave', onPointerLeave);

  // --- render loop ---
  const clock = new THREE.Clock();
  let rafId = 0;
  let running = false;
  let perFrameCb: ((dt: number) => void) | null = null;
  function tick() {
    if (!running) return;
    const dt = clock.getDelta();
    if (perFrameCb) perFrameCb(dt);
    else controls.update();
    animateRoot(root, {
      time: clock.getElapsedTime(),
      pointer: pointerActive ? pointer : null,
      camera,
    });
    renderer.render(scene, camera);
    rafId = requestAnimationFrame(tick);
  }
  function start() {
    if (running) return;
    running = true;
    rafId = requestAnimationFrame(tick);
  }
  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
  }

  function dispose() {
    stop();
    unsubscribeTheme();
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerleave', onPointerLeave);
    canvas.removeEventListener('wheel', onWheel);
    observer?.disconnect();
    controls.dispose();
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        // Cached geometries are shared across many instances and live
        // longer than this engine (module-level singleton). Disposing
        // them here would break the next mount of the viewport.
        if (!isCachedGeometry(mesh.geometry)) mesh.geometry?.dispose?.();
        const mat = mesh.material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose?.());
        else mat?.dispose?.();
      }
    });
    renderer.dispose();
  }

  return {
    scene,
    camera,
    renderer,
    controls,
    root,
    ground,
    start,
    stop,
    dispose,
    resize,
    raycastRoot,
    raycastGround,
    setPerFrame: (cb) => { perFrameCb = cb; },
    setTheme: (id) => setActiveTheme(id),
  };
}

// ---- sky gradient --------------------------------------------------
// 2×256 vertical gradient from PALETTE.skyTop (zenith) down to
// PALETTE.skyHorizon. Used as `scene.background`; Three renders it as
// a flat 2D quad behind everything so horizon always reads sky-coloured
// even when the camera looks level. Cheaper than a skybox sphere.
function createSkyGradient(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, PALETTE.skyTop);
  grad.addColorStop(0.65, PALETTE.sky);
  grad.addColorStop(1, PALETTE.skyHorizon);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 2, 256);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

// ---- ambient clouds ------------------------------------------------
// Chunky cumulus clusters ringing the plot at sky altitude. Each cloud
// is a handful of sphere blobs at slightly offset positions, batched as
// one InstancedMesh per cloud so the whole ring is ~8 draw calls. Not
// shadow-casters — shadows on the ground would look weird at this
// altitude and distance.
function makeAmbientClouds(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'ambient-clouds';

  // 8 clouds spaced around the plot at radius 50, altitudes 14-22.
  // Fixed positions (deterministic) so the scene reads the same on
  // every reload. Sizes vary 1.0 - 2.4 for silhouette variety.
  const spots: Array<{ x: number; y: number; z: number; s: number }> = [
    { x:  45, y: 16, z: -22, s: 2.2 },
    { x:  28, y: 20, z:  42, s: 1.6 },
    { x: -12, y: 18, z:  48, s: 2.0 },
    { x: -44, y: 22, z:  10, s: 2.4 },
    { x: -38, y: 15, z: -30, s: 1.4 },
    { x:  -8, y: 19, z: -46, s: 1.8 },
    { x:  22, y: 14, z: -40, s: 1.2 },
    { x:  50, y: 21, z:  18, s: 2.0 },
  ];

  // One cumulus = five overlapping sphere blobs (hero + 4 satellites).
  const blobs: InstanceTransform[] = [
    { position: [ 0.0,  0.0,  0.0 ], scale: 1.0 },
    { position: [ 1.1, -0.15, 0.1 ], scale: 0.75 },
    { position: [-1.1,  0.0, -0.1 ], scale: 0.8  },
    { position: [ 0.5,  0.35, 0.2 ], scale: 0.65 },
    { position: [-0.4,  0.3, -0.2 ], scale: 0.55 },
  ];

  const sphereGeo = kidSphere({ radius: 1, detail: 0 });
  const mat = toonMaterial({ color: PALETTE.cloud });

  for (const spot of spots) {
    const cloud = kidInstanced(sphereGeo, mat, blobs);
    cloud.position.set(spot.x, spot.y, spot.z);
    cloud.scale.setScalar(spot.s);
    cloud.castShadow = false;
    cloud.receiveShadow = false;
    g.add(cloud);
  }

  return g;
}
