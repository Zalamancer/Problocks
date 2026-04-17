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
 * Small helper used by every builder: returns a flat-shaded box mesh
 * with MeshStandardMaterial. Keeps material config consistent.
 */
export function makeBox(
  THREE: typeof import('three'),
  size: { x: number; y: number; z: number },
  color: string,
  pos?: { x?: number; y?: number; z?: number },
  opts?: { roughness?: number; metalness?: number; emissive?: string; emissiveIntensity?: number },
): import('three').Mesh {
  const geo = new THREE.BoxGeometry(size.x, size.y, size.z);
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness: opts?.roughness ?? 0.85,
    metalness: opts?.metalness ?? 0,
    emissive: new THREE.Color(opts?.emissive ?? color),
    emissiveIntensity: opts?.emissiveIntensity ?? 0.18,
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
