'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ROOM_SIZE,
  type Corner,
  type RoomOrigin,
  ALL_CORNERS,
  getZone,
} from '@/lib/room-geometry';
import { useTile } from '@/store/tile-store';
import { generateRegion } from '@/lib/world-gen';

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
  /** Realtime channel join state — written by `useTileRealtime` in
   *  TileView and read by the view switcher's status badge so the
   *  player can see at a glance whether other players' edits will
   *  show up. Not persisted (set fresh on every reload). */
  realtimeLive: boolean;
  setRealtimeLive: (live: boolean) => void;
  /** Whether the procedural pass has filled the main world's outer
   *  band. Tripped once per session (on first switch to main-world
   *  view); `regenerateMainWorld` clears it so the user can re-roll
   *  if they don't like the layout. */
  mainWorldGenerated: boolean;

  // ── Room lifecycle ─────────────────────────────────────────────
  createRoom: () => string;
  /**
   * Assign the given player to a corner lot. If no corner is passed, picks
   * the first vacant one ('NW' → 'NE' → 'SW' → 'SE'). No-op when the lot
   * is already taken; use `assignLotRandom` for shuffled assignment.
   */
  assignLot: (roomId: string, playerId: string, corner?: Corner) => Corner | null;
  /**
   * Random-assignment variant: shuffles the vacant corners and picks one.
   * No-op if the room is full or the player already owns a lot in this
   * room. Used by `ensureLocalPlayerHasLot` so the local player doesn't
   * always land in NW — same code path will run server-side in Ship 3
   * once the realtime channel exists.
   */
  assignLotRandom: (roomId: string, playerId: string) => Corner | null;
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

  /**
   * Procedurally fill the main world's outer band with biome terrain.
   * Idempotent: no-op when `mainWorldGenerated === true`. Skips the
   * central default zone (kept clear for hand-painting) and any cell
   * the active layer has already painted. Texture palette is the union
   * of every uploaded tileset's upper + lower texture ids; falls back
   * to a no-op when no tilesets exist (the player hasn't uploaded
   * anything yet).
   */
  generateMainWorld: () => void;
  /** Force a regenerate — useful when the player wants a different
   *  noise seed. Clears the painted main-world band on the active
   *  layer (only cells outside the default zone), bumps `seed`, and
   *  flips `mainWorldGenerated` back to false so the next switch to
   *  main-world view triggers a fresh pass. */
  regenerateMainWorld: () => void;
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
  realtimeLive: false,
  setRealtimeLive: (live) => set({ realtimeLive: live }),
  mainWorldGenerated: false,

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

  assignLotRandom: (roomId, playerId) => {
    let assigned: Corner | null = null;
    set((s) => {
      const rooms = s.rooms.map((r) => {
        if (r.id !== roomId) return r;
        const alreadyHere = ALL_CORNERS.find((c) => r.lots[c].ownerId === playerId);
        if (alreadyHere) {
          assigned = alreadyHere;
          return r;
        }
        const vacant = ALL_CORNERS.filter((c) => r.lots[c].ownerId === null);
        if (vacant.length === 0) return r;
        // Fisher-Yates is overkill for n=4 — a single random index works.
        const target = vacant[Math.floor(Math.random() * vacant.length)];
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
    // Randomise assignment so repeated reloads don't always land the
    // local player in NW. Ship 3 will run the same code path server-side
    // once a Supabase channel hands out lots.
    get().assignLotRandom(targetId, playerId);
    set({ currentRoomId: targetId });
    return targetId;
  },

  generateMainWorld: () => {
    if (get().mainWorldGenerated) return;
    const tile = useTile.getState();
    // Palette = every distinct texture id across every uploaded tileset.
    // Order doesn't matter much — `pickTextureForNoise` band-splits the
    // [0,1) noise range evenly, so the noise distribution lands the
    // textures roughly equally regardless of their order.
    const palette = Array.from(
      new Set(
        tile.tilesets.flatMap((ts) => [ts.upperTextureId, ts.lowerTextureId]),
      ),
    );
    if (palette.length === 0) {
      // No tilesets uploaded yet — bail silently. The next call (after
      // the user uploads a sheet) will proceed.
      return;
    }
    const layer = tile.layers.find((l) => l.id === tile.activeLayerId)
      ?? tile.layers[0];
    if (!layer) return;
    const mw = get().mainWorld;
    // Generate a square `defaultZoneSize * 4` cells on a side, centred on
    // the main-world origin. The hand-painted starter zone is preserved
    // by `skipCell`. Past these bounds, painting / panning still works —
    // just no procedurally-generated cells past the edge for now. A
    // chunked, camera-driven generator (one chunk per pan) is a
    // future ship.
    const span = mw.defaultZoneSize * 4;
    const x0 = mw.origin.x - Math.floor(span / 2);
    const y0 = mw.origin.y - Math.floor(span / 2);
    const x1 = mw.origin.x + Math.ceil(span / 2);
    const y1 = mw.origin.y + Math.ceil(span / 2);
    const dx0 = mw.origin.x;
    const dy0 = mw.origin.y;
    const dx1 = mw.origin.x + mw.defaultZoneSize;
    const dy1 = mw.origin.y + mw.defaultZoneSize;
    const cornerKey = (cx: number, cy: number) => `${cx},${cy}`;
    const cells = generateRegion({
      x0, y0, x1, y1,
      seed: mw.seed,
      palette,
      scale: 18,
      skipCell: (cx, cy) => {
        // 1. Default zone is hand-painting territory — leave alone.
        if (cx >= dx0 && cx < dx1 && cy >= dy0 && cy < dy1) return true;
        // 2. Cells the player (or a previous gen pass) has already
        //    painted — don't overwrite.
        if (cornerKey(cx, cy) in layer.corners) return true;
        return false;
      },
    });
    if (cells.length === 0) {
      // Could happen if every target cell is already painted. Mark
      // generated so we don't re-scan on every switch.
      set({ mainWorldGenerated: true });
      return;
    }
    tile.beginUndoGroup();
    tile.mutateCorners(layer.id, (corners) => {
      for (const { cx, cy, texId } of cells) {
        corners[`${cx},${cy}`] = texId;
        corners[`${cx + 1},${cy}`] = texId;
        corners[`${cx},${cy + 1}`] = texId;
        corners[`${cx + 1},${cy + 1}`] = texId;
      }
    });
    tile.commitUndoGroup();
    set({ mainWorldGenerated: true });
  },

  regenerateMainWorld: () => {
    // Clear the previously generated band on the active layer so the
    // next pass runs onto fresh cells, then bump the seed + flip the
    // flag. The default zone is preserved (skipCell would have skipped
    // it during generate, so it never had any procedural corners).
    const tile = useTile.getState();
    const layer = tile.layers.find((l) => l.id === tile.activeLayerId)
      ?? tile.layers[0];
    const mw = get().mainWorld;
    if (layer) {
      const span = mw.defaultZoneSize * 4;
      const x0 = mw.origin.x - Math.floor(span / 2);
      const y0 = mw.origin.y - Math.floor(span / 2);
      const x1 = mw.origin.x + Math.ceil(span / 2);
      const y1 = mw.origin.y + Math.ceil(span / 2);
      const dx0 = mw.origin.x;
      const dy0 = mw.origin.y;
      const dx1 = mw.origin.x + mw.defaultZoneSize;
      const dy1 = mw.origin.y + mw.defaultZoneSize;
      tile.beginUndoGroup();
      tile.mutateCorners(layer.id, (corners) => {
        for (let cy = y0; cy <= y1; cy++) {
          for (let cx = x0; cx <= x1; cx++) {
            // Preserve default-zone hand-painting.
            if (cx >= dx0 && cx < dx1 && cy >= dy0 && cy < dy1) continue;
            delete corners[`${cx},${cy}`];
          }
        }
      });
      tile.commitUndoGroup();
    }
    set((s) => ({
      mainWorld: { ...s.mainWorld, seed: Math.floor(Math.random() * 0xffff_ffff) },
      mainWorldGenerated: false,
    }));
  },
}), {
  name: 'problocks-room-v1',
  // Persist everything by default; the store only holds light metadata
  // (no PNG dataUrls or 90k-corner maps), so no need for a custom storage
  // shim like tile-store has.
}));

/**
 * Permission resolver — pure function over a snapshot of room state.
 * Returns true when `playerId` is allowed to paint / erase the cell at
 * the given tile coords, false otherwise. Rules:
 *
 *   • Inside a room's CORNER LOT → only the lot's owner can edit.
 *   • Inside a room's CROSS arm  → any player in that room can edit.
 *   • Inside the MAIN WORLD area → any player can edit (collaborative).
 *   • Outside every room and main-world → free canvas; anyone can edit.
 *     (Ship 3+ may tighten this, e.g. only main-world space is paintable.)
 *
 * Read-only — doesn't mutate the store. Designed to be called from the
 * paint/erase handlers in TileView, where the player needs an answer per
 * cell at every brush step. Cheap: a linear scan over rooms (typically
 * < 10) plus an axis-aligned rectangle check for main world.
 */
export function canEditCell(
  snapshot: Pick<RoomStore, 'rooms' | 'mainWorld' | 'currentPlayerId'>,
  x: number,
  y: number,
  playerIdOverride?: string,
): boolean {
  const playerId = playerIdOverride ?? snapshot.currentPlayerId;
  // Main world: a half-plane below `mainWorld.origin.y` for now. Ship 4
  // will tighten this when the procedural generator defines actual world
  // bounds; for Ship 2 the relevant fact is "main-world cells are
  // collaborative" so we just say any cell ≥ origin counts.
  const mw = snapshot.mainWorld;
  if (y >= mw.origin.y && x >= mw.origin.x) return true;
  // Walk rooms and find the one (if any) containing this cell. Rooms are
  // tiled left-to-right with a gap, so most cells fall in 'outside'.
  for (const room of snapshot.rooms) {
    const zone = getZone(x, y, room.origin);
    if (zone === 'outside') continue;
    if (zone === 'cross') {
      return room.players.includes(playerId);
    }
    return room.lots[zone].ownerId === playerId;
  }
  // Cell lies outside every room and outside main-world space → free
  // canvas. Anyone can paint (e.g. for the empty area between rooms while
  // the layout is still being designed).
  return true;
}
