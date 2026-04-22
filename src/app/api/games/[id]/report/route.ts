import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { enforceRateLimit, ipFromRequest } from '@/lib/rate-limit';

// POST /api/games/:id/report
// Any player can flag a game from the /play surface. Sprint 8 moved the
// rate limit to a durable Supabase-backed counter (migration 021), so
// serverless cold starts no longer reset our caps.
//
// Body: { reason: 'inappropriate' | 'scary' | 'broken' | 'copy' | 'other';
//         details?: string; playerId?: string }

const VALID_REASONS = new Set(['inappropriate', 'scary', 'broken', 'copy', 'other']);
const MAX_DETAILS = 1000;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const ok = await enforceRateLimit({
    bucket: 'games.report',
    actor: ipFromRequest(request),
    max: 5,
    windowSeconds: 60,
  });
  if (!ok) {
    return NextResponse.json({ error: 'Too many reports from this IP — wait a minute.' }, { status: 429 });
  }

  const body = await request.json().catch(() => null) as {
    reason?: string;
    details?: string;
    playerId?: string;
  } | null;

  if (!body || typeof body.reason !== 'string' || !VALID_REASONS.has(body.reason)) {
    return NextResponse.json({ error: 'Invalid reason' }, { status: 400 });
  }

  const details = typeof body.details === 'string'
    ? body.details.slice(0, MAX_DETAILS).trim() || null
    : null;
  const reporterId = typeof body.playerId === 'string' ? body.playerId.slice(0, 120) : null;

  if (!isSupabaseConfigured() || !supabase) {
    return NextResponse.json({ ok: false, warning: 'Supabase not configured' });
  }

  const { error } = await supabase.from('game_reports').insert({
    game_id: id,
    reason: body.reason,
    details,
    reporter_id: reporterId,
  });

  if (error) {
    console.error('Insert report error:', error);
    return NextResponse.json({ error: 'Failed to file report' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
