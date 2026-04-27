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
  /** Optional human-readable terrain labels (e.g. "grass", "dirt"). Two
   *  sheets sharing a label collapse to one terrain in the auto-tile
   *  resolver — see lib/wang-tiles.ts. Nullable; clients fall back to a
   *  parse of `name` when absent. */
  upperLabel?: string | null;
  lowerLabel?: string | null;
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
  // Labels are nullable — pass through `null` so the user can clear a
  // previously-set override; only skip the column entirely when the field
  // is `undefined`, which means "don't touch on this upsert".
  const hasLabelInsert = body.upperLabel !== undefined || body.lowerLabel !== undefined;
  if (body.upperLabel !== undefined) {
    insertRow.upper_label = typeof body.upperLabel === 'string'
      ? (body.upperLabel.trim() || null)
      : null;
  }
  if (body.lowerLabel !== undefined) {
    insertRow.lower_label = typeof body.lowerLabel === 'string'
      ? (body.lowerLabel.trim() || null)
      : null;
  }

  // First try the modern shape (with label columns). When migration 034
  // hasn't been applied yet, Postgres rejects the statement with a 42703 —
  // we strip the label columns and retry so the studio keeps working
  // until the user runs the migration.
  let row = await supabase
    .from('tile_sheets')
    .upsert(insertRow, { onConflict: 'user_id,name' })
    .select('id, name, cols, rows, tile_width, tile_height, sheet_data_url, upper_texture_id, lower_texture_id, upper_label, lower_label, created_at, updated_at')
    .single();
  if (row.error && isMissingLabelColumn(row.error.message)) {
    if (hasLabelInsert) {
      delete insertRow.upper_label;
      delete insertRow.lower_label;
    }
    const fallback = await supabase
      .from('tile_sheets')
      .upsert(insertRow, { onConflict: 'user_id,name' })
      .select('id, name, cols, rows, tile_width, tile_height, sheet_data_url, upper_texture_id, lower_texture_id, created_at, updated_at')
      .single();
    if (fallback.error) return NextResponse.json({ error: fallback.error.message }, { status: 500 });
    return NextResponse.json({ sheet: rowToSheet({ ...fallback.data, upper_label: null, lower_label: null } as SheetRow) });
  }
  if (row.error) return NextResponse.json({ error: row.error.message }, { status: 500 });
  return NextResponse.json({ sheet: rowToSheet(row.data) });
}

function isMissingLabelColumn(msg: string): boolean {
  return /upper_label|lower_label/.test(msg) && /does not exist|column .* not found/i.test(msg);
}

export async function GET() {
  if (!isServerSupabaseConfigured()) {
    return NextResponse.json({ sheets: [] });
  }

  const user = await getServerUser();
  const resolvedUserId = user.isAnonymous ? 'local-user' : user.id;

  const supabase = await getServerSupabase();
  // Same fallback dance as POST: query with label columns, retry without
  // when migration 034 isn't applied yet. Lets the panel keep working
  // before the schema bump.
  let listed = await supabase
    .from('tile_sheets')
    .select('id, name, cols, rows, tile_width, tile_height, sheet_data_url, upper_texture_id, lower_texture_id, upper_label, lower_label, created_at, updated_at')
    .eq('user_id', resolvedUserId)
    .order('created_at', { ascending: false })
    .limit(100);
  if (listed.error && isMissingLabelColumn(listed.error.message)) {
    const fallback = await supabase
      .from('tile_sheets')
      .select('id, name, cols, rows, tile_width, tile_height, sheet_data_url, upper_texture_id, lower_texture_id, created_at, updated_at')
      .eq('user_id', resolvedUserId)
      .order('created_at', { ascending: false })
      .limit(100);
    if (fallback.error) return NextResponse.json({ error: fallback.error.message }, { status: 500 });
    const sheets = (fallback.data ?? []).map((r) => rowToSheet({ ...r, upper_label: null, lower_label: null } as SheetRow));
    return NextResponse.json({ sheets });
  }
  if (listed.error) return NextResponse.json({ error: listed.error.message }, { status: 500 });
  return NextResponse.json({ sheets: (listed.data ?? []).map(rowToSheet) });
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
  upper_label: string | null;
  lower_label: string | null;
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
    upperLabel: r.upper_label ?? undefined,
    lowerLabel: r.lower_label ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}
