/**
 * Per-frame prefab animations — idle bob, head-follow-cursor, tree sway,
 * balloon float. Runs on named sub-groups inside each prefab (see the
 * builders for the name tags), so the animation pass is O(root.children)
 * each frame with no traversal into deep trees.
 *
 * This file deliberately keeps the list of per-kind animations small —
 * too much motion and the viewport feels frenetic; these are just the
 * four that the Adopt-Me reference actually uses and that a student
 * instantly recognises as "the scene is alive".
 */

import * as THREE from 'three';

export interface AnimationContext {
  /** Engine-local elapsed time, in seconds. */
  time: number;
  /** Pointer NDC (-1..1 on each axis), or null if not hovered. */
  pointer: THREE.Vector2 | null;
  /** Camera used for head-follow math. */
  camera: THREE.Camera;
}

const reusableVec3 = new THREE.Vector3();
const reusableMatrix = new THREE.Matrix4();
const reusableQuat = new THREE.Quaternion();
const UP = new THREE.Vector3(0, 1, 0);

export function animateRoot(root: THREE.Group, ctx: AnimationContext): void {
  for (const obj of root.children) {
    const kind = obj.userData.__sceneKind as string | undefined;
    if (!kind) continue;
    switch (kind) {
      case 'character': animateCharacter(obj, ctx); break;
      case 'tree-oak':  animateTree(obj, ctx, 0.015, 0); break;
      case 'tree-pine': animateTree(obj, ctx, 0.012, 1.3); break;
      case 'balloon':   animateBalloon(obj, ctx); break;
    }
  }
}

function animateCharacter(root: THREE.Object3D, ctx: AnimationContext): void {
  const body = root.getObjectByName('char-body');
  const head = root.getObjectByName('char-head');
  const armL = root.getObjectByName('char-arm-left');
  const armR = root.getObjectByName('char-arm-right');
  if (!body) return;

  // Idle bob with volume-preserving squash-stretch.
  const t = ctx.time;
  const phase = Math.sin(t * 1.8);
  const bob = Math.abs(phase) * 0.08;
  body.position.y = bob;
  const squash  = 1 - Math.max(0, -phase) * 0.05;
  const stretch = 1 + Math.max(0,  phase) * 0.03;
  const comp = 1 / Math.sqrt(squash * stretch);
  body.scale.set(comp * stretch, squash, comp * stretch);

  // Arms sway
  if (armL) {
    armL.rotation.x = Math.sin(t * 1.8 - 1) * 0.12;
    armL.rotation.z = -0.05;
  }
  if (armR) {
    armR.rotation.x = Math.sin(t * 1.8 + 1) * 0.12;
    armR.rotation.z = 0.05;
  }

  // Head follows the cursor (subtle). When the pointer isn't over the
  // canvas, head eases back to forward-facing instead of snapping.
  if (head) {
    if (ctx.pointer) {
      const target = ctx.pointer;
      // Build a world-space look-at direction and convert to the head's
      // parent space. This keeps the head tracking correct even if the
      // character itself was rotated.
      const worldPos = reusableVec3.setFromMatrixPosition(head.matrixWorld);
      const targetPoint = reusableVec3.clone().add(new THREE.Vector3(
        target.x * 4,
        worldPos.y + target.y * 1.5,
        worldPos.z + Math.abs(target.x) * 2 + 2,
      ));
      reusableMatrix.lookAt(worldPos, targetPoint, UP);
      reusableQuat.setFromRotationMatrix(reusableMatrix);
      // Convert world quaternion into head.parent local space.
      if (head.parent) {
        const inv = reusableMatrix.copy(head.parent.matrixWorld).invert();
        const localQuat = new THREE.Quaternion().setFromRotationMatrix(
          reusableMatrix.makeRotationFromQuaternion(reusableQuat).premultiply(inv),
        );
        head.quaternion.slerp(localQuat, 0.12);
      } else {
        head.quaternion.slerp(reusableQuat, 0.12);
      }
    } else {
      head.quaternion.slerp(new THREE.Quaternion(), 0.08);
    }
  }
}

function animateTree(root: THREE.Object3D, ctx: AnimationContext, amp: number, phaseOffset: number): void {
  // Gentle sway on the top-level group. Cheap — one sin per tree.
  root.rotation.z = Math.sin(ctx.time * 0.8 + phaseOffset) * amp;
}

function animateBalloon(root: THREE.Object3D, ctx: AnimationContext): void {
  // Float the whole balloon group up/down around its placed y-position.
  // Preserve the user's placed y by stashing it in userData on first run.
  const baseY = (root.userData.__animBaseY as number | undefined) ?? root.position.y;
  if (root.userData.__animBaseY == null) root.userData.__animBaseY = root.position.y;
  root.position.y = baseY + Math.sin(ctx.time * 1.2) * 0.08;
  root.rotation.z = Math.sin(ctx.time * 1.2) * 0.06;
}
