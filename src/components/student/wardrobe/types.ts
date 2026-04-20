// Shared types for the Problocks wardrobe: category taxonomy, rarity
// scale, themes, emote list, outfit shape.
import type * as THREE from 'three';

export type MeshCategory =
  | 'hat' | 'hair' | 'face' | 'shirt' | 'pants'
  | 'shoes' | 'backpack' | 'accessory' | 'pet';

export type Category = MeshCategory | 'skin' | 'body' | 'emote';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type Theme = 'school' | 'subject' | 'street' | 'fantasy' | 'food';

export type BodyShape = 'classic' | 'stocky' | 'slim';

export type Emote = 'idle' | 'wave' | 'dance' | 'jump' | 'think' | 'cheer';

export interface MeshBuilderContext {
  skin: string;
}

export interface Item {
  id: string;
  category: MeshCategory;
  label: string;
  rarity: Rarity;
  theme: Theme;
  cost: number;          // 0 = free and pre-owned by default
  preowned?: boolean;    // true → free even if cost > 0
  /** Build the equipped mesh. Mount position is handled by AvatarScene. */
  build: (three: typeof THREE, ctx: MeshBuilderContext) => THREE.Object3D;
}

export interface Outfit {
  hat: string | null;
  hair: string | null;
  face: string;          // face is always set (smile by default)
  shirt: string | null;
  pants: string | null;
  shoes: string | null;
  backpack: string | null;
  accessory: string | null;
  pet: string | null;
  skin: string;          // hex
  bodyShape: BodyShape;
  emote: Emote;
}

export interface Preset {
  id: string;
  label: string;
  outfit: Outfit;
}

export const RARITY_COLORS: Record<Rarity, { bg: string; ink: string; label: string }> = {
  common:    { bg: '#e8e3d4', ink: '#4b463a', label: 'Common' },
  uncommon:  { bg: '#b6f0c6', ink: '#0f5b2e', label: 'Uncommon' },
  rare:      { bg: '#b9d9ff', ink: '#1b4a8a', label: 'Rare' },
  epic:      { bg: '#dcc7ff', ink: '#4d2a8a', label: 'Epic' },
  legendary: { bg: '#ffd84d', ink: '#6b4f00', label: 'Legendary' },
};

export const THEME_LABELS: Record<Theme, string> = {
  school:  'School',
  subject: 'Subjects',
  street:  'Street',
  fantasy: 'Fantasy',
  food:    'Food',
};

export const EMOTE_LABELS: Record<Emote, string> = {
  idle:  'Idle',
  wave:  'Wave',
  dance: 'Dance',
  jump:  'Jump',
  think: 'Think',
  cheer: 'Cheer',
};

export const BODY_LABELS: Record<BodyShape, string> = {
  classic: 'Classic',
  stocky:  'Stocky',
  slim:    'Slim',
};

export const SKIN_COLORS = [
  '#f4dbb5', '#e4b888', '#c9935f', '#a06a3f', '#6f4626', '#3d2718',
  '#d4b081', '#f5c6a0', '#cba27a', '#8a5a3a',
];
