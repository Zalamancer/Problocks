// Teacher Messages view — group chat (per-class channels) + direct messages
// (per-student threads). Ported from problocks/project/pb_teacher/messages.jsx.
// Layout: [sidebar] [thread + composer] [details panel].
'use client';

import React, { useState } from 'react';
import { Block, Icon } from '@/components/landing/pb-site/primitives';
import { CHANNELS_BY_CLASS, SEED_DM, SEED_GROUP, type Channel, type ChatMessage } from './messages-data';
import { ChannelDetails, DmThread, GroupThread, StudentDetails } from './MessagesThread';
import { CLASSES, STUDENTS, type ClassRecord, type Student } from './sample-data';
import { kickerSty } from './shared';

type Mode = 'group' | 'dm';

type ThreadsState = Record<string, ChatMessage[]>;

const initialThreads = (): ThreadsState => {
  const initial: ThreadsState = {};
  for (const [k, v] of Object.entries(SEED_GROUP)) initial[k] = [...v];
  for (const [id, v] of Object.entries(SEED_DM))   initial[`dm:${id}`] = [...v];
  return initial;
};

// --- Sidebar rows ------------------------------------------------------------

const SidebarSection = ({
  label, emoji, tone, mt,
}: { label: string; emoji?: string; tone?: string; mt?: boolean }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '8px 8px 6px', marginTop: mt ? 14 : 0,
  }}>
    {emoji && tone && (
      <span style={{
        width: 22, height: 22, borderRadius: 6,
        background: `var(--pbs-${tone})`, border: `1.5px solid var(--pbs-${tone}-ink)`,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
      }}>{emoji}</span>
    )}
    <span className="pbs-mono" style={{
      fontSize: 10, letterSpacing: '0.1em',
      color: 'var(--pbs-ink-muted)', textTransform: 'uppercase',
    }}>{label}</span>
  </div>
);

const ChannelRow = ({
  c, active, onClick,
}: { c: Channel; active: boolean; onClick: () => void }) => (
  <button type="button" onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '9px 10px', borderRadius: 10,
    background: active ? 'var(--pbs-ink)' : 'transparent',
    color: active ? 'var(--pbs-cream)' : 'var(--pbs-ink)',
    textAlign: 'left', border: 0, cursor: 'pointer', fontFamily: 'inherit',
  }}>
    <span style={{
      fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 700,
      opacity: active ? 0.7 : 0.5, width: 10,
    }}>#</span>
    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em' }}>{c.name}</span>
    {c.pinned && <Icon name="star" size={11} stroke={2.2} style={{ opacity: active ? 0.85 : 0.5 }}/>}
    {c.unread > 0 && (
      <span style={{
        minWidth: 18, height: 18, padding: '0 5px', borderRadius: 999,
        background: 'var(--pbs-butter)', color: 'var(--pbs-butter-ink)',
        fontSize: 10, fontWeight: 700,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        border: '1.5px solid var(--pbs-butter-ink)',
      }}>{c.unread}</span>
    )}
  </button>
);

const DmRow = ({
  s, active, onClick, last,
}: { s: Student; active: boolean; onClick: () => void; last?: ChatMessage }) => (
  <button type="button" onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '9px 10px', borderRadius: 10,
    background: active ? 'var(--pbs-cream-2)' : 'transparent',
    border: active ? '1.5px solid var(--pbs-ink)' : '1.5px solid transparent',
    textAlign: 'left', cursor: 'pointer', color: 'inherit', fontFamily: 'inherit',
  }}>
    <span style={{
      width: 32, height: 32, borderRadius: 10, fontSize: 16,
      background: `var(--pbs-${s.tone})`, border: `1.5px solid var(--pbs-${s.tone}-ink)`,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    }}>{s.emoji}</span>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 12.5, fontWeight: 700 }}>{s.name}</div>
      <div style={{
        fontSize: 10.5, color: 'var(--pbs-ink-muted)',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {last ? (last.who === 'me' ? 'You: ' : '') + last.text : 'No messages yet'}
      </div>
    </div>
  </button>
);

const otherClassRow: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8,
  padding: '7px 10px', borderRadius: 10,
  background: 'var(--pbs-cream)', border: '1.5px solid var(--pbs-line)',
};

const newDmRow: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 10,
  padding: '7px 10px', borderRadius: 10,
  background: 'transparent',
  color: 'var(--pbs-ink-soft)',
  border: 0, cursor: 'pointer', fontFamily: 'inherit',
};

// --- Main component ----------------------------------------------------------

export const Messages = ({
  cls, onStudent,
}: { cls: ClassRecord; onStudent?: (s: Student) => void }) => {
  const [mode, setMode]         = useState<Mode>('group');
  const [channelId, setChannel] = useState('general');
  const [dmStudentId, setDm]    = useState('s5');
  const [query, setQuery]       = useState('');
  const [threadsState, setThreadsState] = useState<ThreadsState>(initialThreads);

  const channels = CHANNELS_BY_CLASS[cls.id] || [];
  const threadIds = Object.keys(SEED_DM);

  const key = mode === 'group' ? `${cls.id}:${channelId}` : `dm:${dmStudentId}`;
  const activeChannel = channels.find((c) => c.id === channelId) || channels[0];
  const activeStudent = STUDENTS.find((s) => s.id === dmStudentId);
  const messages = threadsState[key] || [];

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    setThreadsState((ts) => ({
      ...ts,
      [key]: [...(ts[key] || []), { who: 'me', t: 'now', text: text.trim() }],
    }));
  };

  return (
    <div className="pbs-fade-in">
      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
        marginBottom: 18, gap: 12,
      }}>
        <div>
          <div className="pbs-mono" style={kickerSty}>MESSAGES</div>
          <h1 style={{
            margin: '6px 0 0',
            fontSize: 'clamp(28px, 3.4vw, 42px)',
            fontWeight: 700, letterSpacing: '-0.025em',
          }}>Talk to your class</h1>
        </div>
        <div style={{
          display: 'flex', gap: 4, padding: 3,
          background: 'var(--pbs-paper)',
          border: '1.5px solid var(--pbs-line-2)',
          borderRadius: 14,
        }}>
          {([['group', 'Group chat'], ['dm', 'Direct messages']] as [Mode, string][]).map(([k, l]) => (
            <button
              key={k}
              type="button"
              onClick={() => setMode(k)}
              style={{
                padding: '9px 14px', borderRadius: 10,
                background: mode === k ? 'var(--pbs-ink)' : 'transparent',
                color: mode === k ? 'var(--pbs-cream)' : 'var(--pbs-ink-soft)',
                fontSize: 12.5, fontWeight: 600,
                border: 0, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >{l}</button>
          ))}
        </div>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '280px 1fr 300px', gap: 14,
        minHeight: 620, alignItems: 'stretch',
      }}>
        {/* LEFT: sidebar */}
        <Block tone="paper" style={{ padding: 10, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={mode === 'group' ? 'Filter channels…' : 'Search students…'}
            style={{
              padding: '9px 12px', borderRadius: 10,
              border: '1.5px solid var(--pbs-line-2)', background: 'var(--pbs-cream)',
              fontSize: 12.5, outline: 'none', marginBottom: 8,
              color: 'inherit', fontFamily: 'inherit',
            }}
          />

          {mode === 'group' ? (
            <>
              <SidebarSection label={cls.name} emoji={cls.emoji} tone={cls.tone}/>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {channels
                  .filter((c) => !query || c.name.includes(query.toLowerCase()))
                  .map((c) => (
                    <ChannelRow key={c.id} c={c} active={c.id === channelId} onClick={() => setChannel(c.id)}/>
                  ))}
              </div>

              <SidebarSection label="Your other classes" mt/>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {CLASSES.filter((c) => c.id !== cls.id).map((c) => (
                  <div key={c.id} style={otherClassRow}>
                    <span style={{
                      width: 22, height: 22, borderRadius: 6,
                      background: `var(--pbs-${c.tone})`,
                      border: `1.5px solid var(--pbs-${c.tone}-ink)`,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12,
                    }}>{c.emoji}</span>
                    <span style={{ flex: 1, fontSize: 12, fontWeight: 600 }}>{c.name}</span>
                    <span className="pbs-mono" style={{ fontSize: 10, color: 'var(--pbs-ink-muted)' }}>{c.members}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <SidebarSection label="Recent"/>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {threadIds
                  .map((id) => STUDENTS.find((s) => s.id === id))
                  .filter((s): s is Student => Boolean(s))
                  .filter((s) => !query || s.name.toLowerCase().includes(query.toLowerCase()))
                  .map((s) => (
                    <DmRow
                      key={s.id}
                      s={s}
                      active={s.id === dmStudentId}
                      onClick={() => setDm(s.id)}
                      last={(threadsState[`dm:${s.id}`] || []).slice(-1)[0]}
                    />
                  ))}
              </div>

              <SidebarSection label="Start new" mt/>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 180, overflow: 'auto' }}>
                {STUDENTS
                  .filter((s) => !threadIds.includes(s.id))
                  .filter((s) => !query || s.name.toLowerCase().includes(query.toLowerCase()))
                  .slice(0, 8)
                  .map((s) => (
                    <button key={s.id} type="button" onClick={() => setDm(s.id)} style={newDmRow}>
                      <span style={{ fontSize: 16 }}>{s.emoji}</span>
                      <span style={{ flex: 1, textAlign: 'left', fontSize: 12, fontWeight: 600 }}>{s.name}</span>
                      <Icon name="plus" size={12} stroke={2.4}/>
                    </button>
                  ))}
              </div>
            </>
          )}
        </Block>

        {/* CENTER: thread */}
        <Block tone="paper" style={{ padding: 0, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {mode === 'group' && activeChannel ? (
            <GroupThread cls={cls} channel={activeChannel} messages={messages} onSend={handleSend}/>
          ) : mode === 'dm' && activeStudent ? (
            <DmThread
              s={activeStudent}
              messages={messages}
              onSend={handleSend}
              onProfile={() => onStudent && onStudent(activeStudent)}
            />
          ) : null}
        </Block>

        {/* RIGHT: details */}
        <Block tone="cream" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
          {mode === 'group' && activeChannel ? (
            <ChannelDetails cls={cls} channel={activeChannel} messages={messages}/>
          ) : mode === 'dm' && activeStudent ? (
            <StudentDetails s={activeStudent} onProfile={() => onStudent && onStudent(activeStudent)}/>
          ) : null}
        </Block>
      </div>
    </div>
  );
};
