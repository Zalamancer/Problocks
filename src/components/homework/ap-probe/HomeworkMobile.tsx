// Mobile homework view — all parts stacked in a single scrolling column
// with a toggle-able apparatus preview at the top and a sticky grade button
// at the bottom. Ported from the design's homework.jsx.

'use client';

import { useState } from 'react';
import { ApparatusViz } from './ApparatusViz';
import { DataTable } from './DataTable';
import { Icon } from './Icon';
import { MicroQuestion } from './MicroQuestion';
import { Pill } from './Pill';
import { gradeFRQ, isCorrect } from './useGrading';
import type { AnswersByPart, FRQ, Answer } from './types';

type HomeworkMobileProps = {
  frq: FRQ;
  onExit?: () => void;
};

export function HomeworkMobile({ frq, onExit }: HomeworkMobileProps) {
  const [answers, setAnswers] = useState<AnswersByPart>({});
  const [graded, setGraded] = useState(false);
  const [showApparatus, setShowApparatus] = useState(true);
  const [expandedPart, setExpandedPart] = useState<string | null>('a');

  const setAnswer = (partId: string, microId: string, value: Answer) => {
    setAnswers((a) => ({
      ...a,
      [partId]: { ...(a[partId] || {}), [microId]: value },
    }));
  };

  const { partScores, totalEarned, totalPossible } = gradeFRQ(frq, answers);
  const mono = 'var(--font-dm-mono), DM Mono, monospace';
  const serif = 'var(--font-instrument-serif), Instrument Serif, Georgia, serif';

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--pb-cream, #fdf6e6)',
      }}
    >
      <header
        style={{
          padding: '46px 16px 12px',
          background: 'var(--pb-paper)',
          borderBottom: '1.5px solid var(--pb-line)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {onExit && (
            <button
              type="button"
              onClick={onExit}
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                border: '1.5px solid var(--pb-line-2)',
                background: 'var(--pb-cream-2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--pb-ink)',
              }}
            >
              <Icon name="chevron-left" size={13} />
            </button>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Pill tone="ink" icon="file">
                Homework
              </Pill>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--pb-ink-soft)' }}>
                {frq.source.exam} · {frq.source.year} · {frq.source.frq}
              </span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>
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
              border: `1.5px solid ${
                showApparatus ? 'var(--pb-sky-ink)' : 'var(--pb-line-2)'
              }`,
              color: showApparatus ? 'var(--pb-sky-ink)' : 'var(--pb-ink-soft)',
              fontSize: 10.5,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
            }}
          >
            <Icon name="cube" size={11} /> Apparatus
          </button>
        </div>
      </header>

      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '14px 14px 120px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
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
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '2px 4px 6px',
              }}
            >
              <Pill tone="sky" icon="cube">
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
          const scoreTone =
            score.earned === score.possible
              ? 'var(--pb-mint-ink)'
              : score.earned === 0
              ? 'var(--pb-coral-ink)'
              : 'var(--pb-butter-ink)';

          return (
            <div
              key={p.id}
              style={{
                borderRadius: 12,
                background: 'var(--pb-paper)',
                border: `1.5px solid ${graded ? scoreTone : 'var(--pb-line-2)'}`,
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
                  border: 'none',
                  cursor: 'pointer',
                  color: 'inherit',
                  font: 'inherit',
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
                    {p.apText.slice(0, 70)}…
                  </div>
                </div>
                {graded && (
                  <div
                    style={{
                      fontFamily: mono,
                      fontSize: 11,
                      fontWeight: 800,
                      color: scoreTone,
                    }}
                  >
                    {score.earned.toFixed(1)}/{score.possible}
                  </div>
                )}
                <Icon
                  name="chevron-down"
                  size={13}
                  style={{
                    color: 'var(--pb-ink-muted)',
                    transform: open ? 'rotate(180deg)' : 'none',
                    transition: 'transform .2s',
                  }}
                />
              </button>

              {open && (
                <div
                  style={{
                    padding: '0 12px 14px',
                    borderTop: '1px dashed var(--pb-line-2)',
                  }}
                >
                  <div
                    style={{
                      fontFamily: serif,
                      fontSize: 13,
                      lineHeight: 1.4,
                      fontStyle: 'italic',
                      marginTop: 10,
                      color: 'var(--pb-ink)',
                      padding: '8px 10px',
                      borderLeft: '3px solid var(--pb-coral-ink)',
                      background: 'var(--pb-cream-2)',
                      borderRadius: '0 8px 8px 0',
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
                      const correct = answered && isCorrect(m, a);
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
                            selected={a}
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
                              ✓ Recorded · {m.kind === 'number' && 'value' in a ? a.value : a.id}
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
                              </b>
                              {' — '}
                              {m.explain}
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
            <div style={{ fontFamily: mono, fontSize: 24, fontWeight: 800, marginTop: 2 }}>
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
            'linear-gradient(to top, var(--pb-cream, #fdf6e6) 60%, transparent)',
        }}
      >
        <button
          type="button"
          onClick={graded ? onExit : () => setGraded(true)}
          style={{
            width: '100%',
            padding: 12,
            borderRadius: 12,
            background: graded ? 'var(--pb-paper)' : 'var(--pb-ink)',
            color: graded ? 'var(--pb-ink)' : 'var(--pb-paper)',
            border: '1.5px solid var(--pb-ink)',
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
              <Icon name="check" size={12} stroke={3} /> Done
            </>
          ) : (
            <>
              <Icon name="wand" size={12} /> Grade with rubric
            </>
          )}
        </button>
      </div>
    </div>
  );
}
