// Face items. Unlike the other categories these paint a canvas texture
// applied to the +Z face of the head cube; `build` returns an empty group
// so the scene picks the paint function via `id`.
import * as THREE from 'three';
import type { Item } from '../types';

export type FacePainter = (ctx: CanvasRenderingContext2D, size: number) => void;

const STROKE = '#1d1a14';

const base = (ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = STROKE;
  ctx.strokeStyle = STROKE;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
};

const drawBlush = (ctx: CanvasRenderingContext2D, size: number) => {
  ctx.fillStyle = 'rgba(255,120,130,0.55)';
  ctx.beginPath();
  ctx.ellipse(size * 0.23, size * 0.58, size * 0.08, size * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(size * 0.77, size * 0.58, size * 0.08, size * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
};

export const FACE_PAINTERS: Record<string, FacePainter> = {
  'face-smile': (ctx, s) => {
    base(ctx);
    ctx.fillRect(s * 0.36, s * 0.4, s * 0.07, s * 0.12);
    ctx.fillRect(s * 0.57, s * 0.4, s * 0.07, s * 0.12);
    ctx.lineWidth = s * 0.045;
    ctx.beginPath();
    ctx.arc(s * 0.5, s * 0.68, s * 0.12, 0, Math.PI);
    ctx.stroke();
    drawBlush(ctx, s);
  },
  'face-happy': (ctx, s) => {
    base(ctx);
    ctx.lineWidth = s * 0.05;
    ctx.beginPath(); ctx.arc(s * 0.36, s * 0.46, s * 0.08, Math.PI, 0); ctx.stroke();
    ctx.beginPath(); ctx.arc(s * 0.64, s * 0.46, s * 0.08, Math.PI, 0); ctx.stroke();
    ctx.lineWidth = s * 0.055;
    ctx.beginPath(); ctx.arc(s * 0.5, s * 0.66, s * 0.14, 0, Math.PI); ctx.stroke();
    drawBlush(ctx, s);
  },
  'face-cool': (ctx, s) => {
    base(ctx);
    ctx.fillRect(s * 0.22, s * 0.38, s * 0.56, s * 0.12);
    ctx.fillStyle = '#9ad7ff';
    ctx.fillRect(s * 0.26, s * 0.42, s * 0.18, s * 0.06);
    ctx.fillRect(s * 0.56, s * 0.42, s * 0.18, s * 0.06);
    ctx.fillStyle = STROKE;
    ctx.lineWidth = s * 0.045;
    ctx.beginPath(); ctx.arc(s * 0.5, s * 0.7, s * 0.09, 0, Math.PI); ctx.stroke();
  },
  'face-wink': (ctx, s) => {
    base(ctx);
    ctx.fillRect(s * 0.36, s * 0.4, s * 0.07, s * 0.12);
    ctx.lineWidth = s * 0.045;
    ctx.beginPath(); ctx.arc(s * 0.64, s * 0.46, s * 0.07, Math.PI, 0); ctx.stroke();
    ctx.lineWidth = s * 0.05;
    ctx.beginPath(); ctx.arc(s * 0.5, s * 0.66, s * 0.11, 0, Math.PI); ctx.stroke();
    drawBlush(ctx, s);
  },
  'face-neutral': (ctx, s) => {
    base(ctx);
    ctx.fillRect(s * 0.36, s * 0.4, s * 0.07, s * 0.12);
    ctx.fillRect(s * 0.57, s * 0.4, s * 0.07, s * 0.12);
    ctx.fillRect(s * 0.42, s * 0.66, s * 0.16, s * 0.03);
  },
  'face-tongue': (ctx, s) => {
    base(ctx);
    ctx.fillRect(s * 0.33, s * 0.4, s * 0.09, s * 0.12);
    ctx.lineWidth = s * 0.05;
    ctx.beginPath(); ctx.arc(s * 0.64, s * 0.46, s * 0.08, Math.PI, 0); ctx.stroke();
    ctx.fillStyle = STROKE;
    ctx.beginPath(); ctx.arc(s * 0.5, s * 0.64, s * 0.1, 0, Math.PI); ctx.fill();
    ctx.fillStyle = '#ff8a9b';
    ctx.fillRect(s * 0.46, s * 0.67, s * 0.08, s * 0.08);
    drawBlush(ctx, s);
  },
  'face-angry': (ctx, s) => {
    base(ctx);
    ctx.fillRect(s * 0.32, s * 0.44, s * 0.1, s * 0.06);
    ctx.fillRect(s * 0.58, s * 0.44, s * 0.1, s * 0.06);
    ctx.save();
    ctx.translate(s * 0.37, s * 0.38);
    ctx.rotate(0.3);
    ctx.fillRect(-s * 0.06, -s * 0.015, s * 0.16, s * 0.03);
    ctx.restore();
    ctx.save();
    ctx.translate(s * 0.63, s * 0.38);
    ctx.rotate(-0.3);
    ctx.fillRect(-s * 0.1, -s * 0.015, s * 0.16, s * 0.03);
    ctx.restore();
    ctx.lineWidth = s * 0.04;
    ctx.beginPath(); ctx.arc(s * 0.5, s * 0.76, s * 0.1, Math.PI, 0); ctx.stroke();
  },
  'face-love': (ctx, s) => {
    base(ctx);
    const heart = (cx: number, cy: number, r: number) => {
      ctx.fillStyle = '#e84a6f';
      ctx.beginPath();
      ctx.moveTo(cx, cy + r * 0.5);
      ctx.bezierCurveTo(cx - r, cy - r * 0.4, cx - r * 0.9, cy - r * 1.2, cx, cy - r * 0.2);
      ctx.bezierCurveTo(cx + r * 0.9, cy - r * 1.2, cx + r, cy - r * 0.4, cx, cy + r * 0.5);
      ctx.fill();
    };
    heart(s * 0.36, s * 0.46, s * 0.08);
    heart(s * 0.64, s * 0.46, s * 0.08);
    ctx.strokeStyle = STROKE;
    ctx.lineWidth = s * 0.05;
    ctx.beginPath(); ctx.arc(s * 0.5, s * 0.66, s * 0.14, 0, Math.PI); ctx.stroke();
    drawBlush(ctx, s);
  },
  'face-stars': (ctx, s) => {
    base(ctx);
    ctx.fillStyle = '#ffd84d';
    const star = (cx: number, cy: number, r: number) => {
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
        const rad = i % 2 === 0 ? r : r * 0.45;
        const x = cx + Math.cos(a) * rad;
        const y = cy + Math.sin(a) * rad;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
    };
    star(s * 0.36, s * 0.46, s * 0.09);
    star(s * 0.64, s * 0.46, s * 0.09);
    ctx.strokeStyle = STROKE;
    ctx.lineWidth = s * 0.055;
    ctx.beginPath(); ctx.arc(s * 0.5, s * 0.68, s * 0.14, 0, Math.PI); ctx.stroke();
    drawBlush(ctx, s);
  },
};

const g = () => new THREE.Group();

export const FACES: Item[] = [
  { id: 'face-smile', category: 'face', label: 'Smile', rarity: 'common', theme: 'school', cost: 0, preowned: true, build: () => g() },
  { id: 'face-happy', category: 'face', label: 'Happy', rarity: 'common', theme: 'school', cost: 0, preowned: true, build: () => g() },
  { id: 'face-cool', category: 'face', label: 'Cool', rarity: 'uncommon', theme: 'street', cost: 120, build: () => g() },
  { id: 'face-wink', category: 'face', label: 'Wink', rarity: 'common', theme: 'school', cost: 60, build: () => g() },
  { id: 'face-neutral', category: 'face', label: 'Neutral', rarity: 'common', theme: 'school', cost: 0, preowned: true, build: () => g() },
  { id: 'face-tongue', category: 'face', label: 'Tongue Out', rarity: 'uncommon', theme: 'street', cost: 140, build: () => g() },
  { id: 'face-angry', category: 'face', label: 'Angry', rarity: 'rare', theme: 'fantasy', cost: 320, build: () => g() },
  { id: 'face-love', category: 'face', label: 'Hearts', rarity: 'epic', theme: 'food', cost: 480, build: () => g() },
  { id: 'face-stars', category: 'face', label: 'Starstruck', rarity: 'legendary', theme: 'fantasy', cost: 900, build: () => g() },
];
