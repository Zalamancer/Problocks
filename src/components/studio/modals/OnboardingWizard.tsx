'use client'

import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PanelActionButton } from '@/components/ui/panel-controls/PanelActionButton'
import { getAllTemplates, recommendTemplate } from '@/lib/templates'
import type { TemplateId, OnboardingAnswers, GameGenre } from '@/lib/templates/types'
import { useProjectBoard } from '@/store/project-board-store'

// ─── Types ────────────────────────────────────────────────────────────────────

interface OnboardingWizardProps {
  open: boolean
  onComplete: (templateId: TemplateId) => void
  onClose: () => void
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GENRES: { id: GameGenre; label: string; emoji: string }[] = [
  { id: 'platformer', label: 'Platformer', emoji: '🏃' },
  { id: 'rpg',        label: 'RPG',        emoji: '⚔️' },
  { id: 'puzzle',     label: 'Puzzle',     emoji: '🧩' },
  { id: 'shooter',    label: 'Shooter',    emoji: '🚀' },
  { id: 'other',      label: 'Other',      emoji: '🎮' },
]

const DURATIONS: { label: string; days: number }[] = [
  { label: '2 days',     days: 2   },
  { label: '1 week',     days: 7   },
  { label: '2 weeks',    days: 14  },
  { label: '1 month',    days: 30  },
  { label: '1 semester', days: 112 },
]

const TEAM_SIZES: { id: number; label: string; emoji: string; sub: string }[] = [
  { id: 1,  label: 'Solo',   emoji: '🧑',     sub: '1 person'  },
  { id: 2,  label: 'Small',  emoji: '👫',     sub: '2–3 people' },
  { id: 4,  label: 'Team',   emoji: '👥',     sub: '4–6 people' },
  { id: 7,  label: 'Studio', emoji: '🏢',     sub: '7+ people'  },
]

// ─── Subcomponents ────────────────────────────────────────────────────────────

function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            'w-1.5 h-1.5 rounded-full transition-colors',
            i === current ? 'bg-white' : 'bg-zinc-600',
          )}
        />
      ))}
    </div>
  )
}

function SelectionCard({
  selected,
  onClick,
  children,
  className,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'bg-zinc-800/60 border border-white/[0.06] rounded-xl p-4 cursor-pointer',
        'hover:border-white/20 hover:bg-zinc-800 transition-all text-left',
        selected && 'border-accent bg-accent/10',
        className,
      )}
    >
      {children}
    </button>
  )
}

// ─── Steps ────────────────────────────────────────────────────────────────────

function StepGenre({
  value,
  onChange,
}: {
  value: GameGenre | null
  onChange: (v: GameGenre) => void
}) {
  return (
    <div className="grid grid-cols-5 gap-3">
      {GENRES.map((g) => (
        <SelectionCard key={g.id} selected={value === g.id} onClick={() => onChange(g.id)}>
          <div className="flex flex-col items-center gap-2 py-2">
            <span className="text-3xl leading-none">{g.emoji}</span>
            <span className="text-sm font-medium text-zinc-200">{g.label}</span>
          </div>
        </SelectionCard>
      ))}
    </div>
  )
}

function StepDuration({
  value,
  onChange,
}: {
  value: number | null
  onChange: (v: number) => void
}) {
  return (
    <div className="flex gap-2">
      {DURATIONS.map((d) => (
        <button
          key={d.days}
          type="button"
          onClick={() => onChange(d.days)}
          className={cn(
            'flex-1 py-3 px-2 rounded-xl text-sm font-medium transition-all border',
            'border-white/[0.06] bg-zinc-800/60 text-zinc-400',
            'hover:bg-zinc-800 hover:border-white/20 hover:text-zinc-200',
            value === d.days && 'border-accent bg-accent/10 text-accent',
          )}
        >
          {d.label}
        </button>
      ))}
    </div>
  )
}

function StepTeamSize({
  value,
  onChange,
}: {
  value: number | null
  onChange: (v: number) => void
}) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {TEAM_SIZES.map((t) => (
        <SelectionCard key={t.id} selected={value === t.id} onClick={() => onChange(t.id)}>
          <div className="flex flex-col items-center gap-2 py-2">
            <span className="text-3xl leading-none">{t.emoji}</span>
            <span className="text-sm font-medium text-zinc-200">{t.label}</span>
            <span className="text-xs text-zinc-500">{t.sub}</span>
          </div>
        </SelectionCard>
      ))}
    </div>
  )
}

function StageDots({ total, filled }: { total: number; filled: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            'text-xs leading-none',
            i < filled ? 'text-accent' : 'text-zinc-600',
          )}
        >
          ●
        </span>
      ))}
    </div>
  )
}

function StepTemplatePicker({
  answers,
  onSelect,
}: {
  answers: OnboardingAnswers
  onSelect: (id: TemplateId) => void
}) {
  const recommendedId = recommendTemplate(answers)
  const templates = getAllTemplates()
  // Put recommended first
  const sorted = [
    ...templates.filter((t) => t.id === recommendedId),
    ...templates.filter((t) => t.id !== recommendedId),
  ]

  return (
    <div className="flex flex-col gap-3 max-h-[340px] overflow-y-auto pr-1">
      {sorted.map((t) => {
        const isRec = t.id === recommendedId
        const stageCount = t.milestones.length

        return (
          <div
            key={t.id}
            className={cn(
              'flex items-center gap-4 rounded-xl border p-4 transition-all',
              isRec
                ? 'border-accent/40 bg-accent/5'
                : 'border-white/[0.06] bg-zinc-800/40',
            )}
          >
            {/* Icon + info */}
            <div className="text-3xl leading-none flex-shrink-0">{t.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-semibold text-zinc-200">{t.name}</span>
                {isRec && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/30">
                    Recommended ✓
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mb-1.5">{t.tagline}</p>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[11px] text-zinc-500">
                  {t.teamSize.min === t.teamSize.max
                    ? `${t.teamSize.min} person`
                    : `${t.teamSize.min}–${t.teamSize.max} people`}
                </span>
                <span className="text-zinc-700">·</span>
                <span className="text-[11px] text-zinc-500">
                  {t.duration.min}–{t.duration.max} {t.duration.unit}
                </span>
                <span className="text-zinc-700">·</span>
                <span className="text-[11px] text-zinc-600 uppercase tracking-wide">
                  {t.methodology}
                </span>
              </div>
              <div className="mt-1.5">
                <StageDots total={Math.max(stageCount, 5)} filled={stageCount} />
              </div>
            </div>
            {/* Select button */}
            <div className="flex-shrink-0">
              <PanelActionButton
                variant="accent"
                onClick={() => onSelect(t.id as TemplateId)}
                size="sm"
              >
                Select
              </PanelActionButton>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

const STEP_TITLES = [
  'What kind of game are you making?',
  'How long do you have?',
  'How big is your team?',
  'Here\'s your recommended workflow',
]

export function OnboardingWizard({ open, onComplete, onClose }: OnboardingWizardProps) {
  const [step, setStep] = useState(0)
  const [genre, setGenre] = useState<GameGenre | null>(null)
  const [durationDays, setDurationDays] = useState<number | null>(null)
  const [teamSize, setTeamSize] = useState<number | null>(null)

  const { initBoard } = useProjectBoard()

  if (!open) return null

  function handleGenre(v: GameGenre) {
    setGenre(v)
    setStep(1)
  }

  function handleDuration(v: number) {
    setDurationDays(v)
    setStep(2)
  }

  function handleTeamSize(v: number) {
    setTeamSize(v)
    setStep(3)
  }

  function handleSelect(templateId: TemplateId) {
    initBoard(templateId, crypto.randomUUID())
    onComplete(templateId)
  }

  const answers: OnboardingAnswers | null =
    genre && durationDays !== null && teamSize !== null
      ? { genre, durationDays, teamSize }
      : null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[var(--z-modal,60)] flex items-center justify-center">
      <div className="bg-zinc-900 border border-white/[0.08] rounded-2xl w-full max-w-2xl p-8">
        {/* Step indicator */}
        <StepDots total={4} current={step} />

        {/* Header row */}
        <div className="flex items-center mb-6">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1 text-sm mr-3"
            >
              <ChevronLeft size={16} />
              Back
            </button>
          ) : (
            <div className="w-16" />
          )}
          <h2 className="flex-1 text-center text-base font-semibold text-zinc-200">
            {STEP_TITLES[step]}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-600 hover:text-zinc-400 transition-colors text-sm ml-3"
          >
            Skip
          </button>
        </div>

        {/* Step content */}
        {step === 0 && <StepGenre value={genre} onChange={handleGenre} />}
        {step === 1 && <StepDuration value={durationDays} onChange={handleDuration} />}
        {step === 2 && <StepTeamSize value={teamSize} onChange={handleTeamSize} />}
        {step === 3 && answers && (
          <StepTemplatePicker answers={answers} onSelect={handleSelect} />
        )}
      </div>
    </div>
  )
}
