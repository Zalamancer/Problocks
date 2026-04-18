'use client';
import type { CSSProperties, ReactNode, MouseEvent } from 'react';
import type { LucideIcon } from 'lucide-react';

/**
 * Problocks Studio design-bundle atoms — ported 1:1 from:
 *   /tmp/design_bundle/problocks/project/studio/atoms.jsx    (Pill, SectionLabel)
 *   /tmp/design_bundle/problocks/project/kit/primitives.jsx  (PBButton, IconBtn, PBBadge)
 *
 * Visual signature of these atoms (what makes them not just another dark button):
 *   - chunky 1.5px solid border in the tone's matching "ink" color
 *   - stacked-paper drop shadow: `boxShadow: 0 Npx 0 <border>` (no blur, offset-only)
 *   - bright saturated pastel bg (butter/mint/coral/sky/grape/pink)
 *   - fontWeight: 700 labels, tight letter spacing
 *
 * Colors come from CSS vars (--pb-*-*) defined in globals.css so the cream
 * theme lights up its full palette while dark/light themes get muted fallbacks.
 */

export type PBTone = 'butter' | 'mint' | 'coral' | 'sky' | 'grape' | 'pink' | 'paper' | 'ink';
export type PBSize = 'sm' | 'md' | 'lg';

interface ToneColors {
  bg: string;
  fg: string;
  bd: string;
}

const TONE_MAP: Record<PBTone, ToneColors> = {
  butter: { bg: 'var(--pb-butter)',     fg: 'var(--pb-butter-ink)', bd: 'var(--pb-butter-ink)' },
  mint:   { bg: 'var(--pb-mint)',       fg: 'var(--pb-mint-ink)',   bd: 'var(--pb-mint-ink)'   },
  coral:  { bg: 'var(--pb-coral)',      fg: 'var(--pb-coral-ink)',  bd: 'var(--pb-coral-ink)'  },
  sky:    { bg: 'var(--pb-sky)',        fg: 'var(--pb-sky-ink)',    bd: 'var(--pb-sky-ink)'    },
  grape:  { bg: 'var(--pb-grape)',      fg: 'var(--pb-grape-ink)',  bd: 'var(--pb-grape-ink)'  },
  pink:   { bg: 'var(--pb-pink)',       fg: 'var(--pb-pink-ink)',   bd: 'var(--pb-pink-ink)'   },
  paper:  { bg: 'var(--pb-paper)',      fg: 'var(--pb-ink)',        bd: 'var(--pb-line-2)'     },
  ink:    { bg: 'var(--pb-ink)',        fg: 'var(--pb-paper)',      bd: 'var(--pb-ink)'        },
};

// ─── Pill ────────────────────────────────────────────────────────────────
// Mirrors atoms.jsx → Pill. Inline-flex rounded-999 chip with 1.5px ink
// border. Used for small status chips ("Connect", "JS", count badges).
export function Pill({
  tone = 'paper',
  icon: Icon,
  children,
  onClick,
  style,
}: {
  tone?: PBTone;
  icon?: LucideIcon;
  children: ReactNode;
  onClick?: (e: MouseEvent) => void;
  style?: CSSProperties;
}) {
  const t = TONE_MAP[tone];
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
        background: t.bg,
        color: t.fg,
        border: `1.5px solid ${t.bd}`,
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
    >
      {Icon && <Icon size={11} strokeWidth={2.4} />}
      {children}
    </span>
  );
}

// ─── PBButton ────────────────────────────────────────────────────────────
// Mirrors primitives.jsx → PBButton. The signature chunky-stacked-shadow
// button (boxShadow: 0 Npx 0 <border>) with tonal variants.
const SIZE_MAP: Record<PBSize, { pad: string; fs: number; radius: number; boxY: number }> = {
  sm: { pad: '5px 10px',  fs: 12, radius: 8,  boxY: 1.5 },
  md: { pad: '8px 14px',  fs: 13, radius: 10, boxY: 2   },
  lg: { pad: '11px 18px', fs: 14, radius: 12, boxY: 3   },
};

type PBButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'destructive' | 'ink';

const VARIANT_TONE: Record<PBButtonVariant, ToneColors> = {
  primary:     TONE_MAP.butter,
  secondary:   { bg: 'var(--pb-paper)', fg: 'var(--pb-ink)', bd: 'var(--pb-line-2)' },
  accent:      TONE_MAP.grape,
  ghost:       { bg: 'transparent', fg: 'var(--pb-ink-soft)', bd: 'transparent' },
  destructive: TONE_MAP.coral,
  ink:         TONE_MAP.ink,
};

export function PBButton({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  children,
  disabled,
  onClick,
  style,
  fullWidth,
  type = 'button',
  'aria-label': ariaLabel,
  title,
}: {
  variant?: PBButtonVariant;
  size?: PBSize;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  children?: ReactNode;
  disabled?: boolean;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  style?: CSSProperties;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  'aria-label'?: string;
  title?: string;
}) {
  const S = SIZE_MAP[size];
  const t = VARIANT_TONE[variant];
  const flat = variant === 'ghost' || variant === 'secondary';
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      title={title}
      style={{
        display: fullWidth ? 'flex' : 'inline-flex',
        width: fullWidth ? '100%' : undefined,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
        padding: S.pad,
        borderRadius: S.radius,
        background: t.bg,
        color: t.fg,
        border: `1.5px solid ${t.bd}`,
        boxShadow: flat ? 'none' : `0 ${S.boxY}px 0 ${t.bd}`,
        fontSize: S.fs,
        fontWeight: 700,
        fontFamily: 'inherit',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'transform 80ms ease, box-shadow 80ms ease',
        ...style,
      }}
      onMouseDown={(e) => {
        if (flat || disabled) return;
        // Press animation: collapse the stacked shadow so the button "lowers"
        const el = e.currentTarget;
        el.style.transform = `translateY(${S.boxY}px)`;
        el.style.boxShadow = `0 0 0 ${t.bd}`;
      }}
      onMouseUp={(e) => {
        if (flat || disabled) return;
        const el = e.currentTarget;
        el.style.transform = '';
        el.style.boxShadow = `0 ${S.boxY}px 0 ${t.bd}`;
      }}
      onMouseLeave={(e) => {
        if (flat || disabled) return;
        const el = e.currentTarget;
        el.style.transform = '';
        el.style.boxShadow = `0 ${S.boxY}px 0 ${t.bd}`;
      }}
    >
      {Icon && <Icon size={S.fs - 1} strokeWidth={2.2} />}
      {children}
      {IconRight && <IconRight size={S.fs - 1} strokeWidth={2.2} />}
    </button>
  );
}

// ─── SectionLabel ────────────────────────────────────────────────────────
// Mirrors atoms.jsx → SectionLabel. Tiny uppercase tracked header.
export function SectionLabel({
  children,
  trailing,
  style,
}: {
  children: ReactNode;
  trailing?: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '0 4px 8px',
        fontSize: 10.5,
        fontWeight: 700,
        letterSpacing: '0.1em',
        color: 'var(--pb-ink-muted)',
        textTransform: 'uppercase',
        ...style,
      }}
    >
      {children}
      {trailing && <span style={{ marginLeft: 'auto' }}>{trailing}</span>}
    </div>
  );
}

// ─── PBLogo ──────────────────────────────────────────────────────────────
// The 4-colored-squares mark from atoms.jsx → Icon case 'logo'.
export function PBLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-label="Problocks">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" fill="var(--pb-ink)" />
      <rect x="5.5"  y="5.5"  width="6" height="6" rx="1.5" fill="var(--pb-butter)" />
      <rect x="12.5" y="5.5"  width="6" height="6" rx="1.5" fill="var(--pb-pink)" />
      <rect x="5.5"  y="12.5" width="6" height="6" rx="1.5" fill="var(--pb-mint)" />
      <rect x="12.5" y="12.5" width="6" height="6" rx="1.5" fill="var(--pb-sky)" />
    </svg>
  );
}

// ─── AvatarStack ─────────────────────────────────────────────────────────
// 3 overlapping initial-circles in the design's pastel tones. No photo
// support — this is the classroom-collaborator indicator, not a real avatar.
const AVATAR_TONES: Array<Exclude<PBTone, 'paper' | 'ink'>> = ['pink', 'mint', 'sky', 'butter', 'grape', 'coral'];

export function AvatarStack({
  names,
  size = 26,
}: {
  names: string[];
  size?: number;
}) {
  return (
    <div style={{ display: 'inline-flex' }}>
      {names.map((name, i) => {
        const tone = AVATAR_TONES[i % AVATAR_TONES.length];
        const t = TONE_MAP[tone];
        const initials = name
          .split(/\s+/)
          .map((p) => p[0])
          .filter(Boolean)
          .slice(0, 2)
          .join('')
          .toUpperCase();
        return (
          <div
            key={name}
            title={name}
            style={{
              width: size,
              height: size,
              borderRadius: '50%',
              background: t.bg,
              color: t.fg,
              border: `1.5px solid ${t.bd}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: Math.round(size * 0.42),
              fontWeight: 700,
              marginLeft: i === 0 ? 0 : -Math.round(size * 0.3),
              zIndex: names.length - i,
            }}
          >
            {initials}
          </div>
        );
      })}
    </div>
  );
}

// ─── Tone icon badge ──────────────────────────────────────────────────────
// The chunky colored square used by ConnectorsTab + SceneLayerRow icons.
// Bright tone bg, ink-colored text, 1.5px ink border.
export function ToneBadge({
  tone,
  icon: Icon,
  size = 32,
  children,
}: {
  tone: Exclude<PBTone, 'paper' | 'ink'>;
  icon?: LucideIcon;
  size?: number;
  children?: ReactNode;
}) {
  const t = TONE_MAP[tone];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.28),
        background: t.bg,
        color: t.fg,
        border: `1.5px solid ${t.bd}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontWeight: 700,
        fontSize: Math.round(size * 0.45),
      }}
    >
      {Icon ? <Icon size={Math.round(size * 0.5)} strokeWidth={2.2} /> : children}
    </div>
  );
}
