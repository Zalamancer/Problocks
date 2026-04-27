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
 *
 * Optional `name` + per-side labels feed the sibling-aware brush remap so
 * two independently-uploaded sheets can be treated as sharing a texture
 * even when their pure-tile bytes differ (PixelLab generations etc.).
 * `upperLabel`/`lowerLabel` win when present; otherwise the parser
 * derives them from `name` (e.g. "grass-water" → "grass" + "water").
 */
export interface TilesetForResolve {
  upperTextureId: string;
  lowerTextureId: string;
  tileIds: string[];
  name?: string;
  upperLabel?: string;
  lowerLabel?: string;
  /** Carried through so renderers can pick the active variant's slice
   *  data URL via `tileDataUrlFor` without a separate Tileset lookup. */
  variants?: Array<{ id: string; name: string; sheetDataUrl: string; tileDataUrls: string[] }>;
  activeVariantIndex?: number;
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

/**
 * Build a label-based canonical key for a texture id. When two different
 * texture ids carry the same terrain label (own `upperLabel`/`lowerLabel`
 * or parsed sheet name), they collapse to the same canonical key —
 * letting the resolver treat them as one texture even though their
 * underlying ids differ.
 *
 * Returns the texture id itself when no label is known, so unlabeled
 * textures still behave exactly like before.
 */
function canonicalTextureKey(texId: string, tilesets: TilesetForResolve[]): string {
  const label = getTextureLabel(texId, tilesets);
  return label ? `__label__:${label}` : texId;
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

  // Collapse texture ids by label so two independently-uploaded sheets
  // both labelled "grass" act as a single texture. Tilesets are similarly
  // re-keyed so bridge lookups happen on canonical keys, not raw UUIDs.
  const canonicalCorners = corners.map((c) => canonicalTextureKey(c, tilesets));
  const cnw = nw ? canonicalTextureKey(nw, tilesets) : undefined;
  const cne = ne ? canonicalTextureKey(ne, tilesets) : undefined;
  const csw = sw ? canonicalTextureKey(sw, tilesets) : undefined;
  const cse = se ? canonicalTextureKey(se, tilesets) : undefined;
  const canonicalTilesets = tilesets.map((t) => ({
    raw: t,
    upperKey: canonicalTextureKey(t.upperTextureId, tilesets),
    lowerKey: canonicalTextureKey(t.lowerTextureId, tilesets),
  }));

  const unique = Array.from(new Set(canonicalCorners));

  if (unique.length === 1) {
    const tex = unique[0];
    const upperHit = canonicalTilesets.find((t) => t.upperKey === tex);
    if (upperHit) return { tileset: upperHit.raw, index: PURE_UPPER_INDEX };
    const lowerHit = canonicalTilesets.find((t) => t.lowerKey === tex);
    if (lowerHit) return { tileset: lowerHit.raw, index: PURE_LOWER_INDEX };
    return null;
  }

  if (unique.length === 2) {
    const [a, b] = unique;
    const bridge = canonicalTilesets.find((t) =>
      (t.upperKey === a && t.lowerKey === b)
      || (t.upperKey === b && t.lowerKey === a),
    );
    if (!bridge) {
      // No tileset bridges these two textures (raw or canonical) — fall back
      // to the dominant corner's pure tile.
      const counts: Record<string, number> = {};
      for (const c of corners) counts[c] = (counts[c] ?? 0) + 1;
      const dominant = Object.entries(counts).sort((x, y) => y[1] - x[1])[0][0];
      return resolveCellTile(dominant, dominant, dominant, dominant, tilesets);
    }
    const isUpper = (t: string | undefined): Quadrant => {
      if (!t) return 'l';
      return t === bridge.upperKey ? 'u' : 'l';
    };
    const idx = wangIndex(isUpper(cnw), isUpper(cne), isUpper(csw), isUpper(cse));
    return idx >= 0 ? { tileset: bridge.raw, index: idx } : null;
  }

  // 3+ unique textures in one cell — pick the dominant and fall back.
  const counts: Record<string, number> = {};
  for (const c of corners) counts[c] = (counts[c] ?? 0) + 1;
  const dominant = Object.entries(counts).sort((x, y) => y[1] - x[1])[0][0];
  return resolveCellTile(dominant, dominant, dominant, dominant, tilesets);
}

// ── Sibling-aware brush remap ─────────────────────────────────────────
// Two independently-uploaded tilesets (e.g. grass→water and grass→dirt)
// each get their own UUID for "grass", so a corner painted with one cannot
// bridge to a corner painted with the other — the auto-tile resolver sees
// two unrelated textures and falls back to a hard edge. The user-facing
// fix: at paint time, recognise that the brush's tileset and another
// tileset share the same upper/lower SPRITE (the pure-upper or pure-lower
// tile bytes), treat those texture ids as siblings, and swap the brush to
// whichever sibling actually bridges with the surrounding region. This
// way clicking "grass" on either sheet just paints "grass" — the system
// picks the right id for the local context.

/** Tile sprite map needed for sibling detection — a record from tile id
 *  to its dataUrl. Wider `Tile` shapes (with width/height/etc.) are
 *  structurally compatible. */
export type TileSpriteMap = Record<string, { dataUrl: string }>;

/**
 * Parse a sheet name into its [upper, lower] terrain labels by splitting
 * on common separators (`->`, `→`, `-`, `_`, `/`, `|`, ` to `). Returns
 * null when the name has no recognisable two-part shape. Lowercased so
 * "Grass" and "grass" count as the same label.
 *
 * Examples:
 *   "grass-water" → ["grass", "water"]
 *   "Grass → Dirt" → ["grass", "dirt"]
 *   "grass to water" → ["grass", "water"]
 *   "tileset1" → null
 */
export function parseSheetName(name: string | undefined | null): [string, string] | null {
  if (!name) return null;
  const norm = name.toLowerCase().trim();
  if (!norm) return null;
  const patterns: RegExp[] = [
    /^(.+?)\s*->\s*(.+)$/,
    /^(.+?)\s*→\s*(.+)$/,
    /^(.+?)\s+to\s+(.+)$/i,
    /^(.+?)\s*[-_/|]\s*(.+)$/,
  ];
  for (const p of patterns) {
    const m = norm.match(p);
    if (!m) continue;
    const a = m[1].trim();
    const b = m[2].trim();
    if (a && b && a !== b) return [a, b];
  }
  return null;
}

/**
 * Resolve a tileset's UPPER and LOWER terrain labels: explicit
 * `upperLabel`/`lowerLabel` win, falling back to parsed sheet name. Returns
 * `[null, null]` when nothing is set or parseable.
 */
export function getTilesetLabels(
  ts: Pick<TilesetForResolve, 'name' | 'upperLabel' | 'lowerLabel'>,
): [string | null, string | null] {
  const upper = ts.upperLabel?.trim().toLowerCase() || null;
  const lower = ts.lowerLabel?.trim().toLowerCase() || null;
  if (upper && lower) return [upper, lower];
  const parsed = parseSheetName(ts.name);
  return [
    upper ?? parsed?.[0] ?? null,
    lower ?? parsed?.[1] ?? null,
  ];
}

/**
 * Resolve the terrain label for a single texture id by finding which
 * tileset / side it occupies and returning that side's label. Null when
 * no tileset claims the id or the side has no label.
 */
export function getTextureLabel(
  texId: string,
  tilesets: TilesetForResolve[],
): string | null {
  for (const ts of tilesets) {
    const [u, l] = getTilesetLabels(ts);
    if (ts.upperTextureId === texId) return u;
    if (ts.lowerTextureId === texId) return l;
  }
  return null;
}

/**
 * Resolve a texture id to the dataUrl of its representative pure-tile —
 * `PURE_UPPER_INDEX` (12) when the texture sits in the upper slot of its
 * tileset, `PURE_LOWER_INDEX` (6) when in the lower slot. Returns null if
 * the id doesn't belong to any tileset or its sprite is missing from the
 * tile map.
 */
export function getTextureSpriteUrl(
  texId: string,
  tilesets: TilesetForResolve[],
  tiles: TileSpriteMap,
): string | null {
  for (const ts of tilesets) {
    const isUpper = ts.upperTextureId === texId;
    const isLower = ts.lowerTextureId === texId;
    if (!isUpper && !isLower) continue;
    const idx = isUpper ? PURE_UPPER_INDEX : PURE_LOWER_INDEX;
    const tileId = ts.tileIds[idx];
    return tiles[tileId]?.dataUrl ?? null;
  }
  return null;
}

/**
 * Find every texture id that should be treated as the "same texture" as
 * `texId` for the auto-tile painter:
 *   - Sprite-byte siblings: another texture id whose tileset's pure-tile
 *     dataUrl matches `texId`'s. Catches "same source PNG re-uploaded".
 *   - Label siblings: another texture id whose terrain label matches
 *     `texId`'s. Catches PixelLab-style independent generations sharing
 *     a name (sheet "grass-water" + sheet "grass-dirt", or two sheets
 *     where the user typed `upperLabel = "grass"` on both).
 * Always includes `texId` itself.
 */
export function getSiblingTextures(
  texId: string,
  tilesets: TilesetForResolve[],
  tiles: TileSpriteMap,
): string[] {
  const out = new Set<string>([texId]);
  const sprite = getTextureSpriteUrl(texId, tilesets, tiles);
  const label = getTextureLabel(texId, tilesets);
  for (const ts of tilesets) {
    const [upperLabel, lowerLabel] = getTilesetLabels(ts);
    if (sprite) {
      const upperSprite = tiles[ts.tileIds[PURE_UPPER_INDEX]]?.dataUrl;
      const lowerSprite = tiles[ts.tileIds[PURE_LOWER_INDEX]]?.dataUrl;
      if (upperSprite === sprite) out.add(ts.upperTextureId);
      if (lowerSprite === sprite) out.add(ts.lowerTextureId);
    }
    if (label) {
      if (upperLabel && upperLabel === label) out.add(ts.upperTextureId);
      if (lowerLabel && lowerLabel === label) out.add(ts.lowerTextureId);
    }
  }
  return Array.from(out);
}

/**
 * True when at least one tileset has these two texture ids as its upper
 * + lower (in either order) — i.e. an auto-tile transition between them
 * can be rendered. `a === b` returns true (same texture, no transition
 * needed).
 */
export function hasBridgeTileset(
  a: string,
  b: string,
  tilesets: Array<Pick<TilesetForResolve, 'upperTextureId' | 'lowerTextureId'>>,
): boolean {
  if (a === b) return true;
  return tilesets.some((t) =>
    (t.upperTextureId === a && t.lowerTextureId === b)
    || (t.upperTextureId === b && t.lowerTextureId === a),
  );
}

/**
 * Strict cell-validity check used by the painter to enforce "no contact
 * between unlinked textures". Mirrors `resolveCellTile` but returns a
 * boolean instead of falling back to a dominant pure tile when no bridge
 * exists — so the caller can refuse to paint corners that would leave
 * the cell un-renderable.
 *
 * Valid when:
 *   - 0 non-empty corners (empty cell — anything goes), OR
 *   - 1 unique canonical texture (pure cell), OR
 *   - 2 unique canonical textures whose pair appears as a bridge tileset
 *     (i.e. some tileset has them as its upper + lower, in either order).
 *
 * Canonical means label-collapsed: two ids that share a `getTextureLabel`
 * value count as one texture (matching the resolver's behavior, so
 * sibling textures painted next to each other are valid).
 */
export function canPlaceCorners(
  nw: string | undefined,
  ne: string | undefined,
  sw: string | undefined,
  se: string | undefined,
  tilesets: TilesetForResolve[],
): boolean {
  const corners = [nw, ne, sw, se].filter((c): c is string => !!c);
  if (corners.length === 0) return true;
  const canonical = corners.map((c) => canonicalTextureKey(c, tilesets));
  const unique = Array.from(new Set(canonical));
  if (unique.length <= 1) return true;
  if (unique.length >= 3) return false;
  const [a, b] = unique;
  return tilesets.some((t) => {
    const tu = canonicalTextureKey(t.upperTextureId, tilesets);
    const tl = canonicalTextureKey(t.lowerTextureId, tilesets);
    return (tu === a && tl === b) || (tu === b && tl === a);
  });
}

/**
 * Given the user's chosen brush texture and the cells about to be painted,
 * return the texture id we should ACTUALLY stamp into every painted corner
 * so the stroke blends with the surrounding region.
 *
 * Algorithm:
 *   1. Tally non-brush texture ids on corners adjacent to (but outside of)
 *      the painted region. The most-common one is the "dominant neighbor".
 *   2. If the dominant neighbor IS a sibling of the brush, return that
 *      sibling — the stroke folds into the existing patch rather than
 *      sitting next to it as a different "grass".
 *   3. Else, if the brush already bridges with the dominant neighbor (a
 *      transition tileset exists for the pair), keep the brush as-is.
 *   4. Else, look for a sibling of the brush that DOES bridge with the
 *      dominant neighbor and use that.
 *   5. Otherwise fall through to the original brush — the stroke will
 *      render with hard edges, but the user's intent is preserved.
 *
 * Empty regions (no neighbors) always fall through to the original brush.
 */
export function pickAdjustedBrushTexture(
  baseTexId: string,
  paintedCells: ReadonlyArray<readonly [number, number]>,
  corners: Record<string, string>,
  tilesets: TilesetForResolve[],
  tiles: TileSpriteMap,
): string {
  if (paintedCells.length === 0) return baseTexId;

  // Corners the stroke will overwrite — these don't count as neighbors we
  // need to harmonize with.
  const paintedCorners = new Set<string>();
  for (const [cx, cy] of paintedCells) {
    paintedCorners.add(`${cx},${cy}`);
    paintedCorners.add(`${cx + 1},${cy}`);
    paintedCorners.add(`${cx},${cy + 1}`);
    paintedCorners.add(`${cx + 1},${cy + 1}`);
  }
  // 8-neighborhood of every painted corner, restricted to corners not in
  // the painted set. Tally each non-empty, non-base texture id we find.
  const tally = new Map<string, number>();
  const dirs: ReadonlyArray<readonly [number, number]> = [
    [-1, -1], [0, -1], [1, -1],
    [-1, 0], [1, 0],
    [-1, 1], [0, 1], [1, 1],
  ];
  for (const k of paintedCorners) {
    const [x, y] = k.split(',').map(Number);
    for (const [dx, dy] of dirs) {
      const nk = `${x + dx},${y + dy}`;
      if (paintedCorners.has(nk)) continue;
      const v = corners[nk];
      if (!v || v === baseTexId) continue;
      tally.set(v, (tally.get(v) ?? 0) + 1);
    }
  }
  if (tally.size === 0) return baseTexId;
  const sorted = [...tally.entries()].sort((a, b) => b[1] - a[1]);
  const dominant = sorted[0][0];

  const siblings = getSiblingTextures(baseTexId, tilesets, tiles);
  if (siblings.includes(dominant)) return dominant;
  if (hasBridgeTileset(baseTexId, dominant, tilesets)) return baseTexId;
  for (const sib of siblings) {
    if (sib === baseTexId) continue;
    if (hasBridgeTileset(sib, dominant, tilesets)) return sib;
  }
  return baseTexId;
}
