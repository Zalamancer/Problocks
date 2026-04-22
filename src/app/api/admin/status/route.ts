import { NextResponse } from 'next/server';
import { isPlatformAdmin } from '@/lib/teacher-auth';
import { getAdminSupabase } from '@/lib/supabase-admin';

// GET /api/admin/status
// Admin-only operational dashboard data. Unlike /api/health this
// happily exposes queue depths and the last-purge row since only
// admins can reach it.

interface AdminStatus {
  timestamp: string;
  envReady: {
    adminClient: boolean;
    cronSecret: boolean;
    resend: boolean;
    adminBootstrapEmails: number;
  };
  queues: {
    pendingGames: number;
    openReports: number;
    openDataRequests: number;
  };
  retention: {
    oldestAuditEntry: string | null;
    oldestRateLimitEvent: string | null;
    oldestPlayEvent: string | null;
  };
  lastPurge: {
    at: string | null;
    metadata: unknown;
  };
  recentAdminActions: Array<{
    id: string;
    action: string;
    target_type: string;
    actor_email: string | null;
    created_at: string;
  }>;
}

export async function GET() {
  if (!(await isPlatformAdmin())) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const admin = getAdminSupabase();
  if (!admin) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 503 });
  }

  const envReady = {
    adminClient: true,
    cronSecret: !!process.env.CRON_SECRET,
    resend: !!(process.env.RESEND_API_KEY && process.env.EMAIL_FROM),
    adminBootstrapEmails: (process.env.ADMIN_BOOTSTRAP_EMAILS ?? '')
      .split(',').map((s) => s.trim()).filter(Boolean).length,
  };

  // Queue counts — HEAD counts to minimise payload. Parallel so the
  // response stays under a second even on a cold DB.
  const [pendingGames, openReports, openDataRequests] = await Promise.all([
    admin.from('games').select('id', { count: 'exact', head: true })
      .eq('is_published', true).eq('moderation_status', 'pending'),
    admin.from('game_reports').select('id', { count: 'exact', head: true })
      .eq('status', 'open'),
    admin.from('data_requests').select('id', { count: 'exact', head: true })
      .eq('status', 'open'),
  ]);

  // Retention — the oldest surviving row in each log tells us if the
  // scheduled purge is actually running.
  const [oldestAudit, oldestRate, oldestPlay, lastPurge] = await Promise.all([
    admin.from('admin_audit_log').select('created_at')
      .order('created_at', { ascending: true }).limit(1).maybeSingle(),
    admin.from('rate_limit_events').select('created_at')
      .order('created_at', { ascending: true }).limit(1).maybeSingle(),
    admin.from('play_events').select('created_at')
      .order('created_at', { ascending: true }).limit(1).maybeSingle(),
    // Not strictly a "last purge" — we log purges to console today, not a
    // durable table. Using the most recent admin_audit_log entry as a
    // liveness signal instead. Sprint 10 can add a purges table.
    admin.from('admin_audit_log').select('created_at, metadata')
      .order('created_at', { ascending: false }).limit(1).maybeSingle(),
  ]);

  const recent = await admin
    .from('admin_audit_log')
    .select('id, action, target_type, actor_email, created_at')
    .order('created_at', { ascending: false })
    .limit(8);

  const status: AdminStatus = {
    timestamp: new Date().toISOString(),
    envReady,
    queues: {
      pendingGames: pendingGames.count ?? 0,
      openReports: openReports.count ?? 0,
      openDataRequests: openDataRequests.count ?? 0,
    },
    retention: {
      oldestAuditEntry: (oldestAudit.data as { created_at: string } | null)?.created_at ?? null,
      oldestRateLimitEvent: (oldestRate.data as { created_at: string } | null)?.created_at ?? null,
      oldestPlayEvent: (oldestPlay.data as { created_at: string } | null)?.created_at ?? null,
    },
    lastPurge: {
      at: (lastPurge.data as { created_at: string } | null)?.created_at ?? null,
      metadata: (lastPurge.data as { metadata: unknown } | null)?.metadata ?? null,
    },
    recentAdminActions: (recent.data ?? []) as AdminStatus['recentAdminActions'],
  };

  return NextResponse.json(status);
}
