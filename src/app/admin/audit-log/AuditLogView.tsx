'use client';

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, ChevronRight, UserCog, FileText, Gamepad2, Flag, History } from 'lucide-react';

interface AuditRow {
  id: string;
  actor_sub: string;
  actor_email: string | null;
  action: string;
  target_type: string;
  target_id: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export function AuditLogView() {
  const [entries, setEntries] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = actionFilter ? `?action=${encodeURIComponent(actionFilter)}` : '';
      const res = await fetch(`/api/admin/audit-log${qs}`, { cache: 'no-store' });
      const json = await res.json() as { entries?: AuditRow[]; error?: string };
      if (json.error) setError(json.error);
      else setEntries(json.entries ?? []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [actionFilter]);

  useEffect(() => { void refresh(); }, [refresh]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        <input
          type="search"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          placeholder="Filter by action (e.g. game.reject)"
          style={{
            minWidth: 260, flex: '1 1 260px',
            padding: '8px 12px', borderRadius: 10,
            border: '1.5px solid var(--pb-line-2)',
            background: 'var(--pb-paper)',
            color: 'var(--pb-ink)',
            fontSize: 13, fontFamily: 'inherit',
          }}
        />
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          aria-label="Refresh"
          title="Refresh"
          style={{
            width: 32, height: 32, borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--pb-paper)', color: 'var(--pb-ink-muted)',
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

      {loading && entries.length === 0 ? (
        <Empty text="Loading audit log…" />
      ) : entries.length === 0 ? (
        <Empty text={actionFilter ? `No entries match "${actionFilter}".` : 'No admin actions recorded yet.'} />
      ) : (
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: 0, margin: 0, listStyle: 'none' }}>
          {entries.map((e) => (
            <li key={e.id}>
              <Entry
                entry={e}
                isOpen={expanded === e.id}
                onToggle={() => setExpanded((cur) => cur === e.id ? null : e.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Entry({ entry, isOpen, onToggle }: { entry: AuditRow; isOpen: boolean; onToggle: () => void }) {
  const Icon = iconFor(entry.target_type);
  const when = new Date(entry.created_at);
  return (
    <div style={{
      padding: 10, borderRadius: 12,
      background: 'var(--pb-paper, #fff)',
      border: '1.5px solid var(--pb-line-2, #e5dfd2)',
    }}>
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex', alignItems: 'center', gap: 10,
          padding: 0, background: 'transparent', border: 0,
          cursor: 'pointer', textAlign: 'left',
          color: 'var(--pb-ink)', fontFamily: 'inherit',
        }}
      >
        <ChevronRight
          size={14}
          strokeWidth={2.2}
          style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 80ms', color: 'var(--pb-ink-muted)' }}
        />
        <Icon size={14} strokeWidth={2.0} style={{ color: 'var(--pb-ink-muted)' }} />
        <span style={{ fontSize: 12.5, fontWeight: 700 }}>{entry.action}</span>
        <span style={{ fontSize: 11.5, color: 'var(--pb-ink-muted)' }}>
          on {entry.target_type} <code style={{ fontSize: 11, background: 'var(--pb-cream-2)', padding: '1px 5px', borderRadius: 4 }}>{entry.target_id.slice(0, 12)}…</code>
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 11.5, color: 'var(--pb-ink-muted)' }}>
          {entry.actor_email ?? entry.actor_sub.slice(0, 10) + '…'}
          {' · '}
          {when.toLocaleString()}
        </span>
      </button>
      {isOpen && (
        <pre style={{
          marginTop: 10, padding: 10,
          borderRadius: 8,
          background: 'var(--pb-cream-2, #fff5df)',
          color: 'var(--pb-ink, #1d1a14)',
          fontSize: 11.5, fontFamily: 'ui-monospace, SFMono-Regular, monospace',
          overflow: 'auto',
          whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        }}>{JSON.stringify({
          actor_sub: entry.actor_sub,
          target_id: entry.target_id,
          metadata: entry.metadata,
        }, null, 2)}</pre>
      )}
    </div>
  );
}

function iconFor(target: string): React.ElementType {
  switch (target) {
    case 'teacher':       return UserCog;
    case 'data_request':  return FileText;
    case 'game':          return Gamepad2;
    case 'report':        return Flag;
    default:              return History;
  }
}

function Empty({ text }: { text: string }) {
  return (
    <div style={{
      padding: '40px 20px', borderRadius: 14,
      background: 'var(--pb-paper, #fff)',
      border: '1.5px dashed var(--pb-line-2, #e5dfd2)',
      color: 'var(--pb-ink-muted, #6a6458)',
      fontSize: 13.5, textAlign: 'center',
    }}>{text}</div>
  );
}
