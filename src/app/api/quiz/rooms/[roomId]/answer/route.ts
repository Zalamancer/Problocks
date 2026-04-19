import { NextRequest, NextResponse } from 'next/server';
import { submitAnswer } from '@/lib/quiz/room-store';

// POST /api/quiz/rooms/[roomId]/answer — student submits an answer for
// the current question. Requires the token they received from /join.

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> },
) {
  try {
    await params; // roomId is implicit in the token
    const body = await req.json();
    const token = typeof body?.token === 'string' ? body.token : '';
    if (!token) return NextResponse.json({ error: 'token-required' }, { status: 400 });
    const partId = String(body?.partId ?? '');
    const microId = String(body?.microId ?? '');
    const answerId = typeof body?.answerId === 'string' ? body.answerId : undefined;
    const answerValue = typeof body?.answerValue === 'number' ? body.answerValue : undefined;
    const result = await submitAnswer({ token, partId, microId, answerId, answerValue });
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
