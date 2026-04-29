'use client';

import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './supabase';
import type { Corner } from './room-geometry';

/**
 * Realtime broadcast for tile rooms.
 *
 * Each room gets its own Supabase Realtime channel `tile-room:${roomId}`.
 * We use the BROADCAST mode (not Postgres replication): paint / erase /
 * lot-join events are ephemeral, sent over websocket, and applied to
 * each client's local tile-store. Persistence is local (zustand persist
 * + tile-cloud), not server-side — the channel is just a way for
 * connected players to see each other's strokes in near-real-time.
 *
 * Why no DB tables: a single paint stroke on a 90k-corner map already
 * yields hundreds of cell deltas; persisting every event to Postgres
 * would burn rows and bandwidth. Storage-of-record stays the existing
 * tile-cloud snapshot path (per-room snapshots are a future ship).
 *
 * Falls back to a no-op when `NEXT_PUBLIC_SUPABASE_URL` /
 * `NEXT_PUBLIC_SUPABASE_ANON_KEY` aren't set — single-player local sim
 * just doesn't have remote peers, no errors thrown.
 */

export type TileRealtimeEvent =
  | {
      type: 'paint';
      /** Layer the cells belong to. Receivers must have the same layer
       *  id (we always seed the default 'Ground' layer with the same id
       *  on every client to make this work without sync). For Ship 3
       *  this caveat is fine; Ship 4+ can introduce layer-sync proper. */
      layerId: string;
      cells: Array<{ cx: number; cy: number; texId: string }>;
      sender: string;
    }
  | {
      type: 'erase';
      layerId: string;
      cells: Array<{ cx: number; cy: number }>;
      sender: string;
    }
  | {
      type: 'lot-claim';
      roomId: string;
      playerId: string;
      corner: Corner;
      sender: string;
    }
  | {
      type: 'presence';
      roomId: string;
      playerId: string;
      sender: string;
    };

export interface TileRealtimeHandle {
  channel: RealtimeChannel | null;
  unsubscribe: () => void;
  broadcast: (event: TileRealtimeEvent) => void;
  /** True when the websocket has connected and the channel has joined.
   *  Status indicators read this to show "live" vs "offline" in the UI. */
  isLive: () => boolean;
}

/**
 * Subscribe to a room's broadcast channel. `onEvent` fires for every
 * remote event; events sent by THIS sender are NOT delivered locally
 * (Supabase's `self: false` default). Returns a handle whose
 * `broadcast()` sends events outward and `unsubscribe()` tears down
 * the channel — callers must call `unsubscribe` on unmount or when the
 * room id changes.
 */
export function subscribeRoomChannel(
  roomId: string,
  sender: string,
  onEvent: (event: TileRealtimeEvent) => void,
): TileRealtimeHandle {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      channel: null,
      unsubscribe: () => undefined,
      broadcast: () => undefined,
      isLive: () => false,
    };
  }
  let live = false;
  const channel = supabase.channel(`tile-room:${roomId}`, {
    config: {
      // Don't echo our own broadcasts back — locally-applied edits beat
      // any websocket round-trip every time, and a self-echo would
      // double-apply.
      broadcast: { self: false, ack: false },
    },
  });
  channel.on('broadcast', { event: 'tile' }, (payload) => {
    const ev = payload?.payload as TileRealtimeEvent | undefined;
    if (!ev || typeof ev !== 'object') return;
    // Defensive: don't deliver events sent by this very client even when
    // `self: false` already filters most of them — covers the edge case
    // where a single browser tab opens two `subscribeRoomChannel` calls
    // (HMR re-mount, etc.) under the same `sender`.
    if (ev.sender === sender) return;
    onEvent(ev);
  });
  channel.subscribe((status) => {
    live = status === 'SUBSCRIBED';
  });
  return {
    channel,
    unsubscribe: () => {
      live = false;
      void supabase.removeChannel(channel);
    },
    broadcast: (event) => {
      // Cheap: if the channel hasn't joined yet, drop the event. Paint
      // strokes that fire while connecting just appear locally; no
      // back-pressure queue, no replay. Acceptable for an MVP — we'd
      // add a queue if remote peers complain about missed first
      // strokes after a reload.
      void channel.send({ type: 'broadcast', event: 'tile', payload: event });
    },
    isLive: () => live,
  };
}
