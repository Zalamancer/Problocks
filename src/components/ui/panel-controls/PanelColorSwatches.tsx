import { cn } from '@/lib/utils'
import { ColorPicker } from '@/components/ui'

const DEFAULT_COLORS = [
  '#ffffff',
  '#f87171',
  '#fb923c',
  '#facc15',
  '#4ade80',
  '#38bdf8',
  '#a78bfa',
  '#f472b6',
  '#000000',
  '#71717a',
]

interface PanelColorSwatchesProps {
  label?: string
  /** Preset colors shown inside the ColorPicker popover. */
  colors?: string[]
  value: string
  onChange: (color: string) => void
  className?: string
}

export function PanelColorSwatches({
  label,
  colors = DEFAULT_COLORS,
  value,
  onChange,
  className,
}: PanelColorSwatchesProps) {
  const trigger = <ColorPicker color={value} onChange={onChange} presets={colors} />

  if (!label) return <div className={cn('mb-3', className)}>{trigger}</div>

  return (
    <div className={cn('flex items-center gap-3 mb-3', className)}>
      <span className="text-gray-400 text-sm w-20 shrink-0">{label}</span>
      {trigger}
    </div>
  )
}
