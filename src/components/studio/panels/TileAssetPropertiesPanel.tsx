'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Scissors, Pencil, Trash2, Plus, X, Upload,
} from 'lucide-react';
import { PanelSection } from '@/components/ui/panel-controls/PanelSection';
import { PanelSlider } from '@/components/ui/panel-controls/PanelSlider';
import { PanelActionButton } from '@/components/ui/panel-controls/PanelActionButton';
import { PanelSelect } from '@/components/ui/panel-controls/PanelSelect';
import { useTile, type ObjectAsset, type ObjectStyle, type ObjectClass } from '@/store/tile-store';
import { fileToImage, imageToDataUrl, loadImage, sliceImage } from '@/lib/tile-slicer';
import {
  saveTileObject, deleteTileObject, updateTileObject,
} from '@/lib/object-cloud';

/**
 * Build a flat list of class options for the PanelSelect dropdown. Each
 * option's label is the full breadcrumb path (e.g. "Trees / Fruit Trees")
 * so the user sees nesting context inside a flat menu — alphabetised by
 * full path so siblings at any level cluster together.
 */
function flatClassOptions(
  objectClasses: Record<string, ObjectClass>,
): { value: string; label: string }[] {
  const pathOf = (id: string): string => {
    const cls = objectClasses[id];
    if (!cls) return '';
    return cls.parentId === null
      ? cls.name
      : `${pathOf(cls.parentId)} / ${cls.name}`;
  };
  return Object.values(objectClasses)
    .map((c) => ({ value: c.id, label: pathOf(c.id) }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * The Class section's interactive controls — a PanelSelect listing every
 * class as a flat breadcrumb path, plus a "+ New class" inline input that
 * appears when the user picks the special "__new__" sentinel option. The
 * sentinel keeps the UI compact: no class? pick one or create one without
 * leaving the right panel.
 */
function ClassPickerRow({
  currentClassId,
  objectClasses,
  onChange,
  onCreateClass,
}: {
  currentClassId: string | null;
  objectClasses: Record<string, ObjectClass>;
  onChange: (classId: string | null) => void;
  onCreateClass: (name: string) => void;
}) {
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState('');
  const options = [
    { value: '__root__', label: 'Uncategorised (root)' },
    ...flatClassOptions(objectClasses),
    { value: '__new__', label: '+ New class…' },
  ];
  return (
    <div className="flex flex-col gap-2">
      <PanelSelect
        fullWidth
        value={currentClassId ?? '__root__'}
        onChange={(v) => {
          if (v === '__new__') {
            setCreating(true);
            setDraft('');
            return;
          }
          onChange(v === '__root__' ? null : v);
        }}
        options={options}
      />
      {creating && (
        <div className="flex gap-2">
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const v = draft.trim();
                if (v) onCreateClass(v);
                setCreating(false);
                setDraft('');
              }
              if (e.key === 'Escape') {
                setCreating(false);
                setDraft('');
              }
            }}
            placeholder="e.g. Trees, Buildings…"
            style={{
              flex: 1,
              padding: '6px 8px',
              fontSize: 12,
              fontWeight: 700,
              background: 'var(--pb-paper)',
              border: '1.5px solid var(--pb-line-2)',
              borderRadius: 6,
              color: 'var(--pb-ink)',
              outline: 'none',
            }}
          />
          <button
            type="button"
            onClick={() => {
              const v = draft.trim();
              if (v) onCreateClass(v);
              setCreating(false);
              setDraft('');
            }}
            style={{
              padding: '6px 10px',
              fontSize: 11,
              fontWeight: 800,
              background: 'var(--pb-butter)',
              border: '1.5px solid var(--pb-butter-ink)',
              borderRadius: 6,
              color: 'var(--pb-ink)',
              cursor: 'pointer',
            }}
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}

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
  // Class-taxonomy bindings — the dropdown lets the user move the
  // currently-selected asset between class folders (or back to root).
  // Adding/renaming classes happens in the left panel; this is purely
  // a membership picker.
  const objectClasses = useTile((s) => s.objectClasses);
  const assetClassIds = useTile((s) => s.assetClassIds);
  const setAssetClass = useTile((s) => s.setAssetClass);
  const addObjectClass = useTile((s) => s.addObjectClass);

  const [sliceOpen, setSliceOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const styleInputRef = useRef<HTMLInputElement | null>(null);

  // Reset the slice popup whenever the user picks a different asset so the
  // last asset's grid doesn't leak into the next preview.
  useEffect(() => {
    setSliceOpen(false);
  }, [selectedAssetId]);

  // Arrow-key navigation across the asset's styles. Up/Left = previous,
  // Down/Right = next, with wrap-around. Listener is document-level
  // because the right panel doesn't own a focusable container, but we
  // bail out if the user is typing in an input (rename / search etc.),
  // if the slice modal is open (it owns its own keys), or if any other
  // selection panel is on top (covered by the StudioLayout if-chain —
  // this panel only mounts when there's no canvas-object selected).
  useEffect(() => {
    if (!asset || asset.styles.length < 2 || sliceOpen) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      const dir =
        e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 :
        e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 :
        0;
      if (dir === 0) return;
      e.preventDefault();
      const idx = asset.styles.findIndex((s) => s.id === selectedStyleId);
      const startIdx = idx < 0 ? 0 : idx;
      const nextIdx = (startIdx + dir + asset.styles.length) % asset.styles.length;
      const nextStyle = asset.styles[nextIdx];
      setSelectedStyleId(nextStyle.id);
      setTool('object');
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [asset, selectedStyleId, sliceOpen, setSelectedStyleId, setTool]);

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

      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
        <ImagePreviewWithEdit
          dataUrl={baseStyle?.dataUrl ?? ''}
          onEdit={() => setSliceOpen(true)}
        />

        <div className="px-4 py-4 flex flex-col gap-4">
          <PanelSection title="Class" collapsible defaultOpen>
            <ClassPickerRow
              currentClassId={asset && assetClassIds[asset.id] ? assetClassIds[asset.id] : null}
              objectClasses={objectClasses}
              onChange={(classId) => {
                if (asset) setAssetClass(asset.id, classId);
              }}
              onCreateClass={(name) => {
                if (!asset) return;
                const id = addObjectClass({ name, parentId: null });
                setAssetClass(asset.id, id);
              }}
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
 * Edge-to-edge header image — fills the right panel's full width with a
 * 1:1 square tile, no internal section chrome (no PanelSection title, no
 * caption, no border / padding). Image letterboxes via objectFit:contain
 * + pixelated so 16×16 sprites scale up crisply and large sheets scale
 * down to fit. The bottom border separates the preview from the Styles
 * section that follows.
 */
function ImagePreviewWithEdit({
  dataUrl, onEdit,
}: {
  dataUrl: string;
  onEdit: () => void;
}) {
  if (!dataUrl) {
    return (
      <div
        style={{
          width: '100%',
          aspectRatio: '1 / 1',
          flexShrink: 0,
          background: 'var(--pb-cream-2)',
          borderBottom: '1.5px solid var(--pb-line-2)',
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
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1 / 1',
        flexShrink: 0,
        background: 'rgba(0,0,0,0.06)',
        borderBottom: '1.5px solid var(--pb-line-2)',
        overflow: 'hidden',
        padding: 12,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={dataUrl}
        alt=""
        style={{
          position: 'absolute',
          inset: 12,
          display: 'block',
          width: 'calc(100% - 24px)',
          height: 'calc(100% - 24px)',
          objectFit: 'contain',
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
          top: 8,
          right: 8,
          width: 30,
          height: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--pb-paper)',
          border: '1.5px solid var(--pb-line-2)',
          borderRadius: 8,
          boxShadow: '0 1.5px 0 var(--pb-line-2)',
          color: 'var(--pb-ink)',
          cursor: 'pointer',
          padding: 0,
        }}
      >
        <Pencil size={14} strokeWidth={2.4} />
      </button>
    </div>
  );
}

/**
 * Flat style list — mirrors the AssetCard treatment in TileAssetsView:
 *   - No row chrome at rest (no border/background); selection paints a
 *     butter wash and hover paints a soft tint.
 *   - Pencil + Trash render only on hover or when the row is selected.
 *   - Drag handle is gone — the entire row is the drag handle.
 *   - View dropdown switches list ↔ grid layout (parity with the asset
 *     browser).
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
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [editingStyleId, setEditingStyleId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const dragStyleIdRef = useRef<string | null>(null);
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});
  useEffect(() => {
    if (!selectedStyleId) return;
    const row = rowRefs.current[selectedStyleId];
    if (row) row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selectedStyleId]);

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
    <div className="flex flex-col gap-2">
      <PanelSelect
        label="View"
        value={viewMode}
        onChange={(v) => setViewMode(v as typeof viewMode)}
        options={[
          { value: 'list', label: 'List' },
          { value: 'grid', label: 'Grid' },
        ]}
      />
      <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-1' : 'flex flex-col gap-px'}>
        {asset.styles.map((style, i) => {
          const isCurrent = style.id === selectedStyleId;
          const isEditing = editingStyleId === style.id;
          const isHovered = hoveredId === style.id;
          const showActions = isHovered || isCurrent || isEditing;
          const bg = isCurrent
            ? 'var(--pb-butter)'
            : isHovered
              ? 'rgba(0,0,0,0.04)'
              : 'transparent';
          const labelText = style.label || `Style ${i + 1}`;
          const containerStyle: React.CSSProperties = {
            background: bg,
            borderRadius: 6,
            cursor: 'pointer',
            overflow: 'hidden',
            position: 'relative',
          };
          const editButton = (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setEditingStyleId(style.id); }}
              title="Rename style"
              style={{
                background: 'rgba(255,255,255,0.85)',
                border: '1px solid var(--pb-line-2)',
                borderRadius: 6,
                cursor: 'pointer',
                color: 'var(--pb-ink)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 4,
              }}
            >
              <Pencil size={12} strokeWidth={2.4} />
            </button>
          );
          const deleteButton = (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRemoveStyle(style); }}
              title="Delete style"
              style={{
                background: 'rgba(255,255,255,0.85)',
                border: '1px solid var(--pb-line-2)',
                borderRadius: 6,
                cursor: 'pointer',
                color: 'var(--pb-coral-ink)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 4,
              }}
            >
              <Trash2 size={12} strokeWidth={2.4} />
            </button>
          );
          const commonHandlers = {
            ref: (el: HTMLDivElement | null) => { rowRefs.current[style.id] = el; },
            draggable: !isEditing,
            onMouseEnter: () => setHoveredId(style.id),
            onMouseLeave: () => setHoveredId((h) => (h === style.id ? null : h)),
            onDragStart: (e: React.DragEvent) => {
              dragStyleIdRef.current = style.id;
              e.dataTransfer.effectAllowed = 'move';
              try { e.dataTransfer.setData('text/plain', style.id); } catch { /* ignore */ }
            },
            onDragOver: (e: React.DragEvent) => {
              if (!dragStyleIdRef.current || dragStyleIdRef.current === style.id) return;
              e.preventDefault();
            },
            onDrop: (e: React.DragEvent) => { e.preventDefault(); reorderViaDrop(style.id); },
            onClick: (e: React.MouseEvent) => {
              const t = e.target as HTMLElement;
              if (t.closest('button, input')) return;
              onPickStyle(style.id);
            },
          };

          if (viewMode === 'grid') {
            return (
              <div key={style.id} {...commonHandlers} style={containerStyle}>
                <div
                  style={{
                    width: '100%',
                    aspectRatio: '1 / 1',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isCurrent ? 'transparent' : 'rgba(0,0,0,0.03)',
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
                </div>
                {isEditing ? (
                  <input
                    autoFocus
                    defaultValue={style.label}
                    onBlur={(e) => { onRenameStyle(style.id, e.target.value); setEditingStyleId(null); }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur();
                      if (e.key === 'Escape') setEditingStyleId(null);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      width: '100%',
                      background: 'var(--pb-paper)',
                      border: '1.5px solid var(--pb-line-2)',
                      borderRadius: 5,
                      padding: '3px 6px',
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'var(--pb-ink)',
                    }}
                  />
                ) : (
                  <div
                    onDoubleClick={(e) => { e.stopPropagation(); setEditingStyleId(style.id); }}
                    title={labelText}
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: 'var(--pb-ink)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      padding: '4px 4px 6px',
                      textAlign: 'center',
                    }}
                  >
                    {labelText}
                  </div>
                )}
                {showActions && !isEditing && (
                  <div style={{ position: 'absolute', top: 4, right: 4, display: 'flex', gap: 4 }}>
                    {editButton}
                    {deleteButton}
                  </div>
                )}
              </div>
            );
          }

          return (
            <div key={style.id} {...commonHandlers} style={containerStyle}>
              <div className="flex items-center gap-2" style={{ padding: '4px 6px' }}>
                <div
                  style={{
                    width: 56, height: 56, flexShrink: 0,
                    background: isCurrent ? 'transparent' : 'rgba(0,0,0,0.03)',
                    borderRadius: 4,
                    overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={style.dataUrl}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'contain', imageRendering: 'pixelated' }}
                    draggable={false}
                  />
                </div>
                {isEditing ? (
                  <input
                    autoFocus
                    defaultValue={style.label}
                    onBlur={(e) => { onRenameStyle(style.id, e.target.value); setEditingStyleId(null); }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur();
                      if (e.key === 'Escape') setEditingStyleId(null);
                    }}
                    onClick={(e) => e.stopPropagation()}
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
                    onDoubleClick={(e) => { e.stopPropagation(); setEditingStyleId(style.id); }}
                    title="Double-click to rename"
                    style={{
                      flex: 1,
                      minWidth: 0,
                      fontSize: 13,
                      fontWeight: 700,
                      color: 'var(--pb-ink)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      cursor: 'text',
                    }}
                  >
                    {labelText}
                  </span>
                )}
                {showActions && !isEditing && (
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    {editButton}
                    {deleteButton}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
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
