'use client';
import { PanelSlider } from '@/components/ui';

export type Vec3 = { x: number; y: number; z: number };

interface Props {
  position: Vec3;
  rotation: Vec3;
  scale: Vec3;
  onPositionChange: (v: Vec3) => void;
  onRotationChange: (v: Vec3) => void;
  onScaleChange: (v: Vec3) => void;
}

const POS_MIN = -50, POS_MAX = 50, POS_STEP = 0.25, POS_PREC = 2;
const ROT_MIN = -180, ROT_MAX = 180, ROT_STEP = 1, ROT_PREC = 1;
const SCL_MIN = 0.05, SCL_MAX = 40, SCL_STEP = 0.1, SCL_PREC = 2;

const formatDeg = (v: number) => `${v.toFixed(ROT_PREC)}°`;

function Row({
  label, value, onChange, min, max, step, precision, format,
}: {
  label: string;
  value: Vec3;
  onChange: (v: Vec3) => void;
  min: number; max: number; step: number; precision: number;
  format?: (v: number) => string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-gray-400 text-sm shrink-0 w-16">{label}</span>
      <div className="flex-1 flex gap-1.5">
        {(['x', 'y', 'z'] as const).map((axis) => (
          <PanelSlider
            key={axis}
            label=""
            value={value[axis]}
            onChange={(v) => onChange({ ...value, [axis]: v })}
            min={min}
            max={max}
            step={step}
            precision={precision}
            formatValue={format}
            inline
            className="flex-1"
          />
        ))}
      </div>
    </div>
  );
}

export function TransformControls({
  position, rotation, scale,
  onPositionChange, onRotationChange, onScaleChange,
}: Props) {
  return (
    <div className="flex flex-col gap-2">
      <Row
        label="Position"
        value={position}
        onChange={onPositionChange}
        min={POS_MIN} max={POS_MAX} step={POS_STEP} precision={POS_PREC}
      />
      <Row
        label="Rotation"
        value={rotation}
        onChange={onRotationChange}
        min={ROT_MIN} max={ROT_MAX} step={ROT_STEP} precision={ROT_PREC}
        format={formatDeg}
      />
      <Row
        label="Scale"
        value={scale}
        onChange={onScaleChange}
        min={SCL_MIN} max={SCL_MAX} step={SCL_STEP} precision={SCL_PREC}
      />
    </div>
  );
}
