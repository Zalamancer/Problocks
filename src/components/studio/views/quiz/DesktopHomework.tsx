'use client';

import { useState } from 'react';
import { ChevronDown, Wand2, Box, FileText, Check } from 'lucide-react';
import type { Frq } from '@/lib/quiz/frq-content';
import { Pill } from '@/components/quiz/QuizAtoms';
import { ApparatusViz } from './Apparatus';
import { DataTable } from './DataTable';
import { MicroQuestion, type AnswerPayload } from './Micro';

type AnswerMap = Record<string, Record<string, AnswerPayload>>;

/**
 * Desktop homework view — two-column layout ported from the design
 * bundle's desktop-homework.jsx. Left rail holds the title card,
 * interactive apparatus preview (tilt slider), data table, rubric
 * total, and the grade button. Right column holds the collapsible
 * part cards with all micro-questions expanded inline.
 */
export function DesktopHomework({ frq, onExit }: { frq: Frq; onExit: () => void }) {
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [graded, setGraded] = useState(false);
  const [expandedPart, setExpandedPart] = useState<string | null>('a');
  const [apparatusAngle, setApparatusAngle] = useState(20);

  const setAnswer = (partId: string, microId: string, opt: AnswerPayload) => {
    setAnswers((a) => ({ ...a, [partId]: { ...(a[partId] || {}), [microId]: opt } }));
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
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '380px 1fr',
        height: '100%',
        background: 'var(--pb-cream, var(--pb-paper))',
      }}
    >
      {/* Left rail: apparatus + data + grade */}
      <div
        style={{
          padding: 20,
          borderRight: '1.5px solid var(--pb-line)',
          background: 'var(--pb-paper)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          overflow: 'auto',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Pill tone="ink" icon={<FileText size={11} strokeWidth={2.4} />}>
              Homework
            </Pill>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--pb-ink-soft)' }}>
              {frq.source.exam} · {frq.source.year} · {frq.source.frq}
            </span>
          </div>
          <div
            style={{
              fontSize: 28,
              lineHeight: 1.1,
              fontStyle: 'italic',
              marginTop: 4,
              color: 'var(--pb-ink)',
              fontFamily: 'Instrument Serif, Georgia, serif',
            }}
          >
            {frq.source.title}.
          </div>
          <div
            style={{
              fontSize: 12,
              color: 'var(--pb-ink-soft)',
              marginTop: 6,
              lineHeight: 1.4,
            }}
          >
            {frq.experiment}
          </div>
        </div>

        <div
          style={{
            padding: 10,
            borderRadius: 12,
            background: 'var(--pb-cream, var(--pb-paper))',
            border: '1.5px solid var(--pb-line-2)',
            boxShadow: '0 2px 0 var(--pb-line-2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Pill tone="sky" icon={<Box size={11} strokeWidth={2.4} />}>
              Apparatus
            </Pill>
            <span style={{ fontSize: 10, color: 'var(--pb-ink-muted)', fontWeight: 700 }}>
              Interactive
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ApparatusViz theta={apparatusAngle} />
          </div>
          <div style={{ marginTop: 4 }}>
            <div
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                color: 'var(--pb-ink-soft)',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>Tilt preview</span>
              <span style={{ fontFamily: 'DM Mono, ui-monospace, monospace' }}>
                {apparatusAngle}°
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="30"
              step="5"
              value={apparatusAngle}
              onChange={(e) => setApparatusAngle(+e.target.value)}
              style={{ width: '100%', accentColor: 'var(--pb-butter-ink)' }}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 9,
                color: 'var(--pb-ink-muted)',
                fontFamily: 'DM Mono, ui-monospace, monospace',
              }}
            >
              {[10, 15, 20, 25, 30].map((a) => (
                <span key={a}>{a}°</span>
              ))}
            </div>
          </div>
        </div>

        <DataTable table={frq.table} highlight={[]} />

        {graded && (
          <div
            style={{
              padding: 14,
              borderRadius: 12,
              background: 'var(--pb-butter)',
              border: '1.5px solid var(--pb-butter-ink)',
              boxShadow: '0 3px 0 var(--pb-butter-ink)',
              color: 'var(--pb-butter-ink)',
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                opacity: 0.7,
              }}
            >
              Rubric total
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 800,
                marginTop: 2,
                fontFamily: 'DM Mono, ui-monospace, monospace',
              }}
            >
              {totalEarned.toFixed(1)} / {totalPossible}
            </div>
            <div style={{ fontSize: 11, marginTop: 3 }}>
              {Math.round((100 * totalEarned) / totalPossible)}% · Partial credit awarded per
              micro-question
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => setGraded(true)}
            disabled={graded}
            style={{
              flex: 1,
              padding: '11px',
              borderRadius: 11,
              background: graded ? 'var(--pb-cream-2)' : 'var(--pb-ink)',
              color: graded ? 'var(--pb-ink-muted)' : 'var(--pb-paper)',
              border: '1.5px solid var(--pb-ink)',
              boxShadow: graded ? 'none' : '0 3px 0 var(--pb-ink)',
              fontSize: 12.5,
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              cursor: graded ? 'default' : 'pointer',
            }}
          >
            <Wand2 size={12} /> {graded ? 'Graded' : 'Grade with rubric'}
          </button>
          <button
            type="button"
            onClick={onExit}
            style={{
              padding: '0 14px',
              borderRadius: 11,
              background: 'var(--pb-paper)',
              color: 'var(--pb-ink)',
              border: '1.5px solid var(--pb-line-2)',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Back
          </button>
        </div>
      </div>

      {/* Right column: parts stack */}
      <div style={{ padding: 24, overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.12em',
              color: 'var(--pb-ink-muted)',
              textTransform: 'uppercase',
            }}
          >
            Free response · {frq.parts.length} parts
          </div>
          <div style={{ flex: 1, height: 1, background: 'var(--pb-line-2)' }} />
          {graded && (
            <Pill tone="mint" icon={<Check size={11} strokeWidth={2.4} />}>
              Rubric applied
            </Pill>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            maxWidth: 760,
          }}
        >
          {frq.parts.map((p) => {
            const open = expandedPart === p.id;
            const score = partScores.find((x) => x.p.id === p.id)!;
            const tone = graded
              ? score.earned === score.possible
                ? 'var(--pb-mint-ink)'
                : score.earned === 0
                ? 'var(--pb-coral-ink)'
                : 'var(--pb-butter-ink)'
              : 'var(--pb-line-2)';
            return (
              <div
                key={p.id}
                style={{
                  borderRadius: 14,
                  background: 'var(--pb-paper)',
                  border: `1.5px solid ${tone}`,
                  boxShadow: `0 2px 0 ${tone}`,
                  overflow: 'hidden',
                }}
              >
                <button
                  type="button"
                  onClick={() => setExpandedPart(open ? null : p.id)}
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    background: 'transparent',
                    border: 0,
                    color: 'var(--pb-ink)',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: 'var(--pb-butter)',
                      color: 'var(--pb-butter-ink)',
                      border: '1.5px solid var(--pb-butter-ink)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 800,
                    }}
                  >
                    {p.id.toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 800 }}>
                      {p.label} · {p.points} pt{p.points !== 1 ? 's' : ''}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontStyle: 'italic',
                        color: 'var(--pb-ink-soft)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontFamily: 'Instrument Serif, Georgia, serif',
                      }}
                    >
                      &ldquo;{p.apText.slice(0, 100)}…&rdquo;
                    </div>
                  </div>
                  {graded && (
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: tone,
                        fontFamily: 'DM Mono, ui-monospace, monospace',
                      }}
                    >
                      {score.earned.toFixed(1)}/{score.possible}
                    </div>
                  )}
                  <ChevronDown
                    size={15}
                    style={{
                      color: 'var(--pb-ink-muted)',
                      transform: open ? 'rotate(180deg)' : 'none',
                      transition: 'transform .2s',
                    }}
                  />
                </button>

                {open && (
                  <div style={{ padding: '0 18px 18px', borderTop: '1px dashed var(--pb-line-2)' }}>
                    <div
                      style={{
                        fontSize: 14.5,
                        lineHeight: 1.5,
                        fontStyle: 'italic',
                        marginTop: 14,
                        padding: '10px 14px',
                        borderLeft: '3px solid var(--pb-coral-ink)',
                        background: 'var(--pb-cream-2)',
                        borderRadius: '0 10px 10px 0',
                        color: 'var(--pb-ink)',
                        fontFamily: 'Instrument Serif, Georgia, serif',
                      }}
                    >
                      &ldquo;{p.apText}&rdquo;
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 14 }}>
                      {p.micros.map((m, i) => {
                        const a = answers[p.id]?.[m.id];
                        const answered = !!a;
                        const correct =
                          answered &&
                          (m.kind === 'number'
                            ? a.value != null && Math.abs(a.value - m.answer) <= m.tol
                            : a.correct);
                        return (
                          <div
                            key={m.id}
                            style={{
                              padding: 12,
                              borderRadius: 10,
                              background: 'var(--pb-cream-2)',
                              border: '1.5px solid var(--pb-line-2)',
                            }}
                          >
                            <div
                              style={{
                                fontSize: 10.5,
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
                                  marginTop: 8,
                                  padding: '8px 10px',
                                  borderRadius: 8,
                                  background: correct ? 'var(--pb-mint)' : 'var(--pb-coral)',
                                  border: `1px solid ${
                                    correct ? 'var(--pb-mint-ink)' : 'var(--pb-coral-ink)'
                                  }`,
                                  color: correct ? 'var(--pb-mint-ink)' : 'var(--pb-coral-ink)',
                                  fontSize: 11.5,
                                  fontWeight: 600,
                                  lineHeight: 1.4,
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
        </div>
      </div>
    </div>
  );
}
