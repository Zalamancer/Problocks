// Pure SVG crate renderer. Draws a chunky 3D-ish box for a given tier.
// No animation here — the parent adds `.crate-shake`, `.crate-bob`, etc.
// Lid and body are separate <g> elements so Unboxing can animate the lid
// independently (crate-lid / crate-body-pop classes).
'use client';

import React from 'react';
import { CRATE_TIERS, type CrateTier } from './crate-types';

interface CrateVisualProps {
  tier: CrateTier;
  size?: number;               // px, default 220
  lidClassName?: string;       // applied to lid <g>
  bodyClassName?: string;      // applied to body <g>
  /** Hide lid entirely (for after-burst state). */
  lidHidden?: boolean;
}

export const CrateVisual = ({
  tier,
  size = 220,
  lidClassName,
  bodyClassName,
  lidHidden,
}: CrateVisualProps) => {
  const s = CRATE_TIERS[tier];

  return (
    <svg viewBox="0 0 220 220" width={size} height={size} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`crate-body-${tier}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={s.body}/>
          <stop offset="100%" stopColor={s.shadow}/>
        </linearGradient>
        <linearGradient id={`crate-face-${tier}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={lighten(s.body, 0.15)}/>
          <stop offset="100%" stopColor={s.body}/>
        </linearGradient>
        <linearGradient id={`crate-lid-${tier}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={lighten(s.body, 0.2)}/>
          <stop offset="100%" stopColor={s.shadow}/>
        </linearGradient>
        <pattern
          id={`crate-tex-${tier}`}
          patternUnits="userSpaceOnUse"
          width="12" height="12"
        >
          {tierTexture(tier, s)}
        </pattern>
      </defs>

      {/* shadow */}
      <ellipse cx="110" cy="198" rx="68" ry="8" fill="rgba(0,0,0,0.28)"/>

      {/* body */}
      <g className={bodyClassName}>
        {/* front face */}
        <path
          d="M 40 90 L 180 90 L 180 190 L 40 190 Z"
          fill={`url(#crate-body-${tier})`}
          stroke={s.shadow}
          strokeWidth="3"
        />
        {/* texture overlay */}
        <path
          d="M 40 90 L 180 90 L 180 190 L 40 190 Z"
          fill={`url(#crate-tex-${tier})`}
          opacity="0.65"
        />
        {/* side highlight */}
        <path
          d="M 40 90 L 54 80 L 54 182 L 40 190 Z"
          fill={lighten(s.body, -0.12)}
          stroke={s.shadow}
          strokeWidth="2"
        />
        {/* strap / trim */}
        {tierStraps(tier, s)}
      </g>

      {/* lid */}
      {!lidHidden && (
        <g className={lidClassName}>
          <path
            d="M 34 94 L 186 94 L 192 80 L 28 80 Z"
            fill={`url(#crate-lid-${tier})`}
            stroke={s.shadow}
            strokeWidth="3"
          />
          <rect x="36" y="84" width="148" height="8" fill={s.shadow} opacity="0.4"/>
          {tierLidAccent(tier, s)}
        </g>
      )}
    </svg>
  );
};

/* ---------- tier-specific flourishes ---------- */

function tierStraps(tier: CrateTier, s: typeof CRATE_TIERS[CrateTier]) {
  if (tier === 'paper') {
    // twine wrap
    return (
      <>
        <rect x="102" y="90"  width="16" height="100" fill={s.accent} opacity="0.85"/>
        <circle cx="110" cy="136" r="10" fill={s.accent} stroke={s.shadow} strokeWidth="2"/>
      </>
    );
  }
  if (tier === 'cardboard') {
    // brown tape cross
    return (
      <>
        <rect x="98"  y="90"  width="24" height="100" fill="#d4a25e" opacity="0.7"/>
        <rect x="40"  y="130" width="140" height="18" fill="#d4a25e" opacity="0.7"/>
      </>
    );
  }
  if (tier === 'wooden') {
    // iron bands + rivets
    return (
      <>
        <rect x="40" y="108" width="140" height="8" fill={s.shadow}/>
        <rect x="40" y="162" width="140" height="8" fill={s.shadow}/>
        {[50, 90, 130, 170].map((x) => (
          <circle key={`r1-${x}`} cx={x} cy="112" r="3" fill="#c9a173"/>
        ))}
        {[50, 90, 130, 170].map((x) => (
          <circle key={`r2-${x}`} cx={x} cy="166" r="3" fill="#c9a173"/>
        ))}
      </>
    );
  }
  if (tier === 'metal') {
    // rivet grid + keyhole
    return (
      <>
        {[55, 90, 130, 165].map((x) => (
          [105, 135, 165].map((y) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="3.2" fill="#c5d0dc" stroke={s.shadow} strokeWidth="1"/>
          ))
        ))}
        <rect x="102" y="125" width="16" height="22" rx="3" fill={s.shadow}/>
        <circle cx="110" cy="132" r="4" fill={s.glow}/>
        <rect x="108" y="135" width="4" height="10" fill={s.glow}/>
      </>
    );
  }
  // crystal
  return (
    <>
      {/* glass panels */}
      <path d="M 50 100 L 110 100 L 110 180 L 50 180 Z"
            fill={s.glow} opacity="0.25" stroke={s.accent} strokeWidth="2"/>
      <path d="M 110 100 L 170 100 L 170 180 L 110 180 Z"
            fill={s.glow2 || s.glow} opacity="0.25" stroke={s.accent} strokeWidth="2"/>
      {/* gold corner caps */}
      {[[40,90],[180,90],[40,190],[180,190]].map(([x,y]) => (
        <rect key={`cap-${x}-${y}`} x={x-6} y={y-6} width="14" height="14" fill={s.accent} stroke={s.shadow} strokeWidth="2" rx="2"/>
      ))}
      {/* inner shimmer */}
      <circle cx="110" cy="140" r="24" fill={s.glow} opacity="0.4"/>
    </>
  );
}

function tierLidAccent(tier: CrateTier, s: typeof CRATE_TIERS[CrateTier]) {
  if (tier === 'paper') {
    // bow
    return <path d="M 98 78 Q 110 66 122 78 Q 110 70 98 78 Z" fill={s.accent} stroke={s.shadow} strokeWidth="1.5"/>;
  }
  if (tier === 'cardboard') {
    return <rect x="90" y="80" width="40" height="4" fill="#d4a25e" opacity="0.8"/>;
  }
  if (tier === 'wooden') {
    return <rect x="102" y="80" width="16" height="8" fill={s.shadow}/>;
  }
  if (tier === 'metal') {
    return (
      <>
        <rect x="96" y="74" width="28" height="10" fill={s.shadow}/>
        <rect x="100" y="76" width="20" height="6" fill={s.accent}/>
      </>
    );
  }
  return (
    <>
      <polygon points="110,60 118,78 102,78" fill={s.accent} stroke={s.shadow} strokeWidth="1.5"/>
      <circle cx="110" cy="70" r="3" fill={s.glow}/>
    </>
  );
}

function tierTexture(tier: CrateTier, s: typeof CRATE_TIERS[CrateTier]) {
  if (tier === 'paper') {
    return (
      <>
        <path d="M 0 3 Q 3 1 6 3 T 12 3" stroke={s.shadow} strokeWidth="0.4" fill="none" opacity="0.4"/>
        <path d="M 0 9 Q 3 7 6 9 T 12 9" stroke={s.shadow} strokeWidth="0.4" fill="none" opacity="0.4"/>
      </>
    );
  }
  if (tier === 'cardboard') {
    // corrugated lines
    return (
      <>
        <line x1="0" y1="2" x2="12" y2="2" stroke={s.shadow} strokeWidth="0.5" opacity="0.5"/>
        <line x1="0" y1="6" x2="12" y2="6" stroke={s.shadow} strokeWidth="0.5" opacity="0.5"/>
        <line x1="0" y1="10" x2="12" y2="10" stroke={s.shadow} strokeWidth="0.5" opacity="0.5"/>
      </>
    );
  }
  if (tier === 'wooden') {
    // wood grain
    return (
      <>
        <path d="M 0 4 Q 6 2 12 4" stroke={s.shadow} strokeWidth="0.6" fill="none" opacity="0.55"/>
        <path d="M 0 8 Q 6 10 12 8" stroke={s.shadow} strokeWidth="0.4" fill="none" opacity="0.4"/>
      </>
    );
  }
  if (tier === 'metal') {
    // brushed metal streaks
    return (
      <>
        <line x1="0" y1="1" x2="12" y2="1" stroke={s.shadow} strokeWidth="0.3" opacity="0.3"/>
        <line x1="0" y1="5" x2="12" y2="5" stroke={s.shadow} strokeWidth="0.3" opacity="0.3"/>
        <line x1="0" y1="9" x2="12" y2="9" stroke={s.shadow} strokeWidth="0.3" opacity="0.3"/>
      </>
    );
  }
  // crystal — faint diamond pattern
  return (
    <>
      <path d="M 6 0 L 12 6 L 6 12 L 0 6 Z" stroke={s.accent} strokeWidth="0.3" fill="none" opacity="0.3"/>
    </>
  );
}

/** Shift a hex color toward white (amt>0) or black (amt<0). */
function lighten(hex: string, amt: number): string {
  const n = hex.replace('#', '');
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  const t = amt < 0 ? 0 : 255;
  const p = Math.abs(amt);
  const nr = Math.round(r + (t - r) * p);
  const ng = Math.round(g + (t - g) * p);
  const nb = Math.round(b + (t - b) * p);
  return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
}
