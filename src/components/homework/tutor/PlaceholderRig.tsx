// Inline-SVG placeholder character used until the real PNG rig lands. The
// body is rendered as a single SVG so layout stays crisp at any size, and
// the mouth is a separate slot that TutorAvatar swaps per viseme.
//
// The real rig will replace this with a CharacterRig whose layers + viseme
// map point at PNGs under /public/assets/tutor/. The viseme-mouth shape
// renderer below doubles as a visual spec for which mouths are needed.

import type { VisemeKey } from './tutor-types';

export function PlaceholderBody() {
  return (
    <svg viewBox="0 0 100 133" width="100%" height="100%">
      {/* legs */}
      <rect x={38} y={95} width={10} height={30} rx={3} fill="#3a3c4a" />
      <rect x={52} y={95} width={10} height={30} rx={3} fill="#3a3c4a" />
      {/* torso */}
      <rect x={28} y={58} width={44} height={42} rx={8} fill="#6fbf73" stroke="#1d1a14" strokeWidth={1.5} />
      {/* arms */}
      <rect x={18} y={60} width={10} height={32} rx={4} fill="#6fbf73" stroke="#1d1a14" strokeWidth={1.5} />
      <rect x={72} y={60} width={10} height={32} rx={4} fill="#6fbf73" stroke="#1d1a14" strokeWidth={1.5} />
      {/* neck */}
      <rect x={46} y={50} width={8} height={10} fill="#d7ad7c" />
      {/* head */}
      <ellipse cx={50} cy={34} rx={18} ry={20} fill="#e8c39a" stroke="#1d1a14" strokeWidth={1.5} />
      {/* hair */}
      <path d="M32 26 Q50 10 68 26 Q68 18 50 14 Q32 18 32 26 Z" fill="#3a2a1a" />
      {/* eyes */}
      <ellipse cx={43} cy={33} rx={2} ry={2.6} fill="#1d1a14" />
      <ellipse cx={57} cy={33} rx={2} ry={2.6} fill="#1d1a14" />
      {/* cheek blush */}
      <ellipse cx={40} cy={40} rx={2.4} ry={1.4} fill="#ffb4a2" opacity={0.6} />
      <ellipse cx={60} cy={40} rx={2.4} ry={1.4} fill="#ffb4a2" opacity={0.6} />
      {/* brows */}
      <path d="M39 28 L46 27" stroke="#1d1a14" strokeWidth={1.5} strokeLinecap="round" />
      <path d="M54 27 L61 28" stroke="#1d1a14" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}

// Per-viseme mouth shape. Drawn in a 20×10 local viewport so TutorAvatar
// can place it precisely over the face. Real PNGs should match this aspect.
export function PlaceholderMouth({ viseme }: { viseme: VisemeKey }) {
  const shapes: Record<VisemeKey, React.ReactNode> = {
    rest: (
      <path d="M4 5 Q10 7 16 5" stroke="#1d1a14" strokeWidth={1.4} fill="none" strokeLinecap="round" />
    ),
    mbp: (
      <path d="M4 5 L16 5" stroke="#1d1a14" strokeWidth={1.6} fill="none" strokeLinecap="round" />
    ),
    ai: (
      <ellipse cx={10} cy={5} rx={5} ry={3.2} fill="#3a1a10" stroke="#1d1a14" strokeWidth={1.2} />
    ),
    e: (
      <g>
        <ellipse cx={10} cy={5} rx={5} ry={1.8} fill="#3a1a10" stroke="#1d1a14" strokeWidth={1.2} />
        <rect x={6} y={4} width={8} height={1.2} fill="#fff" />
      </g>
    ),
    o: (
      <ellipse cx={10} cy={5} rx={2.6} ry={2.8} fill="#3a1a10" stroke="#1d1a14" strokeWidth={1.2} />
    ),
    u: (
      <ellipse cx={10} cy={5} rx={1.8} ry={2.2} fill="#3a1a10" stroke="#1d1a14" strokeWidth={1.2} />
    ),
    fv: (
      <g>
        <path d="M4 5 L16 5" stroke="#1d1a14" strokeWidth={1.4} fill="none" strokeLinecap="round" />
        <rect x={7} y={3.4} width={6} height={1.4} fill="#fff" stroke="#1d1a14" strokeWidth={0.6} />
      </g>
    ),
    l: (
      <g>
        <ellipse cx={10} cy={5} rx={4} ry={2.4} fill="#3a1a10" stroke="#1d1a14" strokeWidth={1.2} />
        <rect x={8.5} y={3} width={3} height={2} rx={0.6} fill="#ff8899" />
      </g>
    ),
  };
  return (
    <svg viewBox="0 0 20 10" width="100%" height="100%">
      {shapes[viseme]}
    </svg>
  );
}

// Where the mouth sits on the placeholder body (in the 0–100 viewport).
export const PLACEHOLDER_MOUTH_BOX = { x: 42, y: 38, w: 16, h: 8, z: 10 };
