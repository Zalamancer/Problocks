import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getAdminSupabase } from '@/lib/supabase-admin';
import { getTeacherSession, isPlatformAdmin } from '@/lib/teacher-auth';

// GET /api/moderation/queue
// Returns two parallel lists the /teacher/moderation surface renders:
//   - pendingGames: games awaiting first-pass approval
//   - openReports: flags filed via /api/games/[id]/report that haven't been
//     reviewed yet; each report gets its game hydrated so the UI doesn't
//     have to make N queries
//
// Sprint 5.2 scopes this to the teacher's own classes. A teacher sees only
// the games whose creator (games.user_id = auth.uid()) is enrolled in at
// least one of the classes they own (classes.teacher_google_sub matches the
// caller's session.googleSub). Platform admins (teachers.role = 'admin')
// keep the original platform-wide view.

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
  const session = await getTeacherSession();
  if (!session?.googleSub) {
    return NextResponse.json({ error: 'Teacher sign-in required' }, { status: 401 });
  }

  const client = getAdminSupabase() ?? (isSupabaseConfigured() ? supabase : null);
  if (!client) {
    return NextResponse.json({ pendingGames: [], openReports: [] });
  }

  const admin = await isPlatformAdmin();

  // Build the list of user_ids whose games this caller is allowed to see.
  // Admins: null (no filter → see everything). Teachers: collect the
  // supabase_user_id of every student enrolled in one of their classes.
  let allowedUserIds: string[] | null = null;
  if (!admin) {
    const ownedClassesRes = await client
      .from('classes')
      .select('id')
      .eq('teacher_google_sub', session.googleSub);

    if (ownedClassesRes.error) {
      console.error('Queue — owned classes error:', ownedClassesRes.error);
      return NextResponse.json({ error: 'Failed to load your classes' }, { status: 500 });
    }

    const ownedClassIds = (ownedClassesRes.data ?? []).map((c: { id: string }) => c.id);

    if (ownedClassIds.length === 0) {
      // Teacher with no classes yet sees nothing. Empty arrays rather than
      // an error so the UI renders its "nothing pending" state cleanly.
      return NextResponse.json({ pendingGames: [], openReports: [] });
    }

    const studentsRes = await client
      .from('students')
      .select('supabase_user_id')
      .in('class_id', ownedClassIds)
      .not('supabase_user_id', 'is', null);

    if (studentsRes.error) {
      console.error('Queue — students error:', studentsRes.error);
      return NextResponse.json({ error: 'Failed to load your roster' }, { status: 500 });
    }

    allowedUserIds = Array.from(new Set(
      (studentsRes.data ?? [])
        .map((s: { supabase_user_id: string | null }) => s.supabase_user_id)
        .filter((x): x is string => typeof x === 'string' && x.length > 0)
    ));

    if (allowedUserIds.length === 0) {
      // No student in any of this teacher's classes has ever linked their
      // Supabase account yet. Nothing to moderate.
      return NextResponse.json({ pendingGames: [], openReports: [] });
    }
  }

  let pendingQuery = client
    .from('games')
    .select('id, user_id, name, prompt, cover_url, plays_count, is_published, moderation_status, updated_at, created_at')
    .eq('is_published', true)
    .eq('moderation_status', 'pending')
    .order('updated_at', { ascending: false })
    .limit(100);

  let reportsQuery = client
    .from('game_reports')
    .select('id, game_id, reason, details, reporter_id, status, created_at, game:games!inner(id, name, cover_url, is_published, user_id)')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(100);

  if (allowedUserIds) {
    pendingQuery = pendingQuery.in('user_id', allowedUserIds);
    reportsQuery = reportsQuery.in('game.user_id', allowedUserIds);
  }

  const [pendingRes, reportsRes] = await Promise.all([
    pendingQuery.returns<PendingGameRow[]>(),
    reportsQuery.returns<OpenReportRow[]>(),
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
