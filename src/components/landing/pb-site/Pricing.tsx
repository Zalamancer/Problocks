'use client';

import React from 'react';
import { Block, Chunky, Icon, Section } from './primitives';

type Tone = 'paper' | 'butter' | 'ink';
type ChunkyTone = 'ink' | 'butter' | 'ghost';

export const Pricing = ({ onStart }: { onStart?: () => void }) => {
  const tiers: Array<{
    tone: Tone;
    name: string;
    price: string;
    per?: string;
    tagline: string;
    features: string[];
    cta: string;
    ctaTone: ChunkyTone;
    featured?: boolean;
  }> = [
    {
      tone: 'paper',
      name: 'Explorer',
      price: 'Free',
      tagline: 'For curious students & solo makers.',
      features: ['3 games per month', 'Basic art + code generators', 'Public marketplace listing', 'Community support'],
      cta: 'Start free',
      ctaTone: 'ghost',
    },
    {
      tone: 'butter',
      featured: true,
      name: 'Classroom',
      price: '$9',
      per: '/ student / month',
      tagline: 'Everything a teacher needs to run a class.',
      features: ['Unlimited games', 'All generators (PixelLab, Meshy, Suno, ElevenLabs)', 'Roster sync + SSO', 'Teacher dashboard + rubrics', '70% marketplace revenue share'],
      cta: 'Start classroom plan',
      ctaTone: 'ink',
    },
    {
      tone: 'ink',
      name: 'District',
      price: 'Custom',
      tagline: 'For schools & districts rolling out at scale.',
      features: ['Everything in Classroom', 'Admin console + audit logs', 'PD workshops & curriculum', 'Custom content policies', 'Dedicated success manager'],
      cta: 'Talk to us',
      ctaTone: 'butter',
    },
  ];

  return (
    <Section
      id="pricing"
      label="Pricing"
      kicker="butter"
      title={<>Simple plans, <span className="pbs-serif">free to start.</span></>}
      sub="Every game a classroom publishes earns it back into the tools. Most classes cover their own subscription in the first semester."
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18, alignItems: 'stretch' }}>
        {tiers.map((t) => (
          <Block key={t.name} tone={t.tone} style={{
            padding: 28,
            position: 'relative',
            display: 'flex', flexDirection: 'column', gap: 18,
            transform: t.featured ? 'translateY(-10px)' : undefined,
          }}>
            {t.featured && (
              <div style={{
                position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                padding: '5px 14px', borderRadius: 999,
                background: 'var(--pbs-ink)', color: 'var(--pbs-butter)',
                fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                boxShadow: '0 3px 0 rgba(0,0,0,0.25)',
                zIndex: 2,
              }}>Most popular</div>
            )}
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, opacity: 0.7, letterSpacing: '0.02em' }}>{t.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 8 }}>
                <span style={{ fontSize: 46, lineHeight: 1, fontWeight: 700, letterSpacing: '-0.03em' }}>{t.price}</span>
                {t.per && <span style={{ fontSize: 13.5, opacity: 0.7 }}>{t.per}</span>}
              </div>
              <p style={{ margin: '10px 0 0', fontSize: 14, opacity: 0.78, lineHeight: 1.5 }}>{t.tagline}</p>
            </div>

            <div style={{ height: 1, background: 'currentColor', opacity: 0.15 }}/>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {t.features.map((f) => (
                <li key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13.5, lineHeight: 1.5 }}>
                  <span style={{
                    flexShrink: 0, marginTop: 2,
                    width: 18, height: 18, borderRadius: 6,
                    background: 'rgba(0,0,0,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon name="check" size={11} stroke={3}/>
                  </span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <div style={{ marginTop: 'auto' }}>
              <Chunky tone={t.ctaTone} trailing="arrow-right" onClick={onStart} style={{ width: '100%', justifyContent: 'center' }}>
                {t.cta}
              </Chunky>
            </div>
          </Block>
        ))}
      </div>
    </Section>
  );
};
