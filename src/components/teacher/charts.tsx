// Lightweight SVG charts: sparkline, bar row, donut, class-mastery heatmap, topic bars.
// Ported from problocks/project/pb_teacher/charts.jsx — converted `var(--*)` tokens
// to the `--pbs-*` namespace used by the rest of the ProBlocks cream theme.
'use client';

import React from 'react';
import { CardboardHead } from './CardboardHead';
import type { Student, Topic } from './sample-data';

export const Sparkline = ({
  data, height = 44,
  color = 'var(--pbs-butter-ink)',
  fill = 'var(--pbs-butter)',
}: { data: number[]; height?: number; color?: string; fill?: string }) => {
  const w = 200;
  const h = height;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = Math.max(1, max - min);
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => [i * step, h - ((v - min) / range) * (h - 6) - 3] as const);
  const path = pts.map((p, i) => `${i ? 'L' : 'M'} ${p[0]} ${p[1]}`).join(' ');
  const area = `${path} L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      <path d={area} fill={fill} opacity="0.25"/>
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {pts.map((p, i) => i === pts.length - 1 && (
        <circle key={i} cx={p[0]} cy={p[1]} r="3.5" fill={color}/>
      ))}
    </svg>
  );
};

export const BarRow = ({
  data, height = 140,
}: { data: { d: string; v: number }[]; height?: number }) => {
  const max = Math.max(...data.map((d) => d.v));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height, padding: '0 4px' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 0 }}>
          <div title={`${d.d}: ${Math.round(d.v * 100)}%`} style={{
            width: '100%',
            height: `${(d.v / max) * 100}%`,
            background: d.v > 0.6 ? 'var(--pbs-butter)' : d.v > 0.3 ? 'var(--pbs-mint)' : 'var(--pbs-coral)',
            border: '1.5px solid var(--pbs-ink)',
            borderRadius: 6,
            boxShadow: '0 2px 0 var(--pbs-ink)',
            minHeight: 4,
          }}/>
          <div className="pbs-mono" style={{ fontSize: 9.5, color: 'var(--pbs-ink-muted)' }}>{d.d[0]}</div>
        </div>
      ))}
    </div>
  );
};

export const Donut = ({
  value, size = 90, stroke = 12,
  color = 'var(--pbs-butter-ink)',
  track = 'var(--pbs-line-2)',
  label,
}: { value: number; size?: number; stroke?: number; color?: string; track?: string; label?: string }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - value);
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={track} strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
                strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}/>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: size * 0.26, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}>
          {Math.round(value * 100)}<span style={{ fontSize: size * 0.14, opacity: 0.6 }}>%</span>
        </div>
        {label && <div style={{ fontSize: 10, color: 'var(--pbs-ink-muted)', marginTop: 2 }}>{label}</div>}
      </div>
    </div>
  );
};

// Class mastery heatmap — students × topics.
export const MasteryHeatmap = ({
  students, topics, onPick,
}: { students: Student[]; topics: Topic[]; onPick?: (s: Student) => void }) => {
  const cellColor = (v: number): [string, string] => {
    if (v >= 0.85) return ['var(--pbs-mint)',   'var(--pbs-mint-ink)'];
    if (v >= 0.70) return ['var(--pbs-butter)', 'var(--pbs-butter-ink)'];
    if (v >= 0.55) return ['var(--pbs-coral)',  'var(--pbs-coral-ink)'];
    return ['#ff9280', '#7a2a18'];
  };
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'separate', borderSpacing: 4, width: '100%', minWidth: 500 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '4px 8px' }}></th>
            {topics.map((t) => (
              <th key={t.id} style={{ padding: 4, fontSize: 11, color: 'var(--pbs-ink-soft)', fontWeight: 600, textAlign: 'center' }}>{t.name}</th>
            ))}
            <th style={{ padding: 4, fontSize: 11, color: 'var(--pbs-ink-soft)', fontWeight: 600 }}>Avg</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id}>
              <td style={{ padding: '4px 8px', fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap' }}>
                <button
                  type="button"
                  onClick={() => onPick && onPick(s)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 0, background: 'none', border: 0, cursor: 'pointer', color: 'inherit', font: 'inherit' }}
                >
                  <CardboardHead outfit={s.avatar} px={22}/> {s.name}
                </button>
              </td>
              {topics.map((t) => {
                const v = s.mastery[t.id] || 0;
                const [bg, fg] = cellColor(v);
                return (
                  <td key={t.id} style={{ padding: 0 }}>
                    <div title={`${s.name} — ${t.name}: ${Math.round(v * 100)}%`} style={{
                      background: bg, color: fg,
                      border: `1.5px solid ${fg}`,
                      borderRadius: 8, padding: '10px 0',
                      textAlign: 'center', fontSize: 12, fontWeight: 700,
                    }}>{Math.round(v * 100)}</div>
                  </td>
                );
              })}
              <td>
                <div style={{ padding: '10px 12px', background: 'var(--pbs-paper)', border: '1.5px solid var(--pbs-line-2)', borderRadius: 8, textAlign: 'center', fontSize: 12, fontWeight: 700 }}>{s.avg}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Horizontal progress bars for topic mastery.
export const TopicBars = ({ topics }: { topics: Topic[] }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    {topics.map((t) => (
      <div key={t.id}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
          <span style={{ fontWeight: 700 }}>{t.name}</span>
          <span className="pbs-mono" style={{ color: 'var(--pbs-ink-muted)' }}>{Math.round(t.mastery * 100)}%</span>
        </div>
        <div style={{ height: 10, borderRadius: 999, background: 'var(--pbs-cream-2)', border: '1.5px solid var(--pbs-line-2)', overflow: 'hidden' }}>
          <div style={{
            width: `${t.mastery * 100}%`, height: '100%',
            background: `var(--pbs-${t.color})`,
            borderRight: `1.5px solid var(--pbs-${t.color}-ink)`,
          }}/>
        </div>
      </div>
    ))}
  </div>
);
