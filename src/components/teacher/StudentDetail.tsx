// Per-student detail page from the teacher's view. Hero, sparkline trend,
// topic mastery, completion donut, activity timeline, questions & struggles,
// suggested next assignment.
// Ported from problocks/project/pb_teacher/student_detail.jsx.
'use client';

import React from 'react';
import { Block, Chunky, Icon, Pill } from '@/components/landing/pb-site/primitives';
import { Donut, Sparkline, TopicBars } from './charts';
import { backBtn, MiniKpi } from './shared';
import {
  activityFor, scoreTrendFor,
  type ActivityEvent, type Student, type Topic,
} from './sample-data';

type IconName = React.ComponentProps<typeof Icon>['name'];

const timelinePalette: Record<string, { tone: 'butter' | 'pink' | 'sky' | 'coral' | 'paper'; icon: IconName; label: string }> = {
  played:   { tone: 'butter', icon: 'gamepad', label: 'Played' },
  asked:    { tone: 'pink',   icon: 'sparkle', label: 'Asked' },
  review:   { tone: 'sky',    icon: 'book',    label: 'Reviewed' },
  struggle: { tone: 'coral',  icon: 'heart',   label: 'Struggle' },
};

const TimelineRow = ({ e }: { e: ActivityEvent }) => {
  const p = timelinePalette[e.kind] || { tone: 'paper', icon: 'sparkle', label: 'Event' } as const;
  return (
    <div style={{ display: 'flex', gap: 12, padding: 10, borderRadius: 10, background: 'var(--pbs-cream)', border: '1.5px solid var(--pbs-line-2)' }}>
      <div className="pbs-mono" style={{ width: 60, fontSize: 11, color: 'var(--pbs-ink-muted)', paddingTop: 4 }}>{e.date}</div>
      <div style={{
        width: 34, height: 34, borderRadius: 9,
        background: `var(--pbs-${p.tone})`,
        color: `var(--pbs-${p.tone}-ink)`,
        border: `1.5px solid var(--pbs-${p.tone}-ink)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon name={p.icon} size={15} stroke={2.2}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 10.5,
          color: `var(--pbs-${p.tone}-ink)`,
          fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
        }}>{p.label}</div>
        <div style={{ fontSize: 13, fontWeight: 600, marginTop: 1, lineHeight: 1.3 }}>{e.title}</div>
        <div style={{ fontSize: 11, color: 'var(--pbs-ink-muted)', marginTop: 2 }}>
          {e.topic}
          {e.score != null && ` · score ${e.score}`}
          {e.rank && ` · ${e.rank}`}
          {e.minutes != null && ` · ${e.minutes} min`}
        </div>
      </div>
    </div>
  );
};

export const StudentDetail = ({
  s, onBack,
}: {
  s: Student;
  onBack: () => void;
}) => {
  const activity = activityFor(s);
  const trend = scoreTrendFor(s);
  const played    = activity.filter((a) => a.kind === 'played');
  const asked     = activity.filter((a) => a.kind === 'asked');
  const reviewed  = activity.filter((a) => a.kind === 'review');
  const struggles = activity.filter((a) => a.kind === 'struggle');
  const topics: Topic[] = [
    { id: 'alg',  name: 'Algebra',     mastery: s.mastery.alg,  color: 'butter' },
    { id: 'geo',  name: 'Geometry',    mastery: s.mastery.geo,  color: 'mint'   },
    { id: 'num',  name: 'Numbers',     mastery: s.mastery.num,  color: 'sky'    },
    { id: 'prob', name: 'Probability', mastery: s.mastery.prob, color: 'grape'  },
  ];
  const weakest   = [...topics].sort((a, b) => a.mastery - b.mastery)[0];
  const strongest = [...topics].sort((a, b) => b.mastery - a.mastery)[0];

  return (
    <div className="pbs-fade-in">
      <button type="button" onClick={onBack} style={backBtn}>← Back to class</button>

      {/* Header */}
      <div className="pb-teacher-split" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 18, marginTop: 14 }}>
        <Block tone={s.tone} style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{
              fontSize: 52, lineHeight: 1,
              width: 80, height: 80, borderRadius: 20,
              background: 'var(--pbs-paper)', border: '1.5px solid currentColor',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 3px 0 currentColor',
            }}>{s.emoji}</div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                <Pill tone="paper" icon="users">Period 3</Pill>
                {s.risk !== 'none' && <Pill tone="paper" icon="heart">{s.risk} risk</Pill>}
                <Pill tone="paper">{s.streak}d streak</Pill>
              </div>
              <h2 style={{ margin: 0, fontSize: 34, fontWeight: 700, letterSpacing: '-0.025em' }}>{s.name}</h2>
              <div style={{ fontSize: 13, opacity: 0.8, marginTop: 2 }}>Last active {s.lastActive} · {s.submitted} assignments submitted</div>
            </div>
            <Chunky tone="ink" icon="send">Message</Chunky>
          </div>

          <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            <MiniKpi l="Grade" v={s.grade}/>
            <MiniKpi l="Average" v={`${s.avg}%`}/>
            <MiniKpi l="Best topic" v={strongest.name}/>
            <MiniKpi l="Needs work" v={weakest.name}/>
          </div>
        </Block>

        <Block tone="paper" style={{ padding: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Score trend</div>
          <div style={{ fontSize: 11.5, color: 'var(--pbs-ink-muted)', marginBottom: 8 }}>Last 8 assignments</div>
          <Sparkline data={trend} height={80}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginTop: 6, color: 'var(--pbs-ink-muted)' }}>
            <span className="pbs-mono">{Math.min(...trend).toFixed(0)}</span>
            <span className="pbs-mono">{Math.max(...trend).toFixed(0)}</span>
          </div>
        </Block>
      </div>

      {/* Topic mastery + Completion donut */}
      <div className="pb-teacher-split" style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 18, marginTop: 18 }}>
        <Block tone="paper" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Topic mastery</div>
          <TopicBars topics={topics}/>
        </Block>

        <Block tone="paper" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 18 }}>
          <Donut
            value={s.avg / 100} size={120} stroke={14}
            color={s.avg >= 85 ? 'var(--pbs-mint-ink)' : s.avg >= 70 ? 'var(--pbs-butter-ink)' : 'var(--pbs-coral-ink)'}
            label="class avg"
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Completion</div>
            <div style={{ fontSize: 11.5, color: 'var(--pbs-ink-muted)', marginTop: 2, marginBottom: 10 }}>of assigned work</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Played</span><span className="pbs-mono"><b>{played.length}</b></span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Questions asked</span><span className="pbs-mono"><b>{asked.length}</b></span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Topics reviewed</span><span className="pbs-mono"><b>{reviewed.length}</b></span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Struggle points</span><span className="pbs-mono"><b>{struggles.length}</b></span></div>
            </div>
          </div>
        </Block>
      </div>

      {/* Timeline + Side cards */}
      <div className="pb-teacher-split" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 18, marginTop: 18 }}>
        <Block tone="paper" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Activity timeline</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {activity.map((e, i) => <TimelineRow key={i} e={e}/>)}
          </div>
        </Block>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Block tone="pink" style={{ padding: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Questions they&apos;ve asked</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {asked.length ? asked.map((q, i) => (
                <div key={i} style={{ padding: 10, borderRadius: 10, background: 'var(--pbs-paper)', border: '1.5px solid var(--pbs-pink-ink)' }}>
                  <div style={{ fontSize: 12.5, lineHeight: 1.4 }}>&quot;{q.title}&quot;</div>
                  <div style={{ fontSize: 10.5, color: 'var(--pbs-pink-ink)', opacity: 0.8, marginTop: 4 }}>{q.topic} · {q.date}</div>
                </div>
              )) : <div style={{ fontSize: 12, color: 'var(--pbs-pink-ink)', opacity: 0.8 }}>Hasn&apos;t asked anything yet.</div>}
            </div>
          </Block>

          <Block tone="coral" style={{ padding: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Where they struggled</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {struggles.length ? struggles.map((q, i) => (
                <div key={i} style={{ padding: 10, borderRadius: 10, background: 'var(--pbs-paper)', border: '1.5px solid var(--pbs-coral-ink)' }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600 }}>{q.title}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--pbs-coral-ink)', opacity: 0.8, marginTop: 4 }}>{q.topic} · {q.date}</div>
                </div>
              )) : (
                <div style={{ fontSize: 12, color: 'var(--pbs-coral-ink)', opacity: 0.8 }}>
                  No struggle points detected. {s.name.split(' ')[0]} is cruising.
                </div>
              )}
            </div>
          </Block>

          <Block tone="mint" style={{ padding: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Suggested next</div>
            <div style={{ fontSize: 12.5, lineHeight: 1.45 }}>
              Assign <b>&quot;{weakest.name} Refresher&quot;</b> — 8 Qs, ~10 min. Targets the gap in {weakest.name.toLowerCase()}.
            </div>
            <Chunky tone="ink" trailing="arrow-right" style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}>Assign refresher</Chunky>
          </Block>
        </div>
      </div>
    </div>
  );
};
