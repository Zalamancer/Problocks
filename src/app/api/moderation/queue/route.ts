import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { isSignedInTeacher } from '@/lib/teacher-auth';

// GET /api/moderation/queue
// Returns two parallel lists the /teacher/moderation surface renders:
//   - pendingGames: games awaiting first-pass approval
//   - openReports: flags filed via /api/games/[id]/report that haven't been
//     reviewed yet; each report gets its game hydrated so the UI doesn't
//     have to make N queries
//
// Sprint 2 returns everything platform-wide. Sprint 3 will require an
// authenticated teacher and scope to the classes they own.

interface PendingGameRow {
  id: string;
  user_id: string;
  name: string;
  prompt: string;
  cover_url: string | null;
  plays_count: number;
  is_published: boolean;
  moderation_status: string;
  updated_at: string;
  created_at: string;
}

interface OpenReportRow {
  id: string;
  game_id: string;
  reason: string;
  details: string | null;
  reporter_id: string | null;
  status: string;
  created_at: string;
  game: { id: string; name: string; cover_url: string | null; is_published: boolean } | null;
}

export async function GET() {
  if (!(await isSignedInTeacher())) {
    return NextResponse.json({ error: 'Teacher sign-in required' }, { status: 401 });
  }

  if (!isSupabaseConfigured() || !supabase) {
    return NextResponse.json({ pendingGames: [], openReports: [] });
  }

  const [pendingRes, reportsRes] = await Promise.all([
    supabase
      .from('games')
      .select('id, user_id, name, prompt, cover_url, plays_count, is_published, moderation_status, updated_at, created_at')
      .eq('is_published', true)
      .eq('moderation_status', 'pending')
      .order('updated_at', { ascending: false })
      .limit(100)
      .returns<PendingGameRow[]>(),
    supabase
      .from('game_reports')
      .select('id, game_id, reason, details, reporter_id, status, created_at, game:games!inner(id, name, cover_url, is_published)')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(100)
      .returns<OpenReportRow[]>(),
  ]);

  if (pendingRes.error) {
    console.error('Moderation queue — games error:', pendingRes.error);
    return NextResponse.json({ error: 'Failed to load pending games' }, { status: 500 });
  }
  if (reportsRes.error) {
    console.error('Moderation queue — reports error:', reportsRes.error);
    return NextResponse.json({ error: 'Failed to load open reports' }, { status: 500 });
  }

  return NextResponse.json({
    pendingGames: pendingRes.data ?? [],
    openReports: reportsRes.data ?? [],
  });
}
