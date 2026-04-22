import { NextRequest, NextResponse } from 'next/server';
import { isPlatformAdmin } from '@/lib/teacher-auth';
import { getAdminSupabase } from '@/lib/supabase-admin';

// GET /api/admin/data-requests?status=open
// Lists COPPA / FERPA data-subject requests filed via /privacy/data-request.
// Admin-only; requires a teachers row with role='admin' AND the service
// role key configured. Anonymous callers and regular teachers get 403.

export async function GET(request: NextRequest) {
  if (!(await isPlatformAdmin())) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const admin = getAdminSupabase();
  if (!admin) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 503 });
  }

  const status = request.nextUrl.searchParams.get('status') ?? 'open';
  const validStatuses = ['open', 'in_progress', 'fulfilled', 'denied', 'all'];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status filter' }, { status: 400 });
  }

  let query = admin
    .from('data_requests')
    .select('id, kind, requester_role, requester_email, requester_name, student_name, student_email, student_user_id, details, status, ip, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(200);

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) {
    console.error('List data_requests error:', error);
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }

  return NextResponse.json({ requests: data ?? [] });
}
