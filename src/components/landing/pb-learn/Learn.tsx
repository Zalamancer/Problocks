'use client';

import React from 'react';
import { Block, Icon, Section } from '../pb-site/primitives';

type StepTone = 'butter' | 'mint' | 'coral';

export const Learn = () => {
  const steps: Array<{ n: string; tone: StepTone; icon: 'wand' | 'gamepad' | 'users'; title: string; body: string; extra: React.ReactNode }> = [
    {
      n: '01', tone: 'butter', icon: 'wand',
      title: 'Describe a world',
      body: 'You (or your teacher) type a sentence about what you want to learn. ProBlocks turns it into a playable world.',
      extra: (
        <div style={{ padding: '10px 12px', background: 'rgba(0,0,0,0.06)', borderRadius: 12, fontSize: 13, fontStyle: 'italic' }}>
          &quot;a castle where you unlock doors by solving equations&quot;
        </div>
      ),
    },
    {
      n: '02', tone: 'mint', icon: 'gamepad',
      title: 'Play & get stuck',
      body: 'You play the game. When you hit a tricky bit, Claude shows up as a character in the world — not a popup.',
      extra: (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 8, background: 'var(--pbs-grape)', border: '1.5px solid var(--pbs-grape-ink)', color: 'var(--pbs-grape-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="sparkle" size={13} stroke={2.2}/>
          </div>
          <div style={{ padding: '8px 10px', borderRadius: 12, background: 'rgba(0,0,0,0.06)', fontSize: 12.5, lineHeight: 1.5 }}>
            Try cutting the pie in half first — then see how many halves fit.
          </div>
        </div>
      ),
    },
    {
      n: '03', tone: 'coral', icon: 'users',
      title: 'Chat, remix, level up',
      body: 'Message classmates, trade levels, and rebuild anything. Every remix teaches you a bit more about how it works.',
      extra: (
        <div style={{ display: 'flex', gap: 8 }}>
          {['Ava','Kai','Juno','+4'].map((n, i) => (
            <div key={n} style={{
              width: 28, height: 28, borderRadius: 999,
              background: ['var(--pbs-butter)','var(--pbs-mint)','var(--pbs-pink)','var(--pbs-cream-2)'][i],
              border: '1.5px solid var(--pbs-ink)',
              color: 'var(--pbs-ink)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700,
              marginLeft: i === 0 ? 0 : -10,
            }}>{n.length > 2 ? n : n[0]}</div>
          ))}
          <div style={{ marginLeft: 8, fontSize: 12, color: 'rgba(0,0,0,0.7)', alignSelf: 'center' }}>3 classmates online</div>
        </div>
      ),
    },
  ];

  return (
    <Section
      id="learn"
      label="How it works"
      kicker="mint"
      title={<>Learning that <span className="pbs-serif">plays you back.</span></>}
      sub="Most ed-tech is a worksheet with skin. ProBlocks is the opposite: you build the world, then wander around inside it."
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {steps.map((s) => (
          <Block key={s.n} tone={s.tone} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="pbs-serif" style={{ fontSize: 42, lineHeight: 1, fontStyle: 'italic' }}>{s.n}</div>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: 'rgba(0,0,0,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name={s.icon} size={18} stroke={2.2}/>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>{s.title}</div>
              <p style={{ margin: '6px 0 0', fontSize: 14.5, lineHeight: 1.5, opacity: 0.82 }}>{s.body}</p>
            </div>
            <div style={{ marginTop: 'auto', paddingTop: 6 }}>{s.extra}</div>
          </Block>
        ))}
      </div>
    </Section>
  );
};
