import { NextRequest, NextResponse } from 'next/server';
import { isPlatformAdmin } from '@/lib/teacher-auth';
import { getAdminSupabase } from '@/lib/supabase-admin';

// GET /api/admin/teachers?role=<filter>
// Lists teachers with their role + basic profile. Admin-only. Used by the
// /admin/teachers surface to promote/demote platform staff.

export async function GET(request: NextRequest) {
  if (!(await isPlatformAdmin())) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }
  const admin = getAdminSupabase();
  if (!admin) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured' }, { status: 503 });
  }

  const role = request.nextUrl.searchParams.get('role');
  let query = admin
    .from('teachers')
    .select('google_sub, email, full_name, picture_url, school_label, role, created_at, last_seen_at')
    .order('last_seen_at', { ascending: false })
    .limit(200);

  if (role === 'teacher' || role === 'admin') {
    query = query.eq('role', role);
  }

  const { data, error } = await query;
  if (error) {
    console.error('List teachers error:', error);
    return NextResponse.json({ error: 'Failed to fetch teachers' }, { status: 500 });
  }

  return NextResponse.json({ teachers: data ?? [] });
}
