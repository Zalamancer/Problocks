import { makeBox, type PieceDef } from './types';

/**
 * 10 floor variants. Canonical frame: TILE × TILE in X/Z, thickness on Y,
 * bottom at y=0. Patterns are rendered by stamping smaller boxes on top
 * of a base slab so a second floor level stays usable (solid Y support
 * with room to stack).
 */

function plain(color: string): PieceDef['build'] {
  return ({ THREE, tile, floorThick }) => {
    const g = new THREE.Group();
    g.add(makeBox(THREE, { x: tile, y: floorThick, z: tile }, color, { y: floorThick / 2 }));
    return g;
  };
}

function planks(baseColor: string, grooveColor: string, direction: 'x' | 'z'): PieceDef['build'] {
  return ({ THREE, tile, floorThick }) => {
    const g = new THREE.Group();
    g.add(makeBox(THREE, { x: tile, y: floorThick, z: tile }, baseColor, { y: floorThick / 2 }));
    const planks = 6;
    for (let i = 1; i < planks; i++) {
      const offset = -tile / 2 + (tile / planks) * i;
      if (direction === 'x') {
        g.add(makeBox(THREE, { x: 0.03, y: 0.011, z: tile }, grooveColor, { y: floorThick + 0.002, x: offset }));
      } else {
        g.add(makeBox(THREE, { x: tile, y: 0.011, z: 0.03 }, grooveColor, { y: floorThick + 0.002, z: offset }));
      }
    }
    return g;
  };
}

function checker(a: string, b: string, div = 4): PieceDef['build'] {
  return ({ THREE, tile, floorThick }) => {
    const g = new THREE.Group();
    const cell = tile / div;
    // base
    g.add(makeBox(THREE, { x: tile, y: floorThick, z: tile }, a, { y: floorThick / 2 }));
    for (let i = 0; i < div; i++) {
      for (let j = 0; j < div; j++) {
        if ((i + j) % 2 === 0) continue;
        const x = -tile / 2 + cell / 2 + i * cell;
        const z = -tile / 2 + cell / 2 + j * cell;
        g.add(makeBox(THREE, { x: cell * 0.98, y: 0.012, z: cell * 0.98 }, b, { y: floorThick + 0.005, x, z }));
      }
    }
    return g;
  };
}

function brick(a: string, b: string): PieceDef['build'] {
  return ({ THREE, tile, floorThick }) => {
    const g = new THREE.Group();
    g.add(makeBox(THREE, { x: tile, y: floorThick, z: tile }, a, { y: floorThick / 2 }));
    const rows = 5;
    const bW = tile / 2;
    const bD = tile / rows;
    for (let r = 0; r < rows; r++) {
      const offset = (r % 2) * (bW / 2);
      for (let c = -2; c <= 2; c++) {
        const x = c * bW + offset - bW / 2;
        if (x < -tile / 2 + 0.02 || x + bW > tile / 2 - 0.02) continue;
        const z = -tile / 2 + bD / 2 + r * bD;
        g.add(makeBox(THREE, { x: bW * 0.95, y: 0.015, z: bD * 0.9 }, b, { y: floorThick + 0.005, x: x + bW / 2, z }));
      }
    }
    return g;
  };
}

function grate(base: string, bar: string): PieceDef['build'] {
  return ({ THREE, tile, floorThick }) => {
    const g = new THREE.Group();
    g.add(makeBox(THREE, { x: tile, y: floorThick, z: tile }, base, { y: floorThick / 2 }));
    const div = 6;
    for (let i = 1; i < div; i++) {
      const p = -tile / 2 + (tile / div) * i;
      g.add(makeBox(THREE, { x: 0.05, y: 0.015, z: tile }, bar, { y: floorThick + 0.005, x: p }));
      g.add(makeBox(THREE, { x: tile, y: 0.015, z: 0.05 }, bar, { y: floorThick + 0.005, z: p }));
    }
    return g;
  };
}

export const FLOOR_PIECES: PieceDef[] = [
  { id: 'floor.wood_dark',     kind: 'floor', label: 'Dark Planks',   swatch: '#5b3a1e', build: planks('#5b3a1e', '#301a08', 'x') },
  { id: 'floor.wood_light',    kind: 'floor', label: 'Light Planks',  swatch: '#c98b55', build: planks('#c98b55', '#7a4f29', 'x') },
  { id: 'floor.stone_tiles',   kind: 'floor', label: 'Stone Tiles',   swatch: '#a7abb0', build: checker('#a7abb0', '#cfd3d8', 3) },
  { id: 'floor.marble_checker',kind: 'floor', label: 'Marble Check',  swatch: '#f1e9dc', build: checker('#f1e9dc', '#2d2a26', 4) },
  { id: 'floor.brick_red',     kind: 'floor', label: 'Brick',         swatch: '#b33c2b', build: brick('#6a2015', '#c55442') },
  { id: 'floor.concrete',      kind: 'floor', label: 'Concrete',      swatch: '#b5b2a7', build: plain('#b5b2a7') },
  { id: 'floor.grass',         kind: 'floor', label: 'Grass',         swatch: '#6bba3a', build: plain('#6bba3a') },
  { id: 'floor.sand',          kind: 'floor', label: 'Sand',          swatch: '#ecd9a1', build: plain('#ecd9a1') },
  { id: 'floor.carpet_red',    kind: 'floor', label: 'Red Carpet',    swatch: '#a82a2a', build: plain('#a82a2a') },
  { id: 'floor.metal_grate',   kind: 'floor', label: 'Metal Grate',   swatch: '#4b5258', build: grate('#2b2f33', '#7a828a') },
];
