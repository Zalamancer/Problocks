'use client';
import { X } from 'lucide-react';
import { IconButton } from '@/components/ui';
import { LazyBlockNoteEditor } from './LazyBlockNoteEditor';
import { CommentsSection } from './CommentsSection';
import type { Comment, TeamMember } from '@/lib/templates/types';

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
}

/** Full-canvas document view — title + description editor, with comments below.
 *  Opens over the center canvas when a task is selected. */
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
}: ExpandedFieldEditorProps) {
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

      {/* Document body */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-8">
        <div className="max-w-3xl mx-auto">
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-full bg-transparent text-2xl font-bold text-zinc-100 border-none outline-none placeholder:text-zinc-700 mb-6"
            placeholder="Untitled"
          />

          {/* Description — BlockNote */}
          <LazyBlockNoteEditor
            initialBlocks={descriptionBlocks}
            onChange={onDescriptionBlocksChange}
            placeholder="Start writing..."
          />
        </div>
      </div>

      {/* Comments — below the editor */}
      <div className="shrink-0 border-t border-white/5 max-h-72 overflow-y-auto px-4 py-4">
        <CommentsSection
          comments={comments}
          currentUserId={currentUserId}
          teamMembers={teamMembers}
          onAddComment={onAddComment}
          onDeleteComment={onDeleteComment}
        />
      </div>
    </div>
  );
}
