'use client';

import React from 'react';

type Tone = 'butter' | 'mint' | 'coral' | 'sky' | 'grape' | 'pink';

export const Marquee = () => {
  const items: Array<[string, Tone]> = [
    ['Fractions', 'butter'], ['Photosynthesis', 'mint'], ['French verbs', 'coral'],
    ['World history', 'sky'], ['Shakespeare', 'grape'], ['Cell biology', 'mint'],
    ['Algebra', 'butter'], ['Poetry', 'pink'], ['Chemistry', 'coral'],
    ['Geography', 'sky'], ['Mythology', 'grape'], ['Coding', 'pink'],
  ];
  const row = [...items, ...items];

  return (
    <section style={{ padding: '4px 0 56px' }}>
      <div className="pbs-wrap">
        <div style={{
          textAlign: 'center', marginBottom: 18,
          fontSize: 13, color: 'var(--pbs-ink-muted)', letterSpacing: '0.14em', fontWeight: 600, textTransform: 'uppercase',
        }}>
          Turn any subject into a game
        </div>

        <div style={{
          position: 'relative', overflow: 'hidden',
          maskImage: 'linear-gradient(to right, transparent, #000 15%, #000 85%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, #000 15%, #000 85%, transparent)',
        }}>
          <div className="pbs-marquee-track" style={{ display: 'flex', gap: 14, width: 'max-content' }}>
            {row.map(([label, tone], i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 20px',
                border: `1.5px solid var(--pbs-${tone}-ink)`,
                borderRadius: 999, background: `var(--pbs-${tone})`,
                fontSize: 14, fontWeight: 600, color: `var(--pbs-${tone}-ink)`,
                whiteSpace: 'nowrap',
                boxShadow: `0 2px 0 var(--pbs-${tone}-ink)`,
              }}>
                <span style={{
                  width: 20, height: 20, borderRadius: 5,
                  background: 'var(--pbs-paper)',
                  border: `1.5px solid var(--pbs-${tone}-ink)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 800,
                }}>#</span>
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
