'use client';
import {
  Square, Columns, Eraser, Trash2, MousePointer2,
  AppWindow, DoorOpen, Mountain, TriangleRight, Columns3, StepForward,
  ChevronUp, ChevronDown, Blocks,
} from 'lucide-react';
import { useBuildingStore, type Tool } from '@/store/building-store';
import { piecesByKind, type PieceDef, type PieceKind } from '@/lib/building-kit';
import {
  PanelActionButton,
  PanelSection,
} from '@/components/ui/panel-controls';

interface ToolDef {
  id: Tool;
  label: string;
  icon: typeof Square;
  /** Which piece-kind's variant grid to show. undefined = no grid. */
  pieceKind?: PieceKind;
}

const TOOLS: ToolDef[] = [
  { id: 'select',      label: 'Select',   icon: MousePointer2 },
  { id: 'floor',       label: 'Floor',    icon: Square,        pieceKind: 'floor' },
  { id: 'wall',        label: 'Wall',     icon: Columns,       pieceKind: 'wall' },
  { id: 'wall-window', label: 'Window',   icon: AppWindow,     pieceKind: 'wall-window' },
  { id: 'wall-door',   label: 'Door',     icon: DoorOpen,      pieceKind: 'wall-door' },
  { id: 'roof',        label: 'Roof',     icon: Mountain,      pieceKind: 'roof' },
  { id: 'roof-corner', label: 'Roof Cnr', icon: TriangleRight, pieceKind: 'roof-corner' },
  { id: 'corner',      label: 'Column',   icon: Columns3,      pieceKind: 'corner' },
  { id: 'stairs',      label: 'Stairs',   icon: StepForward,   pieceKind: 'stairs' },
  { id: 'part',        label: 'Part',     icon: Blocks },
  { id: 'eraser',      label: 'Eraser',   icon: Eraser },
];

function swatchStyle(hex: string): React.CSSProperties {
  return { background: hex };
}

function VariantGrid({
  kind,
  selectedId,
  onPick,
}: {
  kind: PieceKind;
  selectedId: string;
  onPick: (id: string) => void;
}) {
  const variants: PieceDef[] = piecesByKind(kind);
  return (
    <div className="grid grid-cols-2 gap-2">
      {variants.map((v) => {
        const active = v.id === selectedId;
        return (
          <button
            key={v.id}
            type="button"
            onClick={() => onPick(v.id)}
            className={[
              'group flex flex-col items-stretch gap-1.5 rounded-lg p-1.5 text-left transition-colors',
              active
                ? 'bg-green-500/15 border border-green-500/60 ring-1 ring-green-500/40'
                : 'bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10',
            ].join(' ')}
          >
            <div
              className="w-full aspect-square rounded-md"
              style={swatchStyle(v.swatch)}
              aria-hidden
            />
            <span
              className={[
                'text-[10px] leading-tight truncate',
                active ? 'text-green-300' : 'text-zinc-400 group-hover:text-zinc-200',
              ].join(' ')}
              title={v.label}
            >
              {v.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function BuildingToolbar() {
  const tool = useBuildingStore((s) => s.tool);
  const setTool = useBuildingStore((s) => s.setTool);
  const level = useBuildingStore((s) => s.level);
  const setLevel = useBuildingStore((s) => s.setLevel);
  const selectedPiece = useBuildingStore((s) => s.selectedPiece);
  const setSelectedPiece = useBuildingStore((s) => s.setSelectedPiece);
  const clear = useBuildingStore((s) => s.clear);

  const floorCount = Object.keys(useBuildingStore((s) => s.floors)).length;
  const wallCount = Object.keys(useBuildingStore((s) => s.walls)).length;
  const roofCount = Object.keys(useBuildingStore((s) => s.roofs)).length;
  const cornerCount = Object.keys(useBuildingStore((s) => s.corners)).length;
  const stairsCount = Object.keys(useBuildingStore((s) => s.stairs)).length;

  const activeDef = TOOLS.find((t) => t.id === tool);
  const activeKind = activeDef?.pieceKind;

  return (
    <aside className="w-72 shrink-0 flex flex-col bg-zinc-900/80 backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden">
      <header className="shrink-0 px-4 py-3 border-b border-white/5">
        <h2 className="text-sm font-semibold text-zinc-100">Build</h2>
        <p className="text-[11px] text-zinc-500 mt-0.5">
          Left-click places · Right-drag orbits · Middle-drag pans
        </p>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 flex flex-col gap-3">
        {/* Tool grid */}
        <PanelSection title="Tool" collapsible defaultOpen>
          <div className="grid grid-cols-3 gap-1.5">
            {TOOLS.map((t) => {
              const Icon = t.icon;
              const active = t.id === tool;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTool(t.id as Tool)}
                  className={[
                    'flex flex-col items-center gap-1 py-2 rounded-md text-[10px] border transition-colors',
                    active
                      ? 'bg-green-500/20 border-green-500/60 text-green-200'
                      : 'bg-white/[0.03] border-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06]',
                  ].join(' ')}
                  title={t.label}
                >
                  <Icon className="w-4 h-4" />
                  <span className="truncate w-full text-center">{t.label}</span>
                </button>
              );
            })}
          </div>
        </PanelSection>

        {/* Level selector */}
        <PanelSection title="Level" collapsible defaultOpen>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLevel(Math.max(0, level - 1))}
              className="flex-1 flex items-center justify-center py-1.5 rounded-md bg-white/[0.03] border border-white/5 text-zinc-300 hover:bg-white/[0.06]"
              aria-label="Lower level"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <div className="w-20 text-center text-sm font-mono tabular-nums text-zinc-100">
              L{level}
            </div>
            <button
              type="button"
              onClick={() => setLevel(level + 1)}
              className="flex-1 flex items-center justify-center py-1.5 rounded-md bg-white/[0.03] border border-white/5 text-zinc-300 hover:bg-white/[0.06]"
              aria-label="Higher level"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
          <p className="mt-1.5 text-[10px] text-zinc-500 leading-relaxed">
            Ground = L0. Each step raises placement by 3m (one wall-height).
          </p>
        </PanelSection>

        {/* Variant grid — shown when the active tool has a pieceKind */}
        {activeKind && (
          <PanelSection title={`${activeDef!.label} variants`} collapsible defaultOpen>
            <VariantGrid
              kind={activeKind}
              selectedId={selectedPiece[activeKind]}
              onPick={(id) => setSelectedPiece(activeKind, id)}
            />
          </PanelSection>
        )}

        <PanelSection title="Stats" collapsible defaultOpen={false}>
          <div className="rounded-lg border border-white/5 bg-white/[0.02] p-2 space-y-0.5 text-[11px] text-zinc-400">
            <div className="flex justify-between"><span>Floors</span><span className="text-zinc-200">{floorCount}</span></div>
            <div className="flex justify-between"><span>Walls</span><span className="text-zinc-200">{wallCount}</span></div>
            <div className="flex justify-between"><span>Roofs</span><span className="text-zinc-200">{roofCount}</span></div>
            <div className="flex justify-between"><span>Columns</span><span className="text-zinc-200">{cornerCount}</span></div>
            <div className="flex justify-between"><span>Stairs</span><span className="text-zinc-200">{stairsCount}</span></div>
          </div>
        </PanelSection>
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
