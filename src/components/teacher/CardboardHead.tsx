// Cardboard avatar HEAD — static image snapshot. Renders a head + hair +
// hat via Three.js exactly once per (outfit × px) into a shared WebGL
// renderer, caches the PNG data URL, and returns it as an <img>.
//
// Why not <RobloxAvatar headOnly>: we need this in the assignments list,
// mastery heatmap, Overview roster, etc. — up to ~28 instances in a single
// view. Chrome caps live WebGL contexts at ~16, so one <canvas> per tile
// would visibly fail on the Celeron N4000 target. Shared renderer + PNG
// cache lets us show 100 heads for the price of 1 context.
'use client';

import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import type { AvatarOutfit } from '@/components/student/RobloxAvatar';

type Required<T> = { [K in keyof T]-?: T[K] };

// Mirrors DEFAULT_OUTFIT in RobloxAvatar.tsx so a head rendered here looks
// identical to the full-body character a student sees in their profile.
const DEFAULT_OUTFIT: Required<AvatarOutfit> = {
  skin: '#c9a173',
  shirt: '#6fbf73',
  pants: '#3a3c4a',
  face: 'smile',
  hat: 'none',
  hatColor: '#c24949',
  hair: 'short',
  hairColor: '#3a2a1a',
  gender: 'boy',
};

const STROKE = '#1d1a14';

// ─────────────────────────── cardboard texture ───────────────────────────
// Identical algorithm to RobloxAvatar.paintCardboard — corrugation ridges,
// paper grain, dark fibers. Duplicated here to keep this file self-contained;
// if a third caller needs it, hoist into a shared module.
function paintCardboard(ctx: CanvasRenderingContext2D, size: number) {
  const grad = ctx.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.5, '#f5f5f5');
  grad.addColorStop(1, '#e6e6e6');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const ridge = Math.max(8, Math.round(size / 26));
  for (let y = 0; y < size; y += ridge) {
    const g = ctx.createLinearGradient(0, y, 0, y + ridge);
    g.addColorStop(0, 'rgba(255,255,255,0.22)');
    g.addColorStop(0.5, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.18)');
    ctx.fillStyle = g;
    ctx.fillRect(0, y, size, ridge);
  }

  const img = ctx.getImageData(0, 0, size, size);
  const data = img.data;
  for (let i = 0; i < data.length; i += 4) {
    const n = (Math.random() - 0.5) * 18;
    data[i]     = Math.max(0, Math.min(255, data[i] + n));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + n));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + n));
  }
  ctx.putImageData(img, 0, 0);

  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  const fibers = Math.round(size / 6);
  for (let i = 0; i < fibers; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const len = 4 + Math.random() * 10;
    ctx.fillRect(x, y, len, 1);
  }
}

function makeFaceTexture(face: AvatarOutfit['face']): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  paintCardboard(ctx, size);

  ctx.fillStyle = STROKE;
  ctx.strokeStyle = STROKE;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const s = size / 128;
  const cx = size / 2;
  const eyeY = size * 0.44;
  const mouthY = size * 0.7;
  const drawEye = (x: number, y: number, w = 10 * s, h = 16 * s) => {
    ctx.fillRect(x - w / 2, y - h / 2, w, h);
  };

  switch (face) {
    case 'happy':
      ctx.lineWidth = 6 * s;
      ctx.beginPath(); ctx.arc(cx - 18 * s, eyeY, 9 * s, Math.PI, 0, false); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx + 18 * s, eyeY, 9 * s, Math.PI, 0, false); ctx.stroke();
      ctx.lineWidth = 7 * s;
      ctx.beginPath(); ctx.arc(cx, mouthY - 2 * s, 16 * s, 0, Math.PI, false); ctx.stroke();
      break;
    case 'cool':
      ctx.fillRect(cx - 32 * s, eyeY - 10 * s, 64 * s, 16 * s);
      ctx.fillStyle = '#9ad7ff';
      ctx.fillRect(cx - 26 * s, eyeY - 6 * s, 16 * s, 8 * s);
      ctx.fillRect(cx + 10 * s, eyeY - 6 * s, 16 * s, 8 * s);
      ctx.fillStyle = STROKE;
      ctx.lineWidth = 6 * s;
      ctx.beginPath(); ctx.arc(cx, mouthY, 12 * s, 0, Math.PI, false); ctx.stroke();
      break;
    case 'wink':
      drawEye(cx - 18 * s, eyeY);
      ctx.lineWidth = 5 * s;
      ctx.beginPath(); ctx.arc(cx + 18 * s, eyeY, 8 * s, Math.PI, 0, false); ctx.stroke();
      ctx.lineWidth = 6 * s;
      ctx.beginPath(); ctx.arc(cx, mouthY - 2 * s, 14 * s, 0, Math.PI, false); ctx.stroke();
      break;
    case 'neutral':
      drawEye(cx - 18 * s, eyeY);
      drawEye(cx + 18 * s, eyeY);
      ctx.fillRect(cx - 14 * s, mouthY, 28 * s, 5 * s);
      break;
    case 'smile':
    default:
      drawEye(cx - 18 * s, eyeY);
      drawEye(cx + 18 * s, eyeY);
      ctx.lineWidth = 6 * s;
      ctx.beginPath(); ctx.arc(cx, mouthY - 2 * s, 14 * s, 0, Math.PI, false); ctx.stroke();
      break;
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

function makeCardboardTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  paintCardboard(canvas.getContext('2d')!, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

function withEdges(mesh: THREE.Mesh, group: THREE.Group) {
  group.add(mesh);
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry as THREE.BufferGeometry),
    new THREE.LineBasicMaterial({ color: 0x1d1a14 }),
  );
  mesh.add(edges);
}

// ─────────────────────── shared renderer ──────────────────────────────────
// One WebGL context for the whole app. `render()` resizes it on demand.
let _renderer: THREE.WebGLRenderer | null = null;
function getRenderer(px: number): THREE.WebGLRenderer {
  if (!_renderer) {
    const canvas = document.createElement('canvas');
    _renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    _renderer.outputColorSpace = THREE.SRGBColorSpace;
    _renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    _renderer.setClearColor(0x000000, 0);
  }
  _renderer.setSize(px, px, false);
  return _renderer;
}

// ─────────────────────── render-to-PNG ───────────────────────────────────
// Cache by `${px}|${JSON.stringify(outfit)}`. A student with the same
// outfit rendered at 24px and 96px costs 2 PNGs, not 2 contexts.
const _cache = new Map<string, string>();

function renderHead(outfit: AvatarOutfit, px: number): string {
  const key = `${px}|${JSON.stringify(outfit)}`;
  const hit = _cache.get(key);
  if (hit) return hit;

  const o = { ...DEFAULT_OUTFIT, ...outfit } as Required<AvatarOutfit>;

  const scene = new THREE.Scene();
  scene.background = null;

  scene.add(new THREE.HemisphereLight(0xffffff, 0xb09060, 0.85));
  const key1 = new THREE.DirectionalLight(0xffffff, 0.95);
  key1.position.set(3, 5, 4);
  scene.add(key1);
  const fill = new THREE.DirectionalLight(0xffe8c8, 0.35);
  fill.position.set(-3, 2, 3);
  scene.add(fill);

  const cardboardTex = makeCardboardTexture();
  const skinMat = new THREE.MeshStandardMaterial({
    color: o.skin, map: cardboardTex, roughness: 0.95, metalness: 0,
  });
  const hairMat = new THREE.MeshStandardMaterial({ color: o.hairColor, roughness: 0.9 });
  const hatMat = new THREE.MeshStandardMaterial({ color: o.hatColor, roughness: 0.7 });
  const faceTex = makeFaceTexture(o.face);
  const faceMat = new THREE.MeshStandardMaterial({ color: o.skin, map: faceTex, roughness: 0.9 });

  const character = new THREE.Group();

  // Head (1.6 cube, +Z face is the painted face).
  const head = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 1.6, 1.6),
    [skinMat, skinMat, skinMat, skinMat, faceMat, skinMat],
  );
  const headGroup = new THREE.Group();
  withEdges(head, headGroup);
  character.add(headGroup);

  // Hair. Same geometry as RobloxAvatar so the snapshot matches the
  // student-profile character pixel-for-pixel at a given orientation.
  if (o.hair !== 'none') {
    const hairGroup = new THREE.Group();
    if (o.hair === 'short') {
      const top = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.4, 1.7), hairMat);
      top.position.y = 0.9;
      withEdges(top, hairGroup);
    } else if (o.hair === 'spike') {
      const cap = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.35, 1.7), hairMat);
      cap.position.y = 0.85;
      withEdges(cap, hairGroup);
      for (let i = 0; i < 4; i++) {
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.5, 4), hairMat);
        spike.position.set(-0.55 + i * 0.38, 1.25, 0.1);
        spike.rotation.y = Math.PI / 4;
        hairGroup.add(spike);
      }
    } else if (o.hair === 'long') {
      const top = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.5, 1.75), hairMat);
      top.position.y = 0.9;
      withEdges(top, hairGroup);
      const backDrop = new THREE.Mesh(new THREE.BoxGeometry(1.75, 1.4, 0.3), hairMat);
      backDrop.position.set(0, 0.15, -0.7);
      withEdges(backDrop, hairGroup);
      const sideL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.3, 1.7), hairMat);
      sideL.position.set(-0.75, 0.1, 0);
      withEdges(sideL, hairGroup);
      const sideR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.3, 1.7), hairMat);
      sideR.position.set(0.75, 0.1, 0);
      withEdges(sideR, hairGroup);
    }
    character.add(hairGroup);
  }

  // Hat
  if (o.hat !== 'none') {
    const hatGroup = new THREE.Group();
    if (o.hat === 'cap') {
      const crown = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.55, 1.75), hatMat);
      crown.position.y = 1.05;
      withEdges(crown, hatGroup);
      const brim = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.12, 1.1), hatMat);
      brim.position.set(0, 0.85, 0.85);
      withEdges(brim, hatGroup);
    } else if (o.hat === 'beanie') {
      const crown = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.75, 1.75), hatMat);
      crown.position.y = 1.15;
      withEdges(crown, hatGroup);
      const pom = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), hatMat);
      pom.position.y = 1.65;
      hatGroup.add(pom);
    } else if (o.hat === 'tophat') {
      const brim = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.15, 2.2), hatMat);
      brim.position.y = 0.88;
      withEdges(brim, hatGroup);
      const crown = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.3, 1.4), hatMat);
      crown.position.y = 1.65;
      withEdges(crown, hatGroup);
    }
    character.add(hatGroup);
  }

  // Small static yaw so 3D reads immediately (same as RobloxAvatar's
  // initial pose). No rotation animation here — we render one frame.
  character.rotation.y = Math.PI * 0.12;
  scene.add(character);

  // Fit camera tightly around head + hat + hair.
  character.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(character);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  const margin = 1.15;
  const vFov = (camera.fov * Math.PI) / 180;
  const distV = (size.y * margin) / (2 * Math.tan(vFov / 2));
  const distH = (size.x * margin) / (2 * Math.tan(vFov / 2));
  const dist = Math.max(distV, distH) + size.z / 2 + 0.5;
  camera.position.set(0, center.y, dist);
  camera.lookAt(0, center.y, 0);

  const renderer = getRenderer(px);
  renderer.render(scene, camera);
  const dataUrl = renderer.domElement.toDataURL('image/png');

  // Dispose scene — the renderer stays alive for the next call.
  cardboardTex.dispose();
  faceTex.dispose();
  scene.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const mat = mesh.material;
    if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
    else if (mat) mat.dispose();
  });

  _cache.set(key, dataUrl);
  return dataUrl;
}

// ─────────────────────── <CardboardHead> ──────────────────────────────────
// Renders asynchronously in an effect so the initial paint doesn't hitch
// on module init. `px` is internal render resolution; `displayPx` is the
// CSS size. Pass a larger `px` when you want crisper text for hero tiles.
export const CardboardHead = ({
  outfit, px, framed = false,
}: {
  outfit: AvatarOutfit;
  /** Square pixel size used for both render resolution and display. */
  px: number;
  /** Butter-yellow chunky frame (hero tiles). Off by default for list chips. */
  framed?: boolean;
}) => {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    // Cap internal render resolution at 128 — roster chips at 24px don't
    // need a 48-device-pixel render, and the renderer canvas is shared.
    const renderPx = Math.min(128, Math.max(48, px * 2));
    setSrc(renderHead(outfit, renderPx));
  }, [outfit, px]);

  const img = (
    <img
      src={src ?? ''}
      alt=""
      width={px}
      height={px}
      style={{ display: 'block', width: px, height: px, objectFit: 'contain' }}
    />
  );

  if (!framed) return img;

  return (
    <div style={{
      width: px, height: px,
      borderRadius: Math.max(10, px * 0.22),
      background: 'linear-gradient(180deg, var(--pbs-cream) 0%, var(--pbs-cream-2) 100%)',
      border: '3px solid var(--pbs-butter)',
      outline: '2px solid var(--pbs-butter-ink)',
      outlineOffset: 0,
      boxShadow: '0 4px 0 var(--pbs-butter-ink), 0 10px 20px -8px rgba(107,79,0,0.5)',
      overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>{img}</div>
  );
};
