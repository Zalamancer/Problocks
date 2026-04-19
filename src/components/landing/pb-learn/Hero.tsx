'use client';

import React from 'react';
import { Block, Chunky, FloatBlock, Icon } from '../pb-site/primitives';

type Mode = 'student' | 'teacher';

const PizzaFractionsScene = () => (
  <svg viewBox="0 0 400 225" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="pbs-hbg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffd2c2"/>
        <stop offset="1" stopColor="#fff1d9"/>
      </linearGradient>
    </defs>
    <rect width="400" height="225" fill="url(#pbs-hbg)"/>
    <rect x="0" y="170" width="400" height="55" fill="#7a2a18"/>
    <rect x="0" y="165" width="400" height="8" fill="#ffd84d" stroke="#1d1a14" strokeWidth="1.5"/>
    <g transform="translate(200,110)">
      <circle r="62" fill="#fdf6e6" stroke="#1d1a14" strokeWidth="2.5"/>
      <circle r="56" fill="#ffd84d"/>
      <path d="M0 0 L56 0 A56 56 0 0 0 28 -48 Z" fill="#ffb000" stroke="#1d1a14" strokeWidth="2"/>
      <path d="M0 0 L28 -48 A56 56 0 0 0 -28 -48 Z" fill="#ff8c57" stroke="#1d1a14" strokeWidth="2"/>
      {[[18,10],[-22,18],[30,-12],[-14,-22],[8,-34],[-30,-4]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r="4" fill="#c24949" stroke="#1d1a14" strokeWidth="1"/>
      ))}
    </g>
    <g transform="translate(30,30)">
      <rect x="0" y="0" width="120" height="50" rx="10" fill="#fffaf0" stroke="#1d1a14" strokeWidth="2"/>
      <path d="M24 50 L20 62 L36 50 Z" fill="#fffaf0" stroke="#1d1a14" strokeWidth="2"/>
      <text x="60" y="22" textAnchor="middle" fontFamily="Bricolage Grotesque" fontSize="12" fontWeight="700" fill="#1d1a14">I want</text>
      <text x="60" y="40" textAnchor="middle" fontFamily="Instrument Serif" fontSize="22" fontStyle="italic" fill="#7a2a18">one third!</text>
    </g>
    <g transform="translate(70,95)">
      <circle r="22" fill="#b9d9ff" stroke="#1d1a14" strokeWidth="2"/>
      <circle cx="-6" cy="-4" r="2" fill="#1d1a14"/>
      <circle cx="6" cy="-4" r="2" fill="#1d1a14"/>
      <path d="M-6 6 Q0 10 6 6" stroke="#1d1a14" strokeWidth="2" fill="none"/>
    </g>
    <g transform="translate(350,50)">
      <circle r="14" fill="#ffd84d" stroke="#1d1a14" strokeWidth="2"/>
      <text textAnchor="middle" y="5" fontFamily="Bricolage Grotesque" fontSize="14" fontWeight="800" fill="#6b4f00">¢</text>
    </g>
  </svg>
);

const HeroShowcase = () => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 0.9fr) auto minmax(0, 1fr)',
    gap: 14, alignItems: 'stretch',
    maxWidth: 1040, margin: '0 auto',
  }}>
    <Block tone="paper" style={{ padding: 16, textAlign: 'left', transform: 'rotate(-1deg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--pbs-sky)', border: '1.5px solid var(--pbs-sky-ink)', color: 'var(--pbs-sky-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="book" size={13} stroke={2.2}/>
        </div>
        <span className="pbs-mono" style={{ fontSize: 11, color: 'var(--pbs-ink-muted)' }}>today&apos;s lesson</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, padding: '2px 8px', borderRadius: 999, background: 'var(--pbs-cream-2)', color: 'var(--pbs-ink-soft)', fontWeight: 600 }}>Grade 6 · Math</span>
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.015em' }}>Fractions of a whole</div>
      <p style={{ margin: '6px 0 12px', fontSize: 13, color: 'var(--pbs-ink-soft)', lineHeight: 1.5 }}>
        Students can identify ½, ⅓ and ¼ in real-world situations.
      </p>
      <div style={{
        padding: '10px 12px', borderRadius: 12, background: 'var(--pbs-cream-2)',
        border: '1.5px dashed var(--pbs-line-2)',
        fontSize: 13, lineHeight: 1.5,
      }}>
        <span className="pbs-mono" style={{ fontSize: 10.5, color: 'var(--pbs-ink-muted)', display: 'block', marginBottom: 4 }}>prompt</span>
        <span style={{ fontStyle: 'italic' }}>&quot;a pizza shop where you slice pies into the fractions customers ask for&quot;</span>
      </div>
    </Block>

    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: 'var(--pbs-butter)', color: 'var(--pbs-butter-ink)',
        border: '1.5px solid var(--pbs-butter-ink)',
        boxShadow: '0 3px 0 var(--pbs-butter-ink)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name="arrow-right" size={18} stroke={2.4}/>
      </div>
    </div>

    <Block tone="paper" style={{ padding: 10, transform: 'rotate(1deg)' }}>
      <div style={{
        aspectRatio: '16/9', borderRadius: 12, overflow: 'hidden',
        border: '1.5px solid var(--pbs-coral-ink)', background: 'var(--pbs-coral)',
        position: 'relative',
      }}>
        <PizzaFractionsScene/>
        <div style={{
          position: 'absolute', top: 8, left: 8,
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 999,
          background: 'rgba(29,26,20,0.82)', color: 'var(--pbs-cream)',
          fontSize: 11, fontWeight: 600,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: '#7fd796' }}/>
          level 3 · 2 of 5
        </div>
        <div style={{
          position: 'absolute', bottom: 8, right: 8,
          padding: '4px 10px', borderRadius: 999,
          background: 'rgba(255,250,240,0.92)', color: 'var(--pbs-ink)',
          fontSize: 11, fontWeight: 700,
        }}>
          <span className="pbs-serif" style={{ fontSize: 15 }}>+12</span> xp
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 6px 4px' }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>Pizza Fractions</div>
        <span style={{ marginLeft: 'auto' }} className="pbs-mono"><span style={{ fontSize: 11, color: 'var(--pbs-ink-muted)' }}>made by Ava · plays 14</span></span>
      </div>
    </Block>
  </div>
);

export const Hero = ({ onMakeGame }: { onMakeGame?: () => void }) => {
  const [mode, setMode] = React.useState<Mode>('student');

  return (
    <section style={{ position: 'relative', paddingTop: 40, paddingBottom: 64 }}>
      <div className="pbs-wrap" style={{ position: 'relative' }}>

        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <FloatBlock tone="butter" rot={-8} size={72} delay={0} style={{ position: 'absolute', top: 60, left: 10 }}>
            <Icon name="book" size={28} stroke={2.2}/>
          </FloatBlock>
          <FloatBlock tone="coral" rot={12} size={54} delay={1.2} style={{ position: 'absolute', top: 260, left: -20 }}/>
          <FloatBlock tone="mint" rot={-4} size={88} delay={2.4} style={{ position: 'absolute', top: 120, right: 10 }} radius={20}>
            <Icon name="gamepad" size={34} stroke={2}/>
          </FloatBlock>
          <FloatBlock tone="grape" rot={8} size={46} delay={0.6} style={{ position: 'absolute', top: 360, right: 80 }}/>
          <FloatBlock tone="sky" rot={-12} size={60} delay={1.8} style={{ position: 'absolute', top: 440, left: 100 }}>
            <Icon name="sparkle" size={24} stroke={2}/>
          </FloatBlock>
          <FloatBlock tone="pink" rot={6} size={36} delay={3.0} style={{ position: 'absolute', top: 90, right: 240 }}/>
        </div>

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', paddingTop: 28 }}>

          <div style={{ display: 'inline-flex', gap: 4, padding: 4, borderRadius: 999,
            background: 'var(--pbs-paper)', border: '1.5px solid var(--pbs-line-2)',
            boxShadow: '0 3px 0 var(--pbs-line-2)', marginBottom: 22,
          }}>
            {([['student', "I'm a student", 'smile'], ['teacher', "I'm a teacher", 'book']] as const).map(([k, label, icon]) => (
              <button key={k} type="button" onClick={() => setMode(k)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 999,
                fontSize: 13, fontWeight: 600,
                background: mode === k ? 'var(--pbs-ink)' : 'transparent',
                color: mode === k ? 'var(--pbs-cream)' : 'var(--pbs-ink-soft)',
                border: 0, cursor: 'pointer', fontFamily: 'inherit',
              }}>
                <Icon name={icon} size={13} stroke={2.2}/> {label}
              </button>
            ))}
          </div>

          <h1 style={{
            margin: 0,
            fontSize: 'clamp(44px, 6.8vw, 88px)',
            lineHeight: 0.98,
            letterSpacing: '-0.035em',
            fontWeight: 700,
            maxWidth: 960, marginInline: 'auto',
          }}>
            {mode === 'student' ? (
              <>Learn by <span className="pbs-serif" style={{ fontSize: '1.05em' }}>playing</span><br/>
                <span style={{
                  background: 'var(--pbs-mint)', border: '1.5px solid var(--pbs-mint-ink)',
                  padding: '2px 18px 6px', borderRadius: 18,
                  boxShadow: '0 4px 0 var(--pbs-mint-ink)', display: 'inline-block',
                  transform: 'rotate(-1.5deg)', color: 'var(--pbs-mint-ink)',
                }}>games you built</span>.</>
            ) : (
              <>Teach anything through <br/>
                <span style={{
                  background: 'var(--pbs-butter)', border: '1.5px solid var(--pbs-butter-ink)',
                  padding: '2px 18px 6px', borderRadius: 18,
                  boxShadow: '0 4px 0 var(--pbs-butter-ink)', display: 'inline-block',
                  transform: 'rotate(-1.5deg)', color: 'var(--pbs-butter-ink)',
                }}>a game they make</span>.</>
            )}
          </h1>

          <p style={{
            margin: '28px auto 0', maxWidth: 620,
            fontSize: 18, lineHeight: 1.5, color: 'var(--pbs-ink-soft)',
          }}>
            {mode === 'student'
              ? <>ProBlocks turns <span className="pbs-serif" style={{ fontSize: '1.1em' }}>fractions</span>, <span className="pbs-serif" style={{ fontSize: '1.1em' }}>French verbs</span> and <span className="pbs-serif" style={{ fontSize: '1.1em' }}>photosynthesis</span> into playable worlds. Build them with a sentence, play them with friends, and chat about what you&apos;re stuck on.</>
              : <>Students describe a game, Claude builds it, and the lesson plays itself. Every level they design shows you exactly what they understand — and what they don&apos;t.</>
            }
          </p>

          <div style={{ marginTop: 28, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Chunky tone="butter" icon="sparkle" trailing="arrow-right" onClick={onMakeGame}>
              {mode === 'student' ? 'Start playing' : 'Set up a classroom'}
            </Chunky>
            <Chunky tone="ghost" icon="play">Watch a 60-sec tour</Chunky>
          </div>

          <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, flexWrap: 'wrap', color: 'var(--pbs-ink-muted)', fontSize: 13.5 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Icon name="check" size={14} stroke={2.4}/> Free for your class of 10
            </span>
            <span style={{ width: 4, height: 4, background: 'var(--pbs-line-2)', borderRadius: 999 }}/>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Icon name="check" size={14} stroke={2.4}/> Ages 10+
            </span>
            <span style={{ width: 4, height: 4, background: 'var(--pbs-line-2)', borderRadius: 999 }}/>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Icon name="check" size={14} stroke={2.4}/> No installs
            </span>
          </div>

          <div style={{ marginTop: 56, position: 'relative' }}>
            <HeroShowcase/>
          </div>
        </div>
      </div>
    </section>
  );
};
