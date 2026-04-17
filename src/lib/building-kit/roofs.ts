import { makeBox, type PieceDef } from './types';

/**
 * 10 roof tiles + 10 roof corners. Canonical frame: TILE × TILE in X/Z,
 * height on Y, bottom at y=0. Roof tiles sit ON TOP of the wall band
 * (placement effect offsets by WALL_HEIGHT).
 *
 * We approximate sloped roofs by stacking thinner boxes at incremental
 * offsets ("stair-step" slope) — cheap, flat-shaded, reads as sloped
 * from gameplay cameras.
 *
 * Slope shading ("bending"): stair-step slopes are dominated visually by
 * the +Y tops of each step, which all share shade 1.0 — so without help
 * both sides of a gable look identical. To mimic the per-face wall
 * shading on roofs, we split each step into halves (gable/shed) or
 * quadrants (hip/pyramid/dome/tower) and pre-multiply each piece's base
 * color by a directional factor. The back / left / back-left pieces get
 * darker so the slope "bends" read correctly from any camera angle.
 */

/* ──────────────── SLOPE SHADE HELPERS ──────────────── */

/** Directional tint factors, aligned with FACE_SHADE directions. */
const SLOPE_FRONT      = 1.00; // +Z half
const SLOPE_BACK       = 0.65; // -Z half
const SLOPE_RIGHT      = 0.90; // +X half
const SLOPE_LEFT       = 0.74; // -X half
// 4-way quadrants: combine directional shades (averaged, not multiplied,
// so values stay in a comfortable range).
const QUAD_FRONT_RIGHT = (SLOPE_FRONT + SLOPE_RIGHT) / 2; // 0.95
const QUAD_FRONT_LEFT  = (SLOPE_FRONT + SLOPE_LEFT)  / 2; // 0.87
const QUAD_BACK_RIGHT  = (SLOPE_BACK  + SLOPE_RIGHT) / 2; // 0.775
const QUAD_BACK_LEFT   = (SLOPE_BACK  + SLOPE_LEFT)  / 2; // 0.695

function tint(THREE: typeof import('three'), hex: string, factor: number): string {
  return '#' + new THREE.Color(hex).multiplyScalar(factor).getHexString();
}

/* ──────────────── ROOF TILES (10) ──────────────── */

/**
 * Build a beveled flat roof deck: a stack of plates that shrink as they
 * rise, giving a truncated-pyramid / stepped-bevel silhouette. Each
 * plate is split into 4 directional quadrants so the deck also gradates
 * front-right bright → back-left dark.
 *
 * The visible bevel sides are the exposed rings between plates — those
 * sides catch their +X/-X/+Z/-Z face shades from makeBox, so the bevel
 * itself reads as a proper shaded edge (not just a color seam on a flat
 * plane, which is what the previous quadrant-only version produced).
 */
function beveledDeck(
  THREE: typeof import('three'),
  color: string,
  tile: number,
  opts: { baseY: number; totalH: number; layers: number; shrinkPerLayer: number },
): import('three').Group {
  const g = new THREE.Group();
  const { baseY, totalH, layers, shrinkPerLayer } = opts;
  const layerH = totalH / layers;
  const fr = tint(THREE, color, QUAD_FRONT_RIGHT);
  const fl = tint(THREE, color, QUAD_FRONT_LEFT);
  const br = tint(THREE, color, QUAD_BACK_RIGHT);
  const bl = tint(THREE, color, QUAD_BACK_LEFT);
  for (let i = 0; i < layers; i++) {
    const w = tile - i * shrinkPerLayer * 2;
    if (w <= 0) break;
    const h = w / 2;
    const y = baseY + i * layerH + layerH / 2;
    g.add(makeBox(THREE, { x: h, y: layerH, z: h }, fr, { y, x:  h / 2, z:  h / 2 }));
    g.add(makeBox(THREE, { x: h, y: layerH, z: h }, fl, { y, x: -h / 2, z:  h / 2 }));
    g.add(makeBox(THREE, { x: h, y: layerH, z: h }, br, { y, x:  h / 2, z: -h / 2 }));
    g.add(makeBox(THREE, { x: h, y: layerH, z: h }, bl, { y, x: -h / 2, z: -h / 2 }));
  }
  return g;
}

function flatRoof(color: string, trim: string): PieceDef['build'] {
  return ({ THREE, tile }) => {
    const g = new THREE.Group();
    // Stepped bevel: wide base → narrower top, four layers. Each layer's
    // exposed perimeter ring picks up the darker +X / -Z / -X face shades
    // from makeBox, giving a visible chamfered edge.
    g.add(beveledDeck(THREE, color, tile, {
      baseY: 0, totalH: 0.3, layers: 4, shrinkPerLayer: 0.08,
    }));
    // cornice trim (single piece — thin border, no bending needed)
    g.add(makeBox(THREE, { x: tile * 1.05, y: 0.1, z: tile * 1.05 }, trim, { y: 0.35 }));
    return g;
  };
}

function gableRoof(color: string, ridgeAlong: 'x' | 'z'): PieceDef['build'] {
  return ({ THREE, tile }) => {
    const g = new THREE.Group();
    const steps = 8;
    const peakH = 1.2;
    const stepH = peakH / steps + 0.02;
    if (ridgeAlong === 'x') {
      const front = color;
      const back = tint(THREE, color, SLOPE_BACK);
      for (let i = 0; i < steps; i++) {
        const r = i / (steps - 1);
        const y = r * peakH;
        const w = tile * (1 - r);
        // front half (+Z)
        g.add(makeBox(THREE, { x: tile, y: stepH, z: w / 2 }, front, { y, z:  w / 4 }));
        // back half (-Z)
        g.add(makeBox(THREE, { x: tile, y: stepH, z: w / 2 }, back,  { y, z: -w / 4 }));
      }
    } else {
      const right = tint(THREE, color, SLOPE_RIGHT);
      const left  = tint(THREE, color, SLOPE_LEFT);
      for (let i = 0; i < steps; i++) {
        const r = i / (steps - 1);
        const y = r * peakH;
        const w = tile * (1 - r);
        g.add(makeBox(THREE, { x: w / 2, y: stepH, z: tile }, right, { y, x:  w / 4 }));
        g.add(makeBox(THREE, { x: w / 2, y: stepH, z: tile }, left,  { y, x: -w / 4 }));
      }
    }
    return g;
  };
}

function hipRoof(color: string): PieceDef['build'] {
  return ({ THREE, tile }) => {
    const g = new THREE.Group();
    const steps = 8;
    const peakH = 1.2;
    const stepH = peakH / steps + 0.02;
    const fr = tint(THREE, color, QUAD_FRONT_RIGHT);
    const fl = tint(THREE, color, QUAD_FRONT_LEFT);
    const br = tint(THREE, color, QUAD_BACK_RIGHT);
    const bl = tint(THREE, color, QUAD_BACK_LEFT);
    for (let i = 0; i < steps; i++) {
      const r = i / (steps - 1);
      const y = r * peakH;
      const s = tile * (1 - r);
      const h = s / 2;
      // 4 quadrants around the center of this step
      g.add(makeBox(THREE, { x: h, y: stepH, z: h }, fr, { y, x:  h / 2, z:  h / 2 }));
      g.add(makeBox(THREE, { x: h, y: stepH, z: h }, fl, { y, x: -h / 2, z:  h / 2 }));
      g.add(makeBox(THREE, { x: h, y: stepH, z: h }, br, { y, x:  h / 2, z: -h / 2 }));
      g.add(makeBox(THREE, { x: h, y: stepH, z: h }, bl, { y, x: -h / 2, z: -h / 2 }));
    }
    return g;
  };
}

function shedRoof(color: string): PieceDef['build'] {
  return ({ THREE, tile }) => {
    const g = new THREE.Group();
    const steps = 8;
    const peakH = 1.0;
    const stepH = peakH / steps + 0.02;
    // A shed slopes one way (up toward +Z-back here). Split each step in X
    // so the right side is visibly brighter than the left — matches walls.
    const right = tint(THREE, color, SLOPE_RIGHT);
    const left  = tint(THREE, color, SLOPE_LEFT);
    for (let i = 0; i < steps; i++) {
      const r = i / (steps - 1);
      const y = r * peakH;
      const remaining = tile * (1 - r);
      const z = -tile / 2 + remaining / 2;
      g.add(makeBox(THREE, { x: tile / 2, y: stepH, z: remaining }, right, { y, x:  tile / 4, z }));
      g.add(makeBox(THREE, { x: tile / 2, y: stepH, z: remaining }, left,  { y, x: -tile / 4, z }));
    }
    return g;
  };
}

function thatchedGable(): PieceDef['build'] {
  return ({ THREE, tile }) => {
    const g = new THREE.Group();
    const steps = 10;
    const peakH = 1.4;
    const stepH = peakH / steps + 0.025;
    for (let i = 0; i < steps; i++) {
      const r = i / (steps - 1);
      const y = r * peakH;
      const w = tile * (1 - r * 0.95);
      // alternate two golden-straw tones for texture
      const c = i % 2 ? '#ffd60a' : '#ffb800';
      const front = c;
      const back  = tint(THREE, c, SLOPE_BACK);
      g.add(makeBox(THREE, { x: tile * 1.02, y: stepH, z: w / 2 }, front, { y, z:  w / 4 }));
      g.add(makeBox(THREE, { x: tile * 1.02, y: stepH, z: w / 2 }, back,  { y, z: -w / 4 }));
    }
    return g;
  };
}

function domed(color: string, cap: string): PieceDef['build'] {
  return ({ THREE, tile }) => {
    const g = new THREE.Group();
    const steps = 10;
    const peakH = 1.5;
    const stepH = peakH / steps + 0.02;
    const fr = tint(THREE, color, QUAD_FRONT_RIGHT);
    const fl = tint(THREE, color, QUAD_FRONT_LEFT);
    const br = tint(THREE, color, QUAD_BACK_RIGHT);
    const bl = tint(THREE, color, QUAD_BACK_LEFT);
    for (let i = 0; i < steps; i++) {
      const r = i / (steps - 1);
      const y = r * peakH;
      const s = tile * Math.cos((r * Math.PI) / 2);
      const h = s / 2;
      g.add(makeBox(THREE, { x: h, y: stepH, z: h }, fr, { y, x:  h / 2, z:  h / 2 }));
      g.add(makeBox(THREE, { x: h, y: stepH, z: h }, fl, { y, x: -h / 2, z:  h / 2 }));
      g.add(makeBox(THREE, { x: h, y: stepH, z: h }, br, { y, x:  h / 2, z: -h / 2 }));
      g.add(makeBox(THREE, { x: h, y: stepH, z: h }, bl, { y, x: -h / 2, z: -h / 2 }));
    }
    // finial cap
    g.add(makeBox(THREE, { x: 0.2, y: 0.3, z: 0.2 }, cap, { y: peakH + 0.1 }));
    return g;
  };
}

function chimneyRoof(roofColor: string): PieceDef['build'] {
  return ({ THREE, tile }) => {
    const g = new THREE.Group();
    // base flat-gable section (split front/back halves)
    const steps = 6;
    const peakH = 0.8;
    const stepH = peakH / steps + 0.02;
    const front = roofColor;
    const back  = tint(THREE, roofColor, SLOPE_BACK);
    for (let i = 0; i < steps; i++) {
      const r = i / (steps - 1);
      const y = r * peakH;
      const w = tile * (1 - r);
      g.add(makeBox(THREE, { x: tile, y: stepH, z: w / 2 }, front, { y, z:  w / 4 }));
      g.add(makeBox(THREE, { x: tile, y: stepH, z: w / 2 }, back,  { y, z: -w / 4 }));
    }
    // chimney
    g.add(makeBox(THREE, { x: 0.4, y: 1.2, z: 0.4 }, '#ff5252', { y: 0.6 + 0.05, x: tile * 0.25, z: tile * 0.25 }));
    g.add(makeBox(THREE, { x: 0.5, y: 0.12, z: 0.5 }, '#1a1a1a', { y: 1.22, x: tile * 0.25, z: tile * 0.25 }));
    return g;
  };
}

function skylight(roofColor: string): PieceDef['build'] {
  return ({ THREE, tile }) => {
    const g = new THREE.Group();
    const steps = 6;
    const peakH = 0.9;
    const stepH = peakH / steps + 0.02;
    const front = roofColor;
    const back  = tint(THREE, roofColor, SLOPE_BACK);
    for (let i = 0; i < steps; i++) {
      const r = i / (steps - 1);
      const y = r * peakH;
      const w = tile * (1 - r);
      g.add(makeBox(THREE, { x: tile, y: stepH, z: w / 2 }, front, { y, z:  w / 4 }));
      g.add(makeBox(THREE, { x: tile, y: stepH, z: w / 2 }, back,  { y, z: -w / 4 }));
    }
    // glass pane
    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.05, 0.6),
      new THREE.MeshStandardMaterial({
        color: '#a5d8ff', roughness: 0.1, metalness: 0.2,
        transparent: true, opacity: 0.55, emissive: '#a5d8ff', emissiveIntensity: 0.15,
      }),
    );
    glass.position.set(0, 0.55, 0);
    g.add(glass);
    g.add(makeBox(THREE, { x: 0.7, y: 0.08, z: 0.7 }, '#3a2413', { y: 0.5 }));
    return g;
  };
}

const RIDGE_SLATE     = '#3b5dff';
const RIDGE_TERRACOTTA= '#ff5252';
const RIDGE_GREEN_TILE= '#5cd93a';

export const ROOF_PIECES: PieceDef[] = [
  { id: 'roof.flat_slate',       kind: 'roof', label: 'Flat · Blue',       swatch: RIDGE_SLATE,     build: flatRoof(RIDGE_SLATE, '#ffd60a') },
  { id: 'roof.gable_x',          kind: 'roof', label: 'Gable (X ridge)',   swatch: RIDGE_TERRACOTTA,build: gableRoof(RIDGE_TERRACOTTA, 'x') },
  { id: 'roof.gable_z',          kind: 'roof', label: 'Gable (Z ridge)',   swatch: RIDGE_TERRACOTTA,build: gableRoof(RIDGE_TERRACOTTA, 'z') },
  { id: 'roof.hip',              kind: 'roof', label: 'Hip · Green',       swatch: RIDGE_GREEN_TILE,build: hipRoof(RIDGE_GREEN_TILE) },
  { id: 'roof.shed',             kind: 'roof', label: 'Shed · Orange',     swatch: '#ff8c2b',       build: shedRoof('#ff8c2b') },
  { id: 'roof.thatched',         kind: 'roof', label: 'Thatched',          swatch: '#ffd60a',       build: thatchedGable() },
  { id: 'roof.domed_gold',       kind: 'roof', label: 'Domed · Gold',      swatch: '#ffd60a',       build: domed('#ffd60a', '#ffffff') },
  { id: 'roof.chimney',          kind: 'roof', label: 'Chimney Gable',     swatch: RIDGE_SLATE,     build: chimneyRoof(RIDGE_SLATE) },
  { id: 'roof.skylight',         kind: 'roof', label: 'Skylight',          swatch: RIDGE_TERRACOTTA,build: skylight(RIDGE_TERRACOTTA) },
  { id: 'roof.flat_green',       kind: 'roof', label: 'Flat · Green',      swatch: '#5cd93a',       build: flatRoof('#5cd93a', '#ffd60a') },
];

/* ──────────────── ROOF CORNERS (10) ──────────────── */

/**
 * Roof corners sit at the corner of two adjacent roof tiles and build
 * the hip/ridge cap for that junction. Canonical frame: same TILE×TILE.
 * Rotations/placement mirror corner orientation at the canvas level.
 */

function hipCorner(color: string, trim: string): PieceDef['build'] {
  return ({ THREE, tile }) => {
    const g = new THREE.Group();
    const steps = 8;
    const peakH = 1.2;
    const stepH = peakH / steps + 0.02;
    // hipCorner shrinks diagonally toward -X/-Z, so each step is a single
    // tinted block — pick the back-left quadrant shade so it reads as the
    // corner receding into shadow.
    const bl = tint(THREE, color, QUAD_BACK_LEFT);
    const fr = tint(THREE, color, QUAD_FRONT_RIGHT);
    for (let i = 0; i < steps; i++) {
      const r = i / (steps - 1);
      const y = r * peakH;
      const s = tile * (1 - r);
      const h = s / 2;
      // front-right half (brightest): at the outer corner
      g.add(makeBox(THREE, { x: h, y: stepH, z: h }, fr, {
        y, x: -((tile - s) / 2) + h / 2, z: -((tile - s) / 2) + h / 2,
      }));
      // back-left half (darker): at the recessed corner
      g.add(makeBox(THREE, { x: h, y: stepH, z: h }, bl, {
        y, x: -((tile - s) / 2) - h / 2, z: -((tile - s) / 2) - h / 2,
      }));
    }
    // ridge cap
    g.add(makeBox(THREE, { x: 0.18, y: 0.08, z: tile * 0.5 }, trim, { y: peakH - 0.05, x: -tile * 0.1, z: -tile * 0.1 }));
    return g;
  };
}

function pyramidCap(color: string): PieceDef['build'] {
  return ({ THREE, tile }) => {
    const g = new THREE.Group();
    const steps = 10;
    const peakH = 1.4;
    const stepH = peakH / steps + 0.02;
    const fr = tint(THREE, color, QUAD_FRONT_RIGHT);
    const fl = tint(THREE, color, QUAD_FRONT_LEFT);
    const br = tint(THREE, color, QUAD_BACK_RIGHT);
    const bl = tint(THREE, color, QUAD_BACK_LEFT);
    for (let i = 0; i < steps; i++) {
      const r = i / (steps - 1);
      const y = r * peakH;
      const s = tile * (1 - r);
      const h = s / 2;
      g.add(makeBox(THREE, { x: h, y: stepH, z: h }, fr, { y, x:  h / 2, z:  h / 2 }));
      g.add(makeBox(THREE, { x: h, y: stepH, z: h }, fl, { y, x: -h / 2, z:  h / 2 }));
      g.add(makeBox(THREE, { x: h, y: stepH, z: h }, br, { y, x:  h / 2, z: -h / 2 }));
      g.add(makeBox(THREE, { x: h, y: stepH, z: h }, bl, { y, x: -h / 2, z: -h / 2 }));
    }
    return g;
  };
}

function flatCap(color: string): PieceDef['build'] {
  return ({ THREE, tile }) => {
    const g = new THREE.Group();
    // Stepped-bevel deck (same recipe as flatRoof).
    g.add(beveledDeck(THREE, color, tile, {
      baseY: 0, totalH: 0.3, layers: 4, shrinkPerLayer: 0.08,
    }));
    // parapet trim (single piece)
    g.add(makeBox(THREE, { x: tile * 1.1, y: 0.1, z: tile * 1.1 }, color, { y: 0.35 }));
    // corner bollard
    g.add(makeBox(THREE, { x: 0.3, y: 0.6, z: 0.3 }, '#ffd60a', { y: 0.6, x: tile * 0.3, z: tile * 0.3 }));
    return g;
  };
}

function gableEnd(color: string): PieceDef['build'] {
  return ({ THREE, tile }) => {
    const g = new THREE.Group();
    const steps = 8;
    const peakH = 1.2;
    const stepH = peakH / steps + 0.02;
    const right = tint(THREE, color, SLOPE_RIGHT);
    const left  = tint(THREE, color, SLOPE_LEFT);
    for (let i = 0; i < steps; i++) {
      const r = i / (steps - 1);
      const y = r * peakH;
      const w = tile * (1 - r);
      g.add(makeBox(THREE, { x: w / 2, y: stepH, z: tile }, right, { y, x:  w / 4 }));
      g.add(makeBox(THREE, { x: w / 2, y: stepH, z: tile }, left,  { y, x: -w / 4 }));
    }
    // pediment wall at the end
    g.add(makeBox(THREE, { x: tile, y: peakH, z: 0.15 }, '#ffffff', { y: peakH / 2, z: -tile / 2 + 0.1 }));
    return g;
  };
}

function eaveGutter(color: string): PieceDef['build'] {
  return ({ THREE, tile }) => {
    const g = new THREE.Group();
    const steps = 6;
    const peakH = 0.7;
    const stepH = peakH / steps + 0.02;
    const front = color;
    const back  = tint(THREE, color, SLOPE_BACK);
    for (let i = 0; i < steps; i++) {
      const r = i / (steps - 1);
      const y = r * peakH;
      const w = tile * (1 - r);
      g.add(makeBox(THREE, { x: tile, y: stepH, z: w / 2 }, front, { y, z:  w / 4 }));
      g.add(makeBox(THREE, { x: tile, y: stepH, z: w / 2 }, back,  { y, z: -w / 4 }));
    }
    // gutter lip along the front (Z = +tile/2)
    g.add(makeBox(THREE, { x: tile, y: 0.1, z: 0.12 }, '#ffd60a', { y: 0.1, z: tile / 2 + 0.05 }));
    g.add(makeBox(THREE, { x: 0.12, y: 0.3, z: 0.12 }, '#ffd60a', { y: -0.15, x: tile * 0.35, z: tile / 2 + 0.05 }));
    return g;
  };
}

function dormer(color: string): PieceDef['build'] {
  return ({ THREE, tile }) => {
    const g = new THREE.Group();
    // underlying gable (split front/back halves)
    const steps = 7;
    const peakH = 1.0;
    const stepH = peakH / steps + 0.02;
    const front = color;
    const back  = tint(THREE, color, SLOPE_BACK);
    for (let i = 0; i < steps; i++) {
      const r = i / (steps - 1);
      const y = r * peakH;
      const w = tile * (1 - r);
      g.add(makeBox(THREE, { x: tile, y: stepH, z: w / 2 }, front, { y, z:  w / 4 }));
      g.add(makeBox(THREE, { x: tile, y: stepH, z: w / 2 }, back,  { y, z: -w / 4 }));
    }
    // dormer box
    g.add(makeBox(THREE, { x: 0.9, y: 0.9, z: 0.6 }, '#ffffff', { y: 0.45, z: tile * 0.25 }));
    // dormer mini-roof
    g.add(makeBox(THREE, { x: 1.0, y: 0.2, z: 0.65 }, color, { y: 0.95, z: tile * 0.25 }));
    // window
    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.5, 0.04),
      new THREE.MeshStandardMaterial({
        color: '#a5d8ff', roughness: 0.1, metalness: 0.2, transparent: true, opacity: 0.55,
        emissive: '#a5d8ff', emissiveIntensity: 0.15,
      }),
    );
    glass.position.set(0, 0.5, tile * 0.25 + 0.3);
    g.add(glass);
    return g;
  };
}

function towerCap(color: string, flag: string): PieceDef['build'] {
  return ({ THREE, tile }) => {
    const g = new THREE.Group();
    const steps = 12;
    const peakH = 2.0;
    const stepH = peakH / steps + 0.02;
    const fr = tint(THREE, color, QUAD_FRONT_RIGHT);
    const fl = tint(THREE, color, QUAD_FRONT_LEFT);
    const br = tint(THREE, color, QUAD_BACK_RIGHT);
    const bl = tint(THREE, color, QUAD_BACK_LEFT);
    for (let i = 0; i < steps; i++) {
      const r = i / (steps - 1);
      const y = r * peakH;
      const s = tile * (1 - r);
      const h = s / 2;
      g.add(makeBox(THREE, { x: h, y: stepH, z: h }, fr, { y, x:  h / 2, z:  h / 2 }));
      g.add(makeBox(THREE, { x: h, y: stepH, z: h }, fl, { y, x: -h / 2, z:  h / 2 }));
      g.add(makeBox(THREE, { x: h, y: stepH, z: h }, br, { y, x:  h / 2, z: -h / 2 }));
      g.add(makeBox(THREE, { x: h, y: stepH, z: h }, bl, { y, x: -h / 2, z: -h / 2 }));
    }
    // flagpole
    g.add(makeBox(THREE, { x: 0.06, y: 0.6, z: 0.06 }, '#2a2a2a', { y: peakH + 0.3 }));
    g.add(makeBox(THREE, { x: 0.4, y: 0.25, z: 0.02 }, flag, { y: peakH + 0.45, x: 0.23 }));
    return g;
  };
}

export const ROOF_CORNERS: PieceDef[] = [
  { id: 'roofcnr.hip_slate',      kind: 'roof-corner', label: 'Hip · Blue',    swatch: RIDGE_SLATE,      build: hipCorner(RIDGE_SLATE, '#ffd60a') },
  { id: 'roofcnr.hip_terra',      kind: 'roof-corner', label: 'Hip · Red',     swatch: RIDGE_TERRACOTTA, build: hipCorner(RIDGE_TERRACOTTA, '#ffd60a') },
  { id: 'roofcnr.pyramid_green',  kind: 'roof-corner', label: 'Pyramid',       swatch: RIDGE_GREEN_TILE, build: pyramidCap(RIDGE_GREEN_TILE) },
  { id: 'roofcnr.flat_cap',       kind: 'roof-corner', label: 'Flat Cap',      swatch: RIDGE_SLATE,      build: flatCap(RIDGE_SLATE) },
  { id: 'roofcnr.gable_end',      kind: 'roof-corner', label: 'Gable End',     swatch: RIDGE_TERRACOTTA, build: gableEnd(RIDGE_TERRACOTTA) },
  { id: 'roofcnr.eave',           kind: 'roof-corner', label: 'Eave + Gutter', swatch: RIDGE_GREEN_TILE, build: eaveGutter(RIDGE_GREEN_TILE) },
  { id: 'roofcnr.dormer',         kind: 'roof-corner', label: 'Dormer',        swatch: RIDGE_SLATE,      build: dormer(RIDGE_SLATE) },
  { id: 'roofcnr.tower_red',      kind: 'roof-corner', label: 'Tower · Red',   swatch: '#ff2e44',        build: towerCap('#ff2e44', '#ffd60a') },
  { id: 'roofcnr.tower_blue',     kind: 'roof-corner', label: 'Tower · Blue',  swatch: '#3b5dff',        build: towerCap('#3b5dff', '#ffffff') },
  { id: 'roofcnr.thatched_peak',  kind: 'roof-corner', label: 'Thatched Peak', swatch: '#ffd60a',        build: pyramidCap('#ffd60a') },
];
