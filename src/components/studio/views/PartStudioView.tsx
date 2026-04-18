'use client';
import { useCallback, useMemo } from 'react';
import { ArrowLeft, Sparkles, Star, Trash2, RefreshCw, Save, X } from 'lucide-react';
import {
  PanelTextarea,
  PanelActionButton,
  PanelSection,
} from '@/components/ui';
import { useStudio } from '@/store/studio-store';
import { usePartStudio } from '@/store/part-studio-store';
import { PartPreview } from '@/components/studio/PartPreview';
import { cn } from '@/lib/utils';

export function PartStudioView() {
  const setViewMode = useStudio((s) => s.setViewMode);

  const {
    generations,
    activeId,
    draftPrompt,
    draftFeedback,
    generating,
    setDraftPrompt,
    setDraftFeedback,
    setActiveId,
    setGenerating,
    startGeneration,
    finishGeneration,
    rateGeneration,
    setGenerationFeedback,
    removeGeneration,
    clearGenerations,
  } = usePartStudio();

  const active = useMemo(
    () => generations.find((g) => g.id === activeId) ?? null,
    [generations, activeId],
  );

  const runGeneration = useCallback(
    async (args: { userPrompt: string; feedback: string | null; parentId: string | null }) => {
      if (generating) return;
      const trimmed = args.userPrompt.trim();
      if (!trimmed) return;

      setGenerating(true);
      const parentGen =
        args.parentId ? generations.find((g) => g.id === args.parentId) : null;

      const id = startGeneration({
        userPrompt: trimmed,
        expandedPrompt: '', // filled on response
        category: '',
        parentId: args.parentId,
      });

      try {
        const res = await fetch('/api/generate-part', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userPrompt: trimmed,
            feedback: args.feedback,
            parentModel: parentGen?.model ?? null,
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
          model: import('@/lib/part-studio/types').PartModel;
          vertexCount: number;
        };
        finishGeneration(id, {
          ok: true,
          model: data.model,
          vertexCount: data.vertexCount,
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
      setGenerating,
      startGeneration,
      finishGeneration,
    ],
  );

  const handleGenerate = () => {
    runGeneration({ userPrompt: draftPrompt, feedback: null, parentId: null });
  };

  const handleRegenerate = () => {
    if (!active) return;
    // Persist the note on the parent row so rating history stays honest.
    setGenerationFeedback(active.id, draftFeedback);
    runGeneration({
      userPrompt: active.userPrompt,
      feedback: draftFeedback.trim() || null,
      parentId: active.id,
    });
    setDraftFeedback('');
  };

  const handleBack = () => setViewMode('3d');

  return (
    <div className="absolute inset-0 z-30 flex bg-zinc-950 text-zinc-100">
      {/* ── History rail ───────────────────────────────────────────── */}
      <aside className="w-[132px] shrink-0 border-r border-white/5 flex flex-col">
        <div className="shrink-0 px-3 py-2.5 border-b border-white/5 flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider text-zinc-500">
            History
          </span>
          {generations.length > 0 && (
            <button
              type="button"
              title="Clear history"
              onClick={clearGenerations}
              className="text-zinc-500 hover:text-red-400 transition-colors"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2">
          {generations.length === 0 ? (
            <div className="text-[10px] text-zinc-600 text-center px-2 pt-6 leading-relaxed">
              Your generations will appear here.
            </div>
          ) : (
            [...generations].reverse().map((g) => {
              const isActive = g.id === activeId;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setActiveId(g.id)}
                  className={cn(
                    'group w-full rounded-lg border overflow-hidden transition-colors text-left',
                    isActive
                      ? 'border-accent bg-accent/10'
                      : 'border-panel-border bg-panel-surface hover:bg-panel-surface-hover',
                  )}
                >
                  <div className="aspect-square bg-zinc-900 flex items-center justify-center">
                    <HistoryThumb generation={g} isActive={isActive} />
                  </div>
                  <div className="px-1.5 py-1 border-t border-white/5">
                    <div className="text-[10px] text-zinc-300 truncate">
                      {g.userPrompt}
                    </div>
                    <div className="flex items-center gap-1 text-[9px] mt-0.5">
                      {g.rating ? (
                        <span className="text-amber-400">
                          {'★'.repeat(g.rating)}
                          <span className="text-zinc-700">{'★'.repeat(5 - g.rating)}</span>
                        </span>
                      ) : (
                        <span className="text-zinc-600">unrated</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* ── Main viewport ──────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="shrink-0 h-11 flex items-center gap-3 px-3 border-b border-white/5">
          <button
            type="button"
            onClick={handleBack}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
            title="Back to 3D workspace"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-accent" />
            <h1 className="text-sm font-medium">Part Studio</h1>
          </div>
          {active?.model && (
            <div className="ml-3 text-[11px] text-zinc-500">
              <span className="font-mono text-zinc-300">{active.vertexCount}</span> verts
              <span className="mx-1.5 text-zinc-700">·</span>
              <span className="font-mono text-zinc-300">{active.model.parts.length}</span> parts
              {active.category && (
                <>
                  <span className="mx-1.5 text-zinc-700">·</span>
                  <span className="capitalize">{active.category}</span>
                </>
              )}
            </div>
          )}
        </header>

        {/* Preview */}
        <div className="flex-1 min-h-0 relative">
          {active?.error ? (
            <ErrorOverlay error={active.error} />
          ) : active?.model ? (
            <PartPreview model={active.model} />
          ) : active && !active.model ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <LoadingBlock label={`Generating "${active.userPrompt}"…`} />
            </div>
          ) : (
            <EmptyPreview />
          )}
        </div>
      </main>

      {/* ── Right sidebar ──────────────────────────────────────────── */}
      <aside className="w-[320px] shrink-0 border-l border-white/5 flex flex-col bg-zinc-950/80">
        <div className="flex-1 min-h-0 overflow-y-auto">
          <PanelSection collapsible title="Prompt" defaultOpen>
            <PanelTextarea
              value={draftPrompt}
              onChange={setDraftPrompt}
              placeholder="e.g. make a knight with grey armor"
              rows={3}
              disabled={generating}
            />
            <div className="mt-2">
              <PanelActionButton
                onClick={handleGenerate}
                variant="primary"
                icon={Sparkles}
                fullWidth
                disabled={generating || !draftPrompt.trim()}
              >
                {generating ? 'Generating…' : 'Generate'}
              </PanelActionButton>
            </div>
          </PanelSection>

          <PanelSection
            collapsible
            title="Rate this result"
            defaultOpen={!!active?.model}
          >
            <RatingStars
              value={active?.rating ?? null}
              onChange={(v) => active && rateGeneration(active.id, v)}
              disabled={!active?.model}
            />
            <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed">
              Ratings train which prompts work. The code itself isn&apos;t
              scored — we learn from what you <em>asked</em>, not what Claude wrote.
            </p>
          </PanelSection>

          <PanelSection
            collapsible
            title="What's wrong?"
            defaultOpen={!!active?.model}
          >
            <PanelTextarea
              value={draftFeedback}
              onChange={setDraftFeedback}
              placeholder="e.g. head is too big, needs a red cape"
              rows={3}
              disabled={!active?.model || generating}
            />
            <div className="mt-2">
              <PanelActionButton
                onClick={handleRegenerate}
                variant="secondary"
                icon={RefreshCw}
                fullWidth
                disabled={
                  generating || !active?.model || !draftFeedback.trim()
                }
              >
                Regenerate with notes
              </PanelActionButton>
            </div>
          </PanelSection>

          {active?.model && (
            <PanelSection collapsible title="Manage" defaultOpen={false}>
              <PanelActionButton
                onClick={() => removeGeneration(active.id)}
                variant="destructive"
                icon={X}
                fullWidth
              >
                Delete this generation
              </PanelActionButton>
            </PanelSection>
          )}
        </div>

        {/* Sticky primary action — Save to Assets (placeholder for now) */}
        <footer className="shrink-0 px-4 py-3 border-t border-white/5">
          <PanelActionButton
            onClick={() => {
              // Saving to the studio asset library lives in a follow-up
              // commit once the Models tab has a "custom" bucket. For now
              // this is the intentional stub so the sticky footer matches
              // the panel-rule spec.
              alert(
                'Save to Assets lands in the next commit once the custom-models bucket is wired up.',
              );
            }}
            variant="primary"
            icon={Save}
            fullWidth
            disabled={!active?.model || (active?.rating ?? 0) < 1}
          >
            Save to Assets
          </PanelActionButton>
          {active?.model && (active?.rating ?? 0) < 1 && (
            <p className="text-[10px] text-zinc-500 mt-1.5 text-center">
              Rate this generation to save it.
            </p>
          )}
        </footer>
      </aside>
    </div>
  );
}

// ── Subcomponents ───────────────────────────────────────────────────────

function RatingStars({
  value,
  onChange,
  disabled,
}: {
  value: number | null;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = value !== null && n <= value;
        return (
          <button
            key={n}
            type="button"
            onClick={() => !disabled && onChange(n)}
            disabled={disabled}
            className={cn(
              'h-8 w-8 rounded-lg flex items-center justify-center transition-colors',
              disabled
                ? 'text-zinc-700 cursor-not-allowed'
                : filled
                  ? 'text-amber-400 hover:bg-white/5'
                  : 'text-zinc-600 hover:text-zinc-400 hover:bg-white/5',
            )}
            title={`Rate ${n}`}
          >
            <Star size={18} fill={filled ? 'currentColor' : 'none'} />
          </button>
        );
      })}
    </div>
  );
}

function HistoryThumb({
  generation,
  isActive,
}: {
  generation: import('@/lib/part-studio/types').PartGeneration;
  isActive: boolean;
}) {
  if (generation.error) {
    return (
      <div className="text-red-400/70 text-[10px]">err</div>
    );
  }
  if (!generation.model) {
    return <div className="text-zinc-600 text-[10px] animate-pulse">…</div>;
  }
  // Cheap visual: colored dots proportional to first few primitive colors.
  const palette = Array.from(
    new Set(generation.model.parts.map((p) => p.color)),
  ).slice(0, 4);
  return (
    <div className={cn('flex gap-0.5', isActive && 'ring-1 ring-accent rounded')}>
      {palette.map((c, i) => (
        <span
          key={i}
          className="w-4 h-4 rounded-sm border border-white/10"
          style={{ backgroundColor: c }}
        />
      ))}
    </div>
  );
}

function LoadingBlock({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="w-12 h-12 rounded-2xl border border-white/10 flex items-center justify-center animate-pulse">
        <Sparkles size={20} className="text-accent" />
      </div>
      <div className="text-sm text-zinc-300">{label}</div>
      <div className="text-[11px] text-zinc-500">
        Claude is placing primitives within the 100-vertex budget…
      </div>
    </div>
  );
}

function ErrorOverlay({ error }: { error: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="max-w-sm text-center">
        <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-red-500/15 text-red-400 mb-3">
          <X size={16} />
        </div>
        <div className="text-sm text-zinc-200 mb-1">Generation failed</div>
        <div className="text-[11px] text-zinc-500 font-mono break-all">{error}</div>
      </div>
    </div>
  );
}

function EmptyPreview() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="max-w-sm text-center">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-accent/10 text-accent mb-4">
          <Sparkles size={24} />
        </div>
        <h2 className="text-lg font-medium text-zinc-100 mb-2">
          Generate your first low-poly asset
        </h2>
        <p className="text-sm text-zinc-500 leading-relaxed">
          Type a short prompt like <span className="text-zinc-300">&ldquo;make a knight&rdquo;</span>.
          Claude will compose it from ≤12 primitives so the whole asset stays
          under 100 vertices.
        </p>
      </div>
    </div>
  );
}
