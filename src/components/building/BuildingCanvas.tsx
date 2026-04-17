'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {
  useBuildingStore,
  type EdgeDir,
  type Facing,
} from '@/store/building-store';
import { useSceneStore, type PartType } from '@/store/scene-store';
import { useQualityStore } from '@/store/quality-store';
import { useLightingStore, rgbToHex, addRgb } from '@/store/lighting-store';
import { UnifiedGizmo3D } from './UnifiedGizmo3D';
import { createPlayController, type PlayController } from './play-mode';
import { buildPiece, getPiece, TILE, WALL_HEIGHT, WALL_THICK } from '@/lib/building-kit';

const PART_DEFAULT_SIZE = 2;

interface SceneRefs {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  ground: THREE.Mesh;
  levelPlane: THREE.Mesh;
  ghost: THREE.Group;
  floorGroup: THREE.Group;
  wallGroup: THREE.Group;
  roofGroup: THREE.Group;
  cornerGroup: THREE.Group;
  stairsGroup: THREE.Group;
  partGroup: THREE.Group;
  gizmo: UnifiedGizmo3D;
  raycaster: THREE.Raycaster;
  pointer: THREE.Vector2;
  animId: number;
  hemisphere: THREE.HemisphereLight;
  ambient: THREE.AmbientLight;
  sun: THREE.DirectionalLight;
}

function makeSurfaceMaterial(params: {
  color: string | number | THREE.Color;
  roughness: number;
  metalness: number;
  emissive: string | number | THREE.Color;
  emissiveIntensity: number;
  pbr: boolean;
}): THREE.Material {
  const { color, emissive, emissiveIntensity, pbr, roughness, metalness } = params;
  if (pbr) {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(color as THREE.ColorRepresentation),
      roughness, metalness,
      emissive: new THREE.Color(emissive as THREE.ColorRepresentation),
      emissiveIntensity,
    });
  }
  return new THREE.MeshLambertMaterial({
    color: new THREE.Color(color as THREE.ColorRepresentation),
    emissive: new THREE.Color(emissive as THREE.ColorRepresentation),
    emissiveIntensity,
  });
}

function geometryForPart(type: PartType, lowPoly: boolean): THREE.BufferGeometry {
  const sphereW = lowPoly ? 12 : 24;
  const sphereH = lowPoly ? 8 : 16;
  const cylinderR = lowPoly ? 12 : 24;
  switch (type) {
    case 'Sphere':   return new THREE.SphereGeometry(0.5, sphereW, sphereH);
    case 'Cylinder': return new THREE.CylinderGeometry(0.5, 0.5, 1, cylinderR);
    case 'Wedge':    return new THREE.ConeGeometry(0.7, 1, 4);
    case 'Block':
    default:         return new THREE.BoxGeometry(1, 1, 1);
  }
}

/** Map a world point to the nearest grid edge in canonical form. */
function edgeFromWorld(wx: number, wz: number): { x: number; z: number; dir: EdgeDir } {
  const tx = Math.round(wx / TILE);
  const tz = Math.round(wz / TILE);
  const dx = wx - tx * TILE;
  const dz = wz - tz * TILE;
  if (Math.abs(dz) > Math.abs(dx)) {
    if (dz < 0) return { x: tx, z: tz, dir: 'N' };
    return { x: tx, z: tz + 1, dir: 'N' };
  }
  if (dx > 0) return { x: tx, z: tz, dir: 'E' };
  return { x: tx - 1, z: tz, dir: 'E' };
}

/** Nearest tile vertex (corner) — half-tile snap. */
function cornerFromWorld(wx: number, wz: number): { x: number; z: number } {
  return {
    x: Math.round(wx / TILE + 0.5) - 1,
    z: Math.round(wz / TILE + 0.5) - 1,
  };
}

function tileFromWorld(wx: number, wz: number): { x: number; z: number } {
  return { x: Math.round(wx / TILE), z: Math.round(wz / TILE) };
}

function wallWorldPlacement(x: number, y: number, z: number, dir: EdgeDir) {
  const baseY = y * WALL_HEIGHT;
  if (dir === 'N') {
    return { x: x * TILE, y: baseY, z: z * TILE - TILE / 2, rotY: 0 };
  }
  return { x: x * TILE + TILE / 2, y: baseY, z: z * TILE, rotY: Math.PI / 2 };
}

function facingRotY(f: Facing): number {
  switch (f) {
    case 'N': return 0;
    case 'E': return -Math.PI / 2;
    case 'S': return Math.PI;
    case 'W': return Math.PI / 2;
  }
}

/** Replace every material in a Group with a translucent tinted ghost material. */
function ghostifyGroup(g: THREE.Group, tint = 0x4ade80, opacity = 0.45): void {
  g.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh) {
      const mat = new THREE.MeshBasicMaterial({
        color: tint, transparent: true, opacity, depthWrite: false,
      });
      m.material = mat;
      m.castShadow = false;
      m.receiveShadow = false;
    }
  });
}

/** Dispose every geometry+material in a subtree, then remove all children. */
function disposeAndClear(group: THREE.Group) {
  while (group.children.length) {
    const c = group.children[0];
    c.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      if (m.material) {
        if (Array.isArray(m.material)) m.material.forEach((mm) => mm.dispose());
        else (m.material as THREE.Material).dispose();
      }
    });
    group.remove(c);
  }
}

export function BuildingCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<SceneRefs | null>(null);
  const playRef = useRef<PlayController | null>(null);

  const tool = useBuildingStore((s) => s.tool);
  const level = useBuildingStore((s) => s.level);
  const selectedPiece = useBuildingStore((s) => s.selectedPiece);
  const floors = useBuildingStore((s) => s.floors);
  const walls = useBuildingStore((s) => s.walls);
  const roofs = useBuildingStore((s) => s.roofs);
  const cornersRec = useBuildingStore((s) => s.corners);
  const stairsRec = useBuildingStore((s) => s.stairs);
  const cornerBend = useBuildingStore((s) => s.cornerBend);
  const buildingSelection = useBuildingStore((s) => s.selection);
  const parts = useSceneStore((s) => s.sceneObjects);
  const selectedPartId = useSceneStore((s) => s.selectedPart?.id ?? null);
  const quality = useQualityStore((s) => s.settings);
  const isPlaying = useSceneStore((s) => s.isPlaying);

  useEffect(() => {
    const ctrl = playRef.current;
    if (!ctrl) return;
    if (isPlaying) ctrl.start();
    else ctrl.stop();
  }, [isPlaying]);

  // --- init scene ---
  useEffect(() => {
    const container = containerRef.current;
    if (!container || sceneRef.current) return;

    const scene = new THREE.Scene();
    const initialLighting = useLightingStore.getState().config;
    scene.background = new THREE.Color(rgbToHex(initialLighting.skyColor));

    const camera = new THREE.PerspectiveCamera(
      55, container.clientWidth / container.clientHeight, 0.1, 500,
    );
    camera.position.set(18, 22, 24);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: quality.antialias });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, quality.maxPixelRatio));
    renderer.shadowMap.enabled = quality.shadows;
    renderer.shadowMap.type =
      quality.shadowType === 'pcf-soft' ? THREE.PCFSoftShadowMap : THREE.BasicShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.toneMappingExposure = 1.0; // overridden by lighting-store effect below
    renderer.domElement.style.touchAction = 'none';
    renderer.domElement.style.overscrollBehavior = 'none';
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    // Damping disabled so the camera stops instantly on mouse release —
    // matches the "no slide" feel of the character controller.
    controls.enableDamping = false;
    controls.mouseButtons = {
      LEFT: -1 as unknown as THREE.MOUSE,
      MIDDLE: THREE.MOUSE.PAN,
      RIGHT: THREE.MOUSE.ROTATE,
    };
    controls.enableZoom = false;
    controls.target.set(0, 0, 0);
    controls.update();

    const ORBIT_SPEED = 0.005;
    const PAN_SPEED = 0.0015;
    // Roblox-style discrete zoom levels — camera distance snaps to one of
    // these on ctrl/cmd+wheel rather than scaling continuously.
    const ZOOM_LEVELS = [2, 4, 7, 11, 16, 24, 36, 55, 85, 128];
    // Per-frame ease factor — 0.22 settles in ~5 frames and effectively
    // absorbs macOS trackpad momentum events (which keep firing for ~300ms
    // after the fingers lift) so the orbit actually comes to rest.
    const DAMP = 0.22;
    const MIN_PHI = 0.02;
    const MAX_PHI = Math.PI - 0.02;

    const tmpOffset = new THREE.Vector3();
    const tmpSpherical = new THREE.Spherical();
    const tmpRight = new THREE.Vector3();
    const tmpUp = new THREE.Vector3();
    const tmpMove = new THREE.Vector3();

    // Target orbit / zoom state. Wheel events write here; the render loop
    // (applyCameraDamping below) eases the real camera toward these values.
    let targetTheta = 0;
    let targetPhi = Math.PI / 2;
    let targetDistance = 20;
    let targetsInitialized = false;

    function syncTargetsFromCamera() {
      tmpOffset.copy(camera.position).sub(controls.target);
      tmpSpherical.setFromVector3(tmpOffset);
      targetTheta = tmpSpherical.theta;
      targetPhi = tmpSpherical.phi;
      targetDistance = tmpSpherical.radius;
      targetsInitialized = true;
    }

    function snapToZoomLevel(dist: number, step: number): number {
      let best = 0;
      let bestDelta = Infinity;
      for (let i = 0; i < ZOOM_LEVELS.length; i++) {
        const d = Math.abs(ZOOM_LEVELS[i] - dist);
        if (d < bestDelta) { bestDelta = d; best = i; }
      }
      const idx = Math.max(0, Math.min(ZOOM_LEVELS.length - 1, best + step));
      return ZOOM_LEVELS[idx];
    }

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      if (!targetsInitialized) syncTargetsFromCamera();
      const dx = e.deltaX;
      const dy = e.deltaY;

      // Ctrl/Cmd + wheel → step through discrete zoom levels
      if (e.ctrlKey || e.metaKey) {
        const step = dy > 0 ? 1 : -1; // wheel-down = zoom out one level
        targetDistance = snapToZoomLevel(targetDistance, step);
        return;
      }

      // Middle-mouse held during wheel → pan (immediate, no damping)
      if (e.buttons !== 0) {
        tmpRight.setFromMatrixColumn(camera.matrix, 0);
        tmpUp.setFromMatrixColumn(camera.matrix, 1);
        const distance = camera.position.distanceTo(controls.target);
        tmpMove.set(0, 0, 0)
          .addScaledVector(tmpRight,  dx * PAN_SPEED * distance)
          .addScaledVector(tmpUp,    -dy * PAN_SPEED * distance);
        camera.position.add(tmpMove);
        controls.target.add(tmpMove);
        syncTargetsFromCamera();
        return;
      }

      // Trackpad / wheel orbit — accumulate on target, ease in animate()
      targetTheta += dx * ORBIT_SPEED;
      targetPhi   += dy * ORBIT_SPEED;
      targetPhi = Math.max(MIN_PHI, Math.min(MAX_PHI, targetPhi));
    }
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });

    function applyCameraDamping() {
      if (!targetsInitialized) return;
      tmpOffset.copy(camera.position).sub(controls.target);
      tmpSpherical.setFromVector3(tmpOffset);

      let dTheta = targetTheta - tmpSpherical.theta;
      while (dTheta >  Math.PI) dTheta -= 2 * Math.PI;
      while (dTheta < -Math.PI) dTheta += 2 * Math.PI;
      const dPhi = targetPhi - tmpSpherical.phi;
      const dR   = targetDistance - tmpSpherical.radius;

      if (Math.abs(dTheta) + Math.abs(dPhi) + Math.abs(dR) < 5e-4) {
        // Settled — resync target in case OrbitControls (right-drag) moved
        // the camera directly since the last wheel event.
        targetTheta = tmpSpherical.theta;
        targetPhi   = tmpSpherical.phi;
        targetDistance = tmpSpherical.radius;
        return;
      }

      tmpSpherical.theta  += dTheta * DAMP;
      tmpSpherical.phi    += dPhi   * DAMP;
      tmpSpherical.radius += dR     * DAMP;
      tmpSpherical.phi = Math.max(MIN_PHI, Math.min(MAX_PHI, tmpSpherical.phi));
      tmpOffset.setFromSpherical(tmpSpherical);
      camera.position.copy(controls.target).add(tmpOffset);
    }

    // Roblox-style lighting — all values live-driven by useLightingStore.
    const hemisphere = new THREE.HemisphereLight(0xffffff, 0xffffff, 0);
    scene.add(hemisphere);
    const ambient = new THREE.AmbientLight(0xffffff, 0);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xffffff, 0);
    sun.position.set(10, 18, 8);
    sun.castShadow = quality.shadows;
    sun.shadow.mapSize.set(quality.shadowMapSize, quality.shadowMapSize);
    sun.shadow.camera.left = -30;
    sun.shadow.camera.right = 30;
    sun.shadow.camera.top = 30;
    sun.shadow.camera.bottom = -30;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 80;
    scene.add(sun);

    const { gridExtent } = useBuildingStore.getState();
    const gridSpan = gridExtent * 2 * TILE;

    const baseSize = 128;
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(baseSize, baseSize).rotateX(-Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0x5cd93a, roughness: 0.9, metalness: 0 }),
    );
    ground.position.y = 0;
    ground.receiveShadow = quality.shadows;
    ground.name = 'baseplate';
    scene.add(ground);

    // Invisible raycast plane that floats at the current level height so
    // the user can place pieces on upper floors even in empty air.
    const levelPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(baseSize, baseSize).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ visible: false }),
    );
    levelPlane.position.y = 0;
    levelPlane.name = 'level-plane';
    scene.add(levelPlane);

    const grid = new THREE.GridHelper(gridSpan, gridExtent * 2, 0x2d8c17, 0x8cffad);
    grid.position.y = 0.01;
    (grid.material as THREE.Material).depthWrite = false;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.6;
    scene.add(grid);

    const floorGroup  = new THREE.Group(); floorGroup.name  = 'floors';  scene.add(floorGroup);
    const wallGroup   = new THREE.Group(); wallGroup.name   = 'walls';   scene.add(wallGroup);
    const roofGroup   = new THREE.Group(); roofGroup.name   = 'roofs';   scene.add(roofGroup);
    const cornerGroup = new THREE.Group(); cornerGroup.name = 'corners'; scene.add(cornerGroup);
    const stairsGroup = new THREE.Group(); stairsGroup.name = 'stairs';  scene.add(stairsGroup);
    const partGroup   = new THREE.Group(); partGroup.name   = 'parts';   scene.add(partGroup);

    const ghost = new THREE.Group();
    ghost.visible = false;
    scene.add(ghost);

    let gizmo!: UnifiedGizmo3D;
    gizmo = new UnifiedGizmo3D({
      camera, renderer, controls,
      onCommit: () => {
        const target = gizmo.getTarget();
        if (!target) return;
        const xform = {
          position: { x: target.position.x, y: target.position.y, z: target.position.z },
          rotation: { x: target.rotation.x, y: target.rotation.y, z: target.rotation.z },
          scale:    { x: target.scale.x,    y: target.scale.y,    z: target.scale.z    },
        };
        const kind = target.userData.kind as
          | 'part' | 'floor' | 'wall' | 'roof' | 'corner' | 'stairs' | undefined;
        const key = target.userData.key as string | undefined;
        const store = useBuildingStore.getState();
        if (kind === 'floor'  && key) return void store.updateFloorTransform(key, xform);
        if (kind === 'wall'   && key) return void store.updateWallTransform(key, xform);
        if (kind === 'roof'   && key) return void store.updateRoofTransform(key, xform);
        if (kind === 'corner' && key) return void store.updateCornerTransform(key, xform);
        if (kind === 'stairs' && key) return void store.updateStairsTransform(key, xform);
        const id = target.userData.id as string | undefined;
        if (!id) return;
        useSceneStore.getState().updateSceneObject(id, xform);
      },
    });
    scene.add(gizmo.group);

    const refs: SceneRefs = {
      scene, camera, renderer, controls, ground, levelPlane, ghost,
      floorGroup, wallGroup, roofGroup, cornerGroup, stairsGroup, partGroup,
      gizmo,
      raycaster: new THREE.Raycaster(),
      pointer: new THREE.Vector2(),
      animId: 0,
      hemisphere, ambient, sun,
    };
    sceneRef.current = refs;

    playRef.current = createPlayController({
      scene, camera, renderer, controls, partGroup, floorGroup, wallGroup,
    });
    if (useSceneStore.getState().isPlaying) playRef.current.start();

    let lastTime = performance.now();
    function animate() {
      if (!sceneRef.current) return;
      sceneRef.current.animId = requestAnimationFrame(animate);
      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      if (playRef.current?.isActive()) playRef.current.update(dt);
      else applyCameraDamping(); // ease toward target orbit/zoom every frame
      sceneRef.current.controls.update();
      sceneRef.current.gizmo.update();
      sceneRef.current.renderer.render(sceneRef.current.scene, sceneRef.current.camera);
    }
    animate();

    const ro = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    ro.observe(container);

    return () => {
      ro.disconnect();
      renderer.domElement.removeEventListener('wheel', onWheel);
      if (playRef.current) { playRef.current.stop(); playRef.current = null; }
      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animId);
        sceneRef.current.gizmo.dispose();
        sceneRef.current.renderer.dispose();
        const canvas = sceneRef.current.renderer.domElement;
        canvas.parentNode?.removeChild(canvas);
        sceneRef.current = null;
      }
    };
  }, [quality]);

  // Keep the raycast level-plane at the correct Y for the active level.
  useEffect(() => {
    const refs = sceneRef.current;
    if (!refs) return;
    refs.levelPlane.position.y = level * WALL_HEIGHT;
  }, [level]);

  // --- live lighting / atmosphere updates (Roblox-style config) ---
  useEffect(() => {
    const applyLighting = (): void => {
      const refs = sceneRef.current;
      if (!refs) return;
      const cfg = useLightingStore.getState().config;
      const { hemisphere, ambient, sun, scene, renderer } = refs;

      // Sky background
      scene.background = new THREE.Color(rgbToHex(cfg.skyColor));

      // Exposure: Roblox ExposureCompensation is in EV stops (2^x).
      const glare = cfg.atmosphere.glare / 10; // 0..1 small exposure boost
      renderer.toneMappingExposure = Math.pow(2, cfg.exposureCompensation) * (1 + glare * 0.5);

      if (!cfg.globalShadows) {
        // Shadows OFF == fully flat-shaded: no directional component at all.
        // Every face reads the base material color identically. Ambient carries
        // everything, brightness becomes a flat multiplier.
        sun.intensity = 0;
        sun.visible = false;
        sun.castShadow = false;
        hemisphere.intensity = 0;
        ambient.color.setHex(0xffffff);
        ambient.intensity = Math.max(0.6, cfg.brightness * 0.5);
        return;
      }

      // --- Shadows ON: full Roblox-style directional lighting ---

      // Hemisphere light: sky = outdoorAmbient, ground = ambient.
      // Intensity scaled by environmentDiffuseScale; Roblox ~127 → intensity ~1.0.
      hemisphere.color.setHex(rgbToHex(cfg.outdoorAmbient));
      hemisphere.groundColor.setHex(rgbToHex(cfg.ambient));
      hemisphere.intensity =
        (cfg.outdoorAmbient.r + cfg.outdoorAmbient.g + cfg.outdoorAmbient.b) / (3 * 127) *
        cfg.environmentDiffuseScale;

      // Ambient light: ColorShift_Bottom acts as a flat shadow-side tint.
      const amb = addRgb(cfg.ambient, cfg.colorShiftBottom);
      ambient.color.setHex(rgbToHex(amb));
      ambient.intensity = 0.15;

      // Sun: brightness (0..5) maps directly to directional intensity.
      // ColorShift_Top tints the sunlit side; Atmosphere.Decay acts as a subtle cool-down.
      const sunTint = {
        r: Math.min(255, 255 + cfg.colorShiftTop.r - cfg.atmosphere.decay.r * 0.15),
        g: Math.min(255, 255 + cfg.colorShiftTop.g - cfg.atmosphere.decay.g * 0.15),
        b: Math.min(255, 255 + cfg.colorShiftTop.b - cfg.atmosphere.decay.b * 0.15),
      };
      sun.color.setHex(rgbToHex(sunTint));
      sun.intensity = cfg.brightness;

      // ClockTime → sun position. At 14h (2pm) sun is slightly west and high.
      // Roblox: 0 = midnight, 6 = sunrise east, 12 = noon overhead, 18 = sunset west.
      const t = (cfg.clockTime - 6) / 12; // 0..1 day arc
      const angle = t * Math.PI;          // 0 = horizon east, π = horizon west
      const altitude = Math.sin(angle);   // 0..1..0
      sun.position.set(Math.cos(angle) * 25, Math.max(4, altitude * 25), 12);
      sun.visible = altitude > 0.02;

      // Shadow-cast master switch: requires both the user toggle AND the
      // quality tier's shadow support.
      sun.castShadow = quality.shadows;

      // Atmosphere → fog. Density + Haze map to FogExp2 density.
      const fogDensity = cfg.atmosphere.density * 0.015 + cfg.atmosphere.haze * 0.008;
      if (fogDensity > 0.001) {
        scene.fog = new THREE.FogExp2(rgbToHex(cfg.atmosphere.color), fogDensity);
      } else {
        scene.fog = null;
      }
    };

    applyLighting();
    const unsub = useLightingStore.subscribe(applyLighting);
    return () => unsub();
  }, [quality]);

  // --- pointer handlers ---
  useEffect(() => {
    const refs = sceneRef.current;
    if (!refs) return;
    const canvas = refs.renderer.domElement;

    function setPointerFromEvent(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      refs!.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      refs!.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      refs!.raycaster.setFromCamera(refs!.pointer, refs!.camera);
    }

    function worldFromEvent(e: MouseEvent): { x: number; z: number } | null {
      setPointerFromEvent(e);
      const targets = level > 0 ? [refs!.levelPlane, refs!.ground] : [refs!.ground];
      const hits = refs!.raycaster.intersectObjects(targets);
      if (!hits.length) return null;
      return { x: hits[0].point.x, z: hits[0].point.z };
    }

    function partHitFromEvent(e: MouseEvent): THREE.Object3D | null {
      setPointerFromEvent(e);
      const hits = refs!.raycaster.intersectObjects(refs!.partGroup.children, true);
      if (!hits.length) return null;
      let obj: THREE.Object3D | null = hits[0].object;
      while (obj && !obj.userData.id) obj = obj.parent;
      return obj ?? null;
    }

    function buildingHitFromEvent(e: MouseEvent): THREE.Object3D | null {
      setPointerFromEvent(e);
      const hits = refs!.raycaster.intersectObjects(
        [
          ...refs!.floorGroup.children,
          ...refs!.wallGroup.children,
          ...refs!.roofGroup.children,
          ...refs!.cornerGroup.children,
          ...refs!.stairsGroup.children,
        ],
        true,
      );
      if (!hits.length) return null;
      let obj: THREE.Object3D | null = hits[0].object;
      while (obj && !obj.userData.key) obj = obj.parent;
      return obj;
    }

    function updateGhost(world: { x: number; z: number }) {
      const ghost = refs!.ghost;
      disposeAndClear(ghost);
      if (tool === 'select') { ghost.visible = false; return; }
      ghost.visible = true;

      const store = useBuildingStore.getState();

      if (tool === 'part') {
        const box = new THREE.Mesh(
          new THREE.BoxGeometry(PART_DEFAULT_SIZE, PART_DEFAULT_SIZE, PART_DEFAULT_SIZE),
          new THREE.MeshBasicMaterial({ color: 0x4ade80, transparent: true, opacity: 0.4, depthWrite: false }),
        );
        box.position.set(world.x, level * WALL_HEIGHT + PART_DEFAULT_SIZE / 2, world.z);
        ghost.add(box);
        return;
      }

      if (tool === 'eraser') {
        const box = new THREE.Mesh(
          new THREE.BoxGeometry(TILE * 0.98, 0.25, TILE * 0.98),
          new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.4, depthWrite: false }),
        );
        const t = tileFromWorld(world.x, world.z);
        box.position.set(t.x * TILE, level * WALL_HEIGHT + 0.1, t.z * TILE);
        ghost.add(box);
        return;
      }

      if (tool === 'wall' || tool === 'wall-window' || tool === 'wall-door') {
        const edge = edgeFromWorld(world.x, world.z);
        const g = buildPiece(store.selectedPiece[tool], THREE);
        const wp = wallWorldPlacement(edge.x, level, edge.z, edge.dir);
        g.position.set(wp.x, wp.y, wp.z);
        g.rotation.y = wp.rotY;
        ghostifyGroup(g);
        ghost.add(g);
        return;
      }

      if (tool === 'roof') {
        const t = tileFromWorld(world.x, world.z);
        const g = buildPiece(store.selectedPiece.roof, THREE);
        g.position.set(t.x * TILE, level * WALL_HEIGHT + WALL_HEIGHT, t.z * TILE);
        ghostifyGroup(g);
        ghost.add(g);
        return;
      }

      if (tool === 'roof-corner' || tool === 'corner') {
        const c = cornerFromWorld(world.x, world.z);
        const g = buildPiece(store.selectedPiece[tool], THREE);
        const worldX = c.x * TILE + TILE / 2;
        const worldZ = c.z * TILE + TILE / 2;
        const baseY = tool === 'roof-corner' ? level * WALL_HEIGHT + WALL_HEIGHT : level * WALL_HEIGHT;
        g.position.set(worldX, baseY, worldZ);
        ghostifyGroup(g);
        ghost.add(g);
        return;
      }

      if (tool === 'stairs') {
        const t = tileFromWorld(world.x, world.z);
        const g = buildPiece(store.selectedPiece.stairs, THREE);
        g.position.set(t.x * TILE, level * WALL_HEIGHT, t.z * TILE);
        g.rotation.y = facingRotY('N');
        ghostifyGroup(g);
        ghost.add(g);
        return;
      }

      // floor
      const t = tileFromWorld(world.x, world.z);
      const g = buildPiece(store.selectedPiece.floor, THREE);
      g.position.set(t.x * TILE, level * WALL_HEIGHT, t.z * TILE);
      ghostifyGroup(g);
      ghost.add(g);
    }

    function onMove(e: MouseEvent) {
      if (useSceneStore.getState().isPlaying) { refs!.ghost.visible = false; return; }
      setPointerFromEvent(e);
      refs!.gizmo.updateHover(refs!.pointer);
      if (refs!.gizmo.isDragging()) { refs!.ghost.visible = false; return; }
      const world = worldFromEvent(e);
      if (!world) { refs!.ghost.visible = false; return; }
      updateGhost(world);
    }

    function onDown(e: MouseEvent) {
      if (e.button !== 0) return;
      if (useSceneStore.getState().isPlaying) return;

      setPointerFromEvent(e);
      if (refs!.gizmo.tryPointerDown(refs!.pointer)) return;

      const hitPart = partHitFromEvent(e);
      const sceneStore = useSceneStore.getState();
      const bStore = useBuildingStore.getState();

      if (hitPart && tool !== 'part') {
        const id = hitPart.userData.id as string | undefined;
        if (id) {
          if (tool === 'eraser') sceneStore.removePart(id);
          else {
            const part = sceneStore.sceneObjects.find((p) => p.id === id) ?? null;
            sceneStore.setSelectedPart(part);
            bStore.setSelection(null);
          }
          return;
        }
      }

      if (tool === 'select' || tool === 'eraser') {
        const hit = buildingHitFromEvent(e);
        if (hit) {
          const kind = hit.userData.kind as 'floor'|'wall'|'roof'|'corner'|'stairs'|undefined;
          const key = hit.userData.key as string | undefined;
          if (kind && key) {
            if (tool === 'eraser') {
              if (kind === 'floor') {
                const [xs, ys, zs] = key.split(',');
                bStore.eraseFloor(+xs, +ys, +zs);
              } else if (kind === 'wall') {
                const [xs, ys, zs, dir] = key.split(',') as [string,string,string,EdgeDir];
                bStore.eraseWall(+xs, +ys, +zs, dir);
              } else if (kind === 'roof') {
                const [xs, ys, zs] = key.split(',');
                bStore.eraseRoof(+xs, +ys, +zs);
              } else if (kind === 'corner') {
                const [xs, ys, zs] = key.split(',');
                bStore.eraseCorner(+xs, +ys, +zs);
              } else if (kind === 'stairs') {
                const [xs, ys, zs, f] = key.split(',') as [string,string,string,Facing];
                bStore.eraseStairs(+xs, +ys, +zs, f);
              }
              return;
            }
            bStore.setSelection({ kind, key });
            sceneStore.setSelectedPart(null);
            return;
          }
        }
      }

      const world = worldFromEvent(e);
      if (!world) {
        if (tool === 'select') {
          sceneStore.setSelectedPart(null);
          bStore.setSelection(null);
        }
        return;
      }

      if (tool === 'select') {
        sceneStore.setSelectedPart(null);
        bStore.setSelection(null);
        return;
      }

      if (tool === 'part') {
        sceneStore.addPart({
          partType: 'Block',
          position: { x: world.x, y: level * WALL_HEIGHT + PART_DEFAULT_SIZE / 2, z: world.z },
          scale: { x: PART_DEFAULT_SIZE, y: PART_DEFAULT_SIZE, z: PART_DEFAULT_SIZE },
          color: '#a1a1aa',
        });
        return;
      }

      if (tool === 'floor') {
        const t = tileFromWorld(world.x, world.z);
        bStore.placeFloor(t.x, level, t.z);
        return;
      }

      if (tool === 'wall' || tool === 'wall-window' || tool === 'wall-door') {
        const edge = edgeFromWorld(world.x, world.z);
        bStore.placeWall(edge.x, level, edge.z, edge.dir);
        return;
      }

      if (tool === 'roof') {
        const t = tileFromWorld(world.x, world.z);
        bStore.placeRoof(t.x, level, t.z);
        return;
      }

      if (tool === 'corner' || tool === 'roof-corner') {
        const c = cornerFromWorld(world.x, world.z);
        bStore.placeCorner(c.x, level, c.z);
        return;
      }

      if (tool === 'stairs') {
        const t = tileFromWorld(world.x, world.z);
        bStore.placeStairs(t.x, level, t.z, 'N');
        return;
      }
    }

    function onLeave() { refs!.ghost.visible = false; }

    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mousedown', onDown);
    canvas.addEventListener('mouseleave', onLeave);
    return () => {
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mousedown', onDown);
      canvas.removeEventListener('mouseleave', onLeave);
    };
  }, [tool, level, selectedPiece]);

  // ------------- data-driven rebuilds -------------

  // Floors
  useEffect(() => {
    const refs = sceneRef.current;
    if (!refs) return;
    disposeAndClear(refs.floorGroup);
    for (const key of Object.keys(floors)) {
      const cell = floors[key];
      const [xs, ys, zs] = key.split(',');
      const x = +xs, y = +ys, z = +zs;
      const g = buildPiece(cell.asset, THREE);
      const p = cell.position ?? { x: x * TILE, y: y * WALL_HEIGHT, z: z * TILE };
      g.position.set(p.x, p.y, p.z);
      if (cell.rotation) g.rotation.set(cell.rotation.x, cell.rotation.y, cell.rotation.z);
      if (cell.scale) g.scale.set(cell.scale.x, cell.scale.y, cell.scale.z);
      g.visible = cell.visible ?? true;
      g.userData.kind = 'floor';
      g.userData.key = key;
      refs.floorGroup.add(g);
    }
  }, [floors, quality]);

  // Walls — sharp-corner mode renders each wall via buildPiece (preserves
  // window/door/textured variants). Bend mode (cornerBend > 0) walks every
  // tile-vertex junction, trims the two perpendicular walls back by the
  // bend radius, and emits a tangent quarter-arc bridge in their stead.
  // Trade-off: bent walls render as solid tinted boxes (no window/door
  // detail) because we can't trim arbitrary procedural geometry mid-build.
  useEffect(() => {
    const refs = sceneRef.current;
    if (!refs) return;
    disposeAndClear(refs.wallGroup);

    if (cornerBend <= 0.001) {
      for (const key of Object.keys(walls)) {
        const edge = walls[key];
        const [xs, ys, zs, dir] = key.split(',') as [string, string, string, EdgeDir];
        const x = +xs, y = +ys, z = +zs;
        const g = buildPiece(edge.asset, THREE);
        const wp = wallWorldPlacement(x, y, z, dir);
        if (edge.position) g.position.set(edge.position.x, edge.position.y, edge.position.z);
        else g.position.set(wp.x, wp.y, wp.z);
        if (edge.rotation) g.rotation.set(edge.rotation.x, edge.rotation.y, edge.rotation.z);
        else g.rotation.y = wp.rotY;
        if (edge.scale) g.scale.set(edge.scale.x, edge.scale.y, edge.scale.z);
        g.visible = edge.visible ?? true;
        g.userData.kind = 'wall';
        g.userData.key = key;
        refs.wallGroup.add(g);
      }
      return;
    }

    // ── Bending mode ──────────────────────────────────────────────────────
    const r = Math.min(cornerBend, TILE / 2);

    // Tile-vertex coordinate convention: vertex (vx,vz) sits at world
    // (vx*TILE - TILE/2, vz*TILE - TILE/2). Per the store comment:
    //   N edge of (x,z) → vertices (x,z) and (x+1,z), wall along +X
    //   E edge of (x,z) → vertices (x+1,z) and (x+1,z+1), wall along +Z
    type WInfo = {
      key: string; x: number; y: number; z: number; dir: EdgeDir;
      tint: string; pos?: { x: number; y: number; z: number };
      rot?: { x: number; y: number; z: number }; scale?: { x: number; y: number; z: number };
    };
    const wallList: WInfo[] = [];
    for (const key of Object.keys(walls)) {
      const edge = walls[key];
      if (edge.visible === false) continue;
      const [xs, ys, zs, dirRaw] = key.split(',') as [string, string, string, EdgeDir];
      const tint = edge.color ?? getPiece(edge.asset)?.swatch ?? '#ffffff';
      wallList.push({
        key, x: +xs, y: +ys, z: +zs, dir: dirRaw,
        tint, pos: edge.position, rot: edge.rotation, scale: edge.scale,
      });
    }

    function endpointsOf(w: WInfo): [string, string] {
      if (w.dir === 'N') return [`${w.x},${w.y},${w.z}`, `${w.x + 1},${w.y},${w.z}`];
      return [`${w.x + 1},${w.y},${w.z}`, `${w.x + 1},${w.y},${w.z + 1}`];
    }
    /** Unit vector in xz from junction along this wall's interior. */
    function dirAway(w: WInfo, isFirstEnd: boolean): { dx: number; dz: number } {
      if (w.dir === 'N') return { dx: isFirstEnd ? 1 : -1, dz: 0 };
      return { dx: 0, dz: isFirstEnd ? 1 : -1 };
    }

    const vertexMap = new Map<string, { idx: number; first: boolean }[]>();
    function pushAt(vk: string, link: { idx: number; first: boolean }) {
      let arr = vertexMap.get(vk);
      if (!arr) { arr = []; vertexMap.set(vk, arr); }
      arr.push(link);
    }
    for (let i = 0; i < wallList.length; i++) {
      const [a, b] = endpointsOf(wallList[i]);
      pushAt(a, { idx: i, first: true });
      pushAt(b, { idx: i, first: false });
    }

    // trim[i] = [trimAtFirstEnd, trimAtSecondEnd] in meters
    const trim: [number, number][] = wallList.map(() => [0, 0]);

    for (const [vk, links] of vertexMap.entries()) {
      if (links.length !== 2) continue; // only handle clean 2-way junctions
      const wA = wallList[links[0].idx];
      const wB = wallList[links[1].idx];
      if (wA.dir === wB.dir) continue; // colinear, no fillet

      // Trim each wall at the end touching this vertex.
      trim[links[0].idx][links[0].first ? 0 : 1] = r;
      trim[links[1].idx][links[1].first ? 0 : 1] = r;

      // Junction world position
      const [vxs, vys, vzs] = vk.split(',');
      const vx = +vxs, vy = +vys, vz = +vzs;
      const jx = vx * TILE - TILE / 2;
      const jz = vz * TILE - TILE / 2;
      const baseY = vy * WALL_HEIGHT;

      const dA = dirAway(wA, links[0].first);
      const dB = dirAway(wB, links[1].first);
      // Arc center: J + r*(dA + dB) — tangent to both wall centerlines.
      const cx = jx + r * (dA.dx + dB.dx);
      const cz = jz + r * (dA.dz + dB.dz);
      // Tangent points on each wall (where the trim ends and the arc begins)
      const tAx = jx + r * dA.dx, tAz = jz + r * dA.dz;
      const tBx = jx + r * dB.dx, tBz = jz + r * dB.dz;

      // Find the shorter sweep (always ±π/2 for perpendicular walls).
      const startAng = Math.atan2(tAz - cz, tAx - cx);
      const endAngRaw = Math.atan2(tBz - cz, tBx - cx);
      let delta = endAngRaw - startAng;
      while (delta > Math.PI) delta -= 2 * Math.PI;
      while (delta < -Math.PI) delta += 2 * Math.PI;
      const endAng = startAng + delta;

      // Build a true 2D annulus slice (thick arc) and extrude it vertically.
      // Three.js's Shape.absarc is the actual arc primitive — ExtrudeGeometry
      // tessellates it via `curveSegments`, so the surface is mathematically
      // correct (no chord-segment facets).
      // We split the arc at its midpoint so each wall owns half the bend and
      // keeps its own tint — otherwise one wall's color bleeds across the whole
      // fillet and the corner reads as "wall A extended around the other wall".
      const halfT = WALL_THICK / 2;
      const Ro = r + halfT;
      const Ri = Math.max(r - halfT, 0.001); // guard against thick walls / small r
      const midAng = startAng + delta / 2;

      const buildArcSegment = (angStart: number, angEnd: number, tint: string, ownerKey: string) => {
        const segDelta = angEnd - angStart;
        const shape = new THREE.Shape();
        // Outer arc from angStart to angEnd. After rotateX(+π/2) the shape's
        // XY plane maps directly to world XZ, so we work in standard angles.
        shape.moveTo(Math.cos(angStart) * Ro, Math.sin(angStart) * Ro);
        shape.absarc(0, 0, Ro, angStart, angEnd, /* clockwise = */ segDelta < 0);
        shape.lineTo(Math.cos(angEnd) * Ri, Math.sin(angEnd) * Ri);
        shape.absarc(0, 0, Ri, angEnd, angStart, /* clockwise = */ segDelta > 0);
        shape.closePath();

        const segGeo = new THREE.ExtrudeGeometry(shape, {
          depth: WALL_HEIGHT,
          bevelEnabled: false,
          curveSegments: 16, // per-half; total arc still ~32 like the old single-piece version
        });
        // Extrusion is along +Z. rotateX(+π/2) maps shape XY → world XZ
        // (no mirror) and pushes the extrusion to -Y; translate up so the
        // bottom of the arc sits at world y = baseY.
        segGeo.rotateX(Math.PI / 2);
        segGeo.translate(cx, baseY + WALL_HEIGHT, cz);

        const segMesh = new THREE.Mesh(
          segGeo,
          new THREE.MeshStandardMaterial({ color: tint, roughness: 1 }),
        );
        segMesh.castShadow = true;
        segMesh.receiveShadow = true;
        // Tag as a regular wall so select/erase logic treats clicks on the
        // bend as clicks on its owning wall. Without this the raycaster walks
        // up looking for userData.key, finds none, and the click is a no-op.
        segMesh.userData.kind = 'wall';
        segMesh.userData.key = ownerKey;
        segMesh.userData.junction = vk;
        segMesh.userData.isArc = true;
        return segMesh;
      };

      // Half adjacent to wall A (from wall A's tangent to the midpoint) uses A's tint,
      // half adjacent to wall B uses B's tint. Each wall now visibly "bends" into
      // half of the corner instead of one wall apparently extending across.
      refs.wallGroup.add(buildArcSegment(startAng, midAng, wA.tint, wA.key));
      refs.wallGroup.add(buildArcSegment(midAng, endAng, wB.tint, wB.key));
    }

    // Emit each wall as a single trimmed solid box.
    for (let i = 0; i < wallList.length; i++) {
      const w = wallList[i];
      const [ts, te] = trim[i];
      const length = TILE - ts - te;
      if (length <= 0.01) continue;
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(length, WALL_HEIGHT, WALL_THICK),
        new THREE.MeshStandardMaterial({ color: w.tint, roughness: 1 }),
      );
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const baseY = w.y * WALL_HEIGHT + WALL_HEIGHT / 2;
      if (w.dir === 'N') {
        // wall sits at z = z*T - T/2, X-range slid inward by ts/te
        const cxw = w.x * TILE - TILE / 2 + ts + length / 2;
        const czw = w.z * TILE - TILE / 2;
        mesh.position.set(cxw, baseY, czw);
        mesh.rotation.y = 0;
      } else {
        const cxw = w.x * TILE + TILE / 2;
        const czw = w.z * TILE - TILE / 2 + ts + length / 2;
        mesh.position.set(cxw, baseY, czw);
        mesh.rotation.y = -Math.PI / 2;
      }
      // Manual transforms (set via gizmo) override base placement for
      // power-users who tuned a wall by hand. They were authored against
      // an untrimmed wall, so the result may look off — accepted tradeoff.
      if (w.pos) mesh.position.set(w.pos.x, w.pos.y, w.pos.z);
      if (w.rot) mesh.rotation.set(w.rot.x, w.rot.y, w.rot.z);
      if (w.scale) mesh.scale.set(w.scale.x, w.scale.y, w.scale.z);
      mesh.userData.kind = 'wall';
      mesh.userData.key = w.key;
      refs.wallGroup.add(mesh);
    }
  }, [walls, quality, cornerBend]);

  // Roofs
  useEffect(() => {
    const refs = sceneRef.current;
    if (!refs) return;
    disposeAndClear(refs.roofGroup);
    for (const key of Object.keys(roofs)) {
      const cell = roofs[key];
      const [xs, ys, zs] = key.split(',');
      const x = +xs, y = +ys, z = +zs;
      const g = buildPiece(cell.asset, THREE);
      const p = cell.position ?? { x: x * TILE, y: y * WALL_HEIGHT + WALL_HEIGHT, z: z * TILE };
      g.position.set(p.x, p.y, p.z);
      if (cell.rotation) g.rotation.set(cell.rotation.x, cell.rotation.y, cell.rotation.z);
      if (cell.scale) g.scale.set(cell.scale.x, cell.scale.y, cell.scale.z);
      g.visible = cell.visible ?? true;
      g.userData.kind = 'roof';
      g.userData.key = key;
      refs.roofGroup.add(g);
    }
  }, [roofs, quality]);

  // Corners (wall + roof corners share the same record)
  useEffect(() => {
    const refs = sceneRef.current;
    if (!refs) return;
    disposeAndClear(refs.cornerGroup);
    for (const key of Object.keys(cornersRec)) {
      const cell = cornersRec[key];
      const [xs, ys, zs] = key.split(',');
      const x = +xs, y = +ys, z = +zs;
      const g = buildPiece(cell.asset, THREE);
      const worldX = x * TILE + TILE / 2;
      const worldZ = z * TILE + TILE / 2;
      const p = cell.position ?? { x: worldX, y: y * WALL_HEIGHT, z: worldZ };
      g.position.set(p.x, p.y, p.z);
      if (cell.rotation) g.rotation.set(cell.rotation.x, cell.rotation.y, cell.rotation.z);
      if (cell.scale) g.scale.set(cell.scale.x, cell.scale.y, cell.scale.z);
      g.visible = cell.visible ?? true;
      g.userData.kind = 'corner';
      g.userData.key = key;
      refs.cornerGroup.add(g);
    }
  }, [cornersRec, quality]);

  // Stairs
  useEffect(() => {
    const refs = sceneRef.current;
    if (!refs) return;
    disposeAndClear(refs.stairsGroup);
    for (const key of Object.keys(stairsRec)) {
      const cell = stairsRec[key];
      const [xs, ys, zs, fs] = key.split(',') as [string, string, string, Facing];
      const x = +xs, y = +ys, z = +zs;
      const g = buildPiece(cell.asset, THREE);
      const p = cell.position ?? { x: x * TILE, y: y * WALL_HEIGHT, z: z * TILE };
      g.position.set(p.x, p.y, p.z);
      if (cell.rotation) g.rotation.set(cell.rotation.x, cell.rotation.y, cell.rotation.z);
      else g.rotation.y = facingRotY(fs);
      if (cell.scale) g.scale.set(cell.scale.x, cell.scale.y, cell.scale.z);
      g.visible = cell.visible ?? true;
      g.userData.kind = 'stairs';
      g.userData.key = key;
      refs.stairsGroup.add(g);
    }
  }, [stairsRec, quality]);

  // Parts
  useEffect(() => {
    const refs = sceneRef.current;
    if (!refs) return;
    disposeAndClear(refs.partGroup);
    const loader = new GLTFLoader();
    for (const p of parts) {
      if (p.partType === 'GLB' && p.modelName) {
        const placeholder = new THREE.Group();
        placeholder.position.set(p.position.x, p.position.y, p.position.z);
        placeholder.rotation.set(p.rotation.x, p.rotation.y, p.rotation.z);
        placeholder.scale.set(p.scale.x, p.scale.y, p.scale.z);
        placeholder.visible = p.visible;
        placeholder.userData.id = p.id;
        placeholder.userData.kind = 'part';
        refs.partGroup.add(placeholder);
        loader.load(`/assets/medieval/${p.modelName}.gltf`, (gltf) => {
          if (!placeholder.parent) return;
          gltf.scene.traverse((o) => {
            if ((o as THREE.Mesh).isMesh) {
              (o as THREE.Mesh).castShadow = quality.shadows && p.castShadow;
              (o as THREE.Mesh).receiveShadow = quality.shadows;
            }
          });
          placeholder.add(gltf.scene);
        }, undefined, () => {
          placeholder.add(new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshStandardMaterial({ color: 0xff6b6b }),
          ));
        });
        continue;
      }
      const mesh = new THREE.Mesh(
        geometryForPart(p.partType, quality.lowPolyPrimitives),
        makeSurfaceMaterial({
          color: p.color,
          roughness: p.roughness,
          metalness: p.metalness,
          emissive: p.emissiveColor,
          emissiveIntensity: p.emissiveIntensity,
          pbr: quality.pbrMaterials,
        }),
      );
      mesh.position.set(p.position.x, p.position.y, p.position.z);
      mesh.rotation.set(p.rotation.x, p.rotation.y, p.rotation.z);
      mesh.scale.set(p.scale.x, p.scale.y, p.scale.z);
      mesh.castShadow = quality.shadows && p.castShadow;
      mesh.receiveShadow = quality.shadows;
      mesh.visible = p.visible;
      mesh.userData.id = p.id;
      mesh.userData.kind = 'part';
      refs.partGroup.add(mesh);
    }
  }, [parts, quality]);

  // Selection highlight + gizmo attach
  useEffect(() => {
    const refs = sceneRef.current;
    if (!refs || !refs.gizmo) return;

    let selectedObj: THREE.Object3D | null = null;

    for (const child of refs.partGroup.children) {
      const isSelected = child.userData.id === selectedPartId;
      if (isSelected) selectedObj = child;
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh && mesh.material) {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat.emissive) {
          mat.emissive.setHex(isSelected ? 0x4ade80 : 0x000000);
          mat.emissiveIntensity = isSelected ? 0.35 : 0;
        }
      }
    }

    const allBuildingGroups = [
      refs.floorGroup, refs.wallGroup, refs.roofGroup,
      refs.cornerGroup, refs.stairsGroup,
    ];
    for (const g of allBuildingGroups) {
      for (const child of g.children) {
        const isSelected =
          !!buildingSelection &&
          child.userData.kind === buildingSelection.kind &&
          child.userData.key === buildingSelection.key;
        if (isSelected) selectedObj = child;
        child.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (mesh.isMesh && mesh.material) {
            const mat = mesh.material as THREE.MeshStandardMaterial;
            if (mat.emissive) {
              mat.emissive.setHex(isSelected ? 0x4ade80 : 0x000000);
              mat.emissiveIntensity = isSelected ? 0.35 : 0;
            }
          }
        });
      }
    }

    if (selectedObj) refs.gizmo.attach(selectedObj);
    else refs.gizmo.detach();
  }, [selectedPartId, parts, buildingSelection, floors, walls, roofs, cornersRec, stairsRec]);

  // Drag-drop of GLB assets from the asset panel
  useEffect(() => {
    const refs = sceneRef.current;
    if (!refs) return;
    const el = containerRef.current;
    if (!el) return;

    function onDragOver(e: DragEvent) {
      if (!e.dataTransfer) return;
      if (!Array.from(e.dataTransfer.types).includes('application/x-problocks-asset')) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }
    function onDrop(e: DragEvent) {
      if (!e.dataTransfer) return;
      const modelName = e.dataTransfer.getData('application/x-problocks-asset');
      if (!modelName) return;
      e.preventDefault();
      const rect = refs!.renderer.domElement.getBoundingClientRect();
      refs!.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      refs!.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      refs!.raycaster.setFromCamera(refs!.pointer, refs!.camera);
      const hits = refs!.raycaster.intersectObject(refs!.ground);
      if (!hits.length) return;
      const pt = hits[0].point;
      useSceneStore.getState().addPart({
        name: modelName, partType: 'GLB', modelName,
        position: { x: pt.x, y: 0, z: pt.z }, scale: { x: 1, y: 1, z: 1 },
      });
    }
    el.addEventListener('dragover', onDragOver);
    el.addEventListener('drop', onDrop);
    return () => {
      el.removeEventListener('dragover', onDragOver);
      el.removeEventListener('drop', onDrop);
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
}
