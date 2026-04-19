'use client';

import { useState } from 'react';
import { FRQ } from '@/lib/quiz/frq-content';
import { Gamepad2, FileText } from 'lucide-react';
import {
  StartScreen,
  DrillPlay,
  ResultsScreen,
  type DrillState,
} from './quiz/DrillScreens';
import { HomeworkMode } from './quiz/HomeworkMode';

type Screen = 'start' | 'drill' | 'results' | 'homework';
type Mode = 'drill' | 'homework';

/**
 * Quiz Mode — fourth game kind (alongside 3D/2D/Top-down). Replaces the
 * voxel / building canvases with a fully-deterministic AP Physics quiz
 * runner. Two surfaces share one content package:
 *
 *   - Drill: tap-through micro-questions, streak tracking, auto-advance.
 *   - Homework: full FRQ visible, rubric-graded on demand.
 *
 * Content lives entirely in `@/lib/quiz/frq-content` so swapping in a
 * different FRQ later is a single-file change.
 */
export function QuizView() {
  const [screen, setScreen] = useState<Screen>('start');
  const [mode, setMode] = useState<Mode>('drill');
  const [state, setState] = useState<DrillState | null>(null);

  function start() {
    if (mode === 'homework') {
      setScreen('homework');
      return;
    }
    setState({
      partIdx: 0,
      microIdx: 0,
      startedAt: Date.now(),
      elapsed: 0,
      results: [],
      streak: 0,
      maxStreak: 0,
      answered: false,
      selected: null,
    });
    setScreen('drill');
  }

  function finish(earlyExit?: boolean) {
    if (earlyExit) {
      setScreen('start');
      return;
    }
    setScreen('results');
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflow: 'auto',
        background:
          'radial-gradient(800px 500px at 85% -10%, rgba(255,234,189,0.35) 0%, transparent 60%),' +
          'radial-gradient(700px 400px at -10% 110%, rgba(215,233,255,0.35) 0%, transparent 55%),' +
          'var(--pb-cream, var(--pb-paper))',
      }}
    >
      <div
        style={{
          minHeight: '100%',
          padding: '20px 16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <ModeSwitcher mode={mode} setMode={setMode} onReset={() => setScreen('start')} />

        {screen === 'homework' ? (
          <div
            style={{
              width: '100%',
              maxWidth: 960,
              minHeight: 720,
              background: 'var(--pb-cream, var(--pb-paper))',
              borderRadius: 20,
              border: '1.5px solid var(--pb-line-2)',
              boxShadow: '0 4px 0 var(--pb-line-2)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <HomeworkMode frq={FRQ} onExit={() => setScreen('start')} />
          </div>
        ) : (
          <PhoneFrame>
            {screen === 'start' && (
              <StartScreen
                source={FRQ.source}
                mode={mode}
                onModeChange={setMode}
                onStart={start}
              />
            )}
            {screen === 'drill' && state && (
              <DrillPlay
                frq={FRQ}
                state={state}
                setState={(updater) =>
                  setState((s) => (s ? updater(s) : s))
                }
                onFinish={finish}
                autoAdvance
                autoAdvanceSec={3}
              />
            )}
            {screen === 'results' && state && (
              <ResultsScreen frq={FRQ} state={state} onRestart={start} />
            )}
          </PhoneFrame>
        )}

        <Footnote />
      </div>
    </div>
  );
}

function ModeSwitcher({
  mode,
  setMode,
  onReset,
}: {
  mode: Mode;
  setMode: (m: Mode) => void;
  onReset: () => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 14px',
        borderRadius: 999,
        background: 'var(--pb-paper)',
        border: '1.5px solid var(--pb-line-2)',
        boxShadow: '0 2px 0 var(--pb-line-2)',
        flexWrap: 'wrap',
        color: 'var(--pb-ink)',
      }}
    >
      <span
        style={{
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: '-0.01em',
        }}
      >
        AP Probe
      </span>
      <span
        style={{
          fontSize: 10,
          color: 'var(--pb-ink-muted)',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        AP, but tappable
      </span>

      <div
        style={{
          display: 'flex',
          gap: 4,
          padding: 3,
          borderRadius: 999,
          background: 'var(--pb-cream-2)',
          border: '1.5px solid var(--pb-line-2)',
        }}
      >
        {(
          [
            { id: 'drill' as const,    icon: Gamepad2, label: 'Drill' },
            { id: 'homework' as const, icon: FileText, label: 'Homework' },
          ]
        ).map(({ id, icon: Icon, label }) => {
          const on = mode === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                setMode(id);
                onReset();
              }}
              style={{
                padding: '4px 10px',
                borderRadius: 999,
                background: on ? 'var(--pb-ink)' : 'transparent',
                color: on ? 'var(--pb-paper)' : 'var(--pb-ink-soft)',
                fontSize: 11,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                border: 0,
                cursor: 'pointer',
              }}
            >
              <Icon size={10} strokeWidth={2.4} /> {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Tablet-ish frame that contains the drill screens. On desktop the quiz
// still feels "phone-like" so classroom-style pacing cues stay intact.
function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: 440,
        height: 820,
        maxWidth: '100%',
        padding: 10,
        borderRadius: 46,
        background: 'var(--pb-ink)',
        boxShadow: '0 12px 30px rgba(29,26,20,0.22), inset 0 0 0 2px #2b2822',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 110,
          height: 28,
          borderRadius: 20,
          background: '#000',
        }}
      />
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 38,
          overflow: 'hidden',
          background: 'var(--pb-cream, var(--pb-paper))',
          position: 'relative',
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Footnote() {
  return (
    <div
      style={{
        fontSize: 10.5,
        color: 'var(--pb-ink-muted)',
        letterSpacing: '0.04em',
        textAlign: 'center',
        maxWidth: 520,
        lineHeight: 1.5,
      }}
    >
      Question content adapted from a real AP Physics 1 FRQ (original wording, physics-accurate) ·
      The AI only picks parameters — it never generates physics or visuals.
    </div>
  );
}
