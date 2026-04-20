// Aggregated wardrobe catalog. Combines all category builders and exposes
// helpers for lookup, filtering, and "owned" calculation.
import type { Item, MeshCategory } from './types';
import { HATS } from './builders/hats';
import { HAIRS } from './builders/hair';
import { FACES } from './builders/face';
import { SHIRTS, PANTS, SHOES } from './builders/clothing';
import { BACKPACKS, ACCESSORIES, PETS } from './builders/extras';

export const ALL_ITEMS: Item[] = [
  ...HATS, ...HAIRS, ...FACES,
  ...SHIRTS, ...PANTS, ...SHOES,
  ...BACKPACKS, ...ACCESSORIES, ...PETS,
];

export const ITEMS_BY_ID: Record<string, Item> = Object.fromEntries(
  ALL_ITEMS.map((i) => [i.id, i]),
);

export const ITEMS_BY_CATEGORY: Record<MeshCategory, Item[]> = {
  hat:        HATS,
  hair:       HAIRS,
  face:       FACES,
  shirt:      SHIRTS,
  pants:      PANTS,
  shoes:      SHOES,
  backpack:   BACKPACKS,
  accessory:  ACCESSORIES,
  pet:        PETS,
};

export const CATEGORY_LABELS: Record<MeshCategory, string> = {
  hat:       'Hats',
  hair:      'Hair',
  face:      'Face',
  shirt:     'Shirts',
  pants:     'Pants',
  shoes:     'Shoes',
  backpack:  'Backpacks',
  accessory: 'Accessories',
  pet:       'Pets',
};

export const CATEGORY_ICONS: Record<MeshCategory, string> = {
  hat: '🎩', hair: '💇', face: '😊',
  shirt: '👕', pants: '👖', shoes: '👟',
  backpack: '🎒', accessory: '👓', pet: '🐾',
};

/** Default ownership: items with `preowned` or `cost=0` start owned. */
export function defaultOwned(): Set<string> {
  return new Set(ALL_ITEMS.filter((i) => i.preowned || i.cost === 0).map((i) => i.id));
}

export function isOwned(itemId: string, owned: Set<string>): boolean {
  const item = ITEMS_BY_ID[itemId];
  if (!item) return false;
  if (item.preowned || item.cost === 0) return true;
  return owned.has(itemId);
}
