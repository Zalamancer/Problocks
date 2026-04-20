// Backpacks, accessories (face/head additions), and pets.
// Same naming convention as clothing.ts: top-level Group whose immediate
// children are named after a rig joint ('torso', 'head', 'handR', 'root').
import * as THREE from 'three';
import type { Item } from '../types';
import { block, sphere, mat } from './util';

const g = () => new THREE.Group();
const named = (o: THREE.Object3D, n: string) => { o.name = n; return o; };

// ───── Backpacks ─────
// Mounted on torso (back face). Torso depth = 1, so back is at z = -0.5.

const backpack = (color: string, strapColor = '#1d1a14', extras?: (g: THREE.Group) => void): THREE.Group => {
  const root = g();
  const back = g(); back.name = 'torso';
  back.add(block(1.6, 1.7, 0.55, color, 0, -0.05, -0.85, 0.12));
  back.add(block(0.18, 1.6, 0.18, strapColor, -0.7, 0.0, -0.4, 0.05));
  back.add(block(0.18, 1.6, 0.18, strapColor, 0.7, 0.0, -0.4, 0.05));
  extras?.(back);
  root.add(back);
  return root;
};

// ───── Accessories ─────
// Glasses sit on the head (front, ~head Z=0.81); halos hover above head.

const glasses = (frame: string, lens: string): THREE.Group => {
  const root = g();
  const head = g(); head.name = 'head';
  head.add(block(0.45, 0.32, 0.05, frame, -0.32, 0.05, 0.83, 0.05));
  head.add(block(0.45, 0.32, 0.05, frame, 0.32, 0.05, 0.83, 0.05));
  head.add(block(0.18, 0.04, 0.05, frame, 0, 0.05, 0.83, 0.02));
  head.add(block(0.4, 0.27, 0.02, lens, -0.32, 0.05, 0.86, 0.03));
  head.add(block(0.4, 0.27, 0.02, lens, 0.32, 0.05, 0.86, 0.03));
  root.add(head);
  return root;
};

const halo = (color: string): THREE.Group => {
  const root = g();
  const head = g(); head.name = 'head';
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.55, 0.08, 8, 24),
    mat(color, { metal: 0.4, rough: 0.3 }),
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 1.05;
  head.add(ring);
  root.add(head);
  return root;
};

const wings = (color: string): THREE.Group => {
  const root = g();
  const back = g(); back.name = 'torso';
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 4; i++) {
      const x = side * (0.75 + i * 0.18);
      const y = 0.4 - i * 0.25;
      const w = 0.55 - i * 0.05;
      const piece = block(w, 0.45, 0.12, color, x, y, -0.85, 0.08);
      back.add(piece);
    }
  }
  root.add(back);
  return root;
};

const necktie = (color: string): THREE.Group => {
  const root = g();
  const torso = g(); torso.name = 'torso';
  torso.add(block(0.32, 0.32, 0.08, color, 0, 0.85, 0.55, 0.04));
  torso.add(block(0.36, 1.0, 0.08, color, 0, 0.2, 0.55, 0.04));
  root.add(torso);
  return root;
};

const scarf = (color: string): THREE.Group => {
  const root = g();
  const torso = g(); torso.name = 'torso';
  torso.add(block(2.2, 0.35, 1.2, color, 0, 0.85, 0, 0.1));
  torso.add(block(0.4, 1.1, 0.18, color, 0.45, 0.2, 0.6, 0.05));
  root.add(torso);
  return root;
};

const monocle = (): THREE.Group => {
  const root = g();
  const head = g(); head.name = 'head';
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.04, 6, 16), mat('#ffd84d', { metal: 0.5 }));
  ring.position.set(0.32, 0.05, 0.83);
  ring.rotation.y = Math.PI / 2;
  head.add(ring);
  head.add(block(0.34, 0.25, 0.02, '#b9d9ff', 0.32, 0.05, 0.83, 0.02));
  root.add(head);
  return root;
};

// ───── Pets ─────
// Pets float next to the character on the pedestal. Mount: 'root'.

const petBase = (color: string, eyeColor = '#1d1a14') => (extras?: (g: THREE.Group) => void): THREE.Group => {
  const root = g();
  const r = g(); r.name = 'root';
  // Pet hovers to the right of the character's left foot.
  r.position.set(2.2, -1.2, 0.5);
  r.add(block(0.7, 0.6, 0.7, color, 0, 0.3, 0, 0.18));
  r.add(sphere(0.06, eyeColor, -0.18, 0.4, 0.36, 8));
  r.add(sphere(0.06, eyeColor, 0.18, 0.4, 0.36, 8));
  extras?.(r);
  root.add(r);
  return root;
};

const cat = () => petBase('#3a3c4a')((p) => {
  p.add(block(0.18, 0.22, 0.18, '#3a3c4a', -0.18, 0.7, 0, 0.04));
  p.add(block(0.18, 0.22, 0.18, '#3a3c4a', 0.18, 0.7, 0, 0.04));
  p.add(block(0.12, 0.5, 0.12, '#3a3c4a', 0.45, 0.25, -0.4, 0.04));
});

const dog = () => petBase('#c9a173')((p) => {
  p.add(block(0.5, 0.4, 0.5, '#c9a173', 0, 0.75, 0.2, 0.12));
  p.add(block(0.16, 0.35, 0.1, '#a06a3f', -0.18, 0.85, 0.18, 0.04));
  p.add(block(0.16, 0.35, 0.1, '#a06a3f', 0.18, 0.85, 0.18, 0.04));
});

const rabbit = () => petBase('#ffffff', '#c24949')((p) => {
  p.add(block(0.1, 0.5, 0.1, '#ffffff', -0.13, 0.85, 0, 0.04));
  p.add(block(0.1, 0.5, 0.1, '#ffffff', 0.13, 0.85, 0, 0.04));
  p.add(sphere(0.13, '#ffc8e0', 0, 0.35, -0.4, 8));
});

const slime = () => {
  const root = g();
  const r = g(); r.name = 'root';
  r.position.set(2.2, -1.2, 0.5);
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.45, 14, 12), mat('#6fbf73', { rough: 0.4 }));
  body.scale.set(1, 0.7, 1);
  body.position.y = 0.32;
  r.add(body);
  r.add(sphere(0.06, '#1d1a14', -0.13, 0.38, 0.32, 8));
  r.add(sphere(0.06, '#1d1a14', 0.13, 0.38, 0.32, 8));
  root.add(r);
  return root;
};

const dragonling = () => {
  const root = g();
  const r = g(); r.name = 'root';
  r.position.set(2.2, -1.0, 0.5);
  r.add(block(0.7, 0.55, 0.85, '#7a2a18', 0, 0.3, 0, 0.18));
  r.add(block(0.42, 0.4, 0.4, '#7a2a18', 0, 0.7, 0.42, 0.1));
  for (let s = -1; s <= 1; s += 2) {
    r.add(block(0.45, 0.4, 0.05, '#c24949', s * 0.5, 0.55, 0, 0.04));
  }
  r.add(sphere(0.06, '#ffd84d', -0.12, 0.78, 0.6, 8));
  r.add(sphere(0.06, '#ffd84d', 0.12, 0.78, 0.6, 8));
  root.add(r);
  return root;
};

// ───── Catalogs ─────

export const BACKPACKS: Item[] = [
  { id: 'bag-none', category: 'backpack', label: '(None)', rarity: 'common', theme: 'school', cost: 0, preowned: true, build: () => g() },
  { id: 'bag-school-blue', category: 'backpack', label: 'Blue Backpack', rarity: 'common', theme: 'school', cost: 0, preowned: true, build: () => backpack('#5fa8ff') },
  { id: 'bag-school-red', category: 'backpack', label: 'Red Backpack', rarity: 'common', theme: 'school', cost: 80, build: () => backpack('#c24949') },
  { id: 'bag-school-mint', category: 'backpack', label: 'Mint Backpack', rarity: 'common', theme: 'school', cost: 80, build: () => backpack('#b6f0c6') },
  { id: 'bag-jet', category: 'backpack', label: 'Jetpack', rarity: 'epic', theme: 'subject', cost: 760,
    build: () => backpack('#b9b9b9', '#1d1a14', (b) => {
      b.add(block(0.4, 0.4, 0.4, '#ff8a73', -0.4, -0.95, -0.85, 0.1));
      b.add(block(0.4, 0.4, 0.4, '#ff8a73', 0.4, -0.95, -0.85, 0.1));
    }) },
  { id: 'bag-quiver', category: 'backpack', label: 'Arrow Quiver', rarity: 'rare', theme: 'fantasy', cost: 380,
    build: () => backpack('#3d2718', '#1d1a14', (b) => {
      for (let i = 0; i < 4; i++) b.add(block(0.08, 0.6, 0.08, '#ffd84d', -0.2 + i * 0.13, 0.65, -0.85, 0.02));
    }) },
  { id: 'bag-lunchbox', category: 'backpack', label: 'Lunch Box', rarity: 'uncommon', theme: 'food', cost: 160,
    build: () => backpack('#ff8a73', '#7a2a18', (b) => {
      b.add(block(1.2, 0.18, 0.05, '#ffffff', 0, 0.05, -1.13, 0.02));
    }) },
];

export const ACCESSORIES: Item[] = [
  { id: 'acc-none', category: 'accessory', label: '(None)', rarity: 'common', theme: 'school', cost: 0, preowned: true, build: () => g() },
  { id: 'acc-glasses-round', category: 'accessory', label: 'Round Glasses', rarity: 'common', theme: 'school', cost: 80, build: () => glasses('#1d1a14', '#9ad7ff') },
  { id: 'acc-glasses-thick', category: 'accessory', label: 'Thick Frames', rarity: 'uncommon', theme: 'school', cost: 160, build: () => glasses('#3d2718', '#9ad7ff') },
  { id: 'acc-shades', category: 'accessory', label: 'Shades', rarity: 'rare', theme: 'street', cost: 320, build: () => glasses('#1d1a14', '#1d1a14') },
  { id: 'acc-monocle', category: 'accessory', label: 'Monocle', rarity: 'epic', theme: 'fantasy', cost: 540, build: monocle },
  { id: 'acc-tie', category: 'accessory', label: 'Necktie', rarity: 'common', theme: 'school', cost: 60, preowned: true, build: () => necktie('#c24949') },
  { id: 'acc-bowtie', category: 'accessory', label: 'Bow Tie', rarity: 'uncommon', theme: 'school', cost: 140,
    build: () => {
      const root = g(); const torso = g(); torso.name = 'torso';
      torso.add(block(0.5, 0.25, 0.1, '#c24949', 0, 0.85, 0.55, 0.04));
      torso.add(block(0.12, 0.18, 0.12, '#7a2a18', 0, 0.85, 0.6, 0.03));
      root.add(torso); return root;
    } },
  { id: 'acc-scarf', category: 'accessory', label: 'Scarf', rarity: 'uncommon', theme: 'school', cost: 180, build: () => scarf('#c24949') },
  { id: 'acc-halo', category: 'accessory', label: 'Halo', rarity: 'legendary', theme: 'fantasy', cost: 1200, build: () => halo('#ffd84d') },
  { id: 'acc-wings', category: 'accessory', label: 'Angel Wings', rarity: 'legendary', theme: 'fantasy', cost: 1400, build: () => wings('#ffffff') },
  { id: 'acc-bat-wings', category: 'accessory', label: 'Bat Wings', rarity: 'epic', theme: 'fantasy', cost: 720, build: () => wings('#1d1a14') },
];

export const PETS: Item[] = [
  { id: 'pet-none', category: 'pet', label: '(None)', rarity: 'common', theme: 'school', cost: 0, preowned: true, build: () => g() },
  { id: 'pet-cat', category: 'pet', label: 'Kitten', rarity: 'rare', theme: 'street', cost: 360, build: cat },
  { id: 'pet-dog', category: 'pet', label: 'Puppy', rarity: 'rare', theme: 'street', cost: 360, build: dog },
  { id: 'pet-rabbit', category: 'pet', label: 'Bunny', rarity: 'uncommon', theme: 'school', cost: 220, build: rabbit },
  { id: 'pet-slime', category: 'pet', label: 'Slime', rarity: 'epic', theme: 'fantasy', cost: 620, build: slime },
  { id: 'pet-dragon', category: 'pet', label: 'Dragonling', rarity: 'legendary', theme: 'fantasy', cost: 1500, build: dragonling },
];
