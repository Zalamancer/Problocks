import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// POST /api/games/:id/play
// Logs one play event and atomically bumps plays_count. Fired by the /play
// page on mount (so it counts loads, not completions — good enough for
// Sprint 1; Sprint 2 adds completion-based events).

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!isSupabaseConfigured() || !supabase) {
    return NextResponse.json({ ok: false, warning: 'Supabase not configured' });
  }

  const body = await request.json().catch(() => ({})) as { playerId?: string };
  const playerId = typeof body.playerId === 'string' ? body.playerId.slice(0, 120) : null;

  const { error: insertError } = await supabase
    .from('play_events')
    .insert({ game_id: id, player_id: playerId });

  if (insertError) {
    console.error('Play event insert error:', insertError);
    return NextResponse.json({ error: 'Failed to log play' }, { status: 500 });
  }

  const { error: rpcError } = await supabase.rpc('increment_game_plays', { p_game_id: id });
  if (rpcError) {
    // Non-fatal: the event row is the source of truth; plays_count is a cached
    // aggregate. Log but still tell the client we logged the play.
    console.error('increment_game_plays error:', rpcError);
  }

  return NextResponse.json({ ok: true });
}
