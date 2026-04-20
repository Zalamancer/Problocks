// Left-rail stepper + step catalog shared with the setup app.
// Ported from Claude Design bundle (pb_classroom_setup/stepper.jsx).
'use client';

import React from 'react';
import { Icon } from '@/components/landing/pb-site/primitives';
import type { Tone } from './form';

export type StepMeta = {
  id: 'you' | 'class' | 'roster' | 'unit' | 'review';
  label: string;
  icon: React.ComponentProps<typeof Icon>['name'];
  tone: Tone;
  blurb: string;
};

export const STEPS: StepMeta[] = [
  { id: 'you',    label: 'About you',          icon: 'smile',   tone: 'butter', blurb: 'Teacher name, school, and grade band so we can localise standards.' },
  { id: 'class',  label: 'Class basics',       icon: 'book',    tone: 'mint',   blurb: 'Pick a subject, grade, schedule, and give it a name the kids will recognise.' },
  { id: 'roster', label: 'Add students',       icon: 'users',   tone: 'sky',    blurb: 'Paste a roster, sync Google Classroom / Clever, or hand out a join code.' },
  { id: 'unit',   label: 'Pick a starter unit', icon: 'compass', tone: 'grape',  blurb: 'Drop in a ready-made unit or start from a blank canvas.' },
  { id: 'review', label: 'Review & open',      icon: 'sparkle', tone: 'coral',  blurb: 'A last look at the room before we open the doors.' },
];

export const Stepper = ({
  current, onJump, completed,
}: {
  current: number;
  onJump: (i: number) => void;
  completed: number[];
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <div className="pbs-mono" style={{ fontSize: 10.5, color: 'var(--pbs-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6, padding: '0 4px' }}>
      Set up · 5 steps · ~4 min
    </div>

    {STEPS.map((step, i) => {
      const isCurrent = i === current;
      const isDone = completed.includes(i);
      const isNext = i > current && !isDone;
      return (
        <button
          key={step.id}
          onClick={() => onJump(i)}
          style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            padding: '12px 14px',
            borderRadius: 14,
            textAlign: 'left',
            background: isCurrent ? 'var(--pbs-paper)' : 'transparent',
            border: `1.5px solid ${isCurrent ? 'var(--pbs-line-2)' : 'transparent'}`,
            boxShadow: isCurrent ? '0 3px 0 var(--pbs-line-2)' : 'none',
            transition: 'background 120ms, border-color 120ms, box-shadow 120ms',
            cursor: isNext ? 'not-allowed' : 'pointer',
            opacity: isNext ? 0.55 : 1,
            width: '100%',
            fontFamily: 'inherit',
            color: 'inherit',
          }}
        >
          <div style={{
            flexShrink: 0,
            width: 34, height: 34, borderRadius: 10,
            background: isDone ? `var(--pbs-${step.tone})` : isCurrent ? `var(--pbs-${step.tone})` : 'var(--pbs-cream-2)',
            color: isDone || isCurrent ? `var(--pbs-${step.tone}-ink)` : 'var(--pbs-ink-muted)',
            border: `1.5px solid ${isDone || isCurrent ? `var(--pbs-${step.tone}-ink)` : 'var(--pbs-line-2)'}`,
            boxShadow: isCurrent ? `0 2px 0 var(--pbs-${step.tone}-ink)` : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 13,
          }}>
            {isDone ? <Icon name="check" size={16} stroke={2.6}/> : <Icon name={step.icon} size={15} stroke={2.2}/>}
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em',
              color: isCurrent ? 'var(--pbs-ink)' : isDone ? 'var(--pbs-ink)' : 'var(--pbs-ink-soft)',
            }}>
              <span className="pbs-mono" style={{ fontSize: 10.5, color: 'var(--pbs-ink-muted)', letterSpacing: '0.1em' }}>0{i+1}</span>
              {step.label}
            </div>
            <div style={{
              fontSize: 12, lineHeight: 1.4,
              color: 'var(--pbs-ink-muted)',
              marginTop: 2,
              display: isCurrent ? 'block' : 'none',
            }}>{step.blurb}</div>
          </div>
        </button>
      );
    })}
  </div>
);
