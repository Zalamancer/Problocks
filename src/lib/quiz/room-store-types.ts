// Shared input/output shapes for both backends. Keeping them in a
// separate file so backends don't import from each other.
import type { Room, RoomPacing, RoomPlayer } from './room-types';

export interface CreateRoomInput {
  frqId: string;
  pacing: RoomPacing;
  hostUserId?: string | null;
}

export interface JoinResult {
  room: Room;
  player: RoomPlayer;
  token: string;
}

export interface SubmitAnswerInput {
  token: string;
  partId: string;
  microId: string;
  answerId?: string;
  answerValue?: number;
  // Set when answering a whiteboard micro: storage path returned by
  // the /answer/image upload endpoint.
  answerImagePath?: string;
}

export interface SubmitAnswerResult {
  correct: boolean;
  points: number;
  newScore: number;
  newStreak: number;
}
