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
  | 'tree-oak' | 'tree-pine' | 'bush' | 'mushroom' | 'rock' | 'flower' | 'cloud'
  // buildings
  | 'house' | 'fence' | 'gate-post' | 'path-stone' | 'mailbox' | 'bench' | 'balloon'
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

/** Spec for a prop the Inspector can surface for a specific prefab kind. */
export type PropSpec =
  | { kind: 'color'; key: string; label: string; defaultValue: string }
  | { kind: 'number'; key: string; label: string; defaultValue: number; min: number; max: number; step: number; suffix?: string }
  | { kind: 'select'; key: string; label: string; defaultValue: string; options: Array<{ value: string; label: string }> };

export interface PrefabDef {
  kind: PrefabKind;
  label: string;
  category: PrefabCategory['id'];
  /** Default color applied when no per-instance color is set. */
  defaultColor: string;
  /** Emoji for the palette tile — cheap but readable thumbnail. */
  icon: string;
  /** Optional per-prefab props the inspector renders. */
  props?: PropSpec[];
}

export const PREFABS: PrefabDef[] = [
  // --- Primitives ---
  { kind: 'rounded-box', label: 'Cube',     category: 'primitives', defaultColor: PALETTE.coral,     icon: '⬛' },
  { kind: 'sphere',      label: 'Sphere',   category: 'primitives', defaultColor: PALETTE.butter,    icon: '⚪' },
  { kind: 'cylinder',    label: 'Cylinder', category: 'primitives', defaultColor: PALETTE.mint,      icon: '🧪' },
  { kind: 'cone',        label: 'Cone',     category: 'primitives', defaultColor: PALETTE.flowerPink, icon: '🔺' },

  // --- Nature ---
  {
    kind: 'tree-oak', label: 'Oak Tree', category: 'nature',
    defaultColor: PALETTE.mint, icon: '🌳',
    props: [
      { kind: 'color', key: 'trunkColor', label: 'Trunk', defaultValue: PALETTE.woodDark },
    ],
  },
  {
    kind: 'tree-pine', label: 'Pine Tree', category: 'nature',
    defaultColor: PALETTE.sage, icon: '🌲',
    props: [
      { kind: 'color', key: 'trunkColor', label: 'Trunk', defaultValue: PALETTE.woodShadow },
    ],
  },
  { kind: 'bush',     label: 'Bush',     category: 'nature', defaultColor: PALETTE.flowerBush, icon: '🌿' },
  { kind: 'mushroom', label: 'Mushroom', category: 'nature', defaultColor: PALETTE.flowerPink, icon: '🍄' },
  { kind: 'rock',     label: 'Rock',     category: 'nature', defaultColor: '#b8b8b2',           icon: '🪨' },
  { kind: 'flower',   label: 'Flower',   category: 'nature', defaultColor: PALETTE.butter,     icon: '🌼' },
  { kind: 'cloud',    label: 'Cloud',    category: 'nature', defaultColor: '#f9fafc',           icon: '☁️' },

  // --- Buildings ---
  {
    kind: 'house', label: 'House', category: 'buildings',
    defaultColor: PALETTE.ivory, icon: '🏠',
    props: [
      { kind: 'color', key: 'roofColor',       label: 'Roof',       defaultValue: PALETTE.roof },
      { kind: 'color', key: 'doorColor',       label: 'Door',       defaultValue: PALETTE.woodDark },
      { kind: 'color', key: 'trimColor',       label: 'Wall trim',  defaultValue: PALETTE.wallTrim },
      { kind: 'color', key: 'foundationColor', label: 'Foundation', defaultValue: PALETTE.foundation },
    ],
  },
  {
    kind: 'fence', label: 'Fence', category: 'buildings',
    defaultColor: PALETTE.fence, icon: '🚧',
    props: [
      { kind: 'number', key: 'length', label: 'Length', defaultValue: 3, min: 1, max: 12, step: 0.25, suffix: 'u' },
    ],
  },
  { kind: 'gate-post',  label: 'Gate Post',       category: 'buildings', defaultColor: PALETTE.fence,     icon: '📮' },
  { kind: 'path-stone', label: 'Stepping Stone',  category: 'buildings', defaultColor: PALETTE.stone,     icon: '⬜' },
  { kind: 'mailbox',    label: 'Mailbox',         category: 'buildings', defaultColor: '#7ab0d8',         icon: '📪' },
  { kind: 'bench',      label: 'Bench',           category: 'buildings', defaultColor: PALETTE.woodLight, icon: '🪑' },
  { kind: 'balloon',    label: 'Balloon',         category: 'buildings', defaultColor: PALETTE.balloonPink, icon: '🎈' },

  // --- Characters ---
  {
    kind: 'character', label: 'Character', category: 'characters',
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
