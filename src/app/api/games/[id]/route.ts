import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, getServerUser, isServerSupabaseConfigured } from '@/lib/supabase-server';

// Sprint 3 hardening: per-game endpoints now read auth via getServerUser()
// and pair that with explicit `.eq('user_id', user.id)` filters on PATCH /
// DELETE. Migration 010 also adds matching RLS so a caller who bypasses the
// API (e.g. direct Supabase SDK) can't tamper with someone else's games.
//
// GET remains permissive: any caller can fetch a game row. The /play page
// filters by is_published, the studio Library panel filters by user_id.
// Sprint 3 could hide private games from non-owners here too, but the
// trade-off is extra complexity for little real win — Library already
// scopes by user_id.

interface GameRow {
  id: string;
  user_id: string;
  name: string;
  prompt: string;
  html_content: string | null;
  storage_path: string | null;
  cover_url: string | null;
  is_published: boolean;
  visibility: 'private' | 'unlisted' | 'public';
  plays_count: number;
  moderation_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!isServerSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const supabase = await getServerSupabase();

  const { data, error } = await supabase
    .from('games')
    .select('id, user_id, name, prompt, html_content, storage_path, cover_url, is_published, visibility, plays_count, moderation_status, created_at, updated_at, published_at')
    .eq('id', id)
    .single<GameRow>();

  if (error || !data) {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 });
  }

  return NextResponse.json({ game: data });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => null) as {
    name?: string;
    isPublished?: boolean;
    visibility?: 'private' | 'unlisted' | 'public';
    coverUrl?: string | null;
  } | null;

  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!isServerSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const user = await getServerUser();

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (typeof body.name === 'string') {
    const trimmed = body.name.trim();
    if (!trimmed) return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 });
    if (trimmed.length > 80) return NextResponse.json({ error: 'Name too long' }, { status: 400 });
    updates.name = trimmed;
  }

  if (typeof body.isPublished === 'boolean') {
    updates.is_published = body.isPublished;
    if (body.isPublished) {
      updates.published_at = new Date().toISOString();
      if (!body.visibility) updates.visibility = 'public';
    }
  }

  if (body.visibility === 'private' || body.visibility === 'unlisted' || body.visibility === 'public') {
    updates.visibility = body.visibility;
  }

  if (body.coverUrl === null || typeof body.coverUrl === 'string') {
    updates.cover_url = body.coverUrl;
  }

  const supabase = await getServerSupabase();

  // Belt + suspenders: filter on user_id too. The RLS UPDATE policy enforces
  // the same thing, but the explicit filter gives us a better error shape
  // (404 "not found" instead of 204 "update affected 0 rows").
  let query = supabase.from('games').update(updates).eq('id', id);
  if (!user.isAnonymous) {
    query = query.eq('user_id', user.id);
  } else {
    // Legacy local-user path — can only touch rows owned by local-user.
    query = query.eq('user_id', 'local-user');
  }

  const { data, error } = await query
    .select('id, name, is_published, visibility, moderation_status, cover_url')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Game not found or not yours' }, { status: 404 });
  }

  return NextResponse.json({ game: data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!isServerSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const user = await getServerUser();
  const supabase = await getServerSupabase();

  let query = supabase.from('games').delete().eq('id', id);
  if (!user.isAnonymous) {
    query = query.eq('user_id', user.id);
  } else {
    query = query.eq('user_id', 'local-user');
  }

  const { data, error } = await query.select('id');

  if (error) {
    console.error('Delete game error:', error);
    return NextResponse.json({ error: 'Failed to delete game' }, { status: 500 });
  }
  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'Game not found or not yours' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
