// Cheap deterministic terrain generator. Uses a couple of overlaid sine
// waves for rolling hills and a hash-based "noise" function for local
// variation. No external dependencies — perlin/simplex would be nicer
// but add complexity we don't need for a first build.
//
// Produces a heightmap, then fills stone up to heightmap-3, dirt for
// the top 3 layers, and a grass cap on the surface. A handful of
// scattered trees give the world visual anchors so the player can tell
// which way they're facing when they first spawn.

import { BLOCK } from './blocks.js';
import { WORLD_W, WORLD_H, WORLD_D } from './world.js';

function hash2(x, z) {
  // Cheap integer hash -> [0,1).
  let h = (x | 0) * 374761393 + (z | 0) * 668265263;
  h = (h ^ (h >>> 13)) * 1274126177;
  h = h ^ (h >>> 16);
  return ((h >>> 0) % 10000) / 10000;
}

function heightAt(x, z) {
  // Two low-freq sines + a tiny hash wobble. Keep max height well under
  // WORLD_H so the player has room to build upward.
  const base = 10;
  const a = Math.sin(x * 0.12) * 2.2;
  const b = Math.cos(z * 0.09) * 2.0;
  const c = Math.sin((x + z) * 0.05) * 1.6;
  const wob = (hash2(x, z) - 0.5) * 1.4;
  const h = Math.round(base + a + b + c + wob);
  return Math.max(2, Math.min(WORLD_H - 4, h));
}

function placeTree(world, x, y, z) {
  // 4-block trunk with a 3x3x3 leafy cube on top, chamfered corners.
  const trunkH = 4;
  for (let i = 0; i < trunkH; i++) world.setBlock(x, y + i, z, BLOCK.LOG);
  const ly = y + trunkH;
  for (let dy = 0; dy < 3; dy++) {
    for (let dz = -2; dz <= 2; dz++) {
      for (let dx = -2; dx <= 2; dx++) {
        const r = Math.abs(dx) + Math.abs(dz) + dy;
        if (r > 3) continue;
        const bx = x + dx;
        const by = ly + dy;
        const bz = z + dz;
        if (world.getBlock(bx, by, bz) === BLOCK.AIR) {
          world.setBlock(bx, by, bz, BLOCK.LEAVES);
        }
      }
    }
  }
  // Top cap.
  world.setBlock(x, ly + 3, z, BLOCK.LEAVES);
}

/**
 * Fill `world` with terrain. Call once on a freshly-constructed World
 * (all AIR) — re-calling on a modified world will overwrite edits.
 */
export function generateTerrain(world) {
  for (let z = 0; z < WORLD_D; z++) {
    for (let x = 0; x < WORLD_W; x++) {
      const h = heightAt(x, z);
      for (let y = 0; y < h - 3; y++) world.setBlock(x, y, z, BLOCK.STONE);
      for (let y = Math.max(0, h - 3); y < h; y++) world.setBlock(x, y, z, BLOCK.DIRT);
      world.setBlock(x, h, z, BLOCK.GRASS);
    }
  }

  // Sand pads near low spots so beaches read as beaches.
  for (let z = 0; z < WORLD_D; z++) {
    for (let x = 0; x < WORLD_W; x++) {
      const h = heightAt(x, z);
      if (h <= 8) world.setBlock(x, h, z, BLOCK.SAND);
    }
  }

  // Scatter trees with a per-cell probability, skipping flat clusters.
  for (let z = 4; z < WORLD_D - 4; z += 3) {
    for (let x = 4; x < WORLD_W - 4; x += 3) {
      const r = hash2(x + 101, z + 47);
      if (r > 0.08) continue;
      const h = heightAt(x, z);
      if (h < 10) continue; // don't plant on sand
      placeTree(world, x, h + 1, z);
    }
  }
}

/** Find a safe spawn Y above the heightmap at the world center. */
export function spawnPoint() {
  const x = (WORLD_W / 2) | 0;
  const z = (WORLD_D / 2) | 0;
  const y = heightAt(x, z) + 2;
  return { x: x + 0.5, y: y + 1.6, z: z + 0.5 };
}
