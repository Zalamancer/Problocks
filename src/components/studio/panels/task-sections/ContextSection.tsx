'use client';
import { useState, useRef, useEffect } from 'react';
import { Lightbulb, BookOpen } from 'lucide-react';
import { PanelSection } from '@/components/ui/panel-controls';
import { PanelIconTabs } from '@/components/ui/panel-controls/PanelIconTabs';
import type { TaskOverrides, EffectiveTask } from '@/lib/templates/types';

function AutoTextarea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={1}
      className="w-full bg-transparent text-sm text-zinc-200 placeholder:text-zinc-600 resize-none outline-none leading-relaxed"
    />
  );
}

type ContextTab = 'tip' | 'example';

const CONTEXT_TABS = [
  { id: 'tip',     label: 'Guide',   icon: Lightbulb },
  { id: 'example', label: 'Example', icon: BookOpen  },
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
          <AutoTextarea
            value={effective.tip}
            onChange={(v) => onFieldChange('tip', v)}
            placeholder="Teaching note or explanation..."
          />
        )}
        {tab === 'example' && (
          <AutoTextarea
            value={effective.exampleFromIndustry ?? ''}
            onChange={(v) => onFieldChange('exampleFromIndustry', v || undefined)}
            placeholder="How a real studio would approach this..."
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
