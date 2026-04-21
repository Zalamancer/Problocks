import { NextRequest, NextResponse } from 'next/server';
import { createRace, getRaceByPin } from '@/lib/race/race-store';
import { toPublicRace } from '@/lib/race/race-types';

// POST /api/race/rooms       — teacher opens a new race room.
// GET  /api/race/rooms?pin=… — student looks up a race by PIN.
//
// Kept auth-free on purpose: Race mode is the warm-up activity for
// the classroom and the teacher often fires it from a second device.
// We can bolt auth on later by adopting the same next-auth session
// pattern the quiz host uses — for now the PIN is the shared secret.

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const cols = typeof body?.cols === 'number' ? body.cols : undefined;
    const rows = typeof body?.rows === 'number' ? body.rows : undefined;
    const doorCol = typeof body?.doorCol === 'number' ? body.doorCol : undefined;
    const doorWidth = typeof body?.doorWidth === 'number' ? body.doorWidth : undefined;
    const race = await createRace({ cols, rows, doorCol, doorWidth });
    return NextResponse.json({
      race: toPublicRace(race),
      raceId: race.id,
      pin: race.pin,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  const pin = req.nextUrl.searchParams.get('pin');
  if (!pin) return NextResponse.json({ error: 'pin-required' }, { status: 400 });
  const race = await getRaceByPin(pin);
  if (!race) return NextResponse.json({ error: 'not-found' }, { status: 404 });
  return NextResponse.json({ race: toPublicRace(race) });
}
