'use client';
import { PanelSection } from '@/components/ui/panel-controls';
import { formatRelativeTime } from '@/lib/format-time';
import type { ActivityEntry, TeamMember } from '@/lib/templates/types';

const DOT_VAR: Record<string, { bg: string; ink: string }> = {
  status_change:      { bg: 'var(--pb-mint)',   ink: 'var(--pb-mint-ink)'   },
  field_edit:         { bg: 'var(--pb-sky)',    ink: 'var(--pb-sky-ink)'    },
  comment_added:      { bg: 'var(--pb-grape)',  ink: 'var(--pb-grape-ink)'  },
  comment_deleted:    { bg: 'var(--pb-grape)',  ink: 'var(--pb-grape-ink)'  },
  attachment_added:   { bg: 'var(--pb-coral)',  ink: 'var(--pb-coral-ink)'  },
  attachment_removed: { bg: 'var(--pb-coral)',  ink: 'var(--pb-coral-ink)'  },
  assignee_added:     { bg: 'var(--pb-sky)',    ink: 'var(--pb-sky-ink)'    },
  assignee_removed:   { bg: 'var(--pb-sky)',    ink: 'var(--pb-sky-ink)'    },
  due_date_set:       { bg: 'var(--pb-butter)', ink: 'var(--pb-butter-ink)' },
};

function describeEntry(entry: ActivityEntry, resolveName: (id: string) => string): string {
  const who = resolveName(entry.authorId);
  switch (entry.type) {
    case 'status_change':
      return `${who} changed status from ${entry.details.from} to ${entry.details.to}`;
    case 'field_edit':
      return `${who} edited ${entry.details.field ?? 'a field'}`;
    case 'comment_added':
      return `${who} posted a comment`;
    case 'comment_deleted':
      return `${who} deleted a comment`;
    case 'attachment_added':
      return `${who} attached ${entry.details.type}: ${entry.details.title}`;
    case 'attachment_removed':
      return `${who} removed an attachment`;
    case 'assignee_added':
      return `${who} assigned ${resolveName(entry.details.userId)}`;
    case 'assignee_removed':
      return `${who} unassigned ${resolveName(entry.details.userId)}`;
    case 'due_date_set':
      return entry.details.date === 'cleared'
        ? `${who} cleared the due date`
        : `${who} set due date to ${entry.details.date}`;
    default:
      return `${who} performed an action`;
  }
}

interface ActivitySectionProps {
  activityLog: ActivityEntry[];
  teamMembers: TeamMember[];
}

export function ActivitySection({ activityLog, teamMembers }: ActivitySectionProps) {
  const resolveName = (id: string) =>
    id === 'system' ? 'System' : (teamMembers.find((m) => m.id === id)?.name ?? 'Unknown');

  // Show newest first, cap at 50
  const entries = [...activityLog].reverse().slice(0, 50);

  return (
    <PanelSection title="Activity" collapsible badge={activityLog.length} noBorder>
      {entries.length === 0 ? (
        <p
          className="italic"
          style={{ fontSize: 11.5, color: 'var(--pb-ink-muted)' }}
        >
          No activity yet.
        </p>
      ) : (
        <div className="max-h-72 overflow-y-auto space-y-2.5">
          {entries.map((e) => {
            const dot = DOT_VAR[e.type];
            return (
              <div key={e.id} className="flex items-start gap-2">
                <span
                  className="shrink-0 mt-1"
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    background: dot?.bg ?? 'var(--pb-line-2)',
                    border: `1.5px solid ${dot?.ink ?? 'var(--pb-ink-muted)'}`,
                  }}
                />
                <div className="min-w-0">
                  <p
                    className="leading-snug"
                    style={{ fontSize: 11.5, color: 'var(--pb-ink)', fontWeight: 500 }}
                  >
                    {describeEntry(e, resolveName)}
                  </p>
                  <span style={{ fontSize: 10, color: 'var(--pb-ink-muted)' }}>
                    {formatRelativeTime(e.timestamp)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PanelSection>
  );
}
