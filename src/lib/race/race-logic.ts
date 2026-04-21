// Pure game logic for Race mode — PIN minting, starting-tile
// assignment, movement validation, door detection, leaderboard
// ordering. No I/O, no React. Shared between the in-memory store
// (today) and any future Supabase-backed store.

import type { MoveDir, Race, RacePlayer } from './race-types';

// Same alphabet as the quiz room — unambiguous glyphs only so students
// typing from across the classroom don't misread the PIN.
const PIN_ALPHABET = '23456789';

export function mintPin(existing: (pin: string) => boolean): string {
  for (let attempt = 0; attempt < 40; attempt++) {
    let pin = '';
    for (let i = 0; i < 6; i++) {
      pin += PIN_ALPHABET[Math.floor(Math.random() * PIN_ALPHABET.length)];
    }
    if (!existing(pin)) return pin;
  }
  throw new Error('Could not mint unique race PIN');
}

// Default board + door. Tuned so an 8-student class all fit across the
// bottom row with room to maneuver. Door is 2 cells wide in the middle
// so two students arriving on the same tick can both "enter".
export const DEFAULT_COLS = 8;
export const DEFAULT_ROWS = 8;
export const DEFAULT_DOOR_COL = 3;
export const DEFAULT_DOOR_WIDTH = 2;

// Return every (col,row) on the bottom row that isn't already taken.
// We reserve the bottom row as the spawn pool so the race always looks
// like "line at the starting block → door at the far end".
export function freeStartTiles(race: Race): Array<{ col: number; row: number }> {
  const taken = new Set(race.players.map((p) => `${p.startCol}:${p.startRow}`));
  const startRow = race.rows - 1;
  const out: Array<{ col: number; row: number }> = [];
  for (let c = 0; c < race.cols; c++) {
    if (!taken.has(`${c}:${startRow}`)) out.push({ col: c, row: startRow });
  }
  return out;
}

// Pick a spawn tile for a new joiner. Shuffled across the remaining
// bottom-row tiles so early joiners don't cluster on the left — the
// whole point of the mode is "different starting locations".
export function pickStartTile(race: Race): { col: number; row: number } | null {
  const free = freeStartTiles(race);
  if (free.length === 0) return null;
  const idx = Math.floor(Math.random() * free.length);
  return free[idx];
}

// Door check: is this tile part of the winning doorway?
export function isDoorTile(race: Race, col: number, row: number): boolean {
  if (row !== 0) return false;
  return col >= race.doorCol && col < race.doorCol + race.doorWidth;
}

// Apply a single-step move. Returns the new coordinates + whether the
// move is legal. Cardinal only, one tile at a time, bounded by the
// board. Players may share a tile (cheap to implement + feels good
// when two students bunch up at the door).
export function applyMove(
  race: Race,
  player: RacePlayer,
  dir: MoveDir,
): { col: number; row: number; legal: boolean } {
  let { col, row } = player;
  if (dir === 'up') row -= 1;
  else if (dir === 'down') row += 1;
  else if (dir === 'left') col -= 1;
  else if (dir === 'right') col += 1;
  const legal = col >= 0 && col < race.cols && row >= 0 && row < race.rows;
  if (!legal) return { col: player.col, row: player.row, legal: false };
  return { col, row, legal: true };
}

// Rank finished players by (finishRank asc) and unfinished by nothing
// — they tie at the end. Host-side leaderboard renders from this.
export function rankPlayers(race: Race): RacePlayer[] {
  return [...race.players].sort((a, b) => {
    const af = a.finishRank ?? Infinity;
    const bf = b.finishRank ?? Infinity;
    if (af !== bf) return af - bf;
    // Fallback: more trophies first, then fewer moves spent this heat.
    if (a.trophies !== b.trophies) return b.trophies - a.trophies;
    return a.moves - b.moves;
  });
}
