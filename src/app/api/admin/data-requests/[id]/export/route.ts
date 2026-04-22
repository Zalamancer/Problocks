import { NextResponse } from 'next/server';
import { isPlatformAdmin } from '@/lib/teacher-auth';
import { getAdminSupabase } from '@/lib/supabase-admin';

// GET /api/admin/data-requests/:id/export
// Packages everything we store about the student named on a data_request
// into a JSON download. Used by admins to fulfil export requests (and
// eyeballed before fulfilling delete requests to confirm we know who the
// caller means).
//
// Matching strategy — we try every identifier the form captured:
//   * student_user_id -> games, user_credits, credit_events
//   * student_email   -> teachers row (if teacher), students rows
//   * student_name    -> students rows by full_name substring (last resort)
// Whichever matches, rows land in the corresponding array. Empty arrays mean
// "we didn't find anything for that identifier".

interface ExportBundle {
  generatedAt: string;
  request: Record<string, unknown>;
  matched: {
    studentUserId: string | null;
    studentEmail: string | null;
    studentName: string | null;
  };
  data: {
    students: unknown[];
    games: unknown[];
    playEvents: unknown[];
    userCredits: unknown | null;
    creditEvents: unknown[];
    teachers: unknown[];
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isPlatformAdmin())) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const admin = getAdminSupabase();
  if (!admin) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 503 });
  }

  const { id } = await params;

  // 1. Load the request itself.
  const { data: req, error: reqErr } = await admin
    .from('data_requests')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (reqErr || !req) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 });
  }

  const studentUserId = (req as { student_user_id?: string }).student_user_id ?? null;
  const studentEmail = (req as { student_email?: string }).student_email ?? null;
  const studentName = (req as { student_name?: string }).student_name ?? null;

  const bundle: ExportBundle = {
    generatedAt: new Date().toISOString(),
    request: req as Record<string, unknown>,
    matched: { studentUserId, studentEmail, studentName },
    data: {
      students: [],
      games: [],
      playEvents: [],
      userCredits: null,
      creditEvents: [],
      teachers: [],
    },
  };

  // 2. Rows keyed on Supabase auth.uid (student_user_id).
  if (studentUserId) {
    const { data: games } = await admin
      .from('games')
      .select('*')
      .eq('user_id', studentUserId);
    bundle.data.games = games ?? [];

    if (games && games.length > 0) {
      const gameIds = (games as { id: string }[]).map((g) => g.id);
      const { data: events } = await admin
        .from('play_events')
        .select('*')
        .in('game_id', gameIds);
      bundle.data.playEvents = events ?? [];
    }

    const { data: credits } = await admin
      .from('user_credits')
      .select('*')
      .eq('user_id', studentUserId)
      .maybeSingle();
    bundle.data.userCredits = credits ?? null;

    const { data: creditEvents } = await admin
      .from('credit_events')
      .select('*')
      .eq('user_id', studentUserId);
    bundle.data.creditEvents = creditEvents ?? [];
  }

  // 3. Students rows — match on email, then user_id, then a name prefix.
  if (studentEmail) {
    const { data } = await admin
      .from('students')
      .select('*')
      .eq('email', studentEmail);
    if (data) bundle.data.students = [...bundle.data.students, ...data];
  }
  if (studentUserId) {
    const { data } = await admin
      .from('students')
      .select('*')
      .eq('supabase_user_id', studentUserId);
    if (data) {
      // De-dupe on id so an email+user_id match doesn't produce two copies.
      const seen = new Set((bundle.data.students as { id: string }[]).map((s) => s.id));
      for (const s of data as { id: string }[]) {
        if (!seen.has(s.id)) bundle.data.students.push(s);
      }
    }
  }
  if (studentName && bundle.data.students.length === 0) {
    // Last-resort name match — only if we haven't already found something.
    // Using ilike so "John Smith" matches "John H. Smith".
    const { data } = await admin
      .from('students')
      .select('*')
      .ilike('full_name', `%${studentName}%`)
      .limit(20);
    if (data) bundle.data.students = data;
  }

  // 4. Teachers row in case the request target is a teacher (some parents
  // mis-address requests to the teacher account).
  if (studentEmail) {
    const { data } = await admin
      .from('teachers')
      .select('*')
      .eq('email', studentEmail);
    if (data) bundle.data.teachers = data;
  }

  const filename = `problocks-export-${id}-${Date.now()}.json`;
  return new NextResponse(JSON.stringify(bundle, null, 2), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'content-disposition': `attachment; filename="${filename}"`,
    },
  });
}
