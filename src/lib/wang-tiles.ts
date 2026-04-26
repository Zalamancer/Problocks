/**
 * Wang/dual-grid corner auto-tile lookup.
 *
 * A Wang tileset is a 4×4 sheet with two base textures — UPPER (the painted
 * "fill") and LOWER (the empty background) — plus 14 transition tiles. Each
 * cell in the source sheet is encoded by which texture occupies its 4
 * quadrants, in **reading order** of the 2×2 quadrant grid:
 *
 *   Q1 = NW (top-left)
 *   Q2 = NE (top-right)
 *   Q3 = SW (bottom-left)
 *   Q4 = SE (bottom-right)
 *
 * NB this is NOT the (NE, NW, SW, SE) convention used by the older
 * Problocks_Light code — the user's PNGs are encoded TL → TR → BL → BR
 * (row-major), so we swap the first two quadrants compared to that. The
 * keys themselves are the same strings; only the field they're mapped to
 * differs. The "Pure lower" tile sits at (col=3, row=2) → idx 6 and the
 * "Pure upper" at (col=1, row=4) → idx 12.
 */

export type Quadrant = 'u' | 'l';

/** Tile index for a "pure lower" cell — every quadrant is the empty texture. */
export const PURE_LOWER_INDEX = 6;
/** Tile index for a "pure upper" cell — every quadrant is the painted texture. */
export const PURE_UPPER_INDEX = 12;

/**
 * Map of "Q1,Q2,Q3,Q4" (NW, NE, SW, SE) to the index in the 4×4 sheet
 * (row-major, 0..15). Derived from the user's reference layout.
 */
export const WANG_LOOKUP: Record<string, number> = {
  // Row 0
  'u,u,l,u':  0,  // (col=1, row=1)
  'u,l,u,l':  1,  // (col=2, row=1) — vertical stripe (left=upper, right=lower)
  'l,u,l,l':  2,  // (col=3, row=1)
  'u,u,l,l':  3,  // (col=4, row=1) — horizontal: upper top, lower bottom
  // Row 1
  'l,u,u,l':  4,  // (col=1, row=2) — diagonal NE-SW
  'u,l,l,l':  5,  // (col=2, row=2) — outer corner: just NW is upper
  'l,l,l,l':  6,  // (col=3, row=2) — pure lower
  'l,l,l,u':  7,  // (col=4, row=2) — outer corner: just SE is upper
  // Row 2
  'u,l,u,u':  8,  // (col=1, row=3)
  'l,l,u,u':  9,  // (col=2, row=3) — horizontal: lower top, upper bottom
  'l,l,u,l': 10,  // (col=3, row=3)
  'l,u,l,u': 11,  // (col=4, row=3) — vertical stripe (right=upper, left=lower)
  // Row 3
  'u,u,u,u': 12,  // (col=1, row=4) — pure upper
  'u,u,u,l': 13,  // (col=2, row=4)
  'u,l,l,u': 14,  // (col=3, row=4) — diagonal NW-SE
  'l,u,u,u': 15,  // (col=4, row=4)
};

/**
 * Look up the Wang tile index for a 4-corner pattern. Quadrants are passed
 * in the order (NW, NE, SW, SE) — reading order of a 2×2 grid. Returns -1
 * if no tile matches (defensive — the table is exhaustive over u/l combos
 * so this should not fire).
 */
export function wangIndex(nw: Quadrant, ne: Quadrant, sw: Quadrant, se: Quadrant): number {
  const key = `${nw},${ne},${sw},${se}`;
  const idx = WANG_LOOKUP[key];
  return idx === undefined ? -1 : idx;
}

/**
 * Pick the Wang tile index given booleans for the 4 corners (true = upper).
 * Order is (NW, NE, SW, SE) — reading order of a 2×2 grid.
 */
export function wangIndexFromBools(nw: boolean, ne: boolean, sw: boolean, se: boolean): number {
  return wangIndex(
    nw ? 'u' : 'l',
    ne ? 'u' : 'l',
    sw ? 'u' : 'l',
    se ? 'u' : 'l',
  );
}

/** True when at least one corner is "upper" (i.e., the cell needs to render). */
export function anyCornerSet(nw: boolean, ne: boolean, sw: boolean, se: boolean): boolean {
  return nw || ne || sw || se;
}

/**
 * Reverse map of the lookup: given a tile index 0..15, return the four
 * quadrants in the order [NW, NE, SW, SE]. Used by the debug overlay so
 * we can visualise what the code thinks each tile in the user's PNG encodes.
 */
export const TILE_INDEX_TO_QUADRANTS: Record<number, [Quadrant, Quadrant, Quadrant, Quadrant]> = (() => {
  const out: Record<number, [Quadrant, Quadrant, Quadrant, Quadrant]> = {};
  for (const [code, idx] of Object.entries(WANG_LOOKUP)) {
    out[idx] = code.split(',') as [Quadrant, Quadrant, Quadrant, Quadrant];
  }
  return out;
})();
