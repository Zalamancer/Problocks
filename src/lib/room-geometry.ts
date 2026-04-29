/**
 * Room geometry — pure helpers for the 4-player tile rooms.
 *
 * A room is a fixed 128×128 tile rectangle with this layout:
 *
 *     +--------+--+--------+
 *     |  NW    |  |  NE    |
 *     |  lot   |  |  lot   |
 *     |        |  |        |
 *     +--------+  +--------+      ← cross horizontal arm
 *     |        cross         |
 *     +--------+  +--------+
 *     |        |  |        |
 *     |  SW    |  |  SE    |
 *     |  lot   |  |  lot   |
 *     +--------+--+--------+
 *
 * - 4 corner lots, each owned by one player.
 * - Cross center (vertical strip + horizontal strip), collaboratively edited
 *   by all players in the room.
 *
 * No React, no store deps — every function takes a `roomOrigin` so callers
 * can position rooms anywhere in tile-coord space (multiple rooms, main
 * world, etc.). All units are tile cells unless noted.
 */

export const ROOM_SIZE = 128;
export const CROSS_WIDTH = 24;
/** ROOM_SIZE = 2 * LOT_SIZE + CROSS_WIDTH → LOT_SIZE = (128 - 24) / 2 = 52. */
export const LOT_SIZE = (ROOM_SIZE - CROSS_WIDTH) / 2;

export type Corner = 'NW' | 'NE' | 'SW' | 'SE';
export type Zone = Corner | 'cross' | 'outside';

export const ALL_CORNERS: Corner[] = ['NW', 'NE', 'SW', 'SE'];

export interface TileBounds {
  /** Inclusive top-left tile coord. */
  x0: number;
  y0: number;
  /** Exclusive bottom-right tile coord. */
  x1: number;
  y1: number;
}

export interface RoomOrigin {
  x: number;
  y: number;
}

/**
 * Bounds of one corner lot, in absolute tile coords.
 *   NW: (0..LOT, 0..LOT)
 *   NE: (LOT+CROSS..ROOM, 0..LOT)
 *   SW: (0..LOT, LOT+CROSS..ROOM)
 *   SE: (LOT+CROSS..ROOM, LOT+CROSS..ROOM)
 */
export function getLotBounds(origin: RoomOrigin, corner: Corner): TileBounds {
  const lo = LOT_SIZE;
  const hi = LOT_SIZE + CROSS_WIDTH;
  const end = ROOM_SIZE;
  switch (corner) {
    case 'NW':
      return { x0: origin.x, y0: origin.y, x1: origin.x + lo, y1: origin.y + lo };
    case 'NE':
      return { x0: origin.x + hi, y0: origin.y, x1: origin.x + end, y1: origin.y + lo };
    case 'SW':
      return { x0: origin.x, y0: origin.y + hi, x1: origin.x + lo, y1: origin.y + end };
    case 'SE':
      return { x0: origin.x + hi, y0: origin.y + hi, x1: origin.x + end, y1: origin.y + end };
  }
}

/** Bounds of the whole room, in absolute tile coords. */
export function getRoomBounds(origin: RoomOrigin): TileBounds {
  return {
    x0: origin.x,
    y0: origin.y,
    x1: origin.x + ROOM_SIZE,
    y1: origin.y + ROOM_SIZE,
  };
}

/**
 * The cross is a + shape: a horizontal arm spanning the full room width, and
 * a vertical arm spanning the full room height, both `CROSS_WIDTH` tiles
 * thick. Returned as two rectangles so callers can render / hit-test each.
 */
export function getCrossBounds(origin: RoomOrigin): { horizontal: TileBounds; vertical: TileBounds } {
  const lo = LOT_SIZE;
  const hi = LOT_SIZE + CROSS_WIDTH;
  return {
    horizontal: {
      x0: origin.x,
      y0: origin.y + lo,
      x1: origin.x + ROOM_SIZE,
      y1: origin.y + hi,
    },
    vertical: {
      x0: origin.x + lo,
      y0: origin.y,
      x1: origin.x + hi,
      y1: origin.y + ROOM_SIZE,
    },
  };
}

/**
 * Tight bounds of the cross center (the square where the two arms meet) —
 * useful for "centre on the cross" view actions.
 */
export function getCrossCenterBounds(origin: RoomOrigin): TileBounds {
  const lo = LOT_SIZE;
  const hi = LOT_SIZE + CROSS_WIDTH;
  return {
    x0: origin.x + lo,
    y0: origin.y + lo,
    x1: origin.x + hi,
    y1: origin.y + hi,
  };
}

/**
 * Classify a tile coord against a room. Outside the room → 'outside'.
 * Inside a cross arm → 'cross'. Otherwise one of the four corner lots.
 *
 * Used by the permission resolver (Ship 2) and by tools that need to tint
 * the cell under the cursor based on which zone it falls in.
 */
export function getZone(x: number, y: number, origin: RoomOrigin): Zone {
  const lx = x - origin.x;
  const ly = y - origin.y;
  if (lx < 0 || ly < 0 || lx >= ROOM_SIZE || ly >= ROOM_SIZE) return 'outside';
  const lo = LOT_SIZE;
  const hi = LOT_SIZE + CROSS_WIDTH;
  // In either cross arm strip → cross.
  if ((lx >= lo && lx < hi) || (ly >= lo && ly < hi)) return 'cross';
  // Otherwise one of the four corners. Already checked the cross strips,
  // so any non-cross cell inside the room is in exactly one corner lot.
  if (lx < lo && ly < lo) return 'NW';
  if (lx >= hi && ly < lo) return 'NE';
  if (lx < lo && ly >= hi) return 'SW';
  return 'SE';
}

/**
 * Auto-rotate angle (degrees clockwise) for each lot so that the cross
 * sits in the SAME relative direction (south-east) from every player's
 * local frame:
 *
 *   NW (cross to SE) → 0°    (default)
 *   NE (cross to SW) → 90°   (rotate CW so SW becomes SE)
 *   SE (cross to NW) → 180°
 *   SW (cross to NE) → 270°  (rotate CW so NE becomes SE)
 *
 * Used by the renderer in Ship 2 to rotate each lot's painted tiles in
 * place, so a lot designed in NW orientation looks "the same" no matter
 * which corner the player is assigned to.
 */
export function lotRotationDegrees(corner: Corner): 0 | 90 | 180 | 270 {
  switch (corner) {
    case 'NW': return 0;
    case 'NE': return 90;
    case 'SE': return 180;
    case 'SW': return 270;
  }
}
