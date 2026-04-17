'use client';
import { useRef, useState } from 'react';
import {
  MousePointer2, Move3D, RotateCcw, Scale3D,
  Plus, Copy, Trash2, ChevronDown, Play, Square,
} from 'lucide-react';
import { useSceneStore, type GizmoMode, type PartType } from '@/store/scene-store';
import type { GamePreviewHandle } from './GamePreview';

const GIZMO_BUTTONS: { mode: GizmoMode; icon: React.ReactNode; label: string }[] = [
  { mode: 'select',  icon: <MousePointer2 size={13} />, label: 'Select' },
  { mode: 'move',    icon: <Move3D size={13} />,        label: 'Move' },
  { mode: 'rotate',  icon: <RotateCcw size={13} />,     label: 'Rotate' },
  { mode: 'scale',   icon: <Scale3D size={13} />,        label: 'Scale' },
];

const PART_TYPES: { type: PartType; emoji: string }[] = [
  { type: 'Block',    emoji: '⬛' },
  { type: 'Sphere',   emoji: '🔵' },
  { type: 'Cylinder', emoji: '🔷' },
  { type: 'Wedge',    emoji: '◀' },
];

const PART_COLORS = ['#e84040','#40a0ff','#40cf40','#ffcc00','#ff8800','#cc40ff','#ff4088','#ffffff'];

interface Props {
  previewRef: React.RefObject<GamePreviewHandle | null>;
}

export function GameToolbar({ previewRef }: Props) {
  const { gizmoMode, setGizmoMode, selectedPart, isPlaying, setIsPlaying } = useSceneStore();
  const [addOpen, setAddOpen] = useState(false);
  const addRef = useRef<HTMLDivElement>(null);
  const [colorIdx, setColorIdx] = useState(0);

  function switchMode(mode: GizmoMode) {
    setGizmoMode(mode);
    const gameMode = mode === 'select' ? 'none' : mode === 'move' ? 'translate' : mode;
    previewRef.current?.sendToGame({ type: 'setGizmoMode', mode: gameMode });
  }

  function addPart(type: PartType) {
    setAddOpen(false);
    const color = PART_COLORS[colorIdx % PART_COLORS.length];
    setColorIdx(i => i + 1);
    previewRef.current?.addModel(type, 0, 1.5, 0);
    // Also send color + type specifics
    previewRef.current?.sendToGame({ type: 'addPart', partType: type, color, x: 0, y: 1.5, z: 0 });
  }

  function duplicate() {
    previewRef.current?.sendToGame({ type: 'duplicatePart' });
  }

  function deletePart() {
    if (!selectedPart) return;
    previewRef.current?.sendToGame({ type: 'removePart', id: selectedPart.id });
  }

  function togglePlay() {
    const next = !isPlaying;
    setIsPlaying(next);
    if (next) {
      setGizmoMode('select');
      previewRef.current?.sendToGame({ type: 'setGizmoMode', mode: 'none' });
    }
    previewRef.current?.sendToGame({ type: 'setPlayMode', playing: next });
  }

  return (
    <div className="shrink-0 flex items-center gap-1 px-2 py-1.5 bg-zinc-900/90 border-b border-white/[0.06]">
      {/* Play / Stop */}
      <button
        onClick={togglePlay}
        title={isPlaying ? 'Stop' : 'Play'}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
          isPlaying
            ? 'bg-red-500/15 border border-red-500/30 text-red-300 hover:bg-red-500/25'
            : 'bg-green-500/15 border border-green-500/30 text-green-300 hover:bg-green-500/25'
        }`}
      >
        {isPlaying ? <Square size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
        <span className="hidden sm:inline">{isPlaying ? 'Stop' : 'Play'}</span>
      </button>

      <div className="w-px h-5 bg-white/[0.08] mx-1" />

      {/* Gizmo mode toggles */}
      <div className="flex items-center gap-0.5 bg-zinc-800/60 rounded-lg p-0.5">
        {GIZMO_BUTTONS.map(btn => (
          <button
            key={btn.mode}
            onClick={() => switchMode(btn.mode)}
            title={btn.label}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all ${
              gizmoMode === btn.mode
                ? 'bg-accent text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06]'
            }`}
          >
            {btn.icon}
            <span className="hidden sm:inline">{btn.label}</span>
          </button>
        ))}
      </div>

      <div className="w-px h-5 bg-white/[0.08] mx-1" />

      {/* Add Part */}
      <div className="relative" ref={addRef}>
        <button
          onClick={() => setAddOpen(o => !o)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-accent/10 border border-accent/25 text-accent hover:bg-accent/20 text-xs font-semibold transition-all"
        >
          <Plus size={12} />
          Part
          <ChevronDown size={11} className={`transition-transform ${addOpen ? 'rotate-180' : ''}`} />
        </button>

        {addOpen && (
          <div className="absolute top-full left-0 mt-1 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl py-1 z-50 min-w-[130px]">
            {PART_TYPES.map(pt => (
              <button
                key={pt.type}
                onClick={() => addPart(pt.type)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-200 hover:bg-white/[0.07] transition-colors text-left"
              >
                <span>{pt.emoji}</span>
                {pt.type}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Duplicate */}
      <button
        onClick={duplicate}
        disabled={!selectedPart}
        title="Duplicate"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] disabled:opacity-30 disabled:pointer-events-none transition-all"
      >
        <Copy size={12} />
        <span className="hidden sm:inline">Duplicate</span>
      </button>

      {/* Delete */}
      <button
        onClick={deletePart}
        disabled={!selectedPart}
        title="Delete part"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 disabled:opacity-30 disabled:pointer-events-none transition-all"
      >
        <Trash2 size={12} />
        <span className="hidden sm:inline">Delete</span>
      </button>

      {/* Selected part name badge */}
      {selectedPart && (
        <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          {selectedPart.name}
        </div>
      )}
    </div>
  );
}
