// Pointer-locked first-person fly controls. Intentionally minimal — no
// physics, no gravity, no collisions. The voxel engine spec targets
// Chromebooks at 60 FPS and a physics step would eat a meaningful
// fraction of our frame budget for a first-pass builder experience.
// Gravity + block collision can be layered in later by replacing
// updateFly with a "character controller" variant.
//
// Exposes a tiny imperative API:
//   const controls = createFlyControls({ canvas, camera })
//   controls.update(dt)      // call each frame
//   controls.dispose()       // detach listeners on teardown
//   controls.isLocked        // boolean

export function createFlyControls({ canvas, camera }) {
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

  function update(dt) {
    let fx = 0;
    let fz = 0;
    let fy = 0;
    if (keys.has('KeyW')) fz -= 1;
    if (keys.has('KeyS')) fz += 1;
    if (keys.has('KeyA')) fx -= 1;
    if (keys.has('KeyD')) fx += 1;
    if (keys.has('Space')) fy += 1;
    if (keys.has('ShiftLeft') || keys.has('ShiftRight')) fy -= 1;

    const len = Math.hypot(fx, fz);
    if (len > 0) { fx /= len; fz /= len; }

    const speed = moveSpeed * (keys.has('ControlLeft') ? sprintMult : 1) * dt;

    // Horizontal movement respects yaw only so looking down doesn't dip
    // forward motion underground.
    const sinY = Math.sin(yaw);
    const cosY = Math.cos(yaw);
    camera.position.x += (fx * cosY - fz * sinY) * speed;
    camera.position.z += (fx * sinY + fz * cosY) * speed;
    camera.position.y += fy * speed;
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
