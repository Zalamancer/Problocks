'use client';
import { PanelSlider } from '@/components/ui';

export type Vec2 = { x: number; y: number };

interface Props {
  position: Vec2;
  rotation: number;
  size: Vec2;
  onPositionChange: (v: Vec2) => void;
  onRotationChange: (v: number) => void;
  onSizeChange: (v: Vec2) => void;
  posMin?: number;
  posMax?: number;
  sizeMin?: number;
  sizeMax?: number;
}

const POS_MIN_DEFAULT = -10000, POS_MAX_DEFAULT = 10000, POS_STEP = 1, POS_PREC = 0;
const ROT_MIN = -180, ROT_MAX = 180, ROT_STEP = 1, ROT_PREC = 0;
const SIZE_MIN_DEFAULT = 1, SIZE_MAX_DEFAULT = 2048, SIZE_STEP = 1, SIZE_PREC = 0;

const formatDeg = (v: number) => `${v.toFixed(ROT_PREC)}°`;
const formatPx = (v: number) => `${v.toFixed(0)}px`;

function Row({
  label, value, onChange, min, max, step, precision, format,
}: {
  label: string;
  value: Vec2;
  onChange: (v: Vec2) => void;
  min: number; max: number; step: number; precision: number;
  format?: (v: number) => string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-gray-400 text-sm shrink-0 w-16">{label}</span>
      <div className="flex-1 flex gap-1.5">
        {(['x', 'y'] as const).map((axis) => (
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

/**
 * 2D analogue of `./TransformControls` (Vec3 → Vec2). Same Row layout, same
 * inline-PanelSlider chrome, same row labels: Position / Rotation / Size.
 * Used by the 2D Tile object properties panel so its right-side surface
 * looks identical to the 3D Freeform one.
 */
export function TransformControls2D({
  position, rotation, size,
  onPositionChange, onRotationChange, onSizeChange,
  posMin = POS_MIN_DEFAULT, posMax = POS_MAX_DEFAULT,
  sizeMin = SIZE_MIN_DEFAULT, sizeMax = SIZE_MAX_DEFAULT,
}: Props) {
  return (
    <div className="flex flex-col gap-2">
      <Row
        label="Position"
        value={position}
        onChange={onPositionChange}
        min={posMin}
        max={posMax}
        step={POS_STEP}
        precision={POS_PREC}
      />

      <div className="flex items-center gap-3">
        <span className="text-gray-400 text-sm shrink-0 w-16">Rotation</span>
        <div className="flex-1 flex gap-1.5">
          <PanelSlider
            label=""
            value={rotation}
            onChange={onRotationChange}
            min={ROT_MIN}
            max={ROT_MAX}
            step={ROT_STEP}
            precision={ROT_PREC}
            formatValue={formatDeg}
            inline
            className="flex-1"
          />
        </div>
      </div>

      <Row
        label="Size"
        value={size}
        onChange={onSizeChange}
        min={sizeMin}
        max={sizeMax}
        step={SIZE_STEP}
        precision={SIZE_PREC}
        format={formatPx}
      />
    </div>
  );
}
