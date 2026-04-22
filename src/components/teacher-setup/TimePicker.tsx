// Intuitive time picker: hour + 5-minute increments + AM/PM.
// Stores/emits the same "h:mm AM/PM" string the rest of the form expects,
// so nothing downstream (preview, review, saved data) has to change.
'use client';

import React from 'react';
import { Select } from './form';

type Parsed = { hour: number; minute: number; period: 'AM' | 'PM' };

// Parse any reasonable variant: "10:15 AM", "1015am", "10:5 p", "8" -> best guess.
// Falls back to 8:00 AM so the picker always has a valid starting point.
function parse(str: string): Parsed {
  const s = (str || '').trim().toUpperCase().replace(/\s+/g, '');
  const m = s.match(/^(\d{1,2}):?(\d{0,2})\s*(A|P|AM|PM)?M?$/);
  if (!m) return { hour: 8, minute: 0, period: 'AM' };
  let hour = parseInt(m[1], 10);
  let minute = m[2] ? parseInt(m[2], 10) : 0;
  let periodRaw = m[3] || '';
  let period: 'AM' | 'PM';
  if (periodRaw.startsWith('P')) period = 'PM';
  else if (periodRaw.startsWith('A')) period = 'AM';
  else period = hour >= 12 ? 'PM' : 'AM';
  // Normalize 24h input to 12h if needed.
  if (hour === 0) hour = 12;
  if (hour > 12) hour -= 12;
  if (hour < 1) hour = 12;
  if (minute < 0 || minute > 59 || Number.isNaN(minute)) minute = 0;
  // Snap to nearest 5 minutes for consistency with the picker grid.
  minute = Math.round(minute / 5) * 5;
  if (minute === 60) { minute = 0; hour = (hour % 12) + 1; }
  return { hour, minute, period };
}

function format({ hour, minute, period }: Parsed): string {
  return `${hour}:${minute.toString().padStart(2, '0')} ${period}`;
}

const HOURS = Array.from({ length: 12 }, (_, i) => {
  const h = i + 1;
  return { value: String(h), label: String(h) };
});

const MINUTES = Array.from({ length: 12 }, (_, i) => {
  const m = i * 5;
  const s = m.toString().padStart(2, '0');
  return { value: s, label: s };
});

const PERIODS = [
  { value: 'AM', label: 'AM' },
  { value: 'PM', label: 'PM' },
];

export const TimePicker = ({
  value, onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => {
  const parsed = parse(value);

  const emit = (next: Partial<Parsed>) => {
    onChange(format({ ...parsed, ...next }));
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
      <Select
        value={String(parsed.hour)}
        onChange={(e) => emit({ hour: parseInt(e.target.value, 10) })}
        options={HOURS}
        dropUp
      />
      <Select
        value={parsed.minute.toString().padStart(2, '0')}
        onChange={(e) => emit({ minute: parseInt(e.target.value, 10) })}
        options={MINUTES}
        dropUp
      />
      <Select
        value={parsed.period}
        onChange={(e) => emit({ period: e.target.value as 'AM' | 'PM' })}
        options={PERIODS}
        dropUp
      />
    </div>
  );
};
