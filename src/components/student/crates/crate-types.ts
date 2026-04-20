// Crate tier definitions + loot-table logic for the unboxing system.
// A "crate tier" is the visual/material quality of the box itself. Each tier
// has a weighted rarity distribution that governs what comes out of it.
import type { Rarity } from '../wardrobe/types';

export type CrateTier = 'paper' | 'cardboard' | 'wooden' | 'metal' | 'crystal';

export interface CrateStyle {
  /** Hex — primary body color of the crate. */
  body: string;
  /** Hex — accent color (straps, rivets, trim). */
  accent: string;
  /** Hex — deeper shade used for shadows / edges. */
  shadow: string;
  /** Hex — the glow/aura color (used for light rays + particle burst). */
  glow: string;
  /** Secondary glow hex for multi-stop gradients (legendary). */
  glow2?: string;
  /** Label shown on the crate card. */
  label: string;
  /** Short flavor text. */
  tagline: string;
  /** Cost in blocks to buy this crate in the shop. */
  cost: number;
  /** Shake/animation intensity multiplier (1 = baseline). */
  intensity: number;
  /** Probability of each rarity dropping, must sum to 1. */
  loot: Record<Rarity, number>;
}

export const CRATE_TIERS: Record<CrateTier, CrateStyle> = {
  paper: {
    body: '#e8dcbc',
    accent: '#c9a173',
    shadow: '#a0824f',
    glow: '#fff3c4',
    label: 'Paper Parcel',
    tagline: 'Scrappy finds wrapped in twine.',
    cost: 120,
    intensity: 0.7,
    loot: { common: 0.75, uncommon: 0.22, rare: 0.03, epic: 0, legendary: 0 },
  },
  cardboard: {
    body: '#b08150',
    accent: '#7a5530',
    shadow: '#4e3620',
    glow: '#b6f0c6',
    label: 'Cardboard Crate',
    tagline: 'Standard school supply drop.',
    cost: 300,
    intensity: 1,
    loot: { common: 0.4, uncommon: 0.45, rare: 0.13, epic: 0.02, legendary: 0 },
  },
  wooden: {
    body: '#a16a3a',
    accent: '#6d4320',
    shadow: '#3d2312',
    glow: '#7ec5ff',
    label: 'Wooden Chest',
    tagline: 'Heavy. Something rare rattles inside.',
    cost: 700,
    intensity: 1.2,
    loot: { common: 0.15, uncommon: 0.35, rare: 0.4, epic: 0.09, legendary: 0.01 },
  },
  metal: {
    body: '#7c8893',
    accent: '#3e4956',
    shadow: '#1c222b',
    glow: '#c8a2ff',
    glow2: '#ff7de9',
    label: 'Metal Vault',
    tagline: 'Forged locks. Epic-grade guaranteed.',
    cost: 1500,
    intensity: 1.5,
    loot: { common: 0, uncommon: 0.15, rare: 0.4, epic: 0.38, legendary: 0.07 },
  },
  crystal: {
    body: '#fff8d6',
    accent: '#ffd84d',
    shadow: '#b48a00',
    glow: '#ffd84d',
    glow2: '#ffb4a2',
    label: 'Crystal Reliquary',
    tagline: 'Light pulses inside. Legendary odds.',
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
