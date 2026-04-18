'use client';
import { X, Sun, RotateCcw } from 'lucide-react';
import { PanelSection } from '@/components/ui/panel-controls/PanelSection';
import { PanelSlider } from '@/components/ui/panel-controls/PanelSlider';
import { PanelSelect } from '@/components/ui/panel-controls/PanelSelect';
import { PanelToggle } from '@/components/ui/panel-controls/PanelToggle';
import { PBButton } from '@/components/ui';
import {
  useLightingStore,
  type LightingPreset,
  type RGB,
} from '@/store/lighting-store';

/**
 * Right-panel view shown when the user selects "Workspace" in the left-panel
 * scene hierarchy. Hosts the Roblox-style Lighting + Atmosphere controls that
 * used to live in the floating LightingPanel over the 3D viewport.
 */
export function WorkspacePropertiesPanel() {
  const preset = useLightingStore((s) => s.preset);
  const config = useLightingStore((s) => s.config);
  const setPreset = useLightingStore((s) => s.setPreset);
  const setField = useLightingStore((s) => s.setField);
  const setAtm = useLightingStore((s) => s.setAtmosphereField);
  const reset = useLightingStore((s) => s.reset);
  const setPanelOpen = useLightingStore((s) => s.setPanelOpen);

  return (
    <aside
      className="w-full md:w-[260px] flex flex-col rounded-xl overflow-hidden shrink-0"
      style={{
        background: 'var(--pb-paper)',
        border: '1.5px solid var(--pb-line-2)',
      }}
    >
      {/* Header — butter icon tile + "Workspace" + close, styled to match the
          design bundle's properties pager row. Mirrors atoms.jsx ToneBadge +
          sibling text pattern. */}
      <div
        className="shrink-0"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 12px',
          borderBottom: '1.5px solid var(--pb-line-2)',
        }}
      >
        <span
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            background: 'var(--pb-butter)',
            color: 'var(--pb-butter-ink)',
            border: '1.5px solid var(--pb-butter-ink)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Sun size={12} strokeWidth={2.4} />
        </span>
        <span
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--pb-ink)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          Workspace
        </span>
        <button
          type="button"
          onClick={() => setPanelOpen(false)}
          title="Close"
          style={{
            width: 26,
            height: 26,
            borderRadius: 7,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--pb-paper)',
            color: 'var(--pb-ink-soft)',
            border: '1.5px solid var(--pb-line-2)',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--pb-cream-2)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--pb-paper)'; }}
        >
          <X size={13} />
        </button>
      </div>

      {/* Type-badge row — matches the "Part N of M · TYPE" strip from
          /tmp/design_bundle/problocks/project/studio/properties.jsx */}
      <div
        className="shrink-0"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          borderBottom: '1.5px solid var(--pb-line-2)',
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--pb-ink-muted)' }}>
          Part 1 of 1
        </span>
        <span
          style={{
            padding: '2px 9px',
            borderRadius: 999,
            background: 'var(--pb-cream-2)',
            color: 'var(--pb-ink-muted)',
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: '0.04em',
            border: '1.5px solid var(--pb-line-2)',
            textTransform: 'uppercase',
          }}
        >
          Lighting
        </span>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-4">
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
    </aside>
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
    <div className="flex items-center gap-2 py-1">
      <label className="text-[10px] uppercase tracking-wide text-zinc-400 flex-1 truncate">
        {label}
      </label>
      <input
        type="color"
        value={hex}
        onChange={(e) => {
          const h = e.target.value.replace('#', '');
          onChange({
            r: parseInt(h.slice(0, 2), 16),
            g: parseInt(h.slice(2, 4), 16),
            b: parseInt(h.slice(4, 6), 16),
          });
        }}
        className="w-8 h-6 rounded border border-white/10 bg-transparent cursor-pointer"
      />
      <span className="text-[10px] font-mono text-zinc-500 w-20 text-right tabular-nums">
        {value.r},{value.g},{value.b}
      </span>
    </div>
  );
}
