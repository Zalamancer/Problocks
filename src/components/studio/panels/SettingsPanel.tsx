'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  Zap,
  FolderKanban,
  Gauge,
  Sun,
  Monitor,
  Sparkles,
  Plug,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  PanelToggle,
  PanelActionButton,
  PanelSelect,
} from '@/components/ui';
import { cn } from '@/lib/utils';
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

type SectionId =
  | 'project'
  | 'performance'
  | 'shadows'
  | 'rendering'
  | 'interface'
  | 'integrations';

interface SectionDef {
  id: SectionId;
  label: string;
  icon: LucideIcon;
  description: string;
}

const SECTIONS: SectionDef[] = [
  { id: 'project',      label: 'Project',      icon: FolderKanban, description: 'Game, credits, classroom' },
  { id: 'performance',  label: 'Performance',  icon: Gauge,        description: 'Quality preset' },
  { id: 'shadows',      label: 'Shadows',      icon: Sun,          description: 'Casting, resolution, softness' },
  { id: 'rendering',    label: 'Rendering',    icon: Monitor,      description: 'AA, pixel ratio, materials' },
  { id: 'interface',    label: 'Interface',    icon: Sparkles,     description: 'Blur, transitions' },
  { id: 'integrations', label: 'Integrations', icon: Plug,         description: 'Classroom, credits' },
];

export function SettingsPanel() {
  const [activeSection, setActiveSection] = useState<SectionId>('project');

  return (
    <div className="flex-1 min-h-0 flex overflow-hidden">
      {/* Left column — section list */}
      <aside className="w-[240px] shrink-0 border-r border-white/5 bg-zinc-900/40 overflow-y-auto">
        <div className="px-3 py-4">
          <div className="px-2 pb-2">
            <h2 className="text-sm font-semibold text-white">Settings</h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">Manage studio preferences</p>
          </div>
          <nav className="flex flex-col gap-0.5 mt-2">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              const active = section.id === activeSection;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    'flex items-start gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors',
                    active
                      ? 'bg-accent/10 text-accent'
                      : 'text-zinc-300 hover:bg-panel-surface hover:text-white',
                  )}
                >
                  <Icon
                    size={15}
                    className={cn('shrink-0 mt-0.5', active ? 'text-accent' : 'text-zinc-500')}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-medium leading-tight">{section.label}</div>
                    <div
                      className={cn(
                        'text-[11px] mt-0.5 truncate',
                        active ? 'text-accent/70' : 'text-zinc-500',
                      )}
                    >
                      {section.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Right column — selected section's content */}
      <section className="flex-1 min-w-0 overflow-y-auto">
        <SectionContent id={activeSection} />
      </section>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="px-6 pt-6 pb-4 border-b border-white/5">
      <h3 className="text-base font-semibold text-white">{title}</h3>
      {subtitle && <p className="text-xs text-zinc-500 mt-1">{subtitle}</p>}
    </header>
  );
}

function SectionContent({ id }: { id: SectionId }) {
  switch (id) {
    case 'project':      return <ProjectSection />;
    case 'performance':  return <PerformanceSection />;
    case 'shadows':      return <ShadowsSection />;
    case 'rendering':    return <RenderingSection />;
    case 'interface':    return <InterfaceSection />;
    case 'integrations': return <IntegrationsSection />;
  }
}

function ProjectSection() {
  return (
    <div className="flex flex-col">
      <SectionHeader title="Project" subtitle="Overview and editor defaults" />
      <div className="px-6 py-5 space-y-4 max-w-xl">
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-300">Credits remaining</span>
          <span className="text-sm font-medium text-accent">2,450</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-300">Classroom</span>
          <span className="text-xs text-zinc-500">Not connected</span>
        </div>
        <div className="pt-2 space-y-3">
          <PanelToggle label="Auto-save" checked={true} onChange={() => {}} />
          <PanelToggle label="Show grid" checked={false} onChange={() => {}} description="on canvas" />
        </div>
      </div>
    </div>
  );
}

function PerformanceSection() {
  const tier = useQualityStore((s) => s.tier);
  const userPicked = useQualityStore((s) => s.userPicked);
  const setTier = useQualityStore((s) => s.setTier);
  const resetToAutoDetected = useQualityStore((s) => s.resetToAutoDetected);

  return (
    <div className="flex flex-col">
      <SectionHeader
        title="Performance"
        subtitle="Pick a quality preset, or tune individual controls in the sections below."
      />
      <div className="px-6 py-5 space-y-4 max-w-xl">
        <PanelSelect
          label="Quality"
          value={tier === 'custom' ? '' : tier}
          onChange={(v) => setTier(v as Exclude<QualityTier, 'custom'>)}
          options={PRESET_OPTIONS}
          placeholder={tier === 'custom' ? 'Custom' : 'Select preset…'}
          fullWidth
        />
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-zinc-500">
            {tier === 'custom' ? 'Custom settings' : userPicked ? 'Set by you' : 'Auto-detected'}
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
    </div>
  );
}

function ShadowsSection() {
  const settings = useQualityStore((s) => s.settings);
  const setSetting = useQualityStore((s) => s.setSetting);

  return (
    <div className="flex flex-col">
      <SectionHeader title="Shadows" subtitle="Biggest perf cost — turn off on Chromebooks" />
      <div className="px-6 py-5 space-y-4 max-w-xl">
        <PanelToggle
          label="Shadows"
          checked={settings.shadows}
          onChange={(v) => {
            setSetting('shadows', v);
            if (!v) setSetting('shadowType', 'off');
            else if (settings.shadowType === 'off') setSetting('shadowType', 'basic');
          }}
          description="Master on/off switch"
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
    </div>
  );
}

function RenderingSection() {
  const settings = useQualityStore((s) => s.settings);
  const setSetting = useQualityStore((s) => s.setSetting);

  return (
    <div className="flex flex-col">
      <SectionHeader title="Rendering" subtitle="Pixel ratio, anti-aliasing, materials" />
      <div className="px-6 py-5 space-y-4 max-w-xl">
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
    </div>
  );
}

function InterfaceSection() {
  const settings = useQualityStore((s) => s.settings);
  const setSetting = useQualityStore((s) => s.setSetting);

  return (
    <div className="flex flex-col">
      <SectionHeader title="Interface" subtitle="Visual polish for the studio shell" />
      <div className="px-6 py-5 space-y-4 max-w-xl">
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
    </div>
  );
}

function IntegrationsSection() {
  const router = useRouter();
  return (
    <div className="flex flex-col">
      <SectionHeader title="Integrations" subtitle="External services and billing" />
      <div className="px-6 py-5 space-y-3 max-w-xl">
        <PanelActionButton
          onClick={() => router.push('/classroom')}
          variant="secondary"
          icon={GraduationCap}
          fullWidth
        >
          Open Google Classroom
        </PanelActionButton>
        <PanelActionButton
          onClick={() => {}}
          variant="accent"
          icon={Zap}
          fullWidth
        >
          Buy More Credits
        </PanelActionButton>
      </div>
    </div>
  );
}
