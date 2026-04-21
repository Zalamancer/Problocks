import { NextRequest, NextResponse } from 'next/server';
import { getRace } from '@/lib/race/race-store';
import { toPublicRace } from '@/lib/race/race-types';

// GET /api/race/rooms/[raceId] — snapshot fetch used by useRace's
// polling loop and by any host-side manual refresh.

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ raceId: string }> },
) {
  const { raceId } = await params;
  const race = await getRace(raceId);
  if (!race) return NextResponse.json({ error: 'not-found' }, { status: 404 });
  return NextResponse.json({ race: toPublicRace(race) });
}
