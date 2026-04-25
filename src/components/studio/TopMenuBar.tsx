'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Save,
  Upload,
  Play,
  Square,
  Sun,
  Moon,
  Sparkles,
  LogOut,
  ChevronRight,
  Share2,
  Network,
  Gamepad2,
  Code2,
  Kanban,
  MoreVertical,
  Undo2,
  Coins,
  FolderOpen,
  X,
  Trash2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useStudio, type ViewMode } from '@/store/studio-store';
import { useSceneStore } from '@/store/scene-store';
import { useBuildingStore } from '@/store/building-store';
import { useQualityStore } from '@/store/quality-store';
import { useToastStore } from '@/store/toast-store';
import { useCreditsStore } from '@/store/credits-store';
import { useCurrentUserId } from '@/store/auth-store';
import { PBButton, PBLogo, AvatarStack } from '@/components/ui';
import { renderGameHtml, saveGame, saveAndPublish } from '@/lib/studio/save-game';
import { useFreeform } from '@/store/freeform-store';

// Playdemy Studio top bar — ported from the design bundle's topbar.jsx.
// Layout: logo mark + breadcrumb (classroom > project) on the left,
// centered chunky pill-tab view switcher, collab avatar stack + Share + Play
// on the right. File/Marketplace/Classroom/Account rolled into the kebab
// dropdown so the chrome stays clean.

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  shortcut?: string;
  onClick: () => void;
  separator?: false;
}
interface MenuSeparator { separator: true; }
type MenuEntry = MenuItem | MenuSeparator;

/** Trigger a browser download of a JSON blob without going through any
 *  server route. Used to "save" 2D Freeform scenes locally — the JSON
 *  contains data URLs for every image so it's self-contained. */
function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// View-switcher pills — mapped to the existing ViewMode values plus "chat"
// which is a convenience pill that focuses the left-panel Chat tab rather
// than a fourth viewMode. Matches topbar.jsx exactly: Canvas/Preview/Code/Claude.
interface ViewTab {
  id: string;
  label: string;
  icon: LucideIcon;
  isActive: (ctx: ViewTabCtx) => boolean;
  activate: (ctx: ViewTabCtx) => void;
}
interface ViewTabCtx {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  openFileName: string | null;
  setOpenFileName: (name: string | null) => void;
  setLeftPanelGroup: (group: 'scene' | 'assets' | 'chat' | 'parts' | 'connectors') => void;
  activeGameFirstFile?: string;
  leftPanelActiveGroup: string;
}

const VIEW_TABS: ViewTab[] = [
  {
    id: 'kanban',
    label: 'Kanban',
    icon: Kanban,
    isActive: (c) => c.viewMode === 'kanban' && !c.openFileName,
    activate: (c) => { c.setOpenFileName(null); c.setViewMode('kanban'); },
  },
  {
    id: 'canvas',
    label: 'Flowchart',
    icon: Network,
    isActive: (c) => c.viewMode === 'canvas' && !c.openFileName,
    activate: (c) => { c.setOpenFileName(null); c.setViewMode('canvas'); },
  },
  {
    id: 'preview',
    label: 'Preview',
    icon: Gamepad2,
    isActive: (c) => c.viewMode === '3d' && !c.openFileName,
    activate: (c) => { c.setOpenFileName(null); c.setViewMode('3d'); },
  },
  {
    id: 'code',
    label: 'Code',
    icon: Code2,
    isActive: (c) => !!c.openFileName,
    activate: (c) => {
      // Fall back to an empty virtual file so the Code tab always shows something.
      c.setOpenFileName(c.activeGameFirstFile ?? 'untitled.js');
    },
  },
  {
    id: 'claude',
    label: 'Claude',
    icon: Sparkles,
    isActive: (c) => c.leftPanelActiveGroup === 'chat',
    activate: (c) => { c.setLeftPanelGroup('chat'); },
  },
];

export function TopMenuBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const {
    projectName,
    setProjectName,
    theme,
    setTheme,
    games,
    activeGameId,
    viewMode,
    setViewMode,
    openFileName,
    setOpenFileName,
    leftPanelActiveGroup,
    setLeftPanelGroup,
    openNewGameDialog,
    gameHistory,
    undoGame,
    gameSystem,
  } = useStudio();
  const isPlaying = useSceneStore((s) => s.isPlaying);
  const setIsPlaying = useSceneStore((s) => s.setIsPlaying);
  const setBuildTool = useBuildingStore((s) => s.setTool);
  const gameQuality = useQualityStore((s) => s.settings);
  const addToast = useToastStore((s) => s.addToast);
  const creditsBalance = useCreditsStore((s) => s.balance);
  const refreshCredits = useCreditsStore((s) => s.refreshBalance);
  const currentUserId = useCurrentUserId();

  useEffect(() => {
    // Seed the counter on mount (and whenever the user id changes from a
    // sign-in / sign-out) so first-visit users see their 100-credit signup
    // grant without having to trigger a generation first.
    void refreshCredits(currentUserId);
  }, [refreshCredits, currentUserId]);
  const activeGame = activeGameId ? games.find((g) => g.id === activeGameId) : null;
  const activeGameFirstFile = activeGame?.files ? Object.keys(activeGame.files)[0] : undefined;

  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [openSceneOpen, setOpenSceneOpen] = useState(false);

  const togglePlay = useCallback(() => {
    const next = !isPlaying;
    setIsPlaying(next);
    if (next) setBuildTool('select');
  }, [isPlaying, setIsPlaying, setBuildTool]);

  const handleSave = useCallback(async () => {
    // 2D Freeform mode doesn't have an activeGame — the scene lives in the
    // freeform-2d store. POST it to /api/scenes/freeform-2d so it persists
    // server-side, scoped per user via Supabase RLS. The endpoint upserts
    // on (user_id, name) so saving twice with the same project name
    // updates the same row. If Supabase isn't configured (or returns 503),
    // fall back to a JSON download so the user still gets something they
    // can keep.
    if (gameSystem === '2d-freeform') {
      const ff = useFreeform.getState();
      if (
        ff.images.length === 0 &&
        ff.characters.length === 0 &&
        ff.assets.length === 0
      ) {
        addToast('warning', 'Empty canvas — drop or paste an image first.');
        return;
      }
      if (saving) return;
      setSaving(true);
      const safeName = (projectName || 'Untitled scene').slice(0, 200);
      const payload = {
        version: 1,
        type: 'problocks-freeform-2d' as const,
        savedAt: new Date().toISOString(),
        images: ff.images,
        characters: ff.characters,
        background: ff.background,
        showGrid: ff.showGrid,
      };
      try {
        const res = await fetch('/api/scenes/freeform-2d', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            name: safeName,
            data: payload,
            userId: currentUserId,
          }),
        });
        if (res.ok) {
          addToast('success', `Saved scene "${safeName}".`);
        } else if (res.status === 503) {
          // Backend not configured — keep working via local download.
          downloadJson(
            `${safeName.replace(/[^a-z0-9-_]+/gi, '-') || 'scene'}.problocks2d.json`,
            payload,
          );
          addToast('info', 'Cloud save unavailable — downloaded a local copy instead.');
        } else {
          const body = (await res.json().catch(() => null)) as { error?: string } | null;
          addToast('error', `Save failed: ${body?.error ?? res.statusText}`);
        }
      } catch (err) {
        addToast('error', `Save failed: ${(err as Error).message}`);
      } finally {
        setSaving(false);
      }
      return;
    }

    if (!activeGame) {
      addToast('warning', 'Nothing to save yet — generate a game first.');
      return;
    }
    if (saving) return;
    setSaving(true);
    try {
      const html = renderGameHtml(activeGame, gameQuality);
      const res = await saveGame(activeGame, html, currentUserId);
      if (res.error) {
        addToast('error', `Save failed: ${res.error}`);
      } else if (res.warning) {
        addToast('info', res.warning);
      } else {
        addToast('success', 'Saved.');
      }
    } catch (err) {
      addToast('error', `Save failed: ${(err as Error).message}`);
    } finally {
      setSaving(false);
    }
  }, [activeGame, gameQuality, saving, addToast, currentUserId, gameSystem, projectName]);

  const handleShare = useCallback(async () => {
    if (!activeGame) {
      addToast('warning', 'Nothing to share yet — generate a game first.');
      return;
    }
    if (sharing) return;
    setSharing(true);
    try {
      const html = renderGameHtml(activeGame, gameQuality);
      const res = await saveAndPublish(activeGame, html, currentUserId);
      if ('error' in res) {
        addToast('error', `Share failed: ${res.error}`);
        return;
      }
      try {
        await navigator.clipboard.writeText(res.playUrl);
        addToast('success', 'Link copied — paste it anywhere to share.');
      } catch {
        addToast('info', `Link: ${res.playUrl}`);
      }
    } catch (err) {
      addToast('error', `Share failed: ${(err as Error).message}`);
    } finally {
      setSharing(false);
    }
  }, [activeGame, gameQuality, sharing, addToast, currentUserId]);

  // Close menu on outside click / escape
  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const tabCtx: ViewTabCtx = {
    viewMode,
    setViewMode,
    openFileName,
    setOpenFileName,
    setLeftPanelGroup,
    activeGameFirstFile,
    leftPanelActiveGroup,
  };

  const menuItems: MenuEntry[] = [
    { id: 'new',     label: 'New Game',               icon: Play,   shortcut: '⌘N', onClick: () => openNewGameDialog() },
    { id: 'save',    label: saving ? 'Saving…' : 'Save', icon: Save, shortcut: '⌘S', onClick: () => { void handleSave(); } },
    // Open scene… is 2D-Freeform only — the picker lists rows from the
    // freeform_scenes Supabase table the Save action writes to.
    ...(gameSystem === '2d-freeform'
      ? [{ id: 'open-scene', label: 'Open scene…', icon: FolderOpen, onClick: () => { setOpenSceneOpen(true); setMenuOpen(false); } } as MenuEntry]
      : []),
    { id: 'publish', label: sharing ? 'Publishing…' : 'Publish to Marketplace', icon: Upload, shortcut: '⌘P', onClick: () => { void handleShare(); } },
    { separator: true },
    { id: 'marketplace', label: 'Marketplace', icon: Upload,   onClick: () => { window.location.href = '/marketplace'; } },
    { id: 'classroom',   label: 'Classroom',   icon: Sparkles, onClick: () => {} },
    { separator: true },
    { id: 'theme-dark',  label: theme === 'dark'  ? '✓ Dark'  : 'Dark',  icon: Moon,     onClick: () => setTheme('dark')  },
    { id: 'theme-light', label: theme === 'light' ? '✓ Light' : 'Light', icon: Sun,      onClick: () => setTheme('light') },
    { id: 'theme-cream', label: theme === 'cream' ? '✓ Cream' : 'Cream', icon: Sparkles, onClick: () => setTheme('cream') },
    { separator: true },
    { id: 'signout',     label: 'Sign out',    icon: LogOut,   onClick: () => {} },
  ];

  return (
    <div
      ref={barRef}
      className="relative z-50 shrink-0 select-none"
      style={{
        height: 56,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '0 14px',
        borderRadius: 14,
        background: 'var(--shell-bg)',
        border: '1.5px solid var(--shell-border)',
      }}
    >
      {/* Logo + breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <PBLogo size={28} />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 14,
            fontWeight: 700,
            color: 'var(--pb-ink)',
            minWidth: 0,
          }}
        >
          <span className="hidden sm:inline">Playdemy</span>
          <ChevronRight size={12} style={{ color: 'var(--pb-ink-muted)' }} className="hidden sm:inline" />
          <span style={{ color: 'var(--pb-ink-soft)', fontWeight: 600 }} className="hidden md:inline">
            Ms. Alvarez · Period 4
          </span>
          <ChevronRight size={12} style={{ color: 'var(--pb-ink-muted)' }} className="hidden md:inline" />
          <input
            value={activeGame?.name ?? projectName}
            onChange={(e) => setProjectName(e.target.value)}
            style={{
              background: 'transparent',
              border: 0,
              padding: '2px 4px',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 700,
              color: 'var(--pb-ink)',
              minWidth: 120,
              maxWidth: 220,
              outline: 'none',
            }}
            placeholder="Project name"
          />
        </div>
      </div>

      {/* Centered pill-tab view switcher — absolutely positioned at center */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          padding: 3,
          borderRadius: 999,
          background: 'var(--pb-cream-2)',
          border: '1.5px solid var(--pb-line-2)',
          zIndex: 1,
        }}
      >
        {VIEW_TABS.map((v) => {
          const on = v.isActive(tabCtx);
          const Icon = v.icon;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => v.activate(tabCtx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600,
                fontFamily: 'inherit',
                color: on ? 'var(--pb-ink)' : 'var(--pb-ink-soft)',
                background: on ? 'var(--pb-paper)' : 'transparent',
                border: 0,
                boxShadow: on ? '0 1px 2px rgba(29,26,20,0.08), inset 0 0 0 1.5px var(--pb-ink)' : 'none',
                cursor: 'pointer',
              }}
            >
              <Icon size={14} strokeWidth={2.2} />
              <span className="hidden md:inline">{v.label}</span>
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1 }} />

      {/* Right cluster: credits + avatars + Undo + Share + Play + kebab */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {creditsBalance !== null && <CreditsPill balance={creditsBalance} />}
        <AvatarStack names={['Ms Alvarez', 'Jules Tran', 'Rosa Shah']} size={26} />

        {(() => {
          const canUndo = !!activeGameId && (gameHistory[activeGameId]?.length ?? 0) > 0;
          return (
            <button
              type="button"
              onClick={() => { if (activeGameId && canUndo) undoGame(activeGameId); }}
              disabled={!canUndo}
              aria-label="Undo last generation"
              title={canUndo ? 'Undo last generation (⌘Z)' : 'Nothing to undo'}
              style={{
                width: 34, height: 34,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 10,
                background: 'var(--pb-paper)',
                color: canUndo ? 'var(--pb-ink)' : 'var(--pb-ink-muted)',
                border: '1.5px solid var(--pb-line-2)',
                cursor: canUndo ? 'pointer' : 'not-allowed',
                opacity: canUndo ? 1 : 0.5,
              }}
            >
              <Undo2 size={15} strokeWidth={2.2} />
            </button>
          );
        })()}

        <PBButton
          variant="secondary"
          size="sm"
          icon={Share2}
          onClick={handleShare}
          disabled={sharing}
        >
          <span className="hidden sm:inline">{sharing ? 'Sharing…' : 'Share'}</span>
        </PBButton>

        <PBButton
          variant={isPlaying ? 'destructive' : 'primary'}
          size="sm"
          icon={isPlaying ? Square : Play}
          onClick={togglePlay}
        >
          {isPlaying ? 'Stop' : 'Play'}
        </PBButton>

        {/* Kebab menu — replaces the old File/Account dropdown cluster */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="More"
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--pb-paper)',
              color: 'var(--pb-ink-soft)',
              border: '1.5px solid var(--pb-line-2)',
              cursor: 'pointer',
            }}
          >
            <MoreVertical size={15} />
          </button>

          {menuOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                minWidth: 220,
                padding: 6,
                borderRadius: 12,
                background: 'var(--pb-paper)',
                border: '1.5px solid var(--pb-ink)',
                boxShadow: '0 4px 0 var(--pb-ink), 0 12px 28px rgba(29,26,20,0.15)',
                zIndex: 60,
              }}
            >
              {menuItems.map((entry, i) => {
                if ((entry as MenuSeparator).separator) {
                  return <div key={`sep-${i}`} style={{ margin: '4px 0', borderTop: '1px solid var(--pb-line-2)' }} />;
                }
                const item = entry as MenuItem;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => { item.onClick(); setMenuOpen(false); }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 10px',
                      borderRadius: 8,
                      background: 'transparent',
                      color: 'var(--pb-ink)',
                      border: 0,
                      fontSize: 13,
                      fontFamily: 'inherit',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--pb-cream-2)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <Icon size={14} style={{ color: 'var(--pb-ink-muted)', flexShrink: 0 }} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.shortcut && (
                      <span style={{ fontSize: 10.5, color: 'var(--pb-ink-muted)' }}>{item.shortcut}</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {openSceneOpen && (
        <OpenSceneDialog
          onClose={() => setOpenSceneOpen(false)}
          onLoad={(name) => { setProjectName(name); setOpenSceneOpen(false); }}
          addToast={addToast}
        />
      )}
    </div>
  );
}

function CreditsPill({ balance }: { balance: number }) {
  const low = balance <= 10;
  return (
    <a
      href="#credits"
      onClick={(e) => e.preventDefault()}
      aria-label={`${balance} credits remaining`}
      title={low ? 'Running low — generations cost credits.' : `${balance} credits available`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '5px 10px',
        borderRadius: 999,
        background: low ? 'var(--pb-coral-2, #fddad5)' : 'var(--pb-cream-2, #fff5df)',
        color: low ? 'var(--pb-coral-ink, #a03a2e)' : 'var(--pb-ink, #1d1a14)',
        border: `1.5px solid ${low ? 'var(--pb-coral-ink, #a03a2e)' : 'var(--pb-line-2, #e5dfd2)'}`,
        fontSize: 12.5,
        fontWeight: 700,
        textDecoration: 'none',
        fontFamily: 'inherit',
      }}
    >
      <Coins size={13} strokeWidth={2.2} />
      {balance.toLocaleString()}
    </a>
  );
}

interface SavedScene {
  id: string;
  name: string;
  updatedAt: string;
}

/**
 * Modal that lists the user's saved 2D Freeform scenes (one row per
 * scene, sorted by `updated_at desc`) and loads the picked one into
 * the freeform-2d store. Talks to /api/scenes/freeform-2d.
 */
function OpenSceneDialog({
  onClose,
  onLoad,
  addToast,
}: {
  onClose: () => void;
  onLoad: (name: string) => void;
  addToast: (type: 'success' | 'error' | 'info' | 'warning', msg: string) => void;
}) {
  const [scenes, setScenes] = useState<SavedScene[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingName, setLoadingName] = useState<string | null>(null);
  const [deletingName, setDeletingName] = useState<string | null>(null);

  // Pull the scene list once on mount. Cheap query — server omits the
  // `data` blob from the listing so we're not pulling MB of base64.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/scenes/freeform-2d');
        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as { error?: string } | null;
          if (!cancelled) setError(body?.error ?? `HTTP ${res.status}`);
          return;
        }
        const body = (await res.json()) as { scenes?: SavedScene[] };
        if (!cancelled) setScenes(body.scenes ?? []);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Esc dismisses the modal, matching the rest of the studio's
  // dialog conventions.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleLoad(name: string) {
    if (loadingName) return;
    setLoadingName(name);
    try {
      const res = await fetch(`/api/scenes/freeform-2d?name=${encodeURIComponent(name)}`);
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        addToast('error', `Open failed: ${body?.error ?? res.statusText}`);
        return;
      }
      const body = (await res.json()) as {
        data?: {
          images?: import('@/store/freeform-store').FreeformImage[];
          characters?: import('@/store/freeform-store').FreeformCharacter[];
          background?: import('@/store/freeform-store').FreeformBackground;
          showGrid?: boolean;
        };
      };
      const data = body.data;
      if (!data) {
        addToast('error', 'Scene has no data.');
        return;
      }
      // Apply directly to the store. We bypass the per-action history
      // (no undo across an Open) — clearer mental model than half-merging
      // the new scene into the current undo stack.
      useFreeform.setState((prev) => ({
        ...prev,
        images: data.images ?? [],
        characters: data.characters ?? [],
        assets: [],
        background: data.background ?? prev.background,
        showGrid: data.showGrid ?? prev.showGrid,
        selectedImageId: null,
        selectedCollisionId: null,
        selectedCharacterId: null,
        pendingPenAnchors: [],
        pendingPenImageId: null,
        past: [],
        future: [],
        historyPaused: 0,
        pausedSnapshot: null,
      }));
      addToast('success', `Opened "${name}".`);
      onLoad(name);
    } catch (e) {
      addToast('error', `Open failed: ${(e as Error).message}`);
    } finally {
      setLoadingName(null);
    }
  }

  async function handleDelete(name: string) {
    if (deletingName) return;
    if (!confirm(`Delete scene "${name}"? This can't be undone.`)) return;
    setDeletingName(name);
    try {
      const res = await fetch(`/api/scenes/freeform-2d?name=${encodeURIComponent(name)}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        addToast('error', `Delete failed: ${body?.error ?? res.statusText}`);
        return;
      }
      setScenes((prev) => (prev ?? []).filter((s) => s.name !== name));
      addToast('success', `Deleted "${name}".`);
    } catch (e) {
      addToast('error', `Delete failed: ${(e as Error).message}`);
    } finally {
      setDeletingName(null);
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--pb-paper)',
          border: '1.5px solid var(--pb-ink)',
          borderRadius: 16,
          boxShadow: '0 6px 0 var(--pb-ink)',
          width: 480,
          maxHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            borderBottom: '1.5px solid var(--pb-line-2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FolderOpen size={16} style={{ color: 'var(--pb-ink)' }} />
            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--pb-ink)' }}>Open scene</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'transparent', border: 0, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--pb-ink-soft)',
            }}
          >
            <X size={16} />
          </button>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
          {error && (
            <p style={{ padding: 16, fontSize: 12.5, color: 'var(--pb-coral-ink)' }}>
              {error}
            </p>
          )}
          {!error && scenes === null && (
            <p style={{ padding: 16, fontSize: 12.5, color: 'var(--pb-ink-muted)' }}>
              Loading…
            </p>
          )}
          {!error && scenes && scenes.length === 0 && (
            <p style={{ padding: 16, fontSize: 12.5, color: 'var(--pb-ink-muted)' }}>
              No saved scenes yet. Use Save (⌘S) to create one.
            </p>
          )}
          {scenes?.map((scene) => (
            <div
              key={scene.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 10px',
                borderRadius: 10,
              }}
            >
              <button
                type="button"
                onClick={() => handleLoad(scene.name)}
                disabled={!!loadingName}
                style={{
                  flex: 1,
                  textAlign: 'left',
                  background: 'transparent',
                  border: 0,
                  borderRadius: 8,
                  padding: '6px 8px',
                  cursor: loadingName ? 'wait' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--pb-cream-2, #fff5df)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
              >
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--pb-ink)' }}>
                  {scene.name}
                </span>
                <span style={{ fontSize: 11, color: 'var(--pb-ink-muted)' }}>
                  {loadingName === scene.name ? 'Loading…' : `Updated ${new Date(scene.updatedAt).toLocaleString()}`}
                </span>
              </button>
              <button
                type="button"
                title="Delete"
                onClick={() => handleDelete(scene.name)}
                disabled={!!deletingName}
                style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: 'transparent', border: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--pb-coral-ink)',
                  cursor: deletingName ? 'wait' : 'pointer',
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
