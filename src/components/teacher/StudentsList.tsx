// Roster grid for the teacher's class — searchable, sortable.
// Ported from problocks/project/pb_teacher/app.jsx (StudentsList).
'use client';

import React, { useState } from 'react';
import { Block, Pill } from '@/components/landing/pb-site/primitives';
import { STUDENTS, type Student } from './sample-data';
import { kickerSty } from './shared';
import { StudentAvatar } from './StudentAvatar';

type SortKey = 'avg' | 'risk' | 'name';
const riskRank = { none: 0, low: 1, medium: 2, high: 3 } as const;

export const StudentsList = ({
  onStudent,
}: {
  onStudent: (s: Student) => void;
}) => {
  const [sort, setSort] = useState<SortKey>('avg');
  const [q, setQ] = useState('');

  const filtered = STUDENTS
    .filter((s) => s.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'avg')  return b.avg - a.avg;
      if (sort === 'risk') return riskRank[b.risk] - riskRank[a.risk];
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="pbs-fade-in">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div className="pbs-mono" style={kickerSty}>STUDENTS</div>
          <h1 style={{ margin: '6px 0 0', fontSize: 'clamp(28px, 3.4vw, 42px)', fontWeight: 700, letterSpacing: '-0.025em' }}>
            {STUDENTS.length} students
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search…"
            style={{
              padding: '10px 14px', borderRadius: 12,
              border: '1.5px solid var(--pbs-line-2)',
              background: 'var(--pbs-paper)',
              fontSize: 13, outline: 'none', minWidth: 200,
              color: 'var(--pbs-ink)',
            }}
          />
          <div style={{ display: 'flex', gap: 4, padding: 3, background: 'var(--pbs-paper)', border: '1.5px solid var(--pbs-line-2)', borderRadius: 12 }}>
            {([['avg', 'By avg'], ['risk', 'By risk'], ['name', 'A–Z']] as const).map(([k, l]) => (
              <button
                key={k}
                type="button"
                onClick={() => setSort(k)}
                style={{
                  padding: '7px 11px', borderRadius: 9,
                  fontSize: 11.5, fontWeight: 600,
                  background: sort === k ? 'var(--pbs-ink)' : 'transparent',
                  color: sort === k ? 'var(--pbs-cream)' : 'var(--pbs-ink-soft)',
                  border: 0, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >{l}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {filtered.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onStudent(s)}
            style={{ padding: 0, textAlign: 'left', background: 'none', border: 0, cursor: 'pointer', font: 'inherit', color: 'inherit' }}
          >
            <Block tone="paper" style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Static cardboard-head tile (shared renderer + PNG
                    cache in CardboardHead.tsx — safe to render many). */}
                <StudentAvatar s={s} px={56}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700 }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--pbs-ink-muted)', marginTop: 2 }}>{s.lastActive} · {s.submitted} done</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1 }}>{s.grade}</div>
                  <div className="pbs-mono" style={{ fontSize: 10.5, color: 'var(--pbs-ink-muted)', marginTop: 2 }}>{s.avg}%</div>
                </div>
              </div>
              <div style={{ marginTop: 10, display: 'flex', gap: 6, alignItems: 'center' }}>
                {s.risk !== 'none' && <Pill tone={s.risk === 'high' ? 'coral' : 'butter'} icon="heart">{s.risk}</Pill>}
                <Pill tone="paper" icon="bolt">{s.streak}d</Pill>
                <span style={{
                  marginLeft: 'auto', fontSize: 10.5,
                  color: s.trend === 'down' ? 'var(--pbs-coral-ink)' : 'var(--pbs-mint-ink)',
                  fontWeight: 700,
                }}>
                  {s.trend === 'up' ? '↑ trending up' : s.trend === 'down' ? '↓ slipping' : '→ steady'}
                </span>
              </div>
            </Block>
          </button>
        ))}
      </div>
    </div>
  );
};
