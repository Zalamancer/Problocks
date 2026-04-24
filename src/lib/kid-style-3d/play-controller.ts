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

export interface PlayControllerOptions {
  camera: THREE.PerspectiveCamera;
  character: THREE.Object3D;
  domElement: HTMLElement;
  orbit: OrbitControls;
  mode: CameraMode;
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

export function createPlayController(opts: PlayControllerOptions): PlayController {
  const { camera, character, domElement, orbit } = opts;
  const speed = opts.speed ?? WALK;

  const keys = new Set<string>();
  let yaw = opts.initialYaw ?? 0;
  let pitch = 0;
  let velY = 0;
  let mode: CameraMode = opts.mode;

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

    // Jump + gravity
    if ((keys.has('Space')) && character.position.y <= 0.001) velY = JUMP_V;
    velY += GRAVITY * dt;
    let dy = velY * dt;
    if (character.position.y + dy <= 0) { dy = -character.position.y; velY = 0; }

    character.position.x += dx;
    character.position.y += dy;
    character.position.z += dz;

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
