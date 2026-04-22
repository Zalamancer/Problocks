// POST /api/classes — persist a newly-set-up classroom.
//
// Called from the Teacher setup flow when the teacher hits "Open the classroom".
// Requires an authenticated session so we can key the row on the teacher's
// Google `sub`. That same sub is how we'll later join Classroom submissions
// (userId === googleSub) without ever needing the restricted rosters scope.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

function randomJoinCode() {
  // 8-char alphanumeric code ≈ 40 bits of entropy (~1.1T space). The code is
  // effectively a bearer token — anyone who has it can join the class — so we
  // want it unguessable even under light rate limiting. Uses crypto.getRandomValues
  // (available in both Node 18+ and the Edge runtime) instead of Math.random
  // so codes aren't predictable. Skips visually-confusing chars (0/O, 1/I/L).
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const buf = new Uint32Array(8);
  crypto.getRandomValues(buf);
  let s = '';
  for (let i = 0; i < 8; i++) s += chars[buf[i] % chars.length];
  return `${s.slice(0, 4)}-${s.slice(4)}`;
}

type Body = {
  name?: string;
  subject?: string;
  grade?: string;
  color?: string;
  classroomCourseId?: string | null;
  joinCode?: string | null;
};

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured() || !supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.googleSub) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body || typeof body.name !== 'string' || !body.name.trim()) {
    return NextResponse.json({ error: 'name required' }, { status: 400 });
  }

  const joinCode = body.joinCode?.trim() || randomJoinCode();

  // Upsert-on-(teacher, join_code): if this teacher has already reserved a
  // row with this join code (e.g. during step 3 of the setup wizard so the
  // share link resolves immediately), update the existing row with the
  // latest fields instead of creating a duplicate. This makes /api/classes
  // safely idempotent for the "reserve early, finalise later" flow.
  const existing = await supabase
    .from('classes')
    .select('id, classroom_course_id')
    .eq('teacher_google_sub', session.googleSub)
    .eq('join_code', joinCode)
    .maybeSingle();

  let row: { id: string; [k: string]: unknown };
  let isInsert = true;

  if (existing.data) {
    isInsert = false;
    const upd = await supabase
      .from('classes')
      .update({
        name: body.name.trim(),
        subject: body.subject ?? null,
        grade: body.grade ?? null,
        color: body.color ?? null,
        classroom_course_id: body.classroomCourseId ?? existing.data.classroom_course_id ?? null,
      })
      .eq('id', existing.data.id)
      .select()
      .single();
    if (upd.error) return NextResponse.json({ error: upd.error.message }, { status: 500 });
    row = upd.data;
  } else {
    const insert = await supabase
      .from('classes')
      .insert({
        teacher_google_sub: session.googleSub,
        name: body.name.trim(),
        subject: body.subject ?? null,
        grade: body.grade ?? null,
        color: body.color ?? null,
        classroom_course_id: body.classroomCourseId ?? null,
        join_code: joinCode,
      })
      .select()
      .single();
    if (insert.error) return NextResponse.json({ error: insert.error.message }, { status: 500 });
    row = insert.data;
  }

  // If linked to a Google Classroom course, pre-seed the student roster.
  // We ignore failures here — the class itself is already created, so we'd
  // rather surface a "N students imported" = 0 (with a reason) than fail
  // the whole openRoom flow. The restricted classroom.rosters.readonly
  // scope is required; without it the students.list endpoint 403s.
  let importedStudents = 0;
  let importError: string | null = null;
  if (isInsert && body.classroomCourseId && session.accessToken) {
    try {
      importedStudents = await importClassroomRoster(
        row.id,
        body.classroomCourseId,
        session.accessToken,
      );
    } catch (e) {
      importError = e instanceof Error ? e.message : 'Roster import failed';
    }
  }

  return NextResponse.json({
    class: row,
    importedStudents,
    importError,
  });
}

// ── Classroom roster import ────────────────────────────────────────────────
// Lists all students on the linked course and upserts one row per student
// into public.students. Paginated because Classroom caps students.list at
// 100/page and some classes run big. Each row is keyed on (class_id,
// google_sub) so re-running (e.g. via a future "refresh roster" button) is
// idempotent — Supabase's ON CONFLICT clause keeps existing rows' avatar
// outfits etc. intact.
type ClassroomStudentListItem = {
  userId: string;
  profile: {
    id: string;
    name: { fullName?: string; givenName?: string; familyName?: string };
    emailAddress?: string;
    photoUrl?: string;
  };
};

async function importClassroomRoster(
  classId: string,
  courseId: string,
  accessToken: string,
): Promise<number> {
  if (!supabase) return 0;
  let pageToken: string | undefined;
  let total = 0;

  do {
    const url = new URL(`https://classroom.googleapis.com/v1/courses/${courseId}/students`);
    url.searchParams.set('pageSize', '100');
    if (pageToken) url.searchParams.set('pageToken', pageToken);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.error?.message ?? `Classroom students API ${res.status}`);
    }
    const data = (await res.json()) as {
      students?: ClassroomStudentListItem[];
      nextPageToken?: string;
    };

    const rows = (data.students ?? []).map((s) => ({
      class_id: classId,
      google_sub: s.userId, // Classroom userId === Google sub
      email: s.profile.emailAddress ?? null,
      full_name:
        s.profile.name.fullName?.trim() ||
        [s.profile.name.givenName, s.profile.name.familyName].filter(Boolean).join(' ') ||
        s.profile.emailAddress ||
        'Student',
      given_name: s.profile.name.givenName ?? null,
      family_name: s.profile.name.familyName ?? null,
      // Classroom returns photoUrl as a protocol-relative URL
      // ("//lh3.googleusercontent.com/…"); some legacy accounts return a
      // full "https://…". Normalise so browsers don't trip over bare "//".
      picture_url: s.profile.photoUrl
        ? (s.profile.photoUrl.startsWith('http') ? s.profile.photoUrl : `https:${s.profile.photoUrl}`)
        : null,
    }));

    if (rows.length > 0) {
      const up = await supabase
        .from('students')
        .upsert(rows, { onConflict: 'class_id,google_sub', ignoreDuplicates: false });
      if (up.error) throw new Error(up.error.message);
      total += rows.length;
    }

    pageToken = data.nextPageToken;
  } while (pageToken);

  return total;
}
