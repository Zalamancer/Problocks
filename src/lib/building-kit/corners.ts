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

/**
 * Quarter-circle curved wall piece. Centered at the tile vertex with the
 * arc sweeping 90° from local +X to +Z (outside corner). Approximated as
 * a chain of small flat-shaded box segments so it stays in the Roblox-y
 * low-poly aesthetic and renders cheap on integrated GPUs. The user
 * adjusts the radius by uniformly scaling the placed corner via the
 * gizmo (X/Z scale = radius multiplier).
 */
function curvedWall(color: string, radius = 1.0, segments = 12): PieceDef['build'] {
  return ({ THREE, wallHeight, wallThick }) => {
    const g = new THREE.Group();
    const arcSpan = Math.PI / 2;
    for (let i = 0; i < segments; i++) {
      const a0 = (i / segments) * arcSpan;
      const a1 = ((i + 1) / segments) * arcSpan;
      const aMid = (a0 + a1) / 2;
      const x0 = Math.cos(a0) * radius;
      const z0 = Math.sin(a0) * radius;
      const x1 = Math.cos(a1) * radius;
      const z1 = Math.sin(a1) * radius;
      // chord length + small overlap so adjacent segments seam-hide
      const chordLen = Math.hypot(x1 - x0, z1 - z0) + wallThick * 0.25;
      const seg = makeBox(
        THREE,
        { x: chordLen, y: wallHeight, z: wallThick },
        color,
        { x: Math.cos(aMid) * radius, y: wallHeight / 2, z: Math.sin(aMid) * radius },
      );
      // Rotate each segment so it sits tangent to the arc at its midpoint.
      seg.rotation.y = -aMid;
      g.add(seg);
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
  { id: 'cnr.square_plaster',  kind: 'corner', label: 'Square White',    swatch: '#ffffff', build: simpleColumn('#ffffff') },
  { id: 'cnr.square_brick',    kind: 'corner', label: 'Square Red',      swatch: '#ff2e44', build: simpleColumn('#ff2e44') },
  { id: 'cnr.square_stone',    kind: 'corner', label: 'Square Sky',      swatch: '#4dc4ff', build: simpleColumn('#4dc4ff') },
  { id: 'cnr.round_marble',    kind: 'corner', label: 'Round White',     swatch: '#ffffff', build: roundedColumn('#ffffff') },
  { id: 'cnr.round_wood',      kind: 'corner', label: 'Round Wood',      swatch: '#8b4a20', build: roundedColumn('#8b4a20') },
  { id: 'cnr.doric_round',     kind: 'corner', label: 'Doric (round)',   swatch: '#ffffff', build: capitalColumn('#ffffff', '#ffd60a', true) },
  { id: 'cnr.doric_square',    kind: 'corner', label: 'Doric (square)',  swatch: '#ffffff', build: capitalColumn('#ffffff', '#ffd60a', false) },
  { id: 'cnr.buttress_stone',  kind: 'corner', label: 'Buttress',        swatch: '#4dc4ff', build: buttress('#4dc4ff') },
  { id: 'cnr.lamppost_black',  kind: 'corner', label: 'Lamp Post',       swatch: '#1a1a1a', build: lamppost('#1a1a1a', '#ffff00') },
  { id: 'cnr.buttress_wood',   kind: 'corner', label: 'Buttress Wood',   swatch: '#8b4a20', build: buttress('#8b4a20') },
  // Curved wall corners — drop one at a tile vertex where two perpendicular
  // walls meet, then rotate to point at the outside, then scale X/Z to dial
  // in the bend radius. Multiple base radii so the variant grid covers tight,
  // medium, and wide curves without needing to scale.
  { id: 'cnr.curved_tight_white', kind: 'corner', label: 'Curve · Tight',   swatch: '#ffffff', build: curvedWall('#ffffff', 0.5) },
  { id: 'cnr.curved_med_white',   kind: 'corner', label: 'Curve · Medium',  swatch: '#ffffff', build: curvedWall('#ffffff', 1.0) },
  { id: 'cnr.curved_wide_white',  kind: 'corner', label: 'Curve · Wide',    swatch: '#ffffff', build: curvedWall('#ffffff', 1.5) },
  { id: 'cnr.curved_med_red',     kind: 'corner', label: 'Curve · Red',     swatch: '#ff2e44', build: curvedWall('#ff2e44', 1.0) },
  { id: 'cnr.curved_med_sky',     kind: 'corner', label: 'Curve · Sky',     swatch: '#4dc4ff', build: curvedWall('#4dc4ff', 1.0) },
  { id: 'cnr.curved_med_wood',    kind: 'corner', label: 'Curve · Wood',    swatch: '#8b4a20', build: curvedWall('#8b4a20', 1.0) },
];
