import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, getServerUser, isServerSupabaseConfigured } from '@/lib/supabase-server';

// 2D Tile-based Wang sheet save endpoint.
//
// POST   /api/tile-sheets
//   { name, sheetDataUrl, cols, rows, tileWidth, tileHeight, userId? }
//   → upserts on (user_id, name); returns the row.
//
// GET    /api/tile-sheets
//   → returns the caller's tile sheets (full data so the client can
//     re-slice on load).
//
// DELETE /api/tile-sheets?id=<uuid>
//   → deletes the caller's row by id.
//
// Sprint 3 ownership rules apply (mirrors /api/scenes/freeform-2d):
//   - When a Supabase session exists, auth.uid() wins; the body's userId
//     is ignored.
//   - When there's no session, body.userId (or the literal 'local-user')
//     keeps the dev studio working without sign-in.
//   - RLS on `tile_sheets` (migration 030) is the actual gate.

// 8 MB is generous for a single sheet PNG encoded as base64 (≈ 6 MB raw).
// Real Wang sheets are tiny (a 256×256 PNG is ~50 KB). The cap mostly
// protects against accidental upload of multi-megapixel screenshots.
const MAX_DATA_BYTES = 8 * 1024 * 1024;
const MAX_NAME_LENGTH = 200;

interface SheetBody {
  name?: string;
  sheetDataUrl?: string;
  cols?: number;
  rows?: number;
  tileWidth?: number;
  tileHeight?: number;
  userId?: string;
  /** When uploading a "connecting" sheet, these carry the shared texture
   *  identity. When omitted, the DB default (gen_random_uuid()) generates
   *  a fresh id and the row stands alone. */
  upperTextureId?: string;
  lowerTextureId?: string;
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as SheetBody | null;
  if (!body) return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const sheet = typeof body.sheetDataUrl === 'string' ? body.sheetDataUrl : '';
  const cols = Number(body.cols);
  const rows = Number(body.rows);
  const tw = Number(body.tileWidth);
  const th = Number(body.tileHeight);

  if (!name) return NextResponse.json({ error: 'Missing name' }, { status: 400 });
  if (name.length > MAX_NAME_LENGTH) {
    return NextResponse.json({ error: `Name too long (max ${MAX_NAME_LENGTH})` }, { status: 400 });
  }
  if (!sheet.startsWith('data:image/')) {
    return NextResponse.json({ error: 'sheetDataUrl must be a data:image/* URL' }, { status: 400 });
  }
  if (!Number.isFinite(cols) || cols <= 0 || cols > 32
    || !Number.isFinite(rows) || rows <= 0 || rows > 32) {
    return NextResponse.json({ error: 'cols/rows must be 1..32' }, { status: 400 });
  }
  if (!Number.isFinite(tw) || tw <= 0 || !Number.isFinite(th) || th <= 0) {
    return NextResponse.json({ error: 'tileWidth/tileHeight must be > 0' }, { status: 400 });
  }
  if (Buffer.byteLength(sheet, 'utf8') > MAX_DATA_BYTES) {
    return NextResponse.json(
      { error: `Sheet too large (max ${MAX_DATA_BYTES} bytes encoded)` },
      { status: 413 },
    );
  }

  if (!isServerSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Supabase not configured — set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY' },
      { status: 503 },
    );
  }

  const user = await getServerUser();
  const resolvedUserId = user.isAnonymous ? (body.userId || 'local-user') : user.id;

  const supabase = await getServerSupabase();
  // Only include texture ids when the caller provided them — otherwise let
  // the DB defaults assign fresh UUIDs. Sending undefined here would null
  // out existing values on upsert.
  const insertRow: Record<string, unknown> = {
    user_id: resolvedUserId,
    name,
    sheet_data_url: sheet,
    cols, rows,
    tile_width: tw,
    tile_height: th,
    updated_at: new Date().toISOString(),
  };
  if (typeof body.upperTextureId === 'string' && body.upperTextureId) {
    insertRow.upper_texture_id = body.upperTextureId;
  }
  if (typeof body.lowerTextureId === 'string' && body.lowerTextureId) {
    insertRow.lower_texture_id = body.lowerTextureId;
  }

  const { data, error } = await supabase
    .from('tile_sheets')
    .upsert(insertRow, { onConflict: 'user_id,name' })
    .select('id, name, cols, rows, tile_width, tile_height, sheet_data_url, upper_texture_id, lower_texture_id, created_at, updated_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ sheet: rowToSheet(data) });
}

export async function GET() {
  if (!isServerSupabaseConfigured()) {
    return NextResponse.json({ sheets: [] });
  }

  const user = await getServerUser();
  const resolvedUserId = user.isAnonymous ? 'local-user' : user.id;

  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from('tile_sheets')
    .select('id, name, cols, rows, tile_width, tile_height, sheet_data_url, upper_texture_id, lower_texture_id, created_at, updated_at')
    .eq('user_id', resolvedUserId)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ sheets: (data ?? []).map(rowToSheet) });
}

export async function DELETE(request: NextRequest) {
  if (!isServerSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const user = await getServerUser();
  const resolvedUserId = user.isAnonymous ? 'local-user' : user.id;

  const supabase = await getServerSupabase();
  const { error } = await supabase
    .from('tile_sheets')
    .delete()
    .eq('user_id', resolvedUserId)
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

interface SheetRow {
  id: string;
  name: string;
  cols: number;
  rows: number;
  tile_width: number;
  tile_height: number;
  sheet_data_url: string;
  upper_texture_id: string;
  lower_texture_id: string;
  created_at: string;
  updated_at: string;
}

function rowToSheet(r: SheetRow) {
  return {
    id: r.id,
    name: r.name,
    cols: r.cols,
    rows: r.rows,
    tileWidth: r.tile_width,
    tileHeight: r.tile_height,
    sheetDataUrl: r.sheet_data_url,
    upperTextureId: r.upper_texture_id,
    lowerTextureId: r.lower_texture_id,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}
