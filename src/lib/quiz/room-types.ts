// Shared types for the Kahoot-style Live Quiz mode. Kept in lib/ (not in
// a component file) so both the server routes and the client UIs can
// import them without dragging React in.

export type RoomPhase = 'lobby' | 'question' | 'reveal' | 'leaderboard' | 'done';
export type RoomPacing = 'live' | 'self';

export interface RoomPlayer {
  id: string;
  displayName: string;
  score: number;
  streak: number;
  joinedAt: number;
}

export interface RoomAnswer {
  playerId: string;
  partId: string;
  microId: string;
  answerId?: string;
  answerValue?: number;
  // Storage object path in the `quiz-whiteboards` bucket. Set for
  // whiteboard-kind submissions; the host dashboard fetches a signed
  // URL on demand.
  answerImagePath?: string;
  correct: boolean;
  msToAnswer: number;
  points: number;
  createdAt: number;
}

export interface Room {
  id: string;
  pin: string;
  frqId: string;
  pacing: RoomPacing;
  phase: RoomPhase;
  partIdx: number;
  microIdx: number;
  questionStartedAt: number | null;
  createdAt: number;
  updatedAt: number;
  hostUserId?: string | null;
  players: RoomPlayer[];
  answers: RoomAnswer[];
}

// What we ship to the wire. Same shape as Room minus the host's private
// stuff (today none, but keeps the contract explicit).
export type RoomPublic = Omit<Room, 'hostUserId'>;

export function toPublic(r: Room): RoomPublic {
  const { hostUserId: _host, ...rest } = r;
  return rest;
}
