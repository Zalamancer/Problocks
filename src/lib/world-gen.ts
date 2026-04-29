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
 * Two-octave value noise — base scale + a halved-amplitude octave at
 * 2× frequency. Output normalised to [0, 1). The 0.66 / 0.33 weights
 * keep the dominant biome shape from the low-frequency pass while the
 * high-frequency pass adds enough texture variation to avoid blocky
 * patches.
 */
function fractalNoise(x: number, y: number, seed: number, scale: number): number {
  const a = valueNoise(x / scale, y / scale, seed);
  const b = valueNoise(x / (scale * 0.5), y / (scale * 0.5), seed ^ 0x9747b28c);
  const v = a * 0.66 + b * 0.33;
  return v;
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
  /** Optional per-texture weights — see `pickTextureForNoise`. Lets the
   *  caller skew the distribution (e.g. lots of grass, a thin border of
   *  sand) without rebuilding the palette. */
  weights?: Record<string, number>;
  skipCell?: (cx: number, cy: number) => boolean;
}): Array<{ cx: number; cy: number; texId: string }> {
  const { x0, y0, x1, y1, seed, palette, scale = 18, weights, skipCell } = args;
  if (palette.length === 0) return [];
  const out: Array<{ cx: number; cy: number; texId: string }> = [];
  for (let cy = y0; cy < y1; cy++) {
    for (let cx = x0; cx < x1; cx++) {
      if (skipCell && skipCell(cx, cy)) continue;
      const n = fractalNoise(cx, cy, seed, scale);
      const texId = pickTextureForNoise(n, palette, weights);
      if (texId) out.push({ cx, cy, texId });
    }
  }
  return out;
}
