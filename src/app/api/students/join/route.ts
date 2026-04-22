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
import { getServerUser } from '@/lib/supabase-server';

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

  // If this visitor also has a Supabase auth session (student signed in via
  // AuthScreen at /student), capture it so moderation can later join games
  // (keyed on Supabase auth.uid()) back to the student's classes (keyed on
  // google_sub). Anonymous visits still enrol — they just won't participate
  // in class-scoped moderation until they link the accounts.
  const supabaseUser = await getServerUser();
  const supabaseUserId = supabaseUser.isAnonymous ? null : supabaseUser.id;

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
        supabase_user_id: supabaseUserId,
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
