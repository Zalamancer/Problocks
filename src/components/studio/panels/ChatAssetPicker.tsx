'use client';
import { useEffect, useRef, useState } from 'react';
import { Plus, RotateCcw, Check, Boxes, Library } from 'lucide-react';
import { PIECES, DEFAULT_PIECE } from '@/lib/building-kit';
import type { PieceKind } from '@/lib/building-kit';
import { useBuildingStore } from '@/store/building-store';
import { useAIBuildModeStore, type BuildMode } from '@/store/ai-library-store';

/**
 * "+" drop-up above the chat input.
 *
 * Top of the drop-up is a single mode toggle:
 *   - "Default blocks" → AI builds using procedural building-kit pieces.
 *   - "My assets"      → AI builds using the user's imported GLB library.
 *
 * Below the toggle, a per-kind palette lets the user pin a specific piece
 * id per kind (used only when mode === 'defaults').
 */

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

export function ChatAssetPicker() {
  const [open, setOpen] = useState(false);
  const [activeKind, setActiveKind] = useState<PieceKind>('floor');
  const rootRef = useRef<HTMLDivElement>(null);

  const selectedPiece = useBuildingStore((s) => s.selectedPiece);
  const setSelectedPiece = useBuildingStore((s) => s.setSelectedPiece);
  const mode = useAIBuildModeStore((s) => s.mode);
  const setMode = useAIBuildModeStore((s) => s.setMode);

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

  const piecesForActive = PIECES.filter((p) => p.kind === activeKind);
  const currentId = selectedPiece[activeKind];
  const defaultId = DEFAULT_PIECE[activeKind];
  const isAtDefault = currentId === defaultId;

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
        title={`AI build source: ${mode === 'assets' ? 'My assets' : 'Default blocks'}`}
        aria-label="Open AI build source picker"
      >
        <Plus size={18} className={open ? 'rotate-45 transition-transform' : 'transition-transform'} />
      </button>

      {/* Drop-up panel */}
      {open && (
        <div
          className="absolute bottom-full left-0 mb-2 w-[320px] max-h-[420px] bg-zinc-900/95 backdrop-blur-xl border border-panel-border rounded-xl shadow-2xl overflow-hidden z-dropdown flex flex-col"
          role="dialog"
        >
          {/* Mode toggle */}
          <div className="shrink-0 px-3 py-2 border-b border-white/5">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">
              AI builds from
            </div>
            <div className="grid grid-cols-2 gap-1 p-1 bg-panel-surface rounded-lg">
              <ModeButton
                active={mode === 'defaults'}
                onClick={() => setMode('defaults')}
                icon={<Boxes size={13} />}
                label="Default blocks"
                sub="Procedural pieces"
              />
              <ModeButton
                active={mode === 'assets'}
                onClick={() => setMode('assets')}
                icon={<Library size={13} />}
                label="My assets"
                sub="Imported GLB models"
              />
            </div>
          </div>

          {mode === 'defaults' ? (
            <>
              {/* Sub-header */}
              <div className="shrink-0 px-3 py-2 border-b border-white/5 flex items-center justify-between">
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">
                  Pin piece per kind (optional)
                </div>
                <button
                  type="button"
                  onClick={resetAllToDefaults}
                  className="text-[10px] text-zinc-400 hover:text-zinc-100 flex items-center gap-1"
                  title="Reset all kinds to defaults"
                >
                  <RotateCcw size={11} />
                  Reset
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
          ) : (
            <div className="flex-1 overflow-y-auto px-4 py-5 text-center">
              <Library size={28} className="mx-auto text-accent mb-2" />
              <div className="text-sm text-zinc-200 font-medium mb-1">
                Using imported assets
              </div>
              <div className="text-xs text-zinc-400 leading-relaxed">
                The AI will build scenes using your GLB library from
                <span className="mx-1 font-mono text-zinc-300">/assets/medieval/</span>
                instead of procedural blocks.
              </div>
              <div className="text-[10px] text-zinc-500 mt-3">
                Switch back to <span className="text-zinc-300">Default blocks</span>
                {' '}anytime.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  icon,
  label,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 rounded-md text-left transition-colors ${
        active
          ? 'bg-accent text-white shadow'
          : 'text-zinc-300 hover:bg-panel-surface-hover'
      }`}
    >
      <div className="flex items-center gap-1.5 text-[11px] font-semibold">
        {icon}
        {label}
      </div>
      <div className={`text-[9px] mt-0.5 ${active ? 'text-white/75' : 'text-zinc-500'}`}>
        {sub}
      </div>
    </button>
  );
}

// Re-export for callers that want to read mode alongside the picker
export type { BuildMode };
