// Thread / composer / details panels for the teacher Messages view.
// Ported from problocks/project/pb_teacher/messages.jsx (GroupThread,
// DmThread, ThreadHeader, MessageList, MessageBubble, Composer,
// ChannelDetails, StudentDetails).
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Icon, Pill } from '@/components/landing/pb-site/primitives';
import type { Channel, ChatMessage } from './messages-data';
import { STUDENTS, type ClassRecord, type Student, type TeacherTone } from './sample-data';

// --- Thread header -----------------------------------------------------------

const ThreadHeader = ({
  titleLeft, avatar, title, subtitle, rightChips,
}: {
  titleLeft?: React.ReactNode;
  avatar?: React.ReactNode;
  title: React.ReactNode;
  subtitle: React.ReactNode;
  rightChips?: React.ReactNode[];
}) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '14px 18px', borderBottom: '1.5px solid var(--pbs-line-2)',
  }}>
    {avatar}
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 6 }}>
        {titleLeft}{title}
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--pbs-ink-muted)', marginTop: 2 }}>{subtitle}</div>
    </div>
    <div style={{ display: 'flex', gap: 6 }}>{rightChips}</div>
  </div>
);

const linkBtn: React.CSSProperties = {
  padding: '6px 10px', borderRadius: 999,
  background: 'var(--pbs-cream)', border: '1.5px solid var(--pbs-line-2)',
  fontSize: 11.5, fontWeight: 600, color: 'var(--pbs-ink-soft)',
  cursor: 'pointer', fontFamily: 'inherit',
};

// --- Message list + bubble ---------------------------------------------------

type Author = { name: string; emoji: string; tone: TeacherTone | 'cream' };

const resolveAuthor = (id: string, dmPartner?: Student): Author => {
  if (dmPartner && dmPartner.id === id) return dmPartner;
  const s = STUDENTS.find((x) => x.id === id);
  if (s) return s;
  return { name: id, emoji: '🙂', tone: 'cream' };
};

const MessageBubble = ({
  m, isMe, author, showAvatar,
}: { m: ChatMessage; isMe: boolean; author: Author; showAvatar?: boolean }) => {
  const bubbleBg     = isMe ? 'var(--pbs-ink)'    : 'var(--pbs-cream-2)';
  const bubbleFg     = isMe ? 'var(--pbs-cream)'  : 'var(--pbs-ink)';
  const bubbleBorder = isMe ? 'var(--pbs-ink)'    : 'var(--pbs-line-2)';

  return (
    <div style={{
      display: 'flex', gap: 8,
      flexDirection: isMe ? 'row-reverse' : 'row',
      alignItems: 'flex-end',
    }}>
      {showAvatar && (
        <span style={{
          width: 28, height: 28, borderRadius: 8, fontSize: 14,
          background: `var(--pbs-${author.tone})`,
          border: `1.5px solid var(--pbs-${author.tone}-ink, var(--pbs-line-2))`,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>{author.emoji}</span>
      )}
      <div style={{ maxWidth: '72%', display: 'flex', flexDirection: 'column', gap: 3, alignItems: isMe ? 'flex-end' : 'flex-start' }}>
        {showAvatar && (
          <div style={{ fontSize: 10.5, display: 'flex', gap: 6, alignItems: 'baseline' }}>
            <span style={{ fontWeight: 700, color: 'var(--pbs-ink)' }}>{author.name}</span>
            <span style={{ color: 'var(--pbs-ink-muted)' }}>{m.t}</span>
            {m.pinned && <Pill tone="butter" icon="star">pinned</Pill>}
          </div>
        )}
        <div style={{
          padding: '9px 13px',
          borderRadius: 14,
          background: bubbleBg, color: bubbleFg,
          border: `1.5px solid ${bubbleBorder}`,
          boxShadow: `0 2px 0 ${bubbleBorder}`,
          fontSize: 13.5, lineHeight: 1.45,
          borderTopLeftRadius: !isMe && showAvatar ? 4 : 14,
          borderTopRightRadius: isMe ? 4 : 14,
        }}>
          {m.text}
          {m.attachment && (
            <div style={{
              marginTop: 8, padding: 10, borderRadius: 10,
              background: isMe ? 'rgba(253,246,230,0.12)' : 'var(--pbs-paper)',
              border: `1.5px dashed ${isMe ? 'var(--pbs-cream)' : 'var(--pbs-line-2)'}`,
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: 11.5, fontFamily: "'DM Mono', monospace",
            }}>
              <Icon name="image" size={14} stroke={2}/>
              {m.attachment.label}
            </div>
          )}
        </div>

        {!showAvatar && (
          <div style={{ fontSize: 10, color: 'var(--pbs-ink-muted)', padding: '0 4px' }}>{m.t}</div>
        )}

        {m.react && (
          <div style={{ display: 'flex', gap: 4 }}>
            {Object.entries(m.react).map(([e, n]) => (
              <span key={e} style={{
                padding: '2px 8px', borderRadius: 999,
                background: 'var(--pbs-cream-2)', border: '1.5px solid var(--pbs-line-2)',
                fontSize: 11, display: 'inline-flex', gap: 4, alignItems: 'center',
              }}>{e} <span className="pbs-mono" style={{ fontWeight: 700 }}>{n}</span></span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const MessageList = ({
  messages, showAvatars, dmPartner,
}: { messages: ChatMessage[]; showAvatars?: boolean; dmPartner?: Student }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages.length]);

  return (
    <div ref={scrollRef} style={{
      flex: 1, overflowY: 'auto', padding: '16px 18px',
      display: 'flex', flexDirection: 'column', gap: 10,
      background: 'var(--pbs-paper)',
    }}>
      {messages.map((m, i) => {
        const isMe = m.who === 'me';
        const author: Author = isMe
          ? { name: 'Ms. Rivera', emoji: '👩🏽‍🏫', tone: 'grape' }
          : resolveAuthor(m.who, dmPartner);
        return <MessageBubble key={i} m={m} isMe={isMe} author={author} showAvatar={showAvatars}/>;
      })}
      <div style={{
        fontSize: 10.5, color: 'var(--pbs-ink-muted)', textAlign: 'center',
        padding: '4px 0', fontFamily: "'DM Mono', monospace",
      }}>— end of thread —</div>
    </div>
  );
};

// --- Composer ----------------------------------------------------------------

const IconBtn = ({ name }: { name: React.ComponentProps<typeof Icon>['name'] }) => (
  <button type="button" style={{
    width: 30, height: 30, borderRadius: 8,
    background: 'var(--pbs-cream-2)', border: '1.5px solid var(--pbs-line)',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--pbs-ink-soft)',
    cursor: 'pointer',
  }}><Icon name={name} size={14} stroke={2}/></button>
);

const Composer = ({
  placeholder, onSend, mode,
}: { placeholder: string; onSend: (text: string) => void; mode: 'group' | 'dm' }) => {
  const [text, setText] = useState('');
  const submit = () => { onSend(text); setText(''); };

  return (
    <div style={{
      padding: '12px 14px', borderTop: '1.5px solid var(--pbs-line-2)',
      background: 'var(--pbs-cream)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: 8,
        padding: 8, borderRadius: 14,
        background: 'var(--pbs-paper)', border: '1.5px solid var(--pbs-line-2)',
        boxShadow: '0 3px 0 var(--pbs-line-2)',
      }}>
        <div style={{ display: 'flex', gap: 4 }}>
          <IconBtn name="image"/>
          <IconBtn name="sparkle"/>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
          placeholder={placeholder}
          rows={1}
          style={{
            flex: 1, resize: 'none', border: 0, outline: 'none', background: 'transparent',
            fontSize: 13.5, padding: '6px 4px', lineHeight: 1.4, fontFamily: 'inherit',
            minHeight: 24, maxHeight: 120,
            color: 'inherit',
          }}
        />
        <button
          type="button"
          onClick={submit}
          className="pbs-chunky pbs-chunky-butter"
          style={{ padding: '8px 14px' }}
          disabled={!text.trim()}
        >
          <Icon name="send" size={13} stroke={2.4}/> Send
        </button>
      </div>
      <div style={{ fontSize: 10.5, color: 'var(--pbs-ink-muted)', marginTop: 6, padding: '0 4px' }}>
        {mode === 'group' ? 'Visible to everyone in the channel' : 'Private — only you and this student'} · Enter to send, Shift+Enter for newline
      </div>
    </div>
  );
};

// --- Threads -----------------------------------------------------------------

export const GroupThread = ({
  cls, channel, messages, onSend,
}: {
  cls: ClassRecord;
  channel: Channel;
  messages: ChatMessage[];
  onSend: (text: string) => void;
}) => (
  <>
    <ThreadHeader
      titleLeft={<span style={{ fontFamily: "'DM Mono', monospace", opacity: 0.5 }}>#</span>}
      title={channel.name}
      subtitle={(
        <span>
          <span style={{ color: `var(--pbs-${cls.tone}-ink)` }}>●</span> {cls.name} · {cls.members} members · {channel.desc}
        </span>
      )}
      rightChips={[
        channel.readOnly && <Pill key="r" tone="coral">Teachers only</Pill>,
        channel.pinned && <Pill key="p" tone="butter" icon="star">Pinned</Pill>,
      ].filter(Boolean) as React.ReactNode[]}
    />
    <MessageList messages={messages} showAvatars/>
    <Composer
      placeholder={channel.readOnly ? `Only teachers can post in #${channel.name}…  (post as Ms. Rivera)` : `Message #${channel.name}`}
      onSend={onSend}
      mode="group"
    />
  </>
);

export const DmThread = ({
  s, messages, onSend, onProfile,
}: {
  s: Student;
  messages: ChatMessage[];
  onSend: (text: string) => void;
  onProfile: () => void;
}) => (
  <>
    <ThreadHeader
      avatar={(
        <span style={{
          width: 34, height: 34, borderRadius: 10, fontSize: 18,
          background: `var(--pbs-${s.tone})`, border: `1.5px solid var(--pbs-${s.tone}-ink)`,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>{s.emoji}</span>
      )}
      title={s.name}
      subtitle={<span>Direct message · last active {s.lastActive}</span>}
      rightChips={[
        s.risk !== 'none' && (
          <Pill key="r" tone={s.risk === 'high' ? 'coral' : 'butter'} icon="heart">{s.risk} risk</Pill>
        ),
        <button key="p" type="button" onClick={onProfile} style={linkBtn}>Open profile →</button>,
      ].filter(Boolean) as React.ReactNode[]}
    />
    <MessageList messages={messages} dmPartner={s}/>
    <Composer placeholder={`Message ${s.name.split(' ')[0]} privately…`} onSend={onSend} mode="dm"/>
  </>
);

// --- Details panels ----------------------------------------------------------

const Stat = ({ k, v }: { k: string; v: React.ReactNode }) => (
  <div style={{ padding: '8px 10px', borderRadius: 8, background: 'var(--pbs-paper)', border: '1.5px solid var(--pbs-line)' }}>
    <div className="pbs-mono" style={{ fontSize: 9.5, letterSpacing: '0.08em', color: 'var(--pbs-ink-muted)' }}>{k.toUpperCase()}</div>
    <div style={{ fontSize: 14, fontWeight: 700, marginTop: 1 }}>{v}</div>
  </div>
);

const topContributors = (messages: ChatMessage[]) => {
  const counts: Record<string, number> = {};
  messages.forEach((m) => {
    if (m.who === 'me') return;
    counts[m.who] = (counts[m.who] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([id, count]) => {
      const s = STUDENTS.find((x) => x.id === id);
      if (!s) return null;
      return { id, name: s.name, emoji: s.emoji, count };
    })
    .filter((x): x is { id: string; name: string; emoji: string; count: number } => Boolean(x))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);
};

export const ChannelDetails = ({
  cls, channel, messages,
}: { cls: ClassRecord; channel: Channel; messages: ChatMessage[] }) => {
  const me     = messages.filter((m) => m.who === 'me').length;
  const them   = messages.length - me;
  const pinned = messages.filter((m) => m.pinned);
  const top    = topContributors(messages);

  return (
    <>
      <div className="pbs-mono" style={{ fontSize: 10, letterSpacing: '0.1em', color: 'var(--pbs-ink-muted)' }}>ABOUT</div>
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>
          <span style={{ opacity: 0.5, fontFamily: "'DM Mono', monospace" }}>#</span>{channel.name}
        </div>
        <div style={{ fontSize: 12, color: 'var(--pbs-ink-muted)', marginTop: 2 }}>{channel.desc}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        <Stat k="Members"  v={cls.members}/>
        <Stat k="Posts"    v={messages.length}/>
        <Stat k="Yours"    v={me}/>
        <Stat k="Students" v={them}/>
      </div>

      {pinned.length > 0 && (
        <div>
          <div className="pbs-mono" style={{ fontSize: 10, letterSpacing: '0.1em', color: 'var(--pbs-ink-muted)', marginBottom: 6 }}>PINNED</div>
          {pinned.map((m, i) => (
            <div key={i} style={{
              padding: 10, borderRadius: 10, marginBottom: 6,
              background: 'var(--pbs-butter)', color: 'var(--pbs-butter-ink)',
              border: '1.5px solid var(--pbs-butter-ink)',
              fontSize: 12, fontWeight: 500,
            }}>
              <Icon name="star" size={11} stroke={2.4} style={{ marginRight: 4 }}/>
              {m.text}
            </div>
          ))}
        </div>
      )}

      {top.length > 0 && (
        <div>
          <div className="pbs-mono" style={{ fontSize: 10, letterSpacing: '0.1em', color: 'var(--pbs-ink-muted)', marginBottom: 6 }}>MOST ACTIVE</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {top.map((c) => (
              <div key={c.id} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 8px', borderRadius: 8,
                background: 'var(--pbs-paper)', border: '1.5px solid var(--pbs-line)',
              }}>
                <span style={{ fontSize: 15 }}>{c.emoji}</span>
                <span style={{ flex: 1, fontSize: 12, fontWeight: 600 }}>{c.name}</span>
                <span className="pbs-mono" style={{ fontSize: 11, color: 'var(--pbs-ink-muted)' }}>{c.count} post{c.count === 1 ? '' : 's'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export const StudentDetails = ({
  s, onProfile,
}: { s: Student; onProfile: () => void }) => (
  <>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '12px 0 0' }}>
      <span style={{
        width: 64, height: 64, borderRadius: 16, fontSize: 34,
        background: `var(--pbs-${s.tone})`, border: `1.5px solid var(--pbs-${s.tone}-ink)`,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}>{s.emoji}</span>
      <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em' }}>{s.name}</div>
      <div className="pbs-mono" style={{ fontSize: 10.5, color: 'var(--pbs-ink-muted)' }}>active {s.lastActive}</div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
      <Stat k="Grade"   v={s.grade}/>
      <Stat k="Average" v={`${s.avg}%`}/>
      <Stat k="Streak"  v={`${s.streak}d`}/>
      <Stat k="Done"    v={s.submitted}/>
    </div>

    <div>
      <div className="pbs-mono" style={{ fontSize: 10, letterSpacing: '0.1em', color: 'var(--pbs-ink-muted)', marginBottom: 6 }}>QUICK REPLIES</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {['Want to review together?', 'Great work this week 🎉', 'Need help with anything?'].map((r) => (
          <div key={r} style={{ padding: '8px 10px', borderRadius: 8, background: 'var(--pbs-paper)', border: '1.5px solid var(--pbs-line)', fontSize: 11.5, color: 'var(--pbs-ink-soft)' }}>{r}</div>
        ))}
      </div>
    </div>

    <button
      type="button"
      onClick={onProfile}
      className="pbs-chunky pbs-chunky-ghost"
      style={{ marginTop: 'auto' }}
    >Open full profile</button>
  </>
);
