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

// ---- performance mode ------------------------------------------------

/**
 * Global perf mode.
 *   'high'    — default chunky-pastel look (rounded boxes, UV spheres).
 *   'low'     — minimal-vert versions that still read as their shape:
 *               flat cubes, 12v icosahedra, 5-sided cylinders, 4-sided
 *               pyramid cones. ~10× vertex drop.
 *   'extreme' — everything becomes a BoxGeometry (8v). Sphere →
 *               2r-side cube; cylinder → 2r × h × 2r prism; cone →
 *               same prism (tapering comes from per-prefab scale);
 *               capsule / torus → bounding-box cube. Minecraft /
 *               voxel silhouette at the lowest possible cost.
 *
 * Cache keys include the mode (`lp:` / `xl:` prefix) so variants can
 * coexist, but we also invalidate the map on mode flip so ram doesn't
 * grow with every variant held in memory.
 */
export type GeometryPerfMode = 'high' | 'low' | 'extreme';
let PERF_MODE: GeometryPerfMode = 'high';

export function getGeometryPerfMode(): GeometryPerfMode {
  return PERF_MODE;
}

/**
 * Set the perf mode. Returns true if the mode actually changed. When it
 * does, invalidates the shared cache (drops map entries but does NOT
 * dispose geometries — existing meshes still reference them and dispose
 * would tear their GPU buffers out mid-render). Callers are expected to
 * force a scene re-hydrate so new meshes get built against the new mode;
 * the old geometries then become unreferenced and GC reclaims them.
 */
export function setGeometryPerfMode(mode: GeometryPerfMode): boolean {
  if (PERF_MODE === mode) return false;
  PERF_MODE = mode;
  invalidateKidGeometryCache();
  return true;
}

// ---- geometry cache --------------------------------------------------

type BG = THREE.BufferGeometry;
const geoCache = new Map<string, BG>();

function cached<T extends BG>(key: string, build: () => T): T {
  const prefix =
    PERF_MODE === 'extreme' ? 'xl:' :
    PERF_MODE === 'low'     ? 'lp:' : '';
  const fullKey = `${prefix}${key}`;
  const hit = geoCache.get(fullKey);
  if (hit) return hit as T;
  const geo = build();
  (geo.userData as { __cached?: boolean }).__cached = true;
  geoCache.set(fullKey, geo);
  return geo;
}

/** Drop cache entries without disposing. Live meshes keep their refs so
    rendering stays intact until the scene is re-hydrated. */
export function invalidateKidGeometryCache(): void {
  geoCache.clear();
}

/** For tests / hot-reload — not exported from the barrel. Disposes as
    well as dropping, so only safe when no meshes still point at these. */
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
  // Low & extreme: flat-sided 8-vertex cube. The inverted-hull outline
  // softens the corners so the missing bevel is invisible at orbit.
  if (PERF_MODE === 'low' || PERF_MODE === 'extreme') {
    return cached(`rb-flat:${w}:${h}:${d}`, () => new THREE.BoxGeometry(w, h, d));
  }
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
  // Extreme: pitched roof → flat-topped slab. House ends up looking
  // like a minecraft-style hip-roofed cube; still reads as "house".
  if (PERF_MODE === 'extreme') {
    return cached(
      `prism-cube:${width}:${height}:${depth}`,
      () => new THREE.BoxGeometry(width, height, depth),
    );
  }
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
export function kidSphere(opts: KidSphereOptions = {}): THREE.BufferGeometry {
  const r = opts.radius ?? 0.5;
  // Extreme: sphere → cube of diameter 2r. Cloud becomes 5 cubes, bush
  // becomes 4 cubes, tree canopy becomes stacked cubes — minecraft-y.
  if (PERF_MODE === 'extreme') {
    const s = r * 2;
    return cached(`sph-cube:${r}`, () => new THREE.BoxGeometry(s, s, s));
  }
  // Low-perf: 20-triangle icosahedron. 12 verts vs 99 for the default UV
  // sphere — reads as a faceted ball which matches the low-poly / voxel
  // aesthetic users opt into when they turn this mode on.
  if (PERF_MODE === 'low') {
    return cached(`sph-ico:${r}`, () => new THREE.IcosahedronGeometry(r, 0));
  }
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
export function kidCylinder(opts: KidCylinderOptions = {}): THREE.BufferGeometry {
  const rt = opts.radiusTop ?? 0.5;
  const rb = opts.radiusBottom ?? 0.5;
  const h  = opts.height ?? 1;
  // Extreme: cylinder → square prism. Tree trunks read as voxel-style
  // wood columns. Width is max of top/bottom radius so tapered columns
  // don't unexpectedly shrink.
  if (PERF_MODE === 'extreme') {
    const s = Math.max(rt, rb) * 2;
    return cached(`cyl-cube:${rt}:${rb}:${h}`, () => new THREE.BoxGeometry(s, h, s));
  }
  // Low-perf: 5 radial segments, 1 height segment, closed. Still reads
  // as round at a glance, at ~1/3 the vert count of the default 12.
  if (PERF_MODE === 'low') {
    return cached(
      `cyl-low:${rt}:${rb}:${h}`,
      () => new THREE.CylinderGeometry(rt, rb, h, 5, 1, false),
    );
  }
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
} = {}): THREE.BufferGeometry {
  const r = opts.radius ?? 0.5;
  const h = opts.height ?? 1;
  // Extreme: cone → flat-topped prism. Each pine-tree tier is already
  // scaled differently, so the stack still reads as a stepped tower.
  if (PERF_MODE === 'extreme') {
    const s = r * 2;
    return cached(`cone-cube:${r}:${h}`, () => new THREE.BoxGeometry(s, h, s));
  }
  // Low-perf: 4 radial segments — a pyramid. Cheapest cone that still
  // reads as pointed (3 would read as a wedge, not a cone).
  if (PERF_MODE === 'low') {
    return cached(`cone-low:${r}:${h}`, () => new THREE.ConeGeometry(r, h, 4));
  }
  const radial = opts.radialSegments ?? 12;
  return cached(`cone:${r}:${h}:${radial}`, () => new THREE.ConeGeometry(r, h, radial)) as THREE.ConeGeometry;
}

// ---- capsule ----------------------------------------------------------

export function kidCapsule(opts: {
  radius?: number;
  length?: number;
  capSegments?: number;
  radialSegments?: number;
} = {}): THREE.BufferGeometry {
  const r = opts.radius ?? 0.3;
  const L = opts.length ?? 1;
  if (PERF_MODE === 'extreme') {
    // Capsule → rectangular prism enclosing the capsule: 2r wide/deep,
    // L + 2r tall (cap hemispheres contribute r each end).
    const s = r * 2;
    return cached(`cap-cube:${r}:${L}`, () => new THREE.BoxGeometry(s, L + 2 * r, s));
  }
  if (PERF_MODE === 'low') {
    return cached(`cap-low:${r}:${L}`, () => new THREE.CapsuleGeometry(r, L, 1, 6));
  }
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
} = {}): THREE.BufferGeometry {
  const r  = opts.radius ?? 0.5;
  const tr = opts.tubeRadius ?? 0.15;
  if (PERF_MODE === 'extreme') {
    // Torus → flat slab bounding box. Not a great representation, but
    // the ring-shaped prefab slot is rare and users already opted into
    // "everything becomes a cube".
    const outer = (r + tr) * 2;
    const thick = tr * 2;
    return cached(`torus-cube:${r}:${tr}`, () => new THREE.BoxGeometry(outer, thick, outer));
  }
  if (PERF_MODE === 'low') {
    return cached(`torus-low:${r}:${tr}`, () => new THREE.TorusGeometry(r, tr, 4, 8));
  }
  const radial   = opts.radialSegments ?? 8;
  const tubular  = opts.tubularSegments ?? 16;
  return cached(
    `torus:${r}:${tr}:${radial}:${tubular}`,
    () => new THREE.TorusGeometry(r, tr, radial, tubular),
  ) as THREE.TorusGeometry;
}

// ---- instanced mesh builder ------------------------------------------

export interface InstanceTransform {
  position: [number, number, number];
  /** Optional scale (uniform or per-axis). Defaults to 1. */
  scale?: number | [number, number, number];
  /** Optional Euler rotation in radians. Defaults to 0,0,0. */
  rotation?: [number, number, number];
}

/**
 * Build an InstancedMesh from a geometry + material + a list of per-
 * instance transforms. Writes matrices once (not updated each frame)
 * and leaves instanceMatrix.needsUpdate = true so the first render
 * picks them up.
 *
 * Use for N repeated sub-parts of a single prefab — fence pickets,
 * flower petals, bush blobs, cloud puffs. Collapses N separate Mesh
 * draw calls + N outline draw calls into 2 total.
 */
export function kidInstanced(
  geometry: BG,
  material: THREE.Material,
  transforms: InstanceTransform[],
): THREE.InstancedMesh {
  const mesh = new THREE.InstancedMesh(geometry, material, transforms.length);
  const m = new THREE.Matrix4();
  const pos = new THREE.Vector3();
  const rot = new THREE.Euler();
  const quat = new THREE.Quaternion();
  const scl = new THREE.Vector3();
  for (let i = 0; i < transforms.length; i++) {
    const t = transforms[i];
    pos.set(t.position[0], t.position[1], t.position[2]);
    if (t.rotation) rot.set(t.rotation[0], t.rotation[1], t.rotation[2]);
    else rot.set(0, 0, 0);
    quat.setFromEuler(rot);
    if (typeof t.scale === 'number') scl.set(t.scale, t.scale, t.scale);
    else if (t.scale) scl.set(t.scale[0], t.scale[1], t.scale[2]);
    else scl.set(1, 1, 1);
    m.compose(pos, quat, scl);
    mesh.setMatrixAt(i, m);
  }
  mesh.instanceMatrix.needsUpdate = true;
  return mesh;
}

// ---- utility ----------------------------------------------------------

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
