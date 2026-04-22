import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, getServerUser, isServerSupabaseConfigured } from '@/lib/supabase-server';

// Sprint 3 save route.
//
// Sprint 1 stored games keyed on a client-supplied `userId` (defaulting to
// 'local-user'). Sprint 3 switches to the real authenticated user id via
// getServerUser(); the RLS policies in migration 010 enforce ownership at
// the database level so even a compromised client can't write rows it
// doesn't own. The body still accepts `userId` for dev-only unauthenticated
// flows (local-user), but anything that runs through the authed path wins.

const MAX_HTML_BYTES = 2 * 1024 * 1024;

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

    const { id, name, prompt, html, coverUrl } = body;

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

    if (!isServerSupabaseConfigured()) {
      return NextResponse.json({
        id: id ?? crypto.randomUUID(),
        playUrl: null,
        warning: 'Supabase not configured — game saved locally only',
      });
    }

    // Real authenticated user wins; falls back to the body userId (or
    // 'local-user') ONLY when there's no session. This tolerates the
    // ongoing studio-without-login dev path during the Sprint 3 rollout.
    const user = await getServerUser();
    const resolvedUserId = user.isAnonymous ? (body.userId || 'local-user') : user.id;
    const resolvedId = id ?? crypto.randomUUID();
    const now = new Date().toISOString();

    const supabase = await getServerSupabase();

    // Upsert on id. When a row already exists with a DIFFERENT user_id the
    // RLS UPDATE policy (user_id = auth.uid()) will refuse and the row
    // stays untouched — save_game.ts is the happy path for new id, update
    // for owned id, and the RLS gate handles the IDOR attempt.
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
