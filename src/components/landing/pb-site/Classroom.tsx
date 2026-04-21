'use client';

import React from 'react';
import { Block, Chunky, Icon, Pill, Section } from './primitives';

type IconName = 'wand' | 'code' | 'image' | 'gamepad' | 'sparkle' | 'book' | 'bolt' | 'heart' | 'compass' | 'users' | 'lock';

export const Classroom = () => {
  const students: Array<[string, 'butter'|'mint'|'pink'|'coral'|'grape'|'sky', string, IconName, 'gen'|'code'|'done'|'art']> = [
    ['Ava P.',  'butter', 'Donut Quest',  'wand',    'gen'],
    ['Kai T.',  'mint',   'Moss Frog',    'code',    'code'],
    ['Mira L.', 'pink',   'Pink Planet',  'image',   'art'],
    ['Dev S.',  'coral',  'Pizza Race',   'gamepad', 'done'],
    ['Juno R.', 'grape',  'Crystal Keep', 'sparkle', 'gen'],
    ['Theo M.', 'sky',    'Sky Library',  'book',    'code'],
    ['Noor K.', 'butter', 'Lemon Drift',  'bolt',    'done'],
    ['Emi W.',  'mint',   'Tea Garden',   'heart',   'gen'],
  ];

  return (
    <Section
      id="classrooms"
      label="For classrooms"
      kicker="sky"
      title={<>Built for real lessons, <span className="pbs-serif">not kiosk demos.</span></>}
      sub="Playdemy maps to CS frameworks, tracks per-student progress, and handles permissions so you can actually use it on Monday morning."
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)', gap: 24, alignItems: 'start' }} className="pbs-classroom-grid">

        <Block tone="paper" style={{ padding: 16, overflow: 'hidden' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '6px 8px 14px', borderBottom: '1px dashed var(--pbs-line-2)',
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'var(--pbs-sky)', color: 'var(--pbs-sky-ink)',
              border: '1.5px solid var(--pbs-sky-ink)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><Icon name="book" size={14} stroke={2.2}/></div>
            <div style={{ lineHeight: 1.15 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Grade 7 · Period 4</div>
              <div className="pbs-mono" style={{ fontSize: 11, color: 'var(--pbs-ink-muted)' }}>Mrs. Vasquez · 28 students</div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
              <Pill tone="mint">● Live</Pill>
            </div>
          </div>

          <div style={{ padding: '14px 4px 4px' }}>
            <div className="pbs-mono" style={{ fontSize: 10.5, color: 'var(--pbs-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, padding: '0 6px' }}>Student work — this week</div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
              gap: 8,
            }}>
              {students.map(([name, tone, title, icon, status], i) => (
                <div key={i} style={{
                  padding: 10, borderRadius: 12,
                  background: 'var(--pbs-cream-2)', border: '1.5px solid var(--pbs-line)',
                  display: 'flex', flexDirection: 'column', gap: 6,
                }}>
                  <div style={{
                    height: 46, borderRadius: 8,
                    background: `var(--pbs-${tone})`, border: `1.5px solid var(--pbs-${tone}-ink)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: `var(--pbs-${tone}-ink)`,
                  }}>
                    <Icon name={icon} size={18} stroke={2.2}/>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
                    <span style={{
                      width: 6, height: 6, borderRadius: 999,
                      background: status === 'done' ? '#2aaa5a' : status === 'code' ? '#ffb000' : '#b97cff',
                    }}/>
                  </div>
                  <div className="pbs-mono" style={{ fontSize: 9.5, color: 'var(--pbs-ink-muted)' }}>{name}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            display: 'flex', gap: 10, padding: '14px 4px 4px',
            borderTop: '1px solid var(--pbs-line)', marginTop: 10,
          }}>
            {([
              ['24/28', 'shipped'],
              ['12h',   'avg / game'],
              ['4.7★',  'playtests'],
            ] as const).map(([n, l]) => (
              <div key={l} style={{ flex: 1, padding: '8px 12px', background: 'var(--pbs-cream-2)', borderRadius: 10, border: '1.5px solid var(--pbs-line)' }}>
                <div className="pbs-serif" style={{ fontSize: 22, lineHeight: 1, fontStyle: 'italic' }}>{n}</div>
                <div className="pbs-mono" style={{ fontSize: 10.5, color: 'var(--pbs-ink-muted)', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </Block>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 8 }}>
          {([
            { tone: 'butter' as const, icon: 'compass' as const, title: 'Standards-aligned',        body: 'Lessons mapped to CSTA, ISTE and UK Computing. Each game produces a rubric-ready artifact.' },
            { tone: 'mint'   as const, icon: 'users'   as const, title: 'Class rosters + SSO',      body: 'Google Classroom, Clever and MS Teams sync. No per-student signups.' },
            { tone: 'coral'  as const, icon: 'heart'   as const, title: 'Kind feedback loops',      body: 'Structured peer review built in. Students learn to give feedback, not just take it.' },
            { tone: 'grape'  as const, icon: 'lock'    as const, title: 'Teacher-approved publishing', body: 'Nothing hits the marketplace without you reviewing it first. You hold the keys.' },
          ]).map((f) => (
            <Block key={f.title} tone="paper" style={{ padding: 18, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{
                flexShrink: 0,
                width: 42, height: 42, borderRadius: 12,
                background: `var(--pbs-${f.tone})`, color: `var(--pbs-${f.tone}-ink)`,
                border: `1.5px solid var(--pbs-${f.tone}-ink)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name={f.icon} size={18} stroke={2.2}/>
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.015em' }}>{f.title}</div>
                <p style={{ margin: '4px 0 0', fontSize: 13.5, lineHeight: 1.5, color: 'var(--pbs-ink-soft)' }}>{f.body}</p>
              </div>
            </Block>
          ))}

          <Chunky tone="butter" trailing="arrow-right" style={{ alignSelf: 'flex-start', marginTop: 4 }}>
            Book a classroom demo
          </Chunky>
        </div>

      </div>
    </Section>
  );
};
