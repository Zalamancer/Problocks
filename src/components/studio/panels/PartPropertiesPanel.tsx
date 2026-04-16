'use client';
import { Trash2 } from 'lucide-react';
import {
  PanelSection, PanelSlider, PanelSelect, PanelInput,
  PanelToggle, PanelActionButton,
} from '@/components/ui';
import type { ScenePart, TexturePreset, PartType } from '@/store/scene-store';

const PART_TYPE_OPTIONS: { value: PartType; label: string }[] = [
  { value: 'Block',    label: 'Block' },
  { value: 'Sphere',   label: 'Sphere' },
  { value: 'Cylinder', label: 'Cylinder' },
  { value: 'Wedge',    label: 'Wedge' },
];

const TEXTURE_OPTIONS: { value: TexturePreset; label: string }[] = [
  { value: 'None',          label: 'None' },
  { value: 'SmoothPlastic', label: 'Smooth Plastic' },
  { value: 'Brick',         label: 'Brick' },
  { value: 'Wood',          label: 'Wood' },
  { value: 'Metal',         label: 'Metal' },
  { value: 'Marble',        label: 'Marble' },
  { value: 'Neon',          label: 'Neon' },
  { value: 'Diamond',       label: 'Diamond' },
];

const TEXTURE_PRESETS: Record<TexturePreset, { roughness: number; metalness: number }> = {
  None:          { roughness: 0.85, metalness: 0 },
  SmoothPlastic: { roughness: 0.2,  metalness: 0 },
  Brick:         { roughness: 0.95, metalness: 0 },
  Wood:          { roughness: 0.8,  metalness: 0 },
  Metal:         { roughness: 0.25, metalness: 0.85 },
  Marble:        { roughness: 0.15, metalness: 0.05 },
  Neon:          { roughness: 0.5,  metalness: 0 },
  Diamond:       { roughness: 0,    metalness: 0.9 },
};

interface Props {
  part: ScenePart;
  onUpdate: (changes: Partial<ScenePart>) => void;
  onDelete: () => void;
}

function Vec3Row({
  label, value, onChange, min, max, step, precision, suffix,
}: {
  label: string;
  value: { x: number; y: number; z: number };
  onChange: (v: { x: number; y: number; z: number }) => void;
  min: number; max: number; step: number; precision?: number; suffix?: string;
}) {
  return (
    <div className="space-y-1 mb-2">
      <span className="text-zinc-500 text-xs px-0.5">{label}</span>
      <div className="grid grid-cols-3 gap-1">
        {(['x', 'y', 'z'] as const).map(axis => (
          <PanelSlider
            key={axis}
            label={axis.toUpperCase()}
            value={value[axis]}
            onChange={v => onChange({ ...value, [axis]: v })}
            min={min} max={max} step={step}
            precision={precision ?? 2}
            suffix={suffix}
            compact
            inline
          />
        ))}
      </div>
    </div>
  );
}

export function PartPropertiesPanel({ part, onUpdate, onDelete }: Props) {
  function set<K extends keyof ScenePart>(key: K, value: ScenePart[K]) {
    onUpdate({ [key]: value } as Partial<ScenePart>);
  }

  function applyTexture(tex: TexturePreset) {
    const preset = TEXTURE_PRESETS[tex];
    onUpdate({ texture: tex, roughness: preset.roughness, metalness: preset.metalness });
  }

  return (
    <aside className="w-full md:w-[260px] flex flex-col bg-zinc-900/80 backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden shrink-0">
      {/* Header */}
      <div className="shrink-0 px-4 py-3 border-b border-white/[0.06] flex items-center gap-2">
        <div className="w-2 h-2 rounded-sm bg-cyan-400" />
        <span className="text-zinc-200 text-sm font-semibold truncate flex-1">{part.name}</span>
        <span className="text-zinc-600 text-xs">{part.partType}</span>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 min-h-0 overflow-y-auto">

        {/* ── Part ── */}
        <PanelSection title="Part" collapsible defaultOpen>
          <PanelInput
            label="Name"
            value={part.name}
            onChange={v => set('name', v)}
          />
          <PanelSelect
            label="Type"
            value={part.partType}
            onChange={v => set('partType', v as PartType)}
            options={PART_TYPE_OPTIONS}
          />
        </PanelSection>

        {/* ── Transform ── */}
        <PanelSection title="Position" collapsible defaultOpen>
          <Vec3Row
            label="Position"
            value={part.position}
            onChange={v => set('position', v)}
            min={-50} max={50} step={0.25} precision={2}
          />
        </PanelSection>

        <PanelSection title="Rotation" collapsible defaultOpen>
          <Vec3Row
            label="Rotation"
            value={part.rotation}
            onChange={v => set('rotation', v)}
            min={-180} max={180} step={1} precision={1} suffix="°"
          />
        </PanelSection>

        <PanelSection title="Size" collapsible defaultOpen>
          <Vec3Row
            label="Size"
            value={part.scale}
            onChange={v => set('scale', v)}
            min={0.05} max={40} step={0.1} precision={2}
          />
        </PanelSection>

        {/* ── Appearance ── */}
        <PanelSection title="Appearance" collapsible defaultOpen>
          <PanelInput
            label="Color"
            value={part.color}
            onChange={v => set('color', v)}
            type="color"
          />
          <PanelSelect
            label="Texture"
            value={part.texture}
            onChange={v => applyTexture(v as TexturePreset)}
            options={TEXTURE_OPTIONS}
          />
          <PanelSlider
            label="Roughness"
            value={part.roughness}
            onChange={v => set('roughness', v)}
            min={0} max={1} step={0.01} precision={2}
          />
          <PanelSlider
            label="Metalness"
            value={part.metalness}
            onChange={v => set('metalness', v)}
            min={0} max={1} step={0.01} precision={2}
          />
        </PanelSection>

        {/* ── Lighting ── */}
        <PanelSection title="Lighting" collapsible defaultOpen={false}>
          <PanelInput
            label="Emissive"
            value={part.emissiveColor}
            onChange={v => set('emissiveColor', v)}
            type="color"
          />
          <PanelSlider
            label="Intensity"
            value={part.emissiveIntensity}
            onChange={v => set('emissiveIntensity', v)}
            min={0} max={3} step={0.05} precision={2}
          />
          <PanelToggle
            label="Cast Shadow"
            checked={part.castShadow}
            onChange={v => set('castShadow', v)}
          />
        </PanelSection>

        {/* ── Behaviour ── */}
        <PanelSection title="Behaviour" collapsible defaultOpen={false} noBorder>
          <PanelToggle
            label="Anchored"
            checked={part.anchored}
            onChange={v => set('anchored', v)}
            description="won't move"
          />
          <PanelToggle
            label="Visible"
            checked={part.visible}
            onChange={v => set('visible', v)}
          />
        </PanelSection>
      </div>

      {/* Sticky footer */}
      <footer className="shrink-0 px-4 py-3 border-t border-white/[0.05]">
        <PanelActionButton
          onClick={onDelete}
          variant="destructive"
          icon={Trash2}
          fullWidth
        >
          Delete Part
        </PanelActionButton>
      </footer>
    </aside>
  );
}
