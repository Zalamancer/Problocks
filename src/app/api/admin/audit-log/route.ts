import { NextRequest, NextResponse } from 'next/server';
import { isPlatformAdmin } from '@/lib/teacher-auth';
import { getAdminSupabase } from '@/lib/supabase-admin';

// GET /api/admin/audit-log?action=<filter>&actor=<sub>&target=<id>&limit=<n>
// Returns the admin audit trail, most recent first. Admin-only.

interface AuditRow {
  id: string;
  actor_sub: string;
  actor_email: string | null;
  action: string;
  target_type: string;
  target_id: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export async function GET(request: NextRequest) {
  if (!(await isPlatformAdmin())) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }
  const admin = getAdminSupabase();
  if (!admin) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 503 });
  }

  const sp = request.nextUrl.searchParams;
  const action = sp.get('action');
  const actor = sp.get('actor');
  const target = sp.get('target');
  const limitRaw = Number(sp.get('limit')) || 100;
  const limit = Math.min(Math.max(limitRaw, 1), 500);

  let query = admin
    .from('admin_audit_log')
    .select('id, actor_sub, actor_email, action, target_type, target_id, metadata, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (action) query = query.eq('action', action);
  if (actor) query = query.eq('actor_sub', actor);
  if (target) query = query.eq('target_id', target);

  const { data, error } = await query.returns<AuditRow[]>();
  if (error) {
    console.error('Audit log fetch error:', error);
    return NextResponse.json({ error: 'Failed to load audit log' }, { status: 500 });
  }

  return NextResponse.json({ entries: data ?? [] });
}
