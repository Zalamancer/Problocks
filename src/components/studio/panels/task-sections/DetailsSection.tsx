'use client';
import { useState, useRef, useEffect } from 'react';
import { Lightbulb, BookOpen, Info } from 'lucide-react';
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
      className="w-full resize-none outline-none leading-relaxed"
      style={{
        background: 'transparent',
        fontSize: 13,
        color: 'var(--pb-ink)',
        fontFamily: 'inherit',
      }}
    />
  );
}

type ActiveTab = 'tip' | 'example' | 'details';

const TABS = [
  { id: 'details', label: 'Details', icon: Info      },
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
  const [activeTab, setActiveTab] = useState<ActiveTab>('details');

  return (
    <div className="flex flex-col gap-4">
      <PanelIconTabs
        tabs={TABS}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as ActiveTab)}
      />

      <div className="px-4 pb-4">
        {activeTab === 'tip' && (
          <AutoTextarea
            value={effective.tip}
            onChange={(v) => onFieldChange('tip', v)}
            placeholder="Teaching note or explanation..."
          />
        )}

        {activeTab === 'example' && (
          <AutoTextarea
            value={effective.exampleFromIndustry ?? ''}
            onChange={(v) => onFieldChange('exampleFromIndustry', v || undefined)}
            placeholder="How a real studio would approach this..."
          />
        )}

        {activeTab === 'details' && (
          <div className="flex flex-col gap-4">
            <PanelSection title="Status" collapsible>
              {isBlocked ? (
                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--pb-coral-ink)',
                    background: 'var(--pb-coral)',
                    border: '1.5px solid var(--pb-coral-ink)',
                    borderRadius: 10,
                    padding: '8px 11px',
                    fontWeight: 600,
                  }}
                >
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

            {blockedByTitles.length > 0 && (
              <PanelSection
                title="Requires"
                badge={blockedByTitles.length}
                collapsible
                noBorder
              >
                <div className="space-y-1.5">
                  {blockedByTitles.map((title) => (
                    <div
                      key={title}
                      className="flex items-center gap-2"
                      style={{ fontSize: 11, color: 'var(--pb-ink-soft)', fontWeight: 500 }}
                    >
                      <span
                        className="shrink-0"
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: 999,
                          background: 'var(--pb-coral)',
                          border: '1.5px solid var(--pb-coral-ink)',
                        }}
                      />
                      {title}
                    </div>
                  ))}
                </div>
              </PanelSection>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
