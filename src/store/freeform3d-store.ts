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
import { getPrefabDef, DEFAULT_PREFAB_STYLE, type PrefabStyleId } from '@/lib/kid-style-3d/prefabs';

const HISTORY_LIMIT = 50;

export type CameraMode = 'third' | 'first';

interface Freeform3DState {
  scene: SceneJson;
  selectedId: string | null;

  /** Undo/redo stacks hold copies of scene.objects before each mutation. */
  undoStack: SceneObject[][];
  redoStack: SceneObject[][];

  /** Named saved scenes. Separate from `scene` so the in-progress edit
      state doesn't collide with last-saved snapshots. */
  savedScenes: Record<string, SceneJson>;
  /** Name of the last-saved-or-loaded scene, or null if unsaved. */
  currentSceneName: string | null;

  /** Play-mode camera mode — 'third' follows the character, 'first' is
      pointer-locked mouselook. */
  cameraMode: CameraMode;
  setCameraMode: (m: CameraMode) => void;

  /** Active prefab kit — drives the Assets panel filter AND the AI
      agent (only prefabs in this style are offered to the model). */
  activeStyle: PrefabStyleId;
  setActiveStyle: (s: PrefabStyleId) => void;

  // Selection ------------------------------------------------------------
  select: (id: string | null) => void;

  // Object CRUD ----------------------------------------------------------
  /** Insert a prefab at a position. Color + props default to the prefab def. */
  addPrefab: (kind: string, position?: Vec3) => string;
  /** AI-facing variant: lets the agent set position/rotation/scale/color/props
      in one shot. Same history semantics as addPrefab. */
  addPrefabFull: (kind: string, patch?: Partial<SceneObject>) => string;
  removeObject: (id: string) => void;
  duplicateObject: (id: string) => string | null;
  updateObject: (id: string, patch: Partial<SceneObject>) => void;
  setColor: (id: string, color: string) => void;
  clearScene: () => void;
  replaceScene: (scene: SceneJson) => void;

  // Scene library --------------------------------------------------------
  saveSceneAs: (name: string) => void;
  loadScene: (name: string) => boolean;
  deleteSavedScene: (name: string) => void;
  newScene: () => void;
  renameCurrent: (newName: string) => boolean;
  exportSceneJSON: () => string;
  importSceneJSON: (json: string, asName?: string) => boolean;

  // History --------------------------------------------------------------
  undo: () => void;
  redo: () => void;
}

/** Coerce a tuple that may be partially undefined into a complete Vec3. */
function vec3(t: Vec3 | undefined, fallback: Vec3): Vec3 {
  return [t?.[0] ?? fallback[0], t?.[1] ?? fallback[1], t?.[2] ?? fallback[2]];
}

/** Clone + fill any missing transform fields with the identity values.
    Used for persist rehydration, undo/redo snapshots, duplicate, and
    AI-driven addPrefabFull — anywhere a SceneObject might arrive with
    partial transforms. */
function normalize(o: SceneObject): SceneObject {
  return {
    ...o,
    position: vec3(o.position, [0, 0, 0]),
    rotation: vec3(o.rotation, [0, 0, 0]),
    scale:    vec3(o.scale,    [1, 1, 1]),
    props: o.props ? { ...o.props } : undefined,
  };
}

function snapshot(objects: SceneObject[]): SceneObject[] {
  return objects.map(normalize);
}

export const useFreeform3D = create<Freeform3DState>()(
  persist(
    (set, get) => ({
      scene: EMPTY_SCENE,
      selectedId: null,
      undoStack: [],
      redoStack: [],
      savedScenes: {},
      currentSceneName: null,
      cameraMode: 'third',
      setCameraMode: (m) => set({ cameraMode: m }),

      activeStyle: DEFAULT_PREFAB_STYLE,
      setActiveStyle: (s) => set({ activeStyle: s }),

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

      addPrefabFull: (kind, patch) => {
        const def = getPrefabDef(kind);
        if (!def) return '';
        // Strip explicit-undefined fields out of patch so they don't
        // overwrite makeSceneObject's identity defaults with `undefined`.
        const cleanPatch: Partial<SceneObject> = {};
        if (patch) {
          for (const k of Object.keys(patch) as (keyof SceneObject)[]) {
            if (patch[k] !== undefined) (cleanPatch as Record<string, unknown>)[k] = patch[k];
          }
        }
        const obj = normalize(makeSceneObject(kind, {
          color: def.defaultColor,
          ...cleanPatch,
        }));
        pushHistory(set, get);
        set((s) => ({
          scene: { ...s.scene, objects: [...s.scene.objects, obj] },
          // AI bulk-spawns shouldn't pull the inspector open on the last
          // item — leave selection where the user left it.
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
        const safeSrc = normalize(src);
        const clone: SceneObject = {
          ...safeSrc,
          id: makeSceneObject(safeSrc.kind).id,
          position: [safeSrc.position[0] + 1, safeSrc.position[1], safeSrc.position[2] + 1],
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

      saveSceneAs: (name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        const snap: SceneJson = {
          version: 1,
          objects: snapshot(get().scene.objects),
          meta: {
            ...get().scene.meta,
            name: trimmed,
            updatedAt: new Date().toISOString(),
            createdAt: get().scene.meta?.createdAt ?? new Date().toISOString(),
          },
        };
        set((s) => ({
          savedScenes: { ...s.savedScenes, [trimmed]: snap },
          currentSceneName: trimmed,
          scene: snap,
        }));
      },

      loadScene: (name) => {
        const snap = get().savedScenes[name];
        if (!snap) return false;
        pushHistory(set, get);
        set({
          scene: {
            ...snap,
            objects: snapshot(snap.objects),
          },
          currentSceneName: name,
          selectedId: null,
          redoStack: [],
        });
        return true;
      },

      deleteSavedScene: (name) => {
        set((s) => {
          if (!(name in s.savedScenes)) return s;
          const next = { ...s.savedScenes };
          delete next[name];
          return {
            savedScenes: next,
            currentSceneName: s.currentSceneName === name ? null : s.currentSceneName,
          };
        });
      },

      newScene: () => {
        pushHistory(set, get);
        set({
          scene: { version: 1, objects: [], meta: { createdAt: new Date().toISOString() } },
          currentSceneName: null,
          selectedId: null,
          redoStack: [],
        });
      },

      renameCurrent: (newName) => {
        const trimmed = newName.trim();
        if (!trimmed) return false;
        const cur = get().currentSceneName;
        if (!cur) {
          get().saveSceneAs(trimmed);
          return true;
        }
        if (cur === trimmed) return true;
        set((s) => {
          const next = { ...s.savedScenes };
          const existing = next[cur];
          if (existing) {
            delete next[cur];
            next[trimmed] = { ...existing, meta: { ...existing.meta, name: trimmed } };
          }
          return {
            savedScenes: next,
            currentSceneName: trimmed,
            scene: { ...s.scene, meta: { ...s.scene.meta, name: trimmed } },
          };
        });
        return true;
      },

      exportSceneJSON: () => {
        return JSON.stringify(get().scene, null, 2);
      },

      importSceneJSON: (json, asName) => {
        let parsed: unknown;
        try {
          parsed = JSON.parse(json);
        } catch {
          return false;
        }
        if (!parsed || typeof parsed !== 'object') return false;
        const candidate = parsed as Partial<SceneJson>;
        if (!Array.isArray(candidate.objects)) return false;
        pushHistory(set, get);
        const scene: SceneJson = {
          version: 1,
          objects: snapshot(candidate.objects as SceneObject[]),
          meta: candidate.meta ?? { name: asName ?? 'Imported scene' },
        };
        set((s) => ({
          scene,
          currentSceneName: asName ?? scene.meta?.name ?? null,
          selectedId: null,
          redoStack: [],
          savedScenes: asName
            ? { ...s.savedScenes, [asName]: scene }
            : s.savedScenes,
        }));
        return true;
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
      partialize: (s) => ({
        scene: s.scene,
        savedScenes: s.savedScenes,
        currentSceneName: s.currentSceneName,
        cameraMode: s.cameraMode,
        activeStyle: s.activeStyle,
      }),
      // Normalize any persisted scene on rehydrate so objects authored
      // before a schema field existed (rotation, scale, anchored, etc.)
      // don't crash downstream consumers.
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (state.scene?.objects) {
          state.scene = { ...state.scene, objects: state.scene.objects.map(normalize) };
        }
        if (state.savedScenes) {
          const fixed: Record<string, SceneJson> = {};
          for (const [name, sc] of Object.entries(state.savedScenes)) {
            fixed[name] = { ...sc, objects: (sc.objects ?? []).map(normalize) };
          }
          state.savedScenes = fixed;
        }
      },
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
