'use client';
import { Square, Columns, Eraser, Trash2, MousePointer2, Box, Play, Square as StopIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { BuildingCanvas } from '@/components/building/BuildingCanvas';
import { useBuildingStore, type Tool } from '@/store/building-store';
import { useSceneStore } from '@/store/scene-store';

/**
 * Studio workspace — the always-on 3D scene with baseplate and built-in
 * tile-building tools. Modeled after Roblox Studio's workspace: a default
 * world you can immediately place geometry into.
 */
export function WorkspaceView() {
  return (
    <div className="relative w-full h-full">
      <BuildingCanvas />
      <FloatingBuildToolbar />
      <FloatingPlayButton />
      <HintBadge />
    </div>
  );
}

function FloatingPlayButton() {
  const isPlaying = useSceneStore((s) => s.isPlaying);
  const setIsPlaying = useSceneStore((s) => s.setIsPlaying);
  const setTool = useBuildingStore((s) => s.setTool);

  function toggle() {
    const next = !isPlaying;
    setIsPlaying(next);
    if (next) setTool('select');
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title={isPlaying ? 'Stop' : 'Play'}
      className={`absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-xl backdrop-blur-xl border shadow-lg text-xs font-semibold transition-all ${
        isPlaying
          ? 'bg-red-500/20 border-red-500/40 text-red-200 hover:bg-red-500/30'
          : 'bg-green-500/20 border-green-500/40 text-green-200 hover:bg-green-500/30'
      }`}
    >
      {isPlaying ? <StopIcon size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
      {isPlaying ? 'Stop' : 'Play'}
    </button>
  );
}

interface ToolDef {
  id: Tool;
  label: string;
  icon: LucideIcon;
}

const TOOLS: ToolDef[] = [
  { id: 'select', label: 'Select / orbit', icon: MousePointer2 },
  { id: 'part',   label: 'Part (drop a block)', icon: Box },
  { id: 'floor',  label: 'Floor tile', icon: Square },
  { id: 'wall',   label: 'Wall segment', icon: Columns },
  { id: 'eraser', label: 'Eraser', icon: Eraser },
];

function FloatingBuildToolbar() {
  const tool = useBuildingStore((s) => s.tool);
  const setTool = useBuildingStore((s) => s.setTool);
  const clear = useBuildingStore((s) => s.clear);

  return (
    <div
      className="absolute top-3 left-3 z-10 flex items-center gap-0.5 p-1 rounded-xl bg-zinc-900/90 backdrop-blur-xl border border-white/10 shadow-lg"
      onMouseDown={(e) => e.stopPropagation()}
    >
      {TOOLS.map(({ id, label, icon: Icon }) => {
        const active = tool === id;
        return (
          <button
            key={id}
            type="button"
            title={label}
            onClick={() => setTool(id)}
            className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
              active
                ? 'bg-white text-black'
                : 'text-zinc-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Icon size={15} />
          </button>
        );
      })}
      <div className="w-px h-5 bg-white/10 mx-1" />
      <button
        type="button"
        title="Clear all"
        onClick={clear}
        className="h-8 w-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/15 hover:text-red-300 transition-colors"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

function HintBadge() {
  const tool = useBuildingStore((s) => s.tool);
  const floors = useBuildingStore((s) => s.floors);
  const walls = useBuildingStore((s) => s.walls);
  const floorCount = Object.keys(floors).length;
  const wallCount = Object.keys(walls).length;

  return (
    <div className="absolute bottom-3 left-3 z-10 px-3 py-1.5 rounded-lg bg-zinc-900/80 backdrop-blur-xl border border-white/10 text-[11px] text-zinc-300 flex items-center gap-3 pointer-events-none">
      <span>
        Tool: <span className="text-white font-medium capitalize">{tool}</span>
      </span>
      <span className="text-zinc-500">·</span>
      <span>
        {floorCount} tile{floorCount === 1 ? '' : 's'}
      </span>
      <span>
        {wallCount} wall{wallCount === 1 ? '' : 's'}
      </span>
      <span className="text-zinc-500">· Right-drag orbit · Middle-drag pan</span>
    </div>
  );
}
