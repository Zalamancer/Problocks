'use client';

import { useCallback, useEffect, useState } from 'react';
import { Library, Gamepad2, Trash2, ExternalLink, RefreshCw } from 'lucide-react';
import { useStudio } from '@/store/studio-store';
import { useToastStore } from '@/store/toast-store';
import { useConfirmDialogStore } from '@/store/confirm-dialog-store';

// "My Games" — the library panel for the studio left-rail.
// Shows the union of (local drafts persisted to zustand/localStorage) and
// (server-side rows from /api/games). Clicking a row loads it into
// activeGameId; clicking delete removes both locally and on the server.

interface ServerGame {
  id: string;
  name: string;
  cover_url: string | null;
  is_published: boolean;
  visibility: string;
  plays_count: number;
  moderation_status: string;
  updated_at: string;
}

interface MergedGame {
  id: string;
  name: string;
  updatedAt: number;
  playsCount: number;
  isPublished: boolean;
  coverUrl: string | null;
  location: 'local' | 'server' | 'both';
}

const CURRENT_USER_ID = 'local-user';

export function LibraryPanel() {
  const games = useStudio((s) => s.games);
  const activeGameId = useStudio((s) => s.activeGameId);
  const setActiveGameId = useStudio((s) => s.setActiveGameId);
  const addGame = useStudio((s) => s.addGame);
  const updateGame = useStudio((s) => s.updateGame);
  const removeGame = useStudio((s) => s.removeGame);
  const openNewGameDialog = useStudio((s) => s.openNewGameDialog);
  const addToast = useToastStore((s) => s.addToast);
  const confirm = useConfirmDialogStore((s) => s.confirm);

  const [serverGames, setServerGames] = useState<ServerGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/games?userId=${encodeURIComponent(CURRENT_USER_ID)}`);
      const json = await res.json() as { games?: ServerGame[]; error?: string };
      if (json.error) {
        addToast('error', `Library load failed: ${json.error}`);
        return;
      }
      setServerGames(json.games ?? []);
    } catch (err) {
      addToast('error', `Library load failed: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Merge local + server by id. Server metadata wins on conflict.
  const merged: MergedGame[] = [];
  const seen = new Set<string>();
  for (const g of serverGames) {
    const hasLocal = games.some((l) => l.id === g.id);
    merged.push({
      id: g.id,
      name: g.name,
      updatedAt: new Date(g.updated_at).getTime(),
      playsCount: g.plays_count,
      isPublished: g.is_published,
      coverUrl: g.cover_url,
      location: hasLocal ? 'both' : 'server',
    });
    seen.add(g.id);
  }
  for (const g of games) {
    if (seen.has(g.id)) continue;
    merged.push({
      id: g.id,
      name: g.name || 'Untitled',
      updatedAt: g.updatedAt,
      playsCount: 0,
      isPublished: false,
      coverUrl: null,
      location: 'local',
    });
  }
  merged.sort((a, b) => b.updatedAt - a.updatedAt);

  const handleOpen = useCallback(async (gameId: string, location: MergedGame['location']) => {
    if (loadingId) return;
    const local = games.find((g) => g.id === gameId);

    if (location === 'server' || (location === 'both' && !local?.html && !local?.files)) {
      // Server-only (or local stub with no HTML yet) — pull the full row in.
      setLoadingId(gameId);
      try {
        const res = await fetch(`/api/games/${gameId}`);
        const json = await res.json() as { game?: { id: string; name: string; prompt: string; html_content: string | null }; error?: string };
        if (json.error || !json.game) {
          addToast('error', `Open failed: ${json.error ?? 'not found'}`);
          return;
        }
        const html = json.game.html_content ?? '';
        if (local) {
          updateGame(local.id, html);
        } else {
          // addGame assigns a new uuid — we need to preserve the server id so
          // the next save round-trips cleanly. Fall through to the store
          // bypass below.
          useStudio.setState((s) => ({
            games: [
              ...s.games,
              {
                id: json.game!.id,
                name: json.game!.name,
                prompt: json.game!.prompt,
                html,
                files: null,
                createdAt: Date.now(),
                updatedAt: Date.now(),
              },
            ],
          }));
        }
      } catch (err) {
        addToast('error', `Open failed: ${(err as Error).message}`);
        return;
      } finally {
        setLoadingId(null);
      }
    }

    setActiveGameId(gameId);
  }, [games, loadingId, updateGame, setActiveGameId, addToast]);

  const handleDelete = useCallback(async (gameId: string, name: string, location: MergedGame['location']) => {
    const ok = await confirm({
      title: 'Delete game?',
      description: `"${name}" will be removed from your library${location !== 'local' ? ' and any shared /play links will stop working' : ''}. This cannot be undone.`,
      confirmLabel: 'Delete',
      cancelLabel: 'Keep',
    });
    if (!ok) return;

    if (location !== 'local') {
      try {
        const res = await fetch(`/api/games/${gameId}`, { method: 'DELETE' });
        const json = await res.json() as { error?: string };
        if (json.error) {
          addToast('error', `Delete failed: ${json.error}`);
          return;
        }
      } catch (err) {
        addToast('error', `Delete failed: ${(err as Error).message}`);
        return;
      }
    }
    removeGame(gameId);
    setServerGames((prev) => prev.filter((g) => g.id !== gameId));
    addToast('success', 'Deleted.');
  }, [confirm, removeGame, addToast]);

  const handleCopyLink = useCallback(async (gameId: string) => {
    const url = `${window.location.origin}/play/${gameId}`;
    try {
      await navigator.clipboard.writeText(url);
      addToast('success', 'Play link copied.');
    } catch {
      addToast('info', url);
    }
  }, [addToast]);

  return (
    <div className="flex flex-col min-h-0 flex-1" style={{ fontFamily: 'inherit' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderBottom: '1px solid var(--pb-line-2)' }}>
        <button
          type="button"
          onClick={openNewGameDialog}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '8px 12px',
            borderRadius: 10,
            background: 'var(--pb-ink)',
            color: 'var(--pb-paper)',
            border: '1.5px solid var(--pb-ink)',
            fontSize: 12.5,
            fontWeight: 700,
            fontFamily: 'inherit',
            cursor: 'pointer',
          }}
        >
          New game
        </button>
        <button
          type="button"
          onClick={() => { void refresh(); }}
          aria-label="Refresh library"
          title="Refresh"
          disabled={loading}
          style={{
            width: 34, height: 34,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 10,
            background: 'var(--pb-paper)',
            color: 'var(--pb-ink-soft)',
            border: '1.5px solid var(--pb-line-2)',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1,
          }}
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : undefined} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ padding: '10px 12px' }}>
        {merged.length === 0 ? (
          <EmptyState loading={loading} />
        ) : (
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: 0, padding: 0, listStyle: 'none' }}>
            {merged.map((g) => {
              const isActive = g.id === activeGameId;
              return (
                <li key={g.id}>
                  <div
                    style={{
                      display: 'flex', alignItems: 'stretch', gap: 10,
                      padding: 10, borderRadius: 12,
                      background: isActive ? 'var(--pb-cream-2)' : 'var(--pb-paper)',
                      border: `1.5px solid ${isActive ? 'var(--pb-ink)' : 'var(--pb-line-2)'}`,
                      boxShadow: isActive ? '0 2px 0 var(--pb-ink)' : 'none',
                      cursor: 'pointer',
                      minWidth: 0,
                    }}
                    onClick={() => { void handleOpen(g.id, g.location); }}
                  >
                    <Thumbnail cover={g.coverUrl} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 4, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--pb-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                          {g.name}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <LocationTag location={g.location} />
                        {g.isPublished && <Tag tone="mint">public</Tag>}
                        <span style={{ fontSize: 11, color: 'var(--pb-ink-muted)' }}>
                          {g.playsCount} {g.playsCount === 1 ? 'play' : 'plays'}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }} onClick={(e) => e.stopPropagation()}>
                      {g.isPublished && (
                        <IconButton
                          icon={ExternalLink}
                          label="Copy link"
                          onClick={() => { void handleCopyLink(g.id); }}
                        />
                      )}
                      <IconButton
                        icon={Trash2}
                        label="Delete"
                        tone="danger"
                        onClick={() => { void handleDelete(g.id, g.name, g.location); }}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function EmptyState({ loading }: { loading: boolean }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 10, padding: '28px 10px', color: 'var(--pb-ink-muted)', textAlign: 'center',
    }}>
      <Library size={28} strokeWidth={1.8} />
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--pb-ink)' }}>
        {loading ? 'Loading your games…' : 'No games yet'}
      </div>
      {!loading && (
        <div style={{ fontSize: 12, lineHeight: 1.5, maxWidth: 220 }}>
          Try a prompt in the terminal (⌘J) or click <b>New game</b> to start from a template.
        </div>
      )}
    </div>
  );
}

function Thumbnail({ cover }: { cover: string | null }) {
  const size = 52;
  const style: React.CSSProperties = {
    width: size, height: size, flexShrink: 0,
    borderRadius: 10,
    background: 'var(--pb-cream-2)',
    border: '1.5px solid var(--pb-line-2)',
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
  return (
    <div style={style}>
      <Gamepad2 size={20} strokeWidth={1.8} style={{ color: 'var(--pb-ink-muted)' }} />
    </div>
  );
}

function LocationTag({ location }: { location: MergedGame['location'] }) {
  if (location === 'local') return <Tag tone="amber">unsaved</Tag>;
  if (location === 'server') return <Tag tone="grape">cloud</Tag>;
  return <Tag tone="mint">synced</Tag>;
}

function Tag({ tone, children }: { tone: 'mint' | 'amber' | 'grape'; children: React.ReactNode }) {
  const color = tone === 'mint' ? 'var(--pb-mint-ink)' : tone === 'amber' ? '#8b6a00' : 'var(--pb-ink)';
  const bg = tone === 'mint' ? 'var(--pb-mint-2)' : tone === 'amber' ? '#fce6a8' : 'var(--pb-cream-2)';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '1.5px 7px', borderRadius: 999,
      background: bg, color,
      fontSize: 10.5, fontWeight: 700, letterSpacing: 0.1,
    }}>
      {children}
    </span>
  );
}

function IconButton({ icon: Icon, label, onClick, tone }: { icon: React.ElementType; label: string; onClick: () => void; tone?: 'danger' }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      style={{
        width: 26, height: 26,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 8,
        background: 'transparent',
        color: tone === 'danger' ? 'var(--pb-coral-ink, #a03a2e)' : 'var(--pb-ink-soft)',
        border: '1.5px solid transparent',
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = tone === 'danger' ? 'var(--pb-coral-2, #fddad5)' : 'var(--pb-cream-2)';
      }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      <Icon size={13} strokeWidth={2.2} />
    </button>
  );
}
