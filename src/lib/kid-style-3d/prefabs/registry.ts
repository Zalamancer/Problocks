/**
 * Central catalog for kid-style prefabs. Each entry tells the palette UI
 * how to render a tile (label, icon, category) and the prop-inspector
 * (stage 2d+) which per-prefab props to surface.
 *
 * Keep the registry a pure data table — builders live alongside per-kind
 * files (primitives.ts, nature.ts, buildings.ts, character.ts) and the
 * dispatcher lives in ./index.ts.
 */

import { PALETTE } from '../materials';

export type PrefabKind =
  // primitives
  | 'rounded-box' | 'sphere' | 'cylinder' | 'cone'
  // nature
  | 'tree-oak' | 'tree-pine' | 'tree-random' | 'bush' | 'mushroom' | 'rock' | 'flower' | 'cloud'
  // buildings
  | 'house' | 'fence' | 'gate-post' | 'path-stone' | 'dirt' | 'path-spline' | 'mailbox' | 'bench' | 'balloon'
  | 'lamppost' | 'stone-column' | 'fountain' | 'gift-box'
  // characters
  | 'character';

export interface PrefabCategory {
  id: 'primitives' | 'nature' | 'buildings' | 'characters';
  label: string;
}

export const PREFAB_CATEGORIES: PrefabCategory[] = [
  { id: 'primitives', label: 'Primitives' },
  { id: 'nature',     label: 'Nature' },
  { id: 'buildings',  label: 'Buildings' },
  { id: 'characters', label: 'Characters' },
];

/**
 * Prefab style = which visual kit a prefab belongs to. Today the whole
 * catalog ships in one "chunky-pastel" kit — the Roblox-ish blocky look
 * wired through materials.ts. Additional kits (lowpoly, voxel, realistic)
 * will land as sibling prefab files and register here; the AssetsPanel
 * filter and the AI agent both key off this list, so adding a new kit is
 * a pure data/registration change.
 */
export type PrefabStyleId = 'chunky-pastel';

export interface PrefabStyle {
  id: PrefabStyleId;
  label: string;
  /** Short description surfaced in the Style filter dropdown. */
  desc: string;
}

export const PREFAB_STYLES: PrefabStyle[] = [
  { id: 'chunky-pastel', label: 'Chunky Pastel', desc: 'Soft blocky Roblox-ish kit' },
];

export const DEFAULT_PREFAB_STYLE: PrefabStyleId = 'chunky-pastel';

/** Spec for a prop the Inspector can surface for a specific prefab kind. */
export type PropSpec =
  | { kind: 'color'; key: string; label: string; defaultValue: string }
  | { kind: 'number'; key: string; label: string; defaultValue: number; min: number; max: number; step: number; suffix?: string }
  | { kind: 'select'; key: string; label: string; defaultValue: string; options: Array<{ value: string; label: string }> };

export interface PrefabDef {
  kind: PrefabKind;
  label: string;
  category: PrefabCategory['id'];
  /** Which visual kit this prefab belongs to. All current entries ship
      in the original 'chunky-pastel' kit; alternate kits register here
      when they're added. */
  style: PrefabStyleId;
  /** Default color applied when no per-instance color is set. */
  defaultColor: string;
  /** Emoji for the palette tile — cheap but readable thumbnail. */
  icon: string;
  /** Optional per-prefab props the inspector renders. */
  props?: PropSpec[];
}

export const PREFABS: PrefabDef[] = [
  // --- Primitives (chunky-pastel) ---
  { kind: 'rounded-box', label: 'Cube',     category: 'primitives', style: 'chunky-pastel', defaultColor: PALETTE.coral,     icon: '⬛' },
  { kind: 'sphere',      label: 'Sphere',   category: 'primitives', style: 'chunky-pastel', defaultColor: PALETTE.butter,    icon: '⚪' },
  { kind: 'cylinder',    label: 'Cylinder', category: 'primitives', style: 'chunky-pastel', defaultColor: PALETTE.mint,      icon: '🧪' },
  { kind: 'cone',        label: 'Cone',     category: 'primitives', style: 'chunky-pastel', defaultColor: PALETTE.flowerPink, icon: '🔺' },

  // --- Nature (chunky-pastel) ---
  {
    kind: 'tree-oak', label: 'Oak Tree', category: 'nature', style: 'chunky-pastel',
    defaultColor: PALETTE.mint, icon: '🌳',
    props: [
      { kind: 'color', key: 'trunkColor', label: 'Trunk', defaultValue: PALETTE.woodDark },
    ],
  },
  {
    kind: 'tree-pine', label: 'Pine Tree', category: 'nature', style: 'chunky-pastel',
    defaultColor: PALETTE.sage, icon: '🌲',
    props: [
      { kind: 'color', key: 'trunkColor', label: 'Trunk', defaultValue: PALETTE.woodShadow },
    ],
  },
  {
    kind: 'tree-random', label: 'Random Tree', category: 'nature', style: 'chunky-pastel',
    defaultColor: PALETTE.mint, icon: '🎲',
  },
  { kind: 'bush',     label: 'Bush',     category: 'nature', style: 'chunky-pastel', defaultColor: PALETTE.flowerBush, icon: '🌿' },
  { kind: 'mushroom', label: 'Mushroom', category: 'nature', style: 'chunky-pastel', defaultColor: PALETTE.flowerPink, icon: '🍄' },
  { kind: 'rock',     label: 'Rock',     category: 'nature', style: 'chunky-pastel', defaultColor: '#b8b8b2',           icon: '🪨' },
  { kind: 'flower',   label: 'Flower',   category: 'nature', style: 'chunky-pastel', defaultColor: PALETTE.butter,     icon: '🌼' },
  { kind: 'cloud',    label: 'Cloud',    category: 'nature', style: 'chunky-pastel', defaultColor: '#f9fafc',           icon: '☁️' },

  // --- Buildings (chunky-pastel) ---
  {
    kind: 'house', label: 'House', category: 'buildings', style: 'chunky-pastel',
    defaultColor: PALETTE.ivory, icon: '🏠',
    props: [
      { kind: 'color', key: 'roofColor',       label: 'Roof',       defaultValue: PALETTE.roof },
      { kind: 'color', key: 'doorColor',       label: 'Door',       defaultValue: PALETTE.woodDark },
      { kind: 'color', key: 'trimColor',       label: 'Wall trim',  defaultValue: PALETTE.wallTrim },
      { kind: 'color', key: 'foundationColor', label: 'Foundation', defaultValue: PALETTE.foundation },
    ],
  },
  {
    kind: 'fence', label: 'Fence', category: 'buildings', style: 'chunky-pastel',
    defaultColor: PALETTE.fence, icon: '🚧',
    props: [
      { kind: 'number', key: 'length', label: 'Length', defaultValue: 3, min: 1, max: 12, step: 0.25, suffix: 'u' },
    ],
  },
  { kind: 'gate-post',  label: 'Gate Post',       category: 'buildings', style: 'chunky-pastel', defaultColor: PALETTE.fence,     icon: '📮' },
  { kind: 'path-stone', label: 'Stepping Stone',  category: 'buildings', style: 'chunky-pastel', defaultColor: PALETTE.stone,     icon: '⬜' },
  { kind: 'dirt',       label: 'Dirt Patch',      category: 'buildings', style: 'chunky-pastel', defaultColor: PALETTE.dirt,      icon: '🟤' },
  {
    kind: 'path-spline', label: 'Dirt Path', category: 'buildings', style: 'chunky-pastel',
    defaultColor: PALETTE.dirt, icon: '〰️',
    props: [
      { kind: 'number', key: 'width', label: 'Width', defaultValue: 2.2, min: 0.5, max: 8, step: 0.1, suffix: 'u' },
    ],
  },
  { kind: 'mailbox',    label: 'Mailbox',         category: 'buildings', style: 'chunky-pastel', defaultColor: '#7ab0d8',         icon: '📪' },
  { kind: 'bench',      label: 'Bench',           category: 'buildings', style: 'chunky-pastel', defaultColor: PALETTE.woodLight, icon: '🪑' },
  { kind: 'balloon',    label: 'Balloon',         category: 'buildings', style: 'chunky-pastel', defaultColor: PALETTE.balloonPink, icon: '🎈' },
  { kind: 'lamppost',     label: 'Lamppost',      category: 'buildings', style: 'chunky-pastel', defaultColor: PALETTE.blueStone, icon: '💡' },
  { kind: 'stone-column', label: 'Stone Column',  category: 'buildings', style: 'chunky-pastel', defaultColor: PALETTE.blueStone, icon: '🏛️' },
  { kind: 'fountain',     label: 'Fountain',      category: 'buildings', style: 'chunky-pastel', defaultColor: PALETTE.blueStone, icon: '⛲' },
  { kind: 'gift-box',     label: 'Gift Box',      category: 'buildings', style: 'chunky-pastel', defaultColor: PALETTE.roof,      icon: '🎁' },

  // --- Characters (chunky-pastel) ---
  {
    kind: 'character', label: 'Character', category: 'characters', style: 'chunky-pastel',
    defaultColor: PALETTE.shirt, icon: '🙂',
    props: [
      { kind: 'color', key: 'pantsColor', label: 'Pants', defaultValue: PALETTE.pants },
      { kind: 'color', key: 'skinColor',  label: 'Skin',  defaultValue: PALETTE.skin  },
      { kind: 'color', key: 'hairColor',  label: 'Hair',  defaultValue: PALETTE.hair  },
      { kind: 'color', key: 'shoeColor',  label: 'Shoes', defaultValue: PALETTE.shoes },
    ],
  },
];

export function getPrefabDef(kind: string): PrefabDef | undefined {
  return PREFABS.find((p) => p.kind === kind);
}

/** Returns only the prefabs available in the given style — used by both
    the Assets panel filter and the AI agent prompt. */
export function getPrefabsForStyle(style: PrefabStyleId): PrefabDef[] {
  return PREFABS.filter((p) => p.style === style);
}
