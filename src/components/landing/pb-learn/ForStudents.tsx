'use client';

import React from 'react';
import { Block, Icon, Pill, Section } from '../pb-site/primitives';

type Tone = 'butter' | 'mint' | 'coral' | 'pink' | 'grape';

const QUESTS: Array<{ label: string; xp: number; done: boolean; tone: Tone }> = [
  { label: 'Slice 20 pies into thirds', xp: 60, done: true, tone: 'mint' },
  { label: 'Design a fraction trap level', xp: 120, done: true, tone: 'butter' },
  { label: "Remix a friend's pizza shop", xp: 80, done: false, tone: 'pink' },
  { label: 'Explain ½ + ¼ to the cat NPC', xp: 140, done: false, tone: 'coral' },
];

const SMALL_CARDS: Array<{ tone: Tone; icon: 'users' | 'sparkle' | 'heart' | 'star'; title: string; body: string }> = [
  { tone: 'butter', icon: 'users', title: 'Play with your class', body: 'Your friends are already here. Join their games, co-build worlds, and race through quests together.' },
  { tone: 'coral', icon: 'sparkle', title: 'Claude is your study buddy', body: 'Stuck? Ask in plain words. Claude explains — and plays the level with you to show how.' },
  { tone: 'pink', icon: 'heart', title: 'No one sees your mistakes', body: 'Wrong answers just mean the level resets. No red Xs, no grades screaming at you.' },
  { tone: 'grape', icon: 'star', title: 'Publish to the world', body: 'Great games (with teacher approval) can land on the public Marketplace for everyone to play.' },
];

export const ForStudents = () => (
  <Section
    id="students"
    label="For students"
    kicker="mint"
    title={<>Your brain on <span className="pbs-serif">pizza.</span></>}
    sub="You don't learn fractions by circling B. You learn them by slicing a pepperoni into thirds while a cat yells at you."
  >
    <div className="pbs-students-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 18 }}>
      <Block tone="ink" style={{ gridColumn: 'span 7', padding: 26, position: 'relative', overflow: 'hidden', minHeight: 320 }}>
        <Pill tone="butter" icon="bolt" style={{ marginBottom: 16 }}>Quests, not homework</Pill>
        <h3 style={{ margin: 0, fontSize: 28, letterSpacing: '-0.02em', fontWeight: 700 }}>
          Every lesson is a level.
        </h3>
        <p style={{ margin: '8px 0 18px', color: 'var(--pbs-line-2)', fontSize: 14.5, maxWidth: 360, lineHeight: 1.5 }}>
          Beat levels, earn badges, unlock new world-builder tools. The harder the math, the cooler the stuff you can build next.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 400 }}>
          {QUESTS.map((q, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 12,
              background: 'rgba(255,250,240,0.08)',
              border: '1.5px solid rgba(255,250,240,0.12)',
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: 6,
                background: q.done ? `var(--pbs-${q.tone})` : 'transparent',
                border: `1.5px solid var(--pbs-${q.tone}-ink)`,
                color: q.done ? `var(--pbs-${q.tone}-ink)` : 'var(--pbs-line-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {q.done && <Icon name="check" size={12} stroke={3}/>}
              </div>
              <div style={{ fontSize: 13.5, color: q.done ? 'var(--pbs-line-2)' : 'var(--pbs-cream)', textDecoration: q.done ? 'line-through' : 'none', flex: 1 }}>{q.label}</div>
              <span className="pbs-mono" style={{ fontSize: 11, color: 'var(--pbs-butter)' }}>+{q.xp} xp</span>
            </div>
          ))}
        </div>

        <div style={{ position: 'absolute', right: 24, top: 24, width: 160 }}>
          <div className="pbs-mono" style={{ fontSize: 10, color: 'var(--pbs-line-2)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Level 7 · Baker</div>
          <div style={{ height: 10, borderRadius: 999, background: 'rgba(255,250,240,0.12)', overflow: 'hidden', border: '1.5px solid rgba(255,250,240,0.2)' }}>
            <div style={{ width: '64%', height: '100%', background: 'var(--pbs-butter)' }}/>
          </div>
          <div style={{ marginTop: 6, fontSize: 11, color: 'var(--pbs-line-2)' }}><span className="pbs-serif" style={{ color: 'var(--pbs-butter)', fontSize: 14 }}>640</span> / 1000 to level 8</div>
        </div>
      </Block>

      <Block tone="mint" style={{ gridColumn: 'span 5', padding: 22 }}>
        <Pill tone="paper" icon="smile" style={{ marginBottom: 12 }}>Make it yours</Pill>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>Your character, your rules.</div>
        <p style={{ margin: '6px 0 14px', fontSize: 13.5, lineHeight: 1.5, opacity: 0.82 }}>
          Design your avatar, your home base, and your own quest chain. Everything you make follows you across every game.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['butter','coral','sky','grape','pink'] as const).map((c, i) => (
            <div key={c} style={{
              width: 46, height: 58, borderRadius: 10,
              background: `var(--pbs-${c})`, border: `1.5px solid var(--pbs-${c}-ink)`,
              boxShadow: `0 3px 0 var(--pbs-${c}-ink)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transform: `rotate(${(i-2)*4}deg)`,
            }}>
              <div style={{ width: 22, height: 22, borderRadius: 5, background: 'var(--pbs-paper)', border: '1.5px solid var(--pbs-ink)' }}/>
            </div>
          ))}
        </div>
      </Block>

      {SMALL_CARDS.map((f) => (
        <Block key={f.title} tone={f.tone} style={{ gridColumn: 'span 3', padding: 18, minHeight: 180 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'rgba(0,0,0,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 12,
          }}>
            <Icon name={f.icon} size={16} stroke={2.2}/>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.015em' }}>{f.title}</div>
          <p style={{ margin: '4px 0 0', fontSize: 12.5, lineHeight: 1.5, opacity: 0.82 }}>{f.body}</p>
        </Block>
      ))}
    </div>
  </Section>
);
