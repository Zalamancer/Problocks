'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowDownLeft, ArrowDownRight, ArrowUpLeft, ArrowUpRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTile } from '@/store/tile-store';
import { useRoom } from '@/store/room-store';
import {
  ALL_CORNERS,
  getCrossBounds,
  getCrossCenterBounds,
  getLotBounds,
  type Corner,
  type TileBounds,
} from '@/lib/room-geometry';

/**
 * Visual overlay drawn on top of the TileView canvas, marking the room's
 * cross + 4 corner lots. Mounts inside TileView's positioned container as a
 * sibling of the canvas, with `pointer-events: none` so it never steals
 * input. Subscribes to the tile-store camera + tileSize and the room-store
 * room + viewMode, then renders one absolutely-positioned `<div>` per zone.
 *
 * Positioning math matches the TileView renderer's `screenToWorld`:
 *
 *   canvas.width = rect.width * dpr        (resize() in TileView.tsx)
 *   bufferX     = (worldX - cam.x) * cam.zoom + canvas.width / 2
 *   cssX        = bufferX / dpr
 *               = (worldX - cam.x) * (cam.zoom / dpr) + rect.width / 2
 *
 * So the only per-frame thing we need is `cam.zoom / dpr`, which we
 * recompute on every camera change. `dpr` is read once at mount; it can
 * change when the window moves between displays, but a remount on
 * window-resize is cheap enough to ignore that edge case for now.
 */
export function RoomZoneOverlay() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  const camera = useTile((s) => s.camera);
  const tileSize = useTile((s) => s.tileSize);
  const rooms = useRoom((s) => s.rooms);
  const currentRoomId = useRoom((s) => s.currentRoomId);
  const currentPlayerId = useRoom((s) => s.currentPlayerId);
  const viewMode = useRoom((s) => s.viewMode);

  // Track container size in CSS pixels so we know where the canvas center
  // is. The canvas is the previous sibling in TileView's tree and shares
  // its bounding box, so the parent we observe IS the canvas's parent.
  useEffect(() => {
    const el = containerRef.current?.parentElement;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      setSize({ w: rect.width, h: rect.height });
    });
    ro.observe(el);
    const rect = el.getBoundingClientRect();
    setSize({ w: rect.width, h: rect.height });
    return () => ro.disconnect();
  }, []);

  if (!currentRoomId || size.w === 0) return <div ref={containerRef} />;
  const room = rooms.find((r) => r.id === currentRoomId);
  if (!room) return <div ref={containerRef} />;

  // Match TileView's resize() — it caps DPR at 2 and falls back to 1 in
  // SSR / non-browser. Using window directly is fine here because the
  // component is 'use client'.
  const dpr = Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
  const scale = (camera.zoom * tileSize) / dpr;

  function tileToCss(x: number, y: number) {
    return {
      x: (x * tileSize - camera.x) * (camera.zoom / dpr) + size.w / 2,
      y: (y * tileSize - camera.y) * (camera.zoom / dpr) + size.h / 2,
    };
  }

  function rectStyle(b: TileBounds): React.CSSProperties {
    const tl = tileToCss(b.x0, b.y0);
    const br = tileToCss(b.x1, b.y1);
    return {
      position: 'absolute',
      left: tl.x,
      top: tl.y,
      width: br.x - tl.x,
      height: br.y - tl.y,
    };
  }

  // Player's own lot is highlighted brightly; other lots dim. Cross is
  // tinted with a third hue so all five regions are visually distinct
  // without being noisy when the user just wants to paint.
  const myCorner = ALL_CORNERS.find(
    (c) => room.lots[c].ownerId === currentPlayerId,
  );

  // Visibility rules:
  //   - viewMode 'room': show all 5 zones (overview).
  //   - viewMode 'lot': fade non-owner zones to barely-visible so the
  //     player focuses on their own square. The cross still shows because
  //     it borders the lot.
  //   - viewMode 'cross': flip — emphasize the cross, fade lots.
  //   - viewMode 'main-world': hide the room overlay entirely; the
  //     switcher is responsible for moving the camera to the main world.
  if (viewMode === 'main-world') return <div ref={containerRef} />;

  const lotEmphasis: Record<'mine' | 'theirs', { fill: string; border: string; label: string }> = {
    mine: {
      fill: 'rgba(120, 200, 120, 0.18)',
      border: 'rgba(40, 140, 60, 0.85)',
      label: 'rgba(40, 140, 60, 1)',
    },
    theirs: {
      fill: 'rgba(140, 140, 160, 0.10)',
      border: 'rgba(80, 80, 110, 0.55)',
      label: 'rgba(80, 80, 110, 1)',
    },
  };
  const crossPaint = {
    fill: 'rgba(220, 180, 90, 0.16)',
    border: 'rgba(170, 130, 50, 0.75)',
    label: 'rgba(170, 130, 50, 1)',
  };

  // Apply the focus dimming. We don't actually hide zones outside the
  // focused one — keeping them rendered (just faded) preserves spatial
  // context, which is the whole reason the overlay exists.
  function dim(opacity: number, base: { fill: string; border: string; label: string }) {
    return {
      ...base,
      fill: base.fill.replace(/[\d.]+\)$/, (m) => `${parseFloat(m) * opacity})`),
      border: base.border.replace(/[\d.]+\)$/, (m) => `${parseFloat(m) * opacity})`),
    };
  }

  const lotsAlpha = viewMode === 'cross' ? 0.35 : 1;
  const crossAlpha = viewMode === 'lot' ? 0.45 : 1;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      style={{ overflow: 'hidden' }}
    >
      {/* Cross — render before lots so the lot borders draw on top
          where they meet. The cross is two rectangles (horizontal arm +
          vertical arm); the centre square is drawn by both, which is
          fine because translucent fills additively shade it. */}
      <ZoneRect
        bounds={getCrossBounds(room.origin).horizontal}
        rectStyle={rectStyle}
        paint={dim(crossAlpha, crossPaint)}
        label="cross"
        scale={scale}
      />
      <ZoneRect
        bounds={getCrossBounds(room.origin).vertical}
        rectStyle={rectStyle}
        paint={dim(crossAlpha, crossPaint)}
        label="cross"
        scale={scale}
        labelHidden
      />
      {/* The 4 lot zones. */}
      {ALL_CORNERS.map((c) => {
        const isMine = c === myCorner;
        let paint = dim(
          isMine ? 1 : lotsAlpha * 0.7,
          lotEmphasis[isMine ? 'mine' : 'theirs'],
        );
        // In lot mode, drop neighbours even further so the player's own
        // square reads as "the active surface".
        if (viewMode === 'lot' && !isMine) paint = dim(0.4, paint);
        const b = getLotBounds(room.origin, c);
        return (
          <ZoneRect
            key={c}
            bounds={b}
            rectStyle={rectStyle}
            paint={paint}
            label={isMine ? `${c} (you)` : c}
            scale={scale}
          >
            <LotFacingArrow corner={c} colour={paint.label} />
          </ZoneRect>
        );
      })}

      {/* Centre dot of the cross — useful "you are here" anchor when the
          player zooms way out. The dot itself doesn't change with viewMode
          since its purpose is structural, not focus-driven. */}
      <CrossCentreMarker
        bounds={getCrossCenterBounds(room.origin)}
        rectStyle={rectStyle}
      />
    </div>
  );
}

interface ZonePaint {
  fill: string;
  border: string;
  label: string;
}

function ZoneRect({
  bounds, rectStyle, paint, label, scale, labelHidden, children,
}: {
  bounds: TileBounds;
  rectStyle: (b: TileBounds) => React.CSSProperties;
  paint: ZonePaint;
  label: string;
  scale: number;
  labelHidden?: boolean;
  children?: React.ReactNode;
}) {
  const style = rectStyle(bounds);
  return (
    <div
      style={{
        ...style,
        background: paint.fill,
        border: `1.5px dashed ${paint.border}`,
        borderRadius: 4,
        boxSizing: 'border-box',
      }}
    >
      {!labelHidden && (
        <span
          style={{
            position: 'absolute',
            // Drift labels in from the corner so they don't sit right on
            // the dashed border line.
            top: 6,
            left: 8,
            fontSize: Math.max(10, Math.min(14, scale * 4)),
            fontWeight: 800,
            letterSpacing: 0.4,
            textTransform: 'uppercase',
            color: paint.label,
            // Subtle paper backdrop so the label stays readable on top
            // of any painted texture beneath the overlay.
            background: 'rgba(255, 253, 240, 0.85)',
            padding: '2px 6px',
            borderRadius: 4,
            pointerEvents: 'none',
          }}
        >
          {label}
        </span>
      )}
      {children}
    </div>
  );
}

/**
 * Diagonal arrow placed in each lot's CROSS-FACING corner (the corner of
 * the lot rectangle nearest the cross centre), pointing toward the cross.
 * This is the visual "auto-rotate" hint — every player's lot has a
 * matching arrow, all pointing inward at the same social space, so it's
 * clear at a glance which way is "front" for each corner.
 */
function LotFacingArrow({ corner, colour }: { corner: Corner; colour: string }) {
  // Arrow icon + position correspond to the diagonal direction from the
  // lot's outer corner toward its inner (cross-facing) corner:
  //   NW lot → arrow at bottom-right pointing down-right.
  //   NE lot → arrow at bottom-left pointing down-left.
  //   SE lot → arrow at top-left pointing up-left.
  //   SW lot → arrow at top-right pointing up-right.
  const config: Record<Corner, { Icon: LucideIcon; pos: React.CSSProperties }> = {
    NW: { Icon: ArrowDownRight, pos: { right: 8, bottom: 8 } },
    NE: { Icon: ArrowDownLeft,  pos: { left: 8,  bottom: 8 } },
    SE: { Icon: ArrowUpLeft,    pos: { left: 8,  top: 8 } },
    SW: { Icon: ArrowUpRight,   pos: { right: 8, top: 8 } },
  };
  const { Icon, pos } = config[corner];
  return (
    <div
      style={{
        position: 'absolute',
        ...pos,
        width: 22,
        height: 22,
        borderRadius: 6,
        background: 'rgba(255, 253, 240, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: colour,
        pointerEvents: 'none',
      }}
      title="Faces the cross — your lot's local 'front'"
    >
      <Icon size={14} strokeWidth={2.4} />
    </div>
  );
}

function CrossCentreMarker({
  bounds, rectStyle,
}: {
  bounds: TileBounds;
  rectStyle: (b: TileBounds) => React.CSSProperties;
}) {
  const style = rectStyle(bounds);
  return (
    <div
      style={{
        ...style,
        // 1.5 px ring around the cross centre, no fill. Marks the focal
        // point of the room without obscuring whatever is painted there.
        border: '1.5px solid rgba(170, 130, 50, 0.95)',
        borderRadius: 6,
        boxSizing: 'border-box',
        pointerEvents: 'none',
      }}
    />
  );
}
