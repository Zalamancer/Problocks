// Shirt, pants, shoes builders.
//
// Mount convention: each builder returns a Group whose immediate children
// are named to match a rig joint ('torso', 'armL', 'armR', 'legL', 'legR',
// 'footL', 'footR'). AvatarScene reparents each child into the matching
// joint group so clothing animates with the body.
import * as THREE from 'three';
import type { Item } from '../types';
import { block, mat, rbox } from './util';

const g = () => new THREE.Group();

const named = (obj: THREE.Object3D, name: string): THREE.Object3D => {
  obj.name = name;
  return obj;
};

// ───── Shirts ─────
// Torso base geometry is 2.0w x 2.0h x 1.0d — overlays are slightly larger
// so they read as fabric.

const shirtBase = (color: string, extras?: (overlay: THREE.Group) => void): THREE.Group => {
  const overlay = g();
  overlay.add(block(2.08, 2.08, 1.08, color, 0, 0, 0, 0.1));
  extras?.(overlay);
  return named(overlay, 'torso') as THREE.Group;
};

const withSleeve = (parent: THREE.Group, color: string): void => {
  // Short sleeves — stubs that live on the arm groups so they follow the arm.
  const sleeveL = block(1.08, 0.55, 1.08, color, 0, 0.85, 0, 0.12);
  sleeveL.name = 'armL';
  const sleeveR = block(1.08, 0.55, 1.08, color, 0, 0.85, 0, 0.12);
  sleeveR.name = 'armR';
  parent.add(sleeveL, sleeveR);
};

const longSleeves = (parent: THREE.Group, color: string): void => {
  const sleeveL = block(1.08, 1.95, 1.08, color, 0, 0, 0, 0.12);
  sleeveL.name = 'armL';
  const sleeveR = block(1.08, 1.95, 1.08, color, 0, 0, 0, 0.12);
  sleeveR.name = 'armR';
  parent.add(sleeveL, sleeveR);
};

const shirt = (color: string, sleeveColor?: string, deco?: (body: THREE.Group) => void): THREE.Group => {
  const root = g();
  const body = shirtBase(color, deco);
  root.add(body);
  if (sleeveColor) withSleeve(root, sleeveColor);
  return root;
};

const longShirt = (body: string, sleeves: string, deco?: (b: THREE.Group) => void): THREE.Group => {
  const root = g();
  root.add(shirtBase(body, deco));
  longSleeves(root, sleeves);
  return root;
};

// ───── Pants ─────

const pants = (color: string, hipExtras?: (g: THREE.Group) => void, shin = true): THREE.Group => {
  const root = g();
  const L = g(); L.name = 'legL';
  const R = g(); R.name = 'legR';
  const full = shin ? 2.05 : 1.0;
  const y = shin ? 0 : 0.5;
  L.add(block(1.08, full, 1.08, color, 0, y, 0, 0.1));
  R.add(block(1.08, full, 1.08, color, 0, y, 0, 0.1));
  hipExtras?.(L); hipExtras?.(R);
  root.add(L, R);
  return root;
};

const skirt = (color: string): THREE.Group => {
  const root = g();
  const torso = g(); torso.name = 'torso';
  const cone = new THREE.Mesh(new THREE.ConeGeometry(1.35, 1.15, 4, 1, true), mat(color));
  cone.rotation.y = Math.PI / 4;
  cone.position.y = -1.5;
  torso.add(cone);
  root.add(torso);
  return root;
};

// ───── Shoes ─────

const shoe = (color: string, sole = '#1d1a14'): THREE.Group => {
  const root = g();
  const L = g(); L.name = 'footL';
  const R = g(); R.name = 'footR';
  L.add(block(1.12, 0.35, 1.4, color, 0, -1.15, 0.15, 0.1));
  L.add(block(1.12, 0.12, 1.4, sole, 0, -1.36, 0.15, 0.05));
  R.add(block(1.12, 0.35, 1.4, color, 0, -1.15, 0.15, 0.1));
  R.add(block(1.12, 0.12, 1.4, sole, 0, -1.36, 0.15, 0.05));
  root.add(L, R);
  return root;
};

// ───── Catalog ─────

export const SHIRTS: Item[] = [
  { id: 'shirt-none', category: 'shirt', label: '(Bare)', rarity: 'common', theme: 'school', cost: 0, preowned: true, build: () => g() },
  { id: 'shirt-green',  category: 'shirt', label: 'Mint Tee',  rarity: 'common', theme: 'school', cost: 0, preowned: true, build: () => shirt('#6fbf73', '#6fbf73') },
  { id: 'shirt-red',    category: 'shirt', label: 'Red Tee',   rarity: 'common', theme: 'school', cost: 60, build: () => shirt('#c24949', '#c24949') },
  { id: 'shirt-blue',   category: 'shirt', label: 'Blue Tee',  rarity: 'common', theme: 'school', cost: 60, build: () => shirt('#5fa8ff', '#5fa8ff') },
  { id: 'shirt-yellow', category: 'shirt', label: 'Butter Tee', rarity: 'common', theme: 'school', cost: 60, build: () => shirt('#ffd84d', '#ffd84d') },
  { id: 'shirt-stripes', category: 'shirt', label: 'Striped Tee', rarity: 'uncommon', theme: 'street', cost: 180,
    build: () => shirt('#ffffff', '#ffffff', (t) => {
      for (let i = 0; i < 4; i++) t.add(block(2.12, 0.18, 1.12, '#1d1a14', 0, 0.7 - i * 0.45, 0, 0.04));
    }) },
  { id: 'shirt-uniform', category: 'shirt', label: 'School Uniform', rarity: 'uncommon', theme: 'school', cost: 160,
    build: () => longShirt('#1b4a8a', '#1b4a8a', (t) => {
      t.add(block(2.12, 0.35, 1.12, '#ffffff', 0, 0.85, 0, 0.04));
      t.add(block(0.22, 0.55, 1.12, '#c24949', 0, 0.42, 0, 0.04));
    }) },
  { id: 'shirt-hoodie', category: 'shirt', label: 'Hoodie', rarity: 'rare', theme: 'street', cost: 380,
    build: () => longShirt('#3a3c4a', '#3a3c4a', (t) => {
      t.add(block(1.3, 0.4, 0.15, '#ffffff', 0, -0.6, 0.55, 0.04));
      t.add(block(0.08, 0.6, 0.08, '#e0d5b8', -0.18, -0.3, 0.56, 0.03));
      t.add(block(0.08, 0.6, 0.08, '#e0d5b8', 0.18, -0.3, 0.56, 0.03));
    }) },
  { id: 'shirt-labcoat', category: 'shirt', label: 'Lab Coat', rarity: 'rare', theme: 'subject', cost: 420,
    build: () => longShirt('#ffffff', '#ffffff', (t) => {
      t.add(block(0.3, 0.35, 1.12, '#c9d4e4', -0.55, -0.6, 0, 0.04));
      t.add(block(0.3, 0.35, 1.12, '#c9d4e4', 0.55, -0.6, 0, 0.04));
    }) },
  { id: 'shirt-jersey', category: 'shirt', label: 'Team Jersey', rarity: 'uncommon', theme: 'school', cost: 220,
    build: () => shirt('#c24949', '#c24949', (t) => {
      t.add(block(2.12, 0.6, 1.12, '#ffffff', 0, 0.3, 0, 0.04));
    }) },
  { id: 'shirt-wizard', category: 'shirt', label: "Wizard's Robe", rarity: 'epic', theme: 'fantasy', cost: 650,
    build: () => longShirt('#4d2a8a', '#4d2a8a', (t) => {
      t.add(block(2.12, 0.2, 1.12, '#ffd84d', 0, -0.95, 0, 0.04));
    }) },
  { id: 'shirt-armor', category: 'shirt', label: 'Plate Armor', rarity: 'epic', theme: 'fantasy', cost: 720,
    build: () => shirt('#b9b9b9', '#8a8a8a', (t) => {
      t.add(block(2.12, 0.3, 1.12, '#ffd84d', 0, 0.9, 0, 0.04));
      t.add(block(0.5, 0.5, 1.12, '#c24949', 0, -0.1, 0, 0.04));
    }) },
  { id: 'shirt-apron', category: 'shirt', label: "Baker's Apron", rarity: 'rare', theme: 'food', cost: 380,
    build: () => shirt('#ffffff', '#ffc8e0', (t) => {
      t.add(block(1.4, 1.8, 1.12, '#ffc8e0', 0, -0.1, 0, 0.04));
    }) },
  { id: 'shirt-tuxedo', category: 'shirt', label: 'Tuxedo', rarity: 'legendary', theme: 'fantasy', cost: 980,
    build: () => longShirt('#1d1a14', '#1d1a14', (t) => {
      t.add(block(0.3, 1.6, 1.12, '#ffffff', 0, -0.2, 0, 0.04));
      t.add(block(0.25, 0.3, 1.12, '#c24949', 0, 0.72, 0, 0.04));
    }) },
];

export const PANTS: Item[] = [
  { id: 'pants-none',  category: 'pants', label: '(Bare)', rarity: 'common', theme: 'school', cost: 0, preowned: true, build: () => g() },
  { id: 'pants-navy',  category: 'pants', label: 'Navy Jeans', rarity: 'common', theme: 'school', cost: 0, preowned: true, build: () => pants('#3a3c4a') },
  { id: 'pants-black', category: 'pants', label: 'Black Jeans', rarity: 'common', theme: 'street', cost: 60, build: () => pants('#1d1a14') },
  { id: 'pants-blue',  category: 'pants', label: 'Blue Jeans', rarity: 'common', theme: 'school', cost: 60, build: () => pants('#5fa8ff') },
  { id: 'pants-khaki', category: 'pants', label: 'Khakis', rarity: 'common', theme: 'school', cost: 80, build: () => pants('#c9a173') },
  { id: 'pants-shorts', category: 'pants', label: 'Shorts', rarity: 'common', theme: 'street', cost: 60, preowned: true, build: () => pants('#6fbf73', undefined, false) },
  { id: 'pants-track', category: 'pants', label: 'Track Pants', rarity: 'uncommon', theme: 'street', cost: 200,
    build: () => pants('#1d1a14', (leg) => {
      leg.add(block(0.18, 2.05, 0.08, '#ffffff', 0.55, 0, 0.55, 0.02));
    }) },
  { id: 'pants-skirt-red', category: 'pants', label: 'Red Skirt', rarity: 'uncommon', theme: 'school', cost: 180, build: () => skirt('#c24949') },
  { id: 'pants-skirt-plaid', category: 'pants', label: 'Plaid Skirt', rarity: 'rare', theme: 'school', cost: 320, build: () => skirt('#4d2a8a') },
  { id: 'pants-wizard', category: 'pants', label: 'Wizard Pants', rarity: 'epic', theme: 'fantasy', cost: 480, build: () => pants('#3a1f6a') },
  { id: 'pants-armor', category: 'pants', label: 'Greaves', rarity: 'epic', theme: 'fantasy', cost: 520, build: () => pants('#b9b9b9') },
];

export const SHOES: Item[] = [
  { id: 'shoes-none',   category: 'shoes', label: '(Barefoot)', rarity: 'common', theme: 'school', cost: 0, preowned: true, build: () => g() },
  { id: 'shoes-sneaker-white', category: 'shoes', label: 'White Sneakers', rarity: 'common', theme: 'school', cost: 0, preowned: true, build: () => shoe('#ffffff') },
  { id: 'shoes-sneaker-black', category: 'shoes', label: 'Black Sneakers', rarity: 'common', theme: 'street', cost: 80, build: () => shoe('#1d1a14', '#e4e4e4') },
  { id: 'shoes-sneaker-red', category: 'shoes', label: 'Red Runners', rarity: 'uncommon', theme: 'street', cost: 180, build: () => shoe('#c24949') },
  { id: 'shoes-boots', category: 'shoes', label: 'Combat Boots', rarity: 'rare', theme: 'fantasy', cost: 320, build: () => shoe('#3d2718', '#1d1a14') },
  { id: 'shoes-galoshes', category: 'shoes', label: 'Rainboots', rarity: 'uncommon', theme: 'school', cost: 140, build: () => shoe('#ffd84d', '#c24949') },
  { id: 'shoes-glass', category: 'shoes', label: 'Glass Slippers', rarity: 'legendary', theme: 'fantasy', cost: 1100, build: () => shoe('#b9d9ff') },
];
