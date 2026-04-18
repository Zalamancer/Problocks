'use client';
import { useEffect, useRef, useState } from 'react';
import { Plus, RotateCcw, Check, Boxes, Library } from 'lucide-react';
import { PIECES, DEFAULT_PIECE } from '@/lib/building-kit';
import type { PieceKind } from '@/lib/building-kit';
import { useBuildingStore } from '@/store/building-store';
import { useAIBuildModeStore, type BuildMode } from '@/store/ai-library-store';

/**
 * "+" drop-up above the chat input.
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
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center transition-colors relative"
        style={{
          height: 40,
          width: 40,
          borderRadius: 10,
          background: open ? 'var(--pb-cream-2)' : 'var(--pb-paper)',
          border: `1.5px solid ${open ? 'var(--pb-ink)' : 'var(--pb-line-2)'}`,
          boxShadow: open ? '0 2px 0 var(--pb-ink)' : 'none',
          color: open ? 'var(--pb-ink)' : 'var(--pb-ink-muted)',
          cursor: 'pointer',
        }}
        title={`AI build source: ${mode === 'assets' ? 'My assets' : 'Default blocks'}`}
        aria-label="Open AI build source picker"
      >
        <Plus
          size={18}
          strokeWidth={2.4}
          className={open ? 'rotate-45 transition-transform' : 'transition-transform'}
        />
      </button>

      {open && (
        <div
          className="absolute bottom-full left-0 mb-2 z-dropdown flex flex-col overflow-hidden"
          style={{
            width: 320,
            maxHeight: 420,
            background: 'var(--pb-paper)',
            border: '1.5px solid var(--pb-ink)',
            borderRadius: 14,
            boxShadow: '0 4px 0 var(--pb-ink), 0 16px 32px rgba(29,26,20,0.14)',
          }}
          role="dialog"
        >
          {/* Mode toggle */}
          <div
            className="shrink-0 px-3 py-2"
            style={{ borderBottom: '1.5px solid var(--pb-line-2)' }}
          >
            <div
              className="mb-1.5"
              style={{
                fontSize: 10,
                color: 'var(--pb-ink-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 700,
              }}
            >
              AI builds from
            </div>
            <div
              className="grid grid-cols-2 gap-1 p-1"
              style={{
                background: 'var(--pb-cream-2)',
                border: '1.5px solid var(--pb-line-2)',
                borderRadius: 10,
              }}
            >
              <ModeButton
                active={mode === 'defaults'}
                onClick={() => setMode('defaults')}
                icon={<Boxes size={13} strokeWidth={2.2} />}
                label="Default blocks"
                sub="Procedural pieces"
              />
              <ModeButton
                active={mode === 'assets'}
                onClick={() => setMode('assets')}
                icon={<Library size={13} strokeWidth={2.2} />}
                label="My assets"
                sub="Imported GLB models"
              />
            </div>
          </div>

          {mode === 'defaults' ? (
            <>
              {/* Sub-header */}
              <div
                className="shrink-0 px-3 py-2 flex items-center justify-between"
                style={{ borderBottom: '1.5px solid var(--pb-line-2)' }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: 'var(--pb-ink-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontWeight: 700,
                  }}
                >
                  Pin piece per kind (optional)
                </div>
                <button
                  type="button"
                  onClick={resetAllToDefaults}
                  className="flex items-center gap-1 transition-colors"
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: 'var(--pb-ink-muted)',
                    background: 'transparent',
                    border: 0,
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--pb-ink)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--pb-ink-muted)'; }}
                  title="Reset all kinds to defaults"
                >
                  <RotateCcw size={11} strokeWidth={2.2} />
                  Reset
                </button>
              </div>

              {/* Kind tabs */}
              <div
                className="shrink-0 px-2 py-2 overflow-x-auto"
                style={{ borderBottom: '1.5px solid var(--pb-line-2)' }}
              >
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
                        className="shrink-0 transition-colors"
                        style={{
                          padding: '4px 10px',
                          borderRadius: 8,
                          fontSize: 11,
                          fontWeight: 700,
                          fontFamily: 'inherit',
                          background: active ? 'var(--pb-mint)' : 'var(--pb-paper)',
                          color: active ? 'var(--pb-mint-ink)' : 'var(--pb-ink)',
                          border: `1.5px solid ${active ? 'var(--pb-mint-ink)' : 'var(--pb-line-2)'}`,
                          boxShadow: active ? '0 2px 0 var(--pb-mint-ink)' : 'none',
                          cursor: 'pointer',
                        }}
                      >
                        {label}
                        {!dflt && (
                          <span
                            className="ml-1"
                            style={{ fontSize: 9, color: 'var(--pb-coral-ink)' }}
                          >
                            ●
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Current + default toggle row */}
              <div
                className="shrink-0 px-3 py-2 flex items-center gap-2"
                style={{ borderBottom: '1.5px solid var(--pb-line-2)' }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: 'var(--pb-ink-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontWeight: 700,
                  }}
                >
                  Using
                </div>
                <div
                  className="truncate flex-1"
                  style={{
                    fontSize: 11.5,
                    fontFamily: 'DM Mono, monospace',
                    color: 'var(--pb-ink)',
                  }}
                  title={currentId}
                >
                  {currentId}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPiece(activeKind, defaultId)}
                  disabled={isAtDefault}
                  className="transition-colors"
                  style={{
                    padding: '2px 10px',
                    borderRadius: 8,
                    fontSize: 10,
                    fontWeight: 700,
                    fontFamily: 'inherit',
                    background: isAtDefault ? 'var(--pb-cream-2)' : 'var(--pb-paper)',
                    color: isAtDefault ? 'var(--pb-ink-muted)' : 'var(--pb-ink)',
                    border: `1.5px solid ${isAtDefault ? 'var(--pb-line-2)' : 'var(--pb-ink)'}`,
                    boxShadow: isAtDefault ? 'none' : '0 2px 0 var(--pb-ink)',
                    cursor: isAtDefault ? 'default' : 'pointer',
                  }}
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
                        className="relative group overflow-hidden transition-all aspect-square flex flex-col items-center justify-end"
                        style={{
                          borderRadius: 10,
                          border: `1.5px solid ${active ? 'var(--pb-ink)' : 'var(--pb-line-2)'}`,
                          boxShadow: active ? '0 2px 0 var(--pb-ink)' : 'none',
                          cursor: 'pointer',
                        }}
                        title={`${p.label}\n${p.id}${isDefault ? '\n(default)' : ''}`}
                      >
                        <div className="absolute inset-0" style={{ backgroundColor: p.swatch }} />
                        {active && (
                          <div
                            className="absolute top-1 right-1 flex items-center justify-center"
                            style={{
                              width: 16,
                              height: 16,
                              borderRadius: 999,
                              background: 'var(--pb-mint)',
                              border: '1.5px solid var(--pb-mint-ink)',
                            }}
                          >
                            <Check size={9} strokeWidth={3.2} style={{ color: 'var(--pb-mint-ink)' }} />
                          </div>
                        )}
                        {isDefault && !active && (
                          <div
                            className="absolute top-1 right-1"
                            style={{
                              padding: '1px 5px',
                              borderRadius: 6,
                              fontSize: 8,
                              fontWeight: 700,
                              background: 'var(--pb-paper)',
                              color: 'var(--pb-ink)',
                              border: '1.5px solid var(--pb-ink)',
                            }}
                          >
                            def
                          </div>
                        )}
                        <div
                          className="relative w-full px-1 py-0.5 truncate text-left"
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            background: 'var(--pb-paper)',
                            color: 'var(--pb-ink)',
                            borderTop: '1.5px solid var(--pb-line-2)',
                          }}
                        >
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
              <Library
                size={28}
                strokeWidth={2.2}
                className="mx-auto mb-2"
                style={{ color: 'var(--pb-grape-ink)' }}
              />
              <div
                className="mb-1"
                style={{ fontSize: 14, fontWeight: 700, color: 'var(--pb-ink)' }}
              >
                Using imported assets
              </div>
              <div
                className="leading-relaxed"
                style={{ fontSize: 12, color: 'var(--pb-ink-soft)' }}
              >
                The AI will build scenes using your GLB library from
                <span
                  className="mx-1"
                  style={{
                    fontFamily: 'DM Mono, monospace',
                    color: 'var(--pb-ink)',
                    fontWeight: 600,
                  }}
                >
                  /assets/medieval/
                </span>
                instead of procedural blocks.
              </div>
              <div
                className="mt-3"
                style={{ fontSize: 10, color: 'var(--pb-ink-muted)' }}
              >
                Switch back to{' '}
                <span style={{ color: 'var(--pb-ink)', fontWeight: 700 }}>
                  Default blocks
                </span>{' '}
                anytime.
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
      className="text-left transition-colors"
      style={{
        padding: '7px 11px',
        borderRadius: 8,
        background: active ? 'var(--pb-mint)' : 'transparent',
        color: active ? 'var(--pb-mint-ink)' : 'var(--pb-ink)',
        border: active ? '1.5px solid var(--pb-mint-ink)' : '1.5px solid transparent',
        boxShadow: active ? '0 2px 0 var(--pb-mint-ink)' : 'none',
        cursor: 'pointer',
      }}
    >
      <div
        className="flex items-center gap-1.5"
        style={{ fontSize: 11, fontWeight: 700 }}
      >
        {icon}
        {label}
      </div>
      <div
        className="mt-0.5"
        style={{
          fontSize: 9,
          fontWeight: 500,
          opacity: active ? 0.8 : 1,
          color: active ? 'var(--pb-mint-ink)' : 'var(--pb-ink-muted)',
        }}
      >
        {sub}
      </div>
    </button>
  );
}

export type { BuildMode };
