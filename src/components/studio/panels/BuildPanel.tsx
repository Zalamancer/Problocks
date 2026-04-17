'use client';
import {
  Square, Columns, Eraser, Trash2, MousePointer2, Box,
  AppWindow, DoorOpen, Mountain, TriangleRight, Columns3, StepForward,
  ChevronUp, ChevronDown,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useBuildingStore, type Tool } from '@/store/building-store';
import { piecesByKind, type PieceDef, type PieceKind } from '@/lib/building-kit';

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
  const selectedPiece = useBuildingStore((s) => s.selectedPiece);
  const setSelectedPiece = useBuildingStore((s) => s.setSelectedPiece);
  const cornerBend = useBuildingStore((s) => s.cornerBend);
  const setCornerBend = useBuildingStore((s) => s.setCornerBend);

  const activeDef = TOOLS.find((t) => t.id === tool);
  const activeKind = activeDef?.pieceKind;
  const variants: PieceDef[] = activeKind ? piecesByKind(activeKind) : [];

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

      {/* Variant list — shown whenever the active tool has variants */}
      {activeKind && (
        <div className="px-3 py-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-2 capitalize">
            {activeKind.replace('-', ' ')} variants
          </div>
          <div className="flex flex-col gap-1">
            {variants.map((v) => {
              const active = v.id === selectedPiece[activeKind];
              return (
                <button
                  key={v.id}
                  type="button"
                  title={v.label}
                  onClick={() => setSelectedPiece(activeKind, v.id)}
                  className={`flex items-center gap-2 h-8 px-2 rounded-lg border transition-colors text-[12px] ${
                    active
                      ? 'bg-green-500/20 border-green-500/60 text-green-200'
                      : 'bg-white/[0.03] border-white/5 text-zinc-300 hover:text-white hover:bg-white/[0.07]'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded border border-black/30 shrink-0"
                    style={{ background: v.swatch }}
                    aria-hidden
                  />
                  <span className="truncate">{v.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
