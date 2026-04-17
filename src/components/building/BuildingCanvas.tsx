'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { useBuildingStore, type EdgeDir } from '@/store/building-store';
import { useSceneStore, type ScenePart, type PartType } from '@/store/scene-store';
import { useQualityStore } from '@/store/quality-store';
import { UnifiedGizmo3D } from './UnifiedGizmo3D';
import { createPlayController, type PlayController } from './play-mode';

const TILE = 2;
const WALL_HEIGHT = 3;
const WALL_THICK = 0.15;
const FLOOR_THICK = 0.1;
const PART_DEFAULT_SIZE = 2; // 2m box, matches tile size

interface SceneRefs {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  ground: THREE.Mesh;
  ghost: THREE.Mesh;
  floorGroup: THREE.Group;
  wallGroup: THREE.Group;
  /** Parent of all ScenePart meshes — child.userData.id links back to the store. */
  partGroup: THREE.Group;
  gizmo: UnifiedGizmo3D;
  raycaster: THREE.Raycaster;
  pointer: THREE.Vector2;
  animId: number;
}

/**
 * Build a surface material. Drops from PBR (MeshStandardMaterial) to
 * MeshLambertMaterial when the quality tier disables pbrMaterials —
 * Lambert is ~3× cheaper on integrated GPUs and visually similar for
 * opaque non-metal surfaces.
 */
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
      roughness,
      metalness,
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

/**
 * Build a scene-part geometry. Quality tier can reduce subdivision counts
 * (low-poly primitives) to cut per-mesh triangle load on integrated GPUs.
 */
function geometryForPart(type: PartType, lowPoly: boolean): THREE.BufferGeometry {
  const sphereW = lowPoly ? 12 : 24;
  const sphereH = lowPoly ? 8 : 16;
  const cylinderR = lowPoly ? 12 : 24;
  switch (type) {
    case 'Sphere':   return new THREE.SphereGeometry(0.5, sphereW, sphereH);
    case 'Cylinder': return new THREE.CylinderGeometry(0.5, 0.5, 1, cylinderR);
    case 'Wedge':    return new THREE.ConeGeometry(0.7, 1, 4); // approximation for first slice
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
    // horizontal edge (runs along X axis)
    if (dz < 0) return { x: tx, z: tz, dir: 'N' };
    return { x: tx, z: tz + 1, dir: 'N' };
  }
  // vertical edge (runs along Z axis)
  if (dx > 0) return { x: tx, z: tz, dir: 'E' };
  return { x: tx - 1, z: tz, dir: 'E' };
}

function wallPlacement(x: number, z: number, dir: EdgeDir) {
  if (dir === 'N') {
    return {
      pos: new THREE.Vector3(x * TILE, WALL_HEIGHT / 2, z * TILE - TILE / 2),
      size: new THREE.Vector3(TILE, WALL_HEIGHT, WALL_THICK),
    };
  }
  return {
    pos: new THREE.Vector3(x * TILE + TILE / 2, WALL_HEIGHT / 2, z * TILE),
    size: new THREE.Vector3(WALL_THICK, WALL_HEIGHT, TILE),
  };
}

export function BuildingCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<SceneRefs | null>(null);
  const playRef = useRef<PlayController | null>(null);

  const tool = useBuildingStore((s) => s.tool);
  const floors = useBuildingStore((s) => s.floors);
  const walls = useBuildingStore((s) => s.walls);
  const buildingSelection = useBuildingStore((s) => s.selection);
  const parts = useSceneStore((s) => s.sceneObjects);
  const selectedPartId = useSceneStore((s) => s.selectedPart?.id ?? null);
  const quality = useQualityStore((s) => s.settings);
  const isPlaying = useSceneStore((s) => s.isPlaying);

  // Start/stop the play-mode character controller whenever the user toggles
  // the Play button. Effect runs after sceneRef/playRef are populated by the
  // init effect below, so the first toggle post-mount is safe.
  useEffect(() => {
    const ctrl = playRef.current;
    if (!ctrl) return;
    if (isPlaying) ctrl.start();
    else ctrl.stop();
  }, [isPlaying]);

  // --- init scene (re-runs when the quality tier changes so we can rebuild
  //     the renderer with a different antialias/pixelRatio/shadow config) ---
  useEffect(() => {
    const container = containerRef.current;
    if (!container || sceneRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x9ed7ff); // Roblox-style bright sky blue

    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.1,
      500,
    );
    camera.position.set(18, 22, 24);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: quality.antialias });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, quality.maxPixelRatio));
    renderer.shadowMap.enabled = quality.shadows;
    renderer.shadowMap.type =
      quality.shadowType === 'pcf-soft' ? THREE.PCFSoftShadowMap : THREE.BasicShadowMap;
    // Roblox-style bright, saturated output: sRGB display space + slight
    // over-exposure with no filmic curve so colors stay punchy and don't
    // get crushed into darks.
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.toneMappingExposure = 1.25;
    // Block browser gestures (back/forward swipe, pinch-zoom the page) so
    // the canvas owns every wheel/trackpad event.
    renderer.domElement.style.touchAction = 'none';
    renderer.domElement.style.overscrollBehavior = 'none';
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    // Left button reserved for placement. Right = rotate, middle = pan.
    controls.mouseButtons = {
      LEFT: -1 as unknown as THREE.MOUSE,
      MIDDLE: THREE.MOUSE.PAN,
      RIGHT: THREE.MOUSE.ROTATE,
    };
    // We override wheel behavior below so OrbitControls' own dolly is
    // disabled — otherwise every gesture would fight with zoom.
    controls.enableZoom = false;
    controls.target.set(0, 0, 0);
    controls.update();

    // --- Trackpad gestures on the canvas ---
    // Two-finger swipe                  → orbit
    // Click-hold + two-finger swipe     → pan (any mouse button held)
    // Pinch (ctrl/meta + wheel)         → zoom
    // Also works with a mouse wheel: wheel orbits, click+wheel pans,
    // ctrl-wheel zooms — matches the same mental model.
    const ORBIT_SPEED = 0.005;
    const PAN_SPEED = 0.0015;
    const ZOOM_SPEED = 0.01;
    const MIN_PHI = 0.02;
    const MAX_PHI = Math.PI - 0.02;

    const tmpOffset = new THREE.Vector3();
    const tmpSpherical = new THREE.Spherical();
    const tmpRight = new THREE.Vector3();
    const tmpUp = new THREE.Vector3();
    const tmpMove = new THREE.Vector3();

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const dx = e.deltaX;
      const dy = e.deltaY;

      // Pinch-to-zoom (trackpad synthesizes ctrlKey) or explicit ctrl/meta + wheel.
      if (e.ctrlKey || e.metaKey) {
        tmpOffset.copy(camera.position).sub(controls.target);
        const scale = Math.exp(dy * ZOOM_SPEED);
        tmpOffset.multiplyScalar(scale);
        // Clamp so you can't zoom inside-out.
        const len = tmpOffset.length();
        if (len > 0.5 && len < 400) {
          camera.position.copy(controls.target).add(tmpOffset);
        }
        return;
      }

      // Mouse/trackpad click held during swipe → pan. Scale pan by distance so
      // the world moves a consistent amount under the cursor regardless of
      // zoom level. `e.buttons` is a bitmask of currently-held buttons, so
      // any held button (including a trackpad click) triggers panning.
      if (e.buttons !== 0) {
        tmpRight.setFromMatrixColumn(camera.matrix, 0);   // camera-local X
        tmpUp.setFromMatrixColumn(camera.matrix, 1);      // camera-local Y
        const distance = camera.position.distanceTo(controls.target);
        tmpMove
          .set(0, 0, 0)
          .addScaledVector(tmpRight,  dx * PAN_SPEED * distance)
          .addScaledVector(tmpUp,    -dy * PAN_SPEED * distance);
        camera.position.add(tmpMove);
        controls.target.add(tmpMove);
        return;
      }

      // Default: orbit around the target.
      tmpOffset.copy(camera.position).sub(controls.target);
      tmpSpherical.setFromVector3(tmpOffset);
      tmpSpherical.theta += dx * ORBIT_SPEED;
      tmpSpherical.phi   += dy * ORBIT_SPEED;
      tmpSpherical.phi = Math.max(MIN_PHI, Math.min(MAX_PHI, tmpSpherical.phi));
      tmpOffset.setFromSpherical(tmpSpherical);
      camera.position.copy(controls.target).add(tmpOffset);
    }

    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });

    // Roblox-style lighting: very bright hemisphere fill so shadows stay
    // milky rather than black, plus a softer warm sun so the scene reads
    // as playful/unreal. Shadows intentionally de-emphasized.
    scene.add(new THREE.HemisphereLight(0xffffff, 0xb9e08a, 1.4));
    scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    const sun = new THREE.DirectionalLight(0xfff2d0, 1.1);
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

    // Default baseplate — doubles as the raycast surface. Roblox-style
    // bright green grass so the workspace reads immediately as a world.
    const baseSize = 128;
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(baseSize, baseSize).rotateX(-Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0x9bc940, roughness: 0.6, metalness: 0 }),
    );
    ground.position.y = 0;
    ground.receiveShadow = quality.shadows;
    ground.name = 'baseplate';
    scene.add(ground);

    // Build-area grid sits slightly above the baseplate to avoid z-fight.
    const grid = new THREE.GridHelper(gridSpan, gridExtent * 2, 0x5a9e2d, 0xbde676);
    grid.position.y = 0.01;
    (grid.material as THREE.Material).depthWrite = false;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.6;
    scene.add(grid);

    const floorGroup = new THREE.Group();
    floorGroup.name = 'floors';
    scene.add(floorGroup);

    const wallGroup = new THREE.Group();
    wallGroup.name = 'walls';
    scene.add(wallGroup);

    const partGroup = new THREE.Group();
    partGroup.name = 'parts';
    scene.add(partGroup);

    const ghost = new THREE.Mesh(
      new THREE.BoxGeometry(TILE, FLOOR_THICK, TILE),
      new THREE.MeshBasicMaterial({
        color: 0x4ade80,
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
      }),
    );
    ghost.visible = false;
    scene.add(ghost);

    // Selection gizmo — attach/detach handled by the selection effect below.
    // onCommit reads the live mesh transform and writes it back to the store.
    let gizmo!: UnifiedGizmo3D;
    gizmo = new UnifiedGizmo3D({
      camera,
      renderer,
      controls,
      onCommit: () => {
        const target = gizmo.getTarget();
        if (!target) return;
        const xform = {
          position: { x: target.position.x, y: target.position.y, z: target.position.z },
          rotation: { x: target.rotation.x, y: target.rotation.y, z: target.rotation.z },
          scale: { x: target.scale.x, y: target.scale.y, z: target.scale.z },
        };
        const kind = target.userData.kind as 'part' | 'floor' | 'wall' | undefined;
        if (kind === 'floor') {
          const key = target.userData.key as string;
          useBuildingStore.getState().updateFloorTransform(key, xform);
          return;
        }
        if (kind === 'wall') {
          const key = target.userData.key as string;
          useBuildingStore.getState().updateWallTransform(key, xform);
          return;
        }
        const id = target.userData.id as string | undefined;
        if (!id) return;
        useSceneStore.getState().updateSceneObject(id, xform);
      },
    });
    scene.add(gizmo.group);

    const refs: SceneRefs = {
      scene,
      camera,
      renderer,
      controls,
      ground,
      ghost,
      floorGroup,
      wallGroup,
      partGroup,
      gizmo,
      raycaster: new THREE.Raycaster(),
      pointer: new THREE.Vector2(),
      animId: 0,
    };
    sceneRef.current = refs;

    playRef.current = createPlayController({
      scene, camera, renderer, controls, partGroup, floorGroup, wallGroup,
    });
    // If Play was toggled on before the canvas mounted, pick it up immediately.
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
      if (playRef.current) {
        playRef.current.stop();
        playRef.current = null;
      }
      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animId);
        sceneRef.current.gizmo.dispose();
        sceneRef.current.renderer.dispose();
        const canvas = sceneRef.current.renderer.domElement;
        canvas.parentNode?.removeChild(canvas);
        sceneRef.current = null;
      }
    };
    // Re-init when the quality tier flips so the renderer picks up the new
    // antialias/pixelRatio/shadowType values (those can't be toggled live).
  }, [quality]);

  // --- pointer handlers (rebind when tool changes) ---
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
      const hits = refs!.raycaster.intersectObject(refs!.ground);
      if (!hits.length) return null;
      return { x: hits[0].point.x, z: hits[0].point.z };
    }

    /** Returns the top-level part mesh under the cursor (with userData.id), if any. */
    function partHitFromEvent(e: MouseEvent): THREE.Mesh | null {
      setPointerFromEvent(e);
      const hits = refs!.raycaster.intersectObjects(refs!.partGroup.children, true);
      if (!hits.length) return null;
      // Walk up to the group/mesh that carries userData.id (GLB hits are deep).
      let obj: THREE.Object3D | null = hits[0].object;
      while (obj && !obj.userData.id) obj = obj.parent;
      return (obj as THREE.Mesh) ?? null;
    }

    /** Returns a floor or wall mesh (top-level group child) under the cursor. */
    function buildingHitFromEvent(e: MouseEvent): THREE.Mesh | null {
      setPointerFromEvent(e);
      const hits = refs!.raycaster.intersectObjects(
        [...refs!.floorGroup.children, ...refs!.wallGroup.children],
        false,
      );
      return hits.length ? (hits[0].object as THREE.Mesh) : null;
    }

    function updateGhost(world: { x: number; z: number }) {
      const ghost = refs!.ghost;
      const mat = ghost.material as THREE.MeshBasicMaterial;

      if (tool === 'select') {
        ghost.visible = false;
        return;
      }

      ghost.visible = true;
      ghost.geometry.dispose();

      if (tool === 'part') {
        ghost.geometry = new THREE.BoxGeometry(PART_DEFAULT_SIZE, PART_DEFAULT_SIZE, PART_DEFAULT_SIZE);
        ghost.position.set(world.x, PART_DEFAULT_SIZE / 2, world.z);
        mat.color.setHex(0x4ade80);
        return;
      }

      if (tool === 'wall') {
        const e = edgeFromWorld(world.x, world.z);
        const { pos, size } = wallPlacement(e.x, e.z, e.dir);
        ghost.geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
        ghost.position.copy(pos);
        mat.color.setHex(0x4ade80);
        return;
      }

      const tx = Math.round(world.x / TILE);
      const tz = Math.round(world.z / TILE);
      if (tool === 'eraser') {
        // preview whichever element is closer — edge if near edge, tile otherwise
        const dx = world.x - tx * TILE;
        const dz = world.z - tz * TILE;
        const nearEdge = Math.max(Math.abs(dx), Math.abs(dz)) > TILE * 0.35;
        if (nearEdge) {
          const e = edgeFromWorld(world.x, world.z);
          const { pos, size } = wallPlacement(e.x, e.z, e.dir);
          ghost.geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
          ghost.position.copy(pos);
        } else {
          ghost.geometry = new THREE.BoxGeometry(TILE * 0.98, FLOOR_THICK, TILE * 0.98);
          ghost.position.set(tx * TILE, FLOOR_THICK / 2, tz * TILE);
        }
        mat.color.setHex(0xef4444);
        return;
      }

      // floor
      ghost.geometry = new THREE.BoxGeometry(TILE * 0.98, FLOOR_THICK, TILE * 0.98);
      ghost.position.set(tx * TILE, FLOOR_THICK / 2, tz * TILE);
      mat.color.setHex(0x4ade80);
    }

    function onMove(e: MouseEvent) {
      // No hover/ghost logic while play-mode is running — the user is
      // controlling the character and orbiting the camera, not placing parts.
      if (useSceneStore.getState().isPlaying) {
        refs!.ghost.visible = false;
        return;
      }
      // Let the gizmo update its hover highlight first. If it's actively
      // dragging we still want the orbit/ghost code below to stay quiet —
      // it already does because OrbitControls is disabled during drag.
      setPointerFromEvent(e);
      refs!.gizmo.updateHover(refs!.pointer);
      if (refs!.gizmo.isDragging()) {
        refs!.ghost.visible = false;
        return;
      }

      const world = worldFromEvent(e);
      if (!world) {
        refs!.ghost.visible = false;
        return;
      }
      updateGhost(world);
    }

    function onDown(e: MouseEvent) {
      if (e.button !== 0) return;
      // Block every editor click while play-mode is running so students
      // don't place parts on the ground when they meant to move around.
      if (useSceneStore.getState().isPlaying) return;

      // 0) Gizmo handle takes priority — if the user clicked a translate /
      //    rotate / scale handle, start that drag and stop here.
      setPointerFromEvent(e);
      if (refs!.gizmo.tryPointerDown(refs!.pointer)) return;

      // 1) Click on an existing part always selects it — regardless of tool.
      //    (The only exceptions are 'eraser' which removes it, and 'part'
      //    which should still spawn a new one nearby.)
      const hitPart = partHitFromEvent(e);
      const sceneStore = useSceneStore.getState();
      const bStore = useBuildingStore.getState();
      if (hitPart && tool !== 'part') {
        const id = hitPart.userData.id as string | undefined;
        if (id) {
          if (tool === 'eraser') {
            sceneStore.removePart(id);
          } else {
            const part = sceneStore.sceneObjects.find((p) => p.id === id) ?? null;
            sceneStore.setSelectedPart(part);
            bStore.setSelection(null);
          }
          return;
        }
      }

      // 1b) Select tool: click a floor/wall mesh → select for gizmo.
      if (tool === 'select') {
        const hitBuilding = buildingHitFromEvent(e);
        if (hitBuilding) {
          const kind = hitBuilding.userData.kind as 'floor' | 'wall' | undefined;
          const key = hitBuilding.userData.key as string | undefined;
          if (kind && key) {
            bStore.setSelection({ kind, key });
            sceneStore.setSelectedPart(null);
            return;
          }
        }
      }

      const world = worldFromEvent(e);
      if (!world) {
        // Clicking empty sky → deselect.
        if (tool === 'select') {
          sceneStore.setSelectedPart(null);
          bStore.setSelection(null);
        }
        return;
      }
      const store = bStore;

      if (tool === 'select') {
        sceneStore.setSelectedPart(null);
        bStore.setSelection(null);
        return;
      }

      if (tool === 'part') {
        sceneStore.addPart({
          partType: 'Block',
          position: { x: world.x, y: PART_DEFAULT_SIZE / 2, z: world.z },
          scale: { x: PART_DEFAULT_SIZE, y: PART_DEFAULT_SIZE, z: PART_DEFAULT_SIZE },
          color: '#a1a1aa',
        });
        return;
      }

      if (tool === 'floor') {
        const tx = Math.round(world.x / TILE);
        const tz = Math.round(world.z / TILE);
        store.placeFloor(tx, tz);
        return;
      }
      if (tool === 'wall') {
        const edge = edgeFromWorld(world.x, world.z);
        store.placeWall(edge.x, edge.z, edge.dir);
        return;
      }
      if (tool === 'eraser') {
        const tx = Math.round(world.x / TILE);
        const tz = Math.round(world.z / TILE);
        const dx = world.x - tx * TILE;
        const dz = world.z - tz * TILE;
        const nearEdge = Math.max(Math.abs(dx), Math.abs(dz)) > TILE * 0.35;
        if (nearEdge) {
          const edge = edgeFromWorld(world.x, world.z);
          store.eraseWall(edge.x, edge.z, edge.dir);
        } else {
          store.eraseFloor(tx, tz);
        }
      }
    }

    function onLeave() {
      refs!.ghost.visible = false;
    }

    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mousedown', onDown);
    canvas.addEventListener('mouseleave', onLeave);
    return () => {
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mousedown', onDown);
      canvas.removeEventListener('mouseleave', onLeave);
    };
  }, [tool]);

  // --- rebuild floor meshes when data changes ---
  useEffect(() => {
    const refs = sceneRef.current;
    if (!refs) return;
    const group = refs.floorGroup;
    while (group.children.length) {
      const c = group.children[0] as THREE.Mesh;
      c.geometry.dispose();
      (c.material as THREE.Material).dispose();
      group.remove(c);
    }
    for (const key of Object.keys(floors)) {
      const cell = floors[key];
      const [xs, zs] = key.split(',');
      const x = parseInt(xs, 10);
      const z = parseInt(zs, 10);
      const material = makeSurfaceMaterial({
        color: cell.color ?? '#f0a93a',
        roughness: cell.roughness ?? 0.35,
        metalness: cell.metalness ?? 0,
        emissive: cell.emissiveColor ?? '#000000',
        emissiveIntensity: cell.emissiveIntensity ?? 0,
        pbr: quality.pbrMaterials,
      });
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(TILE, FLOOR_THICK, TILE),
        material,
      );
      const p = cell.position ?? { x: x * TILE, y: FLOOR_THICK / 2, z: z * TILE };
      mesh.position.set(p.x, p.y, p.z);
      if (cell.rotation) mesh.rotation.set(cell.rotation.x, cell.rotation.y, cell.rotation.z);
      if (cell.scale) mesh.scale.set(cell.scale.x, cell.scale.y, cell.scale.z);
      mesh.receiveShadow = quality.shadows;
      mesh.castShadow = quality.shadows && (cell.castShadow ?? true);
      mesh.visible = cell.visible ?? true;
      mesh.userData.kind = 'floor';
      mesh.userData.key = key;
      group.add(mesh);
    }
  }, [floors, quality]);

  // --- rebuild wall meshes when data changes ---
  useEffect(() => {
    const refs = sceneRef.current;
    if (!refs) return;
    const group = refs.wallGroup;
    while (group.children.length) {
      const c = group.children[0] as THREE.Mesh;
      c.geometry.dispose();
      (c.material as THREE.Material).dispose();
      group.remove(c);
    }
    for (const key of Object.keys(walls)) {
      const edge = walls[key];
      const [xs, zs, dir] = key.split(',') as [string, string, EdgeDir];
      const x = parseInt(xs, 10);
      const z = parseInt(zs, 10);
      const { pos, size } = wallPlacement(x, z, dir);
      const material = makeSurfaceMaterial({
        color: edge.color ?? '#ed2b2b',
        roughness: edge.roughness ?? 0.3,
        metalness: edge.metalness ?? 0,
        emissive: edge.emissiveColor ?? '#000000',
        emissiveIntensity: edge.emissiveIntensity ?? 0,
        pbr: quality.pbrMaterials,
      });
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(size.x, size.y, size.z),
        material,
      );
      if (edge.position) mesh.position.set(edge.position.x, edge.position.y, edge.position.z);
      else mesh.position.copy(pos);
      if (edge.rotation) mesh.rotation.set(edge.rotation.x, edge.rotation.y, edge.rotation.z);
      if (edge.scale) mesh.scale.set(edge.scale.x, edge.scale.y, edge.scale.z);
      mesh.castShadow = quality.shadows && (edge.castShadow ?? true);
      mesh.visible = edge.visible ?? true;
      mesh.receiveShadow = quality.shadows;
      mesh.userData.kind = 'wall';
      mesh.userData.key = key;
      group.add(mesh);
    }
  }, [walls, quality]);

  // --- rebuild part meshes when scene parts change ---
  useEffect(() => {
    const refs = sceneRef.current;
    if (!refs) return;
    const group = refs.partGroup;
    while (group.children.length) {
      const c = group.children[0] as THREE.Object3D;
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
    const loader = new GLTFLoader();
    for (const p of parts) {
      if (p.partType === 'GLB' && p.modelName) {
        // Stand-in placeholder while the GLB streams in.
        const placeholder = new THREE.Group();
        placeholder.position.set(p.position.x, p.position.y, p.position.z);
        placeholder.rotation.set(p.rotation.x, p.rotation.y, p.rotation.z);
        placeholder.scale.set(p.scale.x, p.scale.y, p.scale.z);
        placeholder.visible = p.visible;
        placeholder.userData.id = p.id;
        placeholder.userData.kind = 'part';
        group.add(placeholder);

        loader.load(
          `/assets/medieval/${p.modelName}.gltf`,
          (gltf) => {
            // If the group was torn down, drop the result.
            if (!placeholder.parent) return;
            gltf.scene.traverse((o) => {
              if ((o as THREE.Mesh).isMesh) {
                (o as THREE.Mesh).castShadow = quality.shadows && p.castShadow;
                (o as THREE.Mesh).receiveShadow = quality.shadows;
              }
            });
            placeholder.add(gltf.scene);
          },
          undefined,
          () => {
            // Fallback: show a tinted box so the user at least sees something.
            const box = new THREE.Mesh(
              new THREE.BoxGeometry(1, 1, 1),
              new THREE.MeshStandardMaterial({ color: 0xff6b6b }),
            );
            placeholder.add(box);
          },
        );
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
      group.add(mesh);
    }
  }, [parts, quality]);

  // --- selection highlight: emissive glow on the selected part mesh ---
  //     Also re-attaches the gizmo. This effect depends on `parts` so after
  //     the meshes are rebuilt (on commit) the gizmo picks up the fresh mesh.
  useEffect(() => {
    const refs = sceneRef.current;
    // Guard against HMR / StrictMode mid-cleanup states where refs may be
    // present but individual fields (gizmo, partGroup) are missing or
    // disposed. The init effect will re-populate and re-run this effect.
    if (!refs || !refs.gizmo || !refs.partGroup) return;

    let selectedObj: THREE.Object3D | null = null;

    // Parts: highlight any Mesh child with an emissive tint.
    for (const child of refs.partGroup.children) {
      const isSelected = child.userData.id === selectedPartId;
      if (isSelected) selectedObj = child;
      // Only a direct Mesh (primitive) has a tintable material.
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh && mesh.material) {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat.emissive) {
          mat.emissive.setHex(isSelected ? 0x4ade80 : 0x000000);
          mat.emissiveIntensity = isSelected ? 0.35 : 0;
        }
      }
    }

    // Floors + walls: highlight the selected building mesh.
    const buildingGroups = [refs.floorGroup, refs.wallGroup];
    for (const g of buildingGroups) {
      for (const child of g.children) {
        const mesh = child as THREE.Mesh;
        const isSelected =
          !!buildingSelection &&
          mesh.userData.kind === buildingSelection.kind &&
          mesh.userData.key === buildingSelection.key;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat?.emissive) {
          mat.emissive.setHex(isSelected ? 0x4ade80 : 0x000000);
          mat.emissiveIntensity = isSelected ? 0.35 : 0;
        }
        if (isSelected) selectedObj = mesh;
      }
    }

    if (selectedObj) refs.gizmo.attach(selectedObj);
    else refs.gizmo.detach();
  }, [selectedPartId, parts, buildingSelection, floors, walls]);

  // --- drag-drop of assets from the left panel ---
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
        name: modelName,
        partType: 'GLB',
        modelName,
        position: { x: pt.x, y: 0, z: pt.z },
        scale: { x: 1, y: 1, z: 1 },
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
