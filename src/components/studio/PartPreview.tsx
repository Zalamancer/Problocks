'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { PartModel } from '@/lib/part-studio/types';
import { buildPartGroup, disposePartGroup } from '@/lib/part-studio/renderer';

interface PartPreviewProps {
  /** Null renders an empty scene with a skybox-like gradient. */
  model: PartModel | null;
  /** Rotate auto-orbit on idle. */
  autoRotate?: boolean;
  /** Background (hex) behind the model. */
  background?: string;
}

/**
 * Full-viewport interactive 3D preview for a PartModel.
 *
 * Drag to orbit (horizontal = yaw, vertical = pitch), scroll to zoom.
 * No OrbitControls dependency — the camera math is trivial and keeping
 * it inline means no extra import cost for a 100-vert scene.
 */
export function PartPreview({
  model,
  autoRotate = true,
  background = '#0a0a0a',
}: PartPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(background);

    // Lighting: hemisphere for natural fill, directional for shape reads.
    scene.add(new THREE.HemisphereLight(0xbfd4ff, 0x3a2f20, 0.75));
    const dl = new THREE.DirectionalLight(0xffffff, 1.0);
    dl.position.set(4, 6, 3);
    scene.add(dl);

    // Ground plane — subtle grid so low-poly assets read as 3D, not floating
    // pixel art. Sits at y=0 so primitives placed with pos.y=0 land on it.
    const grid = new THREE.GridHelper(10, 10, 0x333333, 0x1a1a1a);
    grid.position.y = 0;
    scene.add(grid);

    const camera = new THREE.PerspectiveCamera(
      42,
      el.clientWidth / Math.max(el.clientHeight, 1),
      0.05,
      100,
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    el.appendChild(renderer.domElement);

    // Orbit state (spherical coords around target).
    const target = new THREE.Vector3(0, 1, 0);
    let yaw = Math.PI * 0.25;
    let pitch = Math.PI * 0.25;
    let dist = 4;

    function placeCamera() {
      const cp = Math.cos(pitch);
      camera.position.set(
        target.x + dist * Math.cos(yaw) * cp,
        target.y + dist * Math.sin(pitch),
        target.z + dist * Math.sin(yaw) * cp,
      );
      camera.lookAt(target);
    }

    // Build initial group
    let currentGroup: THREE.Group | null = null;
    function setModel(m: PartModel | null) {
      if (currentGroup) {
        scene.remove(currentGroup);
        disposePartGroup(currentGroup);
        currentGroup = null;
      }
      if (!m) return;
      const g = buildPartGroup(m);
      // Auto-center: shift so the bounding box sits at y>=0 and xz centered.
      const box = new THREE.Box3().setFromObject(g);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      g.position.x -= center.x;
      g.position.z -= center.z;
      g.position.y -= box.min.y; // put feet on the grid
      scene.add(g);
      currentGroup = g;

      // Auto-fit zoom — fit largest dimension in frustum with some padding.
      const maxDim = Math.max(size.x, size.y, size.z, 0.5);
      dist = maxDim * 2.4;
      target.set(0, size.y / 2, 0);
    }
    setModel(model);
    placeCamera();

    // Mouse interaction
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    function onDown(e: MouseEvent) {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    }
    function onMove(e: MouseEvent) {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      yaw -= dx * 0.008;
      pitch = Math.max(-Math.PI * 0.49, Math.min(Math.PI * 0.49, pitch + dy * 0.008));
      placeCamera();
    }
    function onUp() {
      dragging = false;
    }
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const factor = Math.exp(e.deltaY * 0.0015);
      dist = Math.max(1.2, Math.min(20, dist * factor));
      placeCamera();
    }
    renderer.domElement.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });

    // Resize observer
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      const h = Math.max(el.clientHeight, 1);
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    ro.observe(el);

    // Animation loop
    let raf = 0;
    const clock = new THREE.Clock();
    function tick() {
      const dt = clock.getDelta();
      if (autoRotate && !dragging) {
        yaw += dt * 0.35;
        placeCamera();
      }
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    }
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      renderer.domElement.removeEventListener('wheel', onWheel);
      if (currentGroup) disposePartGroup(currentGroup);
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
    // We intentionally rebuild the whole scene on model/background change
    // — for a 100-vert scene it's ~1ms and avoids stale-closure bugs.
  }, [model, autoRotate, background]);

  return <div ref={containerRef} className="w-full h-full" />;
}
