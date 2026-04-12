'use client';
import { Maximize2, Package } from 'lucide-react';
import {
  PanelSection,
  PanelInput,
  PanelSelect,
  PanelSlider,
} from '@/components/ui/panel-controls';
import { AssigneesSection } from './AssigneesSection';
import type { ExpandableField } from './ExpandedFieldEditor';
import type {
  TaskStatus,
  TeamRole,
  TaskOverrides,
  EffectiveTask,
  TeamMember,
} from '@/lib/templates/types';

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
  onStatusChange: (s: TaskStatus) => void;
  onFieldChange: <K extends keyof TaskOverrides>(field: K, value: TaskOverrides[K]) => void;
  onDueDateChange: (date: string | undefined) => void;
  onAssigneesChange: (ids: string[]) => void;
  onExpandField: (field: ExpandableField) => void;
}

export function DetailsSection({
  effective,
  status,
  dueDate,
  assigneeIds,
  teamMembers,
  onStatusChange,
  onFieldChange,
  onDueDateChange,
  onAssigneesChange,
  onExpandField,
}: DetailsSectionProps) {
  const isBlocked = status === 'blocked';

  return (
    <div className="px-4 py-4 flex flex-col gap-4">
      <PanelSection title="Title" collapsible>
        <button
          onClick={() => onExpandField('title')}
          className="w-full flex items-center gap-2 bg-panel-surface hover:bg-panel-surface-hover rounded-lg px-3 py-2 transition-colors text-left group"
        >
          <span className="flex-1 text-sm text-zinc-200 truncate">
            {effective.title || 'Untitled task'}
          </span>
          <Maximize2 size={12} className="shrink-0 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
        </button>
      </PanelSection>

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
        <PanelInput
          value={dueDate ?? ''}
          onChange={(v) => onDueDateChange(v || undefined)}
          type="date"
          fullWidth
        />
      </PanelSection>

      <AssigneesSection
        assigneeIds={assigneeIds}
        teamMembers={teamMembers}
        onAssigneesChange={onAssigneesChange}
      />

      <PanelSection title="Description" collapsible>
        <button
          onClick={() => onExpandField('description')}
          className="w-full flex items-center gap-2 bg-panel-surface hover:bg-panel-surface-hover rounded-lg px-3 py-2 transition-colors text-left group"
        >
          <span className="flex-1 text-xs text-zinc-400 truncate">
            {effective.description || 'Click to add description...'}
          </span>
          <Maximize2 size={12} className="shrink-0 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
        </button>
      </PanelSection>

      <PanelSection title="Deliverable" icon={Package} collapsible>
        <PanelInput
          value={effective.deliverable}
          onChange={(v) => onFieldChange('deliverable', v)}
          placeholder="What must exist when done?"
          fullWidth
        />
      </PanelSection>

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
  );
}
