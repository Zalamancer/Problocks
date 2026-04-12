'use client';
import { PanelSection } from '@/components/ui/panel-controls';
import { formatRelativeTime } from '@/lib/format-time';
import type { ActivityEntry, TeamMember } from '@/lib/templates/types';

const DOT_COLOR: Record<string, string> = {
  status_change:      'bg-green-400',
  field_edit:         'bg-blue-400',
  comment_added:      'bg-purple-400',
  comment_deleted:    'bg-purple-400/50',
  attachment_added:   'bg-orange-400',
  attachment_removed: 'bg-orange-400/50',
  assignee_added:     'bg-cyan-400',
  assignee_removed:   'bg-cyan-400/50',
  due_date_set:       'bg-yellow-400',
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
        <p className="text-xs text-zinc-600 italic">No activity yet.</p>
      ) : (
        <div className="max-h-72 overflow-y-auto space-y-2.5">
          {entries.map((e) => (
            <div key={e.id} className="flex items-start gap-2">
              <span className={`w-2 h-2 rounded-full shrink-0 mt-1 ${DOT_COLOR[e.type] ?? 'bg-zinc-500'}`} />
              <div className="min-w-0">
                <p className="text-[11px] text-zinc-400 leading-snug">
                  {describeEntry(e, resolveName)}
                </p>
                <span className="text-[10px] text-zinc-600">
                  {formatRelativeTime(e.timestamp)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </PanelSection>
  );
}
