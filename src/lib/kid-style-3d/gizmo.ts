/**
 * Transform gizmo — a thin wrapper around Three.js TransformControls so
 * the rest of the app doesn't have to know the addon's quirks.
 *
 * Responsibilities kept inside this module:
 *   - Add the gizmo helper to the scene (r163+ separated the visual
 *     helper from the controller object; callers can just call
 *     `attach(obj)` and the helper shows up in the scene automatically)
 *   - Coordinate with OrbitControls: disable it while the user drags
 *     the gizmo so the camera doesn't fight them
 *   - Emit a lightweight 'change' callback whenever the attached
 *     object's transform changes — the view uses that to push the new
 *     transform into the Zustand store in one place
 *
 * Modes map to the W/E/R keyboard standard (same as Blender / Unity /
 * Three.js editor).
 */

import * as THREE from 'three';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export type GizmoMode = 'translate' | 'rotate' | 'scale';

export interface KidGizmoOptions {
  camera: THREE.Camera;
  domElement: HTMLElement;
  scene: THREE.Scene;
  orbit?: OrbitControls;
  onChange?: (object: THREE.Object3D) => void;
}

export interface KidGizmo {
  attach: (object: THREE.Object3D) => void;
  detach: () => void;
  setMode: (mode: GizmoMode) => void;
  getMode: () => GizmoMode;
  isDragging: () => boolean;
  dispose: () => void;
  /** Raw Three.js controls if a consumer needs something bespoke. */
  controls: TransformControls;
}

export function createKidGizmo(opts: KidGizmoOptions): KidGizmo {
  const controls = new TransformControls(opts.camera, opts.domElement);
  controls.setSize(0.8);
  controls.setTranslationSnap(0.1);        // quarter-grid translation
  controls.setRotationSnap(THREE.MathUtils.degToRad(5));
  controls.setScaleSnap(0.05);

  // r163+ decoupled the helper (visual part) from the controller (event
  // target). Older Three.js versions ignore getHelper and the gizmo still
  // renders because it IS the Object3D. Supporting both means adding
  // whichever one exists — never both, and never adding the controller
  // itself on r163+.
  const helper =
    typeof (controls as unknown as { getHelper?: () => THREE.Object3D }).getHelper === 'function'
      ? (controls as unknown as { getHelper: () => THREE.Object3D }).getHelper()
      : (controls as unknown as THREE.Object3D);
  opts.scene.add(helper);

  let attached: THREE.Object3D | null = null;
  let dragging = false;
  let mode: GizmoMode = 'translate';

  const onDraggingChanged = (e: { value: boolean }) => {
    dragging = e.value;
    if (opts.orbit) opts.orbit.enabled = !e.value;
  };

  const onObjectChange = () => {
    if (attached && opts.onChange) opts.onChange(attached);
  };

  // @ts-expect-error — Three.js TypeScript types are loose on these events
  controls.addEventListener('dragging-changed', onDraggingChanged);
  // @ts-expect-error — same
  controls.addEventListener('objectChange', onObjectChange);

  return {
    controls,
    attach(object) {
      attached = object;
      controls.attach(object);
      controls.setMode(mode);
      controls.visible = true;
      controls.enabled = true;
    },
    detach() {
      attached = null;
      controls.detach();
      // Some Three.js versions keep the helper visible after detach; hide
      // explicitly so we don't leave a ghost gizmo in empty space.
      controls.visible = false;
      controls.enabled = false;
    },
    setMode(next) {
      mode = next;
      controls.setMode(next);
    },
    getMode() {
      return mode;
    },
    isDragging() {
      return dragging;
    },
    dispose() {
      // @ts-expect-error — loose event types
      controls.removeEventListener('dragging-changed', onDraggingChanged);
      // @ts-expect-error — loose event types
      controls.removeEventListener('objectChange', onObjectChange);
      opts.scene.remove(helper);
      controls.dispose();
    },
  };
}
