'use client';

import type { CSSProperties, ReactNode } from 'react';

// Pill — small rounded label used throughout the quiz UI (both the
// teacher's dashboard and the student's solo screens). Mirrors the
// Design-bundle "Pill" atom, mapped onto Problocks' --pb-* tokens so
// it themes correctly in dark / light / cream modes.
//
// Lives under src/components/quiz/ (not studio/) because the teacher
// dashboard at /teach/quiz and the student play page at /play/quiz
// both depend on this, and neither is part of the developer studio.

type Tone = 'paper' | 'butter' | 'mint' | 'coral' | 'sky' | 'grape' | 'pink' | 'ink';

const TONES: Record<Tone, [string, string, string]> = {
  paper:  ['var(--pb-paper)',  'var(--pb-ink)',        'var(--pb-line-2)'],
  butter: ['var(--pb-butter)', 'var(--pb-butter-ink)', 'var(--pb-butter-ink)'],
  mint:   ['var(--pb-mint)',   'var(--pb-mint-ink)',   'var(--pb-mint-ink)'],
  coral:  ['var(--pb-coral)',  'var(--pb-coral-ink)',  'var(--pb-coral-ink)'],
  sky:    ['var(--pb-sky)',    'var(--pb-sky-ink)',    'var(--pb-sky-ink)'],
  grape:  ['var(--pb-grape,#dcc7ff)', 'var(--pb-grape-ink,#4d2a8a)', 'var(--pb-grape-ink,#4d2a8a)'],
  pink:   ['var(--pb-pink,#ffc8e0)',  'var(--pb-pink-ink,#8a1e5c)',  'var(--pb-pink-ink,#8a1e5c)'],
  ink:    ['var(--pb-ink)',    'var(--pb-paper)',      'var(--pb-ink)'],
};

export function Pill({
  tone = 'paper',
  children,
  icon,
  style,
}: {
  tone?: Tone;
  children?: ReactNode;
  icon?: ReactNode;
  style?: CSSProperties;
}) {
  const [bg, fg, bd] = TONES[tone];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 9px',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: 'nowrap',
        background: bg,
        color: fg,
        border: `1.5px solid ${bd}`,
        ...style,
      }}
    >
      {icon}
      {children}
    </span>
  );
}
