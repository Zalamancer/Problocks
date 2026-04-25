// Desktop homework view — two-column layout: apparatus + data + rubric total
// in the left rail, per-part accordion with rubric grading on the right.
// Ported from the design's desktop-homework.jsx.

'use client';

import { useEffect, useState } from 'react';
import { ApparatusViz } from './ApparatusViz';
import { DataTable } from './DataTable';
import { Icon } from './Icon';
import { MicroQuestion } from './MicroQuestion';
import { Pill } from './Pill';
import { gradeFRQ, isCorrect } from './useGrading';
import type { AnswersByPart, FRQ, Answer } from './types';

type HomeworkDesktopProps = {
  frq: FRQ;
  onExit?: () => void;
};

export function HomeworkDesktop({ frq, onExit }: HomeworkDesktopProps) {
  const [answers, setAnswers] = useState<AnswersByPart>({});
  const [graded, setGraded] = useState(false);
  const [expandedPart, setExpandedPart] = useState<string | null>('a');
  const [apparatusAngle, setApparatusAngle] = useState(20);

  const setAnswer = (partId: string, microId: string, value: Answer) => {
    setAnswers((a) => ({
      ...a,
      [partId]: { ...(a[partId] || {}), [microId]: value },
    }));
  };

  // Publish the current homework focus to a window global so the
  // right-rail tutor chat (TutorChatbot) can grab it without prop
  // drilling. The chat reads { partLabel, partText, microPrompts,
  // assignmentTitle } when the student asks for help.
  useEffect(() => {
    const part = frq.parts.find((p) => p.id === expandedPart);
    const w = window as Window & {
      __homeworkContext?: () => {
        assignmentTitle: string;
        partLabel: string;
        partText: string;
        microPrompts: string[];
      } | null;
    };
    w.__homeworkContext = () =>
      part
        ? {
            assignmentTitle: frq.source.title,
            partLabel: part.label,
            partText: part.apText,
            microPrompts: part.micros.map((m) => m.prompt),
          }
        : null;
    return () => {
      delete w.__homeworkContext;
    };
  }, [frq, expandedPart]);

  const { partScores, totalEarned, totalPossible } = gradeFRQ(frq, answers);
  const mono = 'var(--font-dm-mono), DM Mono, monospace';
  const serif = 'var(--font-instrument-serif), Instrument Serif, Georgia, serif';

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '380px 1fr',
        height: '100%',
        background: 'var(--pb-cream, #fdf6e6)',
      }}
    >
      {/* Left rail: apparatus + data */}
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
            <Pill tone="ink" icon="file">
              Homework
            </Pill>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--pb-ink-soft)' }}>
              {frq.source.exam} · {frq.source.year} · {frq.source.frq}
            </span>
          </div>
          <div
            style={{
              fontFamily: serif,
              fontSize: 28,
              lineHeight: 1.1,
              fontStyle: 'italic',
              marginTop: 4,
            }}
          >
            {frq.source.title}.
          </div>
          <div style={{ fontSize: 12, color: 'var(--pb-ink-soft)', marginTop: 6, lineHeight: 1.4 }}>
            {frq.experiment}
          </div>
        </div>

        <div
          style={{
            padding: 10,
            borderRadius: 12,
            background: 'var(--pb-cream, #fdf6e6)',
            border: '1.5px solid var(--pb-line-2)',
            boxShadow: '0 2px 0 var(--pb-line-2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Pill tone="sky" icon="cube">
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
              <span style={{ fontFamily: mono }}>{apparatusAngle}°</span>
            </div>
            <input
              type="range"
              min={10}
              max={30}
              step={5}
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
                fontFamily: mono,
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
            <div style={{ fontFamily: mono, fontSize: 28, fontWeight: 800, marginTop: 2 }}>
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
              padding: 11,
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
            <Icon name="wand" size={12} /> {graded ? 'Graded' : 'Grade with rubric'}
          </button>
          {onExit && (
            <button
              type="button"
              onClick={onExit}
              style={{
                padding: '0 14px',
                borderRadius: 11,
                background: 'var(--pb-paper)',
                border: '1.5px solid var(--pb-line-2)',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Back
            </button>
          )}
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
            <Pill tone="mint" icon="check">
              Rubric applied
            </Pill>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 720 }}>
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
                    border: 'none',
                    cursor: 'pointer',
                    color: 'inherit',
                    font: 'inherit',
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
                        fontFamily: serif,
                        fontSize: 13,
                        fontStyle: 'italic',
                        color: 'var(--pb-ink-soft)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      &ldquo;{p.apText.slice(0, 90)}…&rdquo;
                    </div>
                  </div>
                  {graded && (
                    <div
                      style={{
                        fontFamily: mono,
                        fontSize: 13,
                        fontWeight: 800,
                        color: tone,
                      }}
                    >
                      {score.earned.toFixed(1)}/{score.possible}
                    </div>
                  )}
                  <Icon
                    name="chevron-down"
                    size={15}
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
                      padding: '0 18px 18px',
                      borderTop: '1px dashed var(--pb-line-2)',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: serif,
                        fontSize: 14.5,
                        lineHeight: 1.5,
                        fontStyle: 'italic',
                        marginTop: 14,
                        padding: '10px 14px',
                        borderLeft: '3px solid var(--pb-coral-ink)',
                        background: 'var(--pb-cream-2)',
                        borderRadius: '0 10px 10px 0',
                      }}
                    >
                      &ldquo;{p.apText}&rdquo;
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 14,
                        marginTop: 14,
                      }}
                    >
                      {p.micros.map((m, i) => {
                        const a = answers[p.id]?.[m.id];
                        const answered = !!a;
                        const correct = answered && isCorrect(m, a);
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
                              partText={p.apText}
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
                                ✓ Recorded ·{' '}
                                {m.kind === 'number' && 'value' in a
                                  ? a.value
                                  : m.kind === 'whiteboard'
                                    ? 'drawing'
                                    : a.id}
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
        </div>
      </div>
    </div>
  );
}
