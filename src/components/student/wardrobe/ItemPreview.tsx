// Wardrobe tile previews. Real 3D render of the item's build() output,
// using ONE shared WebGLRenderer for the whole grid — we draw the shared
// WebGL canvas's pixels into each tile's 2D <canvas> via drawImage, so
// there's a single WebGL context total (well under Chrome's 16-context
// cap) and Celeron N4000 Chromebooks stay playable. IntersectionObserver
// gates the render so off-screen tiles cost nothing until scrolled into
// view. Face items have no 3D mesh (they're painted on the avatar head
// texture) so they fall back to a small SVG face glyph.
'use client';

import * as THREE from 'three';
import React, { useEffect, useRef, useState } from 'react';
import type { Item } from './types';

// ── Shared renderer (one WebGL context for the whole grid) ──────────────
const RENDER_SIZE = 160;     // offscreen buffer size — crisp at ~128px tiles
const KRAFT_TAN = '#c9a173'; // default skin passed to builders

type Shared = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
};
let shared: Shared | null = null;

function ensureShared(): Shared | null {
  if (shared) return shared;
  if (typeof window === 'undefined') return null;
  try {
    const canvas = document.createElement('canvas');
    const renderer = new THREE.WebGLRenderer({
      canvas, antialias: true, alpha: true, preserveDrawingBuffer: false,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setSize(RENDER_SIZE, RENDER_SIZE, false);
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));

    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xfff4d6, 0x6a5a3a, 0.85));
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(3, 5, 4);
    scene.add(dir);
    scene.add(new THREE.AmbientLight(0xffffff, 0.35));

    const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 100);

    shared = { renderer, scene, camera };
    return shared;
  } catch {
    return null;
  }
}

// Serial render queue so the shared canvas isn't stomped mid-draw.
const queue: Array<() => void> = [];
let pumping = false;
function enqueue(fn: () => void) {
  queue.push(fn);
  if (!pumping) pump();
}
function pump() {
  pumping = true;
  const next = queue.shift();
  if (!next) { pumping = false; return; }
  try { next(); } catch {}
  // Yield between renders so long queues don't stall input.
  requestAnimationFrame(pump);
}

// Dispose everything a build() created so we don't leak GPU memory.
function disposeObject(obj: THREE.Object3D) {
  obj.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const mat = (mesh as unknown as { material?: THREE.Material | THREE.Material[] }).material;
    if (mat) {
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else mat.dispose();
    }
  });
}

// ── Component ──────────────────────────────────────────────────────────
export function ItemPreview({ item }: { item: Item }) {
  // Face items aren't 3D meshes — builders return an empty group. Render
  // a small stylised face glyph instead so tiles aren't blank.
  if (item.category === 'face') return <FaceGlyph id={item.id}/>;
  return <ThreePreview item={item}/>;
}

function ThreePreview({ item }: { item: Item }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const doneRef = useRef(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    doneRef.current = false;
    const el = canvasRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || doneRef.current) return;
        doneRef.current = true;
        io.disconnect();
        enqueue(() => renderItemToCanvas(item, el, () => setFailed(true)));
      },
      { rootMargin: '160px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [item.id]);

  if (failed) return <FaceGlyph id="face-neutral"/>;

  return (
    <canvas
      ref={canvasRef}
      width={RENDER_SIZE}
      height={RENDER_SIZE}
      style={{ width: '100%', height: '100%', display: 'block', imageRendering: 'auto' }}
    />
  );
}

function renderItemToCanvas(
  item: Item,
  target: HTMLCanvasElement,
  onFail: () => void,
) {
  const s = ensureShared();
  if (!s) { onFail(); return; }
  const { renderer, scene, camera } = s;

  let obj: THREE.Object3D | null = null;
  try {
    obj = item.build(THREE, { skin: KRAFT_TAN });
  } catch {
    onFail();
    return;
  }
  if (!obj) { onFail(); return; }

  scene.add(obj);
  obj.updateMatrixWorld(true);

  // Auto-fit camera around the item's bounding box. Three-quarter view
  // from front-right-above so hats/shirts/pets all read at a glance.
  const box = new THREE.Box3().setFromObject(obj);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);

  if (!Number.isFinite(maxDim) || maxDim <= 0) {
    // Empty group (e.g. *-none items). Bail — leave the tile blank with
    // its rarity gradient as the only visual.
    scene.remove(obj);
    disposeObject(obj);
    return;
  }

  const fov = (camera.fov * Math.PI) / 180;
  const dist = (maxDim / 2) / Math.tan(fov / 2) * 1.7;
  camera.position.set(
    center.x + dist * 0.55,
    center.y + dist * 0.35,
    center.z + dist * 0.85,
  );
  camera.lookAt(center);
  camera.near = Math.max(0.01, dist / 100);
  camera.far = dist * 10;
  camera.updateProjectionMatrix();

  // Transparent background so the tile's rarity tint shows through.
  renderer.setClearColor(0x000000, 0);
  renderer.clear();
  renderer.render(scene, camera);

  // Copy WebGL pixels to the tile's 2D canvas. Must happen before the
  // next render into the shared canvas (the queue enforces that).
  const ctx = target.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, target.width, target.height);
    ctx.drawImage(renderer.domElement, 0, 0, target.width, target.height);
  }

  scene.remove(obj);
  disposeObject(obj);
}

// ── Face glyph fallback (faces are painted on the avatar head, not 3D) ──
const FACE_INK = '#1d1a14';
const FACE_SKIN = '#f0c68c';
const FS = {
  stroke: FACE_INK,
  strokeWidth: 2.4,
  strokeLinejoin: 'round' as const,
  strokeLinecap: 'round' as const,
};

function FaceGlyph({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 80 80" width="100%" height="100%" style={{ display: 'block' }} aria-hidden>
      <circle cx="40" cy="40" r="26" fill={FACE_SKIN} {...FS}/>
      <FaceFeatures id={id}/>
    </svg>
  );
}

function FaceFeatures({ id }: { id: string }) {
  const eyes = id === 'face-cool' ? (
    <rect x="22" y="34" width="36" height="7" rx="2" fill={FACE_INK}/>
  ) : id === 'face-wink' ? (
    <g>
      <circle cx="31" cy="36" r="2.6" fill={FACE_INK}/>
      <path d="M45 36 L55 36" {...FS} fill="none"/>
    </g>
  ) : id === 'face-love' ? (
    <g>
      <path d="M27 34 Q31 30 31 34 Q31 30 35 34 Q35 40 31 42 Q27 40 27 34 Z" fill="#c24949"/>
      <path d="M45 34 Q49 30 49 34 Q49 30 53 34 Q53 40 49 42 Q45 40 45 34 Z" fill="#c24949"/>
    </g>
  ) : id === 'face-stars' ? (
    <g>
      <text x="27" y="40" fontSize="11" fill="#ffd84d">★</text>
      <text x="45" y="40" fontSize="11" fill="#ffd84d">★</text>
    </g>
  ) : id === 'face-angry' ? (
    <g>
      <path d="M26 32 L34 36 M46 36 L54 32" {...FS} fill="none"/>
      <circle cx="31" cy="38" r="2.4" fill={FACE_INK}/>
      <circle cx="49" cy="38" r="2.4" fill={FACE_INK}/>
    </g>
  ) : (
    <g>
      <circle cx="31" cy="36" r="2.6" fill={FACE_INK}/>
      <circle cx="49" cy="36" r="2.6" fill={FACE_INK}/>
    </g>
  );
  const mouth = id === 'face-tongue' ? (
    <g>
      <path d="M32 48 L48 48" {...FS} fill="none"/>
      <path d="M40 48 Q45 58 40 54" fill="#c24949" {...FS}/>
    </g>
  ) : id === 'face-angry' ? (
    <path d="M30 52 Q40 46 50 52" fill="none" {...FS}/>
  ) : id === 'face-happy' || id === 'face-love' || id === 'face-stars' ? (
    <path d="M28 46 Q40 60 52 46 Z" fill={FACE_INK}/>
  ) : id === 'face-neutral' ? (
    <path d="M32 50 L48 50" {...FS} fill="none"/>
  ) : (
    <path d="M30 48 Q40 56 50 48" fill="none" {...FS}/>
  );
  return (<>{eyes}{mouth}</>);
}
