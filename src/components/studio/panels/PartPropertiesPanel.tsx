'use client';
import { Trash2 } from 'lucide-react';
import {
  PanelSection, PanelSlider, PanelSelect, PanelInput,
  PanelToggle, PanelActionButton, PanelColorSwatches,
} from '@/components/ui';
import type { ScenePart, TexturePreset, PartType } from '@/store/scene-store';
import { useBuildingStore } from '@/store/building-store';
import { TransformControls } from './TransformControls';

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
  { value: 'Studs',         label: 'Studs (Lego)' },
  { value: 'StudsSquare',   label: 'Studs (Square)' },
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
  Studs:         { roughness: 0.4,  metalness: 0 },
  StudsSquare:   { roughness: 0.4,  metalness: 0 },
};

interface Props {
  part: ScenePart;
  onUpdate: (changes: Partial<ScenePart>) => void;
  onDelete: () => void;
  /** True when the selection is a floor/wall/roof from the building-kit;
   *  surfaces global Level + Bend controls alongside the piece properties
   *  so the user can tweak placement without leaving the right panel. */
  showBuilding?: boolean;
  /** When true, skip the outer <aside> shell so this panel can be nested
   *  inside a shared right-panel wrapper (RightPanel.tsx). */
  headless?: boolean;
}

export function PartPropertiesPanel({ part, onUpdate, onDelete, showBuilding, headless }: Props) {
  const level = useBuildingStore((s) => s.level);
  const setLevel = useBuildingStore((s) => s.setLevel);
  const cornerBend = useBuildingStore((s) => s.cornerBend);
  const setCornerBend = useBuildingStore((s) => s.setCornerBend);

  function set<K extends keyof ScenePart>(key: K, value: ScenePart[K]) {
    onUpdate({ [key]: value } as Partial<ScenePart>);
  }

  function applyTexture(tex: TexturePreset) {
    const preset = TEXTURE_PRESETS[tex];
    onUpdate({ texture: tex, roughness: preset.roughness, metalness: preset.metalness });
  }

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

        {/* ── Building (global placement controls) ── */}
        {showBuilding && (
          <PanelSection title="Building" collapsible defaultOpen>
            <PanelSlider
              label="Level"
              value={level}
              onChange={(v) => setLevel(Math.max(0, Math.round(v)))}
              min={0} max={10} step={1} precision={0}
            />
            <PanelSlider
              label="Bend"
              value={cornerBend}
              onChange={setCornerBend}
              min={0} max={1} step={0.05} precision={2}
              suffix="m"
            />
          </PanelSection>
        )}

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
        <TransformControls
          position={part.position}
          rotation={part.rotation}
          scale={part.scale}
          onPositionChange={v => set('position', v)}
          onRotationChange={v => set('rotation', v)}
          onScaleChange={v => set('scale', v)}
        />

        {/* ── Appearance ── */}
        <PanelSection title="Appearance" collapsible defaultOpen>
          <PanelColorSwatches
            label="Color"
            value={part.color}
            onChange={v => set('color', v)}
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
          <PanelColorSwatches
            label="Emissive"
            value={part.emissiveColor}
            onChange={v => set('emissiveColor', v)}
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
      <footer
        className="shrink-0"
        style={{
          padding: 12,
          borderTop: '1.5px solid var(--pb-line-2)',
          background: 'var(--pb-paper)',
        }}
      >
        <PanelActionButton
          onClick={onDelete}
          variant="destructive"
          icon={Trash2}
          fullWidth
        >
          Delete Part
        </PanelActionButton>
      </footer>
    </Shell>
  );
}
