'use client';

import { useState } from 'react';
import { Clock, UserCheck, ArrowRight } from 'lucide-react';
import { LiveHost } from '@/components/teach/LiveHost';

// /teach/quiz — teacher dashboard for running a live or self-paced
// quiz. This route is deliberately separate from /studio (the
// developer workspace). Teachers shouldn't have to wade through a
// node canvas + AI chat just to host a class quiz; they land here,
// pick pacing, and drive the room.

type Pacing = 'live' | 'self';
type Screen = 'picker' | 'host';

export default function TeachQuizPage() {
  const [screen, setScreen] = useState<Screen>('picker');
  const [pacing, setPacing] = useState<Pacing>('live');

  if (screen === 'host') {
    return (
      <div style={pageBg}>
        <LiveHost pacing={pacing} onExit={() => setScreen('picker')} />
      </div>
    );
  }

  return (
    <div style={pageBg}>
      <PacingPicker
        onPick={(p) => { setPacing(p); setScreen('host'); }}
      />
    </div>
  );
}

const pageBg = {
  width: '100%',
  minHeight: '100vh',
  background: 'var(--pb-cream, var(--pb-paper))',
} as const;

// --- Picker --------------------------------------------------------
//
// Lifted out of the studio's QuizView. Teachers will eventually land
// here from a classroom roster picker; for now it's a standalone
// "pick pacing" card so any teacher with the URL can open a room.

function PacingPicker({ onPick }: { onPick: (p: Pacing) => void }) {
  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        gap: 18,
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--pb-ink-muted)' }}>
        Teacher · new quiz room
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--pb-ink)', textAlign: 'center' }}>
        How do you want to run it?
      </div>
      <div style={{ fontSize: 13, color: 'var(--pb-ink-muted)', maxWidth: 460, textAlign: 'center', lineHeight: 1.5, marginTop: -6 }}>
        Open a room, share the join PIN with your class, and watch
        answers come in live. You can always bail out and pick a
        different mode.
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
          maxWidth: 760,
          width: '100%',
          marginTop: 10,
        }}
      >
        <PacingCard
          icon={<UserCheck size={16} strokeWidth={2.4} />}
          title="Live"
          subtitle="Host-driven"
          bullets={[
            'All students see the same question at once',
            'You advance with one tap per question',
            'Speed + streak bonuses based on shared clock',
          ]}
          onClick={() => onPick('live')}
        />
        <PacingCard
          icon={<Clock size={16} strokeWidth={2.4} />}
          title="Self-paced"
          subtitle="Student-driven"
          bullets={[
            'Students work through the FRQ at their own speed',
            'No "start" — join any time, leave any time',
            'Leaderboard ranks by accuracy + streak',
          ]}
          onClick={() => onPick('self')}
        />
      </div>
    </div>
  );
}

function PacingCard({
  icon,
  title,
  subtitle,
  bullets,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  bullets: string[];
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        textAlign: 'left',
        padding: 22,
        borderRadius: 20,
        background: 'var(--pb-paper)',
        border: '1.5px solid var(--pb-line-2)',
        boxShadow: '0 3px 0 var(--pb-line-2)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        color: 'var(--pb-ink)',
        minHeight: 220,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'var(--pb-cream-2)',
            border: '1.5px solid var(--pb-line-2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--pb-ink)',
          }}
        >
          {icon}
        </span>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 16, fontWeight: 800 }}>{title}</span>
          <span style={{ fontSize: 11, color: 'var(--pb-ink-muted)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {subtitle}
          </span>
        </div>
      </div>
      <ul style={{ margin: 0, padding: '0 0 0 18px', fontSize: 12.5, lineHeight: 1.6, color: 'var(--pb-ink-soft)' }}>
        {bullets.map((b) => (<li key={b}>{b}</li>))}
      </ul>
      <span
        style={{
          marginTop: 'auto',
          alignSelf: 'flex-end',
          fontSize: 12,
          fontWeight: 800,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          color: 'var(--pb-ink)',
        }}
      >
        Open room <ArrowRight size={12} strokeWidth={2.4} />
      </span>
    </button>
  );
}
