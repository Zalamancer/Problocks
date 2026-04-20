// Procedural canvas textures for the 3D crates, painted with the same
// approach as the cardboard-avatar skin in RobloxAvatar.tsx: a base gradient,
// tier-specific detail layers (wood grain, corrugation, brushed metal,
// etc.), and per-pixel neutral grain noise so any tint color reads with
// surface character instead of a flat fill.
//
// Each tier returns a small map of named textures so Crate3D can pick the
// right one per face of the box (top/front/side/bottom are often different).
// Textures are memoized per tier so multiple crate instances share the same
// GPU uploads — important because CratesPanel shows five cards at once.

import * as THREE from 'three';
import type { CrateTier } from './crate-types';

export interface CrateTextureSet {
  /** Main body side faces (left/right/front/back). */
  side: THREE.CanvasTexture;
  /** Top of the body (where the lid sits). Often darker. */
  bodyTop: THREE.CanvasTexture;
  /** Lid top surface. Has the tier-specific accent (stamp, brand, gem cut). */
  lidTop: THREE.CanvasTexture;
  /** Lid side faces. Similar to `side` but shorter. */
  lidSide: THREE.CanvasTexture;
}

const cache: Partial<Record<CrateTier, CrateTextureSet>> = {};

export function getCrateTextures(tier: CrateTier): CrateTextureSet {
  const existing = cache[tier];
  if (existing) return existing;
  const set = buildSet(tier);
  cache[tier] = set;
  return set;
}

function buildSet(tier: CrateTier): CrateTextureSet {
  switch (tier) {
    case 'paper':     return buildPaper();
    case 'cardboard': return buildCardboard();
    case 'wooden':    return buildWooden();
    case 'metal':     return buildMetal();
    case 'crystal':   return buildCrystal();
  }
}

/* --------------------------- shared helpers --------------------------- */

function makeCanvas(size = 512): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  return { canvas, ctx };
}

function toTex(canvas: HTMLCanvasElement): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

/** Neutral per-pixel grain. Nudges each pixel ±amt so tint colors still read. */
function grain(ctx: CanvasRenderingContext2D, size: number, amt: number) {
  const img = ctx.getImageData(0, 0, size, size);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * amt;
    d[i]     = clamp(d[i] + n);
    d[i + 1] = clamp(d[i + 1] + n);
    d[i + 2] = clamp(d[i + 2] + n);
  }
  ctx.putImageData(img, 0, 0);
}
const clamp = (v: number) => Math.max(0, Math.min(255, v));

/** Vertical gradient fill. */
function gradFill(ctx: CanvasRenderingContext2D, size: number, stops: [number, string][]) {
  const g = ctx.createLinearGradient(0, 0, 0, size);
  for (const [p, c] of stops) g.addColorStop(p, c);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
}

/* ------------------------------- paper -------------------------------- */

function buildPaper(): CrateTextureSet {
  const side = makeCanvas();
  gradFill(side.ctx, 512, [[0, '#f0e0b8'], [0.5, '#e6d2a0'], [1, '#c9a173']]);
  // crumple creases — long faint diagonals
  side.ctx.strokeStyle = 'rgba(90, 60, 30, 0.18)';
  side.ctx.lineWidth = 1.2;
  for (let i = 0; i < 40; i++) {
    side.ctx.beginPath();
    const y = Math.random() * 512;
    side.ctx.moveTo(0, y);
    side.ctx.bezierCurveTo(170, y + (Math.random() - 0.5) * 60, 340, y + (Math.random() - 0.5) * 80, 512, y + (Math.random() - 0.5) * 40);
    side.ctx.stroke();
  }
  // horizontal fibers
  side.ctx.fillStyle = 'rgba(110, 70, 30, 0.35)';
  for (let i = 0; i < 180; i++) {
    side.ctx.fillRect(Math.random() * 512, Math.random() * 512, 4 + Math.random() * 18, 1);
  }
  grain(side.ctx, 512, 28);
  // torn edge tint near top — darker bruise
  const g2 = side.ctx.createLinearGradient(0, 0, 0, 40);
  g2.addColorStop(0, 'rgba(60, 30, 0, 0.35)');
  g2.addColorStop(1, 'rgba(60, 30, 0, 0)');
  side.ctx.fillStyle = g2;
  side.ctx.fillRect(0, 0, 512, 40);

  const lidTop = makeCanvas();
  // same base, plus a wax-seal dot + twine knot print
  gradFill(lidTop.ctx, 512, [[0, '#efd9aa'], [1, '#c9a173']]);
  lidTop.ctx.strokeStyle = 'rgba(90, 60, 30, 0.2)';
  lidTop.ctx.lineWidth = 1;
  for (let i = 0; i < 30; i++) {
    lidTop.ctx.beginPath();
    lidTop.ctx.moveTo(Math.random() * 512, Math.random() * 512);
    lidTop.ctx.lineTo(Math.random() * 512, Math.random() * 512);
    lidTop.ctx.stroke();
  }
  // wax seal (deep red circle with ridges)
  lidTop.ctx.fillStyle = '#8a1e1a';
  lidTop.ctx.beginPath();
  lidTop.ctx.arc(256, 256, 64, 0, Math.PI * 2);
  lidTop.ctx.fill();
  lidTop.ctx.fillStyle = 'rgba(255,200,150,0.2)';
  for (let a = 0; a < 8; a++) {
    lidTop.ctx.beginPath();
    lidTop.ctx.arc(256, 256, 52, (a * Math.PI) / 4, (a * Math.PI) / 4 + 0.2);
    lidTop.ctx.lineTo(256, 256);
    lidTop.ctx.fill();
  }
  // P monogram
  lidTop.ctx.fillStyle = '#fdf6e6';
  lidTop.ctx.font = 'bold 48px serif';
  lidTop.ctx.textAlign = 'center';
  lidTop.ctx.textBaseline = 'middle';
  lidTop.ctx.fillText('P', 256, 260);
  grain(lidTop.ctx, 512, 20);

  return {
    side: toTex(side.canvas),
    bodyTop: toTex(side.canvas),
    lidTop: toTex(lidTop.canvas),
    lidSide: toTex(side.canvas),
  };
}

/* ----------------------------- cardboard ------------------------------ */

function buildCardboard(): CrateTextureSet {
  const side = makeCanvas();
  gradFill(side.ctx, 512, [[0, '#c39364'], [0.5, '#b08150'], [1, '#8a5a2e']]);
  // corrugated horizontal ridges (light-top, dark-bottom per ridge)
  const ridge = 18;
  for (let y = 0; y < 512; y += ridge) {
    const g = side.ctx.createLinearGradient(0, y, 0, y + ridge);
    g.addColorStop(0,   'rgba(255,255,255,0.18)');
    g.addColorStop(0.5, 'rgba(0,0,0,0)');
    g.addColorStop(1,   'rgba(0,0,0,0.22)');
    side.ctx.fillStyle = g;
    side.ctx.fillRect(0, y, 512, ridge);
  }
  grain(side.ctx, 512, 22);
  // fragile stamp (rotated red text)
  side.ctx.save();
  side.ctx.translate(140, 140);
  side.ctx.rotate(-0.22);
  side.ctx.strokeStyle = 'rgba(180, 30, 30, 0.85)';
  side.ctx.lineWidth = 3;
  side.ctx.strokeRect(-66, -24, 132, 48);
  side.ctx.fillStyle = 'rgba(180, 30, 30, 0.9)';
  side.ctx.font = 'bold 22px sans-serif';
  side.ctx.textAlign = 'center';
  side.ctx.textBaseline = 'middle';
  side.ctx.fillText('FRAGILE', 0, 0);
  side.ctx.restore();

  const bodyTop = makeCanvas();
  gradFill(bodyTop.ctx, 512, [[0, '#9a7040'], [1, '#6d4a24']]);
  // inside-of-box dark edge
  bodyTop.ctx.fillStyle = 'rgba(0,0,0,0.3)';
  bodyTop.ctx.fillRect(0, 0, 512, 32);
  bodyTop.ctx.fillRect(0, 480, 512, 32);
  grain(bodyTop.ctx, 512, 18);

  const lidTop = makeCanvas();
  gradFill(lidTop.ctx, 512, [[0, '#c39364'], [1, '#8a5a2e']]);
  // corrugation
  for (let y = 0; y < 512; y += ridge) {
    const g = lidTop.ctx.createLinearGradient(0, y, 0, y + ridge);
    g.addColorStop(0, 'rgba(255,255,255,0.15)');
    g.addColorStop(1, 'rgba(0,0,0,0.2)');
    lidTop.ctx.fillStyle = g;
    lidTop.ctx.fillRect(0, y, 512, ridge);
  }
  // packing tape strip down the middle
  lidTop.ctx.fillStyle = 'rgba(245, 215, 165, 0.85)';
  lidTop.ctx.fillRect(200, 0, 112, 512);
  lidTop.ctx.fillStyle = 'rgba(255,255,255,0.18)';
  lidTop.ctx.fillRect(208, 0, 8, 512);
  lidTop.ctx.fillRect(296, 0, 8, 512);
  // ProBlocks stamp
  lidTop.ctx.save();
  lidTop.ctx.translate(256, 356);
  lidTop.ctx.rotate(-0.08);
  lidTop.ctx.strokeStyle = 'rgba(40, 30, 20, 0.65)';
  lidTop.ctx.lineWidth = 3;
  lidTop.ctx.strokeRect(-78, -28, 156, 56);
  lidTop.ctx.fillStyle = 'rgba(40, 30, 20, 0.7)';
  lidTop.ctx.font = 'bold 22px sans-serif';
  lidTop.ctx.textAlign = 'center';
  lidTop.ctx.textBaseline = 'middle';
  lidTop.ctx.fillText('PROBLOCKS', 0, 0);
  lidTop.ctx.restore();
  grain(lidTop.ctx, 512, 20);

  return {
    side: toTex(side.canvas),
    bodyTop: toTex(bodyTop.canvas),
    lidTop: toTex(lidTop.canvas),
    lidSide: toTex(side.canvas),
  };
}

/* ------------------------------- wooden ------------------------------- */

function buildWooden(): CrateTextureSet {
  const side = makeCanvas();
  gradFill(side.ctx, 512, [[0, '#a8763f'], [0.5, '#875a2e'], [1, '#5a3a1e']]);
  // vertical plank separators
  for (const x of [128, 256, 384]) {
    const g = side.ctx.createLinearGradient(x - 6, 0, x + 6, 0);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(0.5, 'rgba(20,10,0,0.55)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    side.ctx.fillStyle = g;
    side.ctx.fillRect(x - 6, 0, 12, 512);
  }
  // wood grain per plank
  side.ctx.strokeStyle = 'rgba(50, 30, 10, 0.5)';
  side.ctx.lineWidth = 0.8;
  for (let i = 0; i < 120; i++) {
    side.ctx.beginPath();
    const y = Math.random() * 512;
    side.ctx.moveTo(0, y);
    side.ctx.bezierCurveTo(170, y + (Math.random() - 0.5) * 20, 340, y + (Math.random() - 0.5) * 30, 512, y + (Math.random() - 0.5) * 20);
    side.ctx.stroke();
  }
  // a few knot circles
  for (let i = 0; i < 4; i++) {
    const cx = 40 + Math.random() * 432;
    const cy = 40 + Math.random() * 432;
    const r = 8 + Math.random() * 14;
    const g = side.ctx.createRadialGradient(cx, cy, 1, cx, cy, r);
    g.addColorStop(0, '#3a1f0a');
    g.addColorStop(0.6, '#5a341a');
    g.addColorStop(1, 'rgba(90, 60, 30, 0)');
    side.ctx.fillStyle = g;
    side.ctx.beginPath();
    side.ctx.arc(cx, cy, r, 0, Math.PI * 2);
    side.ctx.fill();
  }
  grain(side.ctx, 512, 18);

  const lidTop = makeCanvas();
  gradFill(lidTop.ctx, 512, [[0, '#a8763f'], [1, '#5a3a1e']]);
  for (const x of [128, 256, 384]) {
    lidTop.ctx.fillStyle = 'rgba(0,0,0,0.45)';
    lidTop.ctx.fillRect(x - 3, 0, 6, 512);
  }
  // grain
  lidTop.ctx.strokeStyle = 'rgba(40, 25, 10, 0.5)';
  lidTop.ctx.lineWidth = 0.8;
  for (let i = 0; i < 140; i++) {
    lidTop.ctx.beginPath();
    lidTop.ctx.moveTo(0, Math.random() * 512);
    lidTop.ctx.bezierCurveTo(170, Math.random() * 512, 340, Math.random() * 512, 512, Math.random() * 512);
    lidTop.ctx.stroke();
  }
  grain(lidTop.ctx, 512, 18);

  return {
    side: toTex(side.canvas),
    bodyTop: toTex(lidTop.canvas),
    lidTop: toTex(lidTop.canvas),
    lidSide: toTex(side.canvas),
  };
}

/* -------------------------------- metal ------------------------------- */

function buildMetal(): CrateTextureSet {
  const side = makeCanvas();
  gradFill(side.ctx, 512, [[0, '#8d98a4'], [0.5, '#58646f'], [1, '#2c343d']]);
  // brushed horizontal streaks
  side.ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  side.ctx.lineWidth = 1;
  for (let i = 0; i < 900; i++) {
    side.ctx.beginPath();
    const y = Math.random() * 512;
    side.ctx.moveTo(Math.random() * 512, y);
    side.ctx.lineTo(Math.random() * 512 + 40, y);
    side.ctx.stroke();
  }
  side.ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  for (let i = 0; i < 600; i++) {
    side.ctx.beginPath();
    const y = Math.random() * 512;
    side.ctx.moveTo(Math.random() * 512, y);
    side.ctx.lineTo(Math.random() * 512 + 50, y);
    side.ctx.stroke();
  }
  // scratch marks
  side.ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  side.ctx.lineWidth = 0.6;
  for (let i = 0; i < 6; i++) {
    side.ctx.beginPath();
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    side.ctx.moveTo(x, y);
    side.ctx.lineTo(x + 20 + Math.random() * 60, y + (Math.random() - 0.5) * 20);
    side.ctx.stroke();
  }
  // painted rivets in a grid along top+bottom edges
  for (let i = 0; i < 8; i++) {
    const x = 40 + i * 60;
    paintRivet(side.ctx, x, 40);
    paintRivet(side.ctx, x, 472);
  }
  grain(side.ctx, 512, 12);

  const lidTop = makeCanvas();
  gradFill(lidTop.ctx, 512, [[0, '#9fabb6'], [1, '#3b4651']]);
  // radial brushed pattern from center
  lidTop.ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  for (let i = 0; i < 200; i++) {
    const a = Math.random() * Math.PI * 2;
    const r1 = 20 + Math.random() * 240;
    const r2 = r1 + 30 + Math.random() * 60;
    lidTop.ctx.beginPath();
    lidTop.ctx.moveTo(256 + Math.cos(a) * r1, 256 + Math.sin(a) * r1);
    lidTop.ctx.lineTo(256 + Math.cos(a) * r2, 256 + Math.sin(a) * r2);
    lidTop.ctx.stroke();
  }
  // warning stripes along one edge
  for (let i = 0; i < 10; i++) {
    lidTop.ctx.fillStyle = i % 2 ? '#1d1a14' : '#ffcc3a';
    lidTop.ctx.fillRect(20 + i * 48, 460, 44, 28);
  }
  // central keyhole + rim
  lidTop.ctx.fillStyle = '#1a1f25';
  lidTop.ctx.beginPath();
  lidTop.ctx.arc(256, 200, 48, 0, Math.PI * 2);
  lidTop.ctx.fill();
  lidTop.ctx.fillStyle = '#c8d4df';
  lidTop.ctx.beginPath();
  lidTop.ctx.arc(256, 200, 44, 0, Math.PI * 2);
  lidTop.ctx.fill();
  lidTop.ctx.fillStyle = '#1a1f25';
  lidTop.ctx.beginPath();
  lidTop.ctx.arc(256, 200, 12, 0, Math.PI * 2);
  lidTop.ctx.fill();
  lidTop.ctx.fillRect(250, 200, 12, 32);
  // corner rivets
  for (const [x, y] of [[40, 40], [472, 40], [40, 472], [472, 472]] as [number, number][]) {
    paintRivet(lidTop.ctx, x, y);
  }
  grain(lidTop.ctx, 512, 14);

  return {
    side: toTex(side.canvas),
    bodyTop: toTex(side.canvas),
    lidTop: toTex(lidTop.canvas),
    lidSide: toTex(side.canvas),
  };
}

function paintRivet(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const g = ctx.createRadialGradient(x - 3, y - 3, 1, x, y, 10);
  g.addColorStop(0, '#e2ecf4');
  g.addColorStop(0.6, '#8a96a2');
  g.addColorStop(1, '#2c343d');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.55)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
}

/* ------------------------------ crystal ------------------------------- */

function buildCrystal(): CrateTextureSet {
  const side = makeCanvas();
  // gold base
  gradFill(side.ctx, 512, [[0, '#ffe27a'], [0.5, '#f5c843'], [1, '#a17205']]);
  // filigree swirls
  side.ctx.strokeStyle = 'rgba(80, 55, 0, 0.55)';
  side.ctx.lineWidth = 1.5;
  for (let i = 0; i < 14; i++) {
    side.ctx.beginPath();
    const cx = Math.random() * 512;
    const cy = Math.random() * 512;
    const r = 20 + Math.random() * 50;
    side.ctx.arc(cx, cy, r, 0, Math.PI * 1.6);
    side.ctx.stroke();
  }
  // tiny gem inlays
  for (let i = 0; i < 14; i++) {
    const cx = Math.random() * 512;
    const cy = Math.random() * 512;
    const g = side.ctx.createRadialGradient(cx, cy, 1, cx, cy, 8);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.5, '#ff6e9f');
    g.addColorStop(1, '#5a1a3a');
    side.ctx.fillStyle = g;
    side.ctx.beginPath();
    side.ctx.arc(cx, cy, 6 + Math.random() * 4, 0, Math.PI * 2);
    side.ctx.fill();
  }
  // corner caps — darker plates
  side.ctx.fillStyle = 'rgba(90, 55, 0, 0.7)';
  side.ctx.fillRect(0, 0, 64, 64);
  side.ctx.fillRect(448, 0, 64, 64);
  side.ctx.fillRect(0, 448, 64, 64);
  side.ctx.fillRect(448, 448, 64, 64);
  // scratch highlights
  side.ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  side.ctx.lineWidth = 0.8;
  for (let i = 0; i < 40; i++) {
    side.ctx.beginPath();
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    side.ctx.moveTo(x, y);
    side.ctx.lineTo(x + 10 + Math.random() * 30, y + (Math.random() - 0.5) * 4);
    side.ctx.stroke();
  }
  grain(side.ctx, 512, 14);

  const lidTop = makeCanvas();
  gradFill(lidTop.ctx, 512, [[0, '#ffedb0'], [1, '#b07e10']]);
  // radial shine
  const rg = lidTop.ctx.createRadialGradient(256, 256, 40, 256, 256, 300);
  rg.addColorStop(0, 'rgba(255,255,255,0.8)');
  rg.addColorStop(0.6, 'rgba(255,230,140,0)');
  lidTop.ctx.fillStyle = rg;
  lidTop.ctx.fillRect(0, 0, 512, 512);
  // central gem socket (faceted diamond pattern)
  lidTop.ctx.save();
  lidTop.ctx.translate(256, 256);
  const facets = 8;
  for (let f = 0; f < facets; f++) {
    const a1 = (f / facets) * Math.PI * 2;
    const a2 = ((f + 1) / facets) * Math.PI * 2;
    const r = 90;
    lidTop.ctx.beginPath();
    lidTop.ctx.moveTo(0, 0);
    lidTop.ctx.lineTo(Math.cos(a1) * r, Math.sin(a1) * r);
    lidTop.ctx.lineTo(Math.cos(a2) * r, Math.sin(a2) * r);
    lidTop.ctx.closePath();
    const hue = 280 + f * 10;
    const lightness = 50 + (f % 2) * 20;
    lidTop.ctx.fillStyle = `hsl(${hue}, 80%, ${lightness}%)`;
    lidTop.ctx.fill();
  }
  lidTop.ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  lidTop.ctx.lineWidth = 2;
  for (let f = 0; f < facets; f++) {
    const a = (f / facets) * Math.PI * 2;
    lidTop.ctx.beginPath();
    lidTop.ctx.moveTo(0, 0);
    lidTop.ctx.lineTo(Math.cos(a) * 90, Math.sin(a) * 90);
    lidTop.ctx.stroke();
  }
  lidTop.ctx.restore();
  // filigree border
  lidTop.ctx.strokeStyle = 'rgba(80, 55, 0, 0.6)';
  lidTop.ctx.lineWidth = 3;
  lidTop.ctx.strokeRect(20, 20, 472, 472);
  lidTop.ctx.lineWidth = 1;
  lidTop.ctx.strokeRect(32, 32, 448, 448);
  grain(lidTop.ctx, 512, 10);

  return {
    side: toTex(side.canvas),
    bodyTop: toTex(side.canvas),
    lidTop: toTex(lidTop.canvas),
    lidSide: toTex(side.canvas),
  };
}
