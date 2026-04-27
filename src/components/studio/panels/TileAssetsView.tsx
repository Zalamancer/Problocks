'use client';

import { useRef, useState } from 'react';
import {
  Upload, Trash2, Eye, EyeOff, ChevronUp, ChevronDown, Plus, Sparkles,
  Layers as LayersIcon, Box, ChevronRight, ChevronDown as ChevDown, Check,
} from 'lucide-react';
import { useTile, type Tileset, type Tile } from '@/store/tile-store';
import { sliceFile } from '@/lib/tile-slicer';
import { PURE_UPPER_INDEX, PURE_LOWER_INDEX, TILE_INDEX_TO_QUADRANTS } from '@/lib/wang-tiles';

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

  const [terrainsOpen, setTerrainsOpen] = useState(true);
  const [layersOpen, setLayersOpen] = useState(true);
  const [objectsOpen, setObjectsOpen] = useState(false);

  const activeLayer = layers.find((l) => l.id === activeLayerId);
  const activeTilesetId = activeLayer?.tilesetId ?? null;

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of files) {
        const result = await sliceFile(file, { cols, rows });
        addTileset({
          name: file.name.replace(/\.[^.]+$/, ''),
          sheetDataUrl: result.sheetDataUrl,
          cols,
          rows,
          tileWidth: result.tileWidth,
          tileHeight: result.tileHeight,
          tiles: result.tiles,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
    }
  }

  function pickTileset(tilesetId: string) {
    if (!activeLayer) return;
    setLayerTileset(activeLayer.id, tilesetId);
    setTool('paint');
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
                  active={ts.id === activeTilesetId}
                  onPick={() => pickTileset(ts.id)}
                  onRemove={() => {
                    if (confirm(`Delete tileset "${ts.name}"? Layers using it will be detached.`)) {
                      removeTileset(ts.id);
                    }
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
  tileset, tiles, active, onPick, onRemove,
}: {
  tileset: Tileset;
  tiles: Record<string, Tile>;
  active: boolean;
  onPick: () => void;
  onRemove: () => void;
}) {
  const upperTile = tiles[tileset.tileIds[PURE_UPPER_INDEX]];
  const lowerTile = tiles[tileset.tileIds[PURE_LOWER_INDEX]];
  const brushTexture = useTile((s) => s.brushTexture);
  const setBrushTexture = useTile((s) => s.setBrushTexture);
  const setTool = useTile((s) => s.setTool);

  function pickBrush(tex: 'u' | 'l') {
    onPick();
    setBrushTexture(tex);
    setTool('paint');
  }

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
          lays down. Bigger swatches than the old preview so they're clearly
          interactive. The active swatch (only when this terrain is bound to
          the active layer) gets the butter ring. */}
      <div className="flex items-center gap-2 mt-2">
        <BrushSwatch
          tile={upperTile}
          label="UPPER"
          active={active && brushTexture === 'u'}
          onClick={() => pickBrush('u')}
        />
        <BrushSwatch
          tile={lowerTile}
          label="LOWER"
          active={active && brushTexture === 'l'}
          onClick={() => pickBrush('l')}
        />
      </div>

      {/* All 16 sliced tiles, always visible. Hover to see the (NW,NE,SW,SE)
          encoding overlay so the user can sanity-check the auto-tile lookup. */}
      <DebugTileGrid tileset={tileset} tiles={tiles} />
    </div>
  );
}

function BrushSwatch({
  tile, label, active, onClick,
}: {
  tile: Tile | undefined;
  label: 'UPPER' | 'LOWER';
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="flex-1 flex items-center gap-2 transition-colors"
      style={{
        padding: 4,
        background: active ? 'var(--pb-paper)' : 'transparent',
        border: `1.5px solid ${active ? 'var(--pb-butter-ink)' : 'var(--pb-line-2)'}`,
        borderRadius: 8,
        cursor: 'pointer',
        boxShadow: active ? '0 2px 0 var(--pb-butter-ink)' : 'none',
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
