// Teacher Overview tab — class KPIs, live strip, engagement, topic mastery,
// student × topic heatmap, trickiest questions, live question feed, needs-nudge card.
// Ported from problocks/project/pb_teacher/overview.jsx.
'use client';

import React from 'react';
import { Block, Icon, Pill } from '@/components/landing/pb-site/primitives';
import { CardboardHead } from './CardboardHead';
import { BarRow, MasteryHeatmap, TopicBars } from './charts';
import { Kpi, kickerSty, LegendDot } from './shared';
import {
  ASSIGNMENTS,
  ENGAGEMENT_14D,
  RECENT_QUESTIONS,
  STUDENTS,
  TOPICS,
  TRICKY_QUESTIONS,
  type Assignment,
  type ClassRecord,
  type Student,
} from './sample-data';

const reteachBtn: React.CSSProperties = {
  padding: '6px 12px', borderRadius: 999,
  background: 'var(--pbs-ink)', color: 'var(--pbs-cream)',
  fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
  border: 0, cursor: 'pointer', fontFamily: 'inherit',
};

const riskCard: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 10,
  padding: 10, borderRadius: 12,
  background: 'var(--pbs-paper)', border: '1.5px solid var(--pbs-coral-ink)',
  color: 'var(--pbs-coral-ink)',
  cursor: 'pointer', textAlign: 'left',
  fontFamily: 'inherit', width: '100%',
};

export const Overview = ({
  cls, onStudent, onAssignment,
}: {
  cls: ClassRecord;
  onStudent: (s: Student) => void;
  onAssignment: (a: Assignment) => void;
}) => {
  const at = cls.avg;
  const highRisk = STUDENTS.filter((s) => s.risk === 'high' || s.risk === 'medium');
  const live = ASSIGNMENTS[0];

  return (
    <div className="pbs-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      {/* Headline + KPIs */}
      <div className="pb-teacher-hero" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 18 }}>
        <div>
          <div className="pbs-mono" style={kickerSty}>OVERVIEW · THIS WEEK</div>
          <h1 style={{
            margin: '6px 0 8px',
            fontSize: 'clamp(32px, 3.6vw, 46px)',
            fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.04,
          }}>
            Your class is <span className="pbs-serif">doing well.</span>
          </h1>
          <p style={{ margin: 0, fontSize: 14.5, color: 'var(--pbs-ink-soft)', maxWidth: 520 }}>
            {cls.members} students, {ASSIGNMENTS.length} assignments this week. Probability is the softest spot — 3 students need a nudge.
          </p>

          <Block tone="ink" style={{ marginTop: 16, padding: 16, display: 'flex', alignItems: 'center', gap: 14, color: 'var(--pbs-cream)' }}>
            <div style={{ width: 10, height: 10, borderRadius: 999, background: '#55e08e', boxShadow: '0 0 0 4px rgba(85,224,142,0.25)' }}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700 }}>Live now · {live.title}</div>
              <div style={{ fontSize: 11.5, opacity: 0.75 }}>18 students playing · {live.submitted}/{live.total} submitted · avg {live.avg}%</div>
            </div>
            <button
              type="button"
              onClick={() => onAssignment(live)}
              style={{ padding: '8px 14px', borderRadius: 999, background: 'var(--pbs-butter)', color: 'var(--pbs-butter-ink)', fontSize: 12, fontWeight: 700, border: 0, cursor: 'pointer', fontFamily: 'inherit' }}
            >Watch live →</button>
          </Block>
        </div>

        <div className="pb-teacher-kpis" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Kpi tone="butter" icon="spark" label="Class average" value={`${at}%`}      sub="+4 vs last week"/>
          <Kpi tone="mint"   icon="check" label="Submitted"     value="92%"             sub="26 of 28"/>
          <Kpi tone="coral"  icon="heart" label="Time on tool"  value="3.2h"            sub="per student · wk"/>
          <Kpi tone="sky"    icon="users" label="At risk"       value={highRisk.length} sub="needs attention"/>
        </div>
      </div>

      {/* Engagement + Topic mastery */}
      <div className="pb-teacher-split" style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 18 }}>
        <Block tone="paper" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Engagement · last 14 days</div>
              <div style={{ fontSize: 11.5, color: 'var(--pbs-ink-muted)', marginTop: 2 }}>% of class active per day</div>
            </div>
            <Pill tone="butter" icon="sparkle">Up 18%</Pill>
          </div>
          <BarRow data={ENGAGEMENT_14D} height={130}/>
        </Block>

        <Block tone="paper" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Topic mastery</div>
          <div style={{ fontSize: 11.5, color: 'var(--pbs-ink-muted)', marginBottom: 14 }}>Across all assignments</div>
          <TopicBars topics={TOPICS}/>
        </Block>
      </div>

      {/* Heatmap */}
      <Block tone="paper" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 10, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Mastery by student</div>
            <div style={{ fontSize: 11.5, color: 'var(--pbs-ink-muted)', marginTop: 2 }}>Click a row to see their timeline</div>
          </div>
          <div style={{ display: 'flex', gap: 8, fontSize: 11, alignItems: 'center' }}>
            <LegendDot c="mint"   l="85+"/>
            <LegendDot c="butter" l="70+"/>
            <LegendDot c="coral"  l="55+"/>
            <LegendDot c="#ff9280" raw l="<55"/>
          </div>
        </div>
        <MasteryHeatmap students={STUDENTS} topics={TOPICS} onPick={onStudent}/>
      </Block>

      {/* Hotspots + Questions feed */}
      <div className="pb-teacher-split" style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 18 }}>
        <Block tone="paper" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Trickiest questions this week</div>
              <div style={{ fontSize: 11.5, color: 'var(--pbs-ink-muted)', marginTop: 2 }}>Low correct %, high ask rate</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {TRICKY_QUESTIONS.map((q) => (
              <div key={q.id} style={{ display: 'flex', gap: 12, padding: '10px 12px', border: '1.5px solid var(--pbs-line-2)', borderRadius: 12, background: 'var(--pbs-cream)' }}>
                <div style={{
                  width: 46, textAlign: 'center', padding: '4px 0',
                  background: q.correct < 0.45 ? 'var(--pbs-coral)' : 'var(--pbs-butter)',
                  color: q.correct < 0.45 ? 'var(--pbs-coral-ink)' : 'var(--pbs-butter-ink)',
                  border: `1.5px solid ${q.correct < 0.45 ? 'var(--pbs-coral-ink)' : 'var(--pbs-butter-ink)'}`,
                  borderRadius: 8, fontWeight: 700, fontSize: 13,
                }}>
                  {Math.round(q.correct * 100)}%
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="pbs-mono" style={{ fontSize: 13.5, fontWeight: 600 }}>{q.text}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--pbs-ink-muted)', marginTop: 3 }}>{q.topic} · asked by {q.asked} students</div>
                </div>
                <button type="button" style={reteachBtn}>Re-teach</button>
              </div>
            ))}
          </div>
        </Block>

        <Block tone="paper" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Questions students asked</div>
              <div style={{ fontSize: 11.5, color: 'var(--pbs-ink-muted)', marginTop: 2 }}>In the in-game tutor</div>
            </div>
            <Pill tone="sky">{RECENT_QUESTIONS.length} today</Pill>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 340, overflowY: 'auto' }}>
            {RECENT_QUESTIONS.map((q, i) => {
              const s = STUDENTS.find((x) => x.id === q.sid);
              return (
                <div key={i} style={{
                  display: 'flex', gap: 10, padding: 10, borderRadius: 10,
                  background: q.resolved ? 'var(--pbs-cream)' : 'var(--pbs-pink)',
                  border: `1.5px solid ${q.resolved ? 'var(--pbs-line-2)' : 'var(--pbs-pink-ink)'}`,
                }}>
                  {s ? <CardboardHead outfit={s.avatar} px={22}/> : <span style={{ fontSize: 18 }}>·</span>}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, lineHeight: 1.35 }}>&quot;{q.q}&quot;</div>
                    <div style={{
                      fontSize: 10.5,
                      color: q.resolved ? 'var(--pbs-ink-muted)' : 'var(--pbs-pink-ink)',
                      marginTop: 3,
                      fontWeight: q.resolved ? 400 : 700,
                    }}>
                      {s?.name} · {q.topic} · {q.at} {!q.resolved && '· needs you'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Block>
      </div>

      {/* Needs attention */}
      <Block tone="coral" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <Icon name="heart" size={18} stroke={2.2}/>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Needs a nudge</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
          {highRisk.map((s) => (
            <button key={s.id} type="button" onClick={() => onStudent(s)} style={riskCard}>
              <CardboardHead outfit={s.avatar} px={32}/>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{s.name}</div>
                <div style={{ fontSize: 11, color: 'var(--pbs-coral-ink)', opacity: 0.8 }}>{s.avg}% · {s.risk === 'high' ? 'no activity 5d' : 'slipping 2 wks'}</div>
              </div>
              <Icon name="arrow-right" size={14} stroke={2.2}/>
            </button>
          ))}
        </div>
      </Block>
    </div>
  );
};
