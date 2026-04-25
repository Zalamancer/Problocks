import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 2D Freeform mode — image-based map building.
 *
 * Coordinate system: world units are arbitrary "px" in scene space (the
 * canvas pans + zooms; world coords stay stable). Images are stored by
 * their CENTER point so rotations work uniformly. Collision paths are
 * stored in IMAGE-LOCAL space normalized to the image's untransformed
 * bounds (-w/2..w/2, -h/2..h/2). That way moving/resizing/rotating an
 * image automatically drags its boundaries with it without any extra
 * sync code.
 */

export type FreeformTool = 'select' | 'pen';

/**
 * Sprite-sheet character. Sheets are assumed to be a uniform grid of
 * `cols × rows` frames. By the classic RPG convention, row 0 = down,
 * row 1 = left, row 2 = right, row 3 = up. Any extra rows are treated
 * as additional actions the game can trigger later.
 */
export interface FreeformCharacter {
  id: string;
  src: string;
  name: string;
  /** Spawn point in world coords (center of character). */
  x: number;
  y: number;
  /** Display size per frame in world units. */
  width: number;
  height: number;
  /** Grid of the sprite sheet. */
  cols: number;
  rows: number;
  /** Animation speed (frames per second for the walk cycle). */
  fps: number;
  /** Movement speed in world units per second during play mode. */
  speed: number;
}

export interface FreeformAnchor {
  /** Image-local coords. Origin is image center; +x right, +y down. */
  x: number;
  y: number;
  /** Bezier handle going INTO this anchor (relative to anchor itself).
   *  Undefined = corner / no curve in. */
  inX?: number;
  inY?: number;
  /** Bezier handle going OUT of this anchor. */
  outX?: number;
  outY?: number;
}

export interface FreeformCollision {
  id: string;
  anchors: FreeformAnchor[];
  closed: boolean;
}

export interface FreeformImage {
  id: string;
  src: string;
  /** Center point in world coords. */
  x: number;
  y: number;
  width: number;
  height: number;
  /** Degrees, clockwise. */
  rotation: number;
  zIndex: number;
  /** Boundaries that travel with this image. */
  collisions: FreeformCollision[];
  /** Display label (defaults to filename). */
  name: string;
  /** Mirror horizontally / vertically. Applied as a scale in the image's
   *  transform group, so collisions flip with the image automatically. */
  flipX?: boolean;
  flipY?: boolean;
}

/**
 * A pasted / dropped / picked image registered in the project's asset
 * library. Distinct from `images[]` (which are placed instances on the
 * canvas) — one asset can be dropped onto the canvas multiple times,
 * each becoming a separate FreeformImage that references the same src.
 */
export interface FreeformAsset {
  id: string;
  src: string;
  name: string;
  addedAt: number;
  /** Natural pixel dimensions of the source image, captured on add so the
   *  asset thumbnail can render at the correct aspect ratio. */
  naturalWidth?: number;
  naturalHeight?: number;
}

/**
 * Canvas background — replaces the hardcoded paper-grid look. Stored on
 * the same store as the rest of the scene so it persists with the project
 * and the Right-panel "Properties → Canvas" section can edit it live.
 *
 * Variants:
 *   - solid:   single fill color
 *   - gradient: 2-stop linear/radial gradient
 *   - image:   single bitmap stretched (cover|contain) over the canvas
 *   - tile:    bitmap repeated at a fixed tile size (texture)
 */
export type FreeformBackground =
  | { kind: 'solid'; color: string }
  | { kind: 'gradient'; from: string; to: string; angle: number; radial: boolean }
  | { kind: 'image'; src: string; fit: 'cover' | 'contain' }
  | { kind: 'tile'; src: string; tileSize: number };

/**
 * Slice of the store that participates in undo/redo. Selections, the
 * camera (pan/zoom), the active tool, and play-mode are intentionally
 * excluded — undoing should restore *the scene*, not surprise the user
 * by jumping the camera around.
 */
interface FreeformHistoryEntry {
  images: FreeformImage[];
  characters: FreeformCharacter[];
  assets: FreeformAsset[];
  background: FreeformBackground;
  showGrid: boolean;
}

const HISTORY_LIMIT = 100;

interface FreeformStore {
  images: FreeformImage[];
  characters: FreeformCharacter[];
  assets: FreeformAsset[];
  background: FreeformBackground;
  /** Toggle the soft 40-px grid overlay on top of the background. */
  showGrid: boolean;
  selectedImageId: string | null;
  selectedCollisionId: string | null;
  selectedCharacterId: string | null;

  /** Undo / redo. Stacks are pre-mutation snapshots: `past` grows when
   *  trackable state changes, `future` grows when the user undoes. Both
   *  reset to empty on redo of any non-history mutation. */
  past: FreeformHistoryEntry[];
  future: FreeformHistoryEntry[];
  /** When > 0, mutating actions skip writing to `past` (used so a single
   *  drag from move/resize/rotate becomes a single undo step instead of
   *  one per pointer-move tick). */
  historyPaused: number;
  /** Snapshot captured by `beginDrag()` so endDrag() can push exactly one
   *  entry covering the whole drag. Null when no drag is in progress. */
  pausedSnapshot: FreeformHistoryEntry | null;

  /** Test-play mode — disables editing and lets WASD/arrows drive the
   *  first character while walk animations cycle. */
  playing: boolean;

  tool: FreeformTool;
  /** Anchors the user has dropped while pen tool is active and a path is
   *  in progress. Once committed (closed or finished), they get appended
   *  to the selected image as a new FreeformCollision. */
  pendingPenAnchors: FreeformAnchor[];
  /** Which image the in-progress pen path belongs to. */
  pendingPenImageId: string | null;

  /** Camera state for the canvas. Pan in world coords, zoom is multiplier. */
  pan: { x: number; y: number };
  zoom: number;

  setTool: (t: FreeformTool) => void;

  addImage: (src: string, opts?: { x?: number; y?: number; width?: number; height?: number; name?: string }) => string;
  updateImage: (id: string, patch: Partial<Pick<FreeformImage, 'x' | 'y' | 'width' | 'height' | 'rotation' | 'zIndex' | 'name' | 'flipX' | 'flipY'>>) => void;
  deleteImage: (id: string) => void;
  selectImage: (id: string | null) => void;

  beginPenPath: (imageId: string) => void;
  addPenAnchor: (anchor: FreeformAnchor) => void;
  /** Update the last anchor — used while dragging out a Bezier handle. */
  updateLastPenAnchor: (patch: Partial<FreeformAnchor>) => void;
  /** Commit the in-progress path to the image (closed: true if user clicked
   *  the first anchor or pressed Enter, false for an open polyline finish). */
  commitPenPath: (closed: boolean) => string | null;
  cancelPenPath: () => void;

  selectCollision: (id: string | null) => void;
  deleteCollision: (imageId: string, collisionId: string) => void;

  /** Library upserts. If an asset with the same src already exists we
   *  return its id and skip the insert — this keeps the asset row from
   *  duplicating when the user re-pastes the same image. */
  addAsset: (src: string, opts?: { name?: string; naturalWidth?: number; naturalHeight?: number }) => string;
  deleteAsset: (id: string) => void;

  addCharacter: (src: string, opts?: Partial<Omit<FreeformCharacter, 'id' | 'src'>>) => string;
  updateCharacter: (id: string, patch: Partial<Omit<FreeformCharacter, 'id'>>) => void;
  deleteCharacter: (id: string) => void;
  selectCharacter: (id: string | null) => void;
  setPlaying: (p: boolean) => void;

  setPan: (x: number, y: number) => void;
  setZoom: (z: number) => void;
  resetView: () => void;
  clearAll: () => void;

  setBackground: (bg: FreeformBackground) => void;
  resetBackground: () => void;
  setShowGrid: (b: boolean) => void;

  /** Capture the current trackable slice and pause history recording.
   *  `endDrag()` pops it back into the past stack as a single entry,
   *  collapsing every intermediate `updateImage` call into one undo
   *  step. Safe to call without a matching `endDrag()` — `cancelDrag()`
   *  drops the pending snapshot. */
  beginDrag: () => void;
  endDrag: () => void;
  cancelDrag: () => void;

  undo: () => void;
  redo: () => void;
  /** Convenience for the toolbar buttons. */
  canUndo: () => boolean;
  canRedo: () => boolean;
}

const DEFAULT_BACKGROUND: FreeformBackground = {
  kind: 'solid',
  color: '#fdf6e3',
};

const newId = () => Math.random().toString(36).slice(2, 10);

/** Capture the trackable slice of the current state. Cheap because we
 *  reference-share the existing arrays — the only cost is when a mutator
 *  later replaces them, leaving the snapshot pinned to the old reference. */
function snapshotOf(state: {
  images: FreeformImage[];
  characters: FreeformCharacter[];
  assets: FreeformAsset[];
  background: FreeformBackground;
  showGrid: boolean;
}): FreeformHistoryEntry {
  return {
    images: state.images,
    characters: state.characters,
    assets: state.assets,
    background: state.background,
    showGrid: state.showGrid,
  };
}

/** Returns the partial state to merge so the upcoming mutation pushes
 *  one entry into `past` and clears `future`. Skipped while a drag-in-
 *  progress has paused recording — those updates collapse into the
 *  single endDrag() entry instead. */
function pushHistory(state: {
  past: FreeformHistoryEntry[];
  future: FreeformHistoryEntry[];
  historyPaused: number;
  images: FreeformImage[];
  characters: FreeformCharacter[];
  assets: FreeformAsset[];
  background: FreeformBackground;
  showGrid: boolean;
}): { past: FreeformHistoryEntry[]; future: FreeformHistoryEntry[] } {
  if (state.historyPaused > 0) {
    return { past: state.past, future: state.future };
  }
  const snap = snapshotOf(state);
  const nextPast = state.past.length >= HISTORY_LIMIT
    ? [...state.past.slice(state.past.length - HISTORY_LIMIT + 1), snap]
    : [...state.past, snap];
  return { past: nextPast, future: [] };
}

export const useFreeform = create<FreeformStore>()(
  persist(
    (set, get) => ({
      images: [],
      characters: [],
      assets: [],
      background: DEFAULT_BACKGROUND,
      showGrid: true,
      selectedImageId: null,
      selectedCollisionId: null,
      selectedCharacterId: null,
      playing: false,

      past: [],
      future: [],
      historyPaused: 0,
      pausedSnapshot: null,

      tool: 'select',
      pendingPenAnchors: [],
      pendingPenImageId: null,

      pan: { x: 0, y: 0 },
      zoom: 1,

      setTool: (tool) => {
        // Switching off pen mid-path discards the in-progress polyline so
        // it doesn't bleed into another image when the user picks a tool.
        if (tool !== 'pen') {
          set({ tool, pendingPenAnchors: [], pendingPenImageId: null });
        } else {
          set({ tool });
        }
      },

      addImage: (src, opts = {}) => {
        const id = newId();
        const w = opts.width ?? 240;
        const h = opts.height ?? 240;
        const x = opts.x ?? 0;
        const y = opts.y ?? 0;
        const maxZ = get().images.reduce((m, i) => Math.max(m, i.zIndex), 0);
        set((state) => ({
          ...pushHistory(state),
          images: [
            ...state.images,
            {
              id,
              src,
              x,
              y,
              width: w,
              height: h,
              rotation: 0,
              zIndex: maxZ + 1,
              collisions: [],
              name: opts.name ?? 'Image',
            },
          ],
          selectedImageId: id,
          selectedCollisionId: null,
        }));
        return id;
      },

      updateImage: (id, patch) =>
        set((state) => ({
          ...pushHistory(state),
          images: state.images.map((img) =>
            img.id === id ? { ...img, ...patch } : img,
          ),
        })),

      deleteImage: (id) =>
        set((state) => ({
          ...pushHistory(state),
          images: state.images.filter((img) => img.id !== id),
          selectedImageId: state.selectedImageId === id ? null : state.selectedImageId,
        })),

      selectImage: (id) => set({ selectedImageId: id, selectedCollisionId: null }),

      beginPenPath: (imageId) =>
        set({ pendingPenImageId: imageId, pendingPenAnchors: [], tool: 'pen' }),

      addPenAnchor: (anchor) =>
        set((state) => ({
          pendingPenAnchors: [...state.pendingPenAnchors, anchor],
        })),

      updateLastPenAnchor: (patch) =>
        set((state) => {
          if (state.pendingPenAnchors.length === 0) return {};
          const next = state.pendingPenAnchors.slice();
          next[next.length - 1] = { ...next[next.length - 1], ...patch };
          return { pendingPenAnchors: next };
        }),

      commitPenPath: (closed) => {
        const state = get();
        const { pendingPenAnchors, pendingPenImageId, images } = state;
        if (!pendingPenImageId || pendingPenAnchors.length < 2) {
          set({ pendingPenAnchors: [], pendingPenImageId: null });
          return null;
        }
        const cid = newId();
        const newCollision: FreeformCollision = {
          id: cid,
          anchors: pendingPenAnchors,
          closed,
        };
        set({
          ...pushHistory(state),
          images: images.map((img) =>
            img.id === pendingPenImageId
              ? { ...img, collisions: [...img.collisions, newCollision] }
              : img,
          ),
          pendingPenAnchors: [],
          pendingPenImageId: null,
          selectedCollisionId: cid,
        });
        return cid;
      },

      cancelPenPath: () => set({ pendingPenAnchors: [], pendingPenImageId: null }),

      selectCollision: (id) => set({ selectedCollisionId: id }),

      deleteCollision: (imageId, collisionId) =>
        set((state) => ({
          ...pushHistory(state),
          images: state.images.map((img) =>
            img.id === imageId
              ? { ...img, collisions: img.collisions.filter((c) => c.id !== collisionId) }
              : img,
          ),
          selectedCollisionId:
            state.selectedCollisionId === collisionId ? null : state.selectedCollisionId,
        })),

      addAsset: (src, opts = {}) => {
        // Dedupe on src — pasting the same image twice shouldn't create
        // two identical asset rows. Data URLs are long but stable, so
        // string equality is a safe identity check.
        const existing = get().assets.find((a) => a.src === src);
        if (existing) return existing.id;
        const id = newId();
        set((state) => ({
          ...pushHistory(state),
          assets: [
            ...state.assets,
            {
              id,
              src,
              name: opts.name ?? 'Asset',
              addedAt: Date.now(),
              naturalWidth: opts.naturalWidth,
              naturalHeight: opts.naturalHeight,
            },
          ],
        }));
        return id;
      },

      deleteAsset: (id) =>
        set((state) => ({
          ...pushHistory(state),
          assets: state.assets.filter((a) => a.id !== id),
        })),

      addCharacter: (src, opts = {}) => {
        const id = newId();
        set((state) => ({
          ...pushHistory(state),
          characters: [
            ...state.characters,
            {
              id,
              src,
              name: opts.name ?? 'Character',
              x: opts.x ?? 0,
              y: opts.y ?? 0,
              width: opts.width ?? 96,
              height: opts.height ?? 96,
              cols: opts.cols ?? 4,
              rows: opts.rows ?? 4,
              fps: opts.fps ?? 8,
              speed: opts.speed ?? 220,
            },
          ],
          selectedCharacterId: id,
          selectedImageId: null,
        }));
        return id;
      },

      updateCharacter: (id, patch) =>
        set((state) => ({
          ...pushHistory(state),
          characters: state.characters.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),

      deleteCharacter: (id) =>
        set((state) => ({
          ...pushHistory(state),
          characters: state.characters.filter((c) => c.id !== id),
          selectedCharacterId: state.selectedCharacterId === id ? null : state.selectedCharacterId,
        })),

      selectCharacter: (id) =>
        set({ selectedCharacterId: id, selectedImageId: null, selectedCollisionId: null }),

      setPlaying: (p) => set({ playing: p }),

      setPan: (x, y) => set({ pan: { x, y } }),
      setZoom: (z) => set({ zoom: Math.max(0.1, Math.min(8, z)) }),
      resetView: () => set({ pan: { x: 0, y: 0 }, zoom: 1 }),
      setBackground: (bg) =>
        set((state) => ({ ...pushHistory(state), background: bg })),
      resetBackground: () =>
        set((state) => ({
          ...pushHistory(state),
          background: DEFAULT_BACKGROUND,
          showGrid: true,
        })),
      setShowGrid: (b) =>
        set((state) => ({ ...pushHistory(state), showGrid: b })),
      clearAll: () =>
        set((state) => ({
          ...pushHistory(state),
          images: [],
          characters: [],
          selectedImageId: null,
          selectedCollisionId: null,
          selectedCharacterId: null,
          pendingPenAnchors: [],
          pendingPenImageId: null,
          playing: false,
        })),

      // ── History controls ──
      // beginDrag/endDrag bracket every pointer-driven mutation (move,
      // resize, rotate). historyPaused is a depth counter so nested
      // begins (paranoia, but cheap) don't lose the outermost snapshot.
      beginDrag: () =>
        set((state) => ({
          historyPaused: state.historyPaused + 1,
          // Only capture on the OUTERMOST begin — nested calls keep the
          // first snapshot so endDrag still produces a single entry.
          pausedSnapshot: state.historyPaused === 0 ? snapshotOf(state) : state.pausedSnapshot,
        })),

      endDrag: () => {
        const state = get();
        if (state.historyPaused <= 0) return;
        const nextPaused = state.historyPaused - 1;
        if (nextPaused > 0) {
          set({ historyPaused: nextPaused });
          return;
        }
        // Outermost end — push the captured snapshot if anything actually
        // changed during the drag. Cheap diff: array reference equality
        // works because every mutator above creates fresh arrays.
        const before = state.pausedSnapshot;
        const cur = snapshotOf(state);
        const same =
          !before ||
          (before.images === cur.images &&
            before.characters === cur.characters &&
            before.assets === cur.assets &&
            before.background === cur.background &&
            before.showGrid === cur.showGrid);
        if (same || !before) {
          set({ historyPaused: 0, pausedSnapshot: null });
          return;
        }
        const nextPast = state.past.length >= HISTORY_LIMIT
          ? [...state.past.slice(state.past.length - HISTORY_LIMIT + 1), before]
          : [...state.past, before];
        set({
          historyPaused: 0,
          pausedSnapshot: null,
          past: nextPast,
          future: [],
        });
      },

      cancelDrag: () => {
        const state = get();
        if (state.historyPaused <= 0) return;
        // Restore the snapshot taken at beginDrag — used when the user
        // hits Esc to abort a move/resize without leaving the in-progress
        // changes on the canvas.
        if (state.pausedSnapshot) {
          set({
            ...state.pausedSnapshot,
            historyPaused: 0,
            pausedSnapshot: null,
          });
        } else {
          set({ historyPaused: 0, pausedSnapshot: null });
        }
      },

      undo: () => {
        const state = get();
        if (state.past.length === 0) return;
        const prev = state.past[state.past.length - 1];
        const cur = snapshotOf(state);
        set({
          ...prev,
          past: state.past.slice(0, -1),
          future: [...state.future, cur],
          // Drop selections / pen state that may now point to deleted ids.
          selectedImageId: prev.images.some((i) => i.id === state.selectedImageId)
            ? state.selectedImageId
            : null,
          selectedCharacterId: prev.characters.some((c) => c.id === state.selectedCharacterId)
            ? state.selectedCharacterId
            : null,
          selectedCollisionId: null,
          pendingPenAnchors: [],
          pendingPenImageId: null,
        });
      },

      redo: () => {
        const state = get();
        if (state.future.length === 0) return;
        const next = state.future[state.future.length - 1];
        const cur = snapshotOf(state);
        set({
          ...next,
          past: [...state.past, cur],
          future: state.future.slice(0, -1),
          selectedImageId: next.images.some((i) => i.id === state.selectedImageId)
            ? state.selectedImageId
            : null,
          selectedCharacterId: next.characters.some((c) => c.id === state.selectedCharacterId)
            ? state.selectedCharacterId
            : null,
          selectedCollisionId: null,
          pendingPenAnchors: [],
          pendingPenImageId: null,
        });
      },

      canUndo: () => get().past.length > 0,
      canRedo: () => get().future.length > 0,
    }),
    {
      name: 'pb-freeform-2d',
      partialize: (state) => ({
        images: state.images,
        characters: state.characters,
        assets: state.assets,
        background: state.background,
        showGrid: state.showGrid,
        pan: state.pan,
        zoom: state.zoom,
      }),
      // Drop entries whose `src` is a stale `blob:` URL. URL.createObjectURL
      // returns session-scoped URLs that die on page reload — without this
      // cleanup, refresh leaves orphan rectangles whose <image> 404s but
      // whose stored bounds still render the selection ring. New images
      // get persisted as data URLs (see file picker / paste / drop in
      // FreeformView), so this is mostly for state captured before the fix.
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (Array.isArray(state.images)) {
          state.images = state.images.filter((i) => i?.src && !i.src.startsWith('blob:'));
        }
        if (Array.isArray(state.characters)) {
          state.characters = state.characters.filter((c) => c?.src && !c.src.startsWith('blob:'));
        }
        if (Array.isArray(state.assets)) {
          state.assets = state.assets.filter((a) => a?.src && !a.src.startsWith('blob:'));
        }
      },
    },
  ),
);
