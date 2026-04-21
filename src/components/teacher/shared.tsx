// Shared styles and small presentational atoms for the Teacher app.
// Extracted from pb_teacher/{overview,assignments,student_detail}.jsx so
// Overview / Assignments / StudentDetail all read from the same source.
'use client';

import React from 'react';
import { Block, Icon } from '@/components/landing/pb-site/primitives';

export const kickerSty: React.CSSProperties = {
  fontSize: 11,
  color: 'var(--pbs-ink-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
};

export const backBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '7px 14px', borderRadius: 999,
  background: 'var(--pbs-paper)', border: '1.5px solid var(--pbs-line-2)',
  fontSize: 12, fontWeight: 600, color: 'var(--pbs-ink-soft)',
  cursor: 'pointer',
};

export const teacherWrap: React.CSSProperties = {
  maxWidth: 1320, margin: '0 auto', padding: '0 28px',
};

export const MiniKpi = ({ l, v }: { l: string; v: React.ReactNode }) => (
  <div style={{
    padding: 10, borderRadius: 10,
    background: 'var(--pbs-paper)', border: '1.5px solid currentColor',
    textAlign: 'center',
  }}>
    <div style={{ fontSize: 10.5, opacity: 0.75, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{l}</div>
    <div style={{ fontSize: 20, fontWeight: 700, marginTop: 2 }}>{v}</div>
  </div>
);

export const LegendDot = ({
  c, l, raw,
}: { c: string; l: string; raw?: boolean }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
    <span style={{
      width: 12, height: 12, borderRadius: 4,
      background: raw ? c : `var(--pbs-${c})`,
      border: '1.5px solid var(--pbs-ink)',
    }}/>
    <span style={{ color: 'var(--pbs-ink-muted)' }}>{l}</span>
  </span>
);

export type KpiTone = 'butter' | 'mint' | 'coral' | 'sky' | 'grape' | 'pink';

// Stamped on top of cards whose underlying numbers are hardcoded demo values
// (engagement bars, trickiest-questions list, topic mastery, etc). In real
// mode the teacher needs an unambiguous signal that "no, your class really
// didn't score 74% on probability — this block hasn't started reporting yet".
// Parent block must be position: 'relative'.
export const DemoBadge = ({ label = 'DEMO DATA' }: { label?: string }) => (
  <span
    className="pbs-mono"
    style={{
      position: 'absolute', top: 10, right: 10, zIndex: 2,
      padding: '3px 8px', borderRadius: 999,
      background: 'var(--pbs-coral)', color: 'var(--pbs-coral-ink)',
      border: '1.5px solid var(--pbs-coral-ink)',
      boxShadow: '0 2px 0 var(--pbs-coral-ink)',
      fontSize: 9.5, fontWeight: 700, letterSpacing: '0.1em',
      pointerEvents: 'none',
    }}
  >{label}</span>
);

export const Kpi = ({
  tone, icon, label, value, sub, demo,
}: {
  tone: KpiTone;
  icon: React.ComponentProps<typeof Icon>['name'];
  label: string;
  value: React.ReactNode;
  sub: string;
  demo?: boolean;
}) => (
  <Block tone={tone} style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 6, position: 'relative' }}>
    {demo && <DemoBadge label="DEMO"/>}
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: demo ? 0.55 : 1 }}>
      <Icon name={icon} size={15} stroke={2.2}/>
      <div style={{ fontSize: 11.5, fontWeight: 600, opacity: 0.85 }}>{label}</div>
    </div>
    <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1, opacity: demo ? 0.55 : 1 }}>{value}</div>
    <div style={{ fontSize: 11, opacity: demo ? 0.5 : 0.75 }}>{sub}</div>
  </Block>
);
