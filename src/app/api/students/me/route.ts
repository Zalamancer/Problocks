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
import { getServerReadClient } from '@/lib/supabase-admin';
import { getServerUser } from '@/lib/supabase-server';

export async function GET() {
  const client = getServerReadClient();
  if (!client) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const session = await getServerSession(authOptions);
  if (!session?.googleSub) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  // Pull every enrollment for this student, joined to its class row. We
  // also need supabase_user_id so the client can decide whether to prompt
  // for account linking (Sprint 6.2) — rows with a null link are why the
  // moderation queue can't see this student's games.
  const rows = await client
    .from('students')
    .select('id, full_name, given_name, family_name, picture_url, email, supabase_user_id, class:classes(id, name, subject, grade, color)')
    .eq('google_sub', session.googleSub);

  if (rows.error) {
    return NextResponse.json({ error: rows.error.message }, { status: 500 });
  }

  const classes = (rows.data ?? [])
    .map((r) => (r as unknown as { class: { id: string; name: string; subject: string | null; grade: string | null; color: string | null } | null }).class)
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  // Linking status: does this student have at least one enrollment with
  // supabase_user_id already set? If not, and they currently carry a
  // Supabase session too, we surface the "link your account" banner.
  const supabaseUser = await getServerUser();
  const hasLinkedRow = (rows.data ?? []).some((r) =>
    typeof (r as { supabase_user_id?: string | null }).supabase_user_id === 'string'
    && (r as { supabase_user_id?: string }).supabase_user_id !== null
  );
  const linking = {
    hasSupabaseSession: !supabaseUser.isAnonymous,
    hasLinkedRow,
    needsLink: !supabaseUser.isAnonymous && !hasLinkedRow && (rows.data?.length ?? 0) > 0,
  };

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

  return NextResponse.json({ user, classes, linking });
}
