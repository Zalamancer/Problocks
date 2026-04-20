// 2D SVG silhouette previews for wardrobe tiles. One per category, colored
// with the item's swatch from avatar-map. Kept pure SVG (no WebGL) so a
// grid of dozens of tiles stays under Chrome's 16-context cap and runs
// smoothly on Celeron N4000 Chromebooks.
import React from 'react';
import {
  HAT_SHAPE, HAT_COLOR,
  HAIR_SHAPE, HAIR_COLOR,
  SHIRT_COLOR, PANTS_COLOR,
} from './avatar-map';
import type { Item } from './types';

const INK = '#1d1a14';
const SW = 2.4;

const commonStroke = {
  stroke: INK,
  strokeWidth: SW,
  strokeLinejoin: 'round' as const,
  strokeLinecap: 'round' as const,
};

export function ItemPreview({ item }: { item: Item }) {
  return (
    <svg
      viewBox="0 0 80 80"
      width="100%"
      height="100%"
      style={{ display: 'block' }}
      aria-hidden
    >
      <Shape item={item}/>
    </svg>
  );
}

function Shape({ item }: { item: Item }) {
  switch (item.category) {
    case 'hat': {
      const shape = HAT_SHAPE[item.id] ?? 'cap';
      const color = HAT_COLOR[item.id] ?? '#888';
      if (shape === 'beanie')  return <Beanie color={color}/>;
      if (shape === 'tophat')  return <TopHat color={color}/>;
      return <Cap color={color}/>;
    }
    case 'hair': {
      const shape = HAIR_SHAPE[item.id] ?? 'short';
      const color = HAIR_COLOR[item.id] ?? '#3a2a1a';
      if (shape === 'spike') return <HairSpike color={color}/>;
      if (shape === 'long')  return <HairLong color={color}/>;
      return <HairShort color={color}/>;
    }
    case 'face':     return <Face id={item.id}/>;
    case 'shirt':    return <Shirt color={SHIRT_COLOR[item.id] ?? '#6fbf73'}/>;
    case 'pants':    return <Pants color={PANTS_COLOR[item.id] ?? '#3a3c4a'}/>;
    case 'shoes':    return <Shoe/>;
    case 'backpack': return <Backpack/>;
    case 'accessory':return <Glasses/>;
    case 'pet':      return <Paw/>;
    default:         return null;
  }
}

// ── Hats ────────────────────────────────────────────────────────────────
const Cap = ({ color }: { color: string }) => (
  <g>
    <path d="M16 44 Q40 14 60 44 Z" fill={color} {...commonStroke}/>
    <rect x="14" y="42" width="50" height="8" rx="4" fill={color} {...commonStroke}/>
    <path d="M60 48 Q68 46 70 50" fill="none" {...commonStroke}/>
  </g>
);

const Beanie = ({ color }: { color: string }) => (
  <g>
    <path d="M18 50 Q18 18 40 18 Q62 18 62 50 Z" fill={color} {...commonStroke}/>
    <rect x="16" y="46" width="48" height="10" rx="3" fill={color} {...commonStroke}/>
    <path d="M40 18 L40 10" {...commonStroke} fill="none"/>
    <circle cx="40" cy="8" r="3" fill={color} {...commonStroke}/>
  </g>
);

const TopHat = ({ color }: { color: string }) => (
  <g>
    <rect x="26" y="10" width="28" height="38" rx="2" fill={color} {...commonStroke}/>
    <rect x="14" y="46" width="52" height="8" rx="3" fill={color} {...commonStroke}/>
    <rect x="26" y="38" width="28" height="4" fill={INK}/>
  </g>
);

// ── Hair ────────────────────────────────────────────────────────────────
const HairShort = ({ color }: { color: string }) => (
  <g>
    <path d="M18 44 Q18 14 40 14 Q62 14 62 44 L54 40 L40 34 L26 40 Z"
      fill={color} {...commonStroke}/>
  </g>
);

const HairSpike = ({ color }: { color: string }) => (
  <path
    d="M16 44 L22 16 L30 34 L34 12 L40 32 L46 12 L50 34 L58 16 L64 44 Z"
    fill={color} {...commonStroke}
  />
);

const HairLong = ({ color }: { color: string }) => (
  <path
    d="M16 68 L18 40 Q18 14 40 14 Q62 14 62 40 L64 68 L54 56 L52 40 L40 32 L28 40 L26 56 Z"
    fill={color} {...commonStroke}
  />
);

// ── Face ────────────────────────────────────────────────────────────────
const Face = ({ id }: { id: string }) => {
  const skin = '#f0c68c';
  const isCool  = id === 'face-cool';
  const isWink  = id === 'face-wink';
  const isHappy = id === 'face-happy' || id === 'face-love' || id === 'face-stars';
  const isAngry = id === 'face-angry';
  const isTongue = id === 'face-tongue';
  return (
    <g>
      <circle cx="40" cy="40" r="26" fill={skin} {...commonStroke}/>
      {isCool ? (
        <rect x="22" y="32" width="36" height="8" rx="2" fill={INK}/>
      ) : isWink ? (
        <>
          <circle cx="31" cy="36" r="2.6" fill={INK}/>
          <path d="M45 36 L55 36" {...commonStroke} fill="none"/>
        </>
      ) : isAngry ? (
        <>
          <path d="M26 34 L34 38 M46 38 L54 34" {...commonStroke} fill="none"/>
          <circle cx="31" cy="38" r="2.4" fill={INK}/>
          <circle cx="49" cy="38" r="2.4" fill={INK}/>
        </>
      ) : (
        <>
          <circle cx="31" cy="36" r="2.6" fill={INK}/>
          <circle cx="49" cy="36" r="2.6" fill={INK}/>
        </>
      )}
      {isTongue ? (
        <path d="M32 48 Q40 58 48 48 L48 52 Q40 58 32 52 Z" fill="#c24949" {...commonStroke}/>
      ) : isAngry ? (
        <path d="M30 52 Q40 46 50 52" fill="none" {...commonStroke}/>
      ) : isHappy ? (
        <path d="M28 46 Q40 60 52 46 Z" fill={INK}/>
      ) : (
        <path d="M30 48 Q40 56 50 48" fill="none" {...commonStroke}/>
      )}
    </g>
  );
};

// ── Clothing ────────────────────────────────────────────────────────────
const Shirt = ({ color }: { color: string }) => (
  <g>
    <path d="M18 28 L30 18 L36 24 L44 24 L50 18 L62 28 L58 36 L52 34 L52 62 L28 62 L28 34 L22 36 Z"
      fill={color} {...commonStroke}/>
    <path d="M36 24 Q40 30 44 24" fill="none" {...commonStroke}/>
  </g>
);

const Pants = ({ color }: { color: string }) => (
  <g>
    <path d="M22 16 L58 16 L56 66 L44 66 L40 36 L36 66 L24 66 Z"
      fill={color} {...commonStroke}/>
    <path d="M22 22 L58 22" {...commonStroke} fill="none"/>
  </g>
);

const Shoe = () => (
  <g>
    <path d="M10 50 L20 38 Q38 34 58 38 Q68 46 68 56 L10 56 Z"
      fill="#ffffff" {...commonStroke}/>
    <path d="M20 46 L24 40 M30 46 L34 40 M40 46 L44 40" {...commonStroke} fill="none"/>
    <path d="M10 56 L68 56" stroke={INK} strokeWidth={SW + 1} fill="none" strokeLinecap="round"/>
  </g>
);

const Backpack = () => (
  <g>
    <rect x="20" y="20" width="40" height="46" rx="7" fill="#c24949" {...commonStroke}/>
    <path d="M30 20 L30 14 Q30 8 40 8 Q50 8 50 14 L50 20" fill="none" {...commonStroke}/>
    <rect x="26" y="34" width="28" height="10" rx="2" fill="#ffffff" {...commonStroke}/>
    <rect x="34" y="50" width="12" height="10" rx="2" fill={INK} opacity="0.2"/>
  </g>
);

const Glasses = () => (
  <g>
    <circle cx="26" cy="42" r="12" fill="#ffffff" {...commonStroke}/>
    <circle cx="54" cy="42" r="12" fill="#ffffff" {...commonStroke}/>
    <path d="M38 42 L42 42" {...commonStroke} fill="none"/>
    <path d="M14 42 L10 38 M66 42 L70 38" {...commonStroke} fill="none"/>
  </g>
);

const Paw = () => (
  <g>
    <circle cx="40" cy="50" r="14" fill="#c9a173" {...commonStroke}/>
    <ellipse cx="26" cy="34" rx="5" ry="7" fill="#c9a173" {...commonStroke}/>
    <ellipse cx="40" cy="28" rx="5" ry="7" fill="#c9a173" {...commonStroke}/>
    <ellipse cx="54" cy="34" rx="5" ry="7" fill="#c9a173" {...commonStroke}/>
  </g>
);
