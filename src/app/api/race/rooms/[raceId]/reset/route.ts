import { NextRequest, NextResponse } from 'next/server';
import { resetHeat } from '@/lib/race/race-store';
import { toPublicRace } from '@/lib/race/race-types';

// POST /api/race/rooms/[raceId]/reset — teacher starts a new heat.
// Trophies (lifetime) are preserved; everything else (positions,
// finish order, moves) is wiped and spawn tiles re-shuffled so the
// same class can race again without re-joining.

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ raceId: string }> },
) {
  try {
    const { raceId } = await params;
    const race = await resetHeat(raceId);
    return NextResponse.json({ race: toPublicRace(race) });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
