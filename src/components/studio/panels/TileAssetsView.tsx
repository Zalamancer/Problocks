'use client';

import { useRef, useState } from 'react';
import {
  Upload, Trash2, Eye, EyeOff, ChevronUp, ChevronDown, Plus, Sparkles,
  Layers as LayersIcon, Box, ChevronRight, ChevronDown as ChevDown,
} from 'lucide-react';
import { useTile, type Tileset, type Tile, type TileLayer } from '@/store/tile-store';
import { sliceFile } from '@/lib/tile-slicer';

/**
 * Left-panel content for the 2D Tile-based game system.
 *
 * Three stacked sections, each collapsible:
 *   1. Palette  — uploaded tilesets, sliced tiles, click to select.
 *   2. Layers   — visibility, opacity, ordering, active layer.
 *   3. Objects  — placed sprites that aren't grid-aligned.
 *
 * The "upload a PNG → 4×4 slice → 16 tiles" flow lives at the top of the
 * Palette section. We default to 4×4 because that's the user's standard
 * sheet shape; the inputs below the button let them override before the
 * upload (e.g. 8×8 for a pixel-art set).
 */
export function TileAssetsView() {
  const tilesets = useTile((s) => s.tilesets);
  const tiles = useTile((s) => s.tiles);
  const addTileset = useTile((s) => s.addTileset);
  const removeTileset = useTile((s) => s.removeTileset);
  const selectedTileId = useTile((s) => s.selectedTileId);
  const setSelectedTileId = useTile((s) => s.setSelectedTileId);
  const setTool = useTile((s) => s.setTool);
  const tileSize = useTile((s) => s.tileSize);
  const setTileSize = useTile((s) => s.setTileSize);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [cols, setCols] = useState(4);
  const [rows, setRows] = useState(4);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [paletteOpen, setPaletteOpen] = useState(true);
  const [layersOpen, setLayersOpen] = useState(true);
  const [objectsOpen, setObjectsOpen] = useState(false);

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

      {/* ── Palette ──────────────────────────────────────────── */}
      <Section
        title="Palette"
        icon={<Sparkles size={13} strokeWidth={2.4} />}
        open={paletteOpen}
        onToggle={() => setPaletteOpen(!paletteOpen)}
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
            {uploading ? 'Slicing…' : `Upload PNG → ${cols}×${rows}`}
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
                Drop a PNG sheet to slice it into tiles. The grid above
                (default <strong>4×4</strong> = 16 tiles) controls how it&apos;s diced.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tilesets.map((ts) => (
                <TilesetGroup
                  key={ts.id}
                  tileset={ts}
                  tiles={tiles}
                  selectedTileId={selectedTileId}
                  onSelect={(id) => {
                    setSelectedTileId(id);
                    setTool('paint');
                  }}
                  onRemove={() => {
                    if (confirm(`Delete tileset "${ts.name}"? This will erase any tiles painted from it.`)) {
                      removeTileset(ts.id);
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </Section>

      {/* ── Layers ──────────────────────────────────────────── */}
      <Section
        title="Layers"
        icon={<LayersIcon size={13} strokeWidth={2.4} />}
        open={layersOpen}
        onToggle={() => setLayersOpen(!layersOpen)}
      >
        <LayerList />
      </Section>

      {/* ── Objects ─────────────────────────────────────────── */}
      <Section
        title="Objects"
        icon={<Box size={13} strokeWidth={2.4} />}
        open={objectsOpen}
        onToggle={() => setObjectsOpen(!objectsOpen)}
      >
        <ObjectList />
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

function TilesetGroup({
  tileset, tiles, selectedTileId, onSelect, onRemove,
}: {
  tileset: Tileset;
  tiles: Record<string, Tile>;
  selectedTileId: string | null;
  onSelect: (tileId: string) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const tileObjs = tileset.tileIds.map((id) => tiles[id]).filter(Boolean);

  return (
    <div
      style={{
        background: 'var(--pb-cream-2)',
        border: '1.5px solid var(--pb-line-2)',
        borderRadius: 10,
        overflow: 'hidden',
      }}
    >
      <div
        className="flex items-center gap-2"
        style={{
          padding: '6px 8px',
          borderBottom: expanded ? '1.5px solid var(--pb-line-2)' : 0,
        }}
      >
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          style={{ background: 'transparent', border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--pb-ink-muted)' }}
        >
          {expanded ? <ChevDown size={12} strokeWidth={2.4} /> : <ChevronRight size={12} strokeWidth={2.4} />}
        </button>
        <span style={{ flex: 1, fontSize: 12, fontWeight: 700, color: 'var(--pb-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {tileset.name}
        </span>
        <span style={{ fontSize: 10, color: 'var(--pb-ink-muted)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
          {tileset.cols}×{tileset.rows}
        </span>
        <button
          type="button"
          onClick={onRemove}
          title="Remove tileset"
          style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--pb-coral-ink)', display: 'flex', alignItems: 'center' }}
        >
          <Trash2 size={11} strokeWidth={2.4} />
        </button>
      </div>
      {expanded && (
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${Math.min(tileset.cols, 6)}, 1fr)`,
            padding: 6,
            background: 'var(--pb-paper)',
          }}
        >
          {tileObjs.map((tile) => {
            const isSel = tile.id === selectedTileId;
            return (
              <button
                key={tile.id}
                type="button"
                onClick={() => onSelect(tile.id)}
                title={`Tile #${tile.index + 1}`}
                className="aspect-square transition-colors"
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
                  alt={`Tile ${tile.index + 1}`}
                  className="w-full h-full"
                  style={{ objectFit: 'contain', imageRendering: 'pixelated' }}
                  draggable={false}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function LayerList() {
  const layers = useTile((s) => s.layers);
  const activeLayerId = useTile((s) => s.activeLayerId);
  const addLayer = useTile((s) => s.addLayer);
  const removeLayer = useTile((s) => s.removeLayer);
  const renameLayer = useTile((s) => s.renameLayer);
  const toggleLayerVisibility = useTile((s) => s.toggleLayerVisibility);
  const reorderLayer = useTile((s) => s.reorderLayer);
  const setActiveLayer = useTile((s) => s.setActiveLayer);
  const setLayerOpacity = useTile((s) => s.setLayerOpacity);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-1.5 px-3 pb-3">
      {/* Render top-to-bottom by reversing the array — paint order is
          bottom-up but users think top-down ("foreground at the top"). */}
      {[...layers].reverse().map((layer, revIdx) => {
        const idx = layers.length - 1 - revIdx;
        const isActive = layer.id === activeLayerId;
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

function ObjectList() {
  const objects = useTile((s) => s.objects);
  const tiles = useTile((s) => s.tiles);
  const selectObject = useTile((s) => s.selectObject);
  const removeObject = useTile((s) => s.removeObject);
  const selectedObjectId = useTile((s) => s.selectedObjectId);

  if (objects.length === 0) {
    return (
      <div className="px-3 pb-3">
        <p style={{ fontSize: 11, color: 'var(--pb-ink-muted)', lineHeight: 1.5 }}>
          Switch to the <strong>Object</strong> tool (<kbd style={kbd}>6</kbd>) and click on the canvas to place a free sprite. Objects can move, rotate, and scale independently of the grid.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1 px-3 pb-3">
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
