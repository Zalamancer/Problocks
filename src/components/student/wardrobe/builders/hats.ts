// Hat builders. Each returns a group centered at origin; AvatarScene
// places it on the head mount (top of head, forward-facing +Z).
import * as THREE from 'three';
import type { Item } from '../types';
import { block, sphere, mat, rbox, edged } from './util';

const g = () => new THREE.Group();

const cap = (crown: string, brim: string): THREE.Group => {
  const group = g();
  group.add(block(1.8, 0.55, 1.8, crown, 0, 0.27, 0));
  group.add(block(2.1, 0.12, 1.1, brim, 0, 0.02, 0.85));
  return group;
};

const beanie = (color: string, pomColor?: string): THREE.Group => {
  const group = g();
  group.add(block(1.85, 0.8, 1.85, color, 0, 0.38, 0, 0.18));
  if (pomColor) group.add(sphere(0.25, pomColor, 0, 0.95, 0));
  return group;
};

const tophat = (color: string, band?: string): THREE.Group => {
  const group = g();
  group.add(block(2.25, 0.15, 2.25, color, 0, 0.02, 0));
  group.add(block(1.45, 1.35, 1.45, color, 0, 0.82, 0));
  if (band) group.add(block(1.5, 0.18, 1.5, band, 0, 0.22, 0));
  return group;
};

const crown = (color: string, gem: string): THREE.Group => {
  const group = g();
  group.add(block(1.95, 0.55, 1.95, color, 0, 0.28, 0));
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const x = Math.cos(a) * 0.85;
    const z = Math.sin(a) * 0.85;
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.45, 4), mat(color));
    spike.position.set(x, 0.75, z);
    spike.rotation.y = Math.PI / 4;
    group.add(spike);
  }
  const g1 = sphere(0.15, gem, 0, 0.45, 0.95);
  group.add(g1);
  return group;
};

const wizardHat = (color: string, trim: string): THREE.Group => {
  const group = g();
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.85, 1.8, 6), mat(color));
  cone.position.y = 0.95;
  group.add(cone);
  group.add(block(2.4, 0.12, 2.4, trim, 0, 0, 0));
  const star = sphere(0.14, '#ffd84d', 0.35, 1.45, 0.35);
  group.add(star);
  return group;
};

const helmet = (color: string, visor: string): THREE.Group => {
  const group = g();
  group.add(block(1.85, 0.95, 1.85, color, 0, 0.47, 0, 0.35));
  group.add(block(1.9, 0.25, 0.3, visor, 0, 0.25, 0.85));
  return group;
};

const headband = (color: string): THREE.Group => {
  const group = g();
  group.add(block(1.9, 0.22, 1.9, color, 0, 0.1, 0, 0.05));
  return group;
};

const cook = (): THREE.Group => {
  const group = g();
  group.add(block(1.85, 0.2, 1.85, '#ffffff', 0, 0.1, 0));
  const puff = new THREE.Mesh(
    new THREE.SphereGeometry(0.9, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    mat('#ffffff', { rough: 0.95 }),
  );
  puff.position.y = 0.22;
  group.add(puff);
  return group;
};

const propeller = (): THREE.Group => {
  const group = g();
  group.add(block(1.85, 0.7, 1.85, '#5fa8ff', 0, 0.35, 0, 0.25));
  const stick = block(0.08, 0.4, 0.08, '#1d1a14', 0, 0.9, 0);
  group.add(stick);
  for (let i = 0; i < 3; i++) {
    const blade = block(0.6, 0.06, 0.14, '#c24949', 0, 1.08, 0);
    blade.rotation.y = (i * Math.PI * 2) / 3;
    blade.position.x = Math.cos((i * 2 * Math.PI) / 3) * 0.3;
    blade.position.z = Math.sin((i * 2 * Math.PI) / 3) * 0.3;
    group.add(blade);
  }
  return group;
};

export const HATS: Item[] = [
  { id: 'hat-none', category: 'hat', label: '(None)', rarity: 'common', theme: 'school', cost: 0, preowned: true,
    build: () => g() },
  { id: 'hat-cap-red', category: 'hat', label: 'Red Cap', rarity: 'common', theme: 'school', cost: 0, preowned: true,
    build: () => cap('#c24949', '#7a2a18') },
  { id: 'hat-cap-blue', category: 'hat', label: 'Blue Cap', rarity: 'common', theme: 'street', cost: 60,
    build: () => cap('#5fa8ff', '#1b4a8a') },
  { id: 'hat-cap-green', category: 'hat', label: 'Lime Cap', rarity: 'common', theme: 'street', cost: 60,
    build: () => cap('#6fbf73', '#0f5b2e') },
  { id: 'hat-beanie-mint', category: 'hat', label: 'Mint Beanie', rarity: 'common', theme: 'street', cost: 80,
    build: () => beanie('#b6f0c6', '#ffd84d') },
  { id: 'hat-beanie-pink', category: 'hat', label: 'Pink Beanie', rarity: 'uncommon', theme: 'street', cost: 120,
    build: () => beanie('#ffc8e0', '#ffffff') },
  { id: 'hat-headband-red', category: 'hat', label: 'Athlete Band', rarity: 'common', theme: 'school', cost: 40, preowned: true,
    build: () => headband('#c24949') },
  { id: 'hat-headband-gold', category: 'hat', label: 'Champion Band', rarity: 'rare', theme: 'school', cost: 320,
    build: () => headband('#ffd84d') },
  { id: 'hat-tophat-black', category: 'hat', label: 'Top Hat', rarity: 'rare', theme: 'fantasy', cost: 400,
    build: () => tophat('#1d1a14', '#c24949') },
  { id: 'hat-tophat-magic', category: 'hat', label: "Magician's Hat", rarity: 'epic', theme: 'fantasy', cost: 700,
    build: () => tophat('#4d2a8a', '#ffd84d') },
  { id: 'hat-wizard', category: 'hat', label: 'Wizard Hat', rarity: 'epic', theme: 'fantasy', cost: 650,
    build: () => wizardHat('#4d2a8a', '#3a1f6a') },
  { id: 'hat-wizard-mint', category: 'hat', label: 'Sage Hat', rarity: 'rare', theme: 'fantasy', cost: 380,
    build: () => wizardHat('#0f5b2e', '#082f17') },
  { id: 'hat-crown', category: 'hat', label: 'Royal Crown', rarity: 'legendary', theme: 'fantasy', cost: 1200,
    build: () => crown('#ffd84d', '#c69bff') },
  { id: 'hat-helmet', category: 'hat', label: 'Space Helmet', rarity: 'epic', theme: 'subject', cost: 800,
    build: () => helmet('#e4e4e4', '#1d1a14') },
  { id: 'hat-chef', category: 'hat', label: "Chef's Hat", rarity: 'uncommon', theme: 'food', cost: 180,
    build: cook },
  { id: 'hat-propeller', category: 'hat', label: 'Propeller Cap', rarity: 'rare', theme: 'school', cost: 420,
    build: propeller },
];
