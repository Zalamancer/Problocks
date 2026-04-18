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
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useStudio, type ViewMode } from '@/store/studio-store';
import { useSceneStore } from '@/store/scene-store';
import { useBuildingStore } from '@/store/building-store';
import { PBButton, PBLogo, AvatarStack } from '@/components/ui';

// ProBlocks Studio top bar — ported from the design bundle's topbar.jsx.
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
  } = useStudio();
  const isPlaying = useSceneStore((s) => s.isPlaying);
  const setIsPlaying = useSceneStore((s) => s.setIsPlaying);
  const setBuildTool = useBuildingStore((s) => s.setTool);
  const activeGame = activeGameId ? games.find((g) => g.id === activeGameId) : null;
  const activeGameFirstFile = activeGame?.files ? Object.keys(activeGame.files)[0] : undefined;

  const togglePlay = useCallback(() => {
    const next = !isPlaying;
    setIsPlaying(next);
    if (next) setBuildTool('select');
  }, [isPlaying, setIsPlaying, setBuildTool]);

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
    { id: 'save',    label: 'Save',                   icon: Save,   shortcut: '⌘S', onClick: () => {} },
    { id: 'publish', label: 'Publish to Marketplace', icon: Upload, shortcut: '⌘P', onClick: () => {} },
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
          <span className="hidden sm:inline">ProBlocks</span>
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

      {/* Right cluster: avatars + Share + Play + kebab */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <AvatarStack names={['Ms Alvarez', 'Jules Tran', 'Rosa Shah']} size={26} />

        <PBButton variant="secondary" size="sm" icon={Share2}>
          <span className="hidden sm:inline">Share</span>
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
    </div>
  );
}
