'use client';

import React from 'react';
import { Block, Section } from '../pb-site/primitives';

type Tone = 'butter' | 'mint' | 'coral' | 'sky';

const STORIES: Array<{ tone: Tone; who: string; role: string; quote: string }> = [
  {
    tone: 'butter',
    who: 'Ava, 12', role: 'Grade 7',
    quote: "I made a game where you have to slice a pizza into thirds before the cat eats it. Now I actually get fractions. My brother is jealous.",
  },
  {
    tone: 'mint',
    who: 'Mrs. Vasquez', role: 'Math teacher, Ridgewood MS',
    quote: "I used to grade 28 worksheets a week. Now I play 28 tiny games on Friday and I can see exactly who doesn't get it. It's faster AND kinder.",
  },
  {
    tone: 'coral',
    who: 'Kai, 13', role: 'Grade 8',
    quote: "I hated French. Then we built a market game where I had to buy a croissant without switching to English. I asked for TWO croissants yesterday.",
  },
  {
    tone: 'sky',
    who: 'Mr. Odu', role: 'Biology teacher, Bright Academy',
    quote: "They're arguing about photosynthesis at lunch. About PHOTOSYNTHESIS. I didn't know this was an option.",
  },
];

export const Stories = () => (
  <Section
    id="stories"
    kicker="coral"
    label="Real classrooms"
    title={<>Kids build <span className="pbs-serif">weird things</span>. <br/>Weird things <span className="pbs-serif">teach well.</span></>}
  >
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
      {STORIES.map((s, i) => (
        <Block key={s.who} tone={s.tone} style={{
          padding: 22,
          transform: `rotate(${(i%2?1:-1)*0.6}deg)`,
          display: 'flex', flexDirection: 'column', gap: 14,
        }}>
          <div className="pbs-serif" style={{ fontSize: 38, lineHeight: 0.8, opacity: 0.6 }}>&quot;</div>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, fontWeight: 500 }}>{s.quote}</p>
          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 999,
              background: 'var(--pbs-paper)', border: '1.5px solid rgba(0,0,0,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700,
            }}>{s.who[0]}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{s.who}</div>
              <div className="pbs-mono" style={{ fontSize: 10.5, opacity: 0.7 }}>{s.role}</div>
            </div>
          </div>
        </Block>
      ))}
    </div>
  </Section>
);
