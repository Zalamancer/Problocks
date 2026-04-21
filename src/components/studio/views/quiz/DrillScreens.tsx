'use client';

import { useEffect, useState } from 'react';
import {
  ChevronLeft,
  Play,
  ArrowRight,
  Gamepad2,
  FileText,
  RefreshCw,
  Share2,
  Check,
  X,
  Zap,
} from 'lucide-react';
import type { Frq } from '@/lib/quiz/frq-content';
import { Pill } from '@/components/quiz/QuizAtoms';
import { RealAPBriefing, ExperimentLine } from './Briefing';
import { DataTable } from './DataTable';
import { MicroQuestion, FeedbackCard, type AnswerPayload } from './Micro';

type Mode = 'drill' | 'homework';

interface ResultEntry {
  partId: string;
  microId: string;
  correct: boolean;
  option: string;
  value?: number;
}

export interface DrillState {
  partIdx: number;
  microIdx: number;
  startedAt: number;
  elapsed: number;
  results: ResultEntry[];
  streak: number;
  maxStreak: number;
  answered: boolean;
  selected: AnswerPayload | null;
}

export function StartScreen({
  source,
  onStart,
  mode,
  onModeChange,
}: {
  source: Frq['source'];
  onStart: () => void;
  mode: Mode;
  onModeChange: (m: Mode) => void;
}) {
  return (
    <div
      style={{
        padding: '22px 18px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: '0.14em',
          color: 'var(--pb-ink-muted)',
          textTransform: 'uppercase',
        }}
      >
        Physics · Unit 2 · Kinematics + forces
      </div>
      <div
        style={{
          fontSize: 34,
          lineHeight: 1.05,
          fontStyle: 'italic',
          marginTop: 6,
          fontFamily: 'Instrument Serif, Georgia, serif',
          color: 'var(--pb-ink)',
        }}
      >
        Cart on an
        <br />
        incline.
      </div>
      <div
        style={{
          fontSize: 13,
          color: 'var(--pb-ink-soft)',
          marginTop: 10,
          lineHeight: 1.45,
        }}
      >
        A real AP Physics 1 free-response question, broken into bite-sized steps. Tap through,
        build up the full derivation, learn the physics.
      </div>

      <div
        style={{
          marginTop: 16,
          padding: 12,
          borderRadius: 14,
          background: 'var(--pb-paper)',
          border: '1.5px solid var(--pb-ink)',
          boxShadow: '0 3px 0 var(--pb-ink)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Pill tone="coral">Real AP</Pill>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--pb-ink)' }}>Source</span>
        </div>
        <div style={{ fontSize: 13, marginTop: 8, fontWeight: 700, color: 'var(--pb-ink)' }}>
          {source.exam} · {source.year}
        </div>
        <div style={{ fontSize: 12, color: 'var(--pb-ink-muted)', marginTop: 2 }}>
          {source.frq} · {source.title} · {source.points} pts · 5 parts
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: '0.12em',
            color: 'var(--pb-ink-muted)',
            textTransform: 'uppercase',
            marginBottom: 6,
          }}
        >
          Mode
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { id: 'drill' as const,    icon: Gamepad2, title: 'Drill',    sub: 'Tap through · auto-advance' },
            { id: 'homework' as const, icon: FileText, title: 'Homework', sub: 'All parts · rubric grade' },
          ].map((m) => {
            const on = mode === m.id;
            const ModeIcon = m.icon;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onModeChange(m.id)}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 12,
                  textAlign: 'left',
                  background: on ? 'var(--pb-butter)' : 'var(--pb-paper)',
                  border: `1.5px solid ${on ? 'var(--pb-butter-ink)' : 'var(--pb-line-2)'}`,
                  boxShadow: on ? '0 2px 0 var(--pb-butter-ink)' : 'none',
                  color: on ? 'var(--pb-butter-ink)' : 'var(--pb-ink)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ModeIcon size={13} strokeWidth={2.4} />
                  <span style={{ fontSize: 13, fontWeight: 800 }}>{m.title}</span>
                </div>
                <div style={{ fontSize: 10.5, marginTop: 3, fontWeight: 600, opacity: 0.8 }}>
                  {m.sub}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ flex: 1 }} />
      <button
        type="button"
        onClick={onStart}
        style={{
          padding: '14px 16px',
          borderRadius: 14,
          background: 'var(--pb-ink)',
          color: 'var(--pb-paper)',
          border: '1.5px solid var(--pb-ink)',
          boxShadow: '0 3px 0 #000',
          fontSize: 15,
          fontWeight: 800,
          letterSpacing: '0.02em',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          cursor: 'pointer',
        }}
      >
        <Play size={13} strokeWidth={2.4} />
        Start {mode === 'homework' ? 'homework' : 'drill'}
        <ArrowRight size={13} strokeWidth={2.4} />
      </button>
    </div>
  );
}

function GameTopBar({
  source,
  partIdx,
  partsTotal,
  microIdx,
  microTotal,
  streak,
  timeLabel,
  onExit,
  mode,
}: {
  source: Frq['source'];
  partIdx: number;
  partsTotal: number;
  microIdx: number;
  microTotal: number;
  streak: number;
  timeLabel: string;
  onExit: () => void;
  mode: Mode;
}) {
  const overall = (partIdx + microIdx / Math.max(1, microTotal)) / partsTotal;
  const pct = Math.max(0, Math.min(1, overall));
  return (
    <div
      style={{
        padding: '18px 18px 14px',
        background: 'var(--pb-paper)',
        borderBottom: '1.5px solid var(--pb-line)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          type="button"
          onClick={onExit}
          style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            border: '1.5px solid var(--pb-line-2)',
            background: 'var(--pb-cream-2)',
            color: 'var(--pb-ink)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <ChevronLeft size={14} />
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'nowrap' }}>
            <Pill tone="ink" icon={<Zap size={11} strokeWidth={2.4} />}>
              {mode === 'homework' ? 'HW' : 'Drill'}
            </Pill>
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                color: 'var(--pb-ink-soft)',
                letterSpacing: '0.02em',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {source.exam} · {source.year}
            </span>
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              marginTop: 2,
              color: 'var(--pb-ink)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {source.title}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '6px 10px',
            borderRadius: 999,
            background: streak >= 3 ? 'var(--pb-butter)' : 'var(--pb-cream-2)',
            border: `1.5px solid ${streak >= 3 ? 'var(--pb-butter-ink)' : 'var(--pb-line-2)'}`,
            color: streak >= 3 ? 'var(--pb-butter-ink)' : 'var(--pb-ink-soft)',
            fontWeight: 800,
            fontSize: 12,
            boxShadow: streak >= 3 ? '0 2px 0 var(--pb-butter-ink)' : 'none',
          }}
        >
          <span style={{ fontSize: 13 }}>🔥</span>
          <span>{streak}</span>
        </div>
      </div>

      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            fontSize: 10.5,
            fontWeight: 800,
            color: 'var(--pb-ink-muted)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          Q {partIdx + 1}/{partsTotal}
        </div>
        <div
          style={{
            flex: 1,
            height: 7,
            borderRadius: 999,
            background: 'var(--pb-cream-2)',
            border: '1px solid var(--pb-line-2)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${pct * 100}%`,
              background: 'var(--pb-butter)',
              borderRight: pct < 1 ? '1.5px solid var(--pb-butter-ink)' : 'none',
              transition: 'width 0.4s cubic-bezier(.4,1.4,.6,1)',
            }}
          />
        </div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--pb-ink-muted)',
            fontFamily: 'DM Mono, ui-monospace, monospace',
          }}
        >
          {timeLabel}
        </div>
      </div>
    </div>
  );
}

const mmss = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

export function DrillPlay({
  frq,
  state,
  setState,
  onFinish,
  autoAdvance,
  autoAdvanceSec,
}: {
  frq: Frq;
  state: DrillState;
  setState: (updater: (s: DrillState) => DrillState) => void;
  onFinish: (earlyExit?: boolean) => void;
  autoAdvance: boolean;
  autoAdvanceSec: number;
}) {
  const { partIdx, microIdx, elapsed, streak, answered, selected } = state;
  const part = frq.parts[partIdx];
  const micro = part.micros[microIdx];

  const [countdown, setCountdown] = useState<number | null>(null);

  // Live elapsed-time ticker — updates twice per second so the clock
  // visibly moves while the student is working.
  useEffect(() => {
    const t = setInterval(
      () => setState((s) => ({ ...s, elapsed: Date.now() - s.startedAt })),
      500,
    );
    return () => clearInterval(t);
  }, [setState]);

  // Auto-advance: after an answer is given, count down and advance when
  // it hits zero. Aborts if the student is on the last question (advance
  // calls onFinish instead).
  useEffect(() => {
    if (!answered || !autoAdvance) return;
    setCountdown(autoAdvanceSec);
    const tick = setInterval(() => {
      setCountdown((c) => {
        if (c == null) return null;
        if (c <= 1) {
          clearInterval(tick);
          advance();
          return null;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answered, partIdx, microIdx]);

  function advance() {
    setCountdown(null);
    setState((s) => {
      const p = frq.parts[s.partIdx];
      const nextMicro = s.microIdx + 1;
      if (nextMicro < p.micros.length) {
        return { ...s, microIdx: nextMicro, answered: false, selected: null };
      }
      const nextPart = s.partIdx + 1;
      if (nextPart < frq.parts.length) {
        return { ...s, partIdx: nextPart, microIdx: 0, answered: false, selected: null };
      }
      setTimeout(() => onFinish(), 0);
      return s;
    });
  }

  function onAnswer(ans: AnswerPayload) {
    const correct = ans.correct;
    setState((s) => ({
      ...s,
      answered: true,
      selected: ans,
      streak: correct ? s.streak + 1 : 0,
      maxStreak: Math.max(s.maxStreak, correct ? s.streak + 1 : s.streak),
      results: [
        ...s.results,
        {
          partId: part.id,
          microId: micro.id,
          correct,
          option: ans.id,
          value: ans.value,
        },
      ],
    }));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <GameTopBar
        source={frq.source}
        partIdx={partIdx}
        partsTotal={frq.parts.length}
        microIdx={microIdx}
        microTotal={part.micros.length}
        streak={streak}
        timeLabel={mmss(elapsed)}
        onExit={() => onFinish(true)}
        mode="drill"
      />

      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '14px 16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <RealAPBriefing part={part} source={frq.source} />
        <ExperimentLine text={frq.experiment} />
        <DataTable table={frq.table} highlight={part.highlight} />

        <div
          style={{
            padding: 12,
            borderRadius: 12,
            background: 'var(--pb-cream-2)',
            border: '1.5px solid var(--pb-line-2)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 6,
            }}
          >
            <Pill tone="sky">
              Step {microIdx + 1}/{part.micros.length}
            </Pill>
            <span
              style={{
                fontSize: 10.5,
                color: 'var(--pb-ink-muted)',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              Micro-question
            </span>
          </div>
          <MicroQuestion
            micro={micro}
            answered={answered}
            selected={selected}
            onAnswer={onAnswer}
          />
          {answered && (
            <FeedbackCard
              correct={!!selected?.correct}
              explain={micro.explain}
              onNext={advance}
              countdown={countdown}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export function ResultsScreen({
  frq,
  state,
  onRestart,
}: {
  frq: Frq;
  state: DrillState;
  onRestart: () => void;
}) {
  const { results, elapsed, maxStreak } = state;
  const byPart = frq.parts.map((p) => {
    const items = p.micros.map((m) => {
      const r = results.find((x) => x.partId === p.id && x.microId === m.id);
      return { m, r };
    });
    const right = items.filter((i) => i.r?.correct).length;
    return { p, items, right, total: p.micros.length };
  });
  const totalRight = byPart.reduce((a, x) => a + x.right, 0);
  const totalAll = byPart.reduce((a, x) => a + x.total, 0);
  const mm = Math.floor(elapsed / 60000);
  const ss = Math.floor((elapsed % 60000) / 1000);

  return (
    <div style={{ padding: '22px 18px 18px', height: '100%', overflow: 'auto' }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: '0.14em',
          color: 'var(--pb-ink-muted)',
          textTransform: 'uppercase',
        }}
      >
        Drill complete
      </div>
      <div
        style={{
          fontSize: 38,
          lineHeight: 1.05,
          fontStyle: 'italic',
          marginTop: 4,
          fontFamily: 'Instrument Serif, Georgia, serif',
          color: 'var(--pb-ink)',
        }}
      >
        {totalRight} / {totalAll}
      </div>
      <div style={{ fontSize: 12, color: 'var(--pb-ink-soft)', marginTop: 4 }}>
        micro-questions correct on {frq.source.title}
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <Stat label="Time" value={`${mm}:${String(ss).padStart(2, '0')}`} tone="sky" />
        <Stat label="Max 🔥" value={String(maxStreak)} tone="butter" />
        <Stat label="Score" value={`${Math.round((100 * totalRight) / totalAll)}%`} tone="mint" />
      </div>

      <div style={{ marginTop: 18 }}>
        <div
          style={{
            fontSize: 10.5,
            fontWeight: 800,
            letterSpacing: '0.12em',
            color: 'var(--pb-ink-muted)',
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          By part
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {byPart.map(({ p, items, right, total }) => (
            <div
              key={p.id}
              style={{
                padding: 12,
                borderRadius: 12,
                background: 'var(--pb-paper)',
                border: '1.5px solid var(--pb-line-2)',
                boxShadow: '0 2px 0 var(--pb-line-2)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background:
                      right === total
                        ? 'var(--pb-mint)'
                        : right === 0
                        ? 'var(--pb-coral)'
                        : 'var(--pb-butter)',
                    border: `1.5px solid ${
                      right === total
                        ? 'var(--pb-mint-ink)'
                        : right === 0
                        ? 'var(--pb-coral-ink)'
                        : 'var(--pb-butter-ink)'
                    }`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 800,
                    color:
                      right === total
                        ? 'var(--pb-mint-ink)'
                        : right === 0
                        ? 'var(--pb-coral-ink)'
                        : 'var(--pb-butter-ink)',
                  }}
                >
                  {p.id.toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--pb-ink)' }}>
                    {p.label}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--pb-ink-muted)' }}>
                    {right}/{total} correct
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {items.map(({ m, r }) => (
                    <span
                      key={m.id}
                      title={m.prompt}
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 4,
                        background: r?.correct
                          ? 'var(--pb-mint-ink)'
                          : r
                          ? 'var(--pb-coral-ink)'
                          : 'var(--pb-line-2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--pb-paper)',
                      }}
                    >
                      {r?.correct ? (
                        <Check size={10} strokeWidth={3} />
                      ) : r ? (
                        <X size={9} strokeWidth={3} />
                      ) : null}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
        <button
          type="button"
          onClick={onRestart}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: 12,
            background: 'var(--pb-ink)',
            color: 'var(--pb-paper)',
            border: '1.5px solid var(--pb-ink)',
            boxShadow: '0 3px 0 #000',
            fontSize: 13,
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={12} /> Restart
        </button>
        <button
          type="button"
          style={{
            padding: '12px 14px',
            borderRadius: 12,
            background: 'var(--pb-paper)',
            color: 'var(--pb-ink)',
            border: '1.5px solid var(--pb-line-2)',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <Share2 size={12} />
        </button>
      </div>

      <div
        style={{
          marginTop: 14,
          padding: 10,
          borderRadius: 10,
          background: 'var(--pb-cream-2)',
          border: '1.5px dashed var(--pb-line-2)',
          fontSize: 10.5,
          color: 'var(--pb-ink-muted)',
          textAlign: 'center',
          lineHeight: 1.4,
        }}
      >
        Source: {frq.source.exam} · {frq.source.year} · {frq.source.frq} — &ldquo;
        {frq.source.title}&rdquo;
        <br />
        Adapted for Playdemy · content original
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'sky' | 'butter' | 'mint';
}) {
  return (
    <div
      style={{
        flex: 1,
        padding: '10px 12px',
        borderRadius: 11,
        background: `var(--pb-${tone})`,
        border: `1.5px solid var(--pb-${tone}-ink)`,
        color: `var(--pb-${tone}-ink)`,
        boxShadow: `0 2px 0 var(--pb-${tone}-ink)`,
      }}
    >
      <div
        style={{
          fontSize: 9.5,
          fontWeight: 800,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          opacity: 0.75,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 18,
          fontWeight: 800,
          marginTop: 2,
          fontFamily: 'DM Mono, ui-monospace, monospace',
        }}
      >
        {value}
      </div>
    </div>
  );
}
