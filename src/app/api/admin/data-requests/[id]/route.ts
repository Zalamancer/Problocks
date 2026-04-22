import { NextRequest, NextResponse } from 'next/server';
import { isPlatformAdmin, logAdminAction } from '@/lib/teacher-auth';
import { getAdminSupabase } from '@/lib/supabase-admin';
import { sendEmail, dataRequestEmail } from '@/lib/email';

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

  // Load the existing row too so we can compose the auto-ack email with
  // the requester info. Select * is fine here — this is service-role and
  // the row is small.
  const { data, error } = await admin
    .from('data_requests')
    .update({ status: body.status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id, status, kind, requester_email, requester_name, student_name')
    .single();

  if (error || !data) {
    console.error('Update data_request error:', error);
    return NextResponse.json({ error: 'Failed to update request' }, { status: 404 });
  }

  await logAdminAction({
    action: `data_request.${body.status}`,
    targetType: 'data_request',
    targetId: id,
    metadata: { newStatus: body.status },
  });

  // Auto-ack the requester for the three terminal-ish transitions.
  // Reopen (→'open') stays silent; we don't want to spam on corrections.
  if (body.status === 'in_progress' || body.status === 'fulfilled' || body.status === 'denied') {
    try {
      const email = dataRequestEmail(
        data as Parameters<typeof dataRequestEmail>[0],
        body.status
      );
      const res = await sendEmail(email);
      if (!res.ok && !res.skipped) {
        console.error('[data_request] email send failed:', res.error);
      }
    } catch (err) {
      // Never fail the route over an email error — the state change is
      // already persisted.
      console.error('[data_request] email composition failed:', err);
    }
  }

  return NextResponse.json({ request: data });
}
