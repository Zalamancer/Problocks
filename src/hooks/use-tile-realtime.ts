'use client';

import { useEffect, useRef, useState } from 'react';
import {
  subscribeRoomChannel,
  type TileRealtimeEvent,
  type TileRealtimeHandle,
} from '@/lib/tile-realtime';
import { useTile } from '@/store/tile-store';
import { useRoom } from '@/store/room-store';
import { ALL_CORNERS } from '@/lib/room-geometry';

/**
 * Hook that wires the active room's Supabase Realtime channel into the
 * local tile-store + room-store. Mount it once in TileView (or another
 * top-level studio surface) and pass the active room id; it tears down
 * + re-subscribes whenever the id changes.
 *
 * Local effects of remote events:
 *
 *   • `paint`  → apply the cell deltas to the matching layer's corners.
 *                (Skipped when no layer matches the event's layerId —
 *                Ship 4+ will introduce a layer-sync mechanism that
 *                avoids this gap.)
 *   • `erase`  → clear corners around the affected cells.
 *   • `lot-claim` → mirror the lot ownership in the local room-store
 *                so every player sees the same "who owns which corner"
 *                map.
 *   • `presence` → ack only; future ships will use it for player-list
 *                / cursor display.
 *
 * The hook also returns a `broadcast` callable so the paint/erase
 * handlers in TileView can push their local edits outward — that's the
 * "send" side of the same channel. `isLive()` reflects the current
 * websocket join status (used by the UI badge in RoomViewSwitcher).
 */

interface UseTileRealtime {
  /** Send an event over the channel. No-op when not connected. */
  broadcast: (event: TileRealtimeEvent) => void;
  /** True when the websocket has joined the room channel. */
  live: boolean;
}

/**
 * Stable per-tab sender id. Useful to identify the source of an event
 * even though Supabase already filters self-broadcasts with
 * `self: false`. Persists in sessionStorage so HMR/reloads keep the
 * same id within a tab session.
 */
function getOrCreateSenderId(): string {
  if (typeof window === 'undefined') return 'ssr';
  const KEY = 'problocks:tile-realtime:sender';
  const existing = window.sessionStorage.getItem(KEY);
  if (existing) return existing;
  const id =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `s-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
  window.sessionStorage.setItem(KEY, id);
  return id;
}

export function useTileRealtime(roomId: string | null): UseTileRealtime {
  const handleRef = useRef<TileRealtimeHandle | null>(null);
  const [live, setLive] = useState(false);
  // The hook itself doesn't read tile/room state via subscribers (would
  // re-render the consumer on every store change). Remote-event
  // application uses `useTile.getState()` / `useRoom.getState()` so it
  // sees the latest snapshot at fire time without re-rendering this hook.

  useEffect(() => {
    // Drop any prior subscription before opening a new one; the channel
    // name is roomId-keyed so this fires on room-switch.
    if (handleRef.current) {
      handleRef.current.unsubscribe();
      handleRef.current = null;
      setLive(false);
    }
    if (!roomId) return;
    const sender = getOrCreateSenderId();

    function onEvent(ev: TileRealtimeEvent) {
      switch (ev.type) {
        case 'paint': {
          const tile = useTile.getState();
          const layer = tile.layers.find((l) => l.id === ev.layerId);
          if (!layer) return; // layer-id mismatch — see hook header
          tile.mutateCorners(layer.id, (corners) => {
            for (const { cx, cy, texId } of ev.cells) {
              corners[`${cx},${cy}`] = texId;
              corners[`${cx + 1},${cy}`] = texId;
              corners[`${cx},${cy + 1}`] = texId;
              corners[`${cx + 1},${cy + 1}`] = texId;
            }
          });
          return;
        }
        case 'erase': {
          const tile = useTile.getState();
          const layer = tile.layers.find((l) => l.id === ev.layerId);
          if (!layer) return;
          tile.mutateCorners(layer.id, (corners) => {
            for (const { cx, cy } of ev.cells) {
              delete corners[`${cx},${cy}`];
              delete corners[`${cx + 1},${cy}`];
              delete corners[`${cx},${cy + 1}`];
              delete corners[`${cx + 1},${cy + 1}`];
            }
          });
          return;
        }
        case 'lot-claim': {
          // Mirror the remote claim into the local room-store. If the
          // local view doesn't have the room yet, ignore — Ship 4+ will
          // add room-discovery so a player landing in a remote-only
          // room can pick it up cleanly.
          const room = useRoom.getState();
          const target = room.rooms.find((r) => r.id === ev.roomId);
          if (!target) return;
          room.assignLot(ev.roomId, ev.playerId, ev.corner);
          return;
        }
        case 'presence':
          // No-op for Ship 3 — surfaces in Ship 4+ when the player
          // list / cursors land.
          return;
      }
    }

    const handle = subscribeRoomChannel(roomId, sender, onEvent);
    handleRef.current = handle;

    // Poll the channel join status until SUBSCRIBED. Supabase doesn't
    // expose a "joined" Promise; the supplied callback fires once with
    // SUBSCRIBED, and we mirror that into React state via this short
    // poll. 500 ms × ~6 reads worst case for a slow Chromebook.
    const probe = setInterval(() => {
      const next = handle.isLive();
      setLive((cur) => (cur === next ? cur : next));
      if (next) clearInterval(probe);
    }, 500);

    return () => {
      clearInterval(probe);
      handle.unsubscribe();
      if (handleRef.current === handle) handleRef.current = null;
      setLive(false);
    };
  }, [roomId]);

  return {
    broadcast: (event) => handleRef.current?.broadcast(event) ?? undefined,
    live,
  };
}

/**
 * Helpers for building the broadcast payload from local applyPaint /
 * applyErase results. Kept here (next to the hook that consumes them)
 * so the paint hot-path imports a single shape, not a small swarm of
 * helpers from different files.
 */
export function buildPaintEvent(
  layerId: string,
  cells: Array<[number, number]>,
  texId: string,
  sender: string,
): TileRealtimeEvent {
  return {
    type: 'paint',
    layerId,
    cells: cells.map(([cx, cy]) => ({ cx, cy, texId })),
    sender,
  };
}

export function buildEraseEvent(
  layerId: string,
  cells: Array<[number, number]>,
  sender: string,
): TileRealtimeEvent {
  return {
    type: 'erase',
    layerId,
    cells: cells.map(([cx, cy]) => ({ cx, cy })),
    sender,
  };
}

/**
 * `ALL_CORNERS` is re-exported so callers only need to import from this
 * module when assembling lot-claim events — keeps the import surface
 * tight in TileView and RoomViewSwitcher.
 */
export { ALL_CORNERS };
