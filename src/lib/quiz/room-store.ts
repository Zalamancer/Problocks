// Entry point for room persistence. Dispatches to either the Supabase
// backend (Phase 2 default when env is configured) or the in-memory
// backend (local dev fallback). Both backends share the same async
// signatures so the API routes don't know or care.
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import * as memory from './room-store-memory';
import * as sb from './room-store-supabase';
import type {
  CreateRoomInput,
  JoinResult,
  SubmitAnswerInput,
  SubmitAnswerResult,
} from './room-store-types';
import type { Room } from './room-types';

export type { CreateRoomInput, JoinResult, SubmitAnswerInput, SubmitAnswerResult };
export { getFrq } from './room-logic';

function useSupabase(): boolean {
  return isSupabaseConfigured() && supabase !== null;
}

export async function createRoom(input: CreateRoomInput): Promise<Room> {
  if (useSupabase()) return sb.createRoom(supabase!, input);
  return memory.createRoom(input);
}

export async function getRoom(roomId: string): Promise<Room | null> {
  if (useSupabase()) return sb.getRoom(supabase!, roomId);
  return memory.getRoom(roomId);
}

export async function getRoomByPin(pin: string): Promise<Room | null> {
  if (useSupabase()) return sb.getRoomByPin(supabase!, pin);
  return memory.getRoomByPin(pin);
}

export async function joinRoom(
  roomId: string,
  displayName: string,
): Promise<JoinResult> {
  if (useSupabase()) return sb.joinRoom(supabase!, roomId, displayName);
  return memory.joinRoom(roomId, displayName);
}

export async function advancePhase(roomId: string): Promise<Room> {
  if (useSupabase()) return sb.advancePhase(supabase!, roomId);
  return memory.advancePhase(roomId);
}

export async function submitAnswer(
  input: SubmitAnswerInput,
): Promise<SubmitAnswerResult> {
  if (useSupabase()) return sb.submitAnswer(supabase!, input);
  return memory.submitAnswer(input);
}

// Expose which backend is active so the client can decide whether to
// subscribe to realtime or fall back to 1s polling.
export function activeBackend(): 'supabase' | 'memory' {
  return useSupabase() ? 'supabase' : 'memory';
}
