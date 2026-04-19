'use client';

import React from 'react';
import { Block, Chunky, FloatBlock, Icon, Pill } from './primitives';

type Tone = 'butter'|'mint'|'coral'|'sky'|'grape'|'pink';

export const Footer = ({ onStart }: { onStart?: () => void }) => {
  const swatches: Tone[] = ['butter','mint','coral','sky','grape','pink'];
  const columns: Array<{ title: string; links: string[] }> = [
    { title: 'Product',      links: ['Studio', 'Marketplace', 'Templates', 'Changelog', 'Roadmap'] },
    { title: 'For teachers', links: ['Classroom plan', 'Rubrics', 'PD workshops', 'Curriculum map'] },
    { title: 'Company',      links: ['About', 'Blog', 'Jobs', 'Press kit'] },
    { title: 'Support',      links: ['Help center', 'Community', 'Trust & safety', 'Contact'] },
  ];

  return (
    <footer>
      <section style={{ padding: '0 0 80px' }}>
        <div className="pbs-wrap">
          <Block tone="ink" style={{ padding: '60px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 24, left: 40 }}>
              <FloatBlock tone="butter" size={54} rot={-8} delay={0}><Icon name="star" size={22} stroke={2.2}/></FloatBlock>
            </div>
            <div style={{ position: 'absolute', top: 50, right: 80 }}>
              <FloatBlock tone="mint" size={44} rot={10} delay={1.2}/>
            </div>
            <div style={{ position: 'absolute', bottom: 40, left: 120 }}>
              <FloatBlock tone="coral" size={36} rot={6} delay={2}/>
            </div>
            <div style={{ position: 'absolute', bottom: 24, right: 40 }}>
              <FloatBlock tone="pink" size={60} rot={-10} delay={0.8}><Icon name="heart" size={24} stroke={2.2}/></FloatBlock>
            </div>

            <div style={{ position: 'relative', maxWidth: 620, margin: '0 auto' }}>
              <Pill tone="butter" icon="sparkle">Ready when you are</Pill>
              <h2 style={{
                margin: '18px 0 0', color: 'var(--pbs-cream)',
                fontSize: 'clamp(36px, 5vw, 58px)', lineHeight: 1.02,
                letterSpacing: '-0.03em', fontWeight: 700,
              }}>
                Give your students <br/>
                <span className="pbs-serif" style={{ color: 'var(--pbs-butter)' }}>a studio of their own.</span>
              </h2>
              <p style={{
                margin: '18px auto 0', maxWidth: 440,
                color: 'var(--pbs-line-2)', fontSize: 16, lineHeight: 1.5,
              }}>
                Set up a classroom in under five minutes. Free for your first 10 students, forever.
              </p>
              <div style={{ marginTop: 28, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Chunky tone="butter" trailing="arrow-right" onClick={onStart}>Start building</Chunky>
                <Chunky tone="ghost" icon="play" style={{ background: 'transparent', color: 'var(--pbs-cream)', borderColor: 'var(--pbs-cream)', boxShadow: '0 4px 0 var(--pbs-cream)' }}>
                  Watch a 90-sec demo
                </Chunky>
              </div>
            </div>
          </Block>
        </div>
      </section>

      <div className="pbs-wrap" style={{ paddingBottom: 40 }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) repeat(4, minmax(0, 1fr))',
          gap: 30, padding: '40px 0',
          borderTop: '1.5px solid var(--pbs-line)',
        }} className="pbs-footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <Icon name="logo-block" size={30}/>
              <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>ProBlocks</span>
            </div>
            <p style={{ margin: 0, fontSize: 13.5, color: 'var(--pbs-ink-soft)', lineHeight: 1.55, maxWidth: 280 }}>
              An AI-powered game studio for classrooms. Describe a game, build it together, publish it to the world.
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
              {swatches.map((c) => (
                <span key={c} style={{
                  width: 18, height: 18, borderRadius: 5,
                  background: `var(--pbs-${c})`, border: `1.5px solid var(--pbs-${c}-ink)`,
                }}/>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--pbs-ink-muted)', marginBottom: 14 }}>
                {col.title}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" style={{ fontSize: 14, color: 'var(--pbs-ink-soft)' }}>{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{
          borderTop: '1.5px solid var(--pbs-line)',
          padding: '18px 0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
          fontSize: 12.5, color: 'var(--pbs-ink-muted)',
        }}>
          <div>© 2026 ProBlocks · Made with <span className="pbs-serif" style={{ fontSize: 14 }}>care</span> for classrooms.</div>
          <div style={{ display: 'flex', gap: 18 }}>
            <a href="#" style={{ color: 'inherit' }}>Privacy</a>
            <a href="#" style={{ color: 'inherit' }}>Terms</a>
            <a href="#" style={{ color: 'inherit' }}>COPPA</a>
            <a href="#" style={{ color: 'inherit' }}>Status</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
