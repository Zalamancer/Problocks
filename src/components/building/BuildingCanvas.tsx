'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { useBuildingStore, type EdgeDir } from '@/store/building-store';
import { useSceneStore, type ScenePart, type PartType } from '@/store/scene-store';

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
  raycaster: THREE.Raycaster;
  pointer: THREE.Vector2;
  animId: number;
}

/** Build geometry for a scene part. Scale is applied on the mesh afterwards. */
function geometryForPart(type: PartType): THREE.BufferGeometry {
  switch (type) {
    case 'Sphere':   return new THREE.SphereGeometry(0.5, 24, 16);
    case 'Cylinder': return new THREE.CylinderGeometry(0.5, 0.5, 1, 24);
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

  const tool = useBuildingStore((s) => s.tool);
  const floors = useBuildingStore((s) => s.floors);
  const walls = useBuildingStore((s) => s.walls);
  const parts = useSceneStore((s) => s.sceneObjects);
  const selectedPartId = useSceneStore((s) => s.selectedPart?.id ?? null);

  // --- init scene once ---
  useEffect(() => {
    const container = containerRef.current;
    if (!container || sceneRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87c3ed); // Roblox-style sky blue

    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.1,
      500,
    );
    camera.position.set(18, 22, 24);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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
    controls.target.set(0, 0, 0);
    controls.update();

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const sun = new THREE.DirectionalLight(0xffffff, 1.0);
    sun.position.set(10, 18, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
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
      new THREE.MeshStandardMaterial({ color: 0x6aaa4d, roughness: 1 }),
    );
    ground.position.y = 0;
    ground.receiveShadow = true;
    ground.name = 'baseplate';
    scene.add(ground);

    // Build-area grid sits slightly above the baseplate to avoid z-fight.
    const grid = new THREE.GridHelper(gridSpan, gridExtent * 2, 0x2f5a22, 0x558c3d);
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
      raycaster: new THREE.Raycaster(),
      pointer: new THREE.Vector2(),
      animId: 0,
    };
    sceneRef.current = refs;

    function animate() {
      if (!sceneRef.current) return;
      sceneRef.current.animId = requestAnimationFrame(animate);
      sceneRef.current.controls.update();
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
      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animId);
        sceneRef.current.renderer.dispose();
        const canvas = sceneRef.current.renderer.domElement;
        canvas.parentNode?.removeChild(canvas);
        sceneRef.current = null;
      }
    };
  }, []);

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
      const hits = refs!.raycaster.intersectObjects(refs!.partGroup.children, false);
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
      const world = worldFromEvent(e);
      if (!world) {
        refs!.ghost.visible = false;
        return;
      }
      updateGhost(world);
    }

    function onDown(e: MouseEvent) {
      if (e.button !== 0) return;

      // 1) Click on an existing part always selects it — regardless of tool.
      //    (The only exceptions are 'eraser' which removes it, and 'part'
      //    which should still spawn a new one nearby.)
      const hitPart = partHitFromEvent(e);
      const sceneStore = useSceneStore.getState();
      if (hitPart && tool !== 'part') {
        const id = hitPart.userData.id as string | undefined;
        if (id) {
          if (tool === 'eraser') {
            sceneStore.removePart(id);
          } else {
            const part = sceneStore.sceneObjects.find((p) => p.id === id) ?? null;
            sceneStore.setSelectedPart(part);
          }
          return;
        }
      }

      const world = worldFromEvent(e);
      if (!world) {
        // Clicking empty sky → deselect.
        if (tool === 'select') sceneStore.setSelectedPart(null);
        return;
      }
      const store = useBuildingStore.getState();

      if (tool === 'select') {
        sceneStore.setSelectedPart(null);
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
    const mat = new THREE.MeshStandardMaterial({ color: 0x8b6f4a, roughness: 0.9 });
    for (const key of Object.keys(floors)) {
      const [xs, zs] = key.split(',');
      const x = parseInt(xs, 10);
      const z = parseInt(zs, 10);
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(TILE, FLOOR_THICK, TILE),
        mat.clone(),
      );
      mesh.position.set(x * TILE, FLOOR_THICK / 2, z * TILE);
      mesh.receiveShadow = true;
      mesh.castShadow = true;
      group.add(mesh);
    }
  }, [floors]);

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
    const mat = new THREE.MeshStandardMaterial({ color: 0xc8b392, roughness: 0.8 });
    for (const key of Object.keys(walls)) {
      const [xs, zs, dir] = key.split(',') as [string, string, EdgeDir];
      const x = parseInt(xs, 10);
      const z = parseInt(zs, 10);
      const { pos, size } = wallPlacement(x, z, dir);
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(size.x, size.y, size.z),
        mat.clone(),
      );
      mesh.position.copy(pos);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
    }
  }, [walls]);

  // --- rebuild part meshes when scene parts change ---
  useEffect(() => {
    const refs = sceneRef.current;
    if (!refs) return;
    const group = refs.partGroup;
    while (group.children.length) {
      const c = group.children[0] as THREE.Mesh;
      c.geometry.dispose();
      (c.material as THREE.Material).dispose();
      group.remove(c);
    }
    for (const p of parts) {
      const mesh = new THREE.Mesh(
        geometryForPart(p.partType),
        new THREE.MeshStandardMaterial({
          color: p.color,
          roughness: p.roughness,
          metalness: p.metalness,
          emissive: new THREE.Color(p.emissiveColor),
          emissiveIntensity: p.emissiveIntensity,
        }),
      );
      mesh.position.set(p.position.x, p.position.y, p.position.z);
      mesh.rotation.set(p.rotation.x, p.rotation.y, p.rotation.z);
      mesh.scale.set(p.scale.x, p.scale.y, p.scale.z);
      mesh.castShadow = p.castShadow;
      mesh.receiveShadow = true;
      mesh.visible = p.visible;
      mesh.userData.id = p.id;
      group.add(mesh);
    }
  }, [parts]);

  // --- selection highlight: emissive glow on the selected part mesh ---
  useEffect(() => {
    const refs = sceneRef.current;
    if (!refs) return;
    for (const child of refs.partGroup.children) {
      const mesh = child as THREE.Mesh;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      const isSelected = mesh.userData.id === selectedPartId;
      mat.emissive.setHex(isSelected ? 0x4ade80 : 0x000000);
      mat.emissiveIntensity = isSelected ? 0.35 : 0;
    }
  }, [selectedPartId, parts]);

  return <div ref={containerRef} className="w-full h-full" />;
}
