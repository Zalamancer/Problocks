/**
 * Part Studio — left-panel tab.
 *
 * Sits alongside Scene / Assets / Chat in the LeftPanel. Uses the same
 * white-pill `PanelIconTabs` bar that AssetsPanel uses for Models/Parts
 * (see commit 05b9ec5) for its Generate/History sub-tabs.
 *
 * - Generate sub-tab: prompt + model select + inline 3D preview + rating
 *   + feedback + sticky Save footer.
 * - History sub-tab: scrollable 2-col thumbnail grid of past generations.
 *
 * Everything outside the left panel (center workspace, right properties
 * panel) stays untouched — per user feedback, this is a self-contained
 * tab rather than a layout takeover.
 */
'use client';
import { useMemo } from 'react';
import {
  Sparkles,
  Star,
  RefreshCw,
  Save,
  X,
  Check,
  Wand2,
  History,
  Trash2,
} from 'lucide-react';
import {
  PanelTextarea,
  PanelActionButton,
  PanelSection,
  PanelSelect,
} from '@/components/ui';
import { PanelIconTabs } from '@/components/ui/panel-controls/PanelIconTabs';
import { useStudio, type PartsTab } from '@/store/studio-store';
import { usePartStudio } from '@/store/part-studio-store';
import { usePartGeneration } from '@/hooks/usePartGeneration';
import { useToastStore } from '@/store/toast-store';
import { PartPreview } from '@/components/studio/PartPreview';
import {
  MODEL_CATALOG,
  MODEL_ORDER,
  formatUsd,
  formatTokens,
} from '@/lib/part-studio/models';
import type {
  ClaudeModelId,
  PartGeneration,
} from '@/lib/part-studio/types';
import { cn } from '@/lib/utils';

const PARTS_SUBTABS: { id: PartsTab; label: string; icon: typeof Wand2 }[] = [
  { id: 'generate', label: 'Generate', icon: Wand2 },
  { id: 'history',  label: 'History',  icon: History },
];

export function PartStudioPanel() {
  const tab = useStudio((s) => s.partsActiveTab);
  const setTab = useStudio((s) => s.setPartsActiveTab);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <PanelIconTabs
        tabs={PARTS_SUBTABS}
        activeTab={tab}
        onChange={(id) => setTab(id as PartsTab)}
      />
      {tab === 'generate' ? <GenerateView /> : <HistoryView />}
    </div>
  );
}

// ── Generate sub-tab ─────────────────────────────────────────────────────

function GenerateView() {
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
    <div className="flex-1 min-h-0 flex flex-col">
      {/* Scrollable body */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* Inline preview — small but enough to judge a 100-vert asset. */}
        <div className="shrink-0 px-3 pt-3">
          <div className="relative aspect-square rounded-lg border border-panel-border bg-zinc-950 overflow-hidden">
            {active?.error ? (
              <InlineError error={active.error} />
            ) : active?.model ? (
              <PartPreview model={active.model} />
            ) : active && !active.model ? (
              <InlineLoading label={active.userPrompt} />
            ) : (
              <InlineEmpty />
            )}
            {active?.model && (
              <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between text-[10px] pointer-events-none">
                <span className="px-1.5 py-0.5 rounded bg-black/60 text-zinc-200 font-mono">
                  {active.vertexCount}v · {active.model.parts.length}p
                </span>
                {active.usage && (
                  <span className="px-1.5 py-0.5 rounded bg-black/60 text-accent font-mono">
                    {formatUsd(active.usage.costUsd)}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

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

        <PanelSection collapsible title="Rate" defaultOpen={!!active?.model}>
          <RatingStars
            value={active?.rating ?? null}
            onChange={(v) => active && rateGeneration(active.id, v)}
            disabled={!active?.model}
          />
          <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed">
            Ratings train which prompts work. We learn from what you{' '}
            <em>asked</em>, not what Claude wrote.
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
            placeholder="e.g. head too big, needs a red cape"
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
            <UsageBody />
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

      {/* Sticky save footer — matches right-panel convention elsewhere. */}
      <footer className="shrink-0 px-3 py-3 border-t border-white/5">
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
    </div>
  );
}

// ── History sub-tab ─────────────────────────────────────────────────────

function HistoryView() {
  const { generations, activeId, setActiveId, clearGenerations } = usePartStudio();
  const setPartsActiveTab = useStudio((s) => s.setPartsActiveTab);

  if (generations.length === 0) {
    return (
      <div className="flex-1 min-h-0 flex items-center justify-center px-6 text-center">
        <div>
          <History size={24} className="mx-auto text-zinc-700 mb-2" />
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            No generations yet.
            <br />
            <span className="text-zinc-600">
              Switch to Generate and describe an asset to get started.
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="shrink-0 px-3 py-2 border-b border-white/5 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-zinc-500">
          {generations.length} run{generations.length === 1 ? '' : 's'}
        </span>
        <button
          type="button"
          onClick={clearGenerations}
          title="Clear all generations"
          className="h-6 w-6 rounded-md flex items-center justify-center text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <Trash2 size={12} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-2">
        <div className="grid grid-cols-2 gap-1.5">
          {[...generations].reverse().map((g) => (
            <HistoryCard
              key={g.id}
              gen={g}
              isActive={g.id === activeId}
              onClick={() => {
                setActiveId(g.id);
                setPartsActiveTab('generate');
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Shared small components ─────────────────────────────────────────────

function HistoryCard({
  gen,
  isActive,
  onClick,
}: {
  gen: PartGeneration;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group rounded-lg border overflow-hidden transition-colors text-left',
        isActive
          ? 'border-accent bg-accent/10'
          : 'border-panel-border bg-panel-surface hover:bg-panel-surface-hover',
      )}
    >
      <div className="aspect-square bg-zinc-900 flex items-center justify-center">
        <HistoryThumb generation={gen} isActive={isActive} />
      </div>
      <div className="px-1.5 py-1 border-t border-white/5">
        <div className="text-[10px] text-zinc-300 truncate">{gen.userPrompt}</div>
        <div className="flex items-center gap-1 text-[9px] mt-0.5">
          {gen.rating ? (
            <span className="text-amber-400">
              {'★'.repeat(gen.rating)}
              <span className="text-zinc-700">{'★'.repeat(5 - gen.rating)}</span>
            </span>
          ) : (
            <span className="text-zinc-600">unrated</span>
          )}
        </div>
      </div>
    </button>
  );
}

function HistoryThumb({
  generation,
  isActive,
}: {
  generation: PartGeneration;
  isActive: boolean;
}) {
  if (generation.error) return <div className="text-red-400/70 text-[10px]">err</div>;
  if (!generation.model) return <div className="text-zinc-600 text-[10px] animate-pulse">…</div>;
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
              'h-7 w-7 rounded-lg flex items-center justify-center transition-colors',
              disabled
                ? 'text-zinc-700 cursor-not-allowed'
                : filled
                  ? 'text-amber-400 hover:bg-white/5'
                  : 'text-zinc-600 hover:text-zinc-400 hover:bg-white/5',
            )}
            title={`Rate ${n}`}
          >
            <Star size={16} fill={filled ? 'currentColor' : 'none'} />
          </button>
        );
      })}
    </div>
  );
}

function UsageBody() {
  const { generations, activeId } = usePartStudio();
  const active = generations.find((g) => g.id === activeId) ?? null;

  const totals = useMemo(() => {
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

  if (!active?.usage) return null;

  return (
    <>
      <div className="space-y-1.5 text-[11px]">
        <Row label="Model">
          <span className="font-mono text-zinc-300">{active.usage.modelFull}</span>
        </Row>
        <Row label="Input">
          <span className="font-mono text-zinc-300">
            {active.usage.inputTokens.toLocaleString()}
          </span>
        </Row>
        <Row label="Output">
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
        <Row label="Cost">
          <span className="font-mono text-accent">{formatUsd(active.usage.costUsd)}</span>
        </Row>
        <Row label="Duration">
          <span className="font-mono text-zinc-400">
            {(active.usage.durationMs / 1000).toFixed(2)}s
          </span>
        </Row>
      </div>
      {totals.count > 0 && (
        <div className="mt-3 pt-3 border-t border-white/5 space-y-1.5 text-[11px]">
          <div className="text-[10px] uppercase tracking-wider text-zinc-500">
            Session · {totals.count} run{totals.count === 1 ? '' : 's'}
          </div>
          <Row label="In/out">
            <span className="font-mono text-zinc-300">
              {formatTokens(totals.inTok)} / {formatTokens(totals.outTok)}
            </span>
          </Row>
          <Row label="Cost">
            <span className="font-mono text-accent">{formatUsd(totals.cost)}</span>
          </Row>
        </div>
      )}
    </>
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

function InlineEmpty() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3">
      <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-accent/10 text-accent mb-2">
        <Sparkles size={16} />
      </div>
      <p className="text-[11px] text-zinc-400">Enter a prompt below</p>
      <p className="text-[10px] text-zinc-600 mt-0.5">≤ 12 primitives · ~100 verts</p>
    </div>
  );
}

function InlineLoading({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3">
      <div className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center animate-pulse mb-2">
        <Sparkles size={14} className="text-accent" />
      </div>
      <p className="text-[11px] text-zinc-300 truncate max-w-full">
        Generating &ldquo;{label}&rdquo;
      </p>
    </div>
  );
}

function InlineError({ error }: { error: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3">
      <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-red-500/15 text-red-400 mb-2">
        <X size={14} />
      </div>
      <p className="text-[11px] text-zinc-300 mb-0.5">Generation failed</p>
      <p className="text-[10px] text-zinc-600 font-mono break-all line-clamp-3">{error}</p>
    </div>
  );
}
