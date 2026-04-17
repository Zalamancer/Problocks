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
const MOVE_SPEED = 7;
const JUMP_SPEED = 9;
const GRAVITY = -26;
const CAM_DIST = 6;
const LOOK_SENS = 0.0022;

export function createPlayController(refs: PlaySceneRefs): PlayController {
  let active = false;
  let character: THREE.Group | null = null;
  const velocity = new THREE.Vector3();
  const keys: Record<string, boolean> = {};
  let yaw = 0;
  let pitch = -0.25;
  let grounded = false;
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
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(CAP_RADIUS, cyl, 8, 16),
      new THREE.MeshStandardMaterial({ color: 0x3a7be2, roughness: 0.6 }),
    );
    body.position.y = CAP_HEIGHT / 2;
    body.castShadow = true;
    g.add(body);
    const head = new THREE.Mesh(
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
    keys[e.code] = true;
    if (e.code === 'Space') e.preventDefault();
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

      // Yaw-aligned WASD
      const fwd = (keys['KeyW'] ? 1 : 0) - (keys['KeyS'] ? 1 : 0);
      const str = (keys['KeyD'] ? 1 : 0) - (keys['KeyA'] ? 1 : 0);
      const cy = Math.cos(yaw);
      const sy = Math.sin(yaw);
      // Camera forward on the ground is (-sin yaw, 0, -cos yaw)
      const fx = -sy;
      const fz = -cy;
      const rx = cy;
      const rz = -sy;
      let vx = fwd * fx + str * rx;
      let vz = fwd * fz + str * rz;
      const len = Math.hypot(vx, vz);
      if (len > 0) {
        vx = (vx / len) * MOVE_SPEED;
        vz = (vz / len) * MOVE_SPEED;
      } else {
        vx = 0;
        vz = 0;
      }
      velocity.x = vx;
      velocity.z = vz;

      if (keys['Space'] && grounded) {
        velocity.y = JUMP_SPEED;
        grounded = false;
      }
      velocity.y += GRAVITY * step;
      if (velocity.y < -50) velocity.y = -50; // terminal velocity

      character.position.x += velocity.x * step;
      character.position.z += velocity.z * step;
      character.position.y += velocity.y * step;

      resolveCollisions();

      // Fell out of world (shouldn't happen with y=0 floor but safety net)
      if (character.position.y < -20) {
        character.position.set(0, 0.1, 8);
        velocity.set(0, 0, 0);
      }

      // Face the camera's horizontal forward when moving; else hold last yaw
      if (len > 0) {
        // Desired world-space movement direction → face it
        character.rotation.y = Math.atan2(vx, vz);
      } else {
        character.rotation.y = yaw; // idle → face the way the camera looks
      }

      // Third-person orbit camera around the character head
      const headY = character.position.y + CAP_HEIGHT + HEAD_OFFSET;
      const cp = Math.cos(pitch);
      const sp = Math.sin(pitch);
      const camX = character.position.x - Math.sin(yaw) * cp * CAM_DIST;
      const camZ = character.position.z - Math.cos(yaw) * cp * CAM_DIST;
      const camY = headY + sp * CAM_DIST + 1.2;
      refs.camera.position.set(camX, camY, camZ);
      refs.camera.lookAt(character.position.x, headY, character.position.z);
    },
  };
}
