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
import { buildPiece, getPiece, TILE, WALL_HEIGHT, WALL_THICK, FLOOR_THICK, FACE_SHADE } from '@/lib/building-kit';

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

    // Camera controls: scroll-driven. All mouse-button interactions are off
    // (no left/right/middle drag touches the camera). A custom wheel handler
    // below implements:
    //   • plain two-finger swipe / wheel  → orbit (azimuth + polar)
    //   • ctrl/⌘ + wheel  (trackpad pinch) → zoom (dolly toward target)
    // OrbitControls is kept only to hold the orbit target — play-mode.ts
    // translates that target with the character each frame, so the same
    // scroll-to-orbit + pinch-to-zoom also follows the player.
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = false;
    controls.enableRotate = false;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.target.set(0, 0, 0);
    controls.update();

    // Scroll-to-orbit + pinch-to-zoom. Tunable constants kept local so they
    // don't leak into the store.
    const ORBIT_SPEED = 0.004;          // radians per wheel-delta unit
    const ZOOM_FACTOR_PER_UNIT = 1.01;   // pow(this, deltaY) per tick
    const ZOOM_MIN = 1.5;
    const ZOOM_MAX = 150;
    const POLAR_EPS = 0.05;              // keep camera off the exact pole

    const spherical = new THREE.Spherical();
    const sphOffset = new THREE.Vector3();

    function onWheel(e: WheelEvent) {
      e.preventDefault();

      // Pinch (trackpad) or ctrl/⌘ + wheel → dolly toward the orbit target.
      if (e.ctrlKey || e.metaKey) {
        sphOffset.copy(camera.position).sub(controls.target);
        const curDist = sphOffset.length();
        if (curDist <= 0) return;
        const factor = Math.pow(ZOOM_FACTOR_PER_UNIT, e.deltaY);
        const newDist = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, curDist * factor));
        sphOffset.multiplyScalar(newDist / curDist);
        camera.position.copy(controls.target).add(sphOffset);
        return;
      }

      // Plain wheel / two-finger swipe → orbit around target.
      // deltaX spins azimuth, deltaY tilts polar. Sign convention matches
      // a Roblox / Minecraft feel: swipe up = look up, swipe right = look right.
      sphOffset.copy(camera.position).sub(controls.target);
      spherical.setFromVector3(sphOffset);
      spherical.theta += e.deltaX * ORBIT_SPEED;
      spherical.phi   += e.deltaY * ORBIT_SPEED;
      spherical.phi = Math.max(POLAR_EPS, Math.min(Math.PI - POLAR_EPS, spherical.phi));
      sphOffset.setFromSpherical(spherical);
      camera.position.copy(controls.target).add(sphOffset);
      camera.lookAt(controls.target);
    }
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });

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

  // Floors — sharp-corner mode renders each tile via buildPiece (preserves
  // plank/checker/brick patterns). Bend mode (cornerBend > 0) replaces the
  // default square slab with a custom ExtrudeGeometry whose corners are
  // rounded by the same radius `r` used for wall fillets, but only at tile
  // vertices that (a) host a clean 2-way wall junction and (b) whose fillet
  // side points toward this floor tile. This keeps the floor flush with
  // the rounded wall corner instead of a sharp slab poking through the arc.
  // Same trade-off as walls: patterned floors become solid tinted shapes
  // when bending is active.
  useEffect(() => {
    const refs = sceneRef.current;
    if (!refs) return;
    disposeAndClear(refs.floorGroup);

    if (cornerBend <= 0.001) {
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
      return;
    }

    const r = Math.min(cornerBend, TILE / 2);

    // Build a map: tile-vertex key → summed outward wall directions
    // (dA+dB). Present only for clean 2-way perpendicular junctions, which
    // is the same set of junctions that get wall fillets above.
    type WInfo = { x: number; y: number; z: number; dir: EdgeDir };
    const wallList: WInfo[] = [];
    for (const key of Object.keys(walls)) {
      const edge = walls[key];
      if (edge.visible === false) continue;
      const [xs, ys, zs, dirRaw] = key.split(',') as [string, string, string, EdgeDir];
      wallList.push({ x: +xs, y: +ys, z: +zs, dir: dirRaw });
    }
    const endpointsOfW = (w: WInfo): [string, string] =>
      w.dir === 'N'
        ? [`${w.x},${w.y},${w.z}`, `${w.x + 1},${w.y},${w.z}`]
        : [`${w.x + 1},${w.y},${w.z}`, `${w.x + 1},${w.y},${w.z + 1}`];
    const dirAwayW = (w: WInfo, isFirst: boolean): { dx: number; dz: number } =>
      w.dir === 'N'
        ? { dx: isFirst ? 1 : -1, dz: 0 }
        : { dx: 0, dz: isFirst ? 1 : -1 };

    const vmap = new Map<string, { idx: number; first: boolean }[]>();
    for (let i = 0; i < wallList.length; i++) {
      const [a, b] = endpointsOfW(wallList[i]);
      let arrA = vmap.get(a); if (!arrA) { arrA = []; vmap.set(a, arrA); }
      arrA.push({ idx: i, first: true });
      let arrB = vmap.get(b); if (!arrB) { arrB = []; vmap.set(b, arrB); }
      arrB.push({ idx: i, first: false });
    }
    const filletDir = new Map<string, { dx: number; dz: number }>();
    for (const [vk, links] of vmap.entries()) {
      if (links.length !== 2) continue;
      const wA = wallList[links[0].idx];
      const wB = wallList[links[1].idx];
      if (wA.dir === wB.dir) continue;
      const dA = dirAwayW(wA, links[0].first);
      const dB = dirAwayW(wB, links[1].first);
      filletDir.set(vk, { dx: dA.dx + dB.dx, dz: dA.dz + dB.dz });
    }

    // Walk a floor tile's 4 corners CW in shape-local (X, Z) space:
    //   NW → NE → SE → SW → NW. For each corner that hosts a matching
    //   fillet, we trim the two adjacent edges back by r and insert a
    //   tangent quarter-arc identical to the wall fillet.
    for (const key of Object.keys(floors)) {
      const cell = floors[key];
      if (cell.visible === false) continue;
      const [xs, ys, zs] = key.split(',');
      const x = +xs, y = +ys, z = +zs;
      const tint = cell.color ?? getPiece(cell.asset)?.swatch ?? '#ffffff';

      // A floor at level y sits atop walls at level y-1 and may have walls
      // at level y rising from it, so we match a corner against fillets at
      // either y. Without this, upper-story floors ignore the wall bends
      // directly beneath them when the user hasn't also placed walls at
      // their own level yet.
      type CornerDef = { sx: number; sz: number; cx: number; cz: number; inDx: number; inDz: number };
      const corners: CornerDef[] = [
        { sx: -TILE / 2, sz: -TILE / 2, cx: x,     cz: z,     inDx: +1, inDz: +1 }, // NW
        { sx: +TILE / 2, sz: -TILE / 2, cx: x + 1, cz: z,     inDx: -1, inDz: +1 }, // NE
        { sx: +TILE / 2, sz: +TILE / 2, cx: x + 1, cz: z + 1, inDx: -1, inDz: -1 }, // SE
        { sx: -TILE / 2, sz: +TILE / 2, cx: x,     cz: z + 1, inDx: +1, inDz: -1 }, // SW
      ];
      const cornerRoundedAtY = (c: CornerDef, yy: number) => {
        const f = filletDir.get(`${c.cx},${yy},${c.cz}`);
        if (!f) return false;
        return Math.sign(f.dx) === c.inDx && Math.sign(f.dz) === c.inDz;
      };
      const rounded = corners.map((c) =>
        cornerRoundedAtY(c, y) || cornerRoundedAtY(c, y - 1),
      );
      // Legs in walk order: NW→NE = +X, NE→SE = +Z, SE→SW = -X, SW→NW = -Z.
      const legDirs = [
        { dx: +1, dz:  0 },
        { dx:  0, dz: +1 },
        { dx: -1, dz:  0 },
        { dx:  0, dz: -1 },
      ];

      const shape = new THREE.Shape();
      // Start at exit of corner 0 (post-rounding along leg 0).
      const start = rounded[0]
        ? { x: corners[0].sx + r * legDirs[0].dx, z: corners[0].sz + r * legDirs[0].dz }
        : { x: corners[0].sx, z: corners[0].sz };
      shape.moveTo(start.x, start.z);

      for (let i = 0; i < 4; i++) {
        const next = (i + 1) % 4;
        const leg = legDirs[i];
        const nextLeg = legDirs[next];
        const ec = corners[next];
        // Entry of next corner (pre-rounding along this leg).
        const entry = rounded[next]
          ? { x: ec.sx - r * leg.dx, z: ec.sz - r * leg.dz }
          : { x: ec.sx, z: ec.sz };
        shape.lineTo(entry.x, entry.z);

        if (rounded[next]) {
          // Arc center = sharp corner + r*(−leg + nextLeg). E.g. NE sharp
          // (+T/2,−T/2), leg=+X, nextLeg=+Z → center (+T/2−r, −T/2+r).
          const acx = ec.sx + r * (-leg.dx + nextLeg.dx);
          const acz = ec.sz + r * (-leg.dz + nextLeg.dz);
          const exit = { x: ec.sx + r * nextLeg.dx, z: ec.sz + r * nextLeg.dz };
          const a0 = Math.atan2(entry.z - acz, entry.x - acx);
          const a1 = Math.atan2(exit.z - acz, exit.x - acx);
          let dA = a1 - a0;
          while (dA >  Math.PI) dA -= 2 * Math.PI;
          while (dA < -Math.PI) dA += 2 * Math.PI;
          shape.absarc(acx, acz, r, a0, a0 + dA, dA < 0);
        }
      }
      shape.closePath();

      const geo = new THREE.ExtrudeGeometry(shape, {
        depth: FLOOR_THICK,
        bevelEnabled: false,
        curveSegments: 16,
      });
      // Shape lives in its own XY plane; rotateX(+π/2) maps shape XY → world XZ
      // (matching the wall-arc pattern) and pushes the extrude to -Y, so we
      // translate up by FLOOR_THICK to place the slab bottom at baseY.
      geo.rotateX(Math.PI / 2);
      geo.translate(x * TILE, y * WALL_HEIGHT + FLOOR_THICK, z * TILE);

      const mesh = new THREE.Mesh(
        geo,
        new THREE.MeshStandardMaterial({ color: tint, roughness: 1 }),
      );
      mesh.castShadow = false;
      mesh.receiveShadow = true;
      mesh.userData.kind = 'floor';
      mesh.userData.key = key;
      refs.floorGroup.add(mesh);
    }
  }, [floors, walls, quality, cornerBend]);

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

        // Match the per-face baked shading used by makeBox (types.ts FACE_SHADE)
        // so bent corners don't visually "lose ambient" against neighboring walls.
        // ExtrudeGeometry has 2 material groups: 0 = caps (front+back of the
        // extrusion → after rotateX(π/2) these are the top+bottom faces),
        // 1 = side walls (the curved arc surface). Use top shade (1.0) for
        // caps and ~front shade (0.85, between front 0.90 and back 0.58) for
        // the visible curved surface.
        const tintC = new THREE.Color(tint);
        const segMesh = new THREE.Mesh(segGeo, [
          new THREE.MeshStandardMaterial({ color: tintC.clone().multiplyScalar(FACE_SHADE[2]), roughness: 1 }),
          new THREE.MeshStandardMaterial({ color: tintC.clone().multiplyScalar(0.85), roughness: 1 }),
        ]);
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
      // Per-face baked shading (matches makeBox in building-kit/types.ts) so
      // the trimmed bend-mode wall keeps the same "ambient" look as the
      // sharp-mode pieces — sides/back darker than front/top.
      const tintC = new THREE.Color(w.tint);
      const mats = FACE_SHADE.map((s) => new THREE.MeshStandardMaterial({
        color: tintC.clone().multiplyScalar(s),
        roughness: 1,
      }));
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(length, WALL_HEIGHT, WALL_THICK),
        mats,
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

  // Roofs — sharp-corner mode renders each tile via buildPiece (preserves
  // sloped gable/hip/dome/etc. geometry). Bend mode (cornerBend > 0) only
  // rewrites FLAT roofs (roof.flat_*, roofcnr.flat_cap) into stepped
  // ExtrudeGeometry decks whose perimeter corners match the wall fillets
  // below — same recipe the floors use. Sloped roofs still render via
  // buildPiece in bend mode because rounding their silhouette would
  // require per-kind geometry rewrites.
  useEffect(() => {
    const refs = sceneRef.current;
    if (!refs) return;
    disposeAndClear(refs.roofGroup);

    const placeViaBuild = (key: string) => {
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
    };

    if (cornerBend <= 0.001) {
      for (const key of Object.keys(roofs)) placeViaBuild(key);
      return;
    }

    const r = Math.min(cornerBend, TILE / 2);

    // Fillet-direction map — same construction as floors above, so the
    // roof corners line up pixel-for-pixel with the floor corners and
    // the wall arc bridges.
    type WInfo = { x: number; y: number; z: number; dir: EdgeDir };
    const wallList: WInfo[] = [];
    for (const key of Object.keys(walls)) {
      const edge = walls[key];
      if (edge.visible === false) continue;
      const [xs, ys, zs, dirRaw] = key.split(',') as [string, string, string, EdgeDir];
      wallList.push({ x: +xs, y: +ys, z: +zs, dir: dirRaw });
    }
    const endpointsOfW = (w: WInfo): [string, string] =>
      w.dir === 'N'
        ? [`${w.x},${w.y},${w.z}`, `${w.x + 1},${w.y},${w.z}`]
        : [`${w.x + 1},${w.y},${w.z}`, `${w.x + 1},${w.y},${w.z + 1}`];
    const dirAwayW = (w: WInfo, isFirst: boolean): { dx: number; dz: number } =>
      w.dir === 'N'
        ? { dx: isFirst ? 1 : -1, dz: 0 }
        : { dx: 0, dz: isFirst ? 1 : -1 };

    const vmap = new Map<string, { idx: number; first: boolean }[]>();
    for (let i = 0; i < wallList.length; i++) {
      const [a, b] = endpointsOfW(wallList[i]);
      let arrA = vmap.get(a); if (!arrA) { arrA = []; vmap.set(a, arrA); }
      arrA.push({ idx: i, first: true });
      let arrB = vmap.get(b); if (!arrB) { arrB = []; vmap.set(b, arrB); }
      arrB.push({ idx: i, first: false });
    }
    const filletDir = new Map<string, { dx: number; dz: number }>();
    for (const [vk, links] of vmap.entries()) {
      if (links.length !== 2) continue;
      const wA = wallList[links[0].idx];
      const wB = wallList[links[1].idx];
      if (wA.dir === wB.dir) continue;
      const dA = dirAwayW(wA, links[0].first);
      const dB = dirAwayW(wB, links[1].first);
      filletDir.set(vk, { dx: dA.dx + dB.dx, dz: dA.dz + dB.dz });
    }

    // A roof at level y sits on top of walls at level y (its base plane is
    // at y*WALL_HEIGHT + WALL_HEIGHT, which is exactly the top of a wall
    // at that level). So we only check junctions at y — unlike floors,
    // which straddle two levels and check both.
    for (const key of Object.keys(roofs)) {
      const cell = roofs[key];
      if (cell.visible === false) { placeViaBuild(key); continue; }

      const isFlat =
        cell.asset.startsWith('roof.flat_') || cell.asset === 'roofcnr.flat_cap';
      if (!isFlat) {
        // Sloped roofs are not rounded in bend mode — fall back to normal
        // piece render. Matches the "preserve sloped geometry" tradeoff.
        placeViaBuild(key);
        continue;
      }

      const [xs, ys, zs] = key.split(',');
      const x = +xs, y = +ys, z = +zs;
      const tint = cell.color ?? getPiece(cell.asset)?.swatch ?? '#ffffff';

      type CornerDef = { sx: number; sz: number; cx: number; cz: number; inDx: number; inDz: number };
      const corners: CornerDef[] = [
        { sx: -TILE / 2, sz: -TILE / 2, cx: x,     cz: z,     inDx: +1, inDz: +1 }, // NW
        { sx: +TILE / 2, sz: -TILE / 2, cx: x + 1, cz: z,     inDx: -1, inDz: +1 }, // NE
        { sx: +TILE / 2, sz: +TILE / 2, cx: x + 1, cz: z + 1, inDx: -1, inDz: -1 }, // SE
        { sx: -TILE / 2, sz: +TILE / 2, cx: x,     cz: z + 1, inDx: +1, inDz: -1 }, // SW
      ];
      const cornerRoundedAtY = (c: CornerDef, yy: number) => {
        const f = filletDir.get(`${c.cx},${yy},${c.cz}`);
        if (!f) return false;
        return Math.sign(f.dx) === c.inDx && Math.sign(f.dz) === c.inDz;
      };
      const rounded = corners.map((c) => cornerRoundedAtY(c, y));
      const legDirs = [
        { dx: +1, dz:  0 },
        { dx:  0, dz: +1 },
        { dx: -1, dz:  0 },
        { dx:  0, dz: -1 },
      ];

      // Rounded-rectangle shape builder — same structure as floors, walks
      // NW→NE→SE→SW→NW and inserts a quarter-arc where `rounded[i]` is set.
      const buildShape = (): THREE.Shape => {
        const shape = new THREE.Shape();
        const start = rounded[0]
          ? { x: corners[0].sx + r * legDirs[0].dx, z: corners[0].sz + r * legDirs[0].dz }
          : { x: corners[0].sx, z: corners[0].sz };
        shape.moveTo(start.x, start.z);
        for (let i = 0; i < 4; i++) {
          const next = (i + 1) % 4;
          const leg = legDirs[i];
          const nextLeg = legDirs[next];
          const ec = corners[next];
          const entry = rounded[next]
            ? { x: ec.sx - r * leg.dx, z: ec.sz - r * leg.dz }
            : { x: ec.sx, z: ec.sz };
          shape.lineTo(entry.x, entry.z);
          if (rounded[next]) {
            const acx = ec.sx + r * (-leg.dx + nextLeg.dx);
            const acz = ec.sz + r * (-leg.dz + nextLeg.dz);
            const exit = { x: ec.sx + r * nextLeg.dx, z: ec.sz + r * nextLeg.dz };
            const a0 = Math.atan2(entry.z - acz, entry.x - acx);
            const a1 = Math.atan2(exit.z - acz, exit.x - acx);
            let dA = a1 - a0;
            while (dA >  Math.PI) dA -= 2 * Math.PI;
            while (dA < -Math.PI) dA += 2 * Math.PI;
            shape.absarc(acx, acz, r, a0, a0 + dA, dA < 0);
          }
        }
        shape.closePath();
        return shape;
      };

      const shape = buildShape();
      // Single plate (no stepped bevel in bend mode) — same tradeoff as
      // floors losing their pattern when bent. User's priority here is
      // matching the wall radius; the stepped bevel returns when
      // cornerBend goes back to 0.
      const DECK_THICK = 0.25;
      const geo = new THREE.ExtrudeGeometry(shape, {
        depth: DECK_THICK,
        bevelEnabled: false,
        curveSegments: 16,
      });
      geo.rotateX(Math.PI / 2);
      const baseY = y * WALL_HEIGHT + WALL_HEIGHT;
      geo.translate(x * TILE, baseY + DECK_THICK, z * TILE);

      const mesh = new THREE.Mesh(
        geo,
        new THREE.MeshStandardMaterial({ color: tint, roughness: 1 }),
      );
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData.kind = 'roof';
      mesh.userData.key = key;
      refs.roofGroup.add(mesh);
    }
  }, [roofs, walls, quality, cornerBend]);

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

  // Drag-drop of GLB assets from the asset panel.
  // Handlers read `sceneRef.current` LIVE (not at effect-setup time) so that
  // HMR / quality-setting rebuilds of the scene don't leave the drop handler
  // pointing at a disposed renderer + camera.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const MIME = 'application/x-problocks-asset';

    function hasAssetType(dt: DataTransfer | null): boolean {
      if (!dt) return false;
      const types = dt.types;
      if (!types) return false;
      for (let i = 0; i < types.length; i++) {
        if (types[i] === MIME) return true;
      }
      return false;
    }

    function onDragOver(e: DragEvent) {
      if (!hasAssetType(e.dataTransfer)) return;
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    }
    function onDrop(e: DragEvent) {
      if (!e.dataTransfer) return;
      const modelName = e.dataTransfer.getData(MIME);
      if (!modelName) return;
      e.preventDefault();
      const refs = sceneRef.current;
      if (!refs) {
        console.warn('[drop] sceneRef not ready — asset drop ignored');
        return;
      }
      const rect = refs.renderer.domElement.getBoundingClientRect();
      refs.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      refs.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      refs.raycaster.setFromCamera(refs.pointer, refs.camera);
      // Prefer the invisible level-plane (always matches the active level
      // height, and is an infinite flat target) over the baseplate mesh so a
      // drop outside the 128×128 baseplate still lands somewhere sensible.
      let pt: THREE.Vector3 | null = null;
      const planeHits = refs.raycaster.intersectObject(refs.levelPlane);
      if (planeHits.length) pt = planeHits[0].point;
      else {
        const groundHits = refs.raycaster.intersectObject(refs.ground);
        if (groundHits.length) pt = groundHits[0].point;
      }
      if (!pt) {
        console.warn('[drop] raycast missed both levelPlane and ground');
        return;
      }
      useSceneStore.getState().addPart({
        name: modelName, partType: 'GLB', modelName,
        position: { x: pt.x, y: pt.y, z: pt.z }, scale: { x: 1, y: 1, z: 1 },
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
