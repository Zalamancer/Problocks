'use client';
import { useState } from 'react';
import { Lightbulb, BookOpen } from 'lucide-react';
import { PanelSection, PanelTextarea } from '@/components/ui/panel-controls';
import { cn } from '@/lib/utils';
import type { TaskOverrides, EffectiveTask } from '@/lib/templates/types';

type ContextTab = 'tip' | 'example';

const CONTEXT_TABS = [
  { id: 'tip'     as ContextTab, label: 'What is this?',       icon: Lightbulb },
  { id: 'example' as ContextTab, label: 'Real studio example', icon: BookOpen  },
];

interface ContextSectionProps {
  effective: EffectiveTask;
  blockedByTitles: string[];
  onFieldChange: <K extends keyof TaskOverrides>(field: K, value: TaskOverrides[K]) => void;
}

export function ContextSection({
  effective,
  blockedByTitles,
  onFieldChange,
}: ContextSectionProps) {
  const [tab, setTab] = useState<ContextTab>('tip');
  const activeTab = CONTEXT_TABS.find((t) => t.id === tab)!;

  return (
    <div className="flex flex-col">
      {/* Icon-only pill tabs */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-white/5">
        {CONTEXT_TABS.map(({ id, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'h-8 w-8 rounded-lg flex items-center justify-center transition-colors',
              tab === id
                ? 'bg-white text-black'
                : 'text-zinc-400 hover:text-white hover:bg-white/10',
            )}
          >
            <Icon size={15} />
          </button>
        ))}
      </div>

      {/* Active tab label shown as heading outside the pills */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        <activeTab.icon size={13} className="text-zinc-400 shrink-0" />
        <span className="text-[12px] font-semibold text-zinc-300">{activeTab.label}</span>
      </div>

      {/* Tab content */}
      <div className="px-4 pb-4">
        {tab === 'tip' && (
          <PanelTextarea
            value={effective.tip}
            onChange={(v) => onFieldChange('tip', v)}
            placeholder="Teaching note or explanation"
            rows={5}
            showCount
          />
        )}
        {tab === 'example' && (
          <PanelTextarea
            value={effective.exampleFromIndustry ?? ''}
            onChange={(v) => onFieldChange('exampleFromIndustry', v || undefined)}
            placeholder="How a real studio would approach this"
            rows={5}
          />
        )}

        {blockedByTitles.length > 0 && (
          <div className="mt-4">
            <PanelSection
              title="Requires"
              badge={blockedByTitles.length}
              collapsible
              noBorder
            >
              <div className="space-y-1.5">
                {blockedByTitles.map((title) => (
                  <div key={title} className="text-[11px] text-zinc-500 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 shrink-0" />
                    {title}
                  </div>
                ))}
              </div>
            </PanelSection>
          </div>
        )}
      </div>
    </div>
  );
}
