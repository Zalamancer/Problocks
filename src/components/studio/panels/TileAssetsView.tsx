'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Upload, Trash2, Eye, EyeOff, ChevronUp, ChevronDown, Plus, Sparkles,
  Layers as LayersIcon, Box, ChevronRight, ChevronDown as ChevDown, Check, Cloud, Link2,
  Pencil, GripVertical,
} from 'lucide-react';
import { useTile, type Tileset, type Tile, type ObjectAsset, type ObjectStyle } from '@/store/tile-store';
import { sliceFile, loadImage, sliceImage, fileToImage, imageToDataUrl } from '@/lib/tile-slicer';
import { PURE_UPPER_INDEX, PURE_LOWER_INDEX, TILE_INDEX_TO_QUADRANTS } from '@/lib/wang-tiles';
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
export function TileAssetsView() {
  const tilesets = useTile((s) => s.tilesets);
  const tiles = useTile((s) => s.tiles);
  const addTileset = useTile((s) => s.addTileset);
  const removeTileset = useTile((s) => s.removeTileset);
  const setTilesetCloudId = useTile((s) => s.setTilesetCloudId);
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
  // Set when the user is uploading a "connecting" sheet — i.e. a new sheet
  // that should share one of its texture ids with an existing sheet's
  // texture. Cleared after the next file upload completes (one-shot).
  const linkContextRef = useRef<{
    sourceTilesetId: string;
    sourceSide: 'u' | 'l';   // which side of the source we're sharing
    newSide: 'u' | 'l';      // where to place the shared id in the new sheet
  } | null>(null);

  const [terrainsOpen, setTerrainsOpen] = useState(true);
  const [layersOpen, setLayersOpen] = useState(true);
  const [objectsOpen, setObjectsOpen] = useState(false);

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
    let sharedLower: string | undefined;
    if (link) {
      const source = useTile.getState().tilesets.find((t) => t.id === link.sourceTilesetId);
      if (source) {
        const sharedId = link.sourceSide === 'u' ? source.upperTextureId : source.lowerTextureId;
        if (link.newSide === 'u') sharedUpper = sharedId;
        else sharedLower = sharedId;
      }
    }

    setUploading(true);
    setError(null);
    try {
      for (const file of files) {
        const name = file.name.replace(/\.[^.]+$/, '');
        const result = await sliceFile(file, { cols, rows });
        // Add locally first so the user sees the sheet immediately. The
        // Supabase save runs in the background and stamps cloudId on
        // success — failure leaves the sheet local-only.
        const localId = addTileset({
          name,
          sheetDataUrl: result.sheetDataUrl,
          cols,
          rows,
          tileWidth: result.tileWidth,
          tileHeight: result.tileHeight,
          tiles: result.tiles,
          upperTextureId: sharedUpper,
          lowerTextureId: sharedLower,
        });
        // Read the local tileset back so we send Supabase the SAME texture
        // ids that addTileset resolved (either the shared ones from a chain
        // upload, or the freshly-generated ones for a stand-alone upload).
        // Without this the DB would assign its own ids, leaving local and
        // cloud out of sync — and the "merge textures" feature would
        // re-hydrate stale ids on reload.
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
        sharedLower = undefined;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
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

      <Section
        title="Terrains"
        icon={<Sparkles size={13} strokeWidth={2.4} />}
        open={terrainsOpen}
        onToggle={() => setTerrainsOpen(!terrainsOpen)}
      >
        <div className="space-y-2 px-3 pb-3">
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
                />
              ))}
            </div>
          )}
        </div>
      </Section>

      <Section
        title="Layers"
        icon={<LayersIcon size={13} strokeWidth={2.4} />}
        open={layersOpen}
        onToggle={() => setLayersOpen(!layersOpen)}
      >
        <LayerList />
      </Section>

      <Section
        title="Objects"
        icon={<Box size={13} strokeWidth={2.4} />}
        open={objectsOpen}
        onToggle={() => setObjectsOpen(!objectsOpen)}
      >
        <ObjectsSection />
      </Section>
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
  tileset, tiles, allTilesets, active, onPick, onRemove, onConnect, onMerge,
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
}) {
  const upperTile = tiles[tileset.tileIds[PURE_UPPER_INDEX]];
  const lowerTile = tiles[tileset.tileIds[PURE_LOWER_INDEX]];
  const brushTextureId = useTile((s) => s.brushTextureId);
  const setBrushTextureId = useTile((s) => s.setBrushTextureId);
  const setTool = useTile((s) => s.setTool);

  // Which swatch (if any) currently has its "connect" popover open.
  const [linkingSide, setLinkingSide] = useState<null | 'u' | 'l'>(null);

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

function LayerList() {
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
  const objects = useTile((s) => s.objects);
  const selectObject = useTile((s) => s.selectObject);
  const removeObject = useTile((s) => s.removeObject);
  const selectedObjectId = useTile((s) => s.selectedObjectId);
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

  return (
    <div className="space-y-3 px-3 pb-3">
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

      <p style={{ fontSize: 11, color: 'var(--pb-ink-muted)', lineHeight: 1.5 }}>
        Upload a sprite to make a new <strong>asset</strong>. Add more sprites to the same asset as <strong>styles</strong> (e.g. level&nbsp;1 / level&nbsp;2). Switch to <strong>Object</strong> tool (<kbd style={kbd}>6</kbd>), pick a style, and click on the canvas. Placed objects can swap styles from the right panel.
      </p>

      <ChunkyButton
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        kind="butter"
      >
        <Upload size={12} strokeWidth={2.4} />
        {uploading ? 'Uploading…' : 'Upload sprite'}
      </ChunkyButton>
      <CloudStatusPill status={cloudStatus} />
      {error && (
        <p style={{ fontSize: 11, color: 'var(--pb-coral-ink)', fontWeight: 600 }}>
          {error}
        </p>
      )}

      {assetList.length === 0 ? (
        <div
          className="rounded-lg p-3 text-center"
          style={{
            background: 'var(--pb-cream-2)',
            border: '1.5px dashed var(--pb-line-2)',
          }}
        >
          <p style={{ fontSize: 11, color: 'var(--pb-ink-muted)', lineHeight: 1.5 }}>
            No sprites yet. Upload PNG/WebP files (trees, rocks, characters, anything) to drop on the canvas as free objects.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {assetList.map((asset, index) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              expanded={!!expandedAssets[asset.id]}
              isSelected={asset.id === selectedAssetId}
              selectedStyleId={selectedStyleId}
              onSelect={() => handleSelectAsset(asset)}
              onToggleExpand={() => setExpandedAssets((m) => ({ ...m, [asset.id]: !m[asset.id] }))}
              onPickStyle={(styleId) => {
                setSelectedAssetId(asset.id);
                setSelectedStyleId(styleId);
                setTool('object');
              }}
              onRemoveAsset={() => handleRemoveAsset(asset)}
              onRemoveStyle={(style) => handleRemoveStyle(asset, style)}
              onRenameStyle={(styleId, label) => {
                setStyleLabel(asset.id, styleId, label);
                // Persist the label change so a reload doesn't revert. We
                // only fire this for styles that actually made it to cloud.
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
                  // Asset.id IS the server group_id (we stamp it on save), so
                  // a single PATCH renames every style row in one round-trip.
                  updateTileObject({ groupId: asset.id, name }).catch((err) => {
                    console.warn('[object-cloud] asset rename failed', err);
                  });
                }
              }}
              onReorderStyles={(orderedStyleIds) => {
                const newOrder = reorderStyles(asset.id, orderedStyleIds);
                // Push each style's new sort_index in parallel — small N, so
                // the fan-out is fine. Failures stay local-only.
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
              isDropTarget={false}
              dragIndex={index}
            />
          ))}
        </div>
      )}

      {objects.length > 0 && (
        <div className="space-y-1">
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--pb-ink-muted)', letterSpacing: 0.4 }}>
            PLACED ({objects.length})
          </div>
          {objects.map((obj) => {
            const asset = objectAssets[obj.assetId];
            const style = asset?.styles.find((st) => st.id === obj.styleId);
            const isSel = obj.id === selectedObjectId;
            return (
              <div
                key={obj.id}
                onClick={() => selectObject(obj.id)}
                className="flex items-center gap-2 cursor-pointer transition-colors"
                style={{
                  padding: '4px 6px',
                  borderRadius: 6,
                  background: isSel ? 'var(--pb-butter)' : 'transparent',
                  border: `1.5px solid ${isSel ? 'var(--pb-butter-ink)' : 'var(--pb-line-2)'}`,
                }}
              >
                <div
                  style={{
                    width: 22, height: 22, flexShrink: 0,
                    background: 'rgba(0,0,0,0.05)',
                    borderRadius: 4,
                    overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {style && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={style.dataUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', imageRendering: 'pixelated' }} draggable={false} />
                  )}
                </div>
                <span style={{ flex: 1, fontSize: 11, fontWeight: 700, color: 'var(--pb-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {obj.name}
                  {style && asset && asset.styles.length > 1 && (
                    <span style={{ color: 'var(--pb-ink-muted)', fontWeight: 600 }}> · {style.label || `Style ${asset.styles.findIndex((s) => s.id === style.id) + 1}`}</span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeObject(obj.id); }}
                  style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--pb-coral-ink)', display: 'flex', alignItems: 'center' }}
                  title="Delete object"
                >
                  <Trash2 size={11} strokeWidth={2.4} />
                </button>
              </div>
            );
          })}
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
}) {
  const headerStyle = isSelected
    ? asset.styles.find((s) => s.id === selectedStyleId) ?? asset.styles[0]
    : asset.styles[0];

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
      style={{
        background: isSelected ? 'var(--pb-butter)' : 'var(--pb-cream-2)',
        border: `1.5px solid ${isSelected ? 'var(--pb-butter-ink)' : 'var(--pb-line-2)'}`,
        borderRadius: 10,
        boxShadow: isSelected ? '0 2px 0 var(--pb-butter-ink)' : 'none',
        overflow: 'hidden',
      }}
    >
      <div className="flex items-center gap-1.5" style={{ padding: 6 }}>
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
          <GripVertical size={12} strokeWidth={2.4} />
        </span>
        <button
          type="button"
          onClick={onSelect}
          title={`Place "${asset.name}" — ${asset.styles.length} style(s)`}
          style={{
            width: 36, height: 36,
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
                padding: '2px 6px',
                fontSize: 12,
                fontWeight: 800,
                color: 'var(--pb-ink)',
              }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div className="flex items-center gap-1">
              <span
                onClick={onSelect}
                onDoubleClick={() => setEditingName(true)}
                title="Click to select · double-click to rename"
                style={{ flex: 1, fontSize: 12, fontWeight: 800, color: 'var(--pb-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer' }}
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
              const isEditing = editingStyleId === style.id;
              return (
                <div
                  key={style.id}
                  draggable
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
                    padding: 3,
                    background: isCurrent ? 'var(--pb-paper)' : 'transparent',
                    border: `1.5px solid ${isCurrent ? 'var(--pb-butter-ink)' : 'transparent'}`,
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
                    <GripVertical size={11} strokeWidth={2.4} />
                  </span>
                  <button
                    type="button"
                    onClick={() => onPickStyle(style.id)}
                    title={`Use "${style.label || `Style ${i + 1}`}" as the brush`}
                    style={{
                      width: 24, height: 24, flexShrink: 0,
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
                        padding: '2px 6px',
                        fontSize: 11,
                        fontWeight: 700,
                        color: 'var(--pb-ink)',
                      }}
                    />
                  ) : (
                    <span
                      onDoubleClick={() => setEditingStyleId(style.id)}
                      title="Double-click to rename"
                      style={{
                        flex: 1,
                        fontSize: 11,
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
                    onClick={() => setEditingStyleId(style.id)}
                    title="Rename style"
                    style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--pb-ink-muted)', display: 'flex', alignItems: 'center', padding: 1 }}
                  >
                    <Pencil size={9} strokeWidth={2.4} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveStyle(style)}
                    title="Delete this style"
                    style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--pb-coral-ink)', display: 'flex', alignItems: 'center', padding: 2 }}
                  >
                    <Trash2 size={10} strokeWidth={2.4} />
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
