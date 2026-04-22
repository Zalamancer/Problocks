import { NextRequest, NextResponse } from 'next/server';
import { getBalance } from '@/lib/credits';

// GET /api/credits?userId=X
// Returns { balance: number | null }. Called on studio mount + after each
// generation to keep the header counter fresh. Does a double-duty with
// ensure_user_credits so first-time users get seeded with 100 credits on
// their first visit.

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId') || 'local-user';
  const balance = await getBalance(userId);
  return NextResponse.json({ balance, userId });
}
