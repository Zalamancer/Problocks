import { NextRequest, NextResponse } from 'next/server';
import { joinRoom } from '@/lib/quiz/room-store';
import { toPublic } from '@/lib/quiz/room-types';

// POST /api/quiz/rooms/[roomId]/join — student lobbies with a nickname,
// receives an opaque token they store in localStorage for later calls.

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> },
) {
  try {
    const { roomId } = await params;
    const body = await req.json();
    const displayName = typeof body?.displayName === 'string' ? body.displayName : '';
    const { room, player, token } = joinRoom(roomId, displayName);
    return NextResponse.json({
      room: toPublic(room),
      player,
      token,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
