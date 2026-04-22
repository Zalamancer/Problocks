import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// Sprint 1 `save` route.
//
// Unlike the v1 route this no longer round-trips through Supabase Storage for
// typical single-file games — the HTML lands directly in `games.html_content`.
// Storage is still wired for Sprint 2 when we start accepting larger
// multi-asset bundles, but the happy path is now inline + one round trip.
//
// Uses an upsert on `id` so the client can reuse its local UUID across
// generate → save → edit → save-again without juggling two ids.
//
// NOTE: auth is still wide-open in Sprint 1 — the studio doesn't yet know who
// the user is. Sprint 2 swaps the client-supplied `userId` for an authenticated
// `auth.uid()` and tightens the RLS policies in migration 006.

const MAX_HTML_BYTES = 2 * 1024 * 1024; // 2 MB is plenty for inline HTML+CSS+JS

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null) as {
      id?: string;
      name?: string;
      prompt?: string;
      html?: string;
      userId?: string;
      coverUrl?: string | null;
    } | null;

    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { id, name, prompt, html, userId, coverUrl } = body;

    if (!name || !prompt || !html) {
      return NextResponse.json(
        { error: 'Missing required fields: name, prompt, html' },
        { status: 400 }
      );
    }

    if (typeof html !== 'string' || Buffer.byteLength(html, 'utf8') > MAX_HTML_BYTES) {
      return NextResponse.json(
        { error: `Game HTML too large (max ${MAX_HTML_BYTES} bytes)` },
        { status: 413 }
      );
    }

    if (!isSupabaseConfigured() || !supabase) {
      // Studio still works offline — it just falls back to localStorage-only.
      return NextResponse.json({
        id: id ?? crypto.randomUUID(),
        playUrl: null,
        warning: 'Supabase not configured — game saved locally only',
      });
    }

    const resolvedUserId = userId || 'local-user';
    const resolvedId = id ?? crypto.randomUUID();
    const now = new Date().toISOString();

    // Upsert on id. On first save this inserts; on subsequent saves this
    // updates the html_content / name / prompt. We deliberately don't touch
    // is_published / visibility / plays_count here — those are owned by the
    // separate PATCH endpoint.
    const { data, error } = await supabase
      .from('games')
      .upsert(
        {
          id: resolvedId,
          user_id: resolvedUserId,
          name,
          prompt,
          html_content: html,
          cover_url: coverUrl ?? null,
          updated_at: now,
        },
        { onConflict: 'id' }
      )
      .select('id')
      .single();

    if (error || !data) {
      console.error('Save game error:', error);
      return NextResponse.json(
        { error: 'Failed to save game', details: error?.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: data.id,
      playUrl: `${request.nextUrl.origin}/play/${data.id}`,
    });
  } catch (err) {
    console.error('Save game error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
