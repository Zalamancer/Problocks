'use client';
import { Trash2, Wand2 } from 'lucide-react';
import { PanelSection } from '@/components/ui/panel-controls/PanelSection';
import { PanelSlider } from '@/components/ui/panel-controls/PanelSlider';
import { PanelToggle } from '@/components/ui/panel-controls/PanelToggle';
import { PanelActionButton } from '@/components/ui/panel-controls/PanelActionButton';
import { useTile, type TileGroup } from '@/store/tile-store';
import { pushGroupDeleteToCloud } from '@/lib/tile-group-sync';

/**
 * Right-panel Properties view for a selected tile group. Drives the per-
 * group stamp randomization (size range, flip, hue/sat/brightness) used
 * when the group is later wired up as a single brush. All fields are
 * persisted on the TileGroup row through `updateTileGroup`.
 */
export function TileGroupPropertiesPanel({ headless }: { headless?: boolean } = {}) {
  const groupId = useTile((s) => s.selectedTileGroupId);
  const group: TileGroup | null = useTile((s) =>
    s.selectedTileGroupId ? s.tileGroups[s.selectedTileGroupId] ?? null : null,
  );
  const updateTileGroup = useTile((s) => s.updateTileGroup);
  const removeTileGroup = useTile((s) => s.removeTileGroup);
  const setSelectedTileGroupId = useTile((s) => s.setSelectedTileGroupId);
  const applyGroupTransformToPlaced = useTile((s) => s.applyGroupTransformToPlaced);

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

  if (!groupId || !group) return null;

  const sizeBase = group.sizeBase ?? 1;
  const sizeMin = group.sizeMin ?? 0.8;
  const sizeMax = group.sizeMax ?? 1.2;
  const randomSize = group.randomSize ?? false;
  const randomFlipX = group.randomFlipX ?? false;
  const randomFlipY = group.randomFlipY ?? false;
  const hue = group.hue ?? 0;
  const saturation = group.saturation ?? 1;
  const brightness = group.brightness ?? 1;
  const liveApply = group.liveApplyTransform ?? false;

  // Patch helper that also re-applies size+flip to placed instances when
  // the live toggle is on. Color (hue/sat/brightness) is always live at
  // render time so it skips the rebroadcast.
  const transformKeys = new Set([
    'sizeBase', 'sizeMin', 'sizeMax', 'randomSize', 'randomFlipX', 'randomFlipY',
  ]);
  const gid = group.id;
  function patch(p: Parameters<typeof updateTileGroup>[1]) {
    updateTileGroup(gid, p);
    if (liveApply && Object.keys(p).some((k) => transformKeys.has(k))) {
      applyGroupTransformToPlaced(gid);
    }
  }

  return (
    <Shell>
      <div
        className="shrink-0 flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1.5px solid var(--pb-line-2)' }}
      >
        <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--pb-ink)' }}>
          {group.name}
        </span>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--pb-ink-muted)', letterSpacing: 0.4 }}>
          GROUP
        </span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        <PanelSection title="Apply" collapsible defaultOpen>
          <PanelToggle
            label="Live update placed items"
            checked={liveApply}
            onChange={(b) => updateTileGroup(group.id, { liveApplyTransform: b })}
          />
          <PanelActionButton
            icon={Wand2}
            fullWidth
            onClick={() => applyGroupTransformToPlaced(group.id)}
          >
            Apply size + flip now
          </PanelActionButton>
        </PanelSection>

        <PanelSection title="Size" collapsible defaultOpen>
          <PanelSlider
            label="Base"
            value={sizeBase}
            onChange={(v) => patch({ sizeBase: v })}
            min={0.1}
            max={4}
            step={0.05}
            precision={2}
            suffix="×"
          />
          <PanelToggle
            label="Random size"
            checked={randomSize}
            onChange={(b) => patch({ randomSize: b })}
          />
          {randomSize && (
            <>
              <PanelSlider
                label="Min"
                value={sizeMin}
                onChange={(v) => patch({
                  sizeMin: v,
                  sizeMax: Math.max(v, sizeMax),
                })}
                min={0.1}
                max={4}
                step={0.05}
                precision={2}
                suffix="×"
              />
              <PanelSlider
                label="Max"
                value={sizeMax}
                onChange={(v) => patch({
                  sizeMax: v,
                  sizeMin: Math.min(v, sizeMin),
                })}
                min={0.1}
                max={4}
                step={0.05}
                precision={2}
                suffix="×"
              />
            </>
          )}
        </PanelSection>

        <PanelSection title="Flip" collapsible defaultOpen>
          <PanelToggle
            label="Random flip horizontal"
            checked={randomFlipX}
            onChange={(b) => patch({ randomFlipX: b })}
          />
          <PanelToggle
            label="Random flip vertical"
            checked={randomFlipY}
            onChange={(b) => patch({ randomFlipY: b })}
          />
        </PanelSection>

        <PanelSection title="Color" collapsible defaultOpen>
          <PanelSlider
            label="Hue"
            value={hue}
            onChange={(v) => updateTileGroup(group.id, { hue: v })}
            min={0}
            max={360}
            step={1}
            suffix="°"
          />
          <PanelSlider
            label="Saturation"
            value={saturation}
            onChange={(v) => updateTileGroup(group.id, { saturation: v })}
            min={0}
            max={2}
            step={0.05}
            precision={2}
            suffix="×"
          />
          <PanelSlider
            label="Brightness"
            value={brightness}
            onChange={(v) => updateTileGroup(group.id, { brightness: v })}
            min={0}
            max={2}
            step={0.05}
            precision={2}
            suffix="×"
          />
          <button
            type="button"
            onClick={() => updateTileGroup(group.id, { hue: 0, saturation: 1, brightness: 1 })}
            style={{
              alignSelf: 'flex-start',
              fontSize: 10,
              fontWeight: 700,
              color: 'var(--pb-ink-muted)',
              background: 'transparent',
              border: 0,
              padding: '4px 0',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Reset color
          </button>
        </PanelSection>
      </div>

      <div
        className="shrink-0 px-4 py-3"
        style={{ borderTop: '1.5px solid var(--pb-line-2)' }}
      >
        <PanelActionButton
          icon={Trash2}
          variant="destructive"
          fullWidth
          onClick={() => {
            const cloudId = group.cloudId;
            setSelectedTileGroupId(null);
            removeTileGroup(group.id);
            void pushGroupDeleteToCloud(cloudId);
          }}
        >
          Delete group
        </PanelActionButton>
      </div>
    </Shell>
  );
}
