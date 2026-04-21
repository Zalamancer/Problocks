// In-memory singleton store for the Race mode. Mirrors the quiz memory
// store's shape — HMR-safe via globalThis — so the API routes can stay
// thin and a Supabase-backed store can be swapped in later without
// touching callers.

import {
  DEFAULT_COLS,
  DEFAULT_DOOR_COL,
  DEFAULT_DOOR_WIDTH,
  DEFAULT_ROWS,
  applyMove,
  isDoorTile,
  mintPin,
  pickStartTile,
} from './race-logic';
import type { MoveDir, Race, RacePlayer } from './race-types';

interface GlobalRaceStore {
  races: Map<string, Race>;
  pinIndex: Map<string, string>;
  tokenIndex: Map<string, { raceId: string; playerId: string }>;
}
const g = globalThis as unknown as { __pbRaceStore?: GlobalRaceStore };
if (!g.__pbRaceStore) {
  g.__pbRaceStore = {
    races: new Map(),
    pinIndex: new Map(),
    tokenIndex: new Map(),
  };
}
const store = g.__pbRaceStore;

const uuid = () => globalThis.crypto.randomUUID();

export interface CreateRaceInput {
  cols?: number;
  rows?: number;
  doorCol?: number;
  doorWidth?: number;
  hostUserId?: string | null;
}

export async function createRace(input: CreateRaceInput = {}): Promise<Race> {
  const now = Date.now();
  const pin = mintPin((p) => store.pinIndex.has(p));
  const race: Race = {
    id: uuid(),
    pin,
    cols: input.cols ?? DEFAULT_COLS,
    rows: input.rows ?? DEFAULT_ROWS,
    doorCol: input.doorCol ?? DEFAULT_DOOR_COL,
    doorWidth: input.doorWidth ?? DEFAULT_DOOR_WIDTH,
    phase: 'lobby',
    startedAt: null,
    heat: 1,
    createdAt: now,
    updatedAt: now,
    hostUserId: input.hostUserId ?? null,
    players: [],
  };
  store.races.set(race.id, race);
  store.pinIndex.set(race.pin, race.id);
  return race;
}

export async function getRace(id: string): Promise<Race | null> {
  return store.races.get(id) ?? null;
}

export async function getRaceByPin(pin: string): Promise<Race | null> {
  const id = store.pinIndex.get(pin.toUpperCase()) ?? store.pinIndex.get(pin);
  return id ? store.races.get(id) ?? null : null;
}

export interface JoinRaceResult {
  race: Race;
  player: RacePlayer;
  token: string;
}

export async function joinRace(raceId: string, displayName: string): Promise<JoinRaceResult> {
  const race = store.races.get(raceId);
  if (!race) throw new Error('race-not-found');
  const name = displayName.trim().slice(0, 24);
  if (!name) throw new Error('display-name-required');
  if (race.players.some((p) => p.displayName.toLowerCase() === name.toLowerCase())) {
    throw new Error('display-name-taken');
  }
  const spawn = pickStartTile(race);
  if (!spawn) throw new Error('room-full');
  const player: RacePlayer = {
    id: uuid(),
    displayName: name,
    col: spawn.col,
    row: spawn.row,
    startCol: spawn.col,
    startRow: spawn.row,
    moves: 0,
    trophies: 0,
    finishRank: null,
    finishedAt: null,
    joinedAt: Date.now(),
  };
  const token = uuid();
  race.players.push(player);
  race.updatedAt = Date.now();
  store.tokenIndex.set(token, { raceId: race.id, playerId: player.id });
  return { race, player, token };
}

export async function startRace(raceId: string): Promise<Race> {
  const race = store.races.get(raceId);
  if (!race) throw new Error('race-not-found');
  // Put everyone back on their spawn so a pre-race nudge doesn't give
  // an unfair head start, then flip to 'running'.
  for (const p of race.players) {
    p.col = p.startCol;
    p.row = p.startRow;
    p.moves = 0;
    p.finishRank = null;
    p.finishedAt = null;
  }
  race.phase = 'running';
  race.startedAt = Date.now();
  race.updatedAt = race.startedAt;
  return race;
}

// New heat — keep the same players (and their trophies) but hand out
// fresh spawn tiles and reset positions. Works in any phase so the
// teacher can re-roll between runs without closing the room.
export async function resetHeat(raceId: string): Promise<Race> {
  const race = store.races.get(raceId);
  if (!race) throw new Error('race-not-found');
  race.heat += 1;
  race.phase = 'lobby';
  race.startedAt = null;
  // Re-spawn: clear positions, then deal fresh bottom-row tiles. If the
  // class grew past the bottom-row width the extras stack on (0, startRow)
  // as a graceful-degradation fallback rather than crashing.
  for (const p of race.players) {
    p.finishRank = null;
    p.finishedAt = null;
    p.moves = 0;
  }
  const pool: Array<{ col: number; row: number }> = [];
  const startRow = race.rows - 1;
  for (let c = 0; c < race.cols; c++) pool.push({ col: c, row: startRow });
  // Shuffle pool — Fisher-Yates — so nobody keeps the same spawn twice in a row.
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  for (const p of race.players) {
    const next = pool.shift();
    if (!next) {
      p.startCol = 0;
      p.startRow = startRow;
    } else {
      p.startCol = next.col;
      p.startRow = next.row;
    }
    p.col = p.startCol;
    p.row = p.startRow;
  }
  race.updatedAt = Date.now();
  return race;
}

export interface MoveResult {
  race: Race;
  player: RacePlayer;
  won: boolean;
  finishRank: number | null;
}

export async function movePlayer(token: string, dir: MoveDir): Promise<MoveResult> {
  const entry = store.tokenIndex.get(token);
  if (!entry) throw new Error('bad-token');
  const race = store.races.get(entry.raceId);
  if (!race) throw new Error('race-not-found');
  if (race.phase !== 'running') throw new Error('not-running');
  const player = race.players.find((p) => p.id === entry.playerId);
  if (!player) throw new Error('player-not-found');
  // Once a player finishes, further moves are swallowed so they can't
  // "rejoin" the race and mess up finishRank ordering.
  if (player.finishRank != null) {
    return { race, player, won: true, finishRank: player.finishRank };
  }

  const next = applyMove(race, player, dir);
  if (!next.legal) {
    return { race, player, won: false, finishRank: null };
  }
  player.col = next.col;
  player.row = next.row;
  player.moves += 1;

  let won = false;
  let finishRank: number | null = null;
  if (isDoorTile(race, player.col, player.row)) {
    const alreadyFinished = race.players.filter((p) => p.finishRank != null).length;
    finishRank = alreadyFinished + 1;
    player.finishRank = finishRank;
    player.finishedAt = Date.now();
    if (finishRank === 1) player.trophies += 1;
    won = true;
    // If every player has finished, flip to 'done' so the teacher gets
    // the "heat complete" UI without another click.
    if (race.players.every((p) => p.finishRank != null)) {
      race.phase = 'done';
    }
  }
  race.updatedAt = Date.now();
  return { race, player, won, finishRank };
}
