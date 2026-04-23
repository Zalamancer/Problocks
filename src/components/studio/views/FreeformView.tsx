'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MousePointer2, PenTool, Image as ImageIcon, Trash2, Maximize2 } from 'lucide-react';
import { useFreeform, type FreeformAnchor, type FreeformImage } from '@/store/freeform-store';
import {
  screenToWorld, worldToLocal, localToWorld,
  collisionToPath, pickImage,
} from '@/lib/freeform-geom';

/**
 * 2D Freeform editor.
 *
 * Layout: floating chunky-pastel toolbar (top-left) + full-bleed SVG canvas.
 * Interactions live in this single component because they're tightly
 * coupled — the pen tool needs the camera transform to convert clicks to
 * image-local coords; the selection handles need the same transform to
 * stay screen-pixel sized regardless of zoom.
 */
export function FreeformView() {
  const images = useFreeform((s) => s.images);
  const selectedImageId = useFreeform((s) => s.selectedImageId);
  const selectedCollisionId = useFreeform((s) => s.selectedCollisionId);
  const tool = useFreeform((s) => s.tool);
  const pan = useFreeform((s) => s.pan);
  const zoom = useFreeform((s) => s.zoom);
  const pendingPenAnchors = useFreeform((s) => s.pendingPenAnchors);
  const pendingPenImageId = useFreeform((s) => s.pendingPenImageId);

  const setTool = useFreeform((s) => s.setTool);
  const addImage = useFreeform((s) => s.addImage);
  const updateImage = useFreeform((s) => s.updateImage);
  const deleteImage = useFreeform((s) => s.deleteImage);
  const selectImage = useFreeform((s) => s.selectImage);
  const beginPenPath = useFreeform((s) => s.beginPenPath);
  const addPenAnchor = useFreeform((s) => s.addPenAnchor);
  const updateLastPenAnchor = useFreeform((s) => s.updateLastPenAnchor);
  const commitPenPath = useFreeform((s) => s.commitPenPath);
  const cancelPenPath = useFreeform((s) => s.cancelPenPath);
  const deleteCollision = useFreeform((s) => s.deleteCollision);
  const setPan = useFreeform((s) => s.setPan);
  const setZoom = useFreeform((s) => s.setZoom);
  const resetView = useFreeform((s) => s.resetView);
  const clearAll = useFreeform((s) => s.clearAll);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [cursorWorld, setCursorWorld] = useState<{ x: number; y: number } | null>(null);
  // Last screen-space cursor position over the canvas, used so paste/drop
  // can land at the cursor instead of dead-center when the user has
  // hovered the canvas. Reset when the pointer leaves.
  const cursorScreenRef = useRef<{ x: number; y: number } | null>(null);

  // Drag state — kept in a ref so listeners don't re-bind on every move.
  type DragState =
    | { kind: 'pan'; startX: number; startY: number; origPan: { x: number; y: number } }
    | { kind: 'move'; imageId: string; startWX: number; startWY: number; origX: number; origY: number }
    | { kind: 'resize'; imageId: string; corner: 'nw' | 'ne' | 'sw' | 'se'; startW: number; startH: number; startWX: number; startWY: number; origCenter: { x: number; y: number }; origRot: number }
    | { kind: 'rotate'; imageId: string; centerWX: number; centerWY: number; startAngle: number; origRot: number }
    | { kind: 'penHandle'; anchorIndex: number; imageId: string }
    | null;
  const dragRef = useRef<DragState>(null);

  const selectedImage: FreeformImage | null =
    images.find((i) => i.id === selectedImageId) ?? null;

  // Translate a pointer event into world coords using the live SVG bbox
  // so it works even if the panel is resized while dragging.
  const eventToWorld = useCallback((e: { clientX: number; clientY: number }) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return screenToWorld(e.clientX - rect.left, e.clientY - rect.top, pan, zoom);
  }, [pan, zoom]);

  // Wheel zoom — keep the cursor's world point fixed under the cursor by
  // shifting pan in tandem with the zoom delta.
  const onWheel = useCallback((e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const factor = Math.exp(-e.deltaY * 0.0015);
    const nextZoom = Math.max(0.1, Math.min(8, zoom * factor));
    // Hold (sx, sy) world point invariant.
    const wx = (sx - pan.x) / zoom;
    const wy = (sy - pan.y) / zoom;
    setPan(sx - wx * nextZoom, sy - wy * nextZoom);
    setZoom(nextZoom);
  }, [pan, zoom, setPan, setZoom]);

  // Pointer down dispatch — figures out what kind of drag (if any) to start.
  const onPointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (e.button === 1 || (e.button === 0 && e.altKey) || (e.button === 0 && e.metaKey)) {
      // Middle-click or alt/cmd-left-drag = pan.
      dragRef.current = { kind: 'pan', startX: e.clientX, startY: e.clientY, origPan: { ...pan } };
      svgRef.current?.setPointerCapture(e.pointerId);
      return;
    }
    if (e.button !== 0) return;
    const world = eventToWorld(e);

    if (tool === 'pen') {
      // Pen tool: must have an image to anchor onto. Pick under-cursor
      // image; if none, treat as no-op (avoid orphan paths).
      let img = selectedImage;
      if (!img || (pendingPenImageId && img.id !== pendingPenImageId)) {
        img = pickImage(world.x, world.y, images) ?? selectedImage;
      } else {
        const under = pickImage(world.x, world.y, images);
        if (under) img = under;
      }
      if (!img) return;
      const local = worldToLocal(world.x, world.y, img);
      // First anchor of a fresh path → tell the store which image owns it.
      if (!pendingPenImageId || pendingPenImageId !== img.id) {
        beginPenPath(img.id);
      }
      // Detect "click first anchor" → close path.
      if (pendingPenImageId === img.id && pendingPenAnchors.length >= 2) {
        const first = pendingPenAnchors[0];
        const dx = first.x - local.x;
        const dy = first.y - local.y;
        // 8 screen pixels in image-local distance ≈ 8/zoom (image-local
        // is in the same unit family as world since we don't scale on
        // the image group besides translate+rotate).
        const closeDist = 8 / zoom;
        if (Math.hypot(dx, dy) < closeDist) {
          commitPenPath(true);
          return;
        }
      }
      addPenAnchor({ x: local.x, y: local.y });
      // Start a drag that may turn the anchor into a curve point if the
      // user drags before releasing. Anchor index = current length - 1
      // AFTER the addPenAnchor above; defer with rAF so store update applies.
      const anchorIndex = pendingPenAnchors.length; // pre-add length == new index
      dragRef.current = { kind: 'penHandle', anchorIndex, imageId: img.id };
      svgRef.current?.setPointerCapture(e.pointerId);
      return;
    }

    // Select tool: pick image under cursor, drag to move.
    const hit = pickImage(world.x, world.y, images);
    if (hit) {
      selectImage(hit.id);
      dragRef.current = {
        kind: 'move',
        imageId: hit.id,
        startWX: world.x,
        startWY: world.y,
        origX: hit.x,
        origY: hit.y,
      };
      svgRef.current?.setPointerCapture(e.pointerId);
    } else {
      // Click empty → deselect.
      selectImage(null);
    }
  }, [tool, pan, eventToWorld, images, selectedImage, pendingPenImageId, pendingPenAnchors, selectImage, addPenAnchor, beginPenPath, commitPenPath, zoom]);

  const onPointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (svg) {
      const rect = svg.getBoundingClientRect();
      cursorScreenRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
    const world = eventToWorld(e);
    setCursorWorld(world);
    const drag = dragRef.current;
    if (!drag) return;

    if (drag.kind === 'pan') {
      setPan(drag.origPan.x + (e.clientX - drag.startX), drag.origPan.y + (e.clientY - drag.startY));
      return;
    }
    if (drag.kind === 'move') {
      const dx = world.x - drag.startWX;
      const dy = world.y - drag.startWY;
      updateImage(drag.imageId, { x: drag.origX + dx, y: drag.origY + dy });
      return;
    }
    if (drag.kind === 'resize') {
      const img = images.find((i) => i.id === drag.imageId);
      if (!img) return;
      // Convert current world point into image-local using ORIGINAL center/rot
      // so resizing doesn't fight the live update loop.
      const local = worldToLocal(world.x, world.y, { x: drag.origCenter.x, y: drag.origCenter.y, rotation: drag.origRot });
      const signX = drag.corner === 'ne' || drag.corner === 'se' ? 1 : -1;
      const signY = drag.corner === 'sw' || drag.corner === 'se' ? 1 : -1;
      const halfW = Math.max(8, signX * local.x);
      const halfH = Math.max(8, signY * local.y);
      const newW = halfW * 2;
      const newH = halfH * 2;
      // Anchor the OPPOSITE corner so the image grows from the dragged side.
      const oppositeLocal = { x: -signX * (drag.startW / 2), y: -signY * (drag.startH / 2) };
      const oppositeWorld = localToWorld(oppositeLocal.x, oppositeLocal.y, { x: drag.origCenter.x, y: drag.origCenter.y, rotation: drag.origRot });
      const newOppositeLocal = { x: -signX * halfW, y: -signY * halfH };
      const newCenter = {
        x: oppositeWorld.x - (newOppositeLocal.x * Math.cos(drag.origRot * Math.PI / 180) - newOppositeLocal.y * Math.sin(drag.origRot * Math.PI / 180)),
        y: oppositeWorld.y - (newOppositeLocal.x * Math.sin(drag.origRot * Math.PI / 180) + newOppositeLocal.y * Math.cos(drag.origRot * Math.PI / 180)),
      };
      updateImage(drag.imageId, { width: newW, height: newH, x: newCenter.x, y: newCenter.y });
      return;
    }
    if (drag.kind === 'rotate') {
      const ang = (Math.atan2(world.y - drag.centerWY, world.x - drag.centerWX) * 180) / Math.PI;
      updateImage(drag.imageId, { rotation: drag.origRot + (ang - drag.startAngle) });
      return;
    }
    if (drag.kind === 'penHandle') {
      const img = images.find((i) => i.id === drag.imageId);
      if (!img) return;
      const local = worldToLocal(world.x, world.y, img);
      // Anchor at index drag.anchorIndex; the handle is the offset from anchor.
      const cur = pendingPenAnchors[drag.anchorIndex];
      if (!cur) return;
      const ox = local.x - cur.x;
      const oy = local.y - cur.y;
      // Mirror in/out for symmetric Bezier feel (typical pen-tool behavior).
      updateLastPenAnchor({ outX: ox, outY: oy, inX: -ox, inY: -oy });
    }
  }, [eventToWorld, setPan, updateImage, images, pendingPenAnchors, updateLastPenAnchor]);

  const onPointerUp = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (svgRef.current?.hasPointerCapture(e.pointerId)) {
      svgRef.current.releasePointerCapture(e.pointerId);
    }
    dragRef.current = null;
  }, []);

  // Keyboard shortcuts — V (select), P (pen), Enter (commit pen),
  // Esc (cancel pen), Delete/Backspace (delete selected).
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      if (e.key === 'v' || e.key === 'V') { setTool('select'); }
      else if (e.key === 'p' || e.key === 'P') { setTool('pen'); }
      else if (e.key === 'Enter') {
        if (pendingPenImageId) commitPenPath(false);
      }
      else if (e.key === 'Escape') {
        if (pendingPenImageId) cancelPenPath();
        else selectImage(null);
      }
      else if ((e.key === 'Delete' || e.key === 'Backspace')) {
        if (selectedCollisionId && selectedImageId) {
          deleteCollision(selectedImageId, selectedCollisionId);
        } else if (selectedImageId) {
          deleteImage(selectedImageId);
        }
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setTool, pendingPenImageId, commitPenPath, cancelPenPath, selectImage, selectedCollisionId, selectedImageId, deleteCollision, deleteImage]);

  function handleAddImage() { fileInputRef.current?.click(); }

  // Single entry point for "drop these images onto the canvas" — used by
  // the file picker, paste, and drag-and-drop. Probes each image's natural
  // size to preserve aspect ratio, defaults the drop point to the canvas
  // center when no anchor is given.
  const placeImageSources = useCallback((
    sources: Array<{ src: string; name: string; revoke?: boolean }>,
    drop?: { x: number; y: number },
  ) => {
    if (sources.length === 0) return;
    let cx = drop?.x;
    let cy = drop?.y;
    if (cx === undefined || cy === undefined) {
      const svg = svgRef.current;
      if (svg) {
        const rect = svg.getBoundingClientRect();
        const center = screenToWorld(rect.width / 2, rect.height / 2, pan, zoom);
        cx = center.x; cy = center.y;
      } else {
        cx = 0; cy = 0;
      }
    }
    sources.forEach((s, i) => {
      const probe = new Image();
      // Allow remote URLs to render even if the host blocks credentials —
      // SVG <image> doesn't need CORS for display, just sizing.
      probe.crossOrigin = 'anonymous';
      probe.onload = () => {
        const maxDim = 320;
        const ratio = (probe.naturalWidth || 1) / (probe.naturalHeight || 1);
        const w = ratio >= 1 ? maxDim : maxDim * ratio;
        const h = ratio >= 1 ? maxDim / ratio : maxDim;
        addImage(s.src, { x: (cx as number) + i * 24, y: (cy as number) + i * 24, width: w, height: h, name: s.name });
      };
      probe.onerror = () => {
        // Probe failed — drop the image at the default square so the user
        // still gets something they can resize.
        addImage(s.src, { x: (cx as number) + i * 24, y: (cy as number) + i * 24, name: s.name });
      };
      probe.src = s.src;
    });
  }, [addImage, pan, zoom]);

  function onFilesPicked(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    placeImageSources(files.map((f) => ({ src: URL.createObjectURL(f), name: f.name })));
    e.target.value = '';
  }

  // Paste — listens on the window because the SVG itself can't take focus
  // and most pastes happen with the cursor over the canvas, not a focused
  // input. Skip when an editable element is focused so Cmd+V in a text box
  // (Chat, side-panel inputs) keeps its native behavior.
  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const ae = document.activeElement as HTMLElement | null;
      if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.isContentEditable)) return;
      const cd = e.clipboardData;
      if (!cd) return;

      const sources: Array<{ src: string; name: string }> = [];

      // Image blobs (screenshot tools, Figma, browsers' "Copy image", etc.)
      for (const item of Array.from(cd.items)) {
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) sources.push({ src: URL.createObjectURL(file), name: file.name || 'pasted' });
        }
      }

      // URL paste — text/uri-list or a bare http(s) string.
      if (sources.length === 0) {
        const uri = cd.getData('text/uri-list') || cd.getData('text/plain');
        const trimmed = uri?.trim();
        if (trimmed && /^https?:\/\/.+\.(png|jpe?g|gif|webp|svg|avif|bmp)(\?.*)?$/i.test(trimmed)) {
          sources.push({ src: trimmed, name: trimmed.split('/').pop()?.split('?')[0] ?? 'image' });
        }
      }

      if (sources.length === 0) return;
      e.preventDefault();
      // Drop at the cursor's last known canvas position, falling back to
      // the canvas center inside placeImageSources.
      const cs = cursorScreenRef.current;
      const drop = cs ? screenToWorld(cs.x, cs.y, pan, zoom) : undefined;
      placeImageSources(sources, drop);
    }
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [pan, zoom, placeImageSources]);

  // Drag-and-drop from desktop / browser — same path as paste.
  const onDragOver = useCallback((e: React.DragEvent<SVGSVGElement>) => {
    if (!e.dataTransfer) return;
    const types = Array.from(e.dataTransfer.types);
    if (types.includes('Files') || types.some((t) => t.startsWith('text/uri-list') || t.startsWith('text/plain'))) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }
  }, []);

  const onDrop = useCallback((e: React.DragEvent<SVGSVGElement>) => {
    e.preventDefault();
    const dt = e.dataTransfer;
    if (!dt) return;
    const sources: Array<{ src: string; name: string }> = [];
    for (const f of Array.from(dt.files)) {
      if (f.type.startsWith('image/')) {
        sources.push({ src: URL.createObjectURL(f), name: f.name });
      }
    }
    if (sources.length === 0) {
      const uri = dt.getData('text/uri-list') || dt.getData('text/plain');
      const trimmed = uri?.trim();
      if (trimmed && /^https?:\/\//i.test(trimmed)) {
        sources.push({ src: trimmed, name: trimmed.split('/').pop()?.split('?')[0] ?? 'image' });
      }
    }
    if (sources.length === 0) return;
    const svg = svgRef.current;
    let drop: { x: number; y: number } | undefined;
    if (svg) {
      const rect = svg.getBoundingClientRect();
      drop = screenToWorld(e.clientX - rect.left, e.clientY - rect.top, pan, zoom);
    }
    placeImageSources(sources, drop);
  }, [pan, zoom, placeImageSources]);

  // Adapter: the save-handle resize logic needs the original image snapshot
  // captured at drag start, so corner handles call this to set up dragRef.
  function startResizeDrag(corner: 'nw' | 'ne' | 'sw' | 'se', img: FreeformImage, e: React.PointerEvent) {
    const world = eventToWorld(e);
    dragRef.current = {
      kind: 'resize',
      imageId: img.id,
      corner,
      startW: img.width,
      startH: img.height,
      startWX: world.x,
      startWY: world.y,
      origCenter: { x: img.x, y: img.y },
      origRot: img.rotation,
    };
    svgRef.current?.setPointerCapture(e.pointerId);
  }

  function startRotateDrag(img: FreeformImage, e: React.PointerEvent) {
    const world = eventToWorld(e);
    const ang = (Math.atan2(world.y - img.y, world.x - img.x) * 180) / Math.PI;
    dragRef.current = {
      kind: 'rotate',
      imageId: img.id,
      centerWX: img.x,
      centerWY: img.y,
      startAngle: ang,
      origRot: img.rotation,
    };
    svgRef.current?.setPointerCapture(e.pointerId);
  }

  // Sorted bottom-to-top so SVG paint order matches zIndex.
  const sortedImages = [...images].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: 'var(--pb-paper)' }}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onFilesPicked}
      />

      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        style={{
          touchAction: 'none',
          cursor: tool === 'pen' ? 'crosshair' : dragRef.current?.kind === 'pan' ? 'grabbing' : 'default',
          background:
            'repeating-linear-gradient(0deg, transparent 0 39px, rgba(0,0,0,0.04) 39px 40px), ' +
            'repeating-linear-gradient(90deg, transparent 0 39px, rgba(0,0,0,0.04) 39px 40px)',
        }}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={() => { cursorScreenRef.current = null; }}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <g transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}>
          {/* Origin marker — small "+" so the user has a reference point */}
          <g opacity={0.35}>
            <line x1={-12} y1={0} x2={12} y2={0} stroke="var(--pb-ink)" strokeWidth={1 / zoom} />
            <line x1={0} y1={-12} x2={0} y2={12} stroke="var(--pb-ink)" strokeWidth={1 / zoom} />
          </g>

          {sortedImages.map((img) => {
            const isSelected = img.id === selectedImageId;
            return (
              <g key={img.id} transform={`translate(${img.x} ${img.y}) rotate(${img.rotation})`}>
                <image
                  href={img.src}
                  x={-img.width / 2}
                  y={-img.height / 2}
                  width={img.width}
                  height={img.height}
                  preserveAspectRatio="none"
                  style={{ imageRendering: 'pixelated' }}
                />
                {/* Collision paths in image-local space */}
                {img.collisions.map((c) => {
                  const isCollSelected = c.id === selectedCollisionId;
                  return (
                    <path
                      key={c.id}
                      d={collisionToPath(c)}
                      fill={isCollSelected ? 'rgba(56, 189, 248, 0.18)' : 'rgba(56, 189, 248, 0.10)'}
                      stroke={isCollSelected ? '#0284c7' : '#38bdf8'}
                      strokeWidth={2 / zoom}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  );
                })}
                {/* Selection ring + handles */}
                {isSelected && (
                  <SelectionFrame
                    img={img}
                    zoom={zoom}
                    onResize={(corner, e) => startResizeDrag(corner, img, e)}
                    onRotate={(e) => startRotateDrag(img, e)}
                  />
                )}
              </g>
            );
          })}

          {/* In-progress pen path — rendered in the owning image's frame */}
          {pendingPenImageId && (() => {
            const img = images.find((i) => i.id === pendingPenImageId);
            if (!img) return null;
            const live = cursorWorld ? worldToLocal(cursorWorld.x, cursorWorld.y, img) : null;
            return (
              <g transform={`translate(${img.x} ${img.y}) rotate(${img.rotation})`}>
                {pendingPenAnchors.length > 0 && (
                  <path
                    d={collisionToPath({ id: '_pending', anchors: pendingPenAnchors, closed: false })}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth={2 / zoom}
                    strokeDasharray={`${4 / zoom} ${3 / zoom}`}
                    vectorEffect="non-scaling-stroke"
                  />
                )}
                {/* Rubber band to cursor */}
                {live && pendingPenAnchors.length > 0 && (
                  <line
                    x1={pendingPenAnchors[pendingPenAnchors.length - 1].x}
                    y1={pendingPenAnchors[pendingPenAnchors.length - 1].y}
                    x2={live.x}
                    y2={live.y}
                    stroke="#f59e0b"
                    strokeOpacity={0.5}
                    strokeWidth={1.5 / zoom}
                    strokeDasharray={`${3 / zoom} ${3 / zoom}`}
                    vectorEffect="non-scaling-stroke"
                  />
                )}
                {pendingPenAnchors.map((a, i) => (
                  <PenAnchor key={i} anchor={a} zoom={zoom} first={i === 0} />
                ))}
              </g>
            );
          })()}
        </g>
      </svg>

      {/* Toolbar */}
      <div
        className="absolute top-3 left-3 z-10 flex items-center gap-1 p-1.5"
        style={{
          background: 'var(--pb-paper)',
          border: '1.5px solid var(--pb-ink)',
          borderRadius: 12,
          boxShadow: '0 3px 0 var(--pb-ink)',
        }}
      >
        <ToolButton active={tool === 'select'} title="Select / move / resize  (V)" onClick={() => setTool('select')}>
          <MousePointer2 size={14} strokeWidth={2.2} />
        </ToolButton>
        <ToolButton active={tool === 'pen'} title="Pen — draw collision boundary on selected image  (P)" onClick={() => setTool('pen')}>
          <PenTool size={14} strokeWidth={2.2} />
        </ToolButton>
        <Separator />
        <ToolButton title="Add image…" onClick={handleAddImage}>
          <ImageIcon size={14} strokeWidth={2.2} />
        </ToolButton>
        <ToolButton title="Reset view" onClick={resetView}>
          <Maximize2 size={14} strokeWidth={2.2} />
        </ToolButton>
        <Separator />
        <ToolButton title="Clear all" destructive onClick={() => { if (confirm('Clear the whole 2D scene?')) clearAll(); }}>
          <Trash2 size={14} strokeWidth={2.2} />
        </ToolButton>
      </div>

      {/* Empty state */}
      {images.length === 0 && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ color: 'var(--pb-ink-muted)' }}
        >
          <div
            className="flex flex-col items-center gap-3 text-center"
            style={{ maxWidth: 380 }}
          >
            <div
              className="flex items-center justify-center"
              style={{
                width: 56, height: 56, borderRadius: 16,
                background: 'var(--pb-butter)',
                border: '1.5px solid var(--pb-butter-ink)',
                boxShadow: '0 2px 0 var(--pb-butter-ink)',
              }}
            >
              <ImageIcon size={24} strokeWidth={2.2} style={{ color: 'var(--pb-butter-ink)' }} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--pb-ink)' }}>
              2D Freeform canvas
            </p>
            <p style={{ fontSize: 12, fontWeight: 500 }}>
              <strong>Paste</strong> (⌘V), drag-drop, or click the image button to add images.
              Then move / resize / rotate them, or pick the <strong>Pen tool</strong> to draw
              collision boundaries that travel with each image.
            </p>
          </div>
        </div>
      )}

      {/* HUD */}
      <div
        className="absolute bottom-3 left-3 z-10 pointer-events-none"
        style={{
          padding: '5px 12px', borderRadius: 10,
          background: 'var(--pb-paper)', border: '1.5px solid var(--pb-line-2)',
          fontSize: 11, color: 'var(--pb-ink-soft)', fontWeight: 500,
        }}
      >
        Tool <span style={{ color: 'var(--pb-ink)', fontWeight: 700 }}>{tool}</span>
        <span style={{ color: 'var(--pb-ink-muted)', margin: '0 6px' }}>·</span>
        Zoom <span style={{ color: 'var(--pb-ink)', fontWeight: 700 }}>{Math.round(zoom * 100)}%</span>
        <span style={{ color: 'var(--pb-ink-muted)', margin: '0 6px' }}>·</span>
        {images.length} image{images.length === 1 ? '' : 's'}
        {pendingPenImageId && (
          <>
            <span style={{ color: 'var(--pb-ink-muted)', margin: '0 6px' }}>·</span>
            <span style={{ color: 'var(--pb-coral-ink)', fontWeight: 700 }}>
              Drawing… click first anchor to close · Enter to finish · Esc to cancel
            </span>
          </>
        )}
      </div>
    </div>
  );
}

function ToolButton({
  active = false, destructive = false, title, onClick, children,
}: {
  active?: boolean; destructive?: boolean; title: string;
  onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      onMouseDown={(e) => e.stopPropagation()}
      className="flex items-center justify-center transition-colors"
      style={{
        height: 30, width: 30, borderRadius: 8,
        background: active ? 'var(--pb-butter)' : 'var(--pb-paper)',
        color: destructive ? 'var(--pb-coral-ink)' : active ? 'var(--pb-butter-ink)' : 'var(--pb-ink-soft)',
        border: `1.5px solid ${active ? 'var(--pb-butter-ink)' : 'var(--pb-line-2)'}`,
        boxShadow: active ? '0 1.5px 0 var(--pb-butter-ink)' : 'none',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

function Separator() {
  return <div style={{ width: 1.5, height: 18, background: 'var(--pb-line-2)', margin: '0 2px' }} />;
}

function PenAnchor({ anchor, zoom, first }: { anchor: FreeformAnchor; zoom: number; first: boolean }) {
  const r = 4 / zoom;
  return (
    <g>
      {anchor.outX !== undefined && anchor.outY !== undefined && (
        <line
          x1={anchor.x} y1={anchor.y}
          x2={anchor.x + anchor.outX} y2={anchor.y + anchor.outY}
          stroke="#f59e0b" strokeWidth={1 / zoom} strokeDasharray={`${2 / zoom} ${2 / zoom}`}
          vectorEffect="non-scaling-stroke"
        />
      )}
      {anchor.inX !== undefined && anchor.inY !== undefined && (
        <line
          x1={anchor.x} y1={anchor.y}
          x2={anchor.x + anchor.inX} y2={anchor.y + anchor.inY}
          stroke="#f59e0b" strokeWidth={1 / zoom} strokeDasharray={`${2 / zoom} ${2 / zoom}`}
          vectorEffect="non-scaling-stroke"
        />
      )}
      <rect
        x={anchor.x - r} y={anchor.y - r} width={r * 2} height={r * 2}
        fill={first ? '#fef08a' : '#fff'} stroke="#f59e0b" strokeWidth={1.5 / zoom}
        vectorEffect="non-scaling-stroke"
      />
    </g>
  );
}

function SelectionFrame({
  img, zoom, onResize, onRotate,
}: {
  img: FreeformImage; zoom: number;
  onResize: (corner: 'nw' | 'ne' | 'sw' | 'se', e: React.PointerEvent) => void;
  onRotate: (e: React.PointerEvent) => void;
}) {
  const w = img.width;
  const h = img.height;
  const handleSize = 8 / zoom;
  const rotateOffset = 22 / zoom;
  const corners: Array<{ key: 'nw' | 'ne' | 'sw' | 'se'; x: number; y: number; cursor: string }> = [
    { key: 'nw', x: -w / 2, y: -h / 2, cursor: 'nwse-resize' },
    { key: 'ne', x:  w / 2, y: -h / 2, cursor: 'nesw-resize' },
    { key: 'sw', x: -w / 2, y:  h / 2, cursor: 'nesw-resize' },
    { key: 'se', x:  w / 2, y:  h / 2, cursor: 'nwse-resize' },
  ];
  return (
    <g pointerEvents="auto">
      <rect
        x={-w / 2} y={-h / 2} width={w} height={h}
        fill="none" stroke="#0ea5e9" strokeWidth={1.5 / zoom}
        strokeDasharray={`${4 / zoom} ${3 / zoom}`}
        vectorEffect="non-scaling-stroke"
      />
      {corners.map((c) => (
        <rect
          key={c.key}
          x={c.x - handleSize / 2} y={c.y - handleSize / 2}
          width={handleSize} height={handleSize}
          fill="#fff" stroke="#0ea5e9" strokeWidth={1.5 / zoom}
          vectorEffect="non-scaling-stroke"
          style={{ cursor: c.cursor }}
          onPointerDown={(e) => { e.stopPropagation(); onResize(c.key, e); }}
        />
      ))}
      {/* Rotate handle above the top edge */}
      <line x1={0} y1={-h / 2} x2={0} y2={-h / 2 - rotateOffset}
        stroke="#0ea5e9" strokeWidth={1.5 / zoom} vectorEffect="non-scaling-stroke" />
      <circle
        cx={0} cy={-h / 2 - rotateOffset} r={handleSize * 0.7}
        fill="#fff" stroke="#0ea5e9" strokeWidth={1.5 / zoom}
        vectorEffect="non-scaling-stroke"
        style={{ cursor: 'grab' }}
        onPointerDown={(e) => { e.stopPropagation(); onRotate(e); }}
      />
    </g>
  );
}
