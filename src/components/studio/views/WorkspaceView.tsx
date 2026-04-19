'use client';
import {
  Square, Columns, Eraser, Trash2, MousePointer2, Box,
  AppWindow, DoorOpen, Mountain, TriangleRight, Columns3, StepForward,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { BuildingCanvas } from '@/components/building/BuildingCanvas';
import { useBuildingStore, type Tool } from '@/store/building-store';
import { useStudio } from '@/store/studio-store';
import { VoxelView } from './VoxelView';
import { QuizView } from './QuizView';

/**
 * Studio workspace — the always-on 3D scene with baseplate and a minimal
 * floating tool switcher. Piece variant picking now lives in the left-
 * panel Assets → Parts sub-tab (with 3D previews); Level + Bend live in
 * the right-panel Building section when a floor/wall is selected. This
 * toolbar only carries mode buttons + Clear so the viewport is never
 * without a way to switch between Select, Eraser, or drop the scene.
 */
export function WorkspaceView() {
  // Toolbar is placement-mode UX, so it only shows while the user is
  // actively browsing Assets → Parts. In every other left-panel context
  // (Scene, Models, Chat) the viewport stays uncluttered.
  const showToolbar = useStudio(
    (s) => s.leftPanelActiveGroup === 'assets' && s.assetsActiveTab === 'parts',
  );
  const gameSystem = useStudio((s) => s.gameSystem);

  // The voxel (Minecraft-style) system uses a completely different
  // engine — pointer-locked FPS camera, chunked meshing, raycast
  // place/break — so swap the whole viewport out when it's active.
  if (gameSystem === '3d-voxel') {
    return (
      <div className="relative w-full h-full">
        <VoxelView />
      </div>
    );
  }

  // Quiz mode is a completely non-3D experience — an AP Physics FRQ
  // runner. No canvas, no building tools, just the tap-through drill
  // and rubric-graded homework views.
  if (gameSystem === 'quiz') {
    return (
      <div className="relative w-full h-full">
        <QuizView />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <BuildingCanvas />
      {showToolbar && <FloatingBuildToolbar />}
      <HintBadge />
    </div>
  );
}

interface ToolDef {
  id: Tool;
  label: string;
  icon: LucideIcon;
}

const TOOLS: ToolDef[] = [
  { id: 'select',      label: 'Select / orbit',   icon: MousePointer2 },
  { id: 'part',        label: 'Part (block)',     icon: Box },
  { id: 'floor',       label: 'Floor',            icon: Square },
  { id: 'wall',        label: 'Wall',             icon: Columns },
  { id: 'wall-window', label: 'Window wall',      icon: AppWindow },
  { id: 'wall-door',   label: 'Door wall',        icon: DoorOpen },
  { id: 'roof',        label: 'Roof tile',        icon: Mountain },
  { id: 'roof-corner', label: 'Roof corner',      icon: TriangleRight },
  { id: 'corner',      label: 'Column / corner',  icon: Columns3 },
  { id: 'stairs',      label: 'Stairs',           icon: StepForward },
  { id: 'eraser',      label: 'Eraser',           icon: Eraser },
];

function FloatingBuildToolbar() {
  const tool = useBuildingStore((s) => s.tool);
  const setTool = useBuildingStore((s) => s.setTool);
  const clear = useBuildingStore((s) => s.clear);

  return (
    <div
      className="absolute top-3 left-3 z-10 flex items-center gap-1 p-1.5"
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        background: 'var(--pb-paper)',
        border: '1.5px solid var(--pb-ink)',
        borderRadius: 12,
        boxShadow: '0 3px 0 var(--pb-ink)',
      }}
    >
      {TOOLS.map(({ id, label, icon: Icon }) => {
        const active = tool === id;
        return (
          <button
            key={id}
            type="button"
            title={label}
            onClick={() => setTool(id)}
            className="flex items-center justify-center transition-colors"
            style={{
              height: 30,
              width: 30,
              borderRadius: 8,
              background: active ? 'var(--pb-butter)' : 'var(--pb-paper)',
              color: active ? 'var(--pb-butter-ink)' : 'var(--pb-ink-soft)',
              border: `1.5px solid ${active ? 'var(--pb-butter-ink)' : 'var(--pb-line-2)'}`,
              boxShadow: active ? '0 1.5px 0 var(--pb-butter-ink)' : 'none',
              cursor: 'pointer',
            }}
          >
            <Icon size={14} strokeWidth={2.2} />
          </button>
        );
      })}

      <div
        style={{ width: 1.5, height: 18, background: 'var(--pb-line-2)', margin: '0 2px' }}
      />

      <button
        type="button"
        title="Clear all"
        onClick={clear}
        className="flex items-center justify-center transition-colors"
        style={{
          height: 30,
          width: 30,
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
        <Trash2 size={14} strokeWidth={2.2} />
      </button>
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
    <div
      className="absolute bottom-3 left-3 z-10 flex items-center gap-2 pointer-events-none"
      style={{
        padding: '5px 12px',
        borderRadius: 10,
        background: 'var(--pb-paper)',
        border: '1.5px solid var(--pb-line-2)',
        fontSize: 11,
        color: 'var(--pb-ink-soft)',
        fontWeight: 500,
      }}
    >
      <span>
        Tool:{' '}
        <span
          className="capitalize"
          style={{ color: 'var(--pb-ink)', fontWeight: 700 }}
        >
          {tool}
        </span>
      </span>
      <span style={{ color: 'var(--pb-ink-muted)' }}>·</span>
      <span>L{level}</span>
      <span style={{ color: 'var(--pb-ink-muted)' }}>·</span>
      <span>{floorCount} tile{floorCount === 1 ? '' : 's'}</span>
      <span>{wallCount} wall{wallCount === 1 ? '' : 's'}</span>
      {extraCount > 0 && <span>{extraCount} extra</span>}
      <span style={{ color: 'var(--pb-ink-muted)' }}>
        · Right-drag orbit · Middle-drag pan
      </span>
    </div>
  );
}
