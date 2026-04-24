import * as THREE from 'three';
import { PALETTE, toonMaterial } from '../materials';
import { kidSimpleBox, kidSphere } from '../geometry';
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

  // Character is built out of flat-sided cubes in the Robloxian style —
  // the inverted-hull outline gives every piece a soft silhouette for
  // free, so RoundedBox bevels were invisible AND expensive. Every body
  // part below is a 24-vert cached BoxGeometry, shared across every
  // character in the scene.

  const torso = new THREE.Mesh(
    kidSimpleBox({ width: 0.95, height: 1.15, depth: 0.5 }),
    toonMaterial({ color: shirt }),
  );
  torso.position.y = 1.2;
  torso.castShadow = true; torso.receiveShadow = true;
  body.add(torso);

  // Legs + shoes
  for (const side of [-1, 1]) {
    const leg = new THREE.Mesh(
      kidSimpleBox({ width: 0.4, height: 0.95, depth: 0.4 }),
      toonMaterial({ color: pants }),
    );
    leg.position.set(side * 0.23, 0.48, 0);
    leg.castShadow = true;
    body.add(leg);

    const shoe = new THREE.Mesh(
      kidSimpleBox({ width: 0.44, height: 0.14, depth: 0.5 }),
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
      kidSimpleBox({ width: 0.32, height: 1.0, depth: 0.32 }),
      toonMaterial({ color: shirt }),
    );
    arm.position.y = -0.45;
    arm.castShadow = true;
    pivot.add(arm);

    // Hands stay spherical (detail=0 = 10×8 ≈ 99v, cached across both
    // hands and across every character). The sphere shape matters here —
    // a cube hand looks weirdly prosthetic next to the sphere blush.
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
    kidSimpleBox({ width: 0.78, height: 0.78, depth: 0.62 }),
    toonMaterial({ color: skin }),
  );
  head.castShadow = true; head.receiveShadow = true;
  headGroup.add(head);

  const hairCap = new THREE.Mesh(
    kidSimpleBox({ width: 0.82, height: 0.34, depth: 0.66 }),
    toonMaterial({ color: hair }),
  );
  hairCap.position.y = 0.3;
  hairCap.castShadow = true;
  headGroup.add(hairCap);

  const fringe = new THREE.Mesh(
    kidSimpleBox({ width: 0.82, height: 0.18, depth: 0.3 }),
    toonMaterial({ color: hair }),
  );
  fringe.position.set(0, 0.22, 0.22);
  headGroup.add(fringe);

  // Eyes — tiny flat-sided boxes pressed onto the front face. At this
  // scale (9cm × 16cm × 4cm) the bevel wasn't visible anyway, and the
  // outline gives them a rounded silhouette for free.
  const faceZ = 0.32;
  for (const x of [-0.18, 0.18]) {
    const eye = new THREE.Mesh(
      kidSimpleBox({ width: 0.09, height: 0.16, depth: 0.04 }),
      toonMaterial({ color: PALETTE.face }),
    );
    eye.position.set(x, 0.02, faceZ);
    headGroup.add(eye);
  }

  // Smile — tiny flat mouth bar. The prior half-torus was 153 verts per
  // character; a thin cube is 24, cached across every character, and
  // reads as a Roblox-style line mouth at studio orbit distance.
  const smile = new THREE.Mesh(
    kidSimpleBox({ width: 0.22, height: 0.04, depth: 0.02 }),
    toonMaterial({ color: PALETTE.face }),
  );
  smile.position.set(0, -0.18, faceZ);
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
