// Roblox-style 3D minifig avatar, rendered in pure SVG with oblique
// projection (front + top + right side visible per cube). Outfit-driven so
// a future wardrobe UI can dress the character: shirt/pants/skin colors,
// face expression, optional hat + hair.
'use client';

import React from 'react';

export type AvatarFace = 'smile' | 'happy' | 'cool' | 'wink' | 'neutral';
export type AvatarHat = 'none' | 'cap' | 'beanie' | 'tophat';
export type AvatarHair = 'none' | 'short' | 'spike' | 'long';

export interface AvatarOutfit {
  skin?: string;       // head + arm color
  shirt?: string;      // torso color
  pants?: string;      // leg color
  face?: AvatarFace;
  hat?: AvatarHat;
  hatColor?: string;
  hair?: AvatarHair;
  hairColor?: string;
}

const DEFAULT_OUTFIT: Required<Pick<AvatarOutfit, 'skin' | 'shirt' | 'pants' | 'face' | 'hat' | 'hair' | 'hatColor' | 'hairColor'>> = {
  skin: '#ffd84d',
  shirt: '#6fbf73',
  pants: '#2a2b36',
  face: 'smile',
  hat: 'none',
  hatColor: '#c24949',
  hair: 'none',
  hairColor: '#3a2a1a',
};

const STROKE = '#1d1a14';

// Oblique ("cabinet") projection: depth offset = (d * DX, d * DY).
// Shallow angle reads as "3D" but keeps the face readable.
const DX = 0.5;
const DY = -0.3;

// One beveled cube with shaded top + right side faces.
function Cube3D({
  x, y, w, h, d, color, sx = 0, sy = 0,
}: { x: number; y: number; w: number; h: number; d: number; color: string; sx?: number; sy?: number }) {
  const X = x + sx, Y = y + sy;
  const dx = d * DX, dy = d * DY;
  const front = `${X},${Y} ${X + w},${Y} ${X + w},${Y + h} ${X},${Y + h}`;
  const top = `${X},${Y} ${X + w},${Y} ${X + w + dx},${Y + dy} ${X + dx},${Y + dy}`;
  const right = `${X + w},${Y} ${X + w + dx},${Y + dy} ${X + w + dx},${Y + h + dy} ${X + w},${Y + h}`;
  return (
    <g>
      <polygon points={front} fill={color} />
      <polygon points={top} fill={color} />
      <polygon points={right} fill={color} />
      {/* shading */}
      <polygon points={top} fill="rgba(255,255,255,0.32)" />
      <polygon points={right} fill="rgba(0,0,0,0.28)" />
      {/* outlines (front box + visible back edges) */}
      <polygon points={front} fill="none" stroke={STROKE} strokeWidth="1.1" strokeLinejoin="round" />
      <polyline
        points={`${X},${Y} ${X + dx},${Y + dy} ${X + w + dx},${Y + dy} ${X + w},${Y}`}
        fill="none" stroke={STROKE} strokeWidth="1.1" strokeLinejoin="round"
      />
      <polyline
        points={`${X + w + dx},${Y + dy} ${X + w + dx},${Y + h + dy} ${X + w},${Y + h}`}
        fill="none" stroke={STROKE} strokeWidth="1.1" strokeLinejoin="round"
      />
    </g>
  );
}

// Face decals on the head's front face. `fx, fy` is the head front top-left.
function FaceDecal({ face, fx, fy, w, h }: { face: AvatarFace; fx: number; fy: number; w: number; h: number }) {
  const eyeY = fy + h * 0.38;
  const mouthY = fy + h * 0.7;
  const cx = fx + w / 2;
  switch (face) {
    case 'happy':
      return (
        <g>
          <path d={`M${cx - 5},${eyeY - 1} q2.5,-3 5,0`} stroke={STROKE} strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <path d={`M${cx + 1.5},${eyeY - 1} q2.5,-3 5,0`} stroke={STROKE} strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <path d={`M${cx - 4},${mouthY - 2} q4,5 8,0`} stroke={STROKE} strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'cool':
      return (
        <g>
          <rect x={cx - 7.5} y={eyeY - 2.5} width="15" height="4" fill={STROKE} rx="0.8" />
          <rect x={cx - 4} y={eyeY} width="2.5" height="2" fill="#9ad7ff" />
          <rect x={cx + 1.5} y={eyeY} width="2.5" height="2" fill="#9ad7ff" />
          <path d={`M${cx - 3},${mouthY} q3,2 6,0`} stroke={STROKE} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'wink':
      return (
        <g>
          <rect x={cx - 5.5} y={eyeY} width="2.5" height="3.5" fill={STROKE} />
          <path d={`M${cx + 2},${eyeY + 1.5} q1.5,-2 3,0`} stroke={STROKE} strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <path d={`M${cx - 4},${mouthY - 1} q4,4 8,0`} stroke={STROKE} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </g>
      );
    case 'neutral':
      return (
        <g>
          <rect x={cx - 5} y={eyeY} width="2.5" height="3.5" fill={STROKE} />
          <rect x={cx + 2.5} y={eyeY} width="2.5" height="3.5" fill={STROKE} />
          <rect x={cx - 3} y={mouthY + 0.5} width="6" height="1.4" fill={STROKE} />
        </g>
      );
    case 'smile':
    default:
      return (
        <g>
          <rect x={cx - 5} y={eyeY} width="2.5" height="3.5" fill={STROKE} />
          <rect x={cx + 2.5} y={eyeY} width="2.5" height="3.5" fill={STROKE} />
          <path d={`M${cx - 4},${mouthY - 1} q4,3.5 8,0`} stroke={STROKE} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </g>
      );
  }
}

// Optional hat, rendered after the head so it sits on top.
function Hat({
  kind, color, hx, hy, hw, hd,
}: { kind: AvatarHat; color: string; hx: number; hy: number; hw: number; hd: number }) {
  switch (kind) {
    case 'cap':
      return (
        <g>
          <Cube3D x={hx} y={hy - 6} w={hw} h={6} d={hd} color={color} />
          {/* brim */}
          <rect x={hx - 2} y={hy - 1.5} width={hw / 2 + 4} height="2.2" fill={color} stroke={STROKE} strokeWidth="1" />
        </g>
      );
    case 'beanie':
      return (
        <g>
          <Cube3D x={hx} y={hy - 7} w={hw} h={7} d={hd} color={color} />
          {/* band */}
          <rect x={hx} y={hy - 3} width={hw} height="2.5" fill="rgba(0,0,0,0.22)" />
          {/* pom */}
          <circle cx={hx + hw / 2 + hd * DX / 2} cy={hy - 9} r="2.2" fill={color} stroke={STROKE} strokeWidth="1" />
        </g>
      );
    case 'tophat':
      return (
        <g>
          {/* brim (thin slab) */}
          <Cube3D x={hx - 2} y={hy - 1.5} w={hw + 4} h={1.8} d={hd + 4} color={color} />
          {/* crown */}
          <Cube3D x={hx + 2} y={hy - 10} w={hw - 4} h={9} d={hd} color={color} />
        </g>
      );
    case 'none':
    default:
      return null;
  }
}

// Simple hair cap on top/sides of the head.
function Hair({
  kind, color, hx, hy, hw, hd,
}: { kind: AvatarHair; color: string; hx: number; hy: number; hw: number; hd: number }) {
  switch (kind) {
    case 'short':
      return (
        <g>
          <Cube3D x={hx} y={hy - 2.5} w={hw} h={3} d={hd} color={color} />
          {/* side tufts */}
          <rect x={hx} y={hy} width="2.5" height="4" fill={color} stroke={STROKE} strokeWidth="1" />
          <rect x={hx + hw - 2.5} y={hy} width="2.5" height="4" fill={color} stroke={STROKE} strokeWidth="1" />
        </g>
      );
    case 'spike':
      return (
        <g>
          <Cube3D x={hx} y={hy - 3} w={hw} h={3.5} d={hd} color={color} />
          {[0, 1, 2, 3].map((i) => (
            <path key={i}
              d={`M${hx + 3 + i * 5},${hy - 2.5} l2,-4 l2,4 z`}
              fill={color} stroke={STROKE} strokeWidth="1" strokeLinejoin="round"/>
          ))}
        </g>
      );
    case 'long':
      return (
        <g>
          <Cube3D x={hx} y={hy - 3} w={hw} h={4} d={hd} color={color} />
          {/* long sides down past the head */}
          <rect x={hx} y={hy} width="3" height={14} fill={color} stroke={STROKE} strokeWidth="1" />
          <rect x={hx + hw - 3} y={hy} width="3" height={14} fill={color} stroke={STROKE} strokeWidth="1" />
        </g>
      );
    case 'none':
    default:
      return null;
  }
}

export const RobloxAvatar = ({
  size = 80,
  outfit,
  framed = true,
}: {
  size?: number;
  outfit?: AvatarOutfit;
  /** Wrap the SVG in the chunky cream tile used on the dashboard cards. */
  framed?: boolean;
}) => {
  const o = { ...DEFAULT_OUTFIT, ...(outfit || {}) };

  // Layout is in viewBox units; we'll set viewBox to encompass it.
  // Studs:  head 24x24x14, torso 24x24x12, arm 12x24x12, leg 12x24x12.
  const HEAD = { x: 8, y: 0, w: 24, h: 22, d: 14 };
  const TORSO = { x: 8, y: HEAD.y + HEAD.h, w: 24, h: 22, d: 12 };
  const L_ARM = { x: -4, y: TORSO.y, w: 12, h: 22, d: 12 };
  const R_ARM = { x: 32, y: TORSO.y, w: 12, h: 22, d: 12 };
  const L_LEG = { x: 8, y: TORSO.y + TORSO.h, w: 12, h: 20, d: 12 };
  const R_LEG = { x: 20, y: TORSO.y + TORSO.h, w: 12, h: 20, d: 12 };

  // Overall extents (include oblique depth offset).
  const maxD = 14;
  const xMin = L_ARM.x - 2;
  const xMax = R_ARM.x + R_ARM.w + maxD * DX + 2;
  const yMin = HEAD.y + maxD * DY - 12; // -12 for hat/hair room
  const yMax = L_LEG.y + L_LEG.h + 4;
  const vbW = xMax - xMin;
  const vbH = yMax - yMin;

  const svg = (
    <svg width={size} height={size} viewBox={`${xMin} ${yMin} ${vbW} ${vbH}`} style={{ display: 'block' }}>
      {/* floor shadow */}
      <ellipse cx={(HEAD.x + HEAD.w / 2) + maxD * DX * 0.3} cy={yMax - 2} rx="18" ry="2.4" fill="rgba(0,0,0,0.22)" />

      {/* legs first (bottom) */}
      <Cube3D {...L_LEG} color={o.pants} />
      <Cube3D {...R_LEG} color={o.pants} />

      {/* arms */}
      <Cube3D {...L_ARM} color={o.skin} />
      <Cube3D {...R_ARM} color={o.skin} />

      {/* torso */}
      <Cube3D {...TORSO} color={o.shirt} />
      {/* shirt collar v on front face */}
      <path
        d={`M${TORSO.x + 7},${TORSO.y + 1} L${TORSO.x + TORSO.w / 2},${TORSO.y + 5} L${TORSO.x + TORSO.w - 7},${TORSO.y + 1}`}
        stroke="rgba(0,0,0,0.35)" strokeWidth="1.3" fill="none" strokeLinecap="round"
      />

      {/* head */}
      <Cube3D {...HEAD} color={o.skin} />
      {/* face decals on head front */}
      <FaceDecal face={o.face} fx={HEAD.x} fy={HEAD.y} w={HEAD.w} h={HEAD.h} />

      {/* hair then hat on top */}
      <Hair kind={o.hair} color={o.hairColor} hx={HEAD.x} hy={HEAD.y} hw={HEAD.w} hd={HEAD.d} />
      <Hat kind={o.hat} color={o.hatColor} hx={HEAD.x} hy={HEAD.y} hw={HEAD.w} hd={HEAD.d} />
    </svg>
  );

  if (!framed) return svg;

  return (
    <div style={{
      width: size, height: size,
      borderRadius: size * 0.2,
      background: 'var(--pbs-cream-2)',
      border: `1.5px solid ${STROKE}`,
      boxShadow: `0 2px 0 ${STROKE}`,
      overflow: 'hidden', position: 'relative', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {svg}
    </div>
  );
};
