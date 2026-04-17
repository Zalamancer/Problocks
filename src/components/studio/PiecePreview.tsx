'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { buildPiece } from '@/lib/building-kit';

// ── Shared renderer (created once, reused across all previews) ────────────
let sharedRenderer: THREE.WebGLRenderer | null = null;
let sharedScene: THREE.Scene | null = null;
let sharedCamera: THREE.PerspectiveCamera | null = null;

function getSharedRenderer(size: number) {
  if (!sharedRenderer) {
    const canvas = document.createElement('canvas');
    sharedRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    sharedRenderer.outputColorSpace = THREE.SRGBColorSpace;

    sharedScene = new THREE.Scene();
    sharedScene.add(new THREE.HemisphereLight(0x87ceeb, 0x4a6a3a, 0.8));
    sharedScene.add(new THREE.AmbientLight(0x606080, 0.4));
    const dl = new THREE.DirectionalLight(0xffeedd, 0.8);
    dl.position.set(3, 5, 3);
    sharedScene.add(dl);

    sharedCamera = new THREE.PerspectiveCamera(40, 1, 0.01, 50);
  }

  sharedRenderer.setSize(size, size);
  sharedRenderer.setPixelRatio(2);

  return { renderer: sharedRenderer, scene: sharedScene!, camera: sharedCamera! };
}

// ── Render queue to serialize thumbnail renders ───────────────────────────
const renderQueue: Array<() => Promise<void>> = [];
let isProcessing = false;

function enqueueRender(fn: () => Promise<void>) {
  renderQueue.push(fn);
  processQueue();
}

async function processQueue() {
  if (isProcessing) return;
  isProcessing = true;
  while (renderQueue.length > 0) {
    const task = renderQueue.shift()!;
    await task();
  }
  isProcessing = false;
}

// ── Component ─────────────────────────────────────────────────────────────

interface PiecePreviewProps {
  pieceId: string;
  size?: number;
  fluid?: boolean;
}

/**
 * Procedural thumbnail for a building-kit piece. Mirrors AssetThumbnail's
 * shared-renderer + queue + IntersectionObserver pool so previewing 50+
 * pieces stays cheap: one WebGL context, one scene, one camera; each card
 * just blits pixels into its own 2D canvas.
 */
export function PiecePreview({ pieceId, size = 80, fluid = false }: PiecePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [measuredSize, setMeasuredSize] = useState(size);
  const renderedRef = useRef(false);

  const effectiveSize = fluid ? measuredSize : size;

  const renderThumbnail = useCallback(() => {
    if (renderedRef.current || !canvasRef.current) return;
    renderedRef.current = true;

    enqueueRender(async () => {
      try {
        const { renderer, scene, camera } = getSharedRenderer(effectiveSize);

        const group = buildPiece(pieceId, THREE);
        scene.add(group);

        // Auto-fit camera
        const box = new THREE.Box3().setFromObject(group);
        const center = box.getCenter(new THREE.Vector3());
        const bSize = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(bSize.x, bSize.y, bSize.z);
        const dist = maxDim * 1.8;

        camera.position.set(
          center.x + dist * 0.6,
          center.y + dist * 0.4,
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

        // Clean up: remove group + dispose geos/mats so subsequent renders
        // don't leak (procedural builders allocate fresh geometry every call).
        scene.remove(group);
        group.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
          const mat = mesh.material;
          if (mat) {
            if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
            else (mat as THREE.Material).dispose();
          }
        });

        setLoaded(true);
      } catch {
        setError(true);
      }
    });
  }, [pieceId, effectiveSize]);

  // IntersectionObserver: only render when visible
  useEffect(() => {
    const container = containerRef.current;
    if (!container || renderedRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          renderThumbnail();
          observer.disconnect();
        }
      },
      { rootMargin: '100px' },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [renderThumbnail]);

  // ResizeObserver for fluid mode
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

  // Re-render when fluid size changes
  useEffect(() => {
    if (!fluid || !loaded) return;
    renderedRef.current = false;
    renderThumbnail();
  }, [fluid, effectiveSize, loaded, renderThumbnail]);

  const wrapperStyle = fluid
    ? { width: '100%', height: '100%' }
    : { width: size, height: size };
  const canvasStyle = fluid
    ? { width: '100%', height: '100%' }
    : { width: size, height: size };

  return (
    <div ref={containerRef} style={wrapperStyle}>
      {error ? (
        <div
          className="rounded bg-zinc-800 flex items-center justify-center text-zinc-600 text-[10px]"
          style={wrapperStyle}
        >
          ?
        </div>
      ) : (
        <canvas
          ref={canvasRef}
          width={effectiveSize * 2}
          height={effectiveSize * 2}
          className={`rounded bg-zinc-900 ${loaded ? '' : 'animate-pulse'}`}
          style={canvasStyle}
        />
      )}
    </div>
  );
}
