/**
 * Roblox-style play-mode controller for the Playdemy studio.
 *
 * Spawns a capsule character into the existing BuildingCanvas scene and
 * handles WASD + jump with AABB collision against floors, walls, and parts.
 *
 * Camera model: there is no custom camera. OrbitControls stays enabled and
 * its pivot is glued to the character — each frame we translate both the
 * orbit target and the camera position by the character's delta, preserving
 * whatever pose the user has orbited to. That gives the Roblox feel where
 * the camera orbits around the character and the student can look top-down,
 * behind-the-shoulder, or anywhere in between by just dragging the mouse.
 *
 * On start() we snap to a reasonable behind-and-above starting pose; on
 * stop() we restore the exact editor camera the student had before Play.
 */
import * as THREE from 'three';
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { buildAvatar, type Avatar } from './character';

export interface PlaySceneRefs {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  partGroup: THREE.Group;
  floorGroup: THREE.Group;
  wallGroup: THREE.Group;
}

export interface PlayController {
  start(): void;
  stop(): void;
  update(dt: number): void;
  isActive(): boolean;
}

const CAP_RADIUS = 0.45;
const LIMB_SWING = 0.75;    // radians — peak leg swing at full speed
const ARM_SWING = 0.55;
const MOVE_SPEED = 14;
const ROTATE_SPEED = 14;    // rad/sec character turns toward desired facing
const JUMP_SPEED = 13;
const GRAVITY_UP = -38;     // weaker gravity on the way up = hangtime
const GRAVITY_DOWN = -68;   // harder fall gives the classic platformer feel
const TERMINAL_VEL = -60;
const COYOTE_TIME = 0.12;   // can still jump for this long after walking off a ledge
const JUMP_BUFFER = 0.15;   // queue a Space press if it lands just before grounding
const STEP_HEIGHT = 0.45;   // auto-step onto obstacles up to this tall
const BOB_SPEED = 11;
const BOB_AMP = 0.08;

// Starting camera offset from the character on Play. Behind (+Z), above (+Y),
// roughly matching Roblox's default third-person pose.
const START_CAM_OFFSET = new THREE.Vector3(0, 6, 10);

export function createPlayController(refs: PlaySceneRefs): PlayController {
  let active = false;
  let avatar: Avatar | null = null;
  // Convenience aliases, refreshed each start() — kept non-null for TS ergonomics.
  let character: THREE.Group | null = null;
  let torso: THREE.Mesh | null = null;
  let head: THREE.Mesh | null = null;
  let armL: THREE.Group | null = null;
  let armR: THREE.Group | null = null;
  let legL: THREE.Group | null = null;
  let legR: THREE.Group | null = null;
  // Capsule height and body-part rest Y values — populated from the avatar on
  // start() so the same controller works for both Roblox and Minecraft styles.
  let capHeight = 1.8;
  let torsoRestY = 1.35;
  let headRestY = 2.05;
  const velocity = new THREE.Vector3();
  const keys: Record<string, boolean> = {};
  let grounded = false;
  let coyoteTimer = 0;   // counts up while airborne; jump OK if < COYOTE_TIME
  let jumpBuffer = 0;    // counts down after Space press; auto-jump on landing
  let bobPhase = 0;      // radians; drives walking head/body bob
  let renderedYaw = 0;   // smoothed rotation actually applied to the mesh

  // Saved editor camera state so we can restore the pre-play view on stop()
  const savedCamPos = new THREE.Vector3();
  const savedTarget = new THREE.Vector3();

  // Previous orbit pivot (character center) — each frame we translate both
  // the camera and the orbit target by (newPivot - prevPivot) so the user's
  // orbit pose is preserved while the character stays centered.
  const prevPivot = new THREE.Vector3();
  const newPivot = new THREE.Vector3();
  const pivotDelta = new THREE.Vector3();

  // Temp vars reused every frame to avoid GC pressure
  const tmpBox = new THREE.Box3();
  const playerBox = new THREE.Box3();
  const tmpCenter = new THREE.Vector3();
  const tmpSize = new THREE.Vector3();
  const camForward = new THREE.Vector3();
  const camRight = new THREE.Vector3();

  function onKeyDown(e: KeyboardEvent) {
    const wasDown = keys[e.code];
    keys[e.code] = true;
    if (e.code === 'Space') {
      e.preventDefault();
      if (!wasDown) jumpBuffer = JUMP_BUFFER; // fresh press → buffer it
    }
  }
  function onKeyUp(e: KeyboardEvent) {
    keys[e.code] = false;
  }

  function resolveCollisions() {
    if (!character) return;
    grounded = false;

    // Ground plane at y=0
    if (character.position.y < 0) {
      character.position.y = 0;
      if (velocity.y < 0) velocity.y = 0;
      grounded = true;
    }

    // Rebuild player AABB
    tmpCenter.set(
      character.position.x,
      character.position.y + capHeight / 2,
      character.position.z,
    );
    tmpSize.set(CAP_RADIUS * 2, capHeight, CAP_RADIUS * 2);
    playerBox.setFromCenterAndSize(tmpCenter, tmpSize);

    const roots: THREE.Object3D[] = [refs.partGroup, refs.floorGroup, refs.wallGroup];
    for (const root of roots) {
      for (const obj of root.children) {
        // Obj is usually a mesh or a group containing one mesh
        tmpBox.setFromObject(obj);
        if (tmpBox.isEmpty() || !tmpBox.intersectsBox(playerBox)) continue;

        // Shallowest-axis push-out
        const dxL = playerBox.max.x - tmpBox.min.x;
        const dxR = tmpBox.max.x - playerBox.min.x;
        const dyB = playerBox.max.y - tmpBox.min.y;
        const dyT = tmpBox.max.y - playerBox.min.y;
        const dzN = playerBox.max.z - tmpBox.min.z;
        const dzF = tmpBox.max.z - playerBox.min.z;
        const dx = Math.min(dxL, dxR);
        const dy = Math.min(dyB, dyT);
        const dz = Math.min(dzN, dzF);
        const m = Math.min(dx, dy, dz);

        if (m === dy) {
          // Vertical resolve: either standing on top or bonking head
          if (dyT < dyB) {
            // Player came down onto box top
            character.position.y = tmpBox.max.y;
            if (velocity.y < 0) velocity.y = 0;
            grounded = true;
          } else {
            // Player jumped into bottom of box
            character.position.y = tmpBox.min.y - capHeight;
            if (velocity.y > 0) velocity.y = 0;
          }
        } else if (m === dx) {
          if (dxR < dxL) character.position.x += dxR;
          else character.position.x -= dxL;
          velocity.x = 0;
        } else {
          if (dzF < dzN) character.position.z += dzF;
          else character.position.z -= dzN;
          velocity.z = 0;
        }

        // Refresh player AABB for subsequent collisions this frame
        tmpCenter.set(
          character.position.x,
          character.position.y + capHeight / 2,
          character.position.z,
        );
        playerBox.setFromCenterAndSize(tmpCenter, tmpSize);
      }
    }
  }

  function pivotFromCharacter(out: THREE.Vector3) {
    if (!character) return out.set(0, 0, 0);
    return out.set(
      character.position.x,
      character.position.y + capHeight * 0.5,
      character.position.z,
    );
  }

  return {
    isActive: () => active,

    start() {
      if (active) return;
      active = true;

      // Default to Minecraft style; toggle with ?avatar=roblox in the URL.
      const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const style = params?.get('avatar') === 'roblox' ? 'roblox' : 'minecraft';
      avatar = buildAvatar({ style });
      character = avatar.group;
      torso = avatar.torso;
      head = avatar.head;
      armL = avatar.armL;
      armR = avatar.armR;
      legL = avatar.legL;
      legR = avatar.legR;
      capHeight = avatar.capHeight;
      torsoRestY = avatar.torsoRestY;
      headRestY = avatar.headRestY;
      character.position.set(0, 0.1, 8);
      refs.scene.add(character);
      velocity.set(0, 0, 0);
      grounded = true;
      coyoteTimer = 0;
      jumpBuffer = 0;
      bobPhase = 0;
      renderedYaw = Math.PI; // face away from the starting camera
      if (armL) armL.rotation.x = 0;
      if (armR) armR.rotation.x = 0;
      if (legL) legL.rotation.x = 0;
      if (legR) legR.rotation.x = 0;

      // Remember where the editor camera was, so stop() can put it back.
      savedCamPos.copy(refs.camera.position);
      savedTarget.copy(refs.controls.target);

      // Snap to a Roblox-style behind-and-above third-person pose.
      pivotFromCharacter(newPivot);
      refs.controls.target.copy(newPivot);
      refs.camera.position.set(
        newPivot.x + START_CAM_OFFSET.x,
        newPivot.y + START_CAM_OFFSET.y,
        newPivot.z + START_CAM_OFFSET.z,
      );
      refs.controls.update();
      prevPivot.copy(newPivot);

      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);
    },

    stop() {
      if (!active) return;
      active = false;

      if (avatar) {
        refs.scene.remove(avatar.group);
        avatar.dispose();
      }
      avatar = null;
      character = null;
      torso = null;
      head = null;
      armL = armR = legL = legR = null;

      // Return the editor to its pre-play view.
      refs.camera.position.copy(savedCamPos);
      refs.controls.target.copy(savedTarget);
      refs.controls.update();

      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      for (const k of Object.keys(keys)) keys[k] = false;
    },

    update(dt: number) {
      if (!active || !character) return;
      const step = Math.min(dt, 1 / 30); // clamp large frames so we don't tunnel

      // Camera-relative WASD. Forward is the flattened vector from the
      // camera to the orbit target; right is forward rotated 90° clockwise
      // around Y. This means whichever angle the user has orbited to, W
      // always pushes the character in the direction they're looking.
      camForward.subVectors(refs.controls.target, refs.camera.position);
      camForward.y = 0;
      if (camForward.lengthSq() < 1e-6) camForward.set(0, 0, -1);
      camForward.normalize();
      camRight.set(-camForward.z, 0, camForward.x);

      const fwd = (keys['KeyW'] ? 1 : 0) - (keys['KeyS'] ? 1 : 0);
      const str = (keys['KeyD'] ? 1 : 0) - (keys['KeyA'] ? 1 : 0);
      let wishX = fwd * camForward.x + str * camRight.x;
      let wishZ = fwd * camForward.z + str * camRight.z;
      const wishLen = Math.hypot(wishX, wishZ);
      if (wishLen > 0) {
        wishX = (wishX / wishLen) * MOVE_SPEED;
        wishZ = (wishZ / wishLen) * MOVE_SPEED;
      }

      // Snap velocity directly to wish — no accel/decel, so the character
      // starts and stops instantly on key press/release (no ice slide).
      const inputActive = wishLen > 0;
      velocity.x = wishX;
      velocity.z = wishZ;

      // Coyote time + jump buffering → forgiving jumps
      if (grounded) coyoteTimer = 0;
      else coyoteTimer += step;
      if (jumpBuffer > 0) jumpBuffer -= step;

      const canJump = grounded || coyoteTimer < COYOTE_TIME;
      if (jumpBuffer > 0 && canJump) {
        velocity.y = JUMP_SPEED;
        grounded = false;
        coyoteTimer = COYOTE_TIME; // consumed — prevents double-jump this frame
        jumpBuffer = 0;
      }

      // Variable gravity — weaker on the way up, harder on the way down.
      // Holding Space while rising keeps the lower gravity for extra hangtime.
      const g = velocity.y > 0 && keys['Space'] ? GRAVITY_UP : GRAVITY_DOWN;
      velocity.y += g * step;
      if (velocity.y < TERMINAL_VEL) velocity.y = TERMINAL_VEL;

      // Advance position axis-by-axis so collision resolution can reason
      // about each axis independently (enables step-up below).
      character.position.x += velocity.x * step;
      character.position.z += velocity.z * step;
      character.position.y += velocity.y * step;

      // Save pre-resolve horizontal position so we can detect "blocked by a
      // low obstacle" and auto-step up onto it.
      const preX = character.position.x;
      const preZ = character.position.z;

      resolveCollisions();

      // Step-up: if we got pushed back on X or Z but there's a surface
      // within STEP_HEIGHT of our feet we could have climbed, snap onto it.
      if (inputActive) {
        const pushedX = Math.abs(character.position.x - preX) > 1e-4;
        const pushedZ = Math.abs(character.position.z - preZ) > 1e-4;
        if (pushedX || pushedZ) {
          // Re-probe for the tallest top we touch within step range
          tmpCenter.set(
            preX,
            character.position.y + capHeight / 2,
            preZ,
          );
          tmpSize.set(CAP_RADIUS * 2, capHeight, CAP_RADIUS * 2);
          const probeBox = new THREE.Box3().setFromCenterAndSize(tmpCenter, tmpSize);
          let bestTop = -Infinity;
          for (const root of [refs.partGroup, refs.floorGroup, refs.wallGroup]) {
            for (const obj of root.children) {
              tmpBox.setFromObject(obj);
              if (tmpBox.isEmpty() || !tmpBox.intersectsBox(probeBox)) continue;
              if (tmpBox.max.y > bestTop) bestTop = tmpBox.max.y;
            }
          }
          if (bestTop > character.position.y && bestTop - character.position.y <= STEP_HEIGHT) {
            character.position.x = preX;
            character.position.z = preZ;
            character.position.y = bestTop;
            if (velocity.y < 0) velocity.y = 0;
            grounded = true;
            resolveCollisions();
          }
        }
      }

      // Fell out of world (safety net in case a student deletes the ground)
      if (character.position.y < -20) {
        character.position.set(0, 0.1, 8);
        velocity.set(0, 0, 0);
      }

      // Rotate mesh smoothly toward the direction of motion. When idle,
      // hold the last facing — the camera can freely orbit around without
      // dragging the character's spin along with it.
      let targetYaw = renderedYaw;
      if (inputActive) targetYaw = Math.atan2(wishX, wishZ);
      let diff = targetYaw - renderedYaw;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      const rotK = Math.min(1, ROTATE_SPEED * step);
      renderedYaw += diff * rotK;
      character.rotation.y = renderedYaw;

      // Walk cycle — swing legs/arms from their pivot groups and bob torso+head
      const speed = Math.hypot(velocity.x, velocity.z);
      const onGround = grounded && velocity.y <= 0.1;
      const moving = speed > 0.5 && onGround;
      const speedRatio = Math.min(1, speed / MOVE_SPEED);
      if (moving) bobPhase += step * BOB_SPEED * speedRatio;

      const swingTarget = moving ? Math.sin(bobPhase) * speedRatio : 0;
      const limbK = Math.min(1, step * 14); // how fast limb rotation eases to target
      if (legL) legL.rotation.x += (swingTarget * LIMB_SWING - legL.rotation.x) * limbK;
      if (legR) legR.rotation.x += (-swingTarget * LIMB_SWING - legR.rotation.x) * limbK;
      if (armL) armL.rotation.x += (-swingTarget * ARM_SWING - armL.rotation.x) * limbK;
      if (armR) armR.rotation.x += (swingTarget * ARM_SWING - armR.rotation.x) * limbK;

      // Jumping / falling pose — raise arms slightly, tuck legs a bit
      if (!onGround) {
        const airTarget = velocity.y > 0 ? -0.6 : 0.3;
        if (armL) armL.rotation.x += (airTarget - armL.rotation.x) * limbK;
        if (armR) armR.rotation.x += (airTarget - armR.rotation.x) * limbK;
        const legAir = velocity.y > 0 ? -0.25 : 0.15;
        if (legL) legL.rotation.x += (legAir - legL.rotation.x) * limbK;
        if (legR) legR.rotation.x += (legAir - legR.rotation.x) * limbK;
      }

      // Subtle torso + head bob synced to foot-plants
      const bobY = moving ? Math.abs(Math.sin(bobPhase)) * BOB_AMP * speedRatio * 0.6 : 0;
      if (torso) torso.position.y = torsoRestY + bobY;
      if (head) head.position.y = headRestY + bobY * 0.85;

      // Roblox-style orbit follow: translate BOTH the orbit target and the
      // camera by the character's delta this frame. OrbitControls treats the
      // target as its pivot, so keeping it centered on the character means
      // the student's right-drag / two-finger swipe orbits around the player,
      // and pinch-zoom dollies toward the player — exactly the Roblox feel.
      // We deliberately don't touch the camera's angle here — the user owns it.
      pivotFromCharacter(newPivot);
      pivotDelta.subVectors(newPivot, prevPivot);
      if (pivotDelta.lengthSq() > 0) {
        refs.camera.position.add(pivotDelta);
        refs.controls.target.add(pivotDelta);
      }
      prevPivot.copy(newPivot);
      refs.controls.update();
    },
  };
}
