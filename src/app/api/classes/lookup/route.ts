// GET /api/classes/lookup?code=XYZ — resolve a join code to a class id.
// Used by the student join page and by the teacher setup right-rail
// preview so the "live joined students" poll can run even before the
// teacher has signed in with Google (i.e. before reservedClassId is
// populated by /api/classes POST).
//
// Tries the code as-is, dash-stripped, and in "ABC-DEF" form so links
// like /join?code=PBCVNE (generated without a dash) still match rows
// stored as "PBC-VNE".

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured() || !supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const raw = (req.nextUrl.searchParams.get('code') ?? '').trim().toUpperCase();
  if (!raw) return NextResponse.json({ error: 'code required' }, { status: 400 });

  const candidates = Array.from(new Set([
    raw,
    raw.replace(/-/g, ''),
    raw.length === 6 ? `${raw.slice(0, 3)}-${raw.slice(3)}` : raw,
  ]));

  const { data, error } = await supabase
    .from('classes')
    .select('id')
    .in('join_code', candidates)
    .limit(1)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ classId: data.id });
}
