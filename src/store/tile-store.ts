import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Quadrant } from '@/lib/wang-tiles';

/**
 * 2D Tile-based editor state — Wang/dual-grid auto-tiling.
 *
 * Two complementary authoring modes share the same canvas:
 *
 *   1. Wang painting — each layer carries a single 4×4 Wang tileset (one
 *      "upper" + one "lower" texture + 14 transitions). The user paints
 *      cells; the renderer reads each cell's 4 surrounding corners and
 *      auto-picks the matching tile from the layer's tileset. There is no
 *      manual tile selection — that's the whole point of the system.
 *
 *      Storage: per layer, a sparse `corners: Record<"x,y", true>` map.
 *      Painting cell (cx, cy) sets the 4 corners (cx,cy), (cx+1,cy),
 *      (cx,cy+1), (cx+1,cy+1). Erasing clears them.
 *
 *   2. Free objects — sprite instances (props, decoration) sitting at a
 *      free pixel position with their own scale + rotation, on top of any
 *      layer. These DO need a manual tile pick, since each object refers
 *      to one specific tile by id.
 *
 * Tilesets are uploaded PNGs sliced via `lib/tile-slicer.ts` into 16 tile
 * data URLs (one per quadrant pattern). Persisting data URLs (rather than
 * blob URLs) keeps the editor working across reloads.
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
  /** Pixel size of the sliced tile. */
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
  /** Tile ids in this tileset, in slice order. */
  tileIds: string[];
  addedAt: number;
  /** Server-side row id (Supabase) once this sheet has been saved. Lets us
   *  DELETE remotely when the user removes the tileset, and de-dupe on
   *  hydrate. Absent for not-yet-saved or anonymous sessions where the
   *  save call failed. */
  cloudId?: string;
}

export interface TileLayer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  /** Tileset used for Wang painting on this layer. null = no painting yet. */
  tilesetId: string | null;
  /**
   * Sparse map of painted corners. Key "cx,cy" → 'u' (upper texture) or 'l'
   * (lower texture). Absent = transparent (cell renders nothing if all 4 of
   * its corners are absent). The renderer derives the visible Wang tile by
   * reading 4 corners and looking up the (NW,NE,SW,SE) pattern.
   */
  corners: Record<string, Quadrant>;
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
    sheet: { name: string; sheetDataUrl: string; cols: number; rows: number; tileWidth: number; tileHeight: number; tiles: string[]; cloudId?: string },
  ) => string;
  removeTileset: (tilesetId: string) => void;
  setTilesetCloudId: (tilesetId: string, cloudId: string) => void;

  // ── Map state ───────────────────────────────────────────────────
  /** Pixel size of one grid cell in the editor (independent of tile native
   *  size). Tiles are scaled to fit so 16×16 and 32×32 sheets look the same
   *  size on the canvas. */
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
  /** Assign a tileset to a layer (the texture used for Wang painting). */
  setLayerTileset: (layerId: string, tilesetId: string | null) => void;
  /** Bulk-mutate corners in a single update (paint stroke, fill, etc.). */
  mutateCorners: (layerId: string, mutator: (corners: Record<string, Quadrant>) => void) => void;

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
  /** Which texture the paint tool lays down — 'u' (upper) or 'l' (lower).
   *  Erase always clears the corner regardless of this. */
  brushTexture: Quadrant;
  setBrushTexture: (t: Quadrant) => void;
  /** Used only by the OBJECT tool — pick a tile to drop as a free sprite.
   *  Wang painting ignores this; it uses the active layer's tilesetId. */
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
    tilesetId: null,
    corners: {},
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
  addTileset: ({ name, sheetDataUrl, cols, rows, tileWidth, tileHeight, tiles, cloudId }) => {
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
      // Auto-bind the new tileset to the active layer if it doesn't have one
      // yet — that way "upload then click on canvas" Just Works without
      // requiring an extra selection step.
      const activeLayer = s.layers.find((l) => l.id === s.activeLayerId);
      const nextLayers = activeLayer && !activeLayer.tilesetId
        ? s.layers.map((l) => l.id === s.activeLayerId ? { ...l, tilesetId } : l)
        : s.layers;
      return {
        tilesets: [...s.tilesets, {
          id: tilesetId,
          name,
          sheetDataUrl,
          cols, rows, tileWidth, tileHeight,
          tileIds,
          addedAt: Date.now(),
          cloudId,
        }],
        tiles: nextTiles,
        layers: nextLayers,
        // The first tile of the new sheet becomes the default object-tool sprite
        // so the user can immediately switch to Object tool and drop props.
        selectedTileId: s.selectedTileId ?? tileIds[0] ?? null,
      };
    });
    return tilesetId;
  },
  setTilesetCloudId: (tilesetId, cloudId) => set((s) => ({
    tilesets: s.tilesets.map((t) => t.id === tilesetId ? { ...t, cloudId } : t),
  })),
  removeTileset: (tilesetId) => set((s) => {
    const ts = s.tilesets.find((t) => t.id === tilesetId);
    if (!ts) return {};
    const removeIds = new Set(ts.tileIds);
    const nextTiles: Record<string, Tile> = {};
    for (const [id, t] of Object.entries(s.tiles)) {
      if (!removeIds.has(id)) nextTiles[id] = t;
    }
    // Detach this tileset from any layer that's painting with it. The corner
    // data sticks around so re-assigning a different tileset re-uses it.
    const nextLayers = s.layers.map((l) =>
      l.tilesetId === tilesetId ? { ...l, tilesetId: null } : l,
    );
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
  setLayerTileset: (layerId, tilesetId) => set((s) => ({
    layers: s.layers.map((l) => l.id === layerId ? { ...l, tilesetId } : l),
  })),
  mutateCorners: (layerId, mutator) => set((s) => ({
    layers: s.layers.map((l) => {
      if (l.id !== layerId) return l;
      const next = { ...l.corners };
      mutator(next);
      return { ...l, corners: next };
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
  brushTexture: 'u',
  setBrushTexture: (t) => set({ brushTexture: t }),
  selectedTileId: null,
  setSelectedTileId: (id) => set({ selectedTileId: id }),

  camera: { x: 0, y: 0, zoom: 1 },
  setCamera: (cam) => set((s) => ({ camera: { ...s.camera, ...cam } })),
  showGrid: true,
  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
  resetCamera: () => set({ camera: { x: 0, y: 0, zoom: 1 } }),

  clearMap: () => set((s) => ({
    layers: s.layers.map((l) => ({ ...l, corners: {} })),
    objects: [],
  })),
}), {
  // v3 — bumped from v2 (corner value: true → 'u'|'l'), so old persisted
  // maps are dropped. Painting now lays down either the upper or the lower
  // texture instead of just toggling on/off.
  name: 'problocks-tile-v3',
  partialize: (s) => ({
    tilesets: s.tilesets,
    tiles: s.tiles,
    tileSize: s.tileSize,
    layers: s.layers,
    activeLayerId: s.activeLayerId,
    objects: s.objects,
    selectedTileId: s.selectedTileId,
    brushTexture: s.brushTexture,
    showGrid: s.showGrid,
  }),
  // Heal an empty / corrupted persisted state.
  onRehydrateStorage: () => (state) => {
    if (!state) return;
    if (!state.layers || state.layers.length === 0) {
      const layer = defaultLayer();
      state.layers = [layer];
      state.activeLayerId = layer.id;
    } else if (!state.layers.find((l) => l.id === state.activeLayerId)) {
      state.activeLayerId = state.layers[0].id;
    }
    // Forward-compat: ensure every layer has a corners map (older shapes had
    // a `cells` field instead, which we silently drop).
    for (const l of state.layers) {
      if (!l.corners) l.corners = {};
      if (l.tilesetId === undefined) l.tilesetId = null;
    }
  },
}));

/** Helper: parse "x,y" → {x, y}. */
export function parseCornerKey(key: string): { x: number; y: number } {
  const [x, y] = key.split(',').map(Number);
  return { x, y };
}

export function cornerKey(x: number, y: number): string {
  return `${x},${y}`;
}

/**
 * Compute the four corner coords (NE, NW, SW, SE) for visible cell (cx, cy).
 * NW=(cx,cy), NE=(cx+1,cy), SW=(cx,cy+1), SE=(cx+1,cy+1). Used by the renderer
 * and by hit-testing.
 */
export function cellCorners(cx: number, cy: number) {
  return {
    nw: cornerKey(cx,     cy),
    ne: cornerKey(cx + 1, cy),
    sw: cornerKey(cx,     cy + 1),
    se: cornerKey(cx + 1, cy + 1),
  };
}
