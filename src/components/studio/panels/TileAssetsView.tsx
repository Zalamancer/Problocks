'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Upload, Trash2, Eye, EyeOff, ChevronUp, ChevronDown, Plus, Sparkles,
  Box, ChevronRight, ChevronDown as ChevDown, Check, Cloud, Link2,
  Pencil, GripVertical, X, Layers, Globe2, Folder, FolderPlus,
  Users,
} from 'lucide-react';
import { PanelIconTabs } from '@/components/ui/panel-controls/PanelIconTabs';
import { useTile, type Tileset, type Tile, type ObjectAsset, type ObjectClass } from '@/store/tile-store';
import { sliceFile, loadImage, sliceImage, fileToImage, imageToDataUrl } from '@/lib/tile-slicer';
import { PURE_UPPER_INDEX, PURE_LOWER_INDEX, TILE_INDEX_TO_QUADRANTS, parseSheetName } from '@/lib/wang-tiles';
import { tileSimilarityCached, TILE_SIMILARITY_THRESHOLD } from '@/lib/tile-similarity';
import { analyzePalette, bucketLabel, type ColorBucket } from '@/lib/tile-palette';
import { saveTileSheet, listTileSheets, deleteTileSheet } from '@/lib/tile-cloud';
import { saveTileObject, listTileObjects, deleteTileObjectGroup, updateTileObject, type CloudObject } from '@/lib/object-cloud';
import { useStudio } from '@/store/studio-store';

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

      {view === 'assets' && <AssetsSubTabs />}

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
  const baseTextureId = useTile((s) => s.baseTextureId);
  const setBaseTexture = useTile((s) => s.setBaseTexture);
  const setTool = useTile((s) => s.setTool);
  const addTilesetVariant = useTile((s) => s.addTilesetVariant);
  const removeTilesetVariant = useTile((s) => s.removeTilesetVariant);
  const setActiveTilesetVariant = useTile((s) => s.setActiveTilesetVariant);

  // Which swatch (if any) currently has its "connect" popover open.
  const [linkingSide, setLinkingSide] = useState<null | 'u' | 'l'>(null);
  // Hidden file input for variant uploads, scoped to this card so each
  // terrain has its own upload slot independent of the main "Upload Wang
  // sheet" picker at the top of the panel.
  const variantInputRef = useRef<HTMLInputElement | null>(null);
  const [variantError, setVariantError] = useState<string | null>(null);
  const [variantUploading, setVariantUploading] = useState(false);

  // Which slice dataUrls render (variant-aware). Falls back to the base
  // tile dataUrls when no variant is active.
  const activeIdx = tileset.activeVariantIndex ?? 0;
  const variantTileUrls = activeIdx > 0
    ? tileset.variants?.[activeIdx - 1]?.tileDataUrls
    : undefined;
  const upperDataUrl = variantTileUrls?.[PURE_UPPER_INDEX] ?? upperTile?.dataUrl;
  const lowerDataUrl = variantTileUrls?.[PURE_LOWER_INDEX] ?? lowerTile?.dataUrl;
  const debugTileUrls = tileset.tileIds.map((id, i) => variantTileUrls?.[i] ?? tiles[id]?.dataUrl ?? '');

  async function handleVariantFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setVariantUploading(true);
    setVariantError(null);
    try {
      for (const file of Array.from(files)) {
        const sliced = await sliceFile(file, { cols: tileset.cols, rows: tileset.rows });
        if (sliced.tiles.length !== tileset.tileIds.length) {
          throw new Error(`Variant has ${sliced.tiles.length} tiles, expected ${tileset.tileIds.length}`);
        }
        const baseName = file.name.replace(/\.[^.]+$/, '');
        addTilesetVariant(tileset.id, {
          name: baseName,
          sheetDataUrl: sliced.sheetDataUrl,
          tileDataUrls: sliced.tiles,
        });
      }
    } catch (err) {
      console.error('[tile-variant] upload failed', err);
      setVariantError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setVariantUploading(false);
      if (variantInputRef.current) variantInputRef.current.value = '';
    }
  }

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
          uploading a NEW tileset that shares this texture. The globe icon
          marks the texture as the map-wide BASE (renderer fills the entire
          viewport with it; layered corners override + transition into it). */}
      <div className="flex items-center gap-2 mt-2">
        <BrushSwatch
          dataUrl={upperDataUrl}
          label="UPPER"
          active={brushTextureId === tileset.upperTextureId}
          isBase={baseTextureId === tileset.upperTextureId}
          shareCount={sharedUpperCount}
          linking={linkingSide === 'u'}
          onClick={() => pickBrush('u')}
          onChainClick={() => setLinkingSide(linkingSide === 'u' ? null : 'u')}
          onBaseClick={() => setBaseTexture(
            baseTextureId === tileset.upperTextureId ? null : tileset.upperTextureId,
          )}
        />
        <BrushSwatch
          dataUrl={lowerDataUrl}
          label="LOWER"
          active={brushTextureId === tileset.lowerTextureId}
          isBase={baseTextureId === tileset.lowerTextureId}
          shareCount={sharedLowerCount}
          linking={linkingSide === 'l'}
          onClick={() => pickBrush('l')}
          onChainClick={() => setLinkingSide(linkingSide === 'l' ? null : 'l')}
          onBaseClick={() => setBaseTexture(
            baseTextureId === tileset.lowerTextureId ? null : tileset.lowerTextureId,
          )}
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

      {/* Variant strip — alternate sheet swatches for the same terrain.
          Click a chip to swap which sheet renders; the auto-tile lookup
          and corner data are unchanged, so a click before-and-after
          shows the same map painted in a different art style. */}
      <VariantStrip
        tileset={tileset}
        baseSheetUrl={tileset.sheetDataUrl}
        uploading={variantUploading}
        error={variantError}
        onUploadClick={() => variantInputRef.current?.click()}
        onPick={(idx) => setActiveTilesetVariant(tileset.id, idx)}
        onRemoveVariant={(variantId) => removeTilesetVariant(tileset.id, variantId)}
      />
      <input
        ref={variantInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleVariantFiles}
        className="hidden"
      />

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

      {/* Palette tint — analyses the sheet's pixels to surface dominant
          colour groups (greens / blues / browns / etc.), then exposes
          hue + saturation + brightness sliders per group. Adjusting
          "green" pushes every green pixel, even mid-transition pieces
          where green and brown share one tile, instead of treating each
          UPPER / LOWER side as one block. */}
      <PaletteSection tilesetId={tileset.id} sheetDataUrl={tileset.sheetDataUrl} />

      {/* All 16 sliced tiles, always visible. Hover to see the (NW,NE,SW,SE)
          encoding overlay so the user can sanity-check the auto-tile lookup.
          Variant-aware — `tileDataUrls` substitutes in for the base slices
          when a variant is active. */}
      <DebugTileGrid tileset={tileset} tileDataUrls={debugTileUrls} />
    </div>
  );
}

function BrushSwatch({
  dataUrl, label, active, isBase, shareCount, linking, onClick, onChainClick, onBaseClick,
}: {
  /** PNG dataUrl to render in the thumbnail. Variant-aware — the parent
   *  resolves the active variant's slice URL before passing it in. */
  dataUrl: string | undefined;
  label: 'UPPER' | 'LOWER';
  active: boolean;
  /** True when this texture id is the map-wide base. Highlights the
   *  globe icon and gives the swatch a subtle ring so the user can see
   *  at a glance which texture is filling the infinite viewport. */
  isBase: boolean;
  /** Number of OTHER tilesets sharing this texture id. >0 means it's part
   *  of a chain — shown as a small badge next to the chain icon. */
  shareCount: number;
  linking: boolean;
  onClick: () => void;
  onChainClick: () => void;
  /** Toggle this texture as the map-wide base layer. Clicking again on
   *  the active base unsets it (caller passes null). */
  onBaseClick: () => void;
}) {
  return (
    <div
      className="flex-1"
      style={{
        position: 'relative',
        background: active ? 'var(--pb-paper)' : 'transparent',
        border: `1.5px solid ${linking ? 'var(--pb-mint-ink, #2d8f5b)' : (isBase ? 'rgba(60,140,40,0.7)' : (active ? 'var(--pb-butter-ink)' : 'var(--pb-line-2)'))}`,
        borderRadius: 8,
        boxShadow: active ? '0 2px 0 var(--pb-butter-ink)' : (isBase ? '0 0 0 2px rgba(110,180,90,0.25)' : 'none'),
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
          {dataUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={dataUrl} alt={label} style={{ width: '100%', height: '100%', objectFit: 'contain', imageRendering: 'pixelated' }} draggable={false} />
          )}
        </div>
        <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--pb-ink)', letterSpacing: 0.5 }}>
          {label}
        </span>
      </button>
      {/* Base-layer toggle — marks this texture as the map-wide infinite
          base. Click again to unset. Mirrors the chain button at top-right
          but lives at top-left so the two never overlap. Highlighted green
          when active so the user can spot which side is the base at a
          glance. */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onBaseClick(); }}
        title={isBase ? 'This is the map-wide base — click to unset' : 'Set as map-wide base layer'}
        style={{
          position: 'absolute',
          top: 2,
          left: 2,
          width: 18,
          height: 18,
          padding: 0,
          background: isBase ? 'rgba(110,180,90,0.18)' : 'var(--pb-paper)',
          border: `1.5px solid ${isBase ? 'rgba(60,140,40,0.55)' : 'var(--pb-line-2)'}`,
          color: isBase ? 'rgb(40,100,30)' : 'var(--pb-ink-muted)',
          borderRadius: 999,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Globe2 size={10} strokeWidth={2.6} />
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
 * Horizontal strip of "alternate sheet" chips for a terrain card.
 * Index 0 is always the original (base) sheet; subsequent chips are
 * the user-uploaded variants. Clicking a chip swaps which sheet's
 * sliced tiles render — the corner data + auto-tile logic stay put,
 * so the same map appears in a different art style instantly.
 *
 * The "+" button at the end opens the variant file picker. Variants
 * must slice cleanly to the parent's (cols, rows) — the validation
 * is enforced in the upload handler.
 */
function VariantStrip({
  tileset, baseSheetUrl, uploading, error, onUploadClick, onPick, onRemoveVariant,
}: {
  tileset: Tileset;
  baseSheetUrl: string;
  uploading: boolean;
  error: string | null;
  onUploadClick: () => void;
  onPick: (index: number) => void;
  onRemoveVariant: (variantId: string) => void;
}) {
  const activeIdx = tileset.activeVariantIndex ?? 0;
  const variants = tileset.variants ?? [];
  return (
    <div className="mt-2">
      <div className="flex items-center gap-1 mb-1">
        <Layers size={10} strokeWidth={2.4} style={{ color: 'var(--pb-ink-muted)' }} />
        <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--pb-ink-muted)', letterSpacing: 0.5 }}>
          STYLE VARIANT
        </span>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        <VariantChip
          sheetUrl={baseSheetUrl}
          label="Base"
          active={activeIdx === 0}
          onClick={() => onPick(0)}
        />
        {variants.map((v, i) => (
          <VariantChip
            key={v.id}
            sheetUrl={v.sheetDataUrl}
            label={v.name || `Variant ${i + 1}`}
            active={activeIdx === i + 1}
            onClick={() => onPick(i + 1)}
            onRemove={() => onRemoveVariant(v.id)}
          />
        ))}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onUploadClick(); }}
          disabled={uploading}
          title="Add an alternate sheet for this terrain (same grid)"
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            border: '1.5px dashed var(--pb-line-2)',
            background: 'var(--pb-paper)',
            color: 'var(--pb-ink-muted)',
            cursor: uploading ? 'progress' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: uploading ? 0.6 : 1,
          }}
        >
          <Plus size={13} strokeWidth={2.6} />
        </button>
      </div>
      {error && (
        <p style={{ fontSize: 10, color: 'var(--pb-coral-ink)', fontWeight: 600, marginTop: 4 }}>
          {error}
        </p>
      )}
    </div>
  );
}

function VariantChip({
  sheetUrl, label, active, onClick, onRemove,
}: {
  sheetUrl: string;
  label: string;
  active: boolean;
  onClick: () => void;
  /** Absent on the base chip — user can't remove the original sheet. */
  onRemove?: () => void;
}) {
  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        title={`Render with: ${label}`}
        style={{
          width: 32,
          height: 32,
          padding: 0,
          borderRadius: 6,
          border: `1.5px solid ${active ? 'var(--pb-butter-ink)' : 'var(--pb-line-2)'}`,
          background: 'var(--pb-paper)',
          boxShadow: active ? '0 2px 0 var(--pb-butter-ink)' : 'none',
          cursor: 'pointer',
          overflow: 'hidden',
          display: 'block',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={sheetUrl}
          alt={label}
          style={{ width: '100%', height: '100%', objectFit: 'cover', imageRendering: 'pixelated' }}
          draggable={false}
        />
      </button>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          title="Remove this variant"
          style={{
            position: 'absolute',
            top: -5,
            right: -5,
            width: 14,
            height: 14,
            padding: 0,
            borderRadius: 999,
            border: '1.5px solid var(--pb-coral-ink)',
            background: 'var(--pb-paper)',
            color: 'var(--pb-coral-ink)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={8} strokeWidth={3} />
        </button>
      )}
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
function DebugTileGrid({ tileset, tileDataUrls }: { tileset: Tileset; tileDataUrls: string[] }) {
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
        const dataUrl = tileDataUrls[i];
        if (!dataUrl) return <div key={i} style={{ aspectRatio: '1 / 1', background: 'rgba(0,0,0,0.05)' }} />;
        return <DebugTileCell key={id} dataUrl={dataUrl} index={i} />;
      })}
    </div>
  );
}

function DebugTileCell({ dataUrl, index }: { dataUrl: string; index: number }) {
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
        src={dataUrl}
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
  const setStyleCloudId = useTile((s) => s.setStyleCloudId);
  const renameAsset = useTile((s) => s.renameAsset);
  const reorderAssets = useTile((s) => s.reorderAssets);
  const selectedAssetId = useTile((s) => s.selectedAssetId);
  const setSelectedAssetId = useTile((s) => s.setSelectedAssetId);
  const setTool = useTile((s) => s.setTool);
  // ── Class taxonomy hooks ────────────────────────────────────────
  const objectClasses = useTile((s) => s.objectClasses);
  const assetClassIds = useTile((s) => s.assetClassIds);
  const addObjectClass = useTile((s) => s.addObjectClass);
  const renameObjectClass = useTile((s) => s.renameObjectClass);
  const removeObjectClass = useTile((s) => s.removeObjectClass);
  const setAssetClass = useTile((s) => s.setAssetClass);
  // Auto-open the right Properties tab on asset click so the asset's image
  // preview + slice / styles controls show without a manual tab switch.
  const setRightPanelGroup = useStudio((s) => s.setRightPanelGroup);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  /** Drag source for asset-card reorder. Native HTML5 DnD would let us
   *  serialise this through dataTransfer, but a ref is simpler and avoids
   *  the dataTransfer.types restrictions on dragover. */
  const dragAssetIdRef = useRef<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cloudStatus, setCloudStatus] = useState<'idle' | 'syncing' | 'synced' | 'offline'>('idle');
  const [collapsed, setCollapsed] = useState(false);
  /** Per-class-folder open/closed state. Defaults to OPEN (entry absent
   *  → open) so users see what they just created without an extra click. */
  const [collapsedClasses, setCollapsedClasses] = useState<Record<string, boolean>>({});
  /** When the user clicks "+ class", we create the class and set this to
   *  its id so the inline rename input mounts focused. Cleared on commit. */
  const [renamingClassId, setRenamingClassId] = useState<string | null>(null);
  /** Class header that's currently being hovered as a drop target — used
   *  for the highlight ring during asset drag-into-folder. */
  const [dropTargetClassId, setDropTargetClassId] = useState<string | 'root' | null>(null);
  /** Keyboard-focused asset row. Up/Down moves it through the list; Enter
   *  selects (mirrors mouse click behaviour). Style-axis navigation lived
   *  on the inline-expand list which is now in the right panel, so the
   *  shape simplified to a single asset-id. */
  const [focused, setFocused] = useState<{ kind: 'asset'; assetId: string } | null>(null);
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

  /** Upload one or more sprites as brand-new assets. The right-panel
   *  Properties view handles "add style to existing asset" via its own
   *  file input, so this section only ever creates new assets. */
  async function uploadFiles(files: File[]) {
    setUploading(true);
    setError(null);
    try {
      for (const file of files) {
        const baseName = file.name.replace(/\.[^.]+$/, '');
        const img = await fileToImage(file);
        const dataUrl = imageToDataUrl(img);
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
          // "Add style" calls (from the right panel) land in the same
          // Supabase group.
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
    await uploadFiles(files);
  }

  function handleSelectAsset(asset: ObjectAsset) {
    // Clear any canvas-object selection so the right Properties panel
    // shows the ASSET view (TileAssetPropertiesPanel) instead of the
    // OBJECT view — the StudioLayout switch gives object selection
    // priority, which would otherwise mask the asset panel.
    useTile.getState().selectObject(null);
    setSelectedAssetId(asset.id);
    setTool('object');
    setRightPanelGroup('properties');
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

  // Display order honours the user's drag-reorder (sortIndex). addedAt is
  // a stable tie-breaker for the rare case two cards share an index — e.g.
  // mid-reorder before the action commits.
  const assetList = Object.values(objectAssets)
    .sort((a, b) => (a.sortIndex ?? 0) - (b.sortIndex ?? 0) || a.addedAt - b.addedAt);

  // ── Class taxonomy view-models ──────────────────────────────────
  /** Children of one class (or root when classId === null), sorted by
   *  the class's sibling sortIndex. */
  function classChildrenOf(parentId: string | null): ObjectClass[] {
    return Object.values(objectClasses)
      .filter((c) => c.parentId === parentId)
      .sort((a, b) => a.sortIndex - b.sortIndex);
  }
  /** Assets that belong to a class (null = root / uncategorised). */
  function assetsInClass(classId: string | null): ObjectAsset[] {
    return assetList.filter((a) => {
      const cid = assetClassIds[a.id] ?? null;
      return cid === classId;
    });
  }
  /** Total assets recursively under a class (for the count badge). */
  function recursiveAssetCount(classId: string): number {
    let total = assetsInClass(classId).length;
    for (const child of classChildrenOf(classId)) {
      total += recursiveAssetCount(child.id);
    }
    return total;
  }

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
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
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
    const dir = e.key === 'ArrowUp' ? -1 : 1;
    const order = assetList.map((a) => a.id);
    const idx = order.indexOf(focused.assetId);
    if (idx < 0) return;
    const newIdx = Math.max(0, Math.min(order.length - 1, idx + dir));
    if (newIdx === idx) return;
    const next = order.slice();
    [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
    reorderAssets(next);
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
          onClick={(e) => {
            e.stopPropagation();
            const id = addObjectClass({ name: 'New class', parentId: null });
            setRenamingClassId(id);
            setCollapsed(false);
          }}
          aria-label="Add class"
          title="Add class folder (e.g. Trees, Buildings)"
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
            cursor: 'pointer',
          }}
        >
          <FolderPlus size={13} strokeWidth={2.4} />
        </button>
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

          {(() => {
            const renderAssetCard = (asset: ObjectAsset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                isSelected={asset.id === selectedAssetId}
                isFocused={focused?.kind === 'asset' && focused.assetId === asset.id}
                onFocusAsset={() => setFocused({ kind: 'asset', assetId: asset.id })}
                onSelect={() => { setFocused({ kind: 'asset', assetId: asset.id }); handleSelectAsset(asset); }}
                onRemoveAsset={() => handleRemoveAsset(asset)}
                onRenameAsset={(name) => {
                  renameAsset(asset.id, name);
                  if (asset.styles.some((s) => s.cloudId)) {
                    updateTileObject({ groupId: asset.id, name }).catch((err) => {
                      console.warn('[object-cloud] asset rename failed', err);
                    });
                  }
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
                  // Cross-class drop on a sibling card snaps the dragged
                  // asset into the target's class first, then reorders so
                  // it lands at that exact spot. Same-class is a pure
                  // reorder.
                  const fromClass = assetClassIds[fromId] ?? null;
                  const toClass = assetClassIds[asset.id] ?? null;
                  if (fromClass !== toClass) setAssetClass(fromId, toClass);
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
            );

            const renderClassFolder = (cls: ObjectClass, depth: number) => {
              const open = !collapsedClasses[cls.id];
              const childClasses = classChildrenOf(cls.id);
              const childAssets = assetsInClass(cls.id);
              const totalAssets = recursiveAssetCount(cls.id);
              const isRenaming = renamingClassId === cls.id;
              const isDropTarget = dropTargetClassId === cls.id;
              return (
                <div key={cls.id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {/* Class folder header — chunky-pastel card. Drop a sprite
                      on it to assign that asset to this class. */}
                  <div
                    onClick={() => setCollapsedClasses((m) => ({ ...m, [cls.id]: open }))}
                    onDragOver={(e) => {
                      if (!dragAssetIdRef.current) return;
                      e.preventDefault();
                      if (dropTargetClassId !== cls.id) setDropTargetClassId(cls.id);
                    }}
                    onDragLeave={() => {
                      if (dropTargetClassId === cls.id) setDropTargetClassId(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDropTargetClassId(null);
                      const fromId = dragAssetIdRef.current;
                      dragAssetIdRef.current = null;
                      if (!fromId) return;
                      setAssetClass(fromId, cls.id);
                      // Also expand the folder so the user sees where it landed.
                      setCollapsedClasses((m) => ({ ...m, [cls.id]: false }));
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 8px',
                      background: isDropTarget ? 'var(--pb-butter)' : 'var(--pb-cream-2)',
                      border: `1.5px solid ${isDropTarget ? 'var(--pb-butter-ink)' : 'var(--pb-line-2)'}`,
                      borderRadius: 8,
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    <span style={{ display: 'flex', color: 'var(--pb-ink-muted)' }}>
                      {open ? <ChevDown size={12} strokeWidth={2.4} /> : <ChevronRight size={12} strokeWidth={2.4} />}
                    </span>
                    <span style={{ display: 'flex', color: 'var(--pb-ink)' }}>
                      <Folder size={13} strokeWidth={2.4} />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {isRenaming ? (
                        <input
                          autoFocus
                          defaultValue={cls.name}
                          onClick={(e) => e.stopPropagation()}
                          onBlur={(e) => {
                            const v = e.target.value.trim();
                            if (v) renameObjectClass(cls.id, v);
                            setRenamingClassId(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur();
                            if (e.key === 'Escape') setRenamingClassId(null);
                          }}
                          style={{
                            width: '100%',
                            background: 'var(--pb-paper)',
                            border: '1.5px solid var(--pb-line-2)',
                            borderRadius: 5,
                            padding: '2px 6px',
                            fontSize: 12,
                            fontWeight: 800,
                            color: 'var(--pb-ink)',
                          }}
                        />
                      ) : (
                        <span
                          onDoubleClick={(e) => { e.stopPropagation(); setRenamingClassId(cls.id); }}
                          title="Click to expand · double-click to rename"
                          style={{
                            display: 'block',
                            fontSize: 12,
                            fontWeight: 800,
                            color: 'var(--pb-ink)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {cls.name}
                        </span>
                      )}
                    </div>
                    <span
                      title={`${totalAssets} asset${totalAssets === 1 ? '' : 's'} (recursive)`}
                      style={{ fontSize: 10, fontWeight: 700, color: 'var(--pb-ink-muted)', padding: '0 4px' }}
                    >
                      {totalAssets}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const newId = addObjectClass({ name: 'New class', parentId: cls.id });
                        setRenamingClassId(newId);
                        // Auto-expand parent so the new sub-class is visible.
                        setCollapsedClasses((m) => ({ ...m, [cls.id]: false }));
                      }}
                      title="Add sub-class"
                      style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--pb-ink-muted)', display: 'flex', padding: 1 }}
                    >
                      <Plus size={12} strokeWidth={2.4} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setRenamingClassId(cls.id); }}
                      title="Rename class"
                      style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--pb-ink-muted)', display: 'flex', padding: 1 }}
                    >
                      <Pencil size={11} strokeWidth={2.4} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!confirm(`Remove class "${cls.name}"? Sub-classes and assets move up one level (nothing is deleted).`)) return;
                        removeObjectClass(cls.id);
                      }}
                      title="Delete class folder"
                      style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--pb-coral-ink)', display: 'flex', padding: 1 }}
                    >
                      <Trash2 size={11} strokeWidth={2.4} />
                    </button>
                  </div>
                  {open && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 14 }}>
                      {childClasses.map((c) => renderClassFolder(c, depth + 1))}
                      {childAssets.map(renderAssetCard)}
                      {childClasses.length === 0 && childAssets.length === 0 && (
                        <div
                          style={{
                            padding: '6px 10px',
                            fontSize: 10.5,
                            color: 'var(--pb-ink-muted)',
                            fontStyle: 'italic',
                            border: '1.5px dashed var(--pb-line-2)',
                            borderRadius: 6,
                            background: 'rgba(0,0,0,0.02)',
                            textAlign: 'center',
                          }}
                        >
                          Empty — drop a sprite here, or add a sub-class.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            };

            const topLevelClasses = classChildrenOf(null);
            const rootAssets = assetsInClass(null);
            const isCompletelyEmpty = assetList.length === 0 && topLevelClasses.length === 0;

            if (isCompletelyEmpty) {
              return (
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
              );
            }

            return (
              <div
                ref={listRef}
                tabIndex={0}
                onKeyDown={handleListKeyDown}
                onPointerDown={(e) => {
                  const t = e.target as HTMLElement;
                  if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
                  requestAnimationFrame(() => listRef.current?.focus({ preventScroll: true }));
                }}
                onMouseEnter={() => {
                  const ae = document.activeElement as HTMLElement | null;
                  if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.isContentEditable)) return;
                  listRef.current?.focus({ preventScroll: true });
                }}
                onFocus={() => {
                  if (!focused && assetList.length > 0) {
                    setFocused({ kind: 'asset', assetId: assetList[0].id });
                  }
                }}
                // Drop on the gap area (outside any class header / card) =
                // move the dragged asset back to root (uncategorised).
                onDragOver={(e) => {
                  if (!dragAssetIdRef.current) return;
                  e.preventDefault();
                  if (dropTargetClassId !== 'root') setDropTargetClassId('root');
                }}
                onDragLeave={(e) => {
                  // Only clear when leaving the container itself (not its children).
                  if (e.currentTarget === e.target && dropTargetClassId === 'root') {
                    setDropTargetClassId(null);
                  }
                }}
                onDrop={(e) => {
                  if (e.target !== e.currentTarget) return; // a child handled it
                  e.preventDefault();
                  setDropTargetClassId(null);
                  const fromId = dragAssetIdRef.current;
                  dragAssetIdRef.current = null;
                  if (!fromId) return;
                  setAssetClass(fromId, null);
                }}
                className="flex flex-col gap-2 overflow-y-auto"
                style={{
                  outline: 'none',
                  maxHeight: 480,
                  scrollbarGutter: 'stable',
                  // Subtle ring when the user is dragging over the empty
                  // gap — signals "drop here = uncategorised".
                  background: dropTargetClassId === 'root' ? 'rgba(0,0,0,0.03)' : undefined,
                  borderRadius: 6,
                  padding: 2,
                }}
              >
                {topLevelClasses.map((cls) => renderClassFolder(cls, 0))}
                {rootAssets.map(renderAssetCard)}
              </div>
            );
          })()}

          {cloudStatus !== 'idle' && cloudStatus !== 'synced' && (
            <CloudStatusPill status={cloudStatus} />
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Three-tab toggle for the 2D Tile Assets panel — Objects / Groups /
 * Characters. Mirrors the [Generate | History] `PanelIconTabs` toggle from
 * `panels/PartStudioPanel.tsx`: the active tab expands into a white pill
 * and shows its label, inactive tabs collapse to icon-only.
 */
type AssetsSubTabId = 'objects' | 'groups' | 'characters';

const ASSETS_SUBTABS: { id: AssetsSubTabId; label: string; icon: typeof Box }[] = [
  { id: 'objects',    label: 'Objects',    icon: Box },
  { id: 'groups',     label: 'Groups',     icon: Layers },
  { id: 'characters', label: 'Characters', icon: Users },
];

function AssetsSubTabs() {
  const [tab, setTab] = useState<AssetsSubTabId>('objects');
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <PanelIconTabs
        tabs={ASSETS_SUBTABS}
        activeTab={tab}
        onChange={(id) => setTab(id as AssetsSubTabId)}
      />
      {tab === 'objects' && <ObjectsSection />}
      {tab === 'groups' && <EmptySubTabPlaceholder label="No groups yet — coming soon." />}
      {tab === 'characters' && <EmptySubTabPlaceholder label="No characters yet — coming soon." />}
    </div>
  );
}

function EmptySubTabPlaceholder({ label }: { label: string }) {
  return (
    <div style={{ padding: '12px 14px' }}>
      <div
        style={{
          padding: '14px 12px',
          fontSize: 11,
          color: 'var(--pb-ink-muted)',
          fontStyle: 'italic',
          border: '1.5px dashed var(--pb-line-2)',
          borderRadius: 8,
          background: 'var(--pb-cream-2)',
          textAlign: 'center',
        }}
      >
        {label}
      </div>
    </div>
  );
}

/**
 * One asset row. Compact horizontal layout: grip + thumbnail + name + trash.
 * Clicking the row selects the asset (sets the OBJECT brush to its first
 * style and opens the right Properties panel where the user can edit /
 * slice / manage styles). Inline expand was removed — the styles list now
 * lives in TileAssetPropertiesPanel.
 *
 * Drag interactions
 * -----------------
 * - The grip-handle on the LEFT initiates HTML5 drag for asset reorder.
 *   Hovering another row while dragging fires the parent's onDragOver/
 *   onDrop, which calls reorderAssets.
 *
 * Inline rename
 * -------------
 * - Pencil icon next to the asset name → click toggles edit mode (an
 *   inline input). Save on blur or Enter; Escape cancels.
 */
function AssetCard({
  asset, isSelected,
  onSelect, onRemoveAsset, onRenameAsset,
  onDragStart, onDragOverCard, onDropCard,
  isFocused = false,
  onFocusAsset,
}: {
  asset: ObjectAsset;
  isSelected: boolean;
  onSelect: () => void;
  onRemoveAsset: () => void;
  onRenameAsset: (name: string) => void;
  onDragStart: () => void;
  onDragOverCard: (e: React.DragEvent) => void;
  onDropCard: (e: React.DragEvent) => void;
  isFocused?: boolean;
  onFocusAsset?: () => void;
}) {
  // The thumbnail prefers the brush style if this asset is the current
  // brush, then styles[0] as a fallback. The arrow-key style focus that
  // the inline-expand list used to drive is gone with the inline list.
  const brushStyle = useTile.getState().selectedStyleId
    ? asset.styles.find((s) => s.id === useTile.getState().selectedStyleId) ?? null
    : null;
  const headerStyle = (isSelected && brushStyle) ? brushStyle : asset.styles[0];

  const dims = { thumb: 40, headerFont: 12.5, gripIcon: 12, padding: 8 };

  const [editingName, setEditingName] = useState(false);
  const cardDragArmedRef = useRef(false);

  function commitName(value: string) {
    setEditingName(false);
    const trimmed = value.trim();
    if (trimmed && trimmed !== asset.name) onRenameAsset(trimmed);
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
      onClick={(e) => {
        const t = e.target as HTMLElement;
        // Don't double-fire when an inner button / input handles the click.
        if (t.closest('button, input')) return;
        onFocusAsset?.();
        onSelect();
      }}
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
        cursor: 'pointer',
      }}
    >
      <div className="flex items-center gap-2" style={{ padding: dims.padding }}>
        <span
          onMouseDown={() => { cardDragArmedRef.current = true; }}
          title="Drag to reorder"
          style={{
            display: 'flex', alignItems: 'center',
            color: 'var(--pb-ink-muted)',
            cursor: 'grab',
            padding: '2px 0',
            flexShrink: 0,
          }}
        >
          <GripVertical size={dims.gripIcon} strokeWidth={2.4} />
        </span>
        <div
          style={{
            width: dims.thumb, height: dims.thumb,
            background: 'rgba(0,0,0,0.04)',
            border: '1.5px solid var(--pb-line-2)',
            borderRadius: 6,
            padding: 2,
            flexShrink: 0,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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
        </div>
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
                onDoubleClick={(e) => { e.stopPropagation(); setEditingName(true); }}
                title="Click row to open · double-click name to rename"
                style={{ flex: 1, fontSize: dims.headerFont, fontWeight: 800, color: 'var(--pb-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {asset.name}
              </span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setEditingName(true); }}
                title="Rename asset"
                style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--pb-ink-muted)', display: 'flex', alignItems: 'center', padding: 1 }}
              >
                <Pencil size={10} strokeWidth={2.4} />
              </button>
            </div>
          )}
          <div style={{ fontSize: 10, color: 'var(--pb-ink-muted)', fontWeight: 600 }}>
            {asset.styles.length} style{asset.styles.length === 1 ? '' : 's'} · {headerStyle?.width}×{headerStyle?.height}px
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemoveAsset(); }}
          title="Delete asset"
          style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--pb-coral-ink)', display: 'flex', alignItems: 'center', padding: 2 }}
        >
          <Trash2 size={11} strokeWidth={2.4} />
        </button>
      </div>
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

/**
 * Palette section — analyses the tileset's source PNG once on mount,
 * surfaces the dominant colour buckets as expandable rows, and binds
 * hue/saturation/brightness sliders per bucket to the per-tileset tint
 * map in the store. The renderer recolours every tile in the tileset
 * whenever any bucket adjustment changes.
 */
function PaletteSection({ tilesetId, sheetDataUrl }: { tilesetId: string; sheetDataUrl: string }) {
  const [palette, setPalette] = useState<ColorBucket[] | null>(null);
  const tints = useTile((s) => s.tilesetTints[tilesetId]);
  const setTilesetBucketTint = useTile((s) => s.setTilesetBucketTint);
  useEffect(() => {
    let cancelled = false;
    setPalette(null);
    analyzePalette(sheetDataUrl)
      .then((p) => { if (!cancelled) setPalette(p); })
      .catch((err) => {
        console.warn('[tile-palette] analyse failed', err);
        if (!cancelled) setPalette([]);
      });
    return () => { cancelled = true; };
  }, [sheetDataUrl]);

  if (!palette) {
    return (
      <div className="mt-2" style={{ borderTop: '1.5px solid var(--pb-line-2)', paddingTop: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--pb-ink-muted)' }}>
          Analysing palette…
        </div>
      </div>
    );
  }
  if (palette.length === 0) return null;

  return (
    <div className="mt-2" style={{ borderTop: '1.5px solid var(--pb-line-2)', paddingTop: 8 }}>
      <div className="flex items-center gap-2 mb-1.5">
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.4, color: 'var(--pb-ink)' }}>
          PALETTE
        </span>
        <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--pb-ink-muted)' }}>
          ({palette.length} colours)
        </span>
      </div>
      <div className="space-y-1">
        {palette.map((bucket) => (
          <PaletteBucketRow
            key={bucket.id}
            bucket={bucket}
            adjustment={tints?.[bucket.id]}
            onChange={(patch) => setTilesetBucketTint(tilesetId, bucket.id, patch)}
          />
        ))}
      </div>
    </div>
  );
}

function PaletteBucketRow({
  bucket, adjustment, onChange,
}: {
  bucket: ColorBucket;
  adjustment: { hue: number; saturation: number; brightness: number } | undefined;
  onChange: (patch: { hue?: number; saturation?: number; brightness?: number } | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const hue = adjustment?.hue ?? 0;
  const saturation = adjustment?.saturation ?? 1;
  const brightness = adjustment?.brightness ?? 1;
  const isCustom = !!adjustment;
  const [r, g, b] = bucket.representativeRgb;
  const swatchHex = `rgb(${r}, ${g}, ${b})`;
  return (
    <div style={{ background: 'var(--pb-cream-2)', borderRadius: 6, padding: '4px 6px', border: '1.5px solid var(--pb-line-2)' }}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          style={{
            background: 'transparent', border: 0, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            padding: 0, flex: 1, minWidth: 0,
          }}
        >
          {open ? <ChevDown size={10} strokeWidth={2.6} /> : <ChevronRight size={10} strokeWidth={2.6} />}
          <span style={{
            width: 14, height: 14, borderRadius: 4, flexShrink: 0,
            background: swatchHex,
            border: '1.5px solid var(--pb-ink)',
          }} />
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--pb-ink)' }}>
            {bucketLabel(bucket.id)}
          </span>
          {isCustom && (
            <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--pb-butter-ink)' }}>●</span>
          )}
        </button>
        {isCustom && (
          <button
            type="button"
            onClick={() => onChange(null)}
            style={{
              padding: '2px 6px',
              background: 'transparent', border: '1.5px solid var(--pb-line-2)',
              borderRadius: 5, cursor: 'pointer',
              fontSize: 9, fontWeight: 700, color: 'var(--pb-ink-muted)',
            }}
          >
            reset
          </button>
        )}
      </div>
      {open && (
        <div className="mt-1.5 space-y-1">
          <TintSlider
            label="hue"
            value={hue}
            min={-180}
            max={180}
            step={1}
            unit="°"
            onChange={(v) => onChange({ hue: v })}
          />
          <TintSlider
            label="sat"
            value={saturation}
            min={0}
            max={2}
            step={0.05}
            onChange={(v) => onChange({ saturation: v })}
            display={(v) => `${(v * 100).toFixed(0)}%`}
          />
          <TintSlider
            label="bri"
            value={brightness}
            min={0.4}
            max={1.6}
            step={0.05}
            onChange={(v) => onChange({ brightness: v })}
            display={(v) => `${(v * 100).toFixed(0)}%`}
          />
        </div>
      )}
    </div>
  );
}

function TintSlider({
  label, value, min, max, step, unit, onChange, display,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (v: number) => void;
  display?: (v: number) => string;
}) {
  return (
    <label className="flex items-center gap-2" style={{ fontSize: 10, fontWeight: 700, color: 'var(--pb-ink-muted)' }}>
      <span style={{ width: 24 }}>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ flex: 1, height: 14, accentColor: 'var(--pb-butter-ink)' }}
      />
      <span style={{ width: 36, textAlign: 'right', color: 'var(--pb-ink)', fontWeight: 700 }}>
        {display ? display(value) : `${value}${unit ?? ''}`}
      </span>
    </label>
  );
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
