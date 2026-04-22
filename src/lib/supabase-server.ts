import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Cookie-aware Supabase client for server routes + React Server Components.
//
// The browser client (`src/lib/supabase.ts`) continues to be used from
// 'use client' components. Everywhere a server handler needs to know WHO
// made the request — anything that persists data tied to a user — it should
// call getServerSupabase() instead and let RLS enforce ownership via
// auth.uid().
//
// NOTE: students authenticate with Supabase Auth (see AuthScreen.tsx);
// teachers authenticate with NextAuth Google (see lib/auth.ts). This helper
// is the Supabase half — teacher routes under /api/moderation/* still go
// through next-auth's getServerSession.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export function isServerSupabaseConfigured(): boolean {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export async function getServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
        // Route handlers + RSCs can set cookies on the response; this can
        // throw in RSC contexts where setting isn't allowed, so we swallow.
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // ignore — middleware will refresh on the next request.
        }
      },
    },
  });
}

/** Lightweight caller identity — the thing every ownership check needs. */
export interface ServerUser {
  id: string;            // auth.uid() — use this as the user_id column value
  email: string | null;
  isAnonymous: boolean;  // true when there's no session at all
}

/** Resolve the current Supabase user. When no session exists (anonymous
 *  visit), returns a synthetic "anonymous" user so callers can still thread
 *  the id through optimistic-save flows; they should opt into stricter
 *  checks via requireServerUser() when persistence MUST be gated. */
export async function getServerUser(): Promise<ServerUser> {
  if (!isServerSupabaseConfigured()) {
    return { id: 'local-user', email: null, isAnonymous: true };
  }
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { id: 'local-user', email: null, isAnonymous: true };
  }
  return {
    id: user.id,
    email: user.email ?? null,
    isAnonymous: false,
  };
}

/** Same as getServerUser(), but throws a Response-shaped error when there's
 *  no authenticated user. Use from routes that MUST be authenticated. */
export async function requireServerUser(): Promise<ServerUser> {
  const user = await getServerUser();
  if (user.isAnonymous) {
    throw new ServerAuthError('Authentication required', 401);
  }
  return user;
}

export class ServerAuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ServerAuthError';
  }
}
