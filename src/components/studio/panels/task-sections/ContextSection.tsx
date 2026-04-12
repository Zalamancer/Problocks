'use client';
import { useState } from 'react';
import { Lightbulb, BookOpen } from 'lucide-react';
import { PanelSection, PanelTextarea } from '@/components/ui/panel-controls';
import { PanelIconTabs } from '@/components/ui/panel-controls/PanelIconTabs';
import type { TaskOverrides, EffectiveTask } from '@/lib/templates/types';

type ContextTab = 'tip' | 'example';

const CONTEXT_TABS = [
  { id: 'tip',     label: 'What is this?',       icon: Lightbulb },
  { id: 'example', label: 'Real studio example', icon: BookOpen  },
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

  return (
    <div className="flex flex-col gap-4">
      <PanelIconTabs
        tabs={CONTEXT_TABS}
        activeTab={tab}
        onChange={(id) => setTab(id as ContextTab)}
      />

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
