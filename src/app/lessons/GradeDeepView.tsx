'use client';

import { useState } from 'react';
import type { CurriculumSubject } from '@/lib/templates/data/curriculum';
import type { DeepGrade, DeepUnit, DeepLesson, PracticeQuestion, KhanItem } from '@/lib/templates/data/curriculum-deep';
import { getOpenStaxBank } from '@/lib/templates/data/curriculum-deep';
import { Block, Pill, Icon } from '@/components/landing/pb-site/primitives';

type Tone = CurriculumSubject['tone'];

const TYPE_BADGES: Record<KhanItem['type'], { label: string; glyph: string; bg: string; fg: string }> = {
  exercise: { label: 'Practice', glyph: '✎', bg: 'var(--pbs-paper)', fg: 'var(--pbs-ink)' },
  video:    { label: 'Video',    glyph: '▶', bg: 'var(--pbs-paper)', fg: 'var(--pbs-ink-soft)' },
  article:  { label: 'Article',  glyph: '¶', bg: 'var(--pbs-paper)', fg: 'var(--pbs-ink-soft)' },
};

const QuestionRow = ({ question, tone, label }: { question: PracticeQuestion; tone: Tone; label?: string }) => {
  const [shown, setShown] = useState(false);
  return (
    <div style={{
      padding: '10px 12px',
      borderRadius: 10,
      background: 'var(--pbs-cream-2)',
      border: '1.5px dashed var(--pbs-line-2)',
    }}>
      {label && (
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--pbs-ink-muted)', marginBottom: 6 }}>
          Practice · {label}
        </div>
      )}
      <div style={{ fontSize: 14, color: 'var(--pbs-ink)', lineHeight: 1.5, fontWeight: 500 }}>
        {question.prompt}
      </div>
      {shown ? (
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 3 }}>
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
  );
};

const ItemRow = ({ item, tone }: { item: KhanItem; tone: Tone }) => {
  const [showQ, setShowQ] = useState(false);
  const badge = TYPE_BADGES[item.type];
  const href = item.href.startsWith('http') ? item.href : `https://www.khanacademy.org${item.href}`;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 12px', borderRadius: 10,
        background: 'var(--pbs-paper)', border: '1.5px solid var(--pbs-line-2)',
      }}>
        <span style={{
          flex: '0 0 54px', textAlign: 'center',
          fontSize: 10.5, fontWeight: 700, letterSpacing: '0.04em',
          padding: '3px 6px', borderRadius: 6,
          background: `var(--pbs-${tone})`, color: `var(--pbs-${tone}-ink)`,
          border: `1.5px solid var(--pbs-${tone}-ink)`,
          textTransform: 'uppercase',
        }}>
          <span style={{ marginRight: 3 }}>{badge.glyph}</span>{badge.label}
        </span>
        <a href={href} target="_blank" rel="noreferrer" style={{
          flex: 1, minWidth: 0,
          fontSize: 13.5, fontWeight: 600, color: 'var(--pbs-ink)',
          textDecoration: 'none',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {item.label}
        </a>
        {item.question && (
          <button
            type="button"
            onClick={() => setShowQ((v) => !v)}
            style={{
              flex: '0 0 auto', fontSize: 11.5, fontWeight: 700,
              padding: '4px 10px', borderRadius: 999,
              background: showQ ? `var(--pbs-${tone}-ink)` : 'transparent',
              color: showQ ? 'var(--pbs-cream)' : `var(--pbs-${tone}-ink)`,
              border: `1.5px solid var(--pbs-${tone}-ink)`,
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            {showQ ? 'Hide Q' : 'Practice'}
          </button>
        )}
        <a href={href} target="_blank" rel="noreferrer" title="Open on Khan Academy" style={{
          flex: '0 0 auto', display: 'inline-flex', alignItems: 'center',
          padding: 6, borderRadius: 8,
          color: 'var(--pbs-ink-soft)',
        }}>
          <Icon name="arrow-up-right" size={14} stroke={2.2} />
        </a>
      </div>
      {showQ && item.question && <QuestionRow question={item.question} tone={tone} label={item.label} />}
    </div>
  );
};

const LessonBlock = ({ lesson, tone, index }: { lesson: DeepLesson; tone: Tone; index: number }) => {
  const [open, setOpen] = useState(false);
  const items = lesson.items ?? [];
  const legacyQuestions = lesson.questions ?? [];
  const exerciseCount = items.filter((i) => i.type === 'exercise').length;
  const badgeText = items.length > 0
    ? `${items.length} items${exerciseCount ? ` · ${exerciseCount}Q` : ''}`
    : `${legacyQuestions.length}Q`;
  return (
    <div style={{ borderTop: '1.5px dashed var(--pbs-line)' }}>
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
          {lesson.description && (
            <div style={{ fontSize: 12.5, color: 'var(--pbs-ink-soft)', marginTop: 3, lineHeight: 1.5 }}>
              {lesson.description}
            </div>
          )}
        </div>
        <div style={{
          flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 11, fontWeight: 600, color: 'var(--pbs-ink-muted)',
          padding: '4px 8px', borderRadius: 999,
          background: 'var(--pbs-cream-2)', border: '1.5px solid var(--pbs-line-2)',
        }}>
          {badgeText}
          <span style={{ display: 'inline-flex', transform: `rotate(${open ? -90 : 90}deg)`, transition: 'transform 160ms' }}>
            <Icon name="chevron" size={12} stroke={2.2} />
          </span>
        </div>
      </button>
      {open && (
        <div style={{ padding: '0 16px 14px 56px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map((it, i) => (
            <ItemRow key={`${it.type}-${i}-${it.href}`} item={it} tone={tone} />
          ))}
          {items.length === 0 && legacyQuestions.map((q, i) => (
            <QuestionRow key={i} question={q} tone={tone} />
          ))}
        </div>
      )}
    </div>
  );
};

const UnitBlock = ({ unit, tone, index }: { unit: DeepUnit; tone: Tone; index: number }) => {
  const [open, setOpen] = useState(index === 0);
  const totalItems = unit.lessons.reduce((s, l) => s + (l.items?.length ?? 0), 0);
  const totalExerciseQs = unit.lessons.reduce((s, l) => s + (l.items?.filter((i) => i.question).length ?? 0), 0);
  const legacyQs = unit.lessons.reduce((s, l) => s + (l.questions?.length ?? 0), 0);
  const totalQs = totalExerciseQs + legacyQs;
  const badge = totalItems > 0
    ? `${unit.lessons.length} lessons · ${totalItems} items · ${totalQs}Q`
    : `${unit.lessons.length} lessons · ${totalQs}Q`;
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
          {unit.description && (
            <div style={{ fontSize: 12.5, marginTop: 3, opacity: 0.85, lineHeight: 1.4 }}>
              {unit.description}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '0 0 auto' }}>
          <Pill tone={tone} style={{ background: 'var(--pbs-paper)', fontSize: 11.5, padding: '4px 9px' }}>
            {badge}
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

const OpenStaxBankSection = ({ bank, tone }: { bank: PracticeQuestion[]; tone: Tone }) => {
  const [open, setOpen] = useState(false);
  if (bank.length === 0) return null;
  return (
    <Block tone="paper" style={{ padding: 0, overflow: 'hidden' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%', textAlign: 'left',
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '16px 20px',
          background: 'var(--pbs-cream-2)', color: 'var(--pbs-ink)',
          border: 'none', cursor: 'pointer',
          borderBottom: open ? '1.5px solid var(--pbs-line-2)' : 'none',
        }}
      >
        <div style={{
          flex: '0 0 36px', height: 36, borderRadius: 10,
          background: 'var(--pbs-paper)', color: 'var(--pbs-ink)',
          border: '1.5px solid var(--pbs-line-2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em',
        }}>OS</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.2 }}>
            OpenStax Practice Bank
          </div>
          <div style={{ fontSize: 12.5, marginTop: 3, color: 'var(--pbs-ink-soft)', lineHeight: 1.4 }}>
            Real exercises with answers from peer-reviewed OpenStax textbooks (CC BY 4.0).
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '0 0 auto' }}>
          <Pill tone={tone} style={{ background: 'var(--pbs-paper)', fontSize: 11.5, padding: '4px 9px' }}>
            {bank.length} real Qs
          </Pill>
          <span style={{ display: 'inline-flex', transform: `rotate(${open ? -90 : 90}deg)`, transition: 'transform 160ms' }}>
            <Icon name="chevron" size={16} stroke={2.2} />
          </span>
        </div>
      </button>
      {open && (
        <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {bank.map((q, i) => (
            <QuestionRow key={i} question={q} tone={tone} label={q.source} />
          ))}
        </div>
      )}
    </Block>
  );
};

export const GradeDeepView = ({ grade, subject }: { grade: DeepGrade; subject: CurriculumSubject }) => {
  const totalLessons = grade.units.reduce((s, u) => s + u.lessons.length, 0);
  const totalItems = grade.units.reduce((s, u) => s + u.lessons.reduce((a, l) => a + (l.items?.length ?? 0), 0), 0);
  const totalQs = grade.units.reduce((s, u) => s + u.lessons.reduce((a, l) => a
    + (l.items?.filter((i) => i.question).length ?? 0)
    + (l.questions?.length ?? 0)
  , 0), 0);
  const openstaxBank = getOpenStaxBank(subject.id, grade.grade);
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
            {grade.units.length} units · {totalLessons} lessons
            {totalItems > 0 && <> · {totalItems} items</>}
            {' · '}{totalQs} practice Qs
            {openstaxBank.length > 0 && <> · {openstaxBank.length} from OpenStax</>}
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
          Open on Khan <Icon name="arrow-up-right" size={12} stroke={2.2} />
        </a>
      </div>

      {openstaxBank.length > 0 && <OpenStaxBankSection bank={openstaxBank} tone={subject.tone} />}

      {grade.units.map((unit, i) => (
        <UnitBlock key={unit.name} unit={unit} tone={subject.tone} index={i} />
      ))}
    </div>
  );
};
