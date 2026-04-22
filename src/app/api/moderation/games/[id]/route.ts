import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { isSignedInTeacher } from '@/lib/teacher-auth';

// PATCH /api/moderation/games/:id
// Body: { action: 'approve' | 'reject' }
//
// Approving flips moderation_status='approved' and leaves is_published
// alone (it was flipped true via the Share flow in the studio). Rejecting
// flips moderation_status='rejected' AND is_published=false so the /play
// route starts returning 404 and any stale /play link stops working.

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isSignedInTeacher())) {
    return NextResponse.json({ error: 'Teacher sign-in required' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null) as { action?: 'approve' | 'reject' } | null;

  if (!body || (body.action !== 'approve' && body.action !== 'reject')) {
    return NextResponse.json({ error: "Invalid action — expected 'approve' or 'reject'" }, { status: 400 });
  }

  if (!isSupabaseConfigured() || !supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const updates: Record<string, unknown> = {
    moderation_status: body.action === 'approve' ? 'approved' : 'rejected',
    updated_at: new Date().toISOString(),
  };
  if (body.action === 'reject') {
    updates.is_published = false;
  }

  const { data, error } = await supabase
    .from('games')
    .update(updates)
    .eq('id', id)
    .select('id, moderation_status, is_published')
    .single();

  if (error || !data) {
    console.error('Moderate game error:', error);
    return NextResponse.json({ error: 'Failed to update game moderation' }, { status: 500 });
  }

  // When we reject a game, also auto-dismiss any open reports against it so
  // the queue doesn't keep re-surfacing the same decision.
  if (body.action === 'reject') {
    await supabase
      .from('game_reports')
      .update({ status: 'dismissed', reviewed_at: new Date().toISOString() })
      .eq('game_id', id)
      .eq('status', 'open');
  }

  return NextResponse.json({ game: data });
}
