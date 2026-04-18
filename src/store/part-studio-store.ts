/**
 * Part Studio store — session history of low-poly primitive generations.
 *
 * The learning signal lives here: prompts that produce highly-rated
 * renders accumulate in the local store, and eventually get pushed to
 * Supabase so the expander template pool can mine good phrasing. The code
 * (primitive JSON) is kept for display but is NOT the training signal —
 * we learn which *prompts* rated well, not which geometry rated well.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PartGeneration, PartModel } from '@/lib/part-studio/types';

export interface PartStudioStore {
  /** Full session history, newest-last. */
  generations: PartGeneration[];
  /** Currently-focused generation (what the viewport renders). */
  activeId: string | null;
  /** Prompt currently in the input box (kept separate from generations). */
  draftPrompt: string;
  /** Feedback textarea value for the active generation. */
  draftFeedback: string;
  /** True while an API request is in flight. */
  generating: boolean;

  setDraftPrompt: (v: string) => void;
  setDraftFeedback: (v: string) => void;
  setActiveId: (id: string | null) => void;
  setGenerating: (v: boolean) => void;

  /** Optimistically insert a placeholder row, return its id. */
  startGeneration: (args: {
    userPrompt: string;
    expandedPrompt: string;
    category: string;
    parentId: string | null;
  }) => string;

  /** Fill in the result of a started generation. */
  finishGeneration: (
    id: string,
    result:
      | { ok: true; model: PartModel; vertexCount: number }
      | { ok: false; error: string },
  ) => void;

  /** Apply a 1–5 rating to a generation. Clears on same-value click. */
  rateGeneration: (id: string, rating: number) => void;

  /** Save feedback text on a generation (does not regenerate). */
  setGenerationFeedback: (id: string, feedback: string) => void;

  /** Drop a single generation; adjusts activeId if needed. */
  removeGeneration: (id: string) => void;

  /** Drop every generation. */
  clearGenerations: () => void;
}

export const usePartStudio = create<PartStudioStore>()(
  persist(
    (set, get) => ({
      generations: [],
      activeId: null,
      draftPrompt: '',
      draftFeedback: '',
      generating: false,

      setDraftPrompt: (draftPrompt) => set({ draftPrompt }),
      setDraftFeedback: (draftFeedback) => set({ draftFeedback }),
      setActiveId: (activeId) => {
        // Pull the feedback that was stored on this generation back into the
        // draft field so the user can edit it rather than retyping.
        if (activeId) {
          const g = get().generations.find((x) => x.id === activeId);
          set({ activeId, draftFeedback: g?.feedback ?? '' });
        } else {
          set({ activeId });
        }
      },
      setGenerating: (generating) => set({ generating }),

      startGeneration: ({ userPrompt, expandedPrompt, category, parentId }) => {
        const id =
          typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `gen-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const row: PartGeneration = {
          id,
          userPrompt,
          expandedPrompt,
          category,
          model: null,
          vertexCount: 0,
          rating: null,
          feedback: null,
          parentId,
          error: null,
          createdAt: Date.now(),
        };
        set((s) => ({ generations: [...s.generations, row], activeId: id }));
        return id;
      },

      finishGeneration: (id, result) =>
        set((s) => ({
          generations: s.generations.map((g) => {
            if (g.id !== id) return g;
            if (result.ok) {
              return {
                ...g,
                model: result.model,
                vertexCount: result.vertexCount,
              };
            }
            return { ...g, error: result.error };
          }),
        })),

      rateGeneration: (id, rating) =>
        set((s) => ({
          generations: s.generations.map((g) =>
            g.id === id
              ? { ...g, rating: g.rating === rating ? null : rating }
              : g,
          ),
        })),

      setGenerationFeedback: (id, feedback) =>
        set((s) => ({
          generations: s.generations.map((g) =>
            g.id === id ? { ...g, feedback: feedback || null } : g,
          ),
        })),

      removeGeneration: (id) =>
        set((s) => {
          const generations = s.generations.filter((g) => g.id !== id);
          const activeId =
            s.activeId === id
              ? (generations[generations.length - 1]?.id ?? null)
              : s.activeId;
          return { generations, activeId };
        }),

      clearGenerations: () =>
        set({ generations: [], activeId: null, draftFeedback: '' }),
    }),
    {
      name: 'problocks-part-studio-v1',
      partialize: (s) => ({ generations: s.generations }),
    },
  ),
);
