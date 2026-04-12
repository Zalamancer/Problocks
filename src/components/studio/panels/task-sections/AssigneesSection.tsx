'use client';
import { X } from 'lucide-react';
import { PanelSection, PanelMultiSelect } from '@/components/ui/panel-controls';
import type { TeamMember } from '@/lib/templates/types';

interface AssigneesSectionProps {
  assigneeIds: string[];
  teamMembers: TeamMember[];
  onAssigneesChange: (ids: string[]) => void;
}

export function AssigneesSection({
  assigneeIds,
  teamMembers,
  onAssigneesChange,
}: AssigneesSectionProps) {
  const options = teamMembers.map((m) => ({ value: m.id, label: m.name }));
  const assigned = teamMembers.filter((m) => assigneeIds.includes(m.id));

  return (
    <PanelSection title="Assignees" collapsible badge={assigneeIds.length}>
      <PanelMultiSelect
        options={options}
        value={assigneeIds}
        onChange={onAssigneesChange}
        placeholder="No assignees"
        emptyMessage="No team members yet"
      />
      {assigned.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {assigned.map((m) => (
            <span
              key={m.id}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-panel-surface text-xs text-zinc-300"
            >
              {m.name}
              <button
                onClick={() => onAssigneesChange(assigneeIds.filter((id) => id !== m.id))}
                className="text-zinc-500 hover:text-zinc-200 transition-colors"
                aria-label={`Remove ${m.name}`}
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}
    </PanelSection>
  );
}
