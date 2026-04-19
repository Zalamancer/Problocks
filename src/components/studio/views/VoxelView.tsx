'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { createVoxelEngine, HOTBAR, BLOCK_DEFS, TEXTURE_PACKS, DEFAULT_TEXTURE_PACK } from '@/lib/game-engine/voxel';

/**
 * Voxel (Minecraft-style) viewport. Mounts a standalone Three.js
 * engine on its own canvas. The engine is framework-free so it can
 * later ship as its own package — this component is just the React
 * shell that wires lifecycle + a minimal HUD.
 */
export function VoxelView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<ReturnType<typeof createVoxelEngine> | null>(null);
  const [hotbarIndex, setHotbarIndex] = useState(0);
  const [blockName, setBlockName] = useState('Grass');
  const [locked, setLocked] = useState(false);
  const [pack, setPack] = useState<string>(DEFAULT_TEXTURE_PACK);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = createVoxelEngine({ canvas, THREE, texturePack: pack });
    engine.setUIListener((s: { hotbarIndex: number; blockId: number; blockName: string }) => {
      setHotbarIndex(s.hotbarIndex);
      setBlockName(s.blockName);
    });
    engine.start();
    engineRef.current = engine;

    function onLockChange() {
      setLocked(document.pointerLockElement === canvas);
    }
    document.addEventListener('pointerlockchange', onLockChange);

    return () => {
      document.removeEventListener('pointerlockchange', onLockChange);
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  // Hot-swap the atlas when the user flips packs from the HUD — cheap
  // (single texture rebuild, no world remesh needed).
  useEffect(() => {
    engineRef.current?.setTexturePack?.(pack);
  }, [pack]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
        style={{ cursor: locked ? 'none' : 'crosshair', outline: 'none' }}
      />

      {/* Crosshair */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2"
        style={{
          transform: 'translate(-50%,-50%)',
          width: 14,
          height: 14,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 6,
            left: 0,
            right: 0,
            height: 2,
            background: 'rgba(255,255,255,0.9)',
            mixBlendMode: 'difference',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 6,
            top: 0,
            bottom: 0,
            width: 2,
            background: 'rgba(255,255,255,0.9)',
            mixBlendMode: 'difference',
          }}
        />
      </div>

      {/* Hotbar */}
      <div
        className="absolute bottom-3 left-1/2 flex items-center gap-1 p-1"
        style={{
          transform: 'translateX(-50%)',
          background: 'rgba(29,26,20,0.75)',
          border: '1.5px solid rgba(255,255,255,0.15)',
          borderRadius: 10,
        }}
      >
        {HOTBAR.map((id, i) => {
          const def = BLOCK_DEFS[id];
          const active = i === hotbarIndex;
          return (
            <div
              key={id}
              title={def?.name ?? `Block ${id}`}
              style={{
                width: 34,
                height: 34,
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                fontWeight: 700,
                color: active ? '#1d1a14' : 'rgba(255,255,255,0.85)',
                background: active ? '#f2c84a' : 'rgba(255,255,255,0.06)',
                border: active
                  ? '1.5px solid #1d1a14'
                  : '1.5px solid rgba(255,255,255,0.08)',
                boxShadow: active ? '0 1.5px 0 #1d1a14' : 'none',
                textAlign: 'center',
                lineHeight: 1.1,
                padding: 2,
              }}
            >
              <span>
                <span style={{ display: 'block', fontSize: 14 }}>{i + 1}</span>
                <span style={{ display: 'block', fontSize: 8, opacity: 0.7 }}>
                  {def?.name?.slice(0, 5) ?? ''}
                </span>
              </span>
            </div>
          );
        })}
      </div>

      {/* Texture pack toggle */}
      <div
        className="absolute top-3 right-3 flex items-center gap-1 p-1"
        style={{
          background: 'rgba(29,26,20,0.75)',
          border: '1.5px solid rgba(255,255,255,0.15)',
          borderRadius: 10,
        }}
      >
        {TEXTURE_PACKS.map((id) => {
          const active = id === pack;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setPack(id)}
              style={{
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'capitalize',
                color: active ? '#1d1a14' : 'rgba(255,255,255,0.85)',
                background: active ? '#f2c84a' : 'rgba(255,255,255,0.06)',
                border: active ? '1.5px solid #1d1a14' : '1.5px solid rgba(255,255,255,0.08)',
                cursor: 'pointer',
              }}
            >
              {id}
            </button>
          );
        })}
      </div>

      {/* Status / hint */}
      <div
        className="pointer-events-none absolute top-3 left-1/2"
        style={{
          transform: 'translateX(-50%)',
          padding: '6px 12px',
          borderRadius: 8,
          background: 'rgba(29,26,20,0.75)',
          border: '1.5px solid rgba(255,255,255,0.15)',
          fontSize: 12,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.9)',
        }}
      >
        {locked ? (
          <>
            <span>WASD move · Space up · Shift down · Left-click break · Right-click place · 1–9 pick ·{' '}
              <span style={{ color: '#f2c84a' }}>{blockName}</span> · Esc to free cursor
            </span>
          </>
        ) : (
          <span style={{ color: '#f2c84a' }}>Click the scene to start building</span>
        )}
      </div>
    </div>
  );
}
