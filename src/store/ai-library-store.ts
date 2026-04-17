import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Tracks which imported library assets (GLBs under /assets/medieval/) are
 * enabled for the AI agent to use. Enabled names are injected into the
 * studio-agent prompt so Claude can emit:
 *   ACTION: {"type":"addPart","partType":"GLB","modelName":"<name>", ...}
 *
 * Disabling an asset simply removes it from the prompt — the model stays
 * on disk and can still be dragged in manually.
 *
 * Persisted to localStorage so the user's curation survives reloads.
 */
interface AILibraryState {
  enabled: Record<string, boolean>;
  toggle: (name: string) => void;
  set: (name: string, on: boolean) => void;
  enableAll: (names: string[]) => void;
  clearAll: () => void;
}

export const useAILibraryStore = create<AILibraryState>()(
  persist(
    (set) => ({
      enabled: {},
      toggle: (name) =>
        set((s) => ({ enabled: { ...s.enabled, [name]: !s.enabled[name] } })),
      set: (name, on) =>
        set((s) => ({ enabled: { ...s.enabled, [name]: on } })),
      enableAll: (names) =>
        set(() => {
          const next: Record<string, boolean> = {};
          for (const n of names) next[n] = true;
          return { enabled: next };
        }),
      clearAll: () => set({ enabled: {} }),
    }),
    { name: 'problocks-ai-library' },
  ),
);

/** Helper: list of currently-enabled asset names. */
export function enabledLibraryList(enabled: Record<string, boolean>): string[] {
  return Object.entries(enabled).filter(([, v]) => v).map(([k]) => k);
}
