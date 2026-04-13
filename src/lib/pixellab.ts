/**
 * PixelLab API client — server-side only.
 * Calls https://api.pixellab.ai/v2 directly.
 */
import { deflateSync } from 'zlib';

const PIXELLAB_BASE = 'https://api.pixellab.ai/v2';

function getKey(): string {
  const key = process.env.PIXELLAB_API_KEY;
  if (!key) throw new Error('PIXELLAB_API_KEY not configured');
  return key;
}

// --- Public API ---

/**
 * Generate a pixel art sprite via PixelLab.
 * Returns a data URL (image/png base64).
 */
export async function generateSprite(
  description: string,
  width: number,
  height: number,
): Promise<string> {
  // map-objects accepts {description, width, height} — perfect for game sprites
  const data = await callApi('map-objects', { description, width, height });

  // Handle async job
  if (data.job_id || data.background_job_id) {
    const jobId = (data.job_id || data.background_job_id) as string;
    const result = await pollJob(jobId);
    return extractImageDataUrl(result);
  }

  return extractImageDataUrl(data);
}

/**
 * Check if PixelLab is configured.
 */
export function isAvailable(): boolean {
  return !!process.env.PIXELLAB_API_KEY;
}

// --- API helpers ---

async function callApi(
  endpoint: string,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const resp = await fetch(`${PIXELLAB_BASE}/${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await resp.json();
  if (!resp.ok && resp.status !== 202) {
    throw new Error(
      (data as { error?: string }).error ||
        (data as { detail?: string }).detail ||
        `PixelLab API error ${resp.status}`,
    );
  }
  return data as Record<string, unknown>;
}

async function callApiGet(endpoint: string): Promise<Record<string, unknown>> {
  const resp = await fetch(`${PIXELLAB_BASE}/${endpoint}`, {
    headers: { Authorization: `Bearer ${getKey()}` },
  });
  return (await resp.json()) as Record<string, unknown>;
}

async function pollJob(jobId: string): Promise<Record<string, unknown>> {
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const data = await callApiGet(`background-jobs/${jobId}`);
    if (data.status === 'completed' || data.status === 'done') return data;
    if (data.status === 'failed' || data.status === 'error') {
      throw new Error(
        (data as { error?: string }).error || 'PixelLab generation failed',
      );
    }
  }
  throw new Error('PixelLab generation timed out (2 minutes)');
}

// --- Image extraction ---

/**
 * Extract the first image from a PixelLab response as a data URL.
 * Handles: RGBA byte arrays, URL images, and direct data URLs.
 */
function extractImageDataUrl(data: Record<string, unknown>): string {
  // 1. RGBA bytes → PNG data URL
  const rgbaImages = findRgbaImages(data);
  if (rgbaImages.length > 0) return rgbaImages[0];

  // 2. URL images → fetch and convert to data URL
  const urlImages = findUrlImages(data);
  if (urlImages.length > 0) return urlImages[0]; // Will be fetched by caller if needed

  throw new Error('No image found in PixelLab response');
}

function findRgbaImages(obj: unknown): string[] {
  const results: string[] = [];
  function walk(o: unknown) {
    if (!o || typeof o !== 'object') return;
    if (Array.isArray(o)) {
      o.forEach(walk);
      return;
    }
    const rec = o as Record<string, unknown>;
    if (
      rec.type === 'rgba_bytes' &&
      typeof rec.base64 === 'string' &&
      typeof rec.width === 'number' &&
      typeof rec.height === 'number'
    ) {
      results.push(rgbaToPngDataUrl(rec.base64, rec.width, rec.height));
      return;
    }
    Object.values(rec).forEach(walk);
  }
  walk(obj);
  return results;
}

function findUrlImages(obj: unknown): string[] {
  const found: string[] = [];
  function walk(o: unknown) {
    if (!o || typeof o !== 'object') return;
    if (Array.isArray(o)) {
      o.forEach(walk);
      return;
    }
    for (const [key, val] of Object.entries(o as Record<string, unknown>)) {
      if (typeof val === 'string') {
        if (val.startsWith('data:image/')) {
          found.push(val);
        } else if (
          (val.startsWith('http') || val.startsWith('/')) &&
          (val.includes('.png') ||
            val.includes('.jpg') ||
            val.includes('.webp') ||
            val.includes('image'))
        ) {
          found.push(val);
        } else if (key === 'image' && val.startsWith('data:')) {
          found.push(val);
        }
      } else if (typeof val === 'object') {
        walk(val);
      }
    }
  }
  walk(obj);
  return found;
}

// --- RGBA → PNG encoder (no external deps) ---

function rgbaToPngDataUrl(
  base64Rgba: string,
  width: number,
  height: number,
): string {
  const rgba = Buffer.from(base64Rgba, 'base64');
  const png = encodePng(rgba, width, height);
  return `data:image/png;base64,${png.toString('base64')}`;
}

function encodePng(rgba: Buffer, w: number, h: number): Buffer {
  // Each row: 1 filter byte (0=None) + w*4 RGBA bytes
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    const rowStart = y * (w * 4 + 1);
    raw[rowStart] = 0; // filter: None
    rgba.copy(raw, rowStart + 1, y * w * 4, (y + 1) * w * 4);
  }

  const compressed = deflateSync(raw);
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  // compression, filter, interlace = 0

  return Buffer.concat([
    sig,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

function pngChunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBytes = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])));
  return Buffer.concat([len, typeBytes, data, crc]);
}

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let j = 0; j < 8; j++) c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
  }
  return (c ^ 0xffffffff) >>> 0;
}
