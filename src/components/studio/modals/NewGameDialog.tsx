'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useStudio, type GameSystem } from '@/store/studio-store';

// New Game dialog: two-step picker.
//   Step 0 — game world kind: 3D / 2D / topdown
//   Step 1 — only shown when 3D was picked: freeform / tile-based / lego
// The chosen value becomes `gameSystem` in the studio store, which in turn
// decides what the AssetsPanel renders (Models vs Parts vs placeholders).

type WorldKind = '3d' | '2d' | 'topdown';

interface KindOption {
  id: WorldKind;
  emoji: string;
  label: string;
  desc: string;
  // For kinds that don't have sub-choices, resolve directly to a game system.
  directSystem?: GameSystem;
}

interface SubKindOption {
  id: GameSystem;
  emoji: string;
  label: string;
  desc: string;
}

const KINDS: KindOption[] = [
  { id: '3d',      emoji: '🧊', label: '3D',       desc: 'Full 3D world you move around in.' },
  { id: '2d',      emoji: '🕹️', label: '2D',       desc: 'Side-view platformers and shooters.',   directSystem: '2d' },
  { id: 'topdown', emoji: '🗺️', label: 'Top-down', desc: 'Look-from-above tile maps and RPGs.',    directSystem: 'topdown' },
];

const THREE_D_SUBKINDS: SubKindOption[] = [
  { id: '3d-freeform', emoji: '🏔️', label: 'Freeform',   desc: 'Drop any model anywhere. Full transform freedom.' },
  { id: '3d-tile',     emoji: '🧩', label: 'Tile-based', desc: 'Snap walls, floors, and props to a grid.' },
  { id: '3d-lego',     emoji: '🧱', label: 'Lego',       desc: 'Stud-based bricks you click together.' },
];

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

function Card({
  emoji,
  label,
  desc,
  onClick,
}: {
  emoji: string;
  label: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer text-left transition-colors"
      style={{
        background: 'var(--pb-paper)',
        border: '1.5px solid var(--pb-line-2)',
        borderRadius: 14,
        padding: 18,
        boxShadow: 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--pb-butter)';
        e.currentTarget.style.borderColor = 'var(--pb-butter-ink)';
        e.currentTarget.style.boxShadow = '0 2px 0 var(--pb-butter-ink)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--pb-paper)';
        e.currentTarget.style.borderColor = 'var(--pb-line-2)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div className="flex flex-col items-center gap-2 py-2 text-center">
        <span className="text-4xl leading-none">{emoji}</span>
        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--pb-ink)' }}>
          {label}
        </span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--pb-ink-muted)',
            lineHeight: 1.35,
          }}
        >
          {desc}
        </span>
      </div>
    </button>
  );
}

export function NewGameDialog() {
  const open = useStudio((s) => s.newGameDialogOpen);
  const close = useStudio((s) => s.closeNewGameDialog);
  const setGameSystem = useStudio((s) => s.setGameSystem);
  const setActiveGameId = useStudio((s) => s.setActiveGameId);

  const [step, setStep] = useState(0);

  // Reset to step 0 each time the dialog opens so the user always starts
  // at the kind picker — otherwise reopening lands on the 3D sub-picker.
  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  if (!open) return null;

  function pickKind(k: KindOption) {
    if (k.directSystem) {
      setGameSystem(k.directSystem);
      setActiveGameId(null);
      close();
      return;
    }
    // 3D — go to sub-kind step
    setStep(1);
  }

  function pickSubKind(sys: GameSystem) {
    setGameSystem(sys);
    setActiveGameId(null);
    close();
  }

  const title = step === 0
    ? 'What kind of game are you making?'
    : 'Which 3D style?';

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
        <StepDots total={2} current={step} />

        <div className="flex items-center mb-6">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep(0)}
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
            {title}
          </h2>
          <button
            type="button"
            onClick={close}
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
            Cancel
          </button>
        </div>

        {step === 0 && (
          <div className="grid grid-cols-3 gap-3">
            {KINDS.map((k) => (
              <Card
                key={k.id}
                emoji={k.emoji}
                label={k.label}
                desc={k.desc}
                onClick={() => pickKind(k)}
              />
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="grid grid-cols-3 gap-3">
            {THREE_D_SUBKINDS.map((s) => (
              <Card
                key={s.id}
                emoji={s.emoji}
                label={s.label}
                desc={s.desc}
                onClick={() => pickSubKind(s.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
