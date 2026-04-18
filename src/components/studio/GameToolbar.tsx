'use client';
import { useEffect, useRef, useState } from 'react';
import { Plus, Copy, Trash2, ChevronDown } from 'lucide-react';
import { useSceneStore, type PartType } from '@/store/scene-store';
import { useBuildingStore } from '@/store/building-store';
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
    // will render it and auto-select so gizmo picks it up. Gizmo is gated to
    // the Select tool, so flip the build tool to 'select' on insert — user's
    // intent on inserting a new primitive is to position/edit it, not place
    // more building pieces.
    useBuildingStore.getState().setTool('select');
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
    useBuildingStore.getState().setTool('select');
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
    <div
      className="shrink-0 flex items-center gap-1.5 px-2 py-1.5"
      style={{
        background: 'var(--pb-paper)',
        borderBottom: '1.5px solid var(--pb-line-2)',
      }}
    >
      {/* Add Part */}
      <div className="relative" ref={addRef}>
        <button
          onClick={() => setAddOpen(o => !o)}
          className="flex items-center gap-1.5 transition-colors"
          style={{
            padding: '4px 10px',
            borderRadius: 8,
            background: 'var(--pb-mint)',
            color: 'var(--pb-mint-ink)',
            border: '1.5px solid var(--pb-mint-ink)',
            boxShadow: '0 2px 0 var(--pb-mint-ink)',
            fontSize: 12,
            fontWeight: 700,
            fontFamily: 'inherit',
            cursor: 'pointer',
          }}
        >
          <Plus size={12} strokeWidth={2.4} />
          Part
          <ChevronDown size={11} strokeWidth={2.4} className={`transition-transform ${addOpen ? 'rotate-180' : ''}`} />
        </button>

        {addOpen && (
          <div
            className="absolute top-full left-0 mt-1 z-50 py-1"
            style={{
              minWidth: 130,
              background: 'var(--pb-paper)',
              border: '1.5px solid var(--pb-ink)',
              borderRadius: 12,
              boxShadow: '0 4px 0 var(--pb-ink), 0 12px 28px rgba(29,26,20,0.12)',
            }}
          >
            {PART_TYPES.map(pt => (
              <button
                key={pt.type}
                onClick={() => addPart(pt.type)}
                className="w-full flex items-center gap-2.5 transition-colors text-left"
                style={{
                  padding: '7px 12px',
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--pb-ink)',
                  background: 'transparent',
                  border: 0,
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--pb-cream-2)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
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
        className="flex items-center justify-center transition-colors disabled:opacity-40 disabled:pointer-events-none"
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: 'var(--pb-paper)',
          color: 'var(--pb-ink-soft)',
          border: '1.5px solid var(--pb-line-2)',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--pb-ink)';
          e.currentTarget.style.color = 'var(--pb-ink)';
          e.currentTarget.style.boxShadow = '0 1.5px 0 var(--pb-ink)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--pb-line-2)';
          e.currentTarget.style.color = 'var(--pb-ink-soft)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <Copy size={13} strokeWidth={2.2} />
      </button>

      {/* Delete */}
      <button
        onClick={deletePart}
        disabled={!selectedPart}
        title="Delete"
        aria-label="Delete"
        className="flex items-center justify-center transition-colors disabled:opacity-40 disabled:pointer-events-none"
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: 'var(--pb-paper)',
          color: 'var(--pb-coral-ink)',
          border: '1.5px solid var(--pb-line-2)',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--pb-coral)';
          e.currentTarget.style.borderColor = 'var(--pb-coral-ink)';
          e.currentTarget.style.boxShadow = '0 1.5px 0 var(--pb-coral-ink)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--pb-paper)';
          e.currentTarget.style.borderColor = 'var(--pb-line-2)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <Trash2 size={13} strokeWidth={2.2} />
      </button>

      {/* Selected part name badge */}
      {selectedPart && (
        <div
          className="ml-auto flex items-center gap-1.5"
          style={{
            padding: '3px 10px',
            borderRadius: 999,
            background: 'var(--pb-sky)',
            border: '1.5px solid var(--pb-sky-ink)',
            color: 'var(--pb-sky-ink)',
            fontSize: 11.5,
            fontWeight: 700,
          }}
        >
          <span
            className="animate-pulse"
            style={{
              width: 7,
              height: 7,
              borderRadius: 999,
              background: 'var(--pb-sky-ink)',
            }}
          />
          {selectedPart.name}
        </div>
      )}
    </div>
  );
}
