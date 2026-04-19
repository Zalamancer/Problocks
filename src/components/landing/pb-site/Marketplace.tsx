'use client';

import React from 'react';
import { Block, Chunky, Icon, Section } from './primitives';
import { GameScene, type SceneKind } from './GameScene';

type Tone = 'butter'|'mint'|'pink'|'coral'|'grape'|'sky';

const GAMES: Array<{ title: string; author: string; tone: Tone; scene: SceneKind; plays: string; tag: string }> = [
  { title: 'Donut Cloud Bear',    author: 'Ava P. · Grade 7',  tone: 'butter', scene: 'sky',    plays: '12.4k', tag: 'Platformer' },
  { title: 'Lily Pad Symphony',   author: 'Kai T. · Grade 8',  tone: 'mint',   scene: 'pond',   plays: '8.1k',  tag: 'Puzzle' },
  { title: 'Teacup Harvest',      author: 'Emi W. · Grade 6',  tone: 'pink',   scene: 'teacup', plays: '21.9k', tag: 'Cozy' },
  { title: 'Pizza Scooter Rally', author: 'Dev S. · Grade 9',  tone: 'coral',  scene: 'street', plays: '5.2k',  tag: 'Racing' },
  { title: 'Crystal Keep',        author: 'Juno R. · Grade 7', tone: 'grape',  scene: 'sky',    plays: '3.8k',  tag: 'RPG' },
  { title: 'Sky Library',         author: 'Theo M. · Grade 8', tone: 'sky',    scene: 'teacup', plays: '6.7k',  tag: 'Explorer' },
];

export const Marketplace = () => {
  return (
    <Section
      id="market"
      label="Marketplace"
      kicker="pink"
      title={<>Your classroom, <span className="pbs-serif">on the front page.</span></>}
      sub="Every published game lives on a shared marketplace. Students see their work played by kids around the world — and get paid when it happens."
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 18,
      }}>
        {GAMES.map((g) => (
          <Block key={g.title} tone="paper" style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{
              aspectRatio: '16/10',
              borderRadius: 12, overflow: 'hidden',
              border: `1.5px solid var(--pbs-${g.tone}-ink)`,
              background: `var(--pbs-${g.tone})`,
              position: 'relative',
            }}>
              <GameScene kind={g.scene}/>
              <div style={{
                position: 'absolute', top: 8, left: 8,
                padding: '3px 9px', borderRadius: 999,
                background: 'rgba(29,26,20,0.85)', color: 'var(--pbs-cream)',
                fontSize: 11, fontWeight: 600,
              }}>{g.tag}</div>
              <div style={{
                position: 'absolute', bottom: 8, right: 8,
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '3px 9px', borderRadius: 999,
                background: 'rgba(255,250,240,0.9)', color: 'var(--pbs-ink)',
                fontSize: 11, fontWeight: 600,
              }}><Icon name="play" size={10}/> {g.plays}</div>
            </div>
            <div style={{ padding: '2px 4px 6px' }}>
              <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.015em' }}>{g.title}</div>
              <div className="pbs-mono" style={{ fontSize: 11, color: 'var(--pbs-ink-muted)', marginTop: 2 }}>{g.author}</div>
            </div>
          </Block>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <Chunky tone="ghost" trailing="arrow-right" as="a" href="/marketplace">Browse all 2,400+ games</Chunky>
      </div>
    </Section>
  );
};
