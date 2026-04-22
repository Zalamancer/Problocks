import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// POST /api/games/:id/report
// Any player can flag a game from the /play surface. Sprint 2 is intentionally
// open: the only backstop against spam is a per-IP in-memory rate limit
// (matches the pattern in /api/classes/lookup). Sprint 3 will move this to a
// durable store once auth is wired.
//
// Body: { reason: 'inappropriate' | 'scary' | 'broken' | 'copy' | 'other';
//         details?: string; playerId?: string }

const VALID_REASONS = new Set(['inappropriate', 'scary', 'broken', 'copy', 'other']);
const MAX_DETAILS = 1000;
const RATE_LIMIT_WINDOW_MS = 60_000;  // 1 minute
const RATE_LIMIT_MAX = 5;              // at most 5 reports / minute / ip

const ipReports = new Map<string, { count: number; resetAt: number }>();

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipReports.get(ip);
  if (!entry || entry.resetAt < now) {
    ipReports.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count += 1;
  return true;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!rateLimit(ip)) {
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
