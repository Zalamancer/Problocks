import { NextRequest, NextResponse } from 'next/server';
import { isPlatformAdmin } from '@/lib/teacher-auth';
import { getAdminSupabase } from '@/lib/supabase-admin';

// PATCH /api/admin/data-requests/:id
// Body: { status: 'in_progress' | 'fulfilled' | 'denied' | 'open' }
// Admins transition a request through its lifecycle. Re-opening (→'open')
// is allowed so we can correct mistaken dismissals.

const VALID_STATUSES = new Set(['open', 'in_progress', 'fulfilled', 'denied']);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isPlatformAdmin())) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null) as { status?: string } | null;

  if (!body?.status || !VALID_STATUSES.has(body.status)) {
    return NextResponse.json({ error: 'Invalid status — expected open / in_progress / fulfilled / denied' }, { status: 400 });
  }

  const admin = getAdminSupabase();
  if (!admin) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 503 });
  }

  const { data, error } = await admin
    .from('data_requests')
    .update({ status: body.status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id, status')
    .single();

  if (error || !data) {
    console.error('Update data_request error:', error);
    return NextResponse.json({ error: 'Failed to update request' }, { status: 404 });
  }

  return NextResponse.json({ request: data });
}
