import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createRoom, getRoomByPin } from '@/lib/quiz/room-store';
import { toPublic } from '@/lib/quiz/room-types';
import { enforceRateLimit, ipFromRequest } from '@/lib/rate-limit';

// POST /api/quiz/rooms — host creates a new room.
// GET  /api/quiz/rooms?pin=XXXXXX — student looks up a room by PIN.
//
// Quiz PINs are short (6-char alphabet from {2..9}, ~262k combinations)
// and brute-forceable. The pin-lookup rate limit was added in Sprint 7.4
// and moved onto the durable Supabase counter in Sprint 8.1 so it holds
// across serverless instances.

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const frqId = typeof body?.frqId === 'string' ? body.frqId : 'cart-on-incline';
    const pacing = body?.pacing === 'self' ? 'self' : 'live';

    const session = await getServerSession(authOptions);
    const hostUserId = session?.user?.email ?? null;

    const room = await createRoom({ frqId, pacing, hostUserId });
    return NextResponse.json({
      room: toPublic(room),
      roomId: room.id,
      pin: room.pin,
      hostUserId,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  const ok = await enforceRateLimit({
    bucket: 'quiz.pin-lookup',
    actor: ipFromRequest(req),
    max: 15,
    windowSeconds: 60,
  });
  if (!ok) {
    return NextResponse.json({ error: 'too-many-requests' }, { status: 429 });
  }

  const pin = req.nextUrl.searchParams.get('pin');
  if (!pin) return NextResponse.json({ error: 'pin-required' }, { status: 400 });
  const room = await getRoomByPin(pin);
  if (!room) return NextResponse.json({ error: 'not-found' }, { status: 404 });
  return NextResponse.json({ room: toPublic(room) });
}
