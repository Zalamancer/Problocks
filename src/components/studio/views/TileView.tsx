'use client';

import { useCallback, useEffect, useRef } from 'react';
import {
  MousePointer2, Paintbrush, Eraser, PaintBucket, Pipette, Trash2, Maximize2,
  Grid3X3, Sparkles, Box, FlipHorizontal2, FlipVertical2, RotateCw, Fence,
  PenTool, Image as ImageIcon,
} from 'lucide-react';
import {
  useTile,
  type TileTool,
  type TilePenAnchor,
  type TileCollision,
  type CharacterDir8,
  findStyle,
  tileDataUrlFor,
} from '@/store/tile-store';
import {
  findCharacterAnimation,
  type CharacterActionId,
} from '@/lib/character-actions';
import { useStudio } from '@/store/studio-store';
import { useSceneStore } from '@/store/scene-store';
import { useRoom } from '@/store/room-store';
import { resolveCellTile, pickAdjustedBrushTexture, canPlaceCorners } from '@/lib/wang-tiles';
import { recolorTile, hasActiveAdjustments } from '@/lib/tile-palette';
import { generateRegion, generateRivers } from '@/lib/world-gen';
import {
  useTileRealtime,
  buildPaintEvent,
  buildEraseEvent,
} from '@/hooks/use-tile-realtime';
import { ALL_CORNERS, type Corner } from '@/lib/room-geometry';
import { RoomZoneOverlay } from './RoomZoneOverlay';
import { RoomViewSwitcher } from './RoomViewSwitcher';

/**
 * Read a File as a data: URL so it survives a page reload. Mirrors the
 * helper in FreeformView — kept local here so pasting an image into the
 * tile canvas can hand it to `addObjectAsset` without round-tripping
 * through the freeform store.
 */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('read failed'));
    reader.readAsDataURL(file);
  });
}

/** Encode raw SVG markup as a base64 data URL (UTF-8 safe). */
function svgMarkupToDataUrl(markup: string): string {
  const bytes = new TextEncoder().encode(markup);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 1) bin += String.fromCharCode(bytes[i]);
  return 'data:image/svg+xml;base64,' + btoa(bin);
}

/** Heuristic — does this string look like a self-contained SVG document? */
function looksLikeSvgMarkup(text: string): boolean {
  const t = text.trim();
  return /^<\?xml[^>]*\?>\s*<svg[\s>]/i.test(t) || /^<svg[\s>]/i.test(t);
}

/**
 * Build the Path2D segment list for a TileCollision in object-local coords.
 * Mirrors `collisionToPath` from `lib/freeform-geom.ts` — kept inline so
 * the renderer (Canvas2D, no SVG path strings) can stroke/fill directly
 * via Path2D.
 */
function buildCollisionPath2D(c: { anchors: TilePenAnchor[]; closed: boolean }): Path2D {
  const p = new Path2D();
  if (c.anchors.length === 0) return p;
  const a0 = c.anchors[0];
  p.moveTo(a0.x, a0.y);
  for (let i = 1; i < c.anchors.length; i++) {
    const prev = c.anchors[i - 1];
    const cur = c.anchors[i];
    appendSegment(p, prev, cur);
  }
  if (c.closed) {
    appendSegment(p, c.anchors[c.anchors.length - 1], a0);
    p.closePath();
  }
  return p;
}

/**
 * 8-way compass directions used by the play-mode character renderer.
 * `idle` is the not-moving state — renders the centre cell of the 3×3
 * sprite sheet (cell 4) so authors can put a face-forward standing pose
 * there.
 */
type Dir8 =
  | 'idle'
  | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';

/**
 * Direction → cell-index map for a 3×3 character sprite sheet.
 * Sheet layout is sequential reading order (top-to-bottom, left-to-right):
 *
 *   S(0)  SE(1) E(2)
 *   NE(3) N(4)  NW(5)
 *   W(6)  SW(7) [discarded(8)]
 *
 * All 8 directions have unique cells; cell 8 is intentionally discarded
 * per the upload spec. There's no dedicated idle frame in this layout,
 * so `idle` reuses S (cell 0) — the natural face-camera standing pose
 * for a character at rest.
 */
const DIR_CELL_INDEX: Record<Dir8, number> = {
  s: 0, se: 1, e: 2,
  ne: 3, n: 4, nw: 5,
  w: 6, sw: 7,
  idle: 0,
};

/**
 * Snap a velocity vector (any non-zero direction) to one of the 8
 * compass headings. The 8 sectors each span π/4 radians; we add an
 * angle bias so straight-N points to 'n' rather than splitting across
 * the boundary. Returns 'idle' when |v| ≈ 0 (caller already filters
 * but this guards against jitter).
 */
function dirFromVelocity(vx: number, vy: number): Dir8 {
  const mag = Math.hypot(vx, vy);
  if (mag < 0.001) return 'idle';
  // Y is screen-down (canvas convention) so up is negative; angle is
  // measured clockwise from +x axis.
  const angle = Math.atan2(vy, vx);
  // Snap to nearest π/4 sector → -4..4. We want 8 unique buckets.
  const sector = (Math.round(angle / (Math.PI / 4)) + 8) % 8;
  // Sector mapping (clockwise from +x = E):
  //   0 = E, 1 = SE, 2 = S, 3 = SW, 4 = W, 5 = NW, 6 = N, 7 = NE
  return (['e', 'se', 's', 'sw', 'w', 'nw', 'n', 'ne'] as const)[sector];
}

/**
 * True when the character at world (worldX, worldY) is standing on a
 * water cell. Water is detected from each tileset's `upperLabel` /
 * `lowerLabel` — any label containing "water" (case-insensitive) marks
 * its texture id as water. No manual marking is required: the user
 * just labels their water sheets "water" (which is also the auto-derived
 * label for sheets named e.g. "grass-water").
 *
 * Threshold is 2/4 corners so a transition tile (sand → water) only
 * counts as "in water" once you're past its halfway mark, matching
 * platformer / RPG intuition. Pure water (4/4) and most river bodies
 * (2-3/4) trigger swim; coastal sand (0-1/4) does not.
 */
function isCharacterInWater(worldX: number, worldY: number): boolean {
  const tile = useTile.getState();
  // All these reads are defensive — Zustand persist may hand back a
  // partially-hydrated state on first paint where the slice fields are
  // undefined. Treating them as empty just means "no water this tick"
  // until the store is fully restored.
  const tilesets = tile.tilesets ?? [];
  if (tilesets.length === 0) return false;
  const waterIds = new Set<string>();
  for (const ts of tilesets) {
    const upper = (ts.upperLabel ?? '').toLowerCase();
    const lower = (ts.lowerLabel ?? '').toLowerCase();
    if (ts.upperTextureId && upper.includes('water')) waterIds.add(ts.upperTextureId);
    if (ts.lowerTextureId && lower.includes('water')) waterIds.add(ts.lowerTextureId);
  }
  if (waterIds.size === 0) return false;
  const cellSize = tile.tileSize ?? 32;
  const cx = Math.floor(worldX / cellSize);
  const cy = Math.floor(worldY / cellSize);
  const baseLayers = tile.layers ?? [];
  const layers = tile.playLayer ? [...baseLayers, tile.playLayer] : baseLayers;
  for (const layer of layers) {
    if (!layer || !layer.corners) continue;
    let waterCount = 0;
    const a = layer.corners[`${cx},${cy}`];
    const b = layer.corners[`${cx + 1},${cy}`];
    const c = layer.corners[`${cx},${cy + 1}`];
    const d = layer.corners[`${cx + 1},${cy + 1}`];
    if (a && waterIds.has(a)) waterCount++;
    if (b && waterIds.has(b)) waterCount++;
    if (c && waterIds.has(c)) waterCount++;
    if (d && waterIds.has(d)) waterCount++;
    if (waterCount >= 2) return true;
  }
  return false;
}

function appendSegment(p: Path2D, prev: TilePenAnchor, cur: TilePenAnchor) {
  const hasOut = prev.outX !== undefined && prev.outY !== undefined;
  const hasIn = cur.inX !== undefined && cur.inY !== undefined;
  if (hasOut || hasIn) {
    const c1x = hasOut ? prev.x + (prev.outX as number) : prev.x;
    const c1y = hasOut ? prev.y + (prev.outY as number) : prev.y;
    const c2x = hasIn ? cur.x + (cur.inX as number) : cur.x;
    const c2y = hasIn ? cur.y + (cur.inY as number) : cur.y;
    p.bezierCurveTo(c1x, c1y, c2x, c2y, cur.x, cur.y);
  } else {
    p.lineTo(cur.x, cur.y);
  }
}

/**
 * 2D Tile-based editor canvas — Wang/dual-grid auto-tiling.
 *
 * Painting model: the user clicks a cell; the renderer marks the cell's
 * 4 corners as "upper" in the active layer's corner map. The visible tile
 * picked for each cell is computed live from its 4 surrounding corners
 * via the lookup in `lib/wang-tiles.ts`. Brush size N = an N×N block of
 * cells gets all corners filled in one click.
 *
 * Inputs:
 *   - Left-click  → paint / fill / eyedrop / select / object (depends on tool)
 *   - Right-click → erase under brush (clears the 4 corners around the cell)
 *   - Middle / space-drag → pan
 *   - Wheel       → pan (Cmd/Ctrl+wheel = zoom toward cursor)
 *   - 1..6        → tool shortcuts (select/paint/erase/fill/eyedrop/object)
 *   - [ ]         → brush size
 *   - G           → toggle grid
 *   - Delete      → remove selected object
 */
/**
 * Build the synthetic procgen overlay (playLayer + playObjects) from the
 * current tile-store gen-* fields. Pure side-effecting function: reads
 * current state via getState(), writes the overlay via setPlayLayer /
 * setPlayObjects. Called from both the Play start path and the live
 * preview effect so the two stay byte-for-byte identical.
 *
 * Returns true when an overlay was published (palette had at least one
 * texture id), false when nothing changed — caller can use that to
 * decide whether to clear an existing overlay.
 */
function buildPlayOverlay(): boolean {
  const tile = useTile.getState();
  const palette: string[] = [];
  for (const ts of tile.tilesets) {
    if (ts.upperTextureId) palette.push(ts.upperTextureId);
    if (ts.lowerTextureId) palette.push(ts.lowerTextureId);
  }
  if (palette.length === 0) return false;
  const RESERVE = tile.genReserveRadius;
  const RADIUS = Math.max(256, RESERVE + 192);
  const reserveShape = tile.genReserveShape;
  const outputMode: 'cells' | 'corners' = tile.genSmoothEdges ? 'corners' : 'cells';
  const inReserve = (cx: number, cy: number) =>
    reserveShape === 'circle'
      ? cx * cx + cy * cy < RESERVE * RESERVE
      : Math.abs(cx) < RESERVE && Math.abs(cy) < RESERVE;

  const samples = generateRegion({
    x0: -RADIUS,
    y0: -RADIUS,
    x1: RADIUS,
    y1: RADIUS,
    seed: tile.genSeed,
    palette,
    scale: tile.genScale,
    octaves: tile.genOctaves,
    roughness: tile.genRoughness,
    warp: tile.genWarp,
    output: outputMode,
    weights: tile.genTextureWeights,
    island: tile.genIslandEnabled
      ? { radius: tile.genIslandRadius }
      : undefined,
    skipCell: inReserve,
  });
  if (samples.length > 0) {
    const corners: Record<string, string> = {};
    if (outputMode === 'corners') {
      for (const { cx, cy, texId } of samples) {
        corners[`${cx},${cy}`] = texId;
      }
    } else {
      for (const { cx, cy, texId } of samples) {
        corners[`${cx},${cy}`] = texId;
        corners[`${cx + 1},${cy}`] = texId;
        corners[`${cx},${cy + 1}`] = texId;
        corners[`${cx + 1},${cy + 1}`] = texId;
      }
    }
    if (
      tile.genRiverEnabled
      && tile.genRiverTextureId
      && tile.genRiverCount > 0
    ) {
      const riverCells = generateRivers({
        x0: -RADIUS,
        y0: -RADIUS,
        x1: RADIUS,
        y1: RADIUS,
        seed: tile.genSeed,
        count: tile.genRiverCount,
        width: tile.genRiverWidth,
        texId: tile.genRiverTextureId,
        skipCell: inReserve,
      });
      for (const { cx, cy, texId } of riverCells) {
        corners[`${cx},${cy}`] = texId;
        corners[`${cx + 1},${cy}`] = texId;
        corners[`${cx},${cy + 1}`] = texId;
        corners[`${cx + 1},${cy + 1}`] = texId;
      }
    }
    tile.setPlayLayer({
      id: '__play_overlay__',
      name: 'Play Overlay',
      visible: true,
      opacity: 1,
      tilesetId: null,
      corners,
      // Bbox is the known generation rectangle plus one corner index
      // on the high side because corners at (RADIUS, RADIUS) are
      // valid (not RADIUS - 1). Avoids the per-frame walk over every
      // corner key — see the renderer's bbox cache path.
      bbox: { minX: -RADIUS, minY: -RADIUS, maxX: RADIUS, maxY: RADIUS },
    });
  }

  // ── Object scatter ───────────────────────────────────────────
  const objectAssetEntries = Object.entries(tile.genObjectWeights)
    .filter(([id, w]) => w > 0 && tile.objectAssets[id])
    .map(([id, w]) => ({ id, weight: w, asset: tile.objectAssets[id] }));
  if (tile.genObjectDensity > 0 && objectAssetEntries.length > 0) {
    const totalW = objectAssetEntries.reduce((a, e) => a + e.weight, 0);
    const ts = tile.tileSize;
    const seed = tile.genSeed;
    const rngAt = (cx: number, cy: number, salt: number) => {
      let h = (seed ^ salt) >>> 0;
      h = Math.imul(h ^ (cx >>> 0), 0x9E3779B1) >>> 0;
      h = Math.imul(h ^ (cy >>> 0), 0x85EBCA77) >>> 0;
      h ^= h >>> 16;
      return (h >>> 0) / 4294967296;
    };
    const scattered: typeof tile.playObjects = [];
    let scatterSeq = 0;
    for (let cy = -RADIUS; cy < RADIUS; cy++) {
      for (let cx = -RADIUS; cx < RADIUS; cx++) {
        if (inReserve(cx, cy)) continue;
        if (rngAt(cx, cy, 0xA1) >= tile.genObjectDensity) continue;
        let pick = rngAt(cx, cy, 0xB2) * totalW;
        let chosen = objectAssetEntries[0];
        for (const e of objectAssetEntries) {
          if (pick < e.weight) { chosen = e; break; }
          pick -= e.weight;
        }
        const style = chosen.asset.styles[0];
        if (!style) continue;
        const jx = (rngAt(cx, cy, 0xC3) - 0.5) * ts * 0.5;
        const jy = (rngAt(cx, cy, 0xD4) - 0.5) * ts * 0.5;
        scattered.push({
          id: `__scatter__${scatterSeq++}`,
          layerId: '__play_overlay__',
          x: (cx + 0.5) * ts + jx,
          y: (cy + 0.5) * ts + jy,
          assetId: chosen.id,
          styleId: style.id,
          width: style.width,
          height: style.height,
          rotation: 0,
          flipX: false,
          flipY: false,
          hue: 0,
          name: chosen.asset.name,
        });
      }
    }
    tile.setPlayObjects(scattered);
  } else {
    tile.setPlayObjects([]);
  }
  return true;
}

export function TileView() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  /** Hidden file picker for the toolbar's Add Image button. Same shape as
   *  FreeformView's `fileInputRef` so the wiring is identical (multi-file,
   *  image/* + svg, fileToDataUrl probe). */
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  /**
   * Last canvas-DEVICE-pixel cursor position, kept so paste/drop can land
   * the new image at the cursor instead of dead-centre when the user has
   * the canvas hovered. Stored in the same units as `eventCanvasCoords`
   * output (post DPR scaling) so screenToWorld() applies cleanly.
   * Reset to null on pointerleave.
   */
  const cursorCanvasRef = useRef<{ x: number; y: number } | null>(null);
  /**
   * Cursor position in object-local coords for the currently-pending pen
   * path's owner. Drives the live rubber-band line from the last anchor
   * to the cursor while the user is drawing.
   */
  const cursorLocalRef = useRef<{ x: number; y: number } | null>(null);
  /**
   * Bridge between the JSX-mounted `<input type="file">` and the file-drop
   * handler defined inside the canvas useEffect (where camera + helpers
   * are in scope). Re-assigned on every effect mount; cleared on unmount.
   */
  const fileInputHandlerRef = useRef<((files: FileList | null) => void) | null>(null);

  const stateRef = useRef(useTile.getState());
  useEffect(() => useTile.subscribe((s) => { stateRef.current = s; }), []);

  const imgCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const imgReadyRef = useRef<Set<string>>(new Set());
  const requestRender = useRef<() => void>(() => {});
  /**
   * Per-tile recoloured dataUrl cache. Keyed by `${tileId}:${tintHash}`
   * so when the user changes a slider the cache hit rate stays high
   * (we keep both the pre- and post-change dataUrls live until the
   * next adjustment). Populated by `recolorTile` in a useEffect that
   * watches `tilesetTints`. The renderer reads from here per draw —
   * cache miss falls back to the original tile dataUrl untouched.
   */
  const recolorCacheRef = useRef<Map<string, string>>(new Map());
  /** Inverse lookup so the renderer can ask "is there a recolour for
   *  this base tile in this tileset right now?" without re-hashing. */
  const tileRecolorRef = useRef<Map<string, string>>(new Map());
  /**
   * Per-character runtime state for play mode. Keyed by character id.
   * Position drifts every frame on the player's character via the play
   * loop's RAF tick — writing each tick straight to the Zustand store
   * would burn re-renders across the whole panel tree, so we keep live
   * state in this ref and only flush back to the store when play stops.
   *
   *   - `dir`     — current Dir8, includes 'idle' when stationary.
   *   - `facing`  — last non-idle direction; animation lookups always
   *                 use a directional CharacterDir8 even at rest.
   *   - `action`  — canonical action id for the current frame, derived
   *                 each tick from held action keys + movement. Drives
   *                 which animation row the renderer looks up
   *                 (`run` while moving, `attack` when Space is held,
   *                 `defend` for Shift, `cast` for Q, `jump` for E,
   *                 `idle` otherwise).
   */
  const playRuntimeRef = useRef<Map<string, { x: number; y: number; dir: Dir8; facing: CharacterDir8; action: CharacterActionId }>>(new Map());
  /** Pressed keys during play mode. Lower-cased Key value for case-insensitive
   *  matching against the play key allowlist {w,a,s,d, arrows, space, shift, q, e}. */
  const playKeysRef = useRef<Set<string>>(new Set());
  /** Pre-play camera snapshot — set on Play start, cleared on Stop. The
   *  Stop transition restores this so leaving play mode drops the user
   *  back to the exact framing they had when they pressed Play. */
  const preCameraRef = useRef<{ x: number; y: number; zoom: number } | null>(null);

  const ensureImage = useCallback((dataUrl: string) => {
    let img = imgCacheRef.current.get(dataUrl);
    if (img) return img;
    img = new Image();
    img.onload = () => {
      imgReadyRef.current.add(dataUrl);
      requestRender.current();
    };
    img.src = dataUrl;
    imgCacheRef.current.set(dataUrl, img);
    return img;
  }, []);

  const tool = useTile((s) => s.tool);
  const setTool = useTile((s) => s.setTool);
  const showGrid = useTile((s) => s.showGrid);
  const toggleGrid = useTile((s) => s.toggleGrid);
  const brushSize = useTile((s) => s.brushSize);
  const setBrushSize = useTile((s) => s.setBrushSize);
  const brushRandomFlipH = useTile((s) => s.brushRandomFlipH);
  const setBrushRandomFlipH = useTile((s) => s.setBrushRandomFlipH);
  const brushRandomFlipV = useTile((s) => s.brushRandomFlipV);
  const setBrushRandomFlipV = useTile((s) => s.setBrushRandomFlipV);
  const brushRandomRotate = useTile((s) => s.brushRandomRotate);
  const setBrushRandomRotate = useTile((s) => s.setBrushRandomRotate);
  const tilesetTints = useTile((s) => s.tilesetTints);
  const tilesets = useTile((s) => s.tilesets);
  const layers = useTile((s) => s.layers);
  const tiles = useTile((s) => s.tiles);
  const selectedObjectId = useTile((s) => s.selectedObjectId);
  const activeLayerId = useTile((s) => s.activeLayerId);
  const resetCamera = useTile((s) => s.resetCamera);
  const clearMap = useTile((s) => s.clearMap);
  const camera = useTile((s) => s.camera);
  // World vibrancy — viewport-only CSS filter so the user can boost
  // saturation / contrast / brightness without re-baking pixels.
  const worldSaturation = useTile((s) => s.worldSaturation);
  const worldContrast = useTile((s) => s.worldContrast);
  const worldBrightness = useTile((s) => s.worldBrightness);
  const setRightPanelGroup = useStudio((s) => s.setRightPanelGroup);
  // Global Play / Stop state — top bar in TopMenuBar flips this. When the
  // user enters play mode, characters become controllable: WASD/arrows
  // drive the FIRST character ("the player"), facing snaps to one of 8
  // directions, and the rendered frame swaps to the matching cell of the
  // 3×3 sprite sheet (cell 8 is intentionally discarded).
  const isPlaying = useSceneStore((s) => s.isPlaying);

  // ── Realtime room channel ─────────────────────────────────────
  // Subscribes the TileView to the active room's Supabase Realtime
  // channel; remote paint/erase/lot-claim events apply directly to the
  // local stores. We keep the broadcast handle in a ref so the paint /
  // erase / fill apply functions inside the canvas useEffect can reach
  // it without re-mounting the entire effect on every reconnect.
  const currentRoomId = useRoom((s) => s.currentRoomId);
  const currentPlayerId = useRoom((s) => s.currentPlayerId);
  const rooms = useRoom((s) => s.rooms);
  const realtime = useTileRealtime(currentRoomId);
  const realtimeRef = useRef(realtime);
  realtimeRef.current = realtime;
  // Mirror the channel join status into room-store so the switcher's
  // status badge can read it without subscribing to the channel itself.
  const setRealtimeLive = useRoom((s) => s.setRealtimeLive);
  useEffect(() => {
    setRealtimeLive(realtime.live);
  }, [realtime.live, setRealtimeLive]);
  // Stable per-tab sender id — same one the hook uses internally — so
  // every event we broadcast carries the same origin tag.
  const senderIdRef = useRef<string>(
    typeof window !== 'undefined'
      ? window.sessionStorage.getItem('problocks:tile-realtime:sender') ?? 'local'
      : 'local',
  );

  // ── Broadcast lot claims ──────────────────────────────────────
  // When the local player gets assigned a corner (either via the initial
  // ensureLocalPlayerHasLot or by remote conflict resolution), tell the
  // rest of the room. We dedupe with a ref so a re-render that doesn't
  // change the corner doesn't re-broadcast.
  const lastClaimRef = useRef<{ roomId: string; corner: Corner } | null>(null);
  useEffect(() => {
    if (!currentRoomId) return;
    const room = rooms.find((r) => r.id === currentRoomId);
    if (!room) return;
    const myCorner = ALL_CORNERS.find(
      (c) => room.lots[c].ownerId === currentPlayerId,
    );
    if (!myCorner) return;
    const last = lastClaimRef.current;
    if (last && last.roomId === currentRoomId && last.corner === myCorner) return;
    lastClaimRef.current = { roomId: currentRoomId, corner: myCorner };
    realtime.broadcast({
      type: 'lot-claim',
      roomId: currentRoomId,
      playerId: currentPlayerId,
      corner: myCorner,
      sender: senderIdRef.current,
    });
  }, [rooms, currentRoomId, currentPlayerId, realtime]);

  // When the user picks an object on the canvas, jump the right panel to
  // its Properties tab so TileObjectPropertiesPanel comes into view. The
  // floating in-canvas popup is gone — properties live in the right panel
  // now, so the surface needs to be visible to be useful.
  useEffect(() => {
    if (selectedObjectId) setRightPanelGroup('properties');
  }, [selectedObjectId, setRightPanelGroup]);

  // The canvas only repaints on demand. Tool / selection changes flip
  // visibility of overlays (placement ghost, selection bounding box,
  // selected-style preview) but don't on their own move the mouse — so
  // without this kick the last frame would freeze on screen until the
  // user wiggles the cursor.
  const selectedAssetIdForPaint = useTile((s) => s.selectedAssetId);
  const selectedStyleIdForPaint = useTile((s) => s.selectedStyleId);
  useEffect(() => {
    requestRender.current();
  }, [tool, selectedObjectId, selectedAssetIdForPaint, selectedStyleIdForPaint]);

  // ── Per-tileset palette recolouring ─────────────────────────────
  // Each time `tilesetTints` (or the underlying tileset list) changes,
  // recompute a recoloured PNG dataUrl for every tile in the affected
  // tilesets and stash it under `tileRecolorRef`. The renderer prefers
  // the recoloured URL when present and falls back to the source URL
  // otherwise. We keep the previous dataUrl alive in `recolorCacheRef`
  // until the next adjustment so a slider drag doesn't strobe.
  useEffect(() => {
    let cancelled = false;
    async function rebuild() {
      const state = useTile.getState();
      const nextMap = new Map<string, string>();
      for (const ts of state.tilesets) {
        const adj = tilesetTints[ts.id];
        if (!hasActiveAdjustments(adj)) continue;
        // Stable hash for cache lookup — bucket id + numeric values, plus
        // the active variant index so switching style sheets while a tint
        // is live invalidates the cache instead of pinning the recoloured
        // base sheet under the new variant's tileId.
        const variantIdx = ts.activeVariantIndex ?? 0;
        const hash = `${variantIdx}:${JSON.stringify(adj)}`;
        for (let i = 0; i < ts.tileIds.length; i++) {
          const tileId = ts.tileIds[i];
          const tile = state.tiles[tileId];
          if (!tile) continue;
          // Recolour the *active variant's* dataUrl, not the base. Otherwise
          // a tint locks the canvas to the base sheet's recoloured pixels
          // and variant switches become invisible.
          const sourceDataUrl = tileDataUrlFor(ts, i, tile.dataUrl);
          const cacheKey = `${tileId}:${hash}`;
          let recolored = recolorCacheRef.current.get(cacheKey);
          if (!recolored) {
            try {
              recolored = await recolorTile(sourceDataUrl, adj);
              if (cancelled) return;
              recolorCacheRef.current.set(cacheKey, recolored);
            } catch (err) {
              console.warn('[tile-palette] recolor failed', err);
              continue;
            }
          }
          nextMap.set(tileId, recolored);
          // Pre-warm the image cache so the first frame after the
          // recolour finishes can blit the new dataUrl without waiting
          // for an async load.
          if (!imgCacheRef.current.has(recolored)) {
            const img = new Image();
            img.onload = () => {
              imgReadyRef.current.add(recolored!);
              requestRender.current();
            };
            img.src = recolored;
            imgCacheRef.current.set(recolored, img);
          }
        }
      }
      if (cancelled) return;
      tileRecolorRef.current = nextMap;
      requestRender.current();
    }
    void rebuild();
    return () => { cancelled = true; };
  }, [tilesetTints, tiles, tilesets]);

  const activeLayer = layers.find((l) => l.id === activeLayerId);

  // ── Play mode: keyboard listeners + WASD/arrow movement loop ────
  // Mirrors the freeform CharacterLayer pattern (see views/CharacterLayer.tsx)
  // adapted for the tile canvas: runtime position lives in playRuntimeRef
  // (NOT the store) so a 60 fps update loop doesn't fan out re-renders.
  // On stop, we flush the final position back via updateTileCharacter so
  // a re-play starts where the character last stood.
  useEffect(() => {
    if (!isPlaying) {
      // Stop transition — flush runtime positions back to the store, then
      // clear the runtime map so the renderer falls back to stored x/y.
      const rt = playRuntimeRef.current;
      const updateChar = useTile.getState().updateTileCharacter;
      for (const [id, state] of rt) updateChar(id, { x: state.x, y: state.y });
      rt.clear();
      playKeysRef.current.clear();
      // Drop the ephemeral procgen layer + scatter — both are excluded
      // from persist and never enter the undo stack, so clearing them
      // is enough to restore the editor to its pre-Play state.
      useTile.getState().setPlayLayer(null);
      useTile.getState().setPlayObjects([]);
      // Restore the pre-play camera so the editor framing is exactly where
      // the user left it on Play. Only restore when we actually saved one
      // (the Play body bails early when there are zero characters).
      if (preCameraRef.current) {
        useTile.getState().setCamera(preCameraRef.current);
        preCameraRef.current = null;
      }
      requestRender.current();
      return;
    }
    // Start transition. Procgen runs FIRST and unconditionally — the
    // user can hit Play with no characters yet (e.g. just to preview the
    // generated map) and still see something. Character-specific runtime
    // setup (snap to origin + key listeners + tick loop) is gated below
    // and short-circuited when no characters exist.
    const tile = useTile.getState();
    const characters = Object.values(tile.tileCharacters);
    const ordered = [...characters].sort((a, b) => a.addedAt - b.addedAt);
    const playerId = ordered[0]?.id ?? null;

    // Spawn the player at world origin (centre of the 10×10 tile pad)
    // when one exists. With no character we still snap the camera to
    // origin so the procgen output is centred.
    if (playerId) tile.updateTileCharacter(playerId, { x: 0, y: 0 });
    // Snapshot the editor camera so we can restore exact framing on Stop,
    // then snap to the spawn at the configured play zoom.
    preCameraRef.current = { x: tile.camera.x, y: tile.camera.y, zoom: tile.camera.zoom };
    tile.setCamera({ x: 0, y: 0, zoom: tile.playCameraZoom });

    // Procedurally generate the world. Same overlay the live preview
    // uses — see `buildPlayOverlay` for the full noise → corners +
    // scatter + rivers pipeline. Reserves a `genReserveRadius` cell
    // zone at origin so the spawn pad and any user paint inside it
    // survive play.
    buildPlayOverlay();
    // Kick the canvas right away — the tick loop below also schedules
    // renders, but the first one is a frame later, which is long
    // enough to look like Play "did nothing" on slower machines.
    requestRender.current();

    const rt = playRuntimeRef.current;
    rt.clear();
    for (const c of Object.values(useTile.getState().tileCharacters)) {
      // `facing` defaults to 's' (face the camera) — the canonical
      // resting pose. The tick loop overwrites it as soon as the player
      // moves; non-player characters keep this default. `action`
      // starts as 'idle' and the tick recomputes it from held keys.
      rt.set(c.id, { x: c.x, y: c.y, dir: 'idle', facing: 's', action: 'idle' });
    }

    // No player → procgen + camera are already in place; skip the
    // input + tick wiring entirely so the user can preview the
    // generated map without a character set up yet.
    if (!playerId) {
      requestRender.current();
      return;
    }

    function isTypingTarget(t: EventTarget | null): boolean {
      const el = t as HTMLElement | null;
      if (!el) return false;
      return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable;
    }
    // Play-mode key allowlist. Lower-cased `e.key` strings.
    //   Movement: WASD + arrows
    //   Action keys: space=attack, shift=defend, q=cast, e=jump
    // The action keys map onto the canonical CharacterActionId set so
    // the play loop can simply pick the matching animation row from
    // `findCharacterAnimation` without any per-key special-casing.
    const PLAY_KEYS = new Set([
      'arrowleft', 'arrowright', 'arrowup', 'arrowdown',
      'w', 'a', 's', 'd',
      ' ', 'shift', 'q', 'e',
    ]);
    function onKeyDown(e: KeyboardEvent) {
      // Ignore keys when typing into a panel input — otherwise WASD would
      // walk the player while the user names their character.
      if (isTypingTarget(e.target)) return;
      const k = e.key.toLowerCase();
      if (PLAY_KEYS.has(k)) {
        e.preventDefault();
        playKeysRef.current.add(k);
      }
    }
    function onKeyUp(e: KeyboardEvent) {
      const k = e.key.toLowerCase();
      if (PLAY_KEYS.has(k)) playKeysRef.current.delete(k);
    }
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // `playerId` was already resolved above (used for the spawn snap) —
    // the tick loop reuses it to drive WASD on the same character.

    let rafId = 0;
    let lastT = performance.now();
    function tick(now: number) {
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;
      const tileState = useTile.getState();
      const player = tileState.tileCharacters[playerId];
      const cur = rt.get(playerId);
      if (player && cur) {
        const keys = playKeysRef.current;
        let vx = 0, vy = 0;
        if (keys.has('arrowleft') || keys.has('a')) vx -= 1;
        if (keys.has('arrowright') || keys.has('d')) vx += 1;
        if (keys.has('arrowup') || keys.has('w')) vy -= 1;
        if (keys.has('arrowdown') || keys.has('s')) vy += 1;
        const mag = Math.hypot(vx, vy);
        if (mag > 0) {
          vx /= mag; vy /= mag;
          cur.x += vx * player.speed * dt;
          cur.y += vy * player.speed * dt;
          const moving = dirFromVelocity(vx, vy);
          cur.dir = moving;
          // `facing` only updates while moving, so an idle character keeps
          // looking the way it last walked (matches platformer convention).
          if (moving !== 'idle') cur.facing = moving;
        } else {
          cur.dir = 'idle';
        }
        // Action priority — held action keys always win over auto-state
        // (so the player can attack/defend/cast while moving or
        // swimming). Below the keys, `swim` auto-applies whenever the
        // character is over water AND a swim animation is tagged for
        // its facing direction. If swim is unavailable, we fall through
        // to run/idle so movement still has visible feedback.
        if (keys.has(' ')) {
          cur.action = 'attack';
        } else if (keys.has('shift')) {
          cur.action = 'defend';
        } else if (keys.has('q')) {
          cur.action = 'cast';
        } else if (keys.has('e')) {
          cur.action = 'jump';
        } else if (
          isCharacterInWater(cur.x, cur.y) &&
          findCharacterAnimation(player, cur.facing, 'swim') !== null
        ) {
          cur.action = 'swim';
        } else {
          cur.action = mag > 0 ? 'run' : 'idle';
        }
        // Camera follow — frame-rate-independent exponential smoothing.
        // alpha at 60 fps = playCameraSmoothing; the pow keeps the same
        // half-life across refresh rates. smoothing=1 ⇒ alpha=1 (snap),
        // smoothing=0 ⇒ alpha=0 (no follow).
        if (tileState.playCameraFollow) {
          const cam = tileState.camera;
          const s = tileState.playCameraSmoothing;
          const alpha = 1 - Math.pow(1 - Math.min(0.999, Math.max(0, s)), dt * 60);
          const nextX = cam.x + (cur.x - cam.x) * alpha;
          const nextY = cam.y + (cur.y - cam.y) * alpha;
          tileState.setCamera({ x: nextX, y: nextY });
        }
      }
      requestRender.current();
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [isPlaying]);

  // While playing, applying a fresh playCameraZoom from the right panel
  // should jump the live camera too — the tick only writes (x, y), zoom
  // is set once on Play start. This effect bridges slider changes onto
  // the live camera without re-running the whole play setup.
  const playCameraZoom = useTile((s) => s.playCameraZoom);
  useEffect(() => {
    if (!isPlaying) return;
    useTile.getState().setCamera({ zoom: playCameraZoom });
  }, [playCameraZoom, isPlaying]);

  // ── Live procgen preview ────────────────────────────────────────
  // Watches every gen-* field plus tilesets/objectAssets/preview toggle
  // and rebuilds the overlay in edit mode whenever any of them changes.
  // Skipped during play (the play loop owns the overlay) and skipped
  // when the toggle is off (overlay is cleared instead). The dependency
  // list is exhaustive on purpose — Zustand selectors here mean the
  // effect doesn't re-run on unrelated store mutations.
  const genPreviewEnabled = useTile((s) => s.genPreviewEnabled);
  const genSeed = useTile((s) => s.genSeed);
  const genScale = useTile((s) => s.genScale);
  const genOctaves = useTile((s) => s.genOctaves);
  const genRoughness = useTile((s) => s.genRoughness);
  const genWarp = useTile((s) => s.genWarp);
  const genSmoothEdges = useTile((s) => s.genSmoothEdges);
  const genIslandEnabled = useTile((s) => s.genIslandEnabled);
  const genIslandRadius = useTile((s) => s.genIslandRadius);
  const genReserveRadius = useTile((s) => s.genReserveRadius);
  const genReserveShape = useTile((s) => s.genReserveShape);
  const genTextureWeights = useTile((s) => s.genTextureWeights);
  const genObjectDensity = useTile((s) => s.genObjectDensity);
  const genObjectWeights = useTile((s) => s.genObjectWeights);
  const genRiverEnabled = useTile((s) => s.genRiverEnabled);
  const genRiverCount = useTile((s) => s.genRiverCount);
  const genRiverWidth = useTile((s) => s.genRiverWidth);
  const genRiverTextureId = useTile((s) => s.genRiverTextureId);
  const previewObjectAssets = useTile((s) => s.objectAssets);
  useEffect(() => {
    if (isPlaying) return; // play loop owns the overlay during play
    if (!genPreviewEnabled) {
      useTile.getState().setPlayLayer(null);
      useTile.getState().setPlayObjects([]);
      requestRender.current();
      return;
    }
    buildPlayOverlay();
    // The canvas only repaints on demand in edit mode. Without this kick
    // the freshly-built playLayer would sit in the store unseen until the
    // user moused over the canvas (which schedules a render through the
    // hover handler).
    requestRender.current();
  }, [
    isPlaying,
    genPreviewEnabled,
    genSeed, genScale, genOctaves, genRoughness, genWarp, genSmoothEdges,
    genIslandEnabled, genIslandRadius,
    genReserveRadius, genReserveShape,
    genTextureWeights,
    genObjectDensity, genObjectWeights,
    genRiverEnabled, genRiverCount, genRiverWidth, genRiverTextureId,
    tilesets, previewObjectAssets,
  ]);

  // ── Imperative canvas render loop ───────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let disposed = false;
    let rafId = 0;
    const hoverRef = { current: null as { cx: number; cy: number } | null };
    const objectDragRef = { current: null as { id: string; startWX: number; startWY: number; origX: number; origY: number } | null };
    /** Same shape as objectDragRef but for playable characters — they
     *  don't rotate, so no angle field is needed. */
    const characterDragRef = { current: null as { id: string; startWX: number; startWY: number; origX: number; origY: number } | null };
    /** Resize-handle drag state. localCx/localCy are the cursor's local-frame
     *  coords at drag start, used to keep cursor → handle position aligned
     *  even when the object is rotated. */
    const resizeDragRef = { current: null as { id: string; startW: number; startH: number; rotation: number } | null };
    /** Rotation-handle drag state. startAngle is the cursor's angle around
     *  the object centre at drag start; origRotation is the object's
     *  rotation at that moment. New rotation = origRotation + (now - start). */
    const rotateDragRef = { current: null as { id: string; cx: number; cy: number; startAngle: number; origRotation: number } | null };
    let isDrawing: 'paint' | 'erase' | null = null;
    let isPanning = false;
    let panStart = { x: 0, y: 0, camX: 0, camY: 0 };
    let spaceHeld = false;

    function scheduleRender() {
      if (disposed) return;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(render);
    }
    requestRender.current = scheduleRender;

    function render() {
      const s = stateRef.current;
      const cam = s.camera;
      const ts = s.tileSize;
      const W = canvas!.width;
      const H = canvas!.height;
      ctx!.fillStyle = '#fafaf7';
      ctx!.fillRect(0, 0, W, H);
      // Animation clock (ms) — single timestamp for the whole render
      // pass so every visible frame of every animated tile stays
      // perfectly in sync. Mirrors the `didAnimate` flag at the bottom
      // of `render` that decides whether to keep the RAF loop alive.
      const animNow = performance.now();
      let didAnimate = false;
      // Resolve a tile's current dataUrl, accounting for animation
      // frames first (they bypass variants and recolour for now —
      // recolour-on-frame is a future feature). Falls back to the
      // variant resolver when no animation is present so existing
      // tilesets render unchanged.
      const resolveAnimated = (
        tile: { animationFrames?: string[]; animationFps?: number; dataUrl: string },
        tilesetForResolve: Parameters<typeof tileDataUrlFor>[0],
        index: number,
      ): string => {
        const frames = tile.animationFrames;
        if (frames && frames.length > 0) {
          const fps = tile.animationFps ?? 8;
          const idx = Math.floor((animNow * fps) / 1000) % frames.length;
          didAnimate = true;
          return frames[idx];
        }
        return tileDataUrlFor(tilesetForResolve, index, tile.dataUrl);
      };

      ctx!.save();
      ctx!.translate(W / 2, H / 2);
      ctx!.scale(cam.zoom, cam.zoom);
      ctx!.translate(-cam.x, -cam.y);
      ctx!.imageSmoothingEnabled = false;

      const halfW = (W / 2) / cam.zoom;
      const halfH = (H / 2) / cam.zoom;
      const cx0 = Math.floor((cam.x - halfW) / ts) - 1;
      const cy0 = Math.floor((cam.y - halfH) / ts) - 1;
      const cx1 = Math.ceil((cam.x + halfW) / ts) + 1;
      const cy1 = Math.ceil((cam.y + halfH) / ts) + 1;

      // Origin cross.
      ctx!.strokeStyle = 'rgba(29,26,20,0.18)';
      ctx!.lineWidth = 1 / cam.zoom;
      ctx!.beginPath();
      ctx!.moveTo(-12, 0); ctx!.lineTo(12, 0);
      ctx!.moveTo(0, -12); ctx!.lineTo(0, 12);
      ctx!.stroke();

      // Pre-warm every tile image once per frame so the resolver doesn't
      // get a cold cache miss mid-loop. Cheap because ensureImage no-ops
      // when already loaded. Variants register their alt-sheet data URLs
      // here too — switching the active variant on a tileset becomes a
      // cheap cache-hit swap on the next frame.
      for (const t of Object.values(s.tiles)) {
        ensureImage(t.dataUrl);
        // Pre-warm every animation frame so the first time a frame
        // becomes the current one it doesn't cold-cache miss.
        if (t.animationFrames) {
          for (const f of t.animationFrames) ensureImage(f);
        }
      }
      for (const ts of s.tilesets) {
        if (!ts.variants) continue;
        for (const v of ts.variants) {
          for (const url of v.tileDataUrls) ensureImage(url);
        }
      }

      // Half a device pixel expressed in world units. Each tile draws
      // slightly larger so neighbors overlap by ~1 device pixel, hiding
      // the sub-pixel seams the rasterizer creates at fractional zoom/pan.
      const bleed = 0.5 / cam.zoom;

      // ── Base layer pre-pass ─────────────────────────────────────
      // When `baseTextureId` is set, the map is conceptually filled
      // edge-to-edge with that texture's pure tile. We render it as a
      // SINGLE tiled fillRect via CanvasPattern — at low zoom a per-cell
      // loop is O(viewport_cells), which is ~200k drawImage calls at 10%
      // zoom on a 1080p canvas and ground the framerate to a halt. The
      // pattern tiles natively and only costs one fillRect regardless of
      // how many cells are visible. The layered pass below still
      // substitutes absent corners with baseTexId so painted regions
      // transition smoothly via the matching wang bridge tileset.
      const recolorMap = tileRecolorRef.current;
      const baseTexId = s.baseTextureId;
      if (baseTexId) {
        const baseResolved = resolveCellTile(baseTexId, baseTexId, baseTexId, baseTexId, s.tilesets);
        if (baseResolved) {
          const baseTileId = baseResolved.tileset.tileIds[baseResolved.index];
          const baseTile = baseTileId ? s.tiles[baseTileId] : undefined;
          if (baseTile) {
            // Animated base tile — frame URL wins over recolour (recolour
            // of frames is a future feature). The pattern path can't
            // animate (one image locked into the pattern), so for
            // animated bases we re-create the pattern with the current
            // frame each render. didAnimate is set inside resolveAnimated
            // so the loop keeps repainting at 60Hz while a base
            // animation is active.
            const baseDataUrl = resolveAnimated(baseTile, baseResolved.tileset, baseResolved.index);
            const baseRecolored = baseTile.animationFrames ? undefined : recolorMap.get(baseTileId);
            const baseUrl = baseRecolored ?? baseDataUrl;
            const baseImg = imgCacheRef.current.get(baseUrl);
            if (baseImg && imgReadyRef.current.has(baseUrl)) {
              const pattern = ctx!.createPattern(baseImg, 'repeat');
              if (pattern) {
                // Pattern tiles in CURRENT TRANSFORM space starting at world
                // (0,0). Scale so one image tile = one cell (`ts` world units),
                // independent of the source image's natural size.
                const m = new DOMMatrix();
                m.scaleSelf(ts / baseImg.width, ts / baseImg.height);
                pattern.setTransform(m);
                ctx!.fillStyle = pattern;
                ctx!.fillRect(cx0 * ts, cy0 * ts, (cx1 - cx0 + 1) * ts, (cy1 - cy0 + 1) * ts);
              } else {
                // Pattern unavailable for any reason — fall back to per-cell
                // drawImage. Won't be the hot path on real browsers.
                for (let cy = cy0; cy <= cy1; cy++) {
                  for (let cx = cx0; cx <= cx1; cx++) {
                    ctx!.drawImage(baseImg, cx * ts - bleed, cy * ts - bleed, ts + bleed * 2, ts + bleed * 2);
                  }
                }
              }
            }
          }
        }
      }

      // Render each layer's corners; per-cell, the resolver picks whichever
      // tileset bridges the textures present at the 4 corners. Two chained
      // tilesets sharing a texture transition smoothly because the bridge
      // tileset for the boundary cells contains both textures. When a base
      // texture is active, absent corners are treated as baseTexId so paint
      // borders blend into the base via wang bridges instead of a hard edge.
      // Order: user layers first (in their stacking order), then the
      // ephemeral procgen play layer last so it always paints over
      // anything the user might have painted outside the spawn reserve.
      // Otherwise pre-existing edit-mode paint would mask the freshly-
      // generated world the moment Play kicks in.
      const layerSeq = s.playLayer ? [...s.layers, s.playLayer] : s.layers;
      for (const layer of layerSeq) {
        if (!layer.visible) continue;
        ctx!.globalAlpha = layer.opacity;
        const corners = layer.corners;
        const transforms = layer.cellTransforms;
        // Skip the entire viewport scan when this layer has nothing painted
        // — at low zoom (10%) the viewport is ~600×340 = 200k cells and even
        // an early `continue` per cell costs ~8 ms/frame in plain object
        // lookups. With nothing to draw we can bail in O(1).
        let bMinX: number, bMinY: number, bMaxX: number, bMaxY: number;
        if (layer.bbox) {
          // Cached bbox path — used by the procgen play layer where a
          // walk over ~250k corner strings every frame would otherwise
          // dominate the frame budget. Layers that mutate corners must
          // clear this field on edit so the next render recomputes.
          bMinX = layer.bbox.minX;
          bMinY = layer.bbox.minY;
          bMaxX = layer.bbox.maxX;
          bMaxY = layer.bbox.maxY;
        } else {
          const cornerKeys = Object.keys(corners);
          if (cornerKeys.length === 0) continue;
          // Derive the painted bbox so we only iterate the cells that could
          // possibly draw (intersected with the viewport). For dense maps the
          // bbox covers the whole viewport anyway and this is a tiny tax;
          // for sparse maps it shaves the iteration to just the painted
          // region. We pad +1 cell because a corner at (cx, cy) influences
          // the cells at (cx-1, cy-1) through (cx, cy).
          bMinX = Infinity; bMinY = Infinity; bMaxX = -Infinity; bMaxY = -Infinity;
          for (const k of cornerKeys) {
            const i = k.indexOf(',');
            if (i < 0) continue;
            const x = +k.slice(0, i);
            const y = +k.slice(i + 1);
            if (x < bMinX) bMinX = x;
            if (y < bMinY) bMinY = y;
            if (x > bMaxX) bMaxX = x;
            if (y > bMaxY) bMaxY = y;
          }
        }
        const lcx0 = Math.max(cx0, bMinX - 1);
        const lcy0 = Math.max(cy0, bMinY - 1);
        const lcx1 = Math.min(cx1, bMaxX);
        const lcy1 = Math.min(cy1, bMaxY);
        for (let cy = lcy0; cy <= lcy1; cy++) {
          for (let cx = lcx0; cx <= lcx1; cx++) {
            const nwRaw = corners[`${cx},${cy}`];
            const neRaw = corners[`${cx + 1},${cy}`];
            const swRaw = corners[`${cx},${cy + 1}`];
            const seRaw = corners[`${cx + 1},${cy + 1}`];
            // Fully-empty cells: the base pre-pass already drew them (or
            // the canvas background shows through if no base is set).
            if (!nwRaw && !neRaw && !swRaw && !seRaw) continue;
            const nw = nwRaw ?? baseTexId ?? undefined;
            const ne = neRaw ?? baseTexId ?? undefined;
            const sw = swRaw ?? baseTexId ?? undefined;
            const se = seRaw ?? baseTexId ?? undefined;
            const resolved = resolveCellTile(nw, ne, sw, se, s.tilesets);
            if (!resolved) continue;
            const tileId = resolved.tileset.tileIds[resolved.index];
            if (!tileId) continue;
            const tile = s.tiles[tileId];
            if (!tile) continue;
            // Animated tile slot wins over the variant resolver — frame
            // 0 already reflects whichever variant the tile carried at
            // upload, so cycling animation frames keeps the look
            // consistent. Per-bucket recolour still applies on top
            // when no animation is set (recolour-of-frames is a future
            // feature; for now an animated tile renders un-tinted).
            const baseDataUrl = resolveAnimated(tile, resolved.tileset, resolved.index);
            const recoloredDataUrl = tile.animationFrames ? undefined : recolorMap.get(tileId);
            const dataUrl = recoloredDataUrl ?? baseDataUrl;
            const img = imgCacheRef.current.get(dataUrl);
            if (!img || !imgReadyRef.current.has(dataUrl)) {
              // Recoloured image still loading; fall back to base for
              // this frame so the cell doesn't disappear mid-recolour.
              const fbImg = imgCacheRef.current.get(baseDataUrl);
              if (!fbImg || !imgReadyRef.current.has(baseDataUrl)) continue;
              ctx!.drawImage(fbImg, cx * ts - bleed, cy * ts - bleed, ts + bleed * 2, ts + bleed * 2);
              continue;
            }
            // Per-cell render transform (random flip/rotate from brush
            // options at paint time). Cheap fast-path when no transforms
            // exist or this cell wasn't randomized — just drawImage at
            // the cell's top-left like before.
            const t = transforms?.[`${cx},${cy}`] ?? 0;
            if (t === 0) {
              ctx!.drawImage(img, cx * ts - bleed, cy * ts - bleed, ts + bleed * 2, ts + bleed * 2);
            } else {
              const flipH = (t & 0x1) !== 0;
              const flipV = (t & 0x2) !== 0;
              const rot = (t >> 2) & 0x3;
              ctx!.save();
              ctx!.translate(cx * ts + ts / 2, cy * ts + ts / 2);
              if (rot) ctx!.rotate(rot * Math.PI / 2);
              if (flipH || flipV) ctx!.scale(flipH ? -1 : 1, flipV ? -1 : 1);
              ctx!.drawImage(img, -ts / 2 - bleed, -ts / 2 - bleed, ts + bleed * 2, ts + bleed * 2);
              ctx!.restore();
            }
          }
        }
      }
      ctx!.globalAlpha = 1;

      // Free objects, sorted bottom-to-top by y. Includes the ephemeral
      // play-mode scatter — playObjects use a synthetic layerId so the
      // user-layer visibility check below short-circuits cleanly. The
      // `?? []` guards against a hydrate sequence where an older
      // persisted shape is read in before the default playObjects array
      // is merged back; safer than crashing the render loop.
      const playObjs = s.playObjects ?? [];
      const objectPool = playObjs.length > 0
        ? [...s.objects, ...playObjs]
        : s.objects;
      // Build assetId → group tint map once per frame so the render loop
      // can apply hue/sat/brightness from the asset's group without an
      // O(groups) scan per object. First match wins (asset typically
      // belongs to one group; deterministic by sortIndex).
      const groupTintByAssetId = new Map<string, { hue: number; saturation: number; brightness: number }>();
      const sortedGroups = Object.values(s.tileGroups).sort((a, b) => a.sortIndex - b.sortIndex);
      for (const g of sortedGroups) {
        const hasTint = (g.hue ?? 0) !== 0 || (g.saturation ?? 1) !== 1 || (g.brightness ?? 1) !== 1;
        if (!hasTint) continue;
        for (const aid of g.assetIds) {
          if (groupTintByAssetId.has(aid)) continue;
          groupTintByAssetId.set(aid, {
            hue: g.hue ?? 0,
            saturation: g.saturation ?? 1,
            brightness: g.brightness ?? 1,
          });
        }
      }
      const visibleObjects = objectPool.filter((o) => {
        const layer = s.layers.find((l) => l.id === o.layerId);
        if (layer && !layer.visible) return false;
        return o.x + o.width / 2 >= cx0 * ts
          && o.x - o.width / 2 <= cx1 * ts
          && o.y + o.height / 2 >= cy0 * ts
          && o.y - o.height / 2 <= cy1 * ts;
      }).sort((a, b) => a.y - b.y);

      for (const obj of visibleObjects) {
        const found = findStyle(s.objectAssets, obj.assetId, obj.styleId);
        if (!found) continue;
        const img = ensureImage(found.style.dataUrl);
        if (!imgReadyRef.current.has(found.style.dataUrl)) continue;
        const layer = s.layers.find((l) => l.id === obj.layerId);
        ctx!.globalAlpha = layer?.opacity ?? 1;
        ctx!.save();
        ctx!.translate(obj.x, obj.y);
        if (obj.rotation) ctx!.rotate(obj.rotation * Math.PI / 180);
        const sx = obj.flipX ? -1 : 1;
        const sy = obj.flipY ? -1 : 1;
        if (sx !== 1 || sy !== 1) ctx!.scale(sx, sy);
        // ctx.filter is reset to 'none' on save/restore, so no manual undo
        // needed once we leave this block. hue 0 = no filter (skip the
        // string assignment to save a few ops per frame).
        const tint = groupTintByAssetId.get(obj.assetId);
        const totalHue = (obj.hue || 0) + (tint?.hue ?? 0);
        const sat = tint?.saturation ?? 1;
        const bri = tint?.brightness ?? 1;
        if (totalHue || sat !== 1 || bri !== 1) {
          const parts: string[] = [];
          if (totalHue) parts.push(`hue-rotate(${totalHue}deg)`);
          if (sat !== 1) parts.push(`saturate(${sat})`);
          if (bri !== 1) parts.push(`brightness(${bri})`);
          ctx!.filter = parts.join(' ');
        }
        ctx!.drawImage(img, -obj.width / 2, -obj.height / 2, obj.width, obj.height);
        ctx!.restore();

        // Pen-drawn collision boundaries — always visible (not just on
        // selection) so the user can see what they've drawn at a glance,
        // matching FreeformView's behaviour. Drawn in the object's LOCAL
        // rotated frame so they ride along with the sprite.
        const collisions = obj.collisions ?? [];
        if (collisions.length > 0) {
          ctx!.save();
          ctx!.translate(obj.x, obj.y);
          if (obj.rotation) ctx!.rotate(obj.rotation * Math.PI / 180);
          for (const c of collisions) {
            const path = buildCollisionPath2D(c);
            const isSel = c.id === s.selectedCollisionId;
            ctx!.fillStyle = isSel ? 'rgba(56, 189, 248, 0.18)' : 'rgba(56, 189, 248, 0.10)';
            ctx!.strokeStyle = isSel ? '#0284c7' : '#38bdf8';
            ctx!.lineWidth = 2 / cam.zoom;
            ctx!.lineJoin = 'round';
            ctx!.lineCap = 'round';
            if (c.closed) ctx!.fill(path);
            ctx!.stroke(path);
          }
          ctx!.restore();
        }

        if (obj.id === s.selectedObjectId) {
          // Bounding box: draw in the object's LOCAL rotated frame so the
          // box hugs the sprite even when rotated. Same trick the resize +
          // rotate handles use below.
          ctx!.save();
          ctx!.translate(obj.x, obj.y);
          if (obj.rotation) ctx!.rotate(obj.rotation * Math.PI / 180);
          const halfW = obj.width / 2;
          const halfH = obj.height / 2;
          ctx!.strokeStyle = '#0ea5e9';
          ctx!.lineWidth = 1.5 / cam.zoom;
          ctx!.setLineDash([4 / cam.zoom, 3 / cam.zoom]);
          ctx!.strokeRect(-halfW, -halfH, obj.width, obj.height);
          ctx!.setLineDash([]);
          // Resize handle — bottom-right corner (in local frame). Filled
          // white square with blue border, sized in screen space so it
          // stays the same physical size at any zoom.
          const handleSize = 10 / cam.zoom;
          ctx!.fillStyle = '#ffffff';
          ctx!.lineWidth = 1.5 / cam.zoom;
          ctx!.fillRect(halfW - handleSize / 2, halfH - handleSize / 2, handleSize, handleSize);
          ctx!.strokeRect(halfW - handleSize / 2, halfH - handleSize / 2, handleSize, handleSize);
          // Rotation handle — small circle on a stalk above the top-centre.
          const stalkLen = 22 / cam.zoom;
          ctx!.beginPath();
          ctx!.moveTo(0, -halfH);
          ctx!.lineTo(0, -halfH - stalkLen);
          ctx!.stroke();
          const rotR = 6 / cam.zoom;
          ctx!.beginPath();
          ctx!.arc(0, -halfH - stalkLen, rotR, 0, Math.PI * 2);
          ctx!.fillStyle = '#0ea5e9';
          ctx!.fill();
          ctx!.restore();
        }
      }
      ctx!.globalAlpha = 1;

      // ── Playable characters ─────────────────────────────────────
      // Drawn AFTER objects so the player sprite layers on top of any
      // free-placed objects in the scene. During play mode, position
      // is read from playRuntimeRef (updated every RAF tick); in edit
      // mode it falls back to the stored x/y.
      const characters = Object.values(s.tileCharacters);
      if (characters.length > 0) {
        // Read isPlaying via the store rather than the captured closure — the
        // render useEffect doesn't depend on isPlaying, so the closure value
        // is stale across play/stop transitions.
        const playing = useSceneStore.getState().isPlaying;
        const rt = playRuntimeRef.current;
        // First character (by addedAt) is "the player" — same convention
        // as the play loop, so the selection ring lands on the controllable
        // character at a glance even before the user picks one.
        const ordered = [...characters].sort((a, b) => a.addedAt - b.addedAt);
        const playerId = ordered[0]?.id;
        for (const c of ordered) {
          const sheetReady = imgReadyRef.current.has(c.src);
          const sheetImg = ensureImage(c.src);
          if (!sheetReady) continue;
          const cur = rt.get(c.id);
          const px = playing && cur ? cur.x : c.x;
          const py = playing && cur ? cur.y : c.y;
          const dir: Dir8 = playing && cur ? cur.dir : 'idle';

          // Try to find a tagged action animation for this character's
          // current state. Player only — non-player characters always
          // fall back to the static 3×3 cell since they have no walk
          // input. `facing` is the last non-idle direction (defaults to
          // 's'), so the idle pose still has a sensible heading. The
          // `action` was already chosen by the tick loop based on held
          // keys + movement, so the renderer just plays it.
          let used = false;
          if (playing && cur && c.id === playerId) {
            // `cur.action` is set every tick, but a runtime entry that
            // was created by an older code revision (HMR'd into this
            // session) can be missing the field. Default to 'idle' so
            // the lookup doesn't blow up on the first render.
            const actionId: CharacterActionId = cur.action ?? 'idle';
            const facingDir: CharacterDir8 = cur.facing ?? 's';
            const anim = findCharacterAnimation(c, facingDir, actionId);
            if (anim) {
              const animReady = imgReadyRef.current.has(anim.src);
              const animImg = ensureImage(anim.src);
              if (animReady) {
                const total = Math.max(1, anim.cols * anim.rows);
                const fps = Math.max(1, anim.fps ?? c.fps ?? 8);
                const tNow = performance.now();
                const frame = Math.floor((tNow * fps) / 1000) % total;
                const aCol = frame % anim.cols;
                const aRow = Math.floor(frame / anim.cols);
                ctx!.drawImage(
                  animImg,
                  aCol * anim.frameW, aRow * anim.frameH, anim.frameW, anim.frameH,
                  px - c.width / 2, py - c.height / 2, c.width, c.height,
                );
                used = true;
              }
            }
          }

          if (!used) {
            const cellIdx = DIR_CELL_INDEX[dir];
            const col = cellIdx % c.cols;
            const row = Math.floor(cellIdx / c.cols);
            // Source rect: one cell of the sheet. Destination rect: world
            // size centered on the character's position.
            ctx!.drawImage(
              sheetImg,
              col * c.frameW, row * c.frameH, c.frameW, c.frameH,
              px - c.width / 2, py - c.height / 2, c.width, c.height,
            );
          }
          // Selection ring — only in edit mode (play mode hides chrome
          // so the player sees their game). Players selected via the
          // panel get a green ring; the active "player" gets a blue one.
          if (!playing && (c.id === s.selectedCharacterId || c.id === playerId)) {
            const halfW = c.width / 2;
            const halfH = c.height / 2;
            ctx!.save();
            ctx!.translate(px, py);
            ctx!.strokeStyle = c.id === s.selectedCharacterId ? '#10b981' : '#0ea5e9';
            ctx!.lineWidth = 2 / cam.zoom;
            ctx!.setLineDash([4 / cam.zoom, 3 / cam.zoom]);
            ctx!.strokeRect(-halfW, -halfH, c.width, c.height);
            ctx!.setLineDash([]);
            ctx!.restore();
          }
        }
      }

      // ── Pending pen path overlay ────────────────────────────────
      // Drawn AFTER objects so committed sprites + collisions don't
      // occlude the in-progress dashed polyline. The path is in the
      // owning object's local frame (origin = object centre, un-rotated)
      // so it visually attaches to the sprite the user is annotating.
      if (s.tool === 'pen' && s.pendingPenObjectId && s.pendingPenAnchors.length > 0) {
        const owner = s.objects.find((o) => o.id === s.pendingPenObjectId);
        if (owner) {
          ctx!.save();
          ctx!.translate(owner.x, owner.y);
          if (owner.rotation) ctx!.rotate(owner.rotation * Math.PI / 180);
          const anchors = s.pendingPenAnchors;
          // Solid amber stroke for the committed segments.
          ctx!.strokeStyle = '#f59e0b';
          ctx!.lineWidth = 2 / cam.zoom;
          ctx!.lineJoin = 'round';
          ctx!.lineCap = 'round';
          ctx!.setLineDash([4 / cam.zoom, 3 / cam.zoom]);
          ctx!.beginPath();
          ctx!.moveTo(anchors[0].x, anchors[0].y);
          for (let i = 1; i < anchors.length; i++) {
            const a = anchors[i];
            ctx!.lineTo(a.x, a.y);
          }
          ctx!.stroke();
          // Live rubber-band — last anchor → cursor (in local coords).
          if (cursorLocalRef.current && anchors.length > 0) {
            const last = anchors[anchors.length - 1];
            const cl = cursorLocalRef.current;
            ctx!.setLineDash([3 / cam.zoom, 3 / cam.zoom]);
            ctx!.globalAlpha = 0.5;
            ctx!.beginPath();
            ctx!.moveTo(last.x, last.y);
            ctx!.lineTo(cl.x, cl.y);
            ctx!.stroke();
            ctx!.globalAlpha = 1;
          }
          ctx!.setLineDash([]);
          // Anchor handles — square white-filled with amber border. The
          // first anchor gets a slightly larger ring so the user sees
          // where to click to close the loop.
          for (let i = 0; i < anchors.length; i++) {
            const a = anchors[i];
            const rPx = (i === 0 ? 6 : 4) / cam.zoom;
            ctx!.fillStyle = '#ffffff';
            ctx!.strokeStyle = '#f59e0b';
            ctx!.lineWidth = 1.5 / cam.zoom;
            ctx!.beginPath();
            ctx!.arc(a.x, a.y, rPx, 0, Math.PI * 2);
            ctx!.fill();
            ctx!.stroke();
          }
          ctx!.restore();
        }
      }

      // ── Fence component (procedural pixel-art posts + rails) ────
      // Edges first so posts overlap their ends. Edges are only drawn
      // when both endpoints exist as posts (deleting a post via clear
      // would orphan an edge, so we guard at draw time too).
      const fenceEdgeKeys = Object.keys(s.fenceEdges);
      const fencePostKeys = Object.keys(s.fencePosts);
      if (fenceEdgeKeys.length || fencePostKeys.length) {
        const postCenter = (key: string) => {
          const [cx, cy] = key.split(',').map(Number);
          return { x: cx * ts + ts / 2, y: cy * ts + ts / 2 };
        };
        ctx!.lineCap = 'round';
        for (const ek of fenceEdgeKeys) {
          const sep = ek.indexOf('|');
          if (sep < 0) continue;
          const a = ek.slice(0, sep);
          const b = ek.slice(sep + 1);
          if (!s.fencePosts[a] || !s.fencePosts[b]) continue;
          const A = postCenter(a);
          const B = postCenter(b);
          const dx = B.x - A.x;
          const dy = B.y - A.y;
          const len = Math.hypot(dx, dy);
          if (!len) continue;
          const nx = -dy / len;
          const ny = dx / len;
          const railOffsets = [-ts * 0.14, ts * 0.14];
          for (const off of railOffsets) {
            ctx!.strokeStyle = '#7a5a35';
            ctx!.lineWidth = Math.max(2 / cam.zoom, ts * 0.07);
            ctx!.beginPath();
            ctx!.moveTo(A.x + nx * off, A.y + ny * off);
            ctx!.lineTo(B.x + nx * off, B.y + ny * off);
            ctx!.stroke();
            ctx!.strokeStyle = '#b08a55';
            ctx!.lineWidth = Math.max(1 / cam.zoom, ts * 0.025);
            ctx!.beginPath();
            ctx!.moveTo(A.x + nx * off, A.y + ny * off - ts * 0.02);
            ctx!.lineTo(B.x + nx * off, B.y + ny * off - ts * 0.02);
            ctx!.stroke();
          }
        }
        const postW = ts * 0.20;
        const postH = ts * 0.58;
        for (const key of fencePostKeys) {
          const c = postCenter(key);
          const x = c.x - postW / 2;
          const y = c.y - postH / 2;
          ctx!.fillStyle = 'rgba(0,0,0,0.20)';
          ctx!.fillRect(x - 1, y + postH, postW + 2, ts * 0.06);
          ctx!.fillStyle = '#7a5a35';
          ctx!.fillRect(x, y, postW, postH);
          ctx!.fillStyle = '#b08a55';
          ctx!.fillRect(x, y, Math.max(1, postW * 0.28), postH);
          ctx!.fillStyle = '#5a4225';
          ctx!.fillRect(x - postW * 0.12, y, postW * 1.24, ts * 0.07);
          if (s.selectedFencePostKey === key) {
            ctx!.strokeStyle = '#0ea5e9';
            ctx!.lineWidth = 2 / cam.zoom;
            ctx!.setLineDash([4 / cam.zoom, 3 / cam.zoom]);
            ctx!.strokeRect(c.x - ts * 0.42, c.y - ts * 0.42, ts * 0.84, ts * 0.84);
            ctx!.setLineDash([]);
          }
        }
        ctx!.lineCap = 'butt';
      }

      // Fence-tool hover ghost: outline the 8-neighbour ring of the
      // current post (where a click adds a connected segment) and the
      // hovered cell where a new post would land. Uses hoverRef directly
      // because the shared `hover` const is declared further down.
      const fenceHover = hoverRef.current;
      if (fenceHover && s.tool === 'fence') {
        if (s.selectedFencePostKey) {
          const [sx, sy] = s.selectedFencePostKey.split(',').map(Number);
          ctx!.strokeStyle = 'rgba(168,85,247,0.5)';
          ctx!.lineWidth = 1.5 / cam.zoom;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (!dx && !dy) continue;
              ctx!.strokeRect((sx + dx) * ts, (sy + dy) * ts, ts, ts);
            }
          }
        }
        ctx!.fillStyle = 'rgba(168,85,247,0.18)';
        ctx!.strokeStyle = 'rgba(126,34,206,0.85)';
        ctx!.lineWidth = 1.5 / cam.zoom;
        ctx!.fillRect(fenceHover.cx * ts, fenceHover.cy * ts, ts, ts);
        ctx!.strokeRect(fenceHover.cx * ts, fenceHover.cy * ts, ts, ts);
      }

      // Grid overlay.
      if (s.showGrid && cam.zoom > 0.25) {
        const fade = Math.min(1, (cam.zoom - 0.25) * 2);
        ctx!.strokeStyle = `rgba(29,26,20,${(0.10 * fade).toFixed(3)})`;
        ctx!.lineWidth = 1 / cam.zoom;
        ctx!.beginPath();
        for (let cx = cx0; cx <= cx1; cx++) {
          const px = cx * ts;
          ctx!.moveTo(px, cy0 * ts);
          ctx!.lineTo(px, cy1 * ts);
        }
        for (let cy = cy0; cy <= cy1; cy++) {
          const py = cy * ts;
          ctx!.moveTo(cx0 * ts, py);
          ctx!.lineTo(cx1 * ts, py);
        }
        ctx!.stroke();
      }

      // Brush ghost — outline the cells the brush will affect.
      const hover = hoverRef.current;
      if (hover && (s.tool === 'paint' || s.tool === 'erase' || s.tool === 'fill')) {
        const cells = brushCells(hover.cx, hover.cy, s.brushSize);
        const fill = s.tool === 'erase' ? 'rgba(231,76,60,0.18)'
          : s.tool === 'fill' ? 'rgba(14,165,233,0.18)'
          : 'rgba(110,180,90,0.22)';
        const stroke = s.tool === 'erase' ? 'rgba(231,76,60,0.7)'
          : s.tool === 'fill' ? 'rgba(14,165,233,0.7)'
          : 'rgba(60,140,40,0.7)';
        ctx!.fillStyle = fill;
        ctx!.strokeStyle = stroke;
        ctx!.lineWidth = 1.5 / cam.zoom;
        for (const [cx, cy] of cells) {
          ctx!.fillRect(cx * ts, cy * ts, ts, ts);
          ctx!.strokeRect(cx * ts, cy * ts, ts, ts);
        }
      }

      // Object placement ghost — show the snapped cells AND a faint preview
      // of the currently-picked style so the user sees exactly what + where
      // they'll drop (style swaps the preview in real time).
      if (hover && s.tool === 'object' && s.selectedAssetId && s.selectedStyleId) {
        const found = findStyle(s.objectAssets, s.selectedAssetId, s.selectedStyleId);
        if (found) {
          const { cellsW, cellsH, cellTLX, cellTLY } = objectFootprint(found.style.width, found.style.height, ts, hover.cx, hover.cy);
          ctx!.fillStyle = 'rgba(168,85,247,0.18)';
          ctx!.strokeStyle = 'rgba(126,34,206,0.85)';
          ctx!.lineWidth = 1.5 / cam.zoom;
          for (let dy = 0; dy < cellsH; dy++) {
            for (let dx = 0; dx < cellsW; dx++) {
              const px = (cellTLX + dx) * ts;
              const py = (cellTLY + dy) * ts;
              ctx!.fillRect(px, py, ts, ts);
              ctx!.strokeRect(px, py, ts, ts);
            }
          }
          const img = imgCacheRef.current.get(found.style.dataUrl);
          if (img && imgReadyRef.current.has(found.style.dataUrl)) {
            const w = cellsW * ts;
            const h = cellsH * ts;
            const x = cellTLX * ts;
            const y = cellTLY * ts;
            ctx!.globalAlpha = 0.55;
            ctx!.drawImage(img, x, y, w, h);
            ctx!.globalAlpha = 1;
          }
        }
      }

      ctx!.restore();

      // Keep the loop going while at least one animated tile was visible
      // this frame so its frames cycle. No-op otherwise — the renderer
      // falls back to event-driven rAF and the canvas burns zero CPU at
      // idle.
      if (didAnimate) scheduleRender();
    }

    /**
     * Compute the cell-aligned footprint for placing an object whose natural
     * size is (assetW × assetH) when the cursor is over cell (cursorCX, cursorCY).
     * The cursor cell becomes the top-left of an N×M cell block sized to the
     * sprite (ceil so a 33-px sprite still occupies a single 32-px cell rather
     * than disappearing to zero). The placement code uses the same helper so
     * preview and final position match exactly.
     */
    function objectFootprint(assetW: number, assetH: number, ts: number, cursorCX: number, cursorCY: number) {
      const cellsW = Math.max(1, Math.round(assetW / ts));
      const cellsH = Math.max(1, Math.round(assetH / ts));
      return {
        cellsW,
        cellsH,
        cellTLX: cursorCX,
        cellTLY: cursorCY,
      };
    }

    function screenToWorld(sx: number, sy: number) {
      const cam = stateRef.current.camera;
      return {
        x: (sx - canvas!.width / 2) / cam.zoom + cam.x,
        y: (sy - canvas!.height / 2) / cam.zoom + cam.y,
      };
    }

    function worldToCell(wx: number, wy: number) {
      const ts = stateRef.current.tileSize;
      return { cx: Math.floor(wx / ts), cy: Math.floor(wy / ts) };
    }

    function eventCanvasCoords(e: MouseEvent | WheelEvent | PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) * (canvas!.width / rect.width),
        y: (e.clientY - rect.top) * (canvas!.height / rect.height),
      };
    }

    function brushCells(cx: number, cy: number, size: number): Array<[number, number]> {
      const cells: Array<[number, number]> = [];
      // Brush of size N = NxN block centered on the cursor cell.
      const half = Math.floor(size / 2);
      for (let dy = -half; dy < size - half; dy++) {
        for (let dx = -half; dx < size - half; dx++) {
          cells.push([cx + dx, cy + dy]);
        }
      }
      return cells;
    }

    /** Paint a cell = stamp its 4 corners with the active brush texture id.
     *  Overwrites whatever was there before, so painting one terrain over
     *  another smoothly converts the region. */
    function paintCell(corners: Record<string, string>, cx: number, cy: number, texId: string) {
      corners[`${cx},${cy}`] = texId;
      corners[`${cx + 1},${cy}`] = texId;
      corners[`${cx},${cy + 1}`] = texId;
      corners[`${cx + 1},${cy + 1}`] = texId;
    }

    /** Erase a cell = clear all 4 corners (back to "transparent"). Affects
     *  the 8 surrounding cells' transitions since corners are shared. */
    function eraseCell(corners: Record<string, string>, cx: number, cy: number) {
      delete corners[`${cx},${cy}`];
      delete corners[`${cx + 1},${cy}`];
      delete corners[`${cx},${cy + 1}`];
      delete corners[`${cx + 1},${cy + 1}`];
    }

    /**
     * Build a packed cell transform from the brush's current random
     * options. Bits: 0x1 = flipH, 0x2 = flipV, 0xC = rotation quadrant.
     * Returns 0 when none of the random toggles are on, signalling
     * "no transform — draw straight".
     */
    function rollCellTransform(flipH: boolean, flipV: boolean, rotate: boolean): number {
      let t = 0;
      if (flipH && Math.random() < 0.5) t |= 0x1;
      if (flipV && Math.random() < 0.5) t |= 0x2;
      if (rotate) t |= (Math.floor(Math.random() * 4) & 0x3) << 2;
      return t;
    }

    /**
     * Per-cell validity gate for a paint stroke. Returns each brush cell
     * whose painting (in isolation) would keep every cell in its 3×3
     * neighborhood renderable. Rejected cells are dropped from the stroke
     * but the stroke still commits whatever passed — so a brush dragged
     * past a dirt edge paints up to the edge and stops, instead of being
     * cancelled wholesale.
     *
     * Why per-cell instead of all-of-brush: when several brush cells
     * paint the same texId, the batch commit only ADDS texId corners (it
     * never adds non-texId corners). So if cell A is per-cell valid
     * (painting A alone leaves all neighbors valid) and cell B is per-cell
     * valid, painting both leaves every neighbor with at least as many
     * texId corners and at most the same set of non-texId corners — i.e.
     * still valid. Per-cell sim already accounts for shared-corner stamps:
     * a brush cell adjacent to dirt sees the dirt cell go invalid in its
     * own neighborhood check and gets rejected. So the partial commit is
     * provably free of unlinked-texture cells.
     *
     * "Renderable" = empty, pure (one canonical texture), or a bridged
     * 2-texture transition. 3+ unique or 2 unbridged → reject the cell.
     */
    function filterPaintableCells(
      cells: ReadonlyArray<readonly [number, number]>,
      texId: string,
      corners: Record<string, string>,
      tilesets: typeof stateRef.current.tilesets,
    ): Array<[number, number]> {
      const out: Array<[number, number]> = [];
      for (const [cx, cy] of cells) {
        // Simulate painting JUST this cell — its 4 corners become texId,
        // the rest of the canvas stays as-is.
        const cellCorners = new Set<string>([
          `${cx},${cy}`, `${cx + 1},${cy}`,
          `${cx},${cy + 1}`, `${cx + 1},${cy + 1}`,
        ]);
        const after = (x: number, y: number): string | undefined => {
          const k = `${x},${y}`;
          return cellCorners.has(k) ? texId : corners[k];
        };
        let ok = true;
        for (let dy = -1; dy <= 1 && ok; dy++) {
          for (let dx = -1; dx <= 1 && ok; dx++) {
            const ncx = cx + dx;
            const ncy = cy + dy;
            if (!canPlaceCorners(
              after(ncx, ncy),
              after(ncx + 1, ncy),
              after(ncx, ncy + 1),
              after(ncx + 1, ncy + 1),
              tilesets,
            )) {
              ok = false;
            }
          }
        }
        if (ok) out.push([cx, cy]);
      }
      return out;
    }

    function applyPaint(cell: { cx: number; cy: number }) {
      const s = stateRef.current;
      const layer = s.layers.find((l) => l.id === s.activeLayerId);
      if (!layer) return;
      const baseTexId = s.brushTextureId;
      if (!baseTexId) return;
      const cells = brushCells(cell.cx, cell.cy, s.brushSize);
      if (cells.length === 0) return;
      // Swap to a sibling brush when the surrounding region's dominant
      // texture has no bridge with the chosen one, so two independently-
      // uploaded tilesets sharing a "grass" sprite blend through whichever
      // sheet's transitions actually exist on the local boundary.
      const texId = pickAdjustedBrushTexture(
        baseTexId, cells, layer.corners, s.tilesets, s.tiles,
      );
      // Refuse to bring unlinked textures into contact — cells whose
      // post-paint neighborhood would render invalid are skipped.
      const allowed = filterPaintableCells(cells, texId, layer.corners, s.tilesets);
      if (allowed.length === 0) return;
      s.mutateCorners(layer.id, (c) => {
        for (const [cx, cy] of allowed) paintCell(c, cx, cy, texId);
      });
      // Roll a fresh per-cell render transform when any random brush
      // option is on; clear stale transforms otherwise so re-painting a
      // cell with options off goes back to the un-rotated default.
      const anyRandom = s.brushRandomFlipH || s.brushRandomFlipV || s.brushRandomRotate;
      s.mutateCellTransforms(layer.id, (t) => {
        for (const [cx, cy] of allowed) {
          const k = `${cx},${cy}`;
          if (anyRandom) {
            const v = rollCellTransform(s.brushRandomFlipH, s.brushRandomFlipV, s.brushRandomRotate);
            if (v === 0) delete t[k];
            else t[k] = v;
          } else {
            delete t[k];
          }
        }
      });
      // Broadcast to other players in the room. We send the FINAL texId
      // (post-sibling swap), not the brush input, so remote clients
      // apply exactly the same texture choice the local renderer used.
      // Per-cell random transforms are intentionally NOT synced —
      // visual variety is rolled independently per-client. Drops to a
      // no-op when offline / not in a room.
      realtimeRef.current.broadcast(
        buildPaintEvent(layer.id, allowed, texId, senderIdRef.current),
      );
    }

    function applyErase(cell: { cx: number; cy: number }) {
      const s = stateRef.current;
      const layer = s.layers.find((l) => l.id === s.activeLayerId);
      if (!layer) return;
      const cells = brushCells(cell.cx, cell.cy, s.brushSize);
      if (cells.length === 0) return;
      s.mutateCorners(layer.id, (c) => {
        for (const [cx, cy] of cells) eraseCell(c, cx, cy);
      });
      // Drop any cached render transforms for the erased cells — they no
      // longer have a tile to flip/rotate.
      s.mutateCellTransforms(layer.id, (t) => {
        for (const [cx, cy] of cells) delete t[`${cx},${cy}`];
      });
      realtimeRef.current.broadcast(
        buildEraseEvent(layer.id, cells, senderIdRef.current),
      );
    }

    /** Flood-fill connected empty cells with the brush texture. */
    function applyFill(cell: { cx: number; cy: number }) {
      const s = stateRef.current;
      const layer = s.layers.find((l) => l.id === s.activeLayerId);
      if (!layer) return;
      const texId = s.brushTextureId;
      if (!texId) return;
      function isEmpty(corners: Record<string, string>, cx: number, cy: number): boolean {
        return !(corners[`${cx},${cy}`] || corners[`${cx + 1},${cy}`]
          || corners[`${cx},${cy + 1}`] || corners[`${cx + 1},${cy + 1}`]);
      }
      const start = cell;
      if (!isEmpty(layer.corners, start.cx, start.cy)) return;
      const visited = new Set<string>();
      const stack: Array<[number, number]> = [[start.cx, start.cy]];
      const writes: Array<[number, number]> = [];
      const MAX = 4000;
      while (stack.length && writes.length < MAX) {
        const [cx, cy] = stack.pop()!;
        const k = `${cx},${cy}`;
        if (visited.has(k)) continue;
        visited.add(k);
        if (!isEmpty(layer.corners, cx, cy)) continue;
        writes.push([cx, cy]);
        stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
      }
      const adjustedTexId = pickAdjustedBrushTexture(
        texId, writes, layer.corners, s.tilesets, s.tiles,
      );
      const allowed = filterPaintableCells(writes, adjustedTexId, layer.corners, s.tilesets);
      if (allowed.length === 0) return;
      s.mutateCorners(layer.id, (c) => {
        for (const [cx, cy] of allowed) paintCell(c, cx, cy, adjustedTexId);
      });
      const anyRandom = s.brushRandomFlipH || s.brushRandomFlipV || s.brushRandomRotate;
      s.mutateCellTransforms(layer.id, (t) => {
        for (const [cx, cy] of allowed) {
          const k = `${cx},${cy}`;
          if (anyRandom) {
            const v = rollCellTransform(s.brushRandomFlipH, s.brushRandomFlipV, s.brushRandomRotate);
            if (v === 0) delete t[k];
            else t[k] = v;
          } else {
            delete t[k];
          }
        }
      });
      // Fills can run thousands of cells — broadcasting them as a single
      // event keeps the websocket payload count low. Remote receivers
      // apply the deltas in one mutateCorners call by virtue of the
      // batched cells array.
      realtimeRef.current.broadcast(
        buildPaintEvent(layer.id, allowed, adjustedTexId, senderIdRef.current),
      );
    }

    /** Pick the texture id under the cursor → set as the brush. */
    function applyEyedropper(cell: { cx: number; cy: number }) {
      const s = stateRef.current;
      for (let i = s.layers.length - 1; i >= 0; i--) {
        const l = s.layers[i];
        if (!l.visible) continue;
        const sample = l.corners[`${cell.cx},${cell.cy}`]
          ?? l.corners[`${cell.cx + 1},${cell.cy}`]
          ?? l.corners[`${cell.cx},${cell.cy + 1}`]
          ?? l.corners[`${cell.cx + 1},${cell.cy + 1}`];
        if (sample) {
          s.setBrushTextureId(sample);
          s.setTool('paint');
          return;
        }
      }
    }

    /** Hit-test characters at a world point. Characters never rotate, so
     *  the bounds test is a plain AABB around the character's center.
     *  Top-most-first ordering matches pickObjectAt: later-added (or
     *  closer-to-camera) characters win when stacked. */
    function pickCharacterAt(wx: number, wy: number) {
      const s = stateRef.current;
      const sorted = Object.values(s.tileCharacters).sort((a, b) => b.addedAt - a.addedAt);
      for (const c of sorted) {
        if (
          wx >= c.x - c.width / 2 && wx <= c.x + c.width / 2 &&
          wy >= c.y - c.height / 2 && wy <= c.y + c.height / 2
        ) return c;
      }
      return null;
    }

    function pickObjectAt(wx: number, wy: number) {
      const s = stateRef.current;
      const sorted = [...s.objects].sort((a, b) => b.y - a.y);
      for (const o of sorted) {
        const layer = s.layers.find((l) => l.id === o.layerId);
        if (layer && !layer.visible) continue;
        // Hit-test in the object's LOCAL rotated frame so rotated sprites
        // pick up clicks on their actual painted bounds, not the AABB.
        const dx = wx - o.x;
        const dy = wy - o.y;
        const r = -(o.rotation || 0) * Math.PI / 180;
        const lx = dx * Math.cos(r) - dy * Math.sin(r);
        const ly = dx * Math.sin(r) + dy * Math.cos(r);
        if (
          lx >= -o.width / 2 && lx <= o.width / 2 &&
          ly >= -o.height / 2 && ly <= o.height / 2
        ) return o;
      }
      return null;
    }

    /**
     * Test whether (wx, wy) lands on a transform handle of the currently-
     * selected object. Returns 'resize' (bottom-right square), 'rotate'
     * (circle above top centre), or null. Computes hit zones in the
     * object's local rotated frame so handles work for rotated sprites.
     */
    function pickHandleAt(wx: number, wy: number): 'resize' | 'rotate' | null {
      const s = stateRef.current;
      if (!s.selectedObjectId) return null;
      const o = s.objects.find((x) => x.id === s.selectedObjectId);
      if (!o) return null;
      const dx = wx - o.x;
      const dy = wy - o.y;
      const r = -(o.rotation || 0) * Math.PI / 180;
      const lx = dx * Math.cos(r) - dy * Math.sin(r);
      const ly = dx * Math.sin(r) + dy * Math.cos(r);
      const halfW = o.width / 2;
      const halfH = o.height / 2;
      const zoom = s.camera.zoom;
      const handleHalf = 8 / zoom;       // generous hit zone (visual is 10/zoom)
      const stalkLen = 22 / zoom;
      const rotR = 10 / zoom;            // generous hit zone (visual is 6/zoom)
      // Resize: bottom-right corner.
      if (Math.abs(lx - halfW) <= handleHalf && Math.abs(ly - halfH) <= handleHalf) return 'resize';
      // Rotate: stalk endpoint above top-centre.
      const rx = lx - 0;
      const ry = ly - (-halfH - stalkLen);
      if (Math.hypot(rx, ry) <= rotR) return 'rotate';
      return null;
    }

    function onPointerDown(e: PointerEvent) {
      if (e.button === 1 || (e.button === 0 && (spaceHeld || e.altKey))) {
        isPanning = true;
        const cam = stateRef.current.camera;
        panStart = { x: e.clientX, y: e.clientY, camX: cam.x, camY: cam.y };
        canvas!.style.cursor = 'grabbing';
        canvas!.setPointerCapture(e.pointerId);
        e.preventDefault();
        return;
      }
      const cc = eventCanvasCoords(e);
      const w = screenToWorld(cc.x, cc.y);
      const cell = worldToCell(w.x, w.y);
      const s = stateRef.current;
      if (e.button === 2) {
        isDrawing = 'erase';
        s.beginUndoGroup();
        applyErase(cell);
        canvas!.setPointerCapture(e.pointerId);
        scheduleRender();
        return;
      }
      if (e.button !== 0) return;

      // Transform handles take priority over everything except panning —
      // user wants to grab the resize/rotate handle of the SELECTED object
      // even if they're still in OBJECT (or any other) tool. Without this,
      // the handle would be unreachable from OBJECT mode.
      const handle = pickHandleAt(w.x, w.y);
      if (handle && s.selectedObjectId) {
        const obj = s.objects.find((x) => x.id === s.selectedObjectId)!;
        if (handle === 'resize') {
          resizeDragRef.current = {
            id: obj.id,
            startW: obj.width,
            startH: obj.height,
            rotation: obj.rotation || 0,
          };
        } else {
          rotateDragRef.current = {
            id: obj.id,
            cx: obj.x,
            cy: obj.y,
            startAngle: Math.atan2(w.y - obj.y, w.x - obj.x),
            origRotation: obj.rotation || 0,
          };
        }
        // Group the many updateObject calls during the drag into one
        // undo step. Without this, updateObject doesn't auto-record
        // (slider drags would flood the stack), so resize/rotate would
        // be invisible to undo entirely.
        s.beginUndoGroup();
        canvas!.setPointerCapture(e.pointerId);
        return;
      }

      if (s.tool === 'object') {
        // Click on an existing placed object → select it AND switch to
        // SELECT so the user can immediately drag/resize/rotate. Empty
        // space still places a new sprite. Without this, the only way to
        // edit a placed object was to first toggle tools manually, which
        // wasn't obvious.
        const hitExisting = pickObjectAt(w.x, w.y);
        if (hitExisting) {
          s.selectObject(hitExisting.id);
          s.setTool('select');
          objectDragRef.current = {
            id: hitExisting.id,
            startWX: w.x, startWY: w.y,
            origX: hitExisting.x, origY: hitExisting.y,
          };
          s.beginUndoGroup();
          canvas!.setPointerCapture(e.pointerId);
          scheduleRender();
          return;
        }
        if (!s.selectedAssetId || !s.selectedStyleId) return;
        const found = findStyle(s.objectAssets, s.selectedAssetId, s.selectedStyleId);
        if (!found) return;
        // Snap to the grid using the same footprint helper the hover ghost
        // uses, so the placed object lands exactly where the preview showed.
        const ts = s.tileSize;
        const { cellsW, cellsH, cellTLX, cellTLY } = objectFootprint(found.style.width, found.style.height, ts, cell.cx, cell.cy);
        let placedW = cellsW * ts;
        let placedH = cellsH * ts;
        // Apply group stamp randomization (size + flip) when the asset is a
        // member of a group with those toggles on. First-matching group
        // wins, mirroring the render-time tint lookup.
        let stampFlipX = false;
        let stampFlipY = false;
        for (const g of Object.values(s.tileGroups).sort((a, b) => a.sortIndex - b.sortIndex)) {
          if (!g.assetIds.includes(s.selectedAssetId)) continue;
          const base = g.sizeBase ?? 1;
          const sMin = g.sizeMin ?? 0.8;
          const sMax = g.sizeMax ?? 1.2;
          const factor = base * (g.randomSize ? sMin + Math.random() * (sMax - sMin) : 1);
          placedW = Math.max(1, placedW * factor);
          placedH = Math.max(1, placedH * factor);
          if (g.randomFlipX) stampFlipX = Math.random() < 0.5;
          if (g.randomFlipY) stampFlipY = Math.random() < 0.5;
          break;
        }
        const id = s.addObject({
          layerId: s.activeLayerId,
          x: cellTLX * ts + placedW / 2,
          y: cellTLY * ts + placedH / 2,
          assetId: s.selectedAssetId,
          styleId: s.selectedStyleId,
          width: placedW,
          height: placedH,
          rotation: 0,
          flipX: stampFlipX, flipY: stampFlipY,
          hue: 0,
          name: found.asset.name || `Object ${s.objects.length + 1}`,
        });
        s.selectObject(id);
        scheduleRender();
        return;
      }

      if (s.tool === 'select') {
        // Character hit-test wins over object hit-test when both stack at
        // the same point — characters are typically placed on top of map
        // objects (a player walking over a rug, etc.) and the user
        // expects clicking to grab the character, not the rug under it.
        // Skipped during play mode so a click never wrests the player
        // away from WASD control.
        const playingNow = useSceneStore.getState().isPlaying;
        const charHit = !playingNow ? pickCharacterAt(w.x, w.y) : null;
        if (charHit) {
          s.setSelectedCharacterId(charHit.id);
          s.selectObject(null);
          characterDragRef.current = {
            id: charHit.id,
            startWX: w.x, startWY: w.y,
            origX: charHit.x, origY: charHit.y,
          };
          canvas!.setPointerCapture(e.pointerId);
          scheduleRender();
          return;
        }
        const hit = pickObjectAt(w.x, w.y);
        s.selectObject(hit?.id ?? null);
        if (hit) {
          // Clicking an object also clears any character selection so the
          // green selection ring doesn't linger on the wrong target.
          s.setSelectedCharacterId(null);
          objectDragRef.current = {
            id: hit.id,
            startWX: w.x, startWY: w.y,
            origX: hit.x, origY: hit.y,
          };
          s.beginUndoGroup();
          canvas!.setPointerCapture(e.pointerId);
        } else {
          s.setSelectedCharacterId(null);
        }
        scheduleRender();
        return;
      }

      if (s.tool === 'fence') {
        s.placeFenceAt(cell.cx, cell.cy);
        scheduleRender();
        return;
      }

      if (s.tool === 'pen') {
        // Pen tool requires a SELECTED object — anchors are stored in that
        // object's local frame so they ride along with move/rotate/scale.
        // Without a target, click-with-pen still picks an object (matches
        // freeform: clicking a different image while pen-active reattaches
        // the path to the new image). Empty-space click is a no-op.
        const hit = pickObjectAt(w.x, w.y);
        const targetId = s.pendingPenObjectId ?? s.selectedObjectId ?? hit?.id ?? null;
        if (!targetId) {
          if (hit) s.selectObject(hit.id);
          scheduleRender();
          return;
        }
        const target = s.objects.find((o) => o.id === targetId);
        if (!target) return;
        // Convert world cursor → object-local (origin = object centre,
        // un-rotated). Same maths as the rotation/resize code paths.
        const dx = w.x - target.x;
        const dy = w.y - target.y;
        const r = -(target.rotation || 0) * Math.PI / 180;
        const lx = dx * Math.cos(r) - dy * Math.sin(r);
        const ly = dx * Math.sin(r) + dy * Math.cos(r);

        // First click on this object → start a fresh path AND select the
        // object so the rest of the toolbar (resize, hue) reflects the
        // pen's owner.
        if (!s.pendingPenObjectId) {
          if (s.selectedObjectId !== target.id) s.selectObject(target.id);
          s.beginPenPath(target.id);
          s.addPenAnchor({ x: lx, y: ly });
          scheduleRender();
          return;
        }

        // Continuing a path on the SAME object — close + commit if we
        // clicked back near the first anchor (within ~8 screen px), else
        // append a fresh anchor.
        const anchors = s.pendingPenAnchors;
        if (anchors.length >= 2) {
          const first = anchors[0];
          const distLocal = Math.hypot(lx - first.x, ly - first.y);
          // Convert pen-tool click hit radius from screen pixels →
          // object-local coords. The pen anchors live in un-rotated local
          // space, so a screen radius of N px = (N / zoom) world units →
          // (N / zoom) local units (uniform scale, no rotation distortion).
          const screenHitR = 8 / s.camera.zoom;
          if (distLocal <= screenHitR) {
            s.commitPenPath(true);
            scheduleRender();
            return;
          }
        }
        s.addPenAnchor({ x: lx, y: ly });
        scheduleRender();
        return;
      }
      if (s.tool === 'paint') {
        isDrawing = 'paint';
        s.beginUndoGroup();
        applyPaint(cell);
      }
      else if (s.tool === 'erase') {
        isDrawing = 'erase';
        s.beginUndoGroup();
        applyErase(cell);
      }
      else if (s.tool === 'fill') {
        // Fill mutates corners + cellTransforms in one click. Without
        // a group, that's two undo steps for one user action; group
        // them here so a single Cmd+Z reverts the whole fill.
        s.beginUndoGroup();
        applyFill(cell);
        s.commitUndoGroup();
      }
      else if (s.tool === 'eyedropper') { applyEyedropper(cell); }
      canvas!.setPointerCapture(e.pointerId);
      scheduleRender();
    }

    function onPointerMove(e: PointerEvent) {
      const cc = eventCanvasCoords(e);
      // Track canvas-device-pixel cursor for paste/drop fallback drops.
      cursorCanvasRef.current = { x: cc.x, y: cc.y };
      // Live rubber-band — when a pen path is in progress, derive the
      // owning object's local coords for the cursor so the dashed line
      // from the last anchor follows the pointer in real time.
      const sNow = stateRef.current;
      if (sNow.tool === 'pen' && sNow.pendingPenObjectId) {
        const w0 = screenToWorld(cc.x, cc.y);
        const target = sNow.objects.find((o) => o.id === sNow.pendingPenObjectId);
        if (target) {
          const dx = w0.x - target.x;
          const dy = w0.y - target.y;
          const r = -(target.rotation || 0) * Math.PI / 180;
          cursorLocalRef.current = {
            x: dx * Math.cos(r) - dy * Math.sin(r),
            y: dx * Math.sin(r) + dy * Math.cos(r),
          };
          scheduleRender();
        }
      }
      if (isPanning) {
        const cam = stateRef.current.camera;
        const dx = (e.clientX - panStart.x) * (canvas!.width / canvas!.getBoundingClientRect().width);
        const dy = (e.clientY - panStart.y) * (canvas!.height / canvas!.getBoundingClientRect().height);
        stateRef.current.setCamera({
          x: panStart.camX - dx / cam.zoom,
          y: panStart.camY - dy / cam.zoom,
        });
        scheduleRender();
        return;
      }

      const w = screenToWorld(cc.x, cc.y);
      const cell = worldToCell(w.x, w.y);

      if (objectDragRef.current) {
        const drag = objectDragRef.current;
        stateRef.current.updateObject(drag.id, {
          x: drag.origX + (w.x - drag.startWX),
          y: drag.origY + (w.y - drag.startWY),
        });
        scheduleRender();
        return;
      }

      if (characterDragRef.current) {
        const drag = characterDragRef.current;
        stateRef.current.updateTileCharacter(drag.id, {
          x: drag.origX + (w.x - drag.startWX),
          y: drag.origY + (w.y - drag.startWY),
        });
        scheduleRender();
        return;
      }

      if (resizeDragRef.current) {
        const drag = resizeDragRef.current;
        const obj = stateRef.current.objects.find((x) => x.id === drag.id);
        if (obj) {
          // Convert cursor into the object's LOCAL frame; the BR corner
          // is at (halfW, halfH) there. Doubling the local coords gives
          // the new total width/height (object stays centred).
          const r = -drag.rotation * Math.PI / 180;
          const dx = w.x - obj.x;
          const dy = w.y - obj.y;
          const lx = dx * Math.cos(r) - dy * Math.sin(r);
          const ly = dx * Math.sin(r) + dy * Math.cos(r);
          let newW = Math.max(4, lx * 2);
          let newH = Math.max(4, ly * 2);
          // Shift = lock aspect ratio to the original.
          if (e.shiftKey) {
            const aspect = drag.startW / Math.max(1, drag.startH);
            // Use whichever drag direction grew more, fit the other to aspect.
            if (newW / drag.startW > newH / drag.startH) newH = newW / aspect;
            else newW = newH * aspect;
          }
          stateRef.current.updateObject(drag.id, { width: Math.round(newW), height: Math.round(newH) });
        }
        scheduleRender();
        return;
      }

      if (rotateDragRef.current) {
        const drag = rotateDragRef.current;
        const angleNow = Math.atan2(w.y - drag.cy, w.x - drag.cx);
        let degrees = drag.origRotation + (angleNow - drag.startAngle) * 180 / Math.PI;
        // Snap to 15° increments while Shift is held — the standard
        // "rotate cleanly" modifier.
        if (e.shiftKey) degrees = Math.round(degrees / 15) * 15;
        // Normalise to [-180, 180] so the readout in the right panel
        // doesn't drift to absurd values after many full rotations.
        degrees = ((degrees + 180) % 360 + 360) % 360 - 180;
        stateRef.current.updateObject(drag.id, { rotation: Math.round(degrees) });
        scheduleRender();
        return;
      }

      const prev = hoverRef.current;
      if (!prev || prev.cx !== cell.cx || prev.cy !== cell.cy) {
        hoverRef.current = cell;
        scheduleRender();
      }

      if (isDrawing === 'paint') applyPaint(cell);
      else if (isDrawing === 'erase') applyErase(cell);
    }

    function onPointerUp(e: PointerEvent) {
      if (canvas!.hasPointerCapture(e.pointerId)) canvas!.releasePointerCapture(e.pointerId);
      // Close any undo group opened by a stroke (paint/erase/RMB-erase)
      // or an object drag/resize/rotate. commitUndoGroup is a no-op
      // when no group is open, so the panning case doesn't trip it.
      const wasGrouped = isDrawing || objectDragRef.current || resizeDragRef.current || rotateDragRef.current;
      if (wasGrouped) stateRef.current.commitUndoGroup();
      isDrawing = null;
      isPanning = false;
      objectDragRef.current = null;
      characterDragRef.current = null;
      resizeDragRef.current = null;
      rotateDragRef.current = null;
      canvas!.style.cursor = cursorForTool(stateRef.current.tool, spaceHeld);
    }

    function onPointerLeave() {
      hoverRef.current = null;
      cursorCanvasRef.current = null;
      cursorLocalRef.current = null;
      scheduleRender();
    }

    /**
     * Place an array of image sources onto the canvas as TileObjects.
     * Used by the file picker, paste, and drag-and-drop. Probes natural
     * dimensions to preserve aspect ratio (matches FreeformView's
     * `placeImageSources`). Each image becomes a fresh ObjectAsset (so
     * subsequent re-pastes share the asset) and a TileObject placed at
     * the drop world coords (defaults to viewport centre).
     */
    function placeImageSources(
      sources: Array<{ src: string; name: string }>,
      drop?: { x: number; y: number },
    ) {
      if (sources.length === 0) return;
      let cx = drop?.x;
      let cy = drop?.y;
      if (cx === undefined || cy === undefined) {
        const center = screenToWorld(canvas!.width / 2, canvas!.height / 2);
        cx = center.x; cy = center.y;
      }
      sources.forEach((s, i) => {
        const probe = new Image();
        probe.crossOrigin = 'anonymous';
        const finalize = (nw: number, nh: number) => {
          const maxDim = 320;
          const ratio = nw / nh;
          const w = ratio >= 1 ? maxDim : maxDim * ratio;
          const h = ratio >= 1 ? maxDim / ratio : maxDim;
          const st = useTile.getState();
          // Cascade subsequent drops a few px so a multi-select doesn't
          // stack identical sprites on top of each other.
          const px = (cx as number) + i * 24;
          const py = (cy as number) + i * 24;
          const baseName = s.name.replace(/\.[^.]+$/, '') || 'pasted';
          const { assetId, styleId } = st.addObjectAsset({
            name: baseName,
            dataUrl: s.src,
            width: nw || w,
            height: nh || h,
          });
          const objId = st.addObject({
            layerId: st.activeLayerId,
            x: px,
            y: py,
            assetId,
            styleId,
            width: w,
            height: h,
            rotation: 0,
            flipX: false, flipY: false,
            hue: 0,
            name: baseName,
          });
          st.selectObject(objId);
          scheduleRender();
        };
        probe.onload = () => finalize(probe.naturalWidth || 1, probe.naturalHeight || 1);
        probe.onerror = () => finalize(1, 1);
        probe.src = s.src;
      });
    }

    function onFilesPicked(files: FileList | null) {
      const arr = files ? Array.from(files).filter((f) =>
        f.type.startsWith('image/') || /\.svg$/i.test(f.name),
      ) : [];
      if (arr.length === 0) return;
      const drop = cursorCanvasRef.current
        ? screenToWorld(cursorCanvasRef.current.x, cursorCanvasRef.current.y)
        : undefined;
      Promise.all(arr.map(async (f) => ({ src: await fileToDataUrl(f), name: f.name })))
        .then((sources) => placeImageSources(sources, drop))
        .catch((err) => console.error('[tile] file read failed', err));
    }
    fileInputHandlerRef.current = onFilesPicked;

    function onPaste(ev: ClipboardEvent) {
      const ae = document.activeElement as HTMLElement | null;
      if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.isContentEditable)) return;
      const cd = ev.clipboardData;
      if (!cd) return;
      const files: File[] = [];
      for (const item of Array.from(cd.items)) {
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          const f = item.getAsFile();
          if (f) files.push(f);
        }
      }
      const httpSources: Array<{ src: string; name: string }> = [];
      const svgSources: Array<{ src: string; name: string }> = [];
      if (files.length === 0) {
        const text = cd.getData('text/plain') || cd.getData('text/html') || '';
        if (looksLikeSvgMarkup(text)) {
          svgSources.push({ src: svgMarkupToDataUrl(text), name: 'pasted.svg' });
        } else {
          const uri = cd.getData('text/uri-list') || cd.getData('text/plain');
          const trimmed = uri?.trim();
          if (trimmed && /^https?:\/\/.+\.(png|jpe?g|gif|webp|svg|avif|bmp)(\?.*)?$/i.test(trimmed)) {
            httpSources.push({
              src: trimmed,
              name: trimmed.split('/').pop()?.split('?')[0] ?? 'image',
            });
          }
        }
      }
      if (files.length === 0 && httpSources.length === 0 && svgSources.length === 0) return;
      ev.preventDefault();
      const drop = cursorCanvasRef.current
        ? screenToWorld(cursorCanvasRef.current.x, cursorCanvasRef.current.y)
        : undefined;
      if (httpSources.length > 0) placeImageSources(httpSources, drop);
      if (svgSources.length > 0) placeImageSources(svgSources, drop);
      if (files.length > 0) {
        Promise.all(files.map(async (f) => ({ src: await fileToDataUrl(f), name: f.name || 'pasted' })))
          .then((sources) => placeImageSources(sources, drop))
          .catch((err) => console.error('[tile] paste read failed', err));
      }
    }

    function onDragOver(ev: DragEvent) {
      if (!ev.dataTransfer) return;
      const types = Array.from(ev.dataTransfer.types);
      if (types.includes('Files') || types.some((t) => t.startsWith('text/uri-list') || t.startsWith('text/plain'))) {
        ev.preventDefault();
        ev.dataTransfer.dropEffect = 'copy';
      }
    }

    function onDrop(ev: DragEvent) {
      ev.preventDefault();
      const dt = ev.dataTransfer;
      if (!dt) return;
      const files: File[] = [];
      for (const f of Array.from(dt.files)) {
        if (f.type.startsWith('image/') || /\.svg$/i.test(f.name)) files.push(f);
      }
      const httpSources: Array<{ src: string; name: string }> = [];
      const svgSources: Array<{ src: string; name: string }> = [];
      if (files.length === 0) {
        const text = dt.getData('text/plain') || dt.getData('text/html') || '';
        if (looksLikeSvgMarkup(text)) {
          svgSources.push({ src: svgMarkupToDataUrl(text), name: 'dropped.svg' });
        } else {
          const uri = dt.getData('text/uri-list') || dt.getData('text/plain');
          const trimmed = uri?.trim();
          if (trimmed && /^https?:\/\//i.test(trimmed)) {
            httpSources.push({
              src: trimmed,
              name: trimmed.split('/').pop()?.split('?')[0] ?? 'image',
            });
          }
        }
      }
      if (files.length === 0 && httpSources.length === 0 && svgSources.length === 0) return;
      const cc = eventCanvasCoords(ev);
      const drop = screenToWorld(cc.x, cc.y);
      if (httpSources.length > 0) placeImageSources(httpSources, drop);
      if (svgSources.length > 0) placeImageSources(svgSources, drop);
      if (files.length > 0) {
        Promise.all(files.map(async (f) => ({ src: await fileToDataUrl(f), name: f.name })))
          .then((sources) => placeImageSources(sources, drop))
          .catch((err) => console.error('[tile] drop read failed', err));
      }
    }

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const cam = stateRef.current.camera;
      const cc = eventCanvasCoords(e);
      const wxBefore = (cc.x - canvas!.width / 2) / cam.zoom + cam.x;
      const wyBefore = (cc.y - canvas!.height / 2) / cam.zoom + cam.y;
      if (e.ctrlKey || e.metaKey) {
        const factor = Math.exp(-e.deltaY * 0.005);
        const newZoom = Math.max(0.1, Math.min(8, cam.zoom * factor));
        stateRef.current.setCamera({
          zoom: newZoom,
          x: wxBefore - (cc.x - canvas!.width / 2) / newZoom,
          y: wyBefore - (cc.y - canvas!.height / 2) / newZoom,
        });
      } else {
        stateRef.current.setCamera({
          x: cam.x + e.deltaX / cam.zoom,
          y: cam.y + e.deltaY / cam.zoom,
        });
      }
      scheduleRender();
    }

    function onContextMenu(e: MouseEvent) { e.preventDefault(); }

    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      const s = stateRef.current;
      // Cmd/Ctrl+Z = undo, Cmd/Ctrl+Shift+Z (or Cmd/Ctrl+Y) = redo.
      // Suppressed mid-stroke / mid-drag so the user can't half-undo
      // a paint that's still being painted; they have to release first.
      if ((e.metaKey || e.ctrlKey) && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        if (isDrawing || objectDragRef.current || characterDragRef.current || resizeDragRef.current || rotateDragRef.current) return;
        if (e.shiftKey) s.redo();
        else s.undo();
        scheduleRender();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || e.key === 'Y')) {
        e.preventDefault();
        if (isDrawing || objectDragRef.current || characterDragRef.current || resizeDragRef.current || rotateDragRef.current) return;
        s.redo();
        scheduleRender();
        return;
      }
      if (e.code === 'Space' && !spaceHeld) {
        spaceHeld = true;
        canvas!.style.cursor = 'grab';
        e.preventDefault();
        return;
      }
      if (e.key === '1') s.setTool('select');
      else if (e.key === '2') s.setTool('paint');
      else if (e.key === '3') s.setTool('erase');
      else if (e.key === '4') s.setTool('fill');
      else if (e.key === '5') s.setTool('eyedropper');
      else if (e.key === '6') s.setTool('object');
      else if (e.key === '7') s.setTool('fence');
      else if (e.key === 'p' || e.key === 'P') s.setTool('pen');
      else if (e.key === 'Enter' && s.tool === 'pen' && s.pendingPenObjectId) {
        // Open polyline finish — closes the path with `closed: false`.
        // commitPenPath drops the pending state regardless of result.
        s.commitPenPath(false);
        scheduleRender();
      }
      else if (e.key === 'Escape') {
        // Bail out of any modal tool back to SELECT. Also drops any
        // object selection so the side panel goes away — the same key
        // doing both feels right because Escape == "stop what I'm doing".
        if (s.tool === 'pen' && s.pendingPenObjectId) s.cancelPenPath();
        s.setTool('select');
        if (s.selectedObjectId) s.selectObject(null);
        if (s.selectedFencePostKey) s.setSelectedFencePostKey(null);
        scheduleRender();
      }
      else if (e.key === '[') s.setBrushSize(s.brushSize - 1);
      else if (e.key === ']') s.setBrushSize(s.brushSize + 1);
      else if (e.key === 'g' || e.key === 'G') s.toggleGrid();
      else if ((e.key === 'Delete' || e.key === 'Backspace')) {
        // Pen-tool ergonomics: Delete the highlighted collision before the
        // selected object so the user can clear a single bad polygon
        // without losing the whole sprite.
        if (s.selectedCollisionId && s.selectedObjectId) {
          s.deleteCollision(s.selectedObjectId, s.selectedCollisionId);
          scheduleRender();
        } else if (s.selectedObjectId) {
          s.removeObject(s.selectedObjectId);
          scheduleRender();
        }
      }
    }

    function onKeyUp(e: KeyboardEvent) {
      if (e.code === 'Space') {
        spaceHeld = false;
        canvas!.style.cursor = cursorForTool(stateRef.current.tool, spaceHeld);
      }
    }

    function resize() {
      const rect = container!.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas!.width = Math.floor(rect.width * dpr);
      canvas!.height = Math.floor(rect.height * dpr);
      // We use device-pixel coords directly, no DPR transform on the context.
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      scheduleRender();
    }

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    canvas.addEventListener('pointerleave', onPointerLeave);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('contextmenu', onContextMenu);
    canvas.addEventListener('dragover', onDragOver);
    canvas.addEventListener('drop', onDrop);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('paste', onPaste);

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    const unsub = useTile.subscribe(() => scheduleRender());

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('contextmenu', onContextMenu);
      canvas.removeEventListener('dragover', onDragOver);
      canvas.removeEventListener('drop', onDrop);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('paste', onPaste);
      fileInputHandlerRef.current = null;
      ro.disconnect();
      unsub();
    };
  }, [ensureImage]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    c.style.cursor = cursorForTool(tool, false);
  }, [tool]);

  const totalCorners = activeLayer ? Object.keys(activeLayer.corners).length : 0;

  return (
    <div className="flex flex-col w-full h-full overflow-hidden" style={{ background: '#fafaf7' }}>
      {/* Hidden picker — mirrors FreeformView. Accepts image/* and bare
          .svg files (some browsers leave SVG with empty MIME). */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,image/svg+xml,.svg"
        multiple
        className="hidden"
        onChange={(e) => {
          fileInputHandlerRef.current?.(e.target.files);
          e.target.value = '';
        }}
      />

      {/* Top toolbar — formerly an absolute floating pill above the canvas.
          De-floated so the studio top-bar slot (where GameToolbar lives for
          3D modes) holds it in 2D Tile mode, removing the duplicate
          Select/Trash row that used to stack above this one. Horizontal
          scroll on narrow shells so the brush pill / wave / grid keep
          reachable without truncation. */}
      <div
        className="shrink-0 flex items-center gap-1 px-2 py-1.5 overflow-x-auto"
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          background: 'var(--pb-paper)',
          borderBottom: '1.5px solid var(--pb-line-2)',
        }}
      >
        <ToolBtn active={tool === 'select'} title="Select / move objects (1) · Esc" onClick={() => setTool('select')}>
          <MousePointer2 size={14} strokeWidth={2.2} />
        </ToolBtn>
        {/* Clicking the active modal tool toggles back to SELECT — same
            behaviour as Escape — so users can exit Place mode by clicking
            the same icon they used to enter it. */}
        <ToolBtn active={tool === 'paint'} title="Paint (2) · click again to exit" onClick={() => setTool(tool === 'paint' ? 'select' : 'paint')}>
          <Paintbrush size={14} strokeWidth={2.2} />
        </ToolBtn>
        <ToolBtn active={tool === 'erase'} title="Erase (3) · click again to exit" onClick={() => setTool(tool === 'erase' ? 'select' : 'erase')}>
          <Eraser size={14} strokeWidth={2.2} />
        </ToolBtn>
        <ToolBtn active={tool === 'fill'} title="Fill connected empty area (4) · click again to exit" onClick={() => setTool(tool === 'fill' ? 'select' : 'fill')}>
          <PaintBucket size={14} strokeWidth={2.2} />
        </ToolBtn>
        <ToolBtn active={tool === 'eyedropper'} title="Eyedropper — pick tileset under cursor (5) · click again to exit" onClick={() => setTool(tool === 'eyedropper' ? 'select' : 'eyedropper')}>
          <Pipette size={14} strokeWidth={2.2} />
        </ToolBtn>
        <ToolBtn active={tool === 'object'} title="Place object (6) · click again or Esc to exit" onClick={() => setTool(tool === 'object' ? 'select' : 'object')}>
          <Box size={14} strokeWidth={2.2} />
        </ToolBtn>
        <ToolBtn active={tool === 'fence'} title="Fence (7) — click to add a post; click an adjacent cell to connect with a segment · Esc to exit" onClick={() => setTool(tool === 'fence' ? 'select' : 'fence')}>
          <Fence size={14} strokeWidth={2.2} />
        </ToolBtn>
        <ToolBtn
          active={tool === 'pen'}
          title="Pen (P) — draw a polygon boundary on the selected object · click first anchor or Enter to close · Esc to cancel"
          onClick={() => setTool(tool === 'pen' ? 'select' : 'pen')}
        >
          <PenTool size={14} strokeWidth={2.2} />
        </ToolBtn>
        <Separator />
        <ToolBtn
          title="Add image… — upload a PNG/JPG/SVG and place it on the canvas (Cmd+V also pastes)"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon size={14} strokeWidth={2.2} />
        </ToolBtn>
        <Separator />
        <BrushPill value={brushSize} onChange={setBrushSize} />
        <Separator />
        <ToolBtn
          active={brushRandomFlipH}
          title="Random horizontal flip per painted cell"
          onClick={() => setBrushRandomFlipH(!brushRandomFlipH)}
        >
          <FlipHorizontal2 size={14} strokeWidth={2.2} />
        </ToolBtn>
        <ToolBtn
          active={brushRandomFlipV}
          title="Random vertical flip per painted cell"
          onClick={() => setBrushRandomFlipV(!brushRandomFlipV)}
        >
          <FlipVertical2 size={14} strokeWidth={2.2} />
        </ToolBtn>
        <ToolBtn
          active={brushRandomRotate}
          title="Random 90° rotation per painted cell"
          onClick={() => setBrushRandomRotate(!brushRandomRotate)}
        >
          <RotateCw size={14} strokeWidth={2.2} />
        </ToolBtn>
        <Separator />
        <ToolBtn active={showGrid} title="Toggle grid (G)" onClick={toggleGrid}>
          <Grid3X3 size={14} strokeWidth={2.2} />
        </ToolBtn>
        <ToolBtn title="Reset view" onClick={resetCamera}>
          <Maximize2 size={14} strokeWidth={2.2} />
        </ToolBtn>
        <Separator />
        <ToolBtn destructive title="Clear map" onClick={() => {
          if (!confirm('Clear all painted cells and objects?')) return;
          clearMap();
          // The render loop draws from stateRef + scheduleRender; layer /
          // object subscriptions do not auto-redraw the canvas, so without
          // this nudge a Clear visually no-ops until the user moves the
          // mouse over the canvas.
          requestRender.current();
        }}>
          <Trash2 size={14} strokeWidth={2.2} />
        </ToolBtn>
      </div>

      {/* Canvas viewport. The container ref must stay on the canvas's
          immediate parent because ResizeObserver + getBoundingClientRect
          drive the device-pixel canvas sizing. */}
      <div ref={containerRef} className="relative flex-1 min-h-0 overflow-hidden">
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            imageRendering: 'pixelated',
            // Skip the filter string entirely when every channel is the
            // identity 1× — leaves the GPU compositor on its fast path
            // for the default look (no perf cost when unused).
            filter:
              worldSaturation === 1 && worldContrast === 1 && worldBrightness === 1
                ? undefined
                : `saturate(${worldSaturation}) contrast(${worldContrast}) brightness(${worldBrightness})`,
            transition: 'filter 0.15s ease-out',
          }}
        />

      {Object.keys(tiles).length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ color: 'var(--pb-ink-muted)' }}>
          <div className="flex flex-col items-center gap-3 text-center" style={{ maxWidth: 380 }}>
            <div
              className="flex items-center justify-center"
              style={{
                width: 56, height: 56, borderRadius: 16,
                background: 'var(--pb-butter)',
                border: '1.5px solid var(--pb-butter-ink)',
                boxShadow: '0 2px 0 var(--pb-butter-ink)',
              }}
            >
              <Sparkles size={24} strokeWidth={2.2} style={{ color: 'var(--pb-butter-ink)' }} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--pb-ink)' }}>
              2D Tile-based — auto-tiling
            </p>
            <p style={{ fontSize: 12, fontWeight: 500 }}>
              Open <strong>Assets</strong> in the left panel and upload a 4×4 Wang sheet (one upper texture, one lower, plus 14 transitions). Then just click on the canvas — the right tile is picked automatically based on what you&apos;ve painted nearby.
            </p>
          </div>
        </div>
      )}

      {Object.keys(tiles).length > 0 && !activeLayer?.tilesetId && (
        <div className="absolute inset-x-0 bottom-12 flex items-center justify-center pointer-events-none">
          <div
            className="px-3 py-1.5"
            style={{
              background: 'var(--pb-coral)',
              border: '1.5px solid var(--pb-coral-ink)',
              borderRadius: 10,
              boxShadow: '0 2px 0 var(--pb-coral-ink)',
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--pb-coral-ink)',
            }}
          >
            Pick a tileset in the left panel to paint with on this layer.
          </div>
        </div>
      )}

      <div
        className="absolute bottom-3 left-3 z-10 pointer-events-none"
        style={{
          padding: '5px 12px', borderRadius: 10,
          background: 'var(--pb-paper)', border: '1.5px solid var(--pb-line-2)',
          fontSize: 11, color: 'var(--pb-ink-soft)', fontWeight: 500,
        }}
      >
        <span>Tool <span style={{ color: 'var(--pb-ink)', fontWeight: 700 }}>{tool}</span></span>
        <Sep />
        <span>Brush <span style={{ color: 'var(--pb-ink)', fontWeight: 700 }}>{brushSize}</span></span>
        <Sep />
        <span>Zoom <span style={{ color: 'var(--pb-ink)', fontWeight: 700 }}>{Math.round(camera.zoom * 100)}%</span></span>
        <Sep />
        <span>Layers <span style={{ color: 'var(--pb-ink)', fontWeight: 700 }}>{layers.length}</span></span>
        <Sep />
        <span>Corners <span style={{ color: 'var(--pb-ink)', fontWeight: 700 }}>{totalCorners}</span></span>
      </div>
      </div>
    </div>
  );
}

function cursorForTool(tool: TileTool, spaceHeld: boolean): string {
  if (spaceHeld) return 'grab';
  switch (tool) {
    case 'select': return 'default';
    case 'paint': return 'crosshair';
    case 'erase': return 'crosshair';
    case 'fill': return 'crosshair';
    case 'eyedropper': return 'crosshair';
    case 'object': return 'copy';
    case 'pen': return 'crosshair';
    case 'fence': return 'crosshair';
  }
}

function ToolBtn({
  active = false, destructive = false, disabled = false, title, onClick, children,
}: {
  active?: boolean; destructive?: boolean; disabled?: boolean; title: string;
  onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      onMouseDown={(e) => e.stopPropagation()}
      className="flex items-center justify-center transition-colors"
      style={{
        height: 30, width: 30, borderRadius: 8,
        background: active ? 'var(--pb-butter)' : 'var(--pb-paper)',
        color: disabled
          ? 'var(--pb-ink-muted)'
          : destructive
          ? 'var(--pb-coral-ink)'
          : active
          ? 'var(--pb-butter-ink)'
          : 'var(--pb-ink-soft)',
        border: `1.5px solid ${active ? 'var(--pb-butter-ink)' : 'var(--pb-line-2)'}`,
        opacity: disabled ? 0.45 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: active ? '0 1.5px 0 var(--pb-butter-ink)' : 'none',
      }}
    >
      {children}
    </button>
  );
}

function Separator() {
  return <div style={{ width: 1.5, height: 18, background: 'var(--pb-line-2)', margin: '0 2px' }} />;
}

function Sep() {
  return <span style={{ color: 'var(--pb-ink-muted)', margin: '0 6px' }}>·</span>;
}

function BrushPill({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div
      className="flex items-center"
      style={{
        height: 30,
        padding: '0 8px',
        borderRadius: 8,
        background: 'var(--pb-paper)',
        border: '1.5px solid var(--pb-line-2)',
        gap: 6,
      }}
    >
      <span style={{ fontSize: 10, color: 'var(--pb-ink-muted)', fontWeight: 700, letterSpacing: 0.5 }}>BRUSH</span>
      <input
        type="number"
        min={1}
        max={16}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 1)}
        style={{
          width: 30,
          background: 'transparent',
          border: 0,
          outline: 'none',
          fontSize: 12,
          fontWeight: 700,
          color: 'var(--pb-ink)',
          textAlign: 'center',
        }}
      />
    </div>
  );
}

