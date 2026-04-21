// Small rounded pill — ported from the design's atoms.jsx, using --pb-* tokens.

import type { CSSProperties, ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

type Tone = 'paper' | 'butter' | 'mint' | 'coral' | 'sky' | 'grape' | 'pink' | 'ink';

type PillProps = {
  tone?: Tone;
  icon?: IconName;
  children: ReactNode;
  style?: CSSProperties;
  onClick?: () => void;
};

const TONE_MAP: Record<Tone, [string, string, string]> = {
  paper: ['var(--pb-paper)', 'var(--pb-ink)', 'var(--pb-line-2)'],
  butter: ['var(--pb-butter)', 'var(--pb-butter-ink)', 'var(--pb-butter-ink)'],
  mint: ['var(--pb-mint)', 'var(--pb-mint-ink)', 'var(--pb-mint-ink)'],
  coral: ['var(--pb-coral)', 'var(--pb-coral-ink)', 'var(--pb-coral-ink)'],
  sky: ['var(--pb-sky)', 'var(--pb-sky-ink)', 'var(--pb-sky-ink)'],
  grape: ['var(--pb-grape)', 'var(--pb-grape-ink)', 'var(--pb-grape-ink)'],
  pink: ['var(--pb-pink)', 'var(--pb-pink-ink)', 'var(--pb-pink-ink)'],
  ink: ['var(--pb-ink)', 'var(--pb-paper)', 'var(--pb-ink)'],
};

export function Pill({ tone = 'paper', icon, children, style, onClick }: PillProps) {
  const [bg, fg, border] = TONE_MAP[tone];
  return (
    <span
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 9px',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        background: bg,
        color: fg,
        border: `1.5px solid ${border}`,
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
    >
      {icon && <Icon name={icon} size={11} stroke={2.4} />}
      {children}
    </span>
  );
}
