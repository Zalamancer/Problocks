import { makeBox, type PieceDef } from './types';

/**
 * 10 roof tiles + 10 roof corners. Canonical frame: TILE × TILE in X/Z,
 * height on Y, bottom at y=0. Roof tiles sit ON TOP of the wall band
 * (placement effect offsets by WALL_HEIGHT).
 *
 * We approximate sloped roofs by stacking thinner boxes at incremental
 * offsets ("stair-step" slope) — cheap, flat-shaded, reads as sloped
 * from gameplay cameras.
 */

/* ──────────────── ROOF TILES (10) ──────────────── */

function flatRoof(color: string, trim: string): PieceDef['build'] {
  return ({ THREE, tile }) => {
    const g = new THREE.Group();
    g.add(makeBox(THREE, { x: tile, y: 0.25, z: tile }, color, { y: 0.125 }));
    // cornice trim
    g.add(makeBox(THREE, { x: tile * 1.05, y: 0.1, z: tile * 1.05 }, trim, { y: 0.3 }));
    return g;
  };
}

function gableRoof(color: string, ridgeAlong: 'x' | 'z'): PieceDef['build'] {
  return ({ THREE, tile }) => {
    const g = new THREE.Group();
    const steps = 8;
    const peakH = 1.2;
    for (let i = 0; i < steps; i++) {
      const r = i / (steps - 1);
      const y = r * peakH;
      const w = tile * (1 - r);
      if (ridgeAlong === 'x') {
        g.add(makeBox(THREE, { x: tile, y: peakH / steps + 0.02, z: w }, color, { y }));
      } else {
        g.add(makeBox(THREE, { x: w, y: peakH / steps + 0.02, z: tile }, color, { y }));
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
    for (let i = 0; i < steps; i++) {
      const r = i / (steps - 1);
      const y = r * peakH;
      const s = tile * (1 - r);
      g.add(makeBox(THREE, { x: s, y: peakH / steps + 0.02, z: s }, color, { y }));
    }
    return g;
  };
}

function shedRoof(color: string): PieceDef['build'] {
  return ({ THREE, tile }) => {
    const g = new THREE.Group();
    const steps = 8;
    const peakH = 1.0;
    for (let i = 0; i < steps; i++) {
      const r = i / (steps - 1);
      const y = r * peakH;
      // each step shrinks on one side only
      const remaining = tile * (1 - r);
      g.add(makeBox(THREE, { x: tile, y: peakH / steps + 0.02, z: remaining }, color, {
        y, z: -tile / 2 + remaining / 2,
      }));
    }
    return g;
  };
}

function thatchedGable(): PieceDef['build'] {
  return ({ THREE, tile }) => {
    const g = new THREE.Group();
    const steps = 10;
    const peakH = 1.4;
    for (let i = 0; i < steps; i++) {
      const r = i / (steps - 1);
      const y = r * peakH;
      const w = tile * (1 - r * 0.95);
      // alternate two golden-straw tones for texture
      const c = i % 2 ? '#c79a4b' : '#d4ad5c';
      g.add(makeBox(THREE, { x: tile * 1.02, y: peakH / steps + 0.025, z: w }, c, { y }));
    }
    return g;
  };
}

function domed(color: string, cap: string): PieceDef['build'] {
  return ({ THREE, tile }) => {
    const g = new THREE.Group();
    const steps = 10;
    const peakH = 1.5;
    for (let i = 0; i < steps; i++) {
      const r = i / (steps - 1);
      const y = r * peakH;
      // dome profile: sin falloff
      const s = tile * Math.cos((r * Math.PI) / 2);
      g.add(makeBox(THREE, { x: s, y: peakH / steps + 0.02, z: s }, color, { y }));
    }
    // finial cap
    g.add(makeBox(THREE, { x: 0.2, y: 0.3, z: 0.2 }, cap, { y: peakH + 0.1 }));
    return g;
  };
}

function chimneyRoof(roofColor: string): PieceDef['build'] {
  return ({ THREE, tile }) => {
    const g = new THREE.Group();
    // base flat-gable section
    const steps = 6;
    const peakH = 0.8;
    for (let i = 0; i < steps; i++) {
      const r = i / (steps - 1);
      const y = r * peakH;
      const w = tile * (1 - r);
      g.add(makeBox(THREE, { x: tile, y: peakH / steps + 0.02, z: w }, roofColor, { y }));
    }
    // chimney
    g.add(makeBox(THREE, { x: 0.4, y: 1.2, z: 0.4 }, '#8a5236', { y: 0.6 + 0.05, x: tile * 0.25, z: tile * 0.25 }));
    g.add(makeBox(THREE, { x: 0.5, y: 0.12, z: 0.5 }, '#5a3628', { y: 1.22, x: tile * 0.25, z: tile * 0.25 }));
    return g;
  };
}

function skylight(roofColor: string): PieceDef['build'] {
  return ({ THREE, tile }) => {
    const g = new THREE.Group();
    const steps = 6;
    const peakH = 0.9;
    for (let i = 0; i < steps; i++) {
      const r = i / (steps - 1);
      const y = r * peakH;
      const w = tile * (1 - r);
      g.add(makeBox(THREE, { x: tile, y: peakH / steps + 0.02, z: w }, roofColor, { y }));
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

const RIDGE_SLATE     = '#4a5966';
const RIDGE_TERRACOTTA= '#b85a3a';
const RIDGE_GREEN_TILE= '#5b7b4c';

export const ROOF_PIECES: PieceDef[] = [
  { id: 'roof.flat_slate',       kind: 'roof', label: 'Flat · Slate',      swatch: RIDGE_SLATE,     build: flatRoof(RIDGE_SLATE, '#222b32') },
  { id: 'roof.gable_x',          kind: 'roof', label: 'Gable (X ridge)',   swatch: RIDGE_TERRACOTTA,build: gableRoof(RIDGE_TERRACOTTA, 'x') },
  { id: 'roof.gable_z',          kind: 'roof', label: 'Gable (Z ridge)',   swatch: RIDGE_TERRACOTTA,build: gableRoof(RIDGE_TERRACOTTA, 'z') },
  { id: 'roof.hip',              kind: 'roof', label: 'Hip',               swatch: RIDGE_GREEN_TILE,build: hipRoof(RIDGE_GREEN_TILE) },
  { id: 'roof.shed',             kind: 'roof', label: 'Shed (pent)',       swatch: '#6b4a22',       build: shedRoof('#6b4a22') },
  { id: 'roof.thatched',         kind: 'roof', label: 'Thatched',          swatch: '#c79a4b',       build: thatchedGable() },
  { id: 'roof.domed_gold',       kind: 'roof', label: 'Domed · Gold',      swatch: '#d4a94b',       build: domed('#d4a94b', '#ffe27a') },
  { id: 'roof.chimney',          kind: 'roof', label: 'Chimney Gable',     swatch: RIDGE_SLATE,     build: chimneyRoof(RIDGE_SLATE) },
  { id: 'roof.skylight',         kind: 'roof', label: 'Skylight',          swatch: RIDGE_TERRACOTTA,build: skylight(RIDGE_TERRACOTTA) },
  { id: 'roof.flat_green',       kind: 'roof', label: 'Flat · Green',      swatch: '#6bba3a',       build: flatRoof('#6bba3a', '#3f7622') },
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
    for (let i = 0; i < steps; i++) {
      const r = i / (steps - 1);
      const y = r * peakH;
      const s = tile * (1 - r);
      // offset toward one corner so it reads as a hip corner
      g.add(makeBox(THREE, { x: s, y: peakH / steps + 0.02, z: s }, color, {
        y, x: -((tile - s) / 2), z: -((tile - s) / 2),
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
    for (let i = 0; i < steps; i++) {
      const r = i / (steps - 1);
      const y = r * peakH;
      const s = tile * (1 - r);
      g.add(makeBox(THREE, { x: s, y: peakH / steps + 0.02, z: s }, color, { y }));
    }
    return g;
  };
}

function flatCap(color: string): PieceDef['build'] {
  return ({ THREE, tile }) => {
    const g = new THREE.Group();
    g.add(makeBox(THREE, { x: tile, y: 0.25, z: tile }, color, { y: 0.125 }));
    g.add(makeBox(THREE, { x: tile * 1.1, y: 0.1, z: tile * 1.1 }, color, { y: 0.3 }));
    // corner bollard
    g.add(makeBox(THREE, { x: 0.3, y: 0.6, z: 0.3 }, '#3a2413', { y: 0.55, x: tile * 0.3, z: tile * 0.3 }));
    return g;
  };
}

function gableEnd(color: string): PieceDef['build'] {
  return ({ THREE, tile }) => {
    const g = new THREE.Group();
    const steps = 8;
    const peakH = 1.2;
    for (let i = 0; i < steps; i++) {
      const r = i / (steps - 1);
      const y = r * peakH;
      const w = tile * (1 - r);
      g.add(makeBox(THREE, { x: w, y: peakH / steps + 0.02, z: tile }, color, { y }));
    }
    // pediment wall at the end
    g.add(makeBox(THREE, { x: tile, y: peakH, z: 0.15 }, '#e7dfc8', { y: peakH / 2, z: -tile / 2 + 0.1 }));
    return g;
  };
}

function eaveGutter(color: string): PieceDef['build'] {
  return ({ THREE, tile }) => {
    const g = new THREE.Group();
    const steps = 6;
    const peakH = 0.7;
    for (let i = 0; i < steps; i++) {
      const r = i / (steps - 1);
      const y = r * peakH;
      const w = tile * (1 - r);
      g.add(makeBox(THREE, { x: tile, y: peakH / steps + 0.02, z: w }, color, { y }));
    }
    // gutter lip along the front (Z = +tile/2)
    g.add(makeBox(THREE, { x: tile, y: 0.1, z: 0.12 }, '#6b5a3c', { y: 0.1, z: tile / 2 + 0.05 }));
    g.add(makeBox(THREE, { x: 0.12, y: 0.3, z: 0.12 }, '#6b5a3c', { y: -0.15, x: tile * 0.35, z: tile / 2 + 0.05 }));
    return g;
  };
}

function dormer(color: string): PieceDef['build'] {
  return ({ THREE, tile }) => {
    const g = new THREE.Group();
    // underlying gable
    const steps = 7;
    const peakH = 1.0;
    for (let i = 0; i < steps; i++) {
      const r = i / (steps - 1);
      const y = r * peakH;
      const w = tile * (1 - r);
      g.add(makeBox(THREE, { x: tile, y: peakH / steps + 0.02, z: w }, color, { y }));
    }
    // dormer box
    g.add(makeBox(THREE, { x: 0.9, y: 0.9, z: 0.6 }, '#f5efe0', { y: 0.45, z: tile * 0.25 }));
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
    for (let i = 0; i < steps; i++) {
      const r = i / (steps - 1);
      const y = r * peakH;
      const s = tile * (1 - r);
      g.add(makeBox(THREE, { x: s, y: peakH / steps + 0.02, z: s }, color, { y }));
    }
    // flagpole
    g.add(makeBox(THREE, { x: 0.06, y: 0.6, z: 0.06 }, '#2a2a2a', { y: peakH + 0.3 }));
    g.add(makeBox(THREE, { x: 0.4, y: 0.25, z: 0.02 }, flag, { y: peakH + 0.45, x: 0.23 }));
    return g;
  };
}

export const ROOF_CORNERS: PieceDef[] = [
  { id: 'roofcnr.hip_slate',      kind: 'roof-corner', label: 'Hip · Slate',   swatch: RIDGE_SLATE,      build: hipCorner(RIDGE_SLATE, '#1a2228') },
  { id: 'roofcnr.hip_terra',      kind: 'roof-corner', label: 'Hip · Terra',   swatch: RIDGE_TERRACOTTA, build: hipCorner(RIDGE_TERRACOTTA, '#5a1f10') },
  { id: 'roofcnr.pyramid_green',  kind: 'roof-corner', label: 'Pyramid',       swatch: RIDGE_GREEN_TILE, build: pyramidCap(RIDGE_GREEN_TILE) },
  { id: 'roofcnr.flat_cap',       kind: 'roof-corner', label: 'Flat Cap',      swatch: RIDGE_SLATE,      build: flatCap(RIDGE_SLATE) },
  { id: 'roofcnr.gable_end',      kind: 'roof-corner', label: 'Gable End',     swatch: RIDGE_TERRACOTTA, build: gableEnd(RIDGE_TERRACOTTA) },
  { id: 'roofcnr.eave',           kind: 'roof-corner', label: 'Eave + Gutter', swatch: RIDGE_GREEN_TILE, build: eaveGutter(RIDGE_GREEN_TILE) },
  { id: 'roofcnr.dormer',         kind: 'roof-corner', label: 'Dormer',        swatch: RIDGE_SLATE,      build: dormer(RIDGE_SLATE) },
  { id: 'roofcnr.tower_red',      kind: 'roof-corner', label: 'Tower · Red',   swatch: '#b8402a',        build: towerCap('#b8402a', '#f2c94c') },
  { id: 'roofcnr.tower_blue',     kind: 'roof-corner', label: 'Tower · Blue',  swatch: '#2a5fb8',        build: towerCap('#2a5fb8', '#ffffff') },
  { id: 'roofcnr.thatched_peak',  kind: 'roof-corner', label: 'Thatched Peak', swatch: '#c79a4b',        build: pyramidCap('#c79a4b') },
];
