// Block registry for the voxel engine. Each block has an id, a display
// name, an "opaque" flag (used for face culling — opaque faces adjacent
// to other opaque blocks don't get meshed), and six face tile indices
// into the texture atlas. Tile index = row * ATLAS_COLS + col on a
// ATLAS_COLS × ATLAS_ROWS grid of tiles in the procedurally generated
// atlas (see ./atlas.js).
//
// Face order is [+X, -X, +Y, -Y, +Z, -Z] = [east, west, top, bottom, south, north]
// matching the order used by the mesher.

export const ATLAS_COLS = 8;
export const ATLAS_ROWS = 2;
export const TILE_PX = 16;
export const ATLAS_W = ATLAS_COLS * TILE_PX;
export const ATLAS_H = ATLAS_ROWS * TILE_PX;

// Tile slots in the atlas.
export const TILE = {
  GRASS_TOP:  0,
  GRASS_SIDE: 1,
  DIRT:       2,
  STONE:      3,
  COBBLE:     4,
  LOG_TOP:    5,
  LOG_SIDE:   6,
  PLANKS:     7,
  LEAVES:     8,
  SAND:       9,
  BRICK:      10,
  GLASS:      11,
  WATER:      12,
  GOLD:       13,
  IRON:       14,
  DIAMOND:    15,
};

// Block ids. 0 is always air. Keep ids contiguous and <= 255 so we can
// store them in a Uint8Array.
export const BLOCK = {
  AIR:    0,
  GRASS:  1,
  DIRT:   2,
  STONE:  3,
  COBBLE: 4,
  LOG:    5,
  PLANKS: 6,
  LEAVES: 7,
  SAND:   8,
  BRICK:  9,
  GLASS:  10,
  WATER:  11,
  GOLD:   12,
  IRON:   13,
  DIAMOND:14,
};

// Block defs: index matches block id. Each has name, opaque flag, and
// faces [+X, -X, +Y, -Y, +Z, -Z] using TILE.* above.
export const BLOCK_DEFS = [
  { id: BLOCK.AIR,    name: 'Air',     opaque: false, faces: null },
  { id: BLOCK.GRASS,  name: 'Grass',   opaque: true,
    faces: [TILE.GRASS_SIDE, TILE.GRASS_SIDE, TILE.GRASS_TOP, TILE.DIRT, TILE.GRASS_SIDE, TILE.GRASS_SIDE] },
  { id: BLOCK.DIRT,   name: 'Dirt',    opaque: true,
    faces: [TILE.DIRT, TILE.DIRT, TILE.DIRT, TILE.DIRT, TILE.DIRT, TILE.DIRT] },
  { id: BLOCK.STONE,  name: 'Stone',   opaque: true,
    faces: [TILE.STONE, TILE.STONE, TILE.STONE, TILE.STONE, TILE.STONE, TILE.STONE] },
  { id: BLOCK.COBBLE, name: 'Cobblestone', opaque: true,
    faces: [TILE.COBBLE, TILE.COBBLE, TILE.COBBLE, TILE.COBBLE, TILE.COBBLE, TILE.COBBLE] },
  { id: BLOCK.LOG,    name: 'Log',     opaque: true,
    faces: [TILE.LOG_SIDE, TILE.LOG_SIDE, TILE.LOG_TOP, TILE.LOG_TOP, TILE.LOG_SIDE, TILE.LOG_SIDE] },
  { id: BLOCK.PLANKS, name: 'Planks',  opaque: true,
    faces: [TILE.PLANKS, TILE.PLANKS, TILE.PLANKS, TILE.PLANKS, TILE.PLANKS, TILE.PLANKS] },
  { id: BLOCK.LEAVES, name: 'Leaves',  opaque: true,
    faces: [TILE.LEAVES, TILE.LEAVES, TILE.LEAVES, TILE.LEAVES, TILE.LEAVES, TILE.LEAVES] },
  { id: BLOCK.SAND,   name: 'Sand',    opaque: true,
    faces: [TILE.SAND, TILE.SAND, TILE.SAND, TILE.SAND, TILE.SAND, TILE.SAND] },
  { id: BLOCK.BRICK,  name: 'Brick',   opaque: true,
    faces: [TILE.BRICK, TILE.BRICK, TILE.BRICK, TILE.BRICK, TILE.BRICK, TILE.BRICK] },
  { id: BLOCK.GLASS,  name: 'Glass',   opaque: false,
    faces: [TILE.GLASS, TILE.GLASS, TILE.GLASS, TILE.GLASS, TILE.GLASS, TILE.GLASS] },
  { id: BLOCK.WATER,  name: 'Water',   opaque: false,
    faces: [TILE.WATER, TILE.WATER, TILE.WATER, TILE.WATER, TILE.WATER, TILE.WATER] },
  { id: BLOCK.GOLD,   name: 'Gold',    opaque: true,
    faces: [TILE.GOLD, TILE.GOLD, TILE.GOLD, TILE.GOLD, TILE.GOLD, TILE.GOLD] },
  { id: BLOCK.IRON,   name: 'Iron',    opaque: true,
    faces: [TILE.IRON, TILE.IRON, TILE.IRON, TILE.IRON, TILE.IRON, TILE.IRON] },
  { id: BLOCK.DIAMOND,name: 'Diamond', opaque: true,
    faces: [TILE.DIAMOND, TILE.DIAMOND, TILE.DIAMOND, TILE.DIAMOND, TILE.DIAMOND, TILE.DIAMOND] },
];

// Quick lookups — avoid array indexing in hot loops.
export function isOpaque(id) {
  const def = BLOCK_DEFS[id];
  return def ? def.opaque : false;
}

// Solid = has collision + blocks raycast. For now, same as opaque;
// adjust if we add glass-as-solid-but-transparent later.
export function isSolid(id) {
  return id !== BLOCK.AIR && id !== BLOCK.WATER;
}

// Hot-bar palette order — the blocks the player can place with number
// keys 1..9. Index into BLOCK_DEFS (so 1..N, skipping AIR at 0).
export const HOTBAR = [
  BLOCK.GRASS,
  BLOCK.DIRT,
  BLOCK.STONE,
  BLOCK.COBBLE,
  BLOCK.LOG,
  BLOCK.PLANKS,
  BLOCK.LEAVES,
  BLOCK.SAND,
  BLOCK.BRICK,
];
