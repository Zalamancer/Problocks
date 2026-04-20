// The student's OWN progress view (teacher can toggle "as student").
// Grade hero, completed quizzes, topic mastery, badges, questions/struggles/reviews.
// Ported from problocks/project/pb_teacher/student_self.jsx.
'use client';

import React from 'react';
import { Block, Icon, Pill } from '@/components/landing/pb-site/primitives';
import { Donut, TopicBars } from './charts';
import { backBtn } from './shared';
import { StudentAvatar } from './StudentAvatar';
import {
  activityFor,
  type Student, type Topic,
} from './sample-data';

type IconName = React.ComponentProps<typeof Icon>['name'];

const gradeTone = (s: number) =>
  s >= 90 ? { bg: 'var(--pbs-mint)',   fg: 'var(--pbs-mint-ink)'   }
: s >= 80 ? { bg: 'var(--pbs-butter)', fg: 'var(--pbs-butter-ink)' }
: s >= 70 ? { bg: 'var(--pbs-sky)',    fg: 'var(--pbs-sky-ink)'    }
:           { bg: 'var(--pbs-coral)',  fg: 'var(--pbs-coral-ink)'  };

const gradeLetter = (s: number) =>
  s >= 93 ? 'A'
: s >= 90 ? 'A-'
: s >= 87 ? 'B+'
: s >= 83 ? 'B'
: s >= 80 ? 'B-'
: s >= 77 ? 'C+'
: s >= 70 ? 'C'
: s >= 60 ? 'D'
: 'F';

const quizRow: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 12,
  padding: 12, borderRadius: 12,
  background: 'var(--pbs-cream)', border: '1.5px solid var(--pbs-line-2)',
};

const SelfKpi = ({ icon, l, v }: { icon: IconName; l: string; v: React.ReactNode }) => (
  <div style={{ padding: 12, borderRadius: 12, background: 'var(--pbs-paper)', border: '1.5px solid currentColor' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, opacity: 0.8 }}>
      <Icon name={icon} size={13} stroke={2.2}/> {l}
    </div>
    <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4, lineHeight: 1 }}>{v}</div>
  </div>
);

export const StudentSelf = ({ s, onBack }: { s: Student; onBack: () => void }) => {
  // Render whichever student the teacher chose to "view as", instead of
  // hard-coding STUDENTS[0]. Local alias `me` so the rest of the body
  // (ported from the original "I'm a student" view) reads naturally.
  const me = s;
  const activity = activityFor(me);
  const played    = activity.filter((a) => a.kind === 'played');
  const asked     = activity.filter((a) => a.kind === 'asked');
  const reviewed  = activity.filter((a) => a.kind === 'review');
  const struggles = activity.filter((a) => a.kind === 'struggle');

  const topics: Topic[] = [
    { id: 'alg',  name: 'Algebra',     mastery: me.mastery.alg,  color: 'butter' },
    { id: 'geo',  name: 'Geometry',    mastery: me.mastery.geo,  color: 'mint'   },
    { id: 'num',  name: 'Numbers',     mastery: me.mastery.num,  color: 'sky'    },
    { id: 'prob', name: 'Probability', mastery: me.mastery.prob, color: 'grape'  },
  ];
  const weakest = [...topics].sort((a, b) => a.mastery - b.mastery)[0];

  const badges: { id: string; tone: 'butter' | 'mint' | 'coral' | 'sky'; icon: IconName; name: string; sub: string }[] = [
    { id: 'b1', tone: 'butter', icon: 'bolt',    name: 'Speed demon',       sub: '10 correct in 60s' },
    { id: 'b2', tone: 'mint',   icon: 'check',   name: 'Perfect run',       sub: '100% on 3 quizzes' },
    { id: 'b3', tone: 'coral',  icon: 'heart',   name: 'Helped 5 friends',  sub: 'Kindness streak' },
    { id: 'b4', tone: 'sky',    icon: 'compass', name: 'Explorer',          sub: '6 new topics' },
  ];

  return (
    <div className="pbs-fade-in">
      <button type="button" onClick={onBack} style={backBtn}>← Back to {me.name.split(' ')[0]}&apos;s detail</button>

      {/* Hero progress */}
      <Block tone="butter" style={{ padding: 24, marginTop: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <StudentAvatar s={me} px={104}/>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div className="pbs-mono" style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.75 }}>YOUR PROGRESS</div>
            <h1 style={{ margin: '4px 0 2px', fontSize: 40, fontWeight: 700, letterSpacing: '-0.025em' }}>
              You&apos;re doing <span className="pbs-serif">great</span>, {me.name.split(' ')[0]}.
            </h1>
            <div style={{ fontSize: 13.5, opacity: 0.8 }}>Grade {me.grade} · {me.avg}% average · {me.streak} day streak</div>
          </div>
          <Donut value={me.avg / 100} size={110} stroke={12} color="var(--pbs-butter-ink)" track="var(--pbs-cream-2)" label="overall"/>
        </div>

        <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          <SelfKpi icon="gamepad" l="Quizzes played"  v={played.length}/>
          <SelfKpi icon="sparkle" l="Questions asked" v={asked.length}/>
          <SelfKpi icon="book"    l="Topics reviewed" v={reviewed.length}/>
          <SelfKpi icon="star"    l="Best rank"       v="1st"/>
        </div>
      </Block>

      {/* Completed quizzes */}
      <Block tone="paper" style={{ padding: 20, marginTop: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>Quizzes you completed</div>
          <Pill tone="mint">{played.length} done</Pill>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {played.map((p, i) => {
            const score = p.score ?? 0;
            const c = gradeTone(score);
            return (
              <div key={i} style={quizRow}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: c.bg, color: c.fg,
                  border: `1.5px solid ${c.fg}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon name="gamepad" size={18} stroke={2.2}/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{p.title}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--pbs-ink-muted)', marginTop: 2 }}>{p.topic} · {p.date}{p.rank ? ` · ${p.rank}` : ''}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="pbs-mono" style={{ fontSize: 22, fontWeight: 700, color: c.fg, lineHeight: 1 }}>{score}%</div>
                  <div style={{ fontSize: 10.5, color: 'var(--pbs-ink-muted)', marginTop: 2 }}>grade {gradeLetter(score)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Block>

      {/* Mastery + Badges */}
      <div className="pb-teacher-split" style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 18, marginTop: 18 }}>
        <Block tone="paper" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>What you&apos;ve mastered</div>
          <TopicBars topics={topics}/>
          <div style={{ marginTop: 16, padding: 12, borderRadius: 12, background: 'var(--pbs-cream-2)', border: '1.5px dashed var(--pbs-line-2)' }}>
            <div style={{ fontSize: 11, color: 'var(--pbs-ink-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Suggested next</div>
            <div style={{ fontSize: 13.5, marginTop: 3 }}>Brush up on <b>{weakest.name}</b> — you&apos;re at {Math.round(weakest.mastery * 100)}%. Try a 10-min refresher.</div>
          </div>
        </Block>

        <Block tone="paper" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Badges</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {badges.map((b) => (
              <div key={b.id} style={{
                padding: 14, borderRadius: 14,
                background: `var(--pbs-${b.tone})`,
                color: `var(--pbs-${b.tone}-ink)`,
                border: `1.5px solid var(--pbs-${b.tone}-ink)`,
                boxShadow: `0 2px 0 var(--pbs-${b.tone}-ink)`,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'var(--pbs-paper)', border: '1.5px solid currentColor',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8,
                }}>
                  <Icon name={b.icon} size={18} stroke={2.2}/>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{b.name}</div>
                <div style={{ fontSize: 10.5, opacity: 0.8, marginTop: 2 }}>{b.sub}</div>
              </div>
            ))}
          </div>
        </Block>
      </div>

      {/* Q / struggles / review */}
      <div className="pb-teacher-tri" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginTop: 18 }}>
        <Block tone="pink" style={{ padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Icon name="sparkle" size={15} stroke={2.2}/>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Questions you asked</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {asked.length ? asked.map((q, i) => (
              <div key={i} style={{ padding: 10, borderRadius: 10, background: 'var(--pbs-paper)', border: '1.5px solid var(--pbs-pink-ink)' }}>
                <div style={{ fontSize: 12.5, lineHeight: 1.4 }}>&quot;{q.title}&quot;</div>
                <div style={{ fontSize: 10.5, color: 'var(--pbs-pink-ink)', opacity: 0.8, marginTop: 4 }}>{q.topic} · {q.date}</div>
              </div>
            )) : <div style={{ fontSize: 12 }}>You haven&apos;t asked anything yet. The tutor is here when you need it.</div>}
          </div>
        </Block>

        <Block tone="coral" style={{ padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Icon name="heart" size={15} stroke={2.2}/>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Where you got stuck</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {struggles.length ? struggles.map((q, i) => (
              <div key={i} style={{ padding: 10, borderRadius: 10, background: 'var(--pbs-paper)', border: '1.5px solid var(--pbs-coral-ink)' }}>
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>{q.title}</div>
                <div style={{ fontSize: 10.5, color: 'var(--pbs-coral-ink)', opacity: 0.8, marginTop: 4 }}>{q.topic} · {q.date}</div>
              </div>
            )) : (
              <div style={{ fontSize: 12 }}>No stuck points tracked this week. Keep going.</div>
            )}
          </div>
        </Block>

        <Block tone="sky" style={{ padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Icon name="book" size={15} stroke={2.2}/>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Topics you reviewed</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {reviewed.length ? reviewed.map((q, i) => (
              <div key={i} style={{ padding: 10, borderRadius: 10, background: 'var(--pbs-paper)', border: '1.5px solid var(--pbs-sky-ink)' }}>
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>{q.title}</div>
                <div style={{ fontSize: 10.5, color: 'var(--pbs-sky-ink)', opacity: 0.8, marginTop: 4 }}>{q.topic} · {q.minutes} min · {q.date}</div>
              </div>
            )) : <div style={{ fontSize: 12 }}>Reviewed content will appear here.</div>}
          </div>
        </Block>
      </div>
    </div>
  );
};
