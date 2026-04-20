// Class detail sub-tabs and bits — Work, People, Library, Feed/Leader/Past rows.
// Ported from problocks/project/pb_student/class_detail.jsx.
'use client';

import React from 'react';
import { Block, Chunky, Icon, Pill } from '@/components/landing/pb-site/primitives';
import { CardboardHead } from '@/components/teacher/CardboardHead';
import type { AvatarOutfit } from './RobloxAvatar';
import type { AssignedGame, ClassRecord, StudentUser, ToneTone } from './sample-data';

type ClsTone = ToneTone;
type IconName = React.ComponentProps<typeof Icon>['name'];

// Classmate avatar pool — same cardboard outfits used in the teacher roster
// (teacher/sample-data.ts `A`). Mapping a classmate name to one outfit
// deterministically gives the People tab + leaderboard the same look as
// the teacher's StudentsList without needing real per-account avatars yet.
const CLASSMATE_OUTFITS: AvatarOutfit[] = [
  { gender: 'girl', hair: 'long',  hairColor: '#5a3a22', shirt: '#f7c25b', pants: '#5b3a82', face: 'happy' },
  { gender: 'boy',  hair: 'spike', hairColor: '#1a1a1a', shirt: '#e26a4d', pants: '#3a3c4a', face: 'cool'  },
  { gender: 'girl', hair: 'long',  hairColor: '#222222', shirt: '#5fb4e6', pants: '#2c4a6a', face: 'smile' },
  { gender: 'girl', hair: 'short', hairColor: '#2a1a10', shirt: '#6fbf73', pants: '#3a3c4a', face: 'happy' },
  { gender: 'boy',  hair: 'short', hairColor: '#7a5a3a', shirt: '#7a4ea8', pants: '#1f1f24', hat: 'beanie', hatColor: '#2a2a30', face: 'neutral' },
  { gender: 'girl', hair: 'long',  hairColor: '#1a1a1a', shirt: '#e88fb4', pants: '#3a3c4a', face: 'smile' },
  { gender: 'boy',  hair: 'short', hairColor: '#3a2a1a', shirt: '#c4a05a', pants: '#3a3c4a', hat: 'cap',    hatColor: '#5b8b4a', face: 'cool'  },
  { gender: 'girl', hair: 'long',  hairColor: '#0e0e10', shirt: '#e8657a', pants: '#1a1a20', face: 'wink'  },
  { gender: 'boy',  hair: 'short', hairColor: '#3a2a1a', shirt: '#5fa0d4', pants: '#2c4a6a', face: 'neutral' },
  { gender: 'girl', hair: 'short', hairColor: '#3a1a08', shirt: '#6fbf73', pants: '#3a3c4a', face: 'smile' },
  { gender: 'boy',  hair: 'short', hairColor: '#2a1a10', shirt: '#7a4ea8', pants: '#3a3c4a', face: 'happy' },
  { gender: 'girl', hair: 'long',  hairColor: '#c8649a', shirt: '#e88fb4', pants: '#3a3c4a', face: 'wink'  },
];

export const outfitForName = (name: string): AvatarOutfit => {
  const sum = Array.from(name).reduce((s, c) => s + c.charCodeAt(0), 0);
  return CLASSMATE_OUTFITS[sum % CLASSMATE_OUTFITS.length];
};

// ─── Library items — class-curated free-play games ───
export type ClassLibraryItem = {
  id: string;
  title: string;
  kind: string;
  icon: IconName;
  tone: ClsTone;
  plays: string;
};

export const CLASS_LIBRARY: ClassLibraryItem[] = [
  { id: 'cl1', title: 'Slope Sprint', kind: 'Practice', icon: 'bolt', tone: 'butter', plays: '3 plays' },
  { id: 'cl2', title: 'Fractions Bakery', kind: 'Past quiz', icon: 'music', tone: 'pink', plays: '1 play · 94%' },
  { id: 'cl3', title: 'Graph Racer', kind: 'Practice', icon: 'compass', tone: 'sky', plays: 'New' },
  { id: 'cl4', title: 'Word Problem Dojo', kind: 'Practice', icon: 'spark', tone: 'mint', plays: '5 plays' },
];

export type PastResult = {
  id: string; title: string; score: number; rank: string; when: string; tone: ClsTone; icon: IconName;
};

export const CLASS_PAST: PastResult[] = [
  { id: 'p1', title: 'Fractions Bakery',  score: 94,  rank: '2nd / 28',  when: 'Apr 18', tone: 'pink',   icon: 'music' },
  { id: 'p2', title: 'Integer Invaders',  score: 72,  rank: '14th / 28', when: 'Apr 15', tone: 'grape',  icon: 'cube'  },
  { id: 'p3', title: 'Slope Sprint',      score: 88,  rank: '5th / 28',  when: 'Apr 11', tone: 'butter', icon: 'bolt'  },
  { id: 'p4', title: 'Order of Ops Arena', score: 100, rank: '1st / 28',  when: 'Apr 8',  tone: 'mint',   icon: 'star'  },
];

const CLASSMATE_NAMES = [
  'Maya P.','Jordan K.','Ben T.','Priya S.','Leo R.','Sofia M.','Noah W.','Ivy C.',
  'Kai H.','Emma L.','Owen B.','Aria D.','Zoe F.','Mateo G.','Riley V.','Chloe N.',
  'Eli J.','Nora A.','Finn O.','Ruby Q.',
];

export const CLASS_FEED: Array<
  | { id: string; kind: 'announce'; from: string; text: string; when: string; pinned?: boolean }
  | { id: string; kind: 'assigned'; title: string; when: string }
  | { id: string; kind: 'top'; student: string; title: string; score: number; when: string }
> = [
  { id: 'f1', kind: 'announce', from: 'Ms. Rivera',
    text: "Great hustle today everyone! Linear Equations Relay is live — it's due tonight.",
    when: '2h ago', pinned: true },
  { id: 'f2', kind: 'assigned', title: 'Linear Equations Relay', when: 'Today · 9:02 AM' },
  { id: 'f3', kind: 'top', student: 'Maya P.', title: 'Fractions Bakery', score: 98, when: 'Yesterday' },
  { id: 'f4', kind: 'announce', from: 'Ms. Rivera',
    text: 'Quiz Friday on slopes & intercepts — review the Slope Sprint game this week.',
    when: '2 days ago' },
  { id: 'f5', kind: 'assigned', title: 'Slope Sprint', when: '2 days ago' },
];

export const SAMPLE_LEADERBOARD = (me: string, meOutfit?: AvatarOutfit) => {
  const rows: Array<{ name: string; xp: number; tone: ClsTone; streak: number; me?: boolean; avatar: AvatarOutfit }> = [
    { name: 'Maya P.',   xp: 3120, tone: 'pink',   streak: 12, avatar: outfitForName('Maya P.')   },
    { name: 'Jordan K.', xp: 2980, tone: 'sky',    streak: 9,  avatar: outfitForName('Jordan K.') },
    { name: 'Priya S.',  xp: 2740, tone: 'mint',   streak: 14, avatar: outfitForName('Priya S.')  },
    { name: me,          xp: 2480, tone: 'butter', streak: 7,  me: true, avatar: meOutfit ?? outfitForName(me) },
    { name: 'Leo R.',    xp: 2210, tone: 'coral',  streak: 4,  avatar: outfitForName('Leo R.')    },
    { name: 'Sofia M.',  xp: 2090, tone: 'grape',  streak: 6,  avatar: outfitForName('Sofia M.')  },
    { name: 'Noah W.',   xp: 1980, tone: 'sky',    streak: 3,  avatar: outfitForName('Noah W.')   },
    { name: 'Ivy C.',    xp: 1820, tone: 'pink',   streak: 5,  avatar: outfitForName('Ivy C.')    },
  ];
  return rows;
};

export const kickerStyCd: React.CSSProperties = {
  fontSize: 11, color: 'var(--pbs-ink-muted)',
  textTransform: 'uppercase', letterSpacing: '0.12em',
  fontFamily: "'DM Mono', monospace",
};

// ─── Work tab ───
export const WorkTab = ({
  pending, onPlay,
}: {
  cls: ClassRecord;
  pending: AssignedGame[];
  onPlay: (a: AssignedGame) => void;
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
    <div>
      <div className="pbs-mono" style={kickerStyCd}>PENDING · {pending.length}</div>
      <h2 style={{ margin: '6px 0 14px', fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>Get these done this week.</h2>
      {pending.length === 0 ? (
        <Block tone="paper" style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 6 }}>🎉</div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>You&rsquo;re all caught up.</div>
          <div style={{ fontSize: 12, color: 'var(--pbs-ink-muted)' }}>Nothing due right now.</div>
        </Block>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {pending.map((a) => (
            <Block key={a.id} tone={a.tone} style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, background: 'var(--pbs-paper)',
                  border: '1.5px solid currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name={a.icon as IconName} size={22} stroke={2.2}/>
                </div>
                <Pill tone="paper">{a.kind}</Pill>
              </div>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.2 }}>{a.title}</div>
                <div style={{ fontSize: 12, opacity: 0.8, marginTop: 3 }}>{a.questions} Qs · ~{a.minutes} min · {a.due}</div>
              </div>
              {a.status === 'inprogress' && (
                <div style={{ height: 6, borderRadius: 999, background: 'rgba(29,26,20,0.15)', overflow: 'hidden' }}>
                  <div style={{ width: `${(a.progress || 0) * 100}%`, height: '100%', background: 'currentColor', borderRadius: 999, opacity: 0.85 }}/>
                </div>
              )}
              <button onClick={() => onPlay(a)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '10px 14px', borderRadius: 12,
                background: 'var(--pbs-ink)', color: 'var(--pbs-cream)',
                fontSize: 13, fontWeight: 700, border: 0, cursor: 'pointer', fontFamily: 'inherit',
              }}>
                <Icon name="play" size={12}/> {a.status === 'inprogress' ? 'Resume' : 'Play'}
              </button>
            </Block>
          ))}
        </div>
      )}
    </div>

    <div>
      <div className="pbs-mono" style={kickerStyCd}>COMPLETED · {CLASS_PAST.length}</div>
      <h2 style={{ margin: '6px 0 14px', fontSize: 20, fontWeight: 700, letterSpacing: '-0.015em' }}>Past results</h2>
      <Block tone="paper" style={{ padding: 0, overflow: 'hidden' }}>
        {CLASS_PAST.map((p, i) => (
          <div key={p.id} style={{
            display: 'grid', gridTemplateColumns: '44px 1fr auto auto auto', alignItems: 'center', gap: 14,
            padding: '14px 18px', borderTop: i === 0 ? 'none' : '1px solid var(--pbs-line)',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: `var(--pbs-${p.tone})`, color: `var(--pbs-${p.tone}-ink)`,
              border: `1.5px solid var(--pbs-${p.tone}-ink)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><Icon name={p.icon} size={18} stroke={2.2}/></div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.005em' }}>{p.title}</div>
              <div style={{ fontSize: 11.5, color: 'var(--pbs-ink-muted)' }}>{p.when}</div>
            </div>
            <div className="pbs-mono" style={{ fontSize: 13, fontWeight: 700, minWidth: 52, textAlign: 'right' }}>{p.score}%</div>
            <div style={{ fontSize: 11.5, color: 'var(--pbs-ink-soft)', minWidth: 80, textAlign: 'right' }}>{p.rank}</div>
            <button style={{
              fontSize: 11.5, fontWeight: 700, color: 'var(--pbs-ink-soft)',
              padding: '6px 10px', borderRadius: 8, border: '1.5px solid var(--pbs-line-2)',
              background: 'var(--pbs-cream-2)', cursor: 'pointer', fontFamily: 'inherit',
            }}>Review</button>
          </div>
        ))}
      </Block>
    </div>
  </div>
);

// ─── People tab ───
export const PeopleTab = ({ cls }: { cls: ClassRecord; user: StudentUser }) => {
  const names = [...CLASSMATE_NAMES].slice(0, cls.members);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div className="pbs-mono" style={kickerStyCd}>CLASSMATES · {cls.members}</div>
          <h2 style={{ margin: '6px 0 0', fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>The crew.</h2>
        </div>
        <Pill tone={cls.tone} icon="users">{cls.teacher} · teacher</Pill>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
        {names.map((n, i) => {
          const xp = 3200 - i * 90 - (i % 3) * 40;
          return (
            <Block key={n} tone="paper" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
              <CardboardHead outfit={outfitForName(n)} px={40}/>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n}</div>
                <div className="pbs-mono" style={{ fontSize: 11, color: 'var(--pbs-ink-muted)' }}>{xp.toLocaleString()} XP</div>
              </div>
            </Block>
          );
        })}
      </div>
    </div>
  );
};

// ─── Library tab ───
export const LibraryTabCls = ({
  cls, onPlay,
}: {
  cls: ClassRecord;
  onPlay: (g: ClassLibraryItem) => void;
}) => (
  <div>
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14 }}>
      <div>
        <div className="pbs-mono" style={kickerStyCd}>CLASS LIBRARY</div>
        <h2 style={{ margin: '6px 0 0', fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>
          Free-play — picked by {cls.teacher.split(' ').pop()}.
        </h2>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--pbs-ink-soft)', maxWidth: 520 }}>
          Warm-ups and review games. Play anytime; no score sent to your teacher.
        </p>
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
      {CLASS_LIBRARY.map((g) => (
        <Block key={g.id} tone={g.tone} style={{ padding: 18, cursor: 'pointer' }} onClick={() => onPlay(g)}>
          <div style={{
            aspectRatio: '4/3', borderRadius: 12, background: 'var(--pbs-paper)',
            border: '1.5px solid currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
          }}>
            <Icon name={g.icon} size={52} stroke={1.6}/>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>{g.title}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11.5 }}>
            <span style={{ opacity: 0.8 }}>{g.kind}</span>
            <span className="pbs-mono" style={{ opacity: 0.8 }}>{g.plays}</span>
          </div>
        </Block>
      ))}
    </div>
  </div>
);

// ─── Bits ───
export const FeedItem = ({
  f, cls,
}: {
  f: typeof CLASS_FEED[number];
  cls: ClassRecord;
}) => {
  if (f.kind === 'announce') {
    return (
      <Block tone={f.pinned ? cls.tone : 'paper'} style={{ padding: 16, display: 'flex', gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: 'var(--pbs-paper)', border: '1.5px solid currentColor',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700,
        }}>{f.from.split(' ').pop()![0]}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>{f.from}</span>
            {f.pinned && <Pill tone="paper" icon="star">Pinned</Pill>}
            <span style={{ fontSize: 11, color: 'var(--pbs-ink-muted)', marginLeft: 'auto' }}>{f.when}</span>
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.5 }}>{f.text}</div>
        </div>
      </Block>
    );
  }
  if (f.kind === 'assigned') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 14px', borderRadius: 12,
        background: 'var(--pbs-paper)', border: '1.5px dashed var(--pbs-line-2)',
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: `var(--pbs-${cls.tone})`, color: `var(--pbs-${cls.tone}-ink)`,
          border: `1.5px solid var(--pbs-${cls.tone}-ink)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="bolt" size={14} stroke={2.2}/>
        </div>
        <div style={{ flex: 1, fontSize: 13 }}>
          New assignment: <strong>{f.title}</strong>
        </div>
        <span style={{ fontSize: 11, color: 'var(--pbs-ink-muted)' }}>{f.when}</span>
      </div>
    );
  }
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 14px', borderRadius: 12,
      background: 'var(--pbs-cream-2)', border: '1.5px solid var(--pbs-line)',
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8,
        background: 'var(--pbs-butter)', color: 'var(--pbs-butter-ink)',
        border: '1.5px solid var(--pbs-butter-ink)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name="star" size={14} stroke={2.2}/>
      </div>
      <div style={{ flex: 1, fontSize: 13 }}>
        <strong>{f.student}</strong> topped <strong>{f.title}</strong> — {f.score}%
      </div>
      <span style={{ fontSize: 11, color: 'var(--pbs-ink-muted)' }}>{f.when}</span>
    </div>
  );
};

export const LeaderRow = ({
  row, rank,
}: {
  row: { name: string; xp: number; tone: ClsTone; me?: boolean; avatar: AvatarOutfit };
  rank: number;
}) => {
  const rankBg = rank === 1 ? 'var(--pbs-butter)' : rank === 2 ? 'var(--pbs-cream-2)' : rank === 3 ? 'var(--pbs-coral)' : 'transparent';
  const rankFg = rank === 1 ? 'var(--pbs-butter-ink)' : rank === 2 ? 'var(--pbs-ink-soft)' : rank === 3 ? 'var(--pbs-coral-ink)' : 'var(--pbs-ink-muted)';
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '24px 32px 1fr auto', alignItems: 'center', gap: 10,
      padding: '7px 8px', borderRadius: 10,
      background: row.me ? 'var(--pbs-cream-2)' : 'transparent',
      border: row.me ? '1.5px solid var(--pbs-line-2)' : '1.5px solid transparent',
    }}>
      <div className="pbs-mono" style={{
        width: 22, height: 22, borderRadius: 6,
        background: rankBg, color: rankFg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 700,
      }}>{rank}</div>
      <CardboardHead outfit={row.avatar} px={28}/>
      <div style={{ fontSize: 12.5, fontWeight: row.me ? 700 : 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {row.me ? `${row.name}  (you)` : row.name}
      </div>
      <div className="pbs-mono" style={{ fontSize: 11.5, fontWeight: 700 }}>{row.xp.toLocaleString()}</div>
    </div>
  );
};

export const PastRow = ({ p }: { p: PastResult }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 12px', borderRadius: 12,
    background: 'var(--pbs-paper)', border: '1.5px solid var(--pbs-line)',
  }}>
    <div style={{
      width: 32, height: 32, borderRadius: 9,
      background: `var(--pbs-${p.tone})`, color: `var(--pbs-${p.tone}-ink)`,
      border: `1.5px solid var(--pbs-${p.tone}-ink)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon name={p.icon} size={16} stroke={2.2}/>
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
      <div style={{ fontSize: 10.5, color: 'var(--pbs-ink-muted)' }}>{p.when} · {p.rank}</div>
    </div>
    <div className="pbs-mono" style={{ fontSize: 13, fontWeight: 700 }}>{p.score}%</div>
  </div>
);

// Re-export Chunky here so the main file can keep its imports tight.
export { Chunky };
