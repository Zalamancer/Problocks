// Hair builders — sit on top of the head, under any hat.
import * as THREE from 'three';
import type { Item } from '../types';
import { block, sphere } from './util';

const g = () => new THREE.Group();

const shortH = (color: string): THREE.Group => {
  const group = g();
  group.add(block(1.72, 0.45, 1.72, color, 0, 0.05, 0, 0.1));
  group.add(block(1.75, 0.15, 0.15, color, 0, -0.1, 0.82, 0.04));
  return group;
};

const spikeH = (color: string): THREE.Group => {
  const group = g();
  group.add(block(1.72, 0.35, 1.72, color, 0, 0, 0, 0.08));
  for (let i = 0; i < 5; i++) {
    const a = ((i - 2) / 5) * Math.PI * 0.8;
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.55, 5), new THREE.MeshStandardMaterial({ color, roughness: 0.9 }));
    spike.position.set(Math.cos(a) * 0.35, 0.4, Math.sin(a) * 0.2);
    spike.rotation.z = (Math.random() - 0.5) * 0.3;
    group.add(spike);
  }
  return group;
};

const longH = (color: string): THREE.Group => {
  const group = g();
  group.add(block(1.78, 0.5, 1.78, color, 0, 0.05, 0, 0.1));
  group.add(block(1.82, 1.5, 0.32, color, 0, -0.6, -0.72, 0.08));
  group.add(block(0.35, 1.3, 1.75, color, -0.72, -0.5, 0, 0.08));
  group.add(block(0.35, 1.3, 1.75, color, 0.72, -0.5, 0, 0.08));
  return group;
};

const bunH = (color: string): THREE.Group => {
  const group = g();
  group.add(block(1.72, 0.35, 1.72, color, 0, 0, 0, 0.1));
  group.add(sphere(0.4, color, 0, 0.55, -0.1, 14));
  return group;
};

const ponytailH = (color: string): THREE.Group => {
  const group = g();
  group.add(block(1.78, 0.45, 1.78, color, 0, 0.05, 0, 0.1));
  group.add(block(0.55, 1.1, 0.55, color, 0, -0.4, -0.95, 0.12));
  return group;
};

const afroH = (color: string): THREE.Group => {
  const group = g();
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2;
    const r = 0.85 + Math.random() * 0.1;
    group.add(sphere(0.38, color, Math.cos(a) * r * 0.6, 0.25 + Math.sin(i) * 0.15, Math.sin(a) * r * 0.6, 10));
  }
  group.add(sphere(0.55, color, 0, 0.5, 0, 12));
  return group;
};

const mohawkH = (color: string): THREE.Group => {
  const group = g();
  group.add(block(1.7, 0.3, 1.7, '#1d1a14', 0, 0, 0, 0.08));
  for (let i = 0; i < 5; i++) {
    const z = -0.55 + i * 0.28;
    const height = 0.4 + Math.sin(i) * 0.2;
    group.add(block(0.2, height, 0.22, color, 0, 0.22 + height / 2, z, 0.04));
  }
  return group;
};

export const HAIRS: Item[] = [
  { id: 'hair-none', category: 'hair', label: '(Bald)', rarity: 'common', theme: 'school', cost: 0, preowned: true, build: () => g() },
  { id: 'hair-short-brown', category: 'hair', label: 'Short Brown', rarity: 'common', theme: 'school', cost: 0, preowned: true, build: () => shortH('#3a2a1a') },
  { id: 'hair-short-black', category: 'hair', label: 'Short Black', rarity: 'common', theme: 'school', cost: 0, preowned: true, build: () => shortH('#1d1a14') },
  { id: 'hair-short-blond', category: 'hair', label: 'Short Blond', rarity: 'common', theme: 'school', cost: 80, build: () => shortH('#f2c85c') },
  { id: 'hair-short-red', category: 'hair', label: 'Short Ginger', rarity: 'uncommon', theme: 'school', cost: 120, build: () => shortH('#c24949') },
  { id: 'hair-long-brown', category: 'hair', label: 'Long Brown', rarity: 'common', theme: 'school', cost: 0, preowned: true, build: () => longH('#3a2a1a') },
  { id: 'hair-long-black', category: 'hair', label: 'Long Black', rarity: 'common', theme: 'fantasy', cost: 0, preowned: true, build: () => longH('#1d1a14') },
  { id: 'hair-long-silver', category: 'hair', label: 'Silver Flow', rarity: 'rare', theme: 'fantasy', cost: 380, build: () => longH('#d8d3c7') },
  { id: 'hair-long-pink', category: 'hair', label: 'Pastel Pink', rarity: 'epic', theme: 'street', cost: 520, build: () => longH('#ffc8e0') },
  { id: 'hair-bun', category: 'hair', label: 'Top Bun', rarity: 'common', theme: 'school', cost: 120, build: () => bunH('#3a2a1a') },
  { id: 'hair-bun-purple', category: 'hair', label: 'Purple Bun', rarity: 'rare', theme: 'street', cost: 300, build: () => bunH('#c69bff') },
  { id: 'hair-ponytail', category: 'hair', label: 'Ponytail', rarity: 'common', theme: 'school', cost: 100, build: () => ponytailH('#3a2a1a') },
  { id: 'hair-spike', category: 'hair', label: 'Spike', rarity: 'uncommon', theme: 'street', cost: 180, build: () => spikeH('#1d1a14') },
  { id: 'hair-spike-blue', category: 'hair', label: 'Anime Blue', rarity: 'rare', theme: 'street', cost: 380, build: () => spikeH('#5fa8ff') },
  { id: 'hair-afro', category: 'hair', label: 'Afro', rarity: 'rare', theme: 'street', cost: 340, build: () => afroH('#1d1a14') },
  { id: 'hair-mohawk', category: 'hair', label: 'Mohawk', rarity: 'epic', theme: 'street', cost: 520, build: () => mohawkH('#c24949') },
];
