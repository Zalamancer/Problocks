// Procedural texture atlas for the voxel engine. Draws every block face
// tile onto one canvas, then hands it to Three.js as a single
// NearestFilter texture so the whole world renders with one material and
// no external asset downloads (critical for low-end Chromebooks and
// offline use).
//
// Layout: ATLAS_COLS × ATLAS_ROWS grid of TILE_PX² tiles. The tile
// indices referenced in blocks.js must stay in sync with the paint
// order below.

import { ATLAS_COLS, ATLAS_ROWS, TILE_PX, ATLAS_W, ATLAS_H, TILE } from './blocks.js';

// Tiny deterministic PRNG so atlas looks the same on every reload.
function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6D2B79F5;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function fillRect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function speckle(ctx, tx, ty, baseHex, darkHex, lightHex, density, rand) {
  // Flat base then random darker / lighter pixels for a chunky noise look.
  fillRect(ctx, tx, ty, TILE_PX, TILE_PX, baseHex);
  for (let y = 0; y < TILE_PX; y++) {
    for (let x = 0; x < TILE_PX; x++) {
      const r = rand();
      if (r < density * 0.5) fillRect(ctx, tx + x, ty + y, 1, 1, darkHex);
      else if (r > 1 - density * 0.5) fillRect(ctx, tx + x, ty + y, 1, 1, lightHex);
    }
  }
}

function paintGrassTop(ctx, tx, ty, rand) {
  speckle(ctx, tx, ty, '#4a8f3c', '#356a28', '#6bbb54', 0.55, rand);
}
function paintGrassSide(ctx, tx, ty, rand) {
  // Dirt body with green top band and a few grass tufts spilling down.
  speckle(ctx, tx, ty, '#7c5a3a', '#5a3f26', '#9a7147', 0.45, rand);
  fillRect(ctx, tx, ty, TILE_PX, 3, '#4a8f3c');
  for (let x = 0; x < TILE_PX; x++) {
    if (rand() < 0.35) fillRect(ctx, tx + x, ty + 3, 1, 1, '#356a28');
    if (rand() < 0.25) fillRect(ctx, tx + x, ty + 4, 1, 1, '#4a8f3c');
  }
}
function paintDirt(ctx, tx, ty, rand) {
  speckle(ctx, tx, ty, '#7c5a3a', '#5a3f26', '#9a7147', 0.55, rand);
}
function paintStone(ctx, tx, ty, rand) {
  speckle(ctx, tx, ty, '#878787', '#5f5f5f', '#a3a3a3', 0.5, rand);
}
function paintCobble(ctx, tx, ty, rand) {
  // Rock chunks with darker mortar between them.
  fillRect(ctx, tx, ty, TILE_PX, TILE_PX, '#5a5a5a');
  const cells = 4;
  const s = TILE_PX / cells;
  for (let cy = 0; cy < cells; cy++) {
    for (let cx = 0; cx < cells; cx++) {
      const px = tx + cx * s + 1;
      const py = ty + cy * s + 1;
      const w = s - 2;
      const h = s - 2;
      const shade = 0.7 + rand() * 0.3;
      const c = Math.floor(135 * shade);
      fillRect(ctx, px, py, w, h, `rgb(${c},${c},${c})`);
    }
  }
}
function paintLogTop(ctx, tx, ty, rand) {
  // Concentric rings.
  fillRect(ctx, tx, ty, TILE_PX, TILE_PX, '#b1834a');
  const cx = TILE_PX / 2;
  const cy = TILE_PX / 2;
  for (let y = 0; y < TILE_PX; y++) {
    for (let x = 0; x < TILE_PX; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const d = Math.sqrt(dx * dx + dy * dy);
      const ring = Math.floor(d) % 3;
      if (ring === 0) fillRect(ctx, tx + x, ty + y, 1, 1, '#8a5f33');
      if (rand() < 0.06) fillRect(ctx, tx + x, ty + y, 1, 1, '#6f4924');
    }
  }
}
function paintLogSide(ctx, tx, ty, rand) {
  // Vertical bark stripes.
  fillRect(ctx, tx, ty, TILE_PX, TILE_PX, '#6f4924');
  for (let x = 0; x < TILE_PX; x++) {
    const shade = 0.75 + rand() * 0.35;
    const r = Math.floor(111 * shade);
    const g = Math.floor(73 * shade);
    const b = Math.floor(36 * shade);
    fillRect(ctx, tx + x, ty, 1, TILE_PX, `rgb(${r},${g},${b})`);
    if (rand() < 0.15) {
      const y = Math.floor(rand() * TILE_PX);
      fillRect(ctx, tx + x, ty + y, 1, 1, '#4a2e15');
    }
  }
}
function paintPlanks(ctx, tx, ty, rand) {
  // Horizontal planks separated by dark seams.
  fillRect(ctx, tx, ty, TILE_PX, TILE_PX, '#b98b52');
  const plankH = 4;
  for (let py = 0; py < TILE_PX; py += plankH) {
    // Slight shade variation per plank.
    const shade = 0.85 + rand() * 0.25;
    const r = Math.floor(185 * shade);
    const g = Math.floor(139 * shade);
    const b = Math.floor(82 * shade);
    fillRect(ctx, tx, ty + py, TILE_PX, plankH - 1, `rgb(${r},${g},${b})`);
    fillRect(ctx, tx, ty + py + plankH - 1, TILE_PX, 1, '#6a4824');
    // Random nail / knot.
    if (rand() < 0.3) {
      const nx = Math.floor(rand() * TILE_PX);
      fillRect(ctx, tx + nx, ty + py + 1, 1, 2, '#4a2f16');
    }
  }
}
function paintLeaves(ctx, tx, ty, rand) {
  speckle(ctx, tx, ty, '#2f5a23', '#1d3a15', '#4a7a35', 0.6, rand);
  // A few random gaps to suggest foliage.
  for (let i = 0; i < 8; i++) {
    const x = Math.floor(rand() * TILE_PX);
    const y = Math.floor(rand() * TILE_PX);
    fillRect(ctx, tx + x, ty + y, 1, 1, '#0d1f08');
  }
}
function paintSand(ctx, tx, ty, rand) {
  speckle(ctx, tx, ty, '#e6d08a', '#c9b46a', '#f3e3a8', 0.4, rand);
}
function paintBrick(ctx, tx, ty, rand) {
  // Staggered brick rows separated by mortar.
  fillRect(ctx, tx, ty, TILE_PX, TILE_PX, '#3a3a3a');
  const rowH = 4;
  const brickW = 8;
  for (let ry = 0; ry < TILE_PX / rowH; ry++) {
    const off = (ry % 2) * (brickW / 2);
    for (let bx = -brickW; bx < TILE_PX; bx += brickW) {
      const px = tx + bx + off;
      const py = ty + ry * rowH;
      const shade = 0.85 + rand() * 0.3;
      const r = Math.floor(170 * shade);
      const g = Math.floor(70 * shade);
      const b = Math.floor(55 * shade);
      fillRect(ctx, px + 1, py + 1, brickW - 2, rowH - 2, `rgb(${r},${g},${b})`);
    }
  }
}
function paintGlass(ctx, tx, ty) {
  fillRect(ctx, tx, ty, TILE_PX, TILE_PX, 'rgba(180,220,235,0.35)');
  fillRect(ctx, tx, ty, TILE_PX, 1, '#d9eef5');
  fillRect(ctx, tx, ty + TILE_PX - 1, TILE_PX, 1, '#d9eef5');
  fillRect(ctx, tx, ty, 1, TILE_PX, '#d9eef5');
  fillRect(ctx, tx + TILE_PX - 1, ty, 1, TILE_PX, '#d9eef5');
}
function paintWater(ctx, tx, ty, rand) {
  speckle(ctx, tx, ty, '#2e6fb8', '#1f5494', '#4a8bd4', 0.35, rand);
}
function paintMetal(ctx, tx, ty, rand, base, dark, light) {
  // Stone body with a few sparkly flecks of the ore color.
  speckle(ctx, tx, ty, '#878787', '#5f5f5f', '#a3a3a3', 0.45, rand);
  for (let i = 0; i < 14; i++) {
    const x = Math.floor(rand() * TILE_PX);
    const y = Math.floor(rand() * TILE_PX);
    const r2 = rand();
    const c = r2 < 0.33 ? dark : r2 > 0.66 ? light : base;
    fillRect(ctx, tx + x, ty + y, 1, 1, c);
  }
}
function paintGold(ctx, tx, ty, rand) {
  paintMetal(ctx, tx, ty, rand, '#f2c84a', '#b48a1e', '#ffe386');
}
function paintIron(ctx, tx, ty, rand) {
  paintMetal(ctx, tx, ty, rand, '#c9a585', '#8f6f52', '#ebc9ab');
}
function paintDiamond(ctx, tx, ty, rand) {
  paintMetal(ctx, tx, ty, rand, '#5be0d3', '#2d9b8e', '#9ff0e8');
}

// ---------------------------------------------------------------------
// VIBRANT pack — mirrors the classic structure (same rings, plank rows,
// brick staggering, cobble cells, ore flecks) but with high-saturation
// palettes so the world reads as a toyetic / arcade skin.
// ---------------------------------------------------------------------
function vibrantGrassTop(ctx, tx, ty, rand) {
  speckle(ctx, tx, ty, '#45e24b', '#14a82f', '#9cff86', 0.6, rand);
}
function vibrantGrassSide(ctx, tx, ty, rand) {
  speckle(ctx, tx, ty, '#c96a28', '#7a2f0a', '#ff9a4a', 0.5, rand);
  fillRect(ctx, tx, ty, TILE_PX, 3, '#45e24b');
  for (let x = 0; x < TILE_PX; x++) {
    if (rand() < 0.35) fillRect(ctx, tx + x, ty + 3, 1, 1, '#14a82f');
    if (rand() < 0.25) fillRect(ctx, tx + x, ty + 4, 1, 1, '#9cff86');
  }
}
function vibrantDirt(ctx, tx, ty, rand) {
  speckle(ctx, tx, ty, '#c96a28', '#7a2f0a', '#ff9a4a', 0.55, rand);
}
function vibrantStone(ctx, tx, ty, rand) {
  // Candy lavender stone — still reads as rock but pops on screen.
  speckle(ctx, tx, ty, '#9a8cff', '#5e4ecc', '#cfc4ff', 0.5, rand);
}
function vibrantCobble(ctx, tx, ty, rand) {
  fillRect(ctx, tx, ty, TILE_PX, TILE_PX, '#3b2a6e');
  const cells = 4;
  const s = TILE_PX / cells;
  for (let cy = 0; cy < cells; cy++) {
    for (let cx = 0; cx < cells; cx++) {
      const px = tx + cx * s + 1;
      const py = ty + cy * s + 1;
      const w = s - 2;
      const h = s - 2;
      const shade = 0.7 + rand() * 0.3;
      // Rotate between three bright cobble hues.
      const k = (cx + cy) % 3;
      const r = Math.floor((k === 0 ? 200 : k === 1 ? 110 : 250) * shade);
      const g = Math.floor((k === 0 ? 120 : k === 1 ? 200 : 170) * shade);
      const b = Math.floor((k === 0 ? 255 : k === 1 ? 255 : 110) * shade);
      fillRect(ctx, px, py, w, h, `rgb(${r},${g},${b})`);
    }
  }
}
function vibrantLogTop(ctx, tx, ty, rand) {
  fillRect(ctx, tx, ty, TILE_PX, TILE_PX, '#ffb54a');
  const cx = TILE_PX / 2;
  const cy = TILE_PX / 2;
  for (let y = 0; y < TILE_PX; y++) {
    for (let x = 0; x < TILE_PX; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const d = Math.sqrt(dx * dx + dy * dy);
      const ring = Math.floor(d) % 3;
      if (ring === 0) fillRect(ctx, tx + x, ty + y, 1, 1, '#d44a22');
      if (rand() < 0.06) fillRect(ctx, tx + x, ty + y, 1, 1, '#8a1e05');
    }
  }
}
function vibrantLogSide(ctx, tx, ty, rand) {
  fillRect(ctx, tx, ty, TILE_PX, TILE_PX, '#a83510');
  for (let x = 0; x < TILE_PX; x++) {
    const shade = 0.75 + rand() * 0.4;
    const r = Math.floor(215 * shade);
    const g = Math.floor(95 * shade);
    const b = Math.floor(35 * shade);
    fillRect(ctx, tx + x, ty, 1, TILE_PX, `rgb(${r},${g},${b})`);
    if (rand() < 0.15) {
      const y = Math.floor(rand() * TILE_PX);
      fillRect(ctx, tx + x, ty + y, 1, 1, '#521504');
    }
  }
}
function vibrantPlanks(ctx, tx, ty, rand) {
  fillRect(ctx, tx, ty, TILE_PX, TILE_PX, '#ffd633');
  const plankH = 4;
  for (let py = 0; py < TILE_PX; py += plankH) {
    const shade = 0.85 + rand() * 0.3;
    const r = Math.floor(255 * shade);
    const g = Math.floor(200 * shade);
    const b = Math.floor(60 * shade);
    fillRect(ctx, tx, ty + py, TILE_PX, plankH - 1, `rgb(${Math.min(r, 255)},${g},${b})`);
    fillRect(ctx, tx, ty + py + plankH - 1, TILE_PX, 1, '#b0751a');
    if (rand() < 0.3) {
      const nx = Math.floor(rand() * TILE_PX);
      fillRect(ctx, tx + nx, ty + py + 1, 1, 2, '#6a3e0c');
    }
  }
}
function vibrantLeaves(ctx, tx, ty, rand) {
  speckle(ctx, tx, ty, '#3cff5a', '#0cb02a', '#bfffa8', 0.65, rand);
  for (let i = 0; i < 8; i++) {
    const x = Math.floor(rand() * TILE_PX);
    const y = Math.floor(rand() * TILE_PX);
    fillRect(ctx, tx + x, ty + y, 1, 1, '#055a15');
  }
}
function vibrantSand(ctx, tx, ty, rand) {
  speckle(ctx, tx, ty, '#ffea66', '#d9b020', '#fff8a0', 0.5, rand);
}
function vibrantBrick(ctx, tx, ty, rand) {
  fillRect(ctx, tx, ty, TILE_PX, TILE_PX, '#1a1a1a');
  const rowH = 4;
  const brickW = 8;
  for (let ry = 0; ry < TILE_PX / rowH; ry++) {
    const off = (ry % 2) * (brickW / 2);
    for (let bx = -brickW; bx < TILE_PX; bx += brickW) {
      const px = tx + bx + off;
      const py = ty + ry * rowH;
      const shade = 0.85 + rand() * 0.35;
      const r = Math.floor(255 * shade);
      const g = Math.floor(60 * shade);
      const b = Math.floor(90 * shade);
      fillRect(ctx, px + 1, py + 1, brickW - 2, rowH - 2, `rgb(${Math.min(r, 255)},${g},${b})`);
    }
  }
}
function vibrantGlass(ctx, tx, ty) {
  fillRect(ctx, tx, ty, TILE_PX, TILE_PX, 'rgba(80,240,255,0.4)');
  fillRect(ctx, tx, ty, TILE_PX, 1, '#a8f8ff');
  fillRect(ctx, tx, ty + TILE_PX - 1, TILE_PX, 1, '#a8f8ff');
  fillRect(ctx, tx, ty, 1, TILE_PX, '#a8f8ff');
  fillRect(ctx, tx + TILE_PX - 1, ty, 1, TILE_PX, '#a8f8ff');
}
function vibrantWater(ctx, tx, ty, rand) {
  speckle(ctx, tx, ty, '#00a8ff', '#0057c2', '#7fd9ff', 0.4, rand);
}
function vibrantMetal(ctx, tx, ty, rand, base, dark, light, hostBase, hostDark, hostLight) {
  speckle(ctx, tx, ty, hostBase, hostDark, hostLight, 0.45, rand);
  for (let i = 0; i < 22; i++) {
    const x = Math.floor(rand() * TILE_PX);
    const y = Math.floor(rand() * TILE_PX);
    const r2 = rand();
    const c = r2 < 0.33 ? dark : r2 > 0.66 ? light : base;
    fillRect(ctx, tx + x, ty + y, 1, 1, c);
  }
}
function vibrantGold(ctx, tx, ty, rand) {
  vibrantMetal(ctx, tx, ty, rand, '#ffe033', '#b48a1e', '#fff48a', '#9a8cff', '#5e4ecc', '#cfc4ff');
}
function vibrantIron(ctx, tx, ty, rand) {
  vibrantMetal(ctx, tx, ty, rand, '#ff7aa8', '#c23f72', '#ffc8dc', '#9a8cff', '#5e4ecc', '#cfc4ff');
}
function vibrantDiamond(ctx, tx, ty, rand) {
  vibrantMetal(ctx, tx, ty, rand, '#00d4ff', '#0091c2', '#a8f0ff', '#9a8cff', '#5e4ecc', '#cfc4ff');
}

// Pack registries — TILE id → painter fn. `classic` is the original
// pack preserved verbatim; `vibrant` swaps every painter for a
// saturated counterpart.
function buildPack(painters) {
  const out = [];
  out[TILE.GRASS_TOP]  = painters.grassTop;
  out[TILE.GRASS_SIDE] = painters.grassSide;
  out[TILE.DIRT]       = painters.dirt;
  out[TILE.STONE]      = painters.stone;
  out[TILE.COBBLE]     = painters.cobble;
  out[TILE.LOG_TOP]    = painters.logTop;
  out[TILE.LOG_SIDE]   = painters.logSide;
  out[TILE.PLANKS]     = painters.planks;
  out[TILE.LEAVES]     = painters.leaves;
  out[TILE.SAND]       = painters.sand;
  out[TILE.BRICK]      = painters.brick;
  out[TILE.GLASS]      = painters.glass;
  out[TILE.WATER]      = painters.water;
  out[TILE.GOLD]       = painters.gold;
  out[TILE.IRON]       = painters.iron;
  out[TILE.DIAMOND]    = painters.diamond;
  return out;
}

const PACKS = {
  classic: buildPack({
    grassTop: paintGrassTop, grassSide: paintGrassSide, dirt: paintDirt,
    stone: paintStone, cobble: paintCobble, logTop: paintLogTop,
    logSide: paintLogSide, planks: paintPlanks, leaves: paintLeaves,
    sand: paintSand, brick: paintBrick, glass: paintGlass,
    water: paintWater, gold: paintGold, iron: paintIron, diamond: paintDiamond,
  }),
  vibrant: buildPack({
    grassTop: vibrantGrassTop, grassSide: vibrantGrassSide, dirt: vibrantDirt,
    stone: vibrantStone, cobble: vibrantCobble, logTop: vibrantLogTop,
    logSide: vibrantLogSide, planks: vibrantPlanks, leaves: vibrantLeaves,
    sand: vibrantSand, brick: vibrantBrick, glass: vibrantGlass,
    water: vibrantWater, gold: vibrantGold, iron: vibrantIron, diamond: vibrantDiamond,
  }),
};

export const TEXTURE_PACKS = Object.keys(PACKS);
export const DEFAULT_TEXTURE_PACK = 'classic';

/**
 * Build the atlas canvas for a given pack ("classic" | "vibrant").
 * Returns the HTMLCanvasElement so the caller can wrap it in a
 * THREE.CanvasTexture and dispose when done.
 */
export function createAtlasCanvas(packId = DEFAULT_TEXTURE_PACK) {
  const painters = PACKS[packId] || PACKS[DEFAULT_TEXTURE_PACK];
  const c = document.createElement('canvas');
  c.width = ATLAS_W;
  c.height = ATLAS_H;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const rand = mulberry32(1337);

  for (let tid = 0; tid < ATLAS_COLS * ATLAS_ROWS; tid++) {
    const col = tid % ATLAS_COLS;
    const row = Math.floor(tid / ATLAS_COLS);
    const tx = col * TILE_PX;
    const ty = row * TILE_PX;
    const paint = painters[tid];
    if (paint) paint(ctx, tx, ty, rand);
    else {
      // Unmapped tile — magenta so mistakes are obvious.
      fillRect(ctx, tx, ty, TILE_PX, TILE_PX, '#ff00ff');
    }
  }
  return c;
}

/**
 * Return UV bounds { u0, v0, u1, v1 } for a tile in the atlas. Using
 * a small inset on the V axis so neighbor tiles don't bleed through
 * with NearestFilter at oblique angles (classic minecraft-clone gotcha).
 */
export function tileUV(tileId) {
  const col = tileId % ATLAS_COLS;
  const row = Math.floor(tileId / ATLAS_COLS);
  // Three.js UV origin is bottom-left; canvas origin is top-left, so we
  // flip the row.
  const flippedRow = ATLAS_ROWS - 1 - row;
  const eps = 0.5 / ATLAS_W; // half-pixel inset
  const u0 = col / ATLAS_COLS + eps;
  const u1 = (col + 1) / ATLAS_COLS - eps;
  const v0 = flippedRow / ATLAS_ROWS + eps;
  const v1 = (flippedRow + 1) / ATLAS_ROWS - eps;
  return { u0, v0, u1, v1 };
}

/**
 * Wrap the atlas canvas in a THREE texture configured for blocky,
 * filter-free pixel art. THREE is passed in so the host app owns the
 * version (matches the voxel engine plan).
 */
export function createAtlasTexture(THREE, { pack = DEFAULT_TEXTURE_PACK } = {}) {
  const canvas = createAtlasCanvas(pack);
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  // colorSpace landed in r152 — newer three versions want this for correct color.
  if ('colorSpace' in tex && THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
