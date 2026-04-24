import * as THREE from 'three';
import { PALETTE, toonMaterial } from '../materials';
import { kidBox, kidSphere } from '../geometry';
import { addOutlinesToTree } from '../outlines';
import type { BuildOptions } from './types';

/**
 * Robloxian-style blocky character matching the Adopt-Me reference:
 * torso + 2 legs + 2 arms with hand spheres + head + hair cap + fringe +
 * eyes + smile (torus arc) + cheek blush. Tagged with userData.__kidChar
 * named sub-groups so the engine's animation pass can find the head and
 * arms without reparsing the graph every frame.
 */
export function character({ color, props }: BuildOptions): THREE.Object3D {
  const g = new THREE.Group();
  g.userData.__kidCharacter = true;

  const shirt = color ?? PALETTE.shirt;
  const pants = (props?.pantsColor as string) ?? PALETTE.pants;
  const skin  = (props?.skinColor  as string) ?? PALETTE.skin;
  const hair  = (props?.hairColor  as string) ?? PALETTE.hair;
  const shoes = (props?.shoeColor  as string) ?? PALETTE.shoes;

  // Body pivot — animated (bob + squash) by the engine, kept separate
  // from the group root so the user's gizmo transforms compose cleanly
  // on top of the idle animation.
  const body = new THREE.Group();
  body.name = 'char-body';
  g.add(body);

  // Torso
  const torso = new THREE.Mesh(
    kidBox({ width: 0.95, height: 1.15, depth: 0.5, radius: 0.08 }),
    toonMaterial({ color: shirt }),
  );
  torso.position.y = 1.2;
  torso.castShadow = true; torso.receiveShadow = true;
  body.add(torso);

  // Legs + shoes
  for (const side of [-1, 1]) {
    const leg = new THREE.Mesh(
      kidBox({ width: 0.4, height: 0.95, depth: 0.4, radius: 0.06 }),
      toonMaterial({ color: pants }),
    );
    leg.position.set(side * 0.23, 0.48, 0);
    leg.castShadow = true;
    body.add(leg);

    const shoe = new THREE.Mesh(
      kidBox({ width: 0.44, height: 0.14, depth: 0.5, radius: 0.04 }),
      toonMaterial({ color: shoes }),
    );
    shoe.position.set(side * 0.23, 0.07, 0.04);
    shoe.castShadow = true;
    body.add(shoe);
  }

  // Arms — each lives on a pivot at the shoulder so the engine can
  // rotate the whole arm around its top without moving the rest of the
  // character.
  for (const side of [-1, 1]) {
    const pivot = new THREE.Group();
    pivot.name = side < 0 ? 'char-arm-left' : 'char-arm-right';
    pivot.userData.side = side;
    pivot.position.set(side * 0.68, 1.7, 0);
    body.add(pivot);

    const arm = new THREE.Mesh(
      kidBox({ width: 0.32, height: 1.0, depth: 0.32, radius: 0.05 }),
      toonMaterial({ color: shirt }),
    );
    arm.position.y = -0.45;
    arm.castShadow = true;
    pivot.add(arm);

    const hand = new THREE.Mesh(
      kidSphere({ radius: 0.18, detail: 0 }),
      toonMaterial({ color: skin }),
    );
    hand.position.y = -0.95;
    hand.scale.set(1, 0.9, 1);
    hand.castShadow = true;
    pivot.add(hand);
  }

  // Head group — rotates toward the cursor via the engine's animation pass
  const headGroup = new THREE.Group();
  headGroup.name = 'char-head';
  headGroup.position.y = 2.1;
  body.add(headGroup);

  const head = new THREE.Mesh(
    kidBox({ width: 0.78, height: 0.78, depth: 0.62, radius: 0.12 }),
    toonMaterial({ color: skin }),
  );
  head.castShadow = true; head.receiveShadow = true;
  headGroup.add(head);

  const hairCap = new THREE.Mesh(
    kidBox({ width: 0.82, height: 0.34, depth: 0.66, radius: 0.12 }),
    toonMaterial({ color: hair }),
  );
  hairCap.position.y = 0.3;
  hairCap.castShadow = true;
  headGroup.add(hairCap);

  const fringe = new THREE.Mesh(
    kidBox({ width: 0.82, height: 0.18, depth: 0.3, radius: 0.06 }),
    toonMaterial({ color: hair }),
  );
  fringe.position.set(0, 0.22, 0.22);
  headGroup.add(fringe);

  // Eyes (tall rounded boxes, pressed onto the front face)
  const faceZ = 0.32;
  for (const x of [-0.18, 0.18]) {
    const eye = new THREE.Mesh(
      kidBox({ width: 0.09, height: 0.16, depth: 0.04, radius: 0.025 }),
      toonMaterial({ color: PALETTE.face }),
    );
    eye.position.set(x, 0.02, faceZ);
    headGroup.add(eye);
  }

  // Smile — half-torus
  const smile = new THREE.Mesh(
    new THREE.TorusGeometry(0.1, 0.022, 8, 16, Math.PI),
    toonMaterial({ color: PALETTE.face }),
  );
  smile.position.set(0, -0.18, faceZ);
  smile.rotation.z = Math.PI;
  headGroup.add(smile);

  // Cheek blush
  for (const side of [-1, 1]) {
    const blush = new THREE.Mesh(
      kidSphere({ radius: 0.08, detail: 0 }),
      toonMaterial({ color: PALETTE.flowerPink }),
    );
    blush.position.set(side * 0.28, -0.07, faceZ - 0.04);
    blush.scale.set(1, 0.6, 0.15);
    headGroup.add(blush);
  }

  addOutlinesToTree(g);
  return g;
}
