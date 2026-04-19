import { NextResponse } from 'next/server';
import { advancePhase } from '@/lib/quiz/room-store';
import { toPublic } from '@/lib/quiz/room-types';

// POST /api/quiz/rooms/[roomId]/advance — host-only phase advance.
// Phase 1 trusts that whoever hits this is the host (the URL is only
// visible in the studio). Phase 2 will gate on hostUserId.

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ roomId: string }> },
) {
  try {
    const { roomId } = await params;
    const room = advancePhase(roomId);
    return NextResponse.json({ room: toPublic(room) });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
