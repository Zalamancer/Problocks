'use client';

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Shield, ShieldOff, UserRound } from 'lucide-react';

interface Teacher {
  google_sub: string;
  email: string | null;
  full_name: string | null;
  picture_url: string | null;
  school_label: string | null;
  role: 'teacher' | 'admin';
  created_at: string;
  last_seen_at: string;
}

type RoleFilter = 'all' | 'admin' | 'teacher';

const ROLE_FILTERS: { id: RoleFilter; label: string }[] = [
  { id: 'all',     label: 'All' },
  { id: 'admin',   label: 'Admins' },
  { id: 'teacher', label: 'Teachers' },
];

export function TeachersList() {
  const [filter, setFilter] = useState<RoleFilter>('all');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [busySub, setBusySub] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = filter === 'all' ? '' : `?role=${filter}`;
      const res = await fetch(`/api/admin/teachers${params}`, { cache: 'no-store' });
      const json = await res.json() as { teachers?: Teacher[]; error?: string };
      if (json.error) setError(json.error);
      else setTeachers(json.teachers ?? []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { void refresh(); }, [refresh]);

  const setRole = useCallback(async (sub: string, role: 'teacher' | 'admin') => {
    if (busySub) return;
    setBusySub(sub);
    try {
      const res = await fetch(`/api/admin/teachers/${encodeURIComponent(sub)}/role`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const json = await res.json() as { error?: string };
      if (json.error) {
        setError(json.error);
        return;
      }
      setTeachers((prev) => prev.map((t) => t.google_sub === sub ? { ...t, role } : t));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusySub(null);
    }
  }, [busySub]);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? teachers.filter((t) => (t.email ?? '').toLowerCase().includes(q) || (t.full_name ?? '').toLowerCase().includes(q))
    : teachers;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by name or email…"
          style={{
            minWidth: 240, flex: '1 1 240px',
            padding: '8px 12px', borderRadius: 10,
            border: '1.5px solid var(--pb-line-2)',
            background: 'var(--pb-paper)',
            color: 'var(--pb-ink)',
            fontSize: 13, fontFamily: 'inherit',
          }}
        />
        {ROLE_FILTERS.map((f) => {
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
                fontSize: 12.5, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
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

      {loading && filtered.length === 0 ? (
        <Empty text="Loading teachers…" />
      ) : filtered.length === 0 ? (
        <Empty text={query ? `No teachers match "${query}".` : 'No teachers found.'} />
      ) : (
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 0, margin: 0, listStyle: 'none' }}>
          {filtered.map((t) => (
            <li key={t.google_sub}>
              <TeacherCard
                teacher={t}
                busy={busySub === t.google_sub}
                onPromote={() => setRole(t.google_sub, 'admin')}
                onDemote={() => setRole(t.google_sub, 'teacher')}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TeacherCard({ teacher, busy, onPromote, onDemote }: {
  teacher: Teacher;
  busy: boolean;
  onPromote: () => void;
  onDemote: () => void;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: 12, borderRadius: 12,
      background: 'var(--pb-paper, #fff)',
      border: '1.5px solid var(--pb-line-2, #e5dfd2)',
    }}>
      <Avatar url={teacher.picture_url} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>{teacher.full_name ?? '(no name)'}</span>
          {teacher.role === 'admin' && (
            <span style={{
              padding: '1.5px 8px', borderRadius: 999,
              background: 'var(--pb-mint-2, #c8f2d0)',
              color: 'var(--pb-mint-ink, #2a6a3a)',
              fontSize: 10.5, fontWeight: 700, letterSpacing: 0.1,
            }}>admin</span>
          )}
        </div>
        <div style={{ fontSize: 12, color: 'var(--pb-ink-muted, #6a6458)', marginTop: 2 }}>
          {teacher.email ?? '(no email on record)'}
        </div>
        <div style={{ fontSize: 11, color: 'var(--pb-ink-muted, #6a6458)', marginTop: 2 }}>
          Last seen {new Date(teacher.last_seen_at).toLocaleDateString()}
          {' · '}
          Joined {new Date(teacher.created_at).toLocaleDateString()}
        </div>
      </div>
      <div>
        {teacher.role === 'admin' ? (
          <button
            type="button"
            onClick={onDemote}
            disabled={busy}
            title="Demote to teacher"
            style={buttonStyle('danger', busy)}
          >
            <ShieldOff size={13} strokeWidth={2.2} />
            Demote
          </button>
        ) : (
          <button
            type="button"
            onClick={onPromote}
            disabled={busy}
            title="Promote to admin"
            style={buttonStyle('approve', busy)}
          >
            <Shield size={13} strokeWidth={2.2} />
            Promote
          </button>
        )}
      </div>
    </div>
  );
}

function Avatar({ url }: { url: string | null }) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        style={{ width: 40, height: 40, borderRadius: 999, objectFit: 'cover', flexShrink: 0 }}
      />
    );
  }
  return (
    <div style={{
      width: 40, height: 40, borderRadius: 999,
      background: 'var(--pb-cream-2, #fff5df)',
      border: '1.5px solid var(--pb-line-2, #e5dfd2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--pb-ink-muted, #6a6458)',
      flexShrink: 0,
    }}>
      <UserRound size={18} strokeWidth={1.8} />
    </div>
  );
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

function buttonStyle(tone: 'approve' | 'danger', disabled: boolean): React.CSSProperties {
  const palette = tone === 'approve'
    ? { bg: 'var(--pb-mint-2, #c8f2d0)', fg: 'var(--pb-mint-ink, #2a6a3a)', bd: 'var(--pb-mint-ink, #2a6a3a)' }
    : { bg: 'var(--pb-coral-2, #fddad5)', fg: 'var(--pb-coral-ink, #a03a2e)', bd: 'var(--pb-coral-ink, #a03a2e)' };
  return {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '7px 12px', borderRadius: 10,
    background: palette.bg, color: palette.fg,
    border: `1.5px solid ${palette.bd}`,
    fontSize: 12.5, fontWeight: 700, fontFamily: 'inherit',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  };
}
