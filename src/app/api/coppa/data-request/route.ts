import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { enforceRateLimit, ipFromRequest } from '@/lib/rate-limit';

// POST /api/coppa/data-request
// Logs a COPPA / FERPA data-subject request (delete, export, opt-out,
// correction). An admin reviews via /admin/data-requests. Deliberately no
// email verification here — verifying requesters takes a separate
// human-touched flow. We rate-limit so the form can't be mass-filled
// (Sprint 8 moved this onto the durable Supabase counter).

const MAX_FIELD = 200;
const MAX_DETAILS = 2000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const ok = await enforceRateLimit({
    bucket: 'coppa.data-request',
    actor: ipFromRequest(request),
    max: 3,
    windowSeconds: 600,
  });
  if (!ok) {
    return NextResponse.json(
      { error: 'Too many requests from this address. Try again later or email the team directly.' },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null) as {
    kind?: string;
    requesterRole?: string;
    requesterEmail?: string;
    requesterName?: string;
    studentName?: string;
    studentEmail?: string;
    studentUserId?: string;
    details?: string;
  } | null;

  if (!body) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const kinds = new Set(['delete', 'export', 'opt-out', 'correction']);
  const roles = new Set(['self', 'parent', 'school']);

  if (!body.kind || !kinds.has(body.kind)) {
    return NextResponse.json({ error: 'Invalid kind' }, { status: 400 });
  }
  if (!body.requesterRole || !roles.has(body.requesterRole)) {
    return NextResponse.json({ error: 'Invalid requester role' }, { status: 400 });
  }
  if (typeof body.requesterEmail !== 'string' || !EMAIL_RE.test(body.requesterEmail)) {
    return NextResponse.json({ error: 'Please provide a valid email address' }, { status: 400 });
  }

  if (!isSupabaseConfigured() || !supabase) {
    // Log the request server-side so developer mode doesn't lose it.
    console.warn('data-request received (supabase offline):', {
      kind: body.kind, role: body.requesterRole, email: body.requesterEmail,
    });
    return NextResponse.json({ ok: true, warning: 'Supabase offline — request logged locally only.' });
  }

  const clamp = (s: string | undefined, n: number) =>
    typeof s === 'string' ? s.trim().slice(0, n) || null : null;

  const { error } = await supabase.from('data_requests').insert({
    kind: body.kind,
    requester_role: body.requesterRole,
    requester_email: body.requesterEmail.trim(),
    requester_name: clamp(body.requesterName, MAX_FIELD),
    student_name: clamp(body.studentName, MAX_FIELD),
    student_email: clamp(body.studentEmail, MAX_FIELD),
    student_user_id: clamp(body.studentUserId, MAX_FIELD),
    details: clamp(body.details, MAX_DETAILS),
    ip: ipFromRequest(request),
  });

  if (error) {
    console.error('data_requests insert error:', error);
    return NextResponse.json({ error: 'Could not file the request. Try again.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
