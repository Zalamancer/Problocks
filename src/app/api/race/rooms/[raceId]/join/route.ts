import { NextRequest, NextResponse } from 'next/server';
import { joinRace } from '@/lib/race/race-store';
import { toPublicRace } from '@/lib/race/race-types';

// POST /api/race/rooms/[raceId]/join — student lobbies with a
// nickname and receives an opaque token to store in localStorage. The
// server picks their starting tile — every student lands on a unique
// bottom-row cell so the "different starting locations" promise is
// enforced by the backend, not the client.

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ raceId: string }> },
) {
  try {
    const { raceId } = await params;
    const body = await req.json();
    const displayName = typeof body?.displayName === 'string' ? body.displayName : '';
    const { race, player, token } = await joinRace(raceId, displayName);
    return NextResponse.json({
      race: toPublicRace(race),
      player,
      token,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
