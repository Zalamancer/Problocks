'use client';
import { useState } from 'react';
import { X, MessageSquare, Clock, Package, Pencil, Check } from 'lucide-react';
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
  onDeliverableChange: (v: string) => void;
}

type BottomTab = 'comments' | 'activity';

// ─── Activity helpers (mirrors ActivitySection logic, without PanelSection wrapper) ───

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
  onDeliverableChange,
}: ExpandedFieldEditorProps) {
  const [tab, setTab] = useState<BottomTab>('comments');
  const [editingDeliverable, setEditingDeliverable] = useState(false);
  const [deliverableDraft, setDeliverableDraft] = useState(deliverable ?? '');

  const resolveName = (id: string) =>
    id === 'local-user' ? 'You' : (teamMembers.find((m) => m.id === id)?.name ?? 'Unknown');

  const entries = [...activityLog].reverse().slice(0, 50);

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-[#1f1f1f] overflow-hidden">
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
              className="w-full bg-transparent text-2xl font-bold text-zinc-100 border-none outline-none placeholder:text-zinc-700 mb-6"
              placeholder="Untitled"
            />

            {/* Deliverable info box */}
            <div className="flex items-start gap-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 mb-8 group">
              <Package size={14} className="text-zinc-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 block mb-1">
                  Deliverable
                </span>
                {editingDeliverable ? (
                  <input
                    autoFocus
                    value={deliverableDraft}
                    onChange={(e) => setDeliverableDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        onDeliverableChange(deliverableDraft);
                        setEditingDeliverable(false);
                      }
                      if (e.key === 'Escape') setEditingDeliverable(false);
                    }}
                    onBlur={() => {
                      onDeliverableChange(deliverableDraft);
                      setEditingDeliverable(false);
                    }}
                    className="w-full bg-transparent text-sm text-zinc-200 outline-none placeholder:text-zinc-600"
                    placeholder="What must exist when done?"
                  />
                ) : (
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {deliverable || <span className="text-zinc-600 italic">What must exist when done?</span>}
                  </p>
                )}
              </div>
              <button
                onClick={() => { setDeliverableDraft(deliverable ?? ''); setEditingDeliverable(true); }}
                className="shrink-0 mt-0.5 text-zinc-600 hover:text-zinc-300 transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Edit deliverable"
              >
                {editingDeliverable ? <Check size={14} /> : <Pencil size={13} />}
              </button>
            </div>

            {/* Description — BlockNote */}
            <LazyBlockNoteEditor
              initialBlocks={descriptionBlocks}
              onChange={onDescriptionBlocksChange}
              placeholder="Start writing..."
            />
          </div>

          {/* Divider */}
          <div className="border-t border-white/[0.06]" />

          {/* Tab bar */}
          <div className="flex items-center gap-1 py-5">
            <button
              onClick={() => setTab('comments')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                tab === 'comments'
                  ? 'bg-white/10 text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <MessageSquare size={13} />
              Comments
              {comments.length > 0 && (
                <span className="ml-0.5 text-[10px] bg-white/10 rounded-full px-1.5 py-0.5 text-zinc-400">
                  {comments.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab('activity')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                tab === 'activity'
                  ? 'bg-white/10 text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Clock size={13} />
              Activity
              {activityLog.length > 0 && (
                <span className="ml-0.5 text-[10px] bg-white/10 rounded-full px-1.5 py-0.5 text-zinc-400">
                  {activityLog.length}
                </span>
              )}
            </button>
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
                <p className="text-sm text-zinc-600 italic">No activity yet.</p>
              ) : (
                entries.map((e) => (
                  <div key={e.id} className="flex items-start gap-3">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${DOT_COLOR[e.type] ?? 'bg-zinc-500'}`}
                    />
                    <div>
                      <p className="text-[13px] text-zinc-400 leading-relaxed">
                        {describeEntry(e, resolveName)}
                      </p>
                      <span className="text-[11px] text-zinc-600">
                        {formatRelativeTime(e.timestamp)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
