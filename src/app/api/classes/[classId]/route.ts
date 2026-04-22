// GET /api/classes/:classId
// Public view: anyone can read name/subject/grade/color so the /join page
// can render the class card before the student commits.
// Teacher view (authenticated): adds classroom_course_id + join_code so the
// teacher dashboard + share flow can deep-link. `join_code` is a bearer
// token for the entire roster so it only goes out when the caller is
// actually authenticated as the owning teacher.

import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getTeacherSession } from '@/lib/teacher-auth';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ classId: string }> },
) {
  const { classId } = await params;
  if (!isSupabaseConfigured() || !supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const row = await supabase
    .from('classes')
    .select('id, name, subject, grade, color, teacher_google_sub, classroom_course_id, join_code')
    .eq('id', classId)
    .maybeSingle();

  if (row.error) return NextResponse.json({ error: row.error.message }, { status: 500 });
  if (!row.data) return NextResponse.json({ error: 'Class not found' }, { status: 404 });

  const session = await getTeacherSession();
  const isOwner = !!session?.googleSub && session.googleSub === row.data.teacher_google_sub;

  const publicClass = {
    id: row.data.id,
    name: row.data.name,
    subject: row.data.subject,
    grade: row.data.grade,
    color: row.data.color,
  };

  if (!isOwner) {
    return NextResponse.json({ class: publicClass });
  }

  return NextResponse.json({
    class: {
      ...publicClass,
      classroom_course_id: row.data.classroom_course_id,
      join_code: row.data.join_code,
    },
  });
}
