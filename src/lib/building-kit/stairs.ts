import { makeBox, type PieceDef } from './types';

/**
 * 10 stair pieces. Canonical frame: TILE × TILE in X/Z, climbs from y=0
 * at the "front" (+Z) to y=WALL_HEIGHT at the "back" (-Z). Rotation is
 * applied at placement time to face the chosen direction.
 */

function straightStairs(color: string, stepColor: string, steps = 10): PieceDef['build'] {
  return ({ THREE, tile, wallHeight }) => {
    const g = new THREE.Group();
    const stepH = wallHeight / steps;
    const stepD = tile / steps;
    for (let i = 0; i < steps; i++) {
      const y = i * stepH + stepH / 2;
      const z = tile / 2 - stepD * (i + 1) + stepD / 2;
      g.add(makeBox(THREE, { x: tile * 0.95, y: stepH, z: stepD * (steps - i) }, color, {
        y, z: z - (stepD * (steps - i) - stepD) / 2,
      }));
      // tread highlight
      g.add(makeBox(THREE, { x: tile * 0.96, y: 0.02, z: stepD }, stepColor, {
        y: i * stepH + stepH, z,
      }));
    }
    return g;
  };
}

function spiralStairs(color: string): PieceDef['build'] {
  return ({ THREE, tile, wallHeight }) => {
    const g = new THREE.Group();
    const steps = 14;
    const stepH = wallHeight / steps;
    const radius = tile * 0.35;
    const stepSize = { x: tile * 0.4, z: 0.35 };
    for (let i = 0; i < steps; i++) {
      const a = (i / steps) * Math.PI * 2 * 0.85;
      const x = Math.cos(a) * radius;
      const z = Math.sin(a) * radius;
      const m = makeBox(THREE, { x: stepSize.x, y: stepH, z: stepSize.z }, color, {
        x, y: i * stepH + stepH / 2, z,
      });
      m.rotation.y = -a;
      g.add(m);
    }
    // center post
    g.add(makeBox(THREE, { x: 0.18, y: wallHeight, z: 0.18 }, '#2a2a2a', { y: wallHeight / 2 }));
    return g;
  };
}

function lStairs(color: string, stepColor: string): PieceDef['build'] {
  return ({ THREE, tile, wallHeight }) => {
    const g = new THREE.Group();
    const steps = 12;
    const stepH = wallHeight / steps;
    const halfSteps = steps / 2;
    const stepD = tile / halfSteps;
    // first leg (Z from +tile/2 back to 0)
    for (let i = 0; i < halfSteps; i++) {
      const y = i * stepH + stepH / 2;
      const z = tile / 2 - stepD * (i + 1) + stepD / 2;
      g.add(makeBox(THREE, { x: tile * 0.48, y: stepH, z: stepD }, color, { x: -tile * 0.24, y, z }));
      g.add(makeBox(THREE, { x: tile * 0.49, y: 0.02, z: stepD }, stepColor, { x: -tile * 0.24, y: i * stepH + stepH, z }));
    }
    // landing
    g.add(makeBox(THREE, { x: tile * 0.96, y: stepH, z: tile * 0.48 }, color, {
      y: halfSteps * stepH - stepH / 2, z: -tile * 0.25,
    }));
    // second leg (X from +tile/2 toward -tile/2 along -z side)
    for (let i = 0; i < halfSteps; i++) {
      const y = (halfSteps + i) * stepH + stepH / 2;
      const x = tile / 2 - stepD * (i + 1) + stepD / 2;
      g.add(makeBox(THREE, { x: stepD, y: stepH, z: tile * 0.48 }, color, { x, y, z: -tile * 0.25 }));
      g.add(makeBox(THREE, { x: stepD, y: 0.02, z: tile * 0.49 }, stepColor, { x, y: (halfSteps + i) * stepH + stepH, z: -tile * 0.25 }));
    }
    return g;
  };
}

function rampStairs(color: string): PieceDef['build'] {
  return ({ THREE, tile, wallHeight }) => {
    const g = new THREE.Group();
    // a wedge approximation via stacked thin boxes
    const slices = 24;
    for (let i = 0; i < slices; i++) {
      const r = i / (slices - 1);
      const y = r * wallHeight;
      g.add(makeBox(THREE, { x: tile * 0.95, y: wallHeight / slices + 0.01, z: tile * (1 - r) }, color, {
        y, z: tile / 2 - (tile * (1 - r)) / 2,
      }));
    }
    return g;
  };
}

function ladder(rail: string, rung: string): PieceDef['build'] {
  return ({ THREE, tile, wallHeight }) => {
    const g = new THREE.Group();
    const rails = [-0.2, 0.2];
    for (const x of rails) {
      g.add(makeBox(THREE, { x: 0.08, y: wallHeight, z: 0.08 }, rail, { x, y: wallHeight / 2, z: tile * 0.3 }));
    }
    const rungs = 10;
    for (let i = 0; i < rungs; i++) {
      g.add(makeBox(THREE, { x: 0.5, y: 0.05, z: 0.05 }, rung, {
        y: (wallHeight / (rungs + 1)) * (i + 1), z: tile * 0.3,
      }));
    }
    return g;
  };
}

export const STAIRS_PIECES: PieceDef[] = [
  { id: 'stairs.straight_wood',   kind: 'stairs', label: 'Straight Wood',   swatch: '#5b3a1e', build: straightStairs('#5b3a1e', '#c98b55') },
  { id: 'stairs.straight_stone',  kind: 'stairs', label: 'Straight Stone',  swatch: '#9aa0a4', build: straightStairs('#9aa0a4', '#d1d4d8') },
  { id: 'stairs.wide_wood',       kind: 'stairs', label: 'Wide Wood',       swatch: '#c98b55', build: straightStairs('#c98b55', '#eccaa0', 8) },
  { id: 'stairs.narrow_stone',    kind: 'stairs', label: 'Narrow Stone',    swatch: '#9aa0a4', build: straightStairs('#9aa0a4', '#d1d4d8', 14) },
  { id: 'stairs.l_wood',          kind: 'stairs', label: 'L-Shape',         swatch: '#5b3a1e', build: lStairs('#5b3a1e', '#c98b55') },
  { id: 'stairs.l_stone',         kind: 'stairs', label: 'L-Shape Stone',   swatch: '#9aa0a4', build: lStairs('#9aa0a4', '#d1d4d8') },
  { id: 'stairs.spiral_iron',     kind: 'stairs', label: 'Spiral Iron',     swatch: '#2a2a2a', build: spiralStairs('#2a2a2a') },
  { id: 'stairs.spiral_wood',     kind: 'stairs', label: 'Spiral Wood',     swatch: '#5b3a1e', build: spiralStairs('#5b3a1e') },
  { id: 'stairs.ramp_concrete',   kind: 'stairs', label: 'Ramp Concrete',   swatch: '#b5b2a7', build: rampStairs('#b5b2a7') },
  { id: 'stairs.ladder_wood',     kind: 'stairs', label: 'Ladder',          swatch: '#5b3a1e', build: ladder('#3a2413', '#c98b55') },
];
