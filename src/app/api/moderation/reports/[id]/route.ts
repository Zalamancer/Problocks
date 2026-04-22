import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getAdminSupabase } from '@/lib/supabase-admin';
import { getTeacherSession, isPlatformAdmin, isGameInTeacherRoster, logAdminAction } from '@/lib/teacher-auth';

// PATCH /api/moderation/reports/:id
// Body: { action: 'reviewed' | 'dismissed' }
// Marks a single report as resolved without touching the associated game.
// Use the /api/moderation/games/:id endpoint when the resolution is to
// reject the game — that one cascades and auto-dismisses open reports.

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getTeacherSession();
  if (!session?.googleSub) {
    return NextResponse.json({ error: 'Teacher sign-in required' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null) as { action?: 'reviewed' | 'dismissed' } | null;

  if (!body || (body.action !== 'reviewed' && body.action !== 'dismissed')) {
    return NextResponse.json({ error: "Invalid action — expected 'reviewed' or 'dismissed'" }, { status: 400 });
  }

  const client = getAdminSupabase() ?? (isSupabaseConfigured() ? supabase : null);
  if (!client) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  // Admins can act on any report; teachers only on reports tied to their
  // roster. Look up the game id on the report first so we can defer to
  // isGameInTeacherRoster.
  const admin = await isPlatformAdmin();
  if (!admin) {
    const { data: report } = await client
      .from('game_reports')
      .select('game_id')
      .eq('id', id)
      .maybeSingle<{ game_id: string }>();
    if (!report?.game_id) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }
    if (!(await isGameInTeacherRoster(report.game_id, session.googleSub))) {
      return NextResponse.json({ error: 'Report is not in your roster' }, { status: 403 });
    }
  }

  const { data, error } = await client
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

  await logAdminAction({
    action: `report.${body.action}`,
    targetType: 'report',
    targetId: id,
    metadata: { newStatus: body.action, isAdmin: admin },
  });

  return NextResponse.json({ report: data });
}
