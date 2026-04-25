/**
 * Slice 5/6 of the freeform-3D tycoon scripting layer.
 *
 * POST /api/game-state/[gameId]/tick
 *
 * Body: { amount: number }    — coins earned in the batch since the
 *                                last tick post (positive integer).
 *
 *   200 { game_id, coins, inventory, upgrades, updated_at }
 *   401 { error: 'auth required' }
 *   429 { error: 'rate exceeded' } — server's earn_coins rate cap
 *   400 { error: 'bad amount'    }
 *
 * The 60-second elapsed cap and 1000 coins/sec rate ceiling live in
 * the earn_coins() RPC. Anti-AFK and anti-fast-forward are server
 * concerns — the client just batches and posts.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { getServerSupabase, requireServerUser, ServerAuthError } from '@/lib/supabase-server';

interface TickBody {
  amount: number;
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ gameId: string }> },
) {
  let user;
  try {
    user = await requireServerUser();
  } catch (err) {
    if (err instanceof ServerAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }

  const { gameId } = await ctx.params;
  if (!gameId || gameId.length > 200) {
    return NextResponse.json({ error: 'bad gameId' }, { status: 400 });
  }

  let body: TickBody | null;
  try {
    body = (await req.json()) as TickBody;
  } catch {
    return NextResponse.json({ error: 'bad JSON' }, { status: 400 });
  }
  if (!body || typeof body.amount !== 'number' || !Number.isFinite(body.amount) || body.amount < 0) {
    return NextResponse.json({ error: 'bad amount' }, { status: 400 });
  }

  const amount = Math.floor(body.amount);
  // Empty batch — no-op fast path; saves an RPC round trip when the
  // client flushes during a quiet stretch (no pets, no grants).
  if (amount === 0) {
    return NextResponse.json({ ok: true });
  }

  const supabase = await getServerSupabase();
  const { data, error } = await supabase.rpc('earn_coins', {
    p_game_id: gameId,
    p_amount: amount,
  });

  if (error) {
    console.error('[game-state/tick] rpc failed', { gameId, userId: user.id, amount, error });
    return NextResponse.json({ error: 'rpc failed' }, { status: 500 });
  }
  // RPC returns NULL when the rate cap is exceeded.
  if (!data) {
    return NextResponse.json({ error: 'rate exceeded' }, { status: 429 });
  }

  return NextResponse.json(data);
}
