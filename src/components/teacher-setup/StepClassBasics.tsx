// Step 2: classroom name, subject, grade, color, schedule.
// Ported from Claude Design bundle (pb_classroom_setup/steps_early.jsx).
'use client';

import React from 'react';
import { Icon } from '@/components/landing/pb-site/primitives';
import { Field, TextInput, Select, ChipGroup, StepCard, StepHeader } from './form';
import { TimePicker, toMinutes, fromMinutes } from './TimePicker';
import type { SetupData, ClassroomColor } from './types';

const DEFAULT_DURATION = 55; // minutes — used on first start edit and as fallback
const MIN_DURATION = 5;      // end must always be at least 5 min after start
const SCHEDULE_HINT_DEFAULT = 'When does this class meet? Used for due-date defaults.';

// Pluralizes and shows hours + minutes; falls back to "0 minutes" for safety.
function formatDuration(totalMin: number): string {
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  const parts: string[] = [];
  if (h > 0) parts.push(`${h} ${h === 1 ? 'hour' : 'hours'}`);
  if (m > 0) parts.push(`${m} ${m === 1 ? 'minute' : 'minutes'}`);
  return parts.length ? parts.join(' ') : '0 minutes';
}

const COLORS: ClassroomColor[] = ['butter', 'mint', 'coral', 'sky', 'grape', 'pink'];

export const StepClassBasics = ({
  data, set,
}: {
  data: SetupData;
  set: <K extends keyof SetupData>(k: K, v: SetupData[K]) => void;
}) => {
  const startMin = toMinutes(data.startTime);
  const endMin = toMinutes(data.endTime);
  // Preserve current duration when it's valid; otherwise fall back to 55 min.
  const currentDuration = endMin - startMin;
  const duration = currentDuration >= MIN_DURATION ? currentDuration : DEFAULT_DURATION;

  // Swap the Schedule hint from the friendly prompt to the live class
  // length only after the teacher has actually touched a time picker.
  const [timeTouched, setTimeTouched] = React.useState(false);

  const onStartChange = (v: string) => {
    const newStart = toMinutes(v);
    setTimeTouched(true);
    set('startTime', v);
    // Shift end so the existing duration is preserved; if it was invalid, use 55.
    set('endTime', fromMinutes(newStart + duration));
  };

  const onEndChange = (v: string) => {
    const newEnd = toMinutes(v);
    setTimeTouched(true);
    // Clamp: end must always be after start.
    if (newEnd <= startMin) {
      set('endTime', fromMinutes(startMin + MIN_DURATION));
    } else {
      set('endTime', v);
    }
  };

  const scheduleHint = timeTouched ? formatDuration(duration) : SCHEDULE_HINT_DEFAULT;

  return (
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
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.1fr 0.7fr', gap: 16 }}>
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
              { value: 'math',    label: 'Math' },
              { value: 'ela',     label: 'Reading & writing' },
              { value: 'science', label: 'Science' },
              { value: 'cs',      label: 'Computer science' },
              { value: 'social',  label: 'Social studies' },
              { value: 'art',     label: 'Art' },
              { value: 'music',   label: 'Music' },
              { value: 'lang',    label: 'World languages' },
              { value: 'pe',      label: 'PE & Health' },
              { value: 'stem',    label: 'STEM / STEAM' },
              { value: 'sped',    label: 'SPED / Resource' },
              { value: 'other',   label: 'Other' },
              { value: 'mixed',   label: 'Mixed / homeroom' },
            ]}
          />
        </Field>
        <Field label="Grade">
          <Select
            value={data.grade}
            onChange={(e) => set('grade', e.target.value as SetupData['grade'])}
            options={[
              { value: 'k2',  label: 'K–2' },
              { value: '3',   label: '3rd' },
              { value: '4',   label: '4th' },
              { value: '5',   label: '5th' },
              { value: '6',   label: '6th' },
              { value: '7',   label: '7th' },
              { value: '8',   label: '8th' },
              { value: '9',   label: '9th' },
              { value: '10',  label: '10th' },
              { value: '11',  label: '11th' },
              { value: '12',  label: '12th' },
              { value: 'hs',  label: 'High school (mixed)', shortLabel: 'HS Mix' },
              { value: 'mix', label: 'Mixed / multi-grade',  shortLabel: 'Mixed' },
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
        <Field label="Schedule" hint={scheduleHint}>
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
              <TimePicker
                value={data.startTime}
                onChange={onStartChange}
              />
            </Field>
            <Field label="Ends" style={{ flex: 1 }}>
              <TimePicker
                value={data.endTime}
                onChange={onEndChange}
              />
            </Field>
          </div>
        </Field>
      </div>
    </StepCard>
  </div>
  );
};
