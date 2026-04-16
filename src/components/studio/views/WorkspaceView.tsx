'use client';
import { Square, Columns, Eraser, Trash2, MousePointer2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { BuildingCanvas } from '@/components/building/BuildingCanvas';
import { useBuildingStore, type Tool } from '@/store/building-store';

/**
 * Studio workspace — the always-on 3D scene with baseplate and built-in
 * tile-building tools. Modeled after Roblox Studio's workspace: a default
 * world you can immediately place geometry into.
 */
export function WorkspaceView() {
  return (
    <div className="relative w-full h-full">
      <BuildingCanvas />
      <FloatingBuildToolbar />
      <HintBadge />
    </div>
  );
}

interface ToolDef {
  id: Tool | 'select';
  label: string;
  icon: LucideIcon;
}

const TOOLS: ToolDef[] = [
  { id: 'select', label: 'Select (orbit only)', icon: MousePointer2 },
  { id: 'floor', label: 'Floor', icon: Square },
  { id: 'wall', label: 'Wall', icon: Columns },
  { id: 'eraser', label: 'Eraser', icon: Eraser },
];

function FloatingBuildToolbar() {
  const tool = useBuildingStore((s) => s.tool);
  const setTool = useBuildingStore((s) => s.setTool);
  const clear = useBuildingStore((s) => s.clear);

  return (
    <div
      className="absolute top-3 left-3 z-10 flex items-center gap-0.5 p-1 rounded-xl bg-zinc-900/90 backdrop-blur-xl border border-white/10 shadow-lg"
      onMouseDown={(e) => e.stopPropagation()}
    >
      {TOOLS.map(({ id, label, icon: Icon }) => {
        const active = id !== 'select' && tool === id;
        return (
          <button
            key={id}
            type="button"
            title={label}
            onClick={() => {
              if (id === 'select') return; // orbit-only mode — future: disable raycaster
              setTool(id);
            }}
            className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
              active
                ? 'bg-white text-black'
                : 'text-zinc-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Icon size={15} />
          </button>
        );
      })}
      <div className="w-px h-5 bg-white/10 mx-1" />
      <button
        type="button"
        title="Clear all"
        onClick={clear}
        className="h-8 w-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/15 hover:text-red-300 transition-colors"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

function HintBadge() {
  const tool = useBuildingStore((s) => s.tool);
  const floors = useBuildingStore((s) => s.floors);
  const walls = useBuildingStore((s) => s.walls);
  const floorCount = Object.keys(floors).length;
  const wallCount = Object.keys(walls).length;

  return (
    <div className="absolute bottom-3 left-3 z-10 px-3 py-1.5 rounded-lg bg-zinc-900/80 backdrop-blur-xl border border-white/10 text-[11px] text-zinc-300 flex items-center gap-3 pointer-events-none">
      <span>
        Tool: <span className="text-white font-medium capitalize">{tool}</span>
      </span>
      <span className="text-zinc-500">·</span>
      <span>
        {floorCount} tile{floorCount === 1 ? '' : 's'}
      </span>
      <span>
        {wallCount} wall{wallCount === 1 ? '' : 's'}
      </span>
      <span className="text-zinc-500">· Right-drag orbit · Middle-drag pan</span>
    </div>
  );
}
