/**
 * Kid-style materials — toon gradient + warm-desaturated palette.
 *
 * See docs/three-kid-style/01-geometry-materials.md for the full
 * rationale. Short version: MeshToonMaterial with a tiny cell-shaded
 * gradient map is what gives Roblox/Pokopia scenes their "toy" read
 * instead of CAD-plastic PBR.
 */

import * as THREE from 'three';

// Bright, saturated Adopt-Me / Roblox palette. Pure primaries (#ff0000,
// #00ff00) still read as debug-render, but stopping just short of them —
// pinker pink, limier green, richer yellow — lands on the Adopt-Me sweet
// spot. Toon banding + tonemapping exposure at 1.15 keep it from looking
// clownish even with these saturation levels.
//
// Backwards-compat: the old "warm desaturated" keys (coral/mint/butter/
// sage/dustyRose) still exist; their values just got brighter. Prefabs
// and the Inspector palette pick them up automatically.
export const PALETTE = {
  // Accent brights — for characters, flowers, feature props
  coral: '#ff7aa0',        // Adopt-Me pink (shirts, cheeks, flowers, hearts)
  mint: '#88cc5a',         // tree canopy, accent greens
  butter: '#ffd070',       // flowers, door knob, coins
  sky: '#a8dcff',          // sky background
  fogFar: '#b8e4ff',       // horizon fog tint — mostly-sky with a whisper of haze

  // Environmental
  grass: '#7ecc5a',        // plot grass — saturated bright green
  grassDark: '#5aa040',    // surrounding land outside the plot
  groundFog: '#2f3a2a',    // dead shadowed ground (unused on outdoor scenes)

  // Neutrals — warm paper / warm ink / stone / curb
  ivory: '#fff2dc',        // house walls, windowsills, whites
  paper: '#fffbf0',        // the whitest thing (window mullions)
  fence: '#fdfdff',        // picket fence — slightly cooler than ivory
  curb: '#d8d0c0',         // plot perimeter stone
  curbDark: '#a89890',
  stone: '#e8d4a8',        // path stones
  stoneDark: '#d0b888',
  charcoal: '#2a1a28',     // outlines, hair (slightly plum-tinted, not pure grey)

  // Wood tones
  woodLight: '#c9a27a',
  woodDark: '#a85838',     // tree trunks, door panels
  woodShadow: '#6a3820',

  // Adopt-Me cottage / feature pieces
  roof: '#e85542',         // the iconic bright red roof
  roofRidge: '#b8372a',
  wallTrim: '#e8c498',
  foundation: '#9a8878',
  chimney: '#9a7a5a',
  chimneyTop: '#6a5040',
  windowGlass: '#b8e0ff',

  // Flower / balloon brights
  flowerPink: '#ff7aa0',
  flowerYellow: '#ffd070',
  flowerPeach: '#ff9a5a',
  flowerBush: '#5a9a4a',
  balloonPink: '#ff7aa0',

  // Character kit
  skin: '#fdd488',         // default skin tone (customizable per character)
  shirt: '#ff7aa0',
  pants: '#5a7aa0',        // Adopt-Me denim-ish blue
  shoes: '#2a2438',
  hair: '#3a2a28',
  face: '#2a2438',
  heart: '#ff5a8a',

  // Legacy aliases — older prefabs/inspector swatches still reference
  // these. Map to the closest new color so nothing snaps to a wrong hue.
  dustyRose: '#ff7aa0',
  sage: '#5a9a4a',
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
