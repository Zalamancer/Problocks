/**
 * PixelLab tool invoker — dispatches by transport.
 *
 * POST /api/pixellab/run/<tool.id>
 *
 * Body: multipart/form-data
 *   - __args:    JSON-encoded object of non-file arguments
 *   - <key>:     binary file (single image input)
 *   - <key>[]:   binary file(s) (image array input)
 *
 * Looks up `tool.id` in src/lib/pixellab-tools.ts, then:
 *   - transport === 'mcp'   → POST JSON-RPC tools/call to api.pixellab.ai/mcp
 *                              and poll the matching get_* MCP tool when async.
 *   - transport === 'rest'  → run tool.restTransform to build the v2 REST body,
 *                              POST to api.pixellab.ai/v2/<endpoint>, and poll
 *                              /v2/background-jobs/<id> when async.
 *
 * Response: { ok, text, images, raw, jobId? }.
 */

import { findTool, type RestImage } from '@/lib/pixellab-tools';

const MCP_ENDPOINT  = 'https://api.pixellab.ai/mcp';
const REST_BASE     = 'https://api.pixellab.ai/v2';

const POLL_INTERVAL_MS = 4000;
const POLL_MAX_ATTEMPTS = 18; // ~72s — well under serverless 5-min cap.

const MCP_POLL_BINDINGS: Record<string, { getTool: string; idArg: string; idLabels: string[] } | undefined> = {
  create_character:             { getTool: 'get_character',             idArg: 'character_id', idLabels: ['Character ID', 'character_id'] },
  create_topdown_tileset:       { getTool: 'get_topdown_tileset',       idArg: 'tileset_id',   idLabels: ['Tileset ID', 'tileset_id'] },
  create_sidescroller_tileset:  { getTool: 'get_sidescroller_tileset',  idArg: 'tileset_id',   idLabels: ['Tileset ID', 'tileset_id'] },
  create_isometric_tile:        { getTool: 'get_isometric_tile',        idArg: 'tile_id',      idLabels: ['Tile ID', 'tile_id'] },
  create_map_object:            { getTool: 'get_map_object',            idArg: 'object_id',    idLabels: ['Object ID', 'object_id'] },
  create_tiles_pro:             { getTool: 'get_tiles_pro',             idArg: 'tile_id',      idLabels: ['Tile ID', 'tile_id'] },
  animate_character:            undefined,
};

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: number | string | null;
  result?: {
    content?: Array<
      | { type: 'text'; text: string }
      | { type: 'image'; data: string; mimeType: string }
      | { type: 'resource'; resource: { uri?: string; mimeType?: string; text?: string; blob?: string } }
    >;
    isError?: boolean;
    structuredContent?: unknown;
  };
  error?: { code: number; message: string; data?: unknown };
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ mcpName: string }> },
) {
  const { mcpName: toolId } = await params;
  const key = process.env.PIXELLAB_API_KEY;
  if (!key) {
    return Response.json({ ok: false, error: 'PIXELLAB_API_KEY not configured' }, { status: 500 });
  }

  const tool = findTool(toolId);
  if (!tool) {
    return Response.json({ ok: false, error: `Unknown tool id: ${toolId}` }, { status: 404 });
  }

  // Parse the FormData payload (shared across both transports).
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return Response.json({ ok: false, error: 'Expected multipart/form-data' }, { status: 400 });
  }

  let args: Record<string, unknown> = {};
  const argsRaw = formData.get('__args');
  if (typeof argsRaw === 'string') {
    try {
      args = JSON.parse(argsRaw);
    } catch {
      return Response.json({ ok: false, error: '__args is not valid JSON' }, { status: 400 });
    }
  }

  // Build:
  //   imageDataUrls:  Record<key, string>          for MCP (data URL strings)
  //   imageObjs:      Record<key, RestImage|RestImage[]> for REST (typed objects)
  const imageDataUrls: Record<string, string | string[]> = {};
  const imageObjs: Record<string, RestImage | RestImage[]> = {};
  const arrayDataUrls: Record<string, string[]> = {};
  for (const [name, value] of formData.entries()) {
    if (name === '__args' || !(value instanceof File)) continue;
    const dataUrl = await fileToDataUrl(value);
    if (name.endsWith('[]')) {
      const k = name.slice(0, -2);
      (arrayDataUrls[k] ??= []).push(dataUrl);
    } else {
      imageDataUrls[name] = dataUrl;
      imageObjs[name] = { type: 'base64', base64: dataUrl };
    }
  }
  for (const [k, arr] of Object.entries(arrayDataUrls)) {
    imageDataUrls[k] = arr;
    imageObjs[k] = arr.map((u) => ({ type: 'base64' as const, base64: u }));
  }

  // ── REST transport ─────────────────────────────────────────────────────
  if (tool.transport === 'rest') {
    if (!tool.restEndpoint || !tool.restTransform) {
      return Response.json(
        { ok: false, error: `Tool ${toolId} is REST but missing restEndpoint/restTransform` },
        { status: 500 },
      );
    }
    const body = tool.restTransform(args, imageObjs);
    return await callRest({
      key, endpoint: tool.restEndpoint, body, async: !!tool.restAsync,
    });
  }

  // ── MCP transport ──────────────────────────────────────────────────────
  if (!tool.mcpName) {
    return Response.json({ ok: false, error: `Tool ${toolId} is MCP but missing mcpName` }, { status: 500 });
  }

  // Inject MCP-style image strings (single = bare key, multiple = array of strings).
  const mcpArgs = { ...args };
  for (const [k, v] of Object.entries(imageDataUrls)) mcpArgs[k] = v;

  return await callMcp({ key, mcpName: tool.mcpName, args: mcpArgs });
}

// ──────────────────────────────────────────────────────────────────────────
// REST transport
// ──────────────────────────────────────────────────────────────────────────

async function callRest({
  key, endpoint, body, async,
}: { key: string; endpoint: string; body: Record<string, unknown>; async: boolean }) {
  let resp: Response;
  try {
    resp = await fetch(`${REST_BASE}/${endpoint}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err) {
    return Response.json(
      { ok: false, error: `PixelLab REST request failed: ${errMsg(err)}` },
      { status: 502 },
    );
  }

  let data: Record<string, unknown>;
  try {
    data = (await resp.json()) as Record<string, unknown>;
  } catch (err) {
    return Response.json(
      { ok: false, error: `Failed to parse REST response: ${errMsg(err)}`, status: resp.status },
      { status: 502 },
    );
  }

  // Error path: prefer FastAPI {detail: ...} shape, fall back to status text.
  if (!resp.ok && resp.status !== 202) {
    const detail = (data.detail as string | undefined) ?? (data.error as string | undefined);
    return Response.json(
      { ok: false, error: detail ?? `REST ${endpoint} failed (HTTP ${resp.status})`, status: resp.status, raw: data },
      { status: resp.status >= 500 ? 502 : resp.status },
    );
  }

  // Async: server returned a job id — poll background-jobs/<id> until done.
  const jobId = (data.background_job_id as string | undefined) ?? (data.job_id as string | undefined);
  if (async || jobId) {
    if (!jobId) {
      return Response.json(
        { ok: false, error: 'REST endpoint flagged async but no background_job_id returned', raw: data },
        { status: 502 },
      );
    }
    const polled = await pollBackgroundJob({ key, jobId });
    if (polled.error) {
      return Response.json({ ok: false, error: polled.error, jobId, raw: data }, { status: 502 });
    }
    return Response.json({
      ok: true,
      text: polled.text,
      images: polled.images,
      raw: polled.raw,
      jobId,
    });
  }

  // Sync: extract the image(s) right away.
  const images = extractRestImages(data);
  return Response.json({
    ok: true,
    text: '',
    images,
    raw: data,
  });
}

async function pollBackgroundJob(
  { key, jobId }: { key: string; jobId: string },
): Promise<{ images: string[]; text: string; raw?: Record<string, unknown>; error?: string }> {
  for (let i = 0; i < POLL_MAX_ATTEMPTS; i++) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    let resp: Response;
    try {
      resp = await fetch(`${REST_BASE}/background-jobs/${encodeURIComponent(jobId)}`, {
        headers: { Authorization: `Bearer ${key}` },
      });
    } catch (err) {
      return { images: [], text: '', error: `Poll fetch failed: ${errMsg(err)}` };
    }
    let data: Record<string, unknown>;
    try {
      data = (await resp.json()) as Record<string, unknown>;
    } catch (err) {
      return { images: [], text: '', error: `Poll parse failed: ${errMsg(err)}` };
    }
    const status = (data.status as string | undefined)?.toLowerCase() ?? '';
    if (status === 'completed' || status === 'done' || status === 'success') {
      const images = extractRestImages(data.last_response ?? data);
      return { images, text: '', raw: data };
    }
    if (status === 'failed' || status === 'error') {
      const errText = (data.error as string | undefined) ?? `Job ${jobId} reported ${status}`;
      return { images: [], text: '', error: errText, raw: data };
    }
  }
  return { images: [], text: '', error: `Job ${jobId} timed out after ${POLL_INTERVAL_MS * POLL_MAX_ATTEMPTS / 1000}s` };
}

function extractRestImages(data: unknown): string[] {
  const out: string[] = [];
  walk(data);
  return Array.from(new Set(out));

  function walk(o: unknown) {
    if (!o || typeof o !== 'object') return;
    if (Array.isArray(o)) { o.forEach(walk); return; }
    const rec = o as Record<string, unknown>;
    // {type: "base64", base64: "data:image/...;base64,..."}
    if (rec.type === 'base64' && typeof rec.base64 === 'string') {
      out.push(rec.base64.startsWith('data:') ? rec.base64 : `data:image/png;base64,${rec.base64}`);
      return;
    }
    // {type: "url", url: "..."}
    if (rec.type === 'url' && typeof rec.url === 'string') {
      out.push(rec.url);
      return;
    }
    // {url: "..."} or {download_url: "..."} on completed jobs
    for (const k of ['url', 'download_url', 'image_url']) {
      const v = rec[k];
      if (typeof v === 'string' && /^https?:\/\//.test(v)) out.push(v);
    }
    Object.values(rec).forEach(walk);
  }
}

// ──────────────────────────────────────────────────────────────────────────
// MCP transport
// ──────────────────────────────────────────────────────────────────────────

async function callMcp({ key, mcpName, args }: { key: string; mcpName: string; args: Record<string, unknown> }) {
  const rpcBody = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: { name: mcpName, arguments: args },
  };

  let resp: Response;
  try {
    resp = await fetch(MCP_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
      },
      body: JSON.stringify(rpcBody),
    });
  } catch (err) {
    return Response.json(
      { ok: false, error: `PixelLab MCP request failed: ${errMsg(err)}` },
      { status: 502 },
    );
  }

  let rpc: JsonRpcResponse | null = null;
  const ct = resp.headers.get('content-type') || '';
  try {
    rpc = ct.includes('text/event-stream') ? await parseSse(resp) : ((await resp.json()) as JsonRpcResponse);
  } catch (err) {
    return Response.json({ ok: false, error: `Failed to parse MCP response: ${errMsg(err)}` }, { status: 502 });
  }

  if (!rpc) return Response.json({ ok: false, error: 'Empty MCP response' }, { status: 502 });
  if (rpc.error) {
    return Response.json(
      { ok: false, error: rpc.error.message, code: rpc.error.code, data: rpc.error.data },
      { status: 502 },
    );
  }

  const result = rpc.result;
  let images = extractMcpImages(result);
  let text = extractMcpText(result);

  const polling = MCP_POLL_BINDINGS[mcpName];
  if (polling && images.length === 0) {
    const jobId = extractJobId(text, polling.idLabels);
    if (jobId) {
      const polled = await pollMcpUntilDone({ key, getTool: polling.getTool, idArg: polling.idArg, jobId });
      if (polled.error) {
        return Response.json({ ok: false, error: polled.error, jobId, getTool: polling.getTool }, { status: 502 });
      }
      if (polled.images.length > 0) images = polled.images;
      if (polled.text) text = `${text}\n\n— Polled result —\n${polled.text}`;
    }
  }

  return Response.json({
    ok: !result?.isError,
    text,
    images,
    raw: result,
  });
}

async function pollMcpUntilDone({
  key, getTool, idArg, jobId,
}: { key: string; getTool: string; idArg: string; jobId: string }): Promise<{ images: string[]; text: string; error?: string }> {
  for (let i = 0; i < POLL_MAX_ATTEMPTS; i++) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    const rpcBody = {
      jsonrpc: '2.0',
      id: 100 + i,
      method: 'tools/call',
      params: { name: getTool, arguments: { [idArg]: jobId } },
    };
    let resp: Response;
    try {
      resp = await fetch(MCP_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          Accept: 'application/json, text/event-stream',
        },
        body: JSON.stringify(rpcBody),
      });
    } catch (err) {
      return { images: [], text: '', error: `Poll failed: ${errMsg(err)}` };
    }
    let rpc: JsonRpcResponse | null = null;
    const ct = resp.headers.get('content-type') || '';
    try {
      rpc = ct.includes('text/event-stream') ? await parseSse(resp) : ((await resp.json()) as JsonRpcResponse);
    } catch (err) {
      return { images: [], text: '', error: `Poll parse failed: ${errMsg(err)}` };
    }
    if (rpc?.error) return { images: [], text: '', error: rpc.error.message };
    const result = rpc?.result;
    const images = extractMcpImages(result);
    const text = extractMcpText(result);
    if (images.length > 0) return { images, text };
    if (/(?:status|state)[^\n]*\b(?:complete|completed|done|ready|success)\b/i.test(text) && images.length === 0) {
      return { images: [], text };
    }
    if (/(?:status|state)[^\n]*\b(?:failed|error)\b/i.test(text)) {
      return { images: [], text: '', error: text };
    }
  }
  return { images: [], text: '', error: `Timed out after ${POLL_INTERVAL_MS * POLL_MAX_ATTEMPTS / 1000}s waiting for ${getTool}` };
}

function extractMcpImages(result: JsonRpcResponse['result']): string[] {
  if (!result?.content) return [];
  const out: string[] = [];
  for (const c of result.content) {
    if (c.type === 'image' && c.data) {
      out.push(`data:${c.mimeType || 'image/png'};base64,${c.data}`);
    } else if (c.type === 'resource') {
      const r = c.resource;
      if (r.blob && r.mimeType) out.push(`data:${r.mimeType};base64,${r.blob}`);
      else if (r.uri) out.push(r.uri);
    }
  }
  const textBlobs = result.content
    .filter((c): c is { type: 'text'; text: string } => c.type === 'text')
    .map((c) => c.text);
  for (const t of textBlobs) {
    const matches = t.match(/https?:\/\/\S+\.(?:png|jpg|jpeg|webp|gif)/gi);
    if (matches) out.push(...matches);
    const dataUrls = t.match(/data:image\/[a-z]+;base64,[A-Za-z0-9+/=]+/g);
    if (dataUrls) out.push(...dataUrls);
  }
  return Array.from(new Set(out));
}

function extractMcpText(result: JsonRpcResponse['result']): string {
  if (!result?.content) return '';
  return result.content
    .filter((c): c is { type: 'text'; text: string } => c.type === 'text')
    .map((c) => c.text)
    .join('\n')
    .trim();
}

function extractJobId(text: string, labels: string[]): string | null {
  const uuidRe = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
  for (const label of labels) {
    const re = new RegExp(`${escapeRe(label)}[^a-z0-9]*\`?(${uuidRe.source})\`?`, 'i');
    const m = text.match(re);
    if (m) return m[1];
  }
  const m = text.match(uuidRe);
  return m ? m[0] : null;
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ──────────────────────────────────────────────────────────────────────────
// Shared helpers
// ──────────────────────────────────────────────────────────────────────────

async function fileToDataUrl(file: File): Promise<string> {
  const buf = Buffer.from(await file.arrayBuffer());
  const mime = file.type || 'application/octet-stream';
  return `data:${mime};base64,${buf.toString('base64')}`;
}

async function parseSse(resp: Response): Promise<JsonRpcResponse | null> {
  const text = await resp.text();
  const events = text.split(/\r?\n\r?\n/).filter(Boolean);
  for (let i = events.length - 1; i >= 0; i--) {
    const lines = events[i].split(/\r?\n/);
    const dataLines = lines.filter((l) => l.startsWith('data:')).map((l) => l.slice(5).trimStart());
    if (dataLines.length === 0) continue;
    try {
      return JSON.parse(dataLines.join('\n')) as JsonRpcResponse;
    } catch {
      // try previous event
    }
  }
  return null;
}

function errMsg(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
