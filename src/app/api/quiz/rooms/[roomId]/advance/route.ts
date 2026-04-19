import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { advancePhase, getRoom } from '@/lib/quiz/room-store';
import { toPublic } from '@/lib/quiz/room-types';

// POST /api/quiz/rooms/[roomId]/advance — host-only phase advance.
// Gate: if the room was created by a signed-in host, only that host's
// session can advance. Rooms created without auth stay open (legacy +
// local-dev flow). Self-paced rooms have no meaningful phase machine;
// treat advance as a no-op success for them.

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ roomId: string }> },
) {
  try {
    const { roomId } = await params;
    const room = await getRoom(roomId);
    if (!room) return NextResponse.json({ error: 'not-found' }, { status: 404 });

    if (room.hostUserId) {
      const session = await getServerSession(authOptions);
      const email = session?.user?.email ?? null;
      if (email !== room.hostUserId) {
        return NextResponse.json({ error: 'not-host' }, { status: 403 });
      }
    }

    if (room.pacing === 'self') {
      // Self-paced has no host-driven phase transitions; return the
      // current room so callers don't need a pacing-specific branch.
      return NextResponse.json({ room: toPublic(room) });
    }

    const advanced = await advancePhase(roomId);
    return NextResponse.json({ room: toPublic(advanced) });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
