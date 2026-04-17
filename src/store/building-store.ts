import { create } from 'zustand';
import { DEFAULT_PIECE, TILE, type PieceKind } from '@/lib/building-kit';

/**
 * Tile/edge building store with multi-level (Y) support.
 *
 * Anchor spaces (all keyed by level `y`):
 *   - floors:  tile centers  → key `${x},${y},${z}`
 *   - walls:   tile edges    → key `${x},${y},${z},${dir}` (dir ∈ 'N' | 'E')
 *   - roofs:   tile centers  → key `${x},${y},${z}`        (sit on wall band)
 *   - corners: tile corners  → key `${x},${y},${z}`        (vertex-based, 0..gridExtent inclusive)
 *   - stairs:  tile centers  → key `${x},${y},${z},${facing}`
 *
 * Level height in meters = WALL_HEIGHT * y.
 *
 * Canonicalization for wall edges (so each edge has exactly one key):
 *   N-edge of tile (x,y,z) is between (x,y,z) and (x,y,z-1).
 *   E-edge of tile (x,y,z) is between (x,y,z) and (x+1,y,z).
 */

export type Tool =
  | 'select'
  | 'part'
  | 'floor'
  | 'wall'
  | 'wall-window'
  | 'wall-door'
  | 'roof'
  | 'roof-corner'
  | 'corner'
  | 'stairs'
  | 'eraser';

export type EdgeDir = 'N' | 'E';
export type Facing = 'N' | 'S' | 'E' | 'W';

export interface Transform3 {
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  scale?: { x: number; y: number; z: number };
}
export interface Appearance {
  color?: string;
  roughness?: number;
  metalness?: number;
  emissiveColor?: string;
  emissiveIntensity?: number;
  castShadow?: boolean;
  visible?: boolean;
}
export interface FloorCell extends Transform3, Appearance { asset: string }
export interface WallEdge extends Transform3, Appearance { asset: string }
export interface RoofCell extends Transform3, Appearance { asset: string }
export interface CornerCell extends Transform3, Appearance { asset: string }
export interface StairsCell extends Transform3, Appearance { asset: string; facing: Facing }

export type FloorPatch  = Transform3 & Appearance & { asset?: string };
export type WallPatch   = Transform3 & Appearance & { asset?: string };
export type RoofPatch   = Transform3 & Appearance & { asset?: string };
export type CornerPatch = Transform3 & Appearance & { asset?: string };
export type StairsPatch = Transform3 & Appearance & { asset?: string; facing?: Facing };

export type BuildingSelection =
  | { kind: 'floor'  | 'wall' | 'roof' | 'corner' | 'stairs'; key: string }
  | null;

interface BuildingState {
  tool: Tool;
  setTool: (t: Tool) => void;

  /** Which level (0-based) new placements land on. */
  level: number;
  setLevel: (n: number) => void;

  /** Meters per tile. 2m matches common wall-piece widths. */
  gridSize: number;
  /** Grid spans −extent…+extent tiles on both axes. */
  gridExtent: number;

  /**
   * Global fillet radius (meters) applied at every junction where two
   * perpendicular wall edges share a vertex. 0 = sharp 90° corners
   * (legacy rendering via buildPiece). > 0 = walls are trimmed back
   * by `cornerBend` from the junction and a tangent quarter-arc bridges
   * the gap. Capped at TILE/2 = 1.0 (full quarter circle).
   */
  cornerBend: number;
  setCornerBend: (n: number) => void;

  /** Active piece id per kind — driven by the variant picker. */
  selectedPiece: Record<PieceKind, string>;
  setSelectedPiece: (kind: PieceKind, id: string) => void;

  floors:  Record<string, FloorCell>;
  walls:   Record<string, WallEdge>;
  roofs:   Record<string, RoofCell>;
  corners: Record<string, CornerCell>;
  stairs:  Record<string, StairsCell>;

  placeFloor:  (x: number, y: number, z: number, assetOverride?: string) => void;
  eraseFloor:  (x: number, y: number, z: number) => void;
  /** `kindOverride` forces wall kind regardless of current tool (used by AI agent). */
  placeWall:   (x: number, y: number, z: number, dir: EdgeDir, kindOverride?: 'wall' | 'wall-window' | 'wall-door', assetOverride?: string) => void;
  eraseWall:   (x: number, y: number, z: number, dir: EdgeDir) => void;
  placeRoof:   (x: number, y: number, z: number, assetOverride?: string) => void;
  eraseRoof:   (x: number, y: number, z: number) => void;
  /** `kindOverride` lets caller pick 'corner' vs 'roof-corner' without flipping the tool. */
  placeCorner: (x: number, y: number, z: number, kindOverride?: 'corner' | 'roof-corner', assetOverride?: string) => void;
  eraseCorner: (x: number, y: number, z: number) => void;
  placeStairs: (x: number, y: number, z: number, facing: Facing, assetOverride?: string) => void;
  eraseStairs: (x: number, y: number, z: number, facing: Facing) => void;

  updateFloorTransform:  (key: string, t: Transform3) => void;
  updateWallTransform:   (key: string, t: Transform3) => void;
  updateRoofTransform:   (key: string, t: Transform3) => void;
  updateCornerTransform: (key: string, t: Transform3) => void;
  updateStairsTransform: (key: string, t: Transform3) => void;

  updateFloor:  (key: string, patch: FloorPatch) => void;
  updateWall:   (key: string, patch: WallPatch) => void;
  updateRoof:   (key: string, patch: RoofPatch) => void;
  updateCorner: (key: string, patch: CornerPatch) => void;
  updateStairs: (key: string, patch: StairsPatch) => void;

  selection: BuildingSelection;
  setSelection: (s: BuildingSelection) => void;

  clear: () => void;
}

function del<T>(rec: Record<string, T>, key: string): Record<string, T> {
  if (!(key in rec)) return rec;
  const next = { ...rec };
  delete next[key];
  return next;
}

export const useBuildingStore = create<BuildingState>((set) => ({
  tool: 'floor',
  setTool: (tool) => set({ tool }),

  level: 0,
  setLevel: (level) => set({ level: Math.max(0, Math.floor(level)) }),

  /** Must match building-kit TILE so grid math in BuildingCanvas stays in sync. */
  gridSize: TILE,
  gridExtent: 10,

  cornerBend: 0,
  setCornerBend: (cornerBend) => set({ cornerBend: Math.max(0, Math.min(1.0, cornerBend)) }),

  selectedPiece: { ...DEFAULT_PIECE },
  setSelectedPiece: (kind, id) =>
    set((s) => ({ selectedPiece: { ...s.selectedPiece, [kind]: id } })),

  floors: {}, walls: {}, roofs: {}, corners: {}, stairs: {},

  // Every place* also sets the selection to the new piece so the right
  // panel opens automatically on insertion — user asked for the
  // "selected on insert" pattern.
  placeFloor: (x, y, z, assetOverride) =>
    set((s) => {
      const key = `${x},${y},${z}`;
      return {
        floors: { ...s.floors, [key]: { asset: assetOverride ?? s.selectedPiece.floor } },
        selection: { kind: 'floor', key },
      };
    }),
  eraseFloor: (x, y, z) =>
    set((s) => ({ floors: del(s.floors, `${x},${y},${z}`) })),

  placeWall: (x, y, z, dir, kindOverride, assetOverride) =>
    set((s) => {
      const kind =
        kindOverride ??
        (s.tool === 'wall-window' || s.tool === 'wall-door' ? s.tool : 'wall');
      const asset = assetOverride ?? s.selectedPiece[kind];
      const key = `${x},${y},${z},${dir}`;
      return {
        walls: { ...s.walls, [key]: { asset } },
        selection: { kind: 'wall', key },
      };
    }),
  eraseWall: (x, y, z, dir) =>
    set((s) => ({ walls: del(s.walls, `${x},${y},${z},${dir}`) })),

  placeRoof: (x, y, z, assetOverride) =>
    set((s) => {
      const key = `${x},${y},${z}`;
      return {
        roofs: { ...s.roofs, [key]: { asset: assetOverride ?? s.selectedPiece.roof } },
        selection: { kind: 'roof', key },
      };
    }),
  eraseRoof: (x, y, z) =>
    set((s) => ({ roofs: del(s.roofs, `${x},${y},${z}`) })),

  placeCorner: (x, y, z, kindOverride, assetOverride) =>
    set((s) => {
      const kind: PieceKind =
        kindOverride ?? (s.tool === 'roof-corner' ? 'roof-corner' : 'corner');
      const asset = assetOverride ?? s.selectedPiece[kind];
      const key = `${x},${y},${z}`;
      return {
        corners: { ...s.corners, [key]: { asset } },
        selection: { kind: 'corner', key },
      };
    }),
  eraseCorner: (x, y, z) =>
    set((s) => ({ corners: del(s.corners, `${x},${y},${z}`) })),

  placeStairs: (x, y, z, facing, assetOverride) =>
    set((s) => {
      const key = `${x},${y},${z},${facing}`;
      return {
        stairs: {
          ...s.stairs,
          [key]: { asset: assetOverride ?? s.selectedPiece.stairs, facing },
        },
        selection: { kind: 'stairs', key },
      };
    }),
  eraseStairs: (x, y, z, facing) =>
    set((s) => ({ stairs: del(s.stairs, `${x},${y},${z},${facing}`) })),

  updateFloorTransform:  (key, t) => set((s) => (s.floors[key]  ? { floors:  { ...s.floors,  [key]: { ...s.floors[key],  ...t } } } : s)),
  updateWallTransform:   (key, t) => set((s) => (s.walls[key]   ? { walls:   { ...s.walls,   [key]: { ...s.walls[key],   ...t } } } : s)),
  updateRoofTransform:   (key, t) => set((s) => (s.roofs[key]   ? { roofs:   { ...s.roofs,   [key]: { ...s.roofs[key],   ...t } } } : s)),
  updateCornerTransform: (key, t) => set((s) => (s.corners[key] ? { corners: { ...s.corners, [key]: { ...s.corners[key], ...t } } } : s)),
  updateStairsTransform: (key, t) => set((s) => (s.stairs[key]  ? { stairs:  { ...s.stairs,  [key]: { ...s.stairs[key],  ...t } } } : s)),

  updateFloor:  (key, patch) => set((s) => (s.floors[key]  ? { floors:  { ...s.floors,  [key]: { ...s.floors[key],  ...patch } } } : s)),
  updateWall:   (key, patch) => set((s) => (s.walls[key]   ? { walls:   { ...s.walls,   [key]: { ...s.walls[key],   ...patch } } } : s)),
  updateRoof:   (key, patch) => set((s) => (s.roofs[key]   ? { roofs:   { ...s.roofs,   [key]: { ...s.roofs[key],   ...patch } } } : s)),
  updateCorner: (key, patch) => set((s) => (s.corners[key] ? { corners: { ...s.corners, [key]: { ...s.corners[key], ...patch } } } : s)),
  updateStairs: (key, patch) => set((s) => (s.stairs[key]  ? { stairs:  { ...s.stairs,  [key]: { ...s.stairs[key],  ...patch } } } : s)),

  selection: null,
  setSelection: (selection) => set({ selection }),

  clear: () => set({ floors: {}, walls: {}, roofs: {}, corners: {}, stairs: {}, selection: null }),
}));
