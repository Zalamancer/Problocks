// Crate tier definitions + loot-table logic. Colors use the pb-site tokens
// (cream/butter/mint/coral/pink/ink) so crates read in the same chunky-
// pastel visual language as the rest of the student app. Ink outlines and
// tone blocks, not realistic materials.
import type { Rarity } from '../wardrobe/types';

export type CrateTier = 'paper' | 'cardboard' | 'wooden' | 'metal' | 'crystal';

export interface CrateStyle {
  /** Primary body color (flat tone block). */
  body: string;
  /** Accent stamp / decoration color. */
  accent: string;
  /** Deep ink color used for outlines + drop shadow. */
  shadow: string;
  /** Aura / point-light glow color. */
  glow: string;
  /** Optional second glow for multi-tone particle bursts. */
  glow2?: string;
  label: string;
  tagline: string;
  /** DM-Mono badge text painted into the texture (e.g. "// 01"). */
  code: string;
  cost: number;
  intensity: number;
  loot: Record<Rarity, number>;
}

export const CRATE_TIERS: Record<CrateTier, CrateStyle> = {
  paper: {
    body: '#fdf6e6',   // pbs-cream
    accent: '#ffd84d', // pbs-butter
    shadow: '#1d1a14', // pbs-ink
    glow: '#ffd84d',   // butter
    label: 'Paper Parcel',
    tagline: 'Tied with twine. Scrappy finds.',
    code: '// 01',
    cost: 120,
    intensity: 0.7,
    loot: { common: 0.75, uncommon: 0.22, rare: 0.03, epic: 0, legendary: 0 },
  },
  cardboard: {
    body: '#ffd84d',   // butter
    accent: '#1d1a14', // ink
    shadow: '#6b4f00', // butter-ink
    glow: '#b6f0c6',   // mint
    label: 'Cardboard Crate',
    tagline: 'School-supply drop. Reliable.',
    code: '// 02',
    cost: 300,
    intensity: 1,
    loot: { common: 0.4, uncommon: 0.45, rare: 0.13, epic: 0.02, legendary: 0 },
  },
  wooden: {
    body: '#ffb4a2',   // coral (playful wood-red)
    accent: '#1d1a14', // ink
    shadow: '#7a2a18', // coral-ink
    glow: '#b9d9ff',   // sky
    label: 'Wooden Chest',
    tagline: 'Plank-and-nail. Something rare rattles.',
    code: '// 03',
    cost: 700,
    intensity: 1.2,
    loot: { common: 0.15, uncommon: 0.35, rare: 0.4, epic: 0.09, legendary: 0.01 },
  },
  metal: {
    body: '#1d1a14',   // ink (dark vault)
    accent: '#fdf6e6', // cream
    shadow: '#000000',
    glow: '#dcc7ff',   // grape
    glow2: '#ffc8e0',  // pink
    label: 'Metal Vault',
    tagline: 'Bolted shut. Epic-grade guaranteed.',
    code: '// 04',
    cost: 1500,
    intensity: 1.5,
    loot: { common: 0, uncommon: 0.15, rare: 0.4, epic: 0.38, legendary: 0.07 },
  },
  crystal: {
    body: '#ffc8e0',   // pink
    accent: '#ffd84d', // butter
    shadow: '#8a1e5c', // pink-ink
    glow: '#b6f0c6',   // mint
    glow2: '#ffd84d',  // butter
    label: 'Crystal Reliquary',
    tagline: 'Glows from within. Legendary odds.',
    code: '// 05',
    cost: 4000,
    intensity: 2,
    loot: { common: 0, uncommon: 0, rare: 0.2, epic: 0.55, legendary: 0.25 },
  },
};

export const CRATE_ORDER: CrateTier[] = ['paper', 'cardboard', 'wooden', 'metal', 'crystal'];

/** Pick a rarity from a crate's loot table. Uses weighted random. */
export function rollRarity(tier: CrateTier): Rarity {
  const weights = CRATE_TIERS[tier].loot;
  const r = Math.random();
  let acc = 0;
  for (const rarity of ['legendary', 'epic', 'rare', 'uncommon', 'common'] as Rarity[]) {
    acc += weights[rarity];
    if (r <= acc) return rarity;
  }
  return 'common';
}
