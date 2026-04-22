import { getAdminSupabase } from '@/lib/supabase-admin';

// Durable rate limiter backed by Supabase (migration 021).
//
// Replaces the per-instance in-memory Map() that used to live in each
// API route. Those resets on every serverless cold start and doubled per
// instance; this one is global across the fleet.
//
// Usage:
//   const ok = await enforceRateLimit({
//     bucket: 'classes.lookup',
//     actor: ipFromRequest(req),
//     max: 20,
//     windowSeconds: 60,
//   });
//   if (!ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
//
// When SUPABASE_SERVICE_ROLE_KEY isn't configured (local dev without the
// secret), the helper returns `true` — we'd rather not block local
// traffic over a rate limit than fail closed. Production should always
// have the key set.

export interface RateLimitOptions {
  bucket: string;        // e.g. 'quiz.pin-lookup'
  actor: string;         // usually the caller's IP
  max: number;           // events allowed per window
  windowSeconds: number; // window size in seconds
}

export async function enforceRateLimit(opts: RateLimitOptions): Promise<boolean> {
  const admin = getAdminSupabase();
  if (!admin) {
    // Dev fallback — see module doc.
    console.warn(`rate-limit skipped (no admin client): ${opts.bucket}/${opts.actor}`);
    return true;
  }
  const { data, error } = await admin.rpc('check_rate_limit', {
    p_bucket: opts.bucket,
    p_actor: opts.actor,
    p_max: opts.max,
    p_window_seconds: opts.windowSeconds,
  });
  if (error) {
    console.error(`rate-limit RPC error for ${opts.bucket}:`, error);
    // Fail open — a database hiccup shouldn't take the feature down.
    return true;
  }
  return data === true;
}

/** Pull a best-effort IP out of a Next.js Request / NextRequest. Falls
 *  back to the literal string 'anon' so rate limits always have a
 *  non-empty actor even when headers are missing. */
export function ipFromRequest(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real;
  return 'anon';
}
