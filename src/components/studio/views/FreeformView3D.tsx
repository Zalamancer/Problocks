'use client';

import { useEffect, useRef } from 'react';
import { createKidEngine, type KidEngine } from '@/lib/kid-style-3d';

/**
 * 3D Freeform viewport — boots a kid-style Three.js scene (rounded
 * primitives, toon materials, hemi+key+fill+rim lighting, inverted-hull
 * outlines) on a canvas. The engine is framework-free; this component
 * is just the React lifecycle shell, mirroring the VoxelView pattern.
 *
 * Future commits wire:
 *  - Prefab palette drag-in from the left panel
 *  - Selection + transform gizmo
 *  - Right-panel property inspector (color / scale / rotation)
 *  - Scene save/load as JSON
 *  - Undo/redo
 */
export function FreeformView3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<KidEngine | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = createKidEngine({ canvas });
    engine.start();
    engineRef.current = engine;

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
        style={{ outline: 'none', cursor: 'default' }}
      />
      <HintBadge />
    </div>
  );
}

function HintBadge() {
  return (
    <div
      className="pointer-events-none absolute bottom-3 left-3 px-3 py-1.5 rounded-lg text-xs font-medium"
      style={{
        background: 'rgba(0,0,0,0.55)',
        color: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(6px)',
        letterSpacing: 0.2,
      }}
    >
      Drag to orbit · scroll to zoom · right-drag to pan
    </div>
  );
}
