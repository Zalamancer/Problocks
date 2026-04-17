'use client';
import { useRouter } from 'next/navigation';
import { GraduationCap, Zap } from 'lucide-react';
import {
  PanelSection,
  PanelToggle,
  PanelActionButton,
  PanelSelect,
} from '@/components/ui';
import { useQualityStore, type QualityTier } from '@/store/quality-store';

const PRESET_OPTIONS: { value: Exclude<QualityTier, 'custom'>; label: string }[] = [
  { value: 'low',    label: 'Low — Chromebooks / old laptops' },
  { value: 'medium', label: 'Medium — integrated GPUs' },
  { value: 'high',   label: 'High — gaming laptops / desktops' },
];

const SHADOW_TYPE_OPTIONS = [
  { value: 'off',      label: 'Off' },
  { value: 'basic',    label: 'Hard shadows (cheap)' },
  { value: 'pcf-soft', label: 'Soft shadows (expensive)' },
];

const SHADOW_RES_OPTIONS = [
  { value: '512',  label: '512 — fastest' },
  { value: '1024', label: '1024 — balanced' },
  { value: '2048', label: '2048 — sharp' },
];

const PIXEL_RATIO_OPTIONS = [
  { value: '1',   label: '1× — fastest' },
  { value: '1.5', label: '1.5× — balanced' },
  { value: '2',   label: '2× — retina' },
];

const BLUR_OPTIONS = [
  { value: 'none', label: 'Off — opaque panels' },
  { value: 'md',   label: 'Medium blur (12px)' },
  { value: 'xl',   label: 'Heavy blur (24px)' },
];

export function SettingsPanel() {
  const router = useRouter();
  const tier = useQualityStore((s) => s.tier);
  const userPicked = useQualityStore((s) => s.userPicked);
  const settings = useQualityStore((s) => s.settings);
  const setTier = useQualityStore((s) => s.setTier);
  const setSetting = useQualityStore((s) => s.setSetting);
  const resetToAutoDetected = useQualityStore((s) => s.resetToAutoDetected);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3">
      <PanelSection title="Project">
        <div className="space-y-2 mb-1">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Credits remaining</span>
            <span className="text-sm font-medium text-accent">2,450</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Classroom</span>
            <span className="text-xs text-gray-600">Not connected</span>
          </div>
        </div>
        <PanelToggle label="Auto-save" checked={true} onChange={() => {}} />
        <PanelToggle label="Show grid" checked={false} onChange={() => {}} description="on canvas" />
      </PanelSection>

      <PanelSection title="Performance — Preset" collapsible>
        <div className="space-y-3">
          <PanelSelect
            label="Quality"
            value={tier === 'custom' ? '' : tier}
            onChange={(v) => setTier(v as Exclude<QualityTier, 'custom'>)}
            options={PRESET_OPTIONS}
            placeholder={tier === 'custom' ? 'Custom' : 'Select preset…'}
            fullWidth
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-500">
              {tier === 'custom'
                ? 'Custom settings'
                : userPicked
                  ? 'Set by you'
                  : 'Auto-detected'}
            </span>
            {(userPicked || tier === 'custom') && (
              <button
                type="button"
                onClick={resetToAutoDetected}
                className="text-[11px] text-accent hover:underline"
              >
                Reset to auto
              </button>
            )}
          </div>
        </div>
      </PanelSection>

      <PanelSection title="Shadows" collapsible>
        <div className="space-y-3">
          <PanelToggle
            label="Shadows"
            checked={settings.shadows}
            onChange={(v) => {
              setSetting('shadows', v);
              // If shadows are flipped off, force type to 'off' for clarity.
              if (!v) setSetting('shadowType', 'off');
              else if (settings.shadowType === 'off') setSetting('shadowType', 'basic');
            }}
            description="Biggest perf cost — turn off on Chromebooks"
          />
          <PanelSelect
            label="Shadow type"
            value={settings.shadowType}
            onChange={(v) => {
              setSetting('shadowType', v as 'off' | 'basic' | 'pcf-soft');
              setSetting('shadows', v !== 'off');
            }}
            options={SHADOW_TYPE_OPTIONS}
            fullWidth
          />
          <PanelSelect
            label="Shadow resolution"
            value={String(settings.shadowMapSize)}
            onChange={(v) => setSetting('shadowMapSize', Number(v))}
            options={SHADOW_RES_OPTIONS}
            fullWidth
          />
        </div>
      </PanelSection>

      <PanelSection title="Rendering" collapsible>
        <div className="space-y-3">
          <PanelToggle
            label="Anti-aliasing"
            checked={settings.antialias}
            onChange={(v) => setSetting('antialias', v)}
            description="Smooths jagged edges (MSAA)"
          />
          <PanelSelect
            label="Resolution scale"
            value={String(settings.maxPixelRatio)}
            onChange={(v) => setSetting('maxPixelRatio', Number(v))}
            options={PIXEL_RATIO_OPTIONS}
            fullWidth
          />
          <PanelToggle
            label="PBR materials"
            checked={settings.pbrMaterials}
            onChange={(v) => setSetting('pbrMaterials', v)}
            description="Realistic roughness/metalness — off uses Lambert"
          />
          <PanelToggle
            label="Low-poly primitives"
            checked={settings.lowPolyPrimitives}
            onChange={(v) => setSetting('lowPolyPrimitives', v)}
            description="Fewer triangles per sphere/cylinder"
          />
        </div>
      </PanelSection>

      <PanelSection title="Interface" collapsible>
        <div className="space-y-3">
          <PanelSelect
            label="Panel blur"
            value={settings.backdropBlur}
            onChange={(v) => setSetting('backdropBlur', v as 'none' | 'md' | 'xl')}
            options={BLUR_OPTIONS}
            fullWidth
          />
          <PanelToggle
            label="UI transitions"
            checked={settings.uiTransitions}
            onChange={(v) => setSetting('uiTransitions', v)}
            description="Hover animations on nodes and lists"
          />
        </div>
      </PanelSection>

      <PanelSection title="Integrations" noBorder>
        <PanelActionButton
          onClick={() => router.push('/classroom')}
          variant="secondary"
          icon={GraduationCap}
          fullWidth
        >
          Open Google Classroom
        </PanelActionButton>
        <div className="mt-3">
          <PanelActionButton
            onClick={() => {}}
            variant="accent"
            icon={Zap}
            fullWidth
          >
            Buy More Credits
          </PanelActionButton>
        </div>
      </PanelSection>
    </div>
  );
}
