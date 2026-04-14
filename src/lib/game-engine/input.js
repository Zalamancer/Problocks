/**
 * Problocks Input System
 * Tracks keyboard, mouse, and touch state with frame-accurate "just pressed" detection.
 */
export function createInput(canvas) {
  const keys = {};
  const prevKeys = {};
  const mouse = { x: 0, y: 0, dx: 0, dy: 0, buttons: 0, locked: false };
  let prevMouseButtons = 0;
  let _pointerLockRequested = false;

  function onKeyDown(e) { keys[e.code] = true; e.preventDefault(); }
  function onKeyUp(e) { keys[e.code] = false; }

  function onMouseMove(e) {
    if (document.pointerLockElement) {
      mouse.dx += e.movementX;
      mouse.dy += e.movementY;
      mouse.locked = true;
    } else {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.locked = false;
    }
  }

  function onMouseDown(e) {
    mouse.buttons |= (1 << e.button);
    if (_pointerLockRequested && !document.pointerLockElement) {
      canvas.requestPointerLock?.();
    }
  }

  function onMouseUp(e) { mouse.buttons &= ~(1 << e.button); }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mouseup', onMouseUp);

  return {
    mouse,

    /** True while key is held */
    isDown(code) { return !!keys[code]; },

    /** True only on the frame the key was first pressed */
    justPressed(code) { return !!keys[code] && !prevKeys[code]; },

    /** True only on the frame the key was released */
    justReleased(code) { return !keys[code] && !!prevKeys[code]; },

    /** True while mouse button is held (0=left, 1=middle, 2=right) */
    mouseDown(button = 0) { return !!(mouse.buttons & (1 << button)); },

    /** True only on the frame the mouse button was first pressed */
    mouseJustPressed(button = 0) {
      const mask = 1 << button;
      return !!(mouse.buttons & mask) && !(prevMouseButtons & mask);
    },

    /** True only on the frame the mouse button was released */
    mouseJustReleased(button = 0) {
      const mask = 1 << button;
      return !(mouse.buttons & mask) && !!(prevMouseButtons & mask);
    },

    /** Request pointer lock on next click (for FPS/3D games) */
    requestPointerLock() { _pointerLockRequested = true; },

    /** Called by engine at end of each frame */
    _endFrame() {
      Object.assign(prevKeys, keys);
      prevMouseButtons = mouse.buttons;
      mouse.dx = 0;
      mouse.dy = 0;
    },

    /** Cleanup */
    _destroy() {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mouseup', onMouseUp);
    },
  };
}
