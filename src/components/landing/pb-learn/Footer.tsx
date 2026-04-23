'use client';

import React from 'react';
import { Block, Chunky, FloatBlock, Icon, Pill } from '../pb-site/primitives';

// Links with a real destination get rendered as anchors; everything
// else renders as a muted "Coming soon" tag so the footer still
// advertises the surface without leading visitors to a dead page.
const COLS: Array<{ title: string; links: Array<{ label: string; href?: string }> }> = [
  { title: 'Learn',        links: [
    { label: 'How it works' },
    { label: 'Subjects' },
    { label: 'Junior mode' },
    { label: 'Library' },
  ] },
  { title: 'For teachers', links: [
    { label: 'Set up a class',  href: '/teacher/setup' },
    { label: 'Standards' },
    { label: 'Lesson authoring' },
    { label: 'PD workshops' },
  ] },
  { title: 'Makers',       links: [
    { label: 'Studio',          href: '/studio' },
    { label: 'Marketplace',     href: '/marketplace' },
    { label: 'Templates' },
    { label: 'Discord' },
  ] },
  { title: 'Support',      links: [
    { label: 'Help center',     href: 'mailto:tryproblocks@gmail.com' },
    { label: 'Trust & safety',  href: '/privacy' },
    { label: 'For parents',     href: '/privacy/data-request' },
    { label: 'Contact',         href: 'mailto:tryproblocks@gmail.com' },
  ] },
];

export const Footer = ({ onMakeGame }: { onMakeGame?: () => void }) => (
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
            <Pill tone="butter" icon="sparkle">Start this Monday</Pill>
            <h2 style={{
              margin: '18px 0 0', color: 'var(--pbs-cream)',
              fontSize: 'clamp(36px, 5vw, 58px)', lineHeight: 1.02,
              letterSpacing: '-0.03em', fontWeight: 700,
            }}>
              Turn your next lesson <br/>
              <span className="pbs-serif" style={{ color: 'var(--pbs-butter)' }}>into a world worth playing.</span>
            </h2>
            <p style={{ margin: '18px auto 0', maxWidth: 460, color: 'var(--pbs-line-2)', fontSize: 16, lineHeight: 1.5 }}>
              Free for your first 10 students, forever. Set up a class in under five minutes — no install, no training.
            </p>
            <div style={{ marginTop: 28, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Chunky tone="butter" trailing="arrow-right" onClick={onMakeGame}>Make a Game</Chunky>
              <Chunky tone="ghost" style={{ background: 'transparent', color: 'var(--pbs-cream)', borderColor: 'var(--pbs-cream)', boxShadow: '0 4px 0 var(--pbs-cream)' }} icon="play">Watch a 60-sec demo</Chunky>
            </div>
          </div>
        </Block>
      </div>
    </section>

    <div className="pbs-wrap" style={{ paddingBottom: 40 }}>
      <div className="pbs-footer-grid" style={{
        display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) repeat(4, minmax(0, 1fr))',
        gap: 30, padding: '40px 0',
        borderTop: '1.5px solid var(--pbs-line)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <Icon name="logo-block" size={30}/>
            <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>Playdemy</span>
          </div>
          <p style={{ margin: 0, fontSize: 13.5, color: 'var(--pbs-ink-soft)', lineHeight: 1.55, maxWidth: 280 }}>
            Students learn by building playable worlds. Teachers watch what they build and see what they know.
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
            {(['butter','mint','coral','sky','grape','pink'] as const).map((c) => (
              <span key={c} style={{
                width: 18, height: 18, borderRadius: 5,
                background: `var(--pbs-${c})`, border: `1.5px solid var(--pbs-${c}-ink)`,
              }}/>
            ))}
          </div>
        </div>

        {COLS.map((col) => (
          <div key={col.title}>
            <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--pbs-ink-muted)', marginBottom: 14 }}>
              {col.title}
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {col.links.map((l) => (
                <li key={l.label}>
                  {l.href ? (
                    <a href={l.href} style={{ fontSize: 14, color: 'var(--pbs-ink-soft)' }}>{l.label}</a>
                  ) : (
                    <span title="Coming soon" style={{ fontSize: 14, color: 'var(--pbs-ink-muted)', cursor: 'default' }}>{l.label}</span>
                  )}
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
        <div>© 2026 Playdemy · Made with <span className="pbs-serif" style={{ fontSize: 14 }}>care</span> for classrooms.</div>
        <div style={{ display: 'flex', gap: 18 }}>
          <a href="/privacy" style={{ color: 'inherit' }}>Privacy</a>
          <a href="/terms" style={{ color: 'inherit' }}>Terms</a>
          <a href="/privacy#coppa" style={{ color: 'inherit' }}>COPPA</a>
          <a href="/privacy/data-request" style={{ color: 'inherit' }}>Data request</a>
        </div>
      </div>
    </div>
  </footer>
);
