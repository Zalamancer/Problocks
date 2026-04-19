// In-memory backend — used when Supabase isn't configured (local dev
// without env) and as the reference implementation that the Supabase
// backend has to match.
import { computeNextPhase, computePoints, gradeAnswer, mintPin, ANSWER_WINDOW_MS } from './room-logic';
import type { Room, RoomAnswer, RoomPlayer } from './room-types';
import type {
  CreateRoomInput,
  JoinResult,
  SubmitAnswerInput,
  SubmitAnswerResult,
} from './room-store-types';

// Guard the singleton behind globalThis so Next's dev HMR doesn't blow
// the Map away on every route-file edit.
interface GlobalStore {
  rooms: Map<string, Room>;
  pinIndex: Map<string, string>;
  tokenIndex: Map<string, { roomId: string; playerId: string }>;
}
const g = globalThis as unknown as { __pbQuizStore?: GlobalStore };
if (!g.__pbQuizStore) {
  g.__pbQuizStore = {
    rooms: new Map(),
    pinIndex: new Map(),
    tokenIndex: new Map(),
  };
}
const store = g.__pbQuizStore;

const uuid = () => globalThis.crypto.randomUUID();

export async function createRoom(input: CreateRoomInput): Promise<Room> {
  const now = Date.now();
  const pin = mintPin((p) => store.pinIndex.has(p));
  // Self-paced rooms skip the lobby phase — students can start answering
  // the instant they land, no host coordination needed.
  const selfPaced = input.pacing === 'self';
  const room: Room = {
    id: uuid(),
    pin,
    frqId: input.frqId,
    pacing: input.pacing,
    phase: selfPaced ? 'question' : 'lobby',
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

export async function getRoom(roomId: string): Promise<Room | null> {
  return store.rooms.get(roomId) ?? null;
}

export async function getRoomByPin(pin: string): Promise<Room | null> {
  const id = store.pinIndex.get(pin.toUpperCase()) ?? store.pinIndex.get(pin);
  return id ? store.rooms.get(id) ?? null : null;
}

export async function joinRoom(roomId: string, displayName: string): Promise<JoinResult> {
  const room = store.rooms.get(roomId);
  if (!room) throw new Error('room-not-found');
  // Self-paced rooms accept joiners at any time (the room starts in
  // 'question' and never has a lobby). Live rooms close at 'Start'.
  if (room.pacing === 'live' && room.phase !== 'lobby') {
    throw new Error('room-already-started');
  }
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
  store.tokenIndex.set(token, { roomId: room.id, playerId: player.id });
  return { room, player, token };
}

export async function advancePhase(roomId: string): Promise<Room> {
  const room = store.rooms.get(roomId);
  if (!room) throw new Error('room-not-found');
  const next = computeNextPhase(room);
  Object.assign(room, next);
  room.updatedAt = Date.now();
  return room;
}

export async function submitAnswer(input: SubmitAnswerInput): Promise<SubmitAnswerResult> {
  const entry = store.tokenIndex.get(input.token);
  if (!entry) throw new Error('bad-token');
  const room = store.rooms.get(entry.roomId);
  if (!room) throw new Error('room-not-found');
  const player = room.players.find((p) => p.id === entry.playerId);
  if (!player) throw new Error('player-not-found');
  // Live: only accept during the 'question' phase (host-gated).
  // Self-paced: accept at any time — each student progresses on their own.
  if (room.pacing === 'live' && room.phase !== 'question') {
    throw new Error('not-answerable');
  }

  const already = room.answers.some(
    (a) => a.playerId === player.id && a.partId === input.partId && a.microId === input.microId,
  );
  if (already) throw new Error('already-answered');

  const correct = gradeAnswer(
    room.frqId,
    input.partId,
    input.microId,
    input.answerId,
    input.answerValue,
  );
  const now = Date.now();
  // Live scoring is time-to-answer from question reveal. Self-paced has
  // no shared clock, so pin the "speed" at the window midpoint so
  // accuracy + streak drive the leaderboard.
  const ms = room.pacing === 'self'
    ? ANSWER_WINDOW_MS / 2
    : room.questionStartedAt ? now - room.questionStartedAt : ANSWER_WINDOW_MS;
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

  return { correct, points, newScore: player.score, newStreak: nextStreak };
}
