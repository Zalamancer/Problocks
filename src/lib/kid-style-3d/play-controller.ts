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

export type CameraMode = 'third' | 'first';

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
}

const WALK = 5;
const SPRINT_MULT = 1.6;
const JUMP_V = 5;
const GRAVITY = -15;
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

  const keys = new Set<string>();
  let yaw = opts.initialYaw ?? 0;
  let pitch = 0;
  let velY = 0;
  let mode: CameraMode = opts.mode;
  let colliders: Collider[] = [];

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

  // ---- Preserve edit-mode state so we can restore on stop() ----
  const prevOrbitEnabled = orbit.enabled;
  const prevCharVisible = character.visible;
  const prevCameraPos = camera.position.clone();
  const prevCameraQuat = camera.quaternion.clone();
  const prevOrbitTarget = orbit.target.clone();

  // ---- Input listeners (installed on start) ----
  let running = false;
  let pointerLocked = false;
  let thirdDragging = false;

  const onKeyDown = (e: KeyboardEvent) => {
    // Don't steal typing in inputs (Scenes dropdown rename, etc.)
    const t = e.target as HTMLElement | null;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    keys.add(e.code);
  };
  const onKeyUp = (e: KeyboardEvent) => { keys.delete(e.code); };

  const onPointerDown = (e: PointerEvent) => {
    if (mode === 'first') {
      if (!pointerLocked) domElement.requestPointerLock?.();
    } else {
      thirdDragging = true;
      (domElement as HTMLCanvasElement).setPointerCapture?.(e.pointerId);
    }
  };
  const onPointerUp = (e: PointerEvent) => {
    thirdDragging = false;
    try { (domElement as HTMLCanvasElement).releasePointerCapture?.(e.pointerId); } catch { /* ignore */ }
  };
  const onPointerMove = (e: PointerEvent) => {
    if (mode === 'first' && pointerLocked) {
      yaw -= e.movementX * MOUSE_YAW_SENS;
      pitch -= e.movementY * MOUSE_PITCH_SENS;
      pitch = Math.max(-Math.PI / 2.3, Math.min(Math.PI / 2.3, pitch));
    } else if (mode === 'third' && thirdDragging) {
      yaw -= e.movementX * MOUSE_YAW_SENS;
    }
  };

  const onPointerLockChange = () => {
    pointerLocked = document.pointerLockElement === domElement;
  };

  function start() {
    if (running) return;
    running = true;
    orbit.enabled = false;
    collectColliders();
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
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
    window.removeEventListener('pointerup', onPointerUp);
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
    if (mode === 'first') {
      character.visible = false;  // player is the camera
      const p = character.position;
      camera.position.set(p.x, p.y + FIRST_HEAD_Y, p.z);
    } else {
      character.visible = true;
      // Camera behind the character along current yaw. Character faces +Z
      // by default so "behind" means subtract the forward vector.
      const p = character.position;
      const fx = Math.sin(yaw), fz = Math.cos(yaw);
      camera.position.set(
        p.x - fx * THIRD_DIST,
        p.y + THIRD_Y,
        p.z - fz * THIRD_DIST,
      );
      camera.lookAt(p.x, p.y + LOOK_Y_OFFSET, p.z);
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

    const shift = keys.has('ShiftLeft') || keys.has('ShiftRight');
    const mag = speed * (shift ? SPRINT_MULT : 1);

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
    if (keys.has('Space') && onGround) velY = JUMP_V;
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

    // Face movement direction in third-person so the character visually
    // turns as you run. Skip if no movement to avoid snapping to (0,0,-1).
    if (mode === 'third' && hasInput) {
      const targetYaw = Math.atan2(dx, dz);
      // Shortest-arc interpolation
      let cur = character.rotation.y;
      let diff = targetYaw - cur;
      while (diff > Math.PI) diff -= 2 * Math.PI;
      while (diff < -Math.PI) diff += 2 * Math.PI;
      character.rotation.y = cur + diff * Math.min(1, dt * 10);
    }

    // Camera rig
    if (mode === 'first') {
      camera.position.set(
        character.position.x,
        character.position.y + FIRST_HEAD_Y,
        character.position.z,
      );
      camera.rotation.set(pitch, yaw, 0, 'YXZ');
    } else {
      const p = character.position;
      const fx2 = Math.sin(yaw), fz2 = Math.cos(yaw);
      const targetX = p.x - fx2 * THIRD_DIST;
      const targetZ = p.z - fz2 * THIRD_DIST;
      const targetY = p.y + THIRD_Y;
      // Damped lerp for a soft follow
      camera.position.x += (targetX - camera.position.x) * Math.min(1, dt * 8);
      camera.position.y += (targetY - camera.position.y) * Math.min(1, dt * 8);
      camera.position.z += (targetZ - camera.position.z) * Math.min(1, dt * 8);
      camera.lookAt(p.x, p.y + LOOK_Y_OFFSET, p.z);
    }
  }

  return {
    start, stop, update, setMode,
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
