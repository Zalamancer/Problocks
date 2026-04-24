import * as THREE from 'three';
import { PALETTE, toonMaterial } from '../materials';
import { kidSimpleBox, kidSphere } from '../geometry';
import { addOutlinesToTree } from '../outlines';
import { getFaceTexture, type AvatarFace } from '../face-texture';
import type { BuildOptions } from './types';

type Hair = 'none' | 'short' | 'spike' | 'long';
type Hat  = 'none' | 'cap' | 'beanie' | 'tophat';
type Gender = 'boy' | 'girl';

/**
 * Robloxian character matching the student's avatar. Reads hair style /
 * hat / face / gender / colours from props so a single character prefab
 * renders as whatever outfit is saved in user-avatar-store.
 *
 *   color             → shirt colour (matches scene-schema's top-level `color`)
 *   props.skinColor   → face + hands + head
 *   props.pantsColor  → legs
 *   props.shoeColor   → shoes
 *   props.hair        → 'none' | 'short' | 'spike' | 'long'
 *   props.hairColor   → hair mesh colour
 *   props.hat         → 'none' | 'cap' | 'beanie' | 'tophat'
 *   props.hatColor    → hat mesh colour
 *   props.face        → 'smile' | 'happy' | 'cool' | 'wink' | 'neutral'
 *   props.gender      → 'boy' | 'girl' — controls torso width + arm spacing
 *
 * Body parts are kidSimpleBox (24v, cached) so a field of characters
 * shares one geometry per part on the GPU. Hands stay as small spheres
 * because a cube looks weirdly prosthetic next to the sphere blush.
 *
 * Face texture lives on the +Z face of the head only (multi-material
 * BoxGeometry: order +x, -x, +y, -y, +z, -z). Eyes + smile are baked
 * into the canvas so they read as one flat decal, not four separate
 * meshes.
 */
export function character({ color, props }: BuildOptions): THREE.Object3D {
  const g = new THREE.Group();
  g.userData.__kidCharacter = true;

  const shirt     = color                              ?? PALETTE.shirt;
  const pants     = (props?.pantsColor as string)      ?? PALETTE.pants;
  const skin      = (props?.skinColor  as string)      ?? PALETTE.skin;
  const hairColor = (props?.hairColor  as string)      ?? PALETTE.hair;
  const shoes     = (props?.shoeColor  as string)      ?? PALETTE.shoes;
  const hatColor  = (props?.hatColor   as string)      ?? '#c24949';
  const hairStyle: Hair = (props?.hair as Hair) ?? 'short';
  const hatStyle:  Hat  = (props?.hat  as Hat)  ?? 'none';
  const faceKind:  AvatarFace = (props?.face as AvatarFace) ?? 'smile';
  const gender:    Gender = (props?.gender as Gender) ?? 'boy';

  // Girl silhouette — narrower torso, shoulders pulled in. Head stays
  // identical so hair / hat / face placements don't need per-gender
  // branches.
  const TORSO_W = gender === 'girl' ? 0.82 : 0.95;
  const ARM_X   = gender === 'girl' ? 0.58 : 0.68;

  const body = new THREE.Group();
  body.name = 'char-body';
  g.add(body);

  const torso = new THREE.Mesh(
    kidSimpleBox({ width: TORSO_W, height: 1.15, depth: 0.5 }),
    toonMaterial({ color: shirt }),
  );
  torso.position.y = 1.2;
  torso.castShadow = true; torso.receiveShadow = true;
  body.add(torso);

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

  for (const side of [-1, 1]) {
    const pivot = new THREE.Group();
    pivot.name = side < 0 ? 'char-arm-left' : 'char-arm-right';
    pivot.userData.side = side;
    pivot.position.set(side * ARM_X, 1.7, 0);
    body.add(pivot);

    const arm = new THREE.Mesh(
      kidSimpleBox({ width: 0.32, height: 1.0, depth: 0.32 }),
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

  // Head is one multi-material cube. `+Z` face gets the face decal
  // painted on a transparent canvas; the other 5 faces are plain skin.
  // MeshToonMaterial with a map tints the map by the base colour, so
  // the decal's transparent background shows the skin tone behind eyes
  // and mouth — nothing else to sync.
  const HEAD_W = 0.78, HEAD_H = 0.78, HEAD_D = 0.62;
  const skinMat = toonMaterial({ color: skin });
  const faceMat = toonMaterial({ color: skin, map: getFaceTexture(faceKind) });
  const headMats: THREE.Material[] = [skinMat, skinMat, skinMat, skinMat, faceMat, skinMat];
  const head = new THREE.Mesh(kidSimpleBox({ width: HEAD_W, height: HEAD_H, depth: HEAD_D }), headMats);
  head.castShadow = true; head.receiveShadow = true;
  headGroup.add(head);

  // Hair — ported from RobloxAvatar's three silhouettes. Uses the same
  // box dimensions so the wardrobe preview and the freeform character
  // read as the exact same hairstyle.
  if (hairStyle !== 'none') {
    const hairMat = toonMaterial({ color: hairColor });
    if (hairStyle === 'short') {
      const top = new THREE.Mesh(
        kidSimpleBox({ width: 0.84, height: 0.2, depth: 0.66 }),
        hairMat,
      );
      top.position.y = HEAD_H / 2 + 0.1;
      top.castShadow = true;
      headGroup.add(top);
    } else if (hairStyle === 'spike') {
      const cap = new THREE.Mesh(
        kidSimpleBox({ width: 0.84, height: 0.17, depth: 0.66 }),
        hairMat,
      );
      cap.position.y = HEAD_H / 2 + 0.085;
      cap.castShadow = true;
      headGroup.add(cap);
      for (let i = 0; i < 4; i++) {
        const spike = new THREE.Mesh(
          kidSimpleBox({ width: 0.14, height: 0.24, depth: 0.14 }),
          hairMat,
        );
        spike.position.set(-0.27 + i * 0.18, HEAD_H / 2 + 0.3, 0.05);
        spike.rotation.z = (i % 2 === 0 ? 1 : -1) * 0.18;
        spike.castShadow = true;
        headGroup.add(spike);
      }
    } else if (hairStyle === 'long') {
      const top = new THREE.Mesh(
        kidSimpleBox({ width: 0.86, height: 0.24, depth: 0.68 }),
        hairMat,
      );
      top.position.y = HEAD_H / 2 + 0.12;
      top.castShadow = true;
      headGroup.add(top);
      const backDrop = new THREE.Mesh(
        kidSimpleBox({ width: 0.86, height: 0.66, depth: 0.14 }),
        hairMat,
      );
      backDrop.position.set(0, 0.05, -(HEAD_D / 2) - 0.04);
      backDrop.castShadow = true;
      headGroup.add(backDrop);
      for (const x of [-0.36, 0.36]) {
        const side = new THREE.Mesh(
          kidSimpleBox({ width: 0.14, height: 0.62, depth: 0.68 }),
          hairMat,
        );
        side.position.set(x, 0.05, 0);
        side.castShadow = true;
        headGroup.add(side);
      }
    }
  }

  // Hat — cap / beanie / tophat, cube-based like the wardrobe preview.
  if (hatStyle !== 'none') {
    const hatMat = toonMaterial({ color: hatColor });
    if (hatStyle === 'cap') {
      const crown = new THREE.Mesh(
        kidSimpleBox({ width: 0.86, height: 0.28, depth: 0.68 }),
        hatMat,
      );
      crown.position.y = HEAD_H / 2 + 0.22;
      crown.castShadow = true;
      headGroup.add(crown);
      const brim = new THREE.Mesh(
        kidSimpleBox({ width: 0.96, height: 0.06, depth: 0.48 }),
        hatMat,
      );
      brim.position.set(0, HEAD_H / 2 + 0.09, 0.34);
      brim.castShadow = true;
      headGroup.add(brim);
    } else if (hatStyle === 'beanie') {
      const crown = new THREE.Mesh(
        kidSimpleBox({ width: 0.86, height: 0.36, depth: 0.68 }),
        hatMat,
      );
      crown.position.y = HEAD_H / 2 + 0.26;
      crown.castShadow = true;
      headGroup.add(crown);
      const pom = new THREE.Mesh(
        kidSphere({ radius: 0.08, detail: 0 }),
        hatMat,
      );
      pom.position.y = HEAD_H / 2 + 0.52;
      pom.castShadow = true;
      headGroup.add(pom);
    } else if (hatStyle === 'tophat') {
      const brim = new THREE.Mesh(
        kidSimpleBox({ width: 1.04, height: 0.07, depth: 0.86 }),
        hatMat,
      );
      brim.position.y = HEAD_H / 2 + 0.06;
      brim.castShadow = true;
      headGroup.add(brim);
      const crown = new THREE.Mesh(
        kidSimpleBox({ width: 0.66, height: 0.6, depth: 0.5 }),
        hatMat,
      );
      crown.position.y = HEAD_H / 2 + 0.42;
      crown.castShadow = true;
      headGroup.add(crown);
    }
  }

  // Cheek blush — small sphere on each side of the face, below the eyes.
  // Kept as spheres (cached, 99v each) because cube blush reads as a
  // bandage.
  for (const side of [-1, 1]) {
    const blush = new THREE.Mesh(
      kidSphere({ radius: 0.08, detail: 0 }),
      toonMaterial({ color: PALETTE.flowerPink }),
    );
    blush.position.set(side * 0.28, 2.03, 0.31);
    blush.scale.set(1, 0.6, 0.15);
    headGroup.add(blush);
  }

  addOutlinesToTree(g);
  return g;
}
