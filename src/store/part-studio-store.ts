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
import type {
  ClaudeModelId,
  GenerationUsage,
  PartGeneration,
  PartModel,
} from '@/lib/part-studio/types';
import { DEFAULT_MODEL } from '@/lib/part-studio/models';
import {
  applyRatingToPhrases,
  unapplyRatingFromPhrases,
  topPhrases,
  type PhraseStats,
  type RankedPhrase,
} from '@/lib/part-studio/learning';

/** A generation the user explicitly saved to the permanent asset library. */
export interface SavedPartModel {
  id: string;
  /** Human-editable name — defaults to the model.name on save. */
  name: string;
  model: PartModel;
  vertexCount: number;
  /** The prompt that produced this model, kept for phrase mining. */
  sourcePrompt: string;
  /** Rating at save time. Saves are always ≥ 1 star. */
  rating: number;
  createdAt: number;
}

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

  /** Per-phrase rating aggregates — the learning signal. */
  phraseStats: PhraseStats;

  /** Permanent custom models (surfaced in Assets → Models). */
  savedModels: SavedPartModel[];

  /** Which Claude model the next generation should run on. */
  selectedModel: ClaudeModelId;

  setDraftPrompt: (v: string) => void;
  setDraftFeedback: (v: string) => void;
  setActiveId: (id: string | null) => void;
  setGenerating: (v: boolean) => void;
  setSelectedModel: (m: ClaudeModelId) => void;

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
      | {
          ok: true;
          model: PartModel;
          vertexCount: number;
          category?: string;
          expandedPrompt?: string;
          usage?: GenerationUsage | null;
        }
      | { ok: false; error: string; usage?: GenerationUsage | null },
  ) => void;

  /**
   * Apply a 1–5 rating to a generation. Clears on same-value click. Also
   * updates phraseStats so good prompts beat bad prompts on future
   * hint selection.
   */
  rateGeneration: (id: string, rating: number) => void;

  /** Save feedback text on a generation (does not regenerate). */
  setGenerationFeedback: (id: string, feedback: string) => void;

  /** Drop a single generation; adjusts activeId if needed. */
  removeGeneration: (id: string) => void;

  /** Drop every generation (keeps saved models and phrase stats). */
  clearGenerations: () => void;

  /** Persist the active generation to the custom asset library. */
  saveActiveToLibrary: () => string | null;

  /** Remove a saved custom model. */
  removeSavedModel: (id: string) => void;

  /** Rename a saved custom model. */
  renameSavedModel: (id: string, name: string) => void;

  /** Suggest hint phrases to steer future generations in a category. */
  getHints: (limit?: number) => RankedPhrase[];
}

export const usePartStudio = create<PartStudioStore>()(
  persist(
    (set, get) => ({
      generations: [],
      activeId: null,
      draftPrompt: '',
      draftFeedback: '',
      generating: false,
      phraseStats: {},
      savedModels: [],
      selectedModel: DEFAULT_MODEL,

      setDraftPrompt: (draftPrompt) => set({ draftPrompt }),
      setDraftFeedback: (draftFeedback) => set({ draftFeedback }),
      setSelectedModel: (selectedModel) => set({ selectedModel }),
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
          usage: null,
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
                category: result.category ?? g.category,
                expandedPrompt: result.expandedPrompt ?? g.expandedPrompt,
                usage: result.usage ?? g.usage,
              };
            }
            return { ...g, error: result.error, usage: result.usage ?? g.usage };
          }),
        })),

      rateGeneration: (id, rating) =>
        set((s) => {
          const prev = s.generations.find((x) => x.id === id);
          if (!prev) return s;
          const clearing = prev.rating === rating;
          const newRating = clearing ? null : rating;

          // Phrase-mining: undo the previous rating's contribution (if any),
          // then add the new one. This keeps stats a true reflection of
          // the user's *current* opinion, not a running tally of clicks.
          let phraseStats = s.phraseStats;
          if (prev.rating !== null) {
            phraseStats = unapplyRatingFromPhrases(
              phraseStats,
              prev.userPrompt,
              prev.rating,
            );
          }
          if (newRating !== null) {
            phraseStats = applyRatingToPhrases(
              phraseStats,
              prev.userPrompt,
              newRating,
            );
          }

          return {
            generations: s.generations.map((g) =>
              g.id === id ? { ...g, rating: newRating } : g,
            ),
            phraseStats,
          };
        }),

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

      saveActiveToLibrary: () => {
        const s = get();
        const active = s.generations.find((g) => g.id === s.activeId);
        if (!active || !active.model) return null;
        const rating = active.rating ?? 0;
        if (rating < 1) return null; // UX contract: rate before saving

        const id =
          typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `saved-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

        const saved: SavedPartModel = {
          id,
          name: active.model.name || active.userPrompt.slice(0, 30) || 'part',
          model: active.model,
          vertexCount: active.vertexCount,
          sourcePrompt: active.userPrompt,
          rating,
          createdAt: Date.now(),
        };
        set((prev) => ({ savedModels: [...prev.savedModels, saved] }));
        return id;
      },

      removeSavedModel: (id) =>
        set((s) => ({
          savedModels: s.savedModels.filter((m) => m.id !== id),
        })),

      renameSavedModel: (id, name) =>
        set((s) => ({
          savedModels: s.savedModels.map((m) =>
            m.id === id ? { ...m, name } : m,
          ),
        })),

      getHints: (limit = 6) => topPhrases(get().phraseStats, { limit }),
    }),
    {
      name: 'problocks-part-studio-v1',
      partialize: (s) => ({
        generations: s.generations,
        savedModels: s.savedModels,
        phraseStats: s.phraseStats,
        selectedModel: s.selectedModel,
      }),
    },
  ),
);
