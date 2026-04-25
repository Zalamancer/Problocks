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
import type {
  Behavior,
  GameLogic,
  HUDElement,
  UpgradeDef,
  VariableDef,
} from '@/lib/kid-style-3d/game-logic-schema';
import { EMPTY_GAME_LOGIC } from '@/lib/kid-style-3d/game-logic-schema';
import {
  attachBehavior as attachBehaviorPure,
  detachBehavior as detachBehaviorPure,
  clearBehaviors as clearBehaviorsPure,
  defineVariable as defineVariablePure,
  removeVariable as removeVariablePure,
  defineUpgrade as defineUpgradePure,
  removeUpgrade as removeUpgradePure,
  addHUDElement as addHUDElementPure,
  removeHUDElement as removeHUDElementPure,
  normalizeGameLogic,
} from '@/lib/kid-style-3d/game-logic';
import { getPrefabDef, DEFAULT_PREFAB_STYLE, type PrefabStyleId } from '@/lib/kid-style-3d/prefabs';
import { setGeometryPerfMode, type GeometryPerfMode } from '@/lib/kid-style-3d/geometry';
import { DEFAULT_THEME, setActiveTheme, type ThemeId } from '@/lib/kid-style-3d/themes';
import { clearPrefabThumbnailCache } from '@/components/studio/PrefabThumbnail';

const HISTORY_LIMIT = 50;

export type CameraMode = 'third' | 'first' | 'topdown' | 'isometric';

export type CameraView = 'orbit' | 'third' | 'topdown' | 'isometric';

/** World-level ambience + diagnostic controls. Exposed via the right
    panel's Workspace section and applied to the kid-engine via a React
    subscription in FreeformView3D. */
export interface WorldSettings {
  /** Active palette theme — swaps sky / fog / grass / leaf greens and
      triggers a scene rehydrate so every prefab re-reads colors. See
      lib/kid-style-3d/themes.ts. */
  theme: ThemeId;
  /** Camera preset (edit + play).
        orbit     — free OrbitControls (default); play falls back to cameraMode
        third     — angled 3/4 overhead matching the tile-based studio;
                    play forces third-person follow camera
        topdown   — straight down, pan+zoom only (RTS / Builder feel)
        isometric — fixed 45° angle, pan+zoom only
      orbit/third let users orbit freely in edit mode. topdown/isometric/third
      override the play camera mode; orbit defers to the user's cameraMode pref. */
  cameraView: CameraView;
  /** Scene background / hemi sky color (CSS hex) — legacy free-form
      override. The vivid/pastel themes now own the sky gradient; this
      field is retained for the agent's WorldLike contract and reads
      nothing on the freeform viewport. */
  skyColor: string;
  /** Sun key-light intensity (0..4). */
  brightness: number;
  /** Hemisphere-light intensity (0..2). Fills shadow sides. */
  ambient: number;
  /** 0..24 hours. Rotates the sun around the scene. */
  timeOfDay: number;
  /** Linear fog density (0..1). Scales the engine's default fog distance. */
  fogDensity: number;
  /** Render every mesh as wireframe — shows the polygon topology. */
  wireframe: boolean;
  /** Overlay small vertex dots on every geometry. */
  showVertices: boolean;
  /** Overlay live vertex/triangle counts on the viewport. */
  showStats: boolean;
}

export const DEFAULT_WORLD: WorldSettings = {
  theme: DEFAULT_THEME,
  cameraView: 'orbit',
  skyColor: '#a8dcff',
  brightness: 1.3,
  ambient: 0.7,
  timeOfDay: 14,
  fogDensity: 0.5,
  wireframe: false,
  showVertices: false,
  showStats: false,
};

/**
 * Paint-brush settings. When `enabled`, clicks/drags on the viewport
 * ground scatter copies of `kind` with randomized rotation / scale /
 * flip. Lets a user paint a forest of trees or a meadow of flowers
 * without clicking each one individually.
 *
 * Tile click while enabled sets `kind` instead of spawning. Disabling
 * the brush restores normal click-to-select / tile-to-spawn behaviour.
 */
export interface BrushSettings {
  enabled: boolean;
  /** Prefab kind the brush paints. '' when the user hasn't picked yet. */
  kind: string;
  /** Scatter = random spread in a radius (forest / meadow painting).
      Path = drag a continuous trail with tiles perpendicular to the
      motion direction. Spline = click multiple times on the ground to
      extend a single ribbon mesh that follows a Catmull-Rom curve
      through the waypoints. */
  mode: 'scatter' | 'path' | 'spline';
  /** Spline mode only — id of the path-spline SceneObject currently
      being extended. null = the next click starts a fresh path. */
  activePathId: string | null;
  /** Spline mode only — path width in world units (default 2.2). */
  pathWidth: number;
  /** Spline mode only — path thickness (height above grass).
      Ignored when pathFlat is true. */
  pathThickness: number;
  /** Spline mode only — render the path as a flat plane instead of a
      raised extruded ribbon. Halves the vertex count; good for
      top-down games or performance-sensitive builds. */
  pathFlat: boolean;
  /** How many objects to scatter per click / paint tick. 1–20.
      In 'path' mode this is the number of tiles across the path
      width (1 = single tile line; 3–5 = wide road). */
  density: number;
  /** Scatter radius around the click point, in world units (XZ jitter).
      In 'path' mode this is the half-width of the painted trail. */
  radius: number;
  /** Randomize Y rotation (0..2π) — most natural for trees/rocks/flowers. */
  randomRotY: boolean;
  /** Randomize X rotation ±tilt for the "tipped over" look. */
  randomRotX: boolean;
  /** Randomize Z rotation ±tilt. */
  randomRotZ: boolean;
  /** Max absolute tilt for X/Z random rotation in radians (0..π/4). */
  rotationTilt: number;
  /** Scale bounds for random scale. Each axis rolls independently unless
      uniformScale is true. Set min=max to disable variance cleanly. */
  scaleMin: number;
  scaleMax: number;
  /** If true, all axes share the same random factor (cheaper/safer for
      non-symmetric prefabs like houses). */
  uniformScale: boolean;
  /** 50/50 chance of negating X scale per spawn — horizontal flip. */
  randomFlip: boolean;
  /** Minimum distance between spawned objects in one click (prevents
      heavy stacking). 0 disables the check. In 'path' mode this also
      controls along-track tile spacing during a drag. */
  minSpacing: number;
}

export const DEFAULT_BRUSH: BrushSettings = {
  enabled: false,
  kind: '',
  mode: 'scatter',
  activePathId: null,
  pathWidth: 2.2,
  pathThickness: 0.2,
  pathFlat: false,
  density: 3,
  radius: 1.5,
  randomRotY: true,
  randomRotX: false,
  randomRotZ: false,
  rotationTilt: Math.PI / 16,
  scaleMin: 0.85,
  scaleMax: 1.25,
  uniformScale: true,
  randomFlip: false,
  minSpacing: 0.2,
};

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

  /** Geometry complexity. 'low' swaps every prefab's rounded-box for an
      8-vert cube, UV sphere for a 12-vert icosahedron, 12-segment
      cylinder for a 5-sided stub, etc. Drops plot vertex counts ~10×
      for users on low-end Chromebooks. Bumps `geomRev` so the viewport
      can force a scene re-hydrate against the new geometries. */
  performanceMode: GeometryPerfMode;
  setPerformanceMode: (m: GeometryPerfMode) => void;
  /** Monotonic counter bumped whenever performanceMode flips. The
      viewport subscribes to this and marks every hydrated child as
      needing a kind-rebuild on the next hydrate pass. */
  geomRev: number;

  /** World ambience/diagnostic settings. */
  world: WorldSettings;
  setWorldField: <K extends keyof WorldSettings>(k: K, v: WorldSettings[K]) => void;
  resetWorld: () => void;

  /** Paint-brush settings — click/drag on the viewport while enabled
      to scatter copies of `brush.kind` with randomized transforms. */
  brush: BrushSettings;
  setBrushField: <K extends keyof BrushSettings>(k: K, v: BrushSettings[K]) => void;
  setBrush: (patch: Partial<BrushSettings>) => void;
  resetBrush: () => void;

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

  // Game logic — tycoon scripting layer ---------------------------------
  /** Attach a click/tick behavior to a prefab. Silently no-ops if the
      prefab id isn't found (agent stale-id forgiveness). */
  attachBehavior: (prefabId: string, behavior: Behavior) => void;
  /** Remove the behavior at `index` from a prefab. */
  detachBehavior: (prefabId: string, index: number) => void;
  /** Strip every behavior from a prefab. */
  clearBehaviors: (prefabId: string) => void;

  /** Declare or replace a game-state variable (coins / wood / xp). */
  defineVariable: (def: VariableDef) => void;
  removeVariable: (name: string) => void;

  /** Add or replace a purchasable upgrade in the catalog. */
  defineUpgrade: (def: UpgradeDef) => void;
  removeUpgrade: (id: string) => void;

  /** Add or replace a HUD element (coinCounter / inventory / upgradePanel). */
  addHUDElement: (el: HUDElement) => void;
  removeHUDElement: (id: string) => void;

  /** Replace the scene's script source. Empty string clears it. */
  setScript: (source: string) => void;

  // History --------------------------------------------------------------
  undo: () => void;
  redo: () => void;
}

/** Read the scene's gameLogic, falling back to an empty container when
    the agent or a legacy save didn't initialize it. */
function readGameLogic(scene: SceneJson): GameLogic {
  return scene.gameLogic ?? { ...EMPTY_GAME_LOGIC };
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

      performanceMode: 'low',
      geomRev: 0,
      setPerformanceMode: (m) => {
        if (get().performanceMode === m) return;
        // Flip the module-level flag FIRST so any subsequent build call
        // picks up the new mode. Clears the geometry cache as a side
        // effect (entries only, no dispose).
        const changed = setGeometryPerfMode(m);
        if (!changed) return;
        // Drop all thumbnail dataURLs + stats so tiles re-render with
        // the new geometry; pending promises are left alone (worst case
        // they resolve against cleared state and just get overwritten).
        try { clearPrefabThumbnailCache(); } catch { /* ssr / no-op */ }
        set((s) => ({ performanceMode: m, geomRev: s.geomRev + 1 }));
      },

      world: DEFAULT_WORLD,
      setWorldField: (k, v) => {
        // Theme swap side-effects: push the new palette into the
        // module-level singleton (so prefab builders see new colors)
        // and bump geomRev so the viewport rehydrates every mesh with
        // the fresh palette. Everything else is a plain field set.
        if (k === 'theme') {
          setActiveTheme(v as ThemeId);
          clearPrefabThumbnailCache();
          set((s) => ({
            world: { ...s.world, theme: v as ThemeId },
            geomRev: s.geomRev + 1,
          }));
          return;
        }
        set((s) => ({ world: { ...s.world, [k]: v } }));
      },
      resetWorld: () => {
        setActiveTheme(DEFAULT_WORLD.theme);
        clearPrefabThumbnailCache();
        set((s) => ({ world: DEFAULT_WORLD, geomRev: s.geomRev + 1 }));
      },

      brush: DEFAULT_BRUSH,
      setBrushField: (k, v) =>
        set((s) => ({ brush: { ...s.brush, [k]: v } })),
      setBrush: (patch) =>
        set((s) => ({ brush: { ...s.brush, ...patch } })),
      resetBrush: () => set({ brush: DEFAULT_BRUSH }),

      select: (id) => set({ selectedId: id }),

      addPrefab: (kind, position = [0, 0, 0]) => {
        const def = getPrefabDef(kind);
        if (!def) return '';
        // Random-variation prefabs (tree-random) bake a unique seed into
        // props at spawn time so the same archetype + dimensions persist
        // across save / undo / reload. Without this, every hydrate pass
        // would regenerate a different tree for the same SceneObject.id.
        const isRandomTree = kind === 'tree-random';
        const spawnProps: Record<string, unknown> | undefined = isRandomTree
          ? { seed: Math.floor(Math.random() * 1_000_000_000) }
          : undefined;
        // Skip the default-color assignment for random trees so the
        // builder's own seeded leaf-color pick actually runs (color is
        // left undefined; the user can still override later via the
        // inspector and it'll take precedence over the random pick).
        const obj = makeSceneObject(kind, {
          position,
          color: isRandomTree ? undefined : def.defaultColor,
          props: spawnProps,
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

      // --- Game logic -------------------------------------------------

      attachBehavior: (prefabId, behavior) => {
        pushHistory(set, get);
        set((s) => ({
          scene: {
            ...s.scene,
            objects: attachBehaviorPure(s.scene.objects, prefabId, behavior),
          },
          redoStack: [],
        }));
      },

      detachBehavior: (prefabId, index) => {
        pushHistory(set, get);
        set((s) => ({
          scene: {
            ...s.scene,
            objects: detachBehaviorPure(s.scene.objects, prefabId, index),
          },
          redoStack: [],
        }));
      },

      clearBehaviors: (prefabId) => {
        pushHistory(set, get);
        set((s) => ({
          scene: {
            ...s.scene,
            objects: clearBehaviorsPure(s.scene.objects, prefabId),
          },
          redoStack: [],
        }));
      },

      defineVariable: (def) => {
        pushHistory(set, get);
        set((s) => ({
          scene: {
            ...s.scene,
            gameLogic: defineVariablePure(readGameLogic(s.scene), def),
          },
          redoStack: [],
        }));
      },

      removeVariable: (name) => {
        pushHistory(set, get);
        set((s) => ({
          scene: {
            ...s.scene,
            gameLogic: removeVariablePure(readGameLogic(s.scene), name),
          },
          redoStack: [],
        }));
      },

      defineUpgrade: (def) => {
        pushHistory(set, get);
        set((s) => ({
          scene: {
            ...s.scene,
            gameLogic: defineUpgradePure(readGameLogic(s.scene), def),
          },
          redoStack: [],
        }));
      },

      removeUpgrade: (id) => {
        pushHistory(set, get);
        set((s) => ({
          scene: {
            ...s.scene,
            gameLogic: removeUpgradePure(readGameLogic(s.scene), id),
          },
          redoStack: [],
        }));
      },

      addHUDElement: (el) => {
        pushHistory(set, get);
        set((s) => ({
          scene: {
            ...s.scene,
            gameLogic: addHUDElementPure(readGameLogic(s.scene), el),
          },
          redoStack: [],
        }));
      },

      removeHUDElement: (id) => {
        pushHistory(set, get);
        set((s) => ({
          scene: {
            ...s.scene,
            gameLogic: removeHUDElementPure(readGameLogic(s.scene), id),
          },
          redoStack: [],
        }));
      },

      setScript: (source) => {
        pushHistory(set, get);
        set((s) => ({
          scene: { ...s.scene, script: source || undefined },
          redoStack: [],
        }));
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
        world: s.world,
        performanceMode: s.performanceMode,
        brush: s.brush,
      }),
      // Normalize any persisted scene on rehydrate so objects authored
      // before a schema field existed (rotation, scale, anchored, etc.)
      // don't crash downstream consumers.
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (state.scene?.objects) {
          state.scene = {
            ...state.scene,
            objects: state.scene.objects.map(normalize),
            // Fill in gameLogic for scenes saved before slice 1 shipped.
            gameLogic: normalizeGameLogic(state.scene.gameLogic),
          };
        }
        if (state.savedScenes) {
          const fixed: Record<string, SceneJson> = {};
          for (const [name, sc] of Object.entries(state.savedScenes)) {
            fixed[name] = {
              ...sc,
              objects: (sc.objects ?? []).map(normalize),
              gameLogic: normalizeGameLogic(sc.gameLogic),
            };
          }
          state.savedScenes = fixed;
        }
        // World was introduced after the initial persisted shape; fill in
        // defaults for scenes saved before it existed.
        state.world = { ...DEFAULT_WORLD, ...(state.world ?? {}) };
        // Apply persisted theme to the palette singleton so prefab
        // thumbnails and the first hydrated scene read the right colors.
        setActiveTheme(state.world.theme);
        // Apply persisted perf mode to the geometry module so first
        // builds (thumbnails, starter scene) use the right variant.
        // Auto-migrate 'extreme' → 'low': the old Extreme label meant
        // "cubes only" but lands far from the chunky-pastel aesthetic;
        // Low (faceted icosahedra) is a much closer default. Users who
        // actually wanted the voxel look can re-select Voxel from the
        // Geometry dropdown.
        if (state.performanceMode === 'extreme') {
          state.performanceMode = 'low';
          state.geomRev = (state.geomRev ?? 0) + 1;
        }
        if (state.performanceMode) {
          setGeometryPerfMode(state.performanceMode);
        }
        // Fill in brush defaults for sessions saved before brush was
        // introduced, then force brush off on rehydrate so a refresh
        // doesn't trap the user in paint mode without knowing why.
        state.brush = { ...DEFAULT_BRUSH, ...(state.brush ?? {}), enabled: false };
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
