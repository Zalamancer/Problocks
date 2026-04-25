/**
 * Slice 2/6 of the freeform-3D tycoon scripting layer.
 *
 * GET /api/game-state/[gameId]
 *
 * Returns the authenticated user's row in public.game_player_state for
 * the named game. Creates a fresh zero-coin row on first access so the
 * play-mode HUD never has to handle "no row yet" — the row starts
 * empty and grants/earns push it forward.
 *
 *   200 { game_id, coins, inventory[], upgrades[], updated_at }
 *   401 { error: 'auth required' }
 *   500 { error: 'fetch failed'  }
 *
 * No POST handler here on purpose — buys go to /[gameId]/buy and ticks
 * go to /[gameId]/tick (slice 5). Keeping this file read-only makes
 * its policy story trivial: SELECT under RLS, nothing else.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { getServerSupabase, requireServerUser, ServerAuthError } from '@/lib/supabase-server';

export async function GET(
  _req: NextRequest,
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

  const supabase = await getServerSupabase();

  // Try to fetch first — most calls after the first will hit this path.
  const { data: existing, error: fetchErr } = await supabase
    .from('game_player_state')
    .select('game_id, coins, inventory, upgrades, updated_at')
    .eq('game_id', gameId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (fetchErr) {
    console.error('[game-state GET] fetch failed', { gameId, userId: user.id, fetchErr });
    return NextResponse.json({ error: 'fetch failed' }, { status: 500 });
  }
  if (existing) {
    return NextResponse.json(existing);
  }

  // First-time entry: create the row with defaults. RLS WITH-CHECK
  // ensures we can only insert a row for ourselves.
  const { data: created, error: insertErr } = await supabase
    .from('game_player_state')
    .insert({ game_id: gameId, user_id: user.id })
    .select('game_id, coins, inventory, upgrades, updated_at')
    .single();

  if (insertErr || !created) {
    console.error('[game-state GET] insert failed', { gameId, userId: user.id, insertErr });
    return NextResponse.json({ error: 'init failed' }, { status: 500 });
  }
  return NextResponse.json(created);
}
