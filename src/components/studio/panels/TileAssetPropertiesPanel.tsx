'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Scissors, Pencil, Trash2, GripVertical, Plus, X, Upload,
} from 'lucide-react';
import { PanelSection } from '@/components/ui/panel-controls/PanelSection';
import { PanelSlider } from '@/components/ui/panel-controls/PanelSlider';
import { PanelActionButton } from '@/components/ui/panel-controls/PanelActionButton';
import { useTile, type ObjectAsset, type ObjectStyle } from '@/store/tile-store';
import { fileToImage, imageToDataUrl, loadImage, sliceImage } from '@/lib/tile-slicer';
import {
  saveTileObject, deleteTileObject, updateTileObject,
} from '@/lib/object-cloud';

/**
 * Right-panel Properties view for an uploaded ObjectAsset. Shows the asset's
 * primary image (with an edit icon that opens a slice popup), then the full
 * styles list (every uploaded sprite for this asset, with rename / delete /
 * drag-reorder / set-as-brush actions), then an "Add style" upload row.
 *
 * Slicing — split the source image into rows×cols cells — moved out of the
 * scroll body and into a modal opened by the edit icon on the preview, per
 * the new UX. The styles list is the same look that used to live inline on
 * the left-panel asset cards.
 */
export function TileAssetPropertiesPanel({ headless }: { headless?: boolean } = {}) {
  const selectedAssetId = useTile((s) => s.selectedAssetId);
  const asset = useTile((s) =>
    s.selectedAssetId ? s.objectAssets[s.selectedAssetId] ?? null : null,
  );
  const selectedStyleId = useTile((s) => s.selectedStyleId);
  const setSelectedStyleId = useTile((s) => s.setSelectedStyleId);
  const setSelectedAssetId = useTile((s) => s.setSelectedAssetId);
  const setTool = useTile((s) => s.setTool);
  const addStyleToAsset = useTile((s) => s.addStyleToAsset);
  const removeStyle = useTile((s) => s.removeStyle);
  const setStyleLabel = useTile((s) => s.setStyleLabel);
  const setStyleCloudId = useTile((s) => s.setStyleCloudId);
  const reorderStyles = useTile((s) => s.reorderStyles);

  const [sliceOpen, setSliceOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const styleInputRef = useRef<HTMLInputElement | null>(null);

  // Reset the slice popup whenever the user picks a different asset so the
  // last asset's grid doesn't leak into the next preview.
  useEffect(() => {
    setSliceOpen(false);
  }, [selectedAssetId]);

  const Shell = headless
    ? (({ children }: { children: React.ReactNode }) => <>{children}</>)
    : (({ children }: { children: React.ReactNode }) => (
        <aside
          className="w-full md:w-[260px] flex flex-col rounded-xl overflow-hidden shrink-0"
          style={{
            background: 'var(--pb-paper)',
            border: '1.5px solid var(--pb-line-2)',
          }}
        >
          {children}
        </aside>
      ));

  if (!selectedAssetId || !asset) return null;

  const baseStyle = asset.styles[0];

  async function handleAddStyleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (!asset) return;
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0) return;
    setUploading(true);
    try {
      for (const file of files) {
        const baseName = file.name.replace(/\.[^.]+$/, '');
        const img = await fileToImage(file);
        const dataUrl = imageToDataUrl(img);
        const label = nextUniqueLabel(asset, baseName || `Style ${asset.styles.length + 1}`);
        const styleId = addStyleToAsset(asset.id, {
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
          groupId: asset.id,
          label,
          sortIndex: asset.styles.length,
        })
          .then((cloud) => setStyleCloudId(asset.id, styleId, cloud.id))
          .catch((err) => console.warn('[object-cloud] save style failed', err));
      }
    } finally {
      setUploading(false);
    }
  }

  function handleRemoveStyle(style: ObjectStyle) {
    if (!asset) return;
    if (asset.styles.length === 1) {
      // Last style — caller's expected to delete the whole asset elsewhere
      // (the left-panel trash). Bail out here so we don't quietly nuke the
      // asset behind the user's back from a "delete style" click.
      if (!confirm(`This is the only style. Delete the asset "${asset.name}" entirely?`)) return;
    } else {
      if (!confirm(`Delete style "${style.label || 'unlabeled'}" from "${asset.name}"?`)) return;
    }
    removeStyle(asset.id, style.id);
    if (style.cloudId) {
      deleteTileObject(style.cloudId).catch((err) => {
        console.warn('[object-cloud] delete style failed', err);
      });
    }
    // If we just removed the last style, the store dropped the asset too;
    // clear the right-panel selection so we don't render a stale ASSET
    // header for nothing.
    if (asset.styles.length === 1) {
      setSelectedAssetId(null);
    }
  }

  function handleRenameStyle(styleId: string, label: string) {
    if (!asset) return;
    setStyleLabel(asset.id, styleId, label);
    const style = asset.styles.find((s) => s.id === styleId);
    if (style?.cloudId) {
      updateTileObject({ id: style.cloudId, label }).catch((err) => {
        console.warn('[object-cloud] style rename failed', err);
      });
    }
  }

  function handlePickStyle(styleId: string) {
    if (!asset) return;
    setSelectedStyleId(styleId);
    setTool('object');
  }

  function handleReorder(orderedIds: string[]) {
    if (!asset) return;
    const newOrder = reorderStyles(asset.id, orderedIds);
    newOrder.forEach((style, i) => {
      if (style.cloudId) {
        updateTileObject({ id: style.cloudId, sortIndex: i }).catch((err) => {
          console.warn('[object-cloud] style reorder failed', err);
        });
      }
    });
  }

  return (
    <Shell>
      <input
        ref={styleInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleAddStyleFiles}
        className="hidden"
      />

      <div
        className="shrink-0 flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1.5px solid var(--pb-line-2)' }}
      >
        <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--pb-ink)' }}>
          {asset.name}
        </span>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--pb-ink-muted)', letterSpacing: 0.4 }}>
          ASSET
        </span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        <PanelSection title="Image" collapsible defaultOpen>
          <ImagePreviewWithEdit
            dataUrl={baseStyle?.dataUrl ?? ''}
            width={baseStyle?.width ?? 0}
            height={baseStyle?.height ?? 0}
            onEdit={() => setSliceOpen(true)}
          />
        </PanelSection>

        <PanelSection title={`Styles (${asset.styles.length})`} collapsible defaultOpen>
          <StylesList
            asset={asset}
            selectedStyleId={selectedStyleId}
            onPickStyle={handlePickStyle}
            onRemoveStyle={handleRemoveStyle}
            onRenameStyle={handleRenameStyle}
            onReorder={handleReorder}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => styleInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 mt-2"
            style={{
              padding: '10px 12px',
              background: 'var(--pb-paper)',
              border: '1.5px dashed var(--pb-line-2)',
              borderRadius: 8,
              color: 'var(--pb-ink)',
              fontSize: 12.5,
              fontWeight: 800,
              cursor: uploading ? 'not-allowed' : 'pointer',
              opacity: uploading ? 0.6 : 1,
            }}
          >
            {uploading ? <Upload size={13} strokeWidth={2.4} /> : <Plus size={13} strokeWidth={2.4} />}
            {uploading ? 'Uploading…' : 'Add style'}
          </button>
        </PanelSection>
      </div>

      {sliceOpen && baseStyle && (
        <SliceModal
          asset={asset}
          baseStyle={baseStyle}
          onClose={() => setSliceOpen(false)}
        />
      )}
    </Shell>
  );
}

/**
 * Header image preview with a small edit (Scissors) icon overlay top-right.
 * Same intrinsic-aspect sizing as the previous preview — the wrapper
 * shrinks to the rendered <img> via inline-block + maxWidth/maxHeight so
 * any later overlays line up on real image edges.
 */
function ImagePreviewWithEdit({
  dataUrl, width, height, onEdit,
}: {
  dataUrl: string;
  width: number;
  height: number;
  onEdit: () => void;
}) {
  if (!dataUrl) {
    return (
      <div
        style={{
          aspectRatio: '1 / 1',
          background: 'var(--pb-cream-2)',
          border: '1.5px solid var(--pb-line-2)',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--pb-ink-muted)',
        }}
      >
        No image
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <div
          style={{
            position: 'relative',
            display: 'inline-block',
            maxWidth: '100%',
            background: 'rgba(0,0,0,0.06)',
            border: '1.5px solid var(--pb-line-2)',
            borderRadius: 8,
            overflow: 'hidden',
            lineHeight: 0,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={dataUrl}
            alt=""
            style={{
              display: 'block',
              maxWidth: '100%',
              maxHeight: 220,
              width: 'auto',
              height: 'auto',
              imageRendering: 'pixelated',
            }}
            draggable={false}
          />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            title="Slice into rows × columns"
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              width: 26,
              height: 26,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--pb-paper)',
              border: '1.5px solid var(--pb-line-2)',
              borderRadius: 7,
              boxShadow: '0 1.5px 0 var(--pb-line-2)',
              color: 'var(--pb-ink)',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <Pencil size={13} strokeWidth={2.4} />
          </button>
        </div>
      </div>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: 'var(--pb-ink-muted)',
          textAlign: 'center',
        }}
      >
        {width}×{height}px
      </div>
    </div>
  );
}

/**
 * The same row layout the inline-expand list used to render: drag handle,
 * 24px thumbnail (clickable to set as the OBJECT-tool brush), label
 * (double-click to rename), pencil rename trigger, delete trash. Drag a
 * row onto another to reorder.
 */
function StylesList({
  asset, selectedStyleId, onPickStyle, onRemoveStyle, onRenameStyle, onReorder,
}: {
  asset: ObjectAsset;
  selectedStyleId: string | null;
  onPickStyle: (styleId: string) => void;
  onRemoveStyle: (style: ObjectStyle) => void;
  onRenameStyle: (styleId: string, label: string) => void;
  onReorder: (orderedStyleIds: string[]) => void;
}) {
  const [editingStyleId, setEditingStyleId] = useState<string | null>(null);
  const dragStyleIdRef = useRef<string | null>(null);

  function reorderViaDrop(targetStyleId: string) {
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
    onReorder(next);
  }

  return (
    <div className="flex flex-col gap-1.5">
      {asset.styles.map((style, i) => {
        const isCurrent = style.id === selectedStyleId;
        const isEditing = editingStyleId === style.id;
        return (
          <div
            key={style.id}
            draggable
            onDragStart={(e) => {
              dragStyleIdRef.current = style.id;
              e.dataTransfer.effectAllowed = 'move';
              try { e.dataTransfer.setData('text/plain', style.id); } catch { /* ignore */ }
            }}
            onDragOver={(e) => {
              if (!dragStyleIdRef.current || dragStyleIdRef.current === style.id) return;
              e.preventDefault();
            }}
            onDrop={(e) => { e.preventDefault(); reorderViaDrop(style.id); }}
            className="flex items-center gap-2"
            style={{
              padding: 8,
              background: isCurrent ? 'var(--pb-butter)' : 'var(--pb-cream-2)',
              border: `1.5px solid ${isCurrent ? 'var(--pb-butter-ink)' : 'var(--pb-line-2)'}`,
              borderRadius: 8,
            }}
          >
            <span
              title="Drag to reorder"
              style={{
                display: 'flex', alignItems: 'center',
                color: 'var(--pb-ink-muted)',
                cursor: 'grab',
                flexShrink: 0,
              }}
            >
              <GripVertical size={14} strokeWidth={2.4} />
            </span>
            <button
              type="button"
              onClick={() => onPickStyle(style.id)}
              title={`Use "${style.label || `Style ${i + 1}`}" as the brush`}
              style={{
                width: 56, height: 56, flexShrink: 0,
                background: 'rgba(0,0,0,0.06)',
                border: '1.5px solid var(--pb-line-2)',
                borderRadius: 6,
                padding: 2,
                cursor: 'pointer',
                overflow: 'hidden',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={style.dataUrl}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'contain', imageRendering: 'pixelated' }}
                draggable={false}
              />
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
                  minWidth: 0,
                  background: 'var(--pb-paper)',
                  border: '1.5px solid var(--pb-line-2)',
                  borderRadius: 5,
                  padding: '5px 8px',
                  fontSize: 13,
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
                  minWidth: 0,
                  fontSize: 13,
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
              style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--pb-ink-muted)', display: 'flex', alignItems: 'center', padding: 2, flexShrink: 0 }}
            >
              <Pencil size={12} strokeWidth={2.4} />
            </button>
            <button
              type="button"
              onClick={() => onRemoveStyle(style)}
              title="Delete style"
              style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--pb-coral-ink)', display: 'flex', alignItems: 'center', padding: 2, flexShrink: 0 }}
            >
              <Trash2 size={13} strokeWidth={2.4} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Modal popup for slicing the asset's image into a rows×cols grid. Lives
 * in a portal so the panel scroll body doesn't clip it; backdrop closes on
 * click. Apply replaces the asset's existing styles with the sliced cells
 * (best-effort cloud sync via saveTileObject / deleteTileObject).
 */
function SliceModal({
  asset, baseStyle, onClose,
}: {
  asset: ObjectAsset;
  baseStyle: ObjectStyle;
  onClose: () => void;
}) {
  const addStyleToAsset = useTile((s) => s.addStyleToAsset);
  const removeStyle = useTile((s) => s.removeStyle);
  const setStyleCloudId = useTile((s) => s.setStyleCloudId);

  const [rows, setRows] = useState(1);
  const [cols, setCols] = useState(1);
  const [applying, setApplying] = useState(false);

  const total = Math.max(1, rows) * Math.max(1, cols);
  const willSlice = rows > 1 || cols > 1;
  const cellW = baseStyle ? Math.floor(baseStyle.width / cols) : 0;
  const cellH = baseStyle ? Math.floor(baseStyle.height / rows) : 0;

  // ESC closes the modal — standard chunky-pastel dialog behaviour.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleApply() {
    if (!willSlice) return;
    if (!confirm(
      `Slice "${asset.name}" into ${rows}×${cols} = ${total} cells?\n` +
      `This replaces the current ${asset.styles.length} style(s).`,
    )) return;

    setApplying(true);
    try {
      const img = await loadImage(baseStyle.dataUrl);
      const result = sliceImage(img, { cols, rows });

      // Snapshot existing ids before mutating so the cleanup pass works on
      // the right rows. addStyleToAsset BEFORE removeStyle so the asset
      // never momentarily has zero styles (which would auto-delete it).
      const oldStyleIds = asset.styles.map((s) => s.id);
      const oldCloudIds = asset.styles
        .map((s) => s.cloudId)
        .filter((id): id is string => Boolean(id));

      const addedStyleIds: string[] = [];
      for (let i = 0; i < result.tiles.length; i++) {
        const r = Math.floor(i / cols);
        const c = i % cols;
        const styleId = addStyleToAsset(asset.id, {
          label: `${r + 1},${c + 1}`,
          dataUrl: result.tiles[i],
          width: result.tileWidth,
          height: result.tileHeight,
        });
        addedStyleIds.push(styleId);
      }
      for (const sid of oldStyleIds) removeStyle(asset.id, sid);

      for (const id of oldCloudIds) {
        deleteTileObject(id).catch((err) => {
          console.warn('[asset-slice] delete old style failed', err);
        });
      }
      addedStyleIds.forEach((sid, idx) => {
        const r = Math.floor(idx / cols);
        const c = idx % cols;
        saveTileObject({
          name: asset.name,
          dataUrl: result.tiles[idx],
          width: result.tileWidth,
          height: result.tileHeight,
          groupId: asset.id,
          label: `${r + 1},${c + 1}`,
          sortIndex: idx,
        })
          .then((cloud) => setStyleCloudId(asset.id, sid, cloud.id))
          .catch((err) => console.warn('[asset-slice] save sliced style failed', err));
      });

      onClose();
    } catch (err) {
      console.error('[asset-slice] failed', err);
    } finally {
      setApplying(false);
    }
  }

  const vDividers = Math.max(0, cols - 1);
  const hDividers = Math.max(0, rows - 1);

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 480,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--pb-paper)',
          border: '1.5px solid var(--pb-line-2)',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 12px 32px rgba(0,0,0,0.24)',
        }}
      >
        <div
          className="flex items-center justify-between px-4 py-3 shrink-0"
          style={{ borderBottom: '1.5px solid var(--pb-line-2)' }}
        >
          <div className="flex items-center gap-2">
            <Scissors size={14} strokeWidth={2.4} style={{ color: 'var(--pb-ink)' }} />
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--pb-ink)' }}>
              Slice {asset.name}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            title="Close"
            style={{
              background: 'transparent',
              border: 0,
              cursor: 'pointer',
              color: 'var(--pb-ink-muted)',
              display: 'flex',
              alignItems: 'center',
              padding: 2,
            }}
          >
            <X size={14} strokeWidth={2.4} />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-4">
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div
              style={{
                position: 'relative',
                display: 'inline-block',
                maxWidth: '100%',
                background: 'rgba(0,0,0,0.06)',
                border: '1.5px solid var(--pb-line-2)',
                borderRadius: 8,
                overflow: 'hidden',
                lineHeight: 0,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={baseStyle.dataUrl}
                alt=""
                style={{
                  display: 'block',
                  maxWidth: '100%',
                  maxHeight: 320,
                  width: 'auto',
                  height: 'auto',
                  imageRendering: 'pixelated',
                }}
                draggable={false}
              />
              {Array.from({ length: vDividers }, (_, i) => (
                <div
                  key={`v${i}`}
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: `${((i + 1) / cols) * 100}%`,
                    width: 0,
                    borderLeft: '1.5px dashed var(--pb-butter-ink)',
                    pointerEvents: 'none',
                  }}
                />
              ))}
              {Array.from({ length: hDividers }, (_, i) => (
                <div
                  key={`h${i}`}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: `${((i + 1) / rows) * 100}%`,
                    height: 0,
                    borderTop: '1.5px dashed var(--pb-butter-ink)',
                    pointerEvents: 'none',
                  }}
                />
              ))}
            </div>
          </div>

          <PanelSlider
            label="Rows"
            value={rows}
            onChange={(v) => setRows(Math.max(1, Math.round(v)))}
            min={1}
            max={16}
            step={1}
          />
          <PanelSlider
            label="Columns"
            value={cols}
            onChange={(v) => setCols(Math.max(1, Math.round(v)))}
            min={1}
            max={16}
            step={1}
          />

          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--pb-ink-muted)',
              textAlign: 'center',
            }}
          >
            {willSlice
              ? `${total} cell${total === 1 ? '' : 's'} · ${cellW}×${cellH}px each`
              : 'Set rows or columns above 1 to slice.'}
          </div>
        </div>

        <footer
          className="shrink-0"
          style={{
            padding: 12,
            borderTop: '1.5px solid var(--pb-line-2)',
            background: 'var(--pb-paper)',
          }}
        >
          <PanelActionButton
            variant="primary"
            icon={Scissors}
            fullWidth
            loading={applying}
            disabled={!willSlice || applying}
            onClick={handleApply}
          >
            {willSlice ? `Apply slice (${total} cell${total === 1 ? '' : 's'})` : 'Apply slice'}
          </PanelActionButton>
        </footer>
      </div>
    </div>,
    document.body,
  );
}

/** Pick the next free label inside an asset's style list. Mirrors the
 *  helper TileAssetsView uses for its uploads so the server's
 *  (user_id, group_id, label) upsert key doesn't accidentally overwrite
 *  an existing row when the user adds a sprite with a colliding base
 *  filename. */
function nextUniqueLabel(asset: ObjectAsset, base: string): string {
  const taken = new Set(asset.styles.map((s) => s.label));
  if (!taken.has(base)) return base;
  for (let i = 2; i < 1000; i++) {
    const candidate = `${base} ${i}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${base} ${Date.now()}`;
}
