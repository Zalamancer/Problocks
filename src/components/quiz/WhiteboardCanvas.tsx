'use client';

// A minimal, self-contained drawing surface for whiteboard answers.
// Pen + eraser + color + undo + clear, with HiDPI canvas backing.
// Exposes an imperative `getPngBlob()` via ref so the parent can grab a
// PNG when the student hits Submit, without re-rendering on every stroke.

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Eraser, Pen, RotateCcw, Trash2 } from 'lucide-react';

export interface WhiteboardHandle {
  /** Capture the current canvas as a PNG Blob. */
  getPngBlob(): Promise<Blob | null>;
  /** True if at least one stroke has been drawn since clear. */
  hasContent(): boolean;
  /** Clear the canvas. */
  clear(): void;
}

type Tool = 'pen' | 'eraser';
type Pt = { x: number; y: number };

interface Stroke {
  tool: Tool;
  color: string;
  width: number;
  points: Pt[];
}

interface Props {
  width?: number;
  height?: number;
  /** Background color of the canvas (also the eraser color). */
  background?: string;
  /** Initial pen color. */
  defaultColor?: string;
  disabled?: boolean;
  /** Toolbar palette. 'dark' suits play/quiz (dark page), 'light' suits
   *  homework / cream pages. Default: 'dark'. */
  theme?: 'dark' | 'light';
}

const DEFAULT_BG = '#ffffff';
const PEN_COLORS = ['#1f2937', '#dc2626', '#2563eb', '#16a34a', '#ca8a04'];
const PEN_WIDTH = 3;
const ERASER_WIDTH = 24;

const TOOLBAR_THEMES = {
  dark: {
    bg: 'rgba(255,255,255,0.04)',
    border: 'rgba(255,255,255,0.1)',
    chipBg: 'rgba(255,255,255,0.06)',
    chipBgActive: 'rgba(255,255,255,0.18)',
    chipBorder: 'rgba(255,255,255,0.1)',
    chipBorderActive: 'rgba(255,255,255,0.4)',
    text: '#fff',
    divider: 'rgba(255,255,255,0.16)',
    canvasBorder: 'rgba(255,255,255,0.18)',
    activeRing: '#fff',
  },
  light: {
    bg: 'rgba(0,0,0,0.04)',
    border: 'rgba(0,0,0,0.12)',
    chipBg: 'rgba(255,255,255,0.7)',
    chipBgActive: 'var(--pb-butter, #ffd84d)',
    chipBorder: 'rgba(0,0,0,0.15)',
    chipBorderActive: 'var(--pb-butter-ink, #6b4f00)',
    text: 'var(--pb-ink, #1d1a14)',
    divider: 'rgba(0,0,0,0.14)',
    canvasBorder: 'var(--pb-line-2, #d6c896)',
    activeRing: 'var(--pb-ink, #1d1a14)',
  },
} as const;

export const WhiteboardCanvas = forwardRef<WhiteboardHandle, Props>(
  function WhiteboardCanvas(
    {
      width = 320,
      height = 360,
      background = DEFAULT_BG,
      defaultColor = PEN_COLORS[0],
      disabled = false,
      theme = 'dark',
    },
    ref,
  ) {
    const t = TOOLBAR_THEMES[theme];
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const strokesRef = useRef<Stroke[]>([]);
    const activeRef = useRef<Stroke | null>(null);
    const drawingRef = useRef(false);
    const dprRef = useRef(1);

    const [tool, setTool] = useState<Tool>('pen');
    const [color, setColor] = useState(defaultColor);
    // Cheap "I should re-render the toolbar after a change" counter.
    const [, bump] = useState(0);
    const repaintToolbar = useCallback(() => bump((n) => n + 1), []);

    // ---- canvas setup + repaint ----
    const resize = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      dprRef.current = dpr;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      paintAll();
    }, [width, height]);

    const paintAll = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const dpr = dprRef.current;
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, width, height);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (const s of strokesRef.current) {
        paintStroke(ctx, s, background);
      }
      const active = activeRef.current;
      if (active) paintStroke(ctx, active, background);
      ctx.restore();
    }, [background, width, height]);

    useEffect(() => {
      resize();
    }, [resize]);

    // ---- pointer handling ----
    const pointerPos = useCallback((e: PointerEvent | React.PointerEvent): Pt => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }, []);

    const beginStroke = useCallback(
      (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (disabled) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.setPointerCapture(e.pointerId);
        drawingRef.current = true;
        const point = pointerPos(e);
        const stroke: Stroke = {
          tool,
          color: tool === 'eraser' ? background : color,
          width: tool === 'eraser' ? ERASER_WIDTH : PEN_WIDTH,
          points: [point],
        };
        activeRef.current = stroke;
        paintAll();
      },
      [disabled, tool, color, background, pointerPos, paintAll],
    );

    const extendStroke = useCallback(
      (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!drawingRef.current) return;
        const active = activeRef.current;
        if (!active) return;
        active.points.push(pointerPos(e));
        paintAll();
      },
      [pointerPos, paintAll],
    );

    const endStroke = useCallback(
      (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!drawingRef.current) return;
        const canvas = canvasRef.current;
        if (canvas) canvas.releasePointerCapture(e.pointerId);
        drawingRef.current = false;
        const active = activeRef.current;
        if (active && active.points.length > 0) {
          // Single-tap → pad with a duplicate so a dot still renders.
          if (active.points.length === 1) {
            active.points.push({ ...active.points[0] });
          }
          strokesRef.current.push(active);
        }
        activeRef.current = null;
        paintAll();
        repaintToolbar();
      },
      [paintAll, repaintToolbar],
    );

    // ---- toolbar actions ----
    const undo = useCallback(() => {
      strokesRef.current.pop();
      paintAll();
      repaintToolbar();
    }, [paintAll, repaintToolbar]);

    const clear = useCallback(() => {
      strokesRef.current = [];
      activeRef.current = null;
      paintAll();
      repaintToolbar();
    }, [paintAll, repaintToolbar]);

    // ---- imperative handle ----
    useImperativeHandle(
      ref,
      () => ({
        getPngBlob: async () => {
          const canvas = canvasRef.current;
          if (!canvas) return null;
          // Final paint to ensure the off-DOM bitmap is up to date before
          // we serialize.
          paintAll();
          return await new Promise<Blob | null>((resolve) =>
            canvas.toBlob((b) => resolve(b), 'image/png'),
          );
        },
        hasContent: () => strokesRef.current.length > 0,
        clear,
      }),
      [clear, paintAll],
    );

    const hasStrokes = strokesRef.current.length > 0;
    const colorSwatches = useMemo(() => PEN_COLORS, []);

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          alignItems: 'stretch',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            flexWrap: 'wrap',
            padding: '6px 8px',
            background: t.bg,
            border: `1px solid ${t.border}`,
            borderRadius: 10,
          }}
        >
          <ToolButton
            active={tool === 'pen'}
            onClick={() => setTool('pen')}
            label="Pen"
            icon={<Pen size={13} strokeWidth={2.4} />}
            disabled={disabled}
            palette={t}
          />
          <ToolButton
            active={tool === 'eraser'}
            onClick={() => setTool('eraser')}
            label="Eraser"
            icon={<Eraser size={13} strokeWidth={2.4} />}
            disabled={disabled}
            palette={t}
          />
          <span
            style={{
              width: 1,
              height: 18,
              background: t.divider,
              margin: '0 2px',
            }}
          />
          {colorSwatches.map((c) => (
            <button
              key={c}
              type="button"
              disabled={disabled}
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
                border:
                  c === color && tool === 'pen'
                    ? `2px solid ${t.activeRing}`
                    : '1px solid rgba(0,0,0,0.3)',
                cursor: disabled ? 'default' : 'pointer',
                padding: 0,
              }}
            />
          ))}
          <span style={{ flex: 1 }} />
          <ToolButton
            onClick={undo}
            label="Undo"
            icon={<RotateCcw size={13} strokeWidth={2.4} />}
            disabled={disabled || !hasStrokes}
            palette={t}
          />
          <ToolButton
            onClick={clear}
            label="Clear"
            icon={<Trash2 size={13} strokeWidth={2.4} />}
            disabled={disabled || !hasStrokes}
            palette={t}
          />
        </div>

        <div
          style={{
            background: '#fff',
            border: `1.5px solid ${t.canvasBorder}`,
            borderRadius: 14,
            overflow: 'hidden',
            alignSelf: 'center',
            touchAction: 'none',
          }}
        >
          <canvas
            ref={canvasRef}
            onPointerDown={beginStroke}
            onPointerMove={extendStroke}
            onPointerUp={endStroke}
            onPointerCancel={endStroke}
            style={{
              display: 'block',
              cursor: disabled
                ? 'not-allowed'
                : tool === 'eraser'
                  ? 'cell'
                  : 'crosshair',
              touchAction: 'none',
            }}
          />
        </div>
      </div>
    );
  },
);

function paintStroke(
  ctx: CanvasRenderingContext2D,
  s: Stroke,
  background: string,
) {
  if (s.points.length === 0) return;
  ctx.save();
  ctx.strokeStyle = s.tool === 'eraser' ? background : s.color;
  ctx.lineWidth = s.width;
  ctx.beginPath();
  const [first, ...rest] = s.points;
  ctx.moveTo(first.x, first.y);
  for (const p of rest) ctx.lineTo(p.x, p.y);
  ctx.stroke();
  ctx.restore();
}

function ToolButton({
  active,
  onClick,
  icon,
  label,
  disabled,
  palette,
}: {
  active?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
  palette: (typeof TOOLBAR_THEMES)[keyof typeof TOOLBAR_THEMES];
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
        background: active ? palette.chipBgActive : palette.chipBg,
        color: palette.text,
        border: `1px solid ${active ? palette.chipBorderActive : palette.chipBorder}`,
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
