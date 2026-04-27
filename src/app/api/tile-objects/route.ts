import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, getServerUser, isServerSupabaseConfigured } from '@/lib/supabase-server';

// 2D Tile-based — uploaded standalone object sprite endpoint, with
// multi-style "group" support (migration 033).
//
// POST   /api/tile-objects
//   { name, dataUrl, width, height, groupId?, label?, sortIndex?, userId? }
//   → upserts on (user_id, group_id, label); returns the row.
//   - groupId omitted → server generates a new one (= a brand-new asset
//     with one style).
//   - groupId provided → adds (or overwrites) a style on that asset.
//
// GET    /api/tile-objects
//   → returns the caller's sprite rows. Client groups by groupId to
//     reconstruct the asset/style tree.
//
// DELETE /api/tile-objects?id=<uuid>            — single style row.
// DELETE /api/tile-objects?groupId=<uuid>       — every style in the asset.

const MAX_DATA_BYTES = 8 * 1024 * 1024;
const MAX_NAME_LENGTH = 200;
const MAX_LABEL_LENGTH = 80;

interface ObjectBody {
  name?: string;
  dataUrl?: string;
  width?: number;
  height?: number;
  groupId?: string;
  label?: string;
  sortIndex?: number;
  userId?: string;
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as ObjectBody | null;
  if (!body) return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const dataUrl = typeof body.dataUrl === 'string' ? body.dataUrl : '';
  const width = Number(body.width);
  const height = Number(body.height);
  const label = typeof body.label === 'string' ? body.label.trim() : '';
  const sortIndex = Number.isFinite(Number(body.sortIndex)) ? Number(body.sortIndex) : 0;
  const groupId = typeof body.groupId === 'string' && body.groupId ? body.groupId : undefined;

  if (!name) return NextResponse.json({ error: 'Missing name' }, { status: 400 });
  if (name.length > MAX_NAME_LENGTH) {
    return NextResponse.json({ error: `Name too long (max ${MAX_NAME_LENGTH})` }, { status: 400 });
  }
  if (label.length > MAX_LABEL_LENGTH) {
    return NextResponse.json({ error: `Label too long (max ${MAX_LABEL_LENGTH})` }, { status: 400 });
  }
  if (!dataUrl.startsWith('data:image/')) {
    return NextResponse.json({ error: 'dataUrl must be a data:image/* URL' }, { status: 400 });
  }
  if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) {
    return NextResponse.json({ error: 'width/height must be > 0' }, { status: 400 });
  }
  if (Buffer.byteLength(dataUrl, 'utf8') > MAX_DATA_BYTES) {
    return NextResponse.json(
      { error: `Sprite too large (max ${MAX_DATA_BYTES} bytes encoded)` },
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
  const insertRow: Record<string, unknown> = {
    user_id: resolvedUserId,
    name,
    data_url: dataUrl,
    width,
    height,
    label,
    sort_index: sortIndex,
    updated_at: new Date().toISOString(),
  };
  if (groupId) insertRow.group_id = groupId;

  const { data, error } = await supabase
    .from('tile_objects')
    .upsert(insertRow, { onConflict: 'user_id,group_id,label' })
    .select('id, group_id, name, label, sort_index, data_url, width, height, created_at, updated_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ object: rowToObject(data) });
}

export async function GET() {
  if (!isServerSupabaseConfigured()) {
    return NextResponse.json({ objects: [] });
  }

  const user = await getServerUser();
  const resolvedUserId = user.isAnonymous ? 'local-user' : user.id;

  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from('tile_objects')
    .select('id, group_id, name, label, sort_index, data_url, width, height, created_at, updated_at')
    .eq('user_id', resolvedUserId)
    .order('group_id', { ascending: true })
    .order('sort_index', { ascending: true })
    .order('created_at', { ascending: true })
    .limit(500);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ objects: (data ?? []).map(rowToObject) });
}

export async function DELETE(request: NextRequest) {
  if (!isServerSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const groupId = url.searchParams.get('groupId');
  if (!id && !groupId) return NextResponse.json({ error: 'Missing id or groupId' }, { status: 400 });

  const user = await getServerUser();
  const resolvedUserId = user.isAnonymous ? 'local-user' : user.id;

  const supabase = await getServerSupabase();
  const query = supabase.from('tile_objects').delete().eq('user_id', resolvedUserId);
  const { error } = id
    ? await query.eq('id', id)
    : await query.eq('group_id', groupId!);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

interface ObjectRow {
  id: string;
  group_id: string;
  name: string;
  label: string;
  sort_index: number;
  data_url: string;
  width: number;
  height: number;
  created_at: string;
  updated_at: string;
}

function rowToObject(r: ObjectRow) {
  return {
    id: r.id,
    groupId: r.group_id,
    name: r.name,
    label: r.label ?? '',
    sortIndex: r.sort_index ?? 0,
    dataUrl: r.data_url,
    width: r.width,
    height: r.height,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}
