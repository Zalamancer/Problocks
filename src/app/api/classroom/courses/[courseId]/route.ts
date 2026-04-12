import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const CLASSROOM_BASE = 'https://classroom.googleapis.com/v1';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const { courseId } = await params;
  const res = await fetch(`${CLASSROOM_BASE}/courses/${courseId}`, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });

  const data = await res.json();
  if (!res.ok) return NextResponse.json({ error: data.error?.message ?? 'Classroom API error' }, { status: res.status });

  return NextResponse.json(data);
}
