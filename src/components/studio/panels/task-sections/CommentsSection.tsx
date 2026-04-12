'use client';
import { useState } from 'react';
import { Reply, Trash2 } from 'lucide-react';
import { PanelSection, PanelTextarea, PanelActionButton } from '@/components/ui/panel-controls';
import { formatRelativeTime } from '@/lib/format-time';
import type { Comment, TeamMember } from '@/lib/templates/types';

interface CommentsSectionProps {
  comments: Comment[];
  currentUserId: string;
  teamMembers: TeamMember[];
  onAddComment: (body: string, parentId?: string) => void;
  onDeleteComment: (commentId: string) => void;
}

function CommentItem({
  comment,
  authorName,
  isOwn,
  isReply,
  onReply,
  onDelete,
}: {
  comment: Comment;
  authorName: string;
  isOwn: boolean;
  isReply: boolean;
  onReply: () => void;
  onDelete: () => void;
}) {
  return (
    <div className={isReply ? 'ml-4 pl-3 border-l border-white/5' : ''}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[11px] font-medium text-zinc-300">{authorName}</span>
        <span className="text-[10px] text-zinc-600">{formatRelativeTime(comment.createdAt)}</span>
      </div>
      <p className="text-xs text-zinc-400 leading-relaxed mb-1.5">{comment.body}</p>
      <div className="flex items-center gap-2">
        {!isReply && (
          <button
            onClick={onReply}
            className="flex items-center gap-1 text-[10px] text-zinc-600 hover:text-zinc-300 transition-colors"
          >
            <Reply size={10} /> Reply
          </button>
        )}
        {isOwn && (
          <button
            onClick={onDelete}
            className="flex items-center gap-1 text-[10px] text-zinc-600 hover:text-red-400 transition-colors"
          >
            <Trash2 size={10} /> Delete
          </button>
        )}
      </div>
    </div>
  );
}

export function CommentsSection({
  comments,
  currentUserId,
  teamMembers,
  onAddComment,
  onDeleteComment,
}: CommentsSectionProps) {
  const [body, setBody] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const resolveName = (id: string) =>
    teamMembers.find((m) => m.id === id)?.name ?? 'Unknown';

  const topLevel = comments.filter((c) => !c.parentId);
  const replies = (parentId: string) => comments.filter((c) => c.parentId === parentId);

  const handlePost = () => {
    const trimmed = body.trim();
    if (!trimmed) return;
    onAddComment(trimmed, replyingTo ?? undefined);
    setBody('');
    setReplyingTo(null);
  };

  return (
    <PanelSection title="Comments" collapsible badge={comments.length} noBorder>
      {/* Comment list */}
      <div className="max-h-64 overflow-y-auto space-y-3 mb-3">
        {topLevel.length === 0 && (
          <p className="text-xs text-zinc-600 italic">No comments yet.</p>
        )}
        {topLevel.map((c) => (
          <div key={c.id} className="space-y-2">
            <CommentItem
              comment={c}
              authorName={resolveName(c.authorId)}
              isOwn={c.authorId === currentUserId}
              isReply={false}
              onReply={() => setReplyingTo(c.id)}
              onDelete={() => onDeleteComment(c.id)}
            />
            {replies(c.id).map((r) => (
              <CommentItem
                key={r.id}
                comment={r}
                authorName={resolveName(r.authorId)}
                isOwn={r.authorId === currentUserId}
                isReply
                onReply={() => {}}
                onDelete={() => onDeleteComment(r.id)}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Compose */}
      {replyingTo && (
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-[10px] text-zinc-500">
            Replying to {resolveName(comments.find((c) => c.id === replyingTo)?.authorId ?? '')}
          </span>
          <button
            onClick={() => setReplyingTo(null)}
            className="text-[10px] text-zinc-600 hover:text-zinc-300 underline"
          >
            cancel
          </button>
        </div>
      )}
      <PanelTextarea
        value={body}
        onChange={setBody}
        placeholder="Write a comment..."
        rows={2}
      />
      <div className="mt-2">
        <PanelActionButton
          variant="secondary"
          size="sm"
          onClick={handlePost}
          disabled={!body.trim()}
          fullWidth
        >
          Post
        </PanelActionButton>
      </div>
    </PanelSection>
  );
}
