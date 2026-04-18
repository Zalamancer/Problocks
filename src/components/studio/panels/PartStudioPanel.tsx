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
          <div
            className="relative aspect-square overflow-hidden"
            style={{
              borderRadius: 12,
              background: 'var(--pb-cream-2)',
              border: '1.5px solid var(--pb-line-2)',
            }}
          >
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
              <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between pointer-events-none">
                <span
                  style={{
                    padding: '2px 7px',
                    borderRadius: 999,
                    background: 'var(--pb-paper)',
                    border: '1.5px solid var(--pb-line-2)',
                    color: 'var(--pb-ink)',
                    fontFamily: 'DM Mono, monospace',
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  {active.vertexCount}v · {active.model.parts.length}p
                </span>
                {active.usage && (
                  <span
                    style={{
                      padding: '2px 7px',
                      borderRadius: 999,
                      background: 'var(--pb-mint)',
                      border: '1.5px solid var(--pb-mint-ink)',
                      color: 'var(--pb-mint-ink)',
                      fontFamily: 'DM Mono, monospace',
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
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
            <p
              className="mt-1.5 leading-relaxed"
              style={{ fontSize: 10.5, color: 'var(--pb-ink-muted)' }}
            >
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
          <p
            className="mt-2 leading-relaxed"
            style={{ fontSize: 11, color: 'var(--pb-ink-muted)' }}
          >
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
      <footer
        className="shrink-0 px-3 py-3"
        style={{ borderTop: '1.5px solid var(--pb-line-2)' }}
      >
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
          <p
            className="mt-1.5 text-center"
            style={{ fontSize: 10.5, color: 'var(--pb-ink-muted)' }}
          >
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
          <div
            className="mx-auto mb-2 flex items-center justify-center"
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'var(--pb-cream-2)',
              border: '1.5px solid var(--pb-line-2)',
              color: 'var(--pb-ink-muted)',
            }}
          >
            <History size={20} strokeWidth={2.2} />
          </div>
          <p
            className="leading-relaxed"
            style={{ fontSize: 11.5, color: 'var(--pb-ink)' }}
          >
            No generations yet.
            <br />
            <span style={{ color: 'var(--pb-ink-muted)' }}>
              Switch to Generate and describe an asset to get started.
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div
        className="shrink-0 px-3 py-2 flex items-center justify-between"
        style={{ borderBottom: '1.5px solid var(--pb-line-2)' }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--pb-ink-muted)',
          }}
        >
          {generations.length} run{generations.length === 1 ? '' : 's'}
        </span>
        <button
          type="button"
          onClick={clearGenerations}
          title="Clear all generations"
          className="flex items-center justify-center"
          style={{
            height: 24,
            width: 24,
            borderRadius: 7,
            background: 'var(--pb-paper)',
            border: '1.5px solid var(--pb-line-2)',
            color: 'var(--pb-ink-soft)',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--pb-coral-ink)';
            e.currentTarget.style.color = 'var(--pb-coral-ink)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--pb-line-2)';
            e.currentTarget.style.color = 'var(--pb-ink-soft)';
          }}
        >
          <Trash2 size={12} strokeWidth={2.2} />
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
      className="group overflow-hidden text-left"
      style={{
        borderRadius: 12,
        background: 'var(--pb-paper)',
        border: `1.5px solid ${isActive ? 'var(--pb-ink)' : 'var(--pb-line-2)'}`,
        boxShadow: isActive ? '0 2px 0 var(--pb-ink)' : 'none',
        cursor: 'pointer',
        transition: 'border-color 120ms ease',
      }}
    >
      <div
        className="aspect-square flex items-center justify-center"
        style={{ background: 'var(--pb-cream-2)' }}
      >
        <HistoryThumb generation={gen} isActive={isActive} />
      </div>
      <div style={{ padding: '5px 8px', borderTop: '1.5px solid var(--pb-line-2)' }}>
        <div
          className="truncate"
          style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--pb-ink)' }}
        >
          {gen.userPrompt}
        </div>
        <div className="flex items-center gap-1 mt-0.5" style={{ fontSize: 9 }}>
          {gen.rating ? (
            <span style={{ color: 'var(--pb-butter-ink)', fontWeight: 700 }}>
              {'★'.repeat(gen.rating)}
              <span style={{ color: 'var(--pb-line-2)' }}>{'★'.repeat(5 - gen.rating)}</span>
            </span>
          ) : (
            <span style={{ color: 'var(--pb-ink-muted)' }}>unrated</span>
          )}
        </div>
      </div>
    </button>
  );
}

function HistoryThumb({
  generation,
}: {
  generation: PartGeneration;
  isActive: boolean;
}) {
  if (generation.error)
    return (
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--pb-coral-ink)' }}>err</div>
    );
  if (!generation.model)
    return (
      <div
        className="animate-pulse"
        style={{ fontSize: 10, color: 'var(--pb-ink-muted)' }}
      >
        …
      </div>
    );
  const palette = Array.from(
    new Set(generation.model.parts.map((p) => p.color)),
  ).slice(0, 4);
  return (
    <div className="flex gap-0.5">
      {palette.map((c, i) => (
        <span
          key={i}
          style={{
            width: 16,
            height: 16,
            borderRadius: 4,
            backgroundColor: c,
            border: '1.5px solid var(--pb-ink)',
          }}
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
            className="flex items-center justify-center"
            style={{
              height: 30,
              width: 30,
              borderRadius: 8,
              background: filled ? 'var(--pb-butter)' : 'var(--pb-paper)',
              border: `1.5px solid ${filled ? 'var(--pb-butter-ink)' : 'var(--pb-line-2)'}`,
              boxShadow: filled ? '0 2px 0 var(--pb-butter-ink)' : 'none',
              color: disabled
                ? 'var(--pb-line-2)'
                : filled
                  ? 'var(--pb-butter-ink)'
                  : 'var(--pb-ink-muted)',
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'background 120ms ease, border-color 120ms ease',
            }}
            title={`Rate ${n}`}
          >
            <Star size={14} strokeWidth={2.4} fill={filled ? 'currentColor' : 'none'} />
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

  const monoInk: React.CSSProperties = {
    fontFamily: 'DM Mono, monospace',
    color: 'var(--pb-ink)',
    fontSize: 11,
  };
  const monoMuted: React.CSSProperties = {
    fontFamily: 'DM Mono, monospace',
    color: 'var(--pb-ink-muted)',
    fontSize: 11,
  };
  const monoMint: React.CSSProperties = {
    fontFamily: 'DM Mono, monospace',
    color: 'var(--pb-mint-ink)',
    fontSize: 11,
    fontWeight: 700,
  };
  return (
    <>
      <div className="space-y-1.5 text-[11px]">
        <Row label="Model">
          <span style={monoInk}>{active.usage.modelFull}</span>
        </Row>
        <Row label="Input">
          <span style={monoInk}>{active.usage.inputTokens.toLocaleString()}</span>
        </Row>
        <Row label="Output">
          <span style={monoInk}>{active.usage.outputTokens.toLocaleString()}</span>
        </Row>
        {active.usage.cacheReadTokens > 0 && (
          <Row label="Cache read">
            <span style={monoMuted}>{active.usage.cacheReadTokens.toLocaleString()}</span>
          </Row>
        )}
        <Row label="Cost">
          <span style={monoMint}>{formatUsd(active.usage.costUsd)}</span>
        </Row>
        <Row label="Duration">
          <span style={monoMuted}>{(active.usage.durationMs / 1000).toFixed(2)}s</span>
        </Row>
      </div>
      {totals.count > 0 && (
        <div
          className="mt-3 pt-3 space-y-1.5 text-[11px]"
          style={{ borderTop: '1.5px solid var(--pb-line-2)' }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--pb-ink-muted)',
            }}
          >
            Session · {totals.count} run{totals.count === 1 ? '' : 's'}
          </div>
          <Row label="In/out">
            <span style={monoInk}>
              {formatTokens(totals.inTok)} / {formatTokens(totals.outTok)}
            </span>
          </Row>
          <Row label="Cost">
            <span style={monoMint}>{formatUsd(totals.cost)}</span>
          </Row>
        </div>
      )}
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span style={{ color: 'var(--pb-ink-muted)', fontSize: 11 }}>{label}</span>
      {children}
    </div>
  );
}

function InlineEmpty() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3">
      <div
        className="inline-flex items-center justify-center mb-2"
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: 'var(--pb-grape)',
          color: 'var(--pb-grape-ink)',
          border: '1.5px solid var(--pb-grape-ink)',
        }}
      >
        <Sparkles size={16} strokeWidth={2.4} />
      </div>
      <p style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--pb-ink)' }}>
        Enter a prompt below
      </p>
      <p style={{ fontSize: 10.5, color: 'var(--pb-ink-muted)', marginTop: 2 }}>
        ≤ 12 primitives · ~100 verts
      </p>
    </div>
  );
}

function InlineLoading({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3">
      <div
        className="flex items-center justify-center animate-pulse mb-2"
        style={{
          width: 36,
          height: 36,
          borderRadius: 12,
          background: 'var(--pb-paper)',
          border: '1.5px solid var(--pb-grape-ink)',
          color: 'var(--pb-grape-ink)',
        }}
      >
        <Sparkles size={14} strokeWidth={2.4} />
      </div>
      <p
        className="truncate max-w-full"
        style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--pb-ink)' }}
      >
        Generating &ldquo;{label}&rdquo;
      </p>
    </div>
  );
}

function InlineError({ error }: { error: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3">
      <div
        className="inline-flex items-center justify-center mb-2"
        style={{
          width: 40,
          height: 40,
          borderRadius: 999,
          background: 'var(--pb-coral)',
          border: '1.5px solid var(--pb-coral-ink)',
          color: 'var(--pb-coral-ink)',
        }}
      >
        <X size={14} strokeWidth={2.4} />
      </div>
      <p style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--pb-ink)', marginBottom: 2 }}>
        Generation failed
      </p>
      <p
        className="break-all line-clamp-3"
        style={{
          fontSize: 10.5,
          fontFamily: 'DM Mono, monospace',
          color: 'var(--pb-ink-muted)',
        }}
      >
        {error}
      </p>
    </div>
  );
}
