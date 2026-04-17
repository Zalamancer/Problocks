'use client';
import {
  Square, Columns, Eraser, Trash2, MousePointer2, Box,
  AppWindow, DoorOpen, Mountain, TriangleRight, Columns3, StepForward,
  ChevronUp, ChevronDown,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useBuildingStore, type Tool } from '@/store/building-store';
import type { PieceKind } from '@/lib/building-kit';

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

/**
 * BuildPanel — left-panel tab housing the modular-building tools that used
 * to live as a floating overlay above BuildingCanvas. Same controls, just
 * re-laid-out for a ~300px vertical column: tool icons wrap, variants stack
 * vertically, Bend slider full-width.
 */
export function BuildPanel() {
  const tool = useBuildingStore((s) => s.tool);
  const setTool = useBuildingStore((s) => s.setTool);
  const clear = useBuildingStore((s) => s.clear);
  const level = useBuildingStore((s) => s.level);
  const setLevel = useBuildingStore((s) => s.setLevel);
  const cornerBend = useBuildingStore((s) => s.cornerBend);
  const setCornerBend = useBuildingStore((s) => s.setCornerBend);

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-y-auto">
      {/* Tool grid */}
      <div className="px-3 py-3 border-b border-white/5">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2">Tools</div>
        <div className="grid grid-cols-6 gap-1">
          {TOOLS.map(({ id, label, icon: Icon }) => {
            const active = tool === id;
            return (
              <button
                key={id}
                type="button"
                title={label}
                onClick={() => setTool(id)}
                className={`h-9 rounded-lg flex items-center justify-center transition-colors ${
                  active
                    ? 'bg-white text-black'
                    : 'text-zinc-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={15} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Level + clear */}
      <div className="px-3 py-3 border-b border-white/5 flex items-center gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 shrink-0">Level</span>
        <div className="flex items-center gap-0.5 ml-auto">
          <button
            type="button"
            title="Lower level"
            onClick={() => setLevel(Math.max(0, level - 1))}
            className="h-8 w-7 rounded-lg flex items-center justify-center text-zinc-300 hover:bg-white/10 hover:text-white"
          >
            <ChevronDown size={13} />
          </button>
          <div className="h-8 min-w-[38px] px-2 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[11px] font-mono tabular-nums text-zinc-100">
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
        <button
          type="button"
          title="Clear all"
          onClick={clear}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/15 hover:text-red-300 transition-colors"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Corner-bend slider */}
      <div className="px-3 py-3 border-b border-white/5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Bend</span>
          <span className="text-[11px] font-mono tabular-nums text-zinc-200">
            {cornerBend.toFixed(2)}m
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={1.0}
          step={0.05}
          value={cornerBend}
          onChange={(e) => setCornerBend(parseFloat(e.target.value))}
          className="w-full h-1 accent-green-500 cursor-pointer"
          title="Wall corner bend radius (m). 0 = sharp, 1 = full quarter circle."
        />
      </div>

      {/* Variant picker moved to Assets → Parts sub-tab — clicking a part
          there sets tool + variant in one go. */}
      <div className="px-3 py-3 text-[11px] text-zinc-500 leading-relaxed">
        Pick a piece in <span className="text-zinc-300">Assets → Parts</span> to set
        the active tool and variant.
      </div>
    </div>
  );
}
