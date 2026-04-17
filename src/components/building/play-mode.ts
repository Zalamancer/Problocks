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
const CAP_HEIGHT = 1.8;     // body height used for AABB collision (feet → top of torso)
const HEAD_OFFSET = 0.3;    // head center offset above CAP_HEIGHT
// Roblox-R6-ish blocky character proportions — everything below sums to CAP_HEIGHT
const LEG_HEIGHT = 0.85;
const LEG_WIDTH = 0.42;
const LEG_DEPTH = 0.5;
const HIP_SPACING = 0.22;   // half-distance between the two legs (centers)
const TORSO_HEIGHT = 0.95;
const TORSO_WIDTH = 1.0;
const TORSO_DEPTH = 0.5;
const HEAD_SIZE = 0.55;
const ARM_LENGTH = 0.9;
const ARM_THICKNESS = 0.32;
const ARM_DEPTH = 0.4;
const SHOULDER_Y = LEG_HEIGHT + TORSO_HEIGHT - 0.12;   // pivot for arm swing
const SHOULDER_X = TORSO_WIDTH / 2 + ARM_THICKNESS / 2 - 0.02; // tucked just outside torso
const LIMB_SWING = 0.75;    // radians — peak leg swing at full speed
const ARM_SWING = 0.55;
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
const CAM_SHOULDER = 0;     // 0 = centered; positive = over-the-right-shoulder
const CAM_FOLLOW_RATE = 14; // exponential smoothing rate for camera position (higher = snappier)
const LOOK_FOLLOW_RATE = 18; // exponential smoothing rate for look-at point
const CAM_MIN_DIST = 1.2;   // pull-in floor when occluded so we never end up inside the head
const CAM_MIN_GROUND = 0.4; // minimum clearance above ground (prevents floor clipping)
const CAM_COLLIDE_PAD = 0.25; // shrink raycast hit by this so cam doesn't kiss the wall
const BOB_SPEED = 11;
const BOB_AMP = 0.08;
const LOOK_SENS = 0.0022;

export function createPlayController(refs: PlaySceneRefs): PlayController {
  let active = false;
  let character: THREE.Group | null = null;
  let torso: THREE.Mesh | null = null;
  let head: THREE.Mesh | null = null;
  // Pivot groups — rotating these swings the limb from shoulder / hip
  let armL: THREE.Group | null = null;
  let armR: THREE.Group | null = null;
  let legL: THREE.Group | null = null;
  let legR: THREE.Group | null = null;
  const velocity = new THREE.Vector3();
  const keys: Record<string, boolean> = {};
  let yaw = 0;
  // Convention: pitch > 0 → camera ABOVE the target (looking down).
  //             pitch < 0 → camera BELOW the target (looking up).
  // Camera offset from target in spherical coords:
  //   offset = (sin yaw * cos pitch, sin pitch, cos yaw * cos pitch) * CAM_DIST
  // At yaw=0, pitch=0 → offset=(0,0,+dist) i.e. camera directly BEHIND the
  // character on +Z, looking toward -Z at the target. W sends the character
  // in (-sin yaw, -cos yaw) ground direction, i.e. away from the camera.
  let pitch = 0.22;
  let grounded = false;
  let coyoteTimer = 0;   // counts up while airborne; jump OK if < COYOTE_TIME
  let jumpBuffer = 0;    // counts down after Space press; auto-jump on landing
  let bobPhase = 0;      // radians; drives walking head/body bob
  let renderedYaw = 0;   // smoothed rotation actually applied to the mesh
  const camDesired = new THREE.Vector3();
  const camSmooth = new THREE.Vector3();
  const lookAtSmooth = new THREE.Vector3();
  const lookAtTarget = new THREE.Vector3();
  let camInitialized = false; // explicit so we don't snap if camera drifts to origin
  const savedCamPos = new THREE.Vector3();
  const savedTarget = new THREE.Vector3();
  let savedControlsEnabled = true;
  // Reused for camera occlusion ray
  const camRay = new THREE.Raycaster();
  const camRayDir = new THREE.Vector3();
  const camRayOrigin = new THREE.Vector3();

  // Temp vars reused every frame to avoid GC pressure
  const tmpBox = new THREE.Box3();
  const playerBox = new THREE.Box3();
  const tmpCenter = new THREE.Vector3();
  const tmpSize = new THREE.Vector3();

  function buildCharacter(): THREE.Group {
    const g = new THREE.Group();
    g.name = 'play-character';

    const skin = new THREE.MeshStandardMaterial({ color: 0xf0c090, roughness: 0.8 });
    const shirt = new THREE.MeshStandardMaterial({ color: 0x3a7be2, roughness: 0.6 });
    const pants = new THREE.MeshStandardMaterial({ color: 0x2a4158, roughness: 0.85 });
    const shoes = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 1.0 });

    // Torso (shirt)
    torso = new THREE.Mesh(
      new THREE.BoxGeometry(TORSO_WIDTH, TORSO_HEIGHT, TORSO_DEPTH),
      shirt,
    );
    torso.position.y = LEG_HEIGHT + TORSO_HEIGHT / 2;
    torso.castShadow = true;
    g.add(torso);

    // Head (skin) — eyes + mouth are children so they bob with the head
    head = new THREE.Mesh(new THREE.BoxGeometry(HEAD_SIZE, HEAD_SIZE, HEAD_SIZE), skin);
    head.position.y = CAP_HEIGHT + HEAD_OFFSET;
    head.castShadow = true;
    g.add(head);

    const faceMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), faceMat);
    const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), faceMat);
    eyeL.position.set(-0.14, 0.05, HEAD_SIZE / 2 + 0.001);
    eyeR.position.set(0.14, 0.05, HEAD_SIZE / 2 + 0.001);
    const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.04, 0.02), faceMat);
    mouth.position.set(0, -0.1, HEAD_SIZE / 2 + 0.001);
    head.add(eyeL, eyeR, mouth);

    // Arms — each lives inside a pivot group at the shoulder so rotating the
    // group swings the arm. Mesh origin is offset down by half the arm length
    // so the arm hangs below the shoulder at rest.
    const armGeom = new THREE.BoxGeometry(ARM_THICKNESS, ARM_LENGTH, ARM_DEPTH);
    const armMeshL = new THREE.Mesh(armGeom, skin);
    armMeshL.position.y = -ARM_LENGTH / 2;
    armMeshL.castShadow = true;
    armL = new THREE.Group();
    armL.position.set(-SHOULDER_X, SHOULDER_Y, 0);
    armL.add(armMeshL);
    g.add(armL);

    const armMeshR = new THREE.Mesh(armGeom.clone(), skin);
    armMeshR.position.y = -ARM_LENGTH / 2;
    armMeshR.castShadow = true;
    armR = new THREE.Group();
    armR.position.set(SHOULDER_X, SHOULDER_Y, 0);
    armR.add(armMeshR);
    g.add(armR);

    // Legs — pants body + tiny shoe block at the foot.
    function makeLeg(sign: number): THREE.Group {
      const pivot = new THREE.Group();
      pivot.position.set(sign * HIP_SPACING, LEG_HEIGHT, 0);
      const legMesh = new THREE.Mesh(
        new THREE.BoxGeometry(LEG_WIDTH, LEG_HEIGHT, LEG_DEPTH),
        pants,
      );
      legMesh.position.y = -LEG_HEIGHT / 2;
      legMesh.castShadow = true;
      pivot.add(legMesh);
      const shoe = new THREE.Mesh(
        new THREE.BoxGeometry(LEG_WIDTH + 0.02, 0.12, LEG_DEPTH + 0.1),
        shoes,
      );
      shoe.position.set(0, -LEG_HEIGHT + 0.06, 0.04);
      shoe.castShadow = true;
      pivot.add(shoe);
      return pivot;
    }
    legL = makeLeg(-1);
    legR = makeLeg(1);
    g.add(legL, legR);

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
    // Mouse down (movementY > 0) → look down more → camera rises → pitch UP.
    pitch = Math.max(-1.1, Math.min(1.2, pitch + e.movementY * LOOK_SENS));
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
      // Spawn facing away from the camera (yaw + π at yaw=0 → facing -Z,
      // which is where W will send the character — no 180° spin on first input)
      renderedYaw = Math.PI;
      camSmooth.set(0, 0, 0);
      lookAtSmooth.set(0, 0, 0);
      camInitialized = false;
      if (armL) armL.rotation.x = 0;
      if (armR) armR.rotation.x = 0;
      if (legL) legL.rotation.x = 0;
      if (legR) legR.rotation.x = 0;

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
      torso = null;
      head = null;
      armL = armR = legL = legR = null;

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

      // Rotate mesh smoothly toward desired facing. While moving, face the
      // direction of motion. While idle, face the same way the camera is
      // looking (yaw + π) so the character's back stays toward the camera
      // — NOT its face, which is what happens if you use yaw directly.
      let targetYaw = renderedYaw;
      if (inputActive) targetYaw = Math.atan2(wishX, wishZ);
      else targetYaw = yaw + Math.PI;
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

      // Subtle torso + head bob synced to foot-plants, half amplitude vs before
      const bobY = moving ? Math.abs(Math.sin(bobPhase)) * BOB_AMP * speedRatio * 0.6 : 0;
      if (torso) torso.position.y = LEG_HEIGHT + TORSO_HEIGHT / 2 + bobY;
      if (head) head.position.y = CAP_HEIGHT + HEAD_OFFSET + bobY * 0.85;

      // Third-person camera — smoothed toward a position BEHIND the character.
      // Camera forward vector (where the camera looks) is:
      //   forward = (-sin(yaw)*cos(pitch),  sin(pitch), -cos(yaw)*cos(pitch))
      // Camera position = head target − forward * CAM_DIST, so flipping the
      // sign on X/Z puts the camera behind (opposite of the forward direction)
      // and subtracting sin(pitch) raises the camera when looking down.
      const headY = character.position.y + CAP_HEIGHT + HEAD_OFFSET;
      const cp = Math.cos(pitch);
      const sp = Math.sin(pitch);
      const backX = sy * cp;   // behind-character unit vector on X
      const backZ = cy * cp;   // behind-character unit vector on Z
      const rightX = cy;       // camera's right on the ground plane
      const rightZ = -sy;

      // Pivot point the camera orbits — the smoothed head target. Using the
      // smoothed look-at (computed below) as the pivot means head-bob/jump
      // jitter never reaches the camera distance computation.
      camRayOrigin.set(character.position.x, headY, character.position.z);

      // Desired offset from pivot at full distance
      const offX = backX * CAM_DIST + rightX * CAM_SHOULDER;
      const offY = -sp * CAM_DIST + 0.2;
      const offZ = backZ * CAM_DIST + rightZ * CAM_SHOULDER;
      let dist = Math.hypot(offX, offY, offZ);

      // Camera occlusion — cast from pivot toward desired cam position and
      // pull in if anything (parts/floors/walls) blocks line of sight.
      camRayDir.set(offX, offY, offZ).normalize();
      camRay.set(camRayOrigin, camRayDir);
      camRay.far = dist;
      const hits = camRay.intersectObjects(
        [refs.partGroup, refs.floorGroup, refs.wallGroup],
        true,
      );
      if (hits.length > 0) {
        dist = Math.max(CAM_MIN_DIST, hits[0].distance - CAM_COLLIDE_PAD);
      }

      camDesired.set(
        camRayOrigin.x + camRayDir.x * dist,
        camRayOrigin.y + camRayDir.y * dist,
        camRayOrigin.z + camRayDir.z * dist,
      );
      // Never let the camera dip below ground clearance
      if (camDesired.y < CAM_MIN_GROUND) camDesired.y = CAM_MIN_GROUND;

      // Frame-rate-independent exponential smoothing (asymptotic, never overshoots)
      const camK = 1 - Math.exp(-CAM_FOLLOW_RATE * step);
      const lookK = 1 - Math.exp(-LOOK_FOLLOW_RATE * step);

      if (!camInitialized) {
        camSmooth.copy(camDesired);
        lookAtSmooth.copy(camRayOrigin);
        camInitialized = true;
      } else {
        camSmooth.lerp(camDesired, camK);
        lookAtTarget.copy(camRayOrigin);
        lookAtSmooth.lerp(lookAtTarget, lookK);
      }
      refs.camera.position.copy(camSmooth);
      refs.camera.lookAt(lookAtSmooth);
    },
  };
}
