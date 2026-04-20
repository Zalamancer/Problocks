// Student class detail page — banner, tab bar, Stream/Work/People/Library tabs.
// Ported from problocks/project/pb_student/class_detail.jsx (design bundle).
'use client';

import React, { useState } from 'react';
import { Block, Chunky, Icon, Pill } from '@/components/landing/pb-site/primitives';
import {
  CLASS_FEED, CLASS_PAST, FeedItem, LeaderRow, LibraryTabCls, PastRow,
  PeopleTab, SAMPLE_LEADERBOARD, WorkTab, kickerStyCd,
  type ClassLibraryItem,
} from './class-detail-tabs';
import type { AssignedGame, ClassRecord, StudentUser } from './sample-data';
import type { AnyGame } from './Dashboard';

type IconName = React.ComponentProps<typeof Icon>['name'];

export const ClassDetail = ({
  cls, user, assigned, onPlay, onBack,
}: {
  cls: ClassRecord;
  user: StudentUser;
  assigned: AssignedGame[];
  onPlay: (g: AnyGame) => void;
  onBack: () => void;
}) => {
  const [tab, setTab] = useState<'stream' | 'work' | 'people' | 'library'>('stream');
  // AssignedGame.status is 'new' | 'inprogress' — there's no 'done' state yet,
  // so every class-assigned game is "pending" until completion is modeled.
  const pending = assigned.filter((a) => a.classId === cls.id);
  const inProgress = pending.find((a) => a.status === 'inprogress');

  const toneInk = `var(--pbs-${cls.tone}-ink)`;
  const toneBg = `var(--pbs-${cls.tone})`;

  const tabs: Array<[typeof tab, string]> = [
    ['stream', 'Stream'],
    ['work', `Assigned work${pending.length ? ` · ${pending.length}` : ''}`],
    ['people', 'Classmates'],
    ['library', 'Class library'],
  ];

  return (
    <div className="pbs-fade-in" style={{ minHeight: '100vh' }}>

      {/* Full-bleed class banner */}
      <div style={{
        background: toneBg, color: toneInk,
        borderBottom: `1.5px solid ${toneInk}`,
        position: 'relative', overflow: 'hidden',
      }}>
        <div aria-hidden style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.18,
          backgroundImage: `radial-gradient(${toneInk} 1.2px, transparent 1.4px)`,
          backgroundSize: '22px 22px',
          maskImage: 'linear-gradient(180deg, transparent 0%, #000 30%, #000 70%, transparent 100%)',
        }}/>

        <div className="pbs-wrap" style={{ padding: '18px 28px 0', position: 'relative' }}>
          <button onClick={onBack} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 10px 6px 6px', borderRadius: 999,
            background: 'var(--pbs-paper)', color: toneInk,
            border: `1.5px solid ${toneInk}`, boxShadow: `0 2px 0 ${toneInk}`,
            fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            <span style={{ transform: 'rotate(180deg)', display: 'inline-flex' }}>
              <Icon name="arrow-right" size={13} stroke={2.2}/>
            </span>
            All classes
          </button>
        </div>

        <div className="pbs-wrap" style={{
          padding: '22px 28px 32px', position: 'relative',
          display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'end',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
              <div style={{
                width: 78, height: 78, borderRadius: 20,
                background: 'var(--pbs-paper)', border: `1.5px solid ${toneInk}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 44, boxShadow: `0 4px 0 ${toneInk}`,
              }}>{cls.emoji}</div>
              <div>
                <div className="pbs-mono" style={{ fontSize: 11, letterSpacing: '0.14em', opacity: 0.75 }}>
                  {cls.name}
                </div>
                <h1 style={{
                  margin: '4px 0 0', fontSize: 'clamp(36px, 4.8vw, 58px)',
                  fontWeight: 700, letterSpacing: '-0.028em', lineHeight: 1,
                }}>
                  {cls.subject}
                </h1>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <Pill tone="paper" icon="users">{cls.teacher}</Pill>
              <Pill tone="paper" icon="smile">{cls.members} classmates</Pill>
              <Pill tone="paper" icon="bolt">{pending.length} to do</Pill>
              <Pill tone="paper" icon="star">Rank 4 in class</Pill>
            </div>
          </div>

          {pending[0] && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
              <div className="pbs-mono" style={{ fontSize: 10.5, letterSpacing: '0.12em', opacity: 0.7, textTransform: 'uppercase' }}>
                {inProgress ? 'Pick up where you left off' : 'Up next'}
              </div>
              <button onClick={() => onPlay(pending[0])} style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '12px 16px 12px 12px', borderRadius: 14,
                background: 'var(--pbs-ink)', color: 'var(--pbs-cream)',
                border: `1.5px solid ${toneInk}`,
                boxShadow: `0 4px 0 ${toneInk}, 0 14px 30px -12px rgba(0,0,0,0.35)`,
                fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: toneBg, color: toneInk,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name={pending[0].icon as IconName} size={18} stroke={2.2}/>
                </div>
                <span style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>{pending[0].title}</div>
                  <div style={{ fontSize: 11, opacity: 0.75, fontWeight: 500 }}>{pending[0].due}</div>
                </span>
                <Icon name="arrow-right" size={16} stroke={2.4}/>
              </button>
            </div>
          )}
        </div>

        <div className="pbs-wrap" style={{ padding: '0 28px', position: 'relative' }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {tabs.map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)} style={{
                padding: '10px 16px 12px', borderRadius: '12px 12px 0 0',
                background: tab === k ? 'var(--pbs-cream)' : 'transparent',
                color: tab === k ? 'var(--pbs-ink)' : toneInk,
                border: tab === k ? `1.5px solid ${toneInk}` : '1.5px solid transparent',
                borderBottom: tab === k ? '1.5px solid var(--pbs-cream)' : '1.5px solid transparent',
                marginBottom: -1,
                fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              }}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      <main className="pbs-wrap" style={{ padding: '28px 28px 80px' }}>
        {tab === 'stream' && <StreamTab cls={cls} pending={pending} onPlay={onPlay} user={user}/>}
        {tab === 'work' && <WorkTab cls={cls} pending={pending} onPlay={onPlay}/>}
        {tab === 'people' && <PeopleTab cls={cls} user={user}/>}
        {tab === 'library' && (
          <LibraryTabCls
            cls={cls}
            onPlay={(g: ClassLibraryItem) => onPlay({
              title: g.title, icon: g.icon, tone: g.tone, questions: 0, minutes: 0,
            })}
          />
        )}
      </main>
    </div>
  );
};

// ─── Stream tab — kept here so the file still tells the page story end-to-end ───
const StreamTab = ({
  cls, pending, onPlay, user,
}: {
  cls: ClassRecord;
  pending: AssignedGame[];
  onPlay: (g: AnyGame) => void;
  user: StudentUser;
}) => {
  const leaderboard = SAMPLE_LEADERBOARD(user?.name || 'You');
  const myRow = leaderboard.find((l) => l.me);
  const next = pending[0];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 24 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {next && (
          <section>
            <div className="pbs-mono" style={kickerStyCd}>UP NEXT</div>
            <Block tone={next.tone} style={{ marginTop: 8, padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                <div style={{
                  width: 72, height: 72, borderRadius: 16,
                  background: 'var(--pbs-paper)', border: '1.5px solid currentColor',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 3px 0 currentColor', flexShrink: 0,
                }}>
                  <Icon name={next.icon as IconName} size={34} stroke={2.2}/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                    <Pill tone="paper">{next.kind}</Pill>
                    <Pill tone="paper" icon="bolt">{next.questions} Qs · ~{next.minutes} min</Pill>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{next.title}</div>
                  <div style={{ fontSize: 13, marginTop: 4, opacity: 0.75 }}>{next.due}</div>
                </div>
                <Chunky tone="ink" trailing="arrow-right" onClick={() => onPlay(next)}>
                  {next.status === 'inprogress' ? 'Resume' : 'Start'}
                </Chunky>
              </div>
              {next.status === 'inprogress' && (
                <div style={{ marginTop: 16, height: 8, borderRadius: 999, background: 'rgba(29,26,20,0.12)', overflow: 'hidden' }}>
                  <div style={{ width: `${(next.progress || 0) * 100}%`, height: '100%', background: 'var(--pbs-ink)', borderRadius: 999 }}/>
                </div>
              )}
            </Block>
          </section>
        )}

        <section>
          <div className="pbs-mono" style={kickerStyCd}>CLASS STREAM</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            {CLASS_FEED.map((f) => <FeedItem key={f.id} f={f} cls={cls}/>)}
          </div>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 8 }}>
            <div className="pbs-mono" style={kickerStyCd}>YOUR PAST PLAYS</div>
            <a href="#" style={{ fontSize: 12, fontWeight: 600, color: 'var(--pbs-ink-soft)' }}>All history →</a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {CLASS_PAST.slice(0, 4).map((p) => <PastRow key={p.id} p={p}/>)}
          </div>
        </section>
      </div>

      <aside style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Block tone="paper" style={{ padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em' }}>This week&rsquo;s leaderboard</div>
            <Pill tone={cls.tone}>Week 12</Pill>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {leaderboard.slice(0, 8).map((row, i) => (
              <LeaderRow key={i} row={row} rank={i + 1}/>
            ))}
          </div>
          {myRow && (
            <div style={{
              marginTop: 10, padding: 10, borderRadius: 12,
              background: 'var(--pbs-cream-2)', border: '1.5px dashed var(--pbs-line-2)',
              fontSize: 11.5, color: 'var(--pbs-ink-soft)', textAlign: 'center',
            }}>
              You&rsquo;re <strong style={{ color: 'var(--pbs-ink)' }}>#4</strong> — 260 XP behind Priya.
            </div>
          )}
        </Block>

        <Block tone="ink" style={{ padding: 18, color: 'var(--pbs-cream)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: `var(--pbs-${cls.tone})`, color: `var(--pbs-${cls.tone}-ink)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1.5px solid var(--pbs-${cls.tone}-ink)`,
              fontSize: 18, fontWeight: 700,
            }}>{cls.teacher.split(' ')[1]?.[0] || 'T'}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, opacity: 0.6, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Your teacher</div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{cls.teacher}</div>
            </div>
          </div>
          <button style={{
            marginTop: 14, width: '100%', padding: 10, borderRadius: 10,
            background: 'rgba(253,246,230,0.08)', color: 'var(--pbs-cream)',
            border: '1.5px solid rgba(253,246,230,0.2)',
            fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <Icon name="send" size={12} stroke={2.2}/> Ask a question
          </button>
        </Block>

        <Block tone="cream" style={{ padding: 18 }}>
          <div className="pbs-mono" style={{
            fontSize: 10.5, letterSpacing: '0.12em',
            color: 'var(--pbs-ink-muted)', textTransform: 'uppercase', marginBottom: 6,
          }}>Class code</div>
          <div className="pbs-mono" style={{ fontSize: 26, fontWeight: 700, letterSpacing: '0.08em' }}>
            {cls.id.replace('c', 'BLK-').toUpperCase()}{cls.members}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--pbs-ink-soft)', marginTop: 6 }}>
            Invite a friend to join this class.
          </div>
        </Block>
      </aside>
    </div>
  );
};
