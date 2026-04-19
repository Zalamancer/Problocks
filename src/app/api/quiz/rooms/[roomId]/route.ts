import { NextResponse } from 'next/server';
import { getRoom } from '@/lib/quiz/room-store';
import { toPublic } from '@/lib/quiz/room-types';

// GET /api/quiz/rooms/[roomId] — polling endpoint used by host screen
// and student screens until Phase 2 swaps to Supabase Realtime.

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ roomId: string }> },
) {
  const { roomId } = await params;
  const room = getRoom(roomId);
  if (!room) return NextResponse.json({ error: 'not-found' }, { status: 404 });
  return NextResponse.json({ room: toPublic(room) });
}
