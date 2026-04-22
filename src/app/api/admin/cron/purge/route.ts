import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase-admin';

// POST /api/admin/cron/purge
// Hit by an external cron (Railway cron job, GitHub Actions workflow,
// Supabase pg_cron, etc.) to run retention purges on the log tables.
//
// Auth: plain shared secret in the Authorization header. We can't use the
// NextAuth teacher session because cron runners don't have cookies. Using
// a separate CRON_SECRET env var keeps the service-role key out of cron
// runner configs.
//
//   Authorization: Bearer <CRON_SECRET>
//
// When CRON_SECRET isn't set, the endpoint returns 503 — defaulting to
// "no auth" would be catastrophic (anyone could delete all audit logs).

export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 503 });
  }

  const header = request.headers.get('authorization');
  if (header !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = getAdminSupabase();
  if (!admin) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 503 });
  }

  // Read optional retention overrides from query params — useful for
  // manual one-off runs. Defaults come from the migration definitions.
  const sp = request.nextUrl.searchParams;
  const auditDays = Number(sp.get('auditDays')) || undefined;
  const playDays = Number(sp.get('playDays')) || undefined;
  const rateSeconds = Number(sp.get('rateSeconds')) || undefined;

  const results: Record<string, number | string> = {};

  const [audit, events, plays] = await Promise.all([
    admin.rpc('purge_admin_audit_log', auditDays ? { p_older_than_days: auditDays } : {}),
    admin.rpc('purge_rate_limit_events', rateSeconds ? { p_older_than_seconds: rateSeconds } : {}),
    admin.rpc('purge_play_events', playDays ? { p_older_than_days: playDays } : {}),
  ]);

  results.adminAuditLog = audit.error ? `error: ${audit.error.message}` : (audit.data as number);
  results.rateLimitEvents = events.error ? `error: ${events.error.message}` : (events.data as number);
  results.playEvents = plays.error ? `error: ${plays.error.message}` : (plays.data as number);

  return NextResponse.json({ ok: true, purged: results });
}

// Also accept GET for ease of wiring simple cron services that only do
// GET. Same auth.
export async function GET(request: NextRequest) {
  return POST(request);
}
