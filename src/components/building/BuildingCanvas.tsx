'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { useBuildingStore, type EdgeDir } from '@/store/building-store';

const TILE = 2;
const WALL_HEIGHT = 3;
const WALL_THICK = 0.15;
const FLOOR_THICK = 0.1;

interface SceneRefs {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  ground: THREE.Mesh;
  ghost: THREE.Mesh;
  floorGroup: THREE.Group;
  wallGroup: THREE.Group;
  raycaster: THREE.Raycaster;
  pointer: THREE.Vector2;
  animId: number;
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

  // --- init scene once ---
  useEffect(() => {
    const container = containerRef.current;
    if (!container || sceneRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x14141a);

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
    const grid = new THREE.GridHelper(gridSpan, gridExtent * 2, 0x3a3a44, 0x26262e);
    (grid.material as THREE.Material).depthWrite = false;
    scene.add(grid);

    // Invisible ground plane for raycasting.
    const groundGeo = new THREE.PlaneGeometry(gridSpan * 2, gridSpan * 2);
    groundGeo.rotateX(-Math.PI / 2);
    const ground = new THREE.Mesh(
      groundGeo,
      new THREE.MeshBasicMaterial({ visible: false }),
    );
    scene.add(ground);

    // Backing plane receiving shadows so the scene has grounding.
    const shadowCatcher = new THREE.Mesh(
      new THREE.PlaneGeometry(gridSpan, gridSpan).rotateX(-Math.PI / 2),
      new THREE.ShadowMaterial({ opacity: 0.25 }),
    );
    shadowCatcher.receiveShadow = true;
    scene.add(shadowCatcher);

    const floorGroup = new THREE.Group();
    floorGroup.name = 'floors';
    scene.add(floorGroup);

    const wallGroup = new THREE.Group();
    wallGroup.name = 'walls';
    scene.add(wallGroup);

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

    function worldFromEvent(e: MouseEvent): { x: number; z: number } | null {
      const rect = canvas.getBoundingClientRect();
      refs!.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      refs!.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      refs!.raycaster.setFromCamera(refs!.pointer, refs!.camera);
      const hits = refs!.raycaster.intersectObject(refs!.ground);
      if (!hits.length) return null;
      return { x: hits[0].point.x, z: hits[0].point.z };
    }

    function updateGhost(world: { x: number; z: number }) {
      const ghost = refs!.ghost;
      ghost.visible = true;
      const mat = ghost.material as THREE.MeshBasicMaterial;
      ghost.geometry.dispose();

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
      const world = worldFromEvent(e);
      if (!world) return;
      const store = useBuildingStore.getState();

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

  return <div ref={containerRef} className="w-full h-full" />;
}
