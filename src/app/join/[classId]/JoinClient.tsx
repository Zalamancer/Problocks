// Client-side join flow. Separated from page.tsx because it uses
// next-auth hooks (useSession/signIn) which need a client component.
'use client';

import { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Icon, Chunky } from '@/components/landing/pb-site/primitives';

type ClassInfo = { id: string; name: string; subject?: string; grade?: string };

type JoinState =
  | { tag: 'idle' }
  | { tag: 'signing-in' }
  | { tag: 'joining' }
  | { tag: 'joined'; student: { id: string; full_name: string }; cls: ClassInfo }
  | { tag: 'error'; message: string };

export function JoinClient({ classId }: { classId: string }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [state, setState] = useState<JoinState>({ tag: 'idle' });
  const [cls, setCls] = useState<ClassInfo | null>(null);

  // Look up the class (name/subject/etc) for display purposes.
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/classes/${classId}`)
      .then(async (r) => {
        if (!r.ok) throw new Error('Class not found');
        const data = (await r.json()) as { class: ClassInfo };
        if (!cancelled) setCls(data.class);
      })
      .catch(() => {
        if (!cancelled) setCls(null);
      });
    return () => { cancelled = true; };
  }, [classId]);

  // Once authenticated, POST to join endpoint.
  useEffect(() => {
    if (status !== 'authenticated') return;
    if (state.tag !== 'idle' && state.tag !== 'signing-in') return;
    setState({ tag: 'joining' });
    (async () => {
      try {
        const res = await fetch('/api/students/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ classId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Failed to join');
        setState({ tag: 'joined', student: data.student, cls: data.class });
        setTimeout(() => router.push('/student'), 1200);
      } catch (e: unknown) {
        setState({ tag: 'error', message: e instanceof Error ? e.message : 'Failed to join' });
      }
    })();
  }, [status, classId, router, state.tag]);

  const className = state.tag === 'joined' ? state.cls.name : cls?.name ?? 'your class';

  return (
    <main style={{ maxWidth: 520, margin: '0 auto', padding: '80px 24px 60px' }}>
      <div style={{
        padding: 28,
        background: 'var(--pbs-paper)',
        border: '1.5px solid var(--pbs-line-2)',
        borderRadius: 20,
        boxShadow: '0 4px 0 var(--pbs-line-2), 0 20px 40px -22px rgba(0,0,0,0.15)',
        textAlign: 'center',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14,
          background: 'var(--pbs-mint)', color: 'var(--pbs-mint-ink)',
          border: '1.5px solid var(--pbs-mint-ink)',
          boxShadow: '0 3px 0 var(--pbs-mint-ink)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 14,
        }}>
          <Icon name="book" size={24} stroke={2.2}/>
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>
          Join <span className="pbs-serif" style={{ fontStyle: 'italic' }}>{className}</span>
        </div>
        <p style={{ margin: '8px auto 22px', color: 'var(--pbs-ink-soft)', fontSize: 14, lineHeight: 1.55, maxWidth: 380 }}>
          Sign in with your school Google account. We only use your name, email, and photo — nothing else.
        </p>

        {state.tag === 'joined' ? (
          <div style={{ padding: '14px 16px', background: 'var(--pbs-mint)', color: 'var(--pbs-mint-ink)', border: '1.5px solid var(--pbs-mint-ink)', borderRadius: 14 }}>
            Welcome, {state.student.full_name}! Taking you to your dashboard…
          </div>
        ) : state.tag === 'error' ? (
          <>
            <div style={{ padding: '12px 14px', background: 'var(--pbs-coral)', color: 'var(--pbs-coral-ink)', border: '1.5px solid var(--pbs-coral-ink)', borderRadius: 12, marginBottom: 14, fontSize: 13.5 }}>
              {state.message}
            </div>
            <Chunky
              tone="ink"
              icon="sparkle"
              onClick={() => {
                setState({ tag: 'signing-in' });
                signIn('google', { callbackUrl: `/join/${classId}` });
              }}
            >
              Try again
            </Chunky>
          </>
        ) : status === 'authenticated' || state.tag === 'joining' ? (
          <div style={{ padding: '14px', color: 'var(--pbs-ink-muted)', fontSize: 14 }}>
            Joining {className}…
          </div>
        ) : (
          <Chunky
            tone="ink"
            icon="sparkle"
            onClick={() => {
              setState({ tag: 'signing-in' });
              signIn('google', { callbackUrl: `/join/${classId}` });
            }}
            disabled={state.tag === 'signing-in'}
          >
            {state.tag === 'signing-in' ? 'Opening Google…' : 'Sign in with Google'}
          </Chunky>
        )}
      </div>

      <p style={{ textAlign: 'center', marginTop: 18, fontSize: 12.5, color: 'var(--pbs-ink-muted)' }}>
        Class code: <span className="pbs-mono" style={{ color: 'var(--pbs-ink)' }}>{classId.slice(0, 8)}</span>
      </p>
    </main>
  );
}
