// GET /api/classes/lookup?code=XYZ — resolve a join code to a class id.
// Used by the student join page and by the teacher setup right-rail
// preview so the "live joined students" poll can run even before the
// teacher has signed in with Google (i.e. before reservedClassId is
// populated by /api/classes POST).
//
// Tries the code as-is, dash-stripped, and in the canonical "AAAA-BBBB"
// 8-char form so short links like /join?code=ABCDEFGH still match rows
// stored as "ABCD-EFGH". Legacy 6-char rows ("ABC-DEF") are still matched
// via the same dash-insertion fallback.
//
// Rate-limited by IP to slow brute-force guessing of join codes (they are
// effectively bearer tokens). Limit is a simple in-memory sliding window;
// behind a load balancer this caps per-instance, not global — good enough
// as a first layer. Per-class brute-force would need ~10^12 guesses for
// an 8-char code so this is defense-in-depth.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerReadClient } from '@/lib/supabase-admin';

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;
const hits = new Map<string, number[]>();

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (arr.length >= MAX_PER_WINDOW) {
    hits.set(ip, arr);
    return false;
  }
  arr.push(now);
  hits.set(ip, arr);
  return true;
}

export async function GET(req: NextRequest) {
  const client = getServerReadClient();
  if (!client) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim()
    || req.headers.get('x-real-ip')
    || 'anon';
  if (!rateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const raw = (req.nextUrl.searchParams.get('code') ?? '').trim().toUpperCase();
  if (!raw) return NextResponse.json({ error: 'code required' }, { status: 400 });

  const stripped = raw.replace(/-/g, '');
  const candidates = Array.from(new Set([
    raw,
    stripped,
    // Canonical 8-char form with mid-dash (AAAA-BBBB)
    stripped.length === 8 ? `${stripped.slice(0, 4)}-${stripped.slice(4)}` : raw,
    // Legacy 6-char form with mid-dash (ABC-DEF)
    stripped.length === 6 ? `${stripped.slice(0, 3)}-${stripped.slice(3)}` : raw,
  ]));

  const { data, error } = await client
    .from('classes')
    .select('id')
    .in('join_code', candidates)
    .limit(1)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ classId: data.id });
}
