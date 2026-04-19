// Voxel-grid raycaster using the Amanatides & Woo traversal. Cheaper
// and more precise than `THREE.Raycaster` for our use (no mesh
// intersection, no boxes), and it hands back both the block that got
// hit and the empty cell right before it — which is where the player
// wants a newly-placed block to land.

import { isSolid } from './blocks.js';

/**
 * Cast a ray through the voxel grid.
 *
 * @param {World} world — the voxel world
 * @param {{x:number,y:number,z:number}} origin — ray start in block units
 * @param {{x:number,y:number,z:number}} dir    — normalized ray direction
 * @param {number} maxDist — maximum distance in blocks (default 6 — matches
 *                           a player's reach)
 * @returns {null | {
 *   hit:   {x:number, y:number, z:number},   // block we hit
 *   place: {x:number, y:number, z:number},   // empty cell adjacent to hit
 *                                            // along the face we entered through
 *   normal:{x:number, y:number, z:number},
 *   dist: number,
 * }}
 */
export function raycastVoxel(world, origin, dir, maxDist = 6) {
  let x = Math.floor(origin.x);
  let y = Math.floor(origin.y);
  let z = Math.floor(origin.z);

  const stepX = dir.x > 0 ? 1 : dir.x < 0 ? -1 : 0;
  const stepY = dir.y > 0 ? 1 : dir.y < 0 ? -1 : 0;
  const stepZ = dir.z > 0 ? 1 : dir.z < 0 ? -1 : 0;

  const tDeltaX = stepX !== 0 ? Math.abs(1 / dir.x) : Infinity;
  const tDeltaY = stepY !== 0 ? Math.abs(1 / dir.y) : Infinity;
  const tDeltaZ = stepZ !== 0 ? Math.abs(1 / dir.z) : Infinity;

  // Distance along the ray to the first boundary in each axis.
  let tMaxX = stepX > 0
    ? ((x + 1) - origin.x) * tDeltaX
    : stepX < 0 ? (origin.x - x) * tDeltaX : Infinity;
  let tMaxY = stepY > 0
    ? ((y + 1) - origin.y) * tDeltaY
    : stepY < 0 ? (origin.y - y) * tDeltaY : Infinity;
  let tMaxZ = stepZ > 0
    ? ((z + 1) - origin.z) * tDeltaZ
    : stepZ < 0 ? (origin.z - z) * tDeltaZ : Infinity;

  // The axis we last stepped on tells us which face we entered through.
  let steppedAxis = -1;
  let dist = 0;

  while (dist <= maxDist) {
    if (world.inBounds(x, y, z)) {
      const id = world.getBlock(x, y, z);
      if (isSolid(id)) {
        // Build the "place" cell by stepping back one along the last axis.
        const normal = { x: 0, y: 0, z: 0 };
        const place = { x, y, z };
        if (steppedAxis === 0) { normal.x = -stepX; place.x -= stepX; }
        else if (steppedAxis === 1) { normal.y = -stepY; place.y -= stepY; }
        else if (steppedAxis === 2) { normal.z = -stepZ; place.z -= stepZ; }
        return { hit: { x, y, z }, place, normal, dist };
      }
    }

    // Advance to the next voxel along the axis with the smallest tMax.
    if (tMaxX < tMaxY && tMaxX < tMaxZ) {
      x += stepX;
      dist = tMaxX;
      tMaxX += tDeltaX;
      steppedAxis = 0;
    } else if (tMaxY < tMaxZ) {
      y += stepY;
      dist = tMaxY;
      tMaxY += tDeltaY;
      steppedAxis = 1;
    } else {
      z += stepZ;
      dist = tMaxZ;
      tMaxZ += tDeltaZ;
      steppedAxis = 2;
    }
  }
  return null;
}
