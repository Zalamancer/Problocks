import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Single toggle for which build vocabulary the AI agent uses:
 *   - 'defaults' → procedural building-kit pieces (floors, walls, roofs, …)
 *   - 'assets'   → the user's imported GLB library (/assets/medieval/*.gltf)
 *
 * Persisted so the user's choice sticks across reloads.
 */
export type BuildMode = 'defaults' | 'assets';

interface AIBuildModeState {
  mode: BuildMode;
  setMode: (m: BuildMode) => void;
}

export const useAIBuildModeStore = create<AIBuildModeState>()(
  persist(
    (set) => ({
      mode: 'defaults',
      setMode: (mode) => set({ mode }),
    }),
    { name: 'problocks-ai-build-mode' },
  ),
);
