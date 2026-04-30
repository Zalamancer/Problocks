/**
 * Seeded procedural terrain generator for the main world.
 *
 * Produces a deterministic texture id per (x, y) cell from a 32-bit
 * seed using value-noise sampled at multiple octaves. The result is
 * mapped onto whichever tileset textures are available — typically a
 * "lower" (e.g. dirt, sand) and an "upper" (grass, snow) — so the
 * generator works with any uploaded tileset, not just a specific
 * curated one.
 *
 * Why value noise and not simplex: simplex has nicer continuity but
 * needs a 256-entry permutation table. Value noise is dead simple
 * (mulberry32 over an integer hash), works fine for biome blobs at
 * the resolution we need (a 2D tile grid, not pixel-art shading), and
 * keeps the file dependency-free. Two octaves are enough for the
 * "patches of terrain" look the main world wants — more octaves push
 * us toward fractal noise that the wang-tile autotiler can't blend
 * cleanly anyway.
 *
 * No React, no store deps. The caller owns deciding which cells to
 * write; this module only answers "given (x, y, seed, palette), what
 * texture id goes here?".
 */

/**
 * Mulberry32 PRNG — branchless, single multiply, perfect for seeded
 * deterministic sampling. Tested distribution; not crypto-grade.
 */
function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6D2B79F5) >>> 0;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Hashes (x, y, seed) → uniform [0, 1). Wang-style 32-bit avalanche
 * over the three integers. Stable across reloads given the same seed.
 */
function hash2(x: number, y: number, seed: number): number {
  let h = seed >>> 0;
  h = Math.imul(h ^ (x >>> 0), 0x9E3779B1);
  h = Math.imul(h ^ (y >>> 0), 0x85EBCA77);
  h = Math.imul(h ^ ((x ^ y) >>> 0), 0xC2B2AE3D);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** Smooth fade — Hermite interpolation, matches Perlin's smootherstep. */
function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/**
 * Value noise sampled at fractional (x, y). Bilinearly interpolates
 * the four corner hashes, then smooths via the Hermite fade. Output
 * is in [0, 1).
 */
function valueNoise(x: number, y: number, seed: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const tl = hash2(xi, yi, seed);
  const tr = hash2(xi + 1, yi, seed);
  const bl = hash2(xi, yi + 1, seed);
  const br = hash2(xi + 1, yi + 1, seed);
  const u = fade(xf);
  const v = fade(yf);
  return tl * (1 - u) * (1 - v) + tr * u * (1 - v) + bl * (1 - u) * v + br * u * v;
}

/**
 * N-octave value noise. Each octave doubles frequency and multiplies
 * amplitude by `roughness` (lacunarity 2, persistence configurable):
 * roughness 0.5 ≈ classic Perlin-style fractal noise; roughness near 1
 * gives a nearly-flat spectrum that looks scratchy; near 0 collapses to
 * the base octave. Output is normalised to [0, 1) by dividing the
 * accumulated value by the sum of amplitudes.
 *
 * Each octave also xors the seed with a different magic so adjacent
 * octaves don't share lattice corners — without that, the layered
 * value-noise grids visibly stack into a moiré pattern at high
 * frequencies.
 */
function fractalNoise(
  x: number,
  y: number,
  seed: number,
  scale: number,
  octaves: number,
  roughness: number,
): number {
  const oct = Math.max(1, Math.min(8, Math.floor(octaves)));
  const r = Math.max(0, Math.min(0.99, roughness));
  let amp = 1;
  let freq = 1 / scale;
  let sum = 0;
  let total = 0;
  let s = seed >>> 0;
  for (let i = 0; i < oct; i++) {
    sum += valueNoise(x * freq, y * freq, s) * amp;
    total += amp;
    amp *= r;
    freq *= 2;
    s = (s ^ 0x9747b28c) >>> 0;
  }
  return total > 0 ? sum / total : 0;
}

/**
 * Domain-warp the (x, y) sample coords using two low-frequency noise
 * fields. `strength` is in cells — at 0 there's no warp, at `scale`
 * the coords swing about half a biome's worth in each axis, which is
 * roughly the "lots of organic flow" amount. The two noise fields use
 * different seed offsets so they don't lock-step (which would rotate
 * the whole noise field rather than warp it).
 */
function warpCoords(
  x: number,
  y: number,
  seed: number,
  scale: number,
  strength: number,
): [number, number] {
  if (strength <= 0) return [x, y];
  const wScale = scale; // warp uses the same low-frequency scale as biomes.
  const a = valueNoise(x / wScale, y / wScale, (seed ^ 0x53A2C1D7) >>> 0);
  const b = valueNoise(x / wScale, y / wScale, (seed ^ 0xB87C1E29) >>> 0);
  // Map noise [0,1) → [-1,1) so the warp is signed (offsets in both
  // directions, not just positive shifts).
  return [
    x + (a * 2 - 1) * strength,
    y + (b * 2 - 1) * strength,
  ];
}

/**
 * Map a noise value to a texture id from the available palette.
 * When `weights` is provided, the noise range is split into bands
 * proportional to each entry's weight (so a 0.6 grass / 0.3 dirt /
 * 0.1 sand weighting gives 60% grass cover etc.). Without weights,
 * bands are equal-width — same behaviour as before.
 *
 * Zero-weight entries are skipped entirely; if every weight is zero
 * the function falls back to equal bands across the full palette so
 * the user never gets a blank map by accidentally clearing all
 * sliders.
 *
 * Returns null when the palette is empty — caller should skip the
 * cell so we don't write a null corner that the wang autotiler can't
 * resolve.
 */
export function pickTextureForNoise(
  noise: number,
  palette: string[],
  weights?: Record<string, number>,
): string | null {
  if (palette.length === 0) return null;

  if (weights) {
    // Build cumulative thresholds over the active (non-zero) entries.
    // Active palette is the same as the input palette when every
    // weight is positive; entries with weight 0 are skipped so they
    // claim no bandwidth and never get picked.
    let total = 0;
    for (const id of palette) {
      const w = weights[id];
      if (w && w > 0) total += w;
    }
    if (total > 0) {
      const target = Math.min(0.99999, Math.max(0, noise)) * total;
      let acc = 0;
      for (const id of palette) {
        const w = weights[id];
        if (!w || w <= 0) continue;
        acc += w;
        if (target < acc) return id;
      }
      // Numerical safety — if we somehow fell through (e.g. noise was
      // 1.0 exactly), return the last active entry.
      for (let i = palette.length - 1; i >= 0; i--) {
        const w = weights[palette[i]];
        if (w && w > 0) return palette[i];
      }
    }
    // Every weight is zero — fall through to the equal-bands path so
    // the user still sees a generated map.
  }

  // Band width = 1 / palette.length. Index = floor(noise * len), clamped
  // because `valueNoise` can return exactly 1.0 at lattice corners on
  // some hardware (rounding) which would index out of bounds.
  const i = Math.min(palette.length - 1, Math.max(0, Math.floor(noise * palette.length)));
  return palette[i];
}

/**
 * Generate a region of cells: returns an array of { cx, cy, texId }
 * triples, one per non-skipped cell. The caller writes these to a
 * tile-store layer's corners (paintCell) — usually inside an undo
 * group so the whole generation is one undo step.
 *
 * `skipCell(cx, cy)` lets the caller exclude cells that should NOT
 * be regenerated (e.g. the hand-painted default zone or cells the
 * player has already painted on this layer). Returning true means
 * "leave alone".
 */
export function generateRegion(args: {
  x0: number;
  y0: number;
  x1: number; // exclusive
  y1: number; // exclusive
  seed: number;
  /** Texture ids available to paint with. Order matters — earlier
   *  ids map to lower noise bands (typically lower terrain). */
  palette: string[];
  /** Spatial frequency of the dominant biome blob, in tile cells.
   *  Larger = bigger blobs. ~16 fits a 64-cell starter zone with a
   *  few patches inside. */
  scale?: number;
  /** How many fractal octaves to sum. 1 = smooth blobs only, 2 = the
   *  classic shape, 3-4 = increasingly detailed shorelines. Past ~4 the
   *  high-frequency noise just looks like static. */
  octaves?: number;
  /** Per-octave amplitude multiplier (a.k.a. persistence). 0.5 is the
   *  Perlin default; lower values dampen detail, higher values blow it
   *  up. Clamped to [0, 0.99] inside `fractalNoise`. */
  roughness?: number;
  /** Optional per-texture weights — see `pickTextureForNoise`. Lets the
   *  caller skew the distribution (e.g. lots of grass, a thin border of
   *  sand) without rebuilding the palette. */
  weights?: Record<string, number>;
  /**
   * Optional radial fade. When set, cells outside the inner radius see
   * their noise pulled toward 0 (so the lowest-band texture wins),
   * giving the map an "island" look. `radius` is the falloff midpoint
   * in cells; `inner` is the fraction of the radius that stays at full
   * strength (default 0.6). Beyond `radius` the noise is fully zeroed.
   */
  island?: { radius: number; inner?: number };
  /** Domain-warp strength in cells. 0 = perfectly round blobs (the
   *  default), `scale` ≈ moderately organic, `2*scale` = highly distorted.
   *  Warp shifts the sample coordinates by two offset noise fields
   *  before evaluating fractalNoise, which gives shorelines a flowing
   *  hand-drawn look without changing the band thresholds. */
  warp?: number;
  /**
   * Output mode. `cells` (default) writes one texture id per cell —
   * the caller paints all 4 of that cell's corners with the same id,
   * giving solid blocks of texture and crisp band edges. `corners`
   * writes one id per corner and lets the wang autotiler resolve
   * transitions naturally between adjacent corners with different
   * ids — much smoother shorelines, but requires the user's tilesets
   * to bridge every texture-pair their cells produce (otherwise some
   * cells fall through `resolveCellTile` and don't render). Use
   * `cells` when there's only one tileset chain, `corners` once
   * tilesets cover all transitions.
   */
  output?: 'cells' | 'corners';
  skipCell?: (cx: number, cy: number) => boolean;
}): Array<{ cx: number; cy: number; texId: string }> {
  const {
    x0, y0, x1, y1, seed, palette,
    scale = 18,
    octaves = 2,
    roughness = 0.5,
    weights, island, skipCell,
    warp = 0,
    output = 'cells',
  } = args;
  if (palette.length === 0) return [];
  const out: Array<{ cx: number; cy: number; texId: string }> = [];
  // Smootherstep helper for the falloff edge — same Hermite curve used
  // for the noise interpolation, kept inline so this file stays free of
  // module-internal coupling.
  const smoothstep = (edge0: number, edge1: number, t: number) => {
    const k = Math.max(0, Math.min(1, (t - edge0) / (edge1 - edge0)));
    return k * k * (3 - 2 * k);
  };
  const innerFrac = Math.max(0, Math.min(0.95, island?.inner ?? 0.6));
  // For corner mode, iterate one extra row/col on each axis so every
  // cell whose right/bottom corner is inside the rectangle still has
  // its corner sampled. The cell-mode loop bounds (x0..x1) describe
  // cell indices; corner indices share the same numbering but the
  // valid range goes one further.
  const xMax = output === 'corners' ? x1 + 1 : x1;
  const yMax = output === 'corners' ? y1 + 1 : y1;
  for (let cy = y0; cy < yMax; cy++) {
    for (let cx = x0; cx < xMax; cx++) {
      if (output === 'cells' && skipCell && skipCell(cx, cy)) continue;
      // Corners conceptually sit between cells, so a corner is "in the
      // reserve" when ALL 4 of its surrounding cells are. Cheaper test:
      // when `(cx, cy)` and `(cx-1, cy-1)` are both reserved.
      if (output === 'corners' && skipCell) {
        const aIn = skipCell(cx, cy);
        const bIn = skipCell(cx - 1, cy);
        const cIn = skipCell(cx, cy - 1);
        const dIn = skipCell(cx - 1, cy - 1);
        if (aIn && bIn && cIn && dIn) continue;
      }
      const [wx, wy] = warpCoords(cx, cy, seed, scale, warp);
      let n = fractalNoise(wx, wy, seed, scale, octaves, roughness);
      if (island && island.radius > 0) {
        const d = Math.hypot(cx, cy) / island.radius;
        // 1 inside `inner`, fades smoothly to 0 at d == 1.
        const falloff = 1 - smoothstep(innerFrac, 1, d);
        n = n * falloff;
      }
      const texId = pickTextureForNoise(n, palette, weights);
      if (texId) out.push({ cx, cy, texId });
    }
  }
  return out;
}
