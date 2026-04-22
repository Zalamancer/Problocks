import { getServerSession, type Session } from 'next-auth';
import { authOptions } from './auth';

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
