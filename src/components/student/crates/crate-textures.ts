// Flat, playful canvas textures for the chunky-pastel crates.
//
// Design rules (ported from pb-site):
//  - flat tone-block fills (no gradients, no grain, no realism)
//  - heavy `INK = #1d1a14` outlines (strokes 4–8px)
//  - decorations built from geometric primitives (rects, circles, dashes, stars)
//  - DM Mono badge text, Bricolage/Instrument Serif display type
//  - drop "shadows" are simulated as a solid offset fill of the shadow color
//
// Each tier exports 4 faces: side, bodyTop (inside-of-box), lidTop, lidSide.
// Textures memoized per tier so 5 cards share one GPU upload.

import * as THREE from 'three';
import type { CrateTier } from './crate-types';
import { CRATE_TIERS } from './crate-types';

const INK = '#1d1a14';
const MONO = '"DM Mono", ui-monospace, Menlo, monospace';
const SERIF = '"Instrument Serif", "Bricolage Grotesque", ui-serif, Georgia, serif';

export interface CrateTextureSet {
  side: THREE.CanvasTexture;
  bodyTop: THREE.CanvasTexture;
  lidTop: THREE.CanvasTexture;
  lidSide: THREE.CanvasTexture;
}

const cache: Partial<Record<CrateTier, CrateTextureSet>> = {};

export function getCrateTextures(tier: CrateTier): CrateTextureSet {
  if (cache[tier]) return cache[tier]!;
  const set = build(tier);
  cache[tier] = set;
  return set;
}

function build(tier: CrateTier): CrateTextureSet {
  const s = CRATE_TIERS[tier];
  return {
    side:    toTex(paintSide(tier, s)),
    bodyTop: toTex(paintBodyInside(tier, s)),
    lidTop:  toTex(paintLidTop(tier, s)),
    lidSide: toTex(paintLidSide(tier, s)),
  };
}

/* --------------------------- shared helpers --------------------------- */

function canvasOf(size = 512) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  return { c, ctx: c.getContext('2d')! };
}

function toTex(c: HTMLCanvasElement): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

/** Chunky filled rectangle with thick ink border. */
function chunkyRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  fill: string, stroke = INK, strokeW = 6,
) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = strokeW;
  ctx.strokeRect(x + strokeW / 2, y + strokeW / 2, w - strokeW, h - strokeW);
}

/** Filled circle with thick ink outline. */
function chunkyCircle(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number,
  fill: string, stroke = INK, strokeW = 5,
) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = strokeW;
  ctx.stroke();
}

/** Dashed ink border inset by `pad`. */
function dashedFrame(ctx: CanvasRenderingContext2D, size: number, pad: number) {
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.setLineDash([14, 10]);
  ctx.strokeRect(pad, pad, size - pad * 2, size - pad * 2);
  ctx.setLineDash([]);
}

/** Chunky 5-point star with ink outline. */
function star(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number,
  fill: string, stroke = INK, strokeW = 4,
) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.45;
    const x = cx + Math.cos(a) * rr;
    const y = cy + Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(x, y);
    else         ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = strokeW;
  ctx.lineJoin = 'round';
  ctx.stroke();
}

/** Code badge in the corner — a chunky pill with DM Mono label. */
function codeBadge(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, tone: string) {
  const padX = 14, padY = 8;
  ctx.font = `bold 22px ${MONO}`;
  const w = ctx.measureText(text).width + padX * 2;
  const h = 22 + padY * 2;
  ctx.fillStyle = tone;
  roundRect(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = INK;
  ctx.stroke();
  ctx.fillStyle = INK;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + padX, y + h / 2 + 1);
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

/* ------------------------------- side (shared) ------------------------- */

function paintSide(tier: CrateTier, s: ReturnType<typeof getStyle>): HTMLCanvasElement {
  const { c, ctx } = canvasOf(512);
  // Flat body fill
  ctx.fillStyle = s.body;
  ctx.fillRect(0, 0, 512, 512);
  // Dashed inner frame in ink
  dashedFrame(ctx, 512, 36);

  // Big tone-block "seal" in the middle of the side
  const seal = CRATE_TIERS[tier].accent;
  chunkyRect(ctx, 120, 160, 272, 192, seal, INK, 6);

  // Per-tier decoration inside the seal
  tierSideInner(ctx, tier, s);

  // Code badge corner
  codeBadge(ctx, s.code, 36, 444, s.body === INK ? '#fdf6e6' : '#fdf6e6');

  // Top/bottom ink strip — chunky edge
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, 512, 14);
  ctx.fillRect(0, 498, 512, 14);

  return c;
}

function tierSideInner(ctx: CanvasRenderingContext2D, tier: CrateTier, s: ReturnType<typeof getStyle>) {
  const cx = 256, cy = 256;
  const onInk = s.body === INK;
  const onInkText = '#fdf6e6';

  if (tier === 'paper') {
    // Butter square with "P" in serif
    ctx.fillStyle = INK;
    ctx.font = `bold 120px ${SERIF}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('P', cx, cy + 6);
  } else if (tier === 'cardboard') {
    // FRAGILE label on ink box
    ctx.fillStyle = '#fdf6e6';
    ctx.font = `bold 32px ${MONO}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('FRAGILE', cx, cy - 22);
    // little dashed arrow row
    ctx.fillStyle = '#ffd84d';
    for (let i = 0; i < 6; i++) ctx.fillRect(150 + i * 36, cy + 18, 24, 8);
  } else if (tier === 'wooden') {
    // star cluster
    star(ctx, cx - 60, cy, 34, '#ffd84d', INK, 4);
    star(ctx, cx + 60, cy, 34, '#ffd84d', INK, 4);
    star(ctx, cx, cy - 36, 22, '#b9d9ff', INK, 3);
  } else if (tier === 'metal') {
    // cream rivet dots + pink vault label
    for (const [px, py] of [[160, 200], [256, 200], [352, 200], [160, 312], [352, 312]] as [number, number][]) {
      chunkyCircle(ctx, px, py, 14, '#fdf6e6', INK, 3);
    }
    ctx.fillStyle = '#ffc8e0';
    ctx.font = `bold 30px ${MONO}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('VAULT', cx, cy + 56);
  } else {
    // crystal — faceted gem block
    ctx.save();
    ctx.translate(cx, cy);
    drawFacetedGem(ctx, 80, ['#ffd84d', '#b6f0c6', '#ffc8e0', '#dcc7ff']);
    ctx.restore();
  }

  // Tier label text above seal
  ctx.fillStyle = onInk ? onInkText : INK;
  ctx.font = `bold 18px ${MONO}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(CRATE_TIERS[tier].label.toUpperCase(), cx, 128);
}

/* ------------------------- body inside (top face) --------------------- */

function paintBodyInside(tier: CrateTier, s: ReturnType<typeof getStyle>): HTMLCanvasElement {
  const { c, ctx } = canvasOf(512);
  // Inside is darker tone — use ink for dark tiers, butter-ink for butter, etc.
  const inside = darken(s.body);
  ctx.fillStyle = inside;
  ctx.fillRect(0, 0, 512, 512);
  // Border rim
  ctx.strokeStyle = INK;
  ctx.lineWidth = 24;
  ctx.strokeRect(12, 12, 488, 488);
  // decorative dots so texture isn't empty when lid is off
  ctx.fillStyle = INK;
  for (let x = 80; x < 512; x += 80) {
    for (let y = 80; y < 512; y += 80) {
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  return c;
}

/* --------------------------------- lid top --------------------------- */

function paintLidTop(tier: CrateTier, s: ReturnType<typeof getStyle>): HTMLCanvasElement {
  const { c, ctx } = canvasOf(512);
  ctx.fillStyle = s.body;
  ctx.fillRect(0, 0, 512, 512);

  // Ink frame
  chunkyRect(ctx, 20, 20, 472, 472, s.body, INK, 8);

  if (tier === 'paper') {
    // Butter wrap band crossing diagonally
    ctx.fillStyle = s.accent;
    ctx.fillRect(0, 220, 512, 72);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.strokeRect(0, 220, 512, 72);
    // Bow knot block
    chunkyCircle(ctx, 256, 256, 52, s.body, INK, 6);
    ctx.fillStyle = INK;
    ctx.font = `bold 64px ${SERIF}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('P', 256, 262);
  } else if (tier === 'cardboard') {
    // Packing tape strip — cream band
    chunkyRect(ctx, 0, 208, 512, 96, '#fdf6e6', INK, 6);
    // ProBlocks stamp
    ctx.save();
    ctx.translate(256, 256);
    ctx.rotate(-0.08);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.strokeRect(-110, -28, 220, 56);
    ctx.fillStyle = INK;
    ctx.font = `bold 28px ${MONO}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PROBLOCKS', 0, 0);
    ctx.restore();
  } else if (tier === 'wooden') {
    // 3 plank separators (chunky ink lines)
    ctx.fillStyle = INK;
    ctx.fillRect(0, 170, 512, 8);
    ctx.fillRect(0, 334, 512, 8);
    // Star medallion
    chunkyCircle(ctx, 256, 256, 64, '#fdf6e6', INK, 6);
    star(ctx, 256, 256, 42, '#ffd84d', INK, 4);
  } else if (tier === 'metal') {
    // cream warning stripes across the lid
    ctx.fillStyle = '#fdf6e6';
    ctx.fillRect(36, 400, 440, 56);
    ctx.fillStyle = INK;
    for (let i = 0; i < 12; i++) {
      ctx.save();
      ctx.translate(56 + i * 36, 428);
      ctx.rotate(-0.5);
      ctx.fillRect(-4, -28, 8, 56);
      ctx.restore();
    }
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.strokeRect(36, 400, 440, 56);
    // central keyhole — pink circle + ink pin
    chunkyCircle(ctx, 256, 212, 56, '#ffc8e0', INK, 6);
    ctx.fillStyle = INK;
    ctx.fillRect(240, 212, 32, 80);
    ctx.beginPath();
    ctx.arc(256, 212, 16, 0, Math.PI * 2);
    ctx.fill();
    // rivet quartet
    for (const [x, y] of [[56, 56], [456, 56], [56, 356], [456, 356]] as [number, number][]) {
      chunkyCircle(ctx, x, y, 16, '#fdf6e6', INK, 4);
    }
  } else {
    // crystal — faceted gem
    ctx.save();
    ctx.translate(256, 256);
    drawFacetedGem(ctx, 140, ['#ffd84d', '#b6f0c6', '#ffc8e0', '#dcc7ff', '#b9d9ff']);
    ctx.restore();
    // corner butter caps
    for (const [x, y] of [[44, 44], [420, 44], [44, 420], [420, 420]] as [number, number][]) {
      chunkyRect(ctx, x, y, 48, 48, s.accent, INK, 4);
    }
  }

  // Tier badge corner (always present)
  codeBadge(ctx, s.code, 40, 40, '#fdf6e6');
  return c;
}

/* ------------------------------- lid side ----------------------------- */

function paintLidSide(tier: CrateTier, s: ReturnType<typeof getStyle>): HTMLCanvasElement {
  const { c, ctx } = canvasOf(512);
  ctx.fillStyle = s.body;
  ctx.fillRect(0, 0, 512, 512);
  // heavy ink top/bottom strips to read as "lid rim"
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, 512, 32);
  ctx.fillRect(0, 480, 512, 32);
  // accent pill stripe
  ctx.fillStyle = s.accent;
  ctx.fillRect(0, 180, 512, 152);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 6;
  ctx.strokeRect(0, 180, 512, 152);
  // stamp text
  ctx.fillStyle = s.body === INK ? '#fdf6e6' : INK;
  ctx.font = `bold 54px ${SERIF}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(CRATE_TIERS[tier].label, 256, 256);
  return c;
}

/* ------------------------ faceted gem helper ------------------------- */

function drawFacetedGem(ctx: CanvasRenderingContext2D, size: number, tones: string[]) {
  const facets = tones.length;
  const r = size;
  for (let i = 0; i < facets; i++) {
    const a1 = (i / facets) * Math.PI * 2 - Math.PI / 2;
    const a2 = ((i + 1) / facets) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a1) * r, Math.sin(a1) * r);
    ctx.lineTo(Math.cos(a2) * r, Math.sin(a2) * r);
    ctx.closePath();
    ctx.fillStyle = tones[i % tones.length];
    ctx.fill();
  }
  ctx.strokeStyle = INK;
  ctx.lineWidth = 5;
  ctx.lineJoin = 'round';
  // outer outline
  ctx.beginPath();
  for (let i = 0; i < facets; i++) {
    const a = (i / facets) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else         ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
  // spokes
  ctx.lineWidth = 3;
  for (let i = 0; i < facets; i++) {
    const a = (i / facets) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    ctx.stroke();
  }
}

/* --------------------------- small utilities -------------------------- */

function darken(hex: string): string {
  const n = hex.replace('#', '');
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  const nr = Math.round(r * 0.55);
  const ng = Math.round(g * 0.55);
  const nb = Math.round(b * 0.55);
  return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
}

// Re-export the style getter so paintSide/paintLid can type their `s` param
// against the real CrateStyle. Keeps the file self-contained.
type _Style = typeof CRATE_TIERS[CrateTier];
function getStyle(tier: CrateTier): _Style { return CRATE_TIERS[tier]; }
