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
              className="inline-flex items-center gap-1"
              style={{
                padding: '3px 8px',
                borderRadius: 999,
                background: 'var(--pb-sky)',
                border: '1.5px solid var(--pb-sky-ink)',
                fontSize: 11.5,
                fontWeight: 700,
                color: 'var(--pb-sky-ink)',
              }}
            >
              {m.name}
              <button
                onClick={() => onAssigneesChange(assigneeIds.filter((id) => id !== m.id))}
                className="transition-colors"
                style={{
                  color: 'var(--pb-sky-ink)',
                  opacity: 0.7,
                  background: 'transparent',
                  border: 0,
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7'; }}
                aria-label={`Remove ${m.name}`}
              >
                <X size={10} strokeWidth={2.4} />
              </button>
            </span>
          ))}
        </div>
      )}
    </PanelSection>
  );
}
