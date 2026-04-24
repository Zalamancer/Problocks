/**
 * Face CanvasTexture for the Robloxian character's head.
 *
 * Ported from components/student/RobloxAvatar.tsx's makeFaceTexture so
 * the freeform character's face matches the student's avatar exactly.
 * We draw eyes + mouth on a transparent canvas (no cardboard backdrop)
 * because the freeform scene uses flat toon shading, not the avatar's
 * cardboard-textured MeshStandardMaterial — the head colour comes from
 * the toon base material behind this decal.
 *
 * Textures are cached by face kind so every character in the scene
 * sharing the same face expression reuses one GPU upload.
 */

import * as THREE from 'three';

export type AvatarFace = 'smile' | 'happy' | 'cool' | 'wink' | 'neutral';

const STROKE = '#1d1a14';
const cache = new Map<AvatarFace, THREE.CanvasTexture>();

export function getFaceTexture(face: AvatarFace): THREE.CanvasTexture {
  const hit = cache.get(face);
  if (hit) return hit;
  const tex = buildFaceTexture(face);
  cache.set(face, tex);
  return tex;
}

/** Drop cache on HMR / teardown. Live meshes still reference textures. */
export function _clearFaceTextureCache(): void {
  for (const t of cache.values()) t.dispose();
  cache.clear();
}

function buildFaceTexture(face: AvatarFace): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  // Solid white background — MeshToonMaterial multiplies map × color,
  // so the skin-coloured head material tints this to the correct skin
  // tone and the dark eye / mouth strokes stay black.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

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
