'use client';
import { useState } from 'react';
import { Send, Reply, Trash2, X } from 'lucide-react';
import { formatRelativeTime } from '@/lib/format-time';
import type { Comment, TeamMember } from '@/lib/templates/types';

// ─── Avatar helpers ───────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  'bg-purple-500', 'bg-blue-500', 'bg-emerald-500',
  'bg-orange-500', 'bg-pink-500', 'bg-cyan-500', 'bg-amber-500',
];

function avatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(name: string): string {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

function Avatar({ name, userId }: { name: string; userId: string }) {
  return (
    <div
      className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${avatarColor(userId)}`}
    >
      {initials(name)}
    </div>
  );
}

// ─── Single comment item ──────────────────────────────────────────────────────

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
    <div className={`flex gap-2.5 group ${isReply ? 'ml-9 mt-2' : ''}`}>
      {!isReply && <Avatar name={authorName} userId={comment.authorId} />}
      {isReply && <div className="w-5 border-l-2 border-white/10 shrink-0 rounded-b-full" />}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[12px] font-semibold text-zinc-200">{authorName}</span>
          <span className="text-[11px] text-zinc-500">{formatRelativeTime(comment.createdAt)}</span>
        </div>
        <p className="text-[13px] text-zinc-300 leading-relaxed whitespace-pre-wrap">{comment.body}</p>
        <div className="flex items-center gap-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isReply && (
            <button
              onClick={onReply}
              className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <Reply size={11} /> Reply
            </button>
          )}
          {isOwn && (
            <button
              onClick={onDelete}
              className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-red-400 transition-colors"
            >
              <Trash2 size={11} /> Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

interface CommentsSectionProps {
  comments: Comment[];
  currentUserId: string;
  teamMembers: TeamMember[];
  onAddComment: (body: string, parentId?: string) => void;
  onDeleteComment: (commentId: string) => void;
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
    id === 'local-user' ? 'You' : (teamMembers.find((m) => m.id === id)?.name ?? 'Unknown');

  const topLevel = comments.filter((c) => !c.parentId);
  const repliesFor = (parentId: string) => comments.filter((c) => c.parentId === parentId);

  const handlePost = () => {
    const trimmed = body.trim();
    if (!trimmed) return;
    onAddComment(trimmed, replyingTo ?? undefined);
    setBody('');
    setReplyingTo(null);
  };

  const replyTarget = replyingTo ? comments.find((c) => c.id === replyingTo) : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Comment list */}
      {topLevel.length === 0 ? (
        <p className="text-sm text-zinc-600 italic">No comments yet — be the first!</p>
      ) : (
        <div className="flex flex-col gap-4">
          {topLevel.map((c) => (
            <div key={c.id}>
              <CommentItem
                comment={c}
                authorName={resolveName(c.authorId)}
                isOwn={c.authorId === currentUserId}
                isReply={false}
                onReply={() => setReplyingTo(c.id)}
                onDelete={() => onDeleteComment(c.id)}
              />
              {repliesFor(c.id).map((r) => (
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
      )}

      {/* Compose */}
      <div className="flex gap-2.5">
        <Avatar name="You" userId={currentUserId} />
        <div className="flex-1">
          {replyTarget && (
            <div className="flex items-center gap-1.5 mb-1.5 text-[11px] text-zinc-500">
              <Reply size={11} />
              Replying to{' '}
              <span className="text-zinc-300">{resolveName(replyTarget.authorId)}</span>
              <button onClick={() => setReplyingTo(null)} className="hover:text-zinc-300 ml-0.5">
                <X size={11} />
              </button>
            </div>
          )}
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handlePost();
            }}
            placeholder={replyTarget ? 'Write a reply...' : 'Add a comment... (⌘↵ to post)'}
            rows={2}
            className="w-full bg-white/5 rounded-lg px-3 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 resize-none outline-none border border-white/[0.06] focus:border-white/20 transition-colors"
          />
          <div className="flex justify-end mt-1.5">
            <button
              onClick={handlePost}
              disabled={!body.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium bg-accent/90 hover:bg-accent text-white disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={11} />
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
