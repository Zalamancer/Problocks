// GET /api/classes/:classId — public class lookup for the /join page.
// Returns non-sensitive fields only (name, subject, grade).
import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ classId: string }> },
) {
  const { classId } = await params;
  if (!isSupabaseConfigured() || !supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  // Include `classroom_course_id` so the teacher dashboard can fetch that
  // course's assignments + announcements from Google Classroom. `color` is
  // needed for the dashboard tone. `join_code` is fine to expose here —
  // it's already printed on the teacher setup share page.
  const row = await supabase
    .from('classes')
    .select('id, name, subject, grade, color, classroom_course_id, join_code')
    .eq('id', classId)
    .maybeSingle();
  if (row.error) return NextResponse.json({ error: row.error.message }, { status: 500 });
  if (!row.data) return NextResponse.json({ error: 'Class not found' }, { status: 404 });
  return NextResponse.json({ class: row.data });
}
