/**
 * Play-mode controller — drives a character prefab with WASD/Space/Shift
 * and rigs the camera to follow (third-person) or attach to its head
 * (first-person pointer-lock). Built to be started/stopped cleanly so
 * the edit-mode engine (OrbitControls + gizmo) can resume unchanged.
 *
 * Deliberately simple for the first cut:
 *   - Ground-plane gravity, no collision with placed props
 *   - Fixed camera offset behind the character in third-person
 *   - Pointer-lock + standard FPS yaw/pitch in first-person
 *   - Mouse drag orbits the follow camera azimuth in third-person
 *
 * See FreeformView3D.tsx for the React-side lifecycle that hooks this
 * into the studio's global Play button.
 */

import * as THREE from 'three';
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export type CameraMode = 'third' | 'first' | 'topdown' | 'isometric';

interface Collider {
  box: THREE.Box3;
}

export interface PlayControllerOptions {
  camera: THREE.PerspectiveCamera;
  character: THREE.Object3D;
  domElement: HTMLElement;
  orbit: OrbitControls;
  mode: CameraMode;
  /** Root group containing every placed scene object. Used to collect
      colliders. The character itself is excluded. */
  root: THREE.Group;
  /** Play speed in world units per second. Sprint applies 1.6× with Shift. */
  speed?: number;
  /** Initial yaw (radians) — keeps the camera from snapping on start. */
  initialYaw?: number;
}

export interface PlayController {
  start: () => void;
  stop: () => void;
  dispose: () => void;
  update: (dt: number) => void;
  setMode: (m: CameraMode) => void;
  /** Apply a multiplier on top of the base walk speed. Used by the
      tycoon upgrade system — buying a "Sprint Boots" upgrade calls
      this with 2 to double both walk and sprint speeds. Defaults to
      1; setting it to 0 stops the character without removing the
      controller. */
  setSpeedMultiplier: (m: number) => void;
  /** Set approximate peak jump height in world units. Converts to
      an initial vertical velocity using the current gravity —
      v = sqrt(2 * g * h). Default jump reaches ~0.83 units. */
  setJumpHeight: (h: number) => void;
  /** Max chained jumps (ground + air). 1 = no double jump, 2 =
      double, etc. Capped at 5. */
  setMaxJumps: (n: number) => void;
}

const WALK = 5;
const SPRINT_MULT = 1.6;
const JUMP_V = 5;
const GRAVITY = -15;
// Top-down + isometric play camera tuning. Distances are in world
// units; camera follows the character XZ. Topdown is straight down,
// isometric is at the [1,1,1] corner of an orbit so the world reads
// 3/4-perspective.
const TOPDOWN_HEIGHT = 22;
const ISO_DIST = 16;
// Character builder puts eyes at +Z (face-forward = +Z world at rotation 0),
// so the camera needs to sit at -Z of the character to see its back. Y is
// raised ~3u for a Roblox-esque over-the-shoulder framing; dist 9u keeps
// the whole character + a bit of foreground visible with 42° FOV.
const THIRD_DIST = 9;
const THIRD_Y = 3.2;
const LOOK_Y_OFFSET = 1.6;
const FIRST_HEAD_Y = 1.9;
const MOUSE_YAW_SENS = 0.0035;
const MOUSE_PITCH_SENS = 0.0025;
// Character cylinder collider — r 0.45, height 2.0. Tuned to the
// builder's character proportions; a little forgiving so brushes-past-
// a-tree don't snag.
const CHAR_R = 0.45;
const CHAR_H = 2.0;
// How much height the character can step up onto without jumping (path
// stones, low curbs). Bigger obstacles require Space to clear.
const STEP_UP = 0.4;

export function createPlayController(opts: PlayControllerOptions): PlayController {
  const { camera, character, domElement, orbit, root } = opts;
  const speed = opts.speed ?? WALK;
  // Mutable so upgrades can scale the character at runtime via
  // setSpeedMultiplier. Multiplied into both walk and sprint.
  let speedMul = 1;
  // Jump tuning — mutable so scripts can set height / double jump.
  let jumpV = JUMP_V;
  let maxJumps = 1;
  let jumpsUsed = 0;
  let prevSpaceDown = false;

  const keys = new Set<string>();
  let yaw = opts.initialYaw ?? 0;
  let pitch = 0;
  let velY = 0;
  let mode: CameraMode = opts.mode;
  let colliders: Collider[] = [];
  // Mutable third-person follow distance — only used at applyModeInitial
  // time to drop the camera at a sensible distance behind the character.
  // After that, OrbitControls owns the actual radius (engine.ts onWheel
  // pinch zoom dollies it). Reset on every start() so a Stop→Play
  // doesn't bring the previous zoom back as the new initial framing.
  let thirdDist = THIRD_DIST;
  // Per-frame third-person follow state. We translate orbit.target +
  // camera.position by the character's delta each frame so the orbit
  // pivot rides with the player; this matches how the tile-based
  // building studio's play-mode does it (src/components/building/
  // play-mode.ts ~L412–425). Initialised on entering 'third' mode.
  let prevPivotX = 0;
  let prevPivotY = 0;
  let prevPivotZ = 0;

  function collectColliders() {
    colliders = [];
    for (const child of root.children) {
      if (child === character) continue;
      if (child.userData.__sceneCanCollide === false) continue;
      const box = new THREE.Box3().setFromObject(child);
      if (box.isEmpty()) continue;
      colliders.push({ box });
    }
  }

  /**
   * Pop the character up to the top of any collider it's intersecting
   * on spawn. Without this, a character placed at y=0 on a scene with
   * a 0.5u-thick grass baseplate ends up with its lower cylinder body
   * inside the plate — cylinderCollides() then blocks every horizontal
   * move and gravity can't pull up, so WASD feels "locked".
   *
   * Iterative so stacked geometry (a podium on a baseplate) resolves
   * in one call. Capped at 12 iterations and 10 world units to avoid
   * runaway in pathological scenes (e.g. a scene that covers the
   * character's XZ footprint with cubes all the way up to the sky).
   */
  function popToGroundOnSpawn() {
    for (let i = 0; i < 12; i++) {
      let top: number | null = null;
      const cx = character.position.x;
      const cz = character.position.z;
      const cy = character.position.y;
      for (const c of colliders) {
        const b = c.box;
        if (b.min.x < cx + CHAR_R && b.max.x > cx - CHAR_R &&
            b.min.z < cz + CHAR_R && b.max.z > cz - CHAR_R &&
            // The collider overlaps our cylinder vertically.
            b.min.y < cy + CHAR_H && b.max.y > cy) {
          if (top == null || b.max.y > top) top = b.max.y;
        }
      }
      if (top == null) return;
      if (top - cy > 10) return;
      character.position.y = top;
    }
  }

  // ---- Preserve edit-mode state so we can restore on stop() ----
  const prevOrbitEnabled = orbit.enabled;
  const prevCharVisible = character.visible;
  const prevCameraPos = camera.position.clone();
  const prevCameraQuat = camera.quaternion.clone();
  const prevOrbitTarget = orbit.target.clone();

  // ---- Input listeners (installed on start) ----
  let running = false;
  let pointerLocked = false;

  const onKeyDown = (e: KeyboardEvent) => {
    // Don't steal typing in inputs (Scenes dropdown rename, etc.)
    const t = e.target as HTMLElement | null;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    keys.add(e.code);
  };
  const onKeyUp = (e: KeyboardEvent) => { keys.delete(e.code); };

  // First-person uses pointer lock for FPS-style mouse-look. Third-person
  // does NOT install any pointer or wheel handlers here — orbit camera
  // control is delegated entirely to OrbitControls + the engine's onWheel
  // (engine.ts ~L258), so the same trackpad / drag / pinch behaviour as
  // edit mode applies. update() syncs yaw FROM the camera each frame so
  // WASD stays camera-relative even though we don't own the rotation.
  const onPointerDown = () => {
    if (mode === 'first' && !pointerLocked) domElement.requestPointerLock?.();
  };
  const onPointerMove = (e: PointerEvent) => {
    if (mode === 'first' && pointerLocked) {
      yaw -= e.movementX * MOUSE_YAW_SENS;
      pitch -= e.movementY * MOUSE_PITCH_SENS;
      pitch = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, pitch));
    }
  };

  const onPointerLockChange = () => {
    pointerLocked = document.pointerLockElement === domElement;
  };

  function start() {
    if (running) return;
    running = true;
    // Reset the follow distance every start so the canonical framing
    // is what greets the user; otherwise a Stop-then-Play after a
    // pinch-zoom would persist the zoom into the next play session.
    thirdDist = THIRD_DIST;
    collectColliders();
    popToGroundOnSpawn();
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerlockchange', onPointerLockChange);
    applyModeInitial();
  }

  function stop() {
    if (!running) return;
    running = false;
    keys.clear();
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    domElement.removeEventListener('pointerdown', onPointerDown);
    window.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerlockchange', onPointerLockChange);
    if (pointerLocked) document.exitPointerLock?.();
    orbit.enabled = prevOrbitEnabled;
    character.visible = prevCharVisible;
    camera.position.copy(prevCameraPos);
    camera.quaternion.copy(prevCameraQuat);
    orbit.target.copy(prevOrbitTarget);
    orbit.update();
  }

  function applyModeInitial() {
    const p = character.position;
    if (mode === 'first') {
      // First-person: pointer-lock owns the camera, OrbitControls off.
      orbit.enabled = false;
      character.visible = false;  // player is the camera
      camera.position.set(p.x, p.y + FIRST_HEAD_Y, p.z);
    } else if (mode === 'topdown') {
      // Straight down — yaw is fixed to 0 so WASD reads as world-axis.
      // Tiny X/Z offset keeps OrbitControls / lookAt out of gimbal.
      orbit.enabled = false;
      yaw = 0;
      character.visible = true;
      camera.position.set(p.x + 0.001, p.y + TOPDOWN_HEIGHT, p.z + 0.001);
      camera.lookAt(p.x, p.y, p.z);
    } else if (mode === 'isometric') {
      // 45° corner view, yaw fixed so WASD axes don't rotate as the
      // player moves. Offset the camera by ISO_DIST on each axis.
      orbit.enabled = false;
      yaw = 0;
      character.visible = true;
      camera.position.set(p.x + ISO_DIST, p.y + ISO_DIST, p.z + ISO_DIST);
      camera.lookAt(p.x, p.y + LOOK_Y_OFFSET, p.z);
    } else {
      // Third-person: hand the camera to OrbitControls and let the
      // engine's wheel handler / OrbitControls' built-in left-click drag
      // run the orbit + zoom. update() per-frame translates target +
      // camera by the character's delta so the orbit pivot rides with
      // the player. Same approach as the tile-based studio's play-mode
      // (src/components/building/play-mode.ts ~L412–425), so trackpad
      // swipe + pinch behave identically across edit / play.
      character.visible = true;
      const fx = Math.sin(yaw), fz = Math.cos(yaw);
      camera.position.set(
        p.x - fx * thirdDist,
        p.y + THIRD_Y,
        p.z - fz * thirdDist,
      );
      orbit.target.set(p.x, p.y + LOOK_Y_OFFSET, p.z);
      // controls.enabled = true so the engine's wheel handler actually
      // runs (it bails on enabled=false). enableRotate intentionally
      // stays false: OrbitControls' built-in left-click rotate stays
      // off, and the engine's wheel handler reads the engine-local
      // orbitLocked flag, not enableRotate.
      orbit.enabled = true;
      orbit.update();
      prevPivotX = p.x;
      prevPivotY = p.y + LOOK_Y_OFFSET;
      prevPivotZ = p.z;
    }
  }

  function setMode(next: CameraMode) {
    if (next === mode) return;
    mode = next;
    if (next === 'first') {
      character.visible = false;
      pitch = 0;
    } else {
      character.visible = true;
    }
    applyModeInitial();
  }

  function update(dt: number) {
    if (!running) return;

    // Sync `yaw` from the OrbitControls camera before reading it for
    // WASD direction. In 'third' the user owns the orbit angle via
    // OrbitControls — yaw is no longer a piece of state we mutate from
    // input, it's a derived view of where the camera is. This is what
    // keeps WASD camera-relative even though the trackpad / drag /
    // pinch all flow through the engine's onWheel + OrbitControls.
    if (mode === 'third') {
      const fwdX = orbit.target.x - camera.position.x;
      const fwdZ = orbit.target.z - camera.position.z;
      if (fwdX * fwdX + fwdZ * fwdZ > 1e-6) {
        yaw = Math.atan2(fwdX, fwdZ);
      }
    }

    const shift = keys.has('ShiftLeft') || keys.has('ShiftRight');
    const mag = speed * speedMul * (shift ? SPRINT_MULT : 1);

    // Build movement vector in camera-relative forward/right, flattened to XZ.
    let ix = 0, iz = 0;
    if (keys.has('KeyW') || keys.has('ArrowUp'))    iz -= 1;
    if (keys.has('KeyS') || keys.has('ArrowDown'))  iz += 1;
    if (keys.has('KeyA') || keys.has('ArrowLeft'))  ix -= 1;
    if (keys.has('KeyD') || keys.has('ArrowRight')) ix += 1;

    const hasInput = ix !== 0 || iz !== 0;
    if (hasInput) {
      const len = Math.hypot(ix, iz);
      ix /= len; iz /= len;
    }

    // Rotate (ix,iz) by camera yaw so W goes "forward relative to where you're looking".
    const fx = Math.sin(yaw), fz = Math.cos(yaw);
    const rx =  Math.cos(yaw), rz = -Math.sin(yaw);
    const dx = (ix * rx + iz * fx) * mag * dt;
    const dz = (ix * rz + iz * fz) * mag * dt;

    // --- horizontal movement with slide + step-up against colliders ---
    // Per-axis attempt: try X on its own, then Z on its own. If the move
    // collides and the collider's top is within STEP_UP, hop onto it;
    // otherwise simply don't advance on that axis (so we slide along walls).
    const px = character.position.x, py = character.position.y, pz = character.position.z;
    const tryX = px + dx, tryZ = pz + dz;

    const stepY_X = highestTopBelow(colliders, tryX, pz, py, CHAR_R);
    if (cylinderCollides(colliders, tryX, py, pz, CHAR_R, CHAR_H)) {
      if (stepY_X != null && stepY_X - py <= STEP_UP && !cylinderCollides(colliders, tryX, stepY_X, pz, CHAR_R, CHAR_H)) {
        character.position.x = tryX;
        character.position.y = stepY_X;
      }
    } else {
      character.position.x = tryX;
    }
    const stepY_Z = highestTopBelow(colliders, character.position.x, tryZ, character.position.y, CHAR_R);
    if (cylinderCollides(colliders, character.position.x, character.position.y, tryZ, CHAR_R, CHAR_H)) {
      if (stepY_Z != null && stepY_Z - character.position.y <= STEP_UP && !cylinderCollides(colliders, character.position.x, stepY_Z, tryZ, CHAR_R, CHAR_H)) {
        character.position.z = tryZ;
        character.position.y = stepY_Z;
      }
    } else {
      character.position.z = tryZ;
    }

    // --- vertical: gravity / ground clamp / landing on colliders ---
    // Determine grounded state BEFORE applying jump so space-to-jump
    // only fires while feet are touching something.
    const groundTop = highestTopUnder(colliders, character.position.x, character.position.z, character.position.y + 0.1, CHAR_R);
    const groundY = Math.max(0, groundTop ?? 0);
    const onGround = character.position.y <= groundY + 0.001 && velY <= 0;
    if (onGround) jumpsUsed = 0;
    // Edge-triggered: only on Space transition from up→down, so a held
    // key doesn't burn every chained jump the instant you leave the
    // ground. Critical for double-jump feel.
    const spaceDown = keys.has('Space');
    const spaceJustPressed = spaceDown && !prevSpaceDown;
    prevSpaceDown = spaceDown;
    if (spaceJustPressed && jumpsUsed < maxJumps) {
      velY = jumpV;
      jumpsUsed++;
    }
    velY += GRAVITY * dt;
    let dy = velY * dt;

    if (dy < 0) {
      const nextY = character.position.y + dy;
      if (nextY <= groundY) {
        character.position.y = groundY;
        velY = 0;
      } else {
        character.position.y = nextY;
      }
    } else if (dy > 0) {
      // Rising — block against any collider whose underside is just above.
      const newY = character.position.y + dy;
      if (cylinderCollides(colliders, character.position.x, newY, character.position.z, CHAR_R, CHAR_H)) {
        velY = 0;  // bonked a ceiling
      } else {
        character.position.y = newY;
      }
    }

    // Face movement direction in any visible-character mode so the
    // character visually turns as you run. Skip first-person (no
    // visible character) and skip when there's no input.
    if (mode !== 'first' && hasInput) {
      const targetYaw = Math.atan2(dx, dz);
      // Shortest-arc interpolation
      const cur = character.rotation.y;
      let diff = targetYaw - cur;
      while (diff > Math.PI) diff -= 2 * Math.PI;
      while (diff < -Math.PI) diff += 2 * Math.PI;
      character.rotation.y = cur + diff * Math.min(1, dt * 10);
    }

    // Camera rig
    const p = character.position;
    if (mode === 'first') {
      camera.position.set(p.x, p.y + FIRST_HEAD_Y, p.z);
      camera.rotation.set(pitch, yaw, 0, 'YXZ');
    } else if (mode === 'topdown') {
      // Camera locked above character. Lerp so a fast-moving player
      // doesn't jitter the view; slightly off-axis to dodge gimbal.
      const targetX = p.x + 0.001;
      const targetY = p.y + TOPDOWN_HEIGHT;
      const targetZ = p.z + 0.001;
      const k = Math.min(1, dt * 8);
      camera.position.x += (targetX - camera.position.x) * k;
      camera.position.y += (targetY - camera.position.y) * k;
      camera.position.z += (targetZ - camera.position.z) * k;
      camera.lookAt(p.x, p.y, p.z);
    } else if (mode === 'isometric') {
      // Fixed 45° offset on +X / +Z; camera follows character XZ.
      const targetX = p.x + ISO_DIST;
      const targetY = p.y + ISO_DIST;
      const targetZ = p.z + ISO_DIST;
      const k = Math.min(1, dt * 8);
      camera.position.x += (targetX - camera.position.x) * k;
      camera.position.y += (targetY - camera.position.y) * k;
      camera.position.z += (targetZ - camera.position.z) * k;
      camera.lookAt(p.x, p.y + LOOK_Y_OFFSET, p.z);
    } else {
      // Third-person: OrbitControls owns angle + zoom. We just slide the
      // pivot (and the camera in lockstep) by the character's delta this
      // frame, then call controls.update() so the user's accumulated
      // wheel-orbit gets integrated. Same pattern as the tile-based
      // building studio's play-mode (~L412–425).
      const newPivotX = p.x;
      const newPivotY = p.y + LOOK_Y_OFFSET;
      const newPivotZ = p.z;
      const dxP = newPivotX - prevPivotX;
      const dyP = newPivotY - prevPivotY;
      const dzP = newPivotZ - prevPivotZ;
      if (dxP !== 0 || dyP !== 0 || dzP !== 0) {
        orbit.target.x += dxP; orbit.target.y += dyP; orbit.target.z += dzP;
        camera.position.x += dxP; camera.position.y += dyP; camera.position.z += dzP;
      }
      prevPivotX = newPivotX;
      prevPivotY = newPivotY;
      prevPivotZ = newPivotZ;
      orbit.update();
    }
  }

  return {
    start, stop, update, setMode,
    setSpeedMultiplier: (m: number) => {
      // Clamp to a sensible range so an agent-emitted upgrade with a
      // huge factor doesn't make the character unplayable. 0.25..8x
      // covers every reasonable tycoon tier.
      speedMul = Math.max(0.25, Math.min(8, m));
    },
    setJumpHeight: (h: number) => {
      // v = sqrt(2 * |g| * h). Clamp h to [0.1, 20] so a script
      // can't either disable jumping entirely or launch the player
      // into orbit. With g=-15, h=2 → v≈7.75 (beefy tycoon jump).
      const clamped = Math.max(0.1, Math.min(20, h));
      jumpV = Math.sqrt(2 * Math.abs(GRAVITY) * clamped);
    },
    setMaxJumps: (n: number) => {
      maxJumps = Math.max(1, Math.min(5, Math.floor(n)));
    },
    dispose() { stop(); },
  };
}

/* -------------------------------------------------------------------------- */
/*  Collision helpers                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Cylinder-vs-box at the given position (x, y, z) is the character's
 * feet. Height extends up from there. Cylinder is approximated by its
 * bounding box (square). Good enough for kid-style where every prop is
 * rounded-rect and the character is thick.
 */
function cylinderCollides(
  colliders: Collider[],
  x: number, y: number, z: number,
  r: number, h: number,
): boolean {
  const cxMin = x - r, cxMax = x + r;
  const cyMin = y,     cyMax = y + h;
  const czMin = z - r, czMax = z + r;
  for (const c of colliders) {
    const b = c.box;
    if (b.min.x < cxMax && b.max.x > cxMin &&
        b.min.y < cyMax && b.max.y > cyMin &&
        b.min.z < czMax && b.max.z > czMin) {
      return true;
    }
  }
  return false;
}

/**
 * Highest collider top within the cylinder footprint whose top is
 * between (footY - STEP_UP - 0.05) and (footY + small). Used to detect
 * a step the character can hop up onto when walking forward.
 */
function highestTopBelow(
  colliders: Collider[],
  x: number, z: number, footY: number, r: number,
): number | null {
  let best: number | null = null;
  for (const c of colliders) {
    const b = c.box;
    if (b.min.x < x + r && b.max.x > x - r &&
        b.min.z < z + r && b.max.z > z - r) {
      const top = b.max.y;
      if (top <= footY + 0.05 && top >= footY - STEP_UP - 0.05) {
        if (best == null || top > best) best = top;
      }
    }
  }
  return best;
}

/**
 * Highest collider top strictly below footY, within the cylinder
 * footprint. Used for gravity's ground clamp.
 */
function highestTopUnder(
  colliders: Collider[],
  x: number, z: number, footY: number, r: number,
): number | null {
  let best: number | null = null;
  for (const c of colliders) {
    const b = c.box;
    if (b.min.x < x + r && b.max.x > x - r &&
        b.min.z < z + r && b.max.z > z - r) {
      const top = b.max.y;
      if (top <= footY) {
        if (best == null || top > best) best = top;
      }
    }
  }
  return best;
}
