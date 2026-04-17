'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, RotateCcw, Check, Library as LibraryIcon, Palette } from 'lucide-react';
import { PIECES, DEFAULT_PIECE } from '@/lib/building-kit';
import type { PieceKind } from '@/lib/building-kit';
import { useBuildingStore } from '@/store/building-store';
import { useAILibraryStore } from '@/store/ai-library-store';
import { AssetThumbnail } from '@/components/studio/AssetThumbnail';

/**
 * "+" drop-up above the chat input. Two sub-tabs:
 *
 *   - Palette (procedural pieces) — pins a piece id per PieceKind into
 *     `selectedPiece`. The studio-agent uses these as fallback when an
 *     action omits "asset".
 *
 *   - Library (imported GLB models under /assets/medieval/) — per-asset
 *     enable toggle. Enabled names are sent to the agent so it can emit
 *     addPart with partType:"GLB" and modelName:"<name>".
 */

interface LibAsset {
  name: string;
  cat: string;
  tris: number;
  vertices: number;
  textures: number;
  materials: number;
  binKB: number;
}

const KIND_ORDER: { kind: PieceKind; label: string }[] = [
  { kind: 'floor',        label: 'Floors' },
  { kind: 'wall',         label: 'Walls' },
  { kind: 'wall-window',  label: 'Windows' },
  { kind: 'wall-door',    label: 'Doors' },
  { kind: 'roof',         label: 'Roofs' },
  { kind: 'roof-corner',  label: 'Roof Corners' },
  { kind: 'corner',       label: 'Corners' },
  { kind: 'stairs',       label: 'Stairs' },
];

type Tab = 'palette' | 'library';

export function ChatAssetPicker() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('palette');
  const [activeKind, setActiveKind] = useState<PieceKind>('floor');
  const [libCategory, setLibCategory] = useState<string>('all');
  const [libSearch, setLibSearch] = useState('');
  const [libAssets, setLibAssets] = useState<LibAsset[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);

  const selectedPiece = useBuildingStore((s) => s.selectedPiece);
  const setSelectedPiece = useBuildingStore((s) => s.setSelectedPiece);
  const libEnabled = useAILibraryStore((s) => s.enabled);
  const libToggle = useAILibraryStore((s) => s.toggle);
  const libSet = useAILibraryStore((s) => s.set);
  const libEnableAll = useAILibraryStore((s) => s.enableAll);
  const libClearAll = useAILibraryStore((s) => s.clearAll);

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Lazy-load library assets the first time Library tab opens
  useEffect(() => {
    if (tab !== 'library' || libAssets.length > 0) return;
    fetch('/assets/medieval/stats.json')
      .then((r) => r.json())
      .then((data: LibAsset[]) => setLibAssets(data))
      .catch(() => {});
  }, [tab, libAssets.length]);

  const piecesForActive = PIECES.filter((p) => p.kind === activeKind);
  const currentId = selectedPiece[activeKind];
  const defaultId = DEFAULT_PIECE[activeKind];
  const isAtDefault = currentId === defaultId;

  const libCategories = useMemo(() => {
    const set = new Set<string>();
    for (const a of libAssets) set.add(a.cat);
    return ['all', ...Array.from(set).sort()];
  }, [libAssets]);

  const libFiltered = useMemo(() => {
    const q = libSearch.trim().toLowerCase();
    return libAssets.filter(
      (a) =>
        (libCategory === 'all' || a.cat === libCategory) &&
        (!q || a.name.toLowerCase().includes(q)),
    );
  }, [libAssets, libCategory, libSearch]);

  const enabledCount = Object.values(libEnabled).filter(Boolean).length;

  function resetAllToDefaults() {
    for (const { kind } of KIND_ORDER) {
      setSelectedPiece(kind, DEFAULT_PIECE[kind]);
    }
  }

  return (
    <div ref={rootRef} className="relative shrink-0">
      {/* + toggle button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`h-10 w-10 rounded-lg flex items-center justify-center transition-colors border relative ${
          open
            ? 'bg-accent/15 border-accent/40 text-accent'
            : 'bg-panel-surface border-panel-border text-zinc-400 hover:bg-panel-surface-hover hover:text-zinc-200'
        }`}
        title="Palette / Library — pick assets for AI"
        aria-label="Open asset picker"
      >
        <Plus size={18} className={open ? 'rotate-45 transition-transform' : 'transition-transform'} />
        {enabledCount > 0 && !open && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-accent text-[9px] text-white flex items-center justify-center font-bold">
            {enabledCount}
          </span>
        )}
      </button>

      {/* Drop-up panel */}
      {open && (
        <div
          className="absolute bottom-full left-0 mb-2 w-[360px] max-h-[460px] bg-zinc-900/95 backdrop-blur-xl border border-panel-border rounded-xl shadow-2xl overflow-hidden z-dropdown flex flex-col"
          role="dialog"
        >
          {/* Top tabs: Palette | Library */}
          <div className="shrink-0 px-2 py-2 border-b border-white/5 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setTab('palette')}
              className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                tab === 'palette'
                  ? 'bg-accent text-white'
                  : 'bg-panel-surface text-zinc-300 hover:bg-panel-surface-hover'
              }`}
            >
              <Palette size={12} />
              Palette
            </button>
            <button
              type="button"
              onClick={() => setTab('library')}
              className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                tab === 'library'
                  ? 'bg-accent text-white'
                  : 'bg-panel-surface text-zinc-300 hover:bg-panel-surface-hover'
              }`}
            >
              <LibraryIcon size={12} />
              Library
              {enabledCount > 0 && (
                <span className="bg-white/20 rounded-full px-1.5 text-[9px]">{enabledCount}</span>
              )}
            </button>
          </div>

          {tab === 'palette' ? (
            <PaletteTab
              activeKind={activeKind}
              setActiveKind={setActiveKind}
              selectedPiece={selectedPiece}
              setSelectedPiece={setSelectedPiece}
              currentId={currentId}
              defaultId={defaultId}
              isAtDefault={isAtDefault}
              piecesForActive={piecesForActive}
              resetAllToDefaults={resetAllToDefaults}
            />
          ) : (
            <LibraryTab
              assets={libFiltered}
              categories={libCategories}
              category={libCategory}
              setCategory={setLibCategory}
              search={libSearch}
              setSearch={setLibSearch}
              enabled={libEnabled}
              toggle={libToggle}
              set={libSet}
              enableAllVisible={() => libEnableAll(libFiltered.map((a) => a.name))}
              clearAll={libClearAll}
              totalEnabled={enabledCount}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Palette tab (procedural pieces)
// ─────────────────────────────────────────────────────────────────────

function PaletteTab({
  activeKind,
  setActiveKind,
  selectedPiece,
  setSelectedPiece,
  currentId,
  defaultId,
  isAtDefault,
  piecesForActive,
  resetAllToDefaults,
}: {
  activeKind: PieceKind;
  setActiveKind: (k: PieceKind) => void;
  selectedPiece: Record<PieceKind, string>;
  setSelectedPiece: (k: PieceKind, id: string) => void;
  currentId: string;
  defaultId: string;
  isAtDefault: boolean;
  piecesForActive: typeof PIECES;
  resetAllToDefaults: () => void;
}) {
  return (
    <>
      {/* Sub-header */}
      <div className="shrink-0 px-3 py-2 border-b border-white/5 flex items-center justify-between">
        <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Piece defaults</div>
        <button
          type="button"
          onClick={resetAllToDefaults}
          className="text-[10px] text-zinc-400 hover:text-zinc-100 flex items-center gap-1"
          title="Reset all kinds to defaults"
        >
          <RotateCcw size={11} />
          Reset all
        </button>
      </div>

      {/* Kind tabs */}
      <div className="shrink-0 px-2 py-2 border-b border-white/5 overflow-x-auto">
        <div className="flex gap-1">
          {KIND_ORDER.map(({ kind, label }) => {
            const active = activeKind === kind;
            const sel = selectedPiece[kind];
            const dflt = sel === DEFAULT_PIECE[kind];
            return (
              <button
                key={kind}
                type="button"
                onClick={() => setActiveKind(kind)}
                className={`shrink-0 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors border ${
                  active
                    ? 'bg-accent text-white border-accent'
                    : 'bg-panel-surface text-zinc-300 border-panel-border hover:bg-panel-surface-hover'
                }`}
              >
                {label}
                {!dflt && <span className="ml-1 text-[9px] opacity-70">●</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current + default toggle row */}
      <div className="shrink-0 px-3 py-2 border-b border-white/5 flex items-center gap-2">
        <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Using</div>
        <div className="text-xs text-zinc-200 font-mono truncate flex-1" title={currentId}>
          {currentId}
        </div>
        <button
          type="button"
          onClick={() => setSelectedPiece(activeKind, defaultId)}
          disabled={isAtDefault}
          className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
            isAtDefault
              ? 'border-white/10 text-zinc-600 cursor-default'
              : 'border-panel-border text-zinc-300 hover:bg-panel-surface-hover'
          }`}
          title="Use the built-in default for this kind"
        >
          Default
        </button>
      </div>

      {/* Piece swatches */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        <div className="grid grid-cols-4 gap-1.5">
          {piecesForActive.map((p) => {
            const active = p.id === currentId;
            const isDefault = p.id === DEFAULT_PIECE[activeKind];
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPiece(activeKind, p.id)}
                className={`relative group rounded-lg border overflow-hidden transition-all aspect-square flex flex-col items-center justify-end ${
                  active
                    ? 'border-accent ring-1 ring-accent'
                    : 'border-panel-border hover:border-white/20'
                }`}
                title={`${p.label}\n${p.id}${isDefault ? '\n(default)' : ''}`}
              >
                <div className="absolute inset-0" style={{ backgroundColor: p.swatch }} />
                {active && (
                  <div className="absolute top-1 right-1 bg-accent rounded-full p-0.5 shadow">
                    <Check size={10} className="text-white" strokeWidth={3} />
                  </div>
                )}
                {isDefault && !active && (
                  <div className="absolute top-1 right-1 text-[8px] text-white/90 bg-black/50 px-1 rounded">
                    def
                  </div>
                )}
                <div className="relative w-full px-1 py-0.5 bg-black/60 backdrop-blur-sm text-[9px] text-white truncate text-left">
                  {p.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Library tab (imported GLB models)
// ─────────────────────────────────────────────────────────────────────

function LibraryTab({
  assets,
  categories,
  category,
  setCategory,
  search,
  setSearch,
  enabled,
  toggle,
  set,
  enableAllVisible,
  clearAll,
  totalEnabled,
}: {
  assets: LibAsset[];
  categories: string[];
  category: string;
  setCategory: (c: string) => void;
  search: string;
  setSearch: (s: string) => void;
  enabled: Record<string, boolean>;
  toggle: (name: string) => void;
  set: (name: string, on: boolean) => void;
  enableAllVisible: () => void;
  clearAll: () => void;
  totalEnabled: number;
}) {
  const allVisibleOn = assets.length > 0 && assets.every((a) => enabled[a.name]);

  return (
    <>
      {/* Sub-header */}
      <div className="shrink-0 px-3 py-2 border-b border-white/5 flex items-center justify-between gap-2">
        <div className="text-[10px] text-zinc-500 uppercase tracking-wider shrink-0">
          {totalEnabled} enabled for AI
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              if (allVisibleOn) {
                for (const a of assets) set(a.name, false);
              } else {
                enableAllVisible();
              }
            }}
            className="text-[10px] text-zinc-300 hover:text-zinc-100 px-1.5 py-0.5 rounded border border-panel-border hover:bg-panel-surface-hover"
          >
            {allVisibleOn ? 'Disable visible' : 'Enable visible'}
          </button>
          {totalEnabled > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="text-[10px] text-zinc-400 hover:text-red-400 px-1.5 py-0.5 rounded border border-panel-border hover:border-red-400/40"
              title="Disable all library assets for AI"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Search + category */}
      <div className="shrink-0 px-2 py-2 border-b border-white/5 space-y-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search models…"
          className="w-full bg-panel-surface text-xs text-zinc-200 px-2 py-1.5 rounded-md border border-panel-border focus:outline-none focus:border-accent/60"
        />
        <div className="flex gap-1 overflow-x-auto">
          {categories.map((c) => {
            const active = category === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`shrink-0 px-2 py-0.5 rounded text-[10px] capitalize border transition-colors ${
                  active
                    ? 'bg-accent text-white border-accent'
                    : 'bg-panel-surface text-zinc-300 border-panel-border hover:bg-panel-surface-hover'
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Asset grid */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {assets.length === 0 ? (
          <div className="py-6 text-center text-xs text-zinc-500">
            No matching assets
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1.5">
            {assets.map((a) => {
              const on = !!enabled[a.name];
              return (
                <button
                  key={a.name}
                  type="button"
                  onClick={() => toggle(a.name)}
                  className={`relative group rounded-lg border overflow-hidden transition-all aspect-square bg-panel-surface ${
                    on
                      ? 'border-accent ring-1 ring-accent'
                      : 'border-panel-border hover:border-white/20'
                  }`}
                  title={`${a.name}\n${a.cat} · ${a.tris} tris · ${a.binKB} KB\n${on ? 'AI can use this' : 'Click to enable for AI'}`}
                >
                  <AssetThumbnail modelName={a.name} fluid />
                  {on && (
                    <div className="absolute top-1 right-1 bg-accent rounded-full p-0.5 shadow">
                      <Check size={10} className="text-white" strokeWidth={3} />
                    </div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 px-1 py-0.5 bg-black/70 backdrop-blur-sm text-[9px] text-white truncate text-left">
                    {a.name.replace(/_/g, ' ')}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
