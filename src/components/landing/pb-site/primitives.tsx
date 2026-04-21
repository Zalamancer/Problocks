// Primitive components and small atoms for the Playdemy landing page.
// Ported verbatim from the Claude Design bundle (pb_site/primitives.jsx) —
// only converted to TSX and replaced window-global registration with ES exports.
'use client';

import React from 'react';
import NextLink from 'next/link';

type Tone = 'paper' | 'butter' | 'mint' | 'coral' | 'sky' | 'grape' | 'pink' | 'ink' | 'cream';

type IconName =
  | 'arrow-right' | 'arrow-up-right' | 'sparkle' | 'play' | 'pause' | 'check' | 'chevron'
  | 'plus' | 'minus' | 'send' | 'wand' | 'gamepad' | 'store' | 'users' | 'code' | 'music'
  | 'image' | 'coin' | 'spark' | 'cube' | 'heart' | 'smile' | 'star' | 'lock' | 'book'
  | 'mic' | 'bolt' | 'compass' | 'logo-block';

export const Icon = ({
  name, size = 16, stroke = 1.8, style,
}: { name: IconName; size?: number; stroke?: number; style?: React.CSSProperties }) => {
  const s = {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', strokeWidth: stroke,
    strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, style,
  };
  switch (name) {
    case 'arrow-right': return <svg {...s}><path d="M5 12h14M13 5l7 7-7 7"/></svg>;
    case 'arrow-up-right': return <svg {...s}><path d="M7 17L17 7M8 7h9v9"/></svg>;
    case 'sparkle': return <svg {...s}><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z"/></svg>;
    case 'play': return <svg {...s}><polygon points="6 4 20 12 6 20 6 4" fill="currentColor" stroke="none"/></svg>;
    case 'pause': return <svg {...s}><rect x="6" y="4" width="4" height="16" fill="currentColor" stroke="none"/><rect x="14" y="4" width="4" height="16" fill="currentColor" stroke="none"/></svg>;
    case 'check': return <svg {...s}><path d="M4 12l5 5L20 6"/></svg>;
    case 'chevron': return <svg {...s}><path d="M9 6l6 6-6 6"/></svg>;
    case 'plus': return <svg {...s}><path d="M12 5v14M5 12h14"/></svg>;
    case 'minus': return <svg {...s}><path d="M5 12h14"/></svg>;
    case 'send': return <svg {...s}><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>;
    case 'wand': return <svg {...s}><path d="M15 4V2M15 10V8M8 2l1.5 1.5M20 2l-1.5 1.5M4 20l12-12M16 8l4 4"/></svg>;
    case 'gamepad': return <svg {...s}><path d="M6 11h4M8 9v4M15 12h.01M18 10h.01"/><rect x="2" y="6" width="20" height="12" rx="4"/></svg>;
    case 'store': return <svg {...s}><path d="M3 9l1.5-5h15L21 9M3 9v11h18V9M3 9h18M8 13h8"/></svg>;
    case 'users': return <svg {...s}><path d="M17 20v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 20v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>;
    case 'code': return <svg {...s}><path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/></svg>;
    case 'music': return <svg {...s}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>;
    case 'image': return <svg {...s}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>;
    case 'coin': return <svg {...s}><circle cx="12" cy="12" r="9"/><path d="M15 9.5a3 3 0 00-6 0M12 7v10M9 15.5a3 3 0 006 0"/></svg>;
    case 'spark': return <svg {...s}><path d="M12 2v6M12 16v6M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M2 12h6M16 12h6M4.93 19.07l4.24-4.24M14.83 9.17l4.24-4.24"/></svg>;
    case 'cube': return <svg {...s}><path d="M12 2L3 7v10l9 5 9-5V7l-9-5zM3 7l9 5 9-5M12 12v10"/></svg>;
    case 'heart': return <svg {...s}><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z"/></svg>;
    case 'smile': return <svg {...s}><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></svg>;
    case 'star': return <svg {...s}><polygon points="12 2 15.1 8.6 22 9.3 17 14.1 18.2 21 12 17.8 5.8 21 7 14.1 2 9.3 8.9 8.6 12 2"/></svg>;
    case 'lock': return <svg {...s}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
    case 'book': return <svg {...s}><path d="M4 4h7a3 3 0 013 3v14a2 2 0 00-2-2H4zM20 4h-7a3 3 0 00-3 3v14a2 2 0 012-2h8z"/></svg>;
    case 'mic': return <svg {...s}><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10a7 7 0 01-14 0M12 17v5M8 22h8"/></svg>;
    case 'bolt': return <svg {...s}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
    case 'compass': return <svg {...s}><circle cx="12" cy="12" r="10"/><polygon points="16.2 7.8 13.4 13.4 7.8 16.2 10.6 10.6 16.2 7.8"/></svg>;
    case 'logo-block': return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
        <rect x="2.5" y="2.5" width="19" height="19" rx="5" fill="#1d1a14"/>
        <rect x="5.5" y="5.5" width="6" height="6" rx="1.5" fill="#ffd84d"/>
        <rect x="12.5" y="5.5" width="6" height="6" rx="1.5" fill="#ffc8e0"/>
        <rect x="5.5" y="12.5" width="6" height="6" rx="1.5" fill="#b6f0c6"/>
        <rect x="12.5" y="12.5" width="6" height="6" rx="1.5" fill="#b9d9ff"/>
      </svg>
    );
    default: return null;
  }
};

const TONE_MAP: Record<Tone, { bg: string; ink: string; border: string }> = {
  paper:  { bg: 'var(--pbs-paper)',  ink: 'var(--pbs-ink)',        border: 'var(--pbs-line-2)'   },
  butter: { bg: 'var(--pbs-butter)', ink: 'var(--pbs-butter-ink)', border: 'var(--pbs-butter-ink)' },
  mint:   { bg: 'var(--pbs-mint)',   ink: 'var(--pbs-mint-ink)',   border: 'var(--pbs-mint-ink)'   },
  coral:  { bg: 'var(--pbs-coral)',  ink: 'var(--pbs-coral-ink)',  border: 'var(--pbs-coral-ink)'  },
  sky:    { bg: 'var(--pbs-sky)',    ink: 'var(--pbs-sky-ink)',    border: 'var(--pbs-sky-ink)'    },
  grape:  { bg: 'var(--pbs-grape)',  ink: 'var(--pbs-grape-ink)',  border: 'var(--pbs-grape-ink)'  },
  pink:   { bg: 'var(--pbs-pink)',   ink: 'var(--pbs-pink-ink)',   border: 'var(--pbs-pink-ink)'   },
  ink:    { bg: 'var(--pbs-ink)',    ink: 'var(--pbs-cream)',      border: 'var(--pbs-ink)'        },
  cream:  { bg: 'var(--pbs-cream-2)',ink: 'var(--pbs-ink)',        border: 'var(--pbs-line-2)'     },
};

export const Block = ({
  children, tone = 'paper', rot = 0, style, className = '', onClick, as: Tag = 'div',
}: {
  children?: React.ReactNode;
  tone?: Tone;
  rot?: number;
  style?: React.CSSProperties;
  className?: string;
  onClick?: () => void;
  as?: 'div' | 'section' | 'article' | 'aside';
}) => {
  const t = TONE_MAP[tone];
  return (
    <Tag
      className={className}
      onClick={onClick}
      style={{
        background: t.bg,
        color: t.ink,
        border: `1.5px solid ${t.border}`,
        borderRadius: 'var(--pbs-radius)',
        boxShadow: `0 3px 0 ${t.border}, 0 14px 30px -18px rgba(60,40,0,0.22)`,
        transform: rot ? `rotate(${rot}deg)` : undefined,
        ...style,
      }}
    >{children}</Tag>
  );
};

export const Pill = ({
  tone = 'paper', children, icon, style,
}: {
  tone?: Exclude<Tone, 'ink' | 'cream'>;
  children: React.ReactNode;
  icon?: IconName;
  style?: React.CSSProperties;
}) => {
  const colorFor = {
    paper:  { bg: 'var(--pbs-paper)',  fg: 'var(--pbs-ink)',         border: 'var(--pbs-line-2)'     },
    butter: { bg: 'var(--pbs-butter)', fg: 'var(--pbs-butter-ink)',  border: 'var(--pbs-butter-ink)' },
    mint:   { bg: 'var(--pbs-mint)',   fg: 'var(--pbs-mint-ink)',    border: 'var(--pbs-mint-ink)'   },
    coral:  { bg: 'var(--pbs-coral)',  fg: 'var(--pbs-coral-ink)',   border: 'var(--pbs-coral-ink)'  },
    sky:    { bg: 'var(--pbs-sky)',    fg: 'var(--pbs-sky-ink)',     border: 'var(--pbs-sky-ink)'    },
    grape:  { bg: 'var(--pbs-grape)',  fg: 'var(--pbs-grape-ink)',   border: 'var(--pbs-grape-ink)'  },
    pink:   { bg: 'var(--pbs-pink)',   fg: 'var(--pbs-pink-ink)',    border: 'var(--pbs-pink-ink)'   },
  }[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 11px',
      fontSize: 12.5, fontWeight: 600, letterSpacing: '-0.005em',
      borderRadius: 999,
      background: colorFor.bg, color: colorFor.fg, border: `1.5px solid ${colorFor.border}`,
      whiteSpace: 'nowrap',
      ...style,
    }}>
      {icon && <Icon name={icon} size={13} stroke={2}/>}
      {children}
    </span>
  );
};

export const Section = ({
  label, title, sub, kicker, children, id, style,
}: {
  label?: string;
  title?: React.ReactNode;
  sub?: React.ReactNode;
  kicker?: Exclude<Tone, 'ink' | 'cream'>;
  children?: React.ReactNode;
  id?: string;
  style?: React.CSSProperties;
}) => (
  <section id={id} style={{ padding: '72px 0', position: 'relative', ...style }}>
    <div className="pbs-wrap">
      {(label || title || sub) && (
        <div style={{ marginBottom: 40, maxWidth: 720 }}>
          {label && <Pill tone={kicker || 'butter'} icon="sparkle">{label}</Pill>}
          {title && (
            <h2 style={{
              margin: '18px 0 0',
              fontSize: 'clamp(34px, 4.4vw, 54px)',
              lineHeight: 1.02,
              letterSpacing: '-0.025em',
              fontWeight: 700,
            }}>{title}</h2>
          )}
          {sub && (
            <p style={{ margin: '14px 0 0', fontSize: 17, color: 'var(--pbs-ink-soft)', maxWidth: 580, lineHeight: 1.5 }}>{sub}</p>
          )}
        </div>
      )}
      {children}
    </div>
  </section>
);

type ChunkyTone = 'ink' | 'butter' | 'ghost';

export const Chunky = ({
  children, tone = 'ink', icon, trailing, onClick, as: Tag = 'button', href, style, disabled,
}: {
  children: React.ReactNode;
  tone?: ChunkyTone;
  icon?: IconName;
  trailing?: IconName;
  onClick?: (e: React.MouseEvent) => void;
  as?: 'button' | 'a';
  href?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
}) => {
  const common = { className: `pbs-chunky pbs-chunky-${tone}`, style };
  if (Tag === 'a') {
    // Internal hrefs (start with '/') use Next's <Link> so navigation is
    // client-side and Back restores from bfcache without reflashing any
    // "Loading…" placeholder. External or anchor-only hrefs fall back to
    // a plain <a>.
    const isInternal = typeof href === 'string' && href.startsWith('/');
    if (isInternal) {
      return (
        <NextLink href={href!} onClick={onClick} {...common}>
          {icon && <Icon name={icon} size={16} stroke={2.2}/>}
          {children}
          {trailing && <Icon name={trailing} size={16} stroke={2.2}/>}
        </NextLink>
      );
    }
    return (
      <a href={href} onClick={onClick} {...common}>
        {icon && <Icon name={icon} size={16} stroke={2.2}/>}
        {children}
        {trailing && <Icon name={trailing} size={16} stroke={2.2}/>}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled} {...common}>
      {icon && <Icon name={icon} size={16} stroke={2.2}/>}
      {children}
      {trailing && <Icon name={trailing} size={16} stroke={2.2}/>}
    </button>
  );
};

export const FloatBlock = ({
  tone = 'butter', rot = 0, size = 60, delay = 0, style, children, radius = 14,
}: {
  tone?: Exclude<Tone, 'ink'>;
  rot?: number;
  size?: number;
  delay?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  radius?: number;
}) => {
  const palette: Record<string, [string, string]> = {
    butter: ['#ffd84d', '#6b4f00'], mint: ['#b6f0c6', '#0f5b2e'],
    coral:  ['#ffb4a2', '#7a2a18'], sky:  ['#b9d9ff', '#1b4a8a'],
    grape:  ['#dcc7ff', '#4d2a8a'], pink: ['#ffc8e0', '#8a1e5c'],
    cream:  ['#fdf6e6', '#d6c896'], paper:['#fffaf0', '#e8dcbc'],
  };
  const t = palette[tone] ?? palette.butter;
  return (
    <div
      className="pbs-float"
      style={{
        ['--rot' as string]: `${rot}deg`,
        animationDelay: `${delay}s`,
        width: size, height: size,
        background: t[0],
        border: `1.5px solid ${t[1]}`,
        borderRadius: radius,
        boxShadow: `0 3px 0 ${t[1]}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: t[1],
        ...style,
      } as React.CSSProperties}
    >{children}</div>
  );
};
