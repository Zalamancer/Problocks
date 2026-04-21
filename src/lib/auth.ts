import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

// Google Classroom scopes — only "sensitive" tier (no CASA/audit required).
// Restricted scopes removed deliberately:
//   - classroom.rosters.readonly       → replaced by student self-sign-in via /join/:classId
//   - classroom.profile.emails/.photos → we get these from each student's own OAuth grant
//   - classroom.guardianlinks.*        → not needed
// We match Classroom's `userId` against the student's Google `sub` after they sign in.
const CLASSROOM_SCOPES = [
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.students.readonly',
  'https://www.googleapis.com/auth/classroom.announcements.readonly',
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
