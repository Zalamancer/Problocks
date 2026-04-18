/**
 * Part Studio — left panel.
 *
 * Swaps in over the regular LeftPanel while the user is in the
 * parts-gen view. Mirrors AutoAnimation's glass-aside shell so it sits
 * comfortably beside the existing ScenePanel / AssetsPanel / ChatPanel.
 *
 * Content: a scrollable grid of past generations with quick-select +
 * inline rating + delete. Clicking a thumbnail swaps the center canvas
 * to show that generation; the right properties panel follows via the
 * shared activeId in the Part Studio store.
 */
'use client';
import { ArrowLeft, Sparkles, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePartStudio } from '@/store/part-studio-store';
import { useStudio } from '@/store/studio-store';
import type { PartGeneration } from '@/lib/part-studio/types';

export function PartStudioHistoryPanel() {
  const setViewMode = useStudio((s) => s.setViewMode);
  const {
    generations,
    activeId,
    setActiveId,
    clearGenerations,
  } = usePartStudio();

  return (
    <aside className="flex-shrink-0 w-[240px] transition-all duration-300">
      <div className="h-full flex flex-col bg-zinc-900/80 backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden">
        {/* Header with back button + title */}
        <div className="shrink-0 flex items-center gap-1.5 px-2 py-1.5 border-b border-white/5">
          <button
            type="button"
            onClick={() => setViewMode('3d')}
            className="h-7 w-7 rounded-lg flex items-center justify-center text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
            title="Back to 3D workspace"
          >
            <ArrowLeft size={14} />
          </button>
          <div className="flex-1 min-w-0 flex items-center gap-1.5 px-1">
            <Sparkles size={12} className="text-accent shrink-0" />
            <span className="text-sm font-medium text-white truncate">Part Studio</span>
          </div>
          {generations.length > 0 && (
            <button
              type="button"
              onClick={clearGenerations}
              title="Clear all generations"
              className="h-7 w-7 rounded-lg flex items-center justify-center text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>

        {/* Section label */}
        <div className="shrink-0 px-3 py-2 border-b border-white/5">
          <span className="text-[10px] uppercase tracking-wider text-zinc-500">
            History · {generations.length}
          </span>
        </div>

        {/* Grid of thumbnails */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          {generations.length === 0 ? (
            <div className="text-[11px] text-zinc-600 text-center px-3 pt-8 leading-relaxed">
              Your generations will appear here.
              <br />
              <span className="text-zinc-700">Start by entering a prompt on the right.</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1.5">
              {[...generations].reverse().map((g) => (
                <HistoryCard
                  key={g.id}
                  gen={g}
                  isActive={g.id === activeId}
                  onClick={() => setActiveId(g.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

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
  if (generation.error) {
    return <div className="text-red-400/70 text-[10px]">err</div>;
  }
  if (!generation.model) {
    return <div className="text-zinc-600 text-[10px] animate-pulse">…</div>;
  }
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
