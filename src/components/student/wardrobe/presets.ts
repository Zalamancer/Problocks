// Built-in preset outfits + randomize helper.
import { ALL_ITEMS, ITEMS_BY_CATEGORY } from './catalog';
import type { MeshCategory, Outfit, Preset } from './types';

const DEFAULT_OUTFIT: Outfit = {
  hat: null,
  hair: 'hair-short-brown',
  face: 'face-smile',
  shirt: 'shirt-green',
  pants: 'pants-navy',
  shoes: 'shoes-sneaker-white',
  backpack: 'bag-school-blue',
  accessory: null,
  pet: null,
  skin: '#e4b888',
  bodyShape: 'classic',
  emote: 'idle',
};

export const PRESETS: Preset[] = [
  { id: 'preset-default', label: 'Default', outfit: DEFAULT_OUTFIT },
  {
    id: 'preset-school', label: 'School',
    outfit: {
      ...DEFAULT_OUTFIT,
      hair: 'hair-bun',
      face: 'face-happy',
      shirt: 'shirt-uniform',
      pants: 'pants-skirt-red',
      shoes: 'shoes-sneaker-black',
      backpack: 'bag-school-red',
      accessory: 'acc-glasses-round',
    },
  },
  {
    id: 'preset-wizard', label: 'Wizard',
    outfit: {
      ...DEFAULT_OUTFIT,
      hat: 'hat-wizard',
      hair: 'hair-long-silver',
      face: 'face-cool',
      shirt: 'shirt-wizard',
      pants: 'pants-wizard',
      shoes: 'shoes-boots',
      backpack: 'bag-quiver',
      accessory: 'acc-monocle',
      pet: 'pet-dragon',
      skin: '#f4dbb5',
    },
  },
  {
    id: 'preset-street', label: 'Street',
    outfit: {
      ...DEFAULT_OUTFIT,
      hat: 'hat-beanie-mint',
      hair: 'hair-spike-blue',
      face: 'face-cool',
      shirt: 'shirt-hoodie',
      pants: 'pants-track',
      shoes: 'shoes-sneaker-red',
      backpack: 'bag-none',
      accessory: 'acc-shades',
      pet: 'pet-cat',
      skin: '#c9935f',
    },
  },
];

export function defaultOutfit(): Outfit {
  return { ...DEFAULT_OUTFIT };
}

const randomFromOwned = (cat: MeshCategory, owned: Set<string>, allowNone = true): string | null => {
  const pool = ITEMS_BY_CATEGORY[cat].filter((i) => owned.has(i.id) || i.preowned || i.cost === 0);
  if (allowNone && Math.random() < 0.25) {
    const noneItem = pool.find((i) => i.id.endsWith('-none'));
    if (noneItem) return noneItem.id;
  }
  if (!pool.length) return null;
  const pick = pool[Math.floor(Math.random() * pool.length)];
  return pick.id;
};

export function randomizeOutfit(current: Outfit, owned: Set<string>): Outfit {
  return {
    ...current,
    hat:       randomFromOwned('hat', owned),
    hair:      randomFromOwned('hair', owned, false),
    face:      randomFromOwned('face', owned, false) ?? current.face,
    shirt:     randomFromOwned('shirt', owned, false),
    pants:     randomFromOwned('pants', owned, false),
    shoes:     randomFromOwned('shoes', owned, false),
    backpack:  randomFromOwned('backpack', owned),
    accessory: randomFromOwned('accessory', owned),
    pet:       randomFromOwned('pet', owned),
    skin:      ['#f4dbb5', '#e4b888', '#c9935f', '#a06a3f', '#6f4626'][Math.floor(Math.random() * 5)],
  };
}

void ALL_ITEMS;
