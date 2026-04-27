'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Upload, Trash2, Eye, EyeOff, ChevronUp, ChevronDown, Plus, Sparkles,
  Layers as LayersIcon, Box, ChevronRight, ChevronDown as ChevDown, Check, Cloud, Link2,
} from 'lucide-react';
import { useTile, type Tileset, type Tile } from '@/store/tile-store';
import { sliceFile, loadImage, sliceImage } from '@/lib/tile-slicer';
import { PURE_UPPER_INDEX, PURE_LOWER_INDEX, TILE_INDEX_TO_QUADRANTS } from '@/lib/wang-tiles';
import { saveTileSheet, listTileSheets, deleteTileSheet } from '@/lib/tile-cloud';

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
  const activeTilesetId = activeLayer?.tilesetId ?? null;

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
        saveTileSheet({
          name,
          sheetDataUrl: result.sheetDataUrl,
          cols,
          rows,
          tileWidth: result.tileWidth,
          tileHeight: result.tileHeight,
          upperTextureId: sharedUpper,
          lowerTextureId: sharedLower,
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

  function pickTileset(tilesetId: string) {
    const state = useTile.getState();
    // Each tileset has its own dedicated layer (set up by addTileset).
    // Clicking a terrain swatch jumps to that layer rather than rebinding
    // the current layer — otherwise the cells already painted with the
    // previous tileset would re-render in the new texture, looking like
    // the brush is "stuck" on one terrain.
    const owningLayer = state.layers.find((l) => l.tilesetId === tilesetId);
    if (owningLayer) {
      state.setActiveLayer(owningLayer.id);
    } else if (activeLayer) {
      // Fallback: hydration race or manually-detached layer. Bind to
      // whatever's currently active so the click isn't a dead end.
      setLayerTileset(activeLayer.id, tilesetId);
    }
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
                  active={ts.id === activeTilesetId}
                  onPick={() => pickTileset(ts.id)}
                  onRemove={() => handleRemoveTileset(ts)}
                  onConnect={(sourceSide, newSide) => startLink(ts.id, sourceSide, newSide)}
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
  tileset, tiles, allTilesets, active, onPick, onRemove, onConnect,
}: {
  tileset: Tileset;
  tiles: Record<string, Tile>;
  allTilesets: Tileset[];
  active: boolean;
  onPick: () => void;
  onRemove: () => void;
  /** Open the file picker for a sheet that shares this tileset's texture
   *  on `sourceSide` and places it on `newSide` of the new sheet. */
  onConnect: (sourceSide: 'u' | 'l', newSide: 'u' | 'l') => void;
}) {
  const upperTile = tiles[tileset.tileIds[PURE_UPPER_INDEX]];
  const lowerTile = tiles[tileset.tileIds[PURE_LOWER_INDEX]];
  const brushTexture = useTile((s) => s.brushTexture);
  const setBrushTexture = useTile((s) => s.setBrushTexture);
  const setTool = useTile((s) => s.setTool);

  // Which swatch (if any) currently has its "connect" popover open.
  const [linkingSide, setLinkingSide] = useState<null | 'u' | 'l'>(null);

  function pickBrush(tex: 'u' | 'l') {
    onPick();
    setBrushTexture(tex);
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
          active={active && brushTexture === 'u'}
          shareCount={sharedUpperCount}
          linking={linkingSide === 'u'}
          onClick={() => pickBrush('u')}
          onChainClick={() => setLinkingSide(linkingSide === 'u' ? null : 'u')}
        />
        <BrushSwatch
          tile={lowerTile}
          label="LOWER"
          active={active && brushTexture === 'l'}
          shareCount={sharedLowerCount}
          linking={linkingSide === 'l'}
          onClick={() => pickBrush('l')}
          onChainClick={() => setLinkingSide(linkingSide === 'l' ? null : 'l')}
        />
      </div>

      {linkingSide && (
        <ConnectPopover
          sourceLabel={linkingSide === 'u' ? 'UPPER' : 'LOWER'}
          onChoose={(newSide) => {
            setLinkingSide(null);
            onConnect(linkingSide, newSide);
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
  sourceLabel, onChoose, onCancel,
}: {
  sourceLabel: 'UPPER' | 'LOWER';
  onChoose: (newSide: 'u' | 'l') => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="mt-2 p-2"
      style={{
        background: 'var(--pb-paper)',
        border: '1.5px solid var(--pb-ink)',
        borderRadius: 8,
        boxShadow: '0 2px 0 var(--pb-ink)',
      }}
    >
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--pb-ink-muted)', letterSpacing: 0.4, marginBottom: 6 }}>
        UPLOAD A NEW TILESET WHERE THIS {sourceLabel} BECOMES…
      </div>
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => onChoose('u')}
          className="flex-1 transition-colors"
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
          className="flex-1 transition-colors"
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
        >
          ×
        </button>
      </div>
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
 * Object placement section: lists all uploaded tiles (across every tileset)
 * so users can pick a single sprite to drop as a free object. Auto-tiling
 * doesn't apply to objects — they're just sprites.
 */
function ObjectsSection() {
  const tilesets = useTile((s) => s.tilesets);
  const tiles = useTile((s) => s.tiles);
  const objects = useTile((s) => s.objects);
  const selectObject = useTile((s) => s.selectObject);
  const removeObject = useTile((s) => s.removeObject);
  const selectedObjectId = useTile((s) => s.selectedObjectId);
  const selectedTileId = useTile((s) => s.selectedTileId);
  const setSelectedTileId = useTile((s) => s.setSelectedTileId);
  const setTool = useTile((s) => s.setTool);

  return (
    <div className="space-y-3 px-3 pb-3">
      <p style={{ fontSize: 11, color: 'var(--pb-ink-muted)', lineHeight: 1.5 }}>
        Pick a sprite below, switch to <strong>Object</strong> tool (<kbd style={kbd}>6</kbd>), and click on the canvas to place a free object. Objects ignore the auto-tile grid.
      </p>

      {tilesets.length === 0 ? (
        <p style={{ fontSize: 11, color: 'var(--pb-ink-muted)' }}>
          Upload a tileset above to get sprite options.
        </p>
      ) : (
        <div className="space-y-2">
          {tilesets.map((ts) => (
            <div
              key={ts.id}
              style={{
                background: 'var(--pb-cream-2)',
                border: '1.5px solid var(--pb-line-2)',
                borderRadius: 8,
                padding: 4,
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--pb-ink-muted)', padding: '2px 4px 4px' }}>
                {ts.name}
              </div>
              <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${Math.min(ts.cols, 6)}, 1fr)` }}>
                {ts.tileIds.map((tid, i) => {
                  const tile = tiles[tid];
                  if (!tile) return null;
                  const isSel = tid === selectedTileId;
                  return (
                    <button
                      key={tid}
                      type="button"
                      onClick={() => { setSelectedTileId(tid); setTool('object'); }}
                      title={`Tile #${i + 1}`}
                      className="aspect-square"
                      style={{
                        background: 'rgba(0,0,0,0.04)',
                        border: `1.5px solid ${isSel ? 'var(--pb-butter-ink)' : 'transparent'}`,
                        borderRadius: 6,
                        padding: 2,
                        cursor: 'pointer',
                        boxShadow: isSel ? '0 2px 0 var(--pb-butter-ink)' : 'none',
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={tile.dataUrl}
                        alt=""
                        className="w-full h-full"
                        style={{ objectFit: 'contain', imageRendering: 'pixelated' }}
                        draggable={false}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {objects.length > 0 && (
        <div className="space-y-1">
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--pb-ink-muted)', letterSpacing: 0.4 }}>
            PLACED ({objects.length})
          </div>
          {objects.map((obj) => {
            const tile = tiles[obj.tileId];
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
                  {tile && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={tile.dataUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', imageRendering: 'pixelated' }} draggable={false} />
                  )}
                </div>
                <span style={{ flex: 1, fontSize: 11, fontWeight: 700, color: 'var(--pb-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {obj.name}
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
