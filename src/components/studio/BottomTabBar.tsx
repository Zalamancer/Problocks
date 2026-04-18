'use client';
import { Box, Kanban, Workflow, Settings, TerminalSquare } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useStudio, type ViewMode } from '@/store/studio-store';

// Bottom view-switcher tab strip — restyled with the design-bundle's chunky
// pastel/ink border aesthetic. Ported from the pill-pattern used in
// /tmp/design_bundle/problocks/project/studio/topbar.jsx (pipeline legend).

interface TabDef {
  id: ViewMode;
  label: string;
  icon: LucideIcon;
  shortcut: string;
}

const TABS: TabDef[] = [
  { id: '3d',       label: 'Studio 3D', icon: Box,      shortcut: '⌘3' },
  { id: 'kanban',   label: 'Kanban',    icon: Kanban,   shortcut: '⌘1' },
  { id: 'canvas',   label: 'Flowchart', icon: Workflow, shortcut: '⌘2' },
  { id: 'settings', label: 'Settings',  icon: Settings, shortcut: '' },
];

interface BottomTabBarProps {
  terminalOpen?: boolean;
  onToggleTerminal?: () => void;
}

export function BottomTabBar({ terminalOpen, onToggleTerminal }: BottomTabBarProps = {}) {
  const viewMode = useStudio((s) => s.viewMode);
  const setViewMode = useStudio((s) => s.setViewMode);

  return (
    <div
      className="shrink-0"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '6px 10px',
        background: 'var(--pb-paper)',
        borderTop: '1.5px solid var(--pb-line-2)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          padding: 2,
          borderRadius: 999,
          background: 'var(--pb-cream-2)',
          border: '1.5px solid var(--pb-line-2)',
        }}
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = tab.id === viewMode;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setViewMode(tab.id)}
              title={tab.shortcut ? `${tab.label} (${tab.shortcut})` : tab.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 12px',
                borderRadius: 999,
                background: active ? 'var(--pb-paper)' : 'transparent',
                color: active ? 'var(--pb-ink)' : 'var(--pb-ink-soft)',
                border: 0,
                boxShadow: active
                  ? '0 1px 2px rgba(29,26,20,0.08), inset 0 0 0 1.5px var(--pb-ink)'
                  : 'none',
                fontSize: 12,
                fontWeight: 600,
                fontFamily: 'inherit',
                cursor: 'pointer',
                transition: 'background 120ms ease',
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = 'var(--pb-paper)';
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = 'transparent';
              }}
            >
              <Icon size={13} strokeWidth={2.2} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {onToggleTerminal && (
        <button
          type="button"
          onClick={onToggleTerminal}
          title={`Terminal (${typeof navigator !== 'undefined' && navigator.platform.startsWith('Mac') ? '⌘J' : 'Ctrl+J'})`}
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 12px',
            borderRadius: 999,
            background: terminalOpen ? 'var(--pb-grape)' : 'transparent',
            color: terminalOpen ? 'var(--pb-grape-ink)' : 'var(--pb-ink-soft)',
            border: `1.5px solid ${terminalOpen ? 'var(--pb-grape-ink)' : 'var(--pb-line-2)'}`,
            boxShadow: terminalOpen ? '0 1.5px 0 var(--pb-grape-ink)' : 'none',
            fontSize: 12,
            fontWeight: 600,
            fontFamily: 'inherit',
            cursor: 'pointer',
            transition: 'background 120ms ease',
          }}
        >
          <TerminalSquare size={13} strokeWidth={2.2} />
          <span>Terminal</span>
        </button>
      )}
    </div>
  );
}
