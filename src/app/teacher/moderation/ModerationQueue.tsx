'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, X, ExternalLink, RefreshCw, AlertTriangle, Gamepad2 } from 'lucide-react';

// Two-column moderation surface: pending games on the left, open reports on
// the right. Kept in a single client component so approve/reject actions
// immediately update both columns without prop drilling.

interface PendingGame {
  id: string;
  user_id: string;
  name: string;
  prompt: string;
  cover_url: string | null;
  plays_count: number;
  is_published: boolean;
  moderation_status: string;
  updated_at: string;
  created_at: string;
}

interface OpenReport {
  id: string;
  game_id: string;
  reason: string;
  details: string | null;
  reporter_id: string | null;
  status: string;
  created_at: string;
  game: { id: string; name: string; cover_url: string | null; is_published: boolean } | null;
}

const REASON_LABEL: Record<string, string> = {
  inappropriate: 'Mean or rude',
  scary: 'Too scary',
  broken: "Doesn't work",
  copy: 'Copy of something',
  other: 'Something else',
};

export function ModerationQueue() {
  const [pendingGames, setPendingGames] = useState<PendingGame[]>([]);
  const [openReports, setOpenReports] = useState<OpenReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/moderation/queue', { cache: 'no-store' });
      const json = await res.json() as { pendingGames?: PendingGame[]; openReports?: OpenReport[]; error?: string };
      if (json.error) {
        setError(json.error);
      } else {
        setPendingGames(json.pendingGames ?? []);
        setOpenReports(json.openReports ?? []);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const moderateGame = useCallback(async (gameId: string, action: 'approve' | 'reject') => {
    if (busyId) return;
    setBusyId(gameId);
    try {
      const res = await fetch(`/api/moderation/games/${gameId}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const json = await res.json() as { game?: { moderation_status: string }; error?: string };
      if (json.error) {
        setError(json.error);
        return;
      }
      // Drop the game from the pending list + drop any open reports pointing
      // to it from the report list (server auto-dismissed them on reject).
      setPendingGames((prev) => prev.filter((g) => g.id !== gameId));
      if (action === 'reject') {
        setOpenReports((prev) => prev.filter((r) => r.game_id !== gameId));
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyId(null);
    }
  }, [busyId]);

  const moderateReport = useCallback(async (reportId: string, action: 'reviewed' | 'dismissed') => {
    if (busyId) return;
    setBusyId(reportId);
    try {
      const res = await fetch(`/api/moderation/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const json = await res.json() as { report?: { status: string }; error?: string };
      if (json.error) {
        setError(json.error);
        return;
      }
      setOpenReports((prev) => prev.filter((r) => r.id !== reportId));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyId(null);
    }
  }, [busyId]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 20 }}>
      <section>
        <SectionHeader
          title="Pending games"
          count={pendingGames.length}
          hint="New or edited games waiting for first approval."
          onRefresh={refresh}
          refreshing={loading}
        />
        {error && <ErrorBanner message={error} />}
        {loading && pendingGames.length === 0 ? (
          <EmptyState text="Loading…" />
        ) : pendingGames.length === 0 ? (
          <EmptyState text="Nothing pending. Nice." icon={Check} />
        ) : (
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, listStyle: 'none', padding: 0, margin: 0 }}>
            {pendingGames.map((g) => (
              <li key={g.id}>
                <PendingCard
                  game={g}
                  busy={busyId === g.id}
                  onApprove={() => moderateGame(g.id, 'approve')}
                  onReject={() => moderateGame(g.id, 'reject')}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <SectionHeader
          title="Flagged"
          count={openReports.length}
          hint="Reports filed by players. The game is auto-unlisted until you review."
          onRefresh={refresh}
          refreshing={loading}
          tone="warn"
        />
        {loading && openReports.length === 0 ? (
          <EmptyState text="Loading…" />
        ) : openReports.length === 0 ? (
          <EmptyState text="No open reports." icon={Check} />
        ) : (
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, listStyle: 'none', padding: 0, margin: 0 }}>
            {openReports.map((r) => (
              <li key={r.id}>
                <ReportCard
                  report={r}
                  busy={busyId === r.id || busyId === r.game_id}
                  onDismiss={() => moderateReport(r.id, 'dismissed')}
                  onReject={() => moderateGame(r.game_id, 'reject')}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function SectionHeader({
  title, count, hint, onRefresh, refreshing, tone,
}: {
  title: string;
  count: number;
  hint: string;
  onRefresh: () => void;
  refreshing: boolean;
  tone?: 'warn';
}) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>{title}</h2>
        <span style={{
          padding: '1px 8px', borderRadius: 999,
          background: tone === 'warn'
            ? 'var(--pb-coral-2, #fddad5)'
            : 'var(--pb-cream-2, #fff5df)',
          color: tone === 'warn'
            ? 'var(--pb-coral-ink, #a03a2e)'
            : 'var(--pb-ink-muted, #6a6458)',
          fontSize: 11.5, fontWeight: 700,
        }}>
          {count}
        </span>
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          aria-label="Refresh"
          title="Refresh"
          style={{
            marginLeft: 'auto',
            width: 28, height: 28, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--pb-paper, #fff)',
            color: 'var(--pb-ink-muted, #6a6458)',
            border: '1.5px solid var(--pb-line-2, #e5dfd2)',
            cursor: refreshing ? 'not-allowed' : 'pointer',
            opacity: refreshing ? 0.5 : 1,
          }}
        >
          <RefreshCw size={12} strokeWidth={2.2} className={refreshing ? 'animate-spin' : undefined} />
        </button>
      </div>
      <p style={{ fontSize: 12.5, color: 'var(--pb-ink-muted, #6a6458)', margin: '4px 0 0' }}>{hint}</p>
    </div>
  );
}

function PendingCard({ game, busy, onApprove, onReject }: { game: PendingGame; busy: boolean; onApprove: () => void; onReject: () => void }) {
  return (
    <div style={cardStyle()}>
      <Thumbnail cover={game.cover_url} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {game.name}
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--pb-ink-muted, #6a6458)', margin: '2px 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {game.prompt || '(no prompt)'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11.5, color: 'var(--pb-ink-muted, #6a6458)' }}>
          <span>by {game.user_id}</span>
          <span>·</span>
          <span>{new Date(game.updated_at).toLocaleDateString()}</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Link
          href={`/play/${game.id}`}
          target="_blank"
          style={iconButtonStyle()}
          aria-label="Preview"
          title="Preview in new tab"
        >
          <ExternalLink size={13} />
        </Link>
        <button
          type="button"
          onClick={onReject}
          disabled={busy}
          aria-label="Reject"
          title="Reject — hides game + sets status to rejected"
          style={iconButtonStyle('danger', busy)}
        >
          <X size={14} />
        </button>
        <button
          type="button"
          onClick={onApprove}
          disabled={busy}
          aria-label="Approve"
          title="Approve — lists in marketplace"
          style={iconButtonStyle('approve', busy)}
        >
          <Check size={14} />
        </button>
      </div>
    </div>
  );
}

function ReportCard({ report, busy, onDismiss, onReject }: { report: OpenReport; busy: boolean; onDismiss: () => void; onReject: () => void }) {
  const gameName = report.game?.name ?? '(unknown game)';
  return (
    <div style={cardStyle()}>
      <Thumbnail cover={report.game?.cover_url ?? null} tone="warn" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            padding: '1.5px 7px', borderRadius: 999,
            background: 'var(--pb-coral-2, #fddad5)',
            color: 'var(--pb-coral-ink, #a03a2e)',
            fontSize: 10.5, fontWeight: 700, letterSpacing: 0.1,
          }}>
            {REASON_LABEL[report.reason] ?? report.reason}
          </span>
          <span style={{ fontSize: 11, color: 'var(--pb-ink-muted, #6a6458)' }}>
            {new Date(report.created_at).toLocaleDateString()}
          </span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {gameName}
        </div>
        {report.details && (
          <div style={{ fontSize: 12, color: 'var(--pb-ink, #1d1a14)', marginTop: 4, lineHeight: 1.4 }}>
            &ldquo;{report.details}&rdquo;
          </div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Link
          href={`/play/${report.game_id}`}
          target="_blank"
          style={iconButtonStyle()}
          aria-label="Open game"
          title="Open game in new tab"
        >
          <ExternalLink size={13} />
        </Link>
        <button
          type="button"
          onClick={onDismiss}
          disabled={busy}
          aria-label="Dismiss"
          title="Dismiss — mark reviewed, leave game as-is"
          style={iconButtonStyle('default', busy)}
        >
          <Check size={14} />
        </button>
        <button
          type="button"
          onClick={onReject}
          disabled={busy}
          aria-label="Reject game"
          title="Reject the game — unpublishes + closes all reports"
          style={iconButtonStyle('danger', busy)}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

function Thumbnail({ cover, tone }: { cover: string | null; tone?: 'warn' }) {
  const bg = tone === 'warn' ? 'var(--pb-coral-2, #fddad5)' : 'var(--pb-cream-2, #fff5df)';
  const size = 56;
  const style: React.CSSProperties = {
    width: size, height: size, flexShrink: 0,
    borderRadius: 12,
    background: bg,
    border: '1.5px solid var(--pb-line-2, #e5dfd2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  };
  if (cover) {
    return (
      <div style={style}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cover} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    );
  }
  const Icon = tone === 'warn' ? AlertTriangle : Gamepad2;
  return (
    <div style={style}>
      <Icon size={20} strokeWidth={1.8} style={{ color: 'var(--pb-ink-muted, #6a6458)' }} />
    </div>
  );
}

function EmptyState({ text, icon: Icon }: { text: string; icon?: React.ElementType }) {
  const I = Icon ?? Gamepad2;
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      padding: '30px 10px',
      borderRadius: 14,
      background: 'var(--pb-paper, #fff)',
      border: '1.5px dashed var(--pb-line-2, #e5dfd2)',
      color: 'var(--pb-ink-muted, #6a6458)',
      fontSize: 13,
    }}>
      <I size={22} strokeWidth={1.8} />
      <span>{text}</span>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div style={{
      padding: '10px 12px', borderRadius: 10,
      background: 'var(--pb-coral-2, #fddad5)',
      color: 'var(--pb-coral-ink, #a03a2e)',
      fontSize: 13, fontWeight: 600,
      marginBottom: 10,
    }}>
      {message}
    </div>
  );
}

function cardStyle(): React.CSSProperties {
  return {
    display: 'flex', alignItems: 'stretch', gap: 12,
    padding: 12, borderRadius: 14,
    background: 'var(--pb-paper, #fff)',
    border: '1.5px solid var(--pb-line-2, #e5dfd2)',
    minWidth: 0,
  };
}

function iconButtonStyle(tone: 'default' | 'danger' | 'approve' = 'default', disabled = false): React.CSSProperties {
  const palette =
    tone === 'danger'
      ? { bg: 'var(--pb-coral-2, #fddad5)', fg: 'var(--pb-coral-ink, #a03a2e)', bd: 'var(--pb-coral-ink, #a03a2e)' }
      : tone === 'approve'
      ? { bg: 'var(--pb-mint-2, #c8f2d0)', fg: 'var(--pb-mint-ink, #2a6a3a)', bd: 'var(--pb-mint-ink, #2a6a3a)' }
      : { bg: 'var(--pb-paper, #fff)', fg: 'var(--pb-ink-soft, #3b362b)', bd: 'var(--pb-line-2, #e5dfd2)' };
  return {
    width: 32, height: 28, borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: palette.bg,
    color: palette.fg,
    border: `1.5px solid ${palette.bd}`,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    fontFamily: 'inherit',
    textDecoration: 'none',
  };
}
