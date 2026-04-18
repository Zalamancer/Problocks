import { create } from 'zustand';

export type GizmoMode = 'select' | 'move' | 'rotate' | 'scale';
export type PartType = 'Block' | 'Sphere' | 'Cylinder' | 'Wedge' | 'GLB';
export type TexturePreset = 'None' | 'SmoothPlastic' | 'Brick' | 'Wood' | 'Metal' | 'Marble' | 'Neon' | 'Diamond' | 'Studs' | 'StudsSquare';

export interface ScenePart {
  id: string;
  name: string;
  partType: PartType;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  color: string;           // hex e.g. '#ff4444'
  roughness: number;
  metalness: number;
  emissiveColor: string;
  emissiveIntensity: number;
  texture: TexturePreset;
  castShadow: boolean;
  anchored: boolean;
  visible: boolean;
  /** For partType === 'GLB', the asset name (without extension) under /assets/medieval/. */
  modelName?: string;
}

interface SceneStore {
  gizmoMode: GizmoMode;
  selectedPart: ScenePart | null;
  sceneObjects: ScenePart[];
  isPlaying: boolean;

  setGizmoMode: (mode: GizmoMode) => void;
  setIsPlaying: (playing: boolean) => void;
  setSelectedPart: (part: ScenePart | null) => void;
  updateSelectedPart: (changes: Partial<ScenePart>) => void;
  setSceneObjects: (objects: ScenePart[]) => void;
  updateSceneObject: (id: string, changes: Partial<ScenePart>) => void;

  /** Append a new part to the scene. Missing fields get sensible defaults. */
  addPart: (partial: Partial<ScenePart>) => ScenePart;
  /** Remove a part by id (also deselects it if selected). */
  removePart: (id: string) => void;
}

function defaultPart(overrides: Partial<ScenePart> = {}): ScenePart {
  const id = overrides.id ?? crypto.randomUUID().slice(0, 12);
  return {
    id,
    name: overrides.name ?? `Part_${id.slice(0, 4)}`,
    partType: overrides.partType ?? 'Block',
    position: overrides.position ?? { x: 0, y: 0.5, z: 0 },
    rotation: overrides.rotation ?? { x: 0, y: 0, z: 0 },
    scale: overrides.scale ?? { x: 1, y: 1, z: 1 },
    color: overrides.color ?? '#18a5e6',
    roughness: overrides.roughness ?? 0.3,
    metalness: overrides.metalness ?? 0,
    emissiveColor: overrides.emissiveColor ?? '#000000',
    emissiveIntensity: overrides.emissiveIntensity ?? 0,
    texture: overrides.texture ?? 'SmoothPlastic',
    castShadow: overrides.castShadow ?? true,
    anchored: overrides.anchored ?? true,
    visible: overrides.visible ?? true,
    modelName: overrides.modelName,
  };
}

export const useSceneStore = create<SceneStore>((set, get) => ({
  gizmoMode: 'select',
  selectedPart: null,
  sceneObjects: [],
  isPlaying: false,

  setGizmoMode: (mode) => set({ gizmoMode: mode }),

  setIsPlaying: (playing) => set({ isPlaying: playing }),

  setSelectedPart: (part) => set({ selectedPart: part }),

  updateSelectedPart: (changes) =>
    set((s) => {
      if (!s.selectedPart) return s;
      const updated = { ...s.selectedPart, ...changes };
      return {
        selectedPart: updated,
        sceneObjects: s.sceneObjects.map((o) =>
          o.id === updated.id ? updated : o
        ),
      };
    }),

  setSceneObjects: (objects) => set({ sceneObjects: objects }),

  updateSceneObject: (id, changes) =>
    set((s) => ({
      sceneObjects: s.sceneObjects.map((o) => (o.id === id ? { ...o, ...changes } : o)),
      selectedPart:
        s.selectedPart?.id === id
          ? { ...s.selectedPart, ...changes }
          : s.selectedPart,
    })),

  addPart: (partial) => {
    const part = defaultPart(partial);
    set((s) => ({
      sceneObjects: [...s.sceneObjects, part],
      selectedPart: part,
    }));
    return part;
  },

  removePart: (id) =>
    set((s) => ({
      sceneObjects: s.sceneObjects.filter((o) => o.id !== id),
      selectedPart: s.selectedPart?.id === id ? null : s.selectedPart,
    })),
}));
