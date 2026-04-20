// Teacher Assignments tab — list view + assignment detail with per-student rows.
// Ported from problocks/project/pb_teacher/assignments.jsx.
'use client';

import React from 'react';
import { Block, Chunky, Icon, Pill } from '@/components/landing/pb-site/primitives';
import { ASSIGNMENTS, STUDENTS, type Assignment, type Student } from './sample-data';
import { backBtn, kickerSty, MiniKpi } from './shared';

export const AssignmentsList = ({
  onAssignment, onNew, extraAssignments = [],
}: {
  onAssignment: (a: Assignment) => void;
  onNew: () => void;
  extraAssignments?: Assignment[];
}) => {
  const all = [...extraAssignments, ...ASSIGNMENTS];
  return (
  <div className="pbs-fade-in">
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
      <div>
        <div className="pbs-mono" style={kickerSty}>ASSIGNMENTS</div>
        <h1 style={{ margin: '6px 0 0', fontSize: 'clamp(28px, 3.4vw, 42px)', fontWeight: 700, letterSpacing: '-0.025em' }}>
          {all.length} assignments, {all.reduce((s, a) => s + a.submitted, 0)} submissions
        </h1>
      </div>
      <Chunky tone="butter" icon="plus" onClick={onNew}>New assignment</Chunky>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
      {all.map((a) => (
        <Block key={a.id} tone={a.tone} style={{ padding: 18, cursor: 'pointer' }} onClick={() => onAssignment(a)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'var(--pbs-paper)',
              border: '1.5px solid currentColor',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name={a.icon as 'bolt'} size={18} stroke={2.2}/>
            </div>
            <Pill tone="paper">{a.kind}</Pill>
            <span style={{ marginLeft: 'auto', fontSize: 11.5, opacity: 0.8 }}>{a.due}</span>
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>{a.title}</div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 3 }}>{a.topic} · {a.questions} Qs · ~{a.minutes} min</div>
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                <span style={{ opacity: 0.8 }}>{a.submitted}/{a.total} submitted</span>
                <span className="pbs-mono" style={{ fontWeight: 700 }}>{a.avg}%</span>
              </div>
              <div style={{ height: 8, borderRadius: 999, background: 'rgba(29,26,20,0.18)', overflow: 'hidden' }}>
                <div style={{ width: `${(a.submitted / a.total) * 100}%`, height: '100%', background: 'currentColor' }}/>
              </div>
            </div>
          </div>
        </Block>
      ))}
    </div>
  </div>
  );
};

// Deterministic jitter so distribution/rows don't re-randomize per render.
const jitterFor = (s: Student) => ((s.id.charCodeAt(1) * 7) % 16) - 8;
const timeFor = (s: Student) => 8 + ((s.id.charCodeAt(1) * 3) % 14);
const submittedFor = (s: Student) => s.risk !== 'high' || (s.id.charCodeAt(1) % 3) !== 0;

const submissionRow: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 12,
  padding: 10, borderRadius: 10,
  background: 'var(--pbs-cream)', border: '1.5px solid var(--pbs-line-2)',
  width: '100%', textAlign: 'left',
  cursor: 'pointer', font: 'inherit', color: 'inherit',
};

export const AssignmentDetail = ({
  a, onBack, onStudent,
}: {
  a: Assignment;
  onBack: () => void;
  onStudent: (s: Student) => void;
}) => {
  const rows = STUDENTS.map((s) => {
    const base = Math.round((s.mastery.alg + s.mastery.num) / 2 * 100);
    const score = Math.max(0, Math.min(100, base + jitterFor(s)));
    return { s, score, submitted: submittedFor(s), timeMin: timeFor(s) };
  });

  const submittedRows = rows.filter((r) => r.submitted);
  const avg = Math.round(submittedRows.reduce((x, r) => x + r.score, 0) / Math.max(1, submittedRows.length));
  const cuts = [0, 60, 70, 80, 90, 101];
  const distr = cuts.slice(1).map((hi, i) => {
    const lo = cuts[i];
    return {
      label: `${lo}-${hi - 1}`,
      count: submittedRows.filter((r) => r.score >= lo && r.score < hi).length,
    };
  });

  return (
    <div className="pbs-fade-in">
      <button type="button" onClick={onBack} style={backBtn}>← Back to assignments</button>

      <div className="pb-teacher-split" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 18, marginTop: 14 }}>
        <Block tone={a.tone} style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <Pill tone="paper">{a.kind}</Pill>
            <Pill tone="paper" icon="book">{a.topic}</Pill>
          </div>
          <h2 style={{ margin: 0, fontSize: 30, fontWeight: 700, letterSpacing: '-0.025em' }}>{a.title}</h2>
          <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>{a.due} · {a.questions} Qs · ~{a.minutes} min</div>

          <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            <MiniKpi l="Class avg" v={`${avg}%`}/>
            <MiniKpi l="Submitted" v={`${submittedRows.length}/${a.total}`}/>
            <MiniKpi l="Median time" v={`${Math.round(submittedRows.reduce((x, r) => x + r.timeMin, 0) / Math.max(1, submittedRows.length))}m`}/>
          </div>
        </Block>

        <Block tone="paper" style={{ padding: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Score distribution</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140, padding: '0 4px' }}>
            {distr.map((d) => (
              <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ fontSize: 11, fontWeight: 700 }}>{d.count}</div>
                <div style={{
                  width: '100%',
                  height: `${Math.max(4, (d.count / Math.max(1, submittedRows.length)) * 100)}%`,
                  background: d.label.startsWith('9') ? 'var(--pbs-mint)'
                            : d.label.startsWith('8') ? 'var(--pbs-butter)'
                            : d.label.startsWith('7') ? 'var(--pbs-sky)'
                            : 'var(--pbs-coral)',
                  border: '1.5px solid var(--pbs-ink)',
                  borderRadius: 6,
                  boxShadow: '0 2px 0 var(--pbs-ink)',
                }}/>
                <div className="pbs-mono" style={{ fontSize: 10, color: 'var(--pbs-ink-muted)' }}>{d.label}</div>
              </div>
            ))}
          </div>
        </Block>
      </div>

      <Block tone="paper" style={{ padding: 20, marginTop: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>Student submissions</div>
          <div style={{ fontSize: 11.5, color: 'var(--pbs-ink-muted)' }}>Sorted by score</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[...rows].sort((x, y) => y.score - x.score).map(({ s, score, submitted: sub, timeMin }) => (
            <button key={s.id} type="button" onClick={() => onStudent(s)} style={submissionRow}>
              <span style={{ fontSize: 18 }}>{s.emoji}</span>
              <div style={{ width: 150, fontSize: 13, fontWeight: 600 }}>{s.name}</div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1, height: 8, borderRadius: 999, background: 'var(--pbs-cream-2)', border: '1.5px solid var(--pbs-line-2)', overflow: 'hidden' }}>
                  <div style={{
                    width: `${score}%`, height: '100%',
                    background: score >= 85 ? 'var(--pbs-mint-ink)'
                              : score >= 70 ? 'var(--pbs-butter-ink)'
                              : 'var(--pbs-coral-ink)',
                  }}/>
                </div>
                <span className="pbs-mono" style={{ width: 42, textAlign: 'right', fontWeight: 700, fontSize: 12.5 }}>{sub ? `${score}%` : '—'}</span>
              </div>
              <div style={{ width: 60, textAlign: 'right', fontSize: 11.5, color: 'var(--pbs-ink-muted)' }}>{sub ? `${timeMin} min` : 'not in'}</div>
              <Icon name="arrow-right" size={14} stroke={2.2}/>
            </button>
          ))}
        </div>
      </Block>
    </div>
  );
};
