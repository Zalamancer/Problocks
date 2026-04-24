'use client';

/**
 * Offscreen thumbnail renderer for kid-style prefabs. One WebGLRenderer
 * is created on first use and reused across every tile so the page
 * doesn't spawn 18 WebGL contexts (browsers cap around 16 and silently
 * drop additional ones).
 *
 * Pipeline:
 *   tile mounts → cache hit?  yes → <img src=dataURL />
 *                 cache miss → enqueue a render → on done, setState → <img>
 *   The queue serializes renders because the single renderer can only
 *   draw one scene at a time. Each finished render is toDataURL'd and
 *   cached by `kind` so remounts are instant.
 *
 * Separate from the existing `AssetThumbnail` because that one uses
 * CDN-loaded THREE (window.THREE r128) for GLB models, while prefabs
 * are produced by `buildPrefab(kind)` against the npm `three` package
 * — the two THREE namespaces are not interchangeable (objects created
 * with one throw when added to a scene from the other).
 */

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { buildPrefab } from '@/lib/kid-style-3d/prefabs';
import { collectStats, type SceneStats } from '@/lib/kid-style-3d';

// ── Shared renderer + scene (npm three) ──────────────────────────────

let sharedRenderer: THREE.WebGLRenderer | null = null;
let sharedScene: THREE.Scene | null = null;
let sharedCamera: THREE.PerspectiveCamera | null = null;
let sharedCanvas: HTMLCanvasElement | null = null;

function ensureShared(size: number): {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  canvas: HTMLCanvasElement;
} | null {
  if (typeof window === 'undefined') return null;

  if (!sharedRenderer) {
    sharedCanvas = document.createElement('canvas');
    sharedRenderer = new THREE.WebGLRenderer({
      canvas: sharedCanvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,  // required for toDataURL after render
    });
    sharedRenderer.outputColorSpace = THREE.SRGBColorSpace;
    sharedRenderer.setClearColor(0x000000, 0);

    sharedScene = new THREE.Scene();
    // Lighting matches engine.ts so thumbnails read identically to the
    // live viewport.
    const hemi = new THREE.HemisphereLight(0xfffbe8, 0xb0d0a0, 0.7);
    sharedScene.add(hemi);
    const key = new THREE.DirectionalLight(0xfff4d0, 1.3);
    key.position.set(3, 5, 3);
    sharedScene.add(key);
    const fill = new THREE.DirectionalLight(0xb8d8ff, 0.4);
    fill.position.set(-3, 3, -2);
    sharedScene.add(fill);

    sharedCamera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  }

  sharedRenderer.setSize(size, size, false);
  sharedRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  return {
    renderer: sharedRenderer,
    scene: sharedScene!,
    camera: sharedCamera!,
    canvas: sharedCanvas!,
  };
}

// ── Render queue (serializes the single renderer) ─────────────────────

const queue: Array<() => Promise<void>> = [];
let processing = false;

async function processQueue(): Promise<void> {
  if (processing) return;
  processing = true;
  while (queue.length > 0) {
    const task = queue.shift()!;
    try {
      await task();
    } catch (err) {
      console.warn('[PrefabThumbnail] render failed', err);
    }
  }
  processing = false;
}

function enqueue(task: () => Promise<void>): void {
  queue.push(task);
  void processQueue();
}

// ── Cache: kind → dataURL + stats ─────────────────────────────────────

const cache = new Map<string, string>();
const pending = new Map<string, Promise<string>>();
const statsCache = new Map<string, SceneStats>();

/** Bumped whenever the cache is invalidated. Mounted tiles subscribe to
    this (via the custom event + a local version counter) and re-fetch
    their dataURL so the UI reflects the new geometry immediately. */
const CACHE_INVALIDATED_EVENT = 'prefab-thumbnail-cache-invalidated';

/** Clear every dataURL + stats entry. Used when the freeform3d store
    flips performance mode — thumbnails need to re-render against the
    newly-configured geometry. Safe to call from any module; no-op on
    the server. */
export function clearPrefabThumbnailCache(): void {
  cache.clear();
  statsCache.clear();
  // Pending promises resolve into the cleared cache and get overwritten
  // on the next read — no explicit cancellation needed.
  pending.clear();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CACHE_INVALIDATED_EVENT));
  }
}

/** Synchronous getter — returns null if the prefab hasn't rendered yet.
    Callers that care about "definitely has stats" should subscribe to
    the PrefabThumbnail render (which writes both caches together). */
export function getPrefabStats(kind: string): SceneStats | null {
  return statsCache.get(kind) ?? null;
}

/** Warm the cache for a list of kinds without having to mount a
    <PrefabThumbnail/> for each. Used by the Assets panel so sort-by-tris
    and tris-range filters can operate on a complete data set instead of
    "whatever has rendered so far". Returns a Promise that settles once
    every kind has been rendered at least once. */
export function ensurePrefabStats(kinds: string[]): Promise<void> {
  return Promise.all(
    kinds.map((k) => {
      if (statsCache.has(k)) return Promise.resolve();
      return renderPrefab(k, 160).then(() => void 0).catch(() => void 0);
    }),
  ).then(() => void 0);
}

function renderPrefab(kind: string, size: number): Promise<string> {
  const cached = cache.get(kind);
  if (cached) return Promise.resolve(cached);
  const inFlight = pending.get(kind);
  if (inFlight) return inFlight;

  const p = new Promise<string>((resolve, reject) => {
    enqueue(async () => {
      const shared = ensureShared(size);
      if (!shared) {
        reject(new Error('no window'));
        return;
      }
      const { renderer, scene, camera, canvas } = shared;

      let obj: THREE.Object3D | null = null;
      try {
        obj = buildPrefab(kind);
      } catch (err) {
        reject(err);
        return;
      }
      scene.add(obj);

      // Auto-frame: compute bounding box of the prefab, position the
      // camera at a 3/4 angle so it sits in-frame with a small margin.
      const box = new THREE.Box3().setFromObject(obj);
      const center = box.getCenter(new THREE.Vector3());
      const sphere = box.getBoundingSphere(new THREE.Sphere());
      const fovRad = (camera.fov * Math.PI) / 180;
      const dist = (sphere.radius / Math.sin(fovRad / 2)) * 1.25;
      const dir = new THREE.Vector3(1, 0.85, 1.15).normalize();
      camera.position.copy(center).add(dir.multiplyScalar(dist));
      camera.lookAt(center);
      camera.updateProjectionMatrix();

      renderer.render(scene, camera);
      const dataURL = canvas.toDataURL('image/png');

      // Capture stats BEFORE disposal — once geometries are disposed
      // collectStats will see 0 vertices. Mirrors what the viewport's
      // FreeformView3D does after hydrating the scene.
      statsCache.set(kind, collectStats(obj));

      scene.remove(obj);
      obj.traverse((n) => {
        const mesh = n as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = mesh.material as
          | THREE.Material
          | THREE.Material[]
          | undefined;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else if (mat) mat.dispose();
      });

      cache.set(kind, dataURL);
      pending.delete(kind);
      resolve(dataURL);
    });
  });

  pending.set(kind, p);
  return p;
}

// ── Component ────────────────────────────────────────────────────────

export interface PrefabThumbnailProps {
  kind: string;
  /** Pixel size of the render target. Defaults to 160 — CSS downscales
      nicely and the cost is a one-time 160×160 render per kind. */
  size?: number;
  /** Fills the container; useful inside the 1:1 grid cells. */
  fluid?: boolean;
}

export function PrefabThumbnail({ kind, size = 160, fluid = false }: PrefabThumbnailProps) {
  const [src, setSrc] = useState<string | null>(() => cache.get(kind) ?? null);
  const [invalidationTick, setInvalidationTick] = useState(0);
  const mounted = useRef(true);

  // Cache invalidation (perf-mode flip): reset src to null so the next
  // effect pass kicks off a fresh render against the new geometry.
  useEffect(() => {
    function onInvalidate() {
      setSrc(null);
      setInvalidationTick((t) => t + 1);
    }
    window.addEventListener(CACHE_INVALIDATED_EVENT, onInvalidate);
    return () => window.removeEventListener(CACHE_INVALIDATED_EVENT, onInvalidate);
  }, []);

  useEffect(() => {
    mounted.current = true;
    // Fast path — already cached.
    const hit = cache.get(kind);
    if (hit) {
      setSrc(hit);
      return () => { mounted.current = false; };
    }
    setSrc(null);
    renderPrefab(kind, size).then(
      (url) => {
        if (mounted.current) setSrc(url);
      },
      (err) => {
        console.warn('[PrefabThumbnail]', kind, err);
      },
    );
    return () => { mounted.current = false; };
  }, [kind, size, invalidationTick]);

  if (!src) {
    return (
      <div
        className={fluid ? 'w-full h-full' : ''}
        style={{
          width: fluid ? undefined : size,
          height: fluid ? undefined : size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: 999,
            background: 'var(--pb-ink-muted)',
            opacity: 0.35,
          }}
        />
      </div>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt={kind}
      className={fluid ? 'w-full h-full' : ''}
      style={{
        width: fluid ? '100%' : size,
        height: fluid ? '100%' : size,
        objectFit: 'contain',
        display: 'block',
      }}
      draggable={false}
    />
  );
}
