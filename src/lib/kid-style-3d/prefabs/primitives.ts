import * as THREE from 'three';
import { PALETTE, toonMaterial } from '../materials';
import { kidBox, kidSphere, kidCylinder, kidCone } from '../geometry';
import { addOutline } from '../outlines';
import type { BuildOptions } from './types';

export function primitiveBox({ color }: BuildOptions): THREE.Object3D {
  const m = new THREE.Mesh(
    kidBox({ width: 1.5, height: 1.5, depth: 1.5, radius: 0.2 }),
    toonMaterial({ color: color ?? PALETTE.coral }),
  );
  m.position.y = 0.75;
  m.castShadow = true; m.receiveShadow = true;
  addOutline(m);
  return m;
}

export function primitiveSphere({ color }: BuildOptions): THREE.Object3D {
  const m = new THREE.Mesh(
    kidSphere({ radius: 0.8, detail: 1 }),
    toonMaterial({ color: color ?? PALETTE.butter }),
  );
  m.position.y = 0.8;
  m.castShadow = true; m.receiveShadow = true;
  addOutline(m);
  return m;
}

export function primitiveCylinder({ color }: BuildOptions): THREE.Object3D {
  const m = new THREE.Mesh(
    kidCylinder({ radiusTop: 0.7, radiusBottom: 0.7, height: 1.6 }),
    toonMaterial({ color: color ?? PALETTE.mint }),
  );
  m.position.y = 0.8;
  m.castShadow = true; m.receiveShadow = true;
  addOutline(m);
  return m;
}

export function primitiveCone({ color }: BuildOptions): THREE.Object3D {
  const m = new THREE.Mesh(
    kidCone({ radius: 0.8, height: 1.8 }),
    toonMaterial({ color: color ?? PALETTE.flowerPink }),
  );
  m.position.y = 0.9;
  m.castShadow = true; m.receiveShadow = true;
  addOutline(m);
  return m;
}
