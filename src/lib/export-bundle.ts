import { getAdminSupabase } from '@/lib/supabase-admin';

// Shared export-bundle builder + uploader. Two callers:
//   * GET /api/admin/data-requests/[id]/export (direct download for admins
//     eyeballing before they act)
//   * PATCH /api/admin/data-requests/[id] on status='fulfilled' for an
//     export request (builds the bundle, uploads to the `data-exports`
//     bucket, returns a 7-day signed URL that the auto-ack email carries)
//
// Matching strategy (same across callers):
//   * student_user_id  → games, user_credits, credit_events, play_events
//   * student_email    → students rows + teachers row (covers misaddressed
//                        requests where the target is actually a teacher)
//   * student_user_id  → students rows via supabase_user_id, deduped
//   * student_name     → ILIKE '%name%', last resort, only if the harder
//                        matches yielded nothing

export interface ExportBundle {
  generatedAt: string;
  request: Record<string, unknown>;
  matched: {
    studentUserId: string | null;
    studentEmail: string | null;
    studentName: string | null;
  };
  data: {
    students: unknown[];
    games: unknown[];
    playEvents: unknown[];
    userCredits: unknown | null;
    creditEvents: unknown[];
    teachers: unknown[];
  };
}

/** Build the JSON bundle for a single data_request. Returns null when the
 *  request doesn't exist or the admin client isn't configured. */
export async function buildExportBundle(requestId: string): Promise<ExportBundle | null> {
  const admin = getAdminSupabase();
  if (!admin) return null;

  const { data: req, error: reqErr } = await admin
    .from('data_requests')
    .select('*')
    .eq('id', requestId)
    .maybeSingle();
  if (reqErr || !req) return null;

  const studentUserId = (req as { student_user_id?: string | null }).student_user_id ?? null;
  const studentEmail = (req as { student_email?: string | null }).student_email ?? null;
  const studentName = (req as { student_name?: string | null }).student_name ?? null;

  const bundle: ExportBundle = {
    generatedAt: new Date().toISOString(),
    request: req as Record<string, unknown>,
    matched: { studentUserId, studentEmail, studentName },
    data: {
      students: [],
      games: [],
      playEvents: [],
      userCredits: null,
      creditEvents: [],
      teachers: [],
    },
  };

  if (studentUserId) {
    const { data: games } = await admin
      .from('games')
      .select('*')
      .eq('user_id', studentUserId);
    bundle.data.games = games ?? [];

    if (games && games.length > 0) {
      const gameIds = (games as { id: string }[]).map((g) => g.id);
      const { data: events } = await admin
        .from('play_events')
        .select('*')
        .in('game_id', gameIds);
      bundle.data.playEvents = events ?? [];
    }

    const { data: credits } = await admin
      .from('user_credits')
      .select('*')
      .eq('user_id', studentUserId)
      .maybeSingle();
    bundle.data.userCredits = credits ?? null;

    const { data: creditEvents } = await admin
      .from('credit_events')
      .select('*')
      .eq('user_id', studentUserId);
    bundle.data.creditEvents = creditEvents ?? [];
  }

  if (studentEmail) {
    const { data } = await admin
      .from('students')
      .select('*')
      .eq('email', studentEmail);
    if (data) bundle.data.students = [...bundle.data.students, ...data];
  }
  if (studentUserId) {
    const { data } = await admin
      .from('students')
      .select('*')
      .eq('supabase_user_id', studentUserId);
    if (data) {
      const seen = new Set((bundle.data.students as { id: string }[]).map((s) => s.id));
      for (const s of data as { id: string }[]) {
        if (!seen.has(s.id)) bundle.data.students.push(s);
      }
    }
  }
  if (studentName && bundle.data.students.length === 0) {
    const { data } = await admin
      .from('students')
      .select('*')
      .ilike('full_name', `%${studentName}%`)
      .limit(20);
    if (data) bundle.data.students = data;
  }

  if (studentEmail) {
    const { data } = await admin
      .from('teachers')
      .select('*')
      .eq('email', studentEmail);
    if (data) bundle.data.teachers = data;
  }

  return bundle;
}

export interface UploadedExport {
  path: string;
  signedUrl: string;
  expiresAt: string;
}

/** Upload a bundle to the `data-exports` private bucket and return a
 *  short-lived signed URL the requester can use to download it. 7-day
 *  default matches the copy in the auto-ack email. */
export async function uploadExportBundle(
  requestId: string,
  bundle: ExportBundle,
  expirySeconds: number = 7 * 24 * 60 * 60
): Promise<UploadedExport | null> {
  const admin = getAdminSupabase();
  if (!admin) return null;

  const path = `${requestId}/${Date.now()}.json`;
  const body = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });

  const { error: uploadErr } = await admin.storage
    .from('data-exports')
    .upload(path, body, {
      contentType: 'application/json',
      upsert: false,
    });
  if (uploadErr) {
    console.error('[export-bundle] upload error:', uploadErr.message);
    return null;
  }

  const { data: signed, error: signErr } = await admin.storage
    .from('data-exports')
    .createSignedUrl(path, expirySeconds);
  if (signErr || !signed) {
    console.error('[export-bundle] sign error:', signErr?.message);
    return null;
  }

  const expiresAt = new Date(Date.now() + expirySeconds * 1000).toISOString();
  return { path, signedUrl: signed.signedUrl, expiresAt };
}
