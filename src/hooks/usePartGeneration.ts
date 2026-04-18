/**
 * Generation driver shared by the Part Studio panels.
 *
 * Centralises the fetch-to-/api/generate-part + store-side bookkeeping so
 * the left history rail, right properties panel, and center canvas all
 * stay in sync without prop drilling. Returning a simple imperative
 * `generate({...})` keeps each caller focused on its own UI affordances.
 */
'use client';
import { useCallback } from 'react';
import { usePartStudio } from '@/store/part-studio-store';
import type { GenerationUsage, PartModel } from '@/lib/part-studio/types';

export interface RunArgs {
  userPrompt: string;
  feedback: string | null;
  parentId: string | null;
}

export function usePartGeneration() {
  const {
    generating,
    generations,
    selectedModel,
    setGenerating,
    startGeneration,
    finishGeneration,
    getHints,
  } = usePartStudio();

  const generate = useCallback(
    async ({ userPrompt, feedback, parentId }: RunArgs) => {
      if (generating) return;
      const trimmed = userPrompt.trim();
      if (!trimmed) return;

      setGenerating(true);
      const parentGen = parentId ? generations.find((g) => g.id === parentId) : null;

      const id = startGeneration({
        userPrompt: trimmed,
        expandedPrompt: '',
        category: '',
        parentId,
      });

      try {
        const phraseHints = getHints(6).map((h) => h.phrase);
        const res = await fetch('/api/generate-part', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userPrompt: trimmed,
            feedback,
            parentModel: parentGen?.model ?? null,
            phraseHints,
            model: selectedModel,
          }),
        });

        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          finishGeneration(id, {
            ok: false,
            error: errBody.error || `HTTP ${res.status}`,
          });
          return;
        }

        const data = (await res.json()) as {
          model: PartModel;
          vertexCount: number;
          category?: string;
          expandedPrompt?: string;
          usage?: GenerationUsage | null;
        };
        finishGeneration(id, {
          ok: true,
          model: data.model,
          vertexCount: data.vertexCount,
          category: data.category,
          expandedPrompt: data.expandedPrompt,
          usage: data.usage ?? null,
        });
      } catch (e) {
        finishGeneration(id, {
          ok: false,
          error: (e as Error).message || 'network-error',
        });
      } finally {
        setGenerating(false);
      }
    },
    [
      generating,
      generations,
      selectedModel,
      setGenerating,
      startGeneration,
      finishGeneration,
      getHints,
    ],
  );

  return { generate, generating };
}
