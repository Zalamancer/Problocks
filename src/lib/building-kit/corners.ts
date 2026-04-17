import { makeBox, type PieceDef } from './types';

/**
 * 10 corner / column pieces. Placed at wall junctions. Canonical frame:
 * thin square in X/Z (CORNER_SIZE), full wall height on Y.
 */

const CORNER_SIZE = 0.35;

function simpleColumn(color: string): PieceDef['build'] {
  return ({ THREE, wallHeight }) => {
    const g = new THREE.Group();
    g.add(makeBox(THREE, { x: CORNER_SIZE, y: wallHeight, z: CORNER_SIZE }, color, { y: wallHeight / 2 }));
    return g;
  };
}

function roundedColumn(color: string): PieceDef['build'] {
  return ({ THREE, wallHeight }) => {
    const g = new THREE.Group();
    const cyl = new THREE.Mesh(
      new THREE.CylinderGeometry(CORNER_SIZE / 2, CORNER_SIZE / 2, wallHeight, 16),
      new THREE.MeshStandardMaterial({ color, roughness: 0.55 }),
    );
    cyl.position.y = wallHeight / 2;
    cyl.castShadow = true;
    cyl.receiveShadow = true;
    g.add(cyl);
    return g;
  };
}

function capitalColumn(baseColor: string, capColor: string, rounded: boolean): PieceDef['build'] {
  return ({ THREE, wallHeight }) => {
    const g = new THREE.Group();
    const shaftH = wallHeight * 0.82;
    if (rounded) {
      const cyl = new THREE.Mesh(
        new THREE.CylinderGeometry(CORNER_SIZE / 2.2, CORNER_SIZE / 2.2, shaftH, 16),
        new THREE.MeshStandardMaterial({ color: baseColor, roughness: 0.6 }),
      );
      cyl.position.y = wallHeight * 0.1 + shaftH / 2;
      cyl.castShadow = true;
      cyl.receiveShadow = true;
      g.add(cyl);
    } else {
      g.add(makeBox(THREE, { x: CORNER_SIZE * 0.8, y: shaftH, z: CORNER_SIZE * 0.8 }, baseColor,
        { y: wallHeight * 0.1 + shaftH / 2 }));
    }
    // base plinth
    g.add(makeBox(THREE, { x: CORNER_SIZE, y: wallHeight * 0.1, z: CORNER_SIZE }, capColor, { y: wallHeight * 0.05 }));
    // capital (cap)
    g.add(makeBox(THREE, { x: CORNER_SIZE * 1.1, y: wallHeight * 0.08, z: CORNER_SIZE * 1.1 }, capColor,
      { y: wallHeight * 0.92 + wallHeight * 0.04 }));
    return g;
  };
}

function buttress(color: string): PieceDef['build'] {
  return ({ THREE, wallHeight }) => {
    const g = new THREE.Group();
    const steps = 4;
    for (let i = 0; i < steps; i++) {
      const r = i / steps;
      const w = CORNER_SIZE * (1 + (1 - r) * 0.9);
      const h = wallHeight / steps;
      g.add(makeBox(THREE, { x: w, y: h, z: w }, color, { y: i * h + h / 2 }));
    }
    return g;
  };
}

function lamppost(postColor: string, lampColor: string): PieceDef['build'] {
  return ({ THREE, wallHeight }) => {
    const g = new THREE.Group();
    g.add(makeBox(THREE, { x: 0.15, y: wallHeight + 0.4, z: 0.15 }, postColor,
      { y: (wallHeight + 0.4) / 2 }));
    // lamp enclosure
    g.add(makeBox(THREE, { x: 0.32, y: 0.32, z: 0.32 }, '#ffe9a8',
      { y: wallHeight + 0.25 }));
    // emissive glow overlay
    const glow = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.28, 0.28),
      new THREE.MeshStandardMaterial({
        color: lampColor, emissive: lampColor, emissiveIntensity: 1.5,
        transparent: true, opacity: 0.85,
      }),
    );
    glow.position.y = wallHeight + 0.25;
    g.add(glow);
    // top cap
    g.add(makeBox(THREE, { x: 0.4, y: 0.06, z: 0.4 }, postColor, { y: wallHeight + 0.45 }));
    return g;
  };
}

export const CORNER_PIECES: PieceDef[] = [
  { id: 'cnr.square_plaster',  kind: 'corner', label: 'Square Plaster',  swatch: '#f5efe0', build: simpleColumn('#f5efe0') },
  { id: 'cnr.square_brick',    kind: 'corner', label: 'Square Brick',    swatch: '#b33c2b', build: simpleColumn('#b33c2b') },
  { id: 'cnr.square_stone',    kind: 'corner', label: 'Square Stone',    swatch: '#9aa0a4', build: simpleColumn('#9aa0a4') },
  { id: 'cnr.round_marble',    kind: 'corner', label: 'Round Marble',    swatch: '#f1e9dc', build: roundedColumn('#f1e9dc') },
  { id: 'cnr.round_wood',      kind: 'corner', label: 'Round Wood',      swatch: '#5b3a1e', build: roundedColumn('#5b3a1e') },
  { id: 'cnr.doric_round',     kind: 'corner', label: 'Doric (round)',   swatch: '#f1e9dc', build: capitalColumn('#f1e9dc', '#d7c69a', true) },
  { id: 'cnr.doric_square',    kind: 'corner', label: 'Doric (square)',  swatch: '#f1e9dc', build: capitalColumn('#f1e9dc', '#d7c69a', false) },
  { id: 'cnr.buttress_stone',  kind: 'corner', label: 'Buttress',        swatch: '#9aa0a4', build: buttress('#9aa0a4') },
  { id: 'cnr.lamppost_black',  kind: 'corner', label: 'Lamp Post',       swatch: '#1a1a1a', build: lamppost('#1a1a1a', '#ffdf70') },
  { id: 'cnr.buttress_wood',   kind: 'corner', label: 'Buttress Wood',   swatch: '#5b3a1e', build: buttress('#5b3a1e') },
];
