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
import { PALETTE, groundMaterial } from './materials';
import { animateRoot } from './animations';

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
  scene.background = new THREE.Color(PALETTE.sky);
  // Nearer fog start so the plot feels enclosed, further end so you can
  // still see distant trees / clouds. Far colour shifted toward fogFar
  // (a hair whiter than the sky) so the horizon reads as atmosphere, not
  // a hard clip.
  scene.fog = new THREE.Fog(PALETTE.fogFar, 30, 85);

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
  function tick() {
    if (!running) return;
    controls.update();
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
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerleave', onPointerLeave);
    observer?.disconnect();
    controls.dispose();
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.geometry?.dispose?.();
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
  };
}
