'use client';

import { useState } from 'react';
import { Gamepad2, FileText, Radio } from 'lucide-react';
import { FRQ } from '@/lib/quiz/frq-content';
import {
  StartScreen,
  DrillPlay,
  ResultsScreen,
  type DrillState,
} from './quiz/DrillScreens';
import { DesktopHomework } from './quiz/DesktopHomework';
import { LiveHost } from './quiz/LiveHost';

type Screen = 'start' | 'drill' | 'results' | 'homework' | 'live';
type Mode = 'drill' | 'homework' | 'live';

/**
 * Quiz Mode — fourth game kind (alongside 3D/2D/Top-down). Three sub-
 * modes share the same FRQ content:
 *   Drill    — solo tap-through practice (centered card)
 *   Homework — solo full-rubric assignment (two-column desktop layout)
 *   Live     — Kahoot-style hosted session with a PIN students join
 *              from their own devices at /play/quiz/[pin]
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
    if (mode === 'live') {
      setScreen('live');
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

  // Homework and Live get the full viewport — both are wide desktop views.
  if (screen === 'homework') {
    return (
      <div style={fullBg}>
        <DesktopHomework frq={FRQ} onExit={() => setScreen('start')} />
      </div>
    );
  }
  if (screen === 'live') {
    return (
      <div style={fullBg}>
        <LiveHost pacing="live" onExit={() => setScreen('start')} />
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflow: 'auto',
        background:
          'radial-gradient(800px 500px at 85% -10%, rgba(255,234,189,0.28) 0%, transparent 60%),' +
          'radial-gradient(700px 400px at -10% 110%, rgba(215,233,255,0.28) 0%, transparent 55%),' +
          'var(--pb-cream, var(--pb-paper))',
      }}
    >
      <div
        style={{
          minHeight: '100%',
          padding: '24px 20px 36px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <ModeSwitcher
          mode={mode}
          onPick={(m) => {
            setMode(m);
            // Live jumps straight into the host screen; the other two
            // land on StartScreen so the student sees the briefing.
            setScreen(m === 'live' ? 'live' : 'start');
          }}
        />

        <div
          style={{
            width: '100%',
            maxWidth: 720,
            background: 'var(--pb-paper)',
            border: '1.5px solid var(--pb-line-2)',
            borderRadius: 20,
            boxShadow: '0 4px 0 var(--pb-line-2)',
            overflow: 'hidden',
            minHeight: 640,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {screen === 'start' && (
            <StartScreen
              source={FRQ.source}
              mode={mode === 'live' ? 'drill' : mode}
              onModeChange={(m) => setMode(m)}
              onStart={start}
            />
          )}
          {screen === 'drill' && state && (
            <DrillPlay
              frq={FRQ}
              state={state}
              setState={(updater) => setState((s) => (s ? updater(s) : s))}
              onFinish={finish}
              autoAdvance
              autoAdvanceSec={3}
            />
          )}
          {screen === 'results' && state && (
            <ResultsScreen frq={FRQ} state={state} onRestart={start} />
          )}
        </div>

        <Footnote />
      </div>
    </div>
  );
}

const fullBg = {
  width: '100%',
  height: '100%',
  background: 'var(--pb-cream, var(--pb-paper))',
} as const;

function ModeSwitcher({
  mode,
  onPick,
}: {
  mode: Mode;
  onPick: (m: Mode) => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '8px 14px',
        borderRadius: 999,
        background: 'var(--pb-paper)',
        border: '1.5px solid var(--pb-line-2)',
        boxShadow: '0 2px 0 var(--pb-line-2)',
        flexWrap: 'wrap',
        color: 'var(--pb-ink)',
      }}
    >
      <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '-0.01em' }}>
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
            { id: 'live' as const,     icon: Radio,    label: 'Live' },
          ]
        ).map(({ id, icon: Icon, label }) => {
          const on = mode === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onPick(id)}
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
