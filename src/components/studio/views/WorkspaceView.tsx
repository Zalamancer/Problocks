'use client';
import { BuildingCanvas } from '@/components/building/BuildingCanvas';
import { useBuildingStore } from '@/store/building-store';

/**
 * Studio workspace — the always-on 3D scene with baseplate. The modular-
 * building tool palette now lives in the left-panel "Build" tab; this view
 * just renders the canvas + a tiny status badge in the corner.
 */
export function WorkspaceView() {
  return (
    <div className="relative w-full h-full">
      <BuildingCanvas />
      <HintBadge />
    </div>
  );
}

function HintBadge() {
  const tool = useBuildingStore((s) => s.tool);
  const level = useBuildingStore((s) => s.level);
  const floors = useBuildingStore((s) => s.floors);
  const walls = useBuildingStore((s) => s.walls);
  const roofs = useBuildingStore((s) => s.roofs);
  const cornersRec = useBuildingStore((s) => s.corners);
  const stairsRec = useBuildingStore((s) => s.stairs);
  const floorCount = Object.keys(floors).length;
  const wallCount = Object.keys(walls).length;
  const extraCount =
    Object.keys(roofs).length + Object.keys(cornersRec).length + Object.keys(stairsRec).length;

  return (
    <div className="absolute bottom-3 left-3 z-10 px-3 py-1.5 rounded-lg bg-zinc-900/80 backdrop-blur-xl border border-white/10 text-[11px] text-zinc-300 flex items-center gap-3 pointer-events-none">
      <span>
        Tool: <span className="text-white font-medium capitalize">{tool}</span>
      </span>
      <span className="text-zinc-500">·</span>
      <span>L{level}</span>
      <span className="text-zinc-500">·</span>
      <span>{floorCount} tile{floorCount === 1 ? '' : 's'}</span>
      <span>{wallCount} wall{wallCount === 1 ? '' : 's'}</span>
      {extraCount > 0 && <span>{extraCount} extra</span>}
      <span className="text-zinc-500">· Right-drag orbit · Middle-drag pan</span>
    </div>
  );
}
