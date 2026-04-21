'use client';

// Interactive 3D drop target. Renders a white-bg scene with a grid floor
// and OrbitControls. Drags from PartCard (or any source using the same
// dataTransfer keys) are raycast against the floor; the hovered grid
// cell shows a ghost preview, and drop places a colored 1×1 brick there.
//
// dataTransfer contract (matches PartCard):
//   application/x-problocks-part  → partNum as string
//   application/x-problocks-color → '#RRGGBB' or 'RRGGBB'
//
// Kept self-contained (no external state) so the board can be reused in
// other surfaces later. Clicking a placed brick removes it.

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const GRID_HALF = 12; // board spans -12..+12 in x/z (24×24 cells)

function normalizeHex(raw: string | undefined, fallback = '#8aa0ff'): number {
  if (!raw) return new THREE.Color(fallback).getHex();
  const s = raw.startsWith('#') ? raw : '#' + raw;
  try { return new THREE.Color(s).getHex(); } catch { return new THREE.Color(fallback).getHex(); }
}

export function BricksBoard() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ----- scene / camera / renderer -----
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    const camera = new THREE.PerspectiveCamera(
      42,
      Math.max(container.clientWidth, 1) / Math.max(container.clientHeight, 1),
      0.1,
      200,
    );
    camera.position.set(10, 12, 14);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // ----- lights -----
    scene.add(new THREE.HemisphereLight(0xffffff, 0xdfe5ec, 0.95));
    const key = new THREE.DirectionalLight(0xfff4de, 0.85);
    key.position.set(6, 10, 4);
    scene.add(key);

    // ----- floor + grid -----
    const grid = new THREE.GridHelper(GRID_HALF * 2, GRID_HALF * 2, 0xbfc3cc, 0xe6e8ee);
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.95;
    scene.add(grid);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(GRID_HALF * 2, GRID_HALF * 2),
      new THREE.MeshBasicMaterial({ visible: false }),
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // ----- ghost preview (visible during dragover) -----
    const ghostMat = new THREE.MeshStandardMaterial({
      color: 0x8aa0ff, transparent: true, opacity: 0.45, roughness: 0.6,
    });
    const ghost = new THREE.Mesh(new THREE.BoxGeometry(1, 0.5, 1), ghostMat);
    ghost.visible = false;
    scene.add(ghost);

    // Container for placed bricks so click-to-remove only targets them.
    const placed = new THREE.Group();
    scene.add(placed);

    // ----- controls -----
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 0.5, 0);
    controls.maxPolarAngle = Math.PI / 2.05; // don't go below floor
    controls.minDistance = 4;
    controls.maxDistance = 40;

    // ----- raycast helpers -----
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const pointerFromClient = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x =  ((clientX - rect.left) / rect.width ) * 2 - 1;
      pointer.y = -((clientY - rect.top ) / rect.height) * 2 + 1;
    };

    const pickFloorCell = (clientX: number, clientY: number): { gx: number; gz: number } | null => {
      pointerFromClient(clientX, clientY);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObject(floor)[0];
      if (!hit) return null;
      const gx = Math.round(hit.point.x);
      const gz = Math.round(hit.point.z);
      if (Math.abs(gx) > GRID_HALF || Math.abs(gz) > GRID_HALF) return null;
      return { gx, gz };
    };

    // ----- drag/drop -----
    const onDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
      const cell = pickFloorCell(e.clientX, e.clientY);
      if (!cell) { ghost.visible = false; return; }
      ghost.visible = true;
      ghost.position.set(cell.gx, 0.25, cell.gz);
    };
    const onDragLeave = () => { ghost.visible = false; };
    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      ghost.visible = false;
      const cell = pickFloorCell(e.clientX, e.clientY);
      if (!cell) return;
      const colorHex = normalizeHex(e.dataTransfer?.getData('application/x-problocks-color') || undefined);
      const brick = new THREE.Mesh(
        new THREE.BoxGeometry(1, 0.5, 1),
        new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.45, metalness: 0.02 }),
      );
      brick.position.set(cell.gx, 0.25, cell.gz);
      placed.add(brick);
    };

    container.addEventListener('dragover',  onDragOver);
    container.addEventListener('dragleave', onDragLeave);
    container.addEventListener('drop',      onDrop);

    // ----- click-to-remove on placed bricks -----
    const onClick = (e: MouseEvent) => {
      pointerFromClient(e.clientX, e.clientY);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(placed.children)[0];
      if (!hit) return;
      placed.remove(hit.object);
      const mesh = hit.object as THREE.Mesh;
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    };
    renderer.domElement.addEventListener('click', onClick);

    // ----- render loop + resize -----
    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const ro = new ResizeObserver(() => {
      const w = Math.max(container.clientWidth, 1);
      const h = Math.max(container.clientHeight, 1);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    ro.observe(container);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      container.removeEventListener('dragover',  onDragOver);
      container.removeEventListener('dragleave', onDragLeave);
      container.removeEventListener('drop',      onDrop);
      renderer.domElement.removeEventListener('click', onClick);
      container.removeChild(renderer.domElement);
      // Dispose geometries/materials in the scene.
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else if (mat) mat.dispose();
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', background: '#ffffff', overflow: 'hidden' }}
    />
  );
}
