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
  { id: 'floor.wood_dark',     kind: 'floor', label: 'Dark Planks',   swatch: '#8b4a20', build: planks('#8b4a20', '#4a2510', 'x') },
  { id: 'floor.wood_light',    kind: 'floor', label: 'Maple Planks',  swatch: '#ffb067', build: planks('#ffb067', '#c97a3a', 'x') },
  { id: 'floor.stone_tiles',   kind: 'floor', label: 'Sky Tiles',     swatch: '#4dc4ff', build: checker('#4dc4ff', '#ffffff', 3) },
  { id: 'floor.marble_checker',kind: 'floor', label: 'Checker',       swatch: '#ffffff', build: checker('#ffffff', '#1a1a1a', 4) },
  { id: 'floor.brick_red',     kind: 'floor', label: 'Candy Brick',   swatch: '#ff2e44', build: brick('#b83a1c', '#ff6b7a') },
  { id: 'floor.concrete',      kind: 'floor', label: 'Cloud Grey',    swatch: '#e0e8f0', build: plain('#e0e8f0') },
  { id: 'floor.grass',         kind: 'floor', label: 'Grass',         swatch: '#5cd93a', build: plain('#5cd93a') },
  { id: 'floor.sand',          kind: 'floor', label: 'Sand',          swatch: '#ffe066', build: plain('#ffe066') },
  { id: 'floor.carpet_red',    kind: 'floor', label: 'Red Carpet',    swatch: '#ff2e44', build: plain('#ff2e44') },
  { id: 'floor.metal_grate',   kind: 'floor', label: 'Metal Grate',   swatch: '#6b7580', build: grate('#3b434c', '#b8c2cc') },
];
