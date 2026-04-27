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

/**
 * Minimal tileset shape needed by the resolver. Defined here (instead of
 * importing the store's full Tileset) so this lib stays free of store deps.
 */
export interface TilesetForResolve {
  upperTextureId: string;
  lowerTextureId: string;
  tileIds: string[];
}

/**
 * Pick which tileset to render with for a cell whose 4 corners hold the
 * given texture ids (undefined = "no texture", treat as transparent).
 *
 * Logic:
 *   - 0 unique non-empty textures → returns null (cell is empty).
 *   - 1 unique texture → use any tileset where that texture appears as
 *     UPPER (preferring upper for the "pure upper" pretty fill); else any
 *     tileset where it appears as LOWER. The Wang index falls out as
 *     pure-upper or pure-lower respectively.
 *   - 2 unique textures → find a tileset whose {upperTextureId, lowerTextureId}
 *     equals {a, b} — that's the bridge tileset. Map each corner to 'u'/'l'
 *     based on the tileset's own assignment, and look up the Wang index.
 *   - 3+ unique textures → ambiguous; falls back to the dominant texture's
 *     pure tile (no transition possible without a 3-way bridge).
 */
export interface ResolveResult {
  tileset: TilesetForResolve;
  /** Wang lookup index 0..15. */
  index: number;
}

export function resolveCellTile(
  nw: string | undefined,
  ne: string | undefined,
  sw: string | undefined,
  se: string | undefined,
  tilesets: TilesetForResolve[],
): ResolveResult | null {
  const corners = [nw, ne, sw, se].filter((c): c is string => !!c);
  if (corners.length === 0) return null;

  const unique = Array.from(new Set(corners));

  if (unique.length === 1) {
    const tex = unique[0];
    const upperHit = tilesets.find((t) => t.upperTextureId === tex);
    if (upperHit) return { tileset: upperHit, index: PURE_UPPER_INDEX };
    const lowerHit = tilesets.find((t) => t.lowerTextureId === tex);
    if (lowerHit) return { tileset: lowerHit, index: PURE_LOWER_INDEX };
    return null;
  }

  if (unique.length === 2) {
    const [a, b] = unique;
    const bridge = tilesets.find((t) =>
      (t.upperTextureId === a && t.lowerTextureId === b)
      || (t.upperTextureId === b && t.lowerTextureId === a),
    );
    if (!bridge) {
      // No tileset bridges these two textures — fall back to the dominant
      // corner's pure tile so the user at least sees something.
      const counts: Record<string, number> = {};
      for (const c of corners) counts[c] = (counts[c] ?? 0) + 1;
      const dominant = Object.entries(counts).sort((x, y) => y[1] - x[1])[0][0];
      return resolveCellTile(dominant, dominant, dominant, dominant, tilesets);
    }
    const isUpper = (t: string | undefined): Quadrant => {
      if (!t) return 'l';
      return t === bridge.upperTextureId ? 'u' : 'l';
    };
    const idx = wangIndex(isUpper(nw), isUpper(ne), isUpper(sw), isUpper(se));
    return idx >= 0 ? { tileset: bridge, index: idx } : null;
  }

  // 3+ unique textures in one cell — pick the dominant and fall back.
  const counts: Record<string, number> = {};
  for (const c of corners) counts[c] = (counts[c] ?? 0) + 1;
  const dominant = Object.entries(counts).sort((x, y) => y[1] - x[1])[0][0];
  return resolveCellTile(dominant, dominant, dominant, dominant, tilesets);
}
