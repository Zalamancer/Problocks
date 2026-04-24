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
import { kidBox, kidSphere } from './geometry';
import { addOutline } from './outlines';

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
  start: () => void;
  stop: () => void;
  dispose: () => void;
  resize: () => void;
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
  renderer.toneMappingExposure = 1.0;

  // --- scene ---
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(PALETTE.sky);
  scene.fog = new THREE.Fog(PALETTE.sky, 40, 120);

  // --- camera ---
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 500);
  camera.position.set(9, 7, 12);
  camera.lookAt(0, 1, 0);

  // --- three-light rig ---
  const hemi = new THREE.HemisphereLight(0xb0d6ff, 0x6b7a3a, 0.6);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xffeedd, 1.0);
  key.position.set(30, 50, 20);
  if (quality.shadows) {
    key.castShadow = true;
    key.shadow.mapSize.set(quality.shadowMapSize, quality.shadowMapSize);
    key.shadow.bias = -0.0005;
    key.shadow.normalBias = 0.02;
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 120;
    key.shadow.camera.left = -40;
    key.shadow.camera.right = 40;
    key.shadow.camera.top = 40;
    key.shadow.camera.bottom = -40;
  }
  scene.add(key);

  const fill = new THREE.AmbientLight(0x404060, 0.3);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xcfe6ff, 0.35);
  rim.position.set(-25, 35, -18);
  scene.add(rim);

  // --- ground ---
  const groundGeo = new THREE.PlaneGeometry(80, 80, 1, 1);
  const ground = new THREE.Mesh(groundGeo, groundMaterial(PALETTE.grass));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = quality.shadows;
  ground.name = 'ground';
  scene.add(ground);

  // --- root container for user objects ---
  const root = new THREE.Group();
  root.name = 'root';
  scene.add(root);

  // --- orbit controls ---
  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 1, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.screenSpacePanning = false;
  controls.minDistance = 3;
  controls.maxDistance = 60;
  // Keep the camera from tipping under the ground — 89° is plenty.
  controls.maxPolarAngle = Math.PI / 2 - 0.02;

  // --- starter content ---
  // So you see something on first load. Cleared the moment a user
  // drops their first prefab.
  seedStarterScene(root);

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

  // --- render loop ---
  let rafId = 0;
  let running = false;
  function tick() {
    if (!running) return;
    controls.update();
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
    start,
    stop,
    dispose,
    resize,
  };
}

function seedStarterScene(root: THREE.Group): void {
  // A single rounded cube + sphere + capsule at the origin so the scene
  // reads as "kid-style" the instant the viewport mounts. Users can
  // delete them once prefab placement is wired.
  const cube = new THREE.Mesh(kidBox({ width: 1.5, height: 1.5, depth: 1.5, radius: 0.22 }), toonMaterial({ color: PALETTE.coral }));
  cube.position.set(-2, 0.75, 0);
  cube.castShadow = true;
  cube.receiveShadow = true;
  addOutline(cube);
  cube.userData.kind = 'rounded-box';
  cube.name = 'starter-cube';
  root.add(cube);

  const sphere = new THREE.Mesh(kidSphere({ radius: 0.8, detail: 1 }), toonMaterial({ color: PALETTE.butter }));
  sphere.position.set(0, 0.8, 0);
  sphere.castShadow = true;
  sphere.receiveShadow = true;
  addOutline(sphere);
  sphere.userData.kind = 'sphere';
  sphere.name = 'starter-sphere';
  root.add(sphere);

  const pillar = new THREE.Mesh(kidBox({ width: 0.9, height: 2.2, depth: 0.9, radius: 0.18 }), toonMaterial({ color: PALETTE.mint }));
  pillar.position.set(2.2, 1.1, 0);
  pillar.castShadow = true;
  pillar.receiveShadow = true;
  addOutline(pillar);
  pillar.userData.kind = 'rounded-box';
  pillar.name = 'starter-pillar';
  root.add(pillar);
}
