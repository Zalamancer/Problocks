'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ROOM_SIZE,
  type Corner,
  type RoomOrigin,
  ALL_CORNERS,
} from '@/lib/room-geometry';

/**
 * Room / main-world state for the 2D tile system.
 *
 * Spatial model: rooms (and the main world) live as RECTANGLES in the
 * existing tile-store coordinate space. The tile-store doesn't change —
 * it remains the painted-corners document. This store just records which
 * tile-coord rectangles are rooms / main world, who owns which lot, and
 * which "view" (whole room / single lot / cross / main world) the player
 * is currently focused on.
 *
 * Room placement: rooms are laid out left-to-right at y=0 with a gap, so
 * the i-th room sits at x = i * (ROOM_SIZE + ROOM_GAP). Main world starts
 * far below at MAIN_WORLD_ORIGIN so neither viewport accidentally overlaps
 * the other when the camera moves.
 *
 * Single-player local sim for Ship 1: there is one local player ('me'),
 * they are placed in room 0's NW lot. Ship 2 brings random assignment;
 * Ship 3 brings real multi-player rooms via Supabase Realtime.
 */

const ROOM_GAP = 16;
const MAIN_WORLD_ORIGIN: RoomOrigin = { x: 0, y: 1024 };
const DEFAULT_MAIN_WORLD_ZONE = 64;
const LOCAL_PLAYER_ID = 'me';

export type RoomViewMode = 'lot' | 'cross' | 'room' | 'main-world';

export interface Lot {
  corner: Corner;
  ownerId: string | null;
}

export interface Room {
  id: string;
  origin: RoomOrigin;
  /** Player ids in this room. Max 4 — the room is full once all corners
   *  are assigned, and a new room is spawned for the next player. */
  players: string[];
  /** Always 4 entries, one per corner. Empty corners have ownerId = null. */
  lots: Record<Corner, Lot>;
}

export interface MainWorld {
  origin: RoomOrigin;
  /** Side of the square "starter zone" at the world origin where terrain
   *  is hand-painted rather than procedurally generated. Past this square,
   *  the Ship 4 generator fills cells from a seeded simplex pass. */
  defaultZoneSize: number;
  /** Seed for the procedural generator (Ship 4). Stable across reloads so
   *  a given world always regenerates to the same biome layout. */
  seed: number;
}

export interface RoomStore {
  rooms: Room[];
  mainWorld: MainWorld;

  /** The room whose lot the local player owns. Null while no rooms exist
   *  (initial state) — first read by the auto-create effect lazily. */
  currentRoomId: string | null;
  /** Local player id. Single-player sim for Ships 1–2; Ship 3 swaps to a
   *  Supabase user id so the realtime channel can route edits per player. */
  currentPlayerId: string;
  /** Which view the canvas is centered on right now. Camera moves are
   *  applied imperatively by the view switcher (it directly nudges the
   *  tile-store camera), but this flag also drives the zone-overlay /
   *  permission tinting in the canvas. */
  viewMode: RoomViewMode;

  // ── Room lifecycle ─────────────────────────────────────────────
  createRoom: () => string;
  /**
   * Assign the given player to a corner lot. If no corner is passed, picks
   * the first vacant one ('NW' → 'NE' → 'SW' → 'SE'). No-op when the lot
   * is already taken (use Ship 2's randomized helper for shuffled assignment).
   */
  assignLot: (roomId: string, playerId: string, corner?: Corner) => Corner | null;
  /** Set the local player's active room — used when Ship 3 lands and the
   *  player joins a remote room. Also sets currentRoomId. */
  setCurrentRoom: (roomId: string | null) => void;
  /** Override the local player id (Ship 3: real Supabase user). */
  setCurrentPlayerId: (id: string) => void;
  setViewMode: (mode: RoomViewMode) => void;

  /**
   * Ensure the local player has a room + lot. Idempotent — safe to call on
   * mount. If no room exists, creates room 0 and assigns the local player
   * to NW. If a room exists but the player has no lot, assigns the first
   * vacant corner. Returns the (possibly newly-created) room id, so the
   * caller can `setCurrentRoom` after.
   */
  ensureLocalPlayerHasLot: () => string;
}

function emptyLots(): Record<Corner, Lot> {
  // Object literal would also work, but ALL_CORNERS keeps this future-proof
  // if we ever change the corner type.
  const out = {} as Record<Corner, Lot>;
  for (const c of ALL_CORNERS) out[c] = { corner: c, ownerId: null };
  return out;
}

function nextRoomOrigin(existing: Room[]): RoomOrigin {
  // Lay rooms left-to-right at y=0. Stable for any insertion order — we
  // pick the leftmost free slot so a deleted middle room doesn't leave a
  // permanent hole.
  const usedXs = new Set(existing.map((r) => r.origin.x));
  for (let i = 0; ; i++) {
    const x = i * (ROOM_SIZE + ROOM_GAP);
    if (!usedXs.has(x)) return { x, y: 0 };
  }
}

function cryptoId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `id-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

export const useRoom = create<RoomStore>()(persist((set, get) => ({
  rooms: [],
  mainWorld: {
    origin: MAIN_WORLD_ORIGIN,
    defaultZoneSize: DEFAULT_MAIN_WORLD_ZONE,
    // Stable per-store seed; can be regenerated when "new world" is added.
    seed: Math.floor(Math.random() * 0xffff_ffff),
  },
  currentRoomId: null,
  currentPlayerId: LOCAL_PLAYER_ID,
  viewMode: 'room',

  createRoom: () => {
    const id = cryptoId();
    set((s) => ({
      rooms: [
        ...s.rooms,
        {
          id,
          origin: nextRoomOrigin(s.rooms),
          players: [],
          lots: emptyLots(),
        },
      ],
    }));
    return id;
  },

  assignLot: (roomId, playerId, corner) => {
    let assigned: Corner | null = null;
    set((s) => {
      const rooms = s.rooms.map((r) => {
        if (r.id !== roomId) return r;
        // Player can own at most one lot per room.
        const alreadyHere = ALL_CORNERS.find((c) => r.lots[c].ownerId === playerId);
        if (alreadyHere) {
          assigned = alreadyHere;
          return r;
        }
        const target =
          corner && r.lots[corner].ownerId === null
            ? corner
            : ALL_CORNERS.find((c) => r.lots[c].ownerId === null) ?? null;
        if (!target) return r; // room full, no-op
        assigned = target;
        const lots: Record<Corner, Lot> = {
          ...r.lots,
          [target]: { corner: target, ownerId: playerId },
        };
        const players = r.players.includes(playerId) ? r.players : [...r.players, playerId];
        return { ...r, lots, players };
      });
      return { rooms };
    });
    return assigned;
  },

  setCurrentRoom: (roomId) => set({ currentRoomId: roomId }),
  setCurrentPlayerId: (id) => set({ currentPlayerId: id }),
  setViewMode: (mode) => set({ viewMode: mode }),

  ensureLocalPlayerHasLot: () => {
    const s = get();
    const playerId = s.currentPlayerId;
    // 1. Find a room the player already owns a lot in.
    const owned = s.rooms.find((r) =>
      ALL_CORNERS.some((c) => r.lots[c].ownerId === playerId),
    );
    if (owned) {
      if (s.currentRoomId !== owned.id) set({ currentRoomId: owned.id });
      return owned.id;
    }
    // 2. Find a room with at least one vacant corner.
    const vacant = s.rooms.find((r) =>
      ALL_CORNERS.some((c) => r.lots[c].ownerId === null),
    );
    const targetId = vacant?.id ?? get().createRoom();
    get().assignLot(targetId, playerId);
    set({ currentRoomId: targetId });
    return targetId;
  },
}), {
  name: 'problocks-room-v1',
  // Persist everything by default; the store only holds light metadata
  // (no PNG dataUrls or 90k-corner maps), so no need for a custom storage
  // shim like tile-store has.
}));
