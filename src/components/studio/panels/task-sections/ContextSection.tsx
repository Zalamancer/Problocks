'use client';
import { Lightbulb, BookOpen } from 'lucide-react';
import { PanelSection, PanelTextarea } from '@/components/ui/panel-controls';
import type { TaskOverrides, EffectiveTask } from '@/lib/templates/types';

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
  return (
    <div className="px-4 py-4 flex flex-col gap-4">
      <PanelSection title="What is this?" icon={Lightbulb} collapsible>
        <PanelTextarea
          value={effective.tip}
          onChange={(v) => onFieldChange('tip', v)}
          placeholder="Teaching note or explanation"
          rows={4}
          showCount
        />
      </PanelSection>

      <PanelSection title="Real studio example" icon={BookOpen} collapsible>
        <PanelTextarea
          value={effective.exampleFromIndustry ?? ''}
          onChange={(v) => onFieldChange('exampleFromIndustry', v || undefined)}
          placeholder="How a real studio would approach this"
          rows={3}
        />
      </PanelSection>

      {blockedByTitles.length > 0 && (
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
      )}
    </div>
  );
}
