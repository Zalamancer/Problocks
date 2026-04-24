import * as THREE from 'three';
import { PALETTE, toonMaterial } from '../materials';
import { kidSphere, kidCylinder, kidCone } from '../geometry';
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

  const layers = [
    { y: 1.5, r: 0.95, c: leaf },
    { y: 2.05, r: 0.8,  c: leafAccent },
    { y: 2.5, r: 0.65, c: leaf },
    { y: 2.85, r: 0.45, c: leafAccent },
  ];
  for (const l of layers) {
    const blob = new THREE.Mesh(
      kidSphere({ radius: l.r, detail: 1 }),
      toonMaterial({ color: l.c }),
    );
    blob.position.y = l.y;
    blob.castShadow = true; blob.receiveShadow = true;
    g.add(blob);
  }

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

export function bush({ color }: BuildOptions): THREE.Object3D {
  const g = new THREE.Group();
  const c = color ?? PALETTE.flowerBush;
  const blobs = [
    { pos: [0, 0.5, 0], r: 0.5 },
    { pos: [0.42, 0.42, 0.1], r: 0.4 },
    { pos: [-0.4, 0.4, -0.05], r: 0.4 },
    { pos: [0.1, 0.35, 0.4], r: 0.35 },
  ];
  for (const b of blobs) {
    const m = new THREE.Mesh(
      kidSphere({ radius: b.r, detail: 0 }),
      toonMaterial({ color: c }),
    );
    m.position.set(b.pos[0], b.pos[1], b.pos[2]);
    m.castShadow = true; m.receiveShadow = true;
    g.add(m);
  }
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

  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const dot = new THREE.Mesh(
      kidSphere({ radius: 0.06, detail: 0 }),
      toonMaterial({ color: PALETTE.ivory }),
    );
    dot.position.set(Math.cos(a) * 0.28, 0.62, Math.sin(a) * 0.28);
    g.add(dot);
  }

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

export function cloud({ color }: BuildOptions): THREE.Object3D {
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
    m.castShadow = false; m.receiveShadow = false;
    g.add(m);
  }
  g.position.y = 4;
  addOutlinesToTree(g, { thickness: 0.015 });
  return g;
}
