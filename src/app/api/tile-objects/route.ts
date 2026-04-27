import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, getServerUser, isServerSupabaseConfigured } from '@/lib/supabase-server';

// 2D Tile-based — uploaded standalone object sprite endpoint.
//
// POST   /api/tile-objects
//   { name, dataUrl, width, height, userId? }
//   → upserts on (user_id, name); returns the row.
//
// GET    /api/tile-objects
//   → returns the caller's uploaded object sprites.
//
// DELETE /api/tile-objects?id=<uuid>
//   → deletes the caller's row by id.
//
// Mirrors /api/tile-sheets ownership rules: auth.uid() wins when signed-in,
// otherwise body.userId (or 'local-user') keeps anonymous studio sessions
// working. RLS on `tile_objects` (migration 032) is the actual gate.

const MAX_DATA_BYTES = 8 * 1024 * 1024;
const MAX_NAME_LENGTH = 200;

interface ObjectBody {
  name?: string;
  dataUrl?: string;
  width?: number;
  height?: number;
  userId?: string;
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as ObjectBody | null;
  if (!body) return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const dataUrl = typeof body.dataUrl === 'string' ? body.dataUrl : '';
  const width = Number(body.width);
  const height = Number(body.height);

  if (!name) return NextResponse.json({ error: 'Missing name' }, { status: 400 });
  if (name.length > MAX_NAME_LENGTH) {
    return NextResponse.json({ error: `Name too long (max ${MAX_NAME_LENGTH})` }, { status: 400 });
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
  const { data, error } = await supabase
    .from('tile_objects')
    .upsert({
      user_id: resolvedUserId,
      name,
      data_url: dataUrl,
      width,
      height,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,name' })
    .select('id, name, data_url, width, height, created_at, updated_at')
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
    .select('id, name, data_url, width, height, created_at, updated_at')
    .eq('user_id', resolvedUserId)
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ objects: (data ?? []).map(rowToObject) });
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
    .from('tile_objects')
    .delete()
    .eq('user_id', resolvedUserId)
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

interface ObjectRow {
  id: string;
  name: string;
  data_url: string;
  width: number;
  height: number;
  created_at: string;
  updated_at: string;
}

function rowToObject(r: ObjectRow) {
  return {
    id: r.id,
    name: r.name,
    dataUrl: r.data_url,
    width: r.width,
    height: r.height,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}
