// 2D SVG silhouette previews for wardrobe tiles. One drawing per item id
// (not just per shape) so the hoodie has a hood, the tuxedo has lapels,
// the wizard hat has stars, etc. Pure SVG so a full grid of dozens of
// tiles stays under Chrome's 16-context cap on Celeron N4000 Chromebooks
// — a per-tile WebGL preview would blank the main RobloxAvatar stage.
import React from 'react';
import {
  HAT_COLOR, HAIR_COLOR, SHIRT_COLOR, PANTS_COLOR,
} from './avatar-map';
import type { Item } from './types';

const INK = '#1d1a14';
const SW = 2.4;
const S = {
  stroke: INK,
  strokeWidth: SW,
  strokeLinejoin: 'round' as const,
  strokeLinecap: 'round' as const,
};

export function ItemPreview({ item }: { item: Item }) {
  return (
    <svg viewBox="0 0 80 80" width="100%" height="100%" style={{ display: 'block' }} aria-hidden>
      <Shape item={item}/>
    </svg>
  );
}

function Shape({ item }: { item: Item }) {
  switch (item.category) {
    case 'hat':       return <Hat id={item.id}/>;
    case 'hair':      return <Hair id={item.id}/>;
    case 'face':      return <Face id={item.id}/>;
    case 'shirt':     return <Shirt id={item.id}/>;
    case 'pants':     return <Pants id={item.id}/>;
    case 'shoes':     return <Shoe id={item.id}/>;
    case 'backpack':  return <Bag id={item.id}/>;
    case 'accessory': return <Accessory id={item.id}/>;
    case 'pet':       return <Pet id={item.id}/>;
    default:          return null;
  }
}

// ── Hats ────────────────────────────────────────────────────────────────
function Hat({ id }: { id: string }) {
  const c = HAT_COLOR[id] ?? '#888';
  if (id.startsWith('hat-cap')) return (
    <g>
      <path d="M16 46 Q40 14 60 46 Z" fill={c} {...S}/>
      <rect x="14" y="44" width="54" height="8" rx="4" fill={c} {...S}/>
      <circle cx="40" cy="26" r="3" fill={INK}/>
    </g>
  );
  if (id.startsWith('hat-beanie')) return (
    <g>
      <path d="M18 52 Q18 18 40 18 Q62 18 62 52 Z" fill={c} {...S}/>
      <rect x="16" y="48" width="48" height="10" rx="3" fill={c} {...S}/>
      <path d="M40 18 L40 10" {...S} fill="none"/>
      <circle cx="40" cy="8" r="4" fill={c} {...S}/>
    </g>
  );
  if (id.startsWith('hat-headband')) return (
    <g>
      <rect x="10" y="38" width="60" height="10" rx="3" fill={c} {...S}/>
      <rect x="36" y="40" width="8" height="6" fill="#ffffff"/>
    </g>
  );
  if (id === 'hat-tophat-black' || id === 'hat-tophat-magic') return (
    <g>
      <rect x="26" y="10" width="28" height="38" rx="2" fill={c} {...S}/>
      <rect x="12" y="46" width="56" height="8" rx="3" fill={c} {...S}/>
      <rect x="26" y="38" width="28" height="4" fill={id === 'hat-tophat-magic' ? '#ffd84d' : '#8a8a8a'}/>
      {id === 'hat-tophat-magic' && <text x="40" y="32" fontSize="10" textAnchor="middle" fill="#ffd84d">★</text>}
    </g>
  );
  if (id === 'hat-wizard' || id === 'hat-wizard-mint') return (
    <g>
      <path d="M14 58 Q40 0 66 58 Z" fill={c} {...S}/>
      <path d="M12 58 L68 58" {...S} fill="none" strokeWidth={SW + 1}/>
      <text x="36" y="42" fontSize="10" fill="#ffd84d">★</text>
      <text x="46" y="50" fontSize="8" fill="#ffd84d">★</text>
    </g>
  );
  if (id === 'hat-crown') return (
    <g>
      <path d="M14 52 L20 20 L30 40 L40 16 L50 40 L60 20 L66 52 Z" fill={c} {...S}/>
      <rect x="14" y="50" width="52" height="8" rx="2" fill={c} {...S}/>
      <circle cx="20" cy="20" r="3" fill="#c24949" {...S}/>
      <circle cx="40" cy="16" r="3" fill="#5fa8ff" {...S}/>
      <circle cx="60" cy="20" r="3" fill="#6fbf73" {...S}/>
    </g>
  );
  if (id === 'hat-helmet') return (
    <g>
      <path d="M16 50 Q16 16 40 16 Q64 16 64 50 Z" fill={c} {...S}/>
      <rect x="22" y="32" width="36" height="12" rx="3" fill="#5fa8ff" {...S}/>
      <circle cx="58" cy="24" r="3" fill="#ffd84d" {...S}/>
    </g>
  );
  if (id === 'hat-chef') return (
    <g>
      <path d="M22 52 L22 30 Q22 10 40 12 Q58 10 58 30 L58 52 Z" fill={c} {...S}/>
      <circle cx="30" cy="22" r="8" fill={c} {...S}/>
      <circle cx="40" cy="16" r="9" fill={c} {...S}/>
      <circle cx="50" cy="22" r="8" fill={c} {...S}/>
      <rect x="22" y="48" width="36" height="8" rx="2" fill={c} {...S}/>
    </g>
  );
  if (id === 'hat-propeller') return (
    <g>
      <path d="M18 50 Q18 22 40 22 Q62 22 62 50 Z" fill={c} {...S}/>
      <rect x="16" y="48" width="48" height="8" rx="3" fill={c} {...S}/>
      <rect x="38" y="10" width="4" height="14" fill={INK}/>
      <rect x="22" y="8" width="36" height="3" fill="#c24949" {...S}/>
      <circle cx="40" cy="10" r="2.5" fill={INK}/>
    </g>
  );
  // hat-none / fallback
  return <rect x="20" y="44" width="40" height="10" rx="3" fill="#d9d3c2" {...S}/>;
}

// ── Hair ────────────────────────────────────────────────────────────────
function Hair({ id }: { id: string }) {
  const c = HAIR_COLOR[id] ?? '#3a2a1a';
  if (id === 'hair-none') return (
    <circle cx="40" cy="40" r="22" fill="#f0c68c" {...S}/>
  );
  if (id.startsWith('hair-short')) return (
    <g>
      <circle cx="40" cy="42" r="22" fill="#f0c68c" {...S}/>
      <path d="M18 42 Q18 14 40 14 Q62 14 62 42 L54 38 L40 32 L26 38 Z" fill={c} {...S}/>
    </g>
  );
  if (id.startsWith('hair-long')) return (
    <g>
      <circle cx="40" cy="40" r="20" fill="#f0c68c" {...S}/>
      <path d="M14 70 L18 40 Q18 14 40 14 Q62 14 62 40 L66 70 L54 54 L52 40 L40 32 L28 40 L26 54 Z"
        fill={c} {...S}/>
    </g>
  );
  if (id.startsWith('hair-bun')) return (
    <g>
      <circle cx="40" cy="44" r="20" fill="#f0c68c" {...S}/>
      <path d="M20 46 Q20 18 40 18 Q60 18 60 46 L52 42 L40 38 L28 42 Z" fill={c} {...S}/>
      <circle cx="40" cy="12" r="8" fill={c} {...S}/>
    </g>
  );
  if (id === 'hair-ponytail') return (
    <g>
      <circle cx="36" cy="42" r="20" fill="#f0c68c" {...S}/>
      <path d="M16 44 Q16 14 38 14 Q58 14 58 42 L50 38 L38 32 L24 38 Z" fill={c} {...S}/>
      <path d="M54 30 Q72 40 66 64 L58 62 Q62 46 52 38 Z" fill={c} {...S}/>
    </g>
  );
  if (id.startsWith('hair-spike')) return (
    <g>
      <circle cx="40" cy="44" r="20" fill="#f0c68c" {...S}/>
      <path d="M14 46 L20 16 L28 36 L34 10 L40 34 L46 10 L52 36 L60 16 L66 46 Z" fill={c} {...S}/>
    </g>
  );
  if (id === 'hair-afro') return (
    <g>
      <circle cx="40" cy="46" r="18" fill="#f0c68c" {...S}/>
      <circle cx="26" cy="26" r="10" fill={c} {...S}/>
      <circle cx="40" cy="18" r="12" fill={c} {...S}/>
      <circle cx="54" cy="26" r="10" fill={c} {...S}/>
      <circle cx="20" cy="38" r="8" fill={c} {...S}/>
      <circle cx="60" cy="38" r="8" fill={c} {...S}/>
    </g>
  );
  if (id === 'hair-mohawk') return (
    <g>
      <circle cx="40" cy="44" r="20" fill="#f0c68c" {...S}/>
      <path d="M20 42 Q20 26 40 26 Q60 26 60 42 L52 40 L40 36 L28 40 Z" fill="#3a2a1a" {...S}/>
      <path d="M32 30 L34 8 L40 28 L46 8 L48 30 Z" fill={c} {...S}/>
    </g>
  );
  return <circle cx="40" cy="40" r="22" fill="#f0c68c" {...S}/>;
}

// ── Faces ───────────────────────────────────────────────────────────────
function Face({ id }: { id: string }) {
  const skin = '#f0c68c';
  return (
    <g>
      <circle cx="40" cy="40" r="26" fill={skin} {...S}/>
      {id === 'face-cool' ? (
        <rect x="22" y="34" width="36" height="7" rx="2" fill={INK}/>
      ) : id === 'face-wink' ? (
        <>
          <circle cx="31" cy="36" r="2.6" fill={INK}/>
          <path d="M45 36 L55 36" {...S} fill="none"/>
        </>
      ) : id === 'face-angry' ? (
        <>
          <path d="M26 32 L34 36 M46 36 L54 32" {...S} fill="none"/>
          <circle cx="31" cy="38" r="2.4" fill={INK}/>
          <circle cx="49" cy="38" r="2.4" fill={INK}/>
        </>
      ) : id === 'face-love' ? (
        <>
          <path d="M27 34 Q31 30 31 34 Q31 30 35 34 Q35 40 31 42 Q27 40 27 34 Z" fill="#c24949"/>
          <path d="M45 34 Q49 30 49 34 Q49 30 53 34 Q53 40 49 42 Q45 40 45 34 Z" fill="#c24949"/>
        </>
      ) : id === 'face-stars' ? (
        <>
          <text x="27" y="40" fontSize="11" fill="#ffd84d">★</text>
          <text x="45" y="40" fontSize="11" fill="#ffd84d">★</text>
        </>
      ) : id === 'face-neutral' ? (
        <>
          <circle cx="31" cy="36" r="2.6" fill={INK}/>
          <circle cx="49" cy="36" r="2.6" fill={INK}/>
        </>
      ) : (
        <>
          <circle cx="31" cy="36" r="2.6" fill={INK}/>
          <circle cx="49" cy="36" r="2.6" fill={INK}/>
        </>
      )}
      {id === 'face-tongue' ? (
        <>
          <path d="M32 48 L48 48" {...S} fill="none"/>
          <path d="M40 48 Q45 58 40 54" fill="#c24949" {...S}/>
        </>
      ) : id === 'face-angry' ? (
        <path d="M30 52 Q40 46 50 52" fill="none" {...S}/>
      ) : id === 'face-happy' || id === 'face-love' || id === 'face-stars' ? (
        <path d="M28 46 Q40 60 52 46 Z" fill={INK}/>
      ) : id === 'face-neutral' ? (
        <path d="M32 50 L48 50" {...S} fill="none"/>
      ) : (
        <path d="M30 48 Q40 56 50 48" fill="none" {...S}/>
      )}
    </g>
  );
}

// ── Shirts ──────────────────────────────────────────────────────────────
function Shirt({ id }: { id: string }) {
  const c = SHIRT_COLOR[id] ?? '#6fbf73';
  const body = (
    <path d="M18 28 L30 18 L36 24 L44 24 L50 18 L62 28 L58 36 L52 34 L52 62 L28 62 L28 34 L22 36 Z"
      fill={c} {...S}/>
  );
  if (id === 'shirt-stripes') return (
    <g>
      {body}
      <path d="M28 40 L52 40 M28 48 L52 48 M28 56 L52 56" stroke="#c24949" strokeWidth={SW + 0.5} fill="none"/>
    </g>
  );
  if (id === 'shirt-uniform') return (
    <g>
      {body}
      <path d="M36 24 L40 34 L44 24" fill="#ffffff" {...S}/>
      <path d="M37 28 L37 60 M43 28 L43 60" stroke={INK} strokeWidth={1.4} fill="none"/>
      <rect x="36" y="40" width="8" height="6" fill="#ffd84d" {...S}/>
    </g>
  );
  if (id === 'shirt-hoodie') return (
    <g>
      {body}
      <path d="M30 18 Q40 8 50 18 L50 26 Q40 22 30 26 Z" fill={c} {...S}/>
      <rect x="32" y="46" width="16" height="10" rx="2" fill={INK} opacity="0.2"/>
      <path d="M38 22 L38 32 M42 22 L42 32" {...S} fill="none"/>
    </g>
  );
  if (id === 'shirt-labcoat') return (
    <g>
      <path d="M18 28 L30 18 L36 24 L44 24 L50 18 L62 28 L58 36 L52 34 L52 66 L28 66 L28 34 L22 36 Z"
        fill="#ffffff" {...S}/>
      <path d="M40 24 L40 66" {...S} fill="none"/>
      <rect x="33" y="42" width="6" height="8" fill="none" {...S}/>
      <rect x="41" y="42" width="6" height="8" fill="none" {...S}/>
      <circle cx="34" cy="30" r="1.5" fill={INK}/>
      <circle cx="34" cy="36" r="1.5" fill={INK}/>
    </g>
  );
  if (id === 'shirt-jersey') return (
    <g>
      {body}
      <text x="40" y="52" fontSize="16" fontWeight="800" textAnchor="middle" fill="#ffffff">7</text>
    </g>
  );
  if (id === 'shirt-wizard') return (
    <g>
      <path d="M14 28 L28 16 L36 22 L44 22 L52 16 L66 28 L60 66 L20 66 Z" fill={c} {...S}/>
      <text x="30" y="44" fontSize="9" fill="#ffd84d">★</text>
      <text x="44" y="54" fontSize="9" fill="#ffd84d">★</text>
    </g>
  );
  if (id === 'shirt-armor') return (
    <g>
      {body}
      <path d="M40 26 L40 62" {...S} fill="none"/>
      <path d="M30 38 L50 38 M30 48 L50 48 M30 58 L50 58" stroke={INK} strokeWidth={1.6} fill="none"/>
      <circle cx="40" cy="32" r="3" fill="#ffd84d" {...S}/>
    </g>
  );
  if (id === 'shirt-apron') return (
    <g>
      <path d="M18 28 L30 18 L36 24 L44 24 L50 18 L62 28 L58 36 L52 34 L52 62 L28 62 L28 34 L22 36 Z"
        fill="#ffffff" {...S}/>
      <path d="M32 26 L32 60 L48 60 L48 26 Z" fill={c} {...S}/>
      <path d="M32 26 L26 18 M48 26 L54 18" {...S} fill="none"/>
    </g>
  );
  if (id === 'shirt-tuxedo') return (
    <g>
      {body}
      <path d="M40 22 L34 34 L40 44 L46 34 Z" fill="#ffffff" {...S}/>
      <path d="M40 26 L30 52 M40 26 L50 52" stroke="#ffffff" strokeWidth={SW} fill="none"/>
      <path d="M36 40 L44 40 L42 46 L38 46 Z" fill="#c24949" {...S}/>
    </g>
  );
  return body;
}

// ── Pants ───────────────────────────────────────────────────────────────
function Pants({ id }: { id: string }) {
  const c = PANTS_COLOR[id] ?? '#3a3c4a';
  if (id === 'pants-shorts') return (
    <g>
      <path d="M22 16 L58 16 L56 46 L44 46 L40 28 L36 46 L24 46 Z" fill={c} {...S}/>
      <path d="M22 22 L58 22" {...S} fill="none"/>
    </g>
  );
  if (id === 'pants-track') return (
    <g>
      <path d="M22 16 L58 16 L56 66 L44 66 L40 36 L36 66 L24 66 Z" fill={c} {...S}/>
      <path d="M30 22 L28 66 M50 22 L52 66" stroke="#ffffff" strokeWidth={SW} fill="none"/>
    </g>
  );
  if (id.startsWith('pants-skirt')) return (
    <g>
      <path d="M24 18 L56 18 L64 60 L16 60 Z" fill={c} {...S}/>
      {id === 'pants-skirt-plaid' && (
        <>
          <path d="M26 30 L58 30 M24 42 L60 42 M22 54 L62 54" stroke="#ffffff" strokeWidth={1.2} fill="none"/>
          <path d="M32 20 L28 60 M48 20 L52 60" stroke="#ffffff" strokeWidth={1.2} fill="none"/>
        </>
      )}
    </g>
  );
  if (id === 'pants-wizard') return (
    <g>
      <path d="M20 16 L60 16 L62 66 L42 66 L40 40 L38 66 L18 66 Z" fill={c} {...S}/>
      <text x="30" y="44" fontSize="8" fill="#ffd84d">★</text>
      <text x="44" y="54" fontSize="8" fill="#ffd84d">★</text>
    </g>
  );
  if (id === 'pants-armor') return (
    <g>
      <path d="M22 16 L58 16 L56 66 L44 66 L40 36 L36 66 L24 66 Z" fill={c} {...S}/>
      <path d="M24 30 L56 30 M24 44 L56 44 M24 56 L56 56" stroke={INK} strokeWidth={1.4} fill="none"/>
    </g>
  );
  return (
    <g>
      <path d="M22 16 L58 16 L56 66 L44 66 L40 36 L36 66 L24 66 Z" fill={c} {...S}/>
      <path d="M22 22 L58 22" {...S} fill="none"/>
    </g>
  );
}

// ── Shoes ───────────────────────────────────────────────────────────────
function Shoe({ id }: { id: string }) {
  const sneaker = (fill: string, sole = '#ffffff') => (
    <g>
      <path d="M10 50 L20 38 Q38 34 58 38 Q68 46 68 54 L10 54 Z" fill={fill} {...S}/>
      <rect x="10" y="52" width="58" height="6" rx="2" fill={sole} {...S}/>
      <path d="M22 46 L26 40 M30 46 L34 40 M38 46 L42 40" {...S} fill="none"/>
    </g>
  );
  if (id === 'shoes-sneaker-white') return sneaker('#ffffff', '#c9c4b5');
  if (id === 'shoes-sneaker-black') return sneaker('#1d1a14', '#e4e4e4');
  if (id === 'shoes-sneaker-red')   return sneaker('#c24949');
  if (id === 'shoes-boots') return (
    <g>
      <path d="M22 20 L48 20 L50 54 L62 54 L62 62 L14 62 L14 54 L20 54 Z" fill="#3d2718" {...S}/>
      <path d="M20 30 L48 30 M20 40 L48 40" stroke={INK} strokeWidth={1.4} fill="none"/>
      <circle cx="28" cy="34" r="1.4" fill="#ffd84d"/>
      <circle cx="40" cy="34" r="1.4" fill="#ffd84d"/>
    </g>
  );
  if (id === 'shoes-galoshes') return (
    <g>
      <path d="M20 16 L50 16 L52 54 L64 54 L64 62 L14 62 L14 54 L18 54 Z" fill="#ffd84d" {...S}/>
      <circle cx="30" cy="36" r="3" fill="#c24949" {...S}/>
      <circle cx="42" cy="30" r="3" fill="#c24949" {...S}/>
    </g>
  );
  if (id === 'shoes-glass') return (
    <g>
      <path d="M10 50 L22 36 Q40 32 58 36 Q66 44 66 54 L10 54 Z" fill="#e8f4ff" {...S} opacity="0.9"/>
      <path d="M18 42 L22 38 M28 42 L32 38" stroke="#ffffff" strokeWidth={1.6} fill="none"/>
      <text x="50" y="44" fontSize="10" fill="#ffd84d">✦</text>
    </g>
  );
  return <path d="M10 50 L20 40 Q38 36 58 40 Q68 48 68 56 L10 56 Z" fill="#888" {...S}/>;
}

// ── Backpacks ───────────────────────────────────────────────────────────
function Bag({ id }: { id: string }) {
  if (id === 'bag-jet') return (
    <g>
      <rect x="22" y="18" width="36" height="44" rx="4" fill="#8a8a8a" {...S}/>
      <circle cx="30" cy="60" r="6" fill="#ffd84d" {...S}/>
      <circle cx="50" cy="60" r="6" fill="#ffd84d" {...S}/>
      <rect x="28" y="28" width="24" height="10" rx="2" fill="#5fa8ff" {...S}/>
    </g>
  );
  if (id === 'bag-quiver') return (
    <g>
      <rect x="28" y="14" width="24" height="52" rx="4" fill="#3d2718" {...S}/>
      <path d="M34 14 L34 6 M40 14 L40 4 M46 14 L46 6" {...S} fill="none"/>
      <path d="M32 2 L36 10 M38 0 L42 8 M44 2 L48 10" stroke="#c24949" strokeWidth={SW} fill="none"/>
    </g>
  );
  if (id === 'bag-lunchbox') return (
    <g>
      <rect x="18" y="28" width="44" height="32" rx="4" fill="#c24949" {...S}/>
      <rect x="34" y="22" width="12" height="10" rx="2" fill="#c24949" {...S}/>
      <path d="M18 40 L62 40" {...S} fill="none"/>
      <circle cx="40" cy="42" r="2" fill="#ffd84d"/>
    </g>
  );
  // school backpacks
  const color = id === 'bag-school-red'  ? '#c24949'
              : id === 'bag-school-mint' ? '#b6f0c6'
              : '#5fa8ff';
  return (
    <g>
      <rect x="20" y="20" width="40" height="46" rx="7" fill={color} {...S}/>
      <path d="M30 20 L30 14 Q30 8 40 8 Q50 8 50 14 L50 20" fill="none" {...S}/>
      <rect x="26" y="34" width="28" height="10" rx="2" fill="#ffffff" {...S}/>
      <rect x="34" y="50" width="12" height="10" rx="2" fill={INK} opacity="0.2"/>
    </g>
  );
}

// ── Accessories ─────────────────────────────────────────────────────────
function Accessory({ id }: { id: string }) {
  if (id === 'acc-glasses-round') return (
    <g>
      <circle cx="26" cy="42" r="12" fill="#9ad7ff" {...S} opacity="0.8"/>
      <circle cx="54" cy="42" r="12" fill="#9ad7ff" {...S} opacity="0.8"/>
      <path d="M38 42 L42 42" {...S} fill="none"/>
    </g>
  );
  if (id === 'acc-glasses-thick') return (
    <g>
      <rect x="14" y="32" width="24" height="20" rx="3" fill="#9ad7ff" stroke="#3d2718" strokeWidth={SW + 1}/>
      <rect x="42" y="32" width="24" height="20" rx="3" fill="#9ad7ff" stroke="#3d2718" strokeWidth={SW + 1}/>
      <path d="M38 42 L42 42" stroke="#3d2718" strokeWidth={SW + 1} fill="none"/>
    </g>
  );
  if (id === 'acc-shades') return (
    <g>
      <rect x="14" y="32" width="24" height="18" rx="9" fill={INK} {...S}/>
      <rect x="42" y="32" width="24" height="18" rx="9" fill={INK} {...S}/>
      <path d="M38 40 L42 40" {...S} fill="none"/>
      <path d="M18 36 L24 40" stroke="#ffffff" strokeWidth={1.4} opacity="0.8" fill="none"/>
    </g>
  );
  if (id === 'acc-monocle') return (
    <g>
      <circle cx="52" cy="40" r="14" fill="#9ad7ff" {...S} opacity="0.7"/>
      <path d="M52 54 L54 66" {...S} fill="none"/>
    </g>
  );
  if (id === 'acc-tie') return (
    <g>
      <path d="M34 14 L46 14 L42 26 L44 54 L36 54 L38 26 Z" fill="#c24949" {...S}/>
      <path d="M36 26 L44 26" {...S} fill="none"/>
    </g>
  );
  if (id === 'acc-bowtie') return (
    <g>
      <path d="M14 30 L34 22 L34 50 L14 42 Z" fill="#c24949" {...S}/>
      <path d="M66 30 L46 22 L46 50 L66 42 Z" fill="#c24949" {...S}/>
      <rect x="33" y="26" width="14" height="20" rx="2" fill="#c24949" {...S}/>
    </g>
  );
  if (id === 'acc-scarf') return (
    <g>
      <path d="M14 30 Q40 22 66 30 L62 44 Q40 38 18 44 Z" fill="#c24949" {...S}/>
      <path d="M28 44 L26 66 L34 66 L36 44" fill="#c24949" {...S}/>
      <path d="M30 50 L34 50 M30 56 L34 56" stroke="#ffffff" strokeWidth={1.4} fill="none"/>
    </g>
  );
  if (id === 'acc-halo') return (
    <g>
      <circle cx="40" cy="44" r="20" fill="#f0c68c" {...S}/>
      <ellipse cx="40" cy="16" rx="22" ry="6" fill="none" stroke="#ffd84d" strokeWidth={SW + 1}/>
      <ellipse cx="40" cy="16" rx="22" ry="6" fill="none" stroke="#ffffff" strokeWidth={1} opacity="0.9"/>
    </g>
  );
  if (id === 'acc-wings' || id === 'acc-bat-wings') {
    const bat = id === 'acc-bat-wings';
    const col = bat ? '#1d1a14' : '#ffffff';
    return (
      <g>
        <circle cx="40" cy="44" r="14" fill="#f0c68c" {...S}/>
        <path d={bat
          ? 'M26 40 L6 28 L10 42 L4 46 L12 50 L10 58 L22 50 Z'
          : 'M26 40 Q4 30 8 48 Q18 46 24 52 Z'} fill={col} {...S}/>
        <path d={bat
          ? 'M54 40 L74 28 L70 42 L76 46 L68 50 L70 58 L58 50 Z'
          : 'M54 40 Q76 30 72 48 Q62 46 56 52 Z'} fill={col} {...S}/>
      </g>
    );
  }
  return null;
}

// ── Pets ────────────────────────────────────────────────────────────────
function Pet({ id }: { id: string }) {
  if (id === 'pet-cat') return (
    <g>
      <circle cx="40" cy="48" r="18" fill="#f2c85c" {...S}/>
      <path d="M26 40 L22 26 L34 36 Z" fill="#f2c85c" {...S}/>
      <path d="M54 40 L58 26 L46 36 Z" fill="#f2c85c" {...S}/>
      <circle cx="34" cy="48" r="2" fill={INK}/>
      <circle cx="46" cy="48" r="2" fill={INK}/>
      <path d="M38 54 L40 56 L42 54" {...S} fill="none"/>
      <path d="M28 52 L20 50 M28 55 L20 56 M52 52 L60 50 M52 55 L60 56" stroke={INK} strokeWidth={1.2} fill="none"/>
    </g>
  );
  if (id === 'pet-dog') return (
    <g>
      <circle cx="40" cy="48" r="18" fill="#c9a173" {...S}/>
      <path d="M24 30 Q18 48 30 50 Z" fill="#3d2718" {...S}/>
      <path d="M56 30 Q62 48 50 50 Z" fill="#3d2718" {...S}/>
      <circle cx="34" cy="46" r="2" fill={INK}/>
      <circle cx="46" cy="46" r="2" fill={INK}/>
      <ellipse cx="40" cy="54" rx="4" ry="2.6" fill={INK}/>
      <path d="M40 57 L40 60" {...S} fill="none"/>
    </g>
  );
  if (id === 'pet-rabbit') return (
    <g>
      <ellipse cx="40" cy="52" rx="18" ry="14" fill="#ffffff" {...S}/>
      <ellipse cx="32" cy="28" rx="5" ry="14" fill="#ffffff" {...S}/>
      <ellipse cx="48" cy="28" rx="5" ry="14" fill="#ffffff" {...S}/>
      <ellipse cx="32" cy="30" rx="2" ry="8" fill="#ffc8e0"/>
      <ellipse cx="48" cy="30" rx="2" ry="8" fill="#ffc8e0"/>
      <circle cx="34" cy="50" r="2" fill={INK}/>
      <circle cx="46" cy="50" r="2" fill={INK}/>
      <circle cx="40" cy="54" r="2" fill="#ffc8e0" {...S}/>
    </g>
  );
  if (id === 'pet-slime') return (
    <g>
      <path d="M16 58 Q16 32 40 32 Q64 32 64 58 Q64 66 56 66 L24 66 Q16 66 16 58 Z"
        fill="#6fbf73" {...S}/>
      <ellipse cx="30" cy="42" rx="3" ry="5" fill="#ffffff" opacity="0.7"/>
      <circle cx="34" cy="50" r="2" fill={INK}/>
      <circle cx="46" cy="50" r="2" fill={INK}/>
      <path d="M36 56 Q40 60 44 56" {...S} fill="none"/>
    </g>
  );
  if (id === 'pet-dragon') return (
    <g>
      <ellipse cx="40" cy="52" rx="18" ry="12" fill="#c24949" {...S}/>
      <path d="M30 40 L22 30 L30 36 Z" fill="#c24949" {...S}/>
      <path d="M50 40 L58 30 L50 36 Z" fill="#c24949" {...S}/>
      <path d="M24 46 L14 44 Q12 52 22 56 Z" fill="#c24949" {...S}/>
      <path d="M56 46 L66 44 Q68 52 58 56 Z" fill="#c24949" {...S}/>
      <circle cx="34" cy="48" r="2" fill="#ffd84d"/>
      <circle cx="46" cy="48" r="2" fill="#ffd84d"/>
      <path d="M38 56 L42 56" {...S} fill="none"/>
      <path d="M30 66 L32 72 M50 66 L48 72" {...S} fill="none"/>
    </g>
  );
  return null;
}
