'use client';
import { useMemo, useState, useEffect, useRef } from 'react';
import { Brush, Globe2, Waves, Film, Trash2 } from 'lucide-react';
import { PanelSection } from '@/components/ui/panel-controls/PanelSection';
import { PanelToggle } from '@/components/ui/panel-controls/PanelToggle';
import { PanelSlider } from '@/components/ui/panel-controls/PanelSlider';
import { PanelActionButton } from '@/components/ui/panel-controls/PanelActionButton';
import { useTile, type Tileset } from '@/store/tile-store';
import { PURE_UPPER_INDEX, PURE_LOWER_INDEX } from '@/lib/wang-tiles';

/**
 * Right-panel Properties view for the texture currently selected in the
 * left-panel Terrain tab. Textures are inferred from tilesets — each
 * tileset contributes an `upperTextureId` and `lowerTextureId`, and a
 * single texture id can be shared across multiple sheets (chained). This
 * panel surfaces:
 *   - the texture preview (the pure-corner tile from any owning tileset)
 *   - identity (label edit on every owning sheet at once)
 *   - brush picker (set this texture as the active paint brush)
 *   - map-base toggle (single-select across all textures)
 *   - water-effect toggle (multi-select via wavyTextureIds)
 *   - "used in" list — every sheet that contributes this texture
 */
export function TileTexturePropertiesPanel({
  headless,
}: { headless?: boolean } = {}) {
  const selectedTextureId = useTile((s) => s.selectedTextureId);
  const tilesets = useTile((s) => s.tilesets);
  const tiles = useTile((s) => s.tiles);
  const setBrushTextureId = useTile((s) => s.setBrushTextureId);
  const setTool = useTile((s) => s.setTool);
  const baseTextureId = useTile((s) => s.baseTextureId);
  const setBaseTexture = useTile((s) => s.setBaseTexture);
  const wavyTextureIds = useTile((s) => s.wavyTextureIds);
  const setWavyTexture = useTile((s) => s.setWavyTexture);
  const setTilesetLabel = useTile((s) => s.setTilesetLabel);

  // Owners — every (tileset, side) pair that contributes the selected
  // texture id. Memoised so the section re-derivation only runs when the
  // tileset list / selection changes.
  const owners = useMemo(() => {
    if (!selectedTextureId) return [] as { tileset: Tileset; side: 'u' | 'l' }[];
    const out: { tileset: Tileset; side: 'u' | 'l' }[] = [];
    for (const ts of tilesets) {
      if (ts.upperTextureId === selectedTextureId) out.push({ tileset: ts, side: 'u' });
      if (ts.lowerTextureId === selectedTextureId) out.push({ tileset: ts, side: 'l' });
    }
    return out;
  }, [selectedTextureId, tilesets]);

  // Pure-tile preview — pick the first owner's pure-corner slice. Variant
  // aware so the preview matches whatever the user is currently painting.
  const preview = useMemo(() => {
    const first = owners[0];
    if (!first) return null;
    const { tileset, side } = first;
    const pureIndex = side === 'u' ? PURE_UPPER_INDEX : PURE_LOWER_INDEX;
    const activeIdx = tileset.activeVariantIndex ?? 0;
    const variantUrls = activeIdx > 0
      ? tileset.variants?.[activeIdx - 1]?.tileDataUrls
      : undefined;
    const url = variantUrls?.[pureIndex] ?? tiles[tileset.tileIds[pureIndex]]?.dataUrl;
    return url ?? null;
  }, [owners, tiles]);

  // Initial label — derive from the first owner's per-side label so the
  // input has the same value the terrain card showed. Owners are kept in
  // sync on commit (one input write hits every contributing sheet).
  const initialLabel = useMemo(() => {
    if (!selectedTextureId) return '';
    const first = owners[0];
    if (!first) return '';
    const lbl = first.side === 'u' ? first.tileset.upperLabel : first.tileset.lowerLabel;
    return lbl ?? '';
  }, [owners, selectedTextureId]);
  const [labelDraft, setLabelDraft] = useState(initialLabel);
  // Reset the local draft on selection change so switching textures
  // doesn't leak the previous draft into the new input.
  useEffect(() => {
    setLabelDraft(initialLabel);
  }, [initialLabel, selectedTextureId]);

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

  if (!selectedTextureId || owners.length === 0) return null;

  const isBase = baseTextureId === selectedTextureId;
  const isWavy = wavyTextureIds.includes(selectedTextureId);

  function commitLabel() {
    const next = labelDraft.trim();
    for (const { tileset, side } of owners) {
      setTilesetLabel(tileset.id, side, next);
    }
  }

  function pickAsBrush() {
    if (!selectedTextureId) return;
    setBrushTextureId(selectedTextureId);
    setTool('paint');
  }

  return (
    <Shell>
      {/* Header — texture preview + name. Mirrors TileObjectPropertiesPanel's
          header so the visual rhythm of the right panel is consistent
          across selection types. */}
      <div
        className="shrink-0 flex items-center gap-3 px-4 py-3"
        style={{ borderBottom: '1.5px solid var(--pb-line-2)' }}
      >
        <div
          style={{
            width: 36, height: 36, flexShrink: 0,
            background: 'var(--pb-cream-2)',
            border: '1.5px solid var(--pb-line-2)',
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          {preview && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={preview}
              alt={labelDraft || 'texture'}
              style={{ width: '100%', height: '100%', objectFit: 'contain', imageRendering: 'pixelated' }}
              draggable={false}
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: 'var(--pb-ink)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {labelDraft || 'Untitled texture'}
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--pb-ink-muted)', letterSpacing: 0.4 }}>
            TEXTURE · {owners.length} sheet{owners.length === 1 ? '' : 's'}
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        <PanelSection title="Identity" collapsible defaultOpen>
          <label
            className="flex flex-col gap-1.5"
            style={{ fontSize: 10, fontWeight: 800, color: 'var(--pb-ink-muted)', letterSpacing: 0.4 }}
          >
            NAME
            <input
              value={labelDraft}
              onChange={(e) => setLabelDraft(e.target.value)}
              onBlur={commitLabel}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.currentTarget.blur();
                }
              }}
              placeholder="e.g. grass, water…"
              style={{
                padding: '7px 9px',
                background: 'var(--pb-cream-2)',
                border: '1.5px solid var(--pb-line-2)',
                borderRadius: 7,
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--pb-ink)',
              }}
            />
          </label>
        </PanelSection>

        <PanelSection title="Map base" collapsible defaultOpen>
          <PanelToggle
            label="Use as map-wide base"
            checked={isBase}
            onChange={(v) => setBaseTexture(v ? selectedTextureId : null)}
          />
        </PanelSection>

        <PanelSection title="Water effect" collapsible defaultOpen>
          <PanelToggle
            label="Animate as water"
            checked={isWavy}
            onChange={(v) => setWavyTexture(selectedTextureId, v)}
          />
        </PanelSection>

        <TileAnimationSection owners={owners} />

        <PanelSection title={`Used in (${owners.length})`} collapsible defaultOpen>
          <div className="flex flex-col gap-1.5">
            {owners.map(({ tileset, side }) => (
              <UsedInRow key={`${tileset.id}-${side}`} tileset={tileset} side={side} />
            ))}
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
          icon={Brush}
          fullWidth
          onClick={pickAsBrush}
        >
          Use as paint brush
        </PanelActionButton>
      </footer>
    </Shell>
  );
}

/**
 * Tile-level animation controls. Animates the PURE corner tile for the
 * texture (`PURE_UPPER_INDEX` / `PURE_LOWER_INDEX` of each owning sheet
 * — that's the slot the renderer reaches for whenever a cell's 4
 * corners are all this texture, e.g. open water in the middle of a
 * lake). User uploads a single horizontal animation strip; the slicer
 * splits it into `frameCount` equal-width frames at runtime and stores
 * them on the tile via `setTileAnimation`.
 *
 * Multi-owner caveat: when several tilesets contribute the texture,
 * the animation is applied to the FIRST owner only — that's the same
 * tile the panel header preview shows, so what you see is what you
 * get. Animating each owner independently can come later if users
 * need per-sheet variation.
 */
function TileAnimationSection({
  owners,
}: {
  owners: { tileset: Tileset; side: 'u' | 'l' }[];
}) {
  const tiles = useTile((s) => s.tiles);
  const setTileAnimation = useTile((s) => s.setTileAnimation);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [frameCount, setFrameCount] = useState(16);
  const [fps, setFps] = useState(8);
  const [busy, setBusy] = useState(false);

  if (owners.length === 0) return null;
  const first = owners[0];
  const pureIndex = first.side === 'u' ? PURE_UPPER_INDEX : PURE_LOWER_INDEX;
  const tileId = first.tileset.tileIds[pureIndex];
  const tile = tileId ? tiles[tileId] : undefined;
  if (!tile) return null;
  const animated = !!tile.animationFrames && tile.animationFrames.length > 0;

  async function handleFile(file: File) {
    setBusy(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result ?? ''));
        r.onerror = () => reject(r.error ?? new Error('read failed'));
        r.readAsDataURL(file);
      });
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const im = new Image();
        im.onload = () => resolve(im);
        im.onerror = () => reject(new Error('image load failed'));
        im.src = dataUrl;
      });
      // Slice the strip horizontally. Frame width is the source width
      // divided by frameCount (rounded down so we never read past the
      // edge); frame height is the full source height. This matches
      // the most common sprite-sheet convention (one row, N columns).
      const N = Math.max(2, Math.min(64, Math.floor(frameCount)));
      const fw = Math.floor(img.width / N);
      const fh = img.height;
      if (fw < 1 || fh < 1) {
        setBusy(false);
        return;
      }
      const canvas = document.createElement('canvas');
      canvas.width = fw;
      canvas.height = fh;
      const ctx = canvas.getContext('2d');
      if (!ctx) { setBusy(false); return; }
      ctx.imageSmoothingEnabled = false;
      const frames: string[] = [];
      for (let i = 0; i < N; i++) {
        ctx.clearRect(0, 0, fw, fh);
        ctx.drawImage(img, i * fw, 0, fw, fh, 0, 0, fw, fh);
        frames.push(canvas.toDataURL('image/png'));
      }
      setTileAnimation(tile!.id, { frames, fps });
    } finally {
      setBusy(false);
    }
  }

  return (
    <PanelSection title="Animation" collapsible defaultOpen={animated}>
      <PanelSlider
        label="Frame count"
        value={frameCount}
        onChange={(v) => setFrameCount(v)}
        min={2} max={32} step={1} precision={0}
      />
      <PanelSlider
        label="Frames per second"
        value={fps}
        onChange={(v) => setFps(v)}
        min={1} max={30} step={1} precision={0}
        suffix=" fps"
      />
      <div className="flex flex-col gap-2">
        <PanelActionButton
          icon={Film}
          fullWidth
          variant={animated ? 'secondary' : 'primary'}
          onClick={() => fileInputRef.current?.click()}
          disabled={busy}
        >
          {busy ? 'Slicing…' : animated ? 'Replace animation' : 'Upload animation'}
        </PanelActionButton>
        {animated && (
          <PanelActionButton
            icon={Trash2}
            fullWidth
            variant="destructive"
            onClick={() => setTileAnimation(tile.id, null)}
          >
            Remove animation
          </PanelActionButton>
        )}
      </div>
      <div
        style={{ fontSize: 10, color: 'var(--pb-ink-muted)', padding: '4px 2px' }}
      >
        Sheet should be a horizontal strip — each frame {tile.width}×{tile.height}px.
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
          e.target.value = '';
        }}
      />
    </PanelSection>
  );
}

/**
 * One row in the "Used in" list — the source sheet thumbnail + name + which
 * side of the sheet (UPPER / LOWER) carries this texture id. Read-only;
 * deeper sheet-level edits still live in the terrain card.
 */
function UsedInRow({ tileset, side }: { tileset: Tileset; side: 'u' | 'l' }) {
  return (
    <div
      className="flex items-center gap-2"
      style={{
        background: 'var(--pb-cream-2)',
        border: '1.5px solid var(--pb-line-2)',
        borderRadius: 7,
        padding: '6px 8px',
      }}
    >
      <div
        style={{
          width: 24, height: 24, flexShrink: 0,
          background: 'rgba(0,0,0,0.06)',
          borderRadius: 5,
          border: '1.5px solid var(--pb-line-2)',
          overflow: 'hidden',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={tileset.sheetDataUrl}
          alt={tileset.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', imageRendering: 'pixelated' }}
          draggable={false}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: 'var(--pb-ink)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {tileset.name}
        </div>
        <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--pb-ink-muted)', letterSpacing: 0.5 }}>
          {side === 'u' ? 'UPPER SIDE' : 'LOWER SIDE'}
        </div>
      </div>
    </div>
  );
}
