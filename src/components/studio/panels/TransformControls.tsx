'use client';
import { useState } from 'react';
import { ChevronDown, ChevronRight, Eye, EyeOff, GripVertical, Link, Unlink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PanelSlider } from '@/components/ui';

export type Vec3 = { x: number; y: number; z: number };

export interface PartTransform3D {
  position: Vec3;
  rotation: Vec3;
  scale: Vec3;
  visible: boolean;
}

interface Props {
  label: string;
  transform: PartTransform3D;
  onChange: (t: Partial<PartTransform3D>) => void;
  /** Tailwind bg-* class for the color dot */
  color?: string;
  defaultExpanded?: boolean;
  draggable?: boolean;
  isDragOver?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

const POS_MIN = -50, POS_MAX = 50, POS_STEP = 0.25, POS_PREC = 2;
const ROT_MIN = -180, ROT_MAX = 180, ROT_STEP = 1, ROT_PREC = 1;
const SCL_MIN = 10, SCL_MAX = 500, SCL_STEP = 1, SCL_PREC = 0; // as %

export function TransformControls({
  label,
  transform,
  onChange,
  color = 'bg-accent',
  defaultExpanded = true,
  draggable = false,
  isDragOver = false,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [scaleLocked, setScaleLocked] = useState(true);

  const handleToggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({ visible: !transform.visible });
  };

  const setPos = (axis: keyof Vec3, v: number) =>
    onChange({ position: { ...transform.position, [axis]: v } });
  const setRot = (axis: keyof Vec3, v: number) =>
    onChange({ rotation: { ...transform.rotation, [axis]: v } });

  const setScale = (axis: keyof Vec3, pct: number) => {
    const val = pct / 100;
    if (!scaleLocked) {
      onChange({ scale: { ...transform.scale, [axis]: val } });
      return;
    }
    const current = transform.scale[axis];
    const ratio = current !== 0 ? val / current : 1;
    const clamp = (n: number) => Math.max(SCL_MIN / 100, Math.min(SCL_MAX / 100, n));
    onChange({
      scale: {
        x: axis === 'x' ? val : clamp(transform.scale.x * ratio),
        y: axis === 'y' ? val : clamp(transform.scale.y * ratio),
        z: axis === 'z' ? val : clamp(transform.scale.z * ratio),
      },
    });
  };

  return (
    <div
      className={cn(
        'rounded-lg overflow-hidden transition-colors border',
        isDragOver ? 'border-accent/60 bg-accent/5' : 'border-white/5',
      )}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2.5 bg-panel-surface hover:bg-panel-surface-hover transition-colors cursor-pointer select-none',
          !transform.visible && 'opacity-50',
        )}
      >
        {draggable && (
          <div
            draggable
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onClick={(e) => e.stopPropagation()}
            className="cursor-grab active:cursor-grabbing text-zinc-600 hover:text-zinc-400 transition-colors -ml-1 shrink-0"
          >
            <GripVertical size={14} />
          </div>
        )}
        {isExpanded ? (
          <ChevronDown size={14} className="text-zinc-500" />
        ) : (
          <ChevronRight size={14} className="text-zinc-500" />
        )}
        <div className={cn('w-2 h-2 rounded-full shrink-0', color)} />
        <span className="flex-1 text-xs font-medium text-gray-200 text-left">{label}</span>
        <button
          onClick={handleToggleVisibility}
          className={cn(
            'p-1 rounded transition-colors',
            transform.visible ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-600 hover:text-zinc-400',
          )}
        >
          {transform.visible ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className={cn('px-3 py-2.5', !transform.visible && 'opacity-50 pointer-events-none')}>
          {/* Position */}
          <div className="flex items-center gap-3 mb-1">
            <span className="text-gray-400 text-sm shrink-0 w-16">Position</span>
            <div className="flex-1 flex gap-1.5">
              {(['x', 'y', 'z'] as const).map((axis) => (
                <PanelSlider
                  key={axis}
                  label=""
                  value={transform.position[axis]}
                  onChange={(v) => setPos(axis, v)}
                  min={POS_MIN}
                  max={POS_MAX}
                  step={POS_STEP}
                  precision={POS_PREC}
                  inline
                  className="flex-1"
                />
              ))}
            </div>
          </div>

          {/* Scale */}
          <div className="flex items-center gap-3 mb-1">
            <span className="text-gray-400 text-sm shrink-0 w-16">Scale</span>
            <div className="flex-1 relative">
              <div className="flex gap-1.5">
                {(['x', 'y', 'z'] as const).map((axis) => (
                  <PanelSlider
                    key={axis}
                    label=""
                    value={Math.round(transform.scale[axis] * 100)}
                    onChange={(v) => setScale(axis, v)}
                    min={SCL_MIN}
                    max={SCL_MAX}
                    step={SCL_STEP}
                    precision={SCL_PREC}
                    suffix="%"
                    inline
                    className="flex-1"
                  />
                ))}
              </div>
              {/* Lock icon — floats centered over the row */}
              <button
                onClick={() => setScaleLocked(!scaleLocked)}
                className={cn(
                  'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-5 h-5 rounded-full border flex items-center justify-center transition-colors',
                  scaleLocked
                    ? 'text-accent bg-panel-surface border-accent/30'
                    : 'text-zinc-600 bg-panel-surface border-white/5 hover:text-zinc-400',
                )}
              >
                {scaleLocked ? <Link size={10} /> : <Unlink size={10} />}
              </button>
            </div>
          </div>

          {/* Rotation */}
          <div className="flex items-center gap-3 mb-1">
            <span className="text-gray-400 text-sm shrink-0 w-16">Rotation</span>
            <div className="flex-1 flex gap-1.5">
              {(['x', 'y', 'z'] as const).map((axis) => (
                <PanelSlider
                  key={axis}
                  label=""
                  value={transform.rotation[axis]}
                  onChange={(v) => setRot(axis, v)}
                  min={ROT_MIN}
                  max={ROT_MAX}
                  step={ROT_STEP}
                  precision={ROT_PREC}
                  suffix="°"
                  inline
                  className="flex-1"
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
