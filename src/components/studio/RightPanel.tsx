'use client';
import { SlidersHorizontal, MessageSquare, Sparkles, Sun, Apple } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';
import { useStudio, type RightPanelGroup } from '@/store/studio-store';
import { useTile, type TileGroup } from '@/store/tile-store';
import { DropdownSectionHeader, type SectionDef } from './panels/DropdownSectionHeader';
import { ChatPanel } from './panels/ChatPanel';
import { PartStudioPanel } from './panels/PartStudioPanel';
import { WorkspacePropertiesPanel } from './panels/WorkspacePropertiesPanel';

const BASE_RIGHT_SECTIONS: readonly SectionDef[] = [
  { id: 'properties', icon: SlidersHorizontal, label: 'Properties' },
] as const;
const WORLD_SECTIONS: readonly SectionDef[] = [
  { id: 'workspace',  icon: Sun,               label: 'Workspace' },
  { id: 'chat',       icon: MessageSquare,     label: 'Chat' },
  { id: 'parts',      icon: Sparkles,          label: 'Part Studio' },
] as const;
const FRUITS_SECTION: SectionDef = { id: 'fruits', icon: Apple, label: 'Fruits' };

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

  // Fruits is conditional — appears in the dropdown ONLY when a tile-asset
  // member of a group named "Trees" is currently selected. Keeps the
  // pill-cycle short and contextual; non-tree assets never see it.
  const selectedAssetId = useTile((s) => s.selectedAssetId);
  const tileGroups = useTile((s) => s.tileGroups);
  const tileTool = useTile((s) => s.tool);
  const tileSelectedObjectId = useTile((s) => s.selectedObjectId);
  const showFruits = !!(selectedAssetId && Object.values(tileGroups as Record<string, TileGroup>).some(
    (g) => g.name.trim().toLowerCase() === 'trees' && g.assetIds.includes(selectedAssetId),
  ));

  // World sections (Workspace, Chat, Part Studio) only appear when the cursor
  // (select) tool is active and no object is selected — i.e. the world itself
  // is the focus.
  const showWorldSections = tileTool === 'select' && tileSelectedObjectId === null;

  // Order: Properties → Fruits (if shown) → [Workspace → Chat → Part Studio if world selected]
  const sections: SectionDef[] = [
    BASE_RIGHT_SECTIONS[0],
    ...(showFruits ? [FRUITS_SECTION] : []),
    ...(showWorldSections ? [...WORLD_SECTIONS] : []),
  ];

  // If the user navigates away from a tree-member while parked on Fruits,
  // bounce back to Properties so the panel doesn't render an empty state.
  useEffect(() => {
    if (!showFruits && group === 'fruits') setGroup('properties');
  }, [showFruits, group, setGroup]);

  // If world sections disappear while user is on one, bounce back to Properties.
  useEffect(() => {
    if (!showWorldSections && (group === 'workspace' || group === 'chat' || group === 'parts')) {
      setGroup('properties');
    }
  }, [showWorldSections, group, setGroup]);

  const activeIndex = sections.findIndex((s) => s.id === group);

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
          sections={sections}
          activeIndex={Math.max(activeIndex, 0)}
          onSelect={(i) => setGroup(sections[i].id as RightPanelGroup)}
        />
      </div>

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {group === 'properties' || group === 'fruits' ? (
          propertiesContent ?? <PropertiesEmpty />
        ) : group === 'workspace' ? (
          <WorkspacePropertiesPanel headless />
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
