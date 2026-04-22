// GET  /api/starter-units?subject=math&grade=5
//   → list of community-drafted starter units matching this (subject, grade),
//     newest/most-popular first, capped at 12.
//
// POST /api/starter-units
//   → save a teacher's accepted custom-drafted unit so the NEXT teacher with
//     the same (subject, grade) sees it as a pickable card. Also increments
//     usage_count on an existing row if the teacher picked a community one.
//
// Rationale: the original StepUnit shipped with four hardcoded cards that
// felt canned. This route lets the catalogue grow organically from real
// teacher intent instead of being curated in code.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAdminSupabase, getServerReadClient } from '@/lib/supabase-admin';

export type StarterUnitRow = {
  id: string;
  subject: string;
  grade: string;
  title: string;
  weeks: string;
  blurb: string;
  bullets: string[];
  tone: string;
  icon: string;
  usage_count: number;
};

export async function GET(req: NextRequest) {
  const client = getServerReadClient();
  if (!client) {
    return NextResponse.json({ units: [] as StarterUnitRow[] });
  }
  const { searchParams } = new URL(req.url);
  const subject = (searchParams.get('subject') || '').trim();
  const grade = (searchParams.get('grade') || '').trim();
  if (!subject || !grade) {
    return NextResponse.json({ units: [] as StarterUnitRow[] });
  }

  const { data, error } = await client
    .from('starter_units')
    .select('id, subject, grade, title, weeks, blurb, bullets, tone, icon, usage_count')
    .eq('subject', subject)
    .eq('grade', grade)
    .order('usage_count', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(12);

  if (error) {
    return NextResponse.json({ units: [] as StarterUnitRow[], error: error.message });
  }
  return NextResponse.json({ units: (data ?? []) as StarterUnitRow[] });
}

type SaveBody = {
  // When present → increment usage_count on this existing row.
  existingId?: string;
  // When present (and no existingId) → insert a new row from this draft.
  unit?: {
    subject: string;
    grade: string;
    title: string;
    weeks: string;
    blurb: string;
    bullets: string[];
    tone: string;
    icon: string;
    prompt?: string;
  };
};

export async function POST(req: NextRequest) {
  // Writes go through the admin client so migration 019's `using (false)`
  // UPDATE policy doesn't block the usage_count bump.
  const admin = getAdminSupabase() ?? getServerReadClient();
  if (!admin) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const session = await getServerSession(authOptions);
  const sub = session?.googleSub ?? null;

  const body = (await req.json().catch(() => null)) as SaveBody | null;
  if (!body) return NextResponse.json({ error: 'Bad body' }, { status: 400 });

  if (body.existingId) {
    const { data: row, error: readErr } = await admin
      .from('starter_units')
      .select('usage_count')
      .eq('id', body.existingId)
      .maybeSingle();
    if (readErr || !row) {
      return NextResponse.json({ error: readErr?.message || 'Not found' }, { status: 404 });
    }
    const { data, error } = await admin
      .from('starter_units')
      .update({ usage_count: (row.usage_count ?? 0) + 1, updated_at: new Date().toISOString() })
      .eq('id', body.existingId)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ unit: data });
  }

  if (!body.unit) {
    return NextResponse.json({ error: 'unit or existingId required' }, { status: 400 });
  }
  const u = body.unit;
  if (!u.subject || !u.grade || !u.title || !Array.isArray(u.bullets)) {
    return NextResponse.json({ error: 'Missing required unit fields' }, { status: 400 });
  }

  const { data, error } = await admin
    .from('starter_units')
    .insert({
      subject: u.subject,
      grade: u.grade,
      title: u.title.slice(0, 80),
      weeks: u.weeks.slice(0, 40),
      blurb: u.blurb.slice(0, 400),
      bullets: u.bullets.slice(0, 3).map((b) => String(b).slice(0, 60)),
      tone: u.tone,
      icon: u.icon,
      prompt: u.prompt?.slice(0, 1000) ?? null,
      created_by_sub: sub,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ unit: data });
}
