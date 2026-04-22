// /join?code=ABCDEF — resolve a join code to a class and forward to
// /join/[classId]. The teacher setup flow prints links as
// https://playdemy.app/join?code=XYZ (dashes stripped); codes in the DB
// are stored as "ABC-DEF", so we try both with and without the dash.

import { redirect } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import '@/components/landing/pb-site/styles.css';

export const metadata = {
  title: 'Playdemy — Join your class',
};

function NotFound({ reason }: { reason: string }) {
  return (
    <div className="pbs-root">
      <div className="pbs-page-bg" aria-hidden />
      <div className="pbs-page-noise" aria-hidden />
      <div className="pbs-content" style={{ maxWidth: 520, margin: '80px auto', padding: 24 }}>
        <h1 style={{ fontSize: 28, marginBottom: 12 }}>We couldn&apos;t find that class</h1>
        <p style={{ color: 'var(--pbs-ink-soft)', lineHeight: 1.5 }}>{reason}</p>
        <p style={{ marginTop: 16, color: 'var(--pbs-ink-soft)' }}>
          Ask your teacher to resend the join link, or double-check the code.
        </p>
      </div>
    </div>
  );
}

export default async function JoinByCodePage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  const raw = (code ?? '').trim().toUpperCase();
  if (!raw) return <NotFound reason="No join code was provided in the link." />;
  if (!isSupabaseConfigured() || !supabase) {
    return <NotFound reason="The class directory is offline right now. Please try again in a moment." />;
  }

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

  if (error || !data) {
    return <NotFound reason={`No class matches code "${raw}". The link may be old or mistyped.`} />;
  }

  redirect(`/join/${data.id}`);
}
