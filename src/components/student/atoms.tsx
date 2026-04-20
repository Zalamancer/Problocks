// Shared atoms for the Student app — Toast, PlayModal, AvatarBlob, QrGlyph.
// Ported from problocks/project/pb_student/{app,join,dashboard}.jsx.
'use client';

import React from 'react';
import { Block, Chunky, Icon, Pill } from '@/components/landing/pb-site/primitives';

export type ToastTone = 'butter' | 'mint' | 'coral' | 'sky' | 'grape' | 'pink';
export type ToastState = { msg: string; tone: ToastTone; id: number };

export const Toast = ({ toast }: { toast: ToastState }) => (
  <div
    className="pbs-pop-in"
    style={{
      position: 'fixed', left: '50%', bottom: 28, transform: 'translateX(-50%)',
      background: `var(--pbs-${toast.tone})`,
      color: `var(--pbs-${toast.tone}-ink)`,
      border: `1.5px solid var(--pbs-${toast.tone}-ink)`,
      padding: '12px 20px', borderRadius: 999,
      fontSize: 13.5, fontWeight: 700,
      boxShadow: `0 4px 0 var(--pbs-${toast.tone}-ink), 0 18px 40px -12px rgba(0,0,0,0.3)`,
      zIndex: 200,
    }}
  >
    {toast.msg}
  </div>
);

export type PlayableGame = {
  title: string;
  icon?: string;
  tone?: string;
  questions?: number;
  minutes?: number;
};

export const PlayModal = ({ game, onClose }: { game: PlayableGame; onClose: () => void }) => (
  <div
    onClick={onClose}
    style={{
      position: 'fixed', inset: 0,
      background: 'rgba(29,26,20,0.72)', backdropFilter: 'blur(8px)',
      zIndex: 150,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="pbs-pop-in"
      style={{ width: '100%', maxWidth: 540 }}
    >
      <Block tone={(game.tone as 'butter') || 'butter'} style={{ padding: 28, textAlign: 'center' }}>
        <Pill tone="paper" icon="play">Getting ready</Pill>
        <div style={{ margin: '16px 0 4px', display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: 80, height: 80, borderRadius: 20,
            background: 'var(--pbs-paper)',
            border: '1.5px solid currentColor',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 0 currentColor',
          }}>
            <Icon name={(game.icon as 'gamepad') || 'gamepad'} size={44} stroke={2}/>
          </div>
        </div>
        <h2 style={{ margin: '10px 0 4px', fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' }}>
          {game.title}
        </h2>
        {game.questions && (
          <div style={{ fontSize: 13, opacity: 0.8 }}>
            {game.questions} Qs · ~{game.minutes} min
          </div>
        )}
        <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'center' }}>
          <Chunky tone="ghost" onClick={onClose}>Later</Chunky>
          <Chunky tone="ink" trailing="arrow-right" onClick={onClose}>Start game</Chunky>
        </div>
        <div style={{ marginTop: 14, fontSize: 11, color: 'var(--pbs-ink-muted)' }}>
          (Demo — real game would launch here)
        </div>
      </Block>
    </div>
  </div>
);

export const AvatarBlob = ({
  tone = 'butter', size = 40,
}: { tone?: string; size?: number }) => (
  <div style={{
    width: size, height: size, borderRadius: size * 0.35,
    background: `var(--pbs-${tone})`,
    border: `1.5px solid var(--pbs-${tone}-ink)`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: `0 2px 0 var(--pbs-${tone}-ink)`,
    flexShrink: 0, position: 'relative',
  }}>
    <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 20 20" fill="none">
      <circle cx="7" cy="9" r="1.2" fill={`var(--pbs-${tone}-ink)`}/>
      <circle cx="13" cy="9" r="1.2" fill={`var(--pbs-${tone}-ink)`}/>
      <path d="M7 13c1 1 2 1.4 3 1.4s2-0.4 3-1.4" stroke={`var(--pbs-${tone}-ink)`} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    </svg>
  </div>
);

// Decorative QR glyph (deterministic 9x9 pattern). Pure visual — not a real QR.
export const QrGlyph = ({
  size = 120, color = '#1d1a14',
}: { size?: number; color?: string }) => {
  const cells = [
    '111111101', '100000100', '101110101', '101110101',
    '100000101', '111111100', '010101110', '110010101', '101110111',
  ];
  const n = 9;
  const unit = size / (n + 2);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect x="0" y="0" width={size} height={size} rx={size * 0.08} fill="none"/>
      {cells.map((row, y) =>
        row.split('').map((v, x) => v === '1' && (
          <rect key={`${x}-${y}`} x={unit * (x + 1)} y={unit * (y + 1)} width={unit} height={unit} fill={color} rx={unit * 0.1}/>
        )),
      )}
      {[[1, 1], [1, 7], [7, 1]].map(([cx, cy], i) => (
        <g key={i}>
          <rect x={unit * cx} y={unit * cy} width={unit * 3} height={unit * 3} fill="none" stroke={color} strokeWidth={unit * 0.35}/>
          <rect x={unit * (cx + 1)} y={unit * (cy + 1)} width={unit} height={unit} fill={color}/>
        </g>
      ))}
    </svg>
  );
};

// Google glyph used by the SSO button on the auth screen.
export const GoogleGlyph = () => (
  <svg width="16" height="16" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.8-6.8C35.5 2 30.1 0 24 0 14.6 0 6.6 5.3 2.7 13l7.9 6.1C12.6 13.2 17.8 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.1 24.5c0-1.6-.2-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.4-4.6 7.1l7.6 5.9c4.4-4.1 7-10.1 7-17.5z"/>
    <path fill="#FBBC05" d="M10.6 28.9c-.5-1.4-.8-2.9-.8-4.4s.3-3 .8-4.4l-7.9-6.1C1 17.5 0 20.7 0 24s1 6.5 2.7 9.9l7.9-5z"/>
    <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.9l-7.6-5.9c-2.1 1.4-4.8 2.3-8.3 2.3-6.2 0-11.4-3.7-13.4-9.1l-7.9 6.1C6.6 42.7 14.6 48 24 48z"/>
  </svg>
);
