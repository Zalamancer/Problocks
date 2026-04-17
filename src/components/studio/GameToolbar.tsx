'use client';
import { useEffect, useRef, useState } from 'react';
import { Plus, Copy, Trash2, ChevronDown } from 'lucide-react';
import { useSceneStore, type PartType } from '@/store/scene-store';
import type { GamePreviewHandle } from './GamePreview';

const PART_TYPES: { type: PartType; emoji: string }[] = [
  { type: 'Block',    emoji: '⬛' },
  { type: 'Sphere',   emoji: '🔵' },
  { type: 'Cylinder', emoji: '🔷' },
  { type: 'Wedge',    emoji: '◀' },
];

const PART_COLORS = ['#e84040','#40a0ff','#40cf40','#ffcc00','#ff8800','#cc40ff','#ff4088','#ffffff'];

interface Props {
  /** Optional — when a game iframe is active, toolbar actions are forwarded to
   *  it via postMessage. When null/unmounted, actions operate directly on the
   *  native scene store (Roblox-Studio-style live editor). */
  previewRef?: React.RefObject<GamePreviewHandle | null>;
}

export function GameToolbar({ previewRef }: Props) {
  const { selectedPart } = useSceneStore();
  const [addOpen, setAddOpen] = useState(false);
  const addRef = useRef<HTMLDivElement>(null);
  const [colorIdx, setColorIdx] = useState(0);

  useEffect(() => {
    if (!addOpen) return;
    const handler = (e: MouseEvent) => {
      if (addRef.current && !addRef.current.contains(e.target as Node)) setAddOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [addOpen]);

  /** True when a live game preview iframe is mounted. */
  const hasIframe = () => !!previewRef?.current;

  function addPart(type: PartType) {
    setAddOpen(false);
    const color = PART_COLORS[colorIdx % PART_COLORS.length];
    setColorIdx(i => i + 1);
    if (hasIframe()) {
      previewRef!.current!.addModel(type, 0, 1.5, 0);
      previewRef!.current!.sendToGame({ type: 'addPart', partType: type, color, x: 0, y: 1.5, z: 0 });
      return;
    }
    // Native editor: place part directly in the scene store; BuildingCanvas
    // will render it and auto-select so gizmo picks it up.
    useSceneStore.getState().addPart({
      partType: type,
      color,
      position: { x: 0, y: 1.5, z: 0 },
    });
  }

  function duplicate() {
    if (hasIframe()) {
      previewRef!.current!.sendToGame({ type: 'duplicatePart' });
      return;
    }
    const sp = useSceneStore.getState().selectedPart;
    if (!sp) return;
    useSceneStore.getState().addPart({
      partType: sp.partType,
      color: sp.color,
      position: { x: sp.position.x + 2, y: sp.position.y, z: sp.position.z + 2 },
      rotation: { ...sp.rotation },
      scale: { ...sp.scale },
      roughness: sp.roughness,
      metalness: sp.metalness,
      emissiveColor: sp.emissiveColor,
      emissiveIntensity: sp.emissiveIntensity,
      texture: sp.texture,
      castShadow: sp.castShadow,
      anchored: sp.anchored,
      visible: sp.visible,
      modelName: sp.modelName,
    });
  }

  function deletePart() {
    if (!selectedPart) return;
    if (hasIframe()) {
      previewRef!.current!.sendToGame({ type: 'removePart', id: selectedPart.id });
      return;
    }
    useSceneStore.getState().removePart(selectedPart.id);
  }

  return (
    <div className="shrink-0 flex items-center gap-1 px-2 py-1.5 bg-zinc-900/90 border-b border-white/[0.06]">
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
        aria-label="Duplicate"
        className="flex items-center justify-center w-7 h-7 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] disabled:opacity-30 disabled:pointer-events-none transition-all"
      >
        <Copy size={13} />
      </button>

      {/* Delete */}
      <button
        onClick={deletePart}
        disabled={!selectedPart}
        title="Delete"
        aria-label="Delete"
        className="flex items-center justify-center w-7 h-7 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 disabled:opacity-30 disabled:pointer-events-none transition-all"
      >
        <Trash2 size={13} />
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
