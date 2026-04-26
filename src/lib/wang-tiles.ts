/**
 * Wang/dual-grid corner auto-tile lookup.
 *
 * A Wang tileset is a 4×4 sheet with two base textures — UPPER (the painted
 * "fill") and LOWER (the empty background) — plus 14 transition tiles. Each
 * cell in the source sheet is encoded by which texture occupies its 4
 * quadrants:
 *
 *   Q1 = NE (top-right)
 *   Q2 = NW (top-left)
 *   Q3 = SW (bottom-left)
 *   Q4 = SE (bottom-right)
 *
 * The user's reference layout (1-indexed, row-major) is hard-coded below. The
 * "pure lower" tile lives at (col=3, row=2) → idx 6 and the "pure upper" tile
 * at (col=1, row=4) → idx 12 — we pull those out so the renderer can short-
 * circuit fully-empty cells.
 *
 * The map data model is corner-based: the editor stores a sparse set of
 * "filled corners" per layer. To pick a tile for visible cell (cx, cy) the
 * renderer reads the 4 surrounding corners — (cx,cy), (cx+1,cy), (cx,cy+1),
 * (cx+1,cy+1) — encodes them as a quadrant string, and looks up the index.
 */

export type Quadrant = 'u' | 'l';

/** Tile index for a "pure lower" cell — every quadrant is the empty texture. */
export const PURE_LOWER_INDEX = 6;
/** Tile index for a "pure upper" cell — every quadrant is the painted texture. */
export const PURE_UPPER_INDEX = 12;

/**
 * Map of "Q1,Q2,Q3,Q4" (NE,NW,SW,SE) to the index in the 4×4 sheet
 * (row-major, 0..15). Derived from the user's reference layout.
 */
export const WANG_LOOKUP: Record<string, number> = {
  // Row 0
  'u,u,l,u':  0,  // (col=1, row=1) — outer corner SW
  'u,l,u,l':  1,  // (col=2, row=1) — diagonal NE-SW
  'l,u,l,l':  2,  // (col=3, row=1) — inner corner NE
  'u,u,l,l':  3,  // (col=4, row=1) — edge S
  // Row 1
  'l,u,u,l':  4,  // (col=1, row=2) — diagonal (mirror)
  'u,l,l,l':  5,  // (col=2, row=2) — outer corner NW (small upper at NE)
  'l,l,l,l':  6,  // (col=3, row=2) — pure lower
  'l,l,l,u':  7,  // (col=4, row=2) — outer corner NW
  // Row 2
  'u,l,u,u':  8,  // (col=1, row=3) — inner corner SE
  'l,l,u,u':  9,  // (col=2, row=3) — edge N
  'l,l,u,l': 10,  // (col=3, row=3) — outer corner SW
  'l,u,l,u': 11,  // (col=4, row=3) — diagonal
  // Row 3
  'u,u,u,u': 12,  // (col=1, row=4) — pure upper
  'u,u,u,l': 13,  // (col=2, row=4) — inner corner SW
  'u,l,l,u': 14,  // (col=3, row=4) — diagonal
  'l,u,u,u': 15,  // (col=4, row=4) — inner corner NW
};

/**
 * Look up the Wang tile index for a 4-corner pattern. Quadrants are passed
 * in the order (NE, NW, SW, SE). Returns -1 if no tile matches (defensive —
 * the table is exhaustive over u/l combinations so this should not fire).
 */
export function wangIndex(ne: Quadrant, nw: Quadrant, sw: Quadrant, se: Quadrant): number {
  const key = `${ne},${nw},${sw},${se}`;
  const idx = WANG_LOOKUP[key];
  return idx === undefined ? -1 : idx;
}

/**
 * Pick the Wang tile index given booleans for the 4 corners (true = upper).
 * Convenience wrapper so the renderer doesn't have to map booleans → 'u'/'l'
 * by hand on every cell.
 */
export function wangIndexFromBools(ne: boolean, nw: boolean, sw: boolean, se: boolean): number {
  return wangIndex(
    ne ? 'u' : 'l',
    nw ? 'u' : 'l',
    sw ? 'u' : 'l',
    se ? 'u' : 'l',
  );
}

/** True when at least one corner is "upper" (i.e., the cell needs to render). */
export function anyCornerSet(ne: boolean, nw: boolean, sw: boolean, se: boolean): boolean {
  return ne || nw || sw || se;
}
