import { NextRequest, NextResponse } from 'next/server';
import { startRace } from '@/lib/race/race-store';
import { toPublicRace } from '@/lib/race/race-types';

// POST /api/race/rooms/[raceId]/start — teacher flips the room from
// 'lobby' to 'running'. Re-pins every player to their spawn so anyone
// who walked around in the lobby starts fair.

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ raceId: string }> },
) {
  try {
    const { raceId } = await params;
    const race = await startRace(raceId);
    return NextResponse.json({ race: toPublicRace(race) });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
