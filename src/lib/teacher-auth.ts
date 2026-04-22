import { getServerSession, type Session } from 'next-auth';
import { authOptions } from './auth';
import { getAdminSupabase } from './supabase-admin';

// Thin wrapper around NextAuth's getServerSession so teacher-facing routes
// and pages can check "is a teacher logged in?" with one import. The studio
// + student paths stay on Supabase Auth — this helper is only for teacher
// surfaces that require the Google OAuth session (moderation queue,
// classroom setup, etc.).
//
// Sprint 3 treats "has a valid Google session" as "is a teacher". Sprint 4
// will add a teachers table + role column so we can distinguish between
// teachers at different schools.

export async function getTeacherSession(): Promise<Session | null> {
  const session = await getServerSession(authOptions);
  return session ?? null;
}

/** True when the caller has a valid Google session. Does NOT check a
 *  teachers table yet — any signed-in Google user counts. */
export async function isSignedInTeacher(): Promise<boolean> {
  const session = await getTeacherSession();
  return !!session?.user;
}

/** True when the caller has a valid session AND their teachers.role is
 *  'admin'. Used to gate platform-wide admin surfaces (data_requests
 *  queue, user deletion, etc.). Requires SUPABASE_SERVICE_ROLE_KEY so the
 *  role lookup can bypass RLS. */
export async function isPlatformAdmin(): Promise<boolean> {
  const row = await getTeacherRow();
  return row?.role === 'admin';
}

/** Append one row to admin_audit_log. All mutating admin surfaces should
 *  call this after a successful change. Non-blocking: logs and swallows
 *  any failure so we never break the user's happy path over an audit hiccup.
 *  Uses the service-role admin client; no-op when the key isn't configured. */
export async function logAdminAction(input: {
  action: string;
  targetType: 'teacher' | 'data_request' | 'game' | 'report';
  targetId: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const session = await getTeacherSession();
  if (!session?.googleSub) return;
  const admin = getAdminSupabase();
  if (!admin) return;

  const { error } = await admin.from('admin_audit_log').insert({
    actor_sub: session.googleSub,
    actor_email: session.user?.email ?? null,
    action: input.action,
    target_type: input.targetType,
    target_id: input.targetId,
    metadata: input.metadata ?? null,
  });
  if (error) {
    console.warn('logAdminAction insert failed:', error.message);
  }
}

/** True when `gameId`'s creator (games.user_id, a Supabase auth.uid()) is
 *  enrolled in at least one class owned by `teacherGoogleSub`. Used by the
 *  moderation PATCH routes to make sure a teacher can only approve /
 *  reject / dismiss games that belong to their roster. Admins should
 *  short-circuit to `true` before calling this. */
export async function isGameInTeacherRoster(
  gameId: string,
  teacherGoogleSub: string
): Promise<boolean> {
  const admin = getAdminSupabase();
  if (!admin) return false;

  // Resolve the game's creator
  const { data: game } = await admin
    .from('games')
    .select('user_id')
    .eq('id', gameId)
    .maybeSingle<{ user_id: string }>();

  if (!game?.user_id) return false;

  // Are they in any class I own?
  const { data: match } = await admin
    .from('students')
    .select('id, classes!inner(teacher_google_sub)')
    .eq('supabase_user_id', game.user_id)
    .eq('classes.teacher_google_sub', teacherGoogleSub)
    .limit(1);

  return (match?.length ?? 0) > 0;
}

/** Comma-separated list of emails that get auto-promoted to role='admin'
 *  on first sign-in. Solves the chicken-and-egg bootstrap: without this,
 *  the first ever admin has to be created via `UPDATE public.teachers SET
 *  role='admin' WHERE google_sub='…'` in the Supabase dashboard.
 *
 *  Format in .env: ADMIN_BOOTSTRAP_EMAILS=founder@example.com,ops@example.com
 *  Matching is case-insensitive on the stored Google email. */
function adminBootstrapEmails(): Set<string> {
  const raw = process.env.ADMIN_BOOTSTRAP_EMAILS ?? '';
  return new Set(
    raw.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
  );
}

/** Upsert a teachers row from the NextAuth user profile + googleSub.
 *  Called from the NextAuth `events.signIn` callback so every sign-in
 *  refreshes the teacher's stored profile. Idempotent. Promotes the row
 *  to role='admin' when the email is listed in ADMIN_BOOTSTRAP_EMAILS;
 *  never demotes. */
export async function upsertTeacherRow(profile: {
  googleSub: string;
  email?: string | null;
  fullName?: string | null;
  givenName?: string | null;
  familyName?: string | null;
  pictureUrl?: string | null;
}): Promise<void> {
  const admin = getAdminSupabase();
  if (!admin) {
    console.warn('upsertTeacherRow skipped: SUPABASE_SERVICE_ROLE_KEY not set');
    return;
  }

  const now = new Date().toISOString();
  const normalizedEmail = profile.email?.trim().toLowerCase() ?? null;
  const bootstrapSet = adminBootstrapEmails();
  const isBootstrapAdmin = normalizedEmail !== null && bootstrapSet.has(normalizedEmail);

  const base: Record<string, unknown> = {
    google_sub: profile.googleSub,
    email: profile.email ?? null,
    full_name: profile.fullName ?? null,
    given_name: profile.givenName ?? null,
    family_name: profile.familyName ?? null,
    picture_url: profile.pictureUrl ?? null,
    last_seen_at: now,
  };
  // Only write `role` when the email is in the bootstrap list — otherwise
  // an admin who later loses their bootstrap listing would get demoted on
  // next sign-in. We only ever promote here, never demote.
  if (isBootstrapAdmin) {
    base.role = 'admin';
  }

  const { error } = await admin
    .from('teachers')
    .upsert(base, { onConflict: 'google_sub' });
  if (error) {
    console.error('upsertTeacherRow error:', error);
  } else if (isBootstrapAdmin) {
    console.info(`[bootstrap] teacher ${normalizedEmail} promoted to admin via ADMIN_BOOTSTRAP_EMAILS`);
  }
}

/** Resolve the current teacher's row from the database. Returns null when
 *  there's no session, admin client isn't configured, or the row doesn't
 *  exist (first sign-in — the events.signIn callback creates it). */
export async function getTeacherRow(): Promise<{
  google_sub: string;
  email: string | null;
  full_name: string | null;
  picture_url: string | null;
  role: 'teacher' | 'admin';
} | null> {
  const session = await getTeacherSession();
  if (!session?.googleSub) return null;

  const admin = getAdminSupabase();
  if (!admin) return null;

  const { data } = await admin
    .from('teachers')
    .select('google_sub, email, full_name, picture_url, role')
    .eq('google_sub', session.googleSub)
    .maybeSingle<{ google_sub: string; email: string | null; full_name: string | null; picture_url: string | null; role: 'teacher' | 'admin' }>();

  return data ?? null;
}
