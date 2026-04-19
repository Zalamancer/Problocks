'use client';

import React from 'react';

export type SceneKind = 'sky' | 'pond' | 'teacup' | 'street';

export const GameScene = ({ kind }: { kind: SceneKind }) => {
  const scenes: Record<SceneKind, React.ReactElement> = {
    sky: (
      <svg viewBox="0 0 400 240" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="pbs-skybg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#b9d9ff"/>
            <stop offset="1" stopColor="#fdf6e6"/>
          </linearGradient>
        </defs>
        <rect width="400" height="240" fill="url(#pbs-skybg)"/>
        <rect x="30" y="150" width="90" height="24" rx="12" fill="#fffaf0" stroke="#1d1a14" strokeWidth="2"/>
        <rect x="170" y="110" width="70" height="22" rx="11" fill="#fffaf0" stroke="#1d1a14" strokeWidth="2"/>
        <rect x="280" y="160" width="100" height="24" rx="12" fill="#fffaf0" stroke="#1d1a14" strokeWidth="2"/>
        <rect x="60" y="200" width="320" height="40" fill="#b6f0c6" stroke="#1d1a14" strokeWidth="2"/>
        <g transform="translate(60,115)">
          <rect x="0" y="0" width="30" height="30" rx="6" fill="#a57043" stroke="#1d1a14" strokeWidth="2"/>
          <circle cx="8" cy="10" r="2" fill="#1d1a14"/>
          <circle cx="22" cy="10" r="2" fill="#1d1a14"/>
          <rect x="12" y="18" width="6" height="4" rx="1" fill="#1d1a14"/>
        </g>
        {([[200, 90], [295, 142], [80, 130]] as const).map(([x, y], i) => (
          <g key={i} transform={`translate(${x},${y})`}>
            <circle cx="0" cy="0" r="9" fill="#ffb4a2" stroke="#1d1a14" strokeWidth="2"/>
            <circle cx="0" cy="0" r="3" fill="#fdf6e6" stroke="#1d1a14" strokeWidth="1.5"/>
          </g>
        ))}
        <g transform="translate(340,60)">
          <polygon points="0,-12 3.5,-3.7 12,-3.7 5,2.2 7.5,11 0,5.8 -7.5,11 -5,2.2 -12,-3.7 -3.5,-3.7" fill="#ffd84d" stroke="#1d1a14" strokeWidth="2"/>
        </g>
      </svg>
    ),
    pond: (
      <svg viewBox="0 0 400 240" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
        <rect width="400" height="240" fill="#dcc7ff"/>
        <ellipse cx="200" cy="130" rx="170" ry="80" fill="#b9d9ff" stroke="#1d1a14" strokeWidth="2"/>
        {([[100,130,'#b6f0c6'],[160,105,'#ffd84d'],[220,130,'#b6f0c6'],[280,110,'#ffc8e0'],[140,170,'#b6f0c6'],[260,170,'#b6f0c6']] as const).map(([x,y,c],i) => (
          <g key={i}>
            <ellipse cx={x} cy={y} rx="22" ry="14" fill={c} stroke="#1d1a14" strokeWidth="2"/>
            <path d={`M${x-22} ${y} a22,14 0 0,1 10,-12`} stroke="#0f5b2e" strokeWidth="2" fill="none"/>
          </g>
        ))}
        <g transform="translate(200,108)">
          <ellipse cx="0" cy="4" rx="14" ry="10" fill="#7fd796" stroke="#1d1a14" strokeWidth="2"/>
          <circle cx="-6" cy="-4" r="5" fill="#7fd796" stroke="#1d1a14" strokeWidth="2"/>
          <circle cx="6" cy="-4" r="5" fill="#7fd796" stroke="#1d1a14" strokeWidth="2"/>
          <circle cx="-6" cy="-4" r="2" fill="#1d1a14"/>
          <circle cx="6" cy="-4" r="2" fill="#1d1a14"/>
        </g>
        <text x="320" y="60" fontSize="24" fill="#4d2a8a">♪</text>
        <text x="90" y="70" fontSize="20" fill="#4d2a8a">♫</text>
      </svg>
    ),
    teacup: (
      <svg viewBox="0 0 400 240" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
        <rect width="400" height="240" fill="#ffc8e0"/>
        <ellipse cx="200" cy="220" rx="180" ry="40" fill="#fdf6e6" opacity="0.4"/>
        <path d="M80 120 Q80 200 200 200 Q320 200 320 120 Z" fill="#fffaf0" stroke="#1d1a14" strokeWidth="2.5"/>
        <ellipse cx="200" cy="120" rx="120" ry="20" fill="#b9d9ff" stroke="#1d1a14" strokeWidth="2.5"/>
        <path d="M320 140 Q360 140 360 170 Q360 200 320 195" fill="none" stroke="#1d1a14" strokeWidth="2.5"/>
        {([[140,160],[180,170],[220,165],[260,158]] as const).map(([x,y],i) => (
          <g key={i}>
            <rect x={x-3} y={y} width="6" height="14" fill="#0f5b2e"/>
            <circle cx={x} cy={y-4} r="8" fill="#b6f0c6" stroke="#0f5b2e" strokeWidth="1.5"/>
          </g>
        ))}
        <circle cx="340" cy="60" r="22" fill="#ffd84d" stroke="#1d1a14" strokeWidth="2"/>
      </svg>
    ),
    street: (
      <svg viewBox="0 0 400 240" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
        <rect width="400" height="140" fill="#ffb4a2"/>
        <rect y="140" width="400" height="100" fill="#57524a"/>
        {[40, 120, 200, 280, 360].map((x) => (
          <rect key={x} x={x} y="185" width="40" height="6" fill="#fdf6e6"/>
        ))}
        {([[20,70,60,70,'#ffd84d'],[90,50,70,90,'#b9d9ff'],[170,60,90,80,'#dcc7ff'],[270,45,110,95,'#b6f0c6']] as const).map(([x,y,w,h,c],i) => (
          <g key={i}>
            <rect x={x} y={y} width={w} height={h} fill={c} stroke="#1d1a14" strokeWidth="2"/>
            {[...Array(3)].map((_,j) => [...Array(2)].map((_,k) => (
              <rect key={`${j}-${k}`} x={x + 8 + k*(w-20)} y={y+10+j*20} width="8" height="10" fill="#fdf6e6" stroke="#1d1a14" strokeWidth="1"/>
            )))}
          </g>
        ))}
        <g transform="translate(150,165)">
          <circle cx="0" cy="20" r="10" fill="#1d1a14"/>
          <circle cx="30" cy="20" r="10" fill="#1d1a14"/>
          <rect x="-4" y="8" width="38" height="10" fill="#ff8c8c" stroke="#1d1a14" strokeWidth="2"/>
          <rect x="8" y="-14" width="18" height="18" rx="4" fill="#fdf6e6" stroke="#1d1a14" strokeWidth="2"/>
          <path d="M10 -14 l2 -6 M22 -14 l-2 -6" stroke="#1d1a14" strokeWidth="2"/>
          <rect x="30" y="-4" width="14" height="10" fill="#ffd84d" stroke="#1d1a14" strokeWidth="2"/>
        </g>
      </svg>
    ),
  };
  return scenes[kind] ?? null;
};
