'use client';
import { Box, Kanban, Workflow, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStudio, type ViewMode } from '@/store/studio-store';

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

export function BottomTabBar() {
  const viewMode = useStudio((s) => s.viewMode);
  const setViewMode = useStudio((s) => s.setViewMode);

  return (
    <div className="shrink-0 flex items-center gap-1 px-2 py-1.5 border-t border-white/5 bg-zinc-900/60">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const active = tab.id === viewMode;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setViewMode(tab.id)}
            title={tab.shortcut ? `${tab.label} (${tab.shortcut})` : tab.label}
            className={cn(
              'flex items-center gap-1.5 px-3 h-7 rounded-md text-xs font-medium transition-colors',
              active
                ? 'bg-white text-black'
                : 'text-zinc-400 hover:text-white hover:bg-panel-surface',
            )}
          >
            <Icon size={13} className="shrink-0" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
