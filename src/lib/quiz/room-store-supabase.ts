// Supabase backend. Used when NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_ANON_KEY
// are set. Writes through the anon client — the RLS policies added in
// migration 003 allow inserts/updates to quiz_rooms/players/answers
// without host auth (Phase-2 permissive; tightened in a later phase).
import type { SupabaseClient } from '@supabase/supabase-js';
import { computeNextPhase, computePoints, gradeAnswer, mintPin, ANSWER_WINDOW_MS } from './room-logic';
import type { Room, RoomAnswer, RoomPacing, RoomPhase, RoomPlayer } from './room-types';
import type {
  CreateRoomInput,
  JoinResult,
  SubmitAnswerInput,
  SubmitAnswerResult,
} from './room-store-types';

// ---------- row ↔ Room hydration ----------
//
// DB column names are snake_case (see migration 002); the client and the
// rest of the app use camelCase. All the glue is here so nothing else
// has to know about the mismatch.

interface RoomRow {
  id: string;
  pin: string;
  host_user_id: string | null;
  frq_id: string;
  pacing: RoomPacing;
  phase: RoomPhase;
  part_idx: number;
  micro_idx: number;
  question_started_at: string | null;
  created_at: string;
  updated_at: string;
}

interface PlayerRow {
  id: string;
  room_id: string;
  token: string;
  display_name: string;
  user_id: string | null;
  score: number;
  streak: number;
  joined_at: string;
}

interface AnswerRow {
  id: string;
  room_id: string;
  player_id: string;
  part_id: string;
  micro_id: string;
  answer_id: string | null;
  answer_value: number | null;
  correct: boolean;
  ms_to_answer: number;
  points: number;
  created_at: string;
}

const toMs = (iso: string | null) => (iso ? Date.parse(iso) : 0);

function hydrate(room: RoomRow, players: PlayerRow[], answers: AnswerRow[]): Room {
  return {
    id: room.id,
    pin: room.pin,
    frqId: room.frq_id,
    pacing: room.pacing,
    phase: room.phase,
    partIdx: room.part_idx,
    microIdx: room.micro_idx,
    questionStartedAt: room.question_started_at ? Date.parse(room.question_started_at) : null,
    createdAt: toMs(room.created_at),
    updatedAt: toMs(room.updated_at),
    hostUserId: room.host_user_id,
    players: players.map(toPlayer),
    answers: answers.map(toAnswer),
  };
}

function toPlayer(p: PlayerRow): RoomPlayer {
  return {
    id: p.id,
    displayName: p.display_name,
    score: p.score,
    streak: p.streak,
    joinedAt: toMs(p.joined_at),
  };
}

function toAnswer(a: AnswerRow): RoomAnswer {
  return {
    playerId: a.player_id,
    partId: a.part_id,
    microId: a.micro_id,
    answerId: a.answer_id ?? undefined,
    answerValue: a.answer_value ?? undefined,
    correct: a.correct,
    msToAnswer: a.ms_to_answer,
    points: a.points,
    createdAt: toMs(a.created_at),
  };
}

async function loadRoom(supabase: SupabaseClient, roomRow: RoomRow): Promise<Room> {
  const [players, answers] = await Promise.all([
    supabase.from('quiz_players').select('*').eq('room_id', roomRow.id).order('joined_at'),
    supabase.from('quiz_answers').select('*').eq('room_id', roomRow.id).order('created_at'),
  ]);
  if (players.error) throw players.error;
  if (answers.error) throw answers.error;
  return hydrate(roomRow, (players.data ?? []) as PlayerRow[], (answers.data ?? []) as AnswerRow[]);
}

// ---------- API ----------

export async function createRoom(
  supabase: SupabaseClient,
  input: CreateRoomInput,
): Promise<Room> {
  // PIN uniqueness: probe each candidate against the DB; the unique
  // constraint on quiz_rooms.pin is the ultimate guard if we race.
  const pin = await mintPinSupabase(supabase);
  // Self-paced rooms jump straight to 'question' — no lobby wait.
  const selfPaced = input.pacing === 'self';
  const { data, error } = await supabase
    .from('quiz_rooms')
    .insert({
      pin,
      frq_id: input.frqId,
      pacing: input.pacing,
      phase: selfPaced ? 'question' : 'lobby',
      host_user_id: input.hostUserId ?? null,
    })
    .select('*')
    .single();
  if (error) throw error;
  return hydrate(data as RoomRow, [], []);
}

async function mintPinSupabase(supabase: SupabaseClient): Promise<string> {
  // Probe in a small loop. Uses the shared mintPin alphabet so PINs
  // match the memory backend exactly.
  for (let i = 0; i < 10; i++) {
    const candidate = mintPin(() => false);
    const { data } = await supabase
      .from('quiz_rooms')
      .select('id')
      .eq('pin', candidate)
      .maybeSingle();
    if (!data) return candidate;
  }
  throw new Error('Could not mint unique room PIN');
}

export async function getRoom(supabase: SupabaseClient, roomId: string): Promise<Room | null> {
  const { data, error } = await supabase
    .from('quiz_rooms')
    .select('*')
    .eq('id', roomId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return loadRoom(supabase, data as RoomRow);
}

export async function getRoomByPin(supabase: SupabaseClient, pin: string): Promise<Room | null> {
  const { data, error } = await supabase
    .from('quiz_rooms')
    .select('*')
    .eq('pin', pin)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return loadRoom(supabase, data as RoomRow);
}

export async function joinRoom(
  supabase: SupabaseClient,
  roomId: string,
  displayName: string,
): Promise<JoinResult> {
  const roomRes = await supabase
    .from('quiz_rooms')
    .select('*')
    .eq('id', roomId)
    .maybeSingle();
  if (roomRes.error) throw roomRes.error;
  const roomRow = roomRes.data as RoomRow | null;
  if (!roomRow) throw new Error('room-not-found');
  // Live rooms close once the host starts. Self-paced accepts all comers.
  if (roomRow.pacing === 'live' && roomRow.phase !== 'lobby') {
    throw new Error('room-already-started');
  }

  const name = displayName.trim().slice(0, 24);
  if (!name) throw new Error('display-name-required');

  const dupe = await supabase
    .from('quiz_players')
    .select('id')
    .eq('room_id', roomId)
    .ilike('display_name', name)
    .maybeSingle();
  if (dupe.data) throw new Error('display-name-taken');

  const token = globalThis.crypto.randomUUID();
  const insert = await supabase
    .from('quiz_players')
    .insert({
      room_id: roomId,
      display_name: name,
      token,
    })
    .select('*')
    .single();
  if (insert.error) throw insert.error;
  const playerRow = insert.data as PlayerRow;

  // bump room updated_at so subscribers see a change
  await supabase.from('quiz_rooms').update({ updated_at: new Date().toISOString() }).eq('id', roomId);

  const room = await loadRoom(supabase, roomRow);
  return { room, player: toPlayer(playerRow), token };
}

export async function advancePhase(
  supabase: SupabaseClient,
  roomId: string,
): Promise<Room> {
  const roomRes = await supabase
    .from('quiz_rooms')
    .select('*')
    .eq('id', roomId)
    .maybeSingle();
  if (roomRes.error) throw roomRes.error;
  const roomRow = roomRes.data as RoomRow | null;
  if (!roomRow) throw new Error('room-not-found');

  const current = {
    phase: roomRow.phase,
    partIdx: roomRow.part_idx,
    microIdx: roomRow.micro_idx,
    frqId: roomRow.frq_id,
  };
  const next = computeNextPhase(current);

  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (next.phase !== undefined) patch.phase = next.phase;
  if (next.partIdx !== undefined) patch.part_idx = next.partIdx;
  if (next.microIdx !== undefined) patch.micro_idx = next.microIdx;
  if (next.questionStartedAt !== undefined) {
    patch.question_started_at = next.questionStartedAt ? new Date(next.questionStartedAt).toISOString() : null;
  }

  const upd = await supabase
    .from('quiz_rooms')
    .update(patch)
    .eq('id', roomId)
    .select('*')
    .single();
  if (upd.error) throw upd.error;
  return loadRoom(supabase, upd.data as RoomRow);
}

export async function submitAnswer(
  supabase: SupabaseClient,
  input: SubmitAnswerInput,
): Promise<SubmitAnswerResult> {
  const playerRes = await supabase
    .from('quiz_players')
    .select('*')
    .eq('token', input.token)
    .maybeSingle();
  if (playerRes.error) throw playerRes.error;
  const playerRow = playerRes.data as PlayerRow | null;
  if (!playerRow) throw new Error('bad-token');

  const roomRes = await supabase
    .from('quiz_rooms')
    .select('*')
    .eq('id', playerRow.room_id)
    .maybeSingle();
  if (roomRes.error) throw roomRes.error;
  const roomRow = roomRes.data as RoomRow | null;
  if (!roomRow) throw new Error('room-not-found');
  if (roomRow.pacing === 'live' && roomRow.phase !== 'question') {
    throw new Error('not-answerable');
  }

  // Enforce one-answer-per-micro-per-player.
  const already = await supabase
    .from('quiz_answers')
    .select('id')
    .eq('player_id', playerRow.id)
    .eq('part_id', input.partId)
    .eq('micro_id', input.microId)
    .maybeSingle();
  if (already.data) throw new Error('already-answered');

  const correct = gradeAnswer(
    roomRow.frq_id,
    input.partId,
    input.microId,
    input.answerId,
    input.answerValue,
  );
  const now = Date.now();
  const startedAt = roomRow.question_started_at ? Date.parse(roomRow.question_started_at) : null;
  // Self-paced: no shared clock, pin speed at window midpoint.
  const ms = roomRow.pacing === 'self'
    ? ANSWER_WINDOW_MS / 2
    : startedAt ? now - startedAt : ANSWER_WINDOW_MS;
  const nextStreak = correct ? playerRow.streak + 1 : 0;
  const points = computePoints(correct, ms, nextStreak);

  const ansInsert = await supabase
    .from('quiz_answers')
    .insert({
      room_id: roomRow.id,
      player_id: playerRow.id,
      part_id: input.partId,
      micro_id: input.microId,
      answer_id: input.answerId ?? null,
      answer_value: input.answerValue ?? null,
      correct,
      ms_to_answer: ms,
      points,
    })
    .select('id')
    .single();
  if (ansInsert.error) throw ansInsert.error;

  const newScore = playerRow.score + points;
  const playerUpd = await supabase
    .from('quiz_players')
    .update({ score: newScore, streak: nextStreak })
    .eq('id', playerRow.id);
  if (playerUpd.error) throw playerUpd.error;

  // Nudge the room row so room-level subscribers (host) recompute
  // answer counts without us having to subscribe to quiz_answers too.
  await supabase
    .from('quiz_rooms')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', roomRow.id);

  return { correct, points, newScore, newStreak: nextStreak };
}
