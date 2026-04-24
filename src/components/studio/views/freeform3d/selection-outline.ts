/**
 * Selection highlight — applied/removed by scanning the hydrated tree
 * and nudging the existing inverted-hull outline's shader uniforms on
 * descendants of the selected scene object.
 *
 * Doubling the outline thickness + shifting color to a bright accent is
 * the cheapest possible selection cue (no extra geometry, no post-process).
 * Matches how Roblox Studio and Blender indicate selection.
 */

import * as THREE from 'three';

const SELECTED_KEY = '__kidOutlineSelected';

const ACCENT_COLOR = new THREE.Color('#ffb53b');
const NORMAL_THICKNESS = 0.03;
const SELECTED_THICKNESS = 0.06;

export function setSelectionHighlight(root: THREE.Object3D, selectedId: string | null): void {
  root.traverse((obj) => {
    if (!(obj as THREE.Mesh).isMesh) return;
    if (!obj.name.endsWith('__outline')) return;
    const mat = (obj as THREE.Mesh).material as THREE.ShaderMaterial;
    if (!mat?.uniforms) return;

    const parentId = findSceneIdUp(obj.parent);
    const isSelected = parentId != null && parentId === selectedId;
    const wasSelected = obj.userData[SELECTED_KEY] === true;
    if (isSelected === wasSelected) return;

    if (isSelected) {
      mat.userData.prevThickness = mat.uniforms.thickness.value;
      mat.userData.prevColor = (mat.uniforms.outlineColor.value as THREE.Color).clone();
      mat.uniforms.thickness.value = SELECTED_THICKNESS;
      (mat.uniforms.outlineColor.value as THREE.Color).copy(ACCENT_COLOR);
    } else {
      const t = mat.userData.prevThickness;
      const c = mat.userData.prevColor as THREE.Color | undefined;
      mat.uniforms.thickness.value = typeof t === 'number' ? t : NORMAL_THICKNESS;
      if (c) (mat.uniforms.outlineColor.value as THREE.Color).copy(c);
    }
    obj.userData[SELECTED_KEY] = isSelected;
  });
}

function findSceneIdUp(node: THREE.Object3D | null): string | null {
  let current: THREE.Object3D | null = node;
  while (current) {
    const id = current.userData.__sceneId;
    if (id) return id;
    current = current.parent;
  }
  return null;
}
