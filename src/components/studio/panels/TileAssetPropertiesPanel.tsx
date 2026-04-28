'use client';
import { useEffect, useState } from 'react';
import { Scissors } from 'lucide-react';
import { PanelSection } from '@/components/ui/panel-controls/PanelSection';
import { PanelSlider } from '@/components/ui/panel-controls/PanelSlider';
import { PanelActionButton } from '@/components/ui/panel-controls/PanelActionButton';
import { useTile } from '@/store/tile-store';
import { loadImage, sliceImage } from '@/lib/tile-slicer';
import { saveTileObject, deleteTileObject } from '@/lib/object-cloud';

/**
 * Right-panel Properties view for an uploaded ObjectAsset (the sprite cards
 * in the Assets section). Shows a preview of the asset image with a live
 * grid overlay driven by Rows/Columns sliders, then an Apply action that
 * slices the asset into a row×col grid of styles. Each cell becomes a new
 * style on the same asset; the originals are removed (and their cloud rows
 * deleted on best-effort).
 *
 * Mirrors the chunky-pastel chrome used by `TileObjectPropertiesPanel`:
 * collapsible PanelSections in the scroll body, a sticky footer for the
 * primary action. No new buttons / inputs / selects are introduced.
 */
export function TileAssetPropertiesPanel({ headless }: { headless?: boolean } = {}) {
  const selectedAssetId = useTile((s) => s.selectedAssetId);
  const asset = useTile((s) =>
    s.selectedAssetId ? s.objectAssets[s.selectedAssetId] ?? null : null,
  );
  const addStyleToAsset = useTile((s) => s.addStyleToAsset);
  const removeStyle = useTile((s) => s.removeStyle);
  const setStyleCloudId = useTile((s) => s.setStyleCloudId);

  const [rows, setRows] = useState(1);
  const [cols, setCols] = useState(1);
  const [applying, setApplying] = useState(false);

  // Reset slicing knobs whenever the user clicks a different asset so the
  // last asset's grid doesn't leak onto the next preview.
  useEffect(() => {
    setRows(1);
    setCols(1);
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
  const total = Math.max(1, rows) * Math.max(1, cols);
  const willSlice = rows > 1 || cols > 1;

  async function handleApply() {
    if (!asset || !baseStyle) return;
    if (!willSlice) return;
    if (!confirm(
      `Slice "${asset.name}" into ${rows}×${cols} = ${total} cells?\n` +
      `This replaces the current ${asset.styles.length} style(s).`,
    )) return;

    setApplying(true);
    try {
      const img = await loadImage(baseStyle.dataUrl);
      const result = sliceImage(img, { cols, rows });

      // Snapshot existing style ids + cloud ids so we can clean up after
      // adding the sliced cells (otherwise the asset would briefly have
      // both old and new, but never zero — `removeStyle` would auto-delete
      // the asset if the styles array hits empty).
      const oldStyleIds = asset.styles.map((s) => s.id);
      const oldCloudIds = asset.styles
        .map((s) => s.cloudId)
        .filter((id): id is string => Boolean(id));

      // Add sliced cells as new styles. Each cell is labelled "r,c" so the
      // existing style chip / dropdown UI shows a sensible name.
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

      // Drop the original styles. removeStyle remaps placed objects to the
      // first remaining style on the asset, so existing placements survive
      // (they snap to the top-left cell of the new grid).
      for (const sid of oldStyleIds) removeStyle(asset.id, sid);

      // Cloud sync — best effort. Mirrors the upload flow: try the save,
      // log on failure, never block the local change.
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

      // Reset the sliders so the user sees a clean state on the new
      // (already-sliced) asset.
      setRows(1);
      setCols(1);
    } catch (err) {
      console.error('[asset-slice] failed', err);
    } finally {
      setApplying(false);
    }
  }

  return (
    <Shell>
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
          <AssetPreview
            dataUrl={baseStyle?.dataUrl ?? ''}
            width={baseStyle?.width ?? 0}
            height={baseStyle?.height ?? 0}
            rows={rows}
            cols={cols}
          />
        </PanelSection>

        <PanelSection title="Slice into grid" collapsible defaultOpen>
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
              paddingTop: 4,
            }}
          >
            {willSlice
              ? `${total} cell${total === 1 ? '' : 's'} (${baseStyle ? Math.floor(baseStyle.width / cols) : 0}×${baseStyle ? Math.floor(baseStyle.height / rows) : 0}px each)`
              : 'Set rows or columns above 1 to slice.'}
          </div>
        </PanelSection>
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
          disabled={!willSlice || applying || !baseStyle}
          onClick={handleApply}
        >
          {willSlice ? `Apply slice (${total} cell${total === 1 ? '' : 's'})` : 'Apply slice'}
        </PanelActionButton>
      </footer>
    </Shell>
  );
}

/**
 * Square-fit thumbnail with a live grid overlay. The lines are drawn with
 * absolutely-positioned divs (rather than canvas) so they stay crisp at any
 * zoom and don't need a redraw cycle when the user drags the row/col
 * sliders. The image is bordered so users can tell where the asset edges
 * are vs the grid lines.
 */
function AssetPreview({
  dataUrl, width, height, rows, cols,
}: {
  dataUrl: string;
  width: number;
  height: number;
  rows: number;
  cols: number;
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

  // Vertical lines: place at fractional left positions for cols-1 dividers.
  const vDividers = Math.max(0, cols - 1);
  const hDividers = Math.max(0, rows - 1);

  // The wrapper is `inline-block` and shrinks to the <img>'s actual rendered
  // size (driven by maxWidth/maxHeight on the img). That means the absolute
  // grid lines — placed with `inset: 0` and fractional left/top — align
  // exactly with the image edges, regardless of the image's aspect ratio.
  // An aspect-ratio'd outer box with `objectFit: contain` would have
  // letterboxed the image, leaving the grid drawn on dead space.
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
