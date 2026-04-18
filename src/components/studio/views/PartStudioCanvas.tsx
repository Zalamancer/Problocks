/**
 * Part Studio — center canvas.
 *
 * The inline 3D preview that sits in the main studio column while the
 * user is generating parts. Shape matches other center views
 * (`WorkspaceView`, `GamePreview`): top GameToolbar-style bar, then
 * the 3D viewport filling the rest. The prompt/rating/feedback/save
 * controls all live on the right panel now; this file is strictly the
 * 3D stage + run-level stats.
 */
'use client';
import { useMemo } from 'react';
import { Sparkles, X } from 'lucide-react';
import { PartPreview } from '@/components/studio/PartPreview';
import { usePartStudio } from '@/store/part-studio-store';
import {
  MODEL_CATALOG,
  formatUsd,
  formatTokens,
} from '@/lib/part-studio/models';

export function PartStudioCanvas() {
  const { generations, activeId } = usePartStudio();

  const active = useMemo(
    () => generations.find((g) => g.id === activeId) ?? null,
    [generations, activeId],
  );

  // Session totals — summed across all generations with usage. Displayed
  // in the top bar so the user can see their cumulative spend without
  // having to expand the right-panel "Usage & cost" section.
  const sessionTotals = useMemo(() => {
    let cost = 0;
    let count = 0;
    for (const g of generations) {
      if (!g.usage) continue;
      cost += g.usage.costUsd || 0;
      count++;
    }
    return { cost, count };
  }, [generations]);

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      {/* Top bar — matches GameToolbar's height/border so the transition
          between the normal 3D workspace and Part Studio isn't jarring. */}
      <div className="shrink-0 h-10 flex items-center gap-3 px-3 border-b border-white/5 text-[11px]">
        <div className="flex items-center gap-2">
          <Sparkles size={13} className="text-accent" />
          <span className="text-sm font-medium text-zinc-100">Part Studio</span>
        </div>
        {active?.model && (
          <div className="text-zinc-500">
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
        <div className="ml-auto flex items-center gap-3 text-zinc-500">
          {active?.usage && (
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-white/5 text-zinc-300 font-mono">
                {MODEL_CATALOG[active.usage.modelAlias].label.split(' · ')[0]}
              </span>
              <span className="font-mono text-zinc-400">
                {formatTokens(active.usage.inputTokens)}↑ /{' '}
                {formatTokens(active.usage.outputTokens)}↓
              </span>
              <span className="text-zinc-700">·</span>
              <span className="font-mono text-accent">
                {formatUsd(active.usage.costUsd)}
              </span>
            </div>
          )}
          {sessionTotals.count > 0 && (
            <div
              className="flex items-center gap-1.5"
              title={`${sessionTotals.count} generations this session`}
            >
              <span className="text-zinc-600">session</span>
              <span className="font-mono text-zinc-300">
                {formatUsd(sessionTotals.cost)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 3D preview / empty / error / loading states */}
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
          Type a short prompt on the right like{' '}
          <span className="text-zinc-300">&ldquo;make a knight&rdquo;</span>.
          Claude will compose it from ≤12 primitives so the whole asset stays
          under 100 vertices.
        </p>
      </div>
    </div>
  );
}
