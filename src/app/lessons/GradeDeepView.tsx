'use client';

import { useState } from 'react';
import type { CurriculumSubject } from '@/lib/templates/data/curriculum';
import type { DeepGrade, DeepUnit, DeepLesson, PracticeQuestion } from '@/lib/templates/data/curriculum-deep';
import { Block, Pill, Icon } from '@/components/landing/pb-site/primitives';

type Tone = CurriculumSubject['tone'];

const QuestionRow = ({ question, tone, index }: { question: PracticeQuestion; tone: Tone; index: number }) => {
  const [shown, setShown] = useState(false);
  return (
    <div style={{
      padding: '12px 14px',
      borderRadius: 10,
      background: 'var(--pbs-cream-2)',
      border: '1.5px dashed var(--pbs-line-2)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{
          flex: '0 0 24px', height: 24, borderRadius: 6,
          background: 'var(--pbs-ink)', color: 'var(--pbs-cream)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11.5, fontWeight: 700,
        }}>Q{index + 1}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, color: 'var(--pbs-ink)', lineHeight: 1.5, fontWeight: 500 }}>
            {question.prompt}
          </div>
          {shown ? (
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: `var(--pbs-${tone}-ink)` }}>
                Answer: <span style={{ fontWeight: 600 }}>{question.answer}</span>
              </div>
              {question.explanation && (
                <div style={{ fontSize: 12.5, color: 'var(--pbs-ink-soft)', lineHeight: 1.5 }}>
                  {question.explanation}
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShown(true)}
              style={{
                marginTop: 8, padding: '4px 10px', borderRadius: 999,
                fontSize: 11.5, fontWeight: 600,
                background: `var(--pbs-${tone})`, color: `var(--pbs-${tone}-ink)`,
                border: `1.5px solid var(--pbs-${tone}-ink)`,
                cursor: 'pointer',
              }}
            >
              Show answer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const LessonBlock = ({ lesson, tone, index }: { lesson: DeepLesson; tone: Tone; index: number }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      borderTop: '1.5px dashed var(--pbs-line)',
    }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%', textAlign: 'left',
          display: 'flex', gap: 12, alignItems: 'flex-start',
          padding: '12px 16px',
          background: 'transparent', color: 'var(--pbs-ink)',
          cursor: 'pointer',
        }}
      >
        <div style={{
          flex: '0 0 28px', height: 28, borderRadius: 8,
          background: `var(--pbs-${tone})`, color: `var(--pbs-${tone}-ink)`,
          border: `1.5px solid var(--pbs-${tone}-ink)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700,
        }}>{index + 1}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--pbs-ink)', lineHeight: 1.35 }}>
            {lesson.name}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--pbs-ink-soft)', marginTop: 3, lineHeight: 1.5 }}>
            {lesson.description}
          </div>
        </div>
        <div style={{
          flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 11, fontWeight: 600, color: 'var(--pbs-ink-muted)',
          padding: '4px 8px', borderRadius: 999,
          background: 'var(--pbs-cream-2)', border: '1.5px solid var(--pbs-line-2)',
        }}>
          {lesson.questions.length}Q
          <span style={{ display: 'inline-flex', transform: `rotate(${open ? -90 : 90}deg)`, transition: 'transform 160ms' }}>
            <Icon name="chevron" size={12} stroke={2.2} />
          </span>
        </div>
      </button>
      {open && (
        <div style={{ padding: '0 16px 14px 56px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {lesson.questions.map((q, i) => (
            <QuestionRow key={i} question={q} tone={tone} index={i} />
          ))}
        </div>
      )}
    </div>
  );
};

const UnitBlock = ({ unit, tone, index }: { unit: DeepUnit; tone: Tone; index: number }) => {
  const [open, setOpen] = useState(index === 0);
  const totalQuestions = unit.lessons.reduce((s, l) => s + l.questions.length, 0);
  return (
    <Block tone="paper" style={{ padding: 0, overflow: 'hidden' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%', textAlign: 'left',
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '16px 20px',
          background: `var(--pbs-${tone})`, color: `var(--pbs-${tone}-ink)`,
          border: 'none', cursor: 'pointer',
          borderBottom: open ? `1.5px solid var(--pbs-${tone}-ink)` : 'none',
        }}
      >
        <div style={{
          flex: '0 0 36px', height: 36, borderRadius: 10,
          background: 'var(--pbs-paper)', color: `var(--pbs-${tone}-ink)`,
          border: `1.5px solid var(--pbs-${tone}-ink)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em',
        }}>{String(index + 1).padStart(2, '0')}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.2 }}>
            {unit.name}
          </div>
          <div style={{ fontSize: 12.5, marginTop: 3, opacity: 0.85, lineHeight: 1.4 }}>
            {unit.description}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '0 0 auto' }}>
          <Pill tone={tone} style={{ background: 'var(--pbs-paper)', fontSize: 11.5, padding: '4px 9px' }}>
            {unit.lessons.length} lessons · {totalQuestions}Q
          </Pill>
          <span style={{ display: 'inline-flex', transform: `rotate(${open ? -90 : 90}deg)`, transition: 'transform 160ms' }}>
            <Icon name="chevron" size={16} stroke={2.2} />
          </span>
        </div>
      </button>
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {unit.lessons.map((lesson, i) => (
            <LessonBlock key={lesson.name} lesson={lesson} tone={tone} index={i} />
          ))}
        </div>
      )}
    </Block>
  );
};

export const GradeDeepView = ({ grade, subject }: { grade: DeepGrade; subject: CurriculumSubject }) => {
  const totalLessons = grade.units.reduce((s, u) => s + u.lessons.length, 0);
  const totalQuestions = grade.units.reduce(
    (s, u) => s + u.lessons.reduce((ls, l) => ls + l.questions.length, 0),
    0,
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12, padding: '12px 18px', borderRadius: 14,
        background: `var(--pbs-${subject.tone})`,
        color: `var(--pbs-${subject.tone}-ink)`,
        border: `1.5px solid var(--pbs-${subject.tone}-ink)`,
      }}>
        <div>
          <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.8 }}>
            {subject.subject} · {grade.label}
          </div>
          <div style={{ fontSize: 13.5, marginTop: 2, opacity: 0.9 }}>
            {grade.units.length} units · {totalLessons} lessons · {totalQuestions} practice questions
          </div>
        </div>
        <a
          href={grade.sourceUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 12.5, fontWeight: 600,
            padding: '7px 12px', borderRadius: 999,
            background: 'var(--pbs-paper)', color: `var(--pbs-${subject.tone}-ink)`,
            border: `1.5px solid var(--pbs-${subject.tone}-ink)`,
            whiteSpace: 'nowrap',
          }}
        >
          Source <Icon name="arrow-right" size={12} stroke={2.2} />
        </a>
      </div>

      {grade.units.map((unit, i) => (
        <UnitBlock key={unit.name} unit={unit} tone={subject.tone} index={i} />
      ))}
    </div>
  );
};
