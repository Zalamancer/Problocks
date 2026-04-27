'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Upload, Trash2, Eye, EyeOff, ChevronUp, ChevronDown, Plus, Sparkles,
  Box, ChevronRight, ChevronDown as ChevDown, Check, Cloud, Link2,
  Pencil, GripVertical, X,
} from 'lucide-react';
import { useTile, type Tileset, type Tile, type ObjectAsset, type ObjectStyle } from '@/store/tile-store';
import { sliceFile, loadImage, sliceImage, fileToImage, imageToDataUrl } from '@/lib/tile-slicer';
import { PURE_UPPER_INDEX, PURE_LOWER_INDEX, TILE_INDEX_TO_QUADRANTS, parseSheetName } from '@/lib/wang-tiles';
import { tileSimilarityCached, TILE_SIMILARITY_THRESHOLD } from '@/lib/tile-similarity';
import { saveTileSheet, listTileSheets, deleteTileSheet } from '@/lib/tile-cloud';
import { saveTileObject, listTileObjects, deleteTileObject, deleteTileObjectGroup, updateTileObject, type CloudObject } from '@/lib/object-cloud';

/**
 * Left-panel content for the 2D Tile-based game system.
 *
 * Three stacked, collapsible sections:
 *   1. Terrains — uploaded 4×4 Wang tilesets shown as cards. Clicking a
 *      card sets it as the active layer's tileset (no per-tile selection
 *      needed because the renderer auto-picks the right transition tile
 *      from the 4 surrounding corners).
 *   2. Layers — visibility, opacity, ordering, active layer.
 *   3. Objects — manually-placed sprites (free-positioned, not auto-tiled).
 *      Picking an object sprite still requires choosing one of the tiles.
 */
/**
 * 2D Tile system asset view. Two render modes share one mount because the
 * hydration + helpers (TerrainCard, BrushSwatch, etc.) only need to live
 * in one place:
 *
 *   - `view="terrain"` → terrain-cards + Wang sheet upload only. Mounted
 *     by LeftPanel under the new "Terrain" top-level tab.
 *   - `view="assets"` (default) → Layers + Objects accordion only. Mounted
 *     by AssetsPanel for the "Assets" tab.
 *
 * Placed-object listing moved to the existing top-level "Scene" tab
 * (ScenePanel grew a Tile Objects category for it).
 */
export function TileAssetsView({ view = 'assets' }: { view?: 'terrain' | 'assets' } = {}) {
  const tilesets = useTile((s) => s.tilesets);
  const tiles = useTile((s) => s.tiles);
  const addTileset = useTile((s) => s.addTileset);
  const removeTileset = useTile((s) => s.removeTileset);
  const setTilesetCloudId = useTile((s) => s.setTilesetCloudId);
  const setTilesetLabelStore = useTile((s) => s.setTilesetLabel);
  const tileSize = useTile((s) => s.tileSize);
  const setTileSize = useTile((s) => s.setTileSize);
  const layers = useTile((s) => s.layers);
  const activeLayerId = useTile((s) => s.activeLayerId);
  const setLayerTileset = useTile((s) => s.setLayerTileset);
  const setTool = useTile((s) => s.setTool);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [cols, setCols] = useState(4);
  const [rows, setRows] = useState(4);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cloudStatus, setCloudStatus] = useState<'idle' | 'syncing' | 'synced' | 'offline'>('idle');
  // Promise-based modal state for the "name your terrains" prompt that
  // pops on uploads where the sheet name doesn't parse and the auto-match
  // step couldn't fill both label sides on its own. `resolve` is the
  // function the modal calls on Save/Skip/Cancel — handleFiles awaits it
  // before continuing.
  const [namePrompt, setNamePrompt] = useState<NamePromptState | null>(null);
  // Set when the user is uploading a "connecting" sheet — i.e. a new sheet
  // that should share one of its texture ids with an existing sheet's
  // texture. Cleared after the next file upload completes (one-shot).
  const linkContextRef = useRef<{
    sourceTilesetId: string;
    sourceSide: 'u' | 'l';   // which side of the source we're sharing
    newSide: 'u' | 'l';      // where to place the shared id in the new sheet
  } | null>(null);

  // The Assets tab for the 2D-tile system renders ObjectsSection directly
  // — that component owns its own ScenePanel-style category header and
  // collapse state. Terrain content lives on the top-level Terrain tab;
  // the Layers section moved to the top-level Scene tab.

  const activeLayer = layers.find((l) => l.id === activeLayerId);
  const brushTextureId = useTile((s) => s.brushTextureId);

  // Hydrate from Supabase on mount. We re-slice each saved sheet client-side
  // (cheap canvas blits) rather than persisting the 16 derived tiles. Names
  // already in the local store are skipped — the persisted Zustand copy is
  // assumed canonical for the current session.
  useEffect(() => {
    let cancelled = false;
    setCloudStatus('syncing');
    listTileSheets()
      .then(async (sheets) => {
        if (cancelled) return;
        const localNames = new Set(useTile.getState().tilesets.map((t) => t.name));
        for (const sheet of sheets) {
          if (cancelled) return;
          if (localNames.has(sheet.name)) {
            // Already in store; just stamp the cloudId so future deletes
            // can clean up server-side.
            const existing = useTile.getState().tilesets.find((t) => t.name === sheet.name);
            if (existing && !existing.cloudId) setTilesetCloudId(existing.id, sheet.id);
            continue;
          }
          try {
            const img = await loadImage(sheet.sheetDataUrl);
            const sliced = sliceImage(img, { cols: sheet.cols, rows: sheet.rows });
            addTileset({
              name: sheet.name,
              sheetDataUrl: sheet.sheetDataUrl,
              cols: sheet.cols,
              rows: sheet.rows,
              tileWidth: sliced.tileWidth,
              tileHeight: sliced.tileHeight,
              tiles: sliced.tiles,
              cloudId: sheet.id,
              upperTextureId: sheet.upperTextureId,
              lowerTextureId: sheet.lowerTextureId,
              upperLabel: sheet.upperLabel,
              lowerLabel: sheet.lowerLabel,
            });
          } catch (err) {
            console.error('[tile-cloud] failed to hydrate sheet', sheet.name, err);
          }
        }
        if (!cancelled) setCloudStatus('synced');
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn('[tile-cloud] list failed; running in local-only mode', err);
        setCloudStatus('offline');
      });
    return () => { cancelled = true; };
  }, [addTileset, setTilesetCloudId]);

  /**
   * Open a modal asking the user to name the new sheet's upper + lower
   * terrains. Returns the entered labels (or `undefined` per side when
   * the user clears them). Resolves immediately to `{}` if cancelled —
   * the upload still proceeds with whatever auto-match found.
   */
  function promptForTerrainNames(args: {
    upperPreviewUrl: string;
    lowerPreviewUrl: string;
    initialUpper: string;
    initialLower: string;
    upperLocked: boolean;
    lowerLocked: boolean;
    sheetName: string;
  }): Promise<{ upper?: string; lower?: string }> {
    return new Promise((resolve) => {
      setNamePrompt({
        ...args,
        resolve: (result) => {
          setNamePrompt(null);
          resolve(result);
        },
      });
    });
  }

  /**
   * Compare a new sheet's pure-UPPER and pure-LOWER tiles against every
   * existing tileset's pure tiles, and return any auto-match hits. A hit
   * carries the matching texture id (so the new sheet inherits identity
   * via shared id) and that side's label (so the brush also inherits the
   * sibling's terrain name). Used by `handleFiles` to make multi-sheet
   * uploads "just work" without forcing the user to type names or click
   * the chain icon.
   */
  async function autoMatchTextures(newUpperUrl: string, newLowerUrl: string): Promise<{
    upper?: { textureId: string; label?: string };
    lower?: { textureId: string; label?: string };
  }> {
    const existing = useTile.getState().tilesets;
    const allTiles = useTile.getState().tiles;
    let upper: { textureId: string; label?: string } | undefined;
    let lower: { textureId: string; label?: string } | undefined;
    for (const ts of existing) {
      if (upper && lower) break;
      const exUpperUrl = allTiles[ts.tileIds[PURE_UPPER_INDEX]]?.dataUrl;
      const exLowerUrl = allTiles[ts.tileIds[PURE_LOWER_INDEX]]?.dataUrl;
      if (!upper && exUpperUrl) {
        const sim = await tileSimilarityCached(newUpperUrl, exUpperUrl);
        if (sim >= TILE_SIMILARITY_THRESHOLD) upper = { textureId: ts.upperTextureId, label: ts.upperLabel };
      }
      if (!upper && exLowerUrl) {
        const sim = await tileSimilarityCached(newUpperUrl, exLowerUrl);
        if (sim >= TILE_SIMILARITY_THRESHOLD) upper = { textureId: ts.lowerTextureId, label: ts.lowerLabel };
      }
      if (!lower && exUpperUrl) {
        const sim = await tileSimilarityCached(newLowerUrl, exUpperUrl);
        if (sim >= TILE_SIMILARITY_THRESHOLD) lower = { textureId: ts.upperTextureId, label: ts.upperLabel };
      }
      if (!lower && exLowerUrl) {
        const sim = await tileSimilarityCached(newLowerUrl, exLowerUrl);
        if (sim >= TILE_SIMILARITY_THRESHOLD) lower = { textureId: ts.lowerTextureId, label: ts.lowerLabel };
      }
    }
    return { upper, lower };
  }

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0) {
      linkContextRef.current = null;
      return;
    }
    // Resolve any pending connection BEFORE we kick off uploads, then clear
    // the ref so it doesn't bleed into the next regular upload.
    const link = linkContextRef.current;
    linkContextRef.current = null;
    let sharedUpper: string | undefined;
    let sharedUpperLabel: string | undefined;
    let sharedLower: string | undefined;
    let sharedLowerLabel: string | undefined;
    if (link) {
      const source = useTile.getState().tilesets.find((t) => t.id === link.sourceTilesetId);
      if (source) {
        const sharedId = link.sourceSide === 'u' ? source.upperTextureId : source.lowerTextureId;
        const sharedLabel = link.sourceSide === 'u' ? source.upperLabel : source.lowerLabel;
        if (link.newSide === 'u') { sharedUpper = sharedId; sharedUpperLabel = sharedLabel; }
        else { sharedLower = sharedId; sharedLowerLabel = sharedLabel; }
      }
    }

    setUploading(true);
    setError(null);
    try {
      for (const file of files) {
        const name = file.name.replace(/\.[^.]+$/, '');
        const result = await sliceFile(file, { cols, rows });
        const newUpperUrl = result.tiles[PURE_UPPER_INDEX];
        const newLowerUrl = result.tiles[PURE_LOWER_INDEX];

        // Step 1: pixel-similarity auto-match against existing sheets. Only
        // covers sides the explicit chain link didn't already pin.
        const auto = (sharedUpper && sharedLower)
          ? { upper: undefined, lower: undefined }
          : await autoMatchTextures(newUpperUrl, newLowerUrl);

        // Step 2: choose the final texture ids — explicit chain wins, then
        // auto-match, otherwise let addTileset mint a fresh UUID.
        const finalUpperTexId = sharedUpper ?? auto.upper?.textureId;
        const finalLowerTexId = sharedLower ?? auto.lower?.textureId;

        // Step 3: figure out the labels. Inherited from chain or auto-match
        // first; falling back to a parse of the sheet name (handled inside
        // addTileset). When neither hit AND the name doesn't parse, prompt
        // the user.
        let finalUpperLabel: string | undefined = sharedUpperLabel ?? auto.upper?.label;
        let finalLowerLabel: string | undefined = sharedLowerLabel ?? auto.lower?.label;
        const parsed = parseSheetName(name);
        const upperWillBeNamed = !!finalUpperLabel || !!parsed?.[0];
        const lowerWillBeNamed = !!finalLowerLabel || !!parsed?.[1];
        if (!upperWillBeNamed || !lowerWillBeNamed) {
          // At least one side has no label and the file name didn't parse —
          // ask the user. Pre-fill whatever we already know.
          const promptResult = await promptForTerrainNames({
            upperPreviewUrl: newUpperUrl,
            lowerPreviewUrl: newLowerUrl,
            initialUpper: finalUpperLabel ?? parsed?.[0] ?? '',
            initialLower: finalLowerLabel ?? parsed?.[1] ?? '',
            // A side is "locked" when its texture id was already pinned by
            // an explicit chain — re-typing the label there could confuse
            // the user; we still allow edits but visually mark it.
            upperLocked: !!sharedUpper,
            lowerLocked: !!sharedLower,
            sheetName: name,
          });
          if (promptResult.upper !== undefined) finalUpperLabel = promptResult.upper || undefined;
          if (promptResult.lower !== undefined) finalLowerLabel = promptResult.lower || undefined;
        }

        // Step 4: add locally so the user sees it instantly. The Supabase
        // save runs in the background and stamps cloudId on success.
        const localId = addTileset({
          name,
          sheetDataUrl: result.sheetDataUrl,
          cols,
          rows,
          tileWidth: result.tileWidth,
          tileHeight: result.tileHeight,
          tiles: result.tiles,
          upperTextureId: finalUpperTexId,
          lowerTextureId: finalLowerTexId,
          upperLabel: finalUpperLabel,
          lowerLabel: finalLowerLabel,
        });
        // Read the local tileset back so cloud receives the SAME texture
        // ids and labels that addTileset finalized (it may have parsed the
        // name to fill missing labels). Without this, DB defaults would
        // generate fresh ids, leaving local + cloud out of sync.
        const local = useTile.getState().tilesets.find((t) => t.id === localId);
        saveTileSheet({
          name,
          sheetDataUrl: result.sheetDataUrl,
          cols,
          rows,
          tileWidth: result.tileWidth,
          tileHeight: result.tileHeight,
          upperTextureId: local?.upperTextureId,
          lowerTextureId: local?.lowerTextureId,
          upperLabel: local?.upperLabel ?? null,
          lowerLabel: local?.lowerLabel ?? null,
        }).then((cloud) => {
          setTilesetCloudId(localId, cloud.id);
          setCloudStatus('synced');
        }).catch((err) => {
          console.warn('[tile-cloud] save failed; sheet kept local-only', err);
          setCloudStatus('offline');
        });
        // Linkage is a one-shot per file picker invocation — only the first
        // file in a multi-file pick gets it.
        sharedUpper = undefined;
        sharedUpperLabel = undefined;
        sharedLower = undefined;
        sharedLowerLabel = undefined;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
    }
  }

  /**
   * Save a label override to the store and persist it to Supabase so it
   * survives a reload. Used by TerrainCard's `onLabelChange` callback so
   * the panel's "upper name" / "lower name" inputs round-trip through the
   * cloud.
   */
  async function handleLabelChange(tilesetId: string, side: 'u' | 'l', label: string) {
    setTilesetLabelStore(tilesetId, side, label);
    const t = useTile.getState().tilesets.find((x) => x.id === tilesetId);
    if (!t) return;
    try {
      await saveTileSheet({
        name: t.name,
        sheetDataUrl: t.sheetDataUrl,
        cols: t.cols,
        rows: t.rows,
        tileWidth: t.tileWidth,
        tileHeight: t.tileHeight,
        upperTextureId: t.upperTextureId,
        lowerTextureId: t.lowerTextureId,
        upperLabel: t.upperLabel ?? null,
        lowerLabel: t.lowerLabel ?? null,
      });
    } catch (err) {
      console.warn('[tile-cloud] label save failed', err);
    }
  }

  /**
   * Called when the user clicks a chain icon on a swatch. Stashes the
   * connection metadata and opens the file picker. The next file uploaded
   * inherits the source's texture id on the chosen side.
   */
  function startLink(sourceTilesetId: string, sourceSide: 'u' | 'l', newSide: 'u' | 'l') {
    linkContextRef.current = { sourceTilesetId, sourceSide, newSide };
    fileInputRef.current?.click();
  }

  /**
   * Merge `sourceTextureId` (the swatch the user clicked the chain icon on)
   * with `targetTextureId` (an existing texture from another tileset they
   * picked). After the in-memory swap, every tileset row whose texture
   * columns changed is re-saved to Supabase so a reload doesn't restore
   * the pre-merge ids.
   */
  async function mergeWithExisting(sourceTextureId: string, targetTextureId: string) {
    const changedIds = useTile.getState().mergeTextures(sourceTextureId, targetTextureId);
    if (changedIds.length === 0) return;
    // Persist each affected sheet's new texture columns. The route's POST
    // upserts on (user_id, name), so passing the same name with new
    // texture ids updates the existing row in place.
    const state = useTile.getState();
    for (const tid of changedIds) {
      const t = state.tilesets.find((x) => x.id === tid);
      if (!t) continue;
      try {
        await saveTileSheet({
          name: t.name,
          sheetDataUrl: t.sheetDataUrl,
          cols: t.cols,
          rows: t.rows,
          tileWidth: t.tileWidth,
          tileHeight: t.tileHeight,
          upperTextureId: t.upperTextureId,
          lowerTextureId: t.lowerTextureId,
        });
      } catch (err) {
        console.warn('[tile-cloud] post-merge resave failed', t.name, err);
      }
    }
  }

  function pickTileset(_tilesetId: string) {
    // Picking a swatch is purely a brush change in the texture-id model.
    // The active layer doesn't need to change — every cell resolves its
    // own tileset from the corner texture ids on render.
    setTool('paint');
  }

  function handleRemoveTileset(t: Tileset) {
    if (!confirm(`Delete tileset "${t.name}"? Layers using it will be detached.`)) return;
    removeTileset(t.id);
    if (t.cloudId) {
      // Fire-and-forget — local removal is the source of truth in the UI;
      // a server failure surfaces in the console but doesn't roll back.
      deleteTileSheet(t.cloudId).catch((err) => {
        console.warn('[tile-cloud] delete failed', err);
      });
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        className="hidden"
      />

      {view === 'terrain' && (
        <div className="space-y-2 px-3 py-3">
          <div className="flex items-center gap-1.5">
            <NumField label="Cols" value={cols} onChange={setCols} min={1} max={32} />
            <NumField label="Rows" value={rows} onChange={setRows} min={1} max={32} />
            <NumField label="Cell" value={tileSize} onChange={setTileSize} min={4} max={256} />
          </div>
          <ChunkyButton
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            kind="butter"
          >
            <Upload size={12} strokeWidth={2.4} />
            {uploading ? 'Slicing…' : `Upload Wang sheet → ${cols}×${rows}`}
          </ChunkyButton>
          <CloudStatusPill status={cloudStatus} />
          {error && (
            <p style={{ fontSize: 11, color: 'var(--pb-coral-ink)', fontWeight: 600 }}>
              {error}
            </p>
          )}

          {tilesets.length === 0 ? (
            <div
              className="rounded-lg p-3 text-center"
              style={{
                background: 'var(--pb-cream-2)',
                border: '1.5px dashed var(--pb-line-2)',
              }}
            >
              <p style={{ fontSize: 11, color: 'var(--pb-ink-muted)', lineHeight: 1.5 }}>
                Drop a 4×4 Wang sheet (one upper texture, one lower, plus 14 transitions). The right tile is picked automatically based on the corners painted around each cell — you never pick a tile yourself.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {tilesets.map((ts) => (
                <TerrainCard
                  key={ts.id}
                  tileset={ts}
                  tiles={tiles}
                  allTilesets={tilesets}
                  active={brushTextureId === ts.upperTextureId || brushTextureId === ts.lowerTextureId}
                  onPick={() => pickTileset(ts.id)}
                  onRemove={() => handleRemoveTileset(ts)}
                  onConnect={(sourceSide, newSide) => startLink(ts.id, sourceSide, newSide)}
                  onMerge={(sourceSide, targetTextureId) => {
                    const sourceId = sourceSide === 'u' ? ts.upperTextureId : ts.lowerTextureId;
                    void mergeWithExisting(sourceId, targetTextureId);
                  }}
                  onLabelChange={(side, label) => { void handleLabelChange(ts.id, side, label); }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {view === 'assets' && <ObjectsSection />}

      {namePrompt && <NameTerrainModal {...namePrompt} />}
    </div>
  );
}

function Section({
  title, icon, open, onToggle, children,
}: {
  title: string;
  icon: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div style={{ borderBottom: '1.5px solid var(--pb-line-2)' }}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-2 transition-colors"
        style={{
          padding: '10px 12px',
          background: 'transparent',
          border: 0,
          cursor: 'pointer',
          color: 'var(--pb-ink)',
          fontSize: 12,
          fontWeight: 800,
          textAlign: 'left',
        }}
      >
        {open ? <ChevDown size={12} strokeWidth={2.4} /> : <ChevronRight size={12} strokeWidth={2.4} />}
        <span style={{ color: 'var(--pb-ink-muted)' }}>{icon}</span>
        <span>{title}</span>
      </button>
      {open && children}
    </div>
  );
}

/**
 * A terrain card — the user clicks it to bind that tileset to the active
 * layer. Shows the upper + lower base textures so you can tell terrains apart
 * without staring at the source sheet thumbnail. Active terrain gets the
 * butter highlight + a checkmark.
 */
function TerrainCard({
  tileset, tiles, allTilesets, active, onPick, onRemove, onConnect, onMerge, onLabelChange,
}: {
  tileset: Tileset;
  tiles: Record<string, Tile>;
  allTilesets: Tileset[];
  /** True when the brush's current texture id belongs to this tileset
   *  (either side). Surface so swatches can show the active highlight. */
  active: boolean;
  onPick: () => void;
  onRemove: () => void;
  /** Open the file picker for a sheet that shares this tileset's texture
   *  on `sourceSide` and places it on `newSide` of the new sheet. */
  onConnect: (sourceSide: 'u' | 'l', newSide: 'u' | 'l') => void;
  /** Merge this card's `sourceSide` texture with an existing texture id
   *  picked from another tileset's swatch. */
  onMerge: (sourceSide: 'u' | 'l', targetTextureId: string) => void;
  /** Persist a terrain-label edit to the store AND Supabase so the override
   *  survives a reload. */
  onLabelChange: (side: 'u' | 'l', label: string) => void;
}) {
  const upperTile = tiles[tileset.tileIds[PURE_UPPER_INDEX]];
  const lowerTile = tiles[tileset.tileIds[PURE_LOWER_INDEX]];
  const brushTextureId = useTile((s) => s.brushTextureId);
  const setBrushTextureId = useTile((s) => s.setBrushTextureId);
  const setTool = useTile((s) => s.setTool);

  // Which swatch (if any) currently has its "connect" popover open.
  const [linkingSide, setLinkingSide] = useState<null | 'u' | 'l'>(null);

  // Auto-derive labels from the sheet name when the user hasn't set them
  // explicitly — kept in sync via the placeholder in the inputs below.
  function parsedFromName(): { upper?: string; lower?: string } {
    const norm = tileset.name.toLowerCase().trim();
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
      if (a && b && a !== b) return { upper: a, lower: b };
    }
    return {};
  }
  const parsed = parsedFromName();
  const upperLabelDisplay = tileset.upperLabel ?? parsed.upper ?? '';
  const lowerLabelDisplay = tileset.lowerLabel ?? parsed.lower ?? '';

  function pickBrush(side: 'u' | 'l') {
    onPick();
    setBrushTextureId(side === 'u' ? tileset.upperTextureId : tileset.lowerTextureId);
    setTool('paint');
  }

  // Count how many OTHER tilesets share each side's texture id — used to
  // show a small chain badge on the swatch when a connection exists.
  const sharedUpperCount = allTilesets.filter((t) => t.id !== tileset.id && (
    t.upperTextureId === tileset.upperTextureId || t.lowerTextureId === tileset.upperTextureId
  )).length;
  const sharedLowerCount = allTilesets.filter((t) => t.id !== tileset.id && (
    t.upperTextureId === tileset.lowerTextureId || t.lowerTextureId === tileset.lowerTextureId
  )).length;

  return (
    <div
      style={{
        background: active ? 'var(--pb-butter)' : 'var(--pb-cream-2)',
        border: `1.5px solid ${active ? 'var(--pb-butter-ink)' : 'var(--pb-line-2)'}`,
        borderRadius: 10,
        padding: 8,
        boxShadow: active ? '0 2px 0 var(--pb-butter-ink)' : 'none',
      }}
    >
      <div
        onClick={onPick}
        className="flex items-center gap-2"
        style={{ cursor: 'pointer' }}
        title={`Paint with "${tileset.name}" on the active layer`}
      >
        <div className="flex-1 min-w-0">
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--pb-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {tileset.name}
          </div>
          <div style={{ fontSize: 10, color: 'var(--pb-ink-muted)', fontWeight: 600 }}>
            {tileset.cols}×{tileset.rows} · {tileset.tileWidth}px
          </div>
        </div>
        {active && (
          <div
            style={{
              width: 18, height: 18,
              borderRadius: 999,
              background: 'var(--pb-butter-ink)',
              color: 'var(--pb-paper)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Check size={11} strokeWidth={3} />
          </div>
        )}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--pb-coral-ink)', display: 'flex', alignItems: 'center' }}
          title="Remove tileset"
        >
          <Trash2 size={11} strokeWidth={2.4} />
        </button>
      </div>

      {/* Brush picker — choose which of the two base textures the paint tool
          lays down. The chain icon on each swatch opens a small popover for
          uploading a NEW tileset that shares this texture. */}
      <div className="flex items-center gap-2 mt-2">
        <BrushSwatch
          tile={upperTile}
          label="UPPER"
          active={brushTextureId === tileset.upperTextureId}
          shareCount={sharedUpperCount}
          linking={linkingSide === 'u'}
          onClick={() => pickBrush('u')}
          onChainClick={() => setLinkingSide(linkingSide === 'u' ? null : 'u')}
        />
        <BrushSwatch
          tile={lowerTile}
          label="LOWER"
          active={brushTextureId === tileset.lowerTextureId}
          shareCount={sharedLowerCount}
          linking={linkingSide === 'l'}
          onClick={() => pickBrush('l')}
          onChainClick={() => setLinkingSide(linkingSide === 'l' ? null : 'l')}
        />
      </div>

      {/* Terrain labels — two sheets sharing a label (e.g. both "grass")
          collapse to one terrain, so the painter and renderer treat
          independently-uploaded grass→water and grass→dirt sheets as a
          single grass that auto-bridges through whichever sheet matches
          the local boundary. Auto-filled from the sheet name on upload;
          edit here to override. */}
      <div className="flex items-center gap-2 mt-2">
        <LabelInput
          placeholder="upper name"
          value={upperLabelDisplay}
          isOverride={tileset.upperLabel !== undefined}
          onChange={(v) => onLabelChange('u', v)}
        />
        <LabelInput
          placeholder="lower name"
          value={lowerLabelDisplay}
          isOverride={tileset.lowerLabel !== undefined}
          onChange={(v) => onLabelChange('l', v)}
        />
      </div>

      {linkingSide && (
        <ConnectPopover
          sourceLabel={linkingSide === 'u' ? 'UPPER' : 'LOWER'}
          tileset={tileset}
          allTilesets={allTilesets}
          tiles={tiles}
          onChoose={(newSide) => {
            setLinkingSide(null);
            onConnect(linkingSide, newSide);
          }}
          onMerge={(targetTextureId) => {
            setLinkingSide(null);
            onMerge(linkingSide, targetTextureId);
          }}
          onCancel={() => setLinkingSide(null)}
        />
      )}

      {/* All 16 sliced tiles, always visible. Hover to see the (NW,NE,SW,SE)
          encoding overlay so the user can sanity-check the auto-tile lookup. */}
      <DebugTileGrid tileset={tileset} tiles={tiles} />
    </div>
  );
}

function BrushSwatch({
  tile, label, active, shareCount, linking, onClick, onChainClick,
}: {
  tile: Tile | undefined;
  label: 'UPPER' | 'LOWER';
  active: boolean;
  /** Number of OTHER tilesets sharing this texture id. >0 means it's part
   *  of a chain — shown as a small badge next to the chain icon. */
  shareCount: number;
  linking: boolean;
  onClick: () => void;
  onChainClick: () => void;
}) {
  return (
    <div
      className="flex-1"
      style={{
        position: 'relative',
        background: active ? 'var(--pb-paper)' : 'transparent',
        border: `1.5px solid ${linking ? 'var(--pb-mint-ink, #2d8f5b)' : (active ? 'var(--pb-butter-ink)' : 'var(--pb-line-2)')}`,
        borderRadius: 8,
        boxShadow: active ? '0 2px 0 var(--pb-butter-ink)' : 'none',
      }}
    >
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        className="w-full flex items-center gap-2"
        style={{
          padding: 4,
          background: 'transparent',
          border: 0,
          cursor: 'pointer',
        }}
        title={`Brush with ${label.toLowerCase()} texture`}
      >
        <div
          style={{
            width: 26, height: 26, flexShrink: 0,
            background: 'rgba(0,0,0,0.06)',
            borderRadius: 5,
            border: '1.5px solid var(--pb-line-2)',
            overflow: 'hidden',
          }}
        >
          {tile && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={tile.dataUrl} alt={label} style={{ width: '100%', height: '100%', objectFit: 'contain', imageRendering: 'pixelated' }} draggable={false} />
          )}
        </div>
        <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--pb-ink)', letterSpacing: 0.5 }}>
          {label}
        </span>
      </button>
      {/* Chain button — opens the connect popover. Always visible so users
          discover the feature; gets a green tint when this texture already
          appears in another tileset. */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onChainClick(); }}
        title={
          shareCount > 0
            ? `Connected to ${shareCount} other tileset${shareCount === 1 ? '' : 's'} — click to add another`
            : 'Add a new tileset that shares this texture'
        }
        style={{
          position: 'absolute',
          top: 2,
          right: 2,
          width: 18,
          height: 18,
          padding: 0,
          background: shareCount > 0 ? 'rgba(110,180,90,0.18)' : 'var(--pb-paper)',
          border: `1.5px solid ${shareCount > 0 ? 'rgba(60,140,40,0.55)' : 'var(--pb-line-2)'}`,
          color: shareCount > 0 ? 'rgb(40,100,30)' : 'var(--pb-ink-muted)',
          borderRadius: 999,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 8,
          fontWeight: 800,
        }}
      >
        {shareCount > 0
          ? <span style={{ lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{shareCount + 1}</span>
          : <Link2 size={10} strokeWidth={2.6} />}
      </button>
    </div>
  );
}

/**
 * Small editable text input for a tileset's per-side terrain label. Two
 * tilesets sharing a label collapse to one terrain at paint + render
 * time, so this is the canonical way to tell the editor "this 'grass'
 * is the same 'grass' as the other sheet's 'grass'".
 *
 * `value` is the label currently being shown (override OR auto-parsed
 * from the sheet name); `isOverride` controls the muted styling for
 * auto-derived placeholders so the user can tell what's been edited.
 */
function LabelInput({
  value, placeholder, isOverride, onChange,
}: {
  value: string;
  placeholder: string;
  isOverride: boolean;
  onChange: (next: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  // Keep local draft synced when the upstream value changes (e.g. another
  // edit committed). Avoids the input "freezing" if the parent rerenders.
  useEffect(() => { setDraft(value); }, [value]);
  return (
    <input
      type="text"
      value={draft}
      placeholder={placeholder}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => { if (draft !== value) onChange(draft); }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
        if (e.key === 'Escape') { setDraft(value); (e.target as HTMLInputElement).blur(); }
      }}
      className="flex-1 min-w-0"
      style={{
        fontSize: 11,
        fontWeight: 700,
        padding: '4px 6px',
        background: 'var(--pb-paper)',
        border: '1.5px solid var(--pb-line-2)',
        borderRadius: 6,
        color: isOverride ? 'var(--pb-ink)' : 'var(--pb-ink-muted)',
        outline: 'none',
        width: 0, // let flex grow handle width without overflow
      }}
    />
  );
}

function ConnectPopover({
  sourceLabel, tileset, allTilesets, tiles, onChoose, onMerge, onCancel,
}: {
  sourceLabel: 'UPPER' | 'LOWER';
  tileset: Tileset;
  allTilesets: Tileset[];
  tiles: Record<string, Tile>;
  onChoose: (newSide: 'u' | 'l') => void;
  onMerge: (targetTextureId: string) => void;
  onCancel: () => void;
}) {
  // Build the list of "merge target" candidates: every UPPER and LOWER
  // swatch from ANY OTHER tileset that doesn't already share this texture
  // id. Cross-tileset transitions only work when the meeting textures are
  // the same id, so this is the bread-and-butter UX for fixing a forgotten
  // chain after the fact.
  const sourceTexId = sourceLabel === 'UPPER' ? tileset.upperTextureId : tileset.lowerTextureId;
  const candidates: Array<{ key: string; tileset: Tileset; side: 'u' | 'l'; textureId: string; tile: Tile | undefined }> = [];
  for (const other of allTilesets) {
    if (other.id === tileset.id) continue;
    if (other.upperTextureId !== sourceTexId) {
      candidates.push({
        key: `${other.id}-u`,
        tileset: other,
        side: 'u',
        textureId: other.upperTextureId,
        tile: tiles[other.tileIds[PURE_UPPER_INDEX]],
      });
    }
    if (other.lowerTextureId !== sourceTexId) {
      candidates.push({
        key: `${other.id}-l`,
        tileset: other,
        side: 'l',
        textureId: other.lowerTextureId,
        tile: tiles[other.tileIds[PURE_LOWER_INDEX]],
      });
    }
  }

  return (
    <div
      className="mt-2 p-2 space-y-2"
      style={{
        background: 'var(--pb-paper)',
        border: '1.5px solid var(--pb-ink)',
        borderRadius: 8,
        boxShadow: '0 2px 0 var(--pb-ink)',
      }}
    >
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--pb-ink-muted)', letterSpacing: 0.4 }}>
        UPLOAD A NEW TILESET WHERE THIS {sourceLabel} BECOMES…
      </div>
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => onChoose('u')}
          className="flex-1"
          style={{
            padding: '6px 8px',
            background: 'var(--pb-cream-2)',
            border: '1.5px solid var(--pb-line-2)',
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 800,
            color: 'var(--pb-ink)',
            cursor: 'pointer',
          }}
        >
          new UPPER
        </button>
        <button
          type="button"
          onClick={() => onChoose('l')}
          className="flex-1"
          style={{
            padding: '6px 8px',
            background: 'var(--pb-cream-2)',
            border: '1.5px solid var(--pb-line-2)',
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 800,
            color: 'var(--pb-ink)',
            cursor: 'pointer',
          }}
        >
          new LOWER
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '6px 8px',
            background: 'transparent',
            border: '1.5px solid var(--pb-line-2)',
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--pb-ink-muted)',
            cursor: 'pointer',
          }}
          title="Cancel"
        >
          ×
        </button>
      </div>

      {candidates.length > 0 && (
        <>
          <div style={{ borderTop: '1.5px solid var(--pb-line-2)' }} />
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--pb-ink-muted)', letterSpacing: 0.4 }}>
            …OR MERGE WITH AN EXISTING TEXTURE
          </div>
          <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(64px, 1fr))' }}>
            {candidates.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => onMerge(c.textureId)}
                title={`Merge with ${c.tileset.name} ${c.side === 'u' ? 'UPPER' : 'LOWER'} — every reference to this ${sourceLabel} will be replaced.`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  padding: 4,
                  background: 'var(--pb-cream-2)',
                  border: '1.5px solid var(--pb-line-2)',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    aspectRatio: '1 / 1',
                    background: 'rgba(0,0,0,0.06)',
                    borderRadius: 4,
                    overflow: 'hidden',
                    border: '1.5px solid var(--pb-line-2)',
                  }}
                >
                  {c.tile && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={c.tile.dataUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', imageRendering: 'pixelated' }} draggable={false} />
                  )}
                </div>
                <span style={{ fontSize: 8, fontWeight: 800, color: 'var(--pb-ink-muted)', letterSpacing: 0.3, lineHeight: 1, textAlign: 'center' }}>
                  {c.tileset.name.length > 8 ? c.tileset.name.slice(0, 6) + '…' : c.tileset.name}
                </span>
                <span style={{ fontSize: 8, fontWeight: 700, color: 'var(--pb-ink-muted)', lineHeight: 1 }}>
                  {c.side === 'u' ? '↑U' : '↓L'}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * 16-tile preview grid with a hover overlay that visualises my (NE,NW,SW,SE)
 * encoding for each tile. White quadrant = "upper", black = "lower". Use this
 * to compare against the actual pixels in the source PNG: if a tile shows
 * upper texture in its top-left quadrant but the overlay shows the top-left
 * (NW) as black, our encoding is wrong for that index.
 */
function DebugTileGrid({ tileset, tiles }: { tileset: Tileset; tiles: Record<string, Tile> }) {
  const cols = tileset.cols;
  return (
    <div
      className="grid mt-2"
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: 2,
        padding: 4,
        background: 'var(--pb-paper)',
        border: '1.5px solid var(--pb-line-2)',
        borderRadius: 6,
      }}
    >
      {tileset.tileIds.map((id, i) => {
        const tile = tiles[id];
        if (!tile) return <div key={i} style={{ aspectRatio: '1 / 1', background: 'rgba(0,0,0,0.05)' }} />;
        return <DebugTileCell key={id} tile={tile} index={i} />;
      })}
    </div>
  );
}

function DebugTileCell({ tile, index }: { tile: Tile; index: number }) {
  const [hover, setHover] = useState(false);
  const quads = TILE_INDEX_TO_QUADRANTS[index];
  // Stored quadrant order is (NW, NE, SW, SE) — reading order of the 2×2 grid,
  // which matches how the user types the codes in their reference table.
  const [nw, ne, sw, se] = quads ?? ['l', 'l', 'l', 'l'];
  const code = `${nw},${ne},${sw},${se}`;
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={`#${index} → NW=${nw} NE=${ne} SW=${sw} SE=${se}`}
      style={{
        position: 'relative',
        aspectRatio: '1 / 1',
        background: 'rgba(0,0,0,0.05)',
        borderRadius: 4,
        overflow: 'hidden',
        cursor: 'help',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={tile.dataUrl}
        alt=""
        style={{ width: '100%', height: '100%', objectFit: 'contain', imageRendering: 'pixelated' }}
        draggable={false}
      />
      {hover && (
        <>
          {/* Translucent 2x2 overlay — white = u (upper), black = l (lower) */}
          <div
            style={{
              position: 'absolute', inset: 0,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gridTemplateRows: '1fr 1fr',
              pointerEvents: 'none',
              opacity: 0.78,
            }}
          >
            <div style={{ background: nw === 'u' ? '#ffffff' : '#000000', borderRight: '1px solid rgba(128,128,128,0.6)', borderBottom: '1px solid rgba(128,128,128,0.6)' }} />
            <div style={{ background: ne === 'u' ? '#ffffff' : '#000000', borderBottom: '1px solid rgba(128,128,128,0.6)' }} />
            <div style={{ background: sw === 'u' ? '#ffffff' : '#000000', borderRight: '1px solid rgba(128,128,128,0.6)' }} />
            <div style={{ background: se === 'u' ? '#ffffff' : '#000000' }} />
          </div>
          {/* Index badge */}
          <div
            style={{
              position: 'absolute', top: 1, left: 1,
              padding: '0 3px',
              background: 'var(--pb-ink)',
              color: 'var(--pb-paper)',
              fontSize: 8,
              fontWeight: 800,
              borderRadius: 3,
              fontFamily: 'monospace',
              pointerEvents: 'none',
            }}
          >
            {index}
          </div>
          {/* Code badge */}
          <div
            style={{
              position: 'absolute', bottom: 1, left: 1, right: 1,
              padding: '1px 2px',
              background: 'var(--pb-ink)',
              color: 'var(--pb-paper)',
              fontSize: 7,
              fontWeight: 800,
              borderRadius: 3,
              fontFamily: 'monospace',
              textAlign: 'center',
              pointerEvents: 'none',
              letterSpacing: -0.3,
            }}
          >
            {code}
          </div>
        </>
      )}
    </div>
  );
}

export function LayerList() {
  const layers = useTile((s) => s.layers);
  const activeLayerId = useTile((s) => s.activeLayerId);
  const tilesets = useTile((s) => s.tilesets);
  const tiles = useTile((s) => s.tiles);
  const addLayer = useTile((s) => s.addLayer);
  const removeLayer = useTile((s) => s.removeLayer);
  const renameLayer = useTile((s) => s.renameLayer);
  const toggleLayerVisibility = useTile((s) => s.toggleLayerVisibility);
  const reorderLayer = useTile((s) => s.reorderLayer);
  const setActiveLayer = useTile((s) => s.setActiveLayer);
  const setLayerOpacity = useTile((s) => s.setLayerOpacity);
  const setLayerTileset = useTile((s) => s.setLayerTileset);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-1.5 px-3 pb-3">
      {[...layers].reverse().map((layer, revIdx) => {
        const idx = layers.length - 1 - revIdx;
        const isActive = layer.id === activeLayerId;
        const layerTileset = layer.tilesetId ? tilesets.find((t) => t.id === layer.tilesetId) : null;
        const upperTile = layerTileset ? tiles[layerTileset.tileIds[PURE_UPPER_INDEX]] : null;
        return (
          <div
            key={layer.id}
            onClick={() => setActiveLayer(layer.id)}
            style={{
              background: isActive ? 'var(--pb-butter)' : 'var(--pb-cream-2)',
              border: `1.5px solid ${isActive ? 'var(--pb-butter-ink)' : 'var(--pb-line-2)'}`,
              borderRadius: 8,
              cursor: 'pointer',
              padding: 6,
            }}
          >
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(layer.id); }}
                style={{ background: 'transparent', border: 0, cursor: 'pointer', color: layer.visible ? 'var(--pb-ink)' : 'var(--pb-ink-muted)', display: 'flex', alignItems: 'center' }}
                title={layer.visible ? 'Hide layer' : 'Show layer'}
              >
                {layer.visible ? <Eye size={12} strokeWidth={2.4} /> : <EyeOff size={12} strokeWidth={2.4} />}
              </button>

              {/* Tiny preview of the layer's terrain so you can tell layers apart at a glance. */}
              <div
                style={{
                  width: 18, height: 18, borderRadius: 4,
                  background: 'rgba(0,0,0,0.05)',
                  border: '1.5px solid var(--pb-line-2)',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
                title={layerTileset ? `Painting with ${layerTileset.name}` : 'No terrain assigned'}
              >
                {upperTile && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={upperTile.dataUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', imageRendering: 'pixelated' }} draggable={false} />
                )}
              </div>

              {editingId === layer.id ? (
                <input
                  autoFocus
                  defaultValue={layer.name}
                  onBlur={(e) => { renameLayer(layer.id, e.target.value || layer.name); setEditingId(null); }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur();
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  style={{
                    flex: 1,
                    background: 'var(--pb-paper)',
                    border: '1.5px solid var(--pb-line-2)',
                    borderRadius: 6,
                    padding: '2px 6px',
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--pb-ink)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span
                  className="flex-1"
                  style={{ fontSize: 11, fontWeight: 700, color: 'var(--pb-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  onDoubleClick={(e) => { e.stopPropagation(); setEditingId(layer.id); }}
                  title="Double-click to rename"
                >
                  {layer.name}
                </span>
              )}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); reorderLayer(layer.id, 'up'); }}
                disabled={idx === layers.length - 1}
                style={{ background: 'transparent', border: 0, cursor: idx === layers.length - 1 ? 'not-allowed' : 'pointer', color: 'var(--pb-ink-muted)', opacity: idx === layers.length - 1 ? 0.3 : 1, display: 'flex', alignItems: 'center' }}
                title="Move up"
              >
                <ChevronUp size={11} strokeWidth={2.4} />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); reorderLayer(layer.id, 'down'); }}
                disabled={idx === 0}
                style={{ background: 'transparent', border: 0, cursor: idx === 0 ? 'not-allowed' : 'pointer', color: 'var(--pb-ink-muted)', opacity: idx === 0 ? 0.3 : 1, display: 'flex', alignItems: 'center' }}
                title="Move down"
              >
                <ChevronDown size={11} strokeWidth={2.4} />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeLayer(layer.id); }}
                disabled={layers.length <= 1}
                style={{ background: 'transparent', border: 0, cursor: layers.length <= 1 ? 'not-allowed' : 'pointer', color: 'var(--pb-coral-ink)', opacity: layers.length <= 1 ? 0.3 : 1, display: 'flex', alignItems: 'center' }}
                title="Delete layer"
              >
                <Trash2 size={11} strokeWidth={2.4} />
              </button>
            </div>

            {/* Per-layer terrain picker — small dropdown so users can re-bind without scrolling up. */}
            <div className="flex items-center gap-1.5 mt-1.5" onClick={(e) => e.stopPropagation()}>
              <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--pb-ink-muted)', letterSpacing: 0.4 }}>TERRAIN</span>
              <select
                value={layer.tilesetId ?? ''}
                onChange={(e) => setLayerTileset(layer.id, e.target.value || null)}
                style={{
                  flex: 1,
                  background: 'var(--pb-paper)',
                  border: '1.5px solid var(--pb-line-2)',
                  borderRadius: 6,
                  padding: '3px 6px',
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--pb-ink)',
                  fontFamily: 'inherit',
                }}
              >
                <option value="">— none —</option>
                {tilesets.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 mt-1.5" onClick={(e) => e.stopPropagation()}>
              <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--pb-ink-muted)', letterSpacing: 0.4 }}>OPACITY</span>
              <input
                type="range"
                min={0} max={1} step={0.05}
                value={layer.opacity}
                onChange={(e) => setLayerOpacity(layer.id, parseFloat(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--pb-butter-ink)' }}
              />
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--pb-ink-muted)', minWidth: 26, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                {Math.round(layer.opacity * 100)}%
              </span>
            </div>
          </div>
        );
      })}
      <ChunkyButton onClick={() => addLayer()} kind="cream">
        <Plus size={12} strokeWidth={2.4} />
        Add layer
      </ChunkyButton>
    </div>
  );
}

/**
 * Object placement section. Each card is one logical asset (e.g. "house"),
 * which can hold multiple sprite STYLES (e.g. level-1 / level-2). Each
 * style is its own Supabase row in `tile_objects`, joined by `group_id`.
 *
 * Flows
 * -----
 * - "Upload sprite"           → creates a brand-new asset (group of 1).
 * - Click an asset thumbnail  → selects the asset's first style as the
 *                               OBJECT-tool brush; click canvas to place.
 * - Expand an asset card      → see all styles, switch which style the
 *                               brush is using, add another style, rename
 *                               or remove individual styles.
 * - "Add style" inside a card → uploads a new sprite into that asset
 *                               group (saved as another row sharing the
 *                               group_id, so it shows up across reloads).
 *
 * Hydration on mount: list flat rows from Supabase, group by `groupId`,
 * skip groups already present locally, and rebuild missing assets.
 */
function ObjectsSection() {
  const objectAssets = useTile((s) => s.objectAssets);
  const addObjectAsset = useTile((s) => s.addObjectAsset);
  const addStyleToAsset = useTile((s) => s.addStyleToAsset);
  const removeObjectAsset = useTile((s) => s.removeObjectAsset);
  const removeStyle = useTile((s) => s.removeStyle);
  const setStyleLabel = useTile((s) => s.setStyleLabel);
  const setStyleCloudId = useTile((s) => s.setStyleCloudId);
  const renameAsset = useTile((s) => s.renameAsset);
  const reorderAssets = useTile((s) => s.reorderAssets);
  const reorderStyles = useTile((s) => s.reorderStyles);
  const selectedAssetId = useTile((s) => s.selectedAssetId);
  const setSelectedAssetId = useTile((s) => s.setSelectedAssetId);
  const selectedStyleId = useTile((s) => s.selectedStyleId);
  const setSelectedStyleId = useTile((s) => s.setSelectedStyleId);
  const setTool = useTile((s) => s.setTool);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const styleInputRef = useRef<HTMLInputElement | null>(null);
  /** When the user clicks "Add style" on a card, we stash the target asset
   *  id here so the next file the picker returns is appended to that asset
   *  rather than creating a new one. Cleared after the upload completes. */
  const targetAssetForStyleRef = useRef<string | null>(null);
  /** Drag source for asset-card reorder. Native HTML5 DnD would let us
   *  serialise this through dataTransfer, but a ref is simpler and avoids
   *  the dataTransfer.types restrictions on dragover. */
  const dragAssetIdRef = useRef<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cloudStatus, setCloudStatus] = useState<'idle' | 'syncing' | 'synced' | 'offline'>('idle');
  const [expandedAssets, setExpandedAssets] = useState<Record<string, boolean>>({});
  const [collapsed, setCollapsed] = useState(false);
  /** What the user last clicked. Arrow keys move THIS item up/down within
   *  its parent list (asset → asset list, style → the asset's style[]
   *  array). Click sets it; reorder keeps it. */
  const [focused, setFocused] = useState<
    | { kind: 'asset'; assetId: string }
    | { kind: 'style'; assetId: string; styleId: string }
    | null
  >(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  // Hydrate uploaded sprites from Supabase on mount. Group by groupId so
  // each asset gets its full style list. Skip any group that's already
  // represented in the persisted Zustand state to avoid duplicates.
  useEffect(() => {
    let cancelled = false;
    setCloudStatus('syncing');
    listTileObjects()
      .then((rows) => {
        if (cancelled) return;
        const byGroup = new Map<string, CloudObject[]>();
        for (const r of rows) {
          const arr = byGroup.get(r.groupId) ?? [];
          arr.push(r);
          byGroup.set(r.groupId, arr);
        }
        // Snapshot the current local cloudId set so we can detect which
        // groups are already hydrated client-side.
        const hydratedCloudIds = new Set<string>();
        for (const a of Object.values(useTile.getState().objectAssets)) {
          for (const st of a.styles) if (st.cloudId) hydratedCloudIds.add(st.cloudId);
        }
        for (const [groupId, group] of byGroup) {
          if (cancelled) return;
          group.sort((a, b) => a.sortIndex - b.sortIndex || a.createdAt.localeCompare(b.createdAt));
          // If any row of this group is already known locally, assume the
          // whole group is hydrated and don't re-add it.
          if (group.some((r) => hydratedCloudIds.has(r.id))) continue;
          const first = group[0];
          // Use the cloud's group_id as the local asset.id so subsequent
          // "add style" saves can pass `groupId: asset.id` and land in the
          // same server group on reload.
          const { assetId, styleId } = addObjectAsset({
            assetId: groupId,
            name: first.name,
            label: first.label,
            dataUrl: first.dataUrl,
            width: first.width,
            height: first.height,
            cloudId: first.id,
          });
          for (let i = 1; i < group.length; i++) {
            const r = group[i];
            addStyleToAsset(assetId, {
              label: r.label,
              dataUrl: r.dataUrl,
              width: r.width,
              height: r.height,
              cloudId: r.id,
            });
          }
          void styleId;
        }
        if (!cancelled) setCloudStatus('synced');
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn('[object-cloud] list failed; running in local-only mode', err);
        setCloudStatus('offline');
      });
    return () => { cancelled = true; };
  }, [addObjectAsset, addStyleToAsset]);

  /** Generic upload helper. When `targetAssetId` is set, the sprite is
   *  appended as a new style on that asset (sharing the asset's groupId
   *  on the Supabase side, looked up via the asset's first style cloudId).
   *  Otherwise a new asset is created. */
  async function uploadFiles(files: File[], targetAssetId: string | null) {
    setUploading(true);
    setError(null);
    try {
      for (const file of files) {
        const baseName = file.name.replace(/\.[^.]+$/, '');
        const img = await fileToImage(file);
        const dataUrl = imageToDataUrl(img);
        if (targetAssetId) {
          const asset = useTile.getState().objectAssets[targetAssetId];
          if (!asset) continue;
          // Make labels unique within the asset so the server's
          // (user_id, group_id, label) upsert key doesn't overwrite an
          // existing style. Reuses baseName when free, otherwise appends
          // an index.
          const label = nextUniqueLabel(asset, baseName || `Style ${asset.styles.length + 1}`);
          const styleId = addStyleToAsset(targetAssetId, {
            label,
            dataUrl,
            width: img.naturalWidth,
            height: img.naturalHeight,
          });
          saveTileObject({
            name: asset.name,
            dataUrl,
            width: img.naturalWidth,
            height: img.naturalHeight,
            // asset.id IS the group_id end-to-end. For brand-new assets we
            // pass it explicitly on first upload too (below), so on reload
            // every style of an asset shares the same group_id and
            // reconstructs the asset 1:1.
            groupId: asset.id,
            label,
            sortIndex: asset.styles.length,
          }).then((cloud) => {
            setStyleCloudId(targetAssetId, styleId, cloud.id);
            setCloudStatus('synced');
          }).catch((err) => {
            console.warn('[object-cloud] save style failed; kept local-only', err);
            setCloudStatus('offline');
          });
        } else {
          const { assetId, styleId } = addObjectAsset({
            name: baseName,
            label: '',
            dataUrl,
            width: img.naturalWidth,
            height: img.naturalHeight,
          });
          saveTileObject({
            name: baseName,
            dataUrl,
            width: img.naturalWidth,
            height: img.naturalHeight,
            // Stamp the local assetId as the server group_id so subsequent
            // "Add style" calls land in the same Supabase group.
            groupId: assetId,
            label: '',
            sortIndex: 0,
          }).then((cloud) => {
            setStyleCloudId(assetId, styleId, cloud.id);
            setCloudStatus('synced');
          }).catch((err) => {
            console.warn('[object-cloud] save asset failed; kept local-only', err);
            setCloudStatus('offline');
          });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
    }
  }

  async function handleNewAssetFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0) return;
    await uploadFiles(files, null);
  }

  async function handleNewStyleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    const target = targetAssetForStyleRef.current;
    targetAssetForStyleRef.current = null;
    if (files.length === 0 || !target) return;
    await uploadFiles(files, target);
  }

  function handleAddStyleClick(assetId: string) {
    targetAssetForStyleRef.current = assetId;
    setExpandedAssets((m) => ({ ...m, [assetId]: true }));
    styleInputRef.current?.click();
  }

  function handleSelectAsset(asset: ObjectAsset) {
    setSelectedAssetId(asset.id);
    setTool('object');
  }

  function handleRemoveAsset(asset: ObjectAsset) {
    if (!confirm(`Delete asset "${asset.name}" and all ${asset.styles.length} style(s)? Placed objects using it will also be removed.`)) return;
    const hasAnyCloudStyle = asset.styles.some((s) => s.cloudId);
    removeObjectAsset(asset.id);
    if (hasAnyCloudStyle) {
      // asset.id is also the server-side group_id (we stamp it on save),
      // so a single group delete cleans up every style row at once.
      deleteTileObjectGroup(asset.id).catch((err) => {
        console.warn('[object-cloud] delete group failed', err);
      });
    }
  }

  function handleRemoveStyle(asset: ObjectAsset, style: ObjectStyle) {
    if (asset.styles.length === 1) {
      handleRemoveAsset(asset);
      return;
    }
    if (!confirm(`Delete style "${style.label || 'unlabeled'}" from "${asset.name}"?`)) return;
    removeStyle(asset.id, style.id);
    if (style.cloudId) {
      deleteTileObject(style.cloudId).catch((err) => {
        console.warn('[object-cloud] delete style failed', err);
      });
    }
  }

  // Display order honours the user's drag-reorder (sortIndex). addedAt is
  // a stable tie-breaker for the rare case two cards share an index — e.g.
  // mid-reorder before the action commits.
  const assetList = Object.values(objectAssets)
    .sort((a, b) => (a.sortIndex ?? 0) - (b.sortIndex ?? 0) || a.addedAt - b.addedAt);

  function scrollAssetIntoView(assetId: string) {
    // Defer to next frame so the focused state has rendered (focus ring
    // updates) before we measure. Using direct scrollTo + getBoundingClientRect
    // delta is more reliable than scrollIntoView for nested flex scroll
    // containers — scrollIntoView sometimes refuses to scroll when the
    // target is "near enough" by its own heuristics.
    requestAnimationFrame(() => {
      const c = listRef.current;
      if (!c) return;
      const sel = typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(assetId) : assetId;
      const node = c.querySelector<HTMLDivElement>(`[data-asset-id="${sel}"]`);
      if (!node) return;
      const cRect = c.getBoundingClientRect();
      const nRect = node.getBoundingClientRect();
      c.scrollTo({ left: c.scrollLeft + (nRect.left - cRect.left), behavior: 'smooth' });
    });
  }

  function handleListKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    // Cold start: if the user arrow-keys before clicking any card, seed
    // focus to the first asset so the next press has a starting point and
    // the user immediately sees a focus ring instead of a silent no-op.
    if (!focused) {
      if (assetList.length > 0) {
        e.preventDefault();
        const firstId = assetList[0].id;
        setFocused({ kind: 'asset', assetId: firstId });
        scrollAssetIntoView(firstId);
      }
      return;
    }
    e.preventDefault();
    const isHoriz = e.key === 'ArrowLeft' || e.key === 'ArrowRight';
    const dir = (e.key === 'ArrowUp' || e.key === 'ArrowLeft') ? -1 : 1;

    if (focused.kind === 'asset') {
      const order = assetList.map((a) => a.id);
      const idx = order.indexOf(focused.assetId);
      if (idx < 0) return;
      const newIdx = Math.max(0, Math.min(order.length - 1, idx + dir));
      if (newIdx === idx) return;

      if (isHoriz) {
        // Navigate to prev/next card and explicitly scroll the list so the
        // new card lands at the start of the visible area — that card's
        // own thumbnail IS the preview, no floating popup needed.
        const newAssetId = order[newIdx];
        setFocused({ kind: 'asset', assetId: newAssetId });
        scrollAssetIntoView(newAssetId);
      } else {
        // Vertical → reorder.
        const next = order.slice();
        [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
        reorderAssets(next);
      }
    } else {
      const asset = objectAssets[focused.assetId];
      if (!asset) return;
      const order = asset.styles.map((s) => s.id);
      const idx = order.indexOf(focused.styleId);
      if (idx < 0) return;
      const newIdx = Math.max(0, Math.min(order.length - 1, idx + dir));
      if (newIdx === idx) return;

      if (isHoriz) {
        // Navigate styles within the asset (no preview — styles are tiny rows).
        setFocused({ kind: 'style', assetId: asset.id, styleId: order[newIdx] });
      } else {
        // Vertical → reorder styles.
        const next = order.slice();
        [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
        const newOrder = reorderStyles(asset.id, next);
        newOrder.forEach((style, i) => {
          if (style.cloudId) {
            updateTileObject({ id: style.cloudId, sortIndex: i }).catch((err) => {
              console.warn('[object-cloud] style reorder failed', err);
            });
          }
        });
      }
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleNewAssetFiles}
        className="hidden"
      />
      <input
        ref={styleInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleNewStyleFiles}
        className="hidden"
      />

      {/* Category header — mirrors ScenePanel category-row pattern: grape ToneBadge + label + count, with a + IconButton on the right and a chevron. */}
      <div
        onClick={() => setCollapsed((c) => !c)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCollapsed((c) => !c); } }}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 14px',
          cursor: 'pointer',
          transition: 'background 120ms ease',
          userSelect: 'none',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--pb-cream-2)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 9,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--pb-grape)',
            color: 'var(--pb-grape-ink)',
            border: '1.5px solid var(--pb-grape-ink)',
          }}
        >
          <Box size={14} strokeWidth={2.2} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 12.5,
              fontWeight: 700,
              color: 'var(--pb-ink)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            Objects
          </div>
          <div
            style={{
              fontSize: 10.5,
              color: 'var(--pb-ink-muted)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {assetList.length} {assetList.length === 1 ? 'asset' : 'assets'} · Sprites you can drop on the canvas
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
          disabled={uploading}
          aria-label={uploading ? 'Uploading…' : 'Upload sprite'}
          title={uploading ? 'Uploading…' : 'Upload sprite'}
          style={{
            width: 26,
            height: 26,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--pb-paper)',
            border: '1.5px solid var(--pb-line-2)',
            borderRadius: 7,
            color: 'var(--pb-ink-soft)',
            cursor: uploading ? 'not-allowed' : 'pointer',
            opacity: uploading ? 0.55 : 1,
          }}
        >
          <Upload size={13} strokeWidth={2.4} />
        </button>
        <span
          aria-label={collapsed ? 'Expand' : 'Collapse'}
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--pb-ink-muted)',
            flexShrink: 0,
          }}
        >
          {collapsed ? <ChevronRight size={14} strokeWidth={2.4} /> : <ChevDown size={14} strokeWidth={2.4} />}
        </span>
      </div>

      {!collapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '4px 14px 14px' }}>
          {error && (
            <p style={{ fontSize: 11, color: 'var(--pb-coral-ink)', fontWeight: 600, margin: 0 }}>
              {error}
            </p>
          )}

          {assetList.length === 0 ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="rounded-lg p-4 text-center"
              style={{
                width: '100%',
                background: 'var(--pb-cream-2)',
                border: '1.5px dashed var(--pb-line-2)',
                cursor: uploading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <Upload size={16} strokeWidth={2.4} style={{ color: 'var(--pb-ink-muted)', margin: '0 auto 6px' }} />
              <p style={{ fontSize: 11.5, color: 'var(--pb-ink-muted)', lineHeight: 1.45, margin: 0, fontWeight: 600 }}>
                Drop a PNG/WebP to start your first sprite asset.
              </p>
            </button>
          ) : (
            <div
              ref={listRef}
              tabIndex={0}
              onKeyDown={handleListKeyDown}
              onPointerDown={(e) => {
                const t = e.target as HTMLElement;
                // Don't steal focus from inputs/textareas — they need it to
                // accept typing for inline rename. For everything else
                // (card divs, buttons), defer one frame so the click
                // target's own focus settles, then move focus to the list
                // so subsequent ArrowLeft/Right reach handleListKeyDown.
                if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
                requestAnimationFrame(() => listRef.current?.focus({ preventScroll: true }));
              }}
              onMouseEnter={() => {
                // Hover-to-focus: if the user is sweeping the mouse over
                // the panel and wants to use arrow keys, we move focus
                // here so the keys land in handleListKeyDown. Skip if the
                // user is currently typing in an input somewhere.
                const ae = document.activeElement as HTMLElement | null;
                if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.isContentEditable)) return;
                listRef.current?.focus({ preventScroll: true });
              }}
              onFocus={() => {
                // First time the list gains focus (e.g. via Tab) without any
                // selection yet — pick the first asset so arrow keys have a
                // starting point. Avoids the "press an arrow, nothing
                // happens" dead state.
                if (!focused && assetList.length > 0) {
                  setFocused({ kind: 'asset', assetId: assetList[0].id });
                }
              }}
              className="flex gap-3 overflow-x-auto"
              style={{ paddingBottom: 6, outline: 'none', scrollbarGutter: 'stable' }}
            >
              {assetList.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  expanded={!!expandedAssets[asset.id]}
                  isSelected={asset.id === selectedAssetId}
                  selectedStyleId={selectedStyleId}
                  size="lg"
                  isFocused={focused?.kind === 'asset' && focused.assetId === asset.id}
                  focusedStyleId={focused?.kind === 'style' && focused.assetId === asset.id ? focused.styleId : null}
                  onFocusAsset={() => setFocused({ kind: 'asset', assetId: asset.id })}
                  onFocusStyle={(styleId) => setFocused({ kind: 'style', assetId: asset.id, styleId })}
                  onSelect={() => { setFocused({ kind: 'asset', assetId: asset.id }); handleSelectAsset(asset); }}
                  onToggleExpand={() => setExpandedAssets((m) => ({ ...m, [asset.id]: !m[asset.id] }))}
                  onPickStyle={(styleId) => {
                    setFocused({ kind: 'style', assetId: asset.id, styleId });
                    setSelectedAssetId(asset.id);
                    setSelectedStyleId(styleId);
                    setTool('object');
                  }}
                  onRemoveAsset={() => handleRemoveAsset(asset)}
                  onRemoveStyle={(style) => handleRemoveStyle(asset, style)}
                  onRenameStyle={(styleId, label) => {
                    setStyleLabel(asset.id, styleId, label);
                    const style = asset.styles.find((s) => s.id === styleId);
                    if (style?.cloudId) {
                      updateTileObject({ id: style.cloudId, label }).catch((err) => {
                        console.warn('[object-cloud] style rename failed', err);
                      });
                    }
                  }}
                  onAddStyle={() => handleAddStyleClick(asset.id)}
                  onRenameAsset={(name) => {
                    renameAsset(asset.id, name);
                    if (asset.styles.some((s) => s.cloudId)) {
                      updateTileObject({ groupId: asset.id, name }).catch((err) => {
                        console.warn('[object-cloud] asset rename failed', err);
                      });
                    }
                  }}
                  onReorderStyles={(orderedStyleIds) => {
                    const newOrder = reorderStyles(asset.id, orderedStyleIds);
                    newOrder.forEach((style, i) => {
                      if (style.cloudId) {
                        updateTileObject({ id: style.cloudId, sortIndex: i }).catch((err) => {
                          console.warn('[object-cloud] style reorder failed', err);
                        });
                      }
                    });
                  }}
                  onDragStart={() => { dragAssetIdRef.current = asset.id; }}
                  onDragOverCard={(e) => {
                    if (!dragAssetIdRef.current || dragAssetIdRef.current === asset.id) return;
                    e.preventDefault();
                  }}
                  onDropCard={(e) => {
                    e.preventDefault();
                    const fromId = dragAssetIdRef.current;
                    dragAssetIdRef.current = null;
                    if (!fromId || fromId === asset.id) return;
                    const order = assetList.map((a) => a.id);
                    const fromIdx = order.indexOf(fromId);
                    const toIdx = order.indexOf(asset.id);
                    if (fromIdx < 0 || toIdx < 0) return;
                    const next = order.slice();
                    next.splice(fromIdx, 1);
                    next.splice(toIdx, 0, fromId);
                    reorderAssets(next);
                  }}
                />
              ))}
            </div>
          )}

          {cloudStatus !== 'idle' && cloudStatus !== 'synced' && (
            <CloudStatusPill status={cloudStatus} />
          )}
        </div>
      )}
    </div>
  );
}

/**
 * One asset card. Collapsed: thumbnail of the currently-active style + name
 * + style count badge. Expanded: list of every style (thumb + label edit +
 * delete) plus an "Add style" upload button. Picking a style sets the
 * OBJECT-tool brush to that exact sprite.
 *
 * Drag interactions
 * -----------------
 * - The grip-handle on the LEFT initiates HTML5 drag for the WHOLE card
 *   (asset reorder). Hovering another card while dragging fires the
 *   parent's onDragOver/onDrop, which calls reorderAssets.
 * - Inside the expanded styles list, each row has its own grip-handle
 *   for intra-asset style reorder. The card-level drag handlers ignore
 *   the style drags so there's no cross-talk (style drags don't bubble
 *   up to a card reorder).
 *
 * Inline rename
 * -------------
 * - Pencil icon next to the asset name → click toggles edit mode (an
 *   inline input). Same pattern for each style label. Save on blur or
 *   Enter; Escape cancels.
 */
function AssetCard({
  asset, expanded, isSelected, selectedStyleId,
  onSelect, onToggleExpand, onPickStyle, onRemoveAsset, onRemoveStyle,
  onRenameStyle, onAddStyle, onRenameAsset, onReorderStyles,
  onDragStart, onDragOverCard, onDropCard,
  size = 'sm', isFocused = false, focusedStyleId = null,
  onFocusAsset, onFocusStyle,
}: {
  asset: ObjectAsset;
  expanded: boolean;
  isSelected: boolean;
  selectedStyleId: string | null;
  onSelect: () => void;
  onToggleExpand: () => void;
  onPickStyle: (styleId: string) => void;
  onRemoveAsset: () => void;
  onRemoveStyle: (style: ObjectStyle) => void;
  onRenameStyle: (styleId: string, label: string) => void;
  onAddStyle: () => void;
  onRenameAsset: (name: string) => void;
  onReorderStyles: (orderedStyleIds: string[]) => void;
  onDragStart: () => void;
  onDragOverCard: (e: React.DragEvent) => void;
  onDropCard: (e: React.DragEvent) => void;
  isDropTarget?: boolean;
  dragIndex?: number;
  /** 'sm' = sidebar (default); 'lg' = library overlay (bigger thumbs). */
  size?: 'sm' | 'lg';
  /** Whether this whole card is the keyboard-reorder target. */
  isFocused?: boolean;
  /** Style id within this asset that's the keyboard-reorder target. */
  focusedStyleId?: string | null;
  onFocusAsset?: () => void;
  onFocusStyle?: (styleId: string) => void;
}) {
  const headerStyle = isSelected
    ? asset.styles.find((s) => s.id === selectedStyleId) ?? asset.styles[0]
    : asset.styles[0];

  // Layout dims that change with size — kept here so the JSX below stays
  // readable instead of branching on `size` inline.
  const dims = size === 'lg'
    ? { thumb: 256, styleThumb: 56, headerFont: 15, labelFont: 13, gripIcon: 14, padding: 10 }
    : { thumb: 36, styleThumb: 24, headerFont: 12, labelFont: 11, gripIcon: 12, padding: 6 };

  const [editingStyleId, setEditingStyleId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  // Whether the asset card itself is being dragged (vs a style row inside).
  // Native HTML5 drag bubbles, so we use this to suppress card-drag start
  // when the user grabs a style handle.
  const cardDragArmedRef = useRef(false);
  /** Style row currently being dragged; the handler reads this on drop. */
  const dragStyleIdRef = useRef<string | null>(null);

  function commitName(value: string) {
    setEditingName(false);
    const trimmed = value.trim();
    if (trimmed && trimmed !== asset.name) onRenameAsset(trimmed);
  }

  function reorderStylesViaDrop(targetStyleId: string) {
    const fromId = dragStyleIdRef.current;
    dragStyleIdRef.current = null;
    if (!fromId || fromId === targetStyleId) return;
    const order = asset.styles.map((s) => s.id);
    const fromIdx = order.indexOf(fromId);
    const toIdx = order.indexOf(targetStyleId);
    if (fromIdx < 0 || toIdx < 0) return;
    const next = order.slice();
    next.splice(fromIdx, 1);
    next.splice(toIdx, 0, fromId);
    onReorderStyles(next);
  }

  return (
    <div
      data-asset-id={asset.id}
      draggable
      onDragStart={(e) => {
        if (!cardDragArmedRef.current) { e.preventDefault(); return; }
        e.dataTransfer.effectAllowed = 'move';
        // Some browsers ignore dragstart without setData — empty payload
        // is fine because the parent uses a ref instead.
        try { e.dataTransfer.setData('text/plain', asset.id); } catch { /* ignore */ }
        onDragStart();
      }}
      onDragEnd={() => { cardDragArmedRef.current = false; }}
      onDragOver={onDragOverCard}
      onDrop={(e) => { cardDragArmedRef.current = false; onDropCard(e); }}
      onClick={() => { onFocusAsset?.(); }}
      style={{
        background: isSelected ? 'var(--pb-butter)' : 'var(--pb-cream-2)',
        // Focus ring uses a thicker accent border so it reads at a glance
        // and never collides with the selection styling. Selection still
        // wins on the chunky butter-ink border + drop shadow.
        border: `${isFocused && !isSelected ? 2 : 1.5}px solid ${
          isSelected ? 'var(--pb-butter-ink)' : isFocused ? '#0ea5e9' : 'var(--pb-line-2)'
        }`,
        borderRadius: 10,
        boxShadow: isSelected
          ? '0 2px 0 var(--pb-butter-ink)'
          : isFocused
            ? '0 0 0 2px rgba(14,165,233,0.18)'
            : 'none',
        overflow: 'hidden',
        ...(size === 'lg' ? { width: '100%', flexShrink: 0, display: 'flex', flexDirection: 'column' } : null),
      }}
    >
      {size === 'lg' && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onFocusAsset?.(); onSelect(); }}
          title={`Place "${asset.name}" — ${asset.styles.length} style(s)`}
          style={{
            display: 'block',
            width: '100%',
            aspectRatio: '1 / 1',
            background: 'rgba(0,0,0,0.04)',
            border: 0,
            borderBottom: '1.5px solid var(--pb-line-2)',
            padding: 8,
            cursor: 'pointer',
            overflow: 'hidden',
          }}
        >
          {headerStyle && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={headerStyle.dataUrl}
              alt={asset.name}
              style={{ width: '100%', height: '100%', objectFit: 'contain', imageRendering: 'pixelated' }}
              draggable={false}
            />
          )}
        </button>
      )}
      <div className="flex items-center gap-1.5" style={{ padding: dims.padding }}>
        <span
          // Mouse-down on the grip arms the card-level drag. Without this,
          // an HTML5 drag on the rest of the card (e.g. accidental from
          // the thumbnail button) would also try to reorder.
          onMouseDown={() => { cardDragArmedRef.current = true; }}
          onMouseUp={() => { /* keep armed until dragEnd */ }}
          title="Drag to reorder"
          style={{
            display: 'flex', alignItems: 'center',
            color: 'var(--pb-ink-muted)',
            cursor: 'grab',
            padding: '2px 0',
          }}
        >
          <GripVertical size={dims.gripIcon} strokeWidth={2.4} />
        </span>
        {size === 'sm' && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onFocusAsset?.(); onSelect(); }}
            title={`Place "${asset.name}" — ${asset.styles.length} style(s)`}
            style={{
              width: dims.thumb, height: dims.thumb,
              background: 'rgba(0,0,0,0.04)',
              border: '1.5px solid var(--pb-line-2)',
              borderRadius: 6,
              padding: 2,
              cursor: 'pointer',
              flexShrink: 0,
              overflow: 'hidden',
            }}
          >
            {headerStyle && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={headerStyle.dataUrl}
                alt={asset.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain', imageRendering: 'pixelated' }}
                draggable={false}
              />
            )}
          </button>
        )}
        <div className="flex-1 min-w-0">
          {editingName ? (
            <input
              autoFocus
              defaultValue={asset.name}
              onBlur={(e) => commitName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur();
                if (e.key === 'Escape') setEditingName(false);
              }}
              style={{
                width: '100%',
                background: 'var(--pb-paper)',
                border: '1.5px solid var(--pb-line-2)',
                borderRadius: 5,
                padding: '4px 8px',
                fontSize: dims.headerFont,
                fontWeight: 800,
                color: 'var(--pb-ink)',
              }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div className="flex items-center gap-1">
              <span
                onClick={(e) => { e.stopPropagation(); onFocusAsset?.(); onSelect(); }}
                onDoubleClick={(e) => { e.stopPropagation(); setEditingName(true); }}
                title="Click to select · double-click to rename"
                style={{ flex: 1, fontSize: dims.headerFont, fontWeight: 800, color: 'var(--pb-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer' }}
              >
                {asset.name}
              </span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setEditingName(true); }}
                title="Rename asset"
                style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--pb-ink-muted)', display: 'flex', alignItems: 'center', padding: 1 }}
              >
                <Pencil size={size === 'lg' ? 12 : 10} strokeWidth={2.4} />
              </button>
            </div>
          )}
          <div style={{ fontSize: size === 'lg' ? 11 : 10, color: 'var(--pb-ink-muted)', fontWeight: 600 }}>
            {asset.styles.length} style{asset.styles.length === 1 ? '' : 's'} · {headerStyle?.width}×{headerStyle?.height}px
          </div>
        </div>
        <button
          type="button"
          onClick={onToggleExpand}
          title={expanded ? 'Hide styles' : 'Show styles'}
          style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--pb-ink-muted)', display: 'flex', alignItems: 'center', padding: 2 }}
        >
          {expanded ? <ChevDown size={12} strokeWidth={2.4} /> : <ChevronRight size={12} strokeWidth={2.4} />}
        </button>
        <button
          type="button"
          onClick={onRemoveAsset}
          title="Delete asset"
          style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--pb-coral-ink)', display: 'flex', alignItems: 'center', padding: 2 }}
        >
          <Trash2 size={11} strokeWidth={2.4} />
        </button>
      </div>

      {expanded && (
        <div className="space-y-1.5" style={{ padding: '0 6px 6px' }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--pb-ink-muted)', letterSpacing: 0.5 }}>
            STYLES
          </div>
          <div className="space-y-1">
            {asset.styles.map((style, i) => {
              const isCurrent = isSelected && style.id === selectedStyleId;
              const isStyleFocused = focusedStyleId === style.id;
              const isEditing = editingStyleId === style.id;
              return (
                <div
                  key={style.id}
                  draggable
                  onClick={(e) => { e.stopPropagation(); onFocusStyle?.(style.id); }}
                  onDragStart={(e) => {
                    // Stop the asset-card drag from also firing when the
                    // user grabs a style row.
                    e.stopPropagation();
                    cardDragArmedRef.current = false;
                    dragStyleIdRef.current = style.id;
                    e.dataTransfer.effectAllowed = 'move';
                    try { e.dataTransfer.setData('text/plain', style.id); } catch { /* ignore */ }
                  }}
                  onDragOver={(e) => {
                    if (!dragStyleIdRef.current || dragStyleIdRef.current === style.id) return;
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    reorderStylesViaDrop(style.id);
                  }}
                  className="flex items-center gap-1.5"
                  style={{
                    padding: size === 'lg' ? 6 : 3,
                    background: isCurrent ? 'var(--pb-paper)' : isStyleFocused ? 'rgba(14,165,233,0.10)' : 'transparent',
                    border: `${isStyleFocused && !isCurrent ? 2 : 1.5}px solid ${
                      isCurrent ? 'var(--pb-butter-ink)' : isStyleFocused ? '#0ea5e9' : 'transparent'
                    }`,
                    borderRadius: 6,
                  }}
                >
                  <span
                    title="Drag to reorder"
                    style={{
                      display: 'flex', alignItems: 'center',
                      color: 'var(--pb-ink-muted)',
                      cursor: 'grab',
                    }}
                  >
                    <GripVertical size={size === 'lg' ? 13 : 11} strokeWidth={2.4} />
                  </span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onFocusStyle?.(style.id); onPickStyle(style.id); }}
                    title={`Use "${style.label || `Style ${i + 1}`}" as the brush`}
                    style={{
                      width: dims.styleThumb, height: dims.styleThumb, flexShrink: 0,
                      background: 'rgba(0,0,0,0.06)',
                      border: '1.5px solid var(--pb-line-2)',
                      borderRadius: 5,
                      padding: 0,
                      cursor: 'pointer',
                      overflow: 'hidden',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={style.dataUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', imageRendering: 'pixelated' }} draggable={false} />
                  </button>
                  {isEditing ? (
                    <input
                      autoFocus
                      defaultValue={style.label}
                      onBlur={(e) => { onRenameStyle(style.id, e.target.value); setEditingStyleId(null); }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur();
                        if (e.key === 'Escape') setEditingStyleId(null);
                      }}
                      style={{
                        flex: 1,
                        background: 'var(--pb-paper)',
                        border: '1.5px solid var(--pb-line-2)',
                        borderRadius: 5,
                        padding: '4px 8px',
                        fontSize: dims.labelFont,
                        fontWeight: 700,
                        color: 'var(--pb-ink)',
                      }}
                    />
                  ) : (
                    <span
                      onDoubleClick={(e) => { e.stopPropagation(); setEditingStyleId(style.id); }}
                      title="Double-click to rename"
                      style={{
                        flex: 1,
                        fontSize: dims.labelFont,
                        fontWeight: 700,
                        color: 'var(--pb-ink)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        cursor: 'text',
                      }}
                    >
                      {style.label || `Style ${i + 1}`}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setEditingStyleId(style.id); }}
                    title="Rename style"
                    style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--pb-ink-muted)', display: 'flex', alignItems: 'center', padding: 1 }}
                  >
                    <Pencil size={size === 'lg' ? 11 : 9} strokeWidth={2.4} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onRemoveStyle(style); }}
                    title="Delete this style"
                    style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--pb-coral-ink)', display: 'flex', alignItems: 'center', padding: 2 }}
                  >
                    <Trash2 size={size === 'lg' ? 12 : 10} strokeWidth={2.4} />
                  </button>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            onClick={onAddStyle}
            className="w-full flex items-center justify-center gap-1.5"
            style={{
              padding: '5px 8px',
              background: 'var(--pb-paper)',
              border: '1.5px dashed var(--pb-line-2)',
              borderRadius: 6,
              color: 'var(--pb-ink)',
              fontSize: 11,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            <Plus size={11} strokeWidth={2.4} />
            Add style
          </button>
        </div>
      )}
    </div>
  );
}


/** Pick the next free label inside an asset's style list. Used to keep
 *  the server's (user_id, group_id, label) upsert key from accidentally
 *  overwriting an existing row when a user uploads two files with the
 *  same base filename. */
function nextUniqueLabel(asset: ObjectAsset, base: string): string {
  const taken = new Set(asset.styles.map((s) => s.label));
  if (!taken.has(base)) return base;
  for (let i = 2; i < 1000; i++) {
    const candidate = `${base} ${i}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${base} ${Date.now()}`;
}

function NumField({
  label, value, onChange, min, max,
}: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <label className="flex-1 flex items-center gap-1" style={{ fontSize: 10, color: 'var(--pb-ink-muted)', fontWeight: 700, letterSpacing: 0.3 }}>
      {label}
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const v = parseInt(e.target.value);
          if (!Number.isNaN(v)) {
            const clamped = Math.max(min ?? -Infinity, Math.min(max ?? Infinity, v));
            onChange(clamped);
          }
        }}
        style={{
          flex: 1,
          minWidth: 0,
          padding: '4px 6px',
          background: 'var(--pb-cream-2)',
          border: '1.5px solid var(--pb-line-2)',
          borderRadius: 6,
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--pb-ink)',
          textAlign: 'center',
        }}
      />
    </label>
  );
}

function CloudStatusPill({ status }: { status: 'idle' | 'syncing' | 'synced' | 'offline' }) {
  if (status === 'idle') return null;
  const map = {
    syncing: { label: 'Syncing with Supabase…', color: 'var(--pb-ink-muted)', bg: 'transparent' },
    synced:  { label: 'Saved to Supabase',       color: 'rgb(40,100,30)',     bg: 'rgba(110,180,90,0.12)' },
    offline: { label: 'Local-only (Supabase offline)', color: 'rgb(150,80,40)', bg: 'rgba(231,148,76,0.16)' },
  } as const;
  const cfg = map[status];
  return (
    <div
      className="flex items-center gap-1.5"
      style={{
        padding: '4px 8px',
        background: cfg.bg,
        border: '1.5px solid var(--pb-line-2)',
        borderRadius: 6,
        fontSize: 10,
        fontWeight: 700,
        color: cfg.color,
        letterSpacing: 0.3,
      }}
    >
      <Cloud size={10} strokeWidth={2.6} />
      <span>{cfg.label}</span>
    </div>
  );
}

function ChunkyButton({
  onClick, disabled, kind, children,
}: {
  onClick: () => void; disabled?: boolean; kind: 'butter' | 'cream'; children: React.ReactNode;
}) {
  const bg = kind === 'butter' ? 'var(--pb-butter)' : 'var(--pb-cream-2)';
  const ink = kind === 'butter' ? 'var(--pb-butter-ink)' : 'var(--pb-ink)';
  const border = kind === 'butter' ? 'var(--pb-butter-ink)' : 'var(--pb-line-2)';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-center gap-1.5 transition-colors"
      style={{
        padding: '7px 10px',
        background: bg,
        border: `1.5px solid ${border}`,
        borderRadius: 8,
        color: ink,
        fontSize: 12,
        fontWeight: 800,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        boxShadow: kind === 'butter' ? '0 2px 0 var(--pb-butter-ink)' : 'none',
      }}
    >
      {children}
    </button>
  );
}

const kbd: React.CSSProperties = {
  padding: '1px 5px',
  borderRadius: 4,
  background: 'var(--pb-paper)',
  border: '1.5px solid var(--pb-line-2)',
  fontSize: 10,
  fontWeight: 700,
  color: 'var(--pb-ink)',
  fontFamily: 'inherit',
};

/**
 * Modal state shape for the upload-time "name your terrains" prompt.
 * Lives at TileAssetsView's top-level state and is rendered by
 * `NameTerrainModal` when not null.
 */
interface NamePromptState {
  upperPreviewUrl: string;
  lowerPreviewUrl: string;
  initialUpper: string;
  initialLower: string;
  upperLocked: boolean;
  lowerLocked: boolean;
  sheetName: string;
  resolve: (result: { upper?: string; lower?: string }) => void;
}

/**
 * Chunky-pastel modal that asks the user to name a freshly-uploaded
 * sheet's upper + lower terrains. Only shown when the file basename
 * doesn't parse via parseSheetName AND auto-match against existing
 * sheets didn't fill at least one side. Skip = leave labels unset
 * (legacy behavior, hard edges between sheets); Save = persist labels
 * so the auto-tile resolver bridges across sheets sharing a label.
 */
function NameTerrainModal({
  upperPreviewUrl, lowerPreviewUrl, initialUpper, initialLower,
  upperLocked, lowerLocked, sheetName, resolve,
}: NamePromptState) {
  const [upper, setUpper] = useState(initialUpper);
  const [lower, setLower] = useState(initialLower);
  const upperRef = useRef<HTMLInputElement | null>(null);

  // Autofocus the first empty input on mount so the user can just type.
  useEffect(() => {
    const target = upperRef.current;
    if (!target) return;
    target.focus();
    target.select();
  }, []);

  // Esc cancels the prompt (treated as "skip" — upload still proceeds
  // with whatever auto-match found). Enter saves the current values.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation();
        resolve({});
      } else if (e.key === 'Enter') {
        e.stopPropagation();
        resolve({ upper: upper.trim(), lower: lower.trim() });
      }
    }
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [resolve, upper, lower]);

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-modal"
        style={{ background: 'rgba(20, 18, 12, 0.55)', backdropFilter: 'blur(2px)' }}
        onClick={() => resolve({})}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="name-terrain-title"
        className="fixed z-modal inset-0 m-auto h-fit"
        style={{
          width: 'min(420px, 92vw)',
          background: 'var(--pb-paper)',
          border: '1.5px solid var(--pb-ink)',
          borderRadius: 14,
          boxShadow: '0 6px 0 var(--pb-ink), 0 12px 30px rgba(0,0,0,0.25)',
          padding: 16,
        }}
      >
        <div id="name-terrain-title" style={{ fontSize: 13, fontWeight: 800, color: 'var(--pb-ink)', marginBottom: 4 }}>
          Name the terrains in “{sheetName}”
        </div>
        <div style={{ fontSize: 11, color: 'var(--pb-ink-muted)', fontWeight: 600, lineHeight: 1.4, marginBottom: 14 }}>
          Two sheets sharing a label (e.g. both “grass”) auto-bridge so the right transition tile shows when their textures meet on the canvas.
        </div>

        <NameRow
          inputRef={upperRef}
          previewUrl={upperPreviewUrl}
          label="UPPER"
          placeholder="e.g. grass"
          value={upper}
          locked={upperLocked}
          onChange={setUpper}
        />
        <div style={{ height: 10 }} />
        <NameRow
          previewUrl={lowerPreviewUrl}
          label="LOWER"
          placeholder="e.g. dirt"
          value={lower}
          locked={lowerLocked}
          onChange={setLower}
        />

        <div className="flex items-center gap-2" style={{ marginTop: 16 }}>
          <button
            type="button"
            onClick={() => resolve({})}
            style={{
              flex: 1,
              padding: '8px 10px',
              background: 'var(--pb-cream-2)',
              border: '1.5px solid var(--pb-line-2)',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 800,
              color: 'var(--pb-ink-muted)',
              cursor: 'pointer',
            }}
          >
            Skip
          </button>
          <button
            type="button"
            onClick={() => resolve({ upper: upper.trim(), lower: lower.trim() })}
            style={{
              flex: 1.4,
              padding: '8px 10px',
              background: 'var(--pb-butter)',
              border: '1.5px solid var(--pb-butter-ink)',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 800,
              color: 'var(--pb-butter-ink)',
              cursor: 'pointer',
              boxShadow: '0 2px 0 var(--pb-butter-ink)',
            }}
          >
            Save names
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
}

function NameRow({
  previewUrl, label, placeholder, value, locked, onChange, inputRef,
}: {
  previewUrl: string;
  label: 'UPPER' | 'LOWER';
  placeholder: string;
  value: string;
  locked: boolean;
  onChange: (v: string) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        style={{
          width: 44, height: 44,
          background: 'var(--pb-cream-2)',
          border: '1.5px solid var(--pb-line-2)',
          borderRadius: 8,
          overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {previewUrl
          ? <img src={previewUrl} alt={label} style={{ width: '100%', height: '100%', imageRendering: 'pixelated', objectFit: 'cover' }} />
          : null}
      </div>
      <div className="flex-1 min-w-0">
        <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--pb-ink-muted)', letterSpacing: 0.5, marginBottom: 2 }}>
          {label}{locked ? ' · linked' : ''}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%',
            padding: '6px 8px',
            background: 'var(--pb-cream-2)',
            border: '1.5px solid var(--pb-line-2)',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--pb-ink)',
            outline: 'none',
          }}
        />
      </div>
    </div>
  );
}
