// Pure logic shared by both the in-memory and Supabase backends: the
// FRQ catalog, PIN alphabet, phase machine, and scoring curve. Keeping
// these side-effect-free so they can run on either side of the wire.
import { FRQ } from './frq-content';
import type { Frq } from './frq-content';
import type { Room } from './room-types';

// Right now we only ship one FRQ. Rooms reference it by id so we don't
// store the whole content blob in the DB — the client resolves by id.
const FRQ_CATALOG: Record<string, Frq> = { 'cart-on-incline': FRQ };

export function getFrq(id: string): Frq | null {
  return FRQ_CATALOG[id] ?? null;
}

// Skip ambiguous glyphs (0/O, 1/l) so a student typing from across the
// classroom doesn't misread the PIN. 6 chars × 8 symbols = ~262k codes.
const PIN_ALPHABET = '23456789';

export function mintPin(existing: (pin: string) => boolean): string {
  for (let attempt = 0; attempt < 40; attempt++) {
    let pin = '';
    for (let i = 0; i < 6; i++) {
      pin += PIN_ALPHABET[Math.floor(Math.random() * PIN_ALPHABET.length)];
    }
    if (!existing(pin)) return pin;
  }
  throw new Error('Could not mint unique room PIN');
}

// Phase machine: lobby → question → reveal → leaderboard → (next) → …
// → done. In self-paced mode the student drives themselves; in live
// mode the host advances everyone together.
export function computeNextPhase(
  room: Pick<Room, 'phase' | 'partIdx' | 'microIdx' | 'frqId'>,
): Partial<Room> {
  const frq = getFrq(room.frqId);
  if (!frq) throw new Error('frq-missing');
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

// Kahoot-style time-based scoring. Max 1000 points for an instant
// correct answer, linearly decaying to 500 at the answer-window end.
// Wrong answers score 0. Streak bonus: +100 per extra correct in a row,
// capped at +500.
export const ANSWER_WINDOW_MS = 20_000;

export function computePoints(
  correct: boolean,
  ms: number,
  nextStreak: number,
): number {
  if (!correct) return 0;
  const speed = Math.max(0, 1 - ms / ANSWER_WINDOW_MS);
  const base = Math.round(500 + 500 * speed);
  const bonus = Math.min(500, Math.max(0, nextStreak - 1) * 100);
  return base + bonus;
}

// Given a question's prompt and a player's raw answer, decide whether
// it's correct. Shared so the in-memory path and the Supabase path grade
// the same way without drift.
export function gradeAnswer(
  frqId: string,
  partId: string,
  microId: string,
  answerId?: string,
  answerValue?: number,
  answerImagePath?: string,
): boolean {
  const frq = getFrq(frqId);
  if (!frq) throw new Error('frq-missing');
  const part = frq.parts.find((p) => p.id === partId);
  if (!part) throw new Error('unknown-part');
  const micro = part.micros.find((m) => m.id === microId);
  if (!micro) throw new Error('unknown-micro');

  if (micro.kind === 'choice') {
    const opt = micro.options.find((o) => o.id === answerId);
    return !!opt?.correct;
  }
  if (micro.kind === 'whiteboard') {
    // Pixel-grading is a future job for the vision model. Anything that
    // arrived with an image path counts as a complete submission.
    return !!answerImagePath;
  }
  if (answerValue == null) throw new Error('value-required');
  return Math.abs(answerValue - micro.answer) <= micro.tol;
}
