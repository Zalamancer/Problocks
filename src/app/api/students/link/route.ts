import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getServerUser } from '@/lib/supabase-server';
import { getAdminSupabase } from '@/lib/supabase-admin';

// POST /api/students/link
// Attach the caller's Supabase auth.uid() to every students row that's
// currently keyed on their NextAuth googleSub but has no supabase_user_id
// yet. This closes the two-identity gap (see Sprint 5.2) so the
// moderation queue can join games → students → classes for this student
// from now on.
//
// Both sessions must be present. Returns the number of rows updated so the
// client can show the right toast copy.

export async function POST() {
  const nextAuth = await getServerSession(authOptions);
  if (!nextAuth?.googleSub) {
    return NextResponse.json({ error: 'Google sign-in required' }, { status: 401 });
  }

  const supabaseUser = await getServerUser();
  if (supabaseUser.isAnonymous) {
    return NextResponse.json({ error: 'Playdemy account sign-in required' }, { status: 401 });
  }

  const admin = getAdminSupabase();
  if (!admin) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 503 });
  }

  // Only rows that haven't been linked yet — we don't want to clobber an
  // earlier link (could happen if the same Google account signed in under
  // two Supabase identities; rare but worth being defensive about).
  const { data, error } = await admin
    .from('students')
    .update({ supabase_user_id: supabaseUser.id })
    .eq('google_sub', nextAuth.googleSub)
    .is('supabase_user_id', null)
    .select('id');

  if (error) {
    console.error('Link student error:', error);
    return NextResponse.json({ error: 'Failed to link account' }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    linked: data?.length ?? 0,
  });
}
