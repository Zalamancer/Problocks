'use client';

import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { PanelActionButton } from '@/components/ui/panel-controls/PanelActionButton';
import { getAllTemplates, recommendTemplate } from '@/lib/templates';
import type { TemplateId, OnboardingAnswers, GameGenre } from '@/lib/templates/types';
import { useProjectBoard } from '@/store/project-board-store';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OnboardingWizardProps {
  open: boolean;
  onComplete: (templateId: TemplateId) => void;
  onClose: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GENRES: { id: GameGenre; label: string; emoji: string }[] = [
  { id: 'platformer', label: 'Platformer', emoji: '🏃' },
  { id: 'rpg',        label: 'RPG',        emoji: '⚔️' },
  { id: 'puzzle',     label: 'Puzzle',     emoji: '🧩' },
  { id: 'shooter',    label: 'Shooter',    emoji: '🚀' },
  { id: 'other',      label: 'Other',      emoji: '🎮' },
];

const DURATIONS: { label: string; days: number }[] = [
  { label: '2 days',     days: 2   },
  { label: '1 week',     days: 7   },
  { label: '2 weeks',    days: 14  },
  { label: '1 month',    days: 30  },
  { label: '1 semester', days: 112 },
];

const TEAM_SIZES: { id: number; label: string; emoji: string; sub: string }[] = [
  { id: 1,  label: 'Solo',   emoji: '🧑',     sub: '1 person'  },
  { id: 2,  label: 'Small',  emoji: '👫',     sub: '2–3 people' },
  { id: 4,  label: 'Team',   emoji: '👥',     sub: '4–6 people' },
  { id: 7,  label: 'Studio', emoji: '🏢',     sub: '7+ people'  },
];

// ─── Subcomponents ────────────────────────────────────────────────────────────

function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className="transition-colors"
          style={{
            width: i === current ? 18 : 8,
            height: 8,
            borderRadius: 999,
            background: i === current ? 'var(--pb-ink)' : 'var(--pb-line-2)',
          }}
        />
      ))}
    </div>
  );
}

function SelectionCard({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer text-left transition-colors"
      style={{
        background: selected ? 'var(--pb-butter)' : 'var(--pb-paper)',
        border: `1.5px solid ${selected ? 'var(--pb-butter-ink)' : 'var(--pb-line-2)'}`,
        borderRadius: 14,
        padding: 16,
        boxShadow: selected ? '0 2px 0 var(--pb-butter-ink)' : 'none',
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = 'var(--pb-ink)';
          e.currentTarget.style.boxShadow = '0 2px 0 var(--pb-ink)';
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = 'var(--pb-line-2)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      {children}
    </button>
  );
}

// ─── Steps ────────────────────────────────────────────────────────────────────

function StepGenre({
  value,
  onChange,
}: {
  value: GameGenre | null;
  onChange: (v: GameGenre) => void;
}) {
  return (
    <div className="grid grid-cols-5 gap-3">
      {GENRES.map((g) => {
        const selected = value === g.id;
        return (
          <SelectionCard key={g.id} selected={selected} onClick={() => onChange(g.id)}>
            <div className="flex flex-col items-center gap-2 py-2">
              <span className="text-3xl leading-none">{g.emoji}</span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: selected ? 'var(--pb-butter-ink)' : 'var(--pb-ink)',
                }}
              >
                {g.label}
              </span>
            </div>
          </SelectionCard>
        );
      })}
    </div>
  );
}

function StepDuration({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-2">
      {DURATIONS.map((d) => {
        const selected = value === d.days;
        return (
          <button
            key={d.days}
            type="button"
            onClick={() => onChange(d.days)}
            className="flex-1 transition-colors"
            style={{
              padding: '12px 8px',
              borderRadius: 12,
              background: selected ? 'var(--pb-mint)' : 'var(--pb-paper)',
              color: selected ? 'var(--pb-mint-ink)' : 'var(--pb-ink)',
              border: `1.5px solid ${selected ? 'var(--pb-mint-ink)' : 'var(--pb-line-2)'}`,
              boxShadow: selected ? '0 2px 0 var(--pb-mint-ink)' : 'none',
              fontSize: 13,
              fontWeight: 700,
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!selected) {
                e.currentTarget.style.borderColor = 'var(--pb-ink)';
                e.currentTarget.style.boxShadow = '0 2px 0 var(--pb-ink)';
              }
            }}
            onMouseLeave={(e) => {
              if (!selected) {
                e.currentTarget.style.borderColor = 'var(--pb-line-2)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            {d.label}
          </button>
        );
      })}
    </div>
  );
}

function StepTeamSize({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {TEAM_SIZES.map((t) => {
        const selected = value === t.id;
        return (
          <SelectionCard key={t.id} selected={selected} onClick={() => onChange(t.id)}>
            <div className="flex flex-col items-center gap-2 py-2">
              <span className="text-3xl leading-none">{t.emoji}</span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: selected ? 'var(--pb-butter-ink)' : 'var(--pb-ink)',
                }}
              >
                {t.label}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: selected ? 'var(--pb-butter-ink)' : 'var(--pb-ink-muted)',
                  opacity: selected ? 0.75 : 1,
                }}
              >
                {t.sub}
              </span>
            </div>
          </SelectionCard>
        );
      })}
    </div>
  );
}

function StageDots({ total, filled }: { total: number; filled: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className="leading-none"
          style={{
            fontSize: 12,
            color: i < filled ? 'var(--pb-grape-ink)' : 'var(--pb-line-2)',
          }}
        >
          ●
        </span>
      ))}
    </div>
  );
}

function StepTemplatePicker({
  answers,
  onSelect,
}: {
  answers: OnboardingAnswers;
  onSelect: (id: TemplateId) => void;
}) {
  const recommendedId = recommendTemplate(answers);
  const templates = getAllTemplates();
  // Put recommended first
  const sorted = [
    ...templates.filter((t) => t.id === recommendedId),
    ...templates.filter((t) => t.id !== recommendedId),
  ];

  return (
    <div className="flex flex-col gap-3 max-h-[340px] overflow-y-auto pr-1">
      {sorted.map((t) => {
        const isRec = t.id === recommendedId;
        const stageCount = t.milestones.length;

        return (
          <div
            key={t.id}
            className="flex items-center gap-4 transition-colors"
            style={{
              padding: 16,
              borderRadius: 14,
              background: isRec ? 'var(--pb-butter)' : 'var(--pb-paper)',
              border: `1.5px solid ${isRec ? 'var(--pb-butter-ink)' : 'var(--pb-line-2)'}`,
              boxShadow: isRec ? '0 2px 0 var(--pb-butter-ink)' : 'none',
            }}
          >
            {/* Icon + info */}
            <div className="text-3xl leading-none flex-shrink-0">{t.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: isRec ? 'var(--pb-butter-ink)' : 'var(--pb-ink)',
                  }}
                >
                  {t.name}
                </span>
                {isRec && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '1px 8px',
                      borderRadius: 999,
                      background: 'var(--pb-paper)',
                      color: 'var(--pb-butter-ink)',
                      border: '1.5px solid var(--pb-butter-ink)',
                    }}
                  >
                    Recommended ✓
                  </span>
                )}
              </div>
              <p
                className="mb-1.5"
                style={{
                  fontSize: 12,
                  color: isRec ? 'var(--pb-butter-ink)' : 'var(--pb-ink-soft)',
                  opacity: isRec ? 0.85 : 1,
                }}
              >
                {t.tagline}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: isRec ? 'var(--pb-butter-ink)' : 'var(--pb-ink-muted)',
                    opacity: isRec ? 0.8 : 1,
                  }}
                >
                  {t.teamSize.min === t.teamSize.max
                    ? `${t.teamSize.min} person`
                    : `${t.teamSize.min}–${t.teamSize.max} people`}
                </span>
                <span style={{ color: 'var(--pb-ink-muted)' }}>·</span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: isRec ? 'var(--pb-butter-ink)' : 'var(--pb-ink-muted)',
                    opacity: isRec ? 0.8 : 1,
                  }}
                >
                  {t.duration.min}–{t.duration.max} {t.duration.unit}
                </span>
                <span style={{ color: 'var(--pb-ink-muted)' }}>·</span>
                <span
                  className="uppercase tracking-wide"
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    color: isRec ? 'var(--pb-butter-ink)' : 'var(--pb-ink-muted)',
                    opacity: isRec ? 0.8 : 1,
                  }}
                >
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
                variant={isRec ? 'primary' : 'secondary'}
                onClick={() => onSelect(t.id as TemplateId)}
                size="sm"
              >
                Select
              </PanelActionButton>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const STEP_TITLES = [
  'What kind of game are you making?',
  'How long do you have?',
  'How big is your team?',
  "Here's your recommended workflow",
];

export function OnboardingWizard({ open, onComplete, onClose }: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [genre, setGenre] = useState<GameGenre | null>(null);
  const [durationDays, setDurationDays] = useState<number | null>(null);
  const [teamSize, setTeamSize] = useState<number | null>(null);

  const { initBoard } = useProjectBoard();

  if (!open) return null;

  function handleGenre(v: GameGenre) {
    setGenre(v);
    setStep(1);
  }

  function handleDuration(v: number) {
    setDurationDays(v);
    setStep(2);
  }

  function handleTeamSize(v: number) {
    setTeamSize(v);
    setStep(3);
  }

  function handleSelect(templateId: TemplateId) {
    initBoard(templateId, crypto.randomUUID());
    onComplete(templateId);
  }

  const answers: OnboardingAnswers | null =
    genre && durationDays !== null && teamSize !== null
      ? { genre, durationDays, teamSize }
      : null;

  return (
    <div
      className="fixed inset-0 z-[var(--z-modal,60)] flex items-center justify-center"
      style={{ background: 'rgba(29,26,20,0.35)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-2xl p-8"
        style={{
          background: 'var(--pb-paper)',
          border: '1.5px solid var(--pb-ink)',
          borderRadius: 20,
          boxShadow: '0 4px 0 var(--pb-ink), 0 24px 48px rgba(29,26,20,0.18)',
        }}
      >
        {/* Step indicator */}
        <StepDots total={4} current={step} />

        {/* Header row */}
        <div className="flex items-center mb-6">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-1 transition-colors mr-3"
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--pb-ink-muted)',
                background: 'transparent',
                border: 0,
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--pb-ink)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--pb-ink-muted)'; }}
            >
              <ChevronLeft size={16} strokeWidth={2.4} />
              Back
            </button>
          ) : (
            <div className="w-16" />
          )}
          <h2
            className="flex-1 text-center"
            style={{ fontSize: 16, fontWeight: 800, color: 'var(--pb-ink)' }}
          >
            {STEP_TITLES[step]}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="transition-colors ml-3"
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--pb-ink-muted)',
              background: 'transparent',
              border: 0,
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--pb-ink)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--pb-ink-muted)'; }}
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
  );
}
