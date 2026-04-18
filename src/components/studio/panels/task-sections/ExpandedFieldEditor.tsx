'use client';
import { useState } from 'react';
import { X, MessageSquare, Clock, Package, Pencil } from 'lucide-react';
import { IconButton } from '@/components/ui';
import { LazyBlockNoteEditor } from './LazyBlockNoteEditor';
import { CommentsSection } from './CommentsSection';
import { formatRelativeTime } from '@/lib/format-time';
import type { Comment, TeamMember, ActivityEntry } from '@/lib/templates/types';

export type ExpandableField = 'title' | 'description';

interface ExpandedFieldEditorProps {
  field?: ExpandableField;
  title: string;
  descriptionBlocks?: unknown[];
  onTitleChange: (v: string) => void;
  onDescriptionBlocksChange: (blocks: unknown[]) => void;
  onClose: () => void;
  comments: Comment[];
  currentUserId: string;
  teamMembers: TeamMember[];
  onAddComment: (body: string, parentId?: string) => void;
  onDeleteComment: (commentId: string) => void;
  activityLog: ActivityEntry[];
  deliverable?: string;
  deliverableBlocks?: unknown[];
  onDeliverableBlocksChange: (blocks: unknown[]) => void;
}

type BottomTab = 'comments' | 'activity';

// ─── Activity helpers (mirrors ActivitySection logic, without PanelSection wrapper) ───

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
    case 'status_change':      return `${who} changed status from ${entry.details.from} to ${entry.details.to}`;
    case 'field_edit':         return `${who} edited ${entry.details.field ?? 'a field'}`;
    case 'comment_added':      return `${who} posted a comment`;
    case 'comment_deleted':    return `${who} deleted a comment`;
    case 'attachment_added':   return `${who} attached ${entry.details.type}: ${entry.details.title}`;
    case 'attachment_removed': return `${who} removed an attachment`;
    case 'assignee_added':     return `${who} assigned ${resolveName(entry.details.userId)}`;
    case 'assignee_removed':   return `${who} unassigned ${resolveName(entry.details.userId)}`;
    case 'due_date_set':
      return entry.details.date === 'cleared'
        ? `${who} cleared the due date`
        : `${who} set due date to ${entry.details.date}`;
    default:                   return `${who} performed an action`;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

/** Full-canvas document view — title + description editor, with Comments/Activity tabs below. */
export function ExpandedFieldEditor({
  title,
  descriptionBlocks,
  onTitleChange,
  onDescriptionBlocksChange,
  onClose,
  comments,
  currentUserId,
  teamMembers,
  onAddComment,
  onDeleteComment,
  activityLog,
  deliverable,
  deliverableBlocks,
  onDeliverableBlocksChange,
}: ExpandedFieldEditorProps) {
  const [tab, setTab] = useState<BottomTab>('comments');
  const [editingDeliverable, setEditingDeliverable] = useState(false);
  // Local blocks tracked immediately (BlockNote's store onChange is debounced 300ms)
  const [localDeliverableBlocks, setLocalDeliverableBlocks] = useState<unknown[]>(deliverableBlocks ?? []);

  const resolveName = (id: string) =>
    id === 'local-user' ? 'You' : (teamMembers.find((m) => m.id === id)?.name ?? 'Unknown');

  const entries = [...activityLog].reverse().slice(0, 50);

  return (
    <div
      className="absolute inset-0 z-30 flex flex-col overflow-hidden"
      style={{ background: 'var(--pb-paper)' }}
    >
      {/* Header */}
      <div className="shrink-0 flex items-center justify-end px-4 py-2">
        <IconButton
          icon={X}
          variant="ghost"
          size="sm"
          onClick={onClose}
          tooltip="Close"
          aria-label="Close editor"
        />
      </div>

      {/* Single scroll area: editor + comments/activity naturally below */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-8 pt-4 pb-20">
          {/* Title + description occupy at least 3/4 of visible height before comments */}
          <div className="min-h-[72vh]">
            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="w-full text-2xl font-bold border-none outline-none mb-6"
              style={{
                background: 'transparent',
                color: 'var(--pb-ink)',
              }}
              placeholder="Untitled"
            />

            {/* Deliverable info box */}
            <div
              className="flex items-start gap-2.5 mb-8 group"
              style={{
                background: 'var(--pb-cream-2)',
                border: '1.5px solid var(--pb-line-2)',
                borderRadius: 12,
                padding: '10px 14px',
              }}
            >
              <Package
                size={14}
                strokeWidth={2.2}
                className="shrink-0 mt-0.5"
                style={{ color: 'var(--pb-grape-ink)' }}
              />
              <div className="flex-1 min-w-0">
                <span
                  className="block mb-1"
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--pb-ink-muted)',
                  }}
                >
                  Deliverable
                </span>
                {editingDeliverable ? (
                  <div>
                    <div className="overflow-hidden [&_.bn-container]:!bg-transparent [&_.bn-editor]:!bg-transparent [&_.bn-editor]:!pl-0 [&_.bn-block-outer]:!pl-0 [&_.bn-block]:!pl-0 [&_.bn-side-menu]:!hidden">
                      <LazyBlockNoteEditor
                        initialBlocks={localDeliverableBlocks.length ? localDeliverableBlocks : deliverableBlocks}
                        onChange={(blocks) => setLocalDeliverableBlocks(blocks)}
                        placeholder="What must exist when done?"
                      />
                    </div>
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={() => {
                          onDeliverableBlocksChange(localDeliverableBlocks);
                          setEditingDeliverable(false);
                        }}
                        style={{
                          padding: '4px 12px',
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 700,
                          fontFamily: 'inherit',
                          background: 'var(--pb-mint)',
                          color: 'var(--pb-mint-ink)',
                          border: '1.5px solid var(--pb-mint-ink)',
                          boxShadow: '0 2px 0 var(--pb-mint-ink)',
                          cursor: 'pointer',
                        }}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : localDeliverableBlocks.length > 0 ? (
                  <div className="overflow-hidden [&_.bn-container]:!bg-transparent [&_.bn-editor]:!bg-transparent [&_.bn-editor]:!pl-0 [&_.bn-block-outer]:!pl-0 [&_.bn-block]:!pl-0 [&_.bn-side-menu]:!hidden">
                    <LazyBlockNoteEditor
                      initialBlocks={localDeliverableBlocks}
                      onChange={() => {}}
                      editable={false}
                    />
                  </div>
                ) : (
                  <p
                    className="leading-relaxed whitespace-pre-wrap"
                    style={{ fontSize: 13, color: 'var(--pb-ink)' }}
                  >
                    {deliverable || (
                      <span className="italic" style={{ color: 'var(--pb-ink-muted)' }}>
                        What must exist when done?
                      </span>
                    )}
                  </p>
                )}
              </div>
              <button
                onClick={() => setEditingDeliverable((v) => !v)}
                className="shrink-0 mt-0.5 transition-colors opacity-0 group-hover:opacity-100"
                style={{
                  color: 'var(--pb-ink-muted)',
                  background: 'transparent',
                  border: 0,
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--pb-ink)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--pb-ink-muted)'; }}
                aria-label="Edit deliverable"
              >
                <Pencil size={13} strokeWidth={2.2} />
              </button>
            </div>

            {/* Description — BlockNote */}
            <div className="[&_.bn-editor]:!pl-0 [&_.bn-block-outer]:!pl-0 [&_.bn-block]:!pl-0">
              <LazyBlockNoteEditor
                initialBlocks={descriptionBlocks}
                onChange={onDescriptionBlocksChange}
                placeholder="Start writing..."
              />
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1.5px solid var(--pb-line-2)' }} />

          {/* Tab bar */}
          <div className="flex items-center gap-1.5 py-5">
            {([
              { id: 'comments', label: 'Comments', Icon: MessageSquare, count: comments.length },
              { id: 'activity', label: 'Activity', Icon: Clock, count: activityLog.length },
            ] as const).map(({ id, label, Icon, count }) => {
              const active = tab === id;
              return (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className="flex items-center gap-1.5 transition-colors"
                  style={{
                    padding: '6px 12px',
                    borderRadius: 10,
                    fontSize: 12.5,
                    fontWeight: 700,
                    fontFamily: 'inherit',
                    background: active ? 'var(--pb-cream-2)' : 'var(--pb-paper)',
                    border: `1.5px solid ${active ? 'var(--pb-ink)' : 'var(--pb-line-2)'}`,
                    boxShadow: active ? '0 2px 0 var(--pb-ink)' : 'none',
                    color: active ? 'var(--pb-ink)' : 'var(--pb-ink-muted)',
                    cursor: 'pointer',
                  }}
                >
                  <Icon size={13} strokeWidth={2.2} />
                  {label}
                  {count > 0 && (
                    <span
                      style={{
                        marginLeft: 2,
                        padding: '1px 7px',
                        borderRadius: 999,
                        fontSize: 10,
                        fontWeight: 700,
                        background: 'var(--pb-mint)',
                        border: '1.5px solid var(--pb-mint-ink)',
                        color: 'var(--pb-mint-ink)',
                      }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Comments tab */}
          {tab === 'comments' && (
            <CommentsSection
              comments={comments}
              currentUserId={currentUserId}
              teamMembers={teamMembers}
              onAddComment={onAddComment}
              onDeleteComment={onDeleteComment}
            />
          )}

          {/* Activity tab */}
          {tab === 'activity' && (
            <div className="flex flex-col gap-4">
              {entries.length === 0 ? (
                <p
                  className="italic"
                  style={{ fontSize: 13, color: 'var(--pb-ink-muted)' }}
                >
                  No activity yet.
                </p>
              ) : (
                entries.map((e) => {
                  const dot = DOT_VAR[e.type];
                  return (
                    <div key={e.id} className="flex items-start gap-3">
                      <span
                        className="shrink-0 mt-1.5"
                        style={{
                          width: 9,
                          height: 9,
                          borderRadius: 999,
                          background: dot?.bg ?? 'var(--pb-line-2)',
                          border: `1.5px solid ${dot?.ink ?? 'var(--pb-ink-muted)'}`,
                        }}
                      />
                      <div>
                        <p
                          className="leading-relaxed"
                          style={{ fontSize: 13, color: 'var(--pb-ink)', fontWeight: 500 }}
                        >
                          {describeEntry(e, resolveName)}
                        </p>
                        <span style={{ fontSize: 11, color: 'var(--pb-ink-muted)' }}>
                          {formatRelativeTime(e.timestamp)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
