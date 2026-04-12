import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const CLASSROOM_BASE = 'https://classroom.googleapis.com/v1';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const params = new URLSearchParams();
  if (searchParams.get('pageToken')) params.set('pageToken', searchParams.get('pageToken')!);
  if (searchParams.get('pageSize')) params.set('pageSize', searchParams.get('pageSize')!);
  if (searchParams.get('studentId')) params.set('studentId', searchParams.get('studentId')!);
  if (searchParams.get('teacherId')) params.set('teacherId', searchParams.get('teacherId')!);
  if (searchParams.get('courseStates')) params.set('courseStates', searchParams.get('courseStates')!);

  const url = `${CLASSROOM_BASE}/courses?${params}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${session.accessToken}` },
  });

  const data = await res.json();
  if (!res.ok) return NextResponse.json({ error: data.error?.message ?? 'Classroom API error' }, { status: res.status });

  return NextResponse.json(data);
}
