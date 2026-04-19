// In-memory room store. Phase 1 backend — lives as a module-level
// singleton on the Next server, so a single dev process (or single
// Railway instance) shares state across route handlers. Phase 2 swaps
// this out for Supabase + Realtime; the interface below is what the
// routes consume, so the swap is self-contained.
import { FRQ } from './frq-content';
import type { Frq } from './frq-content';
import type {
  Room,
  RoomAnswer,
  RoomPacing,
  RoomPhase,
  RoomPlayer,
} from './room-types';

// The server process can be reloaded in dev; guard the singleton behind
// globalThis so HMR doesn't blow the map away between requests.
interface GlobalStore {
  rooms: Map<string, Room>;
  pinIndex: Map<string, string>; // pin → roomId
}
const g = globalThis as unknown as { __pbQuizStore?: GlobalStore };
if (!g.__pbQuizStore) {
  g.__pbQuizStore = { rooms: new Map(), pinIndex: new Map() };
}
const store = g.__pbQuizStore;

// Kahoot uses 6–7 digit PINs. Skip ambiguous chars so students typing on
// a phone don't stare at 0/O or 1/l. Retry until unique.
const PIN_ALPHABET = '23456789';
function mintPin(): string {
  for (let attempt = 0; attempt < 20; attempt++) {
    let pin = '';
    for (let i = 0; i < 6; i++) {
      pin += PIN_ALPHABET[Math.floor(Math.random() * PIN_ALPHABET.length)];
    }
    if (!store.pinIndex.has(pin)) return pin;
  }
  throw new Error('Could not mint unique room PIN');
}

function uuid(): string {
  // crypto.randomUUID is available in Node 18+ and all supported browsers.
  return globalThis.crypto.randomUUID();
}

// Right now we only ship one FRQ — expose it here so the host can pick
// when we add more. Keeping it behind a lookup so the room stores just
// an id, not the whole content blob.
const FRQ_CATALOG: Record<string, Frq> = { 'cart-on-incline': FRQ };
export function getFrq(id: string): Frq | null {
  return FRQ_CATALOG[id] ?? null;
}

export interface CreateRoomInput {
  frqId: string;
  pacing: RoomPacing;
  hostUserId?: string | null;
}

export function createRoom(input: CreateRoomInput): Room {
  const frq = getFrq(input.frqId);
  if (!frq) throw new Error(`Unknown frq: ${input.frqId}`);
  const now = Date.now();
  const room: Room = {
    id: uuid(),
    pin: mintPin(),
    frqId: input.frqId,
    pacing: input.pacing,
    phase: 'lobby',
    partIdx: 0,
    microIdx: 0,
    questionStartedAt: null,
    createdAt: now,
    updatedAt: now,
    hostUserId: input.hostUserId ?? null,
    players: [],
    answers: [],
  };
  store.rooms.set(room.id, room);
  store.pinIndex.set(room.pin, room.id);
  return room;
}

export function getRoom(roomId: string): Room | null {
  return store.rooms.get(roomId) ?? null;
}

export function getRoomByPin(pin: string): Room | null {
  const id = store.pinIndex.get(pin.toUpperCase());
  return id ? getRoom(id) : null;
}

// Map from opaque player token → playerId. Tokens are stored by the
// client in localStorage so a refresh doesn't lose the student's seat.
const tokenIndex = new Map<string, { roomId: string; playerId: string }>();

export interface JoinResult {
  room: Room;
  player: RoomPlayer;
  token: string;
}

export function joinRoom(roomId: string, displayName: string): JoinResult {
  const room = getRoom(roomId);
  if (!room) throw new Error('room-not-found');
  if (room.phase !== 'lobby') throw new Error('room-already-started');
  const name = displayName.trim().slice(0, 24);
  if (!name) throw new Error('display-name-required');
  if (room.players.some((p) => p.displayName.toLowerCase() === name.toLowerCase())) {
    throw new Error('display-name-taken');
  }
  const player: RoomPlayer = {
    id: uuid(),
    displayName: name,
    score: 0,
    streak: 0,
    joinedAt: Date.now(),
  };
  const token = uuid();
  room.players.push(player);
  room.updatedAt = Date.now();
  tokenIndex.set(token, { roomId: room.id, playerId: player.id });
  return { room, player, token };
}

export function getPlayerFromToken(token: string): {
  room: Room;
  player: RoomPlayer;
} | null {
  const entry = tokenIndex.get(token);
  if (!entry) return null;
  const room = getRoom(entry.roomId);
  if (!room) return null;
  const player = room.players.find((p) => p.id === entry.playerId);
  if (!player) return null;
  return { room, player };
}

// Host advances the phase machine: lobby → question → reveal →
// leaderboard → question … → done. In self-paced mode the student
// advances themselves via submitAnswer; this helper is for live.
export function advancePhase(roomId: string): Room {
  const room = getRoom(roomId);
  if (!room) throw new Error('room-not-found');
  const frq = getFrq(room.frqId);
  if (!frq) throw new Error('frq-missing');

  const next = computeNextPhase(room, frq);
  Object.assign(room, next);
  room.updatedAt = Date.now();
  return room;
}

function computeNextPhase(
  room: Room,
  frq: Frq,
): Partial<Room> {
  const totalParts = frq.parts.length;
  const part = frq.parts[room.partIdx];
  const totalMicros = part ? part.micros.length : 0;

  switch (room.phase) {
    case 'lobby':
      return { phase: 'question', questionStartedAt: Date.now() };
    case 'question':
      return { phase: 'reveal', questionStartedAt: null };
    case 'reveal':
      return { phase: 'leaderboard' };
    case 'leaderboard': {
      let partIdx = room.partIdx;
      let microIdx = room.microIdx + 1;
      if (microIdx >= totalMicros) {
        microIdx = 0;
        partIdx += 1;
      }
      if (partIdx >= totalParts) {
        return { phase: 'done' };
      }
      return {
        phase: 'question',
        partIdx,
        microIdx,
        questionStartedAt: Date.now(),
      };
    }
    default:
      return {};
  }
}

// Time-based scoring, Kahoot-style: max 1000 points for an instant
// correct answer, linearly decaying to 500 at the answer window end.
// Wrong answers score 0. Streak bonus: +100 per extra correct in a row,
// capped at +500.
const ANSWER_WINDOW_MS = 20_000;
function computePoints(correct: boolean, ms: number, nextStreak: number): number {
  if (!correct) return 0;
  const speed = Math.max(0, 1 - ms / ANSWER_WINDOW_MS);
  const base = Math.round(500 + 500 * speed);
  const bonus = Math.min(500, Math.max(0, nextStreak - 1) * 100);
  return base + bonus;
}

export interface SubmitAnswerInput {
  token: string;
  partId: string;
  microId: string;
  answerId?: string;
  answerValue?: number;
}

export interface SubmitAnswerResult {
  correct: boolean;
  points: number;
  newScore: number;
  newStreak: number;
}

export function submitAnswer(input: SubmitAnswerInput): SubmitAnswerResult {
  const entry = getPlayerFromToken(input.token);
  if (!entry) throw new Error('bad-token');
  const { room, player } = entry;
  if (room.phase !== 'question') throw new Error('not-answerable');

  const frq = getFrq(room.frqId);
  if (!frq) throw new Error('frq-missing');

  const part = frq.parts.find((p) => p.id === input.partId);
  if (!part) throw new Error('unknown-part');
  const micro = part.micros.find((m) => m.id === input.microId);
  if (!micro) throw new Error('unknown-micro');

  // One answer per micro per player — ignore doubles.
  const already = room.answers.some(
    (a) => a.playerId === player.id && a.partId === input.partId && a.microId === input.microId,
  );
  if (already) throw new Error('already-answered');

  let correct = false;
  if (micro.kind === 'choice') {
    const opt = micro.options.find((o) => o.id === input.answerId);
    correct = !!opt?.correct;
  } else {
    if (input.answerValue == null) throw new Error('value-required');
    correct = Math.abs(input.answerValue - micro.answer) <= micro.tol;
  }

  const now = Date.now();
  const ms = room.questionStartedAt ? now - room.questionStartedAt : ANSWER_WINDOW_MS;
  const nextStreak = correct ? player.streak + 1 : 0;
  const points = computePoints(correct, ms, nextStreak);

  const answer: RoomAnswer = {
    playerId: player.id,
    partId: input.partId,
    microId: input.microId,
    answerId: input.answerId,
    answerValue: input.answerValue,
    correct,
    msToAnswer: ms,
    points,
    createdAt: now,
  };
  room.answers.push(answer);
  player.score += points;
  player.streak = nextStreak;
  room.updatedAt = now;

  return {
    correct,
    points,
    newScore: player.score,
    newStreak: nextStreak,
  };
}
