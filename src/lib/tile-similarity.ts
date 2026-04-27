/**
 * Pixel-similarity comparison for Wang-tile pure-tiles.
 *
 * The auto-tile resolver bridges two textures only when they share the
 * same `textureId`. So when the user uploads a second sheet whose UPPER
 * tile *looks* the same as another sheet's UPPER (e.g. PixelLab generated
 * a "grass→water" sheet and a "grass→dirt" sheet, with similar but not
 * byte-identical grass tiles), we auto-link the texture ids by detecting
 * visual similarity at upload time.
 *
 * The comparison decodes both PNG data URLs into a fixed 16×16 RGBA buffer
 * and computes 1 − Σ|Δ|/(N·255). Identical pixels score 1; completely
 * inverted score 0. The `TILE_SIMILARITY_THRESHOLD` is tuned to catch
 * "the same conceptual texture re-encoded" while rejecting visually
 * distinct terrains (e.g. light grass vs. dark grass).
 */

const COMPARE_SIZE = 16;

/** Match threshold — pure-tiles whose similarity ≥ this are treated as
 *  the same texture and have their ids auto-linked. */
export const TILE_SIMILARITY_THRESHOLD = 0.85;

async function dataUrlToImageData(dataUrl: string, size: number): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const cv = document.createElement('canvas');
        cv.width = size;
        cv.height = size;
        const ctx = cv.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get 2D context'));
          return;
        }
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, size, size);
        resolve(ctx.getImageData(0, 0, size, size));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error('Failed to load image for similarity'));
    img.src = dataUrl;
  });
}

/**
 * Return a 0..1 similarity score for two PNG data URLs. 1 = byte-equal at
 * the comparison resolution; 0 = completely inverted. Failures (broken
 * data URLs etc.) return 0 so the caller treats them as "no match" rather
 * than crashing the upload flow.
 */
export async function tileSimilarity(a: string, b: string): Promise<number> {
  if (a === b) return 1;
  try {
    const [ia, ib] = await Promise.all([
      dataUrlToImageData(a, COMPARE_SIZE),
      dataUrlToImageData(b, COMPARE_SIZE),
    ]);
    if (ia.data.length !== ib.data.length || ia.data.length === 0) return 0;
    let totalDiff = 0;
    for (let i = 0; i < ia.data.length; i++) {
      totalDiff += Math.abs(ia.data[i] - ib.data[i]);
    }
    return 1 - totalDiff / (ia.data.length * 255);
  } catch {
    return 0;
  }
}

/**
 * Cache of dataUrl → decoded ImageData buffer (raw Uint8ClampedArray) so
 * the same existing-sheet pure-tile isn't re-decoded for every new upload
 * comparison. Invalidated implicitly: dataUrls are content-addressed so
 * a different bytes produces a different cache key.
 */
const cache = new Map<string, Uint8ClampedArray>();

async function getCached(dataUrl: string): Promise<Uint8ClampedArray> {
  const hit = cache.get(dataUrl);
  if (hit) return hit;
  const img = await dataUrlToImageData(dataUrl, COMPARE_SIZE);
  // Cap cache to ~256 entries to bound memory; oldest evicted.
  if (cache.size >= 256) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(dataUrl, img.data);
  return img.data;
}

/**
 * Faster path for the auto-link loop: decode each unique dataUrl once and
 * compare against many candidates in O(N·pixels). Same scoring as
 * `tileSimilarity` so callers can mix and match.
 */
export async function tileSimilarityCached(a: string, b: string): Promise<number> {
  if (a === b) return 1;
  try {
    const [da, db] = await Promise.all([getCached(a), getCached(b)]);
    if (da.length !== db.length || da.length === 0) return 0;
    let totalDiff = 0;
    for (let i = 0; i < da.length; i++) {
      totalDiff += Math.abs(da[i] - db[i]);
    }
    return 1 - totalDiff / (da.length * 255);
  } catch {
    return 0;
  }
}
