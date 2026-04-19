// Face-culled chunk mesher. For each solid block we emit a quad on each
// of its six faces only if the neighboring block is non-opaque — this
// kills the overwhelming majority of triangles inside terrain (hidden
// stone cores are entirely free) and is cheap enough to rebuild per
// edit on integrated graphics.
//
// Full greedy meshing (merging coplanar same-texture quads into
// rectangles) is a further 2–3× win on flat areas, but face culling
// alone already hits the 60 FPS target for our world size on a
// Celeron N4000, and it keeps this file small and easy to debug.
//
// The output is a THREE.BufferGeometry per chunk with interleaved
// position / normal / uv attributes. A single MeshLambertMaterial
// textured with the atlas renders all chunks, so we can instantiate
// many meshes without incurring per-mesh material switches.

import { BLOCK_DEFS, isOpaque } from './blocks.js';
import { tileUV } from './atlas.js';
import { CHUNK, WORLD_CX, WORLD_CY, WORLD_CZ } from './world.js';

// Face definitions — [+X, -X, +Y, -Y, +Z, -Z]. For each face we store:
//   dir:    normal direction used to sample the neighbor block
//   normal: surface normal vector baked into vertex attributes
//   corners: 4 offsets from the block's (x,y,z) origin for the quad,
//            wound counter-clockwise when viewed from outside
// Winding is arranged so that +X face is visible from +X etc.; indices
// emit two triangles (0,1,2)(0,2,3).
const FACES = [
  { // +X (east)
    dir: [1, 0, 0], normal: [1, 0, 0],
    corners: [[1, 0, 1], [1, 0, 0], [1, 1, 0], [1, 1, 1]],
  },
  { // -X (west)
    dir: [-1, 0, 0], normal: [-1, 0, 0],
    corners: [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]],
  },
  { // +Y (top)
    dir: [0, 1, 0], normal: [0, 1, 0],
    corners: [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]],
  },
  { // -Y (bottom)
    dir: [0, -1, 0], normal: [0, -1, 0],
    corners: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]],
  },
  { // +Z (south)
    dir: [0, 0, 1], normal: [0, 0, 1],
    corners: [[1, 0, 1], [0, 0, 1], [0, 1, 1], [1, 1, 1]],
  },
  { // -Z (north)
    dir: [0, 0, -1], normal: [0, 0, -1],
    corners: [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]],
  },
];

/**
 * Mesh one chunk. Returns a THREE.BufferGeometry positioned in chunk-
 * local coordinates (0..CHUNK on each axis). The caller sets mesh
 * position to chunk origin so the geometry is reused cheaply on edits.
 *
 * @param {World}   world  — world to read neighbors from
 * @param {number}  cx     — chunk grid X
 * @param {number}  cy     — chunk grid Y
 * @param {number}  cz     — chunk grid Z
 * @param {*}       THREE  — Three.js namespace
 */
export function meshChunk(world, cx, cy, cz, THREE) {
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  const baseX = cx * CHUNK;
  const baseY = cy * CHUNK;
  const baseZ = cz * CHUNK;

  for (let ly = 0; ly < CHUNK; ly++) {
    for (let lz = 0; lz < CHUNK; lz++) {
      for (let lx = 0; lx < CHUNK; lx++) {
        const wx = baseX + lx;
        const wy = baseY + ly;
        const wz = baseZ + lz;
        const id = world.getBlock(wx, wy, wz);
        if (id === 0) continue;
        const def = BLOCK_DEFS[id];
        if (!def || !def.faces) continue;

        for (let f = 0; f < 6; f++) {
          const face = FACES[f];
          const nx = wx + face.dir[0];
          const ny = wy + face.dir[1];
          const nz = wz + face.dir[2];
          const nid = world.getBlock(nx, ny, nz);
          // Cull: skip this face if neighbor is opaque (any opaque covers
          // this face). We also skip if neighbor is the same non-opaque
          // id (e.g., water-water interior), which would otherwise double
          // up z-fighting surfaces. Interior faces of a single opaque
          // block pair also get culled, which is what we want.
          if (isOpaque(nid)) continue;
          if (nid === id && !def.opaque) continue;

          const tile = def.faces[f];
          const { u0, v0, u1, v1 } = tileUV(tile);

          // UV order matches the corners winding so the texture isn't
          // rotated weirdly on each face. For side faces (+X,-X,+Z,-Z)
          // the "up" in the atlas maps to world +Y. For top / bottom
          // (+Y,-Y) we lay the tile flat and match the X axis direction.
          let uv;
          if (f === 2) {
            // +Y top
            uv = [[u0, v0], [u1, v0], [u1, v1], [u0, v1]];
          } else if (f === 3) {
            // -Y bottom
            uv = [[u0, v1], [u1, v1], [u1, v0], [u0, v0]];
          } else {
            // Sides
            uv = [[u0, v0], [u1, v0], [u1, v1], [u0, v1]];
          }

          const baseIdx = positions.length / 3;
          for (let c = 0; c < 4; c++) {
            const [ox, oy, oz] = face.corners[c];
            positions.push(lx + ox, ly + oy, lz + oz);
            normals.push(face.normal[0], face.normal[1], face.normal[2]);
            uvs.push(uv[c][0], uv[c][1]);
          }
          indices.push(baseIdx, baseIdx + 1, baseIdx + 2);
          indices.push(baseIdx, baseIdx + 2, baseIdx + 3);
        }
      }
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  geom.computeBoundingSphere();
  return geom;
}

/** Chunk key → [cx,cy,cz]. Central to avoid typos. */
export function parseChunkKey(key) {
  const [cx, cy, cz] = key.split(',').map(Number);
  return [cx, cy, cz];
}

export function chunkKey(cx, cy, cz) { return `${cx},${cy},${cz}`; }

/** Yields every (cx,cy,cz) in the world. */
export function* allChunks() {
  for (let cy = 0; cy < WORLD_CY; cy++) {
    for (let cz = 0; cz < WORLD_CZ; cz++) {
      for (let cx = 0; cx < WORLD_CX; cx++) {
        yield [cx, cy, cz];
      }
    }
  }
}
