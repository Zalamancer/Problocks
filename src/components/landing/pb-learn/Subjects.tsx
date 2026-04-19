'use client';

import React from 'react';
import { Block, Chunky, Section } from '../pb-site/primitives';

type Tone = 'butter' | 'mint' | 'coral' | 'sky' | 'grape' | 'pink';
type SceneKind = 'pizza' | 'plant' | 'rome' | 'market' | 'lab' | 'quill';

const SUBJECTS: Array<{ subject: string; tone: Tone; title: string; prompt: string; scene: SceneKind; skill: string }> = [
  { subject: 'Math',      tone: 'butter', title: 'Pizza Fractions', prompt: 'slice pies into the fractions customers ask for', scene: 'pizza',  skill: '½ · ⅓ · ¼' },
  { subject: 'Biology',   tone: 'mint',   title: 'Tiny Plant',      prompt: 'a seedling that grows by catching sunbeams',       scene: 'plant',  skill: 'Photosynthesis' },
  { subject: 'History',   tone: 'coral',  title: 'Rome on Foot',    prompt: 'a senator delivering scrolls through ancient Rome', scene: 'rome',   skill: 'Roman Republic' },
  { subject: 'Language',  tone: 'sky',    title: 'Le Marché',       prompt: 'shop at a French market without knowing English',   scene: 'market', skill: 'French present tense' },
  { subject: 'Chemistry', tone: 'grape',  title: 'Mix & Match',     prompt: 'brew potions that balance reactions',               scene: 'lab',    skill: 'Stoichiometry' },
  { subject: 'English',   tone: 'pink',   title: 'Sonnet Swap',     prompt: 'a poet fills in missing words in Shakespeare',      scene: 'quill',  skill: 'Iambic pentameter' },
];

const SubjectScene = ({ kind }: { kind: SceneKind }) => {
  switch (kind) {
    case 'pizza': return (
      <svg viewBox="0 0 200 120" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
        <rect width="200" height="120" fill="#ffd2c2"/>
        <rect y="90" width="200" height="30" fill="#7a2a18"/>
        <g transform="translate(100,62)">
          <circle r="32" fill="#fdf6e6" stroke="#1d1a14" strokeWidth="2"/>
          <circle r="28" fill="#ffd84d"/>
          <path d="M0 0 L28 0 A28 28 0 0 0 14 -24 Z" fill="#ff8c57" stroke="#1d1a14" strokeWidth="1.5"/>
          {[[8,6],[-10,8],[14,-8],[-6,-12]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="2.5" fill="#c24949"/>)}
        </g>
      </svg>
    );
    case 'plant': return (
      <svg viewBox="0 0 200 120" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
        <rect width="200" height="120" fill="#b6f0c6"/>
        <rect y="90" width="200" height="30" fill="#8a4a23"/>
        <circle cx="160" cy="26" r="14" fill="#ffd84d" stroke="#1d1a14" strokeWidth="1.5"/>
        <g transform="translate(100,90)">
          <rect x="-2" y="-36" width="4" height="36" fill="#0f5b2e"/>
          <ellipse cx="-14" cy="-22" rx="12" ry="6" fill="#7fd796" stroke="#0f5b2e" strokeWidth="1.5"/>
          <ellipse cx="14" cy="-28" rx="11" ry="5" fill="#7fd796" stroke="#0f5b2e" strokeWidth="1.5"/>
        </g>
        {[[40,40],[70,20],[130,30]].map(([x,y],i)=>(
          <g key={i}><path d={`M${x} ${y} l-6 -10 M${x} ${y} l6 -10 M${x} ${y} l0 -12`} stroke="#ffd84d" strokeWidth="2"/></g>
        ))}
      </svg>
    );
    case 'rome': return (
      <svg viewBox="0 0 200 120" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
        <rect width="200" height="120" fill="#ffb4a2"/>
        <rect y="86" width="200" height="34" fill="#d6c896"/>
        {[30,80,130].map((x,i)=>(
          <g key={i}>
            <rect x={x-16} y="36" width="32" height="50" fill="#fdf6e6" stroke="#1d1a14" strokeWidth="1.5"/>
            <polygon points={`${x-18},36 ${x},22 ${x+18},36`} fill="#ffd84d" stroke="#1d1a14" strokeWidth="1.5"/>
            <rect x={x-3} y="60" width="6" height="26" fill="#7a2a18"/>
          </g>
        ))}
        <g transform="translate(170,80)">
          <rect x="-6" y="-14" width="12" height="14" rx="3" fill="#dcc7ff" stroke="#1d1a14" strokeWidth="1.5"/>
          <circle cy="-18" r="5" fill="#fdf6e6" stroke="#1d1a14" strokeWidth="1.5"/>
        </g>
      </svg>
    );
    case 'market': return (
      <svg viewBox="0 0 200 120" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
        <rect width="200" height="120" fill="#b9d9ff"/>
        <rect y="86" width="200" height="34" fill="#d6c896"/>
        <rect x="20" y="46" width="60" height="40" fill="#ffc8e0" stroke="#1d1a14" strokeWidth="1.5"/>
        <polygon points="15,46 85,46 75,32 25,32" fill="#ff8c57" stroke="#1d1a14" strokeWidth="1.5"/>
        {[[30,66],[45,66],[60,66],[30,76],[45,76],[60,76]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r="4" fill="#c24949" stroke="#1d1a14" strokeWidth="1"/>
        ))}
        <rect x="110" y="46" width="60" height="40" fill="#b6f0c6" stroke="#1d1a14" strokeWidth="1.5"/>
        <polygon points="105,46 175,46 165,32 115,32" fill="#ffd84d" stroke="#1d1a14" strokeWidth="1.5"/>
        {[[120,66],[135,66],[150,66]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r="4" fill="#ffb000" stroke="#1d1a14" strokeWidth="1"/>
        ))}
      </svg>
    );
    case 'lab': return (
      <svg viewBox="0 0 200 120" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
        <rect width="200" height="120" fill="#dcc7ff"/>
        <rect y="90" width="200" height="30" fill="#1d1a14"/>
        {([[60,'#b6f0c6'],[110,'#ffb4a2'],[150,'#ffd84d']] as const).map(([x,c],i)=>(
          <g key={i} transform={`translate(${x},60)`}>
            <rect x="-8" y="0" width="16" height="30" fill={c} stroke="#1d1a14" strokeWidth="1.5"/>
            <rect x="-5" y="-10" width="10" height="10" fill="none" stroke="#1d1a14" strokeWidth="1.5"/>
          </g>
        ))}
        <g transform="translate(100,30)">
          <text textAnchor="middle" fontFamily="Instrument Serif" fontSize="16" fontStyle="italic" fill="#4d2a8a">2H₂ + O₂</text>
        </g>
      </svg>
    );
    case 'quill': return (
      <svg viewBox="0 0 200 120" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
        <rect width="200" height="120" fill="#ffc8e0"/>
        <rect x="30" y="22" width="140" height="86" fill="#fdf6e6" stroke="#1d1a14" strokeWidth="2"/>
        {[38,52,66,80].map((y,i)=>(
          <line key={i} x1="44" y1={y} x2="156" y2={y} stroke="#d6c896" strokeWidth="1"/>
        ))}
        <rect x="52" y="32" width="40" height="6" fill="#1d1a14"/>
        <rect x="100" y="32" width="24" height="6" fill="#ffd84d" stroke="#1d1a14" strokeWidth="1"/>
        <rect x="52" y="46" width="60" height="6" fill="#1d1a14"/>
        <path d="M160 90 L180 60 L186 66 L166 96 Z" fill="#ff8c57" stroke="#1d1a14" strokeWidth="1.5"/>
      </svg>
    );
    default: return null;
  }
};

export const Subjects = () => (
  <Section
    id="subjects"
    label="Built by students"
    kicker="grape"
    title={<>Every subject, <span className="pbs-serif">playable.</span></>}
    sub="A peek at worlds built by real classrooms this week. Each card is a real game you can open, play and remix."
  >
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
      {SUBJECTS.map((g) => (
        <Block key={g.title} tone="paper" style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{
            aspectRatio: '16/10', borderRadius: 12, overflow: 'hidden',
            border: `1.5px solid var(--pbs-${g.tone}-ink)`,
            background: `var(--pbs-${g.tone})`, position: 'relative',
          }}>
            <SubjectScene kind={g.scene}/>
            <div style={{
              position: 'absolute', top: 8, left: 8,
              padding: '3px 9px', borderRadius: 999,
              background: 'rgba(29,26,20,0.82)', color: 'var(--pbs-cream)',
              fontSize: 11, fontWeight: 600,
            }}>{g.subject}</div>
            <div style={{
              position: 'absolute', bottom: 8, right: 8,
              padding: '3px 9px', borderRadius: 999,
              background: 'rgba(255,250,240,0.9)', color: 'var(--pbs-ink)',
              fontSize: 11, fontWeight: 600,
            }}>{g.skill}</div>
          </div>
          <div style={{ padding: '2px 4px 6px' }}>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.015em' }}>{g.title}</div>
            <div className="pbs-mono" style={{ fontSize: 11, color: 'var(--pbs-ink-muted)', marginTop: 2, fontStyle: 'italic' }}>&quot;{g.prompt}&quot;</div>
          </div>
        </Block>
      ))}
    </div>

    <div style={{ textAlign: 'center', marginTop: 32 }}>
      <Chunky tone="ghost" trailing="arrow-right">Browse 2,400+ lessons</Chunky>
    </div>
  </Section>
);
