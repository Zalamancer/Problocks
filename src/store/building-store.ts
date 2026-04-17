import { create } from 'zustand';

/**
 * Bloxburg-style tile building store — first slice.
 * Three anchor spaces per level:
 *   - floors:  tile centers  → key `${x},${z}`
 *   - walls:   tile edges    → key `${x},${z},${dir}` where dir ∈ 'N' | 'E'
 *   - corners: tile corners  → key `${x},${z}`  (auto, added later)
 *
 * Canonicalization (so each edge has exactly one key):
 *   N-edge of tile (x,z) is between (x,z) and (x,z-1).
 *   E-edge of tile (x,z) is between (x,z) and (x+1,z).
 *   The S-edge of (x,z) is the N-edge of (x, z+1).
 *   The W-edge of (x,z) is the E-edge of (x-1, z).
 */

export type Tool = 'select' | 'part' | 'floor' | 'wall' | 'eraser';
export type EdgeDir = 'N' | 'E';

export interface Transform3 {
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  scale?: { x: number; y: number; z: number };
}
/** Optional appearance overrides for floors/walls — all default in rebuild. */
export interface Appearance {
  color?: string;
  roughness?: number;
  metalness?: number;
  emissiveColor?: string;
  emissiveIntensity?: number;
  castShadow?: boolean;
  visible?: boolean;
}
export interface FloorCell extends Transform3, Appearance {
  asset: string;
}
export interface WallEdge extends Transform3, Appearance {
  asset: string;
}

export type FloorPatch = Transform3 & Appearance & { asset?: string };
export type WallPatch = Transform3 & Appearance & { asset?: string };

export type BuildingSelection =
  | { kind: 'floor'; key: string }
  | { kind: 'wall'; key: string }
  | null;

interface BuildingState {
  tool: Tool;
  setTool: (t: Tool) => void;

  /** Meters per tile. 2m matches common GLB wall widths. */
  gridSize: number;
  /** Grid spans −extent…+extent tiles on both axes. */
  gridExtent: number;

  floorAsset: string;
  wallAsset: string;
  setFloorAsset: (a: string) => void;
  setWallAsset: (a: string) => void;

  floors: Record<string, FloorCell>;
  walls: Record<string, WallEdge>;

  placeFloor: (x: number, z: number) => void;
  eraseFloor: (x: number, z: number) => void;
  placeWall: (x: number, z: number, dir: EdgeDir) => void;
  eraseWall: (x: number, z: number, dir: EdgeDir) => void;

  /** Gizmo-writable transform overrides. If absent, grid placement is used. */
  updateFloorTransform: (key: string, t: Transform3) => void;
  updateWallTransform: (key: string, t: Transform3) => void;
  /** Generic patch — transform OR appearance OR both. */
  updateFloor: (key: string, patch: FloorPatch) => void;
  updateWall: (key: string, patch: WallPatch) => void;

  selection: BuildingSelection;
  setSelection: (s: BuildingSelection) => void;

  clear: () => void;
}

export const useBuildingStore = create<BuildingState>((set) => ({
  tool: 'floor',
  setTool: (tool) => set({ tool }),

  gridSize: 2,
  gridExtent: 10,

  floorAsset: 'Floor_WoodDark',
  wallAsset: 'Wall_Brick',
  setFloorAsset: (floorAsset) => set({ floorAsset }),
  setWallAsset: (wallAsset) => set({ wallAsset }),

  floors: {},
  walls: {},

  placeFloor: (x, z) =>
    set((s) => ({
      floors: { ...s.floors, [`${x},${z}`]: { asset: s.floorAsset } },
    })),
  eraseFloor: (x, z) =>
    set((s) => {
      const key = `${x},${z}`;
      if (!(key in s.floors)) return s;
      const next = { ...s.floors };
      delete next[key];
      return { floors: next };
    }),
  placeWall: (x, z, dir) =>
    set((s) => ({
      walls: { ...s.walls, [`${x},${z},${dir}`]: { asset: s.wallAsset } },
    })),
  eraseWall: (x, z, dir) =>
    set((s) => {
      const key = `${x},${z},${dir}`;
      if (!(key in s.walls)) return s;
      const next = { ...s.walls };
      delete next[key];
      return { walls: next };
    }),

  updateFloorTransform: (key, t) =>
    set((s) => {
      const cur = s.floors[key];
      if (!cur) return s;
      return { floors: { ...s.floors, [key]: { ...cur, ...t } } };
    }),
  updateWallTransform: (key, t) =>
    set((s) => {
      const cur = s.walls[key];
      if (!cur) return s;
      return { walls: { ...s.walls, [key]: { ...cur, ...t } } };
    }),
  updateFloor: (key, patch) =>
    set((s) => {
      const cur = s.floors[key];
      if (!cur) return s;
      return { floors: { ...s.floors, [key]: { ...cur, ...patch } } };
    }),
  updateWall: (key, patch) =>
    set((s) => {
      const cur = s.walls[key];
      if (!cur) return s;
      return { walls: { ...s.walls, [key]: { ...cur, ...patch } } };
    }),

  selection: null,
  setSelection: (selection) => set({ selection }),

  clear: () => set({ floors: {}, walls: {}, selection: null }),
}));
