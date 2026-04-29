'use client';

import { useCallback, useEffect, useRef } from 'react';
import {
  MousePointer2, Paintbrush, Eraser, PaintBucket, Pipette, Trash2, Maximize2,
  Grid3X3, Sparkles, Box, FlipHorizontal2, FlipVertical2, RotateCw, Waves, Fence,
} from 'lucide-react';
import { useTile, type TileTool, findStyle, tileDataUrlFor } from '@/store/tile-store';
import { useStudio } from '@/store/studio-store';
import { useRoom, canEditCell } from '@/store/room-store';
import { resolveCellTile, pickAdjustedBrushTexture, canPlaceCorners } from '@/lib/wang-tiles';
import { recolorTile, hasActiveAdjustments, maskTileByBuckets } from '@/lib/tile-palette';
import {
  useTileRealtime,
  buildPaintEvent,
  buildEraseEvent,
} from '@/hooks/use-tile-realtime';
import { ALL_CORNERS, type Corner } from '@/lib/room-geometry';
import { RoomZoneOverlay } from './RoomZoneOverlay';
import { RoomViewSwitcher } from './RoomViewSwitcher';

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
export function TileView() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

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
   * Per-tile blue-mask dataUrl cache. Built once per tile that lives in
   * a tileset whose upper or lower texture is in `wavyTextureIds`. The
   * mask keeps pixels classified as blue or cyan (water palette) and
   * makes every other pixel transparent, so the wave-effect renderer
   * can clip its hue shift to water-coloured pixels only and leave
   * connected dirt / grass / sand alone in transition tiles.
   */
  const blueMaskCacheRef = useRef<Map<string, string>>(new Map());
  /**
   * Pooled offscreen canvas the wave effect draws into. Reused across
   * frames; resized when the wavy bounding box grows. Allocating fresh
   * canvases per frame would thrash the GPU on the Chromebook target.
   */
  const waveOffscreenRef = useRef<HTMLCanvasElement | null>(null);

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
  const wavyTextureIds = useTile((s) => s.wavyTextureIds);
  const setWavyTexture = useTile((s) => s.setWavyTexture);
  const tilesetTints = useTile((s) => s.tilesetTints);
  const tilesets = useTile((s) => s.tilesets);
  const layers = useTile((s) => s.layers);
  const tiles = useTile((s) => s.tiles);
  const selectedObjectId = useTile((s) => s.selectedObjectId);
  const activeLayerId = useTile((s) => s.activeLayerId);
  const resetCamera = useTile((s) => s.resetCamera);
  const clearMap = useTile((s) => s.clearMap);
  const camera = useTile((s) => s.camera);
  const setRightPanelGroup = useStudio((s) => s.setRightPanelGroup);

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

  // ── Blue-mask cache for the water effect ──────────────────────
  // Build once per tile when a tileset becomes "wavy" (water effect on
  // for either side). The mask keeps blue + cyan pixels and zeroes the
  // alpha on everything else; the renderer composites the wave's hue
  // shift through the mask so connected dirt/grass pixels in the same
  // transition tile stay untouched.
  useEffect(() => {
    let cancelled = false;
    if (wavyTextureIds.length === 0) return;
    const wavySet = new Set(wavyTextureIds);
    async function build() {
      const state = useTile.getState();
      const targets = state.tilesets.filter((ts) =>
        wavySet.has(ts.upperTextureId) || wavySet.has(ts.lowerTextureId),
      );
      for (const ts of targets) {
        for (const tileId of ts.tileIds) {
          if (blueMaskCacheRef.current.has(tileId)) continue;
          const tile = state.tiles[tileId];
          if (!tile) continue;
          try {
            const masked = await maskTileByBuckets(tile.dataUrl, ['blue', 'cyan']);
            if (cancelled) return;
            blueMaskCacheRef.current.set(tileId, masked);
            // Pre-warm the image cache so the first wave frame doesn't
            // miss while the masked PNG is still decoding.
            if (!imgCacheRef.current.has(masked)) {
              const img = new Image();
              img.onload = () => {
                imgReadyRef.current.add(masked);
                requestRender.current();
              };
              img.src = masked;
              imgCacheRef.current.set(masked, img);
            }
          } catch (err) {
            console.warn('[water-mask] failed', err);
          }
        }
      }
      if (!cancelled) requestRender.current();
    }
    void build();
    return () => { cancelled = true; };
  }, [wavyTextureIds, tiles]);

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
      for (const t of Object.values(s.tiles)) ensureImage(t.dataUrl);
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

      // ── Base + island pre-passes ────────────────────────────────
      // When `baseTextureId` is set, the map is conceptually filled
      // edge-to-edge with that texture's pure tile. When `islandFillTextureId`
      // and `mapBounds` are also set, an island of the fill texture covers
      // the bounded interior, with the wang resolver auto-rendering the
      // shoreline transition tiles on the boundary ring.
      //
      // Both the base AND island fills are drawn as a SINGLE tiled fillRect
      // via CanvasPattern — at low zoom a per-cell loop is O(viewport_cells),
      // which is ~200k drawImage calls at 10% zoom on a 1080p canvas and
      // grinds the framerate to a halt. The pattern tiles natively, costing
      // one fillRect regardless of cell count. The boundary ring is the
      // only piece that still needs per-cell drawImage (max ~520 cells for
      // a 128×128 island), and the layered pass substitutes absent corners
      // with islandFill (inside bounds) or base (outside) so painted regions
      // transition smoothly via the matching wang bridge tileset.
      const recolorMap = tileRecolorRef.current;
      const baseTexId = s.baseTextureId;
      const islandFillId = s.islandFillTextureId;
      const bounds = s.mapBounds;
      // Per-corner substitution helper used by all the passes that need to
      // resolve a virtual cell. A corner inside the bounds rectangle (when
      // an island is active) resolves to the island fill, otherwise to the
      // base. Returns undefined when neither is set so the resolver bails
      // out cleanly (renders nothing).
      const islandActive = !!(islandFillId && bounds);
      const insideBounds = (x: number, y: number): boolean => {
        if (!islandActive) return false;
        return x >= bounds!.x && x <= bounds!.x + bounds!.w
          && y >= bounds!.y && y <= bounds!.y + bounds!.h;
      };
      const fallback = (x: number, y: number): string | undefined => {
        if (insideBounds(x, y)) return islandFillId!;
        return baseTexId ?? undefined;
      };
      // Helper: tiled pattern fillRect over a cell-aligned rectangle. Reused
      // for base + island fills so they share the cache-friendly fast path.
      const drawTiledPattern = (texId: string, rcx0: number, rcy0: number, rcx1: number, rcy1: number) => {
        const resolved = resolveCellTile(texId, texId, texId, texId, s.tilesets);
        if (!resolved) return false;
        const tileId = resolved.tileset.tileIds[resolved.index];
        const tile = tileId ? s.tiles[tileId] : undefined;
        if (!tile) return false;
        const dataUrlBase = tileDataUrlFor(resolved.tileset, resolved.index, tile.dataUrl);
        const recolored = recolorMap.get(tileId);
        const url = recolored ?? dataUrlBase;
        const img = imgCacheRef.current.get(url);
        if (!img || !imgReadyRef.current.has(url)) return false;
        const pattern = ctx!.createPattern(img, 'repeat');
        if (pattern) {
          const m = new DOMMatrix();
          m.scaleSelf(ts / img.width, ts / img.height);
          pattern.setTransform(m);
          ctx!.fillStyle = pattern;
          ctx!.fillRect(rcx0 * ts, rcy0 * ts, (rcx1 - rcx0) * ts, (rcy1 - rcy0) * ts);
          return true;
        }
        // Per-cell drawImage fallback for browsers without setTransform.
        for (let cy = rcy0; cy < rcy1; cy++) {
          for (let cx = rcx0; cx < rcx1; cx++) {
            ctx!.drawImage(img, cx * ts - bleed, cy * ts - bleed, ts + bleed * 2, ts + bleed * 2);
          }
        }
        return true;
      };

      if (baseTexId) {
        drawTiledPattern(baseTexId, cx0, cy0, cx1 + 1, cy1 + 1);
      }

      if (islandActive) {
        // Cell-aligned interior of the bounds, intersected with viewport.
        // These are the cells where ALL FOUR corners sit inside the bounds
        // rect — i.e. cells (bounds.x, bounds.y) through (bounds.x + bounds.w
        // - 1, bounds.y + bounds.h - 1). The boundary ring (one-cell-thick
        // around this rect) renders below via per-cell drawImage so the
        // wang shoreline transitions appear without per-cell drawImage cost
        // for the entire interior.
        const ix0 = Math.max(cx0, bounds!.x);
        const iy0 = Math.max(cy0, bounds!.y);
        const ix1 = Math.min(cx1 + 1, bounds!.x + bounds!.w);
        const iy1 = Math.min(cy1 + 1, bounds!.y + bounds!.h);
        if (ix0 < ix1 && iy0 < iy1) {
          drawTiledPattern(islandFillId!, ix0, iy0, ix1, iy1);
        }
      }

      // Boundary ring pre-pass: cells that straddle the bounds rect (some
      // corners inside, some outside). The resolver picks the appropriate
      // wang transition tile based on the substituted corner pattern. Only
      // runs when both base and island are set and the rect intersects the
      // viewport. Painted overrides on these cells are handled by the
      // per-layer pass below — this pass renders the DEFAULT shoreline.
      if (islandActive && baseTexId) {
        const bx0 = Math.max(cx0, bounds!.x - 1);
        const by0 = Math.max(cy0, bounds!.y - 1);
        const bx1 = Math.min(cx1, bounds!.x + bounds!.w);
        const by1 = Math.min(cy1, bounds!.y + bounds!.h);
        for (let cy = by0; cy <= by1; cy++) {
          for (let cx = bx0; cx <= bx1; cx++) {
            // Skip pure-interior + pure-exterior cells (already pre-filled).
            const nwIn = insideBounds(cx, cy);
            const neIn = insideBounds(cx + 1, cy);
            const swIn = insideBounds(cx, cy + 1);
            const seIn = insideBounds(cx + 1, cy + 1);
            if (nwIn && neIn && swIn && seIn) continue;
            if (!nwIn && !neIn && !swIn && !seIn) continue;
            const nw = nwIn ? islandFillId! : baseTexId;
            const ne = neIn ? islandFillId! : baseTexId;
            const sw = swIn ? islandFillId! : baseTexId;
            const se = seIn ? islandFillId! : baseTexId;
            const resolved = resolveCellTile(nw, ne, sw, se, s.tilesets);
            if (!resolved) continue;
            const tileId = resolved.tileset.tileIds[resolved.index];
            const tile = tileId ? s.tiles[tileId] : undefined;
            if (!tile) continue;
            const dataUrlBase = tileDataUrlFor(resolved.tileset, resolved.index, tile.dataUrl);
            const recolored = recolorMap.get(tileId);
            const url = recolored ?? dataUrlBase;
            const img = imgCacheRef.current.get(url);
            if (!img || !imgReadyRef.current.has(url)) continue;
            ctx!.drawImage(img, cx * ts - bleed, cy * ts - bleed, ts + bleed * 2, ts + bleed * 2);
          }
        }
      }

      // Render each layer's corners; per-cell, the resolver picks whichever
      // tileset bridges the textures present at the 4 corners. Two chained
      // tilesets sharing a texture transition smoothly because the bridge
      // tileset for the boundary cells contains both textures. When a base
      // texture is active, absent corners are treated as baseTexId so paint
      // borders blend into the base via wang bridges instead of a hard edge.
      for (const layer of s.layers) {
        if (!layer.visible) continue;
        ctx!.globalAlpha = layer.opacity;
        const corners = layer.corners;
        const transforms = layer.cellTransforms;
        // Skip the entire viewport scan when this layer has nothing painted
        // — at low zoom (10%) the viewport is ~600×340 = 200k cells and even
        // an early `continue` per cell costs ~8 ms/frame in plain object
        // lookups. With nothing to draw we can bail in O(1).
        const cornerKeys = Object.keys(corners);
        if (cornerKeys.length === 0) continue;
        // Derive the painted bbox so we only iterate the cells that could
        // possibly draw (intersected with the viewport). For dense maps the
        // bbox covers the whole viewport anyway and this is a tiny tax;
        // for sparse maps it shaves the iteration to just the painted
        // region. We pad +1 cell because a corner at (cx, cy) influences
        // the cells at (cx-1, cy-1) through (cx, cy).
        let bMinX = Infinity, bMinY = Infinity, bMaxX = -Infinity, bMaxY = -Infinity;
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
            // Fully-empty cells: the base + island pre-passes already drew
            // them (or the canvas background shows through if neither is
            // set).
            if (!nwRaw && !neRaw && !swRaw && !seRaw) continue;
            const nw = nwRaw ?? fallback(cx, cy);
            const ne = neRaw ?? fallback(cx + 1, cy);
            const sw = swRaw ?? fallback(cx, cy + 1);
            const se = seRaw ?? fallback(cx + 1, cy + 1);
            const resolved = resolveCellTile(nw, ne, sw, se, s.tilesets);
            if (!resolved) continue;
            const tileId = resolved.tileset.tileIds[resolved.index];
            if (!tileId) continue;
            const tile = s.tiles[tileId];
            if (!tile) continue;
            // Per-bucket palette recolour produces a cached dataUrl per
            // tile when any tileset tint is active; prefer it over the
            // raw tile / variant data URL.
            const baseDataUrl = tileDataUrlFor(resolved.tileset, resolved.index, tile.dataUrl);
            const recoloredDataUrl = recolorMap.get(tileId);
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

      // ── Water-effect: blue-pixels-only hue wave ─────────────────
      // The wave shouldn't touch dirt / sand / grass pixels in the
      // transition tiles where water meets land. To enforce that we
      // route the whole effect through a pooled offscreen canvas:
      //   1. For each wavy cell, blit the tile's PRE-COMPUTED blue mask
      //      into the offscreen at the cell's world coords. The mask
      //      is just the tile with non-blue/cyan pixels' alpha zeroed
      //      out (see `maskTileByBuckets` + `blueMaskCacheRef`).
      //   2. With the offscreen now containing only the blue tile
      //      pixels, run the sine-modulated hue strips on it using
      //      globalCompositeOperation='hue'. The hue channel is
      //      replaced ONLY where the offscreen has opaque pixels — i.e.
      //      only the water pixels.
      //   3. Composite the offscreen back onto the main canvas with
      //      'source-over'. Transparent (non-water) pixels in the
      //      offscreen leave the main canvas untouched, so connected
      //      dirt / grass stays exactly as it was.
      if (s.wavyTextureIds.length > 0) {
        const wavySet = new Set(s.wavyTextureIds);
        function isWavyCell(cx: number, cy: number): boolean {
          for (const layer of s.layers) {
            if (!layer.visible) continue;
            const c = layer.corners;
            if (
              wavySet.has(c[`${cx},${cy}`])
              || wavySet.has(c[`${cx + 1},${cy}`])
              || wavySet.has(c[`${cx},${cy + 1}`])
              || wavySet.has(c[`${cx + 1},${cy + 1}`])
            ) return true;
          }
          return false;
        }
        let any = false;
        let minPX = Infinity, minPY = Infinity, maxPX = -Infinity, maxPY = -Infinity;
        for (let cy = cy0; cy <= cy1; cy++) {
          for (let cx = cx0; cx <= cx1; cx++) {
            if (!isWavyCell(cx, cy)) continue;
            const x = cx * ts;
            const y = cy * ts;
            any = true;
            if (x < minPX) minPX = x;
            if (y < minPY) minPY = y;
            if (x + ts > maxPX) maxPX = x + ts;
            if (y + ts > maxPY) maxPY = y + ts;
          }
        }
        if (any) {
          const offW = Math.max(1, Math.round((maxPX - minPX) * cam.zoom));
          const offH = Math.max(1, Math.round((maxPY - minPY) * cam.zoom));
          let off = waveOffscreenRef.current;
          if (!off || off.width !== offW || off.height !== offH) {
            off = document.createElement('canvas');
            off.width = offW;
            off.height = offH;
            waveOffscreenRef.current = off;
          }
          const offCtx = off.getContext('2d');
          if (offCtx) {
            offCtx.clearRect(0, 0, offW, offH);
            offCtx.imageSmoothingEnabled = false;
            // Match main world transform but offset so (minPX, minPY)
            // maps to (0, 0). Tile draws below use the same world
            // coordinates as the main pass would.
            offCtx.setTransform(cam.zoom, 0, 0, cam.zoom, -minPX * cam.zoom, -minPY * cam.zoom);
            // Step 1: stamp every wavy cell's BLUE-MASK tile onto the
            // offscreen. We re-resolve each cell to find the right tile
            // — same logic as the main render loop above.
            for (const layer of s.layers) {
              if (!layer.visible) continue;
              const corners = layer.corners;
              for (let cy = cy0; cy <= cy1; cy++) {
                for (let cx = cx0; cx <= cx1; cx++) {
                  if (!isWavyCell(cx, cy)) continue;
                  const nw = corners[`${cx},${cy}`];
                  const ne = corners[`${cx + 1},${cy}`];
                  const sw = corners[`${cx},${cy + 1}`];
                  const se = corners[`${cx + 1},${cy + 1}`];
                  if (!nw && !ne && !sw && !se) continue;
                  const resolved = resolveCellTile(nw, ne, sw, se, s.tilesets);
                  if (!resolved) continue;
                  const tileId = resolved.tileset.tileIds[resolved.index];
                  if (!tileId) continue;
                  const maskedUrl = blueMaskCacheRef.current.get(tileId);
                  if (!maskedUrl) continue;
                  const mImg = imgCacheRef.current.get(maskedUrl);
                  if (!mImg || !imgReadyRef.current.has(maskedUrl)) continue;
                  offCtx.drawImage(mImg, cx * ts, cy * ts, ts, ts);
                }
              }
            }
            // Step 2: re-hue offscreen blue pixels via sine strips.
            const time = performance.now() / 1000;
            offCtx.globalCompositeOperation = 'hue';
            const wavelength = Math.max(ts * 1.5, 16);
            const speed = 1.4;
            const HUE_CENTER = 215;
            const HUE_RANGE = 12;
            const stripPx = Math.max(1 / cam.zoom, 2 / cam.zoom);
            for (let x = minPX; x < maxPX; x += stripPx) {
              const phase = (x / wavelength) * Math.PI * 2 + time * speed;
              const hue = HUE_CENTER + Math.sin(phase) * HUE_RANGE;
              const sat = 80 + Math.sin(phase * 0.5) * 10;
              offCtx.fillStyle = `hsl(${hue}, ${sat}%, 50%)`;
              offCtx.fillRect(x, minPY, stripPx + 0.5 / cam.zoom, maxPY - minPY);
            }
            for (let y = minPY; y < maxPY; y += stripPx) {
              const phase = (y / wavelength) * Math.PI * 2 - time * speed * 0.7;
              const hue = HUE_CENTER + Math.sin(phase) * (HUE_RANGE * 0.7);
              const sat = 75 + Math.sin(phase * 0.5) * 10;
              offCtx.fillStyle = `hsl(${hue}, ${sat}%, 50%)`;
              offCtx.fillRect(minPX, y, maxPX - minPX, stripPx + 0.5 / cam.zoom);
            }
            offCtx.globalCompositeOperation = 'source-over';
            // Step 3: composite offscreen back onto main. Transparent
            // (non-water) pixels in the offscreen leave the main canvas
            // exactly as it was — connected dirt / grass survives.
            offCtx.setTransform(1, 0, 0, 1, 0, 0);
            ctx!.drawImage(off, 0, 0, offW, offH, minPX, minPY, maxPX - minPX, maxPY - minPY);
          }
        }
      }

      // Free objects, sorted bottom-to-top by y.
      const visibleObjects = s.objects.filter((o) => {
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
        if (obj.hue) ctx!.filter = `hue-rotate(${obj.hue}deg)`;
        ctx!.drawImage(img, -obj.width / 2, -obj.height / 2, obj.width, obj.height);
        ctx!.restore();

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

      // Keep the loop going while the water effect is on so the waves
      // animate continuously. No-op when the user has no wavy textures
      // (the renderer falls back to event-driven rAF).
      if (s.wavyTextureIds.length > 0) scheduleRender();
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

    /**
     * Drop any cell the local player isn't allowed to edit (other lots,
     * other rooms). Brush, fill, and erase all funnel through this so the
     * player can paint a brush near a permission boundary and only the
     * cells they own actually mutate — the rest silently no-op rather
     * than blocking the whole stroke.
     */
    function filterEditable(cells: Array<[number, number]>): Array<[number, number]> {
      const rs = useRoom.getState();
      return cells.filter(([cx, cy]) => canEditCell(rs, cx, cy));
    }

    function applyPaint(cell: { cx: number; cy: number }) {
      const s = stateRef.current;
      const layer = s.layers.find((l) => l.id === s.activeLayerId);
      if (!layer) return;
      const baseTexId = s.brushTextureId;
      if (!baseTexId) return;
      const cells = filterEditable(brushCells(cell.cx, cell.cy, s.brushSize));
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
      const cells = filterEditable(brushCells(cell.cx, cell.cy, s.brushSize));
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
      // Refuse to start the fill from a cell the player can't edit — the
      // brush gating in onPointerDown already drops these strokes, but
      // belt-and-braces.
      const rs = useRoom.getState();
      if (!canEditCell(rs, start.cx, start.cy)) return;
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
        // Stop the flood at permission boundaries — a fill in the
        // player's lot must not bleed into a neighbouring lot or another
        // room's cross. We re-read the snapshot once outside the loop to
        // keep the per-step cost a single rectangle test.
        if (!canEditCell(rs, cx, cy)) continue;
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
        const placedW = cellsW * ts;
        const placedH = cellsH * ts;
        const id = s.addObject({
          layerId: s.activeLayerId,
          x: cellTLX * ts + placedW / 2,
          y: cellTLY * ts + placedH / 2,
          assetId: s.selectedAssetId,
          styleId: s.selectedStyleId,
          width: placedW,
          height: placedH,
          rotation: 0,
          flipX: false, flipY: false,
          hue: 0,
          name: found.asset.name || `Object ${s.objects.length + 1}`,
        });
        s.selectObject(id);
        scheduleRender();
        return;
      }

      if (s.tool === 'select') {
        const hit = pickObjectAt(w.x, w.y);
        s.selectObject(hit?.id ?? null);
        if (hit) {
          objectDragRef.current = {
            id: hit.id,
            startWX: w.x, startWY: w.y,
            origX: hit.x, origY: hit.y,
          };
          s.beginUndoGroup();
          canvas!.setPointerCapture(e.pointerId);
        }
        scheduleRender();
        return;
      }

      if (s.tool === 'fence') {
        s.placeFenceAt(cell.cx, cell.cy);
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
      resizeDragRef.current = null;
      rotateDragRef.current = null;
      canvas!.style.cursor = cursorForTool(stateRef.current.tool, spaceHeld);
    }

    function onPointerLeave() {
      hoverRef.current = null;
      scheduleRender();
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
        if (isDrawing || objectDragRef.current || resizeDragRef.current || rotateDragRef.current) return;
        if (e.shiftKey) s.redo();
        else s.undo();
        scheduleRender();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || e.key === 'Y')) {
        e.preventDefault();
        if (isDrawing || objectDragRef.current || resizeDragRef.current || rotateDragRef.current) return;
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
      else if (e.key === 'Escape') {
        // Bail out of any modal tool back to SELECT. Also drops any
        // object selection so the side panel goes away — the same key
        // doing both feels right because Escape == "stop what I'm doing".
        s.setTool('select');
        if (s.selectedObjectId) s.selectObject(null);
        if (s.selectedFencePostKey) s.setSelectedFencePostKey(null);
        scheduleRender();
      }
      else if (e.key === '[') s.setBrushSize(s.brushSize - 1);
      else if (e.key === ']') s.setBrushSize(s.brushSize + 1);
      else if (e.key === 'g' || e.key === 'G') s.toggleGrid();
      else if ((e.key === 'Delete' || e.key === 'Backspace') && s.selectedObjectId) {
        s.removeObject(s.selectedObjectId);
        scheduleRender();
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
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

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
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
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
    <div ref={containerRef} className="relative w-full h-full overflow-hidden" style={{ background: '#fafaf7' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block', imageRendering: 'pixelated' }}
      />

      {/* Room zones (cross + 4 lots) drawn on top of the canvas. Renders
          nothing in viewMode 'main-world'. Pointer-events: none so the
          paint/erase tools below still receive every click. */}
      <RoomZoneOverlay />

      {/* Top-right pill bar to jump between Room / My Lot / Cross /
          World. Mounts alongside the existing tool toolbar (top-left). */}
      <RoomViewSwitcher />

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
        <ToolBtn
          active={!!useTile.getState().brushTextureId
            && wavyTextureIds.includes(useTile.getState().brushTextureId!)}
          title="Toggle water effect on the brush's current texture (animated waves + hue tint across the whole region)"
          onClick={() => {
            const id = useTile.getState().brushTextureId;
            if (!id) return;
            setWavyTexture(id, !wavyTextureIds.includes(id));
          }}
        >
          <Waves size={14} strokeWidth={2.2} />
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
          if (confirm('Clear all painted cells and objects?')) clearMap();
        }}>
          <Trash2 size={14} strokeWidth={2.2} />
        </ToolBtn>
      </div>

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

