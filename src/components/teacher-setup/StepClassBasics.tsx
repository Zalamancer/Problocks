// Step 2: classroom name, subject, grade, color, schedule.
// Ported from Claude Design bundle (pb_classroom_setup/steps_early.jsx).
'use client';

import React from 'react';
import { Icon } from '@/components/landing/pb-site/primitives';
import { Field, TextInput, Select, ChipGroup, StepCard, StepHeader } from './form';
import type { SetupData, ClassroomColor } from './types';

const COLORS: ClassroomColor[] = ['butter', 'mint', 'coral', 'sky', 'grape', 'pink'];

export const StepClassBasics = ({
  data, set,
}: {
  data: SetupData;
  set: <K extends keyof SetupData>(k: K, v: SetupData[K]) => void;
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
    <StepHeader
      index={1}
      total={5}
      step={{
        title: <>Now, what&apos;s <span className="pbs-serif">the classroom?</span></>,
        sub: 'Give it a name, a color, and a rhythm. You can run multiple rooms for different periods or sections.',
      }}
    />

    <StepCard>
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
        <Field label="Classroom name" hint="Students see this. Have fun.">
          <TextInput
            value={data.className}
            onChange={(e) => set('className', e.target.value)}
            placeholder="Period 4 — Fraction Friends"
          />
        </Field>
        <Field label="Subject">
          <Select
            value={data.classSubject}
            onChange={(e) => set('classSubject', e.target.value as SetupData['classSubject'])}
            options={[
              { value: 'math', label: 'Math' },
              { value: 'ela', label: 'Reading & writing' },
              { value: 'science', label: 'Science' },
              { value: 'cs', label: 'Computer science' },
              { value: 'social', label: 'Social studies' },
              { value: 'art', label: 'Art & music' },
              { value: 'mixed', label: 'Mixed / homeroom' },
            ]}
          />
        </Field>
      </div>

      <div style={{ marginTop: 16 }}>
        <Field label="Grade level">
          <div style={{ height: 6 }}/>
          <ChipGroup
            value={data.grade}
            onChange={(v) => set('grade', v as SetupData['grade'])}
            options={[
              { value: 'k2',  label: 'K–2' },
              { value: '3',   label: '3rd' },
              { value: '4',   label: '4th' },
              { value: '5',   label: '5th' },
              { value: '6',   label: '6th' },
              { value: '7',   label: '7th' },
              { value: '8',   label: '8th' },
              { value: 'hs',  label: 'High school' },
              { value: 'mix', label: 'Mixed' },
            ]}
          />
        </Field>
      </div>

      <div style={{ marginTop: 16 }}>
        <Field label="Classroom color" hint="Shows in student apps and assignments.">
          <div style={{ height: 6 }}/>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {COLORS.map((c) => {
              const sel = data.color === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => set('color', c)}
                  style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: `var(--pbs-${c})`,
                    border: `2px solid var(--pbs-${c}-ink)`,
                    boxShadow: sel
                      ? `0 3px 0 var(--pbs-${c}-ink), 0 0 0 3px var(--pbs-paper), 0 0 0 5px var(--pbs-ink)`
                      : `0 3px 0 var(--pbs-${c}-ink)`,
                    transition: 'box-shadow 150ms',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: `var(--pbs-${c}-ink)`,
                  }}
                >
                  {sel && <Icon name="check" size={20} stroke={3}/>}
                </button>
              );
            })}
          </div>
        </Field>
      </div>

      <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px dashed var(--pbs-line-2)' }}>
        <Field label="Schedule" hint="When does this class meet? Used for due-date defaults.">
          <div style={{ height: 6 }}/>
          <ChipGroup
            multi
            value={data.days}
            onChange={(v) => set('days', v as SetupData['days'])}
            options={[
              { value: 'mon', label: 'Mon', tone: 'sky' },
              { value: 'tue', label: 'Tue', tone: 'sky' },
              { value: 'wed', label: 'Wed', tone: 'sky' },
              { value: 'thu', label: 'Thu', tone: 'sky' },
              { value: 'fri', label: 'Fri', tone: 'sky' },
            ]}
          />
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <Field label="Starts" style={{ flex: 1 }}>
              <TextInput
                value={data.startTime}
                onChange={(e) => set('startTime', e.target.value)}
                placeholder="10:15 AM"
                icon="bolt"
              />
            </Field>
            <Field label="Ends" style={{ flex: 1 }}>
              <TextInput
                value={data.endTime}
                onChange={(e) => set('endTime', e.target.value)}
                placeholder="11:05 AM"
                icon="bolt"
              />
            </Field>
          </div>
        </Field>
      </div>
    </StepCard>
  </div>
);
