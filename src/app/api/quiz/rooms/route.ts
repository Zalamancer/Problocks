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
//
// Pre-prod audit flagged quiz PINs as weak (6-char alphabet from
// {2..9}, ~262k combinations) and brute-forceable. Sprint 7.4 adds a
// per-IP rate limit on the pin lookup so a scraper can't walk the
// space. Matches the pattern used in /api/classes/lookup.

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 15;
const pinHits = new Map<string, number[]>();

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const arr = (pinHits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (arr.length >= MAX_PER_WINDOW) {
    pinHits.set(ip, arr);
    return false;
  }
  arr.push(now);
  pinHits.set(ip, arr);
  return true;
}

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
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim()
    || req.headers.get('x-real-ip')
    || 'anon';
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: 'too-many-requests' }, { status: 429 });
  }

  const pin = req.nextUrl.searchParams.get('pin');
  if (!pin) return NextResponse.json({ error: 'pin-required' }, { status: 400 });
  const room = await getRoomByPin(pin);
  if (!room) return NextResponse.json({ error: 'not-found' }, { status: 404 });
  return NextResponse.json({ room: toPublic(room) });
}
