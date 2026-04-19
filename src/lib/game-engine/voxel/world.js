// Chunked world storage. The world is a fixed-size 3D grid of blocks
// stored as a single flat Uint8Array for each chunk. Size constants are
// exported so the mesher and raycaster can agree.
//
// Chunk size is deliberately small (16×16×16) so that re-meshing a
// single chunk after an edit stays under a few ms on a Celeron N4000.
// The world defaults to a modest footprint (128×32×128) for the same
// reason — big enough to feel like a world, small enough to mesh all
// chunks during startup in one go.

import { BLOCK, isOpaque } from './blocks.js';

export const CHUNK = 16;           // blocks per chunk axis
export const WORLD_CX = 8;         // chunks along X
export const WORLD_CY = 2;         // chunks along Y (vertical)
export const WORLD_CZ = 8;         // chunks along Z
export const WORLD_W = CHUNK * WORLD_CX; // 128
export const WORLD_H = CHUNK * WORLD_CY; // 32
export const WORLD_D = CHUNK * WORLD_CZ; // 128

export class World {
  constructor() {
    // One Uint8Array per chunk so edits invalidate a bounded surface.
    this.chunks = new Array(WORLD_CX * WORLD_CY * WORLD_CZ);
    for (let i = 0; i < this.chunks.length; i++) {
      this.chunks[i] = new Uint8Array(CHUNK * CHUNK * CHUNK);
    }
  }

  chunkIndex(cx, cy, cz) {
    return (cy * WORLD_CZ + cz) * WORLD_CX + cx;
  }

  // Block-in-chunk linear index. Stored x-major, then z, then y, so
  // iterating y outer / z middle / x inner traverses the array in
  // order (important for the mesher's hot loop).
  blockIndex(lx, ly, lz) {
    return (ly * CHUNK + lz) * CHUNK + lx;
  }

  inBounds(x, y, z) {
    return x >= 0 && x < WORLD_W && y >= 0 && y < WORLD_H && z >= 0 && z < WORLD_D;
  }

  getBlock(x, y, z) {
    if (!this.inBounds(x, y, z)) return BLOCK.AIR;
    const cx = (x / CHUNK) | 0;
    const cy = (y / CHUNK) | 0;
    const cz = (z / CHUNK) | 0;
    const lx = x - cx * CHUNK;
    const ly = y - cy * CHUNK;
    const lz = z - cz * CHUNK;
    return this.chunks[this.chunkIndex(cx, cy, cz)][this.blockIndex(lx, ly, lz)];
  }

  /** Like getBlock but treats out-of-bounds as AIR explicitly. */
  getOpaqueAt(x, y, z) {
    return isOpaque(this.getBlock(x, y, z));
  }

  /**
   * Set a block. Returns an array of affected chunk keys ("cx,cy,cz")
   * so the caller can mark them dirty. Neighboring chunks are included
   * when the edit touches a chunk boundary because their faces may no
   * longer be culled.
   */
  setBlock(x, y, z, id) {
    if (!this.inBounds(x, y, z)) return [];
    const cx = (x / CHUNK) | 0;
    const cy = (y / CHUNK) | 0;
    const cz = (z / CHUNK) | 0;
    const lx = x - cx * CHUNK;
    const ly = y - cy * CHUNK;
    const lz = z - cz * CHUNK;
    const arr = this.chunks[this.chunkIndex(cx, cy, cz)];
    const idx = this.blockIndex(lx, ly, lz);
    if (arr[idx] === id) return [];
    arr[idx] = id;

    const dirty = [`${cx},${cy},${cz}`];
    if (lx === 0 && cx > 0) dirty.push(`${cx - 1},${cy},${cz}`);
    if (lx === CHUNK - 1 && cx < WORLD_CX - 1) dirty.push(`${cx + 1},${cy},${cz}`);
    if (ly === 0 && cy > 0) dirty.push(`${cx},${cy - 1},${cz}`);
    if (ly === CHUNK - 1 && cy < WORLD_CY - 1) dirty.push(`${cx},${cy + 1},${cz}`);
    if (lz === 0 && cz > 0) dirty.push(`${cx},${cy},${cz - 1}`);
    if (lz === CHUNK - 1 && cz < WORLD_CZ - 1) dirty.push(`${cx},${cy},${cz + 1}`);
    return dirty;
  }

  allChunkKeys() {
    const keys = [];
    for (let cy = 0; cy < WORLD_CY; cy++)
      for (let cz = 0; cz < WORLD_CZ; cz++)
        for (let cx = 0; cx < WORLD_CX; cx++)
          keys.push(`${cx},${cy},${cz}`);
    return keys;
  }

  /**
   * Serialize to a plain object that round-trips through JSON. Each
   * chunk is base64-encoded to keep saves compact.
   */
  serialize() {
    const out = { w: WORLD_W, h: WORLD_H, d: WORLD_D, chunks: [] };
    for (let i = 0; i < this.chunks.length; i++) {
      out.chunks.push(bytesToB64(this.chunks[i]));
    }
    return out;
  }

  /** Rehydrate from a serialize() payload. Silently bails on size mismatch. */
  loadSerialized(data) {
    if (!data || data.w !== WORLD_W || data.h !== WORLD_H || data.d !== WORLD_D) return false;
    if (!Array.isArray(data.chunks) || data.chunks.length !== this.chunks.length) return false;
    for (let i = 0; i < this.chunks.length; i++) {
      const bytes = b64ToBytes(data.chunks[i]);
      if (bytes.length !== this.chunks[i].length) return false;
      this.chunks[i].set(bytes);
    }
    return true;
  }
}

function bytesToB64(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return typeof btoa !== 'undefined' ? btoa(s) : Buffer.from(s, 'binary').toString('base64');
}
function b64ToBytes(b64) {
  const s = typeof atob !== 'undefined' ? atob(b64) : Buffer.from(b64, 'base64').toString('binary');
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}
