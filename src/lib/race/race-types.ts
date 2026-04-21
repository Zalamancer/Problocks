// Shared types for the multiplayer Race mode — students all try to
// reach the same door from different starting tiles on a chessboard.
// Mirrors the quiz-room shape so the same "lobby → live → done" feel
// and polling/realtime path can be reused.

export type RacePhase = 'lobby' | 'running' | 'done';
export type MoveDir = 'up' | 'down' | 'left' | 'right';

export interface RacePlayer {
  id: string;
  displayName: string;
  // Current position on the board (column, row). (0,0) is top-left.
  col: number;
  row: number;
  // Tile the player spawned at this heat — kept so resets put them back.
  startCol: number;
  startRow: number;
  // Moves spent this heat (cheap proxy for "efficiency" on the tie-break).
  moves: number;
  // Lifetime trophies across heats. Persists across resets.
  trophies: number;
  // Finish order for the current heat (1-based). null while still racing.
  finishRank: number | null;
  finishedAt: number | null;
  joinedAt: number;
}

export interface Race {
  id: string;
  pin: string;
  // Board geometry. Chessboard default is 8×8 but kept as data so the
  // teacher can widen it later without a redeploy.
  cols: number;
  rows: number;
  // Door is always at the top edge — a contiguous span of cells from
  // doorCol up to doorCol + doorWidth (exclusive) on row 0. Every
  // student races toward the same door.
  doorCol: number;
  doorWidth: number;
  phase: RacePhase;
  // Wall monotonic time ms when the heat started — used to time-rank
  // finishers whose moves complete in the same polling tick.
  startedAt: number | null;
  // Heat index. Bumps on every "new heat" reset so stale client actions
  // from the previous run can be ignored.
  heat: number;
  createdAt: number;
  updatedAt: number;
  hostUserId?: string | null;
  players: RacePlayer[];
}

// Public shape (identical today — kept as a distinct alias so any
// future host-only fields live in Race but not RacePublic).
export type RacePublic = Omit<Race, 'hostUserId'>;

export function toPublicRace(r: Race): RacePublic {
  const { hostUserId: _host, ...rest } = r;
  return rest;
}
