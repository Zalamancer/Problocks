/**
 * Zustand store for the 3D Freeform studio — scene state + selection +
 * history. Persists to localStorage via Zustand's `persist` middleware so
 * a student's first scene survives a refresh or tab close.
 *
 * Scene edits always go through the store, never directly against the
 * engine's Three.js root — the engine subscribes to state changes and
 * hydrates the root via `applySceneToRoot`. This one-way flow is what
 * lets us:
 *   - Persist the scene cheaply (Zustand persist just JSON-serializes it)
 *   - Undo/redo by restoring a prior `objects` array
 *   - Regenerate the whole scene from an AI prompt by replacing the array
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SceneObject, SceneJson, Vec3 } from '@/lib/kid-style-3d/scene-schema';
import { EMPTY_SCENE, makeSceneObject } from '@/lib/kid-style-3d/scene-schema';
import { getPrefabDef } from '@/lib/kid-style-3d/prefabs';

const HISTORY_LIMIT = 50;

interface Freeform3DState {
  scene: SceneJson;
  selectedId: string | null;

  /** Undo/redo stacks hold copies of scene.objects before each mutation. */
  undoStack: SceneObject[][];
  redoStack: SceneObject[][];

  // Selection ------------------------------------------------------------
  select: (id: string | null) => void;

  // Object CRUD ----------------------------------------------------------
  /** Insert a prefab at a position. Color + props default to the prefab def. */
  addPrefab: (kind: string, position?: Vec3) => string;
  removeObject: (id: string) => void;
  duplicateObject: (id: string) => string | null;
  updateObject: (id: string, patch: Partial<SceneObject>) => void;
  setColor: (id: string, color: string) => void;
  clearScene: () => void;
  replaceScene: (scene: SceneJson) => void;

  // History --------------------------------------------------------------
  undo: () => void;
  redo: () => void;
}

function snapshot(objects: SceneObject[]): SceneObject[] {
  // Shallow clone is fine — SceneObject values are primitives + tuples +
  // small records. A deep clone would be wasteful.
  return objects.map((o) => ({
    ...o,
    position: [...o.position] as Vec3,
    rotation: [...o.rotation] as Vec3,
    scale: [...o.scale] as Vec3,
    props: o.props ? { ...o.props } : undefined,
  }));
}

export const useFreeform3D = create<Freeform3DState>()(
  persist(
    (set, get) => ({
      scene: EMPTY_SCENE,
      selectedId: null,
      undoStack: [],
      redoStack: [],

      select: (id) => set({ selectedId: id }),

      addPrefab: (kind, position = [0, 0, 0]) => {
        const def = getPrefabDef(kind);
        if (!def) return '';
        const obj = makeSceneObject(kind, {
          position,
          color: def.defaultColor,
        });
        pushHistory(set, get);
        set((s) => ({
          scene: { ...s.scene, objects: [...s.scene.objects, obj] },
          selectedId: obj.id,
          redoStack: [],
        }));
        return obj.id;
      },

      removeObject: (id) => {
        pushHistory(set, get);
        set((s) => ({
          scene: { ...s.scene, objects: s.scene.objects.filter((o) => o.id !== id) },
          selectedId: s.selectedId === id ? null : s.selectedId,
          redoStack: [],
        }));
      },

      duplicateObject: (id) => {
        const src = get().scene.objects.find((o) => o.id === id);
        if (!src) return null;
        pushHistory(set, get);
        const clone: SceneObject = {
          ...src,
          id: makeSceneObject(src.kind).id,
          position: [src.position[0] + 1, src.position[1], src.position[2] + 1],
          props: src.props ? { ...src.props } : undefined,
        };
        set((s) => ({
          scene: { ...s.scene, objects: [...s.scene.objects, clone] },
          selectedId: clone.id,
          redoStack: [],
        }));
        return clone.id;
      },

      updateObject: (id, patch) => {
        pushHistory(set, get);
        set((s) => ({
          scene: {
            ...s.scene,
            objects: s.scene.objects.map((o) => (o.id === id ? { ...o, ...patch } : o)),
          },
          redoStack: [],
        }));
      },

      setColor: (id, color) => {
        get().updateObject(id, { color });
      },

      clearScene: () => {
        pushHistory(set, get);
        set((s) => ({
          scene: { ...s.scene, objects: [] },
          selectedId: null,
          redoStack: [],
        }));
      },

      replaceScene: (scene) => {
        pushHistory(set, get);
        set({ scene, selectedId: null, redoStack: [] });
      },

      undo: () => {
        set((s) => {
          const prev = s.undoStack[s.undoStack.length - 1];
          if (!prev) return s;
          return {
            scene: { ...s.scene, objects: prev },
            undoStack: s.undoStack.slice(0, -1),
            redoStack: [...s.redoStack, snapshot(s.scene.objects)].slice(-HISTORY_LIMIT),
            selectedId: prev.some((o) => o.id === s.selectedId) ? s.selectedId : null,
          };
        });
      },

      redo: () => {
        set((s) => {
          const next = s.redoStack[s.redoStack.length - 1];
          if (!next) return s;
          return {
            scene: { ...s.scene, objects: next },
            redoStack: s.redoStack.slice(0, -1),
            undoStack: [...s.undoStack, snapshot(s.scene.objects)].slice(-HISTORY_LIMIT),
            selectedId: next.some((o) => o.id === s.selectedId) ? s.selectedId : null,
          };
        });
      },
    }),
    {
      name: 'problocks-freeform3d-v1',
      partialize: (s) => ({ scene: s.scene }),
    },
  ),
);

function pushHistory(
  set: (fn: (s: Freeform3DState) => Partial<Freeform3DState>) => void,
  get: () => Freeform3DState,
): void {
  const snap = snapshot(get().scene.objects);
  set((s) => ({ undoStack: [...s.undoStack, snap].slice(-HISTORY_LIMIT) }));
}
