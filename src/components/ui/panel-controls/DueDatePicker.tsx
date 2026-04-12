import { useRef } from 'react'
import { Calendar, Clock, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DueDatePickerProps {
  /** ISO 8601 value — either "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm" */
  value?: string
  onChange: (value: string | undefined) => void
  className?: string
}

/**
 * Fully-clickable date + time picker.
 * Clicking anywhere on the row (not just the calendar icon) opens the native picker.
 */
export function DueDatePicker({ value, onChange, className }: DueDatePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  // Normalise stored value to datetime-local format (YYYY-MM-DDTHH:mm)
  const inputValue = value
    ? value.includes('T')
      ? value.slice(0, 16)           // already has time, trim seconds
      : `${value}T00:00`             // date-only → add midnight
    : ''

  // Format display text
  let displayDate = ''
  let displayTime = ''
  if (inputValue) {
    const dt = new Date(inputValue)
    if (!isNaN(dt.getTime())) {
      displayDate = dt.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
      displayTime = dt.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      })
    }
  }

  const handleTriggerClick = () => {
    inputRef.current?.showPicker()
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(undefined)
  }

  return (
    <div className={cn('relative w-full', className)}>
      {/* Hidden native input — positioned over the trigger so showPicker works */}
      <input
        ref={inputRef}
        type="datetime-local"
        value={inputValue}
        onChange={(e) => onChange(e.target.value || undefined)}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />

      {/* Clickable styled trigger */}
      <button
        type="button"
        onClick={handleTriggerClick}
        className={cn(
          'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left',
          'bg-panel-surface hover:bg-panel-surface-hover transition-colors',
          'focus:outline-none focus:ring-1 focus:ring-accent',
          'cursor-pointer',
        )}
      >
        <Calendar size={13} className="flex-shrink-0 text-zinc-500" />

        {displayDate ? (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-sm text-zinc-200 truncate">{displayDate}</span>
            <span className="flex items-center gap-1 text-xs text-zinc-500 flex-shrink-0">
              <Clock size={11} />
              {displayTime}
            </span>
          </div>
        ) : (
          <span className="text-sm text-zinc-600 flex-1">No due date</span>
        )}

        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="flex-shrink-0 text-zinc-600 hover:text-zinc-400 transition-colors focus:outline-none"
            aria-label="Clear due date"
          >
            <X size={13} />
          </button>
        )}
      </button>
    </div>
  )
}
