import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 2D Tile-based editor state. Two modes of authoring share the same canvas:
 *
 *   1. Tile painting — left-click stamps the active tile into the active
 *      layer's grid cell. Layers are dense 2D maps stored as a sparse
 *      `Record<"x,y", tileId>` so empty cells cost zero memory.
 *
 *   2. Free objects — sprite instances (props, decoration, NPCs, etc.) that
 *      sit at a free pixel position with their own scale + rotation, on top
 *      of any layer. Useful for things that shouldn't snap to the grid:
 *      trees, signposts, items.
 *
 * Tilesets are uploaded PNGs sliced via the slicer in `lib/tile-slicer.ts`;
 * the resulting `tiles[]` array of data URLs is what every layer / object
 * references by id. Persisting data URLs (rather than blob URLs) keeps the
 * editor working across reloads.
 */

export type TileTool =
  | 'select'
  | 'paint'
  | 'erase'
  | 'fill'
  | 'eyedropper'
  | 'object';

export interface Tile {
  id: string;
  /** Owning tileset id — so removing a tileset cleans up its tiles. */
  tilesetId: string;
  /** Index within the tileset (0..cols*rows-1, left-to-right, top-to-bottom). */
  index: number;
  /** PNG data URL — the actual sprite. */
  dataUrl: string;
  /** Pixel size of the sliced tile (matches the tileset's tile dims). */
  width: number;
  height: number;
}

export interface Tileset {
  id: string;
  name: string;
  /** Original sheet PNG data URL — kept so the user can re-slice with new dims. */
  sheetDataUrl: string;
  cols: number;
  rows: number;
  tileWidth: number;
  tileHeight: number;
  /** Tile ids in this tileset, in slice order. Not the tile objects themselves
   *  — those live in the global `tiles` map so cross-tileset lookups stay O(1). */
  tileIds: string[];
  addedAt: number;
}

export interface TileLayer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  /** Sparse map: "x,y" → tile id. Empty cells aren't stored. */
  cells: Record<string, string>;
}

export interface TileObject {
  id: string;
  layerId: string;
  /** World pixel position (center of the sprite). */
  x: number;
  y: number;
  /** Tile id this object renders. */
  tileId: string;
  /** Size in world pixels. Defaults to the tile's natural size. */
  width: number;
  height: number;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
  name: string;
}

export interface TileCamera {
  x: number;
  y: number;
  zoom: number;
}

export interface TileStore {
  // ── Asset library ───────────────────────────────────────────────
  tilesets: Tileset[];
  tiles: Record<string, Tile>;
  addTileset: (
    sheet: { name: string; sheetDataUrl: string; cols: number; rows: number; tileWidth: number; tileHeight: number; tiles: string[] },
  ) => string;
  removeTileset: (tilesetId: string) => void;

  // ── Map state ───────────────────────────────────────────────────
  /** Pixel size of one grid cell in the editor (independent of tile native size).
   *  Tiles are scaled to fit this size so a 16×16 tileset and a 32×32 tileset
   *  can coexist without one dwarfing the other. */
  tileSize: number;
  setTileSize: (size: number) => void;

  layers: TileLayer[];
  activeLayerId: string;
  addLayer: (name?: string) => void;
  removeLayer: (id: string) => void;
  renameLayer: (id: string, name: string) => void;
  toggleLayerVisibility: (id: string) => void;
  setLayerOpacity: (id: string, opacity: number) => void;
  reorderLayer: (id: string, direction: 'up' | 'down') => void;
  setActiveLayer: (id: string) => void;
  setCell: (layerId: string, x: number, y: number, tileId: string) => void;
  eraseCell: (layerId: string, x: number, y: number) => void;
  /** Bulk-mutate cells in a single update (paint stroke, fill, etc.). */
  mutateCells: (layerId: string, mutator: (cells: Record<string, string>) => void) => void;

  // ── Free objects (props on top of grid) ─────────────────────────
  objects: TileObject[];
  addObject: (obj: Omit<TileObject, 'id'>) => string;
  updateObject: (id: string, patch: Partial<TileObject>) => void;
  removeObject: (id: string) => void;
  selectedObjectId: string | null;
  selectObject: (id: string | null) => void;

  // ── Tools ──────────────────────────────────────────────────────
  tool: TileTool;
  setTool: (t: TileTool) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  selectedTileId: string | null;
  setSelectedTileId: (id: string | null) => void;

  // ── View ───────────────────────────────────────────────────────
  camera: TileCamera;
  setCamera: (cam: Partial<TileCamera>) => void;
  showGrid: boolean;
  toggleGrid: () => void;
  resetCamera: () => void;

  // ── Wholesale clear ─────────────────────────────────────────────
  clearMap: () => void;
}

function defaultLayer(name = 'Ground'): TileLayer {
  return {
    id: cryptoId(),
    name,
    visible: true,
    opacity: 1,
    cells: {},
  };
}

function cryptoId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `id-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

const INITIAL_LAYER = defaultLayer('Ground');

export const useTile = create<TileStore>()(persist((set, get) => ({
  tilesets: [],
  tiles: {},
  addTileset: ({ name, sheetDataUrl, cols, rows, tileWidth, tileHeight, tiles }) => {
    const tilesetId = cryptoId();
    const tileObjs: Tile[] = tiles.map((dataUrl, index) => ({
      id: cryptoId(),
      tilesetId,
      index,
      dataUrl,
      width: tileWidth,
      height: tileHeight,
    }));
    const tileIds = tileObjs.map((t) => t.id);
    set((s) => {
      const nextTiles: Record<string, Tile> = { ...s.tiles };
      for (const t of tileObjs) nextTiles[t.id] = t;
      return {
        tilesets: [...s.tilesets, {
          id: tilesetId,
          name,
          sheetDataUrl,
          cols, rows, tileWidth, tileHeight,
          tileIds,
          addedAt: Date.now(),
        }],
        tiles: nextTiles,
        // Auto-select the first tile of a freshly uploaded sheet so the
        // user can immediately start painting.
        selectedTileId: s.selectedTileId ?? tileIds[0] ?? null,
        tool: s.selectedTileId ? s.tool : 'paint',
      };
    });
    return tilesetId;
  },
  removeTileset: (tilesetId) => set((s) => {
    const ts = s.tilesets.find((t) => t.id === tilesetId);
    if (!ts) return {};
    const removeIds = new Set(ts.tileIds);
    const nextTiles: Record<string, Tile> = {};
    for (const [id, t] of Object.entries(s.tiles)) {
      if (!removeIds.has(id)) nextTiles[id] = t;
    }
    // Strip dead references from layer cells.
    const nextLayers = s.layers.map((l) => {
      const cells: Record<string, string> = {};
      for (const [k, tileId] of Object.entries(l.cells)) {
        if (!removeIds.has(tileId)) cells[k] = tileId;
      }
      return { ...l, cells };
    });
    const nextObjects = s.objects.filter((o) => !removeIds.has(o.tileId));
    const selectedTileId = s.selectedTileId && removeIds.has(s.selectedTileId)
      ? null
      : s.selectedTileId;
    return {
      tilesets: s.tilesets.filter((t) => t.id !== tilesetId),
      tiles: nextTiles,
      layers: nextLayers,
      objects: nextObjects,
      selectedTileId,
    };
  }),

  tileSize: 32,
  setTileSize: (size) => set({ tileSize: Math.max(4, Math.min(256, Math.round(size))) }),

  layers: [INITIAL_LAYER],
  activeLayerId: INITIAL_LAYER.id,
  addLayer: (name) => set((s) => {
    const layer = defaultLayer(name ?? `Layer ${s.layers.length + 1}`);
    return { layers: [...s.layers, layer], activeLayerId: layer.id };
  }),
  removeLayer: (id) => set((s) => {
    if (s.layers.length <= 1) return {};
    const layers = s.layers.filter((l) => l.id !== id);
    const activeLayerId = s.activeLayerId === id ? layers[0].id : s.activeLayerId;
    const objects = s.objects.filter((o) => o.layerId !== id);
    return { layers, activeLayerId, objects };
  }),
  renameLayer: (id, name) => set((s) => ({
    layers: s.layers.map((l) => l.id === id ? { ...l, name } : l),
  })),
  toggleLayerVisibility: (id) => set((s) => ({
    layers: s.layers.map((l) => l.id === id ? { ...l, visible: !l.visible } : l),
  })),
  setLayerOpacity: (id, opacity) => set((s) => ({
    layers: s.layers.map((l) => l.id === id ? { ...l, opacity: Math.max(0, Math.min(1, opacity)) } : l),
  })),
  reorderLayer: (id, direction) => set((s) => {
    const idx = s.layers.findIndex((l) => l.id === id);
    if (idx < 0) return {};
    const target = direction === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= s.layers.length) return {};
    const layers = s.layers.slice();
    const [layer] = layers.splice(idx, 1);
    layers.splice(target, 0, layer);
    return { layers };
  }),
  setActiveLayer: (id) => set({ activeLayerId: id }),
  setCell: (layerId, x, y, tileId) => set((s) => ({
    layers: s.layers.map((l) => {
      if (l.id !== layerId) return l;
      const key = `${x},${y}`;
      if (l.cells[key] === tileId) return l;
      return { ...l, cells: { ...l.cells, [key]: tileId } };
    }),
  })),
  eraseCell: (layerId, x, y) => set((s) => ({
    layers: s.layers.map((l) => {
      if (l.id !== layerId) return l;
      const key = `${x},${y}`;
      if (!(key in l.cells)) return l;
      const next = { ...l.cells };
      delete next[key];
      return { ...l, cells: next };
    }),
  })),
  mutateCells: (layerId, mutator) => set((s) => ({
    layers: s.layers.map((l) => {
      if (l.id !== layerId) return l;
      const next = { ...l.cells };
      mutator(next);
      return { ...l, cells: next };
    }),
  })),

  objects: [],
  addObject: (obj) => {
    const id = cryptoId();
    set((s) => ({ objects: [...s.objects, { ...obj, id }] }));
    return id;
  },
  updateObject: (id, patch) => set((s) => ({
    objects: s.objects.map((o) => o.id === id ? { ...o, ...patch } : o),
  })),
  removeObject: (id) => set((s) => ({
    objects: s.objects.filter((o) => o.id !== id),
    selectedObjectId: s.selectedObjectId === id ? null : s.selectedObjectId,
  })),
  selectedObjectId: null,
  selectObject: (id) => set({ selectedObjectId: id }),

  tool: 'paint',
  setTool: (t) => set({ tool: t }),
  brushSize: 1,
  setBrushSize: (size) => set({ brushSize: Math.max(1, Math.min(16, Math.round(size))) }),
  selectedTileId: null,
  setSelectedTileId: (id) => set({ selectedTileId: id }),

  camera: { x: 0, y: 0, zoom: 1 },
  setCamera: (cam) => set((s) => ({ camera: { ...s.camera, ...cam } })),
  showGrid: true,
  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
  resetCamera: () => set({ camera: { x: 0, y: 0, zoom: 1 } }),

  clearMap: () => set((s) => ({
    layers: s.layers.map((l) => ({ ...l, cells: {} })),
    objects: [],
  })),
}), {
  name: 'problocks-tile-v1',
  partialize: (s) => ({
    tilesets: s.tilesets,
    tiles: s.tiles,
    tileSize: s.tileSize,
    layers: s.layers,
    activeLayerId: s.activeLayerId,
    objects: s.objects,
    selectedTileId: s.selectedTileId,
    showGrid: s.showGrid,
  }),
  // Heal an empty / corrupted persisted state (e.g. user nuked layers).
  onRehydrateStorage: () => (state) => {
    if (!state) return;
    if (!state.layers || state.layers.length === 0) {
      const layer = defaultLayer();
      state.layers = [layer];
      state.activeLayerId = layer.id;
    } else if (!state.layers.find((l) => l.id === state.activeLayerId)) {
      state.activeLayerId = state.layers[0].id;
    }
  },
}));

/** Helper: parse "x,y" → {x, y}. */
export function parseCellKey(key: string): { x: number; y: number } {
  const [x, y] = key.split(',').map(Number);
  return { x, y };
}

export function cellKey(x: number, y: number): string {
  return `${x},${y}`;
}
