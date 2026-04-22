'use client';

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, CheckCircle2, XCircle, Clock, Archive } from 'lucide-react';

interface DataRequest {
  id: string;
  kind: 'delete' | 'export' | 'opt-out' | 'correction';
  requester_role: 'self' | 'parent' | 'school';
  requester_email: string;
  requester_name: string | null;
  student_name: string | null;
  student_email: string | null;
  student_user_id: string | null;
  details: string | null;
  status: 'open' | 'in_progress' | 'fulfilled' | 'denied';
  created_at: string;
  updated_at: string;
}

type StatusFilter = 'open' | 'in_progress' | 'fulfilled' | 'denied' | 'all';

const KIND_LABEL: Record<DataRequest['kind'], string> = {
  delete: 'Delete all data',
  export: 'Export data',
  'opt-out': 'Opt out',
  correction: 'Correct / update',
};

const ROLE_LABEL: Record<DataRequest['requester_role'], string> = {
  self: 'Student',
  parent: 'Parent / guardian',
  school: 'School admin',
};

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: 'open',        label: 'Open' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'fulfilled',   label: 'Fulfilled' },
  { id: 'denied',      label: 'Denied' },
  { id: 'all',         label: 'All' },
];

export function DataRequestsQueue() {
  const [filter, setFilter] = useState<StatusFilter>('open');
  const [requests, setRequests] = useState<DataRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/data-requests?status=${filter}`, { cache: 'no-store' });
      const json = await res.json() as { requests?: DataRequest[]; error?: string };
      if (json.error) setError(json.error);
      else setRequests(json.requests ?? []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { void refresh(); }, [refresh]);

  const transition = useCallback(async (id: string, status: DataRequest['status']) => {
    if (busyId) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/data-requests/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const json = await res.json() as { error?: string };
      if (json.error) {
        setError(json.error);
        return;
      }
      // Any transition takes the row out of the current filter (unless
      // filter === 'all'), so drop it from the list.
      setRequests((prev) => filter === 'all' ? prev.map((r) => r.id === id ? { ...r, status } : r) : prev.filter((r) => r.id !== id));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyId(null);
    }
  }, [busyId, filter]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {STATUS_FILTERS.map((f) => {
          const active = f.id === filter;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              style={{
                padding: '6px 12px', borderRadius: 999,
                background: active ? 'var(--pb-ink)' : 'var(--pb-paper)',
                color: active ? 'var(--pb-paper)' : 'var(--pb-ink-muted)',
                border: `1.5px solid ${active ? 'var(--pb-ink)' : 'var(--pb-line-2)'}`,
                fontSize: 12.5, fontWeight: 700,
                fontFamily: 'inherit',
                cursor: 'pointer',
              }}
            >
              {f.label}
            </button>
          );
        })}
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          aria-label="Refresh"
          title="Refresh"
          style={{
            marginLeft: 'auto',
            width: 32, height: 32, borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--pb-paper)',
            color: 'var(--pb-ink-muted)',
            border: '1.5px solid var(--pb-line-2)',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1,
          }}
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : undefined} />
        </button>
      </div>

      {error && (
        <div style={{
          padding: '10px 12px', borderRadius: 10,
          background: 'var(--pb-coral-2, #fddad5)',
          color: 'var(--pb-coral-ink, #a03a2e)',
          fontSize: 13, fontWeight: 600, marginBottom: 12,
        }}>{error}</div>
      )}

      {loading && requests.length === 0 ? (
        <Empty text="Loading requests…" icon={Clock} />
      ) : requests.length === 0 ? (
        <Empty text={`No ${filter === 'all' ? '' : filter + ' '}requests right now.`} icon={CheckCircle2} />
      ) : (
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, listStyle: 'none', padding: 0, margin: 0 }}>
          {requests.map((r) => (
            <li key={r.id}>
              <RequestCard req={r} busy={busyId === r.id} onTransition={(s) => transition(r.id, s)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RequestCard({ req, busy, onTransition }: { req: DataRequest; busy: boolean; onTransition: (status: DataRequest['status']) => void }) {
  const kindTone =
    req.kind === 'delete' ? 'coral'
      : req.kind === 'export' ? 'mint'
      : req.kind === 'opt-out' ? 'amber'
      : 'cream';

  return (
    <div style={{
      padding: 14, borderRadius: 14,
      background: 'var(--pb-paper, #fff)',
      border: '1.5px solid var(--pb-line-2, #e5dfd2)',
      display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 12,
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Tag tone={kindTone}>{KIND_LABEL[req.kind]}</Tag>
          <Tag tone="cream">{ROLE_LABEL[req.requester_role]}</Tag>
          <StatusPill status={req.status} />
          <span style={{ fontSize: 11.5, color: 'var(--pb-ink-muted)' }}>
            {new Date(req.created_at).toLocaleString()}
          </span>
        </div>

        <div style={{ marginTop: 8, fontSize: 13 }}>
          <strong>From:</strong> {req.requester_name ? `${req.requester_name} — ` : ''}{req.requester_email}
        </div>
        {(req.student_name || req.student_email || req.student_user_id) && (
          <div style={{ marginTop: 2, fontSize: 13 }}>
            <strong>About:</strong>{' '}
            {[req.student_name, req.student_email, req.student_user_id].filter(Boolean).join(' · ')}
          </div>
        )}
        {req.details && (
          <div style={{ marginTop: 6, fontSize: 13, color: 'var(--pb-ink)', lineHeight: 1.5 }}>
            &ldquo;{req.details}&rdquo;
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {req.status !== 'in_progress' && (
          <IconButton
            icon={Clock}
            label="In progress"
            tone="info"
            disabled={busy}
            onClick={() => onTransition('in_progress')}
          />
        )}
        {req.status !== 'fulfilled' && (
          <IconButton
            icon={CheckCircle2}
            label="Fulfilled"
            tone="approve"
            disabled={busy}
            onClick={() => onTransition('fulfilled')}
          />
        )}
        {req.status !== 'denied' && (
          <IconButton
            icon={XCircle}
            label="Deny"
            tone="danger"
            disabled={busy}
            onClick={() => onTransition('denied')}
          />
        )}
        {req.status !== 'open' && (
          <IconButton
            icon={Archive}
            label="Reopen"
            tone="default"
            disabled={busy}
            onClick={() => onTransition('open')}
          />
        )}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: DataRequest['status'] }) {
  const map: Record<DataRequest['status'], { bg: string; fg: string; label: string }> = {
    open:        { bg: 'var(--pb-coral-2, #fddad5)', fg: 'var(--pb-coral-ink, #a03a2e)', label: 'open' },
    in_progress: { bg: 'var(--pb-cream-2, #fff5df)', fg: 'var(--pb-ink, #1d1a14)',       label: 'in progress' },
    fulfilled:   { bg: 'var(--pb-mint-2, #c8f2d0)', fg: 'var(--pb-mint-ink, #2a6a3a)',   label: 'fulfilled' },
    denied:      { bg: '#e5dfd2',                   fg: 'var(--pb-ink-muted, #6a6458)',  label: 'denied' },
  };
  const s = map[status];
  return (
    <span style={{
      padding: '1.5px 8px', borderRadius: 999,
      background: s.bg, color: s.fg,
      fontSize: 10.5, fontWeight: 700, letterSpacing: 0.1,
    }}>
      {s.label}
    </span>
  );
}

function Tag({ tone, children }: { tone: 'coral' | 'mint' | 'amber' | 'cream'; children: React.ReactNode }) {
  const map = {
    coral: { bg: 'var(--pb-coral-2, #fddad5)', fg: 'var(--pb-coral-ink, #a03a2e)' },
    mint:  { bg: 'var(--pb-mint-2, #c8f2d0)',  fg: 'var(--pb-mint-ink, #2a6a3a)' },
    amber: { bg: '#fce6a8',                    fg: '#8b6a00' },
    cream: { bg: 'var(--pb-cream-2, #fff5df)', fg: 'var(--pb-ink, #1d1a14)' },
  } as const;
  const t = map[tone];
  return (
    <span style={{
      padding: '1.5px 7px', borderRadius: 999,
      background: t.bg, color: t.fg,
      fontSize: 10.5, fontWeight: 700, letterSpacing: 0.1,
    }}>
      {children}
    </span>
  );
}

function Empty({ text, icon: Icon }: { text: string; icon: React.ElementType }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
      padding: '40px 20px',
      borderRadius: 14,
      background: 'var(--pb-paper, #fff)',
      border: '1.5px dashed var(--pb-line-2, #e5dfd2)',
      color: 'var(--pb-ink-muted, #6a6458)',
      fontSize: 13.5,
    }}>
      <Icon size={24} strokeWidth={1.8} />
      <span>{text}</span>
    </div>
  );
}

function IconButton({ icon: Icon, label, tone, onClick, disabled }: {
  icon: React.ElementType;
  label: string;
  tone: 'default' | 'approve' | 'danger' | 'info';
  onClick: () => void;
  disabled: boolean;
}) {
  const palette =
    tone === 'approve'
      ? { bg: 'var(--pb-mint-2, #c8f2d0)', fg: 'var(--pb-mint-ink, #2a6a3a)', bd: 'var(--pb-mint-ink, #2a6a3a)' }
      : tone === 'danger'
      ? { bg: 'var(--pb-coral-2, #fddad5)', fg: 'var(--pb-coral-ink, #a03a2e)', bd: 'var(--pb-coral-ink, #a03a2e)' }
      : tone === 'info'
      ? { bg: 'var(--pb-cream-2, #fff5df)', fg: 'var(--pb-ink, #1d1a14)', bd: 'var(--pb-line-2, #e5dfd2)' }
      : { bg: 'var(--pb-paper, #fff)', fg: 'var(--pb-ink-muted, #6a6458)', bd: 'var(--pb-line-2, #e5dfd2)' };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 10px', borderRadius: 10,
        background: palette.bg, color: palette.fg,
        border: `1.5px solid ${palette.bd}`,
        fontSize: 12, fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        fontFamily: 'inherit',
      }}
    >
      <Icon size={13} strokeWidth={2.2} />
      {label}
    </button>
  );
}
