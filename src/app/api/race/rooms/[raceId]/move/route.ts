import { NextRequest, NextResponse } from 'next/server';
import { movePlayer } from '@/lib/race/race-store';
import { toPublicRace } from '@/lib/race/race-types';
import type { MoveDir } from '@/lib/race/race-types';

// POST /api/race/rooms/[raceId]/move — student submits a single-step
// move in one of the four cardinal directions. The server is the
// source of truth for "did I reach the door?" so finishRank can't be
// gamed by a tampered client.

const DIRS: ReadonlySet<MoveDir> = new Set(['up', 'down', 'left', 'right']);

export async function POST(
  req: NextRequest,
  { params: _params }: { params: Promise<{ raceId: string }> },
) {
  try {
    const body = await req.json();
    const token = typeof body?.token === 'string' ? body.token : '';
    const dir = typeof body?.dir === 'string' ? (body.dir as MoveDir) : null;
    if (!token) return NextResponse.json({ error: 'token-required' }, { status: 400 });
    if (!dir || !DIRS.has(dir)) return NextResponse.json({ error: 'bad-direction' }, { status: 400 });
    const { race, player, won, finishRank } = await movePlayer(token, dir);
    return NextResponse.json({
      race: toPublicRace(race),
      player,
      won,
      finishRank,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
