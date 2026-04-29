'use client';
import { RotateCcw, Dices } from 'lucide-react';
import { PanelSection } from '@/components/ui/panel-controls/PanelSection';
import { PanelSlider } from '@/components/ui/panel-controls/PanelSlider';
import { PanelSelect } from '@/components/ui/panel-controls/PanelSelect';
import { PanelToggle } from '@/components/ui/panel-controls/PanelToggle';
import { PanelInput } from '@/components/ui/panel-controls/PanelInput';
import { PanelActionButton } from '@/components/ui/panel-controls/PanelActionButton';
import { PanelColorSwatches } from '@/components/ui/panel-controls/PanelColorSwatches';
import { PBButton } from '@/components/ui';
import {
  useLightingStore,
  type LightingPreset,
  type RGB,
} from '@/store/lighting-store';
import { useTile, tileDataUrlFor } from '@/store/tile-store';
import { useStudio } from '@/store/studio-store';

/**
 * Right-panel view shown when the user selects "Workspace" in the left-panel
 * scene hierarchy. Hosts the Roblox-style Lighting + Atmosphere controls that
 * used to live in the floating LightingPanel over the 3D viewport.
 */
export function WorkspacePropertiesPanel({ headless }: { headless?: boolean } = {}) {
  const preset = useLightingStore((s) => s.preset);
  const config = useLightingStore((s) => s.config);
  const setPreset = useLightingStore((s) => s.setPreset);
  const setField = useLightingStore((s) => s.setField);
  const setAtm = useLightingStore((s) => s.setAtmosphereField);
  const reset = useLightingStore((s) => s.reset);

  const Shell = headless ? (({ children }: { children: React.ReactNode }) => <>{children}</>) : (({ children }: { children: React.ReactNode }) => (
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

  return (
    <Shell>
      {/* Scrollable content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        <TileCameraSection />
        <TileGenerationSection />
        <PanelSection title="Preset" collapsible defaultOpen>
          <PanelSelect
            label="Preset"
            value={preset}
            onChange={(v) => {
              if (v !== 'custom') setPreset(v as Exclude<LightingPreset, 'custom'>);
            }}
            options={[
              { value: 'roblox-default', label: 'Roblox Default' },
              { value: 'roblox-poppy', label: 'Poppy (cartoon)' },
              { value: 'roblox-soft', label: 'Soft / Overcast' },
              ...(preset === 'custom' ? [{ value: 'custom', label: 'Custom' }] : []),
            ]}
          />
        </PanelSection>

        <PanelSection title="Lighting" collapsible defaultOpen>
          <PanelSlider
            label="Brightness"
            value={config.brightness}
            onChange={(v) => setField('brightness', v)}
            min={0} max={5} step={0.05} precision={2}
          />
          <PanelSlider
            label="ExposureCompensation"
            value={config.exposureCompensation}
            onChange={(v) => setField('exposureCompensation', v)}
            min={-3} max={3} step={0.05} precision={2}
          />
          <PanelSlider
            label="ClockTime"
            value={config.clockTime}
            onChange={(v) => setField('clockTime', v)}
            min={0} max={24} step={0.1} precision={1} suffix="h"
          />
          <PanelSlider
            label="EnvDiffuseScale"
            value={config.environmentDiffuseScale}
            onChange={(v) => setField('environmentDiffuseScale', v)}
            min={0} max={2} step={0.01} precision={2}
          />
          <PanelToggle
            label="GlobalShadows"
            description="(off = flat, same color on every face)"
            checked={config.globalShadows}
            onChange={(v) => setField('globalShadows', v)}
          />
        </PanelSection>

        <PanelSection title="Ambient Colors (RGB 0-255)" collapsible defaultOpen={false}>
          <RgbRow label="Ambient"         value={config.ambient}         onChange={(v) => setField('ambient', v)} />
          <RgbRow label="OutdoorAmbient"  value={config.outdoorAmbient}  onChange={(v) => setField('outdoorAmbient', v)} />
          <RgbRow label="ColorShift_Top"  value={config.colorShiftTop}   onChange={(v) => setField('colorShiftTop', v)} />
          <RgbRow label="ColorShift_Bot"  value={config.colorShiftBottom} onChange={(v) => setField('colorShiftBottom', v)} />
          <RgbRow label="SkyColor"        value={config.skyColor}        onChange={(v) => setField('skyColor', v)} />
        </PanelSection>

        <PanelSection title="Atmosphere" collapsible defaultOpen={false}>
          <PanelSlider
            label="Density"
            value={config.atmosphere.density}
            onChange={(v) => setAtm('density', v)}
            min={0} max={1} step={0.01} precision={2}
          />
          <PanelSlider
            label="Offset"
            value={config.atmosphere.offset}
            onChange={(v) => setAtm('offset', v)}
            min={0} max={1} step={0.01} precision={2}
          />
          <PanelSlider
            label="Glare"
            value={config.atmosphere.glare}
            onChange={(v) => setAtm('glare', v)}
            min={0} max={10} step={0.1} precision={1}
          />
          <PanelSlider
            label="Haze"
            value={config.atmosphere.haze}
            onChange={(v) => setAtm('haze', v)}
            min={0} max={10} step={0.1} precision={1}
          />
          <RgbRow label="Color" value={config.atmosphere.color} onChange={(v) => setAtm('color', v)} />
          <RgbRow label="Decay" value={config.atmosphere.decay} onChange={(v) => setAtm('decay', v)} />
        </PanelSection>
      </div>

      {/* Sticky footer — chunky PBButton with the design's stacked drop-shadow */}
      <footer
        className="shrink-0"
        style={{
          padding: 12,
          borderTop: '1.5px solid var(--pb-line-2)',
          background: 'var(--pb-paper)',
        }}
      >
        <PBButton onClick={reset} variant="secondary" icon={RotateCcw} fullWidth>
          Reset to Poppy
        </PBButton>
      </footer>
    </Shell>
  );
}

/**
 * Play-mode camera controls for the 2D Tile workspace. Lives at the top of
 * the Workspace properties tab so it's reachable without touching the
 * Properties context-aware panel. Only renders when the active game
 * system is 2D Tile — other workspaces have their own camera UX (3D
 * orbit, freeform pan/zoom) so these controls would just be noise.
 */
function TileCameraSection() {
  const gameSystem = useStudio((s) => s.gameSystem);
  const follow = useTile((s) => s.playCameraFollow);
  const setFollow = useTile((s) => s.setPlayCameraFollow);
  const smoothing = useTile((s) => s.playCameraSmoothing);
  const setSmoothing = useTile((s) => s.setPlayCameraSmoothing);
  const zoom = useTile((s) => s.playCameraZoom);
  const setZoom = useTile((s) => s.setPlayCameraZoom);

  if (gameSystem !== '2d') return null;

  return (
    <PanelSection title="Camera" collapsible defaultOpen>
      <PanelToggle
        label="Follow player"
        description="Keep the player centred while playing"
        checked={follow}
        onChange={setFollow}
      />
      <PanelSlider
        label="Smoothing"
        value={smoothing}
        onChange={setSmoothing}
        min={0} max={1} step={0.01} precision={2}
      />
      <PanelSlider
        label="Zoom"
        value={zoom}
        onChange={setZoom}
        min={0.5} max={4} step={0.1} precision={1} suffix="×"
      />
    </PanelSection>
  );
}

/**
 * Procedural-map controls for the 2D Tile Play loop. Lets the user pick
 * a seed, set the biome blob size, and weight each terrain texture so
 * (e.g.) grass dominates while sand stays a thin border. Weight 0 takes
 * a texture out of the generator entirely.
 */
function TileGenerationSection() {
  const gameSystem = useStudio((s) => s.gameSystem);
  const seed = useTile((s) => s.genSeed);
  const setSeed = useTile((s) => s.setGenSeed);
  const reroll = useTile((s) => s.rerollGenSeed);
  const scale = useTile((s) => s.genScale);
  const setScale = useTile((s) => s.setGenScale);
  const octaves = useTile((s) => s.genOctaves);
  const setOctaves = useTile((s) => s.setGenOctaves);
  const roughness = useTile((s) => s.genRoughness);
  const setRoughness = useTile((s) => s.setGenRoughness);
  const islandEnabled = useTile((s) => s.genIslandEnabled);
  const setIslandEnabled = useTile((s) => s.setGenIslandEnabled);
  const islandRadius = useTile((s) => s.genIslandRadius);
  const setIslandRadius = useTile((s) => s.setGenIslandRadius);
  const reserveRadius = useTile((s) => s.genReserveRadius);
  const setReserveRadius = useTile((s) => s.setGenReserveRadius);
  const reserveShape = useTile((s) => s.genReserveShape);
  const setReserveShape = useTile((s) => s.setGenReserveShape);
  const tilesets = useTile((s) => s.tilesets);
  const tiles = useTile((s) => s.tiles);
  const weights = useTile((s) => s.genTextureWeights);
  const setWeight = useTile((s) => s.setGenTextureWeight);

  if (gameSystem !== '2d') return null;

  // Collect every unique texture id across tilesets so newly-uploaded
  // sheets show up automatically. Each entry carries a display label
  // (uses `upperLabel`/`lowerLabel` when set, otherwise a short id) and
  // a swatch dataUrl pulled from the corresponding side's first tile.
  type Row = { textureId: string; label: string; swatch?: string };
  const seen = new Map<string, Row>();
  for (const ts of tilesets) {
    for (const side of ['u', 'l'] as const) {
      const texId = side === 'u' ? ts.upperTextureId : ts.lowerTextureId;
      if (!texId || seen.has(texId)) continue;
      const label =
        (side === 'u' ? ts.upperLabel : ts.lowerLabel)
          ?? `Terrain ${texId.slice(0, 4)}`;
      // First tile of the matching half gives a representative swatch.
      // Tilesets are 4×4 wang sheets — index 0 is the pure-lower tile,
      // index 15 is the pure-upper tile, so we pick those when present.
      const tileIdx = side === 'u' ? 15 : 0;
      const tileId = ts.tileIds[tileIdx];
      const tile = tileId ? tiles[tileId] : undefined;
      const swatch = tile ? tileDataUrlFor(ts, tileIdx, tile.dataUrl) : undefined;
      seen.set(texId, { textureId: texId, label, swatch });
    }
  }
  const rows = [...seen.values()];

  return (
    <PanelSection title="Generation" collapsible defaultOpen>
      <div className="flex items-end gap-2">
        <PanelInput
          label="Seed"
          value={String(seed)}
          onChange={(v) => {
            const n = Number(v);
            if (Number.isFinite(n)) setSeed(n);
          }}
        />
        <PanelActionButton
          icon={Dices}
          variant="secondary"
          onClick={reroll}
          aria-label="Reroll seed"
        >
          Reroll
        </PanelActionButton>
      </div>
      <PanelSlider
        label="Biome scale"
        value={scale}
        onChange={setScale}
        min={4} max={64} step={1} precision={0}
        suffix=" cells"
      />
      <PanelSlider
        label="Octaves"
        value={octaves}
        onChange={setOctaves}
        min={1} max={4} step={1} precision={0}
      />
      <PanelSlider
        label="Roughness"
        value={roughness}
        onChange={setRoughness}
        min={0} max={0.95} step={0.05} precision={2}
      />
      <PanelToggle
        label="Island falloff"
        description="Fade to lowest band outside the radius"
        checked={islandEnabled}
        onChange={setIslandEnabled}
      />
      {islandEnabled && (
        <PanelSlider
          label="Island radius"
          value={islandRadius}
          onChange={setIslandRadius}
          min={32} max={512} step={1} precision={0}
          suffix=" cells"
        />
      )}
      <PanelSelect
        label="Reserve shape"
        value={reserveShape}
        onChange={(v) => setReserveShape(v as 'square' | 'circle')}
        options={[
          { value: 'square', label: 'Square' },
          { value: 'circle', label: 'Circle' },
        ]}
      />
      <PanelSlider
        label="Reserve size"
        value={reserveRadius}
        onChange={setReserveRadius}
        min={8} max={256} step={1} precision={0}
        suffix=" cells"
      />
      {rows.length === 0 ? (
        <div
          className="text-xs"
          style={{ color: 'var(--pb-ink-muted)', padding: '8px 2px' }}
        >
          Upload a tileset to control its weight here.
        </div>
      ) : (
        rows.map((r) => (
          <TerrainWeightRow
            key={r.textureId}
            label={r.label}
            swatch={r.swatch}
            value={weights[r.textureId] ?? 1}
            onChange={(v) => setWeight(r.textureId, v)}
          />
        ))
      )}
    </PanelSection>
  );
}

function TerrainWeightRow({
  label,
  swatch,
  value,
  onChange,
}: {
  label: string;
  swatch?: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="shrink-0 rounded-md overflow-hidden"
        style={{
          width: 24,
          height: 24,
          border: '1.5px solid var(--pb-line-2)',
          backgroundImage: swatch ? `url(${swatch})` : undefined,
          backgroundSize: 'cover',
          backgroundColor: swatch ? undefined : 'var(--pb-paper)',
          imageRendering: 'pixelated',
        }}
      />
      <div className="flex-1 min-w-0">
        <PanelSlider
          label={label}
          value={value}
          onChange={onChange}
          min={0} max={2} step={0.05} precision={2}
        />
      </div>
    </div>
  );
}

function RgbRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: RGB;
  onChange: (v: RGB) => void;
}) {
  const hex =
    '#' +
    [value.r, value.g, value.b]
      .map((n) => Math.round(n).toString(16).padStart(2, '0'))
      .join('');

  return (
    <PanelColorSwatches
      label={label}
      value={hex}
      onChange={(h) => {
        const raw = h.replace('#', '');
        onChange({
          r: parseInt(raw.slice(0, 2), 16),
          g: parseInt(raw.slice(2, 4), 16),
          b: parseInt(raw.slice(4, 6), 16),
        });
      }}
    />
  );
}
