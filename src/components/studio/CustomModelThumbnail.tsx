'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import type { PartModel } from '@/lib/part-studio/types';
import { buildPartGroup, disposePartGroup } from '@/lib/part-studio/renderer';

// Shared renderer pool — mirrors PiecePreview's pattern so a grid of 20+
// custom-model cards reuses one WebGL context instead of spawning one per
// card (which would OOM on low-end Chromebooks the project targets).

let sharedRenderer: THREE.WebGLRenderer | null = null;
let sharedScene: THREE.Scene | null = null;
let sharedCamera: THREE.PerspectiveCamera | null = null;

function getShared(size: number) {
  if (!sharedRenderer) {
    const canvas = document.createElement('canvas');
    sharedRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    sharedRenderer.outputColorSpace = THREE.SRGBColorSpace;
    sharedScene = new THREE.Scene();
    sharedScene.add(new THREE.HemisphereLight(0xbfd4ff, 0x3a2f20, 0.85));
    const dl = new THREE.DirectionalLight(0xffffff, 0.9);
    dl.position.set(3, 5, 3);
    sharedScene.add(dl);
    sharedCamera = new THREE.PerspectiveCamera(38, 1, 0.05, 50);
  }
  sharedRenderer.setSize(size, size);
  sharedRenderer.setPixelRatio(2);
  return { renderer: sharedRenderer, scene: sharedScene!, camera: sharedCamera! };
}

const queue: Array<() => Promise<void>> = [];
let processing = false;
function enqueue(fn: () => Promise<void>) {
  queue.push(fn);
  if (!processing) {
    processing = true;
    (async () => {
      while (queue.length) {
        const t = queue.shift()!;
        await t();
      }
      processing = false;
    })();
  }
}

interface CustomModelThumbnailProps {
  model: PartModel;
  size?: number;
  fluid?: boolean;
}

export function CustomModelThumbnail({
  model,
  size = 80,
  fluid = false,
}: CustomModelThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [measuredSize, setMeasuredSize] = useState(size);
  const renderedRef = useRef(false);

  const effectiveSize = fluid ? measuredSize : size;

  const render = useCallback(() => {
    if (renderedRef.current || !canvasRef.current) return;
    renderedRef.current = true;

    enqueue(async () => {
      const { renderer, scene, camera } = getShared(effectiveSize);
      const group = buildPartGroup(model);
      scene.add(group);

      const box = new THREE.Box3().setFromObject(group);
      const center = box.getCenter(new THREE.Vector3());
      const bSize = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(bSize.x, bSize.y, bSize.z, 0.5);
      const dist = maxDim * 2.1;
      camera.position.set(
        center.x + dist * 0.6,
        center.y + dist * 0.5,
        center.z + dist * 0.6,
      );
      camera.lookAt(center);

      renderer.render(scene, camera);

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(renderer.domElement, 0, 0, canvas.width, canvas.height);
        }
      }

      scene.remove(group);
      disposePartGroup(group);
      setLoaded(true);
    });
  }, [model, effectiveSize]);

  // Lazy render when scrolled into view
  useEffect(() => {
    const el = containerRef.current;
    if (!el || renderedRef.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          render();
          io.disconnect();
        }
      },
      { rootMargin: '100px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [render]);

  // Fluid-size responsiveness
  useEffect(() => {
    if (!fluid) return;
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = Math.floor(entry.contentRect.width);
      if (w > 0) setMeasuredSize((prev) => (Math.abs(prev - w) > 1 ? w : prev));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [fluid]);

  useEffect(() => {
    if (!fluid || !loaded) return;
    renderedRef.current = false;
    render();
  }, [fluid, effectiveSize, loaded, render]);

  const wrap = fluid
    ? { width: '100%', height: '100%' as const }
    : { width: size, height: size };

  return (
    <div ref={containerRef} style={wrap}>
      <canvas
        ref={canvasRef}
        width={effectiveSize * 2}
        height={effectiveSize * 2}
        className={`rounded bg-zinc-900 ${loaded ? '' : 'animate-pulse'}`}
        style={wrap}
      />
    </div>
  );
}
