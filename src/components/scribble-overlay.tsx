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
import { Eraser, Pen, RotateCcw, Trash2, X } from 'lucide-react';

type Tool = 'pen' | 'eraser';
type Pt = { x: number; y: number };
interface Stroke {
  tool: Tool;
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

  const begin = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!active) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.setPointerCapture(e.pointerId);
      drawingRef.current = true;
      activeStrokeRef.current = {
        tool,
        color,
        width: tool === 'eraser' ? ERASER_WIDTH : PEN_WIDTH,
        points: [pointAt(e)],
      };
      paint();
    },
    [active, color, tool, paint],
  );

  const extend = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!drawingRef.current) return;
      const s = activeStrokeRef.current;
      if (!s) return;
      s.points.push(pointAt(e));
      paint();
    },
    [paint],
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
              label="Eraser"
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
              cursor: tool === 'eraser' ? 'cell' : 'crosshair',
              background: 'transparent',
            }}
          />
        </>
      )}
    </>
  );
}

function drawStroke(ctx: CanvasRenderingContext2D, s: Stroke) {
  if (s.points.length === 0) return;
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
  ctx.beginPath();
  const [first, ...rest] = s.points;
  ctx.moveTo(first.x, first.y);
  for (const p of rest) ctx.lineTo(p.x, p.y);
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
