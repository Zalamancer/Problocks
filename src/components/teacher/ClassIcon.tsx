// Custom class rail icons — hand-drawn SVGs that replace the per-class emoji
// on Discord-style rail tiles. One icon per class id; uses currentColor so
// the parent tile's tone-ink border colour cascades into the stroke for a
// cohesive chunky-pastel look.
'use client';

import React from 'react';

type ClassIconProps = {
  id: string;
  /** Rendered pixel size (the SVG is square). */
  size?: number;
  /** Stroke width; defaults to 2 which matches chunky-pastel language. */
  stroke?: number;
  style?: React.CSSProperties;
};

// --- Individual icons --------------------------------------------------------

// c1 — Algebra 1 · Period 3: a 30-60-90 set square (triangle ruler), the
// tool algebra students actually hold. Tick marks on two edges sell the
// "ruler" read even at 28px.
const TriangleRuler = ({ s }: { s: React.SVGProps<SVGSVGElement> }) => (
  <svg {...s}>
    <path d="M4.5 19.5 L19.5 19.5 L4.5 4.5 Z"/>
    <path d="M8 19.5 L8 17.5 M11 19.5 L11 17.5 M14 19.5 L14 17.5 M17 19.5 L17 17.5"/>
    <path d="M4.5 16 L6.5 16 M4.5 13 L6.5 13 M4.5 10 L6.5 10 M4.5 7 L6.5 7"/>
  </svg>
);

// c2 — Algebra 1 · Period 5: an abacus. Two rows of beads on a frame; the
// beads on the top row are slid right, bottom row slid left, implying a
// count in progress.
const Abacus = ({ s }: { s: React.SVGProps<SVGSVGElement> }) => (
  <svg {...s}>
    <rect x="3" y="4.5" width="18" height="15" rx="2.5"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    {/* top row — three beads pushed right */}
    <circle cx="12"   cy="8.2" r="1.5" fill="currentColor"/>
    <circle cx="15.2" cy="8.2" r="1.5" fill="currentColor"/>
    <circle cx="18.4" cy="8.2" r="1.5" fill="currentColor"/>
    {/* bottom row — two beads pushed left */}
    <circle cx="5.6"  cy="15.8" r="1.5" fill="currentColor"/>
    <circle cx="8.8"  cy="15.8" r="1.5" fill="currentColor"/>
  </svg>
);

// c3 — Pre-Algebra · Period 2: a plus sign inside a rounded tile. Reads
// as "adding" at a glance and is the most beginner-friendly math glyph.
const PlusTile = ({ s }: { s: React.SVGProps<SVGSVGElement> }) => (
  <svg {...s}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/>
    <path d="M12 7.5 V16.5 M7.5 12 H16.5" strokeWidth={2.6}/>
  </svg>
);

// --- Fallback ----------------------------------------------------------------
// Generic "class" glyph — open book — for any class id we haven't drawn yet.
const BookFallback = ({ s }: { s: React.SVGProps<SVGSVGElement> }) => (
  <svg {...s}>
    <path d="M4 5.5 Q12 3.5 12 6 Q12 3.5 20 5.5 L20 18.5 Q12 16.5 12 19 Q12 16.5 4 18.5 Z"/>
    <path d="M12 6 V19"/>
  </svg>
);

// --- Direct messages icon ----------------------------------------------------
// Chunky speech bubble with a bottom-left tail and three dots. Sibling of the
// class glyphs so the DM rail button matches the tile language.
export const DirectMessagesIcon = ({
  size = 22, stroke = 2, style,
}: { size?: number; stroke?: number; style?: React.CSSProperties }) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth={stroke}
    strokeLinecap="round" strokeLinejoin="round" style={style}
  >
    <path d="M4 6.5 Q4 4.5 6 4.5 L18 4.5 Q20 4.5 20 6.5 L20 15 Q20 17 18 17 L10.5 17 L7 20 L7 17 L6 17 Q4 17 4 15 Z"/>
    <circle cx="9"  cy="10.8" r="0.9" fill="currentColor" stroke="none"/>
    <circle cx="12" cy="10.8" r="0.9" fill="currentColor" stroke="none"/>
    <circle cx="15" cy="10.8" r="0.9" fill="currentColor" stroke="none"/>
  </svg>
);

// --- Registry ----------------------------------------------------------------

const REGISTRY: Record<string, React.FC<{ s: React.SVGProps<SVGSVGElement> }>> = {
  c1: TriangleRuler,
  c2: Abacus,
  c3: PlusTile,
};

export const ClassIcon = ({ id, size = 26, stroke = 2, style }: ClassIconProps) => {
  const Glyph = REGISTRY[id] ?? BookFallback;
  const svgProps: React.SVGProps<SVGSVGElement> = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: stroke,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    style,
  };
  return <Glyph s={svgProps}/>;
};
