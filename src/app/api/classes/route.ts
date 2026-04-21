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
  // Avoid visually-confusing chars (0/O, 1/I/L).
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s.slice(0, 3) + '-' + s.slice(3);
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

  if (insert.error) {
    return NextResponse.json({ error: insert.error.message }, { status: 500 });
  }

  return NextResponse.json({ class: insert.data });
}
