// Translates the rich wardrobe `Outfit` (item IDs across many categories)
// into the simple `AvatarOutfit` understood by `RobloxAvatar` (the same
// character renderer used on the student profile card).
//
// RobloxAvatar only knows about: skin colour, shirt colour, pants colour,
// face shape, hat shape (cap/beanie/tophat) + colour, hair shape
// (short/spike/long) + colour. Anything outside that vocabulary
// (shoes, backpack, accessory, pet, body shape, emote, helmet/crown/etc.)
// silently falls back to the closest match or to "none".
import type { AvatarFace, AvatarHair, AvatarHat, AvatarOutfit } from '../RobloxAvatar';
import type { Outfit } from './types';

// ─── Hat (item id → shape + colour) ───────────────────────────────────────

export const HAT_SHAPE: Record<string, AvatarHat> = {
  'hat-cap-red': 'cap',
  'hat-cap-blue': 'cap',
  'hat-cap-green': 'cap',
  'hat-headband-red': 'cap',
  'hat-headband-gold': 'cap',
  'hat-helmet': 'cap',
  'hat-propeller': 'cap',
  'hat-beanie-mint': 'beanie',
  'hat-beanie-pink': 'beanie',
  'hat-tophat-black': 'tophat',
  'hat-tophat-magic': 'tophat',
  'hat-wizard': 'tophat',
  'hat-wizard-mint': 'tophat',
  'hat-crown': 'tophat',
  'hat-chef': 'tophat',
};

export const HAT_COLOR: Record<string, string> = {
  'hat-cap-red': '#c24949',
  'hat-cap-blue': '#5fa8ff',
  'hat-cap-green': '#6fbf73',
  'hat-beanie-mint': '#b6f0c6',
  'hat-beanie-pink': '#ffc8e0',
  'hat-headband-red': '#c24949',
  'hat-headband-gold': '#ffd84d',
  'hat-tophat-black': '#1d1a14',
  'hat-tophat-magic': '#4d2a8a',
  'hat-wizard': '#4d2a8a',
  'hat-wizard-mint': '#0f5b2e',
  'hat-crown': '#ffd84d',
  'hat-helmet': '#e4e4e4',
  'hat-chef': '#ffffff',
  'hat-propeller': '#5fa8ff',
};

// ─── Hair (item id → shape + colour) ──────────────────────────────────────

export const HAIR_SHAPE: Record<string, AvatarHair> = {
  'hair-short-brown': 'short',
  'hair-short-black': 'short',
  'hair-short-blond': 'short',
  'hair-short-red': 'short',
  'hair-bun': 'short',
  'hair-bun-purple': 'short',
  'hair-long-brown': 'long',
  'hair-long-black': 'long',
  'hair-long-silver': 'long',
  'hair-long-pink': 'long',
  'hair-ponytail': 'long',
  'hair-spike': 'spike',
  'hair-spike-blue': 'spike',
  'hair-afro': 'spike',
  'hair-mohawk': 'spike',
};

export const HAIR_COLOR: Record<string, string> = {
  'hair-short-brown': '#3a2a1a',
  'hair-short-black': '#1d1a14',
  'hair-short-blond': '#f2c85c',
  'hair-short-red': '#c24949',
  'hair-bun': '#3a2a1a',
  'hair-bun-purple': '#c69bff',
  'hair-long-brown': '#3a2a1a',
  'hair-long-black': '#1d1a14',
  'hair-long-silver': '#d8d3c7',
  'hair-long-pink': '#ffc8e0',
  'hair-ponytail': '#3a2a1a',
  'hair-spike': '#1d1a14',
  'hair-spike-blue': '#5fa8ff',
  'hair-afro': '#1d1a14',
  'hair-mohawk': '#c24949',
};

// ─── Shirt / pants (item id → primary colour) ─────────────────────────────

export const SHIRT_COLOR: Record<string, string> = {
  'shirt-green': '#6fbf73',
  'shirt-red': '#c24949',
  'shirt-blue': '#5fa8ff',
  'shirt-yellow': '#ffd84d',
  'shirt-stripes': '#ffffff',
  'shirt-uniform': '#1b4a8a',
  'shirt-hoodie': '#3a3c4a',
  'shirt-labcoat': '#ffffff',
  'shirt-jersey': '#c24949',
  'shirt-wizard': '#4d2a8a',
  'shirt-armor': '#b9b9b9',
  // Maps the apron to pink rather than its all-white base, so the girl
  // default outfit reads pink on RobloxAvatar (which renders a single
  // shirt colour). The actual built mesh in clothing.ts is white-with-
  // pink-overlay; that detail only matters when AvatarScene was rendering.
  'shirt-apron': '#ffc8e0',
  'shirt-tuxedo': '#1d1a14',
};

export const PANTS_COLOR: Record<string, string> = {
  'pants-navy': '#3a3c4a',
  'pants-black': '#1d1a14',
  'pants-blue': '#5fa8ff',
  'pants-khaki': '#c9a173',
  'pants-shorts': '#6fbf73',
  'pants-track': '#1d1a14',
  'pants-skirt-red': '#c24949',
  'pants-skirt-plaid': '#4d2a8a',
  'pants-wizard': '#3a1f6a',
  'pants-armor': '#b9b9b9',
};

// ─── Face (item id → face shape) ──────────────────────────────────────────

const FACE_NAME: Record<string, AvatarFace> = {
  'face-smile': 'smile',
  'face-happy': 'happy',
  'face-cool': 'cool',
  'face-wink': 'wink',
  'face-neutral': 'neutral',
  // Faces RobloxAvatar doesn't know about fall back to the closest shape.
  'face-tongue': 'wink',
  'face-angry': 'neutral',
  'face-love': 'happy',
  'face-stars': 'happy',
};

// Default kraft-cardboard tan that triggers RobloxAvatar's textured skin.
const KRAFT_TAN = '#c9a173';

export function outfitToAvatar(outfit: Outfit): AvatarOutfit {
  const shirt = outfit.shirt ? SHIRT_COLOR[outfit.shirt] : undefined;
  const pants = outfit.pants ? PANTS_COLOR[outfit.pants] : undefined;
  const hatShape = outfit.hat ? HAT_SHAPE[outfit.hat] ?? 'none' : 'none';
  const hatColor = outfit.hat ? HAT_COLOR[outfit.hat] : undefined;
  const hairShape = outfit.hair ? HAIR_SHAPE[outfit.hair] ?? 'none' : 'none';
  const hairColor = outfit.hair ? HAIR_COLOR[outfit.hair] : undefined;
  const face = FACE_NAME[outfit.face] ?? 'smile';

  return {
    // Omit `skin` when it equals the kraft default so the cardboard texture
    // kicks in (RobloxAvatar gates the texture on `outfit.skin === undefined`).
    ...(outfit.skin && outfit.skin !== KRAFT_TAN ? { skin: outfit.skin } : {}),
    ...(shirt ? { shirt } : {}),
    ...(pants ? { pants } : {}),
    face,
    hat: hatShape,
    ...(hatColor ? { hatColor } : {}),
    hair: hairShape,
    ...(hairColor ? { hairColor } : {}),
    gender: outfit.gender,
  };
}
