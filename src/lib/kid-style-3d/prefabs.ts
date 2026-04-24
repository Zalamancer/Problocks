/**
 * Kid-style prefab library.
 *
 * Each entry builds a Three.js Object3D (usually a Group) fully wired for
 * the kid-style look: toon material, inverted-hull outline, shadow flags,
 * sensible origin. Consumers call `buildPrefab(kind, color?, props?)` and
 * get back something they can parent directly to the scene root.
 *
 * Prefabs are deliberately tiny — a single tree, fence segment, or house —
 * so composition is the user's job. Complex scenes come from stamping
 * dozens of prefabs, not from mega-prefabs with embedded logic.
 *
 * See docs/three-kid-style/ for every trick the prefabs rely on.
 */

import * as THREE from 'three';
import { PALETTE, toonMaterial } from './materials';
import { kidBox, kidSphere, kidCylinder, kidCone } from './geometry';
import { addOutline, addOutlinesToTree } from './outlines';

/* -------------------------------------------------------------------------- */
/*  Prefab registry                                                           */
/* -------------------------------------------------------------------------- */

export type PrefabKind =
  | 'rounded-box'
  | 'sphere'
  | 'cylinder'
  | 'cone'
  | 'tree-oak'
  | 'tree-pine'
  | 'bush'
  | 'mushroom'
  | 'rock'
  | 'flower'
  | 'cloud'
  | 'house'
  | 'fence'
  | 'path-stone'
  | 'character';

export interface PrefabCategory {
  id: 'primitives' | 'nature' | 'buildings' | 'characters';
  label: string;
}

export const PREFAB_CATEGORIES: PrefabCategory[] = [
  { id: 'primitives', label: 'Primitives' },
  { id: 'nature', label: 'Nature' },
  { id: 'buildings', label: 'Buildings' },
  { id: 'characters', label: 'Characters' },
];

export interface PrefabDef {
  kind: PrefabKind;
  label: string;
  category: PrefabCategory['id'];
  /** Default color applied when no per-instance color is set. */
  defaultColor: string;
  /** Emoji for the palette tile — cheap but readable thumbnail. */
  icon: string;
}

export const PREFABS: PrefabDef[] = [
  // Primitives
  { kind: 'rounded-box', label: 'Cube',     category: 'primitives', defaultColor: PALETTE.coral,  icon: '⬛' },
  { kind: 'sphere',      label: 'Sphere',   category: 'primitives', defaultColor: PALETTE.butter, icon: '⚪' },
  { kind: 'cylinder',    label: 'Cylinder', category: 'primitives', defaultColor: PALETTE.mint,   icon: '🧪' },
  { kind: 'cone',        label: 'Cone',     category: 'primitives', defaultColor: PALETTE.dustyRose, icon: '🔺' },

  // Nature
  { kind: 'tree-oak',    label: 'Oak Tree',  category: 'nature', defaultColor: PALETTE.mint,   icon: '🌳' },
  { kind: 'tree-pine',   label: 'Pine Tree', category: 'nature', defaultColor: PALETTE.sage,   icon: '🌲' },
  { kind: 'bush',        label: 'Bush',      category: 'nature', defaultColor: PALETTE.grass,  icon: '🌿' },
  { kind: 'mushroom',    label: 'Mushroom',  category: 'nature', defaultColor: PALETTE.dustyRose, icon: '🍄' },
  { kind: 'rock',        label: 'Rock',      category: 'nature', defaultColor: '#b8b8b2',      icon: '🪨' },
  { kind: 'flower',      label: 'Flower',    category: 'nature', defaultColor: PALETTE.butter, icon: '🌼' },
  { kind: 'cloud',       label: 'Cloud',     category: 'nature', defaultColor: '#f9fafc',      icon: '☁️' },

  // Buildings
  { kind: 'house',       label: 'House',     category: 'buildings', defaultColor: PALETTE.ivory, icon: '🏠' },
  { kind: 'fence',       label: 'Fence',     category: 'buildings', defaultColor: PALETTE.ivory, icon: '🚧' },
  { kind: 'path-stone',  label: 'Stepping Stone', category: 'buildings', defaultColor: '#c3bdb2', icon: '⬜' },

  // Characters
  { kind: 'character',   label: 'Character', category: 'characters', defaultColor: PALETTE.coral, icon: '🙂' },
];

export function getPrefabDef(kind: string): PrefabDef | undefined {
  return PREFABS.find((p) => p.kind === kind);
}

/* -------------------------------------------------------------------------- */
/*  Prefab builders                                                           */
/* -------------------------------------------------------------------------- */

export interface BuildOptions {
  color?: string;
  props?: Record<string, unknown>;
}

export function buildPrefab(kind: string, opts: BuildOptions = {}): THREE.Object3D {
  switch (kind as PrefabKind) {
    case 'rounded-box': return primitiveBox(opts);
    case 'sphere':      return primitiveSphere(opts);
    case 'cylinder':    return primitiveCylinder(opts);
    case 'cone':        return primitiveCone(opts);
    case 'tree-oak':    return treeOak(opts);
    case 'tree-pine':   return treePine(opts);
    case 'bush':        return bush(opts);
    case 'mushroom':    return mushroom(opts);
    case 'rock':        return rock(opts);
    case 'flower':      return flower(opts);
    case 'cloud':       return cloud(opts);
    case 'house':       return house(opts);
    case 'fence':       return fence(opts);
    case 'path-stone':  return pathStone(opts);
    case 'character':   return character(opts);
  }
  throw new Error(`Unknown prefab kind: ${kind}`);
}

/* --- primitives --- */

function primitiveBox({ color }: BuildOptions): THREE.Object3D {
  const m = new THREE.Mesh(
    kidBox({ width: 1.5, height: 1.5, depth: 1.5, radius: 0.2 }),
    toonMaterial({ color: color ?? PALETTE.coral }),
  );
  m.position.y = 0.75;
  m.castShadow = true; m.receiveShadow = true;
  addOutline(m);
  return m;
}

function primitiveSphere({ color }: BuildOptions): THREE.Object3D {
  const m = new THREE.Mesh(
    kidSphere({ radius: 0.8, detail: 1 }),
    toonMaterial({ color: color ?? PALETTE.butter }),
  );
  m.position.y = 0.8;
  m.castShadow = true; m.receiveShadow = true;
  addOutline(m);
  return m;
}

function primitiveCylinder({ color }: BuildOptions): THREE.Object3D {
  const m = new THREE.Mesh(
    kidCylinder({ radiusTop: 0.7, radiusBottom: 0.7, height: 1.6 }),
    toonMaterial({ color: color ?? PALETTE.mint }),
  );
  m.position.y = 0.8;
  m.castShadow = true; m.receiveShadow = true;
  addOutline(m);
  return m;
}

function primitiveCone({ color }: BuildOptions): THREE.Object3D {
  const m = new THREE.Mesh(
    kidCone({ radius: 0.8, height: 1.8 }),
    toonMaterial({ color: color ?? PALETTE.dustyRose }),
  );
  m.position.y = 0.9;
  m.castShadow = true; m.receiveShadow = true;
  addOutline(m);
  return m;
}

/* --- nature --- */

function treeOak({ color }: BuildOptions): THREE.Object3D {
  const g = new THREE.Group();
  const leaf = color ?? PALETTE.mint;
  const trunk = new THREE.Mesh(
    kidCylinder({ radiusTop: 0.22, radiusBottom: 0.28, height: 1.1 }),
    toonMaterial({ color: PALETTE.woodDark }),
  );
  trunk.position.y = 0.55; trunk.castShadow = true; trunk.receiveShadow = true;
  g.add(trunk);

  const canopy = new THREE.Group();
  const blob1 = new THREE.Mesh(kidSphere({ radius: 0.9, detail: 1 }), toonMaterial({ color: leaf }));
  const blob2 = new THREE.Mesh(kidSphere({ radius: 0.7, detail: 1 }), toonMaterial({ color: leaf }));
  const blob3 = new THREE.Mesh(kidSphere({ radius: 0.65, detail: 1 }), toonMaterial({ color: leaf }));
  blob1.position.set(0, 1.75, 0);
  blob2.position.set(0.55, 1.55, 0.2);
  blob3.position.set(-0.45, 1.5, -0.25);
  [blob1, blob2, blob3].forEach((b) => { b.castShadow = true; b.receiveShadow = true; canopy.add(b); });
  g.add(canopy);
  addOutlinesToTree(g);
  return g;
}

function treePine({ color }: BuildOptions): THREE.Object3D {
  const g = new THREE.Group();
  const leaf = color ?? PALETTE.sage;
  const trunk = new THREE.Mesh(
    kidCylinder({ radiusTop: 0.18, radiusBottom: 0.22, height: 0.8 }),
    toonMaterial({ color: PALETTE.woodDark }),
  );
  trunk.position.y = 0.4; trunk.castShadow = true; trunk.receiveShadow = true;
  g.add(trunk);
  // stacked cones for a pine silhouette
  const tiers = [
    { y: 0.8, r: 0.95, h: 0.9 },
    { y: 1.45, r: 0.75, h: 0.8 },
    { y: 2.0, r: 0.55, h: 0.7 },
  ];
  for (const t of tiers) {
    const cone = new THREE.Mesh(
      kidCone({ radius: t.r, height: t.h }),
      toonMaterial({ color: leaf }),
    );
    cone.position.y = t.y + t.h / 2;
    cone.castShadow = true; cone.receiveShadow = true;
    g.add(cone);
  }
  addOutlinesToTree(g);
  return g;
}

function bush({ color }: BuildOptions): THREE.Object3D {
  const g = new THREE.Group();
  const c = color ?? PALETTE.grass;
  const blobs = [
    { pos: [0, 0.5, 0], r: 0.5 },
    { pos: [0.42, 0.42, 0.1], r: 0.4 },
    { pos: [-0.4, 0.4, -0.05], r: 0.4 },
    { pos: [0.1, 0.35, 0.4], r: 0.35 },
  ];
  for (const b of blobs) {
    const m = new THREE.Mesh(kidSphere({ radius: b.r, detail: 0 }), toonMaterial({ color: c }));
    m.position.set(b.pos[0], b.pos[1], b.pos[2]);
    m.castShadow = true; m.receiveShadow = true;
    g.add(m);
  }
  addOutlinesToTree(g);
  return g;
}

function mushroom({ color }: BuildOptions): THREE.Object3D {
  const g = new THREE.Group();
  const cap = color ?? PALETTE.dustyRose;
  const stem = new THREE.Mesh(
    kidCylinder({ radiusTop: 0.15, radiusBottom: 0.18, height: 0.5 }),
    toonMaterial({ color: PALETTE.ivory }),
  );
  stem.position.y = 0.25;
  g.add(stem);
  const capMesh = new THREE.Mesh(
    kidSphere({ radius: 0.42, detail: 1 }),
    toonMaterial({ color: cap }),
  );
  capMesh.position.y = 0.55;
  capMesh.scale.set(1, 0.7, 1);
  g.add(capMesh);
  // white spots
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const dot = new THREE.Mesh(
      kidSphere({ radius: 0.06, detail: 0 }),
      toonMaterial({ color: PALETTE.ivory }),
    );
    dot.position.set(Math.cos(a) * 0.28, 0.62, Math.sin(a) * 0.28);
    g.add(dot);
  }
  [stem, capMesh, ...g.children].forEach((m) => {
    if ((m as THREE.Mesh).isMesh) { m.castShadow = true; m.receiveShadow = true; }
  });
  addOutlinesToTree(g);
  return g;
}

function rock({ color }: BuildOptions): THREE.Object3D {
  const c = color ?? '#b8b8b2';
  // Use a low-detail sphere scaled non-uniformly for a "stacked pebble" read.
  const m = new THREE.Mesh(
    kidSphere({ radius: 0.5, detail: 0 }),
    toonMaterial({ color: c }),
  );
  m.scale.set(1.2, 0.8, 1);
  m.position.y = 0.35;
  m.castShadow = true; m.receiveShadow = true;
  addOutline(m);
  return m;
}

function flower({ color }: BuildOptions): THREE.Object3D {
  const g = new THREE.Group();
  const petal = color ?? PALETTE.butter;
  const stem = new THREE.Mesh(
    kidCylinder({ radiusTop: 0.04, radiusBottom: 0.05, height: 0.5 }),
    toonMaterial({ color: PALETTE.sage }),
  );
  stem.position.y = 0.25;
  g.add(stem);
  const center = new THREE.Mesh(
    kidSphere({ radius: 0.08, detail: 0 }),
    toonMaterial({ color: PALETTE.coral }),
  );
  center.position.y = 0.5;
  g.add(center);
  // 6 petals around the center
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const p = new THREE.Mesh(
      kidSphere({ radius: 0.08, detail: 0 }),
      toonMaterial({ color: petal }),
    );
    p.position.set(Math.cos(a) * 0.13, 0.5, Math.sin(a) * 0.13);
    p.scale.set(1.4, 0.6, 1.4);
    g.add(p);
  }
  g.traverse((o) => { if ((o as THREE.Mesh).isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  addOutlinesToTree(g);
  return g;
}

function cloud({ color }: BuildOptions): THREE.Object3D {
  const g = new THREE.Group();
  const c = color ?? '#f9fafc';
  const blobs = [
    { x: 0, y: 0, z: 0, r: 0.7 },
    { x: 0.7, y: -0.05, z: 0.1, r: 0.5 },
    { x: -0.7, y: 0, z: -0.1, r: 0.55 },
    { x: 0.3, y: 0.25, z: 0, r: 0.45 },
    { x: -0.3, y: 0.2, z: 0.15, r: 0.4 },
  ];
  for (const b of blobs) {
    const m = new THREE.Mesh(kidSphere({ radius: b.r, detail: 0 }), toonMaterial({ color: c }));
    m.position.set(b.x, b.y, b.z);
    m.castShadow = false;  // clouds shouldn't cast harsh shadows
    m.receiveShadow = false;
    g.add(m);
  }
  // float them by default, 6 units up
  g.position.y = 4;
  addOutlinesToTree(g, { thickness: 0.015 });
  return g;
}

/* --- buildings --- */

function house({ color, props }: BuildOptions): THREE.Object3D {
  const g = new THREE.Group();
  const W = 2.8, H = 1.9, D = 2.8;
  const ROOF_H = 1.3;

  const wallColor       = color ?? PALETTE.ivory;
  const roofColor       = (props?.roofColor as string)       ?? PALETTE.roof;
  const doorColor       = (props?.doorColor as string)       ?? PALETTE.woodDark;
  const foundationColor = (props?.foundationColor as string) ?? PALETTE.foundation;
  const trimColor       = (props?.trimColor as string)       ?? PALETTE.wallTrim;

  // Foundation — slightly wider + darker than walls, reads as "this
  // house is sitting on something", not floating.
  const foundation = new THREE.Mesh(
    kidBox({ width: W + 0.15, height: 0.3, depth: D + 0.15, radius: 0.08 }),
    toonMaterial({ color: foundationColor }),
  );
  foundation.position.y = 0.15;
  foundation.castShadow = true; foundation.receiveShadow = true;
  g.add(foundation);

  // Walls
  const walls = new THREE.Mesh(
    kidBox({ width: W, height: H, depth: D, radius: 0.12 }),
    toonMaterial({ color: wallColor }),
  );
  walls.position.y = 0.3 + H / 2;
  walls.castShadow = true; walls.receiveShadow = true;
  g.add(walls);

  // Wall trim — ribbon at top of walls, warmer cream
  const trim = new THREE.Mesh(
    kidBox({ width: W + 0.08, height: 0.12, depth: D + 0.08, radius: 0.04 }),
    toonMaterial({ color: trimColor }),
  );
  trim.position.y = 0.3 + H - 0.08;
  trim.castShadow = true;
  g.add(trim);

  // Pitched roof — ExtrudeGeometry of a triangle with bevel, overhangs
  // walls for the Adopt-Me overcut silhouette.
  const shape = new THREE.Shape();
  shape.moveTo(-(W + 0.3) / 2, 0);
  shape.lineTo( (W + 0.3) / 2, 0);
  shape.lineTo(0, ROOF_H);
  shape.closePath();
  const roofGeo = new THREE.ExtrudeGeometry(shape, {
    depth: D + 0.25, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1, bevelSegments: 3, curveSegments: 4,
  });
  roofGeo.translate(0, 0, -(D + 0.25) / 2);
  const roof = new THREE.Mesh(roofGeo, toonMaterial({ color: roofColor }));
  roof.position.y = 0.3 + H;
  roof.castShadow = true; roof.receiveShadow = true;
  g.add(roof);

  // Roof ridge — darker strip along the peak
  const ridge = new THREE.Mesh(
    kidBox({ width: 0.12, height: 0.08, depth: D + 0.25, radius: 0.03 }),
    toonMaterial({ color: PALETTE.roofRidge }),
  );
  ridge.position.y = 0.3 + H + ROOF_H + 0.02;
  g.add(ridge);

  // Chimney — two-piece: body + darker top cap
  const chimney = new THREE.Mesh(
    kidBox({ width: 0.38, height: 1.0, depth: 0.38, radius: 0.05 }),
    toonMaterial({ color: PALETTE.chimney }),
  );
  chimney.position.set(-0.85, 0.3 + H + 0.55, -0.3);
  chimney.castShadow = true;
  g.add(chimney);
  const chimneyTop = new THREE.Mesh(
    kidBox({ width: 0.46, height: 0.1, depth: 0.46, radius: 0.03 }),
    toonMaterial({ color: PALETTE.chimneyTop }),
  );
  chimneyTop.position.set(-0.85, 0.3 + H + 1.08, -0.3);
  g.add(chimneyTop);

  // Door (centered on front face, z = +D/2)
  const doorFrame = new THREE.Mesh(
    kidBox({ width: 0.65, height: 1.2, depth: 0.08, radius: 0.03 }),
    toonMaterial({ color: PALETTE.woodShadow }),
  );
  doorFrame.position.set(0, 0.3 + 0.6, D / 2 + 0.02);
  g.add(doorFrame);
  const door = new THREE.Mesh(
    kidBox({ width: 0.55, height: 1.1, depth: 0.08, radius: 0.03 }),
    toonMaterial({ color: doorColor }),
  );
  door.position.set(0, 0.3 + 0.55, D / 2 + 0.06);
  door.castShadow = true;
  g.add(door);
  const knob = new THREE.Mesh(
    kidSphere({ radius: 0.045, detail: 0 }),
    toonMaterial({ color: PALETTE.butter }),
  );
  knob.position.set(0.18, 0.3 + 0.55, D / 2 + 0.12);
  g.add(knob);

  // Windows — two on the front flanking the door, one on each side
  const windows: Array<[number, number, number, number]> = [
    // [x, y, z, rotY]
    [-1.0, 0.3 + 1.2, D / 2 + 0.04, 0],
    [ 1.0, 0.3 + 1.2, D / 2 + 0.04, 0],
    [-W / 2 - 0.04, 0.3 + 1.2, 0, Math.PI / 2],
    [ W / 2 + 0.04, 0.3 + 1.2, 0, -Math.PI / 2],
  ];
  for (const [x, y, z, rotY] of windows) {
    const wnd = buildWindow();
    wnd.position.set(x, y, z);
    wnd.rotation.y = rotY;
    g.add(wnd);
  }

  addOutlinesToTree(g);
  return g;
}

function buildWindow(): THREE.Object3D {
  const g = new THREE.Group();
  const w = 0.7, h = 0.6;
  const frame = new THREE.Mesh(
    kidBox({ width: w + 0.1, height: h + 0.1, depth: 0.08, radius: 0.02 }),
    toonMaterial({ color: PALETTE.paper }),
  );
  g.add(frame);
  const glass = new THREE.Mesh(
    kidBox({ width: w, height: h, depth: 0.05, radius: 0.02 }),
    toonMaterial({ color: PALETTE.windowGlass }),
  );
  glass.position.z = 0.04;
  g.add(glass);
  const hBar = new THREE.Mesh(
    kidBox({ width: w + 0.04, height: 0.04, depth: 0.04, radius: 0.01 }),
    toonMaterial({ color: PALETTE.paper }),
  );
  hBar.position.z = 0.07;
  g.add(hBar);
  const vBar = new THREE.Mesh(
    kidBox({ width: 0.04, height: h + 0.04, depth: 0.04, radius: 0.01 }),
    toonMaterial({ color: PALETTE.paper }),
  );
  vBar.position.z = 0.07;
  g.add(vBar);
  return g;
}

function fence({ color, props }: BuildOptions): THREE.Object3D {
  const g = new THREE.Group();
  const c = color ?? PALETTE.ivory;
  const length = (props?.length as number) ?? 3;
  const picketCount = Math.max(1, Math.round(length / 0.45));
  const spacing = length / picketCount;
  for (let i = 0; i <= picketCount; i++) {
    const picket = new THREE.Mesh(
      kidBox({ width: 0.1, height: 0.7, depth: 0.08, radius: 0.03 }),
      toonMaterial({ color: c }),
    );
    picket.position.set(-length / 2 + i * spacing, 0.4, 0);
    picket.castShadow = true; picket.receiveShadow = true;
    g.add(picket);
    // pointed top
    const top = new THREE.Mesh(kidCone({ radius: 0.09, height: 0.12 }), toonMaterial({ color: c }));
    top.position.set(-length / 2 + i * spacing, 0.75, 0);
    top.castShadow = true; top.receiveShadow = true;
    g.add(top);
  }
  // rails
  for (const y of [0.22, 0.55]) {
    const rail = new THREE.Mesh(
      kidBox({ width: length, height: 0.07, depth: 0.06, radius: 0.02 }),
      toonMaterial({ color: c }),
    );
    rail.position.set(0, y, 0);
    rail.castShadow = true; rail.receiveShadow = true;
    g.add(rail);
  }
  addOutlinesToTree(g);
  return g;
}

function pathStone({ color }: BuildOptions): THREE.Object3D {
  const m = new THREE.Mesh(
    kidCylinder({ radiusTop: 0.42, radiusBottom: 0.42, height: 0.12 }),
    toonMaterial({ color: color ?? '#c3bdb2' }),
  );
  m.position.y = 0.06;
  m.castShadow = true; m.receiveShadow = true;
  addOutline(m);
  return m;
}

/* --- characters --- */

function character({ color, props }: BuildOptions): THREE.Object3D {
  const g = new THREE.Group();
  const shirt = color ?? PALETTE.coral;
  const pants = (props?.pantsColor as string) ?? '#6a8fbd';
  const skin = (props?.skinColor as string) ?? '#f2c9a2';
  const hair = (props?.hairColor as string) ?? PALETTE.charcoal;

  // Torso
  const torso = new THREE.Mesh(
    kidBox({ width: 0.6, height: 0.7, depth: 0.35, radius: 0.08 }),
    toonMaterial({ color: shirt }),
  );
  torso.position.y = 1.1;
  torso.castShadow = true; torso.receiveShadow = true;
  g.add(torso);

  // Legs
  for (const x of [-0.15, 0.15]) {
    const leg = new THREE.Mesh(
      kidBox({ width: 0.22, height: 0.7, depth: 0.22, radius: 0.06 }),
      toonMaterial({ color: pants }),
    );
    leg.position.set(x, 0.4, 0);
    leg.castShadow = true; leg.receiveShadow = true;
    g.add(leg);
  }

  // Arms
  for (const x of [-0.42, 0.42]) {
    const arm = new THREE.Mesh(
      kidBox({ width: 0.18, height: 0.65, depth: 0.18, radius: 0.06 }),
      toonMaterial({ color: shirt }),
    );
    arm.position.set(x, 1.1, 0);
    arm.castShadow = true; arm.receiveShadow = true;
    g.add(arm);
    const hand = new THREE.Mesh(kidSphere({ radius: 0.12, detail: 0 }), toonMaterial({ color: skin }));
    hand.position.set(x, 0.75, 0);
    hand.castShadow = true;
    g.add(hand);
  }

  // Head
  const head = new THREE.Mesh(
    kidBox({ width: 0.7, height: 0.65, depth: 0.55, radius: 0.12 }),
    toonMaterial({ color: skin }),
  );
  head.position.y = 1.8;
  head.castShadow = true; head.receiveShadow = true;
  g.add(head);

  // Hair cap
  const hairMesh = new THREE.Mesh(
    kidBox({ width: 0.72, height: 0.2, depth: 0.57, radius: 0.14 }),
    toonMaterial({ color: hair }),
  );
  hairMesh.position.y = 2.1;
  hairMesh.castShadow = true;
  g.add(hairMesh);

  // Eyes
  for (const x of [-0.12, 0.12]) {
    const eye = new THREE.Mesh(kidSphere({ radius: 0.06, detail: 0 }), toonMaterial({ color: PALETTE.charcoal }));
    eye.position.set(x, 1.85, 0.28);
    eye.scale.set(0.7, 1, 0.6);
    g.add(eye);
  }
  // Smile (tiny torus arc)
  const smile = new THREE.Mesh(
    new THREE.TorusGeometry(0.08, 0.015, 8, 16, Math.PI),
    toonMaterial({ color: PALETTE.charcoal }),
  );
  smile.position.set(0, 1.72, 0.28);
  smile.rotation.z = Math.PI;
  g.add(smile);

  // Cheek blush — a little Adopt Me touch
  for (const x of [-0.22, 0.22]) {
    const cheek = new THREE.Mesh(kidSphere({ radius: 0.07, detail: 0 }), toonMaterial({ color: PALETTE.dustyRose }));
    cheek.position.set(x, 1.76, 0.27);
    cheek.scale.set(1, 0.6, 0.15);
    g.add(cheek);
  }

  addOutlinesToTree(g);
  return g;
}
