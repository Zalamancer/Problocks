// Step 4: pick a starter unit (or "blank canvas").
// Ported from Claude Design bundle (pb_classroom_setup/steps_late.jsx).
'use client';

import React from 'react';
import { Icon } from '@/components/landing/pb-site/primitives';
import { StepCard, StepHeader } from './form';
import type { SetupData, UnitKey } from './types';
import type { Tone } from './form';

export type StarterUnit = {
  id: UnitKey;
  tone: Tone;
  icon: React.ComponentProps<typeof Icon>['name'];
  title: string;
  weeks: string;
  subject: string;
  grade: string;
  blurb: string;
  bullets: string[];
};

export const STARTER_UNITS: StarterUnit[] = [
  {
    id: 'frac', tone: 'butter', icon: 'coin',
    title: 'Fraction Friends', weeks: '4 weeks',
    subject: 'Math', grade: '3rd–5th',
    blurb: 'Students build a bakery game where every order is a fraction puzzle. Ends in a class recipe book.',
    bullets: ['Identify ½, ⅓, ¼', 'Add unlike fractions', 'Compare with number lines'],
  },
  {
    id: 'story', tone: 'coral', icon: 'book',
    title: 'Choose-Your-Own Story', weeks: '3 weeks',
    subject: 'Reading & writing', grade: '4th–7th',
    blurb: "A branching narrative game. Kids write, peer-review, then playtest each other's stories.",
    bullets: ['Narrative arc', 'Dialogue & voice', 'Peer feedback'],
  },
  {
    id: 'eco', tone: 'mint', icon: 'spark',
    title: 'Tiny Ecosystem', weeks: '5 weeks',
    subject: 'Science', grade: '5th–8th',
    blurb: 'A sim where kids tune rainfall, predators, and plants to keep a valley alive for 100 in-game years.',
    bullets: ['Food webs', 'Feedback loops', 'Hypothesis → test'],
  },
  {
    id: 'scratch', tone: 'sky', icon: 'cube',
    title: 'Blank canvas', weeks: 'No plan',
    subject: 'Anything', grade: 'Any',
    blurb: 'Skip the unit. Open an empty room, invent your own lessons from scratch.',
    bullets: ['Full freedom', 'Import anytime', 'AI lesson authoring'],
  },
];

export const StepUnit = ({
  data, set,
}: {
  data: SetupData;
  set: <K extends keyof SetupData>(k: K, v: SetupData[K]) => void;
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
    <StepHeader
      index={3}
      total={5}
      step={{
        title: <>Drop in a <span className="pbs-serif">starter unit.</span></>,
        sub: 'Every unit is a handful of playable lessons, rubrics, and a culminating project. Pick one to import — you can edit everything later.',
      }}
    />

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      {STARTER_UNITS.map((u) => {
        const sel = data.unit === u.id;
        return (
          <button
            key={u.id}
            type="button"
            onClick={() => set('unit', u.id)}
            style={{
              textAlign: 'left',
              padding: 18,
              background: sel ? `var(--pbs-${u.tone})` : 'var(--pbs-paper)',
              color: sel ? `var(--pbs-${u.tone}-ink)` : 'var(--pbs-ink)',
              border: `1.5px solid ${sel ? `var(--pbs-${u.tone}-ink)` : 'var(--pbs-line)'}`,
              boxShadow: sel
                ? `0 3px 0 var(--pbs-${u.tone}-ink), 0 14px 30px -18px rgba(60,40,0,0.25)`
                : '0 3px 0 var(--pbs-line-2)',
              borderRadius: 18,
              cursor: 'pointer',
              transition: 'all 140ms',
              display: 'flex', flexDirection: 'column', gap: 10,
              position: 'relative',
              fontFamily: 'inherit',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: sel ? 'rgba(255,255,255,0.45)' : `var(--pbs-${u.tone})`,
                color: `var(--pbs-${u.tone}-ink)`,
                border: `1.5px solid var(--pbs-${u.tone}-ink)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name={u.icon} size={18} stroke={2.2}/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.015em' }}>{u.title}</div>
                <div className="pbs-mono" style={{ fontSize: 11, color: sel ? 'inherit' : 'var(--pbs-ink-muted)', opacity: sel ? 0.75 : 1 }}>
                  {u.subject} · {u.grade} · {u.weeks}
                </div>
              </div>
              {sel && (
                <div style={{
                  width: 26, height: 26, borderRadius: 999,
                  background: `var(--pbs-${u.tone}-ink)`, color: `var(--pbs-${u.tone})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name="check" size={14} stroke={3}/>
                </div>
              )}
            </div>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: sel ? 'inherit' : 'var(--pbs-ink-soft)' }}>
              {u.blurb}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
              {u.bullets.map((b) => (
                <span key={b} className="pbs-mono" style={{
                  padding: '3px 9px', fontSize: 10.5,
                  background: sel ? 'rgba(255,255,255,0.45)' : 'var(--pbs-cream-2)',
                  border: `1px solid ${sel ? `var(--pbs-${u.tone}-ink)` : 'var(--pbs-line-2)'}`,
                  borderRadius: 999,
                  letterSpacing: '0.02em',
                }}>{b}</span>
              ))}
            </div>
          </button>
        );
      })}
    </div>

    <div style={{
      padding: '14px 18px',
      background: 'var(--pbs-cream-2)',
      border: '1.5px dashed var(--pbs-line-2)',
      borderRadius: 14,
      display: 'flex', alignItems: 'center', gap: 12,
      fontSize: 13, color: 'var(--pbs-ink-soft)',
    }}>
      <Icon name="sparkle" size={16} stroke={2.2} style={{ color: 'var(--pbs-ink)' }}/>
      <span>Or <a href="#describe" style={{ color: 'var(--pbs-ink)', fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: 3 }}>describe a lesson in plain English</a> and we&apos;ll draft a custom unit in ~30 seconds.</span>
    </div>
  </div>
);
