'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import { FolderOpen, MessageSquare, Settings, ChevronLeft, ChevronRight, ChevronDown, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStudio, type LeftPanelGroup } from '@/store/studio-store';
import { IconButton } from '@/components/ui';
import type { LucideIcon } from 'lucide-react';
import { AssetsPanel }   from './panels/AssetsPanel';
import { ChatPanel }     from './panels/ChatPanel';
import { SettingsPanel } from './panels/SettingsPanel';
import { ScenePanel }    from './panels/ScenePanel';

interface TabGroupDef {
  id: LeftPanelGroup;
  label: string;
  icon: LucideIcon;
}

const TAB_GROUPS: TabGroupDef[] = [
  { id: 'scene',    label: 'Scene',    icon: Layers },
  { id: 'assets',   label: 'Assets',   icon: FolderOpen },
  { id: 'chat',     label: 'Chat',     icon: MessageSquare },
  { id: 'settings', label: 'Settings', icon: Settings },
];

interface PanelContentProps {
  group: LeftPanelGroup;
  onSceneSelect?: (id: string) => void;
  onGameGenerated?: (html: string, files?: Record<string, string>) => void;
  activeGameName?: string | null;
}

function PanelContent({ group, onSceneSelect, onGameGenerated, activeGameName }: PanelContentProps) {
  switch (group) {
    case 'scene':    return <ScenePanel onSelect={onSceneSelect ?? (() => {})} />;
    case 'assets':   return <AssetsPanel />;
    case 'chat':     return <ChatPanel onGameGenerated={onGameGenerated} activeGameName={activeGameName} />;
    case 'settings': return <SettingsPanel />;
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

  return (
    <div className="shrink-0 flex items-center gap-1 px-2 py-1.5 border-b border-white/5">
      <IconButton icon={ChevronLeft} variant="ghost" size="sm" onClick={goPrev} tooltip="Previous panel" />

      <div ref={dropdownRef} className="relative flex-1 min-w-0">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-sm font-medium text-white hover:bg-panel-surface transition-colors"
        >
          <GroupIcon size={14} className="shrink-0 text-gray-400" />
          <span className="truncate">{groupDef.label}</span>
          <ChevronDown size={13} className={cn('shrink-0 text-gray-500 transition-transform duration-200', dropdownOpen && 'rotate-180')} />
        </button>

        {dropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 z-dropdown bg-panel-bg border border-white/10 rounded-xl shadow-2xl py-1">
            {TAB_GROUPS.map((group) => {
              const Icon = group.icon;
              const isActive = group.id === leftPanelActiveGroup;
              return (
                <button
                  key={group.id}
                  onClick={() => { setLeftPanelGroup(group.id); setDropdownOpen(false); }}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors',
                    isActive ? 'bg-accent/10 text-accent' : 'text-gray-400 hover:text-white hover:bg-panel-surface',
                  )}
                >
                  <Icon size={14} className="shrink-0" />
                  <span className="truncate">{group.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <IconButton icon={ChevronRight} variant="ghost" size="sm" onClick={goNext} tooltip="Next panel" />
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

interface LeftPanelProps {
  onSceneSelect?: (id: string) => void;
  onGameGenerated?: (html: string, files?: Record<string, string>) => void;
  activeGameName?: string | null;
}

export function LeftPanel({ onSceneSelect, onGameGenerated, activeGameName }: LeftPanelProps = {}) {
  const { leftPanelCollapsed, leftPanelActiveGroup } = useStudio();
  return (
    <aside className={cn('flex-shrink-0 overflow-visible transition-all duration-300', leftPanelCollapsed ? 'w-0' : 'w-[300px]')}>
      <div className={cn(
        'h-full flex flex-col bg-zinc-900/80 backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-visible transition-opacity duration-300',
        leftPanelCollapsed ? 'opacity-0 border-transparent' : '',
      )}>
        <MainGroupHeader />
        {!leftPanelCollapsed && (
          <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
            <PanelContent
              group={leftPanelActiveGroup}
              onSceneSelect={onSceneSelect}
              onGameGenerated={onGameGenerated}
              activeGameName={activeGameName}
            />
          </div>
        )}
      </div>
    </aside>
  );
}
