'use client'
import { useEffect, useState } from 'react'
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
  const safeValue = value ?? ''
  const [hexInput, setHexInput] = useState(() => safeValue.replace('#', '').slice(0, 6).toUpperCase())

  // Keep local input in sync with external value (e.g. swatch/picker click)
  useEffect(() => {
    setHexInput(safeValue.replace('#', '').slice(0, 6).toUpperCase())
  }, [safeValue])

  const commit = () => {
    const raw = hexInput.replace('#', '').trim()
    if (/^[0-9a-fA-F]{6}$/.test(raw)) {
      onChange('#' + raw.toLowerCase())
    } else {
      // revert display to last valid value
      setHexInput(safeValue.replace('#', '').slice(0, 6).toUpperCase())
    }
  }

  const hexField = (
    <div className="flex items-center gap-1 flex-1 min-w-0 bg-white/[0.03] rounded-md px-2 h-7">
      <span className="text-zinc-500 text-xs font-mono select-none">#</span>
      <input
        type="text"
        value={hexInput}
        onChange={(e) => setHexInput(e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6).toUpperCase())}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            commit()
            ;(e.target as HTMLInputElement).blur()
          }
        }}
        spellCheck={false}
        className="flex-1 min-w-0 bg-transparent text-zinc-200 text-xs font-mono outline-none"
      />
    </div>
  )

  const trigger = <ColorPicker color={safeValue || '#000000'} onChange={onChange} presets={colors} />

  if (!label) {
    return (
      <div className={cn('flex items-center gap-2 mb-3', className)}>
        {trigger}
        {hexField}
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-3 mb-3', className)}>
      <span className="text-gray-400 text-sm w-20 shrink-0">{label}</span>
      {trigger}
      {hexField}
    </div>
  )
}
