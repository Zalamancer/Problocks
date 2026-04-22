import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { upsertTeacherRow } from './teacher-auth';

// Google Classroom scopes.
//
// Sensitive tier (no CASA audit needed):
//   - classroom.courses.readonly
//   - classroom.coursework.(me|students).readonly
//   - classroom.announcements.readonly
//   - classroom.topics.readonly
//   - classroom.student-submissions.(me|students).readonly
//
// Restricted tier (needs Google CASA verification before public launch):
//   - classroom.rosters.readonly           — pre-seed student roster on class
//                                            creation so teachers don't have
//                                            to chase every kid with a join
//                                            link. Works in test mode for
//                                            users listed on the OAuth
//                                            consent screen; production use
//                                            requires full verification.
//   - classroom.profile.emails/.photos     — still OUT. We get these from
//                                            each student's own OAuth grant
//                                            when they visit /join/:classId,
//                                            which avoids a directory-wide
//                                            read.
//
// We match Classroom's `userId` against the student's Google `sub` — same
// value — so joining submissions back to the student row works regardless
// of whether they were pre-seeded or self-joined.
const CLASSROOM_SCOPES = [
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.rosters.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.students.readonly',
  'https://www.googleapis.com/auth/classroom.announcements',
  'https://www.googleapis.com/auth/classroom.topics.readonly',
  'https://www.googleapis.com/auth/classroom.student-submissions.me.readonly',
  'https://www.googleapis.com/auth/classroom.student-submissions.students.readonly',
].join(' ');

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: `openid email profile ${CLASSROOM_SCOPES}`,
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist OAuth tokens + Google sub on first sign-in
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = account.expires_at
          ? account.expires_at * 1000
          : Date.now() + 3600 * 1000;
      }
      if (profile && 'sub' in profile && typeof profile.sub === 'string') {
        token.googleSub = profile.sub;
      }
      // Return token if still valid
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }
      // TODO: refresh expired token using refreshToken
      return { ...token, error: 'AccessTokenExpired' };
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.error = token.error as string | undefined;
      session.googleSub = token.googleSub as string | undefined;
      return session;
    },
  },
  events: {
    // Refresh the persisted teachers row on every successful sign-in so
    // we always have the latest profile fields + a current last_seen_at
    // stamp. Runs server-side; if the admin client isn't configured it
    // logs a warning and no-ops.
    async signIn({ profile }) {
      if (!profile || !('sub' in profile) || typeof profile.sub !== 'string') return;
      const p = profile as { sub: string; email?: string; name?: string; given_name?: string; family_name?: string; picture?: string };
      await upsertTeacherRow({
        googleSub: p.sub,
        email: p.email ?? null,
        fullName: p.name ?? null,
        givenName: p.given_name ?? null,
        familyName: p.family_name ?? null,
        pictureUrl: p.picture ?? null,
      });
    },
  },
  pages: {
    signIn: '/classroom/auth',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Augment next-auth types
declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    error?: string;
    googleSub?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: string;
    googleSub?: string;
  }
}
