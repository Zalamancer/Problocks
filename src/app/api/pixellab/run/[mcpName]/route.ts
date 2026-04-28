/**
 * PixelLab MCP tool invoker.
 *
 * POST /api/pixellab/run/<mcp_tool_name>
 *
 * Body: multipart/form-data
 *   - __args: JSON-encoded object of non-file arguments
 *   - <key>:  binary file (single image; e.g. background_image)
 *   - <key>[]: binary file(s) (image array; e.g. style_images)
 *
 * Calls the PixelLab MCP server at https://api.pixellab.ai/mcp via JSON-RPC
 * (`tools/call`), with image fields injected as base64 data URLs into the
 * arguments object. Returns `{ ok, result, images, error }` to the caller.
 *
 * Why MCP and not the v2 REST API: our schemas (src/lib/pixellab-tools.ts)
 * were authored from the MCP catalog so argument names match 1:1 with
 * MCP tool inputs. The v2 REST surface uses different parameter shapes
 * (e.g. `image_size: {width,height}` instead of MCP's `size: int`) and
 * is mapped per endpoint, which would require a second translation layer.
 */

const MCP_ENDPOINT = 'https://api.pixellab.ai/mcp';

/**
 * Map of `create_*` MCP tools to their `get_*` counterpart and the argument
 * key the get-tool expects. Used to poll for completion of async jobs.
 */
const POLL_BINDINGS: Record<string, { getTool: string; idArg: string; idLabels: string[] } | undefined> = {
  create_character:             { getTool: 'get_character',             idArg: 'character_id', idLabels: ['Character ID', 'character_id'] },
  create_topdown_tileset:       { getTool: 'get_topdown_tileset',       idArg: 'tileset_id',   idLabels: ['Tileset ID', 'tileset_id'] },
  create_sidescroller_tileset:  { getTool: 'get_sidescroller_tileset',  idArg: 'tileset_id',   idLabels: ['Tileset ID', 'tileset_id'] },
  create_isometric_tile:        { getTool: 'get_isometric_tile',        idArg: 'tile_id',      idLabels: ['Tile ID', 'tile_id'] },
  create_map_object:            { getTool: 'get_map_object',            idArg: 'object_id',    idLabels: ['Object ID', 'object_id'] },
  create_tiles_pro:             { getTool: 'get_tiles_pro',             idArg: 'tile_id',      idLabels: ['Tile ID', 'tile_id'] },
  animate_character:            undefined, // Animations live on the character record.
};

const POLL_INTERVAL_MS = 4000;
const POLL_MAX_ATTEMPTS = 18; // ~72s total — keeps us well under serverless 5-min cap.

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
  const { mcpName } = await params;
  const key = process.env.PIXELLAB_API_KEY;
  if (!key) {
    return Response.json({ ok: false, error: 'PIXELLAB_API_KEY not configured' }, { status: 500 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return Response.json({ ok: false, error: 'Expected multipart/form-data' }, { status: 400 });
  }

  // Parse non-file args.
  let args: Record<string, unknown> = {};
  const argsRaw = formData.get('__args');
  if (typeof argsRaw === 'string') {
    try {
      args = JSON.parse(argsRaw);
    } catch {
      return Response.json({ ok: false, error: '__args is not valid JSON' }, { status: 400 });
    }
  }

  // Inject image fields. Single files → base64 data URL string.
  // Repeated `<key>[]` entries → array of base64 data URL strings.
  const arrayBuffers: Record<string, string[]> = {};
  for (const [name, value] of formData.entries()) {
    if (name === '__args' || !(value instanceof File)) continue;
    const dataUrl = await fileToDataUrl(value);
    if (name.endsWith('[]')) {
      const key = name.slice(0, -2);
      (arrayBuffers[key] ??= []).push(dataUrl);
    } else {
      args[name] = dataUrl;
    }
  }
  for (const [key, arr] of Object.entries(arrayBuffers)) {
    args[key] = arr;
  }

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
      { ok: false, error: 'PixelLab MCP request failed', detail: errMsg(err) },
      { status: 502 },
    );
  }

  let rpc: JsonRpcResponse | null = null;
  const ct = resp.headers.get('content-type') || '';
  try {
    if (ct.includes('text/event-stream')) {
      rpc = await parseSse(resp);
    } else {
      rpc = (await resp.json()) as JsonRpcResponse;
    }
  } catch (err) {
    return Response.json(
      { ok: false, error: 'Failed to parse MCP response', detail: errMsg(err) },
      { status: 502 },
    );
  }

  if (!rpc) {
    return Response.json({ ok: false, error: 'Empty MCP response' }, { status: 502 });
  }
  if (rpc.error) {
    return Response.json(
      { ok: false, error: rpc.error.message, code: rpc.error.code, data: rpc.error.data },
      { status: 502 },
    );
  }

  const result = rpc.result;
  let images = extractImages(result);
  let text = extractText(result);

  // If this was an async create_* call and no image landed yet, poll the
  // matching get_* tool until completion (or timeout).
  const polling = POLL_BINDINGS[mcpName];
  if (polling && images.length === 0) {
    const jobId = extractJobId(text, polling.idLabels);
    if (jobId) {
      const polled = await pollUntilDone({
        key,
        getTool: polling.getTool,
        idArg: polling.idArg,
        jobId,
      });
      if (polled.error) {
        return Response.json(
          { ok: false, error: polled.error, jobId, getTool: polling.getTool },
          { status: 502 },
        );
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

function extractJobId(text: string, labels: string[]): string | null {
  // Match either ``Tile ID:`<uuid>` ``-style or `tile_id: "<uuid>"`-style.
  const uuidRe = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
  for (const label of labels) {
    const re = new RegExp(`${escapeRe(label)}[^a-z0-9]*\`?(${uuidRe.source})\`?`, 'i');
    const m = text.match(re);
    if (m) return m[1];
  }
  // Fallback: first UUID in the text.
  const m = text.match(uuidRe);
  return m ? m[0] : null;
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function pollUntilDone({
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
    const images = extractImages(result);
    const text = extractText(result);
    if (images.length > 0) return { images, text };
    // Heuristic: if status text says completed but no inline image, return text.
    if (/(?:status|state)[^\n]*\b(?:complete|completed|done|ready|success)\b/i.test(text) && images.length === 0) {
      return { images: [], text };
    }
    if (/(?:status|state)[^\n]*\b(?:failed|error)\b/i.test(text)) {
      return { images: [], text: '', error: text };
    }
    // Otherwise loop again.
  }
  return { images: [], text: '', error: `Timed out after ${POLL_INTERVAL_MS * POLL_MAX_ATTEMPTS / 1000}s waiting for ${getTool}` };
}

async function fileToDataUrl(file: File): Promise<string> {
  const buf = Buffer.from(await file.arrayBuffer());
  const mime = file.type || 'application/octet-stream';
  return `data:${mime};base64,${buf.toString('base64')}`;
}

async function parseSse(resp: Response): Promise<JsonRpcResponse | null> {
  const text = await resp.text();
  // Each SSE event is delimited by a blank line. We want the last `data:` payload.
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

function extractImages(result: JsonRpcResponse['result']): string[] {
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
  // Some MCP servers stash image URLs inside text content; sniff for them.
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

function extractText(result: JsonRpcResponse['result']): string {
  if (!result?.content) return '';
  return result.content
    .filter((c): c is { type: 'text'; text: string } => c.type === 'text')
    .map((c) => c.text)
    .join('\n')
    .trim();
}

function errMsg(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
