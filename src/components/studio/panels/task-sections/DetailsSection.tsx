'use client';
import { useState, useRef, useEffect } from 'react';
import { Lightbulb, BookOpen } from 'lucide-react';
import {
  PanelSection,
  PanelSelect,
  PanelSlider,
  DueDatePicker,
} from '@/components/ui/panel-controls';
import { PanelIconTabs } from '@/components/ui/panel-controls/PanelIconTabs';
import { AssigneesSection } from './AssigneesSection';
import type {
  TaskStatus,
  TeamRole,
  TaskOverrides,
  EffectiveTask,
  TeamMember,
} from '@/lib/templates/types';

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

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'todo',        label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review',      label: 'Review' },
  { value: 'done',        label: 'Done' },
];

const ROLE_OPTIONS: { value: TeamRole; label: string }[] = [
  { value: 'designer',   label: 'Designer' },
  { value: 'artist',     label: 'Artist' },
  { value: 'programmer', label: 'Programmer' },
  { value: 'audio',      label: 'Audio' },
  { value: 'producer',   label: 'Producer' },
  { value: 'any',        label: 'Any' },
];

interface DetailsSectionProps {
  effective: EffectiveTask;
  status: TaskStatus;
  dueDate?: string;
  assigneeIds: string[];
  teamMembers: TeamMember[];
  blockedByTitles: string[];
  onStatusChange: (s: TaskStatus) => void;
  onFieldChange: <K extends keyof TaskOverrides>(field: K, value: TaskOverrides[K]) => void;
  onDueDateChange: (date: string | undefined) => void;
  onAssigneesChange: (ids: string[]) => void;
}

export function DetailsSection({
  effective,
  status,
  dueDate,
  assigneeIds,
  teamMembers,
  blockedByTitles,
  onStatusChange,
  onFieldChange,
  onDueDateChange,
  onAssigneesChange,
}: DetailsSectionProps) {
  const isBlocked = status === 'blocked';
  const [contextTab, setContextTab] = useState<ContextTab>('tip');

  return (
    <div className="flex flex-col gap-4">
      <PanelIconTabs
        tabs={CONTEXT_TABS}
        activeTab={contextTab}
        onChange={(id) => setContextTab(id as ContextTab)}
      />

      <div className="px-4 pb-2">
        {contextTab === 'tip' && (
          <AutoTextarea
            value={effective.tip}
            onChange={(v) => onFieldChange('tip', v)}
            placeholder="Teaching note or explanation..."
          />
        )}
        {contextTab === 'example' && (
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

      <div className="px-4 pb-4 flex flex-col gap-4 border-t border-white/5 pt-4">
      <PanelSection title="Status" collapsible>
        {isBlocked ? (
          <div className="text-[11px] text-zinc-500 bg-zinc-800/60 rounded-lg px-3 py-2.5">
            This task is blocked by unfinished dependencies.
          </div>
        ) : (
          <PanelSelect
            value={status}
            onChange={(v) => onStatusChange(v as TaskStatus)}
            options={STATUS_OPTIONS}
            fullWidth
          />
        )}
      </PanelSection>

      <PanelSection title="Due Date" collapsible>
        <DueDatePicker
          value={dueDate}
          onChange={onDueDateChange}
        />
      </PanelSection>

      <AssigneesSection
        assigneeIds={assigneeIds}
        teamMembers={teamMembers}
        onAssigneesChange={onAssigneesChange}
      />

      <PanelSection title="Role" collapsible>
        <PanelSelect
          value={effective.role}
          onChange={(v) => onFieldChange('role', v as TeamRole)}
          options={ROLE_OPTIONS}
          fullWidth
        />
      </PanelSection>

      <PanelSection title="Estimated hours" collapsible noBorder>
        <PanelSlider
          label="Hours"
          value={effective.estimatedHours}
          onChange={(v) => onFieldChange('estimatedHours', v)}
          min={1}
          max={100}
          step={1}
          suffix="h"
        />
      </PanelSection>
      </div>
    </div>
  );
}
