import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// PATCH /api/moderation/reports/:id
// Body: { action: 'reviewed' | 'dismissed' }
// Marks a single report as resolved without touching the associated game.
// Use the /api/moderation/games/:id endpoint when the resolution is to
// reject the game — that one cascades and auto-dismisses open reports.

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => null) as { action?: 'reviewed' | 'dismissed' } | null;

  if (!body || (body.action !== 'reviewed' && body.action !== 'dismissed')) {
    return NextResponse.json({ error: "Invalid action — expected 'reviewed' or 'dismissed'" }, { status: 400 });
  }

  if (!isSupabaseConfigured() || !supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const { data, error } = await supabase
    .from('game_reports')
    .update({
      status: body.action,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('id, status')
    .single();

  if (error || !data) {
    console.error('Moderate report error:', error);
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
  }

  return NextResponse.json({ report: data });
}
