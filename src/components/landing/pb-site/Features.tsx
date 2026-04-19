'use client';

import React from 'react';
import { Block, Icon, Pill, Section } from './primitives';

export const Features = () => {
  return (
    <Section
      id="features"
      label="What's inside"
      kicker="grape"
      title={<>A full studio, <span className="pbs-serif">no glue code.</span></>}
      sub="Every tool a student needs to go from idea to playable game, stitched together under one roof."
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 18 }} className="pbs-features-grid">

        <Block tone="ink" style={{ gridColumn: 'span 7', padding: 28, position: 'relative', overflow: 'hidden', minHeight: 340 }}>
          <Pill tone="butter" icon="bolt" style={{ marginBottom: 18 }}>Visual studio</Pill>
          <h3 style={{ margin: 0, fontSize: 30, letterSpacing: '-0.02em', fontWeight: 700 }}>
            Build with blocks, not code.
          </h3>
          <p style={{ margin: '10px 0 0', color: 'var(--pbs-line-2)', fontSize: 15, maxWidth: 360, lineHeight: 1.5 }}>
            Drag connectors onto a canvas. Wire up a prompt, an art generator, a music model, and a game. Watch Claude orchestrate the rest.
          </p>

          <div style={{ position: 'absolute', right: -20, bottom: -10, width: 420, height: 260 }}>
            <svg viewBox="0 0 420 260" width="100%" height="100%">
              <defs>
                <pattern id="pbs-dots" width="16" height="16" patternUnits="userSpaceOnUse">
                  <circle cx="1" cy="1" r="1" fill="#3f3a30"/>
                </pattern>
              </defs>
              <rect width="420" height="260" fill="url(#pbs-dots)"/>
              <path d="M60 70 C 110 70, 110 140, 170 140" stroke="#ffd84d" strokeWidth="2.5" fill="none"/>
              <path d="M60 160 C 110 160, 110 140, 170 140" stroke="#ffb4a2" strokeWidth="2.5" fill="none"/>
              <path d="M260 140 C 300 140, 300 80, 340 80" stroke="#b6f0c6" strokeWidth="2.5" fill="none"/>
              <path d="M260 140 C 300 140, 300 180, 340 180" stroke="#b9d9ff" strokeWidth="2.5" fill="none"/>

              {([
                [20, 50, 80, 40, '#ffd84d', '#6b4f00', 'Prompt'],
                [20, 140, 80, 40, '#ffb4a2', '#7a2a18', 'Genre'],
                [170, 120, 90, 40, '#dcc7ff', '#4d2a8a', 'Claude'],
                [330, 60, 80, 40, '#b6f0c6', '#0f5b2e', 'Art'],
                [330, 160, 80, 40, '#b9d9ff', '#1b4a8a', 'Code'],
              ] as const).map(([x, y, w, h, bg, br, label], i) => (
                <g key={i}>
                  <rect x={x} y={y} width={w} height={h} rx="10" fill={bg} stroke={br} strokeWidth="1.5"/>
                  <text x={x + w/2} y={y + h/2 + 4} textAnchor="middle" fontFamily="Bricolage Grotesque, sans-serif" fontSize="13" fontWeight="700" fill={br}>{label}</text>
                </g>
              ))}
            </svg>
          </div>
        </Block>

        <Block tone="grape" style={{ gridColumn: 'span 5', padding: 28, minHeight: 160 }}>
          <Pill tone="paper" icon="sparkle" style={{ marginBottom: 14 }}>Claude tutor</Pill>
          <h3 style={{ margin: 0, fontSize: 24, letterSpacing: '-0.02em', fontWeight: 700 }}>
            Every student gets a patient co-pilot.
          </h3>
          <p style={{ margin: '8px 0 14px', fontSize: 14, lineHeight: 1.5, opacity: 0.82 }}>
            Stuck on physics? Want a new level? Ask in plain English. Claude edits and explains.
          </p>
          <div style={{
            padding: 12, borderRadius: 12,
            background: 'rgba(255,250,240,0.6)', border: '1.5px solid var(--pbs-line-2)',
            fontSize: 13,
          }}>
            <span className="pbs-mono" style={{ fontSize: 10.5, opacity: 0.7, display: 'block', marginBottom: 4 }}>Claude:</span>
            I&apos;ll make the jump feel floatier by lowering gravity from 9.8 to 6.2. Want me to add a double-jump too?
          </div>
        </Block>

        {([
          { tone: 'mint'  as const, icon: 'code'    as const, title: 'Real source code',   body: 'Games export as clean JavaScript. Students read, tweak and learn actual engineering.' },
          { tone: 'coral' as const, icon: 'gamepad' as const, title: '1-click playtest',   body: 'Everything runs in-browser. No builds, no Unity installs, no plugin dramas.' },
          { tone: 'sky'   as const, icon: 'users'   as const, title: 'Classroom rooms',    body: 'Invite your whole class. Comment, remix, review, grade — all in one place.' },
        ]).map((f) => (
          <Block key={f.title} tone={f.tone} style={{ gridColumn: 'span 4', padding: 24 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'rgba(0,0,0,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 14,
            }}>
              <Icon name={f.icon} size={18} stroke={2.2}/>
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.015em' }}>{f.title}</div>
            <p style={{ margin: '6px 0 0', fontSize: 13.5, lineHeight: 1.55, opacity: 0.82 }}>{f.body}</p>
          </Block>
        ))}

        <Block tone="butter" style={{ gridColumn: 'span 5', padding: 24 }}>
          <Pill tone="paper" icon="lock" style={{ marginBottom: 12 }}>Safe by default</Pill>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>COPPA-friendly. Teacher-controlled.</div>
          <p style={{ margin: '6px 0 0', fontSize: 13.5, lineHeight: 1.55, opacity: 0.82 }}>
            Content filters, age-gated generators, and moderator review on every marketplace publish. Your school stays in charge.
          </p>
        </Block>

        <Block tone="pink" style={{ gridColumn: 'span 7', padding: 24, position: 'relative', overflow: 'hidden' }}>
          <Pill tone="paper" icon="coin" style={{ marginBottom: 12 }}>Revenue share</Pill>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>Every play rewards the class behind it.</div>
          <p style={{ margin: '6px 0 0', maxWidth: 380, fontSize: 13.5, lineHeight: 1.55, opacity: 0.82 }}>
            Games are published to a shared marketplace. 70% of revenue goes back to the class, so building is a class project, not a chore.
          </p>

          <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
            {([
              ['$1,284', 'this month'],
              ['38,402', 'plays'],
              ['217',    'classes earning'],
            ] as const).map(([n, l]) => (
              <div key={l} style={{
                padding: '10px 14px', borderRadius: 12,
                background: 'rgba(255,250,240,0.7)', border: '1.5px solid var(--pbs-pink-ink)',
              }}>
                <div className="pbs-serif" style={{ fontSize: 24, lineHeight: 1, fontStyle: 'italic' }}>{n}</div>
                <div className="pbs-mono" style={{ fontSize: 10.5, color: 'var(--pbs-pink-ink)', opacity: 0.7, marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </Block>

      </div>
    </Section>
  );
};
