/**
 * Kid-style geometry helpers — rounded boxes and sane segment counts.
 *
 * Three.js geometry defaults are the #1 source of "hard-edged CAD" look:
 * BoxGeometry has 90° corners; CylinderGeometry defaults to 8 radial
 * segments. These helpers produce the soft, toy-like shapes that read
 * as Pokopia / Adopt Me / Roblox screenshots instead.
 *
 * Low-end target (Celeron N4000 Chromebook, 4 GB RAM) pushes us to keep
 * segment counts aggressive — every extra ring on a sphere or cap on a
 * cylinder is paid for 100× in a typical plot.
 *
 * **Shared geometry cache** — identical (function, args) calls return the
 * SAME BufferGeometry instance. Trees / flowers / fences are dropped
 * dozens of times; memoising cuts memory and GPU uploads dramatically.
 * Cached geometries carry `userData.__cached = true`; `hydrate.ts` checks
 * this and skips disposal so removing one object doesn't tear down the
 * geometry still used by siblings.
 *
 * See docs/three-kid-style/01-geometry-materials.md.
 */

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// ---- geometry cache --------------------------------------------------

type BG = THREE.BufferGeometry;
const geoCache = new Map<string, BG>();

function cached<T extends BG>(key: string, build: () => T): T {
  const hit = geoCache.get(key);
  if (hit) return hit as T;
  const geo = build();
  (geo.userData as { __cached?: boolean }).__cached = true;
  geoCache.set(key, geo);
  return geo;
}

/** For tests / hot-reload — not exported from the barrel. */
export function _clearKidGeometryCache(): void {
  for (const g of geoCache.values()) g.dispose();
  geoCache.clear();
}

export function isCachedGeometry(g: BG | undefined): boolean {
  return !!(g?.userData as { __cached?: boolean } | undefined)?.__cached;
}

// ---- rounded box ------------------------------------------------------

export interface KidBoxOptions {
  width?: number;
  height?: number;
  depth?: number;
  /** Bevel radius in world units. 0.12–0.22 for props, 0.08 for walls. */
  radius?: number;
  /** Bevel detail. Default 2 (was 4) — double savings on corners with no
      visible difference at the camera distance the studio uses. */
  segments?: number;
}

export function kidBox(opts: KidBoxOptions = {}): BG {
  const w = opts.width ?? 1;
  const h = opts.height ?? 1;
  const d = opts.depth ?? 1;
  const r = clamp(opts.radius ?? 0.15, 0, Math.min(w, h, d) * 0.49);
  const seg = opts.segments ?? 2;
  return cached(`rb:${w}:${h}:${d}:${r}:${seg}`, () => new RoundedBoxGeometry(w, h, d, seg, r));
}

/**
 * Raw flat-sided box — 24 position verts, indexed. ~6× cheaper than
 * kidBox (RoundedBox seg=2 ≈ 150 verts). Use for any box small enough or
 * far enough that the bevel wouldn't be visible under toon shading:
 * fence pickets, rails, small trim pieces, debris blocks. Under the
 * inverted-hull outline the silhouette reads as clean even without a
 * bevel, because the outline itself softens the edge.
 */
export function kidSimpleBox(
  opts: { width?: number; height?: number; depth?: number } = {},
): THREE.BoxGeometry {
  const w = opts.width ?? 1;
  const h = opts.height ?? 1;
  const d = opts.depth ?? 1;
  return cached(`box:${w}:${h}:${d}`, () => new THREE.BoxGeometry(w, h, d)) as THREE.BoxGeometry;
}

/**
 * Pitched-roof triangular prism. 6 unique verts / 18 position verts /
 * 8 triangles — a fraction of what ExtrudeGeometry with bevels spits
 * out. The base sits on y=0; peak is centred on x=0 at the top.
 *
 * Intentionally no bevels or rounded edges: the inverted-hull outline
 * softens the silhouette, and at studio orbit distance the pitched roof
 * reads as a chunky pentagon whether or not the ridge itself is beveled.
 */
export function kidTriPrism(width: number, height: number, depth: number): BG {
  return cached(`prism:${width}:${height}:${depth}`, () => {
    const w = width / 2;
    const d = depth / 2;
    const h = height;
    const g = new THREE.BufferGeometry();
    // 6 vertices — two triangles (front/back) connected by 3 rectangles.
    // Laid out so +Y is up, +Z is front, matching kidBox conventions.
    const positions = new Float32Array([
      // back triangle (z = -d): left, right, peak
      -w, 0, -d,
       w, 0, -d,
       0, h, -d,
      // front triangle (z = +d): left, right, peak
      -w, 0,  d,
       w, 0,  d,
       0, h,  d,
    ]);
    const indices = new Uint16Array([
      // triangular caps
      0, 2, 1,   // back (CCW from outside)
      3, 4, 5,   // front
      // bottom rectangle
      0, 1, 4,   0, 4, 3,
      // left slope
      0, 3, 5,   0, 5, 2,
      // right slope
      1, 2, 5,   1, 5, 4,
    ]);
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setIndex(new THREE.BufferAttribute(indices, 1));
    g.computeVertexNormals();
    return g;
  });
}

// ---- sphere -----------------------------------------------------------

export interface KidSphereOptions {
  radius?: number;
  detail?: 0 | 1 | 2;
}

/**
 * Toon-shaded sphere. Segment counts tuned for Chromebook target:
 *   detail 0 → 10×8   (pebbles, flower centres, blush — small + offscreen-ish)
 *   detail 1 → 16×12  (default — tree canopy, mushroom cap)
 *   detail 2 → 24×18  (hero characters only)
 *
 * Three.js was defaulting to 32×16, which looks barely different from
 * 16×12 at the kid-style camera distance but carries ~4× the vertex
 * weight.
 */
export function kidSphere(opts: KidSphereOptions = {}): THREE.SphereGeometry {
  const r = opts.radius ?? 0.5;
  const d = opts.detail ?? 1;
  const seg = d >= 2 ? 24 : d >= 1 ? 16 : 10;
  const hSeg = Math.max(4, Math.round(seg * 0.75));
  return cached(`sph:${r}:${seg}:${hSeg}`, () => new THREE.SphereGeometry(r, seg, hSeg)) as THREE.SphereGeometry;
}

// ---- cylinder ---------------------------------------------------------

export interface KidCylinderOptions {
  radiusTop?: number;
  radiusBottom?: number;
  height?: number;
  radialSegments?: number;
  heightSegments?: number;
  openEnded?: boolean;
}

/** Default 12 radial segments (was 32). 12 is where a toon-shaded
    cylinder stops reading as faceted at the studio's orbit distance. */
export function kidCylinder(opts: KidCylinderOptions = {}): THREE.CylinderGeometry {
  const rt = opts.radiusTop ?? 0.5;
  const rb = opts.radiusBottom ?? 0.5;
  const h  = opts.height ?? 1;
  const radial = opts.radialSegments ?? 12;
  const hSeg   = opts.heightSegments ?? 1;
  const open   = opts.openEnded ?? false;
  return cached(
    `cyl:${rt}:${rb}:${h}:${radial}:${hSeg}:${open ? 1 : 0}`,
    () => new THREE.CylinderGeometry(rt, rb, h, radial, hSeg, open),
  ) as THREE.CylinderGeometry;
}

// ---- cone -------------------------------------------------------------

export function kidCone(opts: {
  radius?: number;
  height?: number;
  radialSegments?: number;
} = {}): THREE.ConeGeometry {
  const r = opts.radius ?? 0.5;
  const h = opts.height ?? 1;
  const radial = opts.radialSegments ?? 12;
  return cached(`cone:${r}:${h}:${radial}`, () => new THREE.ConeGeometry(r, h, radial)) as THREE.ConeGeometry;
}

// ---- capsule ----------------------------------------------------------

export function kidCapsule(opts: {
  radius?: number;
  length?: number;
  capSegments?: number;
  radialSegments?: number;
} = {}): THREE.CapsuleGeometry {
  const r = opts.radius ?? 0.3;
  const L = opts.length ?? 1;
  const cap = opts.capSegments ?? 3;
  const radial = opts.radialSegments ?? 12;
  return cached(`cap:${r}:${L}:${cap}:${radial}`, () => new THREE.CapsuleGeometry(r, L, cap, radial)) as THREE.CapsuleGeometry;
}

// ---- torus ------------------------------------------------------------

export function kidTorus(opts: {
  radius?: number;
  tubeRadius?: number;
  radialSegments?: number;
  tubularSegments?: number;
} = {}): THREE.TorusGeometry {
  const r  = opts.radius ?? 0.5;
  const tr = opts.tubeRadius ?? 0.15;
  const radial   = opts.radialSegments ?? 8;
  const tubular  = opts.tubularSegments ?? 16;
  return cached(
    `torus:${r}:${tr}:${radial}:${tubular}`,
    () => new THREE.TorusGeometry(r, tr, radial, tubular),
  ) as THREE.TorusGeometry;
}

// ---- utility ----------------------------------------------------------

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
