'use client';

import Link from 'next/link';
import { ArrowLeftRight } from 'lucide-react';
import { isOwnerEmail } from '@/lib/owner';

// Owner-only "Switch to teacher" / "Switch to student" pill. Renders
// nothing for everyone else, so the production student/teacher UI stays
// clean. The button just navigates between /student and /teacher; the
// caller decides which direction it points by passing `to`.

export function OwnerSwitchButton({
  email,
  to,
}: {
  email: string | null | undefined;
  to: 'teacher' | 'student';
}) {
  if (!isOwnerEmail(email)) return null;
  const href = to === 'teacher' ? '/teacher' : '/student';
  const label = to === 'teacher' ? 'Switch to teacher' : 'Switch to student';
  return (
    <Link
      href={href}
      title={label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 11px',
        borderRadius: 999,
        background: 'var(--pbs-grape, #dcc7ff)',
        color: 'var(--pbs-grape-ink, #4d2a8a)',
        border: '1.5px solid var(--pbs-grape-ink, #4d2a8a)',
        boxShadow: '0 2px 0 var(--pbs-grape-ink, #4d2a8a)',
        fontSize: 11.5,
        fontWeight: 800,
        letterSpacing: '0.04em',
        textDecoration: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      <ArrowLeftRight size={12} strokeWidth={2.5} />
      {label}
    </Link>
  );
}
