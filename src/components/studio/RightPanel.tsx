'use client';
import { SlidersHorizontal, MessageSquare, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { useStudio, type RightPanelGroup } from '@/store/studio-store';
import { DropdownSectionHeader, type SectionDef } from './panels/DropdownSectionHeader';
import { ChatPanel } from './panels/ChatPanel';
import { PartStudioPanel } from './panels/PartStudioPanel';

const RIGHT_SECTIONS: readonly SectionDef[] = [
  { id: 'properties', icon: SlidersHorizontal, label: 'Properties' },
  { id: 'chat',       icon: MessageSquare,     label: 'Chat' },
  { id: 'parts',      icon: Sparkles,          label: 'Part Studio' },
] as const;

interface RightPanelProps {
  /** Context-aware content for the "Properties" tab. Render the matching
   *  property panel (Part/Workspace/Task/GeneratedFiles) in headless mode
   *  from the parent. If null, a placeholder is shown. */
  propertiesContent: ReactNode | null;
}

/**
 * Right-side aside shell with a dropdown tab header mirroring the LeftPanel
 * pattern. Tabs: Properties (context-aware), Chat, Part Studio. The aside
 * shell stays mounted regardless of which tab is active so switching feels
 * instant and the border chrome doesn't flicker.
 */
export function RightPanel({ propertiesContent }: RightPanelProps) {
  const group = useStudio((s) => s.rightPanelActiveGroup);
  const setGroup = useStudio((s) => s.setRightPanelGroup);

  const activeIndex = RIGHT_SECTIONS.findIndex((s) => s.id === group);

  return (
    <aside
      className="w-[300px] flex-shrink-0 h-full flex flex-col rounded-xl overflow-hidden"
      style={{
        background: 'var(--pb-paper)',
        border: '1.5px solid var(--pb-line-2)',
      }}
    >
      <div className="shrink-0" style={{ borderBottom: '1.5px solid var(--pb-line-2)' }}>
        <DropdownSectionHeader
          sections={RIGHT_SECTIONS}
          activeIndex={Math.max(activeIndex, 0)}
          onSelect={(i) => setGroup(RIGHT_SECTIONS[i].id as RightPanelGroup)}
        />
      </div>

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {group === 'properties' ? (
          propertiesContent ?? <PropertiesEmpty />
        ) : group === 'chat' ? (
          <ChatPanel />
        ) : (
          <PartStudioPanel />
        )}
      </div>
    </aside>
  );
}

function PropertiesEmpty() {
  return (
    <div
      className="flex-1 flex items-center justify-center text-center px-6"
      style={{ color: 'var(--pb-ink-muted)', fontSize: 12.5, fontWeight: 500 }}
    >
      Select a part, task, or file to view its properties.
    </div>
  );
}
