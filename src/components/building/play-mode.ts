/**
 * Roblox-style play-mode controller for the Problocks studio.
 *
 * Spawns a capsule character into the existing BuildingCanvas scene,
 * hijacks the camera for a third-person follow, and handles WASD + jump
 * with AABB collision against floors, walls, and parts. The OrbitControls
 * camera/target is captured on start() and restored on stop() so the
 * student returns to exactly the editor view they left.
 *
 * This is intentionally minimal — no animation, no ragdoll, no networking,
 * no scripted behavior on parts. Just "I built a thing, let me walk around
 * in it" like Roblox Studio's Play Solo.
 */
import * as THREE from 'three';
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js';

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
const CAP_HEIGHT = 1.8;     // total capsule height (feet at y=0 of the group)
const HEAD_OFFSET = 0.35;   // head above capsule top
const MOVE_SPEED = 9;
const ACCEL = 60;           // horizontal units/sec² ramp toward target velocity
const DECEL = 80;           // horizontal units/sec² ramp toward zero when idle
const ROTATE_SPEED = 14;    // rad/sec character turns toward desired facing
const JUMP_SPEED = 13;
const GRAVITY_UP = -38;     // weaker gravity on the way up = hangtime
const GRAVITY_DOWN = -68;   // harder fall gives the classic platformer feel
const TERMINAL_VEL = -60;
const COYOTE_TIME = 0.12;   // can still jump for this long after walking off a ledge
const JUMP_BUFFER = 0.15;   // queue a Space press if it lands just before grounding
const STEP_HEIGHT = 0.45;   // auto-step onto obstacles up to this tall
const CAM_DIST = 6;
const CAM_SHOULDER = 0.6;   // sideways shoulder offset like Roblox shift-lock
const CAM_LERP = 12;        // cam follow smoothness
const BOB_SPEED = 11;
const BOB_AMP = 0.08;
const LOOK_SENS = 0.0022;

export function createPlayController(refs: PlaySceneRefs): PlayController {
  let active = false;
  let character: THREE.Group | null = null;
  let body: THREE.Mesh | null = null; // reference kept so we can bob the torso
  let head: THREE.Mesh | null = null;
  const velocity = new THREE.Vector3();
  const keys: Record<string, boolean> = {};
  let yaw = 0;
  let pitch = -0.25;
  let grounded = false;
  let coyoteTimer = 0;   // counts up while airborne; jump OK if < COYOTE_TIME
  let jumpBuffer = 0;    // counts down after Space press; auto-jump on landing
  let bobPhase = 0;      // radians; drives walking head/body bob
  let renderedYaw = 0;   // smoothed rotation actually applied to the mesh
  const camDesired = new THREE.Vector3();
  const camSmooth = new THREE.Vector3();
  const lookAtSmooth = new THREE.Vector3();
  const savedCamPos = new THREE.Vector3();
  const savedTarget = new THREE.Vector3();
  let savedControlsEnabled = true;

  // Temp vars reused every frame to avoid GC pressure
  const tmpBox = new THREE.Box3();
  const playerBox = new THREE.Box3();
  const tmpCenter = new THREE.Vector3();
  const tmpSize = new THREE.Vector3();

  function buildCharacter(): THREE.Group {
    const g = new THREE.Group();
    g.name = 'play-character';
    const cyl = CAP_HEIGHT - CAP_RADIUS * 2;
    body = new THREE.Mesh(
      new THREE.CapsuleGeometry(CAP_RADIUS, cyl, 8, 16),
      new THREE.MeshStandardMaterial({ color: 0x3a7be2, roughness: 0.6 }),
    );
    body.position.y = CAP_HEIGHT / 2;
    body.castShadow = true;
    g.add(body);
    head = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.55, 0.55),
      new THREE.MeshStandardMaterial({ color: 0xf0c090, roughness: 0.8 }),
    );
    head.position.y = CAP_HEIGHT + HEAD_OFFSET;
    head.castShadow = true;
    g.add(head);
    // Eyes so the character has a readable "front"
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), eyeMat);
    const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), eyeMat);
    eyeL.position.set(-0.14, CAP_HEIGHT + HEAD_OFFSET + 0.05, 0.28);
    eyeR.position.set(0.14, CAP_HEIGHT + HEAD_OFFSET + 0.05, 0.28);
    g.add(eyeL, eyeR);
    return g;
  }

  function onKeyDown(e: KeyboardEvent) {
    const wasDown = keys[e.code];
    keys[e.code] = true;
    if (e.code === 'Space') {
      e.preventDefault();
      if (!wasDown) jumpBuffer = JUMP_BUFFER; // fresh press → buffer it
    }
    if (e.code === 'Escape') {
      // Let the Stop button own the transition — just unlock the pointer
      if (document.pointerLockElement) document.exitPointerLock();
    }
  }
  function onKeyUp(e: KeyboardEvent) {
    keys[e.code] = false;
  }
  function onMouseMove(e: MouseEvent) {
    if (document.pointerLockElement !== refs.renderer.domElement) return;
    yaw -= e.movementX * LOOK_SENS;
    pitch = Math.max(-1.2, Math.min(0.5, pitch - e.movementY * LOOK_SENS));
  }
  function onCanvasClick() {
    if (!active) return;
    if (document.pointerLockElement !== refs.renderer.domElement) {
      refs.renderer.domElement.requestPointerLock?.();
    }
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
      character.position.y + CAP_HEIGHT / 2,
      character.position.z,
    );
    tmpSize.set(CAP_RADIUS * 2, CAP_HEIGHT, CAP_RADIUS * 2);
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
            character.position.y = tmpBox.min.y - CAP_HEIGHT;
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
          character.position.y + CAP_HEIGHT / 2,
          character.position.z,
        );
        playerBox.setFromCenterAndSize(tmpCenter, tmpSize);
      }
    }
  }

  return {
    isActive: () => active,

    start() {
      if (active) return;
      active = true;

      character = buildCharacter();
      character.position.set(0, 0.1, 8);
      refs.scene.add(character);
      velocity.set(0, 0, 0);
      yaw = 0;
      pitch = -0.25;
      grounded = true;
      coyoteTimer = 0;
      jumpBuffer = 0;
      bobPhase = 0;
      renderedYaw = 0;
      camSmooth.set(0, 0, 0);
      lookAtSmooth.set(0, 0, 0);

      savedCamPos.copy(refs.camera.position);
      savedTarget.copy(refs.controls.target);
      savedControlsEnabled = refs.controls.enabled;
      refs.controls.enabled = false;

      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);
      window.addEventListener('mousemove', onMouseMove);
      refs.renderer.domElement.addEventListener('click', onCanvasClick);

      // Request pointer-lock — allowed because start() is called from the
      // Play button's click handler (same transient user activation).
      refs.renderer.domElement.requestPointerLock?.();
    },

    stop() {
      if (!active) return;
      active = false;

      if (character) {
        refs.scene.remove(character);
        character.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (!mesh.isMesh) return;
          mesh.geometry?.dispose();
          const mat = mesh.material as THREE.Material | THREE.Material[];
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else mat?.dispose();
        });
      }
      character = null;

      refs.controls.enabled = savedControlsEnabled;
      refs.camera.position.copy(savedCamPos);
      refs.controls.target.copy(savedTarget);
      refs.controls.update();

      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('mousemove', onMouseMove);
      refs.renderer.domElement.removeEventListener('click', onCanvasClick);
      if (document.pointerLockElement === refs.renderer.domElement) {
        document.exitPointerLock();
      }
      for (const k of Object.keys(keys)) keys[k] = false;
    },

    update(dt: number) {
      if (!active || !character) return;
      const step = Math.min(dt, 1 / 30); // clamp large frames so we don't tunnel

      // Yaw-aligned WASD → target horizontal velocity
      const fwd = (keys['KeyW'] ? 1 : 0) - (keys['KeyS'] ? 1 : 0);
      const str = (keys['KeyD'] ? 1 : 0) - (keys['KeyA'] ? 1 : 0);
      const sy = Math.sin(yaw);
      const cy = Math.cos(yaw);
      const fx = -sy, fz = -cy;      // camera forward on ground plane
      const rx = cy,  rz = -sy;      // camera right on ground plane
      let wishX = fwd * fx + str * rx;
      let wishZ = fwd * fz + str * rz;
      const wishLen = Math.hypot(wishX, wishZ);
      if (wishLen > 0) {
        wishX = (wishX / wishLen) * MOVE_SPEED;
        wishZ = (wishZ / wishLen) * MOVE_SPEED;
      }

      // Ease current velocity toward wish velocity — separate accel vs decel
      const inputActive = wishLen > 0;
      const rate = inputActive ? ACCEL : DECEL;
      const dvx = wishX - velocity.x;
      const dvz = wishZ - velocity.z;
      const maxStep = rate * step;
      const dvLen = Math.hypot(dvx, dvz);
      if (dvLen > 0) {
        const k = Math.min(1, maxStep / dvLen);
        velocity.x += dvx * k;
        velocity.z += dvz * k;
      }

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
            character.position.y + CAP_HEIGHT / 2,
            preZ,
          );
          tmpSize.set(CAP_RADIUS * 2, CAP_HEIGHT, CAP_RADIUS * 2);
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

      // Rotate mesh smoothly toward desired facing
      let targetYaw = renderedYaw;
      if (inputActive) targetYaw = Math.atan2(wishX, wishZ);
      else targetYaw = yaw;
      let diff = targetYaw - renderedYaw;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      const rotK = Math.min(1, ROTATE_SPEED * step);
      renderedYaw += diff * rotK;
      character.rotation.y = renderedYaw;

      // Subtle walk bob — only when actually moving on the ground
      const speed = Math.hypot(velocity.x, velocity.z);
      const moving = speed > 0.5 && grounded;
      if (moving) {
        bobPhase += step * BOB_SPEED * (speed / MOVE_SPEED);
      } else {
        // Ease bob back to rest so stopping doesn't snap
        bobPhase += (0 - (bobPhase % (Math.PI * 2))) * Math.min(1, step * 6);
      }
      const bobY = Math.sin(bobPhase) * BOB_AMP * (moving ? 1 : 0);
      if (body) body.position.y = CAP_HEIGHT / 2 + bobY;
      if (head) head.position.y = CAP_HEIGHT + HEAD_OFFSET + bobY * 0.8;

      // Third-person shoulder camera — smoothed toward the desired position
      const headY = character.position.y + CAP_HEIGHT + HEAD_OFFSET;
      const cp = Math.cos(pitch);
      const sp = Math.sin(pitch);
      // Desired eye position: back along camera forward, then offset to the
      // right by CAM_SHOULDER to give the Roblox over-the-shoulder framing.
      const backX = -sy * cp;
      const backZ = -cy * cp;
      const rightX = cy;
      const rightZ = -sy;
      camDesired.set(
        character.position.x + backX * CAM_DIST + rightX * CAM_SHOULDER,
        headY + sp * CAM_DIST + 1.0,
        character.position.z + backZ * CAM_DIST + rightZ * CAM_SHOULDER,
      );
      const camK = Math.min(1, CAM_LERP * step);
      if (camSmooth.lengthSq() === 0) camSmooth.copy(camDesired); // first frame
      camSmooth.lerp(camDesired, camK);
      refs.camera.position.copy(camSmooth);

      // Look at a smoothed head position so the view doesn't jitter while bobbing
      if (lookAtSmooth.lengthSq() === 0) {
        lookAtSmooth.set(character.position.x, headY, character.position.z);
      }
      lookAtSmooth.lerp(
        tmpCenter.set(character.position.x, headY, character.position.z),
        Math.min(1, 14 * step),
      );
      refs.camera.lookAt(lookAtSmooth);
    },
  };
}
