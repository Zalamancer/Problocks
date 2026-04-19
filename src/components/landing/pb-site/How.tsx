'use client';

import React from 'react';
import { Block, Icon, Section } from './primitives';

export const How = () => {
  const steps = [
    {
      n: '01', tone: 'butter' as const, icon: 'wand' as const,
      title: 'Describe',
      body: 'Tell ProBlocks what you want to make. A ninja cat climbing a cake? Done.',
      extra: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className="pbs-mono" style={{ fontSize: 11, opacity: 0.7 }}>you</div>
          <div style={{
            padding: '10px 12px', background: 'rgba(0,0,0,0.06)', borderRadius: 12,
            fontSize: 13.5, fontStyle: 'italic',
          }}>&ldquo;a ninja cat climbing a giant cake to steal the cherry&rdquo;</div>
        </div>
      ),
    },
    {
      n: '02', tone: 'mint' as const, icon: 'sparkle' as const,
      title: 'Generate',
      body: 'Claude orchestrates art, code, music and voice — all stitched into a playable game.',
      extra: (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
          {([['image', 'art'], ['code', 'code'], ['music', 'song'], ['mic', 'voice']] as const).map(([i, l]) => (
            <div key={l} style={{
              padding: '10px 0', borderRadius: 10,
              background: 'rgba(0,0,0,0.06)', textAlign: 'center',
              fontSize: 10.5, fontWeight: 600,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            }}>
              <Icon name={i} size={18} stroke={2.2}/>
              {l}
            </div>
          ))}
        </div>
      ),
    },
    {
      n: '03', tone: 'coral' as const, icon: 'store' as const,
      title: 'Play & publish',
      body: 'Playtest in the browser, then publish to the Marketplace. Your class earns from every play.',
      extra: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            flex: 1, padding: '10px 12px', borderRadius: 12,
            background: 'rgba(0,0,0,0.06)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Icon name="play" size={14}/>
            <span className="pbs-mono" style={{ fontSize: 11 }}>1,284 plays</span>
          </div>
          <div style={{
            padding: '10px 12px', borderRadius: 12,
            background: 'rgba(0,0,0,0.1)',
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 12, fontWeight: 700,
          }}>
            <Icon name="coin" size={14}/> $42
          </div>
        </div>
      ),
    },
  ];

  return (
    <Section
      id="how"
      label="How it works"
      kicker="coral"
      title={<>Three steps. <span className="pbs-serif">Zero</span> setup.</>}
      sub="No installs, no configs, no scripting language to learn. If you can describe it, you can build it."
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
              <p style={{ margin: '6px 0 0', fontSize: 14.5, lineHeight: 1.5, opacity: 0.8 }}>{s.body}</p>
            </div>
            <div style={{ marginTop: 'auto', paddingTop: 6 }}>{s.extra}</div>
          </Block>
        ))}
      </div>
    </Section>
  );
};
