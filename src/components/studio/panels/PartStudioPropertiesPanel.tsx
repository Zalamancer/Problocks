/**
 * Part Studio — right properties panel.
 *
 * Hosts the full generation workflow for a low-poly part:
 *  - Prompt + model selector → Generate
 *  - Star rating (the learning signal)
 *  - "What's wrong?" feedback → Regenerate with notes
 *  - Collapsible usage + session cost breakdown
 *  - Sticky footer "Save to Assets" (gated by a ≥1 star rating)
 *
 * Mirrors AutoAnimation's RightPanel shell (glass aside, collapsible
 * PanelSections, sticky primary action footer) per the project's strict
 * component rules — see CLAUDE.md.
 */
'use client';
import { useMemo } from 'react';
import { Sparkles, Star, RefreshCw, Save, X, Check } from 'lucide-react';
import {
  PanelTextarea,
  PanelActionButton,
  PanelSection,
  PanelSelect,
} from '@/components/ui';
import { usePartStudio } from '@/store/part-studio-store';
import { usePartGeneration } from '@/hooks/usePartGeneration';
import { useToastStore } from '@/store/toast-store';
import {
  MODEL_CATALOG,
  MODEL_ORDER,
  formatUsd,
  formatTokens,
} from '@/lib/part-studio/models';
import type { ClaudeModelId } from '@/lib/part-studio/types';
import { cn } from '@/lib/utils';

export function PartStudioPropertiesPanel() {
  const {
    generations,
    activeId,
    draftPrompt,
    draftFeedback,
    savedModels,
    selectedModel,
    setDraftPrompt,
    setDraftFeedback,
    setSelectedModel,
    rateGeneration,
    setGenerationFeedback,
    removeGeneration,
    saveActiveToLibrary,
  } = usePartStudio();

  const { generate, generating } = usePartGeneration();
  const addToast = useToastStore((s) => s.addToast);

  const active = useMemo(
    () => generations.find((g) => g.id === activeId) ?? null,
    [generations, activeId],
  );

  const sessionTotals = useMemo(() => {
    let cost = 0;
    let inTok = 0;
    let outTok = 0;
    let count = 0;
    for (const g of generations) {
      if (!g.usage) continue;
      cost += g.usage.costUsd || 0;
      inTok += g.usage.inputTokens || 0;
      outTok += g.usage.outputTokens || 0;
      count++;
    }
    return { cost, inTok, outTok, count };
  }, [generations]);

  const alreadySaved = useMemo(() => {
    if (!active?.model) return false;
    return savedModels.some(
      (m) =>
        m.sourcePrompt === active.userPrompt &&
        m.model.parts.length === active.model!.parts.length &&
        m.createdAt >= active.createdAt,
    );
  }, [active, savedModels]);

  const handleGenerate = () => {
    generate({ userPrompt: draftPrompt, feedback: null, parentId: null });
  };

  const handleRegenerate = () => {
    if (!active) return;
    setGenerationFeedback(active.id, draftFeedback);
    generate({
      userPrompt: active.userPrompt,
      feedback: draftFeedback.trim() || null,
      parentId: active.id,
    });
    setDraftFeedback('');
  };

  const handleSave = () => {
    const savedId = saveActiveToLibrary();
    if (savedId) {
      addToast('success', 'Saved to Assets → Models → Custom.');
    } else {
      addToast('warning', 'Rate this generation (≥ 1 star) before saving.');
    }
  };

  return (
    <aside className="w-full md:w-[280px] flex flex-col bg-zinc-900/80 backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden shrink-0">
      {/* Header */}
      <div className="shrink-0 px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
        <Sparkles size={14} className="text-accent shrink-0" />
        <span className="text-zinc-200 text-sm font-semibold truncate flex-1">
          Part Studio
        </span>
        <span className="text-zinc-600 text-xs capitalize">
          {active?.category || 'prompt'}
        </span>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <PanelSection collapsible title="Prompt" defaultOpen>
          <PanelTextarea
            value={draftPrompt}
            onChange={setDraftPrompt}
            placeholder="e.g. make a knight with grey armor"
            rows={3}
            disabled={generating}
          />
          <div className="mt-3">
            <PanelSelect
              label="Model"
              value={selectedModel}
              onChange={(v) => setSelectedModel(v as ClaudeModelId)}
              options={MODEL_ORDER.map((id) => ({
                value: id,
                label: MODEL_CATALOG[id].label,
              }))}
            />
            <p className="text-[10px] text-zinc-500 mt-1.5 leading-relaxed">
              {MODEL_CATALOG[selectedModel].tagline}
            </p>
          </div>
          <div className="mt-3">
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
            scored — we learn from what you <em>asked</em>, not what Claude
            wrote.
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
              disabled={generating || !active?.model || !draftFeedback.trim()}
            >
              Regenerate with notes
            </PanelActionButton>
          </div>
        </PanelSection>

        {active?.usage && (
          <PanelSection collapsible title="Usage & cost" defaultOpen={false}>
            <div className="space-y-1.5 text-[11px]">
              <Row label="Model">
                <span className="font-mono text-zinc-300">
                  {active.usage.modelFull}
                </span>
              </Row>
              <Row label="Input tokens">
                <span className="font-mono text-zinc-300">
                  {active.usage.inputTokens.toLocaleString()}
                </span>
              </Row>
              <Row label="Output tokens">
                <span className="font-mono text-zinc-300">
                  {active.usage.outputTokens.toLocaleString()}
                </span>
              </Row>
              {active.usage.cacheReadTokens > 0 && (
                <Row label="Cache read">
                  <span className="font-mono text-zinc-400">
                    {active.usage.cacheReadTokens.toLocaleString()}
                  </span>
                </Row>
              )}
              {active.usage.cacheCreationTokens > 0 && (
                <Row label="Cache write">
                  <span className="font-mono text-zinc-400">
                    {active.usage.cacheCreationTokens.toLocaleString()}
                  </span>
                </Row>
              )}
              <Row label="Cost">
                <span className="font-mono text-accent">
                  {formatUsd(active.usage.costUsd)}
                </span>
              </Row>
              <Row label="Duration">
                <span className="font-mono text-zinc-400">
                  {(active.usage.durationMs / 1000).toFixed(2)}s
                </span>
              </Row>
            </div>
            {sessionTotals.count > 0 && (
              <div className="mt-3 pt-3 border-t border-white/5 space-y-1.5 text-[11px]">
                <div className="text-[10px] uppercase tracking-wider text-zinc-500">
                  Session total · {sessionTotals.count} run
                  {sessionTotals.count === 1 ? '' : 's'}
                </div>
                <Row label="Tokens in/out">
                  <span className="font-mono text-zinc-300">
                    {formatTokens(sessionTotals.inTok)} /{' '}
                    {formatTokens(sessionTotals.outTok)}
                  </span>
                </Row>
                <Row label="Cost">
                  <span className="font-mono text-accent">
                    {formatUsd(sessionTotals.cost)}
                  </span>
                </Row>
              </div>
            )}
          </PanelSection>
        )}

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

      {/* Sticky primary action — rating-gated save, matches the project's
          "primary action pinned to the bottom in a sticky footer" rule. */}
      <footer className="shrink-0 px-4 py-3 border-t border-white/5">
        <PanelActionButton
          onClick={handleSave}
          variant="primary"
          icon={alreadySaved ? Check : Save}
          fullWidth
          disabled={
            !active?.model || (active?.rating ?? 0) < 1 || alreadySaved
          }
        >
          {alreadySaved ? 'Saved to Assets' : 'Save to Assets'}
        </PanelActionButton>
        {active?.model && (active?.rating ?? 0) < 1 && !alreadySaved && (
          <p className="text-[10px] text-zinc-500 mt-1.5 text-center">
            Rate this generation to save it.
          </p>
        )}
      </footer>
    </aside>
  );
}

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

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-zinc-500">{label}</span>
      {children}
    </div>
  );
}
