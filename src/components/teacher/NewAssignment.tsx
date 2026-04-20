// Teacher "New assignment" page — form that creates an Assignment and
// returns it to the TeacherApp via onCreate. Matches the chunky-pastel look
// of AssignmentsList / AssignmentDetail (Block + Pill + Chunky primitives).
'use client';

import React, { useState } from 'react';
import { Block, Chunky, Pill } from '@/components/landing/pb-site/primitives';
import type { Assignment, TeacherTone } from './sample-data';
import { backBtn, kickerSty } from './shared';

type Kind = Assignment['kind'];
type Topic = Assignment['topic'];

const KINDS: Kind[]   = ['Live', 'Homework'];
const TOPICS: Topic[] = ['Algebra', 'Geometry', 'Numbers', 'Probability'];
const TONES: TeacherTone[] = ['butter', 'mint', 'coral', 'sky', 'grape', 'pink'];

// Icon per topic mirrors the icons used in sample-data so the new card slots
// into the grid with a matching glyph without asking the teacher to pick one.
const ICON_FOR_TOPIC: Record<Topic, string> = {
  Algebra:     'bolt',
  Geometry:    'cube',
  Numbers:     'coin',
  Probability: 'spark',
};

const fieldLabel: React.CSSProperties = {
  fontSize: 11, fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '0.08em',
  color: 'var(--pbs-ink-muted)',
  marginBottom: 6,
};

const inputSty: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 10,
  background: 'var(--pbs-paper)',
  border: '1.5px solid var(--pbs-line-2)',
  fontSize: 14, fontWeight: 500,
  color: 'inherit', fontFamily: 'inherit',
  outline: 'none',
};

const chipRow: React.CSSProperties = {
  display: 'flex', flexWrap: 'wrap', gap: 6,
};

const chip = (active: boolean): React.CSSProperties => ({
  padding: '7px 12px', borderRadius: 999,
  background: active ? 'var(--pbs-ink)' : 'var(--pbs-paper)',
  color:      active ? 'var(--pbs-cream)' : 'var(--pbs-ink-soft)',
  border: '1.5px solid var(--pbs-line-2)',
  fontSize: 12.5, fontWeight: 600,
  cursor: 'pointer', fontFamily: 'inherit',
});

const toneSwatch = (tone: TeacherTone, active: boolean): React.CSSProperties => ({
  width: 34, height: 34, borderRadius: 10,
  background: `var(--pbs-${tone})`,
  border: `2.5px solid ${active ? 'var(--pbs-ink)' : `var(--pbs-${tone}-ink)`}`,
  boxShadow: active ? '0 0 0 3px var(--pbs-cream), 0 0 0 5px var(--pbs-ink)' : 'none',
  cursor: 'pointer',
  transition: 'transform 120ms',
  transform: active ? 'scale(1.05)' : 'scale(1)',
});

export const NewAssignment = ({
  onBack, onCreate,
}: {
  onBack: () => void;
  onCreate: (a: Assignment) => void;
}) => {
  const [title, setTitle]       = useState('');
  const [kind, setKind]         = useState<Kind>('Homework');
  const [topic, setTopic]       = useState<Topic>('Algebra');
  const [due, setDue]           = useState('');
  const [questions, setQuestions] = useState(10);
  const [minutes, setMinutes]   = useState(15);
  const [tone, setTone]         = useState<TeacherTone>('butter');

  const canSubmit = title.trim().length > 0 && due.trim().length > 0;

  const submit = () => {
    if (!canSubmit) return;
    const a: Assignment = {
      id: `a${Date.now().toString(36)}`,
      title: title.trim(),
      kind,
      topic,
      due: due.trim(),
      avg: 0,
      submitted: 0,
      total: 28,
      questions,
      minutes,
      tone,
      icon: ICON_FOR_TOPIC[topic],
      hardestQ: 1,
    };
    onCreate(a);
  };

  return (
    <div className="pbs-fade-in">
      <button type="button" onClick={onBack} style={backBtn}>← Back to assignments</button>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 14, marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div className="pbs-mono" style={kickerSty}>NEW ASSIGNMENT</div>
          <h1 style={{ margin: '6px 0 0', fontSize: 'clamp(28px, 3.4vw, 42px)', fontWeight: 700, letterSpacing: '-0.025em' }}>
            Create an assignment
          </h1>
        </div>
      </div>

      <div className="pb-teacher-split" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 18 }}>
        <Block tone="paper" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <div style={fieldLabel}>Title</div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Linear Equations Relay"
              style={inputSty}
            />
          </div>

          <div>
            <div style={fieldLabel}>Kind</div>
            <div style={chipRow}>
              {KINDS.map((k) => (
                <button key={k} type="button" onClick={() => setKind(k)} style={chip(kind === k)}>
                  {k}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={fieldLabel}>Topic</div>
            <div style={chipRow}>
              {TOPICS.map((t) => (
                <button key={t} type="button" onClick={() => setTopic(t)} style={chip(topic === t)}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 12 }}>
            <div>
              <div style={fieldLabel}>Due</div>
              <input
                type="text"
                value={due}
                onChange={(e) => setDue(e.target.value)}
                placeholder="e.g. Apr 28"
                style={inputSty}
              />
            </div>
            <div>
              <div style={fieldLabel}>Questions</div>
              <input
                type="number"
                min={1}
                value={questions}
                onChange={(e) => setQuestions(Math.max(1, Number(e.target.value) || 1))}
                style={inputSty}
              />
            </div>
            <div>
              <div style={fieldLabel}>Minutes</div>
              <input
                type="number"
                min={1}
                value={minutes}
                onChange={(e) => setMinutes(Math.max(1, Number(e.target.value) || 1))}
                style={inputSty}
              />
            </div>
          </div>

          <div>
            <div style={fieldLabel}>Card colour</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {TONES.map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-label={t}
                  onClick={() => setTone(t)}
                  style={toneSwatch(t, tone === t)}
                />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <Chunky tone="ghost" onClick={onBack}>Cancel</Chunky>
            <Chunky tone="butter" icon="plus" onClick={submit} disabled={!canSubmit}>
              Create assignment
            </Chunky>
          </div>
        </Block>

        <Block tone={tone} style={{ padding: 18, alignSelf: 'start' }}>
          <div className="pbs-mono" style={{ ...kickerSty, marginBottom: 10 }}>PREVIEW</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <Pill tone="paper">{kind}</Pill>
            <Pill tone="paper" icon="book">{topic}</Pill>
            <span style={{ marginLeft: 'auto', fontSize: 11.5, opacity: 0.8 }}>{due || 'Due —'}</span>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>
            {title || 'Untitled assignment'}
          </div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 3 }}>
            {topic} · {questions} Qs · ~{minutes} min
          </div>
          <div style={{ marginTop: 14, fontSize: 11.5, opacity: 0.75, lineHeight: 1.5 }}>
            This is how the card will appear on the Assignments grid once created.
          </div>
        </Block>
      </div>
    </div>
  );
};
