'use client';

import React from 'react';
import { Block, Icon, Pill, FloatBlock } from './primitives';

const HERO_PROMPTS = [
  'a platformer where a sleepy bear collects donuts in the clouds',
  'a puzzle game where a frog arranges lily pads to make music',
  'a cozy farm sim set inside a giant floating teacup',
  'a racing game where cats deliver pizza on tiny scooters',
  'a stealth game where a raccoon plans a midnight picnic heist',
];

export const Hero = ({ onStart }: { onStart?: () => void }) => {
  const [prompt, setPrompt] = React.useState('');
  const [demoIdx, setDemoIdx] = React.useState(0);
  const [building, setBuilding] = React.useState(false);
  const [assetStep, setAssetStep] = React.useState(0);
  const typerRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    if (prompt) return;
    const text = HERO_PROMPTS[demoIdx];
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      if (typerRef.current) typerRef.current.textContent = text.slice(0, i);
      i++;
      if (i <= text.length) {
        timer = setTimeout(tick, 38 + Math.random() * 30);
      } else {
        timer = setTimeout(() => setDemoIdx((d) => (d + 1) % HERO_PROMPTS.length), 2400);
      }
    };
    tick();
    return () => clearTimeout(timer);
  }, [demoIdx, prompt]);

  React.useEffect(() => {
    if (!building) { setAssetStep(0); return; }
    let step = 0;
    const t = setInterval(() => {
      step++;
      setAssetStep(step);
      if (step >= 4) {
        clearInterval(t);
        setTimeout(() => setBuilding(false), 1800);
      }
    }, 700);
    return () => clearInterval(t);
  }, [building]);

  const handleBuild = () => {
    if (building) return;
    setBuilding(true);
  };

  return (
    <section style={{ position: 'relative', paddingTop: 40, paddingBottom: 80 }}>
      <div className="pbs-wrap" style={{ position: 'relative' }}>

        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <FloatBlock tone="butter" rot={-8} size={72} delay={0} style={{ position: 'absolute', top: 40, left: 20 }}>
            <Icon name="star" size={28} stroke={2.2}/>
          </FloatBlock>
          <FloatBlock tone="coral" rot={12} size={58} delay={1.2} style={{ position: 'absolute', top: 220, left: -10 }}/>
          <FloatBlock tone="mint" rot={-4} size={90} delay={2.4} style={{ position: 'absolute', top: 120, right: 30 }} radius={20}>
            <Icon name="gamepad" size={36} stroke={2}/>
          </FloatBlock>
          <FloatBlock tone="grape" rot={8} size={48} delay={0.6} style={{ position: 'absolute', top: 340, right: 120 }}/>
          <FloatBlock tone="sky" rot={-12} size={64} delay={1.8} style={{ position: 'absolute', top: 420, left: 120 }}>
            <Icon name="cube" size={26} stroke={2}/>
          </FloatBlock>
          <FloatBlock tone="pink" rot={6} size={36} delay={3.0} style={{ position: 'absolute', top: 80, right: 260 }}/>
        </div>

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', paddingTop: 36 }}>

          <Pill tone="butter" icon="sparkle" style={{ marginBottom: 22 }}>
            Made for classrooms · powered by Claude
          </Pill>

          <h1 style={{
            margin: 0,
            fontSize: 'clamp(48px, 7vw, 96px)',
            lineHeight: 0.96,
            letterSpacing: '-0.035em',
            fontWeight: 700,
            maxWidth: 900,
            marginInline: 'auto',
          }}>
            Describe a game. <br/>
            <span style={{ position: 'relative', display: 'inline-block' }}>
              <span className="pbs-serif" style={{ fontSize: '1.05em', color: 'var(--pbs-ink)' }}>Build</span>{' '}
              <span style={{
                background: 'var(--pbs-butter)',
                border: '1.5px solid var(--pbs-butter-ink)',
                padding: '2px 18px 6px',
                borderRadius: 18,
                boxShadow: '0 4px 0 var(--pbs-butter-ink)',
                display: 'inline-block',
                transform: 'rotate(-1.5deg)',
                color: 'var(--pbs-butter-ink)',
              }}>it for real</span>.
            </span>
          </h1>

          <p style={{
            margin: '28px auto 0', maxWidth: 560,
            fontSize: 18, lineHeight: 1.5, color: 'var(--pbs-ink-soft)',
          }}>
            ProBlocks turns a sentence into a playable game — <span className="pbs-serif" style={{ fontSize: '1.1em' }}>art</span>,
            <span className="pbs-serif" style={{ fontSize: '1.1em' }}> code</span>, and
            <span className="pbs-serif" style={{ fontSize: '1.1em' }}> sound</span> generated, edited, and published by your students.
          </p>

          <div style={{ maxWidth: 680, margin: '36px auto 0', position: 'relative' }}>
            <Block tone="paper" style={{ padding: 6, textAlign: 'left' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px',
                borderBottom: '1.5px dashed var(--pbs-line-2)',
              }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 999, background: '#ff8c8c', border: '1px solid #c24949' }}/>
                  <span style={{ width: 10, height: 10, borderRadius: 999, background: '#ffd84d', border: '1px solid #b58b00' }}/>
                  <span style={{ width: 10, height: 10, borderRadius: 999, background: '#7fd796', border: '1px solid #347e45' }}/>
                </div>
                <span className="pbs-mono" style={{ fontSize: 11, color: 'var(--pbs-ink-muted)', marginLeft: 6 }}>
                  problocks.app / new-game
                </span>
                <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: '#2aaa5a' }}/>
                  <span className="pbs-mono" style={{ fontSize: 11, color: 'var(--pbs-ink-muted)' }}>Claude ready</span>
                </span>
              </div>

              <div style={{ padding: '22px 22px 18px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{
                  flexShrink: 0,
                  width: 36, height: 36, borderRadius: 10,
                  background: 'var(--pbs-ink)', color: 'var(--pbs-butter)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 14,
                }}>Me</div>
                <div style={{ flex: 1, minHeight: 80 }}>
                  <div className="pbs-mono" style={{ fontSize: 11, color: 'var(--pbs-ink-muted)', marginBottom: 4 }}>Describe your game</div>
                  {prompt ? (
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      autoFocus
                      rows={3}
                      style={{
                        width: '100%', resize: 'none', border: 0, outline: 0, background: 'transparent',
                        fontSize: 19, lineHeight: 1.45, color: 'var(--pbs-ink)',
                        fontFamily: 'inherit', padding: 0,
                      }}
                    />
                  ) : (
                    <div
                      role="textbox"
                      tabIndex={0}
                      onClick={() => setPrompt(' ')}
                      onKeyDown={(e) => { if (e.key === 'Enter') setPrompt(' '); }}
                      style={{ fontSize: 19, lineHeight: 1.45, cursor: 'text', color: 'var(--pbs-ink)', minHeight: 56 }}
                    >
                      <span ref={typerRef} />
                      <span style={{
                        display: 'inline-block', width: 9, height: 20,
                        background: 'var(--pbs-ink)', marginLeft: 2, verticalAlign: -3,
                        animation: 'pbs-blink-cursor 1s steps(2) infinite',
                      }}/>
                    </div>
                  )}
                </div>
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px 14px', borderTop: '1px solid var(--pbs-line)',
                background: 'var(--pbs-cream-2)',
                borderRadius: '0 0 calc(var(--pbs-radius) - 2px) calc(var(--pbs-radius) - 2px)',
              }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['Platformer', 'Puzzle', 'RPG', 'Racing'].map((g, i) => (
                    <button key={g} type="button" style={{
                      fontSize: 12.5, fontWeight: 600,
                      padding: '5px 11px', borderRadius: 999,
                      background: i === 0 ? 'var(--pbs-ink)' : 'transparent',
                      color: i === 0 ? 'var(--pbs-cream)' : 'var(--pbs-ink-soft)',
                      border: `1.5px solid ${i === 0 ? 'var(--pbs-ink)' : 'var(--pbs-line-2)'}`,
                      cursor: 'pointer',
                    }}>{g}</button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => { handleBuild(); onStart?.(); }}
                  className="pbs-chunky pbs-chunky-butter"
                  style={{ padding: '10px 16px', fontSize: 14 }}
                  disabled={building}
                >
                  <Icon name={building ? 'sparkle' : 'wand'} size={14} stroke={2.4}/>
                  {building ? 'Building…' : 'Build it'}
                </button>
              </div>
            </Block>

            {building && (
              <Block tone="ink" style={{
                position: 'absolute', top: '100%', marginTop: 14, left: 0, right: 0,
                padding: '16px 18px',
              }}>
                <div className="pbs-mono" style={{ fontSize: 11, color: 'var(--pbs-butter)', marginBottom: 10 }}>
                  claude.build()
                </div>
                {([
                  { icon: 'image' as const, label: 'PixelLab — sprites', tone: 'pink' as const },
                  { icon: 'cube' as const, label: 'Meshy — 3D assets', tone: 'sky' as const },
                  { icon: 'music' as const, label: 'Suno — soundtrack', tone: 'mint' as const },
                  { icon: 'code' as const, label: 'Generating game code', tone: 'butter' as const },
                ]).map((s, i) => (
                  <div key={s.label} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0',
                    opacity: assetStep >= i ? 1 : 0.3,
                    transition: 'opacity 300ms',
                  }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: 6,
                      background: `var(--pbs-${s.tone})`,
                      color: `var(--pbs-${s.tone}-ink)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {assetStep > i ? <Icon name="check" size={12} stroke={3}/> : <Icon name={s.icon} size={12} stroke={2.4}/>}
                    </div>
                    <span style={{ fontSize: 13.5, color: 'var(--pbs-cream)' }}>{s.label}</span>
                    <span className="pbs-mono" style={{ marginLeft: 'auto', fontSize: 11, color: assetStep > i ? 'var(--pbs-mint)' : 'var(--pbs-ink-muted)' }}>
                      {assetStep > i ? 'done' : assetStep === i ? 'working…' : 'queued'}
                    </span>
                  </div>
                ))}
              </Block>
            )}
          </div>

          <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, flexWrap: 'wrap', color: 'var(--pbs-ink-muted)', fontSize: 13.5 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Icon name="check" size={14} stroke={2.4}/> No coding required
            </span>
            <span style={{ width: 4, height: 4, background: 'var(--pbs-line-2)', borderRadius: 999 }}/>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Icon name="check" size={14} stroke={2.4}/> Built for ages 10+
            </span>
            <span style={{ width: 4, height: 4, background: 'var(--pbs-line-2)', borderRadius: 999 }}/>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Icon name="check" size={14} stroke={2.4}/> Publish & earn
            </span>
          </div>

        </div>
      </div>
    </section>
  );
};
