'use client';
import { useMemo, useState, useEffect } from 'react';
import { Brush, Globe2, Waves } from 'lucide-react';
import { PanelSection } from '@/components/ui/panel-controls/PanelSection';
import { PanelToggle } from '@/components/ui/panel-controls/PanelToggle';
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
