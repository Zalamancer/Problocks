'use client';
import { PanelSection, PanelSlider } from '@/components/ui';

export type Vec3 = { x: number; y: number; z: number };

interface Props {
  position: Vec3;
  rotation: Vec3;
  scale: Vec3;
  onPositionChange: (v: Vec3) => void;
  onRotationChange: (v: Vec3) => void;
  onScaleChange: (v: Vec3) => void;
}

function Vec3Row({
  value, onChange, min, max, step, precision, suffix,
}: {
  value: Vec3;
  onChange: (v: Vec3) => void;
  min: number; max: number; step: number; precision?: number; suffix?: string;
}) {
  return (
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
  );
}

export function TransformControls({
  position, rotation, scale,
  onPositionChange, onRotationChange, onScaleChange,
}: Props) {
  return (
    <>
      <PanelSection title="Position" collapsible defaultOpen>
        <Vec3Row
          value={position}
          onChange={onPositionChange}
          min={-50} max={50} step={0.25} precision={2}
        />
      </PanelSection>

      <PanelSection title="Rotation" collapsible defaultOpen>
        <Vec3Row
          value={rotation}
          onChange={onRotationChange}
          min={-180} max={180} step={1} precision={1} suffix="°"
        />
      </PanelSection>

      <PanelSection title="Size" collapsible defaultOpen>
        <Vec3Row
          value={scale}
          onChange={onScaleChange}
          min={0.05} max={40} step={0.1} precision={2}
        />
      </PanelSection>
    </>
  );
}
