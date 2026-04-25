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
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ChevronDown, Eraser, Pen, RotateCcw, Scissors, Trash2, X } from 'lucide-react';

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
  // Number of Chaikin smoothing passes baked into this stroke when it
  // was drawn. Stored per-stroke so old strokes don't morph if the user
  // changes the slider mid-session.
  smoothing: number;
  points: Pt[];
}

// Miro-ish drawing palette. 8 colors in a single row covers the common
// markup needs (red/orange/yellow/green/blue/purple/pink/black) without
// overwhelming the popover.
const PEN_COLORS = [
  '#1f2937', // black
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
];
// Five preset sizes shown as actual dots in the popover, smallest →
// largest. No slider — Miro uses this dot grid for its drawing tool too.
const SIZE_PRESETS = [2, 4, 6, 10, 16] as const;
const DEFAULT_PEN_WIDTH = SIZE_PRESETS[1];
// Discrete smoothing levels; matches the segmented button group below.
const SMOOTHING_LEVELS = [0, 2, 3] as const;
const SMOOTHING_LABELS = ['Off', 'Smooth', 'Smoother'] as const;
const DEFAULT_SMOOTHING: number = SMOOTHING_LEVELS[1];
const SMOOTHING_MAX = 3;
// Bigger eraser so the user can wipe annotations quickly without precision.
const ERASER_WIDTH = 28;

export function ScribbleOverlay() {
  const [active, setActive] = useState(false);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState(PEN_COLORS[0]);
  const [penWidth, setPenWidth] = useState(DEFAULT_PEN_WIDTH);
  const [smoothing, setSmoothing] = useState(DEFAULT_SMOOTHING);
  // True when the small pen-settings popover (size + smoothing) is open.
  const [penPopover, setPenPopover] = useState(false);
  const [, repaintToolbar] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const activeStrokeRef = useRef<Stroke | null>(null);
  const drawingRef = useRef(false);
  const dprRef = useRef(1);
  const sizeRef = useRef({ w: 0, h: 0 });
  // Brush-size preview ring that follows the cursor. Updated via direct
  // DOM mutation so we don't re-render the whole overlay on every
  // pointermove. Hidden when the cursor leaves the canvas.
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const moveCursor = useCallback((x: number, y: number) => {
    const el = cursorRef.current;
    if (!el) return;
    el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    el.style.opacity = '1';
  }, []);
  const hideCursor = useCallback(() => {
    const el = cursorRef.current;
    if (el) el.style.opacity = '0';
  }, []);

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
      moveCursor(p.x, p.y);
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
        width: tool === 'eraser' ? ERASER_WIDTH : penWidth,
        // Eraser doesn't need smoothing — straight cuts are usually
        // what the user wants. Pen uses the slider value.
        smoothing: tool === 'eraser' ? 0 : smoothing,
        points: [p],
      };
      paint();
    },
    [active, color, tool, penWidth, smoothing, paint, eraseStrokeAt, moveCursor],
  );

  const extend = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      // Track the cursor for the brush-size preview ring whether or not
      // a stroke is in progress. This means the ring follows the user
      // around the page, not just while they're drawing.
      moveCursor(e.clientX, e.clientY);
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
    [tool, eraseStrokeAt, paint, moveCursor],
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
          width: 48,
          height: 48,
          borderRadius: 999,
          background: active ? '#1a1a1a' : '#fff',
          color: active ? '#fff' : '#1a1a1a',
          border: active ? '0' : '1px solid rgba(0,0,0,0.08)',
          boxShadow: active
            ? '0 8px 22px rgba(0,0,0,0.32)'
            : '0 4px 14px rgba(0,0,0,0.18)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
      >
        {active ? <X size={20} strokeWidth={2.2} /> : <Pen size={18} strokeWidth={2.2} />}
      </button>

      {active && (
        <>
          {/* Miro-style floating tool bar. Light card with soft shadow,
              icon-only square buttons, subtle dividers between groups.
              Sits above the canvas so its own clicks never get treated
              as strokes (separate fixed element). */}
          <div
            style={{
              position: 'fixed',
              left: '50%',
              top: 16,
              transform: 'translateX(-50%)',
              zIndex: 100000,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: 6,
              borderRadius: 14,
              background: '#ffffff',
              border: '1px solid rgba(0,0,0,0.06)',
              boxShadow: '0 12px 32px rgba(15,23,42,0.18), 0 2px 6px rgba(15,23,42,0.08)',
              color: '#0f172a',
            }}
          >
            <ToolButton
              active={tool === 'pen'}
              // Click while pen is already active → toggle the size +
              // smoothing popover. Otherwise → activate the pen and
              // close the popover.
              onClick={() => {
                if (tool === 'pen') setPenPopover((v) => !v);
                else {
                  setTool('pen');
                  setPenPopover(false);
                }
              }}
              title="Pen"
              icon={<Pen size={16} strokeWidth={2} />}
              swatch={tool === 'pen' ? color : undefined}
              chevron={tool === 'pen' ? penPopover : undefined}
            />
            <ToolButton
              active={tool === 'eraser'}
              onClick={() => {
                setTool('eraser');
                setPenPopover(false);
              }}
              title="Eraser"
              icon={<Eraser size={16} strokeWidth={2} />}
            />
            <ToolButton
              active={tool === 'eraser-stroke'}
              onClick={() => {
                setTool('eraser-stroke');
                setPenPopover(false);
              }}
              title="Stroke eraser"
              icon={<Scissors size={16} strokeWidth={2} />}
            />
            <Divider />
            <ToolButton
              onClick={undo}
              disabled={!hasStrokes}
              title="Undo last stroke"
              icon={<RotateCcw size={16} strokeWidth={2} />}
            />
            <ToolButton
              onClick={clear}
              disabled={!hasStrokes}
              title="Clear all"
              icon={<Trash2 size={16} strokeWidth={2} />}
            />
          </div>

          {tool === 'pen' && penPopover && (
            <PenSettingsPopover
              color={color}
              onColor={setColor}
              width={penWidth}
              onWidth={setPenWidth}
              smoothing={smoothing}
              onSmoothing={setSmoothing}
              onClose={() => setPenPopover(false)}
            />
          )}

          {/* The transparent capture canvas */}
          <canvas
            ref={canvasRef}
            onPointerDown={begin}
            onPointerMove={extend}
            onPointerUp={end}
            onPointerCancel={end}
            onPointerEnter={(e) => moveCursor(e.clientX, e.clientY)}
            onPointerLeave={hideCursor}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99999,
              touchAction: 'none',
              // Hide the system cursor in pen / pixel-eraser mode — the
              // brush ring takes its place. Keep a 'not-allowed' system
              // cursor for the stroke eraser since it has no size.
              cursor: tool === 'eraser-stroke' ? 'not-allowed' : 'none',
              background: 'transparent',
            }}
          />

          {/* Brush-size preview ring. Filled with the pen's own color
              for the pen, hollow with a darker outline for the pixel
              eraser, hidden entirely for the stroke eraser (which has
              no meaningful "size"). Position is updated via direct DOM
              transform on every pointermove so we don't trigger React
              re-renders 60× per second. */}
          {tool !== 'eraser-stroke' && (
            <BrushPreview
              ref={cursorRef}
              tool={tool}
              color={color}
              size={tool === 'eraser' ? ERASER_WIDTH : penWidth}
            />
          )}
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

  // Apply Chaikin pre-smoothing the number of times the stroke baked in
  // when it was drawn. 0 = raw polyline; 1–3 progressively softer.
  let pts = raw;
  const passes = Math.max(0, Math.min(SMOOTHING_MAX, s.smoothing));
  for (let i = 0; i < passes; i++) pts = chaikin(pts);

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

const BrushPreview = (function makeBrushPreview() {
  const Inner = (
    {
      tool,
      color,
      size,
    }: {
      tool: 'pen' | 'eraser';
      color: string;
      size: number;
    },
    ref: React.Ref<HTMLDivElement>,
  ) => {
    // Eraser shows a thin grey outlined ring (the patch that gets
    // wiped); pen shows a filled disc tinted by the current ink color.
    // A 1 px shadow halo keeps both readable against any page color.
    const isEraser = tool === 'eraser';
    return (
      <div
        ref={ref}
        aria-hidden
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          // Initial transform places it off-screen until the first
          // pointermove sets a real translate. opacity:0 hides it.
          transform: 'translate(-100px, -100px) translate(-50%, -50%)',
          width: Math.max(4, size),
          height: Math.max(4, size),
          borderRadius: 999,
          background: isEraser ? 'rgba(255,255,255,0.85)' : color,
          border: isEraser
            ? '1.5px solid rgba(15,23,42,0.55)'
            : '1px solid rgba(15,23,42,0.35)',
          // Tiny outer halo so the ring stays visible on any page
          // background color — light or dark.
          boxShadow:
            '0 0 0 1px rgba(255,255,255,0.65), 0 1px 3px rgba(15,23,42,0.25)',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: 100002,
          transition: 'width 80ms ease, height 80ms ease, background 80ms ease',
        }}
      />
    );
  };
  Inner.displayName = 'BrushPreview';
  return forwardRef(Inner);
})();

// Single icon-only square button used for every slot in the floating
// toolbar. White background, dark icon, soft hover lift, accent-blue
// active state — Miro's drawing palette uses the same vocabulary.
function ToolButton({
  active,
  onClick,
  icon,
  title,
  disabled,
  swatch,
  chevron,
}: {
  active?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  disabled?: boolean;
  // When set, paints a small color dot at the bottom-right of the
  // button. Used on the active Pen so the current pen color is visible
  // without opening the popover.
  swatch?: string;
  // When defined, renders a chevron next to the icon. `true` means the
  // popover is open (chevron points up).
  chevron?: boolean;
}) {
  const accent = '#1971ff'; // Miro-ish action blue
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={!!active}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        width: chevron !== undefined ? 44 : 36,
        height: 36,
        borderRadius: 8,
        background: active ? 'rgba(25,113,255,0.10)' : 'transparent',
        color: active ? accent : '#0f172a',
        border: 0,
        padding: 0,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.35 : 1,
        transition: 'background 0.12s, color 0.12s',
      }}
      onMouseEnter={(e) => {
        if (disabled || active) return;
        (e.currentTarget as HTMLButtonElement).style.background =
          'rgba(15,23,42,0.06)';
      }}
      onMouseLeave={(e) => {
        if (active) return;
        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
      }}
    >
      {icon}
      {chevron !== undefined && (
        <ChevronDown
          size={11}
          strokeWidth={2}
          style={{
            transform: chevron ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.15s',
            opacity: 0.6,
          }}
        />
      )}
      {swatch && (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            right: 4,
            bottom: 4,
            width: 8,
            height: 8,
            borderRadius: 999,
            background: swatch,
            boxShadow: '0 0 0 1.5px #fff',
          }}
        />
      )}
    </button>
  );
}

function Divider() {
  return (
    <span
      style={{
        width: 1,
        height: 20,
        background: 'rgba(15,23,42,0.10)',
        margin: '0 4px',
      }}
    />
  );
}

function PenSettingsPopover({
  color,
  onColor,
  width,
  onWidth,
  smoothing,
  onSmoothing,
  onClose,
}: {
  color: string;
  onColor: (c: string) => void;
  width: number;
  onWidth: (n: number) => void;
  smoothing: number;
  onSmoothing: (n: number) => void;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: 'fixed',
        left: '50%',
        top: 68,
        transform: 'translateX(-50%)',
        zIndex: 100001,
        width: 296,
        padding: 16,
        borderRadius: 16,
        background: '#ffffff',
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 16px 40px rgba(15,23,42,0.18), 0 2px 6px rgba(15,23,42,0.06)',
        color: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.04em',
            color: '#0f172a',
          }}
        >
          Pen
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close pen settings"
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            background: 'transparent',
            border: 0,
            color: 'rgba(15,23,42,0.5)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={13} strokeWidth={2.2} />
        </button>
      </div>

      <Section label="Color">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {PEN_COLORS.map((c) => {
            const selected = c === color;
            return (
              <button
                key={c}
                type="button"
                onClick={() => onColor(c)}
                title={c}
                aria-label={`Color ${c}`}
                aria-pressed={selected}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 999,
                  background: c,
                  border: selected ? '2.5px solid #1971ff' : '1.5px solid rgba(15,23,42,0.12)',
                  // Tiny inset white halo on the selected swatch lifts
                  // it above the row. Miro uses the same pattern.
                  boxShadow: selected
                    ? 'inset 0 0 0 2px #fff'
                    : 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'box-shadow 0.12s, border-color 0.12s',
                }}
              />
            );
          })}
        </div>
      </Section>

      <Section label="Size">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {SIZE_PRESETS.map((px) => {
            const selected = px === width;
            return (
              <button
                key={px}
                type="button"
                onClick={() => onWidth(px)}
                title={`${px} px`}
                aria-label={`${px} px`}
                aria-pressed={selected}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: selected ? 'rgba(25,113,255,0.10)' : 'transparent',
                  border: selected ? '1.5px solid #1971ff' : '1.5px solid transparent',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'background 0.12s, border-color 0.12s',
                }}
              >
                <span
                  aria-hidden
                  style={{
                    width: px,
                    height: px,
                    borderRadius: 999,
                    background: color,
                  }}
                />
              </button>
            );
          })}
        </div>
      </Section>

      <Section label="Smoothing">
        <div
          style={{
            display: 'flex',
            background: 'rgba(15,23,42,0.05)',
            borderRadius: 8,
            padding: 3,
          }}
        >
          {SMOOTHING_LEVELS.map((lvl, i) => {
            const selected = lvl === smoothing;
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => onSmoothing(lvl)}
                style={{
                  flex: 1,
                  padding: '7px 0',
                  borderRadius: 6,
                  background: selected ? '#fff' : 'transparent',
                  color: selected ? '#0f172a' : 'rgba(15,23,42,0.6)',
                  border: 0,
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: selected ? '0 1px 3px rgba(15,23,42,0.12)' : 'none',
                  transition: 'background 0.12s, color 0.12s',
                }}
              >
                {SMOOTHING_LABELS[i]}
              </button>
            );
          })}
        </div>
      </Section>
    </div>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span
        style={{
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'rgba(15,23,42,0.5)',
        }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}
