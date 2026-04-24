import * as THREE from 'three';
import { PALETTE, toonMaterial } from '../materials';
import { kidSphere, kidCylinder, kidCone, kidInstanced, type InstanceTransform } from '../geometry';
import { addOutline, addOutlinesToTree } from '../outlines';
import type { BuildOptions } from './types';

/**
 * Oak tree: 4-blob layered canopy (reference uses 4 sizes stacked in a
 * rough cone silhouette — gives more density than the 3-blob version
 * while staying cheap on draw calls).
 */
export function treeOak({ color, props }: BuildOptions): THREE.Object3D {
  const g = new THREE.Group();
  const leaf = color ?? PALETTE.mint;
  const leafAccent = PALETTE.sage;
  const trunkColor = (props?.trunkColor as string) ?? PALETTE.woodDark;

  const trunk = new THREE.Mesh(
    kidCylinder({ radiusTop: 0.22, radiusBottom: 0.3, height: 1.3 }),
    toonMaterial({ color: trunkColor }),
  );
  trunk.position.y = 0.65;
  trunk.castShadow = true; trunk.receiveShadow = true;
  g.add(trunk);

  // Canopy is 4 sphere blobs of varying radii. Two colours (leaf /
  // leafAccent alternating) means 2 InstancedMeshes instead of 4
  // individual meshes. Each instance is the base sphere scaled down.
  const BASE = 0.95;
  const leafXs: InstanceTransform[] = [
    { position: [0, 1.5, 0],  scale: 1 },
    { position: [0, 2.5, 0],  scale: 0.65 / BASE },
  ];
  const accentXs: InstanceTransform[] = [
    { position: [0, 2.05, 0], scale: 0.8  / BASE },
    { position: [0, 2.85, 0], scale: 0.45 / BASE },
  ];
  const sphereGeo = kidSphere({ radius: BASE, detail: 1 });
  const leafM   = kidInstanced(sphereGeo, toonMaterial({ color: leaf       }), leafXs);
  const accentM = kidInstanced(sphereGeo, toonMaterial({ color: leafAccent }), accentXs);
  leafM.castShadow   = true; leafM.receiveShadow   = true; g.add(leafM);
  accentM.castShadow = true; accentM.receiveShadow = true; g.add(accentM);

  addOutlinesToTree(g);
  return g;
}

export function treePine({ color, props }: BuildOptions): THREE.Object3D {
  const g = new THREE.Group();
  const leaf = color ?? PALETTE.sage;
  const trunkColor = (props?.trunkColor as string) ?? PALETTE.woodShadow;

  const trunk = new THREE.Mesh(
    kidCylinder({ radiusTop: 0.18, radiusBottom: 0.22, height: 0.8 }),
    toonMaterial({ color: trunkColor }),
  );
  trunk.position.y = 0.4;
  trunk.castShadow = true; trunk.receiveShadow = true;
  g.add(trunk);

  // Three cone tiers → one InstancedMesh. Base cone has radius 0.95,
  // height 0.9; upper tiers are scaled down per-instance. Different
  // height scales mean the stack still reads as a tapered pine.
  const BASE_R = 0.95;
  const BASE_H = 0.9;
  const tiers: InstanceTransform[] = [
    { position: [0, 0.8  + 0.9 / 2, 0], scale: [1, 1, 1] },
    { position: [0, 1.45 + 0.8 / 2, 0], scale: [0.75 / BASE_R, 0.8 / BASE_H, 0.75 / BASE_R] },
    { position: [0, 2.0  + 0.7 / 2, 0], scale: [0.55 / BASE_R, 0.7 / BASE_H, 0.55 / BASE_R] },
  ];
  const canopy = kidInstanced(
    kidCone({ radius: BASE_R, height: BASE_H }),
    toonMaterial({ color: leaf }),
    tiers,
  );
  canopy.castShadow = true; canopy.receiveShadow = true;
  g.add(canopy);

  addOutlinesToTree(g);
  return g;
}

export function bush({ color }: BuildOptions): THREE.Object3D {
  const g = new THREE.Group();
  const c = color ?? PALETTE.flowerBush;
  // Four sphere blobs via a single InstancedMesh. Base sphere is r=0.5;
  // smaller blobs are just per-instance scaled down. Shares the sphere
  // geometry across every bush in the scene.
  const BASE = 0.5;
  const blobs: InstanceTransform[] = [
    { position: [0,     0.5,  0],    scale: 1 },
    { position: [0.42,  0.42, 0.1],  scale: 0.4 / BASE },
    { position: [-0.4,  0.4, -0.05], scale: 0.4 / BASE },
    { position: [0.1,   0.35, 0.4],  scale: 0.35 / BASE },
  ];
  const m = kidInstanced(
    kidSphere({ radius: BASE, detail: 0 }),
    toonMaterial({ color: c }),
    blobs,
  );
  m.castShadow = true; m.receiveShadow = true;
  g.add(m);
  addOutlinesToTree(g);
  return g;
}

export function mushroom({ color }: BuildOptions): THREE.Object3D {
  const g = new THREE.Group();
  const cap = color ?? PALETTE.flowerPink;

  const stem = new THREE.Mesh(
    kidCylinder({ radiusTop: 0.15, radiusBottom: 0.18, height: 0.5 }),
    toonMaterial({ color: PALETTE.ivory }),
  );
  stem.position.y = 0.25;
  stem.castShadow = true; stem.receiveShadow = true;
  g.add(stem);

  const capMesh = new THREE.Mesh(
    kidSphere({ radius: 0.42, detail: 1 }),
    toonMaterial({ color: cap }),
  );
  capMesh.position.y = 0.55;
  capMesh.scale.set(1, 0.7, 1);
  capMesh.castShadow = true;
  g.add(capMesh);

  // 5 cap dots → one InstancedMesh.
  const dotXs: InstanceTransform[] = [];
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    dotXs.push({ position: [Math.cos(a) * 0.28, 0.62, Math.sin(a) * 0.28] });
  }
  const dots = kidInstanced(
    kidSphere({ radius: 0.06, detail: 0 }),
    toonMaterial({ color: PALETTE.ivory }),
    dotXs,
  );
  g.add(dots);

  addOutlinesToTree(g);
  return g;
}

export function rock({ color }: BuildOptions): THREE.Object3D {
  const m = new THREE.Mesh(
    kidSphere({ radius: 0.5, detail: 0 }),
    toonMaterial({ color: color ?? '#b8b8b2' }),
  );
  m.scale.set(1.2, 0.8, 1);
  m.position.y = 0.35;
  m.castShadow = true; m.receiveShadow = true;
  addOutline(m);
  return m;
}

export function flower({ color }: BuildOptions): THREE.Object3D {
  const g = new THREE.Group();
  const petal = color ?? PALETTE.butter;

  const stem = new THREE.Mesh(
    kidCylinder({ radiusTop: 0.04, radiusBottom: 0.05, height: 0.5 }),
    toonMaterial({ color: PALETTE.flowerBush }),
  );
  stem.position.y = 0.25;
  g.add(stem);

  const center = new THREE.Mesh(
    kidSphere({ radius: 0.08, detail: 0 }),
    toonMaterial({ color: PALETTE.flowerPink }),
  );
  center.position.y = 0.5;
  g.add(center);

  // 6 petals → single InstancedMesh. Per-instance scale gives the
  // stretched ellipsoid petal shape.
  const petalXs: InstanceTransform[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    petalXs.push({
      position: [Math.cos(a) * 0.13, 0.5, Math.sin(a) * 0.13],
      scale: [1.4, 0.6, 1.4],
    });
  }
  const petals = kidInstanced(
    kidSphere({ radius: 0.08, detail: 0 }),
    toonMaterial({ color: petal }),
    petalXs,
  );
  g.add(petals);

  g.traverse((o) => { if ((o as THREE.Mesh).isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  addOutlinesToTree(g);
  return g;
}

export function cloud({ color }: BuildOptions): THREE.Object3D {
  const g = new THREE.Group();
  const c = color ?? '#f9fafc';
  const BASE = 0.7;
  const blobs: InstanceTransform[] = [
    { position: [ 0,    0,     0],    scale: 1 },
    { position: [ 0.7, -0.05,  0.1],  scale: 0.5  / BASE },
    { position: [-0.7,  0,    -0.1],  scale: 0.55 / BASE },
    { position: [ 0.3,  0.25,  0],    scale: 0.45 / BASE },
    { position: [-0.3,  0.2,   0.15], scale: 0.4  / BASE },
  ];
  const m = kidInstanced(
    kidSphere({ radius: BASE, detail: 0 }),
    toonMaterial({ color: c }),
    blobs,
  );
  m.castShadow = false; m.receiveShadow = false;
  g.add(m);
  g.position.y = 4;
  addOutlinesToTree(g, { thickness: 0.015 });
  return g;
}

// ---- random tree ----------------------------------------------------

/** 32-bit seeded PRNG (mulberry32). Deterministic from a single integer
    — the same seed always produces the same tree. */
function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Leaf/trunk palettes — each style evokes a different mood.
// All values hard-coded (not `PALETTE.x`) so the tree-random picker
// isn't frozen to whatever theme was active at module import time.
// Numbers tuned against the Pokopia reference: deep forest greens
// (blue-shifted, not lime), fire-engine autumn, hot-pink cherry,
// saturated purples/teals for fantasy, red-rust trunks.
const PAL_GREEN  = ['#2d9040', '#3aa348', '#52b055', '#2a7a34', '#46a050', '#388a3e', '#4fb052', '#2e8a3c'];
const PAL_AUTUMN = ['#e04820', '#c43018', '#d93a30', '#e88818', '#f06028', '#b83820', '#d97530', '#e65818'];
const PAL_CHERRY = ['#ff5a92', '#e04878', '#ff78a8', '#d83a70', '#ff4080', '#f07098', '#c82860'];
const PAL_FANTASY = ['#8a2ce0', '#9840e8', '#38a0d0', '#d04ae0', '#4080e0', '#b030e0', '#20b080'];
const PAL_WOOD_BROWN = ['#a84830', '#8a3520', '#c46f4a', '#932f1c', '#b0553a'];
const PAL_WOOD_BIRCH = ['#ece7d3', '#d6d1bb', '#c4bfa5'];
const PAL_FRUIT = ['#d93020', '#c42818', '#e03828']; // cherry / apple reds — pure fire-engine
const PAL_FRUIT_CITRUS = ['#f0a020', '#e88010', '#ffb030'];

type TreeStyle = 'green' | 'autumn' | 'cherry' | 'fantasy' | 'birch' | 'dead';
type CanopyShape = 'round' | 'stacked' | 'cone' | 'cluster' | 'umbrella' | 'tall';

function paletteFor(style: TreeStyle): string[] {
  if (style === 'autumn')  return PAL_AUTUMN;
  if (style === 'cherry')  return PAL_CHERRY;
  if (style === 'fantasy') return PAL_FANTASY;
  // birch defaults to green leaves with an autumn-turn chance handled at call site
  return PAL_GREEN;
}

/**
 * Random tree — each spawn gets a unique integer seed (stored in
 * props.seed by the store) that drives every parameter. The seed is
 * persisted in SceneObject.props so save / undo / reload keep the
 * exact same tree. Variety axes:
 *
 *   Style (color / mood):  green · autumn · cherry · fantasy · birch · dead
 *   Canopy shape:          round · stacked · cone · cluster · umbrella · tall
 *   Trunks:                1 (usual) · 2 (fork) · 3 (cluster)
 *   Sizes:                 trunk 0.6–2.2 tall, canopy radius 0.6–1.5
 *   Extras:                Berries / fruit scattered on ~20% of live trees
 *
 * Style × shape × trunkCount × sizes gives hundreds of plausible trees
 * from a single seed, so repeated clicks on the palette tile feel
 * genuinely varied instead of four-archetype déjà vu.
 */
export function treeRandom({ color, props }: BuildOptions): THREE.Object3D {
  const seed = ((props?.seed as number | undefined) ?? 0) || 1;
  const rng = mulberry32(seed);
  const pick = <T>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];

  // ---- style (color mood) --------------------------------------------
  const styleRoll = rng();
  const style: TreeStyle =
    styleRoll < 0.40 ? 'green'   :
    styleRoll < 0.60 ? 'autumn'  :
    styleRoll < 0.75 ? 'cherry'  :
    styleRoll < 0.87 ? 'fantasy' :
    styleRoll < 0.95 ? 'birch'   : 'dead';

  const leafPalette = paletteFor(style);
  const woodPalette = style === 'birch' ? PAL_WOOD_BIRCH
                    : style === 'fantasy' ? [...PAL_WOOD_BROWN, '#3b2d4f'] // dark purple bark option
                    : PAL_WOOD_BROWN;

  // ---- trunk(s) ------------------------------------------------------
  const trunkRoll = rng();
  const trunkCount: 1 | 2 | 3 = trunkRoll < 0.10 ? 3 : trunkRoll < 0.24 ? 2 : 1;
  const trunkH = 0.6 + rng() * 1.6;                    // 0.6–2.2
  const mainTrunkR = 0.15 + rng() * 0.20;              // 0.15–0.35
  const perTrunkR = mainTrunkR * (trunkCount === 3 ? 0.7 : trunkCount === 2 ? 0.82 : 1.0);
  const trunkColor = pick(woodPalette);

  const g = new THREE.Group();

  for (let t = 0; t < trunkCount; t++) {
    const tAngle = trunkCount > 1 ? (t / trunkCount) * Math.PI * 2 + rng() * 0.3 : 0;
    const tRad   = trunkCount > 1 ? 0.12 + rng() * 0.1 : 0;
    const trunk = new THREE.Mesh(
      kidCylinder({ radiusTop: perTrunkR * 0.85, radiusBottom: perTrunkR, height: trunkH }),
      toonMaterial({ color: trunkColor }),
    );
    trunk.position.set(Math.cos(tAngle) * tRad, trunkH / 2, Math.sin(tAngle) * tRad);
    trunk.castShadow = true; trunk.receiveShadow = true;
    g.add(trunk);
  }

  // Dead trees get bare branches instead of a canopy and return early.
  if (style === 'dead') {
    const branchCount = 2 + Math.floor(rng() * 4);        // 2–5
    for (let i = 0; i < branchCount; i++) {
      const a = rng() * Math.PI * 2;
      const len = 0.4 + rng() * 0.5;
      const height = trunkH * (0.5 + rng() * 0.45);
      const branchR = perTrunkR * (0.35 + rng() * 0.25);
      const branch = new THREE.Mesh(
        kidCylinder({ radiusTop: branchR * 0.7, radiusBottom: branchR, height: len }),
        toonMaterial({ color: trunkColor }),
      );
      // Rotate the cylinder so it lies ~horizontal (tilted up 30°) and offset
      // from the trunk to read as a limb.
      branch.position.set(
        Math.cos(a) * (perTrunkR + len * 0.45),
        height,
        Math.sin(a) * (perTrunkR + len * 0.45),
      );
      branch.rotation.set(0, -a, Math.PI / 2 - 0.5);
      branch.castShadow = true;
      g.add(branch);
    }
    addOutlinesToTree(g);
    return g;
  }

  // ---- canopy --------------------------------------------------------
  const shapes: CanopyShape[] = ['round', 'stacked', 'cone', 'cluster', 'umbrella', 'tall'];
  const shape = pick(shapes);
  // `color` is the user's explicit override from the inspector; when set
  // it clobbers the seeded pick so recolouring works as expected.
  const leafBase   = color ?? pick(leafPalette);
  const leafAccent = pick(leafPalette);

  if (shape === 'round') {
    const r = 0.7 + rng() * 0.5;
    const ball = new THREE.Mesh(
      kidSphere({ radius: r, detail: 1 }),
      toonMaterial({ color: leafBase }),
    );
    ball.position.y = trunkH + r * 0.65;
    ball.castShadow = true; ball.receiveShadow = true;
    g.add(ball);
  } else if (shape === 'stacked') {
    const BASE = 0.85 + rng() * 0.3;
    const baseY = trunkH + BASE * 0.4;
    const sphereGeo = kidSphere({ radius: BASE, detail: 1 });
    const leafXs: InstanceTransform[] = [
      { position: [0, baseY, 0], scale: 1 },
      { position: [0, baseY + BASE * 0.8, 0], scale: 0.55 + rng() * 0.25 },
    ];
    const accentXs: InstanceTransform[] = [
      {
        position: [(rng() - 0.5) * 0.45, baseY + BASE * 0.45, (rng() - 0.5) * 0.45],
        scale: 0.5 + rng() * 0.25,
      },
    ];
    const leafM   = kidInstanced(sphereGeo, toonMaterial({ color: leafBase   }), leafXs);
    const accentM = kidInstanced(sphereGeo, toonMaterial({ color: leafAccent }), accentXs);
    leafM.castShadow = true; accentM.castShadow = true;
    g.add(leafM, accentM);
  } else if (shape === 'cone') {
    const tierCount = 3 + Math.floor(rng() * 3);          // 3–5
    const BASE_R = 0.70 + rng() * 0.40;
    const BASE_H = 0.60 + rng() * 0.40;
    const tiers: InstanceTransform[] = [];
    let y = trunkH;
    for (let i = 0; i < tierCount; i++) {
      const s = Math.max(0.28, 1 - i * (0.18 + rng() * 0.10));
      const tierH = BASE_H * s;
      tiers.push({ position: [0, y + tierH / 2, 0], scale: [s, s, s] });
      y += tierH * 0.55;
    }
    const canopy = kidInstanced(
      kidCone({ radius: BASE_R, height: BASE_H }),
      toonMaterial({ color: leafBase }),
      tiers,
    );
    canopy.castShadow = true; canopy.receiveShadow = true;
    g.add(canopy);
  } else if (shape === 'cluster') {
    const count = 4 + Math.floor(rng() * 5);              // 4–8 blobs
    const xs: InstanceTransform[] = [];
    for (let i = 0; i < count; i++) {
      const a = rng() * Math.PI * 2;
      const radial = 0.20 + rng() * 0.5;
      xs.push({
        position: [Math.cos(a) * radial, trunkH + 0.20 + rng() * 0.7, Math.sin(a) * radial],
        scale: 0.55 + rng() * 0.55,
      });
    }
    const blobs = kidInstanced(
      kidSphere({ radius: 0.5, detail: 1 }),
      toonMaterial({ color: leafBase }),
      xs,
    );
    blobs.castShadow = true; blobs.receiveShadow = true;
    g.add(blobs);
  } else if (shape === 'umbrella') {
    // Wide squashed canopy — palm-ish / maple umbrella feel.
    const r = 0.95 + rng() * 0.55;
    const ball = new THREE.Mesh(
      kidSphere({ radius: r, detail: 1 }),
      toonMaterial({ color: leafBase }),
    );
    ball.position.y = trunkH + r * 0.25;
    ball.scale.set(1, 0.4 + rng() * 0.15, 1);
    ball.castShadow = true; ball.receiveShadow = true;
    g.add(ball);
  } else {
    // Tall — elongated columnar canopy (cypress / poplar).
    const r = 0.45 + rng() * 0.3;
    const h = 1.2 + rng() * 1.0;
    const stretched = new THREE.Mesh(
      kidSphere({ radius: r, detail: 1 }),
      toonMaterial({ color: leafBase }),
    );
    stretched.position.y = trunkH + h * 0.45;
    stretched.scale.set(1, h / (r * 2), 1);
    stretched.castShadow = true; stretched.receiveShadow = true;
    g.add(stretched);
  }

  // ---- optional fruits / berries ------------------------------------
  const fruitRoll = rng();
  const wantsFruit =
    (style === 'cherry'  && fruitRoll < 0.55) ||
    (style === 'autumn'  && fruitRoll < 0.35) ||
    (style === 'green'   && fruitRoll < 0.15) ||
    (style === 'fantasy' && fruitRoll < 0.25);
  if (wantsFruit) {
    const fruitPalette = style === 'fantasy'
      ? PAL_FANTASY
      : style === 'autumn' && rng() < 0.5
        ? PAL_FRUIT_CITRUS
        : PAL_FRUIT;
    const fruitColor = pick(fruitPalette);
    const fruitCount = 5 + Math.floor(rng() * 8);         // 5–12
    const fruitR = 0.055 + rng() * 0.04;
    const fxs: InstanceTransform[] = [];
    for (let i = 0; i < fruitCount; i++) {
      const a = rng() * Math.PI * 2;
      const radial = 0.35 + rng() * 0.6;
      fxs.push({
        position: [Math.cos(a) * radial, trunkH + 0.5 + rng() * 0.9, Math.sin(a) * radial],
        scale: 1,
      });
    }
    const fruits = kidInstanced(
      kidSphere({ radius: fruitR, detail: 0 }),
      toonMaterial({ color: fruitColor }),
      fxs,
    );
    g.add(fruits);
  }

  addOutlinesToTree(g);
  return g;
}
