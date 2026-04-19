// Public entry for the voxel engine. Keeps the surface area small so a
// future extraction into a standalone package (see
// docs/voxel-engine-external-repo-plan.md) is drop-in.

export { createVoxelEngine } from './engine.js';
export { HOTBAR, BLOCK, BLOCK_DEFS } from './blocks.js';
export { WORLD_W, WORLD_H, WORLD_D } from './world.js';
export { TEXTURE_PACKS, DEFAULT_TEXTURE_PACK } from './atlas.js';
