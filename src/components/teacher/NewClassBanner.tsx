// Thin client-side banner that appears above the mock teacher dashboard when
// `/teacher?classId=<id>` is opened. Reads the real class from the API and
// explains that the dashboard below is a demo — the newly-persisted class has
// zero students until kids self-enroll via the share link.
//
// Rendered by TeacherPage (server component) inside a <Suspense> boundary so
// useSearchParams() is allowed.
'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Chunky, Icon } from '@/components/landing/pb-site/primitives';

type PublicClass = { id: string; name: string };

export const NewClassBanner = () => {
  const search = useSearchParams();
  const classId = search.get('classId');
  const [cls, setCls] = useState<PublicClass | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!classId) return;
    let cancelled = false;
    fetch(`/api/classes/${classId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { if (!cancelled && j?.class) setCls(j.class); })
      .catch(() => { /* silent — banner just won't render */ });
    return () => { cancelled = true; };
  }, [classId]);

  if (!classId || !cls || dismissed) return null;

  const joinUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/join/${classId}`
    : `/join/${classId}`;

  return (
    <div
      className="pbs-wrap"
      style={{ maxWidth: 1240, margin: '0 auto', padding: '16px 28px 0' }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 18px',
        background: 'var(--pbs-butter)',
        border: '1.5px solid var(--pbs-butter-ink)',
        boxShadow: '0 3px 0 var(--pbs-butter-ink)',
        borderRadius: 16,
        color: 'var(--pbs-butter-ink)',
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: 'var(--pbs-paper)',
          border: '1.5px solid var(--pbs-butter-ink)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon name="sparkle" size={16} stroke={2.2}/>
        </div>
        <div style={{ flex: 1, minWidth: 0, lineHeight: 1.4 }}>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>
            &ldquo;{cls.name}&rdquo; is live — 0 students joined yet.
          </div>
          <div style={{ fontSize: 12.5, opacity: 0.82 }}>
            The numbers below are a demo dashboard. Share{' '}
            <span className="pbs-mono" style={{ fontWeight: 600 }}>{joinUrl}</span>{' '}
            so students can sign themselves in.
          </div>
        </div>
        <Chunky tone="ink" as="a" href={`/teacher/setup/share?classId=${classId}`} trailing="arrow-up-right">
          Share link
        </Chunky>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => setDismissed(true)}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--pbs-butter-ink)', opacity: 0.6,
            padding: 6, fontSize: 18, lineHeight: 1,
          }}
        >×</button>
      </div>
    </div>
  );
};
