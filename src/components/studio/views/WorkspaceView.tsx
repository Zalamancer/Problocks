'use client';
import {
  Square, Columns, Eraser, Trash2, MousePointer2, Box,
  AppWindow, DoorOpen, Mountain, TriangleRight, Columns3, StepForward,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { BuildingCanvas } from '@/components/building/BuildingCanvas';
import { useBuildingStore, type Tool } from '@/store/building-store';

/**
 * Studio workspace — the always-on 3D scene with baseplate and a minimal
 * floating tool switcher. Piece variant picking now lives in the left-
 * panel Assets → Parts sub-tab (with 3D previews); Level + Bend live in
 * the right-panel Building section when a floor/wall is selected. This
 * toolbar only carries mode buttons + Clear so the viewport is never
 * without a way to switch between Select, Eraser, or drop the scene.
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
  id: Tool;
  label: string;
  icon: LucideIcon;
}

const TOOLS: ToolDef[] = [
  { id: 'select',      label: 'Select / orbit',   icon: MousePointer2 },
  { id: 'part',        label: 'Part (block)',     icon: Box },
  { id: 'floor',       label: 'Floor',            icon: Square },
  { id: 'wall',        label: 'Wall',             icon: Columns },
  { id: 'wall-window', label: 'Window wall',      icon: AppWindow },
  { id: 'wall-door',   label: 'Door wall',        icon: DoorOpen },
  { id: 'roof',        label: 'Roof tile',        icon: Mountain },
  { id: 'roof-corner', label: 'Roof corner',      icon: TriangleRight },
  { id: 'corner',      label: 'Column / corner',  icon: Columns3 },
  { id: 'stairs',      label: 'Stairs',           icon: StepForward },
  { id: 'eraser',      label: 'Eraser',           icon: Eraser },
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
        const active = tool === id;
        return (
          <button
            key={id}
            type="button"
            title={label}
            onClick={() => setTool(id)}
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
  const level = useBuildingStore((s) => s.level);
  const floors = useBuildingStore((s) => s.floors);
  const walls = useBuildingStore((s) => s.walls);
  const roofs = useBuildingStore((s) => s.roofs);
  const cornersRec = useBuildingStore((s) => s.corners);
  const stairsRec = useBuildingStore((s) => s.stairs);
  const floorCount = Object.keys(floors).length;
  const wallCount = Object.keys(walls).length;
  const extraCount =
    Object.keys(roofs).length + Object.keys(cornersRec).length + Object.keys(stairsRec).length;

  return (
    <div className="absolute bottom-3 left-3 z-10 px-3 py-1.5 rounded-lg bg-zinc-900/80 backdrop-blur-xl border border-white/10 text-[11px] text-zinc-300 flex items-center gap-3 pointer-events-none">
      <span>
        Tool: <span className="text-white font-medium capitalize">{tool}</span>
      </span>
      <span className="text-zinc-500">·</span>
      <span>L{level}</span>
      <span className="text-zinc-500">·</span>
      <span>{floorCount} tile{floorCount === 1 ? '' : 's'}</span>
      <span>{wallCount} wall{wallCount === 1 ? '' : 's'}</span>
      {extraCount > 0 && <span>{extraCount} extra</span>}
      <span className="text-zinc-500">· Right-drag orbit · Middle-drag pan</span>
    </div>
  );
}
