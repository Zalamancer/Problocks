import { NextResponse } from 'next/server';
import { isAdminSupabaseConfigured, getAdminSupabase } from '@/lib/supabase-admin';

// GET /api/health
// Public, no auth. Returns a minimal view of service status so uptime
// checks / load balancers can probe without a secret. Deliberately
// doesn't expose queue counts, recent errors, or anything else an
// attacker could use to map the platform — that's /api/admin/status.

export async function GET() {
  const startedAt = Date.now();

  const checks: Record<string, { ok: boolean; latencyMs?: number; detail?: string }> = {
    adminConfigured: { ok: isAdminSupabaseConfigured() },
    database: { ok: false },
  };

  const admin = getAdminSupabase();
  if (admin) {
    const dbStart = Date.now();
    // Cheapest possible round-trip: COUNT head on a tiny table.
    const { error } = await admin
      .from('teachers')
      .select('google_sub', { count: 'exact', head: true })
      .limit(0);
    checks.database = {
      ok: !error,
      latencyMs: Date.now() - dbStart,
      detail: error ? error.message.slice(0, 120) : undefined,
    };
  } else {
    checks.database.detail = 'admin client not configured';
  }

  const ok = checks.database.ok && checks.adminConfigured.ok;
  return NextResponse.json(
    {
      ok,
      timestamp: new Date().toISOString(),
      uptimeMs: Date.now() - startedAt,
      checks,
    },
    { status: ok ? 200 : 503 }
  );
}
