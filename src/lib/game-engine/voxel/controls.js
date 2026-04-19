// Pointer-locked first-person controls. Minecraft-style: horizontal
// WASD, mouselook, gravity-pulled jump on Space. When a `world` (plus
// `isSolid` block predicate) is provided the controls do cheap ground
// collision so Space becomes a real jump and the player lands on
// terrain instead of drifting through it. Without a world passed in
// the module degrades to free-fly so tooling/tests still work.
//
// Exposes a tiny imperative API:
//   const controls = createFlyControls({ canvas, camera, world, isSolid })
//   controls.update(dt)      // call each frame
//   controls.dispose()       // detach listeners on teardown
//   controls.isLocked        // boolean

const PLAYER_EYE = 1.6;  // camera sits this far above feet
const GRAVITY = 28;      // blocks/sec^2
const JUMP_VEL = 9;      // blocks/sec initial upward velocity
const TERMINAL_V = 55;   // cap so falls off the world map don't nuke fp precision

export function createFlyControls({ canvas, camera, world = null, isSolid = null }) {
  // Camera starts looking somewhere sensible; caller positions it before
  // the first update.
  let yaw = 0;    // rotation around world +Y
  let pitch = 0;  // rotation around local +X
  const MAX_PITCH = Math.PI / 2 - 0.01;

  const keys = new Set();
  let moveSpeed = 8;          // blocks/sec
  const sprintMult = 2.2;
  const lookSens = 0.0022;

  let locked = false;
  let vy = 0;              // vertical velocity (blocks/sec), driven by gravity + jump
  let grounded = false;    // updated each frame by landing check

  function onPointerLockChange() {
    locked = document.pointerLockElement === canvas;
  }
  function requestLock() {
    if (!locked) canvas.requestPointerLock();
  }
  function onMouseMove(e) {
    if (!locked) return;
    yaw -= e.movementX * lookSens;
    pitch -= e.movementY * lookSens;
    if (pitch > MAX_PITCH) pitch = MAX_PITCH;
    if (pitch < -MAX_PITCH) pitch = -MAX_PITCH;
    applyCameraRotation();
  }
  function onKeyDown(e) {
    keys.add(e.code);
  }
  function onKeyUp(e) {
    keys.delete(e.code);
  }
  function onBlur() {
    keys.clear();
  }

  function applyCameraRotation() {
    // Use YXZ Euler so yaw happens first (around world Y), then pitch.
    camera.rotation.order = 'YXZ';
    camera.rotation.y = yaw;
    camera.rotation.x = pitch;
    camera.rotation.z = 0;
  }

  function solidAt(x, y, z) {
    // Treat out-of-bounds as non-solid so falling out doesn't lock the
    // player in mid-air. Callers pass in the block predicate so we stay
    // decoupled from the block registry.
    if (!world || !isSolid) return false;
    return isSolid(world.getBlock(Math.floor(x), Math.floor(y), Math.floor(z)));
  }

  function update(dt) {
    let fx = 0;
    let fz = 0;
    if (keys.has('KeyW')) fz -= 1;
    if (keys.has('KeyS')) fz += 1;
    if (keys.has('KeyA')) fx -= 1;
    if (keys.has('KeyD')) fx += 1;

    const len = Math.hypot(fx, fz);
    if (len > 0) { fx /= len; fz /= len; }

    const speed = moveSpeed * (keys.has('ControlLeft') ? sprintMult : 1) * dt;

    // Horizontal movement respects yaw only so looking down doesn't dip
    // forward motion underground. Rotation is yaw around +Y applied to a
    // local (fx,fz) vector — see camera look math in getLook().
    const sinY = Math.sin(yaw);
    const cosY = Math.cos(yaw);
    camera.position.x += (fx * cosY + fz * sinY) * speed;
    camera.position.z += (-fx * sinY + fz * cosY) * speed;

    if (world && isSolid) {
      // --- Gravity / jump / ground collision ---------------------------
      // Player occupies the 1x2 column [camera.x, camera.z] with feet at
      // camera.y - PLAYER_EYE. Simple axis-aligned resolution: apply vy,
      // then clamp when the block at feet is solid (landing) or when the
      // block at head is solid (bonk).
      vy = Math.max(-TERMINAL_V, vy - GRAVITY * dt);
      camera.position.y += vy * dt;

      const px = camera.position.x;
      const pz = camera.position.z;
      const feetY = camera.position.y - PLAYER_EYE;
      const headY = camera.position.y;

      // Landed? Block directly under feet is solid and we're falling.
      if (vy <= 0 && solidAt(px, feetY - 0.01, pz)) {
        const groundTop = Math.floor(feetY - 0.01) + 1;
        camera.position.y = groundTop + PLAYER_EYE;
        vy = 0;
        grounded = true;
      } else {
        grounded = false;
      }

      // Head bonk — ceiling above: stop upward motion.
      if (vy > 0 && solidAt(px, headY + 0.01, pz)) {
        vy = 0;
      }

      if (grounded && keys.has('Space')) {
        vy = JUMP_VEL;
        grounded = false;
      }
    } else {
      // No world provided → legacy fly mode (Space up, Shift down).
      let fy = 0;
      if (keys.has('Space')) fy += 1;
      if (keys.has('ShiftLeft') || keys.has('ShiftRight')) fy -= 1;
      camera.position.y += fy * speed;
    }
  }

  canvas.addEventListener('click', requestLock);
  canvas.addEventListener('mousemove', onMouseMove);
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', onBlur);
  document.addEventListener('pointerlockchange', onPointerLockChange);

  applyCameraRotation();

  return {
    update,
    get isLocked() { return locked; },
    setSpeed(v) { moveSpeed = v; },
    // Expose yaw/pitch so the engine can drive block placement off the
    // camera's look direction without reaching into internals.
    getLook() {
      const sinY = Math.sin(yaw);
      const cosY = Math.cos(yaw);
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);
      // Match THREE YXZ order forward (-Z in local → rotate by pitch then yaw).
      return {
        x: -sinY * cosP,
        y: sinP,
        z: -cosY * cosP,
      };
    },
    dispose() {
      canvas.removeEventListener('click', requestLock);
      canvas.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      if (document.pointerLockElement === canvas) document.exitPointerLock();
    },
  };
}
