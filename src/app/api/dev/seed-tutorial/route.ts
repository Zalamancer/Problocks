import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getAdminSupabase } from '@/lib/supabase-admin';

// One-shot dev helper: ensure the signed-in Google user has a class
// called "Tutorial" with themselves enrolled as a student. Idempotent —
// safe to hit any number of times.
//
//   GET  /api/dev/seed-tutorial   → 302 to /api/auth/signin if no session;
//                                  otherwise runs the seed and returns
//                                  the join URL as JSON.
//
// Used to onboard the project owner into a real DB-backed class so the
// student dashboard at /student renders something other than the mock
// roster, and so they can hit the homework whiteboard from a real
// enrolment instead of the demo URL.

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.googleSub) {
    const url = new URL(req.url);
    const callback = encodeURIComponent(`${url.origin}/api/dev/seed-tutorial`);
    return NextResponse.redirect(
      `${url.origin}/api/auth/signin/google?callbackUrl=${callback}`,
    );
  }
  return runSeed(session, req);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.googleSub) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }
  return runSeed(session, req);
}

async function runSeed(
  session: NonNullable<Awaited<ReturnType<typeof getServerSession>>>,
  req: Request,
) {
  // Prefer the service-role admin client (bypasses RLS for both inserts
  // and the upserts we hit on re-runs). Falls back to anon: per migration
  // 018 anon can INSERT but not UPDATE, so a re-run on anon will fail
  // the student upsert with a clear error.
  const client =
    getAdminSupabase() ?? (isSupabaseConfigured() ? supabase : null);
  if (!client) {
    return NextResponse.json(
      { error: 'Supabase not configured' },
      { status: 503 },
    );
  }

  const googleSub = session.googleSub as string;
  const user = session.user ?? {};
  const email = user.email ?? null;
  const fullName = user.name ?? user.email ?? 'Tutorial student';
  const [givenName, ...rest] = fullName.split(' ');
  const familyName = rest.join(' ') || null;

  // 1. Make sure a teachers row exists so the FK from classes holds.
  const ensureTeacher = await client
    .from('teachers')
    .upsert(
      {
        google_sub: googleSub,
        email,
        full_name: fullName,
        given_name: givenName ?? null,
        family_name: familyName,
        picture_url: user.image ?? null,
      },
      { onConflict: 'google_sub' },
    );
  if (ensureTeacher.error) {
    const msg = ensureTeacher.error.message;
    const isRls = /row-level security/i.test(msg);
    return NextResponse.json(
      {
        error: `teachers upsert: ${msg}`,
        hint: isRls
          ? 'Set SUPABASE_SERVICE_ROLE_KEY in .env.local (Supabase Dashboard → Settings → API → service_role) and restart npm run dev. The teachers table is closed to anon writes (migration 015).'
          : undefined,
      },
      { status: 500 },
    );
  }

  // 2. Reuse a class named "Tutorial" owned by this teacher if one exists,
  //    otherwise create one with a random join code.
  const existing = await client
    .from('classes')
    .select('id, join_code')
    .eq('teacher_google_sub', googleSub)
    .eq('name', 'Tutorial')
    .maybeSingle();
  if (existing.error) {
    return NextResponse.json(
      { error: `classes select: ${existing.error.message}` },
      { status: 500 },
    );
  }

  let classId: string;
  let joinCode: string;
  if (existing.data) {
    classId = existing.data.id as string;
    joinCode = existing.data.join_code as string;
  } else {
    joinCode = randomJoinCode();
    const inserted = await client
      .from('classes')
      .insert({
        teacher_google_sub: googleSub,
        name: 'Tutorial',
        subject: 'Tutorial',
        grade: null,
        color: 'butter',
        join_code: joinCode,
      })
      .select('id, join_code')
      .single();
    if (inserted.error) {
      return NextResponse.json(
        { error: `classes insert: ${inserted.error.message}` },
        { status: 500 },
      );
    }
    classId = inserted.data.id as string;
    joinCode = inserted.data.join_code as string;
  }

  // 3. Enrol the same user as a student in that class.
  const enrol = await client
    .from('students')
    .upsert(
      {
        class_id: classId,
        google_sub: googleSub,
        email,
        full_name: fullName,
        given_name: givenName ?? null,
        family_name: familyName,
        picture_url: user.image ?? null,
      },
      { onConflict: 'class_id,google_sub' },
    )
    .select('id')
    .single();
  if (enrol.error) {
    return NextResponse.json(
      { error: `students upsert: ${enrol.error.message}` },
      { status: 500 },
    );
  }

  const url = new URL(req.url);
  return NextResponse.json({
    ok: true,
    classId,
    joinCode,
    joinUrl: `${url.origin}/join/${classId}`,
    studentDashboardUrl: `${url.origin}/student`,
    homeworkUrl: `${url.origin}/homework/physics-1/cart-on-incline`,
  });
}

function randomJoinCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const buf = new Uint32Array(8);
  crypto.getRandomValues(buf);
  let s = '';
  for (let i = 0; i < 8; i++) s += chars[buf[i] % chars.length];
  return `${s.slice(0, 4)}-${s.slice(4)}`;
}
