/**
 * Pixel-classifying palette tools for the tile editor.
 *
 * The user's mental model: a Wang sheet is a handful of dominant
 * colours (e.g. greens for grass, blues for water, browns for dirt),
 * and adjusting "the green" should shift every green pixel together —
 * not just the cells whose dominant texture happens to be grass. So we
 * bucket pixels by HUE region (with a separate gray bucket for low-
 * saturation pixels), expose only the buckets the sheet actually
 * contains, and let the user dial hue/saturation/brightness per bucket.
 *
 * The editor stores the user's adjustments per (tileset × bucket); the
 * renderer pre-computes a recoloured copy of each tile when those
 * adjustments change and blits the recoloured version in place of the
 * original.
 */

export type BucketId =
  | 'red' | 'orange' | 'yellow' | 'green'
  | 'cyan' | 'blue' | 'purple' | 'magenta'
  | 'gray';

interface BucketDef {
  id: BucketId;
  /** Hue range [start, end) in degrees. `start > end` denotes a wrap. */
  hueStart: number;
  hueEnd: number;
  /** Human-readable name surfaced in the panel UI. */
  label: string;
}

/**
 * Hue bands tuned for typical pixel-art terrain palettes:
 *   - Brown / dirt sits in `orange` + `red` + `yellow`
 *   - Grass sits in `green`
 *   - Water sits in `cyan` + `blue`
 *   - Lava sits in `red` + `orange`
 * Bands are non-overlapping; every pixel maps to exactly one bucket.
 */
const BUCKET_DEFS: BucketDef[] = [
  { id: 'red',     hueStart: 345, hueEnd: 15,  label: 'Red' },
  { id: 'orange',  hueStart: 15,  hueEnd: 45,  label: 'Orange/Brown' },
  { id: 'yellow',  hueStart: 45,  hueEnd: 75,  label: 'Yellow' },
  { id: 'green',   hueStart: 75,  hueEnd: 165, label: 'Green' },
  { id: 'cyan',    hueStart: 165, hueEnd: 195, label: 'Cyan' },
  { id: 'blue',    hueStart: 195, hueEnd: 255, label: 'Blue' },
  { id: 'purple',  hueStart: 255, hueEnd: 285, label: 'Purple' },
  { id: 'magenta', hueStart: 285, hueEnd: 345, label: 'Magenta' },
];

/** Saturation below this counts as grayscale and goes to the `gray` bucket. */
const GRAY_SAT_THRESHOLD = 0.18;

export function bucketLabel(id: BucketId): string {
  const def = BUCKET_DEFS.find((d) => d.id === id);
  return def?.label ?? 'Gray';
}

export interface ColorBucket {
  id: BucketId;
  /** Mean RGB across all pixels in this bucket — used as the swatch
   *  preview colour. Not a clustering centroid; just an average. */
  representativeRgb: [number, number, number];
  /** Number of pixels in this bucket (after alpha cull). */
  pixelCount: number;
}

export interface PaletteAdjustment {
  /** Hue rotation in degrees (-180..180). */
  hue: number;
  /** Saturation multiplier (0..2). */
  saturation: number;
  /** Lightness multiplier (0.4..1.6). */
  brightness: number;
}

export const IDENTITY_ADJUSTMENT: PaletteAdjustment = {
  hue: 0,
  saturation: 1,
  brightness: 1,
};

export function isIdentity(a: PaletteAdjustment): boolean {
  return a.hue === 0 && a.saturation === 1 && a.brightness === 1;
}

/**
 * Classify a single RGB pixel into a hue bucket. Saturation below
 * `GRAY_SAT_THRESHOLD` collapses to `gray` regardless of hue (so dim
 * desaturated pixels don't get nudged when the user is editing a
 * vibrant colour band).
 */
export function classifyPixel(r: number, g: number, b: number): BucketId {
  const [h, s] = rgbToHsl(r / 255, g / 255, b / 255);
  if (s < GRAY_SAT_THRESHOLD) return 'gray';
  const hue = h * 360;
  for (const def of BUCKET_DEFS) {
    if (def.hueStart > def.hueEnd) {
      if (hue >= def.hueStart || hue < def.hueEnd) return def.id;
    } else if (hue >= def.hueStart && hue < def.hueEnd) {
      return def.id;
    }
  }
  return 'gray';
}

/** Standard RGB → HSL conversion. Inputs and outputs in [0, 1]. */
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [h / 6, s, l];
}

/** Standard HSL → RGB conversion. Inputs and outputs in [0, 1]. */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) return [l, l, l];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const f = (t: number): number => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 0.5) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [f(h + 1 / 3), f(h), f(h - 1 / 3)];
}

/**
 * Walk every pixel in a sheet PNG and bucket it. Buckets with too few
 * pixels (< `MIN_FRACTION` of the total) are dropped from the result so
 * the panel only shows colours actually present. Result is sorted by
 * pixel count descending so dominant colours appear first.
 */
const MIN_FRACTION = 0.015;

export async function analyzePalette(dataUrl: string): Promise<ColorBucket[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const cv = document.createElement('canvas');
        cv.width = img.naturalWidth;
        cv.height = img.naturalHeight;
        const ctx = cv.getContext('2d');
        if (!ctx) throw new Error('no 2d context');
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, cv.width, cv.height).data;
        const sums = new Map<BucketId, { r: number; g: number; b: number; count: number }>();
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
          if (a < 10) continue;
          const id = classifyPixel(r, g, b);
          const entry = sums.get(id);
          if (entry) {
            entry.r += r;
            entry.g += g;
            entry.b += b;
            entry.count++;
          } else {
            sums.set(id, { r, g, b, count: 1 });
          }
        }
        let total = 0;
        for (const e of sums.values()) total += e.count;
        if (total === 0) {
          resolve([]);
          return;
        }
        const out: ColorBucket[] = [];
        for (const [id, entry] of sums) {
          if (entry.count / total < MIN_FRACTION) continue;
          out.push({
            id,
            representativeRgb: [
              Math.round(entry.r / entry.count),
              Math.round(entry.g / entry.count),
              Math.round(entry.b / entry.count),
            ],
            pixelCount: entry.count,
          });
        }
        out.sort((a, b) => b.pixelCount - a.pixelCount);
        resolve(out);
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error('palette analyze: image load failed'));
    img.src = dataUrl;
  });
}

/**
 * Recolour an image by applying per-bucket HSL adjustments to every
 * pixel. Pixels whose bucket has no adjustment are passed through
 * unchanged. Returns a fresh `image/png` data URL.
 */
export async function recolorTile(
  sourceDataUrl: string,
  adjustments: Partial<Record<BucketId, PaletteAdjustment>>,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const cv = document.createElement('canvas');
        cv.width = img.naturalWidth;
        cv.height = img.naturalHeight;
        const ctx = cv.getContext('2d');
        if (!ctx) throw new Error('no 2d context');
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, cv.width, cv.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
          if (a < 10) continue;
          const id = classifyPixel(r, g, b);
          const adj = adjustments[id];
          if (!adj || isIdentity(adj)) continue;
          const [h, s, l] = rgbToHsl(r / 255, g / 255, b / 255);
          let nh = h + adj.hue / 360;
          nh = ((nh % 1) + 1) % 1;
          const ns = Math.max(0, Math.min(1, s * adj.saturation));
          const nl = Math.max(0, Math.min(1, l * adj.brightness));
          const [nr, ng, nb] = hslToRgb(nh, ns, nl);
          data[i] = Math.round(nr * 255);
          data[i + 1] = Math.round(ng * 255);
          data[i + 2] = Math.round(nb * 255);
        }
        ctx.putImageData(imgData, 0, 0);
        resolve(cv.toDataURL('image/png'));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error('recolor: image load failed'));
    img.src = sourceDataUrl;
  });
}

/**
 * True when at least one bucket adjustment in the record is non-identity.
 * Used by the renderer's fast-path to skip recolouring when the user
 * resets every slider.
 */
export function hasActiveAdjustments(
  adjustments: Partial<Record<BucketId, PaletteAdjustment>> | undefined,
): boolean {
  if (!adjustments) return false;
  for (const k of Object.keys(adjustments) as BucketId[]) {
    const a = adjustments[k];
    if (a && !isIdentity(a)) return true;
  }
  return false;
}

/**
 * Generate a masked copy of an image where only pixels classified into
 * the listed buckets remain — every other pixel becomes fully transparent.
 *
 * Used by the water-effect renderer: the wave's hue shift is composited
 * against this mask so it lands on blue/cyan pixels only, leaving any
 * connected dirt/grass pixels in transition tiles untouched.
 */
export async function maskTileByBuckets(
  sourceDataUrl: string,
  keepBuckets: BucketId[],
): Promise<string> {
  const keepSet = new Set(keepBuckets);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const cv = document.createElement('canvas');
        cv.width = img.naturalWidth;
        cv.height = img.naturalHeight;
        const ctx = cv.getContext('2d');
        if (!ctx) throw new Error('no 2d context');
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, cv.width, cv.height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
          if (a < 10) continue;
          const id = classifyPixel(r, g, b);
          if (!keepSet.has(id)) {
            data[i + 3] = 0;
          }
        }
        ctx.putImageData(imgData, 0, 0);
        resolve(cv.toDataURL('image/png'));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error('mask: image load failed'));
    img.src = sourceDataUrl;
  });
}
