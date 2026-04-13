/**
 * PixelLab API proxy — forwards requests to https://api.pixellab.ai/v2/*.
 * Used by client-side UI panels (the game agent calls PixelLab directly server-side).
 */

export async function POST(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const key = process.env.PIXELLAB_API_KEY;
  if (!key) {
    return Response.json(
      { error: 'PIXELLAB_API_KEY not configured' },
      { status: 500 },
    );
  }

  const endpoint = path.join('/');
  const body = await req.json();

  try {
    const resp = await fetch(`https://api.pixellab.ai/v2/${endpoint}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const contentType = resp.headers.get('content-type') || '';
    if (contentType.includes('json')) {
      const data = await resp.json();
      return Response.json(data, { status: resp.status });
    }

    // Binary (images)
    const buffer = await resp.arrayBuffer();
    return new Response(buffer, {
      status: resp.status,
      headers: { 'Content-Type': contentType },
    });
  } catch (err) {
    return Response.json(
      {
        error: 'PixelLab API request failed',
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 502 },
    );
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const key = process.env.PIXELLAB_API_KEY;
  if (!key) {
    return Response.json(
      { error: 'PIXELLAB_API_KEY not configured' },
      { status: 500 },
    );
  }

  const endpoint = path.join('/');

  try {
    const resp = await fetch(`https://api.pixellab.ai/v2/${endpoint}`, {
      headers: { Authorization: `Bearer ${key}` },
    });

    const contentType = resp.headers.get('content-type') || '';
    if (contentType.includes('json')) {
      const data = await resp.json();
      return Response.json(data, { status: resp.status });
    }

    const buffer = await resp.arrayBuffer();
    return new Response(buffer, {
      status: resp.status,
      headers: { 'Content-Type': contentType },
    });
  } catch (err) {
    return Response.json(
      {
        error: 'PixelLab API request failed',
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 502 },
    );
  }
}
