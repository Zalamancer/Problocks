'use client';
import { useState } from 'react';
import { Send, Reply, Trash2, X } from 'lucide-react';
import { formatRelativeTime } from '@/lib/format-time';
import type { Comment, TeamMember } from '@/lib/templates/types';

// ─── Avatar helpers ───────────────────────────────────────────────────────────

const AVATAR_TONES: { bg: string; ink: string }[] = [
  { bg: 'var(--pb-grape)',  ink: 'var(--pb-grape-ink)'  },
  { bg: 'var(--pb-sky)',    ink: 'var(--pb-sky-ink)'    },
  { bg: 'var(--pb-mint)',   ink: 'var(--pb-mint-ink)'   },
  { bg: 'var(--pb-coral)',  ink: 'var(--pb-coral-ink)'  },
  { bg: 'var(--pb-pink)',   ink: 'var(--pb-pink-ink)'   },
  { bg: 'var(--pb-butter)', ink: 'var(--pb-butter-ink)' },
];

function avatarTone(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return AVATAR_TONES[Math.abs(hash) % AVATAR_TONES.length];
}

function initials(name: string): string {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

function Avatar({ name, userId }: { name: string; userId: string }) {
  const tone = avatarTone(userId);
  return (
    <div
      className="flex items-center justify-center shrink-0"
      style={{
        width: 28,
        height: 28,
        borderRadius: 999,
        background: tone.bg,
        border: `1.5px solid ${tone.ink}`,
        boxShadow: `0 2px 0 ${tone.ink}`,
        color: tone.ink,
        fontSize: 10,
        fontWeight: 800,
      }}
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
      {isReply && (
        <div
          className="shrink-0"
          style={{
            width: 20,
            borderLeft: '1.5px solid var(--pb-line-2)',
            borderBottomLeftRadius: 999,
          }}
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--pb-ink)' }}>
            {authorName}
          </span>
          <span style={{ fontSize: 11, color: 'var(--pb-ink-muted)' }}>
            {formatRelativeTime(comment.createdAt)}
          </span>
        </div>
        <p
          className="leading-relaxed whitespace-pre-wrap"
          style={{ fontSize: 13, color: 'var(--pb-ink)' }}
        >
          {comment.body}
        </p>
        <div className="flex items-center gap-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isReply && (
            <button
              onClick={onReply}
              className="flex items-center gap-1 transition-colors"
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--pb-ink-muted)',
                background: 'transparent',
                border: 0,
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--pb-ink)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--pb-ink-muted)'; }}
            >
              <Reply size={11} strokeWidth={2.2} /> Reply
            </button>
          )}
          {isOwn && (
            <button
              onClick={onDelete}
              className="flex items-center gap-1 transition-colors"
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--pb-ink-muted)',
                background: 'transparent',
                border: 0,
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--pb-coral-ink)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--pb-ink-muted)'; }}
            >
              <Trash2 size={11} strokeWidth={2.2} /> Delete
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
  const [focused, setFocused] = useState(false);

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
  const canPost = body.trim().length > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Comment list */}
      {topLevel.length === 0 ? (
        <p
          className="italic"
          style={{ fontSize: 13, color: 'var(--pb-ink-muted)' }}
        >
          No comments yet — be the first!
        </p>
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
            <div
              className="flex items-center gap-1.5 mb-1.5"
              style={{ fontSize: 11, color: 'var(--pb-ink-muted)', fontWeight: 600 }}
            >
              <Reply size={11} strokeWidth={2.2} />
              Replying to{' '}
              <span style={{ color: 'var(--pb-ink)', fontWeight: 700 }}>
                {resolveName(replyTarget.authorId)}
              </span>
              <button
                onClick={() => setReplyingTo(null)}
                className="ml-0.5 transition-colors"
                style={{
                  color: 'var(--pb-ink-muted)',
                  background: 'transparent',
                  border: 0,
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--pb-ink)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--pb-ink-muted)'; }}
              >
                <X size={11} strokeWidth={2.4} />
              </button>
            </div>
          )}
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handlePost();
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={replyTarget ? 'Write a reply...' : 'Add a comment... (⌘↵ to post)'}
            rows={2}
            className="w-full resize-none outline-none transition-colors"
            style={{
              background: 'var(--pb-paper)',
              color: 'var(--pb-ink)',
              border: `1.5px solid ${focused ? 'var(--pb-ink)' : 'var(--pb-line-2)'}`,
              borderRadius: 10,
              padding: '9px 12px',
              fontSize: 13,
              fontFamily: 'inherit',
              boxShadow: focused ? '0 2px 0 var(--pb-ink)' : 'none',
            }}
          />
          <div className="flex justify-end mt-1.5">
            <button
              onClick={handlePost}
              disabled={!canPost}
              className="flex items-center gap-1.5 transition-opacity"
              style={{
                padding: '5px 14px',
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                fontFamily: 'inherit',
                background: 'var(--pb-mint)',
                color: 'var(--pb-mint-ink)',
                border: '1.5px solid var(--pb-mint-ink)',
                boxShadow: '0 2px 0 var(--pb-mint-ink)',
                opacity: canPost ? 1 : 0.4,
                cursor: canPost ? 'pointer' : 'not-allowed',
              }}
            >
              <Send size={11} strokeWidth={2.4} />
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
