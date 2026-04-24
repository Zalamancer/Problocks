import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const OUT_DIR = '/tmp/khan-trees';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const slug = String(body.slug || '').replace(/[^a-z0-9-]/gi, '-');
    if (!slug) return NextResponse.json({ ok: false, error: 'missing slug' }, { status: 400, headers: CORS_HEADERS });
    await mkdir(OUT_DIR, { recursive: true });
    await writeFile(join(OUT_DIR, `${slug}.json`), JSON.stringify(body, null, 2), 'utf8');
    return NextResponse.json({ ok: true, slug, path: join(OUT_DIR, `${slug}.json`) }, { headers: CORS_HEADERS });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500, headers: CORS_HEADERS });
  }
}
