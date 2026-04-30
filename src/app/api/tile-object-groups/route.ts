import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, getServerUser, isServerSupabaseConfigured } from '@/lib/supabase-server';

// 2D Tile-based — object groups (taxonomy folders for object assets).
//
// POST   /api/tile-object-groups
//   { name, assetIds?, sortIndex?, userId? }
//   → inserts a new group row, returns it.
//
// GET    /api/tile-object-groups
//   → returns the caller's groups, ordered by sort_index.
//
// PATCH  /api/tile-object-groups
//   { id, name?, assetIds?, sortIndex?, userId? }
//   → updates only the fields provided. Body fields not present are
//     left untouched.
//
// DELETE /api/tile-object-groups?id=<uuid>
//   → deletes a single group row.

const MAX_NAME_LENGTH = 200;
const MAX_ASSETS_PER_GROUP = 5000;

interface PostBody {
  name?: string;
  assetIds?: string[];
  sortIndex?: number;
  userId?: string;
}

export async function POST(request: NextRequest) {
  if (!isServerSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Supabase not configured — set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY' },
      { status: 503 },
    );
  }
  const body = (await request.json().catch(() => null)) as PostBody | null;
  if (!body) return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name) return NextResponse.json({ error: 'Missing name' }, { status: 400 });
  if (name.length > MAX_NAME_LENGTH) {
    return NextResponse.json({ error: `Name too long (max ${MAX_NAME_LENGTH})` }, { status: 400 });
  }

  const assetIds = sanitizeAssetIds(body.assetIds);
  const sortIndex = Number.isFinite(Number(body.sortIndex)) ? Number(body.sortIndex) : 0;

  const user = await getServerUser();
  const resolvedUserId = user.isAnonymous ? (body.userId || 'local-user') : user.id;

  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from('tile_object_groups')
    .insert({
      user_id: resolvedUserId,
      name,
      asset_ids: assetIds,
      sort_index: sortIndex,
    })
    .select('id, name, asset_ids, sort_index, created_at, updated_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ group: rowToGroup(data) });
}

export async function GET() {
  if (!isServerSupabaseConfigured()) {
    return NextResponse.json({ groups: [] });
  }
  const user = await getServerUser();
  const resolvedUserId = user.isAnonymous ? 'local-user' : user.id;
  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from('tile_object_groups')
    .select('id, name, asset_ids, sort_index, created_at, updated_at')
    .eq('user_id', resolvedUserId)
    .order('sort_index', { ascending: true })
    .order('created_at', { ascending: true })
    .limit(500);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ groups: (data ?? []).map(rowToGroup) });
}

interface PatchBody {
  id?: string;
  name?: string;
  assetIds?: string[];
  sortIndex?: number;
  userId?: string;
}

export async function PATCH(request: NextRequest) {
  if (!isServerSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const body = (await request.json().catch(() => null)) as PatchBody | null;
  if (!body) return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  const id = typeof body.id === 'string' ? body.id : '';
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const name = typeof body.name === 'string' ? body.name.trim() : undefined;
  const assetIds = body.assetIds === undefined ? undefined : sanitizeAssetIds(body.assetIds);
  const sortIndex = Number.isFinite(Number(body.sortIndex)) ? Number(body.sortIndex) : undefined;

  if (name === undefined && assetIds === undefined && sortIndex === undefined) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }
  if (name !== undefined && name.length > MAX_NAME_LENGTH) {
    return NextResponse.json({ error: `Name too long (max ${MAX_NAME_LENGTH})` }, { status: 400 });
  }

  const user = await getServerUser();
  const resolvedUserId = user.isAnonymous ? (body.userId || 'local-user') : user.id;

  const patch: Record<string, unknown> = {};
  if (name !== undefined) patch.name = name;
  if (assetIds !== undefined) patch.asset_ids = assetIds;
  if (sortIndex !== undefined) patch.sort_index = sortIndex;

  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from('tile_object_groups')
    .update(patch)
    .eq('user_id', resolvedUserId)
    .eq('id', id)
    .select('id, name, asset_ids, sort_index, created_at, updated_at')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ group: rowToGroup(data) });
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
    .from('tile_object_groups')
    .delete()
    .eq('user_id', resolvedUserId)
    .eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

interface GroupRow {
  id: string;
  name: string;
  asset_ids: string[] | null;
  sort_index: number;
  created_at: string;
  updated_at: string;
}

function rowToGroup(r: GroupRow) {
  return {
    id: r.id,
    name: r.name,
    assetIds: r.asset_ids ?? [],
    sortIndex: r.sort_index ?? 0,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function sanitizeAssetIds(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const out: string[] = [];
  for (const v of input) {
    if (typeof v !== 'string') continue;
    const trimmed = v.trim();
    if (!trimmed) continue;
    out.push(trimmed);
    if (out.length >= MAX_ASSETS_PER_GROUP) break;
  }
  return out;
}
