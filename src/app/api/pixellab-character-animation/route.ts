/**
 * Generate one named action animation across all 8 character directions
 * by calling PixelLab's `animate-with-text-v2` once per direction with
 * the matching reference frame from the character's 3×3 sheet.
 *
 * Request body:
 *   {
 *     references: { [dir]: dataUrl },  // 8 directions: n, ne, e, se, s, sw, w, nw
 *     action: string,                  // e.g. "running", "attacking"
 *     frameW: number,                  // source/output frame width  (px)
 *     frameH: number,                  // source/output frame height (px)
 *   }
 *
 * Response:
 *   {
 *     ok: true,
 *     results: [{ dir: CharacterDir8, frames: string[] }, ...]   // up to 8 entries
 *     errors?: { dir, error }[]                                   // partial failures
 *   }
 *
 * Frame composition into a 4×4 sheet happens client-side (cheap, no PNG
 * decoder needed server-side). Each direction is fired in parallel; the
 * route returns once every PixelLab job finishes (success OR failure).
 */
const PIXELLAB_BASE = 'https://api.pixellab.ai/v2';
const POLL_INTERVAL_MS = 4000;
const POLL_MAX_ATTEMPTS = 60; // ~4 min — animation jobs can be slow.

const CHAR_DIRS = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'] as const;
type CharDir8 = (typeof CHAR_DIRS)[number];

const DIR_TO_PIXELLAB: Record<CharDir8, string> = {
  n: 'north',
  ne: 'north-east',
  e: 'east',
  se: 'south-east',
  s: 'south',
  sw: 'south-west',
  w: 'west',
  nw: 'north-west',
};

interface GenerateBody {
  references?: Partial<Record<CharDir8, string>>;
  action?: string;
  frameW?: number;
  frameH?: number;
}

export async function POST(req: Request) {
  const key = process.env.PIXELLAB_API_KEY;
  if (!key) {
    return Response.json(
      { ok: false, error: 'PIXELLAB_API_KEY not configured' },
      { status: 500 },
    );
  }

  let body: GenerateBody;
  try {
    body = (await req.json()) as GenerateBody;
  } catch {
    return Response.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const action = (body.action ?? '').trim();
  const frameW = Number(body.frameW);
  const frameH = Number(body.frameH);
  const references = body.references ?? {};

  if (!action) {
    return Response.json({ ok: false, error: 'Missing `action` prompt' }, { status: 400 });
  }
  if (!Number.isFinite(frameW) || !Number.isFinite(frameH) || frameW <= 0 || frameH <= 0) {
    return Response.json(
      { ok: false, error: '`frameW`/`frameH` must be positive numbers' },
      { status: 400 },
    );
  }

  const dirsToRun = CHAR_DIRS.filter((d) => typeof references[d] === 'string');
  if (dirsToRun.length === 0) {
    return Response.json(
      { ok: false, error: 'No reference frames provided — `references` must include at least one direction' },
      { status: 400 },
    );
  }

  // Clamp dimensions to PixelLab v2's accepted range (animate-with-text-v2:
  // 32–256 in 16-px increments) so requests don't 422 on small/odd sources.
  const refW = clampStep(Math.round(frameW), 32, 256, 16);
  const refH = clampStep(Math.round(frameH), 32, 256, 16);

  const settled = await Promise.allSettled(
    dirsToRun.map((dir) =>
      runOneDirection({
        key,
        dir,
        action,
        referenceDataUrl: references[dir]!,
        width: refW,
        height: refH,
      }),
    ),
  );

  const results: { dir: CharDir8; frames: string[] }[] = [];
  const errors: { dir: CharDir8; error: string }[] = [];
  settled.forEach((s, i) => {
    const dir = dirsToRun[i];
    if (s.status === 'fulfilled') {
      results.push({ dir, frames: s.value });
    } else {
      const reason = s.reason instanceof Error ? s.reason.message : String(s.reason);
      errors.push({ dir, error: reason });
    }
  });

  return Response.json({
    ok: results.length > 0,
    results,
    ...(errors.length > 0 ? { errors } : {}),
  });
}

async function runOneDirection({
  key, dir, action, referenceDataUrl, width, height,
}: {
  key: string;
  dir: CharDir8;
  action: string;
  referenceDataUrl: string;
  width: number;
  height: number;
}): Promise<string[]> {
  const startResp = await fetch(`${PIXELLAB_BASE}/animate-with-text-v2`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      reference_image: { type: 'base64', base64: referenceDataUrl },
      reference_image_size: { width, height },
      action,
      image_size: { width, height },
      no_background: true,
      view: 'low top-down',
      direction: DIR_TO_PIXELLAB[dir],
    }),
  });

  let startData: Record<string, unknown>;
  try {
    startData = (await startResp.json()) as Record<string, unknown>;
  } catch (err) {
    throw new Error(`[${dir}] Failed to parse start response: ${errMsg(err)}`);
  }

  if (!startResp.ok && startResp.status !== 202) {
    const detail =
      (startData.detail as string | undefined) ??
      (startData.error as string | undefined) ??
      `HTTP ${startResp.status}`;
    throw new Error(`[${dir}] PixelLab start failed: ${detail}`);
  }

  const jobId =
    (startData.background_job_id as string | undefined) ??
    (startData.job_id as string | undefined);
  if (!jobId) {
    // Sync response — pull frames directly.
    const frames = extractFrames(startData);
    if (frames.length === 0) throw new Error(`[${dir}] PixelLab returned no frames and no job id`);
    return frames;
  }

  for (let i = 0; i < POLL_MAX_ATTEMPTS; i++) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    const resp = await fetch(
      `${PIXELLAB_BASE}/background-jobs/${encodeURIComponent(jobId)}`,
      { headers: { Authorization: `Bearer ${key}` } },
    );
    let data: Record<string, unknown>;
    try {
      data = (await resp.json()) as Record<string, unknown>;
    } catch (err) {
      throw new Error(`[${dir}] Poll parse failed: ${errMsg(err)}`);
    }
    const status = String(data.status ?? '').toLowerCase();
    if (status === 'completed' || status === 'done' || status === 'success') {
      const frames = extractFrames(data.last_response ?? data);
      if (frames.length === 0) {
        throw new Error(`[${dir}] Job ${jobId} completed with no frames`);
      }
      return frames;
    }
    if (status === 'failed' || status === 'error') {
      const detail =
        (data.error as string | undefined) ??
        `Job ${jobId} reported status=${status}`;
      throw new Error(`[${dir}] ${detail}`);
    }
  }

  throw new Error(
    `[${dir}] Timed out after ${(POLL_INTERVAL_MS * POLL_MAX_ATTEMPTS) / 1000}s waiting for animation`,
  );
}

/**
 * Walk a PixelLab response and pull every base64/url image we can find.
 * Mirrors `extractRestImages` in `/api/pixellab/run/[mcpName]/route.ts`
 * but kept inlined here so this route doesn't depend on the dispatcher
 * route's internals.
 */
function extractFrames(data: unknown): string[] {
  const out: string[] = [];
  walk(data);
  return out;

  function walk(o: unknown) {
    if (!o || typeof o !== 'object') return;
    if (Array.isArray(o)) { o.forEach(walk); return; }
    const rec = o as Record<string, unknown>;
    if (rec.type === 'base64' && typeof rec.base64 === 'string') {
      out.push(rec.base64.startsWith('data:') ? rec.base64 : `data:image/png;base64,${rec.base64}`);
      return;
    }
    if (rec.type === 'url' && typeof rec.url === 'string') {
      out.push(rec.url);
      return;
    }
    for (const k of ['url', 'download_url', 'image_url']) {
      const v = rec[k];
      if (typeof v === 'string' && /^https?:\/\//.test(v)) out.push(v);
    }
    Object.values(rec).forEach(walk);
  }
}

function clampStep(v: number, lo: number, hi: number, step: number): number {
  const c = Math.min(hi, Math.max(lo, v));
  return Math.round(c / step) * step;
}

function errMsg(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
