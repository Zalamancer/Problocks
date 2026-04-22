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
  const exportDays = Number(sp.get('exportDays')) || 10;

  const results: Record<string, number | string> = {};

  // Log the run start to purge_runs so /admin/status can show precise
  // liveness. On success we'll come back and fill results + finished_at;
  // on a catastrophic error the row stays partial with error set.
  const { data: runRow } = await admin
    .from('purge_runs')
    .insert({ results: {} })
    .select('id')
    .single<{ id: string }>();
  const runId = runRow?.id ?? null;

  const [audit, events, plays] = await Promise.all([
    admin.rpc('purge_admin_audit_log', auditDays ? { p_older_than_days: auditDays } : {}),
    admin.rpc('purge_rate_limit_events', rateSeconds ? { p_older_than_seconds: rateSeconds } : {}),
    admin.rpc('purge_play_events', playDays ? { p_older_than_days: playDays } : {}),
  ]);

  results.adminAuditLog = audit.error ? `error: ${audit.error.message}` : (audit.data as number);
  results.rateLimitEvents = events.error ? `error: ${events.error.message}` : (events.data as number);
  results.playEvents = plays.error ? `error: ${plays.error.message}` : (plays.data as number);

  // Sprint 10.1 — also sweep stale data-exports Storage objects. Signed
  // URLs live for 7 days; we keep a 3-day grace window on top so an admin
  // who regenerates right at expiry has overlap. Anything older is safe
  // to drop.
  try {
    const cutoff = Date.now() - exportDays * 24 * 60 * 60 * 1000;
    let deleted = 0;
    const { data: folders, error: listErr } = await admin.storage
      .from('data-exports')
      .list('', { limit: 100, sortBy: { column: 'name', order: 'asc' } });
    if (listErr) {
      results.dataExportsStorage = `error: ${listErr.message}`;
    } else if (folders && folders.length > 0) {
      // Top-level "folders" are per-requestId. For each, list its files
      // and delete the stale ones. 100 folders × 100 files per folder is
      // plenty of headroom for any realistic workload.
      const toDelete: string[] = [];
      for (const folder of folders) {
        const { data: files } = await admin.storage
          .from('data-exports')
          .list(folder.name, { limit: 100 });
        for (const file of files ?? []) {
          const createdStr = file.created_at ?? file.updated_at;
          if (!createdStr) continue;
          if (new Date(createdStr).getTime() < cutoff) {
            toDelete.push(`${folder.name}/${file.name}`);
          }
        }
      }
      if (toDelete.length > 0) {
        const { error: delErr } = await admin.storage.from('data-exports').remove(toDelete);
        if (delErr) {
          results.dataExportsStorage = `error: ${delErr.message}`;
        } else {
          deleted = toDelete.length;
        }
      }
      if (results.dataExportsStorage === undefined) {
        results.dataExportsStorage = deleted;
      }
    } else {
      results.dataExportsStorage = 0;
    }
  } catch (err) {
    results.dataExportsStorage = `error: ${(err as Error).message}`;
  }

  // Seal the run row with the results + finished_at.
  const anyErr = Object.values(results).some((v) => typeof v === 'string');
  if (runId) {
    await admin
      .from('purge_runs')
      .update({
        results,
        finished_at: new Date().toISOString(),
        error: anyErr ? 'one or more buckets returned an error — see results' : null,
      })
      .eq('id', runId);
  }

  return NextResponse.json({ ok: true, runId, purged: results });
}

// Also accept GET for ease of wiring simple cron services that only do
// GET. Same auth.
export async function GET(request: NextRequest) {
  return POST(request);
}
