import type * as THREE from 'three';

/**
 * Modular building kit — procedural (not GLB) pieces generated from
 * Three.js primitives. Style aims for Roblox-Studio-ish simplicity:
 * flat-shaded boxes, saturated colors, no textures, cheap to render
 * on integrated GPUs.
 *
 * Every piece is authored in a canonical local frame, centered at the
 * origin in X and Z, with Y=0 resting on the tile below. Callers apply
 * grid-snap position/rotation at placement time.
 *
 * Wall canonical frame:
 *   runs along X (width = TILE)
 *   thickness on Z (= WALL_THICK)
 *   height on Y  (= WALL_HEIGHT)
 *   bottom sits at y=0
 *
 * Floor/roof canonical frame:
 *   width on X (= TILE), depth on Z (= TILE)
 *   bottom at y=0
 */

export type PieceKind =
  | 'floor'
  | 'wall'
  | 'wall-window'
  | 'wall-door'
  | 'roof'
  | 'roof-corner'
  | 'corner'
  | 'stairs';

export interface BuildOpts {
  /** injected at build time so the kit doesn't pull its own THREE import */
  THREE: typeof import('three');
  tile: number;
  wallHeight: number;
  wallThick: number;
  floorThick: number;
}

export interface PieceDef {
  id: string;
  kind: PieceKind;
  label: string;
  /** hex color chip shown in the palette thumbnail */
  swatch: string;
  /** returns a Group centered at origin in the canonical frame */
  build: (opts: BuildOpts) => THREE.Group;
}

/**
 * Per-face brightness multipliers baked into BoxGeometry vertex colors.
 * BoxGeometry groups its 24 vertices in this face order:
 *   0: +X (right)   1: -X (left)
 *   2: +Y (top)     3: -Y (bottom)
 *   4: +Z (front)   5: -Z (back)
 * Multiplying the base color by these shades gives a "baked shadow"
 * look so same-color walls don't blend together when lit uniformly.
 */
const FACE_SHADE: [number, number, number, number, number, number] = [
  0.88, // +X right
  0.72, // -X left
  1.0,  // +Y top (brightest)
  0.55, // -Y bottom (darkest)
  0.95, // +Z front
  0.70, // -Z back (darker)
];

function applyFaceShade(THREE: typeof import('three'), geo: import('three').BufferGeometry): void {
  const position = geo.getAttribute('position');
  const count = position.count;
  const colors = new Float32Array(count * 3);
  // BoxGeometry is non-indexed groups-style: 4 verts per face * 6 faces = 24
  for (let face = 0; face < 6; face++) {
    const s = FACE_SHADE[face];
    for (let v = 0; v < 4; v++) {
      const i = (face * 4 + v) * 3;
      colors[i    ] = s;
      colors[i + 1] = s;
      colors[i + 2] = s;
    }
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
}

/**
 * Small helper used by every builder: returns a flat-shaded box mesh
 * with MeshStandardMaterial. Keeps material config consistent.
 * Face brightness is baked into vertex colors so each side reads as
 * a distinct shade even when neighbors use the same base color.
 */
export function makeBox(
  THREE: typeof import('three'),
  size: { x: number; y: number; z: number },
  color: string,
  pos?: { x?: number; y?: number; z?: number },
  opts?: { roughness?: number; metalness?: number; emissive?: string; emissiveIntensity?: number },
): import('three').Mesh {
  const geo = new THREE.BoxGeometry(size.x, size.y, size.z);
  applyFaceShade(THREE, geo);
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness: opts?.roughness ?? 1.0,
    metalness: opts?.metalness ?? 0,
    emissive: new THREE.Color(opts?.emissive ?? '#000000'),
    emissiveIntensity: opts?.emissiveIntensity ?? 0,
    vertexColors: true,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(pos?.x ?? 0, pos?.y ?? 0, pos?.z ?? 0);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/** Translucent "glass" — shares tint with window frames. */
export function makeGlass(
  THREE: typeof import('three'),
  size: { x: number; y: number; z: number },
  pos?: { x?: number; y?: number; z?: number },
  color = '#a5d8ff',
): import('three').Mesh {
  const geo = new THREE.BoxGeometry(size.x, size.y, size.z);
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness: 0.1,
    metalness: 0.15,
    transparent: true,
    opacity: 0.55,
    emissive: new THREE.Color(color),
    emissiveIntensity: 0.12,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(pos?.x ?? 0, pos?.y ?? 0, pos?.z ?? 0);
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  return mesh;
}
