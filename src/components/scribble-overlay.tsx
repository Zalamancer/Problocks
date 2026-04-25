'use client';

// Khan-Academy-style scribble layer. A persistent floating button at
// the bottom-right of every page toggles a transparent, full-viewport
// canvas the user can write/draw on, on top of any existing UI.
//
// While ON: the overlay captures all pointer events, the page beneath
// is read-only. A small toolbar floats at the top with pen/eraser/
// colors/undo/clear and an exit button.
// While OFF: the overlay disables pointer-events and is invisible —
// the underlying page works normally.
//
// Strokes live in component state and are wiped on a hard reload or
// route change (mount/unmount); user can also hit Clear to reset.

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Eraser, Pen, RotateCcw, Scissors, Trash2, X } from 'lucide-react';

// `eraser` = pixel eraser (uses globalCompositeOperation: destination-out
// so it carves through anything underneath). `eraser-stroke` = whole-
// stroke eraser: hovering over a stroke deletes the entire stroke, like
// Procreate / Notability's object eraser.
type Tool = 'pen' | 'eraser' | 'eraser-stroke';
type Pt = { x: number; y: number };
interface Stroke {
  // Only 'pen' and 'eraser' produce stored strokes. 'eraser-stroke'
  // mutates the array directly — it never adds anything.
  tool: 'pen' | 'eraser';
  color: string;
  width: number;
  points: Pt[];
}

const PEN_COLORS = ['#dc2626', '#1f2937', '#2563eb', '#16a34a', '#ca8a04'];
const PEN_WIDTH = 3;
// Bigger eraser so the user can wipe annotations quickly without precision.
const ERASER_WIDTH = 28;

export function ScribbleOverlay() {
  const [active, setActive] = useState(false);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState(PEN_COLORS[0]);
  const [, repaintToolbar] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const activeStrokeRef = useRef<Stroke | null>(null);
  const drawingRef = useRef(false);
  const dprRef = useRef(1);
  const sizeRef = useRef({ w: 0, h: 0 });

  // ---- canvas sizing & repaint ----
  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { w, h } = sizeRef.current;
    const dpr = dprRef.current;
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const s of strokesRef.current) drawStroke(ctx, s);
    if (activeStrokeRef.current) drawStroke(ctx, activeStrokeRef.current);
    ctx.restore();
  }, []);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    dprRef.current = dpr;
    sizeRef.current = { w, h };
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    paint();
  }, [paint]);

  useEffect(() => {
    if (!active) return;
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [active, resize]);

  // Wipe canvas on a route change so each page starts clean. Listening on
  // popstate covers Next's client-side navigations on most paths.
  useEffect(() => {
    const onNav = () => {
      strokesRef.current = [];
      activeStrokeRef.current = null;
      paint();
      repaintToolbar((n) => n + 1);
    };
    window.addEventListener('popstate', onNav);
    return () => window.removeEventListener('popstate', onNav);
  }, [paint]);

  // ---- pointer handlers ----
  const pointAt = (e: React.PointerEvent<HTMLCanvasElement>): Pt => ({
    x: e.clientX,
    y: e.clientY,
  });

  const eraseStrokeAt = useCallback(
    (p: Pt): boolean => {
      // Walk strokes from top (most recently drawn) so a touch removes
      // the visually frontmost stroke first. Stop at the first hit.
      const arr = strokesRef.current;
      for (let i = arr.length - 1; i >= 0; i--) {
        if (strokeHits(arr[i], p)) {
          arr.splice(i, 1);
          return true;
        }
      }
      return false;
    },
    [],
  );

  const begin = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!active) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.setPointerCapture(e.pointerId);
      drawingRef.current = true;
      const p = pointAt(e);
      if (tool === 'eraser-stroke') {
        if (eraseStrokeAt(p)) {
          paint();
          repaintToolbar((n) => n + 1);
        }
        return;
      }
      activeStrokeRef.current = {
        tool,
        color,
        width: tool === 'eraser' ? ERASER_WIDTH : PEN_WIDTH,
        points: [p],
      };
      paint();
    },
    [active, color, tool, paint, eraseStrokeAt],
  );

  const extend = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!drawingRef.current) return;
      const p = pointAt(e);
      if (tool === 'eraser-stroke') {
        // Stream-erase: while dragging, remove every stroke the cursor
        // passes through. Repaint only when we actually deleted one to
        // avoid extra frames.
        if (eraseStrokeAt(p)) {
          paint();
          repaintToolbar((n) => n + 1);
        }
        return;
      }
      const s = activeStrokeRef.current;
      if (!s) return;
      // Drop points the cursor barely moved to. Higher threshold = fewer
      // raw samples = each rendered Bezier spans more pixels, which is
      // what makes the curve look fluid instead of buzzy. ~4 px is the
      // sweet spot for trackpads — small enough that the lag is invisible,
      // big enough to kill the high-frequency jitter we want gone.
      const last = s.points[s.points.length - 1];
      const dx = p.x - last.x;
      const dy = p.y - last.y;
      if (dx * dx + dy * dy < 16) return;
      s.points.push(p);
      paint();
    },
    [tool, eraseStrokeAt, paint],
  );

  const end = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!drawingRef.current) return;
      const canvas = canvasRef.current;
      if (canvas) canvas.releasePointerCapture(e.pointerId);
      drawingRef.current = false;
      const s = activeStrokeRef.current;
      if (s && s.points.length > 0) {
        if (s.points.length === 1) s.points.push({ ...s.points[0] });
        strokesRef.current.push(s);
      }
      activeStrokeRef.current = null;
      paint();
      repaintToolbar((n) => n + 1);
    },
    [paint],
  );

  // ---- toolbar actions ----
  const undo = () => {
    strokesRef.current.pop();
    paint();
    repaintToolbar((n) => n + 1);
  };
  const clear = () => {
    strokesRef.current = [];
    activeStrokeRef.current = null;
    paint();
    repaintToolbar((n) => n + 1);
  };

  const hasStrokes = strokesRef.current.length > 0;

  return (
    <>
      {/* Persistent floating toggle button */}
      <button
        type="button"
        onClick={() => setActive((a) => !a)}
        title={active ? 'Exit scribble mode' : 'Scribble on the page'}
        aria-pressed={active}
        style={{
          // Bottom-left, offset above the global "N" auth avatar (~50px
          // tall in the corner) and clear of the tutor-chat panel that
          // sits on the right edge of the homework page.
          position: 'fixed',
          left: 18,
          bottom: 78,
          zIndex: 99998,
          width: 44,
          height: 44,
          borderRadius: 999,
          background: active ? '#dc2626' : '#1f2937',
          color: '#fff',
          border: '2px solid rgba(255,255,255,0.85)',
          boxShadow: '0 6px 18px rgba(0,0,0,0.35)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        {active ? <X size={18} strokeWidth={2.4} /> : <Pen size={18} strokeWidth={2.4} />}
      </button>

      {active && (
        <>
          {/* Floating toolbar — sits above the canvas so its own clicks
              never get treated as strokes (separate fixed element). */}
          <div
            style={{
              position: 'fixed',
              left: '50%',
              top: 16,
              transform: 'translateX(-50%)',
              zIndex: 100000,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 8px',
              borderRadius: 12,
              background: 'rgba(20,18,12,0.92)',
              border: '1px solid rgba(255,255,255,0.18)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              color: '#fff',
            }}
          >
            <ToolPill
              active={tool === 'pen'}
              onClick={() => setTool('pen')}
              icon={<Pen size={13} strokeWidth={2.4} />}
              label="Pen"
            />
            <ToolPill
              active={tool === 'eraser'}
              onClick={() => setTool('eraser')}
              icon={<Eraser size={13} strokeWidth={2.4} />}
              label="Erase"
            />
            <ToolPill
              active={tool === 'eraser-stroke'}
              onClick={() => setTool('eraser-stroke')}
              icon={<Scissors size={13} strokeWidth={2.4} />}
              label="Stroke"
            />
            <span style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.2)', margin: '0 2px' }} />
            {PEN_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setColor(c);
                  setTool('pen');
                }}
                aria-label={`Color ${c}`}
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 999,
                  background: c,
                  border: c === color && tool === 'pen' ? '2px solid #fff' : '1px solid rgba(0,0,0,0.4)',
                  cursor: 'pointer',
                  padding: 0,
                }}
              />
            ))}
            <span style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.2)', margin: '0 2px' }} />
            <ToolPill
              onClick={undo}
              icon={<RotateCcw size={13} strokeWidth={2.4} />}
              label="Undo"
              disabled={!hasStrokes}
            />
            <ToolPill
              onClick={clear}
              icon={<Trash2 size={13} strokeWidth={2.4} />}
              label="Clear"
              disabled={!hasStrokes}
            />
          </div>

          {/* The transparent capture canvas */}
          <canvas
            ref={canvasRef}
            onPointerDown={begin}
            onPointerMove={extend}
            onPointerUp={end}
            onPointerCancel={end}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99999,
              touchAction: 'none',
              cursor:
                tool === 'eraser'
                  ? 'cell'
                  : tool === 'eraser-stroke'
                    ? 'not-allowed'
                    : 'crosshair',
              background: 'transparent',
            }}
          />
        </>
      )}
    </>
  );
}

// Distance from point p to segment a-b. Returns Infinity for a degenerate
// (zero-length) segment so callers can skip cleanly.
function distToSegment(p: Pt, a: Pt, b: Pt): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

// True when cursor `p` is within hit distance of any segment in stroke
// `s`. Pad by half the stroke width so chunkier strokes are easier to
// catch, and add a small constant so single-tap pen dots are clickable.
const HIT_PAD = 6;
function strokeHits(s: Stroke, p: Pt): boolean {
  const slop = HIT_PAD + s.width / 2;
  const pts = s.points;
  if (pts.length === 1) return Math.hypot(p.x - pts[0].x, p.y - pts[0].y) <= slop;
  for (let i = 0; i < pts.length - 1; i++) {
    if (distToSegment(p, pts[i], pts[i + 1]) <= slop) return true;
  }
  return false;
}

// One pass of Chaikin's corner-cutting algorithm. Each interior segment
// (p, q) becomes two new points at 25% and 75% along it, so every
// "corner" gets shaved into a pair of softer ones. We keep the first and
// last points pinned so the stroke still starts/ends where the user
// actually pressed and lifted. One pass is usually enough; two looks
// almost rubbery.
function chaikin(pts: Pt[]): Pt[] {
  if (pts.length < 3) return pts;
  const out: Pt[] = [pts[0]];
  for (let i = 0; i < pts.length - 1; i++) {
    const p = pts[i];
    const q = pts[i + 1];
    out.push({ x: 0.75 * p.x + 0.25 * q.x, y: 0.75 * p.y + 0.25 * q.y });
    out.push({ x: 0.25 * p.x + 0.75 * q.x, y: 0.25 * p.y + 0.75 * q.y });
  }
  out.push(pts[pts.length - 1]);
  return out;
}

function drawStroke(ctx: CanvasRenderingContext2D, s: Stroke) {
  const raw = s.points;
  if (raw.length === 0) return;
  ctx.save();
  if (s.tool === 'eraser') {
    // Use destination-out so the eraser cuts through any underlying
    // strokes rather than painting them over with a colour.
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = 'rgba(0,0,0,1)';
  } else {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = s.color;
  }
  ctx.lineWidth = s.width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Two Chaikin passes pre-smooth the polyline before we feed it to
  // Catmull-Rom — this kills any remaining high-frequency wiggle from
  // the trackpad without needing to drop more raw samples.
  const pts = chaikin(chaikin(raw));

  ctx.beginPath();
  if (pts.length < 2) {
    ctx.moveTo(pts[0].x, pts[0].y);
    ctx.lineTo(pts[0].x, pts[0].y);
  } else if (pts.length === 2) {
    ctx.moveTo(pts[0].x, pts[0].y);
    ctx.lineTo(pts[1].x, pts[1].y);
  } else {
    // Catmull-Rom → Bezier. Each segment from p1 to p2 gets two control
    // points derived from the surrounding four points (p0, p1, p2, p3),
    // producing a curve that passes exactly through every input point
    // with C1-continuous tangents at each junction. End-point tangents
    // clamp to the boundary by reusing p0/p_{n-1}.
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(i - 1, 0)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(i + 2, pts.length - 1)];
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
    }
  }
  ctx.stroke();
  ctx.restore();
}

function ToolPill({
  active,
  onClick,
  icon,
  label,
  disabled,
}: {
  active?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '5px 9px',
        borderRadius: 8,
        background: active ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)',
        color: '#fff',
        border: `1px solid ${active ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.12)'}`,
        fontSize: 11,
        fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
