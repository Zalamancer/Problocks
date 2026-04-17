'use client';
import {
  Square, Columns, Eraser, Trash2, MousePointer2, Box,
  AppWindow, DoorOpen, Mountain, TriangleRight, Columns3, StepForward,
  ChevronUp, ChevronDown,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { BuildingCanvas } from '@/components/building/BuildingCanvas';
import { useBuildingStore, type Tool } from '@/store/building-store';
import { piecesByKind, type PieceDef, type PieceKind } from '@/lib/building-kit';

/**
 * Studio workspace — the always-on 3D scene with baseplate and built-in
 * modular-building tools. Modeled after Roblox Studio's workspace.
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
  pieceKind?: PieceKind;
}

const TOOLS: ToolDef[] = [
  { id: 'select',      label: 'Select / orbit',   icon: MousePointer2 },
  { id: 'part',        label: 'Part (block)',     icon: Box },
  { id: 'floor',       label: 'Floor',            icon: Square,        pieceKind: 'floor' },
  { id: 'wall',        label: 'Wall',             icon: Columns,       pieceKind: 'wall' },
  { id: 'wall-window', label: 'Window wall',      icon: AppWindow,     pieceKind: 'wall-window' },
  { id: 'wall-door',   label: 'Door wall',        icon: DoorOpen,      pieceKind: 'wall-door' },
  { id: 'roof',        label: 'Roof tile',        icon: Mountain,      pieceKind: 'roof' },
  { id: 'roof-corner', label: 'Roof corner',      icon: TriangleRight, pieceKind: 'roof-corner' },
  { id: 'corner',      label: 'Column / corner',  icon: Columns3,      pieceKind: 'corner' },
  { id: 'stairs',      label: 'Stairs',           icon: StepForward,   pieceKind: 'stairs' },
  { id: 'eraser',      label: 'Eraser',           icon: Eraser },
];

function FloatingBuildToolbar() {
  const tool = useBuildingStore((s) => s.tool);
  const setTool = useBuildingStore((s) => s.setTool);
  const clear = useBuildingStore((s) => s.clear);
  const level = useBuildingStore((s) => s.level);
  const setLevel = useBuildingStore((s) => s.setLevel);
  const selectedPiece = useBuildingStore((s) => s.selectedPiece);
  const setSelectedPiece = useBuildingStore((s) => s.setSelectedPiece);
  const cornerBend = useBuildingStore((s) => s.cornerBend);
  const setCornerBend = useBuildingStore((s) => s.setCornerBend);

  const activeDef = TOOLS.find((t) => t.id === tool);
  const activeKind = activeDef?.pieceKind;
  const variants: PieceDef[] = activeKind ? piecesByKind(activeKind) : [];

  return (
    <div
      className="absolute top-3 left-3 z-10 flex flex-col gap-1.5"
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Main tool row + level + clear */}
      <div className="flex items-center gap-0.5 p-1 rounded-xl bg-zinc-900/90 backdrop-blur-xl border border-white/10 shadow-lg">
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

        {/* Level selector */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            title="Lower level"
            onClick={() => setLevel(Math.max(0, level - 1))}
            className="h-8 w-7 rounded-lg flex items-center justify-center text-zinc-300 hover:bg-white/10 hover:text-white"
          >
            <ChevronDown size={13} />
          </button>
          <div className="h-8 min-w-[34px] px-1 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[11px] font-mono tabular-nums text-zinc-100">
            L{level}
          </div>
          <button
            type="button"
            title="Higher level"
            onClick={() => setLevel(level + 1)}
            className="h-8 w-7 rounded-lg flex items-center justify-center text-zinc-300 hover:bg-white/10 hover:text-white"
          >
            <ChevronUp size={13} />
          </button>
        </div>

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

      {/* Corner-bend slider — global fillet radius applied at every
          perpendicular wall junction. 0 = sharp 90° corners, 1.0 = full
          quarter-circle (walls completely consumed by the arc). */}
      <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-zinc-900/90 backdrop-blur-xl border border-white/10 shadow-lg">
        <span className="text-[11px] text-zinc-400 shrink-0">Bend</span>
        <input
          type="range"
          min={0}
          max={1.0}
          step={0.05}
          value={cornerBend}
          onChange={(e) => setCornerBend(parseFloat(e.target.value))}
          className="w-32 h-1 accent-green-500 cursor-pointer"
          title="Wall corner bend radius (m). 0 = sharp, 1 = full quarter circle."
        />
        <span className="text-[11px] font-mono tabular-nums text-zinc-200 w-10 text-right">
          {cornerBend.toFixed(2)}m
        </span>
      </div>

      {/* Variant strip — shown whenever the active tool has variants */}
      {activeKind && (
        <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900/90 backdrop-blur-xl border border-white/10 shadow-lg max-w-[560px] overflow-x-auto">
          {variants.map((v) => {
            const active = v.id === selectedPiece[activeKind];
            return (
              <button
                key={v.id}
                type="button"
                title={v.label}
                onClick={() => setSelectedPiece(activeKind, v.id)}
                className={`shrink-0 flex items-center gap-1.5 h-8 px-2 rounded-lg border transition-colors text-[11px] ${
                  active
                    ? 'bg-green-500/20 border-green-500/60 text-green-200'
                    : 'bg-white/[0.03] border-white/5 text-zinc-300 hover:text-white hover:bg-white/[0.07]'
                }`}
              >
                <span
                  className="w-4 h-4 rounded border border-black/30"
                  style={{ background: v.swatch }}
                  aria-hidden
                />
                <span className="truncate max-w-[120px]">{v.label}</span>
              </button>
            );
          })}
        </div>
      )}
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
