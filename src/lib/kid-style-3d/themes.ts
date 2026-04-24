/**
 * Palette themes — swap the whole scene's color mood with a single
 * selection. Each theme is a partial override over the BASE palette
 * defined in materials.ts. Changing the active theme re-wires the
 * PALETTE proxy so any freshly-built prefab (including hydrated scene
 * objects) reads the new colors immediately.
 *
 * Adding a theme = drop a new entry in THEMES. No other code changes
 * are needed — the UI picker, agent prompt, and rehydrate flow all read
 * from this registry.
 */

export type ThemeId = 'vivid' | 'pastel' | 'sunset' | 'candy';

export interface Theme {
  id: ThemeId;
  label: string;
  /** Short description surfaced under the theme label. */
  desc: string;
  /** Partial overrides merged over BASE_PALETTE (materials.ts). Any key
      not listed here falls back to the baseline value. */
  palette: Record<string, string>;
}

// The two themes below are the "big two" asked for by the user:
// vivid = Pokopia / Adopt-Me saturated; pastel = soft Roblox default.
// Sunset + candy are experiments to prove the switcher isn't welded to
// a single comparison; tune colors later.
export const THEMES: Record<ThemeId, Theme> = {
  vivid: {
    id: 'vivid',
    label: 'Vivid',
    desc: 'Saturated Pokopia / Adopt-Me look',
    palette: {
      sky: '#5cb4f0',
      skyTop: '#2e8fd9',
      skyHorizon: '#bfe6ff',
      cloud: '#ffffff',
      fogFar: '#bfe6ff',
      grass: '#6ac557',
      grassDark: '#4ea340',
      mint: '#6dc257',
      sage: '#46a84e',
      flowerBush: '#3ea04a',
    },
  },
  pastel: {
    id: 'pastel',
    label: 'Pastel',
    desc: 'Soft storybook Roblox default',
    palette: {
      sky: '#b8e0f5',
      skyTop: '#a2d3ef',
      skyHorizon: '#e8f4fc',
      cloud: '#ffffff',
      fogFar: '#e8f4fc',
      grass: '#b5dea0',
      grassDark: '#9ac88a',
      mint: '#c4e0ae',
      sage: '#a8cc8f',
      flowerBush: '#8ab880',
    },
  },
  sunset: {
    id: 'sunset',
    label: 'Sunset',
    desc: 'Warm golden-hour palette',
    palette: {
      sky: '#f0a878',
      skyTop: '#d97050',
      skyHorizon: '#ffd8a8',
      cloud: '#ffe8c4',
      fogFar: '#ffd8a8',
      grass: '#8cb05a',
      grassDark: '#6a8a44',
      mint: '#a8b860',
      sage: '#808a45',
      flowerBush: '#6a8040',
    },
  },
  candy: {
    id: 'candy',
    label: 'Candy',
    desc: 'Hot-pink dreamscape',
    palette: {
      sky: '#ffc0e0',
      skyTop: '#ff8cc8',
      skyHorizon: '#ffe0ee',
      cloud: '#ffffff',
      fogFar: '#ffe0ee',
      grass: '#8adcc0',
      grassDark: '#6ab0a0',
      mint: '#a0e8c8',
      sage: '#70b898',
      flowerBush: '#ff8cc0',
    },
  },
};

export const DEFAULT_THEME: ThemeId = 'vivid';

export const THEME_ORDER: ThemeId[] = ['vivid', 'pastel', 'sunset', 'candy'];

// --- Active theme singleton (module-scope) --------------------------
// Kept as a plain variable, not a store — material/prefab code reads
// this synchronously at build time and should never be forced to adopt
// a React-flavored subscription.

let activeThemeId: ThemeId = DEFAULT_THEME;
const listeners = new Set<() => void>();

export function getActiveThemeId(): ThemeId {
  return activeThemeId;
}

export function getActiveTheme(): Theme {
  return THEMES[activeThemeId];
}

export function setActiveTheme(id: ThemeId): void {
  if (id === activeThemeId || !THEMES[id]) return;
  activeThemeId = id;
  for (const l of listeners) l();
}

/** Subscribe to theme swaps — engine/viewport wire rehydrate + sky
    rebuild through here so they don't need to re-poll on every frame. */
export function onThemeChange(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
