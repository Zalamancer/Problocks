/**
 * Procedural canvas textures for part surface presets.
 * Each base texture is generated once, cached, and cloned per material so
 * callers can set their own `repeat` without mutating the shared instance.
 */
import * as THREE from 'three';
import type { TexturePreset } from '@/store/scene-store';

const CACHE = new Map<TexturePreset, THREE.CanvasTexture>();

const SIZE = 256;

function makeCanvas(): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d')!;
  return { canvas, ctx };
}

function noise(ctx: CanvasRenderingContext2D, alpha: number, count: number) {
  const img = ctx.getImageData(0, 0, SIZE, SIZE);
  const d = img.data;
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * SIZE);
    const y = Math.floor(Math.random() * SIZE);
    const idx = (y * SIZE + x) * 4;
    const v = Math.floor(Math.random() * 80 - 40);
    d[idx] = Math.max(0, Math.min(255, d[idx] + v));
    d[idx + 1] = Math.max(0, Math.min(255, d[idx + 1] + v));
    d[idx + 2] = Math.max(0, Math.min(255, d[idx + 2] + v));
    d[idx + 3] = Math.max(0, Math.min(255, d[idx + 3] * alpha));
  }
  ctx.putImageData(img, 0, 0);
}

function drawBrick(ctx: CanvasRenderingContext2D) {
  // Mortar background
  ctx.fillStyle = '#3a2e26';
  ctx.fillRect(0, 0, SIZE, SIZE);

  const brickW = 64;
  const brickH = 28;
  const gap = 4;
  const rows = Math.ceil(SIZE / (brickH + gap));
  for (let row = 0; row < rows; row++) {
    const y = row * (brickH + gap);
    const offset = (row % 2) * (brickW / 2);
    for (let x = -brickW; x < SIZE + brickW; x += brickW + gap) {
      const bx = x + offset;
      // Per-brick color jitter
      const r = 140 + Math.floor(Math.random() * 50);
      const g = 50 + Math.floor(Math.random() * 25);
      const b = 35 + Math.floor(Math.random() * 20);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(bx, y, brickW, brickH);
      // Subtle highlight
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fillRect(bx, y, brickW, 2);
    }
  }
  noise(ctx, 1, 3000);
}

function drawWood(ctx: CanvasRenderingContext2D) {
  // Base
  const grad = ctx.createLinearGradient(0, 0, SIZE, 0);
  grad.addColorStop(0, '#8a5a32');
  grad.addColorStop(0.5, '#a06a3a');
  grad.addColorStop(1, '#7a4a28');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Vertical grain stripes
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * SIZE;
    const w = 1 + Math.random() * 3;
    const shade = Math.random() < 0.5 ? 'rgba(60,30,15,0.25)' : 'rgba(255,220,180,0.08)';
    ctx.fillStyle = shade;
    ctx.fillRect(x, 0, w, SIZE);
  }
  // Knots
  for (let i = 0; i < 4; i++) {
    const x = Math.random() * SIZE;
    const y = Math.random() * SIZE;
    const r = 4 + Math.random() * 6;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(40,20,10,0.7)');
    g.addColorStop(1, 'rgba(40,20,10,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  noise(ctx, 1, 2000);
}

function drawMetal(ctx: CanvasRenderingContext2D) {
  // Brushed metal base
  const grad = ctx.createLinearGradient(0, 0, 0, SIZE);
  grad.addColorStop(0, '#aab0b6');
  grad.addColorStop(0.5, '#c8ced4');
  grad.addColorStop(1, '#9aa0a6');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Horizontal brushing lines
  for (let i = 0; i < 200; i++) {
    const y = Math.random() * SIZE;
    const a = 0.05 + Math.random() * 0.1;
    ctx.strokeStyle = Math.random() < 0.5
      ? `rgba(255,255,255,${a})`
      : `rgba(0,0,0,${a})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(SIZE, y);
    ctx.stroke();
  }
  noise(ctx, 1, 4000);
}

function drawMarble(ctx: CanvasRenderingContext2D) {
  // White-ish base
  ctx.fillStyle = '#eeeae4';
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Veins: a few wavy strokes
  const veinCount = 8;
  for (let i = 0; i < veinCount; i++) {
    ctx.beginPath();
    const startX = Math.random() * SIZE;
    const startY = Math.random() * SIZE;
    ctx.moveTo(startX, startY);
    let x = startX, y = startY;
    for (let j = 0; j < 30; j++) {
      x += (Math.random() - 0.5) * 30;
      y += (Math.random() - 0.5) * 30;
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(80,80,90,${0.15 + Math.random() * 0.15})`;
    ctx.lineWidth = 0.5 + Math.random() * 1.5;
    ctx.stroke();
  }
  noise(ctx, 1, 1500);
}

function drawDiamond(ctx: CanvasRenderingContext2D) {
  // Faceted iridescent pattern
  ctx.fillStyle = '#cfe7ff';
  ctx.fillRect(0, 0, SIZE, SIZE);
  const facet = 32;
  for (let y = 0; y < SIZE; y += facet) {
    for (let x = 0; x < SIZE; x += facet) {
      const hue = 180 + Math.random() * 80;
      const light = 70 + Math.random() * 25;
      ctx.fillStyle = `hsla(${hue}, 60%, ${light}%, 0.55)`;
      ctx.beginPath();
      ctx.moveTo(x + facet / 2, y);
      ctx.lineTo(x + facet, y + facet / 2);
      ctx.lineTo(x + facet / 2, y + facet);
      ctx.lineTo(x, y + facet / 2);
      ctx.closePath();
      ctx.fill();
    }
  }
}

function drawNeon(ctx: CanvasRenderingContext2D) {
  // Subtle scanlines on a bright background — main glow comes from emissive
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, SIZE, SIZE);
  for (let y = 0; y < SIZE; y += 2) {
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    ctx.fillRect(0, y, SIZE, 1);
  }
}

function drawStuds(ctx: CanvasRenderingContext2D) {
  // ONE stud per tile; tiling repeat = scale gives 1 stud per world unit
  // (matching Lego's 1-stud-per-stud convention).
  // White base lets the mesh color tint everything.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, SIZE, SIZE);

  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const r = SIZE * 0.32;             // stud is ~64% the tile width

  // Plate body shadow at the seams — darker around the edges so the
  // brick body feels recessed beneath the stud.
  const seam = ctx.createRadialGradient(cx, cy, r * 1.05, cx, cy, SIZE * 0.7);
  seam.addColorStop(0, 'rgba(0,0,0,0)');
  seam.addColorStop(1, 'rgba(0,0,0,0.18)');
  ctx.fillStyle = seam;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Hard shadow ring directly under the stud (contact shadow).
  ctx.beginPath();
  ctx.arc(cx + 3, cy + 4, r + 4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fill();

  // Stud body with strong radial shading — top-left lit, bottom-right dark.
  const body = ctx.createRadialGradient(
    cx - r * 0.35, cy - r * 0.4, r * 0.05,
    cx + r * 0.15, cy + r * 0.2, r * 1.05,
  );
  body.addColorStop(0, 'rgba(255,255,255,1)');
  body.addColorStop(0.45, 'rgba(235,235,235,1)');
  body.addColorStop(0.85, 'rgba(165,165,165,1)');
  body.addColorStop(1, 'rgba(95,95,95,1)');
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = body;
  ctx.fill();

  // Dark rim outline — sells the cylinder edge.
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.stroke();

  // Bright crescent specular highlight.
  ctx.beginPath();
  ctx.arc(cx - r * 0.3, cy - r * 0.4, r * 0.55, Math.PI * 0.9, Math.PI * 1.6);
  ctx.lineWidth = r * 0.18;
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.stroke();

  // Embossed "LEGO" wordmark on top of the stud.
  ctx.save();
  ctx.translate(cx, cy);
  ctx.font = `bold ${Math.round(r * 0.42)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // Shadow pass (below)
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillText('LEGO', 1, 1);
  // Highlight pass (above)
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillText('LEGO', 0, 0);
  ctx.restore();
}

function drawStudsSquare(ctx: CanvasRenderingContext2D) {
  // ONE square pad per tile — beveled like a Lego tile/plate.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Recessed plate body around the pad.
  const seam = ctx.createRadialGradient(SIZE / 2, SIZE / 2, SIZE * 0.32, SIZE / 2, SIZE / 2, SIZE * 0.7);
  seam.addColorStop(0, 'rgba(0,0,0,0)');
  seam.addColorStop(1, 'rgba(0,0,0,0.18)');
  ctx.fillStyle = seam;
  ctx.fillRect(0, 0, SIZE, SIZE);

  const inset = SIZE * 0.16;
  const x = inset;
  const y = inset;
  const w = SIZE - inset * 2;

  // Hard contact shadow.
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(x + 4, y + 5, w, w);

  // Pad body — diagonal gradient for fake bevel (top-left bright).
  const body = ctx.createLinearGradient(x, y, x + w, y + w);
  body.addColorStop(0, 'rgba(255,255,255,1)');
  body.addColorStop(0.55, 'rgba(225,225,225,1)');
  body.addColorStop(1, 'rgba(120,120,120,1)');
  ctx.fillStyle = body;
  ctx.fillRect(x, y, w, w);

  // Bevel: top + left bright, bottom + right dark.
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillRect(x, y, w, 4);
  ctx.fillRect(x, y, 4, w);
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(x, y + w - 4, w, 4);
  ctx.fillRect(x + w - 4, y, 4, w);

  // Dark outline.
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.strokeRect(x, y, w, w);

  // Embossed "LEGO" wordmark.
  ctx.save();
  ctx.translate(x + w / 2, y + w / 2);
  ctx.font = `bold ${Math.round(w * 0.18)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillText('LEGO', 1, 1);
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillText('LEGO', 0, 0);
  ctx.restore();
}

function drawSmoothPlastic(ctx: CanvasRenderingContext2D) {
  // Almost flat with very faint speckle — gives PBR something to catch
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, SIZE, SIZE);
  noise(ctx, 1, 800);
}

const DRAWERS: Partial<Record<TexturePreset, (ctx: CanvasRenderingContext2D) => void>> = {
  Brick: drawBrick,
  Wood: drawWood,
  Metal: drawMetal,
  Marble: drawMarble,
  Diamond: drawDiamond,
  Neon: drawNeon,
  SmoothPlastic: drawSmoothPlastic,
  Studs: drawStuds,
  StudsSquare: drawStudsSquare,
};

/**
 * How many pattern repeats to apply per world unit, per preset. Brick / wood
 * patterns have many features per tile so 0.5 looks right at unit scale;
 * stud presets draw ONE feature per tile so 1.0 = "1 stud per unit".
 */
export function getTextureRepeatPerUnit(preset: TexturePreset): number {
  switch (preset) {
    case 'Studs':
    case 'StudsSquare':
      return 1.0;
    default:
      return 0.5;
  }
}

/**
 * Returns a cached base CanvasTexture for the given preset, or null when the
 * preset has no procedural map (e.g. 'None'). The returned texture is the
 * shared instance — clone it before mutating `repeat`/`offset`.
 */
export function getProceduralTexture(preset: TexturePreset): THREE.CanvasTexture | null {
  if (preset === 'None') return null;
  const cached = CACHE.get(preset);
  if (cached) return cached;
  const drawer = DRAWERS[preset];
  if (!drawer) return null;
  const { canvas, ctx } = makeCanvas();
  drawer(ctx);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  CACHE.set(preset, tex);
  return tex;
}
