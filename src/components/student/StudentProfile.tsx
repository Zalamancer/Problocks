// Student's own profile page — the exact same "view as student" layout the
// teacher sees when they click "View as student" from the student detail
// page. We reuse <StudentSelf> directly to guarantee the views match.
//
// Until real per-student progress wiring lands, we synthesize a `Student`
// record by taking STUDENTS[0] as a template and overriding the identity
// fields (name/email → name shown in the hero) with the logged-in
// Supabase user. Mastery/activity/trend still come from sample data.
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Session } from '@supabase/supabase-js';
import { StudentSelf } from '@/components/teacher/StudentSelf';
import { STUDENTS, type Student } from '@/components/teacher/sample-data';
import { teacherWrap } from '@/components/teacher/shared';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const deriveName = (session: Session | null): string => {
  if (!session?.user) return 'Student';
  const meta = session.user.user_metadata || {};
  const email = session.user.email || '';
  const fromMeta = (meta.name as string) || (meta.full_name as string);
  if (fromMeta) return fromMeta;
  const inferred = (email.split('@')[0] || 'Student').replace(/\b\w/g, (c) => c.toUpperCase());
  return inferred;
};

const buildStudentFor = (name: string): Student => {
  // Use Ava Park's shape as the template for layout fidelity — she has the
  // richest STUDENT_ACTIVITY entry, so the timeline/badges/questions read
  // well out of the box. Swap the name only.
  const template = STUDENTS[0];
  return { ...template, name };
};

export const StudentProfile = () => {
  const router = useRouter();
  const [sessionReady, setSessionReady] = useState(false);
  const [name, setName] = useState<string>('Student');

  useEffect(() => {
    if (!supabase) {
      setSessionReady(true);
      return;
    }
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setName(deriveName(data.session));
      setSessionReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setName(deriveName(session));
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (!isSupabaseConfigured()) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
        <div style={{
          maxWidth: 520, padding: 24, borderRadius: 16,
          background: 'var(--pbs-paper)', border: '1.5px solid var(--pbs-line-2)',
          boxShadow: '0 4px 0 var(--pbs-line-2)',
        }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Supabase is not configured.</h1>
          <p style={{ marginTop: 10, fontSize: 14, lineHeight: 1.5, color: 'var(--pbs-ink-soft)' }}>
            Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to <code>.env.local</code>, then restart the dev server.
          </p>
        </div>
      </div>
    );
  }

  if (!sessionReady) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <div className="pbs-mono" style={{ fontSize: 12, color: 'var(--pbs-ink-muted)' }}>Loading…</div>
      </div>
    );
  }

  const s = buildStudentFor(name);

  return (
    <main style={{ ...teacherWrap, padding: '28px 28px 80px' }}>
      <StudentSelf s={s} onBack={() => router.push('/student')} backLabel="Back to dashboard"/>
    </main>
  );
};
