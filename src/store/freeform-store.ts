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

interface FreeformStore {
  images: FreeformImage[];
  characters: FreeformCharacter[];
  selectedImageId: string | null;
  selectedCollisionId: string | null;
  selectedCharacterId: string | null;

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

  addCharacter: (src: string, opts?: Partial<Omit<FreeformCharacter, 'id' | 'src'>>) => string;
  updateCharacter: (id: string, patch: Partial<Omit<FreeformCharacter, 'id'>>) => void;
  deleteCharacter: (id: string) => void;
  selectCharacter: (id: string | null) => void;
  setPlaying: (p: boolean) => void;

  setPan: (x: number, y: number) => void;
  setZoom: (z: number) => void;
  resetView: () => void;
  clearAll: () => void;
}

const newId = () => Math.random().toString(36).slice(2, 10);

export const useFreeform = create<FreeformStore>()(
  persist(
    (set, get) => ({
      images: [],
      characters: [],
      selectedImageId: null,
      selectedCollisionId: null,
      selectedCharacterId: null,
      playing: false,

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
          images: state.images.map((img) =>
            img.id === id ? { ...img, ...patch } : img,
          ),
        })),

      deleteImage: (id) =>
        set((state) => ({
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
        const { pendingPenAnchors, pendingPenImageId, images } = get();
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
          images: state.images.map((img) =>
            img.id === imageId
              ? { ...img, collisions: img.collisions.filter((c) => c.id !== collisionId) }
              : img,
          ),
          selectedCollisionId:
            state.selectedCollisionId === collisionId ? null : state.selectedCollisionId,
        })),

      addCharacter: (src, opts = {}) => {
        const id = newId();
        set((state) => ({
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
          characters: state.characters.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),

      deleteCharacter: (id) =>
        set((state) => ({
          characters: state.characters.filter((c) => c.id !== id),
          selectedCharacterId: state.selectedCharacterId === id ? null : state.selectedCharacterId,
        })),

      selectCharacter: (id) =>
        set({ selectedCharacterId: id, selectedImageId: null, selectedCollisionId: null }),

      setPlaying: (p) => set({ playing: p }),

      setPan: (x, y) => set({ pan: { x, y } }),
      setZoom: (z) => set({ zoom: Math.max(0.1, Math.min(8, z)) }),
      resetView: () => set({ pan: { x: 0, y: 0 }, zoom: 1 }),
      clearAll: () =>
        set({
          images: [],
          characters: [],
          selectedImageId: null,
          selectedCollisionId: null,
          selectedCharacterId: null,
          pendingPenAnchors: [],
          pendingPenImageId: null,
          playing: false,
        }),
    }),
    {
      name: 'pb-freeform-2d',
      partialize: (state) => ({
        images: state.images,
        characters: state.characters,
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
      },
    },
  ),
);
