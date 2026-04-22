// GET /api/classes/:classId/students — real roster for a class.
//
// Contains PII (emails, Google sub, profile photos). Sprint 4 scopes this
// to the teacher who owns the class. Students / parents who need to see a
// classmate list get a trimmed public endpoint in a follow-up; for now only
// the owning teacher can read the roster.

import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getTeacherSession } from '@/lib/teacher-auth';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ classId: string }> },
) {
  const { classId } = await params;

  const session = await getTeacherSession();
  if (!session?.googleSub) {
    return NextResponse.json({ error: 'Teacher sign-in required' }, { status: 401 });
  }

  if (!isSupabaseConfigured() || !supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  // Ownership gate: must own the class before reading the roster.
  const classRow = await supabase
    .from('classes')
    .select('teacher_google_sub')
    .eq('id', classId)
    .maybeSingle();

  if (classRow.error) {
    return NextResponse.json({ error: classRow.error.message }, { status: 500 });
  }
  if (!classRow.data || classRow.data.teacher_google_sub !== session.googleSub) {
    return NextResponse.json({ error: 'Class not found or not yours' }, { status: 404 });
  }

  const { data, error } = await supabase
    .from('students')
    .select('id, google_sub, email, full_name, given_name, family_name, picture_url, joined_at')
    .eq('class_id', classId)
    .order('joined_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ students: data ?? [] });
}
