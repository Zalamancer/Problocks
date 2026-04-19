'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronDown, Wand2, Check, Box, FileText } from 'lucide-react';
import type { Frq } from '@/lib/quiz/frq-content';
import { Pill } from './QuizAtoms';
import { ApparatusViz } from './Apparatus';
import { DataTable } from './DataTable';
import { MicroQuestion, type AnswerPayload } from './Micro';

type AnswerMap = Record<string, Record<string, AnswerPayload>>;

// Homework mode: all parts at once, collapsible, rubric-graded on
// demand. Ports the phone-frame layout from the design bundle but
// rendered full-bleed in the Problocks workspace instead of inside a
// phone chrome.
export function HomeworkMode({ frq, onExit }: { frq: Frq; onExit: () => void }) {
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [graded, setGraded] = useState(false);
  const [showApparatus, setShowApparatus] = useState(true);
  const [expandedPart, setExpandedPart] = useState<string | null>('a');

  const setAnswer = (partId: string, microId: string, opt: AnswerPayload) => {
    setAnswers((a) => ({
      ...a,
      [partId]: { ...(a[partId] || {}), [microId]: opt },
    }));
  };

  const partScores = frq.parts.map((p) => {
    const perMicro = p.points / p.micros.length;
    const earned = p.micros.reduce((acc, m) => {
      const a = answers[p.id]?.[m.id];
      if (!a) return acc;
      const correct =
        m.kind === 'number'
          ? a.value != null && Math.abs(a.value - m.answer) <= m.tol
          : a.correct;
      return acc + (correct ? perMicro : 0);
    }, 0);
    return { p, earned, possible: p.points };
  });
  const totalEarned = partScores.reduce((a, x) => a + x.earned, 0);
  const totalPossible = frq.parts.reduce((a, p) => a + p.points, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <div
        style={{
          padding: '14px 16px 12px',
          background: 'var(--pb-paper)',
          borderBottom: '1.5px solid var(--pb-line)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            onClick={onExit}
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              border: '1.5px solid var(--pb-line-2)',
              background: 'var(--pb-cream-2)',
              color: 'var(--pb-ink)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <ChevronLeft size={13} />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Pill tone="ink" icon={<FileText size={11} strokeWidth={2.4} />}>
                Homework
              </Pill>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--pb-ink-soft)' }}>
                {frq.source.exam} · {frq.source.year} · {frq.source.frq}
              </span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2, color: 'var(--pb-ink)' }}>
              {frq.source.title}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowApparatus((s) => !s)}
            style={{
              padding: '5px 9px',
              borderRadius: 8,
              background: showApparatus ? 'var(--pb-sky)' : 'var(--pb-paper)',
              border: `1.5px solid ${showApparatus ? 'var(--pb-sky-ink)' : 'var(--pb-line-2)'}`,
              color: showApparatus ? 'var(--pb-sky-ink)' : 'var(--pb-ink-soft)',
              fontSize: 10.5,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
            }}
          >
            <Box size={11} /> Apparatus
          </button>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '14px 14px 90px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          maxWidth: 820,
          width: '100%',
          margin: '0 auto',
        }}
      >
        {showApparatus && (
          <div
            style={{
              padding: 8,
              borderRadius: 12,
              background: 'var(--pb-paper)',
              border: '1.5px solid var(--pb-line-2)',
              boxShadow: '0 2px 0 var(--pb-line-2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '2px 4px 6px' }}>
              <Pill tone="sky" icon={<Box size={11} strokeWidth={2.4} />}>
                Apparatus
              </Pill>
              <span style={{ fontSize: 10, color: 'var(--pb-ink-muted)', fontWeight: 700 }}>
                On-demand
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <ApparatusViz theta={20} compact />
            </div>
            <div
              style={{
                fontSize: 10.5,
                color: 'var(--pb-ink-muted)',
                textAlign: 'center',
                marginTop: 4,
              }}
            >
              {frq.experiment}
            </div>
          </div>
        )}

        <DataTable table={frq.table} highlight={[]} compact />

        {frq.parts.map((p) => {
          const open = expandedPart === p.id;
          const score = partScores.find((x) => x.p.id === p.id)!;
          return (
            <div
              key={p.id}
              style={{
                borderRadius: 12,
                background: 'var(--pb-paper)',
                border: `1.5px solid ${
                  graded
                    ? score.earned === score.possible
                      ? 'var(--pb-mint-ink)'
                      : score.earned === 0
                      ? 'var(--pb-coral-ink)'
                      : 'var(--pb-butter-ink)'
                    : 'var(--pb-line-2)'
                }`,
                boxShadow: graded ? '0 2px 0 rgba(0,0,0,0.08)' : '0 2px 0 var(--pb-line-2)',
                overflow: 'hidden',
              }}
            >
              <button
                type="button"
                onClick={() => setExpandedPart(open ? null : p.id)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'transparent',
                  border: 0,
                  color: 'var(--pb-ink)',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 7,
                    background: 'var(--pb-cream-2)',
                    border: '1.5px solid var(--pb-line-2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 800,
                    color: 'var(--pb-ink-soft)',
                  }}
                >
                  {p.id.toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700 }}>
                    {p.label} · {p.points} pt{p.points !== 1 ? 's' : ''}
                  </div>
                  <div
                    style={{
                      fontSize: 10.5,
                      color: 'var(--pb-ink-muted)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {p.apText.slice(0, 80)}…
                  </div>
                </div>
                {graded && (
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      fontFamily: 'DM Mono, ui-monospace, monospace',
                      color:
                        score.earned === score.possible
                          ? 'var(--pb-mint-ink)'
                          : score.earned === 0
                          ? 'var(--pb-coral-ink)'
                          : 'var(--pb-butter-ink)',
                    }}
                  >
                    {score.earned.toFixed(1)}/{score.possible}
                  </div>
                )}
                <ChevronDown
                  size={13}
                  style={{
                    color: 'var(--pb-ink-muted)',
                    transform: open ? 'rotate(180deg)' : 'none',
                    transition: 'transform .2s',
                  }}
                />
              </button>

              {open && (
                <div style={{ padding: '0 12px 14px', borderTop: '1px dashed var(--pb-line-2)' }}>
                  <div
                    style={{
                      fontSize: 13,
                      lineHeight: 1.4,
                      fontStyle: 'italic',
                      marginTop: 10,
                      color: 'var(--pb-ink)',
                      padding: '8px 10px',
                      borderLeft: '3px solid var(--pb-coral-ink)',
                      background: 'var(--pb-cream-2)',
                      borderRadius: '0 8px 8px 0',
                      fontFamily: 'Instrument Serif, Georgia, serif',
                    }}
                  >
                    &ldquo;{p.apText}&rdquo;
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                      marginTop: 10,
                    }}
                  >
                    {p.micros.map((m, i) => {
                      const a = answers[p.id]?.[m.id];
                      const answered = !!a;
                      const correct =
                        answered &&
                        (m.kind === 'number'
                          ? a.value != null && Math.abs(a.value - m.answer) <= m.tol
                          : a.correct);
                      return (
                        <div key={m.id}>
                          <div
                            style={{
                              fontSize: 10,
                              fontWeight: 800,
                              letterSpacing: '0.1em',
                              textTransform: 'uppercase',
                              color: 'var(--pb-ink-muted)',
                              marginBottom: 4,
                            }}
                          >
                            Step {i + 1}
                          </div>
                          <MicroQuestion
                            micro={m}
                            answered={graded && answered}
                            selected={a ?? null}
                            onAnswer={(opt) => !graded && setAnswer(p.id, m.id, opt)}
                          />
                          {!graded && answered && (
                            <div
                              style={{
                                fontSize: 10.5,
                                color: 'var(--pb-ink-muted)',
                                marginTop: 4,
                              }}
                            >
                              ✓ Recorded · {m.kind === 'number' ? a.value : a.id}
                            </div>
                          )}
                          {graded && (
                            <div
                              style={{
                                marginTop: 6,
                                padding: '6px 9px',
                                borderRadius: 8,
                                background: correct ? 'var(--pb-mint)' : 'var(--pb-coral)',
                                border: `1px solid ${
                                  correct ? 'var(--pb-mint-ink)' : 'var(--pb-coral-ink)'
                                }`,
                                color: correct ? 'var(--pb-mint-ink)' : 'var(--pb-coral-ink)',
                                fontSize: 11,
                                fontWeight: 600,
                                lineHeight: 1.35,
                              }}
                            >
                              <b>
                                {correct ? '+' : '0'}
                                {(p.points / p.micros.length).toFixed(1)} pt
                              </b>{' '}
                              — {m.explain}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {graded && (
          <div
            style={{
              marginTop: 6,
              padding: 12,
              borderRadius: 12,
              background: 'var(--pb-butter)',
              border: '1.5px solid var(--pb-butter-ink)',
              boxShadow: '0 3px 0 var(--pb-butter-ink)',
              color: 'var(--pb-butter-ink)',
            }}
          >
            <div
              style={{
                fontSize: 10.5,
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                opacity: 0.7,
              }}
            >
              Rubric total
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 800,
                marginTop: 2,
                fontFamily: 'DM Mono, ui-monospace, monospace',
              }}
            >
              {totalEarned.toFixed(1)} / {totalPossible} pts
            </div>
            <div style={{ fontSize: 11, marginTop: 3 }}>
              {Math.round((100 * totalEarned) / totalPossible)}% · Partial credit awarded per
              micro-question.
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 14,
          background:
            'linear-gradient(to top, var(--pb-cream, var(--pb-paper)) 60%, transparent)',
        }}
      >
        <div style={{ maxWidth: 820, width: '100%', margin: '0 auto' }}>
          <button
            type="button"
            onClick={graded ? onExit : () => setGraded(true)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 12,
              background: graded ? 'var(--pb-paper)' : 'var(--pb-ink)',
              color: graded ? 'var(--pb-ink)' : 'var(--pb-paper)',
              border: `1.5px solid var(--pb-ink)`,
              boxShadow: '0 3px 0 var(--pb-ink)',
              fontSize: 13,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              cursor: 'pointer',
            }}
          >
            {graded ? (
              <>
                <Check size={12} strokeWidth={3} /> Done
              </>
            ) : (
              <>
                <Wand2 size={12} /> Grade with rubric
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
