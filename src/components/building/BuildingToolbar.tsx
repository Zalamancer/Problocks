'use client';
import { Square, Columns, Eraser, Trash2 } from 'lucide-react';
import { useBuildingStore, type Tool } from '@/store/building-store';
import { PanelActionButton, PanelIconTabs } from '@/components/ui/panel-controls';

const TOOL_TABS: { id: Tool; label: string; icon: typeof Square }[] = [
  { id: 'floor', label: 'Floor', icon: Square },
  { id: 'wall', label: 'Wall', icon: Columns },
  { id: 'eraser', label: 'Eraser', icon: Eraser },
];

export function BuildingToolbar() {
  const tool = useBuildingStore((s) => s.tool);
  const setTool = useBuildingStore((s) => s.setTool);
  const clear = useBuildingStore((s) => s.clear);

  const floorCount = Object.keys(useBuildingStore((s) => s.floors)).length;
  const wallCount = Object.keys(useBuildingStore((s) => s.walls)).length;

  return (
    <aside className="w-60 shrink-0 flex flex-col bg-zinc-900/80 backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden">
      <header className="shrink-0 px-4 py-3 border-b border-white/5">
        <h2 className="text-sm font-semibold text-zinc-100">Build</h2>
        <p className="text-[11px] text-zinc-500 mt-0.5">
          Left-click places · Right-drag orbits · Middle-drag pans
        </p>
      </header>

      <PanelIconTabs
        tabs={TOOL_TABS.map((t) => ({ id: t.id, label: t.label, icon: t.icon }))}
        activeTab={tool}
        onChange={(id) => setTool(id as Tool)}
      />

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-3 text-[11px] text-zinc-400">
        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3 space-y-1">
          <div className="flex justify-between"><span>Tiles placed</span><span className="text-zinc-200">{floorCount}</span></div>
          <div className="flex justify-between"><span>Wall segments</span><span className="text-zinc-200">{wallCount}</span></div>
        </div>
        <p className="leading-relaxed text-zinc-500">
          Tool: <span className="text-zinc-300">{tool}</span>. Floors snap to tile centers, walls to tile edges.
          Corners and door/window cutouts come in the next slice.
        </p>
      </div>

      <footer className="shrink-0 px-3 py-3 border-t border-white/5">
        <PanelActionButton
          variant="destructive"
          icon={Trash2}
          fullWidth
          onClick={clear}
        >
          Clear All
        </PanelActionButton>
      </footer>
    </aside>
  );
}
