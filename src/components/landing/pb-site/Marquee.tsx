'use client';

import React from 'react';

export const Marquee = () => {
  const items = [
    'Ridgewood Middle School', 'Code Club Dublin', 'Startup Schools NYC',
    'Oak Valley STEM', 'Bright Academy', 'Future Makers Tokyo',
    'Linwood Prep', 'Riverbend Coding Lab', 'Young Studios SF',
    'Mapleton Digital Arts',
  ];
  const row = [...items, ...items];

  const tones = ['butter', 'mint', 'coral', 'sky', 'grape', 'pink'] as const;

  return (
    <section style={{ padding: '20px 0 60px' }}>
      <div className="pbs-wrap">
        <div style={{
          textAlign: 'center', marginBottom: 22,
          fontSize: 13, color: 'var(--pbs-ink-muted)', letterSpacing: '0.14em', fontWeight: 600, textTransform: 'uppercase',
        }}>
          Building games in 180+ classrooms
        </div>

        <div style={{
          position: 'relative', overflow: 'hidden',
          maskImage: 'linear-gradient(to right, transparent, #000 15%, #000 85%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, #000 15%, #000 85%, transparent)',
        }}>
          <div className="pbs-marquee-track" style={{ display: 'flex', gap: 14, width: 'max-content' }}>
            {row.map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 20px',
                border: '1.5px solid var(--pbs-line-2)',
                borderRadius: 999,
                background: 'var(--pbs-paper)',
                fontSize: 14, fontWeight: 500,
                color: 'var(--pbs-ink-soft)',
                whiteSpace: 'nowrap',
              }}>
                <span style={{
                  width: 22, height: 22, borderRadius: 6,
                  background: `var(--pbs-${tones[i % 6]})`,
                  border: `1.5px solid var(--pbs-${tones[i % 6]}-ink)`,
                }}/>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
