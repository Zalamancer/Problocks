/**
 * Kid-style geometry helpers — rounded boxes and sane segment counts.
 *
 * Three.js geometry defaults are the #1 source of "hard-edged CAD" look:
 * BoxGeometry has 90° corners; CylinderGeometry defaults to 8 radial
 * segments. These helpers produce the soft, toy-like shapes that read
 * as Pokopia / Adopt Me / Roblox screenshots instead.
 *
 * See docs/three-kid-style/01-geometry-materials.md.
 */

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export interface KidBoxOptions {
  width?: number;
  height?: number;
  depth?: number;
  /** Bevel radius in world units. 0.12–0.22 for props, 0.08 for walls. */
  radius?: number;
  /** Bevel detail; 4 is the sweet spot. */
  segments?: number;
}

export function kidBox(opts: KidBoxOptions = {}): THREE.BufferGeometry {
  const w = opts.width ?? 1;
  const h = opts.height ?? 1;
  const d = opts.depth ?? 1;
  const r = clamp(opts.radius ?? 0.15, 0, Math.min(w, h, d) * 0.49);
  const seg = opts.segments ?? 4;
  return new RoundedBoxGeometry(w, h, d, seg, r);
}

/**
 * Higher-detail sphere — default Three.js 32×16 has pinched poles visible
 * on character heads. 32×24 hides the pinch with barely-more cost.
 */
export interface KidSphereOptions {
  radius?: number;
  detail?: 0 | 1 | 2;
}

export function kidSphere(opts: KidSphereOptions = {}): THREE.SphereGeometry {
  const r = opts.radius ?? 0.5;
  const d = opts.detail ?? 1;
  const seg = d >= 2 ? 48 : d >= 1 ? 32 : 16;
  return new THREE.SphereGeometry(r, seg, Math.round(seg * 0.75));
}

/**
 * Cylinder with 32 radial segments by default — the Three.js default is 8,
 * which looks like cut crystal under toon lighting.
 */
export interface KidCylinderOptions {
  radiusTop?: number;
  radiusBottom?: number;
  height?: number;
  radialSegments?: number;
  heightSegments?: number;
  openEnded?: boolean;
}

export function kidCylinder(opts: KidCylinderOptions = {}): THREE.CylinderGeometry {
  return new THREE.CylinderGeometry(
    opts.radiusTop ?? 0.5,
    opts.radiusBottom ?? 0.5,
    opts.height ?? 1,
    opts.radialSegments ?? 32,
    opts.heightSegments ?? 1,
    opts.openEnded ?? false,
  );
}

export function kidCone(opts: {
  radius?: number;
  height?: number;
  radialSegments?: number;
} = {}): THREE.ConeGeometry {
  return new THREE.ConeGeometry(
    opts.radius ?? 0.5,
    opts.height ?? 1,
    opts.radialSegments ?? 32,
  );
}

export function kidCapsule(opts: {
  radius?: number;
  length?: number;
  capSegments?: number;
  radialSegments?: number;
} = {}): THREE.CapsuleGeometry {
  return new THREE.CapsuleGeometry(
    opts.radius ?? 0.3,
    opts.length ?? 1,
    opts.capSegments ?? 8,
    opts.radialSegments ?? 32,
  );
}

export function kidTorus(opts: {
  radius?: number;
  tubeRadius?: number;
  radialSegments?: number;
  tubularSegments?: number;
} = {}): THREE.TorusGeometry {
  return new THREE.TorusGeometry(
    opts.radius ?? 0.5,
    opts.tubeRadius ?? 0.15,
    opts.radialSegments ?? 16,
    opts.tubularSegments ?? 32,
  );
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
