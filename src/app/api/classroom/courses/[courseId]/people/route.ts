import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const CLASSROOM_BASE = 'https://classroom.googleapis.com/v1';

// Returns both teachers and students for a course
export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const { courseId } = await params;
  const headers = { Authorization: `Bearer ${session.accessToken}` };

  const { searchParams } = new URL(req.url);
  const query = new URLSearchParams();
  if (searchParams.get('pageToken')) query.set('pageToken', searchParams.get('pageToken')!);
  if (searchParams.get('pageSize')) query.set('pageSize', searchParams.get('pageSize')!);

  const [teachersRes, studentsRes] = await Promise.all([
    fetch(`${CLASSROOM_BASE}/courses/${courseId}/teachers?${query}`, { headers }),
    fetch(`${CLASSROOM_BASE}/courses/${courseId}/students?${query}`, { headers }),
  ]);

  const [teachersData, studentsData] = await Promise.all([
    teachersRes.json(),
    studentsRes.json(),
  ]);

  if (!teachersRes.ok) return NextResponse.json({ error: teachersData.error?.message }, { status: teachersRes.status });
  if (!studentsRes.ok) return NextResponse.json({ error: studentsData.error?.message }, { status: studentsRes.status });

  return NextResponse.json({
    teachers: teachersData.teachers ?? [],
    students: studentsData.students ?? [],
    nextPageTokenTeachers: teachersData.nextPageToken,
    nextPageTokenStudents: studentsData.nextPageToken,
  });
}
