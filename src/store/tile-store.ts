import { create } from 'zustand';
import { persist, type PersistStorage, type StorageValue } from 'zustand/middleware';

// Wang sheet quadrant indices — kept in sync with `lib/wang-tiles.ts`
// (PURE_UPPER_INDEX = 12, PURE_LOWER_INDEX = 6). Inlined here so the
// store doesn't need to import the lib (which doesn't depend on the
// store either, but the symmetry is nice and keeps the wavy-sibling
// expansion fast — no extra module hops on the paint hot path).
const PURE_UPPER_IDX = 12;
const PURE_LOWER_IDX = 6;

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
  | 'object'
  | 'pen'
  | 'fence';

/**
 * One node of a pen-drawn polygon attached to a TileObject.
 * Coords are object-local: origin at the object's CENTER, +x right, +y down,
 * un-rotated, so the polygon rides along when the object is moved/rotated/
 * resized. Mirrors `FreeformAnchor` from the freeform editor — kept as a
 * separate type so the two stores stay decoupled.
 */
export interface TilePenAnchor {
  x: number;
  y: number;
  /** Bezier handle going INTO this anchor (relative). Reserved for v2. */
  inX?: number;
  inY?: number;
  /** Bezier handle going OUT of this anchor. Reserved for v2. */
  outX?: number;
  outY?: number;
}

/**
 * A pen-drawn polygonal boundary on a TileObject. `anchors` are stored in
 * the owning object's local frame so the boundary travels with the object
 * automatically. `closed` toggles the SVG/Canvas Z (close-path) command and
 * the rendered fill.
 */
export interface TileCollision {
  id: string;
  anchors: TilePenAnchor[];
  closed: boolean;
}

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
  /**
   * Texture identity for chaining. Two tilesets are "connected" when one
   * of their texture ids matches one of the other's (in any orientation).
   * E.g. a water→dirt sheet and a dirt→grass sheet share the dirt id.
   * Generated on creation; can be deliberately set when uploading a
   * sheet that connects to an existing one.
   */
  upperTextureId: string;
  lowerTextureId: string;
  /**
   * Optional terrain labels used by the sibling-aware brush remap and
   * renderer canonicalisation. Two sheets with the same `upperLabel`
   * (e.g. both "grass") collapse to one texture even when their
   * `upperTextureId`s differ — the system treats them as the same
   * "grass". Auto-derived from `name` at upload (e.g. "grass-water" →
   * upper="grass", lower="water"); the user can override via the panel.
   */
  upperLabel?: string;
  lowerLabel?: string;
  /**
   * Optional alternate sheets for this terrain. Each variant carries its
   * own sliced tile data URLs in the same order/length as the base
   * `tileIds[]`, so swapping a variant in is a pure dataUrl swap — the
   * chaining/labels/texture identity all stay on the parent tileset.
   * Used by the panel's "swatch between two tilesets" feature so a user
   * can preview the same map with a different art style without rebuilding.
   * Not persisted to localStorage (would blow the quota) — re-uploaded
   * after refresh, same as the base sheet.
   */
  variants?: TilesetVariant[];
  /** 0 = base sheet, 1..n = variants[i - 1]. Undefined treated as 0. */
  activeVariantIndex?: number;
}

export interface TilesetVariant {
  id: string;
  /** User-facing name (defaults to file basename on upload). */
  name: string;
  /** Source PNG of the variant sheet (for thumbnails + re-slice if dims change). */
  sheetDataUrl: string;
  /** Sliced tile data URLs — same length and slice order as parent
   *  `tileIds[]` so an index lookup substitutes 1:1. */
  tileDataUrls: string[];
}

export interface TileLayer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  /** Default tileset for the panel UI (e.g. "remember which terrain I was
   *  painting on this layer"). The renderer no longer needs it — every cell
   *  resolves its own tileset from the corner texture ids. */
  tilesetId: string | null;
  /**
   * Sparse map of painted corners. Key "cx,cy" → texture id (matches some
   * tileset's upperTextureId or lowerTextureId). Absent = transparent.
   * Per-cell rendering picks whichever tileset bridges the textures
   * present at the cell's 4 corners — so two CHAINED tilesets blend
   * together at their shared texture without any layer juggling.
   */
  corners: Record<string, string>;
  /**
   * Optional per-cell render transform — packed bits applied by the
   * canvas before drawing the resolved tile:
   *   bit 0 (0x1): horizontal flip
   *   bit 1 (0x2): vertical flip
   *   bits 2-3 (0xC): rotation quadrant (0..3, scaled by 90° clockwise)
   * Absent / 0 = the tile renders untransformed. Set per cell at paint
   * time when any of the brush's `brushRandomFlipH/V/Rotate` flags is on,
   * cleared on erase. Only affects render — the auto-tile lookup still
   * keys off the cell's 4 corner texture ids.
   */
  cellTransforms?: Record<string, number>;
}

export interface TileObject {
  id: string;
  layerId: string;
  /** World pixel position (center of the sprite). */
  x: number;
  y: number;
  /** ObjectAsset id this object renders. Always references `objectAssets`,
   *  never a Wang-tileset slice — those are auto-tile data, not props. */
  assetId: string;
  /** Style id within the asset's `styles[]` array. Determines which sprite
   *  variant this placed instance shows. Switching styles is the "upgrade"
   *  flow — same footprint, different look. */
  styleId: string;
  /** Size in world pixels. Defaults to the asset's natural size. */
  width: number;
  height: number;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
  /** CSS-equivalent hue rotation in degrees (0–360). Applied on render
   *  via ctx.filter so the source sprite is untouched. 0 = no shift. */
  hue: number;
  name: string;
  /** Pen-drawn polygon boundaries that ride along with this object's
   *  transform (move/rotate/scale/flip). Optional + back-fill on rehydrate
   *  so older persisted objects don't crash. */
  collisions?: TileCollision[];
}

/**
 * One sprite variant of an ObjectAsset. Multiple styles share an asset
 * group so a placed instance can swap between them ("Level 1" → "Level 2").
 * Each style is a distinct upload (its own dataUrl, its own Supabase row).
 */
export interface ObjectStyle {
  id: string;
  /** User-visible name for this variant. May be empty for single-style assets. */
  label: string;
  dataUrl: string;
  width: number;
  height: number;
  /** Server-side row id (Supabase). Absent for local-only styles. */
  cloudId?: string;
}

/**
 * Logical "object" the user places — a group of one or more sprite styles.
 * Distinct from `Tile` (a Wang-tileset slice) because objects are whole
 * images uploaded as-is — no auto-tiling, no shared texture identity.
 *
 * Style ORDER inside `styles[]` is the user-controlled drag order; the
 * panel preserves it on rename / add / remove. Asset order across the
 * sidebar is controlled by `sortIndex` (lower = earlier), so dragging an
 * asset card up just decreases its sortIndex relative to its neighbours.
 */
export interface ObjectAsset {
  id: string;
  name: string;
  /** Ordered style variants. Always non-empty (asset is removed when
   *  the last style is). styles[0] is the default for new placements. */
  styles: ObjectStyle[];
  addedAt: number;
  /** Display order in the asset list. Reorder action assigns sequential
   *  indices, so a stable sort by this field gives the user-visible order. */
  sortIndex: number;
}

/**
 * A user-authored taxonomy folder for grouping ObjectAssets ("Trees",
 * "Buildings", "Trees / Fruit Trees", etc.). Folders nest via `parentId`
 * (null = top-level). Asset → class membership lives on the store as
 * `assetClassIds[assetId] = classId` so cloud-hydrated assets pick up
 * their class from local persisted state without round-tripping the
 * server. Cycles are prevented at the action layer.
 */
export interface ObjectClass {
  id: string;
  name: string;
  /** null = top-level folder. */
  parentId: string | null;
  /** Sort order among siblings sharing the same parentId. */
  sortIndex: number;
}

export interface TileCamera {
  x: number;
  y: number;
  zoom: number;
}

/**
 * Eight compass directions for character animation. Used as keys in
 * `TileCharacter.animations` so each pose has its own action sheet
 * (e.g. an "attack" 4×4 sheet for `n`, a different one for `e`, etc.).
 *
 * Mirrors the `Dir8` type used by the play-mode renderer in TileView,
 * minus 'idle' (idle is the centre cell of the 3×3 source sheet, not a
 * separate animation track).
 */
export type CharacterDir8 = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';

/** All 8 directions in canonical order (N → clockwise → NW). */
export const CHARACTER_DIRS: CharacterDir8[] = [
  'n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw',
];

/**
 * One uploaded action sprite sheet for a character + direction. Always a
 * 4×4 grid (16 frames) per the upload pipeline — `cols/rows/frameW/frameH`
 * are stored explicitly so future formats can vary, just like `TileCharacter`.
 *
 * Each direction can hold MULTIPLE animations (e.g. "walk", "attack",
 * "cast"), so each gets its own id + label and lives inside an ordered
 * list keyed by direction on `TileCharacter.animations`. Same shape as
 * `ObjectStyle` so the right-panel list reuses the styles row UI
 * (rename + drag-reorder + hover delete).
 */
export interface CharacterAnimation {
  id: string;
  label: string;
  /** PNG/WEBP data URL of the full 4×4 sheet. */
  src: string;
  cols: number;
  rows: number;
  frameW: number;
  frameH: number;
  addedAt: number;
  sortIndex: number;
}

/**
 * A 2D playable character — uploaded as a 3×3 sprite sheet where each
 * of the 9 cells is one direction frame. The eight directions are laid
 * out in sequential reading order (top-to-bottom, left-to-right):
 *
 *   S(0)  SE(1) E(2)
 *   NE(3) N(4)  NW(5)
 *   W(6)  SW(7) [discarded(8)]
 *
 * Cell 8 is intentionally discarded per the upload spec. There's no
 * dedicated idle frame — the play loop reuses S (cell 0) as the resting
 * face-camera pose. The actual cell mapping lives in
 * `TileView.DIR_CELL_INDEX` and the right-panel preview's `DIR_CELL`,
 * both of which mirror this layout.
 *
 * Width / height are display size in world (pixel) units; `cols` and
 * `rows` are the sheet's grid (currently always 3×3 for the upload
 * pipeline but stored explicitly so future formats can vary).
 *
 * `animations` is a per-direction map of optional 4×4 action sheets
 * uploaded by the user from the Animations sub-tab in the right-panel
 * properties view. Empty by default — the play loop falls back to the
 * 3×3 idle/walk frame whenever a direction has no animation yet.
 */
export interface TileCharacter {
  id: string;
  name: string;
  /** Sprite-sheet data URL — the whole 3×3 sheet, not pre-sliced. */
  src: string;
  /** Sheet grid (always 3×3 for now; stored for future flexibility). */
  cols: number;
  rows: number;
  /** Source frame size (one cell of the sheet, in source pixels). */
  frameW: number;
  frameH: number;
  /** Spawn point in world coords (center of character). */
  x: number;
  y: number;
  /** Display size per frame in world units. */
  width: number;
  height: number;
  /** Animation speed (frames per second for the walk cycle, when we add one). */
  fps: number;
  /** Movement speed in world units per second during play mode. */
  speed: number;
  /** Per-direction ordered list of 4×4 action animation sheets. Empty
   *  list (or missing key) = no animation uploaded yet. Ordered by
   *  `sortIndex`, persisted via the per-direction setters below. */
  animations: Partial<Record<CharacterDir8, CharacterAnimation[]>>;
  addedAt: number;
  sortIndex: number;
}

export interface TileStore {
  // ── Asset library ───────────────────────────────────────────────
  tilesets: Tileset[];
  tiles: Record<string, Tile>;
  addTileset: (
    sheet: {
      name: string; sheetDataUrl: string; cols: number; rows: number;
      tileWidth: number; tileHeight: number; tiles: string[];
      cloudId?: string;
      upperTextureId?: string;
      lowerTextureId?: string;
      upperLabel?: string;
      lowerLabel?: string;
    },
  ) => string;
  removeTileset: (tilesetId: string) => void;
  setTilesetCloudId: (tilesetId: string, cloudId: string) => void;
  /** Set or clear the terrain label on one side of a tileset. Empty
   *  string clears the label so sibling detection falls back to the
   *  parsed sheet name (or sprite-byte match). */
  setTilesetLabel: (tilesetId: string, side: 'u' | 'l', label: string) => void;
  /**
   * Replace every reference to `sourceTextureId` with `targetTextureId` —
   * across all tilesets' upper/lower slots, all layer corners, and the
   * brush. Used by the panel's "merge with existing texture" flow so two
   * visually-identical textures across separate tilesets can be fused
   * after-the-fact (without re-uploading via the chain feature). Returns
   * the list of tileset ids whose texture columns changed so the caller
   * can re-save them to Supabase.
   */
  mergeTextures: (sourceTextureId: string, targetTextureId: string) => string[];
  /**
   * Add an alternate sheet variant to a tileset. The caller is responsible
   * for slicing to the same `(cols, rows)` as the parent so `tileDataUrls`
   * lines up 1:1 with `tileIds`. Auto-activates the new variant so the
   * user sees the swap immediately.
   */
  addTilesetVariant: (
    tilesetId: string,
    variant: { name: string; sheetDataUrl: string; tileDataUrls: string[] },
  ) => string;
  /** Remove a variant by id. If the active variant is removed, falls back to base (0). */
  removeTilesetVariant: (tilesetId: string, variantId: string) => void;
  /** Pick which sheet renders for this terrain. 0 = base. */
  setActiveTilesetVariant: (tilesetId: string, index: number) => void;

  // ── Map state ───────────────────────────────────────────────────
  /** Pixel size of one grid cell in the editor (independent of tile native
   *  size). Tiles are scaled to fit so 16×16 and 32×32 sheets look the same
   *  size on the canvas. */
  tileSize: number;
  setTileSize: (size: number) => void;

  layers: TileLayer[];
  activeLayerId: string;
  /**
   * Ephemeral synthetic layer painted at Play start by the procgen pass.
   * Lives OUTSIDE `layers[]` and is excluded from persist so the
   * thousands of corner entries it generates never hit localStorage.
   * Renderer treats it as a bottom-most layer (drawn before user
   * layers) so user paint stays on top. Cleared back to null on Stop.
   */
  playLayer: TileLayer | null;
  setPlayLayer: (layer: TileLayer | null) => void;
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
  mutateCorners: (layerId: string, mutator: (corners: Record<string, string>) => void) => void;
  /** Bulk-mutate per-cell render transforms in a single update. The map
   *  is created lazily so layers persisted before this feature start
   *  with no transforms (and zero cost when the brush options are off). */
  mutateCellTransforms: (layerId: string, mutator: (transforms: Record<string, number>) => void) => void;

  // ── Free objects (props on top of grid) ─────────────────────────
  objects: TileObject[];
  addObject: (obj: Omit<TileObject, 'id'>) => string;
  updateObject: (id: string, patch: Partial<TileObject>) => void;
  removeObject: (id: string) => void;
  selectedObjectId: string | null;
  selectObject: (id: string | null) => void;

  // ── Uploaded object sprites (OBJECT tool palette) ───────────────
  objectAssets: Record<string, ObjectAsset>;
  /** Create a new asset with a single style. Returns both ids so the
   *  caller can hook up a Supabase row to the right style. Optionally
   *  pass `assetId` to reuse a known id during cloud rehydrate (so the
   *  local asset.id matches the server-side group_id one-for-one). */
  addObjectAsset: (
    asset: { assetId?: string; name: string; label?: string; dataUrl: string; width: number; height: number; cloudId?: string },
  ) => { assetId: string; styleId: string };
  /** Add another style variant to an existing asset (e.g. "Level 2"). */
  addStyleToAsset: (
    assetId: string,
    style: { label?: string; dataUrl: string; width: number; height: number; cloudId?: string },
  ) => string;
  /** Remove an entire asset (and all its styles). Placed objects using
   *  any of its styles are removed too. */
  removeObjectAsset: (assetId: string) => void;
  /** Remove one style. If it was the last style, the asset is removed.
   *  Placed objects using this style are remapped to the asset's first
   *  remaining style, or removed if no styles remain. */
  removeStyle: (assetId: string, styleId: string) => void;
  setStyleLabel: (assetId: string, styleId: string, label: string) => void;
  setStyleCloudId: (assetId: string, styleId: string, cloudId: string) => void;
  /** Replace the bitmap on a style — used by the Recraft remove-background
   *  flow and any future "edit the source sprite" path. Width/height
   *  default to the existing values when the post-processed image keeps
   *  the original dimensions; pass them explicitly if Recraft cropped.
   *  Drops `cloudId` because the local bytes no longer match the saved
   *  Supabase row — caller is responsible for re-uploading if they want
   *  the change persisted. */
  setStyleDataUrl: (
    assetId: string,
    styleId: string,
    patch: { dataUrl: string; width?: number; height?: number },
  ) => void;
  /** Rename an asset. Every style row inherits the new name on the
   *  cloud side via the panel's batch save — store-side it's just a
   *  single field update. */
  renameAsset: (assetId: string, name: string) => void;
  /** Drag-reorder action: pass the full ordered list of asset ids. Any
   *  asset not in the list keeps its current index but is appended after
   *  the explicitly-ordered ones (defensive — usually all ids are listed). */
  reorderAssets: (orderedAssetIds: string[]) => void;
  /** Drag-reorder action for styles within one asset. Returns the new
   *  ordered list of styles so the caller can persist sort_index to cloud. */
  reorderStyles: (assetId: string, orderedStyleIds: string[]) => ObjectStyle[];
  /** Switch the style on a placed instance ("upgrade"). */
  setObjectStyle: (objectId: string, styleId: string) => void;

  // ── Object-asset taxonomy (folders/classes) ─────────────────────
  /**
   * User-authored folder tree for organising ObjectAssets ("Trees",
   * "Trees / Fruit Trees", "Buildings", etc.). Persists in localStorage
   * (small index, no blobs). Cloud-hydrated assets join the tree via
   * `assetClassIds` below, which is also persisted locally.
   */
  objectClasses: Record<string, ObjectClass>;
  /** Per-asset class membership. Absent / undefined = root (uncategorised). */
  assetClassIds: Record<string, string>;
  /** Create a new class folder. `parentId` null = top-level. Returns id. */
  addObjectClass: (input: { name: string; parentId?: string | null }) => string;
  renameObjectClass: (id: string, name: string) => void;
  /** Delete a class. Children classes get re-parented to this class's parent
   *  (so the tree collapses one level), and member assets become root. The
   *  alternative — cascade-delete — would silently remove user assets, which
   *  is too destructive for an organisational folder. */
  removeObjectClass: (id: string) => void;
  /** Move a class under a new parent (null = top-level). No-op if the move
   *  would create a cycle (target is the class itself or one of its
   *  descendants). */
  setObjectClassParent: (id: string, parentId: string | null) => void;
  /** Drag-reorder among siblings sharing `parentId`. Pass the full ordered
   *  list of sibling ids; ids not in the list are appended after. */
  reorderObjectClasses: (parentId: string | null, orderedIds: string[]) => void;
  /** Move an asset into a class (or to root with classId=null). */
  setAssetClass: (assetId: string, classId: string | null) => void;

  // ── Playable characters (Characters sub-tab in 2D Tile assets) ──
  /** Map of character id → record. Stored alongside object assets so the
   *  panel can render thumbnails without round-tripping the cloud. The
   *  data URL DOES persist locally (sheets are typically <200 KB) so an
   *  offline reload still has the player available — see persist's
   *  partialize for the included keys. */
  tileCharacters: Record<string, TileCharacter>;
  /** Currently-selected character (highlighted in the canvas, picked up by
   *  the play loop as "the player"). Null when nothing is selected. */
  selectedCharacterId: string | null;
  /** Add a new character from an uploaded sprite sheet. The slicer extracts
   *  cols×rows frames; cells 0..7 are usable, cell 8 is discarded per the
   *  upload-pipeline spec. Returns the new id so callers can show the
   *  character in their list immediately. */
  addTileCharacter: (
    input: {
      name: string;
      src: string;
      cols: number;
      rows: number;
      frameW: number;
      frameH: number;
      x?: number;
      y?: number;
      width?: number;
      height?: number;
      fps?: number;
      speed?: number;
    },
  ) => string;
  removeTileCharacter: (id: string) => void;
  renameTileCharacter: (id: string, name: string) => void;
  /** Patch a character's runtime / display fields (position, size, fps,
   *  speed). The play loop calls this with new x/y on every tick. */
  updateTileCharacter: (id: string, patch: Partial<Omit<TileCharacter, 'id' | 'src' | 'addedAt' | 'sortIndex'>>) => void;
  /** Append a new 4×4 animation to the given direction's list. Returns
   *  the new id so callers can scroll/select the freshly-added row. */
  addCharacterAnimation: (
    id: string,
    direction: CharacterDir8,
    input: { label?: string; src: string; cols: number; rows: number; frameW: number; frameH: number },
  ) => string;
  removeCharacterAnimation: (
    id: string,
    direction: CharacterDir8,
    animationId: string,
  ) => void;
  renameCharacterAnimation: (
    id: string,
    direction: CharacterDir8,
    animationId: string,
    label: string,
  ) => void;
  /** Replace a single animation's bitmap (Replace flow on the row).
   *  Width/height fall back to existing values when omitted. */
  setCharacterAnimationSrc: (
    id: string,
    direction: CharacterDir8,
    animationId: string,
    patch: { src: string; cols?: number; rows?: number; frameW?: number; frameH?: number },
  ) => void;
  /** Drag-reorder action: pass the full ordered list of animation ids
   *  for that direction. Animations not in the list keep their existing
   *  index (defensive — usually all ids are listed). */
  reorderCharacterAnimations: (
    id: string,
    direction: CharacterDir8,
    orderedAnimationIds: string[],
  ) => void;
  /** Replace the whole 3×3 sheet for a character. Clears every per-
   *  direction animation list because the new poses no longer match the
   *  uploaded action sheets — those rotation frames the animations were
   *  paired with don't exist any more. Width/height fall back to
   *  defaults when omitted. */
  replaceCharacterSheet: (
    id: string,
    input: { src: string; cols: number; rows: number; frameW: number; frameH: number },
  ) => void;
  setSelectedCharacterId: (id: string | null) => void;

  // ── Pen tool — collision boundaries on objects ─────────────────
  /** Currently-selected collision id (highlighted in the canvas, target of
   *  Delete). Null when nothing is selected. */
  selectedCollisionId: string | null;
  /** Anchors the user has dropped while the pen tool is active and a path
   *  is in progress. On commit they get appended to the owning object as
   *  a fresh TileCollision. */
  pendingPenAnchors: TilePenAnchor[];
  /** Which TileObject the in-progress pen path belongs to. */
  pendingPenObjectId: string | null;
  beginPenPath: (objectId: string) => void;
  addPenAnchor: (anchor: TilePenAnchor) => void;
  /** Update the last anchor — used for live cursor preview / handle drag. */
  updateLastPenAnchor: (patch: Partial<TilePenAnchor>) => void;
  /** Commit the in-progress path to the object. `closed: true` when the
   *  user clicked the first anchor or pressed Enter; false for an open
   *  polyline finish (e.g. Enter without closing). */
  commitPenPath: (closed: boolean) => string | null;
  cancelPenPath: () => void;
  selectCollision: (id: string | null) => void;
  deleteCollision: (objectId: string, collisionId: string) => void;

  // ── Tools ──────────────────────────────────────────────────────
  tool: TileTool;
  setTool: (t: TileTool) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  /** Texture id the paint tool lays down. Set by clicking an UPPER or LOWER
   *  swatch on a terrain card — the click resolves to the corresponding
   *  tileset's upperTextureId / lowerTextureId. Erase always clears the
   *  corner regardless of this. */
  brushTextureId: string | null;
  setBrushTextureId: (id: string | null) => void;
  /** When on, each painted cell gets a random horizontal flip in its
   *  per-cell render transform. Pure interior tiles benefit most; edge
   *  tiles get their corner pattern visually scrambled, which the user
   *  may or may not want — exposed as a brush toggle. */
  brushRandomFlipH: boolean;
  setBrushRandomFlipH: (v: boolean) => void;
  /** Random vertical flip per painted cell. Same trade-off as flipH. */
  brushRandomFlipV: boolean;
  setBrushRandomFlipV: (v: boolean) => void;
  /** Random 0/90/180/270° rotation per painted cell. Wang transition
   *  tiles rotate visually but the cell's auto-tile lookup is unchanged
   *  — turn off if the corner pattern matters more than the variety. */
  brushRandomRotate: boolean;
  setBrushRandomRotate: (v: boolean) => void;
  /**
   * Texture ids that should render with the animated "water effect"
   * overlay — sine-wave shimmer + hue tint clipped to the region as a
   * whole (not per tile). Stored as a flat list of raw ids, but
   * `setWavyTexture` expands sibling sets via getSiblingTextures so two
   * label-linked "water" textures both get the effect from a single
   * toggle.
   */
  wavyTextureIds: string[];
  /** Toggle the water-effect on a texture id. When `on` is true, this
   *  id and all its siblings (sprite-byte or label) are added to the
   *  list; when false, the id and all its siblings are removed. */
  setWavyTexture: (textureId: string, on: boolean) => void;
  /**
   * Optional base-layer texture id. When set, the renderer fills the
   * entire visible viewport with this texture's pure tile and treats
   * absent corners as this id when resolving cells — so painted regions
   * smoothly transition into the base via the matching wang bridge.
   * The map is conceptually infinite while only painted overrides
   * (corners that differ from the base) get stored on layers. Null =
   * classic mode where empty cells render as the page background.
   */
  baseTextureId: string | null;
  setBaseTexture: (id: string | null) => void;
  /**
   * Per-tileset palette tints — keyed first by tileset id and then by
   * colour bucket (red/green/blue/etc., see `lib/tile-palette.ts`).
   * Each entry holds an HSL triple { hue, saturation, brightness }
   * applied per-pixel to every pixel that classifies into that bucket.
   * The renderer caches a recoloured tile dataUrl per tile when any
   * bucket has a non-identity entry; identity entries fall through the
   * untinted fast path.
   *
   * Why per-bucket and not per-texture: a transition tile has both
   * grass (green) and dirt (brown) pixels in the same image. Adjusting
   * "the grass" via per-texture tint would push all those pixels
   * together. Per-bucket tints push only the green pixels and leave
   * brown pixels alone — the user's mental model.
   */
  tilesetTints: Record<
    string,
    Partial<Record<
      'red' | 'orange' | 'yellow' | 'green' | 'cyan' | 'blue' | 'purple' | 'magenta' | 'gray',
      { hue: number; saturation: number; brightness: number }
    >>
  >;
  /** Patch one bucket's tint on one tileset. Identity result drops the
   *  bucket entry; passing `null` removes it explicitly. The renderer
   *  watches this map and rebuilds recoloured tile dataUrls when any
   *  entry changes. */
  setTilesetBucketTint: (
    tilesetId: string,
    bucketId: 'red' | 'orange' | 'yellow' | 'green' | 'cyan' | 'blue' | 'purple' | 'magenta' | 'gray',
    patch: Partial<{ hue: number; saturation: number; brightness: number }> | null,
  ) => void;
  /** Wipe every tint for a tileset (e.g. on tileset removal). */
  clearTilesetTints: (tilesetId: string) => void;
  /** Used only by the OBJECT tool — picks the asset whose style brush is
   *  active. The actual sprite to place is `selectedStyleId` within this
   *  asset (defaults to the asset's first style on selection). */
  selectedAssetId: string | null;
  setSelectedAssetId: (id: string | null) => void;
  /** Style brush for OBJECT placement. Always belongs to selectedAssetId.
   *  Set via the panel's style chip; the renderer uses this for the ghost
   *  preview and final placement. */
  selectedStyleId: string | null;
  setSelectedStyleId: (id: string | null) => void;
  /** Currently-selected texture id — set when the user clicks a texture
   *  thumbnail in the left-panel Terrain tab. Drives the right-panel
   *  TileTexturePropertiesPanel. Setter clears asset/character/object
   *  selections so the right-panel branch swaps cleanly. */
  selectedTextureId: string | null;
  setSelectedTextureId: (id: string | null) => void;

  // ── Fence component (procedural pixel-art) ─────────────────────
  /**
   * Posts are placed per cell (one post per tile cell). Key `"cx,cy"`.
   * The renderer draws a procedural pixel-art post centered on each cell.
   */
  fencePosts: Record<string, true>;
  /**
   * Segments connecting two posts. Key is the canonical edge string
   * `"a|b"` where `a < b` lexicographically and each side is a post key.
   * Edges are only drawn when both endpoints exist in `fencePosts`.
   */
  fenceEdges: Record<string, true>;
  /** Last-touched post — the "current post" the user will connect from
   *  on the next click. Null = no current post. */
  selectedFencePostKey: string | null;
  /**
   * Fence-tool click resolver. If a current post is selected and (cx, cy)
   * falls within the 8-neighbour ring, this places a new post (if absent)
   * and an edge between the two; the new post becomes the current one.
   * Clicking the same selected cell deselects. Clicking outside the ring
   * places/selects a fresh post with no segment to the previous one.
   */
  placeFenceAt: (cx: number, cy: number) => void;
  setSelectedFencePostKey: (key: string | null) => void;
  clearFences: () => void;

  // ── View ───────────────────────────────────────────────────────
  camera: TileCamera;
  setCamera: (cam: Partial<TileCamera>) => void;
  showGrid: boolean;
  toggleGrid: () => void;
  resetCamera: () => void;

  // ── Play-mode camera ───────────────────────────────────────────
  /** When true, the play loop drives the camera so the player stays
   *  centred. Off = the camera is wherever the user left it on Stop. */
  playCameraFollow: boolean;
  setPlayCameraFollow: (v: boolean) => void;
  /** Lerp factor per frame at 60 fps for the follow path: 1 = snap, lower
   *  values smooth the chase. Internally scaled by frame dt so the feel
   *  stays consistent across refresh rates. */
  playCameraSmoothing: number;
  setPlayCameraSmoothing: (v: number) => void;
  /** Camera zoom held while playing. Restored to whatever the user had on
   *  the canvas when Stop fires, so edit-mode framing isn't disturbed. */
  playCameraZoom: number;
  setPlayCameraZoom: (v: number) => void;

  // ── Procedural map generation (Play-mode worldgen) ─────────────
  /** 32-bit seed driving the deterministic noise. Same seed + palette =
   *  same map across reloads / sessions / players. */
  genSeed: number;
  setGenSeed: (seed: number) => void;
  /** Replace `genSeed` with a fresh random 32-bit value — drives the
   *  "Reroll" button next to the seed input. */
  rerollGenSeed: () => void;
  /** Spatial frequency of the dominant biome blob, in tile cells.
   *  Higher = bigger blobs (smoother map); lower = patchier. */
  genScale: number;
  setGenScale: (v: number) => void;
  /** Per-texture-id weights mapping into the noise→texture picker. A
   *  weight of 0 excludes that texture from the generator (effectively
   *  the "terrain enabled" toggle). Missing entries default to 1.0 so
   *  newly-uploaded tilesets show up immediately. */
  genTextureWeights: Record<string, number>;
  setGenTextureWeight: (textureId: string, weight: number) => void;
  /** Number of fractal octaves summed by the noise. 1 = smooth blobs,
   *  2 = standard biomes, 3-4 = detailed shorelines. */
  genOctaves: number;
  setGenOctaves: (v: number) => void;
  /** Per-octave amplitude multiplier (persistence). 0.5 ≈ classic
   *  Perlin; higher = noisier, lower = smoother. */
  genRoughness: number;
  setGenRoughness: (v: number) => void;
  /** When true, cells outside `genIslandRadius` fade toward the
   *  lowest-band texture so the map reads as an island. */
  genIslandEnabled: boolean;
  setGenIslandEnabled: (v: boolean) => void;
  /** Falloff midpoint in cells. Inside ~60% of this radius the noise is
   *  full strength; the outer 40% smoothly fades to zero. */
  genIslandRadius: number;
  setGenIslandRadius: (v: number) => void;
  /** Reserve half-extent (square) or radius (circle), in cells. The
   *  Play-loop spawn pad lives at the centre of this; user paint inside
   *  it survives generation. */
  genReserveRadius: number;
  setGenReserveRadius: (v: number) => void;
  /** Square = legacy [-r..r]² zone. Circle = round zone of the same
   *  radius — better when paired with `genIslandEnabled` so the reserve
   *  stays inside the island shape. */
  genReserveShape: 'square' | 'circle';
  setGenReserveShape: (v: 'square' | 'circle') => void;

  // ── Wholesale clear ─────────────────────────────────────────────
  clearMap: () => void;

  // ── Undo / Redo ─────────────────────────────────────────────────
  /**
   * Snapshot stacks of "world data" — what the user paints / places /
   * arranges. Tool state, camera, brush settings, asset library, and
   * tints are deliberately NOT snapshotted: an undo of a paint stroke
   * shouldn't also revert the active tool the user just switched to.
   */
  _undoPast: TileSnapshot[];
  _undoFuture: TileSnapshot[];
  /**
   * True between `beginUndoGroup` and `commitUndoGroup`. While true,
   * mutating methods skip their auto-snapshot — the snapshot was taken
   * once at group open. Strokes (paint/erase) and drags (move/resize/
   * rotate) wrap their many small mutations in a group so the user gets
   * one undo step per stroke / drag, not one per cell or pointer move.
   */
  _undoOpen: boolean;
  /** Open an undo group: capture a snapshot, clear redo history. */
  beginUndoGroup: () => void;
  /** Close an undo group. Safe to call when no group is open. */
  commitUndoGroup: () => void;
  /** Undo the last group / single mutation. No-op when stack is empty. */
  undo: () => void;
  /** Redo the most recently undone group. No-op when stack is empty. */
  redo: () => void;
}

export interface TileSnapshot {
  layers: TileLayer[];
  objects: TileObject[];
  fencePosts: Record<string, true>;
  fenceEdges: Record<string, true>;
}

/**
 * Resolve the dataUrl that should render for a given (tileset, sliceIndex)
 * — accounting for the active variant. When no variant is active (or the
 * tileset has none), returns the base tile's dataUrl. Falls back to the
 * base if the variant is missing the expected slice for any reason. Takes
 * a structural type so render-time `TilesetForResolve` shapes from
 * `lib/wang-tiles` can pass through without a cast.
 */
export function tileDataUrlFor(
  tileset: Pick<Tileset, 'variants' | 'activeVariantIndex'>,
  sliceIndex: number,
  baseDataUrl: string,
): string {
  const i = tileset.activeVariantIndex ?? 0;
  if (i === 0) return baseDataUrl;
  const variant = tileset.variants?.[i - 1];
  return variant?.tileDataUrls[sliceIndex] ?? baseDataUrl;
}

function defaultLayer(name = 'Ground'): TileLayer {
  return {
    id: cryptoId(),
    name,
    visible: true,
    opacity: 1,
    tilesetId: null,
    corners: {},
    cellTransforms: {},
  };
}

function cryptoId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `id-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

/**
 * Coalesce + defer localStorage writes. zustand calls `setItem` on every
 * `set()` — once `layers[].corners` grows to tens of thousands of entries
 * the per-call `JSON.stringify` + DOM write becomes the dominant cost on
 * slow hardware (Chromebook target). This storage holds the latest
 * unserialised state and only stringifies/writes once per `delayMs` of
 * idle, plus once on `beforeunload` so the very last edit isn't lost.
 */
function makeDeferredLocalStorage(delayMs = 500): PersistStorage<unknown> {
  let pending: { name: string; value: StorageValue<unknown> } | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  function flush() {
    timer = null;
    if (!pending || typeof window === 'undefined') return;
    const { name, value } = pending;
    pending = null;
    try {
      window.localStorage.setItem(name, JSON.stringify(value));
    } catch (err) {
      // Quota errors etc. — log and move on; the in-memory state is
      // unaffected, the next flush attempt will retry.
      console.warn('[tile-store] persist write failed', err);
    }
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', flush);
  }
  return {
    getItem: (name) => {
      if (typeof window === 'undefined') return null;
      const raw = window.localStorage.getItem(name);
      if (!raw) return null;
      try { return JSON.parse(raw) as StorageValue<unknown>; } catch { return null; }
    },
    setItem: (name, value) => {
      if (typeof window === 'undefined') return;
      pending = { name, value };
      if (timer === null) timer = setTimeout(flush, delayMs);
    },
    removeItem: (name) => {
      if (typeof window === 'undefined') return;
      window.localStorage.removeItem(name);
    },
  };
}

const INITIAL_LAYER = defaultLayer('Ground');

/**
 * Cap on the undo stack — at ~25 entries × ~1 MB worst-case clone
 * (90k corners × 5 layers), peak memory stays under ~25 MB on a
 * worst-case map. Older strokes silently drop off the bottom of the
 * stack rather than blocking the user from continuing to paint.
 */
const UNDO_LIMIT = 25;

/**
 * Deep-clone the world-data slice so a later undo can restore it
 * without aliasing the live (mutated) maps. `corners` and
 * `cellTransforms` are mutated in place by `mutateCorners` /
 * `mutateCellTransforms` for paint-stroke speed, so a shallow layer
 * clone is NOT enough — we have to clone those two maps explicitly.
 */
function takeSnapshot(s: Pick<TileStore, 'layers' | 'objects' | 'fencePosts' | 'fenceEdges'>): TileSnapshot {
  return {
    layers: s.layers.map((l) => ({
      ...l,
      corners: { ...l.corners },
      cellTransforms: l.cellTransforms ? { ...l.cellTransforms } : {},
    })),
    objects: s.objects.map((o) => ({ ...o })),
    fencePosts: { ...s.fencePosts },
    fenceEdges: { ...s.fenceEdges },
  };
}

/**
 * Build the partial-state patch for "record an undo step before this
 * mutation": push a fresh snapshot onto past[], cap the stack, and
 * blow away any future[] redo history (a fresh mutation invalidates
 * all undone steps). Returns `{}` when an undo group is open — the
 * caller's `beginUndoGroup` already snapshotted.
 */
function recordUndoStep(s: TileStore): Partial<TileStore> {
  if (s._undoOpen) return {};
  const snap = takeSnapshot(s);
  const past = s._undoPast.length >= UNDO_LIMIT
    ? [...s._undoPast.slice(-(UNDO_LIMIT - 1)), snap]
    : [...s._undoPast, snap];
  return { _undoPast: past, _undoFuture: [] };
}

export const useTile = create<TileStore>()(persist((set, get) => ({
  tilesets: [],
  tiles: {},
  addTileset: ({ name, sheetDataUrl, cols, rows, tileWidth, tileHeight, tiles, cloudId, upperTextureId, lowerTextureId, upperLabel, lowerLabel }) => {
    const tilesetId = cryptoId();
    // Texture ids default to fresh UUIDs when the caller doesn't pass one
    // (i.e., a stand-alone upload). When the caller is "connecting" a new
    // sheet to an existing texture, they pass that texture's id for the
    // matching side.
    const upperTexId = upperTextureId ?? cryptoId();
    const lowerTexId = lowerTextureId ?? cryptoId();
    // Default labels parse out of the sheet name when the caller didn't
    // specify them — "grass-water" → upper="grass", lower="water". Two
    // sheets sharing a label collapse to one terrain at paint AND render
    // time, so independently-uploaded grass→water + grass→dirt sheets
    // automatically blend through their shared "grass" label.
    let derivedUpper: string | undefined;
    let derivedLower: string | undefined;
    if (!upperLabel || !lowerLabel) {
      const lower = name.toLowerCase().trim();
      const patterns: RegExp[] = [
        /^(.+?)\s*->\s*(.+)$/,
        /^(.+?)\s*→\s*(.+)$/,
        /^(.+?)\s+to\s+(.+)$/i,
        /^(.+?)\s*[-_/|]\s*(.+)$/,
      ];
      for (const p of patterns) {
        const m = lower.match(p);
        if (!m) continue;
        const a = m[1].trim();
        const b = m[2].trim();
        if (a && b && a !== b) {
          derivedUpper = a;
          derivedLower = b;
          break;
        }
      }
    }
    const finalUpperLabel = upperLabel ?? derivedUpper;
    const finalLowerLabel = lowerLabel ?? derivedLower;
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
      // Layers exist for visibility/opacity grouping, but the renderer
      // resolves a tileset PER CELL from corner texture ids — so we no
      // longer need a layer-per-tileset. Just bind the active layer's
      // optional default tileset reference if it's empty.
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
          upperTextureId: upperTexId,
          lowerTextureId: lowerTexId,
          upperLabel: finalUpperLabel,
          lowerLabel: finalLowerLabel,
        }],
        tiles: nextTiles,
        layers: nextLayers,
        // Default brush picks the new tileset's UPPER texture so the user
        // can paint immediately after upload.
        brushTextureId: s.brushTextureId ?? upperTexId,
      };
    });
    return tilesetId;
  },
  setTilesetCloudId: (tilesetId, cloudId) => set((s) => ({
    tilesets: s.tilesets.map((t) => t.id === tilesetId ? { ...t, cloudId } : t),
  })),
  setTilesetLabel: (tilesetId, side, label) => set((s) => ({
    tilesets: s.tilesets.map((t) => {
      if (t.id !== tilesetId) return t;
      const trimmed = label.trim();
      const value = trimmed === '' ? undefined : trimmed;
      return side === 'u' ? { ...t, upperLabel: value } : { ...t, lowerLabel: value };
    }),
  })),
  mergeTextures: (sourceTextureId, targetTextureId) => {
    if (sourceTextureId === targetTextureId) return [];
    const changedIds: string[] = [];
    set((s) => {
      const undoStep = recordUndoStep(s);
      const tilesets = s.tilesets.map((t) => {
        const upperHit = t.upperTextureId === sourceTextureId;
        const lowerHit = t.lowerTextureId === sourceTextureId;
        if (!upperHit && !lowerHit) return t;
        changedIds.push(t.id);
        return {
          ...t,
          upperTextureId: upperHit ? targetTextureId : t.upperTextureId,
          lowerTextureId: lowerHit ? targetTextureId : t.lowerTextureId,
        };
      });
      const layers = s.layers.map((l) => {
        let touched = false;
        const corners = { ...l.corners };
        for (const k of Object.keys(corners)) {
          if (corners[k] === sourceTextureId) {
            corners[k] = targetTextureId;
            touched = true;
          }
        }
        return touched ? { ...l, corners } : l;
      });
      const brushTextureId = s.brushTextureId === sourceTextureId ? targetTextureId : s.brushTextureId;
      const baseTextureId = s.baseTextureId === sourceTextureId ? targetTextureId : s.baseTextureId;
      return { ...undoStep, tilesets, layers, brushTextureId, baseTextureId };
    });
    return changedIds;
  },
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
    // Free objects no longer reference Wang slices (they live in
    // objectAssets), so removing a tileset cannot orphan an object.
    const nextLayers = s.layers.map((l) =>
      l.tilesetId === tilesetId ? { ...l, tilesetId: null } : l,
    );
    // If the base texture pointed into the removed tileset, drop it —
    // otherwise the renderer would fail to resolve a tile every frame.
    const baseTextureId = (s.baseTextureId === ts.upperTextureId || s.baseTextureId === ts.lowerTextureId)
      ? null
      : s.baseTextureId;
    return {
      tilesets: s.tilesets.filter((t) => t.id !== tilesetId),
      tiles: nextTiles,
      layers: nextLayers,
      baseTextureId,
    };
  }),
  addTilesetVariant: (tilesetId, { name, sheetDataUrl, tileDataUrls }) => {
    const variantId = cryptoId();
    set((s) => ({
      tilesets: s.tilesets.map((t) => {
        if (t.id !== tilesetId) return t;
        const variants = [...(t.variants ?? []), { id: variantId, name, sheetDataUrl, tileDataUrls }];
        // Activate the new variant so the user sees the swap immediately.
        return { ...t, variants, activeVariantIndex: variants.length };
      }),
    }));
    return variantId;
  },
  removeTilesetVariant: (tilesetId, variantId) => set((s) => ({
    tilesets: s.tilesets.map((t) => {
      if (t.id !== tilesetId) return t;
      const variants = (t.variants ?? []).filter((v) => v.id !== variantId);
      // Active index might be pointing at the removed variant, or shifted
      // by removal. Simpler: snap back to base on any removal.
      return { ...t, variants, activeVariantIndex: 0 };
    }),
  })),
  setActiveTilesetVariant: (tilesetId, index) => set((s) => ({
    tilesets: s.tilesets.map((t) => {
      if (t.id !== tilesetId) return t;
      const max = (t.variants?.length ?? 0);
      const clamped = Math.max(0, Math.min(max, Math.floor(index)));
      return { ...t, activeVariantIndex: clamped };
    }),
  })),

  tileSize: 32,
  setTileSize: (size) => set({ tileSize: Math.max(4, Math.min(256, Math.round(size))) }),

  layers: [INITIAL_LAYER],
  activeLayerId: INITIAL_LAYER.id,
  playLayer: null,
  setPlayLayer: (layer) => set({ playLayer: layer }),
  addLayer: (name) => set((s) => {
    const layer = defaultLayer(name ?? `Layer ${s.layers.length + 1}`);
    return { ...recordUndoStep(s), layers: [...s.layers, layer], activeLayerId: layer.id };
  }),
  removeLayer: (id) => set((s) => {
    if (s.layers.length <= 1) return {};
    const layers = s.layers.filter((l) => l.id !== id);
    const activeLayerId = s.activeLayerId === id ? layers[0].id : s.activeLayerId;
    const objects = s.objects.filter((o) => o.layerId !== id);
    return { ...recordUndoStep(s), layers, activeLayerId, objects };
  }),
  renameLayer: (id, name) => set((s) => ({
    ...recordUndoStep(s),
    layers: s.layers.map((l) => l.id === id ? { ...l, name } : l),
  })),
  toggleLayerVisibility: (id) => set((s) => ({
    ...recordUndoStep(s),
    layers: s.layers.map((l) => l.id === id ? { ...l, visible: !l.visible } : l),
  })),
  setLayerOpacity: (id, opacity) => set((s) => ({
    ...recordUndoStep(s),
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
    return { ...recordUndoStep(s), layers };
  }),
  setActiveLayer: (id) => set({ activeLayerId: id }),
  setLayerTileset: (layerId, tilesetId) => set((s) => ({
    ...recordUndoStep(s),
    layers: s.layers.map((l) => l.id === layerId ? { ...l, tilesetId } : l),
  })),
  mutateCorners: (layerId, mutator) => set((s) => {
    // Mutate the corners map IN PLACE rather than spreading it. With ~90k
    // entries, the spread alone took ~5–15 ms per paint cell on a slow
    // laptop and was the main reason painting felt laggy. The renderer
    // reads via `stateRef` (imperative canvas), and no React selector in
    // the studio depends on referential equality of `corners`, so an
    // in-place mutation is safe — we still replace the layer wrapper +
    // layers array so zustand subscribers re-render.
    const layer = s.layers.find((l) => l.id === layerId);
    if (!layer) return {};
    // Snapshot BEFORE mutator runs so the past entry preserves the
    // pre-paint corners. Inside an undo group (paint stroke), the
    // snapshot was taken at beginUndoGroup and recordUndoStep is a
    // no-op — strokes get one undo step, not one per cell.
    const undoStep = recordUndoStep(s);
    mutator(layer.corners);
    return { ...undoStep, layers: s.layers.map((l) => l.id === layerId ? { ...l } : l) };
  }),
  mutateCellTransforms: (layerId, mutator) => set((s) => {
    const layer = s.layers.find((l) => l.id === layerId);
    if (!layer) return {};
    if (!layer.cellTransforms) layer.cellTransforms = {};
    const undoStep = recordUndoStep(s);
    mutator(layer.cellTransforms);
    return { ...undoStep, layers: s.layers.map((l) => l.id === layerId ? { ...l } : l) };
  }),

  objects: [],
  addObject: (obj) => {
    const id = cryptoId();
    set((s) => ({
      ...recordUndoStep(s),
      objects: [...s.objects, { ...obj, id }],
    }));
    return id;
  },
  // updateObject is intentionally NOT auto-recorded — slider drags
  // (hue, position, size) fire many calls per second and would flood
  // the undo stack with one entry per pointer move. Canvas drags
  // already wrap multi-call sequences in a beginUndoGroup, so a
  // single Cmd+Z reverts the whole drag. Panel slider undo (one step
  // per drag completion) is intentionally deferred.
  updateObject: (id, patch) => set((s) => ({
    objects: s.objects.map((o) => o.id === id ? { ...o, ...patch } : o),
  })),
  removeObject: (id) => set((s) => ({
    ...recordUndoStep(s),
    objects: s.objects.filter((o) => o.id !== id),
    selectedObjectId: s.selectedObjectId === id ? null : s.selectedObjectId,
  })),
  selectedObjectId: null,
  selectObject: (id) => set((s) => {
    // Switching the selection drops any in-progress pen path (its anchors
    // are in the previous object's local frame and would land in the wrong
    // place if reattached) and clears any highlighted collision.
    if (s.pendingPenObjectId && s.pendingPenObjectId !== id) {
      return {
        selectedObjectId: id,
        selectedCollisionId: null,
        pendingPenAnchors: [],
        pendingPenObjectId: null,
        selectedTextureId: id ? null : s.selectedTextureId,
      };
    }
    return {
      selectedObjectId: id,
      selectedCollisionId: null,
      selectedTextureId: id ? null : s.selectedTextureId,
    };
  }),

  objectAssets: {},
  addObjectAsset: ({ assetId: providedAssetId, name, label, dataUrl, width, height, cloudId }) => {
    const assetId = providedAssetId ?? cryptoId();
    const styleId = cryptoId();
    const style: ObjectStyle = { id: styleId, label: label ?? '', dataUrl, width, height, cloudId };
    set((s) => {
      // New assets land at the end of the visible list (highest sortIndex
      // among existing assets + 1). Empty store starts at 0.
      const maxIdx = Object.values(s.objectAssets).reduce(
        (m, a) => Math.max(m, a.sortIndex ?? -1),
        -1,
      );
      return {
        objectAssets: {
          ...s.objectAssets,
          [assetId]: { id: assetId, name, styles: [style], addedAt: Date.now(), sortIndex: maxIdx + 1 },
        },
        // Default the OBJECT-tool brush to the first sprite the user uploads
        // so they can start placing immediately.
        selectedAssetId: s.selectedAssetId ?? assetId,
        selectedStyleId: s.selectedStyleId ?? styleId,
      };
    });
    return { assetId, styleId };
  },
  addStyleToAsset: (assetId, { label, dataUrl, width, height, cloudId }) => {
    const styleId = cryptoId();
    set((s) => {
      const asset = s.objectAssets[assetId];
      if (!asset) return {};
      const style: ObjectStyle = { id: styleId, label: label ?? '', dataUrl, width, height, cloudId };
      return {
        objectAssets: {
          ...s.objectAssets,
          [assetId]: { ...asset, styles: [...asset.styles, style] },
        },
      };
    });
    return styleId;
  },
  removeObjectAsset: (assetId) => set((s) => {
    const next = { ...s.objectAssets };
    delete next[assetId];
    const styleIds = new Set((s.objectAssets[assetId]?.styles ?? []).map((st) => st.id));
    // Also drop the class membership entry so the assetClassIds map
    // doesn't accumulate phantom keys after asset deletes.
    const nextAssetClassIds = { ...s.assetClassIds };
    delete nextAssetClassIds[assetId];
    return {
      objectAssets: next,
      // Drop placed objects referencing any style of this asset — they'd
      // otherwise render as empty rectangles forever.
      objects: s.objects.filter((o) => o.assetId !== assetId),
      selectedAssetId: s.selectedAssetId === assetId ? null : s.selectedAssetId,
      selectedStyleId: s.selectedStyleId && styleIds.has(s.selectedStyleId) ? null : s.selectedStyleId,
      assetClassIds: nextAssetClassIds,
    };
  }),
  removeStyle: (assetId, styleId) => set((s) => {
    const asset = s.objectAssets[assetId];
    if (!asset) return {};
    const remaining = asset.styles.filter((st) => st.id !== styleId);
    if (remaining.length === 0) {
      // Last style — drop the entire asset.
      const next = { ...s.objectAssets };
      delete next[assetId];
      const nextAssetClassIds = { ...s.assetClassIds };
      delete nextAssetClassIds[assetId];
      return {
        objectAssets: next,
        objects: s.objects.filter((o) => o.assetId !== assetId),
        selectedAssetId: s.selectedAssetId === assetId ? null : s.selectedAssetId,
        selectedStyleId: s.selectedStyleId === styleId ? null : s.selectedStyleId,
        assetClassIds: nextAssetClassIds,
      };
    }
    // Remap placed objects on the removed style → the asset's first
    // remaining style. Better than leaving them blank.
    const fallbackId = remaining[0].id;
    return {
      objectAssets: { ...s.objectAssets, [assetId]: { ...asset, styles: remaining } },
      objects: s.objects.map((o) =>
        o.assetId === assetId && o.styleId === styleId ? { ...o, styleId: fallbackId } : o,
      ),
      selectedStyleId: s.selectedStyleId === styleId ? fallbackId : s.selectedStyleId,
    };
  }),
  setStyleLabel: (assetId, styleId, label) => set((s) => {
    const asset = s.objectAssets[assetId];
    if (!asset) return {};
    return {
      objectAssets: {
        ...s.objectAssets,
        [assetId]: {
          ...asset,
          styles: asset.styles.map((st) => st.id === styleId ? { ...st, label } : st),
        },
      },
    };
  }),
  setStyleCloudId: (assetId, styleId, cloudId) => set((s) => {
    const asset = s.objectAssets[assetId];
    if (!asset) return {};
    return {
      objectAssets: {
        ...s.objectAssets,
        [assetId]: {
          ...asset,
          styles: asset.styles.map((st) => st.id === styleId ? { ...st, cloudId } : st),
        },
      },
    };
  }),
  setStyleDataUrl: (assetId, styleId, { dataUrl, width, height }) => set((s) => {
    const asset = s.objectAssets[assetId];
    if (!asset) return {};
    return {
      objectAssets: {
        ...s.objectAssets,
        [assetId]: {
          ...asset,
          styles: asset.styles.map((st) => st.id === styleId
            ? {
                ...st,
                dataUrl,
                width: width ?? st.width,
                height: height ?? st.height,
                // Local bytes diverge from any saved Supabase row — drop
                // the cloudId so a re-save creates a fresh row instead
                // of overwriting the original (or being treated as
                // already-saved by the dedupe path).
                cloudId: undefined,
              }
            : st),
        },
      },
    };
  }),
  setObjectStyle: (objectId, styleId) => set((s) => ({
    objects: s.objects.map((o) => o.id === objectId ? { ...o, styleId } : o),
  })),
  renameAsset: (assetId, name) => set((s) => {
    const asset = s.objectAssets[assetId];
    if (!asset) return {};
    const trimmed = name.trim();
    if (!trimmed || trimmed === asset.name) return {};
    return { objectAssets: { ...s.objectAssets, [assetId]: { ...asset, name: trimmed } } };
  }),
  reorderAssets: (orderedAssetIds) => set((s) => {
    const seen = new Set<string>();
    const next: Record<string, ObjectAsset> = {};
    let idx = 0;
    // Apply the explicit order first.
    for (const id of orderedAssetIds) {
      const a = s.objectAssets[id];
      if (!a || seen.has(id)) continue;
      seen.add(id);
      next[id] = { ...a, sortIndex: idx++ };
    }
    // Append any asset the caller forgot to mention so we never drop assets
    // silently — they keep their relative addedAt ordering at the tail.
    const trailing = Object.values(s.objectAssets)
      .filter((a) => !seen.has(a.id))
      .sort((a, b) => a.addedAt - b.addedAt);
    for (const a of trailing) next[a.id] = { ...a, sortIndex: idx++ };
    return { objectAssets: next };
  }),

  // ── Object-class taxonomy ───────────────────────────────────────
  objectClasses: {},
  assetClassIds: {},
  addObjectClass: ({ name, parentId = null }) => {
    const id = cryptoId();
    set((s) => {
      // Validate parentId — silently re-root if the caller passed a stale id.
      const validParent = parentId && s.objectClasses[parentId] ? parentId : null;
      // New class lands at the end of its sibling group.
      const maxSibling = Object.values(s.objectClasses).reduce(
        (m, c) => (c.parentId === validParent ? Math.max(m, c.sortIndex) : m),
        -1,
      );
      return {
        objectClasses: {
          ...s.objectClasses,
          [id]: { id, name: name.trim() || 'New class', parentId: validParent, sortIndex: maxSibling + 1 },
        },
      };
    });
    return id;
  },
  renameObjectClass: (id, name) => set((s) => {
    const cls = s.objectClasses[id];
    if (!cls) return {};
    const trimmed = name.trim();
    if (!trimmed || trimmed === cls.name) return {};
    return {
      objectClasses: { ...s.objectClasses, [id]: { ...cls, name: trimmed } },
    };
  }),
  removeObjectClass: (id) => set((s) => {
    const cls = s.objectClasses[id];
    if (!cls) return {};
    const next = { ...s.objectClasses };
    delete next[id];
    // Re-parent direct children to this class's parent. The tree just
    // collapses one level under them — they don't disappear.
    for (const c of Object.values(s.objectClasses)) {
      if (c.parentId === id) next[c.id] = { ...c, parentId: cls.parentId };
    }
    // Member assets fall back to root. Tests showed cascade-delete was
    // surprising — users expect the FOLDER to vanish, not the contents.
    const nextAssetClassIds: Record<string, string> = {};
    for (const [assetId, classId] of Object.entries(s.assetClassIds)) {
      if (classId !== id) nextAssetClassIds[assetId] = classId;
    }
    return { objectClasses: next, assetClassIds: nextAssetClassIds };
  }),
  setObjectClassParent: (id, parentId) => set((s) => {
    const cls = s.objectClasses[id];
    if (!cls) return {};
    if (parentId === id) return {}; // Can't be your own parent.
    if (parentId !== null && !s.objectClasses[parentId]) return {};
    // Cycle prevention: walk up from `parentId` and bail if we hit `id`.
    let cur: string | null = parentId;
    const guard = new Set<string>();
    while (cur !== null) {
      if (cur === id) return {};
      if (guard.has(cur)) break; // corrupted state — give up safely
      guard.add(cur);
      cur = s.objectClasses[cur]?.parentId ?? null;
    }
    if (cls.parentId === parentId) return {};
    // Place at the end of the new sibling group.
    const maxSibling = Object.values(s.objectClasses).reduce(
      (m, c) => (c.id !== id && c.parentId === parentId ? Math.max(m, c.sortIndex) : m),
      -1,
    );
    return {
      objectClasses: {
        ...s.objectClasses,
        [id]: { ...cls, parentId, sortIndex: maxSibling + 1 },
      },
    };
  }),
  reorderObjectClasses: (parentId, orderedIds) => set((s) => {
    const seen = new Set<string>();
    const next: Record<string, ObjectClass> = { ...s.objectClasses };
    let idx = 0;
    for (const id of orderedIds) {
      const c = s.objectClasses[id];
      if (!c || c.parentId !== parentId || seen.has(id)) continue;
      seen.add(id);
      next[id] = { ...c, sortIndex: idx++ };
    }
    // Append any sibling the caller forgot, keeping their original relative order.
    const trailing = Object.values(s.objectClasses)
      .filter((c) => c.parentId === parentId && !seen.has(c.id))
      .sort((a, b) => a.sortIndex - b.sortIndex);
    for (const c of trailing) next[c.id] = { ...c, sortIndex: idx++ };
    return { objectClasses: next };
  }),
  setAssetClass: (assetId, classId) => set((s) => {
    if (!s.objectAssets[assetId]) return {};
    if (classId !== null && !s.objectClasses[classId]) return {};
    const next = { ...s.assetClassIds };
    if (classId === null) {
      delete next[assetId];
    } else {
      next[assetId] = classId;
    }
    return { assetClassIds: next };
  }),

  // ── Playable characters ─────────────────────────────────────────
  tileCharacters: {},
  selectedCharacterId: null,
  addTileCharacter: ({ name, src, cols, rows, frameW, frameH, x, y, width, height, fps, speed }) => {
    const id = cryptoId();
    set((s) => {
      const maxIdx = Object.values(s.tileCharacters).reduce(
        (m, c) => Math.max(m, c.sortIndex), -1,
      );
      // Default world size = one frame at 4× source pixel density so a
      // 32×32 source renders at 128×128 world units (visible at default
      // zoom). The character spawns at the world origin; the user can
      // drag it later (Phase 2) once the canvas-side handlers land.
      const w = width ?? Math.max(64, frameW * 2);
      const h = height ?? Math.max(64, frameH * 2);
      const character: TileCharacter = {
        id,
        name: name || 'Character',
        src,
        cols, rows, frameW, frameH,
        x: x ?? 0,
        y: y ?? 0,
        width: w,
        height: h,
        fps: fps ?? 8,
        speed: speed ?? 220,
        animations: {},
        addedAt: Date.now(),
        sortIndex: maxIdx + 1,
      };
      // Match setSelectedCharacterId's mutual-exclusion: a fresh upload
      // jumps focus to the new character, so any prior asset/object
      // selection should clear so the right panel swaps over.
      return {
        tileCharacters: { ...s.tileCharacters, [id]: character },
        selectedCharacterId: id,
        selectedAssetId: null,
        selectedObjectId: null,
      };
    });
    return id;
  },
  removeTileCharacter: (id) => set((s) => {
    if (!s.tileCharacters[id]) return {};
    const next = { ...s.tileCharacters };
    delete next[id];
    return {
      tileCharacters: next,
      selectedCharacterId: s.selectedCharacterId === id ? null : s.selectedCharacterId,
    };
  }),
  renameTileCharacter: (id, name) => set((s) => {
    const c = s.tileCharacters[id];
    const trimmed = name.trim();
    if (!c || !trimmed || trimmed === c.name) return {};
    return { tileCharacters: { ...s.tileCharacters, [id]: { ...c, name: trimmed } } };
  }),
  updateTileCharacter: (id, patch) => set((s) => {
    const c = s.tileCharacters[id];
    if (!c) return {};
    return { tileCharacters: { ...s.tileCharacters, [id]: { ...c, ...patch } } };
  }),
  addCharacterAnimation: (id, direction, input) => {
    const animationId = cryptoId();
    set((s) => {
      const c = s.tileCharacters[id];
      if (!c) return {};
      const list = c.animations?.[direction] ?? [];
      const maxIdx = list.reduce((m, a) => Math.max(m, a.sortIndex ?? -1), -1);
      const animation: CharacterAnimation = {
        id: animationId,
        label: input.label || `Animation ${list.length + 1}`,
        src: input.src,
        cols: input.cols,
        rows: input.rows,
        frameW: input.frameW,
        frameH: input.frameH,
        addedAt: Date.now(),
        sortIndex: maxIdx + 1,
      };
      return {
        tileCharacters: {
          ...s.tileCharacters,
          [id]: {
            ...c,
            animations: {
              ...(c.animations ?? {}),
              [direction]: [...list, animation],
            },
          },
        },
      };
    });
    return animationId;
  },
  removeCharacterAnimation: (id, direction, animationId) => set((s) => {
    const c = s.tileCharacters[id];
    if (!c) return {};
    const list = c.animations?.[direction] ?? [];
    const next = list.filter((a) => a.id !== animationId);
    if (next.length === list.length) return {};
    const nextAnimations: Partial<Record<CharacterDir8, CharacterAnimation[]>> = {
      ...(c.animations ?? {}),
    };
    if (next.length === 0) {
      delete nextAnimations[direction];
    } else {
      nextAnimations[direction] = next;
    }
    return {
      tileCharacters: {
        ...s.tileCharacters,
        [id]: { ...c, animations: nextAnimations },
      },
    };
  }),
  renameCharacterAnimation: (id, direction, animationId, label) => set((s) => {
    const c = s.tileCharacters[id];
    if (!c) return {};
    const list = c.animations?.[direction] ?? [];
    const trimmed = label.trim();
    if (!trimmed) return {};
    let changed = false;
    const next = list.map((a) => {
      if (a.id !== animationId || a.label === trimmed) return a;
      changed = true;
      return { ...a, label: trimmed };
    });
    if (!changed) return {};
    return {
      tileCharacters: {
        ...s.tileCharacters,
        [id]: {
          ...c,
          animations: { ...(c.animations ?? {}), [direction]: next },
        },
      },
    };
  }),
  setCharacterAnimationSrc: (id, direction, animationId, patch) => set((s) => {
    const c = s.tileCharacters[id];
    if (!c) return {};
    const list = c.animations?.[direction] ?? [];
    const idx = list.findIndex((a) => a.id === animationId);
    if (idx < 0) return {};
    const cur = list[idx];
    const next = list.slice();
    next[idx] = {
      ...cur,
      src: patch.src,
      cols: patch.cols ?? cur.cols,
      rows: patch.rows ?? cur.rows,
      frameW: patch.frameW ?? cur.frameW,
      frameH: patch.frameH ?? cur.frameH,
    };
    return {
      tileCharacters: {
        ...s.tileCharacters,
        [id]: {
          ...c,
          animations: { ...(c.animations ?? {}), [direction]: next },
        },
      },
    };
  }),
  reorderCharacterAnimations: (id, direction, orderedIds) => set((s) => {
    const c = s.tileCharacters[id];
    if (!c) return {};
    const list = c.animations?.[direction] ?? [];
    const byId = new Map(list.map((a) => [a.id, a]));
    const seen = new Set<string>();
    const next: CharacterAnimation[] = [];
    for (const animId of orderedIds) {
      const a = byId.get(animId);
      if (!a || seen.has(animId)) continue;
      seen.add(animId);
      next.push(a);
    }
    // Defensive: append any animations missing from the caller's order
    // so a buggy caller can't accidentally drop entries.
    for (const a of list) {
      if (!seen.has(a.id)) next.push(a);
    }
    const reindexed = next.map((a, i) => ({ ...a, sortIndex: i }));
    return {
      tileCharacters: {
        ...s.tileCharacters,
        [id]: {
          ...c,
          animations: { ...(c.animations ?? {}), [direction]: reindexed },
        },
      },
    };
  }),
  replaceCharacterSheet: (id, input) => set((s) => {
    const c = s.tileCharacters[id];
    if (!c) return {};
    return {
      tileCharacters: {
        ...s.tileCharacters,
        [id]: {
          ...c,
          src: input.src,
          cols: input.cols,
          rows: input.rows,
          frameW: input.frameW,
          frameH: input.frameH,
          // Wipe every per-direction animation list — the new sheet's
          // 8 poses no longer match the prior 4×4 sheets the user had
          // uploaded against the old rotation frames.
          animations: {},
        },
      },
    };
  }),
  setSelectedCharacterId: (id) => set((s) => {
    // Selecting a character clears any active asset / canvas-object
    // selection so the right-panel Properties tab swaps cleanly to the
    // character branch — without this, picking a character while an
    // object asset is selected would leave both ids set and the
    // character panel could be hidden behind the object branch.
    if (!id) return { selectedCharacterId: null };
    return {
      selectedCharacterId: id,
      selectedAssetId: null,
      selectedObjectId: null,
      selectedTextureId: null,
    };
  }),
  reorderStyles: (assetId, orderedStyleIds) => {
    const stateBefore = get();
    const asset = stateBefore.objectAssets[assetId];
    if (!asset) return [];
    const byId = new Map(asset.styles.map((st) => [st.id, st]));
    const newStyles: ObjectStyle[] = [];
    const seen = new Set<string>();
    for (const id of orderedStyleIds) {
      const st = byId.get(id);
      if (!st || seen.has(id)) continue;
      seen.add(id);
      newStyles.push(st);
    }
    // Defensive: append any styles missing from the caller's order so we
    // never delete styles via reorder.
    for (const st of asset.styles) {
      if (!seen.has(st.id)) newStyles.push(st);
    }
    set((s) => ({
      objectAssets: { ...s.objectAssets, [assetId]: { ...asset, styles: newStyles } },
    }));
    return newStyles;
  },

  tool: 'paint',
  setTool: (t) => set((s) => {
    // Switching away from the pen tool drops any in-progress path so the
    // dashed preview doesn't linger on screen attached to a tool the user
    // can no longer interact with.
    if (s.tool === 'pen' && t !== 'pen') {
      return { tool: t, pendingPenAnchors: [], pendingPenObjectId: null };
    }
    return { tool: t };
  }),

  selectedCollisionId: null,
  pendingPenAnchors: [],
  pendingPenObjectId: null,
  beginPenPath: (objectId) => set({
    tool: 'pen',
    pendingPenObjectId: objectId,
    pendingPenAnchors: [],
  }),
  addPenAnchor: (anchor) => set((s) => ({
    pendingPenAnchors: [...s.pendingPenAnchors, anchor],
  })),
  updateLastPenAnchor: (patch) => set((s) => {
    if (s.pendingPenAnchors.length === 0) return {};
    const next = s.pendingPenAnchors.slice();
    next[next.length - 1] = { ...next[next.length - 1], ...patch };
    return { pendingPenAnchors: next };
  }),
  commitPenPath: (closed) => {
    const s = get();
    const { pendingPenAnchors, pendingPenObjectId } = s;
    // Need at least 2 anchors for a meaningful path. Single accidental
    // clicks (or pen-tool activation without input) get silently dropped.
    if (!pendingPenObjectId || pendingPenAnchors.length < 2) {
      set({ pendingPenAnchors: [], pendingPenObjectId: null });
      return null;
    }
    const owner = s.objects.find((o) => o.id === pendingPenObjectId);
    if (!owner) {
      set({ pendingPenAnchors: [], pendingPenObjectId: null });
      return null;
    }
    const cid = cryptoId();
    const newCollision: TileCollision = {
      id: cid,
      anchors: pendingPenAnchors,
      closed,
    };
    set((cur) => ({
      ...recordUndoStep(cur),
      objects: cur.objects.map((o) =>
        o.id === pendingPenObjectId
          ? { ...o, collisions: [...(o.collisions ?? []), newCollision] }
          : o,
      ),
      pendingPenAnchors: [],
      pendingPenObjectId: null,
      selectedCollisionId: cid,
    }));
    return cid;
  },
  cancelPenPath: () => set({ pendingPenAnchors: [], pendingPenObjectId: null }),
  selectCollision: (id) => set({ selectedCollisionId: id }),
  deleteCollision: (objectId, collisionId) => set((s) => ({
    ...recordUndoStep(s),
    objects: s.objects.map((o) =>
      o.id === objectId
        ? { ...o, collisions: (o.collisions ?? []).filter((c) => c.id !== collisionId) }
        : o,
    ),
    selectedCollisionId:
      s.selectedCollisionId === collisionId ? null : s.selectedCollisionId,
  })),
  brushSize: 1,
  setBrushSize: (size) => set({ brushSize: Math.max(1, Math.min(16, Math.round(size))) }),
  brushTextureId: null,
  setBrushTextureId: (id) => set({ brushTextureId: id }),
  brushRandomFlipH: false,
  setBrushRandomFlipH: (v) => set({ brushRandomFlipH: v }),
  brushRandomFlipV: false,
  setBrushRandomFlipV: (v) => set({ brushRandomFlipV: v }),
  brushRandomRotate: false,
  setBrushRandomRotate: (v) => set({ brushRandomRotate: v }),
  wavyTextureIds: [],
  setWavyTexture: (textureId, on) => set((s) => {
    // Sibling expansion so toggling on one "water" id picks up every
    // other id labelled / pixel-matched as water in one shot.
    // Inlined to avoid a circular dep with @/lib/wang-tiles.
    const sprite = (() => {
      for (const ts of s.tilesets) {
        const isUpper = ts.upperTextureId === textureId;
        const isLower = ts.lowerTextureId === textureId;
        if (!isUpper && !isLower) continue;
        const idx = isUpper
          ? PURE_UPPER_IDX
          : PURE_LOWER_IDX;
        const tileId = ts.tileIds[idx];
        return s.tiles[tileId]?.dataUrl ?? null;
      }
      return null;
    })();
    function labelOf(id: string): string | null {
      for (const ts of s.tilesets) {
        if (ts.upperTextureId === id) return ts.upperLabel?.trim().toLowerCase() || null;
        if (ts.lowerTextureId === id) return ts.lowerLabel?.trim().toLowerCase() || null;
      }
      return null;
    }
    const baseLabel = labelOf(textureId);
    const family = new Set<string>([textureId]);
    for (const ts of s.tilesets) {
      if (sprite) {
        const u = s.tiles[ts.tileIds[PURE_UPPER_IDX]]?.dataUrl;
        const l = s.tiles[ts.tileIds[PURE_LOWER_IDX]]?.dataUrl;
        if (u === sprite) family.add(ts.upperTextureId);
        if (l === sprite) family.add(ts.lowerTextureId);
      }
      if (baseLabel) {
        const ul = ts.upperLabel?.trim().toLowerCase() || null;
        const ll = ts.lowerLabel?.trim().toLowerCase() || null;
        if (ul && ul === baseLabel) family.add(ts.upperTextureId);
        if (ll && ll === baseLabel) family.add(ts.lowerTextureId);
      }
    }
    const current = new Set(s.wavyTextureIds);
    if (on) for (const id of family) current.add(id);
    else for (const id of family) current.delete(id);
    return { wavyTextureIds: Array.from(current) };
  }),
  baseTextureId: null,
  setBaseTexture: (id) => set({ baseTextureId: id }),
  tilesetTints: {},
  setTilesetBucketTint: (tilesetId, bucketId, patch) => set((s) => {
    const next: TileStore['tilesetTints'] = { ...s.tilesetTints };
    const tilesetEntry = { ...(next[tilesetId] ?? {}) };
    if (patch === null) {
      delete tilesetEntry[bucketId];
    } else {
      const current = tilesetEntry[bucketId] ?? { hue: 0, saturation: 1, brightness: 1 };
      const merged = {
        hue: patch.hue ?? current.hue,
        saturation: patch.saturation ?? current.saturation,
        brightness: patch.brightness ?? current.brightness,
      };
      if (merged.hue === 0 && merged.saturation === 1 && merged.brightness === 1) {
        delete tilesetEntry[bucketId];
      } else {
        tilesetEntry[bucketId] = merged;
      }
    }
    if (Object.keys(tilesetEntry).length === 0) delete next[tilesetId];
    else next[tilesetId] = tilesetEntry;
    return { tilesetTints: next };
  }),
  clearTilesetTints: (tilesetId) => set((s) => {
    if (!s.tilesetTints[tilesetId]) return {};
    const next = { ...s.tilesetTints };
    delete next[tilesetId];
    return { tilesetTints: next };
  }),
  selectedAssetId: null,
  setSelectedAssetId: (id) => set((s) => {
    // When switching assets, reset the style brush to the new asset's first
    // style so the OBJECT tool always has a valid sprite to place.
    const fallback = id ? s.objectAssets[id]?.styles[0]?.id ?? null : null;
    // Selecting an asset card clears any active character selection so the
    // right-panel Properties tab swaps to the asset/object branch instead
    // of staying stuck on the character panel.
    return {
      selectedAssetId: id,
      selectedStyleId: fallback,
      selectedCharacterId: id ? null : s.selectedCharacterId,
      selectedTextureId: id ? null : s.selectedTextureId,
    };
  }),
  selectedStyleId: null,
  setSelectedStyleId: (id) => set({ selectedStyleId: id }),
  selectedTextureId: null,
  setSelectedTextureId: (id) => set((s) => ({
    selectedTextureId: id,
    selectedAssetId: id ? null : s.selectedAssetId,
    selectedCharacterId: id ? null : s.selectedCharacterId,
    selectedObjectId: id ? null : s.selectedObjectId,
  })),

  fencePosts: {},
  fenceEdges: {},
  selectedFencePostKey: null,
  placeFenceAt: (cx, cy) => set((s) => {
    const newKey = `${cx},${cy}`;
    const sel = s.selectedFencePostKey;
    // Toggle deselect when clicking the same post — pure selection
    // change, no world mutation, so don't burn an undo step on it.
    if (sel === newKey) return { selectedFencePostKey: null };
    const posts = { ...s.fencePosts, [newKey]: true as const };
    let edges = s.fenceEdges;
    if (sel && sel !== newKey) {
      const [sx, sy] = sel.split(',').map(Number);
      const dx = cx - sx;
      const dy = cy - sy;
      if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) {
        const a = sel < newKey ? sel : newKey;
        const b = sel < newKey ? newKey : sel;
        const ek = `${a}|${b}`;
        if (!edges[ek]) edges = { ...edges, [ek]: true };
      }
    }
    return { ...recordUndoStep(s), fencePosts: posts, fenceEdges: edges, selectedFencePostKey: newKey };
  }),
  setSelectedFencePostKey: (key) => set({ selectedFencePostKey: key }),
  clearFences: () => set((s) => ({ ...recordUndoStep(s), fencePosts: {}, fenceEdges: {}, selectedFencePostKey: null })),

  camera: { x: 0, y: 0, zoom: 1 },
  setCamera: (cam) => set((s) => ({ camera: { ...s.camera, ...cam } })),
  showGrid: true,
  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
  resetCamera: () => set({ camera: { x: 0, y: 0, zoom: 1 } }),

  playCameraFollow: true,
  setPlayCameraFollow: (v) => set({ playCameraFollow: !!v }),
  playCameraSmoothing: 0.15,
  setPlayCameraSmoothing: (v) => set({ playCameraSmoothing: Math.max(0, Math.min(1, v)) }),
  playCameraZoom: 1.5,
  setPlayCameraZoom: (v) => set({ playCameraZoom: Math.max(0.1, Math.min(8, v)) }),

  genSeed: 0xC0FFEE,
  setGenSeed: (seed) => set({ genSeed: (Math.floor(seed) >>> 0) }),
  rerollGenSeed: () => set({ genSeed: ((Math.random() * 0x100000000) >>> 0) }),
  genScale: 18,
  setGenScale: (v) => set({ genScale: Math.max(2, Math.min(128, v)) }),
  genTextureWeights: {},
  setGenTextureWeight: (textureId, weight) => set((s) => ({
    genTextureWeights: { ...s.genTextureWeights, [textureId]: Math.max(0, Math.min(2, weight)) },
  })),
  genOctaves: 2,
  setGenOctaves: (v) => set({ genOctaves: Math.max(1, Math.min(4, Math.round(v))) }),
  genRoughness: 0.5,
  setGenRoughness: (v) => set({ genRoughness: Math.max(0, Math.min(0.99, v)) }),
  genIslandEnabled: false,
  setGenIslandEnabled: (v) => set({ genIslandEnabled: !!v }),
  genIslandRadius: 200,
  setGenIslandRadius: (v) => set({ genIslandRadius: Math.max(32, Math.min(512, Math.round(v))) }),
  genReserveRadius: 64,
  setGenReserveRadius: (v) => set({ genReserveRadius: Math.max(8, Math.min(256, Math.round(v))) }),
  genReserveShape: 'square',
  setGenReserveShape: (v) => set({ genReserveShape: v === 'circle' ? 'circle' : 'square' }),

  clearMap: () => set((s) => ({
    ...recordUndoStep(s),
    layers: s.layers.map((l) => ({ ...l, corners: {} })),
    objects: [],
    fencePosts: {},
    fenceEdges: {},
    selectedFencePostKey: null,
  })),

  // ── Undo / Redo ─────────────────────────────────────────────────
  _undoPast: [],
  _undoFuture: [],
  _undoOpen: false,
  beginUndoGroup: () => set((s) => {
    // Idempotent: a re-entrant begin (e.g. paint-down → paint-down
    // because pointer never lifted) shouldn't double-snapshot.
    if (s._undoOpen) return {};
    const snap = takeSnapshot(s);
    const past = s._undoPast.length >= UNDO_LIMIT
      ? [...s._undoPast.slice(-(UNDO_LIMIT - 1)), snap]
      : [...s._undoPast, snap];
    return { _undoPast: past, _undoFuture: [], _undoOpen: true };
  }),
  commitUndoGroup: () => set((s) => {
    if (!s._undoOpen) return {};
    return { _undoOpen: false };
  }),
  undo: () => set((s) => {
    if (s._undoPast.length === 0) return {};
    const past = s._undoPast.slice();
    const prev = past.pop()!;
    const current = takeSnapshot(s);
    const future = s._undoFuture.length >= UNDO_LIMIT
      ? [...s._undoFuture.slice(-(UNDO_LIMIT - 1)), current]
      : [...s._undoFuture, current];
    return {
      layers: prev.layers,
      objects: prev.objects,
      fencePosts: prev.fencePosts,
      fenceEdges: prev.fenceEdges,
      _undoPast: past,
      _undoFuture: future,
      _undoOpen: false,
      // Drop selections that point at things the snapshot doesn't have.
      selectedObjectId: s.selectedObjectId && prev.objects.some((o) => o.id === s.selectedObjectId)
        ? s.selectedObjectId
        : null,
      selectedFencePostKey: s.selectedFencePostKey && prev.fencePosts[s.selectedFencePostKey]
        ? s.selectedFencePostKey
        : null,
      // Active layer might have been a layer that didn't exist yet
      // pre-snapshot; snap back to a layer that does exist.
      activeLayerId: prev.layers.some((l) => l.id === s.activeLayerId)
        ? s.activeLayerId
        : prev.layers[0]?.id ?? s.activeLayerId,
    };
  }),
  redo: () => set((s) => {
    if (s._undoFuture.length === 0) return {};
    const future = s._undoFuture.slice();
    const next = future.pop()!;
    const current = takeSnapshot(s);
    const past = s._undoPast.length >= UNDO_LIMIT
      ? [...s._undoPast.slice(-(UNDO_LIMIT - 1)), current]
      : [...s._undoPast, current];
    return {
      layers: next.layers,
      objects: next.objects,
      fencePosts: next.fencePosts,
      fenceEdges: next.fenceEdges,
      _undoPast: past,
      _undoFuture: future,
      _undoOpen: false,
      selectedObjectId: s.selectedObjectId && next.objects.some((o) => o.id === s.selectedObjectId)
        ? s.selectedObjectId
        : null,
      selectedFencePostKey: s.selectedFencePostKey && next.fencePosts[s.selectedFencePostKey]
        ? s.selectedFencePostKey
        : null,
      activeLayerId: next.layers.some((l) => l.id === s.activeLayerId)
        ? s.activeLayerId
        : next.layers[0]?.id ?? s.activeLayerId,
    };
  }),
}), {
  // v7 — ObjectAsset gained nested `styles[]` (multi-variant per asset);
  // TileObject gained `styleId`. Old v6 persisted objects only had
  // `assetId` and would crash the renderer (no styleId → no style lookup),
  // so we let the persist key bump drop them. Cloud rehydrate will repopulate
  // assets/styles.
  // v8 — TileObject gained `collisions[]` (pen-tool boundaries). Optional,
  // back-filled on rehydrate, so the bump is purely defensive: existing
  // saves load fine, just without any collision polygons.
  // v9 — Added `objectClasses` (taxonomy folders) and `assetClassIds`
  // (asset → class membership). Both are local-only persisted state with
  // tiny payloads (no dataUrls), so they ship in partialize and back-fill
  // to {} on rehydrate. Bump is defensive: pre-v9 stores load fine and
  // simply show every asset under "Uncategorised" until the user creates
  // a class.
  // v10 — Added `tileCharacters` (Characters sub-tab playable sprites)
  // and `selectedCharacterId`. Sheets persist as data URLs so an offline
  // reload keeps the player available; pre-v10 stores load fine and
  // simply hydrate to {} / null.
  name: 'problocks-tile-v10',
  // Coalesce localStorage writes — see makeDeferredLocalStorage above.
  // Painting at 90k corners was firing JSON.stringify of the whole map
  // on every cell, which alone burned 30–80 ms on Chromebook-class
  // hardware. Deferring to one flush per ~500 ms idle (plus beforeunload)
  // keeps strokes responsive without losing data.
  storage: makeDeferredLocalStorage(500),
  // Big blobs (sheet PNG dataUrls, sliced tile dataUrls, object-style
  // dataUrls) are NOT persisted — Supabase is the source of truth and
  // they rehydrate when the panel mounts. Persisting them used to blow
  // through the ~5 MB localStorage cap on accounts with several sheets,
  // throwing QuotaExceededError on every paint stroke. Map state
  // (layers/corners/objects) and small selections still persist so an
  // online reload looks the same after cloud rehydrate. An OFFLINE
  // reload will see corners/objects with no tilesets/assets behind them
  // until the user re-uploads — corners referencing missing texture ids
  // simply don't render, no crash.
  partialize: (s) => ({
    tileSize: s.tileSize,
    layers: s.layers,
    activeLayerId: s.activeLayerId,
    objects: s.objects,
    selectedAssetId: s.selectedAssetId,
    selectedStyleId: s.selectedStyleId,
    brushTextureId: s.brushTextureId,
    brushRandomFlipH: s.brushRandomFlipH,
    brushRandomFlipV: s.brushRandomFlipV,
    brushRandomRotate: s.brushRandomRotate,
    wavyTextureIds: s.wavyTextureIds,
    baseTextureId: s.baseTextureId,
    tilesetTints: s.tilesetTints,
    showGrid: s.showGrid,
    fencePosts: s.fencePosts,
    fenceEdges: s.fenceEdges,
    // Class taxonomy: tiny local-only index (id/name/parentId/sortIndex
    // per class + assetId→classId map). No image bytes here.
    objectClasses: s.objectClasses,
    assetClassIds: s.assetClassIds,
    // Playable characters — sheet src DOES persist (sheets are typically
    // <200 KB so even a few characters stay well under the 5–10 MB
    // localStorage cap). Letting an offline reload keep the player
    // available is the whole point.
    tileCharacters: s.tileCharacters,
    selectedCharacterId: s.selectedCharacterId,
    playCameraFollow: s.playCameraFollow,
    playCameraSmoothing: s.playCameraSmoothing,
    playCameraZoom: s.playCameraZoom,
    genSeed: s.genSeed,
    genScale: s.genScale,
    genTextureWeights: s.genTextureWeights,
    genOctaves: s.genOctaves,
    genRoughness: s.genRoughness,
    genIslandEnabled: s.genIslandEnabled,
    genIslandRadius: s.genIslandRadius,
    genReserveRadius: s.genReserveRadius,
    genReserveShape: s.genReserveShape,
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
      if (!l.cellTransforms) l.cellTransforms = {};
    }
    // Backfill texture ids for tilesets that pre-date the chaining feature.
    // Each gets its own fresh id so old tilesets aren't accidentally
    // "connected" to anything new.
    for (const t of state.tilesets ?? []) {
      if (!t.upperTextureId) t.upperTextureId = cryptoId();
      if (!t.lowerTextureId) t.lowerTextureId = cryptoId();
      // Tilesets persisted before terrain labels existed get a one-shot
      // auto-parse from `name` so previously-uploaded sheets like
      // "grass-water" + "grass-dirt" gain the shared "grass" label and the
      // sibling-aware brush kicks in without re-uploading.
      if (t.upperLabel === undefined && t.lowerLabel === undefined && t.name) {
        const norm = t.name.toLowerCase().trim();
        const patterns: RegExp[] = [
          /^(.+?)\s*->\s*(.+)$/,
          /^(.+?)\s*→\s*(.+)$/,
          /^(.+?)\s+to\s+(.+)$/i,
          /^(.+?)\s*[-_/|]\s*(.+)$/,
        ];
        for (const p of patterns) {
          const m = norm.match(p);
          if (!m) continue;
          const a = m[1].trim();
          const b = m[2].trim();
          if (a && b && a !== b) {
            t.upperLabel = a;
            t.lowerLabel = b;
            break;
          }
        }
      }
    }
    // v6: objectAssets is new; default to empty if missing.
    if (!state.objectAssets) state.objectAssets = {};
    // Fence component (added 2026-04-27) — backfill empty maps.
    if (!state.fencePosts) state.fencePosts = {};
    if (!state.fenceEdges) state.fenceEdges = {};
    if (state.selectedFencePostKey === undefined) state.selectedFencePostKey = null;
    // Backfill hue on any TileObject persisted before the field was added.
    // Optional in TypeScript would leak `?` everywhere; one-shot backfill
    // keeps the renderer simple (it never sees `undefined` for hue).
    for (const o of state.objects ?? []) {
      if (typeof o.hue !== 'number') o.hue = 0;
      // v8: pen-tool collisions. Default to empty array so renderers and
      // panels never have to nullish-coalesce when iterating.
      if (!Array.isArray(o.collisions)) o.collisions = [];
    }
    // v7+: backfill sortIndex for assets that pre-date drag-reorder. Use
    // addedAt as a stable tie-breaker so the displayed order doesn't
    // jitter on first load after the upgrade.
    let needsBackfill = false;
    for (const a of Object.values(state.objectAssets)) {
      if (typeof a.sortIndex !== 'number') { needsBackfill = true; break; }
    }
    if (needsBackfill) {
      const sorted = Object.values(state.objectAssets).sort((a, b) => (a.addedAt ?? 0) - (b.addedAt ?? 0));
      sorted.forEach((a, i) => { a.sortIndex = i; });
    }
    // v9: object-class taxonomy. Default to empty maps so existing
    // (pre-v9) saves load with everything under "Uncategorised".
    if (!state.objectClasses) state.objectClasses = {};
    if (!state.assetClassIds) state.assetClassIds = {};
    // Defensive: drop any assetClassIds entry whose class no longer exists
    // (a class deleted in another tab, an import drift, etc.) so the
    // recursive renderer doesn't see a phantom class id.
    for (const [assetId, classId] of Object.entries(state.assetClassIds)) {
      if (!state.objectClasses[classId]) delete state.assetClassIds[assetId];
    }
    // Defensive: also re-root any class whose parentId points at a
    // class that vanished. Cycle detection would catch this on next move
    // anyway, but the renderer reads parents directly.
    for (const c of Object.values(state.objectClasses)) {
      if (c.parentId !== null && !state.objectClasses[c.parentId]) {
        c.parentId = null;
      }
    }
    // v10: playable characters. Pre-v10 saves had no characters map;
    // default to empty so the panel mounts without errors.
    if (!state.tileCharacters) state.tileCharacters = {};
    if (state.selectedCharacterId === undefined) state.selectedCharacterId = null;
    // Drop a selectedCharacterId pointing at a character that vanished
    // (e.g. user removed it before reload).
    if (state.selectedCharacterId && !state.tileCharacters[state.selectedCharacterId]) {
      state.selectedCharacterId = null;
    }
    // Backfill the per-direction `animations` map on characters persisted
    // before the Animations sub-tab was added.
    //
    // Two shapes have existed: the original was `Partial<Record<dir,
    // CharacterAnimation>>` (one sheet per direction) and the current is
    // `Partial<Record<dir, CharacterAnimation[]>>` (ordered list). Saves
    // from the original shape are migrated by wrapping the single sheet
    // in a one-element list with a generated id + default label, so the
    // new panel sees the previously-uploaded data without crashing.
    for (const c of Object.values(state.tileCharacters)) {
      if (!c.animations || typeof c.animations !== 'object') {
        c.animations = {};
        continue;
      }
      const next: Partial<Record<CharacterDir8, CharacterAnimation[]>> = {};
      for (const dirKey of Object.keys(c.animations) as CharacterDir8[]) {
        const value = (c.animations as Partial<Record<CharacterDir8, unknown>>)[dirKey];
        if (Array.isArray(value)) {
          next[dirKey] = value.map((a, i) => ({
            id: typeof a.id === 'string' ? a.id : cryptoId(),
            label: typeof a.label === 'string' ? a.label : `Animation ${i + 1}`,
            src: a.src,
            cols: a.cols,
            rows: a.rows,
            frameW: a.frameW,
            frameH: a.frameH,
            addedAt: typeof a.addedAt === 'number' ? a.addedAt : Date.now(),
            sortIndex: typeof a.sortIndex === 'number' ? a.sortIndex : i,
          })) as CharacterAnimation[];
        } else if (value && typeof value === 'object' && 'src' in (value as object)) {
          // Pre-list shape: a single CharacterAnimation. Wrap it.
          const a = value as { src: string; cols: number; rows: number; frameW: number; frameH: number; addedAt?: number };
          next[dirKey] = [{
            id: cryptoId(),
            label: 'Animation 1',
            src: a.src,
            cols: a.cols,
            rows: a.rows,
            frameW: a.frameW,
            frameH: a.frameH,
            addedAt: a.addedAt ?? Date.now(),
            sortIndex: 0,
          }];
        }
      }
      c.animations = next;
    }
  },
}));

/**
 * Find the (asset, style) pair for a TileObject. Centralised here so
 * renderers and panels don't keep re-implementing the nested lookup.
 * Returns null when the asset or style was deleted but the object still
 * references them — the caller decides whether to skip rendering or
 * surface a warning.
 */
export function findStyle(
  objectAssets: Record<string, ObjectAsset>,
  assetId: string,
  styleId: string,
): { asset: ObjectAsset; style: ObjectStyle } | null {
  const asset = objectAssets[assetId];
  if (!asset) return null;
  const style = asset.styles.find((st) => st.id === styleId);
  if (!style) return null;
  return { asset, style };
}

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
