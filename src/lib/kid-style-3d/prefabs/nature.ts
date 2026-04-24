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
