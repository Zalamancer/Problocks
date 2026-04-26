/**
 * PNG → tile sheet slicer. Loads an image source and chops it into a flat
 * list of tile data URLs using a fixed grid (cols × rows). Defaults to 4×4
 * to match the user's typical workflow.
 *
 * The output is plain `image/png` data URLs so they survive refresh in the
 * persisted Zustand store, and so the canvas can draw them through cheap
 * `<HTMLImageElement>` blits without keeping the source sheet around.
 */

export interface SliceResult {
  /** The original sheet as a data URL (so we can re-slice with new grid). */
  sheetDataUrl: string;
  /** Natural pixel size of a single sliced tile. */
  tileWidth: number;
  tileHeight: number;
  /** Sliced tile data URLs, ordered left-to-right, top-to-bottom. */
  tiles: string[];
}

export interface SliceOptions {
  cols?: number;
  rows?: number;
  /** Pixels of padding between tiles in the source sheet. */
  padding?: number;
  /** Pixels of margin around the entire sheet. */
  margin?: number;
}

/**
 * Read a File or Blob into an `image/png` data URL. We re-encode through
 * a canvas instead of using `FileReader.readAsDataURL` so JPEG / WebP /
 * GIF inputs all come out as PNG, matching the format the slicer emits
 * for individual tiles. Keeps the persisted store homogeneous.
 */
export async function fileToImage(file: File | Blob): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    return await loadImage(url);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Load a URL into an `HTMLImageElement`, resolving once it's fully decoded. */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

/** Convert an Image to a PNG data URL (preserves transparency). */
export function imageToDataUrl(img: HTMLImageElement): string {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2D context');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0);
  return canvas.toDataURL('image/png');
}

/**
 * Slice an image into a flat list of tile PNG data URLs. The default
 * 4×4 grid matches the user's "drop a PNG, get 16 tiles" workflow.
 * Padding and margin are pixel offsets in the source sheet — they're
 * stripped, so the emitted tiles are tight crops with no gutters.
 */
export function sliceImage(
  img: HTMLImageElement,
  options: SliceOptions = {},
): SliceResult {
  const cols = Math.max(1, Math.floor(options.cols ?? 4));
  const rows = Math.max(1, Math.floor(options.rows ?? 4));
  const padding = Math.max(0, Math.floor(options.padding ?? 0));
  const margin = Math.max(0, Math.floor(options.margin ?? 0));

  const sheetW = img.naturalWidth;
  const sheetH = img.naturalHeight;

  const usableW = sheetW - margin * 2 - padding * (cols - 1);
  const usableH = sheetH - margin * 2 - padding * (rows - 1);
  const tileWidth = Math.floor(usableW / cols);
  const tileHeight = Math.floor(usableH / rows);

  if (tileWidth <= 0 || tileHeight <= 0) {
    throw new Error(
      `Cannot slice ${sheetW}×${sheetH} into ${cols}×${rows} (tile size <= 0)`,
    );
  }

  const sheetDataUrl = imageToDataUrl(img);

  const cv = document.createElement('canvas');
  cv.width = tileWidth;
  cv.height = tileHeight;
  const ctx = cv.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2D context');
  ctx.imageSmoothingEnabled = false;

  const tiles: string[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const sx = margin + c * (tileWidth + padding);
      const sy = margin + r * (tileHeight + padding);
      ctx.clearRect(0, 0, tileWidth, tileHeight);
      ctx.drawImage(img, sx, sy, tileWidth, tileHeight, 0, 0, tileWidth, tileHeight);
      tiles.push(cv.toDataURL('image/png'));
    }
  }

  return { sheetDataUrl, tileWidth, tileHeight, tiles };
}

/** Slice straight from a File (uploaded PNG / JPG / WebP). */
export async function sliceFile(
  file: File,
  options: SliceOptions = {},
): Promise<SliceResult> {
  const img = await fileToImage(file);
  return sliceImage(img, options);
}
