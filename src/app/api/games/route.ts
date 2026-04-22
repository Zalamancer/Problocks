import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// GET /api/games?userId=X   → list X's drafts (default: 'local-user')
// GET /api/games?published=1 → list published, approved games (marketplace)
//
// Sprint 1 keeps the userId query param rather than a real session lookup —
// the studio pipes through the hardcoded 'local-user' id used in the v1
// route. Sprint 2 replaces this with `auth.uid()`.

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json({
        games: [],
        warning: 'Supabase not configured — no games available',
      });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const publishedOnly = searchParams.get('published') === '1';
    const limitParam = Number(searchParams.get('limit')) || 50;
    const limit = Math.min(Math.max(limitParam, 1), 100);

    let query = supabase
      .from('games')
      .select('id, user_id, name, prompt, cover_url, is_published, visibility, plays_count, moderation_status, created_at, updated_at')
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (publishedOnly) {
      query = query.eq('is_published', true).eq('moderation_status', 'approved');
    } else if (userId) {
      query = query.eq('user_id', userId);
    } else {
      // Fall back to 'local-user' so the studio's default fetch works without
      // changes on day one.
      query = query.eq('user_id', 'local-user');
    }

    const { data, error } = await query;

    if (error) {
      console.error('List games error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch games', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ games: data ?? [] });
  } catch (err) {
    console.error('List games error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
