'use client';

import { useCallback, useEffect, useRef } from 'react';
import {
  MousePointer2, Paintbrush, Eraser, PaintBucket, Pipette, Trash2, Maximize2,
  Grid3X3, Sparkles, Box, FlipHorizontal, FlipVertical,
} from 'lucide-react';
import { useTile, type TileTool } from '@/store/tile-store';
import { resolveCellTile } from '@/lib/wang-tiles';

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
  const layers = useTile((s) => s.layers);
  const tilesets = useTile((s) => s.tilesets);
  const tiles = useTile((s) => s.tiles);
  const objects = useTile((s) => s.objects);
  const selectedObjectId = useTile((s) => s.selectedObjectId);
  const activeLayerId = useTile((s) => s.activeLayerId);
  const resetCamera = useTile((s) => s.resetCamera);
  const clearMap = useTile((s) => s.clearMap);
  const camera = useTile((s) => s.camera);
  const updateObject = useTile((s) => s.updateObject);
  const removeObject = useTile((s) => s.removeObject);

  const activeLayer = layers.find((l) => l.id === activeLayerId);
  const brushTextureId = useTile((s) => s.brushTextureId);
  // Resolve the brush back to its tileset + which side it lives on so the
  // header and ghost can colour-code by upper/lower visually.
  const brushTileset = brushTextureId
    ? tilesets.find((t) => t.upperTextureId === brushTextureId || t.lowerTextureId === brushTextureId)
    : null;
  const brushSide: 'u' | 'l' | null = brushTileset && brushTextureId
    ? (brushTileset.upperTextureId === brushTextureId ? 'u' : 'l')
    : null;

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
      // when already loaded.
      for (const t of Object.values(s.tiles)) ensureImage(t.dataUrl);

      // Half a device pixel expressed in world units. Each tile draws
      // slightly larger so neighbors overlap by ~1 device pixel, hiding
      // the sub-pixel seams the rasterizer creates at fractional zoom/pan.
      const bleed = 0.5 / cam.zoom;

      // Render each layer's corners; per-cell, the resolver picks whichever
      // tileset bridges the textures present at the 4 corners. Two chained
      // tilesets sharing a texture transition smoothly because the bridge
      // tileset for the boundary cells contains both textures.
      for (const layer of s.layers) {
        if (!layer.visible) continue;
        ctx!.globalAlpha = layer.opacity;
        const corners = layer.corners;
        for (let cy = cy0; cy <= cy1; cy++) {
          for (let cx = cx0; cx <= cx1; cx++) {
            const nw = corners[`${cx},${cy}`];
            const ne = corners[`${cx + 1},${cy}`];
            const sw = corners[`${cx},${cy + 1}`];
            const se = corners[`${cx + 1},${cy + 1}`];
            if (!nw && !ne && !sw && !se) continue;
            const resolved = resolveCellTile(nw, ne, sw, se, s.tilesets);
            if (!resolved) continue;
            const tileId = resolved.tileset.tileIds[resolved.index];
            if (!tileId) continue;
            const tile = s.tiles[tileId];
            if (!tile) continue;
            const img = imgCacheRef.current.get(tile.dataUrl);
            if (!img || !imgReadyRef.current.has(tile.dataUrl)) continue;
            ctx!.drawImage(img, cx * ts - bleed, cy * ts - bleed, ts + bleed * 2, ts + bleed * 2);
          }
        }
      }
      ctx!.globalAlpha = 1;

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
        const asset = s.objectAssets[obj.assetId];
        if (!asset) continue;
        const img = ensureImage(asset.dataUrl);
        if (!imgReadyRef.current.has(asset.dataUrl)) continue;
        const layer = s.layers.find((l) => l.id === obj.layerId);
        ctx!.globalAlpha = layer?.opacity ?? 1;
        ctx!.save();
        ctx!.translate(obj.x, obj.y);
        if (obj.rotation) ctx!.rotate(obj.rotation * Math.PI / 180);
        const sx = obj.flipX ? -1 : 1;
        const sy = obj.flipY ? -1 : 1;
        if (sx !== 1 || sy !== 1) ctx!.scale(sx, sy);
        ctx!.drawImage(img, -obj.width / 2, -obj.height / 2, obj.width, obj.height);
        ctx!.restore();

        if (obj.id === s.selectedObjectId) {
          ctx!.strokeStyle = '#0ea5e9';
          ctx!.lineWidth = 1.5 / cam.zoom;
          ctx!.setLineDash([4 / cam.zoom, 3 / cam.zoom]);
          ctx!.strokeRect(obj.x - obj.width / 2, obj.y - obj.height / 2, obj.width, obj.height);
          ctx!.setLineDash([]);
        }
      }
      ctx!.globalAlpha = 1;

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
      // of the sprite so the user sees exactly what + where they'll drop.
      if (hover && s.tool === 'object' && s.selectedAssetId) {
        const asset = s.objectAssets[s.selectedAssetId];
        if (asset) {
          const { cellsW, cellsH, cellTLX, cellTLY } = objectFootprint(asset.width, asset.height, ts, hover.cx, hover.cy);
          // Cells the object will overlap.
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
          // Faint sprite preview at the snapped target position.
          const img = imgCacheRef.current.get(asset.dataUrl);
          if (img && imgReadyRef.current.has(asset.dataUrl)) {
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

    function applyPaint(cell: { cx: number; cy: number }) {
      const s = stateRef.current;
      const layer = s.layers.find((l) => l.id === s.activeLayerId);
      if (!layer) return;
      const texId = s.brushTextureId;
      if (!texId) return;
      const cells = brushCells(cell.cx, cell.cy, s.brushSize);
      s.mutateCorners(layer.id, (c) => {
        for (const [cx, cy] of cells) paintCell(c, cx, cy, texId);
      });
    }

    function applyErase(cell: { cx: number; cy: number }) {
      const s = stateRef.current;
      const layer = s.layers.find((l) => l.id === s.activeLayerId);
      if (!layer) return;
      const cells = brushCells(cell.cx, cell.cy, s.brushSize);
      s.mutateCorners(layer.id, (c) => {
        for (const [cx, cy] of cells) eraseCell(c, cx, cy);
      });
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
      s.mutateCorners(layer.id, (c) => {
        for (const [cx, cy] of writes) paintCell(c, cx, cy, texId);
      });
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
        if (
          wx >= o.x - o.width / 2 && wx <= o.x + o.width / 2 &&
          wy >= o.y - o.height / 2 && wy <= o.y + o.height / 2
        ) return o;
      }
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
        applyErase(cell);
        canvas!.setPointerCapture(e.pointerId);
        scheduleRender();
        return;
      }
      if (e.button !== 0) return;

      if (s.tool === 'object') {
        if (!s.selectedAssetId) return;
        const asset = s.objectAssets[s.selectedAssetId];
        if (!asset) return;
        // Snap to the grid using the same footprint helper the hover ghost
        // uses, so the placed object lands exactly where the preview showed.
        const ts = s.tileSize;
        const { cellsW, cellsH, cellTLX, cellTLY } = objectFootprint(asset.width, asset.height, ts, cell.cx, cell.cy);
        const placedW = cellsW * ts;
        const placedH = cellsH * ts;
        const id = s.addObject({
          layerId: s.activeLayerId,
          x: cellTLX * ts + placedW / 2,
          y: cellTLY * ts + placedH / 2,
          assetId: s.selectedAssetId,
          width: placedW,
          height: placedH,
          rotation: 0,
          flipX: false, flipY: false,
          name: asset.name || `Object ${s.objects.length + 1}`,
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
          canvas!.setPointerCapture(e.pointerId);
        }
        scheduleRender();
        return;
      }

      if (s.tool === 'paint') { isDrawing = 'paint'; applyPaint(cell); }
      else if (s.tool === 'erase') { isDrawing = 'erase'; applyErase(cell); }
      else if (s.tool === 'fill') { applyFill(cell); }
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
      isDrawing = null;
      isPanning = false;
      objectDragRef.current = null;
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

  const selectedObject = selectedObjectId ? objects.find((o) => o.id === selectedObjectId) : null;
  const totalCorners = activeLayer ? Object.keys(activeLayer.corners).length : 0;

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden" style={{ background: '#fafaf7' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block', imageRendering: 'pixelated' }}
      />

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
        <ToolBtn active={tool === 'select'} title="Select / move objects (1)" onClick={() => setTool('select')}>
          <MousePointer2 size={14} strokeWidth={2.2} />
        </ToolBtn>
        <ToolBtn active={tool === 'paint'} title="Paint (2)" onClick={() => setTool('paint')}>
          <Paintbrush size={14} strokeWidth={2.2} />
        </ToolBtn>
        <ToolBtn active={tool === 'erase'} title="Erase (3)" onClick={() => setTool('erase')}>
          <Eraser size={14} strokeWidth={2.2} />
        </ToolBtn>
        <ToolBtn active={tool === 'fill'} title="Fill connected empty area (4)" onClick={() => setTool('fill')}>
          <PaintBucket size={14} strokeWidth={2.2} />
        </ToolBtn>
        <ToolBtn active={tool === 'eyedropper'} title="Eyedropper — pick tileset under cursor (5)" onClick={() => setTool('eyedropper')}>
          <Pipette size={14} strokeWidth={2.2} />
        </ToolBtn>
        <ToolBtn active={tool === 'object'} title="Place object (6)" onClick={() => setTool('object')}>
          <Box size={14} strokeWidth={2.2} />
        </ToolBtn>
        <Separator />
        <BrushPill value={brushSize} onChange={setBrushSize} />
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

      {/* Active terrain badge — shows the brush's tileset + side. */}
      {brushTileset && brushSide && (
        <div
          className="absolute top-3 z-10 flex items-center gap-2 px-3 py-1.5"
          style={{
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--pb-paper)',
            border: '1.5px solid var(--pb-ink)',
            borderRadius: 12,
            boxShadow: '0 3px 0 var(--pb-ink)',
          }}
        >
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--pb-ink-muted)', letterSpacing: 0.5 }}>
            PAINTING
          </span>
          <span
            style={{
              fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 999,
              background: brushSide === 'u' ? 'rgba(110,180,90,0.18)' : 'rgba(180,140,90,0.18)',
              border: `1.5px solid ${brushSide === 'u' ? 'rgba(60,140,40,0.55)' : 'rgba(150,110,60,0.55)'}`,
              color: brushSide === 'u' ? 'rgb(40,100,30)' : 'rgb(120,80,40)',
              letterSpacing: 0.4,
            }}
          >
            {brushSide === 'u' ? 'UPPER' : 'LOWER'}
          </span>
          <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--pb-ink)' }}>
            {brushTileset.name}
          </span>
          <span style={{ fontSize: 10, color: 'var(--pb-ink-muted)' }}>on {activeLayer?.name}</span>
        </div>
      )}

      {selectedObject && (
        <div
          className="absolute top-3 right-3 z-10 p-3"
          style={{
            background: 'var(--pb-paper)',
            border: '1.5px solid var(--pb-ink)',
            borderRadius: 12,
            boxShadow: '0 3px 0 var(--pb-ink)',
            minWidth: 200,
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--pb-ink)' }}>
              {selectedObject.name}
            </span>
            <button
              onClick={() => removeObject(selectedObject.id)}
              style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--pb-coral-ink)' }}
              title="Delete object"
            >
              <Trash2 size={14} strokeWidth={2.2} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1.5 mb-2">
            <NumField label="X" value={Math.round(selectedObject.x)} onChange={(v) => updateObject(selectedObject.id, { x: v })} />
            <NumField label="Y" value={Math.round(selectedObject.y)} onChange={(v) => updateObject(selectedObject.id, { y: v })} />
            <NumField label="W" value={Math.round(selectedObject.width)} min={1} onChange={(v) => updateObject(selectedObject.id, { width: v })} />
            <NumField label="H" value={Math.round(selectedObject.height)} min={1} onChange={(v) => updateObject(selectedObject.id, { height: v })} />
            <NumField label="°" value={Math.round(selectedObject.rotation)} onChange={(v) => updateObject(selectedObject.id, { rotation: v })} />
          </div>
          <div className="flex gap-1.5">
            <ToolBtn active={selectedObject.flipX} title="Flip X" onClick={() => updateObject(selectedObject.id, { flipX: !selectedObject.flipX })}>
              <FlipHorizontal size={14} strokeWidth={2.2} />
            </ToolBtn>
            <ToolBtn active={selectedObject.flipY} title="Flip Y" onClick={() => updateObject(selectedObject.id, { flipY: !selectedObject.flipY })}>
              <FlipVertical size={14} strokeWidth={2.2} />
            </ToolBtn>
          </div>
        </div>
      )}

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

function NumField({
  label, value, onChange, min,
}: { label: string; value: number; onChange: (v: number) => void; min?: number }) {
  return (
    <label className="flex items-center gap-1" style={{ fontSize: 10, color: 'var(--pb-ink-muted)', fontWeight: 700 }}>
      {label}
      <input
        type="number"
        value={value}
        min={min}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          if (!Number.isNaN(v)) onChange(v);
        }}
        style={{
          flex: 1,
          minWidth: 0,
          padding: '4px 6px',
          background: 'var(--pb-cream-2)',
          border: '1.5px solid var(--pb-line-2)',
          borderRadius: 6,
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--pb-ink)',
        }}
      />
    </label>
  );
}
