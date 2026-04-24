/**
 * Scene JSON ↔ Three.js sync.
 *
 * `applySceneToRoot` diff-patches a Three.js Group to match a SceneJson
 * array. It avoids rebuilding the whole scene on every tiny edit, which
 * matters when the user is dragging a slider and the store updates at
 * 60Hz. Adds what's new, removes what's gone, applies transform/color
 * changes in place.
 *
 * Each hydrated object is tagged with two userData fields:
 *   - `__sceneId`: the SceneObject.id so reverse lookups (picking, undo)
 *                  can find the JSON record
 *   - `__sceneKind`: the prefab kind so transform-only updates can skip
 *                    a rebuild and color/prop updates can detect changes
 */

import * as THREE from 'three';
import { buildPrefab } from './prefabs';
import type { SceneObject } from './scene-schema';

const OBJECT_ID_KEY = '__sceneId';
const OBJECT_KIND_KEY = '__sceneKind';
const OBJECT_COLOR_KEY = '__sceneColor';
const OBJECT_PROPS_KEY = '__scenePropsJson';

export function applySceneToRoot(root: THREE.Group, objects: SceneObject[]): void {
  const desired = new Map<string, SceneObject>();
  for (const o of objects) desired.set(o.id, o);

  // Remove objects no longer in the scene.
  const toRemove: THREE.Object3D[] = [];
  for (const child of root.children) {
    const id = child.userData[OBJECT_ID_KEY];
    if (!id || !desired.has(id)) toRemove.push(child);
  }
  for (const r of toRemove) {
    root.remove(r);
    disposeTree(r);
  }

  // Existing objects: patch transform / color / rebuild if kind changed.
  const existing = new Map<string, THREE.Object3D>();
  for (const child of root.children) {
    const id = child.userData[OBJECT_ID_KEY];
    if (id) existing.set(id, child);
  }

  for (const obj of objects) {
    const have = existing.get(obj.id);
    if (have) {
      const propsNow = JSON.stringify(obj.props ?? {});
      const propsPrev = have.userData[OBJECT_PROPS_KEY] as string | undefined;
      const kindChanged = have.userData[OBJECT_KIND_KEY] !== obj.kind;
      const propsChanged = propsNow !== propsPrev;
      if (kindChanged || propsChanged) {
        // Kind or per-prefab props changed — rebuild in place. The
        // in-place color shortcut can't reach sub-meshes of compound
        // prefabs (house.roofColor, character.hairColor, etc.), so a
        // rebuild is the safe default when props shift.
        const preservedAnimBaseY = have.userData.__animBaseY as number | undefined;
        root.remove(have);
        disposeTree(have);
        const rebuilt = createSceneObject(obj);
        if (preservedAnimBaseY != null) rebuilt.userData.__animBaseY = preservedAnimBaseY;
        root.add(rebuilt);
        continue;
      }
      applyTransform(have, obj);
      applyColorIfChanged(have, obj);
    } else {
      root.add(createSceneObject(obj));
    }
  }
}

function createSceneObject(obj: SceneObject): THREE.Object3D {
  const built = buildPrefab(obj.kind, { color: obj.color, props: obj.props });
  built.userData[OBJECT_ID_KEY] = obj.id;
  built.userData[OBJECT_KIND_KEY] = obj.kind;
  built.userData[OBJECT_COLOR_KEY] = obj.color ?? '';
  built.userData[OBJECT_PROPS_KEY] = JSON.stringify(obj.props ?? {});
  applyTransform(built, obj);
  return built;
}

function applyTransform(target: THREE.Object3D, obj: SceneObject): void {
  target.position.set(obj.position[0], obj.position[1], obj.position[2]);
  target.rotation.set(obj.rotation[0], obj.rotation[1], obj.rotation[2]);
  target.scale.set(obj.scale[0], obj.scale[1], obj.scale[2]);
}

function applyColorIfChanged(target: THREE.Object3D, obj: SceneObject): void {
  const prev = target.userData[OBJECT_COLOR_KEY];
  const next = obj.color ?? '';
  if (prev === next) return;
  // Colour swap — find first mesh with material.color and mutate. Works for
  // simple primitives. Compound prefabs mutate the top-level mesh, which is
  // "good enough" for the first cut; a per-prefab color mapping can come
  // later when the prefab spec formalizes which sub-mesh is the primary.
  target.userData[OBJECT_COLOR_KEY] = next;
  const first = findFirstColorMesh(target);
  if (first && next) {
    const mat = first.material as THREE.MeshToonMaterial;
    if (mat?.color) {
      mat.color.set(next);
      mat.needsUpdate = true;
    }
  }
}

function findFirstColorMesh(root: THREE.Object3D): THREE.Mesh | null {
  if ((root as THREE.Mesh).isMesh && !root.name.endsWith('__outline')) return root as THREE.Mesh;
  for (const child of root.children) {
    const hit = findFirstColorMesh(child);
    if (hit) return hit;
  }
  return null;
}

function disposeTree(root: THREE.Object3D): void {
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh) {
      m.geometry?.dispose?.();
      const mat = m.material;
      if (Array.isArray(mat)) mat.forEach((mm) => mm.dispose?.());
      else mat?.dispose?.();
    }
  });
}

/**
 * Reverse lookup — given a Three.js object or one of its descendants,
 * walk up to the first ancestor that has a __sceneId and return that id.
 * Used by click-picking: the user clicks any mesh within a prefab group
 * and we need to find the whole scene object.
 */
export function sceneIdForObject(obj: THREE.Object3D | null): string | null {
  let current: THREE.Object3D | null = obj;
  while (current) {
    const id = current.userData[OBJECT_ID_KEY];
    if (id) return id;
    current = current.parent;
  }
  return null;
}
