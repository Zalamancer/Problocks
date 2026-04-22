import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// Per-game endpoints used by the play page (GET), the studio Share flow
// (PATCH to publish / rename), and the My Games panel (DELETE).
//
// Sprint 1 keeps auth wide-open; any caller with the id can patch or delete.
// Sprint 2 will gate PATCH/DELETE behind `auth.uid() = user_id`.

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

  if (!isSupabaseConfigured() || !supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

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

  if (!isSupabaseConfigured() || !supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

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
      // A newly-published game gets a reasonable default visibility if the
      // client didn't pass one.
      if (!body.visibility) updates.visibility = 'public';
    }
  }

  if (body.visibility === 'private' || body.visibility === 'unlisted' || body.visibility === 'public') {
    updates.visibility = body.visibility;
  }

  if (body.coverUrl === null || typeof body.coverUrl === 'string') {
    updates.cover_url = body.coverUrl;
  }

  const { data, error } = await supabase
    .from('games')
    .update(updates)
    .eq('id', id)
    .select('id, name, is_published, visibility, moderation_status, cover_url')
    .single();

  if (error || !data) {
    console.error('Patch game error:', error);
    return NextResponse.json({ error: 'Failed to update game' }, { status: 500 });
  }

  return NextResponse.json({ game: data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!isSupabaseConfigured() || !supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const { error } = await supabase.from('games').delete().eq('id', id);

  if (error) {
    console.error('Delete game error:', error);
    return NextResponse.json({ error: 'Failed to delete game' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
