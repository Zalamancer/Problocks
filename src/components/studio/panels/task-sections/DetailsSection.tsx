'use client';
import { Package } from 'lucide-react';
import {
  PanelSection,
  PanelInput,
  PanelSelect,
  PanelSlider,
  DueDatePicker,
} from '@/components/ui/panel-controls';
import { AssigneesSection } from './AssigneesSection';
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
}: DetailsSectionProps) {
  const isBlocked = status === 'blocked';

  return (
    <div className="px-4 py-4 flex flex-col gap-4">
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
