import type * as THREE from 'three';
import type { PieceDef, PieceKind, BuildOpts } from './types';
import { WALL_PIECES } from './walls';
import { FLOOR_PIECES } from './floors';
import { ROOF_PIECES, ROOF_CORNERS } from './roofs';
import { CORNER_PIECES } from './corners';
import { STAIRS_PIECES } from './stairs';

export type { PieceKind, PieceDef, BuildOpts };

export const TILE = 2;
export const WALL_HEIGHT = 3;
export const WALL_THICK = 0.15;
export const FLOOR_THICK = 0.1;

/** Complete catalog — one array, indexed by id for O(1) lookup. */
export const PIECES: PieceDef[] = [
  ...FLOOR_PIECES,
  ...WALL_PIECES,
  ...ROOF_PIECES,
  ...ROOF_CORNERS,
  ...CORNER_PIECES,
  ...STAIRS_PIECES,
];

const PIECE_BY_ID: Record<string, PieceDef> = Object.fromEntries(PIECES.map((p) => [p.id, p]));

export function getPiece(id: string): PieceDef | undefined {
  return PIECE_BY_ID[id];
}

export function piecesByKind(kind: PieceKind): PieceDef[] {
  return PIECES.filter((p) => p.kind === kind);
}

/** Default piece id per kind — first entry in each category. */
export const DEFAULT_PIECE: Record<PieceKind, string> = {
  floor:         FLOOR_PIECES[0].id,
  wall:          WALL_PIECES[0].id,
  'wall-window': WALL_PIECES.find((p) => p.kind === 'wall-window')!.id,
  'wall-door':   WALL_PIECES.find((p) => p.kind === 'wall-door')!.id,
  roof:          ROOF_PIECES[0].id,
  'roof-corner': ROOF_CORNERS[0].id,
  corner:        CORNER_PIECES[0].id,
  stairs:        STAIRS_PIECES[0].id,
};

/**
 * Instantiate a piece into a Three.js Group. The caller owns the returned
 * group and is responsible for positioning/rotating it at world scale.
 * Unknown ids get a bright fallback cube so failures don't silently hide
 * the bug.
 */
export function buildPiece(id: string, THREE: typeof import('three')): THREE.Group {
  const def = PIECE_BY_ID[id];
  const opts: BuildOpts = { THREE, tile: TILE, wallHeight: WALL_HEIGHT, wallThick: WALL_THICK, floorThick: FLOOR_THICK };
  if (!def) {
    const g = new THREE.Group();
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(TILE * 0.5, 1, TILE * 0.5),
      new THREE.MeshStandardMaterial({ color: '#ff3bde', emissive: '#ff3bde', emissiveIntensity: 0.3 }),
    );
    mesh.position.y = 0.5;
    g.add(mesh);
    return g;
  }
  return def.build(opts);
}
