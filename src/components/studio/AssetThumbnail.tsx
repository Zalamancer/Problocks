'use client';
import { useEffect, useRef, useState, useCallback } from 'react';

// ── Shared renderer (created once, reused across all thumbnails) ──────────
let sharedRenderer: any = null;
let sharedScene: any = null;
let sharedCamera: any = null;
let threeJsLoading: Promise<void> | null = null;
let threeJsLoaded = false;

function loadThreeJs(): Promise<void> {
  if (threeJsLoaded) return Promise.resolve();
  if (threeJsLoading) return threeJsLoading;

  threeJsLoading = new Promise<void>((resolve, reject) => {
    if ((window as any).THREE?.GLTFLoader) {
      threeJsLoaded = true;
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = () => {
      const script2 = document.createElement('script');
      script2.src =
        'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js';
      script2.onload = () => {
        threeJsLoaded = true;
        resolve();
      };
      script2.onerror = reject;
      document.head.appendChild(script2);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return threeJsLoading;
}

function getSharedRenderer(size: number) {
  const THREE = (window as any).THREE;
  if (!THREE) return null;

  if (!sharedRenderer) {
    const canvas = document.createElement('canvas');
    sharedRenderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    sharedRenderer.outputEncoding = THREE.sRGBEncoding;

    sharedScene = new THREE.Scene();
    sharedScene.add(new THREE.HemisphereLight(0x87ceeb, 0x4a6a3a, 0.8));
    sharedScene.add(new THREE.AmbientLight(0x606080, 0.4));
    const dl = new THREE.DirectionalLight(0xffeedd, 0.8);
    dl.position.set(3, 5, 3);
    sharedScene.add(dl);

    sharedCamera = new THREE.PerspectiveCamera(40, 1, 0.01, 50);
  }

  // Resize shared renderer to match the requested thumbnail size
  sharedRenderer.setSize(size, size);
  sharedRenderer.setPixelRatio(2);

  return { renderer: sharedRenderer, scene: sharedScene, camera: sharedCamera };
}

// ── Render queue to serialize thumbnail renders ───────────────────────────
let renderQueue: Array<() => Promise<void>> = [];
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

interface AssetThumbnailProps {
  modelName: string;
  size?: number;
}

export function AssetThumbnail({ modelName, size = 80 }: AssetThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const renderedRef = useRef(false);

  const renderThumbnail = useCallback(() => {
    if (renderedRef.current || !canvasRef.current) return;
    renderedRef.current = true;

    enqueueRender(async () => {
      try {
        await loadThreeJs();

        const shared = getSharedRenderer(size);
        if (!shared) {
          setError(true);
          return;
        }

        const THREE = (window as any).THREE;
        const { renderer, scene, camera } = shared;

        await new Promise<void>((resolve, reject) => {
          const loader = new THREE.GLTFLoader();
          loader.load(
            '/assets/medieval/' + modelName + '.gltf',
            (gltf: any) => {
              const model = gltf.scene;
              scene.add(model);

              // Auto-fit camera to model bounds
              const box = new THREE.Box3().setFromObject(model);
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

              // Render to shared canvas
              renderer.render(scene, camera);

              // Copy pixels to our canvas
              const canvas = canvasRef.current;
              if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.clearRect(0, 0, canvas.width, canvas.height);
                  ctx.drawImage(renderer.domElement, 0, 0, canvas.width, canvas.height);
                }
              }

              // Clean up: remove model from shared scene
              scene.remove(model);
              model.traverse?.((child: any) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                  if (Array.isArray(child.material)) {
                    child.material.forEach((m: any) => m.dispose());
                  } else {
                    child.material.dispose();
                  }
                }
              });

              setLoaded(true);
              resolve();
            },
            undefined,
            () => {
              setError(true);
              reject(new Error('Failed to load model'));
            },
          );
        });
      } catch {
        setError(true);
      }
    });
  }, [modelName, size]);

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

  return (
    <div ref={containerRef} style={{ width: size, height: size }}>
      {error ? (
        <div
          className="rounded bg-zinc-800 flex items-center justify-center text-zinc-600 text-[10px]"
          style={{ width: size, height: size }}
        >
          ?
        </div>
      ) : (
        <canvas
          ref={canvasRef}
          width={size * 2}
          height={size * 2}
          className={`rounded bg-zinc-900 ${loaded ? '' : 'animate-pulse'}`}
          style={{ width: size, height: size }}
        />
      )}
    </div>
  );
}
