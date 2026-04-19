import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createRoom, getRoomByPin } from '@/lib/quiz/room-store';
import { toPublic } from '@/lib/quiz/room-types';

// POST /api/quiz/rooms — host creates a new room.
// GET  /api/quiz/rooms?pin=XXXXXX — student looks up a room by PIN.
//
// Host auth is best-effort: if there's a Google session we bind the
// room to that email and /advance will gate on it. Rooms created
// without a session stay open (Phase-3 permissive fallback).

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
  const pin = req.nextUrl.searchParams.get('pin');
  if (!pin) return NextResponse.json({ error: 'pin-required' }, { status: 400 });
  const room = await getRoomByPin(pin);
  if (!room) return NextResponse.json({ error: 'not-found' }, { status: 404 });
  return NextResponse.json({ room: toPublic(room) });
}
