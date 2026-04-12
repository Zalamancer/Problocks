'use client'

import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { Calendar, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Constants ────────────────────────────────────────────────────────────────

const DAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseValue(value: string | undefined): Date | null {
  if (!value) return null
  const iso = value.includes('T') ? value : `${value}T00:00`
  const d = new Date(iso)
  return isNaN(d.getTime()) ? null : d
}

function buildGrid(year: number, month: number) {
  const firstDay  = new Date(year, month, 1).getDay()
  const daysInMon = new Date(year, month + 1, 0).getDate()
  const daysInPrv = new Date(year, month, 0).getDate()

  const cells: { day: number; current: boolean }[] = []
  for (let i = firstDay - 1; i >= 0; i--)
    cells.push({ day: daysInPrv - i, current: false })
  for (let d = 1; d <= daysInMon; d++)
    cells.push({ day: d, current: true })
  while (cells.length % 7 !== 0)
    cells.push({ day: cells.length - daysInMon - firstDay + 1, current: false })
  return cells
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

interface SpinnerProps {
  display: string
  onUp: () => void
  onDown: () => void
}

function Spinner({ display, onUp, onDown }: SpinnerProps) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <button
        type="button"
        onClick={onUp}
        className="w-10 h-7 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors"
      >
        <ChevronUp size={15} />
      </button>
      <div className="w-12 h-11 flex items-center justify-center rounded-xl bg-zinc-800/80 border border-white/[0.06] text-2xl font-semibold text-zinc-100 select-none tabular-nums">
        {display}
      </div>
      <button
        type="button"
        onClick={onDown}
        className="w-10 h-7 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors"
      >
        <ChevronDown size={15} />
      </button>
    </div>
  )
}

// ─── DueDatePicker ────────────────────────────────────────────────────────────

export interface DueDatePickerProps {
  /** ISO value: "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm" */
  value?: string
  onChange: (value: string | undefined) => void
  className?: string
}

export function DueDatePicker({ value, onChange, className }: DueDatePickerProps) {
  const parsed = parseValue(value)
  const today  = new Date()

  const triggerRef = useRef<HTMLButtonElement>(null)

  // ── Popover state ──────────────────────────────────────────────────────────
  const [open, setOpen]   = useState(false)
  const [step, setStep]   = useState<'date' | 'time'>('date')
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({})
  const popupRef = useRef<HTMLDivElement>(null)

  // ── Calendar view ──────────────────────────────────────────────────────────
  const [viewYear,  setViewYear]  = useState(parsed?.getFullYear()  ?? today.getFullYear())
  const [viewMonth, setViewMonth] = useState(parsed?.getMonth()     ?? today.getMonth())

  // ── Staged date ────────────────────────────────────────────────────────────
  const [stagedY, setStagedY] = useState<number | null>(parsed?.getFullYear()  ?? null)
  const [stagedM, setStagedM] = useState<number | null>(parsed?.getMonth()     ?? null)
  const [stagedD, setStagedD] = useState<number | null>(parsed?.getDate()      ?? null)

  // ── Time state (12h) ───────────────────────────────────────────────────────
  const initH   = parsed ? parsed.getHours()   : 12
  const initMin = parsed ? parsed.getMinutes() : 0
  const [hour12, setHour12] = useState(initH === 0 ? 12 : initH > 12 ? initH - 12 : initH)
  const [minute, setMinute] = useState(Math.round(initMin / 5) * 5 % 60)
  const [ampm,   setAmpm  ] = useState<'AM' | 'PM'>(initH < 12 ? 'AM' : 'PM')

  // ── Position popup under the trigger (fixed, escapes overflow:hidden) ──────
  function calcPosition() {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const popupH = 340 // approximate max height
    const dropUp = spaceBelow < popupH && rect.top > spaceBelow
    setPopupStyle({
      position: 'fixed',
      left: rect.left,
      width: rect.width,
      zIndex: 999,
      ...(dropUp
        ? { bottom: window.innerHeight - rect.top + 4 }
        : { top: rect.bottom + 4 }),
    })
  }

  useLayoutEffect(() => {
    if (open) calcPosition()
  }, [open])

  useEffect(() => {
    if (!open) return
    const onScroll = () => calcPosition()
    window.addEventListener('scroll', onScroll, true)
    return () => window.removeEventListener('scroll', onScroll, true)
  }, [open])

  // ── Close on outside click ─────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      if (triggerRef.current?.contains(target)) return
      if (popupRef.current?.contains(target)) return
      setOpen(false)
      setStep('date')
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // ── Month nav ──────────────────────────────────────────────────────────────
  function prevMonth() {
    const d = new Date(viewYear, viewMonth - 1)
    setViewYear(d.getFullYear()); setViewMonth(d.getMonth())
  }
  function nextMonth() {
    const d = new Date(viewYear, viewMonth + 1)
    setViewYear(d.getFullYear()); setViewMonth(d.getMonth())
  }

  // ── Pick a day → go to time step ──────────────────────────────────────────
  function handleDayClick(day: number) {
    setStagedY(viewYear); setStagedM(viewMonth); setStagedD(day)
    setStep('time')
  }

  // ── Confirm time → emit value ──────────────────────────────────────────────
  function handleConfirm() {
    if (stagedY == null || stagedM == null || stagedD == null) return
    let h24 = hour12 % 12
    if (ampm === 'PM') h24 += 12
    const pad = (n: number) => String(n).padStart(2, '0')
    onChange(`${stagedY}-${pad(stagedM + 1)}-${pad(stagedD)}T${pad(h24)}:${pad(minute)}`)
    setOpen(false); setStep('date')
  }

  // ── Clear ──────────────────────────────────────────────────────────────────
  function handleClear(e: React.MouseEvent) {
    e.stopPropagation()
    onChange(undefined)
    setStagedY(null); setStagedM(null); setStagedD(null)
  }

  // ── Display text ───────────────────────────────────────────────────────────
  const displayDate = parsed
    ? `${MONTH_SHORT[parsed.getMonth()]} ${parsed.getDate()}, ${parsed.getFullYear()}`
    : null
  const displayTime = parsed && value?.includes('T')
    ? parsed.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
    : null
  const stagedLabel = (stagedY != null && stagedM != null && stagedD != null)
    ? new Date(stagedY, stagedM, stagedD)
        .toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
    : ''

  const grid = buildGrid(viewYear, viewMonth)

  // ── Popover content ────────────────────────────────────────────────────────
  const popover = open ? createPortal(
    <div
      ref={popupRef}
      style={popupStyle}
      className="bg-zinc-900 border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden"
    >
      {/* ── Step 1: Calendar ── */}
      {step === 'date' && (
        <div className="p-3">
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={prevMonth}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors">
              <ChevronLeft size={14} />
            </button>
            <span className="text-[13px] font-semibold text-zinc-200">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button type="button" onClick={nextMonth}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-1">
            {DAY_HEADERS.map(h => (
              <div key={h} className="text-center text-[10px] font-medium text-zinc-600 py-1">{h}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-0.5">
            {grid.map((cell, i) => {
              const isToday    = cell.current && cell.day === today.getDate()
                && viewMonth === today.getMonth() && viewYear === today.getFullYear()
              const isSelected = cell.current && stagedD === cell.day
                && stagedM === viewMonth && stagedY === viewYear
              return (
                <button key={i} type="button" disabled={!cell.current}
                  onClick={() => cell.current && handleDayClick(cell.day)}
                  className={cn(
                    'h-8 w-full flex items-center justify-center rounded-lg text-[13px] transition-colors',
                    !cell.current && 'text-zinc-700 pointer-events-none',
                    cell.current && !isSelected && 'text-zinc-300 hover:bg-zinc-800 cursor-pointer',
                    isToday && !isSelected && 'text-accent font-semibold',
                    isSelected && 'bg-accent text-white font-semibold',
                  )}>
                  {cell.day}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Step 2: Time ── */}
      {step === 'time' && (
        <div className="p-4">
          <div className="flex items-center gap-2 mb-5">
            <button type="button" onClick={() => setStep('date')}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors">
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs font-medium text-zinc-400">{stagedLabel}</span>
          </div>

          <div className="flex items-center justify-center gap-2 mb-5">
            <Spinner
              display={String(hour12)}
              onUp={() => setHour12(h => h === 12 ? 1 : h + 1)}
              onDown={() => setHour12(h => h === 1 ? 12 : h - 1)}
            />
            <span className="text-2xl font-bold text-zinc-600 pb-1 select-none">:</span>
            <Spinner
              display={String(minute).padStart(2, '0')}
              onUp={() => setMinute(m => (m + 5) % 60)}
              onDown={() => setMinute(m => (m - 5 + 60) % 60)}
            />
            <div className="flex flex-col gap-1 ml-1">
              {(['AM', 'PM'] as const).map(period => (
                <button key={period} type="button" onClick={() => setAmpm(period)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors',
                    ampm === period
                      ? 'bg-accent text-white'
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800',
                  )}>
                  {period}
                </button>
              ))}
            </div>
          </div>

          <button type="button" onClick={handleConfirm}
            className="w-full py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-semibold transition-colors">
            Set due date
          </button>
        </div>
      )}
    </div>,
    document.body,
  ) : null

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={cn('relative w-full', className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => { setOpen(o => !o); setStep('date') }}
        className={cn(
          'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left',
          'bg-panel-surface hover:bg-panel-surface-hover transition-colors',
          'focus:outline-none focus-visible:ring-1 focus-visible:ring-accent',
          open && 'ring-1 ring-accent/60',
        )}
      >
        <Calendar size={13} className="flex-shrink-0 text-zinc-500" />
        {displayDate ? (
          <span className="flex-1 text-sm text-zinc-200 leading-none">
            {displayDate}
            {displayTime && <span className="ml-2 text-zinc-500 text-xs">{displayTime}</span>}
          </span>
        ) : (
          <span className="flex-1 text-sm text-zinc-600">No due date</span>
        )}
        {value && (
          <span role="button" tabIndex={0} aria-label="Clear due date"
            onClick={handleClear}
            onKeyDown={(e) => e.key === 'Enter' && handleClear(e as unknown as React.MouseEvent)}
            className="flex-shrink-0 p-0.5 rounded text-zinc-600 hover:text-zinc-400 transition-colors">
            <X size={12} />
          </span>
        )}
      </button>

      {popover}
    </div>
  )
}
