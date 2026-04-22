'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import { FolderOpen, ChevronLeft, ChevronRight, ChevronDown, Check, Layers, Zap, Library } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStudio, type LeftPanelGroup } from '@/store/studio-store';
import type { LucideIcon } from 'lucide-react';
import { AssetsPanel }       from './panels/AssetsPanel';
import { ScenePanel }        from './panels/ScenePanel';
import { ConnectorsPanel }   from './panels/ConnectorsPanel';
import { LibraryPanel }      from './panels/LibraryPanel';

interface TabGroupDef {
  id: LeftPanelGroup;
  label: string;
  icon: LucideIcon;
}

// Chat + Part Studio now live on the right panel's dropdown (see
// RightPanel.tsx). The left panel keeps the workspace-level navigators only.
const TAB_GROUPS: TabGroupDef[] = [
  { id: 'library',    label: 'My Games',    icon: Library },
  { id: 'scene',      label: 'Scene',       icon: Layers },
  { id: 'assets',     label: 'Assets',      icon: FolderOpen },
  { id: 'connectors', label: 'Connectors',  icon: Zap },
];

function PanelContent({ group, onSceneSelect }: { group: LeftPanelGroup; onSceneSelect?: (id: string) => void }) {
  // 'chat' and 'parts' were moved to the right panel — fall through to
  // Scene if a stale persisted value still points there.
  switch (group) {
    case 'library':    return <LibraryPanel />;
    case 'scene':      return <ScenePanel onSelect={onSceneSelect ?? (() => {})} />;
    case 'assets':     return <AssetsPanel />;
    case 'connectors': return <ConnectorsPanel />;
    default:           return <ScenePanel onSelect={onSceneSelect ?? (() => {})} />;
  }
}

function MainGroupHeader() {
  const { leftPanelActiveGroup, setLeftPanelGroup } = useStudio();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentIndex = TAB_GROUPS.findIndex((g) => g.id === leftPanelActiveGroup);
  const groupDef = TAB_GROUPS[currentIndex] ?? TAB_GROUPS[0];

  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  const goPrev = useCallback(() => {
    const prev = currentIndex <= 0 ? TAB_GROUPS.length - 1 : currentIndex - 1;
    setLeftPanelGroup(TAB_GROUPS[prev].id);
  }, [currentIndex, setLeftPanelGroup]);

  const goNext = useCallback(() => {
    const next = currentIndex >= TAB_GROUPS.length - 1 ? 0 : currentIndex + 1;
    setLeftPanelGroup(TAB_GROUPS[next].id);
  }, [currentIndex, setLeftPanelGroup]);

  const GroupIcon = groupDef.icon;

  // Pager-button style from /tmp/design_bundle2/problocks/project/studio/leftpanel.jsx → PagerBtn
  const pagerBtnStyle: React.CSSProperties = {
    width: 30,
    height: 30,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    background: 'var(--pb-paper)',
    border: '1.5px solid var(--pb-line-2)',
    color: 'var(--pb-ink-soft)',
    cursor: 'pointer',
  };

  return (
    <div
      className="shrink-0 relative"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '10px 12px',
        borderBottom: '1.5px solid var(--pb-line-2)',
      }}
    >
      <button type="button" onClick={goPrev} aria-label="Previous panel" style={pagerBtnStyle}>
        <ChevronLeft size={13} strokeWidth={2.4} />
      </button>

      <div ref={dropdownRef} style={{ flex: 1, position: 'relative', minWidth: 0 }}>
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '8px 10px',
            borderRadius: 10,
            background: dropdownOpen ? 'var(--pb-cream-2)' : 'var(--pb-paper)',
            border: `1.5px solid ${dropdownOpen ? 'var(--pb-ink)' : 'var(--pb-line-2)'}`,
            boxShadow: dropdownOpen ? '0 2px 0 var(--pb-ink)' : 'none',
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--pb-ink)',
            fontFamily: 'inherit',
            cursor: 'pointer',
            transition: 'background 120ms ease, border-color 120ms ease',
          }}
        >
          <GroupIcon size={14} strokeWidth={2.2} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {groupDef.label}
          </span>
          <ChevronDown
            size={11}
            strokeWidth={2.4}
            style={{
              color: 'var(--pb-ink-muted)',
              transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.15s',
              flexShrink: 0,
            }}
          />
        </button>

        {dropdownOpen && (
          <div
            className="z-dropdown"
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              background: 'var(--pb-paper)',
              border: '1.5px solid var(--pb-ink)',
              borderRadius: 12,
              boxShadow: '0 4px 0 var(--pb-ink), 0 12px 28px rgba(29,26,20,0.12)',
              padding: 6,
            }}
          >
            {TAB_GROUPS.map((group) => {
              const Icon = group.icon;
              const isActive = group.id === leftPanelActiveGroup;
              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => { setLeftPanelGroup(group.id); setDropdownOpen(false); }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '9px 10px',
                    borderRadius: 8,
                    background: isActive ? 'var(--pb-cream-2)' : 'transparent',
                    color: isActive ? 'var(--pb-mint-ink)' : 'var(--pb-ink)',
                    fontSize: 13,
                    fontWeight: isActive ? 700 : 500,
                    fontFamily: 'inherit',
                    textAlign: 'left',
                    border: 0,
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'var(--pb-cream-2)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <Icon
                    size={15}
                    strokeWidth={2.2}
                    style={{ color: isActive ? 'var(--pb-mint-ink)' : 'var(--pb-ink-muted)', flexShrink: 0 }}
                  />
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {group.label}
                  </span>
                  {isActive && <Check size={12} strokeWidth={2.6} style={{ color: 'var(--pb-mint-ink)', flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <button type="button" onClick={goNext} aria-label="Next panel" style={pagerBtnStyle}>
        <ChevronRight size={13} strokeWidth={2.4} />
      </button>
    </div>
  );
}

export function LeftPanelToggle() {
  const { leftPanelCollapsed, toggleLeftPanel } = useStudio();
  return (
    <button
      onClick={toggleLeftPanel}
      className="absolute top-1/2 -translate-y-1/2 z-20 w-5 h-10 bg-panel-surface hover:bg-panel-surface-hover rounded-r-lg flex items-center justify-center text-gray-500 hover:text-gray-200 transition-all duration-300"
      style={{ left: leftPanelCollapsed ? 0 : 288 }}
    >
      {leftPanelCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
    </button>
  );
}

export function LeftPanel({ onSceneSelect }: { onSceneSelect?: (id: string) => void } = {}) {
  const { leftPanelCollapsed, leftPanelActiveGroup } = useStudio();
  return (
    <aside className={cn('flex-shrink-0 overflow-visible transition-all duration-300', leftPanelCollapsed ? 'w-0' : 'w-[300px]')}>
      <div
        className={cn('h-full flex flex-col rounded-xl overflow-visible transition-opacity duration-300', leftPanelCollapsed ? 'opacity-0' : '')}
        style={{
          background: 'var(--pb-paper)',
          border: leftPanelCollapsed ? '1.5px solid transparent' : '1.5px solid var(--pb-line-2)',
        }}
      >
        <MainGroupHeader />
        {!leftPanelCollapsed && (
          <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
            <PanelContent group={leftPanelActiveGroup} onSceneSelect={onSceneSelect} />
          </div>
        )}
      </div>
    </aside>
  );
}
