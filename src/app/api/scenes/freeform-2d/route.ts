import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, getServerUser, isServerSupabaseConfigured } from '@/lib/supabase-server';

// 2D Freeform scene save endpoint.
//
// POST /api/scenes/freeform-2d
//   { name: string, data: object, userId?: string }
//   → upserts on (user_id, name); RLS enforces ownership.
//
// GET  /api/scenes/freeform-2d
//   → returns the caller's scenes (id, name, updated_at) — no `data` to
//     keep the listing cheap.
//
// GET  /api/scenes/freeform-2d?name=<name>
//   → returns the full scene row for that name. Used by Open Scene…
//     in the studio.
//
// Sprint 3 ownership rules apply (mirrors /api/games/save):
//   - When a Supabase session exists, auth.uid() wins; the body's userId
//     is ignored.
//   - When there's no session, body.userId (or the literal 'local-user')
//     is used so the dev studio without sign-in keeps saving.
//   - RLS on `freeform_scenes` is the actual gate (migration 029).

const MAX_DATA_BYTES = 50 * 1024 * 1024; // 50 MB — generous; jsonb can handle more but localStorage callers can't.
const MAX_NAME_LENGTH = 200;

interface SceneBody {
  name?: string;
  data?: unknown;
  userId?: string;
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as SceneBody | null;
  if (!body) return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name) return NextResponse.json({ error: 'Missing scene name' }, { status: 400 });
  if (name.length > MAX_NAME_LENGTH) {
    return NextResponse.json(
      { error: `Scene name too long (max ${MAX_NAME_LENGTH} chars)` },
      { status: 400 },
    );
  }
  if (!body.data || typeof body.data !== 'object') {
    return NextResponse.json({ error: 'Missing scene data' }, { status: 400 });
  }

  const serialized = JSON.stringify(body.data);
  if (Buffer.byteLength(serialized, 'utf8') > MAX_DATA_BYTES) {
    return NextResponse.json(
      { error: `Scene data too large (max ${MAX_DATA_BYTES} bytes)` },
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
    .from('freeform_scenes')
    .upsert(
      {
        user_id: resolvedUserId,
        name,
        data: body.data,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,name' },
    )
    .select('id, name, updated_at')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id, name: data.name, updatedAt: data.updated_at });
}

export async function GET(request: NextRequest) {
  if (!isServerSupabaseConfigured()) {
    return NextResponse.json({ scenes: [] });
  }

  const user = await getServerUser();
  const resolvedUserId = user.isAnonymous ? 'local-user' : user.id;

  const supabase = await getServerSupabase();
  const url = new URL(request.url);
  const name = url.searchParams.get('name');

  if (name) {
    // Fetch one full scene by name. RLS still scopes to the caller; we
    // also filter by user_id explicitly so anonymous shares don't leak
    // someone else's `local-user` rows.
    const { data, error } = await supabase
      .from('freeform_scenes')
      .select('id, name, data, updated_at')
      .eq('user_id', resolvedUserId)
      .eq('name', name)
      .maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({
      id: data.id,
      name: data.name,
      data: data.data,
      updatedAt: data.updated_at,
    });
  }

  // List mode — no `data` field to keep the response small.
  const { data, error } = await supabase
    .from('freeform_scenes')
    .select('id, name, updated_at')
    .eq('user_id', resolvedUserId)
    .order('updated_at', { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({
    scenes: (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      updatedAt: row.updated_at,
    })),
  });
}

export async function DELETE(request: NextRequest) {
  if (!isServerSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const url = new URL(request.url);
  const name = url.searchParams.get('name');
  if (!name) return NextResponse.json({ error: 'Missing scene name' }, { status: 400 });

  const user = await getServerUser();
  const resolvedUserId = user.isAnonymous ? 'local-user' : user.id;

  const supabase = await getServerSupabase();
  const { error } = await supabase
    .from('freeform_scenes')
    .delete()
    .eq('user_id', resolvedUserId)
    .eq('name', name);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
