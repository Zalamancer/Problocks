/**
 * Kid-style materials — toon gradient + warm-desaturated palette.
 *
 * See docs/three-kid-style/01-geometry-materials.md for the full
 * rationale. Short version: MeshToonMaterial with a tiny cell-shaded
 * gradient map is what gives Roblox/Pokopia scenes their "toy" read
 * instead of CAD-plastic PBR.
 */

import * as THREE from 'three';

// Warm, desaturated palette — every kid-style scene pulls from these.
// Saturated primaries (#ff0000, #00ff00) read as debug-render; these shift
// everything toward warm + a little muted so the whole scene feels coherent.
export const PALETTE = {
  coral: '#ff7a6b',
  mint: '#9fd86c',
  butter: '#ffe58a',
  sky: '#b0d6ff',
  ivory: '#fff4e6',
  charcoal: '#2a2a2f',
  dustyRose: '#f5b8c4',
  sage: '#7fa17a',
  grass: '#8dc055',
  grassDark: '#5e8a38',
  groundFog: '#2f3a2a',
  woodLight: '#c9a27a',
  woodDark: '#8a6a48',
} as const;

export type PaletteKey = keyof typeof PALETTE;

/** Singleton 4-step toon gradient — reuse across every kid-style material. */
let toonGradient4: THREE.Texture | null = null;

export function getToonGradient(steps = 4): THREE.Texture {
  if (steps === 4 && toonGradient4) return toonGradient4;
  const data = new Uint8Array(steps);
  for (let i = 0; i < steps; i++) {
    data[i] = Math.floor((i / (steps - 1)) * 255);
  }
  const tex = new THREE.DataTexture(data, steps, 1, THREE.RedFormat);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  // Keep as linear — this is a lookup, not a color. Without this it gets
  // sRGB-decoded in r152+ and the bands shift noticeably toward white.
  tex.colorSpace = THREE.NoColorSpace;
  tex.needsUpdate = true;
  if (steps === 4) toonGradient4 = tex;
  return tex;
}

export interface ToonOptions {
  color?: THREE.ColorRepresentation;
  steps?: number;
  side?: THREE.Side;
  transparent?: boolean;
  opacity?: number;
  /** Set on any color texture to opt into the toon gradient banding. */
  map?: THREE.Texture | null;
}

export function toonMaterial(opts: ToonOptions = {}): THREE.MeshToonMaterial {
  const mat = new THREE.MeshToonMaterial({
    color: new THREE.Color(opts.color ?? PALETTE.ivory),
    gradientMap: getToonGradient(opts.steps ?? 4),
    side: opts.side ?? THREE.FrontSide,
    transparent: opts.transparent ?? false,
    opacity: opts.opacity ?? 1,
    map: opts.map ?? null,
  });
  if (opts.map) opts.map.colorSpace = THREE.SRGBColorSpace;
  return mat;
}

/**
 * Darken a base color into its "outline" complement. Pure-black outlines
 * look pasted on; this keeps the outline harmonized with the mesh hue.
 * Port of the HSL-darken trick from docs/three-kid-style/03-outlines.md.
 */
export function outlineColorFor(base: THREE.ColorRepresentation): THREE.Color {
  const c = new THREE.Color(base);
  const hsl = { h: 0, s: 0, l: 0 };
  c.getHSL(hsl);
  return new THREE.Color().setHSL(
    hsl.h,
    Math.min(1, hsl.s * 0.8),
    Math.max(0.05, hsl.l * 0.22),
  );
}

/**
 * For receive-only surfaces (large ground, walls). Toon bands on a huge
 * gradient look weird; a desaturated matte Lambert reads as ground.
 */
export function groundMaterial(
  color: THREE.ColorRepresentation = PALETTE.grass,
): THREE.MeshLambertMaterial {
  return new THREE.MeshLambertMaterial({ color: new THREE.Color(color) });
}
