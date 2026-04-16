import { create } from 'zustand';

export type GizmoMode = 'select' | 'move' | 'rotate' | 'scale';
export type PartType = 'Block' | 'Sphere' | 'Cylinder' | 'Wedge';
export type TexturePreset = 'None' | 'SmoothPlastic' | 'Brick' | 'Wood' | 'Metal' | 'Marble' | 'Neon' | 'Diamond';

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
}

interface SceneStore {
  gizmoMode: GizmoMode;
  selectedPart: ScenePart | null;
  sceneObjects: ScenePart[];

  setGizmoMode: (mode: GizmoMode) => void;
  setSelectedPart: (part: ScenePart | null) => void;
  updateSelectedPart: (changes: Partial<ScenePart>) => void;
  setSceneObjects: (objects: ScenePart[]) => void;
  updateSceneObject: (id: string, changes: Partial<ScenePart>) => void;
}

export const useSceneStore = create<SceneStore>((set, get) => ({
  gizmoMode: 'select',
  selectedPart: null,
  sceneObjects: [],

  setGizmoMode: (mode) => set({ gizmoMode: mode }),

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
}));
