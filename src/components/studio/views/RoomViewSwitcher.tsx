'use client';

import { useEffect } from 'react';
import { Home, Compass, Map as MapIcon, Globe2, Wifi, WifiOff, Shuffle } from 'lucide-react';
import { useTile } from '@/store/tile-store';
import { useRoom, type RoomViewMode } from '@/store/room-store';
import {
  ALL_CORNERS,
  getCrossCenterBounds,
  getLotBounds,
  getRoomBounds,
  type Corner,
  type TileBounds,
} from '@/lib/room-geometry';

/**
 * Pill-bar switcher mounted at the top of the TileView canvas. Lets the
 * player jump between the four canvas focuses we care about for room
 * mode:
 *
 *   • Whole room — zoom out, see all 4 lots + cross at once.
 *   • My lot    — zoom into the player's owned corner.
 *   • Cross     — zoom into the shared cross centre.
 *   • Main world — pan to the procedural world canvas.
 *
 * On mount, we lazily ensure the local player owns a lot in some room
 * (the room-store auto-creates room 0 if needed). After that, the four
 * buttons re-frame the camera by setting `cam.x`, `cam.y`, and `cam.zoom`
 * directly on the tile-store.
 *
 * Why we set zoom directly: the existing wheel-zoom on the canvas would
 * normally be the user's primary control, but jumping between rooms /
 * lots needs a one-click "fit to view" — and the canvas doesn't expose a
 * frameBounds() API, so we compute a target zoom here.
 *
 * Container-size estimate: we don't have a direct handle on the canvas's
 * layout box, so we approximate using `window.innerWidth / innerHeight`
 * minus the left + right panel widths the studio shell uses (≈ 280 each).
 * That's "good enough" — the user can wheel-zoom from any framing.
 */

const PANEL_WIDTH_PX = 280;

interface ViewBtn {
  id: RoomViewMode;
  label: string;
  Icon: typeof Home;
  hint: string;
}

const BUTTONS: ViewBtn[] = [
  { id: 'room',       label: 'Room',     Icon: MapIcon,  hint: 'See the whole 128×128 room (cross + 4 lots)' },
  { id: 'lot',        label: 'My lot',   Icon: Home,     hint: "Zoom into your corner — the only square you can edit" },
  { id: 'cross',      label: 'Cross',    Icon: Compass,  hint: 'Zoom into the shared cross centre' },
  { id: 'main-world', label: 'World',    Icon: Globe2,   hint: 'Pan to the shared procedural world' },
];

export function RoomViewSwitcher() {
  const setCamera = useTile((s) => s.setCamera);
  const tileSize = useTile((s) => s.tileSize);
  const rooms = useRoom((s) => s.rooms);
  const currentRoomId = useRoom((s) => s.currentRoomId);
  const currentPlayerId = useRoom((s) => s.currentPlayerId);
  const viewMode = useRoom((s) => s.viewMode);
  const setViewMode = useRoom((s) => s.setViewMode);
  const ensureLocalPlayerHasLot = useRoom((s) => s.ensureLocalPlayerHasLot);
  const mainWorld = useRoom((s) => s.mainWorld);
  const realtimeLive = useRoom((s) => s.realtimeLive);
  const generateMainWorld = useRoom((s) => s.generateMainWorld);
  const regenerateMainWorld = useRoom((s) => s.regenerateMainWorld);

  // First mount: spawn room 0 + assign the local player to NW (or first
  // vacant corner) if not already done. Idempotent — safe across reloads
  // because room-store is persisted.
  useEffect(() => {
    ensureLocalPlayerHasLot();
  }, [ensureLocalPlayerHasLot]);

  const room = rooms.find((r) => r.id === currentRoomId);
  const myCorner: Corner | null = room
    ? ALL_CORNERS.find((c) => room.lots[c].ownerId === currentPlayerId) ?? null
    : null;

  function frame(b: TileBounds) {
    // Centre on the world-pixel midpoint of the bounds.
    const cx = ((b.x0 + b.x1) / 2) * tileSize;
    const cy = ((b.y0 + b.y1) / 2) * tileSize;

    // Available canvas size in CSS pixels. Studio reserves ~280px on each
    // side for left + right panels; the canvas takes the remainder. Cap
    // the floor so we never compute a degenerate zoom on a minimised
    // window.
    const wCss = Math.max(360, (typeof window !== 'undefined' ? window.innerWidth : 1280) - PANEL_WIDTH_PX * 2);
    const hCss = Math.max(280, (typeof window !== 'undefined' ? window.innerHeight : 800) - 120);
    const dpr = Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);

    // The renderer multiplies world pixels by `cam.zoom` to get device
    // pixels, then divides by dpr for the CSS pixel size on screen. We
    // want the bounds-in-CSS-pixels to fit with ~10% margin, so:
    //   wCss * 0.9 ≈ (b.x1 - b.x0) * tileSize * (cam.zoom / dpr)
    //   cam.zoom = (wCss * 0.9 * dpr) / ((b.x1 - b.x0) * tileSize)
    const widthPx = (b.x1 - b.x0) * tileSize;
    const heightPx = (b.y1 - b.y0) * tileSize;
    const zoomX = (wCss * 0.9 * dpr) / Math.max(1, widthPx);
    const zoomY = (hCss * 0.9 * dpr) / Math.max(1, heightPx);
    const zoom = Math.max(0.05, Math.min(8, Math.min(zoomX, zoomY)));
    setCamera({ x: cx, y: cy, zoom });
  }

  function pick(mode: RoomViewMode) {
    setViewMode(mode);
    if (!room) return; // edge case while ensureLocalPlayerHasLot is still settling
    switch (mode) {
      case 'room':
        frame(getRoomBounds(room.origin));
        return;
      case 'lot': {
        const corner = myCorner ?? 'NW';
        frame(getLotBounds(room.origin, corner));
        return;
      }
      case 'cross':
        // Frame the centre square, not the full + arms — the centre is
        // where the social activity happens; the arms stay in peripheral
        // vision at this zoom.
        frame(getCrossCenterBounds(room.origin));
        return;
      case 'main-world': {
        // First-time switch to the main world triggers the procedural
        // pass — cheap if no tilesets exist (early-return), otherwise
        // fills the outer band around the default zone with biome
        // terrain. Idempotent: subsequent switches no-op.
        generateMainWorld();
        // Frame the procedurally-filled square (4× the default zone).
        // The starter zone sits at its centre; the outer band carries
        // the procedural noise.
        const o = mainWorld.origin;
        const s = mainWorld.defaultZoneSize;
        const span = s * 4;
        frame({
          x0: o.x - Math.floor(span / 2) + Math.floor(s / 2),
          y0: o.y - Math.floor(span / 2) + Math.floor(s / 2),
          x1: o.x + Math.ceil(span / 2) + Math.floor(s / 2),
          y1: o.y + Math.ceil(span / 2) + Math.floor(s / 2),
        });
        return;
      }
    }
  }

  return (
    <div
      className="absolute top-3 z-10 flex items-center gap-1 p-1.5"
      // Right-anchor so we don't overlap the existing tool toolbar that
      // hugs `top-3 left-3`. 12px gap from the right edge mirrors the
      // toolbar's left inset.
      style={{
        right: 12,
        background: 'var(--pb-paper)',
        border: '1.5px solid var(--pb-ink)',
        borderRadius: 12,
        boxShadow: '0 3px 0 var(--pb-ink)',
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Live-status pill — green wifi when joined to the realtime
          channel, grey wifi-off when offline (no Supabase configured,
          or still connecting). Sits inline with the view buttons so the
          player sees at a glance whether other players' edits will
          arrive. */}
      <div
        title={realtimeLive
          ? 'Connected — other players in this room see your edits live.'
          : 'Offline — single-player mode. Edits stay on this device.'}
        style={{
          height: 30,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '0 8px',
          borderRadius: 8,
          background: realtimeLive ? 'var(--pb-mint, #d4f3d4)' : 'var(--pb-paper)',
          color: realtimeLive ? 'var(--pb-mint-ink, #2f7a39)' : 'var(--pb-ink-muted)',
          border: `1.5px solid ${realtimeLive ? 'var(--pb-mint-ink, #2f7a39)' : 'var(--pb-line-2)'}`,
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: 0.4,
          textTransform: 'uppercase',
        }}
      >
        {realtimeLive ? <Wifi size={11} strokeWidth={2.4} /> : <WifiOff size={11} strokeWidth={2.4} />}
        {realtimeLive ? 'Live' : 'Solo'}
      </div>
      <div style={{ width: 1.5, height: 18, background: 'var(--pb-line-2)', margin: '0 2px' }} />
      {BUTTONS.map((btn) => {
        const active = viewMode === btn.id;
        // "main-world" stays enabled in Ship 1 — it just pans to an empty
        // region today; Ship 4 fills it with biomes. "My lot" greys out
        // when the player has no lot yet (e.g. all rooms full while we
        // wait for `ensureLocalPlayerHasLot` to assign one).
        const disabled = btn.id === 'lot' && !myCorner;
        return (
          <button
            key={btn.id}
            type="button"
            title={btn.hint}
            disabled={disabled}
            onClick={() => pick(btn.id)}
            className="flex items-center gap-1.5 transition-colors"
            style={{
              height: 30,
              padding: '0 10px',
              borderRadius: 8,
              background: active ? 'var(--pb-butter)' : 'var(--pb-paper)',
              color: disabled
                ? 'var(--pb-ink-muted)'
                : active
                ? 'var(--pb-butter-ink)'
                : 'var(--pb-ink-soft)',
              border: `1.5px solid ${active ? 'var(--pb-butter-ink)' : 'var(--pb-line-2)'}`,
              boxShadow: active ? '0 1.5px 0 var(--pb-butter-ink)' : 'none',
              cursor: disabled ? 'not-allowed' : 'pointer',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 0.4,
              textTransform: 'uppercase',
              opacity: disabled ? 0.5 : 1,
            }}
          >
            <btn.Icon size={13} strokeWidth={2.4} />
            {btn.label}
          </button>
        );
      })}
      {/* Regen-world button — only meaningful when looking at the main
          world. Re-rolls the seed, clears every procedurally-painted
          cell on the active layer, and generates a fresh band on next
          switch. Hidden in other views to keep the toolbar tight. */}
      {viewMode === 'main-world' && (
        <>
          <div style={{ width: 1.5, height: 18, background: 'var(--pb-line-2)', margin: '0 2px' }} />
          <button
            type="button"
            title="Regenerate the main world (clears procedural terrain, picks a fresh seed)"
            onClick={() => {
              regenerateMainWorld();
              // Re-trigger generation immediately so the player sees the
              // new layout without having to switch views first.
              generateMainWorld();
            }}
            className="flex items-center gap-1.5 transition-colors"
            style={{
              height: 30,
              padding: '0 10px',
              borderRadius: 8,
              background: 'var(--pb-paper)',
              color: 'var(--pb-ink-soft)',
              border: '1.5px solid var(--pb-line-2)',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 0.4,
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <Shuffle size={13} strokeWidth={2.4} />
            Regen
          </button>
        </>
      )}
    </div>
  );
}
