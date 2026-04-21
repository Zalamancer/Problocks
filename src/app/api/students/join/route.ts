// POST /api/students/join — student self-enrolls into a class.
//
// Flow:
//   1. Student clicks /join/:classId link
//   2. They sign in with Google (next-auth; non-sensitive openid+email+profile)
//   3. Client POSTs { classId } here
//   4. We verify the session, read session.googleSub, and upsert a `students`
//      row. Google `sub` is stable + equals Classroom API's `userId`, so grades
//      sync later without ever touching the restricted rosters scope.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured() || !supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const session = await getServerSession(authOptions);
  if (!session || !session.googleSub) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const classId = body?.classId;
  if (typeof classId !== 'string' || !classId) {
    return NextResponse.json({ error: 'classId required' }, { status: 400 });
  }

  // Confirm the class exists so we don't create orphan student rows.
  const cls = await supabase
    .from('classes')
    .select('id, name')
    .eq('id', classId)
    .maybeSingle();
  if (cls.error) return NextResponse.json({ error: cls.error.message }, { status: 500 });
  if (!cls.data) return NextResponse.json({ error: 'Class not found' }, { status: 404 });

  const user = session.user ?? {};
  const fullName = user.name ?? session.user?.email ?? 'Student';
  const [givenName, ...rest] = fullName.split(' ');
  const familyName = rest.join(' ') || null;

  const upsert = await supabase
    .from('students')
    .upsert(
      {
        class_id: classId,
        google_sub: session.googleSub,
        email: user.email ?? null,
        full_name: fullName,
        given_name: givenName ?? null,
        family_name: familyName,
        picture_url: user.image ?? null,
      },
      { onConflict: 'class_id,google_sub' },
    )
    .select()
    .single();

  if (upsert.error) {
    return NextResponse.json({ error: upsert.error.message }, { status: 500 });
  }

  return NextResponse.json({ student: upsert.data, class: cls.data });
}
