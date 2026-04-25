'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MousePointer2, PenTool, Image as ImageIcon, Trash2, Maximize2, Play, Square, User, FlipHorizontal, FlipVertical, ArrowUpToLine, ArrowDownToLine, Undo2, Redo2 } from 'lucide-react';
import { useFreeform, type FreeformAnchor, type FreeformBackground, type FreeformImage } from '@/store/freeform-store';
import {
  screenToWorld, worldToLocal, localToWorld,
  collisionToPath, pickImage, computeSnap, imageAABB, type SnapGuide,
} from '@/lib/freeform-geom';

/**
 * Read a File as a data: URL so it survives page reloads. Blob URLs from
 * URL.createObjectURL are session-scoped and break on refresh, leaving
 * orphan boxes in the persisted store.
 */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('read failed'));
    reader.readAsDataURL(file);
  });
}

/**
 * Encode raw SVG markup as a base64 data URL so it can be used as an
 * `<image href>` and survive page reloads. We base64 (not utf8 encodeURI)
 * because some SVGs include `#` and `&` characters that break inline data
 * URLs in Safari.
 */
function svgMarkupToDataUrl(markup: string): string {
  // toBase64 — handle UTF-8 chars (e.g. unicode glyphs in <text>).
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
 * Translate the persisted background description into a `style` object the
 * SVG element can spread. We avoid the `background` shorthand because we
 * want to composite up to 3 layers (main + 2 grid lines) without dealing
 * with the shorthand's per-layer sizing rules.
 */
function backgroundStyle(bg: FreeformBackground, showGrid: boolean): React.CSSProperties {
  const gridImage =
    'repeating-linear-gradient(0deg, transparent 0 39px, rgba(0,0,0,0.04) 39px 40px),' +
    ' repeating-linear-gradient(90deg, transparent 0 39px, rgba(0,0,0,0.04) 39px 40px)';
  const grid = showGrid ? `, ${gridImage}` : '';
  const gridSize = showGrid ? ', 40px 40px, 40px 40px' : '';
  const gridRepeat = showGrid ? ', repeat, repeat' : '';
  const gridPos = showGrid ? ', 0 0, 0 0' : '';

  switch (bg.kind) {
    case 'solid':
      return {
        backgroundColor: bg.color,
        backgroundImage: showGrid ? gridImage : undefined,
        backgroundSize: showGrid ? '40px 40px, 40px 40px' : undefined,
        backgroundRepeat: showGrid ? 'repeat, repeat' : undefined,
        backgroundPosition: showGrid ? '0 0, 0 0' : undefined,
      };
    case 'gradient':
      return {
        backgroundImage: bg.radial
          ? `radial-gradient(circle, ${bg.from}, ${bg.to})${grid}`
          : `linear-gradient(${bg.angle}deg, ${bg.from}, ${bg.to})${grid}`,
        backgroundSize: `auto${gridSize}`,
        backgroundRepeat: `no-repeat${gridRepeat}`,
        backgroundPosition: `center${gridPos}`,
      };
    case 'image':
      return {
        backgroundColor: '#fff',
        backgroundImage: `url("${bg.src}")${grid}`,
        backgroundSize: `${bg.fit}${gridSize}`,
        backgroundRepeat: `no-repeat${gridRepeat}`,
        backgroundPosition: `center${gridPos}`,
      };
    case 'tile':
      return {
        backgroundImage: `url("${bg.src}")${grid}`,
        backgroundSize: `${bg.tileSize}px ${bg.tileSize}px${gridSize}`,
        backgroundRepeat: `repeat${gridRepeat}`,
        backgroundPosition: `0 0${gridPos}`,
      };
  }
}
import { CharacterLayer, pickCharacter } from './CharacterLayer';

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
  const characters = useFreeform((s) => s.characters);
  const background = useFreeform((s) => s.background);
  const showGrid = useFreeform((s) => s.showGrid);
  const selectedCharacterId = useFreeform((s) => s.selectedCharacterId);
  const playing = useFreeform((s) => s.playing);
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
  const addCharacter = useFreeform((s) => s.addCharacter);
  const updateCharacter = useFreeform((s) => s.updateCharacter);
  const deleteCharacter = useFreeform((s) => s.deleteCharacter);
  const selectCharacter = useFreeform((s) => s.selectCharacter);
  const setPlaying = useFreeform((s) => s.setPlaying);
  const addAsset = useFreeform((s) => s.addAsset);
  const beginDrag = useFreeform((s) => s.beginDrag);
  const endDrag = useFreeform((s) => s.endDrag);
  const undo = useFreeform((s) => s.undo);
  const redo = useFreeform((s) => s.redo);
  const canUndo = useFreeform((s) => s.past.length > 0);
  const canRedo = useFreeform((s) => s.future.length > 0);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const charInputRef = useRef<HTMLInputElement | null>(null);
  const [cursorWorld, setCursorWorld] = useState<{ x: number; y: number } | null>(null);
  // Last screen-space cursor position over the canvas, used so paste/drop
  // can land at the cursor instead of dead-center when the user has
  // hovered the canvas. Reset when the pointer leaves.
  const cursorScreenRef = useRef<{ x: number; y: number } | null>(null);
  // Active alignment guides — populated during a 'move' drag whenever the
  // moving image's edges/centers are within the snap threshold of another
  // image. Cleared on pointer up.
  const [snapGuides, setSnapGuides] = useState<SnapGuide[]>([]);

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

  // Wheel + pinch — attached as a NATIVE listener with { passive: false }
  // because React's synthetic onWheel is registered passive in modern
  // React, which makes preventDefault() a silent no-op. Without this fix,
  // trackpad pinch (which fires wheel events with ctrlKey=true on Mac)
  // and even some scroll wheels would trigger the browser's page zoom
  // instead of zooming the canvas.
  //
  // Also captured: WebKit `gesturestart`/`gesturechange`/`gestureend`,
  // which Safari fires for native trackpad pinches alongside the wheel
  // events. Preventing them stops Safari's "Zoom Page" gesture.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    function applyZoom(sx: number, sy: number, factor: number) {
      const cur = useFreeform.getState();
      const nextZoom = Math.max(0.1, Math.min(8, cur.zoom * factor));
      const wx = (sx - cur.pan.x) / cur.zoom;
      const wy = (sy - cur.pan.y) / cur.zoom;
      useFreeform.setState({
        pan: { x: sx - wx * nextZoom, y: sy - wy * nextZoom },
        zoom: nextZoom,
      });
    }

    function onWheel(e: WheelEvent) {
      // Always preventDefault so neither browser zoom (ctrlKey/pinch) nor
      // page scroll bleeds out of the canvas.
      e.preventDefault();
      const rect = svg!.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      // Mac trackpad: pinch → wheel with ctrlKey=true (synthesized by the
      // browser even with no real Ctrl key down). Two-finger swipe → wheel
      // with ctrlKey=false. Mouse wheel also has ctrlKey=false but typically
      // only deltaY; we still pan it (most modern map editors pan on mouse
      // wheel and zoom only on Ctrl+wheel) so the behavior stays consistent.
      if (e.ctrlKey) {
        const factor = Math.exp(-e.deltaY * 0.01);
        applyZoom(sx, sy, factor);
      } else {
        // Pan in screen pixels — keeps panning speed independent of zoom
        // level (matches Figma / Google Maps trackpad behavior).
        const cur = useFreeform.getState();
        useFreeform.setState({
          pan: { x: cur.pan.x - e.deltaX, y: cur.pan.y - e.deltaY },
        });
      }
    }

    // Safari-only trackpad pinch — fires as a sequence of GestureEvents
    // with `scale` cumulative since the gesture began. We need a ref-bound
    // baseline so we can derive a per-tick factor.
    let gestureLastScale = 1;
    function onGestureStart(e: Event) {
      e.preventDefault();
      gestureLastScale = 1;
    }
    function onGestureChange(e: Event & { scale?: number; clientX?: number; clientY?: number }) {
      e.preventDefault();
      const scale = e.scale ?? 1;
      const tickFactor = scale / gestureLastScale;
      gestureLastScale = scale;
      const rect = svg!.getBoundingClientRect();
      const sx = (e.clientX ?? rect.width / 2) - rect.left;
      const sy = (e.clientY ?? rect.height / 2) - rect.top;
      applyZoom(sx, sy, tickFactor);
    }
    function onGestureEnd(e: Event) {
      e.preventDefault();
    }

    svg.addEventListener('wheel', onWheel, { passive: false });
    svg.addEventListener('gesturestart', onGestureStart as EventListener, { passive: false });
    svg.addEventListener('gesturechange', onGestureChange as EventListener, { passive: false });
    svg.addEventListener('gestureend', onGestureEnd as EventListener, { passive: false });
    return () => {
      svg.removeEventListener('wheel', onWheel);
      svg.removeEventListener('gesturestart', onGestureStart as EventListener);
      svg.removeEventListener('gesturechange', onGestureChange as EventListener);
      svg.removeEventListener('gestureend', onGestureEnd as EventListener);
    };
  }, []);

  // Pointer down dispatch — figures out what kind of drag (if any) to start.
  const onPointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (playing) return; // Play mode = no editing interactions.
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

    // Select tool: character hit-test takes priority since characters are
    // drawn on top of images.
    const charHit = pickCharacter(world.x, world.y, characters);
    if (charHit) {
      selectCharacter(charHit.id);
      // Bracket the drag in a single history transaction. Every
      // updateCharacter call between begin/end collapses into one undo step.
      beginDrag();
      dragRef.current = {
        kind: 'move',
        imageId: `char:${charHit.id}`,
        startWX: world.x,
        startWY: world.y,
        origX: charHit.x,
        origY: charHit.y,
      };
      svgRef.current?.setPointerCapture(e.pointerId);
      return;
    }
    const hit = pickImage(world.x, world.y, images);
    if (hit) {
      selectImage(hit.id);
      beginDrag();
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
      selectCharacter(null);
    }
  }, [tool, pan, playing, eventToWorld, images, characters, selectedImage, pendingPenImageId, pendingPenAnchors, selectImage, selectCharacter, addPenAnchor, beginPenPath, commitPenPath, beginDrag, zoom]);

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
      let nx = drag.origX + dx;
      let ny = drag.origY + dy;
      // Characters are tagged with a "char:" prefix on imageId to reuse
      // the move-drag machinery without widening the DragState union.
      if (drag.imageId.startsWith('char:')) {
        const cid = drag.imageId.slice(5);
        updateCharacter(cid, { x: nx, y: ny });
        return;
      }
      const moving = images.find((i) => i.id === drag.imageId);
      // Hold ⌘ (or Ctrl) while dragging to bypass snap — same convention
      // as Figma / Sketch / Illustrator.
      const snapDisabled = e.metaKey || e.ctrlKey;
      if (moving && !snapDisabled) {
        const others = images.filter((i) => i.id !== drag.imageId);
        const threshold = 6 / zoom;  // 6 screen pixels in world units
        const snap = computeSnap(
          { x: nx, y: ny, width: moving.width, height: moving.height, rotation: moving.rotation },
          others.map((o) => ({ id: o.id, x: o.x, y: o.y, width: o.width, height: o.height, rotation: o.rotation })),
          threshold,
        );
        nx = snap.x;
        ny = snap.y;
        setSnapGuides(snap.guides);
      } else {
        if (snapGuides.length > 0) setSnapGuides([]);
      }
      updateImage(drag.imageId, { x: nx, y: ny });
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
      let halfW = Math.max(8, signX * local.x);
      let halfH = Math.max(8, signY * local.y);
      // Hold Shift to lock aspect ratio — standard Figma / Sketch /
      // Photoshop convention. Pick whichever axis the user is pushing
      // harder (relative to the original size) and propagate that scale
      // to the other so the corner tracks the diagonal through the
      // original opposite corner.
      if (e.shiftKey) {
        const scaleW = (halfW * 2) / drag.startW;
        const scaleH = (halfH * 2) / drag.startH;
        // Use the larger scale so growing in one direction grows the
        // shape; shrinking only on one axis still shrinks proportionally.
        const s = Math.max(scaleW, scaleH);
        halfW = (drag.startW * s) / 2;
        halfH = (drag.startH * s) / 2;
      }
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
      let next = drag.origRot + (ang - drag.startAngle);
      // Modifier-driven snapping. ⌘/Ctrl wins over Shift so users can
      // override mid-drag.
      //   ⌘/Ctrl → snap to ABSOLUTE canvas angles (0/15/30/…). Useful
      //            when aligning with another rotated piece — the
      //            rotation lands on the same grid no matter where you
      //            grabbed it.
      //   Shift  → snap to RELATIVE 15° offsets from the start angle.
      //            Useful for precise nudges that keep the original
      //            rotation as the zero.
      const STEP = 15;
      if (e.metaKey || e.ctrlKey) {
        next = Math.round(next / STEP) * STEP;
      } else if (e.shiftKey) {
        const delta = ang - drag.startAngle;
        next = drag.origRot + Math.round(delta / STEP) * STEP;
      }
      updateImage(drag.imageId, { rotation: next });
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
    const drag = dragRef.current;
    // Close out the history transaction opened by beginDrag() — covers
    // move (image + character), resize, and rotate. Pan / penHandle don't
    // start a transaction so they don't need an end. endDrag() is a no-op
    // when paused depth is 0, so always-calling-it is safe.
    if (drag && (drag.kind === 'move' || drag.kind === 'resize' || drag.kind === 'rotate')) {
      endDrag();
    }
    dragRef.current = null;
    setSnapGuides([]);
  }, [endDrag]);

  // Keyboard shortcuts — V (select), P (pen), Enter (commit pen),
  // Esc (cancel pen), Delete/Backspace (delete selected),
  // ⌘Z / Ctrl+Z = undo, ⌘⇧Z / Ctrl+Y = redo.
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      // Undo/Redo first so they take precedence over single-letter
      // shortcuts when modifier keys are held.
      const mod = e.metaKey || e.ctrlKey;
      if (mod && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
        return;
      }
      if (mod && (e.key === 'y' || e.key === 'Y')) {
        e.preventDefault();
        redo();
        return;
      }
      if (e.key === 'v' || e.key === 'V') { setTool('select'); }
      else if (e.key === 'p' || e.key === 'P') { setTool('pen'); }
      else if (e.key === 'Enter') {
        if (pendingPenImageId) commitPenPath(false);
      }
      else if (e.key === 'Escape') {
        if (playing) setPlaying(false);
        else if (pendingPenImageId) cancelPenPath();
        else selectImage(null);
      }
      else if ((e.key === 'Delete' || e.key === 'Backspace')) {
        if (selectedCollisionId && selectedImageId) {
          deleteCollision(selectedImageId, selectedCollisionId);
        } else if (selectedImageId) {
          deleteImage(selectedImageId);
        } else if (selectedCharacterId) {
          deleteCharacter(selectedCharacterId);
        }
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setTool, pendingPenImageId, commitPenPath, cancelPenPath, selectImage, selectedCollisionId, selectedImageId, selectedCharacterId, deleteCollision, deleteImage, deleteCharacter, playing, setPlaying, undo, redo]);

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
        const nw = probe.naturalWidth || 1;
        const nh = probe.naturalHeight || 1;
        const ratio = nw / nh;
        const w = ratio >= 1 ? maxDim : maxDim * ratio;
        const h = ratio >= 1 ? maxDim / ratio : maxDim;
        // Register in the asset library too so the user can re-drop it
        // from the left panel later. Dedupe is handled inside the store.
        addAsset(s.src, { name: s.name, naturalWidth: nw, naturalHeight: nh });
        addImage(s.src, { x: (cx as number) + i * 24, y: (cy as number) + i * 24, width: w, height: h, name: s.name });
      };
      probe.onerror = () => {
        // Probe failed — drop the image at the default square so the user
        // still gets something they can resize.
        addAsset(s.src, { name: s.name });
        addImage(s.src, { x: (cx as number) + i * 24, y: (cy as number) + i * 24, name: s.name });
      };
      probe.src = s.src;
    });
  }, [addImage, addAsset, pan, zoom]);

  // Character import — prompts the user for the sprite-sheet grid so we
  // can derive frame dimensions. Sensible defaults match the common
  // LPC / RPG-Maker style 4×4 sheets (down, left, right, up × 4 frames).
  function onCharacterPicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const colsStr = window.prompt('Sprite sheet columns (frames per row)?', '4');
    if (colsStr === null) { e.target.value = ''; return; }
    const rowsStr = window.prompt('Sprite sheet rows? (convention: 0=down 1=left 2=right 3=up)', '4');
    if (rowsStr === null) { e.target.value = ''; return; }
    const cols = Math.max(1, parseInt(colsStr, 10) || 4);
    const rows = Math.max(1, parseInt(rowsStr, 10) || 4);
    // Encode as data URL so the character survives a page refresh.
    fileToDataUrl(file).then((src) => {
      const probe = new Image();
      probe.onload = () => {
        const frameW = (probe.naturalWidth || cols * 32) / cols;
        const frameH = (probe.naturalHeight || rows * 32) / rows;
        const displayW = frameW * 3;
        const displayH = frameH * 3;
        const svg = svgRef.current;
        let cx = 0, cy = 0;
        if (svg) {
          const rect = svg.getBoundingClientRect();
          const cs = cursorScreenRef.current ?? { x: rect.width / 2, y: rect.height / 2 };
          const w = screenToWorld(cs.x, cs.y, pan, zoom);
          cx = w.x; cy = w.y;
        }
        addCharacter(src, {
          name: file.name.replace(/\.[^.]+$/, ''),
          x: cx, y: cy,
          width: displayW, height: displayH,
          cols, rows, fps: 8, speed: 220,
        });
      };
      probe.onerror = () => {
        addCharacter(src, { name: file.name, cols, rows });
      };
      probe.src = src;
    }).catch((err) => console.error('[freeform] character read failed', err));
    e.target.value = '';
  }

  function onFilesPicked(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    Promise.all(files.map(async (f) => ({ src: await fileToDataUrl(f), name: f.name })))
      .then((sources) => placeImageSources(sources))
      .catch((err) => console.error('[freeform] file read failed', err));
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

      // Collect Files first; URL fallback is sync and goes straight in.
      // image/svg+xml is included via startsWith('image/') below.
      const files: File[] = [];
      for (const item of Array.from(cd.items)) {
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }

      const httpSources: Array<{ src: string; name: string }> = [];
      // SVG markup pasted as text — Illustrator, Figma "Copy as SVG",
      // browser View Source, etc. We sniff for `<svg ...>` so plain text
      // pastes don't accidentally trigger this.
      const svgSources: Array<{ src: string; name: string }> = [];
      if (files.length === 0) {
        const text = cd.getData('text/plain') || cd.getData('text/html') || '';
        if (looksLikeSvgMarkup(text)) {
          svgSources.push({ src: svgMarkupToDataUrl(text), name: 'pasted.svg' });
        } else {
          const uri = cd.getData('text/uri-list') || cd.getData('text/plain');
          const trimmed = uri?.trim();
          if (trimmed && /^https?:\/\/.+\.(png|jpe?g|gif|webp|svg|avif|bmp)(\?.*)?$/i.test(trimmed)) {
            httpSources.push({ src: trimmed, name: trimmed.split('/').pop()?.split('?')[0] ?? 'image' });
          }
        }
      }

      if (files.length === 0 && httpSources.length === 0 && svgSources.length === 0) return;
      e.preventDefault();
      const cs = cursorScreenRef.current;
      const drop = cs ? screenToWorld(cs.x, cs.y, pan, zoom) : undefined;

      if (httpSources.length > 0) placeImageSources(httpSources, drop);
      if (svgSources.length > 0) placeImageSources(svgSources, drop);
      if (files.length > 0) {
        Promise.all(files.map(async (f) => ({ src: await fileToDataUrl(f), name: f.name || 'pasted' })))
          .then((sources) => placeImageSources(sources, drop))
          .catch((err) => console.error('[freeform] paste read failed', err));
      }
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
    const files: File[] = [];
    for (const f of Array.from(dt.files)) {
      // Some browsers leave .svg files with empty MIME — accept them by
      // name suffix as a fallback.
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
          httpSources.push({ src: trimmed, name: trimmed.split('/').pop()?.split('?')[0] ?? 'image' });
        }
      }
    }
    if (files.length === 0 && httpSources.length === 0 && svgSources.length === 0) return;
    const svg = svgRef.current;
    let drop: { x: number; y: number } | undefined;
    if (svg) {
      const rect = svg.getBoundingClientRect();
      drop = screenToWorld(e.clientX - rect.left, e.clientY - rect.top, pan, zoom);
    }
    if (httpSources.length > 0) placeImageSources(httpSources, drop);
    if (svgSources.length > 0) placeImageSources(svgSources, drop);
    if (files.length > 0) {
      Promise.all(files.map(async (f) => ({ src: await fileToDataUrl(f), name: f.name })))
        .then((sources) => placeImageSources(sources, drop))
        .catch((err) => console.error('[freeform] drop read failed', err));
    }
  }, [pan, zoom, placeImageSources]);

  // Adapter: the save-handle resize logic needs the original image snapshot
  // captured at drag start, so corner handles call this to set up dragRef.
  function startResizeDrag(corner: 'nw' | 'ne' | 'sw' | 'se', img: FreeformImage, e: React.PointerEvent) {
    const world = eventToWorld(e);
    beginDrag();
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
    beginDrag();
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
        // image/* covers raster + svg in modern browsers, but some drag-out
        // saves leave SVG with `application/octet-stream` so we list the
        // explicit MIME + extension as belt-and-braces.
        accept="image/*,image/svg+xml,.svg"
        multiple
        className="hidden"
        onChange={onFilesPicked}
      />
      <input
        ref={charInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onCharacterPicked}
      />

      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        style={{
          touchAction: 'none',
          cursor: tool === 'pen' ? 'crosshair' : dragRef.current?.kind === 'pan' ? 'grabbing' : 'default',
          // Background comes from the store (Right panel → Properties → Canvas).
          // The 40-px grid overlay is layered on top and toggled separately so
          // it stays visible against any solid/gradient/image fill.
          ...backgroundStyle(background, showGrid),
        }}
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
            const sx = img.flipX ? -1 : 1;
            const sy = img.flipY ? -1 : 1;
            // Flip is applied as a scale on the image group, so collisions
            // mirror with the image automatically (they live in this same
            // transform frame).
            const xform = `translate(${img.x} ${img.y}) rotate(${img.rotation})`
              + ((sx !== 1 || sy !== 1) ? ` scale(${sx} ${sy})` : '');
            return (
              <g key={img.id} transform={xform}>
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

          {/* Characters — rendered above images so they visually walk on
              top of the map. Sprite animation + WASD play loop live in
              CharacterLayer. */}
          <CharacterLayer zoom={zoom} />

          {/* Alignment guides — rendered above images so they stay visible
              while dragging. Magenta to match the standard editor convention. */}
          {snapGuides.map((g, i) => (
            g.kind === 'v' ? (
              <line
                key={`g${i}`}
                x1={g.value}
                x2={g.value}
                y1={g.start - 12 / zoom}
                y2={g.end + 12 / zoom}
                stroke="#ec4899"
                strokeWidth={1 / zoom}
                vectorEffect="non-scaling-stroke"
                pointerEvents="none"
              />
            ) : (
              <line
                key={`g${i}`}
                y1={g.value}
                y2={g.value}
                x1={g.start - 12 / zoom}
                x2={g.end + 12 / zoom}
                stroke="#ec4899"
                strokeWidth={1 / zoom}
                vectorEffect="non-scaling-stroke"
                pointerEvents="none"
              />
            )
          ))}

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

      {/* Floating context toolbar — appears above the selected image with
          flip / order / delete actions. Hidden in play mode and while a
          drag is active so it doesn't chase the image around. */}
      {!playing && selectedImage && (() => {
        const box = imageAABB(selectedImage);
        // Top-edge midpoint in screen space, with a 14-px gap above so the
        // toolbar doesn't overlap the rotation handle.
        const screenMidX = box.cx * zoom + pan.x;
        const screenTop = box.top * zoom + pan.y;
        return (
          <div
            className="absolute z-10 flex items-center gap-1 p-1.5 pointer-events-auto"
            style={{
              left: screenMidX,
              top: Math.max(8, screenTop - 14),
              transform: 'translate(-50%, -100%)',
              background: 'var(--pb-paper)',
              border: '1.5px solid var(--pb-ink)',
              borderRadius: 12,
              boxShadow: '0 3px 0 var(--pb-ink)',
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <ToolButton
              title="Flip horizontally"
              onClick={() => updateImage(selectedImage.id, { flipX: !selectedImage.flipX })}
              active={!!selectedImage.flipX}
            >
              <FlipHorizontal size={14} strokeWidth={2.2} />
            </ToolButton>
            <ToolButton
              title="Flip vertically"
              onClick={() => updateImage(selectedImage.id, { flipY: !selectedImage.flipY })}
              active={!!selectedImage.flipY}
            >
              <FlipVertical size={14} strokeWidth={2.2} />
            </ToolButton>
            <Separator />
            <ToolButton
              title="Bring to front"
              onClick={() => {
                const maxZ = images.reduce((m, i) => Math.max(m, i.zIndex), 0);
                if (selectedImage.zIndex < maxZ) updateImage(selectedImage.id, { zIndex: maxZ + 1 });
              }}
            >
              <ArrowUpToLine size={14} strokeWidth={2.2} />
            </ToolButton>
            <ToolButton
              title="Send to back"
              onClick={() => {
                const minZ = images.reduce((m, i) => Math.min(m, i.zIndex), Infinity);
                if (selectedImage.zIndex > minZ) updateImage(selectedImage.id, { zIndex: minZ - 1 });
              }}
            >
              <ArrowDownToLine size={14} strokeWidth={2.2} />
            </ToolButton>
            <Separator />
            <ToolButton
              title="Delete  (Del)"
              destructive
              onClick={() => deleteImage(selectedImage.id)}
            >
              <Trash2 size={14} strokeWidth={2.2} />
            </ToolButton>
          </div>
        );
      })()}

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
        <ToolButton disabled={!canUndo} title="Undo  (⌘Z)" onClick={undo}>
          <Undo2 size={14} strokeWidth={2.2} />
        </ToolButton>
        <ToolButton disabled={!canRedo} title="Redo  (⌘⇧Z)" onClick={redo}>
          <Redo2 size={14} strokeWidth={2.2} />
        </ToolButton>
        <Separator />
        <ToolButton title="Add image…" onClick={handleAddImage}>
          <ImageIcon size={14} strokeWidth={2.2} />
        </ToolButton>
        <ToolButton title="Deploy character (sprite sheet)…" onClick={() => charInputRef.current?.click()}>
          <User size={14} strokeWidth={2.2} />
        </ToolButton>
        <ToolButton title="Reset view" onClick={resetView}>
          <Maximize2 size={14} strokeWidth={2.2} />
        </ToolButton>
        <Separator />
        <ToolButton
          active={playing}
          title={playing ? 'Stop test play (Esc in canvas)' : 'Test play — drive first character with WASD / arrows'}
          onClick={() => {
            if (characters.length === 0 && !playing) {
              alert('Add a character first (the person icon) before test-playing.');
              return;
            }
            setPlaying(!playing);
          }}
        >
          {playing ? <Square size={14} strokeWidth={2.2} /> : <Play size={14} strokeWidth={2.2} />}
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
              <strong>Paste</strong> (⌘V), drag-drop, or click the image button to add images
              (PNG, JPG, SVG, or pasted SVG markup). Then move / resize / rotate them, or pick
              the <strong>Pen tool</strong> to draw collision boundaries that travel with each image.
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
