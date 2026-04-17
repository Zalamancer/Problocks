'use client';
import { X, Sun } from 'lucide-react';
import { PanelSection } from '@/components/ui/panel-controls/PanelSection';
import { PanelSlider } from '@/components/ui/panel-controls/PanelSlider';
import { PanelSelect } from '@/components/ui/panel-controls/PanelSelect';
import { PanelToggle } from '@/components/ui/panel-controls/PanelToggle';
import { PanelActionButton } from '@/components/ui/panel-controls/PanelActionButton';
import {
  useLightingStore,
  type LightingPreset,
  type RGB,
} from '@/store/lighting-store';

/**
 * Floating lighting/atmosphere panel — Roblox-like controls for live-tweaking
 * the scene's look without leaving the workspace. Fields map 1:1 to
 * Roblox Studio's Lighting + Atmosphere instances; see lighting-store.ts.
 */
export function LightingPanel() {
  const panelOpen = useLightingStore((s) => s.panelOpen);
  const setPanelOpen = useLightingStore((s) => s.setPanelOpen);
  const preset = useLightingStore((s) => s.preset);
  const config = useLightingStore((s) => s.config);
  const setPreset = useLightingStore((s) => s.setPreset);
  const setField = useLightingStore((s) => s.setField);
  const setAtm = useLightingStore((s) => s.setAtmosphereField);
  const reset = useLightingStore((s) => s.reset);

  if (!panelOpen) return null;

  return (
    <aside
      className="absolute top-3 right-3 z-20 w-[300px] max-h-[calc(100vh-24px)] flex flex-col bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-xl"
      onMouseDown={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <header className="shrink-0 flex items-center justify-between px-3 py-2 border-b border-white/10">
        <div className="flex items-center gap-2 text-zinc-100">
          <Sun size={14} className="text-amber-300" />
          <span className="text-[12px] font-medium">Lighting</span>
        </div>
        <button
          type="button"
          onClick={() => setPanelOpen(false)}
          className="w-6 h-6 rounded-md flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10"
          title="Close"
        >
          <X size={13} />
        </button>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* Preset */}
        <PanelSection title="Preset">
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

        {/* Lighting core */}
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
            checked={config.globalShadows}
            onChange={(v) => setField('globalShadows', v)}
          />
        </PanelSection>

        {/* Ambient colors */}
        <PanelSection title="Ambient Colors (RGB 0-255)" collapsible defaultOpen={false}>
          <RgbRow label="Ambient"         value={config.ambient}         onChange={(v) => setField('ambient', v)} />
          <RgbRow label="OutdoorAmbient"  value={config.outdoorAmbient}  onChange={(v) => setField('outdoorAmbient', v)} />
          <RgbRow label="ColorShift_Top"  value={config.colorShiftTop}   onChange={(v) => setField('colorShiftTop', v)} />
          <RgbRow label="ColorShift_Bot"  value={config.colorShiftBottom} onChange={(v) => setField('colorShiftBottom', v)} />
          <RgbRow label="SkyColor"        value={config.skyColor}        onChange={(v) => setField('skyColor', v)} />
        </PanelSection>

        {/* Atmosphere */}
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

      {/* Footer */}
      <footer className="shrink-0 px-3 py-2 border-t border-white/10">
        <PanelActionButton onClick={reset} variant="secondary" fullWidth>
          Reset to Poppy
        </PanelActionButton>
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
