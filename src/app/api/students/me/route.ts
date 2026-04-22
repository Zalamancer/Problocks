// GET /api/students/me — returns the current (NextAuth) student's profile
// and the classes they've joined. Used by the student dashboard after the
// /join/:classId flow so we show real, joined classes instead of mock data.
//
// Auth: NextAuth Google session (session.googleSub). The `students` table is
// keyed by (class_id, google_sub), so we collect every row matching the
// student's `google_sub` and join to `classes`.
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET() {
  if (!isSupabaseConfigured() || !supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const session = await getServerSession(authOptions);
  if (!session?.googleSub) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  // Pull every enrollment for this student, joined to its class row.
  const rows = await supabase
    .from('students')
    .select('id, full_name, given_name, family_name, picture_url, email, class:classes(id, name, subject, grade, color)')
    .eq('google_sub', session.googleSub);

  if (rows.error) {
    return NextResponse.json({ error: rows.error.message }, { status: 500 });
  }

  const classes = (rows.data ?? [])
    .map((r) => (r as unknown as { class: { id: string; name: string; subject: string | null; grade: string | null; color: string | null } | null }).class)
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  const first = rows.data?.[0];
  const user = first
    ? {
        name: first.full_name as string,
        email: (first.email as string) ?? session.user?.email ?? '',
        picture: (first.picture_url as string) ?? session.user?.image ?? null,
      }
    : {
        name: session.user?.name ?? 'Student',
        email: session.user?.email ?? '',
        picture: session.user?.image ?? null,
      };

  return NextResponse.json({ user, classes });
}
