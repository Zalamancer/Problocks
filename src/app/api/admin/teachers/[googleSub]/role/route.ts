import { NextRequest, NextResponse } from 'next/server';
import { isPlatformAdmin, getTeacherSession, logAdminAction } from '@/lib/teacher-auth';
import { getAdminSupabase } from '@/lib/supabase-admin';

// PATCH /api/admin/teachers/:googleSub/role
// Body: { role: 'teacher' | 'admin' }
// Grants or revokes the admin role. Requires the caller to already be an
// admin. Self-demotion is allowed but we block it if it would leave zero
// admins (otherwise we lock ourselves out).

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ googleSub: string }> }
) {
  if (!(await isPlatformAdmin())) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { googleSub } = await params;
  const body = await request.json().catch(() => null) as { role?: 'teacher' | 'admin' } | null;

  if (!body || (body.role !== 'teacher' && body.role !== 'admin')) {
    return NextResponse.json({ error: "Invalid role — expected 'teacher' or 'admin'" }, { status: 400 });
  }

  const admin = getAdminSupabase();
  if (!admin) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 503 });
  }

  // Safety: if we're about to demote the last admin, refuse. We count admins
  // BEFORE applying the change and only block when the target is currently
  // an admin AND the new role is 'teacher' AND there's only one admin left.
  if (body.role === 'teacher') {
    const { data: target } = await admin
      .from('teachers')
      .select('role')
      .eq('google_sub', googleSub)
      .maybeSingle<{ role: string }>();
    if (target?.role === 'admin') {
      const { count } = await admin
        .from('teachers')
        .select('google_sub', { count: 'exact', head: true })
        .eq('role', 'admin');
      if ((count ?? 0) <= 1) {
        return NextResponse.json({ error: 'Cannot demote the last remaining admin' }, { status: 409 });
      }
    }
  }

  // Log who did this so a future admin-audit surface has a trail. For now
  // the log line is good enough.
  const session = await getTeacherSession();
  console.info(`[admin] ${session?.user?.email ?? 'unknown'} set role=${body.role} on teacher ${googleSub}`);

  const { data, error } = await admin
    .from('teachers')
    .update({ role: body.role })
    .eq('google_sub', googleSub)
    .select('google_sub, role')
    .single();

  if (error || !data) {
    console.error('Update teacher role error:', error);
    return NextResponse.json({ error: 'Failed to update role' }, { status: 404 });
  }

  await logAdminAction({
    action: body.role === 'admin' ? 'role_grant' : 'role_revoke',
    targetType: 'teacher',
    targetId: googleSub,
    metadata: { newRole: body.role },
  });

  return NextResponse.json({ teacher: data });
}
