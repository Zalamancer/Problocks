import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { supabase as anonSupabase, isSupabaseConfigured } from '@/lib/supabase';

// Server-only Supabase client that uses the service_role key, bypassing
// RLS. Use ONLY from server routes that are already gated by auth (e.g.
// NextAuth teacher session or Supabase auth.uid()); never from a Route
// Handler that accepts anonymous traffic.
//
// The service role key must be set via SUPABASE_SERVICE_ROLE_KEY (NOT a
// NEXT_PUBLIC_* var — we need it to stay server-side). If the env var is
// missing this helper returns null so callers can fall back to the anon
// client for local dev; production should always have it set.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let cached: SupabaseClient | null = null;

export function isAdminSupabaseConfigured(): boolean {
  return !!(SUPABASE_URL && SERVICE_ROLE_KEY);
}

export function getAdminSupabase(): SupabaseClient | null {
  if (cached) return cached;
  if (!isAdminSupabaseConfigured()) return null;
  cached = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
      // Service role client shouldn't persist sessions or auto-refresh —
      // it's stateless, every call uses the same JWT.
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return cached;
}

/** Preferred client for server-side reads that previously used the anon
 *  client: admin when the service role key is set (bypasses RLS), anon
 *  otherwise (fine for dev against permissive RLS). Returns null only when
 *  both clients are unavailable (neither env var configured). */
export function getServerReadClient(): SupabaseClient | null {
  const admin = getAdminSupabase();
  if (admin) return admin;
  if (isSupabaseConfigured()) return anonSupabase;
  return null;
}
