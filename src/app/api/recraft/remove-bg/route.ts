/**
 * Recraft.ai background-removal proxy.
 *
 * Why a server route: Recraft's API takes a multipart upload + Bearer
 * token. We must not expose the key to the browser, and Recraft's CORS
 * is not set up for direct browser calls anyway.
 *
 * Contract:
 *   POST /api/recraft/remove-bg
 *   body: { dataUrl: string }   ← the source image as a data: URL
 *
 * Returns:
 *   200: { dataUrl: string }    ← the bg-removed PNG as a data: URL
 *   4xx/5xx: { error: string, detail?: string }
 *
 * The client owns the asset lifecycle — we hand back a fresh dataUrl and
 * the panel writes it onto the selected style. We don't touch Supabase
 * here; the user can re-save the asset via the existing upload flow if
 * they want it persisted to the cloud.
 */

const RECRAFT_ENDPOINT = 'https://external.api.recraft.ai/v1/images/removeBackground';

/**
 * Convert a `data:<mime>;base64,<payload>` URL into a Blob suitable for a
 * multipart `FormData` upload. Throws on malformed input — the caller
 * surfaces a 400 in that case.
 */
function dataUrlToBlob(dataUrl: string): Blob {
  const m = /^data:([^;,]+)(;base64)?,([\s\S]*)$/.exec(dataUrl);
  if (!m) throw new Error('not a data: URL');
  const mime = m[1] || 'application/octet-stream';
  const isBase64 = !!m[2];
  const payload = m[3];
  if (isBase64) {
    const bin = atob(payload);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  }
  // Plain (URL-encoded) data URLs — rare for images, but handle them.
  return new Blob([decodeURIComponent(payload)], { type: mime });
}

/** Read a Response body as a `data:` URL. Used for both Recraft's binary
 *  response (PNG) and any unexpected text/json error so the caller can
 *  re-display it without an extra round trip. */
async function responseToDataUrl(resp: Response): Promise<string> {
  const buf = await resp.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 1) bin += String.fromCharCode(bytes[i]);
  const b64 = btoa(bin);
  const mime = resp.headers.get('content-type') || 'image/png';
  return `data:${mime};base64,${b64}`;
}

export async function POST(req: Request) {
  const key = process.env.RECRAFT_API_KEY;
  if (!key) {
    return Response.json(
      { error: 'RECRAFT_API_KEY not configured' },
      { status: 500 },
    );
  }

  let body: { dataUrl?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'invalid JSON body' }, { status: 400 });
  }

  const dataUrl = body?.dataUrl;
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
    return Response.json(
      { error: 'body.dataUrl must be a data: URL' },
      { status: 400 },
    );
  }

  let blob: Blob;
  try {
    blob = dataUrlToBlob(dataUrl);
  } catch (err) {
    return Response.json(
      { error: 'failed to decode dataUrl', detail: err instanceof Error ? err.message : String(err) },
      { status: 400 },
    );
  }

  // Cap on the upload size — Recraft documents a 5 MB limit. We reject
  // earlier so the user gets a coherent error instead of a generic 4xx
  // back from the upstream. 5 MB raw → roughly 6.7 MB base64.
  const MAX_BYTES = 5 * 1024 * 1024;
  if (blob.size > MAX_BYTES) {
    return Response.json(
      { error: 'image too large', detail: `${blob.size} bytes > ${MAX_BYTES}` },
      { status: 413 },
    );
  }

  const ext = (blob.type.split('/')[1] || 'png').replace(/[^a-z0-9]/gi, '') || 'png';
  const form = new FormData();
  form.append('file', blob, `image.${ext}`);
  // Recraft accepts an optional `response_format=url` to return a hosted
  // URL instead of a binary blob. We DON'T set that — we want the bytes
  // so the browser can write them back into the local store as a
  // self-contained data: URL (no third-party fetch on the client).

  let upstream: Response;
  try {
    upstream = await fetch(RECRAFT_ENDPOINT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}` },
      body: form,
    });
  } catch (err) {
    return Response.json(
      {
        error: 'Recraft request failed',
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 502 },
    );
  }

  if (!upstream.ok) {
    // Recraft returns JSON for errors (`{ message, ... }`); pass it
    // through with the original status so the client can show useful
    // detail (e.g. "credits exhausted").
    let detail = '';
    try {
      const text = await upstream.text();
      detail = text;
    } catch {
      detail = upstream.statusText;
    }
    return Response.json(
      { error: 'Recraft API error', detail, status: upstream.status },
      { status: upstream.status },
    );
  }

  const ct = upstream.headers.get('content-type') || '';
  // Newer Recraft tier returns JSON with `image.url` even when we don't
  // ask for it. Handle both shapes so the client only ever sees a
  // dataUrl in the 200 path.
  if (ct.includes('json')) {
    let json: { image?: { url?: string } };
    try { json = await upstream.json(); } catch {
      return Response.json({ error: 'Recraft returned malformed JSON' }, { status: 502 });
    }
    const url = json?.image?.url;
    if (!url) {
      return Response.json({ error: 'Recraft response missing image.url', detail: JSON.stringify(json) }, { status: 502 });
    }
    let imgResp: Response;
    try {
      imgResp = await fetch(url);
    } catch (err) {
      return Response.json(
        { error: 'failed to fetch Recraft result image', detail: err instanceof Error ? err.message : String(err) },
        { status: 502 },
      );
    }
    if (!imgResp.ok) {
      return Response.json(
        { error: 'failed to fetch Recraft result image', status: imgResp.status },
        { status: 502 },
      );
    }
    const out = await responseToDataUrl(imgResp);
    return Response.json({ dataUrl: out });
  }

  const out = await responseToDataUrl(upstream);
  return Response.json({ dataUrl: out });
}
