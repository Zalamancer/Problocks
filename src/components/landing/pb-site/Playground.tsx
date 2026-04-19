'use client';

import React from 'react';
import { Block, Icon, Section } from './primitives';
import { GameScene, type SceneKind } from './GameScene';

type GameKey = 'platformer' | 'puzzle' | 'cozy' | 'racing';
type Accent = 'butter' | 'mint' | 'pink' | 'coral';

const GAME_PREVIEWS: Record<GameKey, {
  title: string; genre: string; accent: Accent; scene: SceneKind; prompt: string;
}> = {
  platformer: { title: 'Cloud Donut Bear',     genre: 'Platformer', accent: 'butter', scene: 'sky',    prompt: 'a sleepy bear collects donuts in the clouds' },
  puzzle:     { title: 'Lily Pad Symphony',    genre: 'Puzzle',     accent: 'mint',   scene: 'pond',   prompt: 'a frog arranges lily pads to make music' },
  cozy:       { title: 'Teacup Harvest',       genre: 'Cozy Sim',   accent: 'pink',   scene: 'teacup', prompt: 'a cozy farm sim inside a floating teacup' },
  racing:     { title: 'Pizza Scooter Rally',  genre: 'Racing',     accent: 'coral',  scene: 'street', prompt: 'cats deliver pizza on tiny scooters' },
};

export const Playground = () => {
  const [active, setActive] = React.useState<GameKey>('platformer');
  const [playing, setPlaying] = React.useState(false);
  const game = GAME_PREVIEWS[active];

  return (
    <Section
      id="play"
      label="Live playground"
      kicker="mint"
      title={<>See it in the studio.</>}
      sub="Every generated game opens in a node-based studio where students can inspect, remix and rebuild any piece."
    >
      <Block tone="paper" style={{ padding: 16, overflow: 'hidden' }}>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 10px 14px', borderBottom: '1px dashed var(--pbs-line-2)',
          flexWrap: 'wrap',
        }}>
          <Icon name="logo-block" size={20}/>
          <span style={{ fontWeight: 700, fontSize: 14 }}>Studio</span>
          <span className="pbs-mono" style={{ fontSize: 11, color: 'var(--pbs-ink-muted)' }}>/ {game.title}</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            {(Object.entries(GAME_PREVIEWS) as Array<[GameKey, typeof GAME_PREVIEWS[GameKey]]>).map(([key, g]) => (
              <button
                key={key}
                type="button"
                onClick={() => { setActive(key); setPlaying(false); }}
                style={{
                  fontSize: 12.5, fontWeight: 600,
                  padding: '6px 12px', borderRadius: 999,
                  background: active === key ? `var(--pbs-${g.accent})` : 'var(--pbs-paper)',
                  color: active === key ? `var(--pbs-${g.accent}-ink)` : 'var(--pbs-ink-soft)',
                  border: `1.5px solid ${active === key ? `var(--pbs-${g.accent}-ink)` : 'var(--pbs-line-2)'}`,
                  cursor: 'pointer',
                }}
              >{g.genre}</button>
            ))}
          </div>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: '210px 1fr 240px', gap: 14, padding: '16px 0 0',
          minHeight: 420,
        }} className="pbs-playground-grid">

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="pbs-mono" style={{ fontSize: 10.5, color: 'var(--pbs-ink-muted)', padding: '0 4px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Connectors</div>
            {([
              { label: 'Claude',     sub: 'reasoning', icon: 'sparkle' as const, tone: 'grape'  as const },
              { label: 'PixelLab',   sub: '2D sprites',icon: 'image'   as const, tone: 'pink'   as const },
              { label: 'Meshy',      sub: '3D assets', icon: 'cube'    as const, tone: 'sky'    as const },
              { label: 'Suno',       sub: 'soundtrack',icon: 'music'   as const, tone: 'mint'   as const },
              { label: 'ElevenLabs', sub: 'voice',     icon: 'mic'     as const, tone: 'butter' as const },
            ]).map((n) => (
              <div key={n.label} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px',
                border: '1.5px solid var(--pbs-line)', borderRadius: 12,
                background: 'var(--pbs-cream-2)',
                cursor: 'grab',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: `var(--pbs-${n.tone})`, color: `var(--pbs-${n.tone}-ink)`,
                  border: `1.5px solid var(--pbs-${n.tone}-ink)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name={n.icon} size={14} stroke={2.2}/>
                </div>
                <div style={{ lineHeight: 1.2 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{n.label}</div>
                  <div className="pbs-mono" style={{ fontSize: 10, color: 'var(--pbs-ink-muted)' }}>{n.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            position: 'relative',
            borderRadius: 16,
            overflow: 'hidden',
            border: '1.5px solid var(--pbs-line-2)',
            background: 'var(--pbs-cream-2)',
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ position: 'relative', flex: 1, minHeight: 280, background: 'var(--pbs-paper)' }}>
              <GameScene kind={game.scene}/>
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                style={{
                  position: 'absolute', top: 10, right: 10,
                  width: 36, height: 36, borderRadius: 10,
                  background: 'var(--pbs-ink)', color: 'var(--pbs-butter)',
                  border: '1.5px solid var(--pbs-ink)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}>
                <Icon name={playing ? 'pause' : 'play'} size={14} stroke={2.4}/>
              </button>
              <div style={{
                position: 'absolute', top: 10, left: 10,
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 10px',
                background: 'rgba(29,26,20,0.8)', color: 'var(--pbs-cream)',
                borderRadius: 999, fontSize: 11, fontWeight: 600,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: playing ? '#7fd796' : '#ffd84d' }}/>
                {playing ? 'playing' : 'paused'}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderTop: '1px solid var(--pbs-line)' }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>{game.title}</span>
              <span className="pbs-mono" style={{ fontSize: 11, color: 'var(--pbs-ink-muted)' }}>{game.prompt}</span>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="heart" size={13} stroke={2.2}/>
                <span className="pbs-mono" style={{ fontSize: 11, color: 'var(--pbs-ink-soft)' }}>1.2k</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="pbs-mono" style={{ fontSize: 10.5, color: 'var(--pbs-ink-muted)', padding: '0 4px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Properties</div>
            {([
              { label: 'Genre',     value: game.genre,   tone: game.accent },
              { label: 'Mood',      value: 'Cozy, warm', tone: 'butter' as const },
              { label: 'Camera',    value: 'Side-scroll',tone: 'sky'    as const },
              { label: 'Art style', value: 'Soft pixel', tone: 'pink'   as const },
              { label: 'Music',     value: 'Lo-fi chip', tone: 'mint'   as const },
            ]).map((p) => (
              <div key={p.label} style={{
                padding: '10px 12px', borderRadius: 12,
                border: '1.5px solid var(--pbs-line)', background: 'var(--pbs-cream-2)',
              }}>
                <div className="pbs-mono" style={{ fontSize: 10, color: 'var(--pbs-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{p.label}</div>
                <div style={{
                  marginTop: 4,
                  display: 'inline-block',
                  padding: '4px 10px', borderRadius: 10,
                  background: `var(--pbs-${p.tone})`, color: `var(--pbs-${p.tone}-ink)`,
                  border: `1.5px solid var(--pbs-${p.tone}-ink)`,
                  fontSize: 12, fontWeight: 600,
                  maxWidth: '100%',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: 1.3,
                }}>{p.value}</div>
              </div>
            ))}
            <div style={{
              marginTop: 'auto',
              padding: 12, borderRadius: 12,
              background: 'var(--pbs-ink)', color: 'var(--pbs-cream)',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <Icon name="sparkle" size={14}/>
              <div style={{ fontSize: 12.5, flex: 1 }}>Ask Claude to tweak anything.</div>
            </div>
          </div>

        </div>
      </Block>
    </Section>
  );
};
