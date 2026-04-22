'use client';

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Check, X, Clock, Gamepad2, Flag, FileText } from 'lucide-react';

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

export function StatusView() {
  const [status, setStatus] = useState<AdminStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/status', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) {
        setError((json as { error?: string }).error ?? 'Failed to load');
      } else {
        setStatus(json as AdminStatus);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          aria-label="Refresh"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 10,
            background: 'var(--pb-paper)',
            color: 'var(--pb-ink-muted)',
            border: '1.5px solid var(--pb-line-2)',
            fontSize: 12.5, fontWeight: 700, fontFamily: 'inherit',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1,
          }}
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : undefined} />
          Refresh
        </button>
      </div>

      {error && (
        <div style={{
          padding: '10px 12px', borderRadius: 10, marginBottom: 14,
          background: 'var(--pb-coral-2, #fddad5)',
          color: 'var(--pb-coral-ink, #a03a2e)',
          fontSize: 13, fontWeight: 600,
        }}>{error}</div>
      )}

      {!status ? (
        <div style={emptyCard}>Loading status…</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Section title="Environment">
            <div style={grid(2)}>
              <EnvRow label="Admin Supabase client" ok={status.envReady.adminClient} detail={status.envReady.adminClient ? 'Service role key set' : 'SUPABASE_SERVICE_ROLE_KEY missing'} />
              <EnvRow label="Cron secret" ok={status.envReady.cronSecret} detail={status.envReady.cronSecret ? 'CRON_SECRET set' : 'Retention purge endpoint will 503'} />
              <EnvRow label="Email (Resend)" ok={status.envReady.resend} detail={status.envReady.resend ? 'RESEND_API_KEY + EMAIL_FROM set' : 'Auto-ack emails will skip'} />
              <EnvRow label="Admin bootstrap list" ok={status.envReady.adminBootstrapEmails > 0} detail={status.envReady.adminBootstrapEmails > 0 ? `${status.envReady.adminBootstrapEmails} email${status.envReady.adminBootstrapEmails === 1 ? '' : 's'}` : 'ADMIN_BOOTSTRAP_EMAILS empty'} />
            </div>
          </Section>

          <Section title="Queues">
            <div style={grid(3)}>
              <QueueTile icon={Gamepad2} label="Pending games" count={status.queues.pendingGames} href="/teacher/moderation" />
              <QueueTile icon={Flag} label="Open reports" count={status.queues.openReports} href="/teacher/moderation" />
              <QueueTile icon={FileText} label="Open data requests" count={status.queues.openDataRequests} href="/admin/data-requests" />
            </div>
          </Section>

          <Section title="Retention">
            <div style={grid(3)}>
              <RetentionTile label="Oldest audit entry" iso={status.retention.oldestAuditEntry} softCap="365 days" />
              <RetentionTile label="Oldest rate-limit event" iso={status.retention.oldestRateLimitEvent} softCap="1 hour" />
              <RetentionTile label="Oldest play event" iso={status.retention.oldestPlayEvent} softCap="90 days" />
            </div>
          </Section>

          <Section title="Recent admin actions">
            {status.recentAdminActions.length === 0 ? (
              <div style={emptyCard}>No admin actions in the log yet.</div>
            ) : (
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: 0, margin: 0, listStyle: 'none' }}>
                {status.recentAdminActions.map((a) => (
                  <li key={a.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 12px', borderRadius: 10,
                    background: 'var(--pb-paper)',
                    border: '1.5px solid var(--pb-line-2)',
                  }}>
                    <Clock size={12} style={{ color: 'var(--pb-ink-muted)' }} />
                    <span style={{ fontSize: 12.5, fontWeight: 700 }}>{a.action}</span>
                    <span style={{ fontSize: 11.5, color: 'var(--pb-ink-muted)' }}>· {a.target_type}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--pb-ink-muted)' }}>
                      {a.actor_email ?? '(unknown)'} · {new Date(a.created_at).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 10px' }}>{title}</h2>
      {children}
    </section>
  );
}

function grid(cols: number): React.CSSProperties {
  return { display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: 10 };
}

function EnvRow({ label, ok, detail }: { label: string; ok: boolean; detail: string }) {
  const Icon = ok ? Check : X;
  const tone = ok
    ? { bg: 'var(--pb-mint-2, #c8f2d0)', fg: 'var(--pb-mint-ink, #2a6a3a)' }
    : { bg: 'var(--pb-coral-2, #fddad5)', fg: 'var(--pb-coral-ink, #a03a2e)' };
  return (
    <div style={{
      padding: 10, borderRadius: 12,
      background: 'var(--pb-paper)',
      border: '1.5px solid var(--pb-line-2)',
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <div style={{
        width: 26, height: 26, borderRadius: 999,
        background: tone.bg, color: tone.fg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={13} strokeWidth={2.5} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>{label}</div>
        <div style={{ fontSize: 11.5, color: 'var(--pb-ink-muted)' }}>{detail}</div>
      </div>
    </div>
  );
}

function QueueTile({ icon: Icon, label, count, href }: { icon: React.ElementType; label: string; count: number; href: string }) {
  return (
    <a href={href} style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: 12, borderRadius: 12,
      background: 'var(--pb-paper)',
      border: '1.5px solid var(--pb-line-2)',
      color: 'inherit', textDecoration: 'none',
    }}>
      <Icon size={20} style={{ color: 'var(--pb-ink-muted)', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>{label}</div>
        <div style={{ fontSize: 11.5, color: 'var(--pb-ink-muted)' }}>Open in queue →</div>
      </div>
      <div style={{
        fontSize: 20, fontWeight: 800,
        color: count > 0 ? 'var(--pb-ink)' : 'var(--pb-ink-muted)',
      }}>{count}</div>
    </a>
  );
}

function RetentionTile({ label, iso, softCap }: { label: string; iso: string | null; softCap: string }) {
  const ageText = iso ? ageFromNow(iso) : 'no rows';
  return (
    <div style={{
      padding: 12, borderRadius: 12,
      background: 'var(--pb-paper)',
      border: '1.5px solid var(--pb-line-2)',
    }}>
      <div style={{ fontSize: 13, fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 12, color: 'var(--pb-ink-muted)', marginTop: 4 }}>{ageText}</div>
      <div style={{ fontSize: 11, color: 'var(--pb-ink-muted)', marginTop: 2 }}>Target ≤ {softCap}</div>
    </div>
  );
}

function ageFromNow(iso: string): string {
  const then = new Date(iso).getTime();
  const ms = Date.now() - then;
  const s = ms / 1000;
  if (s < 60) return `${Math.round(s)}s ago`;
  const m = s / 60;
  if (m < 60) return `${Math.round(m)}m ago`;
  const h = m / 60;
  if (h < 48) return `${Math.round(h)}h ago`;
  const d = h / 24;
  return `${Math.round(d)}d ago`;
}

const emptyCard: React.CSSProperties = {
  padding: '20px 12px', borderRadius: 12,
  background: 'var(--pb-paper)',
  border: '1.5px dashed var(--pb-line-2)',
  color: 'var(--pb-ink-muted)',
  fontSize: 13, textAlign: 'center',
};
