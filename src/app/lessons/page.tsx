'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingWizard } from '@/components/studio/modals/OnboardingWizard';
import type { TemplateId } from '@/lib/templates/types';

import { Nav } from '@/components/landing/pb-learn/Nav';
import { Footer } from '@/components/landing/pb-learn/Footer';
import { Block, Pill, Section, Icon, Chunky } from '@/components/landing/pb-site/primitives';
import { CURRICULUM, TOTAL_UNIT_COUNT, type CurriculumGrade, type CurriculumSubject } from '@/lib/templates/data/curriculum';

import '@/components/landing/pb-site/styles.css';

const PALETTES = {
  cream: { bg: '#fdf6e6', paper: '#fffaf0', cream2: '#f7edd4', line: '#e8dcbc', line2: '#d6c896', ink: '#1d1a14', inkSoft: '#57524a', inkMuted: '#8a8478' },
  mint:  { bg: '#eef7f1', paper: '#f9fdfb', cream2: '#d9eee1', line: '#cfe4d6', line2: '#b2d4be', ink: '#10241b', inkSoft: '#3a564b', inkMuted: '#6f887e' },
  sky:   { bg: '#eaf2fb', paper: '#f6fafe', cream2: '#d5e7f7', line: '#c4dcf0', line2: '#a4c3db', ink: '#102134', inkSoft: '#3e5569', inkMuted: '#6c849a' },
  rose:  { bg: '#fdeef2', paper: '#fff6f8', cream2: '#f7d9e1', line: '#ebccd3', line2: '#d8a7b2', ink: '#26141a', inkSoft: '#5a3c44', inkMuted: '#896b73' },
} as const;

type PaletteKey = keyof typeof PALETTES;

function paletteVars(key: PaletteKey): CSSProperties {
  const p = PALETTES[key];
  return {
    '--pbs-cream':     p.bg,
    '--pbs-paper':     p.paper,
    '--pbs-cream-2':   p.cream2,
    '--pbs-line':      p.line,
    '--pbs-line-2':    p.line2,
    '--pbs-ink':       p.ink,
    '--pbs-ink-soft':  p.inkSoft,
    '--pbs-ink-muted': p.inkMuted,
  } as CSSProperties;
}

const SubjectTab = ({
  subject, active, onClick,
}: {
  subject: CurriculumSubject;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
      padding: '14px 18px', borderRadius: 16,
      background: active ? `var(--pbs-${subject.tone})` : 'var(--pbs-paper)',
      color: active ? `var(--pbs-${subject.tone}-ink)` : 'var(--pbs-ink)',
      border: `1.5px solid ${active ? `var(--pbs-${subject.tone}-ink)` : 'var(--pbs-line-2)'}`,
      boxShadow: active
        ? `0 3px 0 var(--pbs-${subject.tone}-ink), 0 14px 30px -18px rgba(60,40,0,0.28)`
        : '0 2px 0 var(--pbs-line-2)',
      cursor: 'pointer',
      transform: active ? 'translateY(-1px)' : 'none',
      transition: 'transform 140ms ease, box-shadow 140ms ease, background 140ms ease',
      flex: '1 1 0', minWidth: 180, textAlign: 'left',
    }}
  >
    <span style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', opacity: 0.75 }}>
      {subject.source}
    </span>
    <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 2 }}>
      {subject.subject}
    </span>
    <span style={{ fontSize: 13, marginTop: 4, opacity: 0.85, lineHeight: 1.35 }}>
      {subject.tagline}
    </span>
    <span style={{ fontSize: 11.5, fontWeight: 600, marginTop: 8, opacity: 0.72 }}>
      {subject.grades.length} grade bands · {subject.grades.reduce((s, g) => s + g.units.length, 0)} units
    </span>
  </button>
);

function shortGradeLabel(grade: CurriculumGrade): string {
  const g = grade.grade;
  if (g === 'K') return 'Kindergarten';
  if (g === '12+') return 'AP';
  if (g.includes('-')) return g.replace('-', '–');
  if (/^\d+$/.test(g)) {
    const label = grade.label.replace(/^Grade\s*/i, '');
    const looksLikeCourse = /[A-Za-z]/.test(label) && !/^\d/.test(label);
    return looksLikeCourse ? label : `Grade ${g}`;
  }
  return grade.label;
}

const GradeChip = ({
  grade, active, tone, onClick,
}: {
  grade: CurriculumGrade;
  active: boolean;
  tone: CurriculumSubject['tone'];
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      padding: '7px 13px', borderRadius: 999,
      fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
      background: active ? `var(--pbs-${tone})` : 'var(--pbs-paper)',
      color: active ? `var(--pbs-${tone}-ink)` : 'var(--pbs-ink-soft)',
      border: `1.5px solid ${active ? `var(--pbs-${tone}-ink)` : 'var(--pbs-line-2)'}`,
      boxShadow: active ? `0 2px 0 var(--pbs-${tone}-ink)` : 'none',
      cursor: 'pointer',
      transition: 'background 120ms, color 120ms, box-shadow 120ms',
    }}
  >
    {shortGradeLabel(grade)}
  </button>
);

const UnitRow = ({ index, name, description, tone }: { index: number; name: string; description: string; tone: CurriculumSubject['tone'] }) => (
  <div style={{
    display: 'flex', gap: 14, padding: '14px 16px',
    borderTop: '1.5px dashed var(--pbs-line)',
    alignItems: 'flex-start',
  }}>
    <div style={{
      flex: '0 0 30px', height: 30, borderRadius: 10,
      background: `var(--pbs-${tone})`,
      color: `var(--pbs-${tone}-ink)`,
      border: `1.5px solid var(--pbs-${tone}-ink)`,
      boxShadow: `0 2px 0 var(--pbs-${tone}-ink)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 13, fontWeight: 700,
    }}>{index + 1}</div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--pbs-ink)', lineHeight: 1.35 }}>
        {name}
      </div>
      <div style={{ fontSize: 13, color: 'var(--pbs-ink-soft)', marginTop: 3, lineHeight: 1.5 }}>
        {description}
      </div>
    </div>
  </div>
);

const GradeCard = ({ grade, subject }: { grade: CurriculumGrade; subject: CurriculumSubject }) => (
  <Block tone="paper" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 12, padding: '18px 20px',
      background: `var(--pbs-${subject.tone})`,
      color: `var(--pbs-${subject.tone}-ink)`,
      borderBottom: `1.5px solid var(--pbs-${subject.tone}-ink)`,
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.8 }}>
          {subject.subject}
        </div>
        <div style={{ fontSize: 21, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1, marginTop: 2 }}>
          {grade.label}
        </div>
      </div>
      <Pill tone={subject.tone} style={{ background: 'var(--pbs-paper)' }}>
        {grade.units.length} units
      </Pill>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {grade.units.map((unit, i) => (
        <UnitRow key={unit.name} index={i} name={unit.name} description={unit.description} tone={subject.tone} />
      ))}
    </div>
    <a
      href={grade.sourceUrl}
      target="_blank"
      rel="noreferrer"
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
        padding: '12px 20px',
        borderTop: '1.5px solid var(--pbs-line)',
        background: 'var(--pbs-cream-2)',
        color: 'var(--pbs-ink)',
        fontSize: 13, fontWeight: 600,
      }}
    >
      <span>Open on {subject.source.split(' & ')[0]}</span>
      <Icon name="arrow-right" size={14} stroke={2.2} />
    </a>
  </Block>
);

export default function LessonsPage() {
  const router = useRouter();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [activeSubjectId, setActiveSubjectId] = useState<string>(CURRICULUM[0].id);
  const [activeGradeKey, setActiveGradeKey] = useState<string>('all');

  const [paletteStyle, setPaletteStyle] = useState<CSSProperties>(() => paletteVars('cream'));
  useEffect(() => {
    const keys = Object.keys(PALETTES) as PaletteKey[];
    const pick = keys[Math.floor(Math.random() * keys.length)];
    setPaletteStyle(paletteVars(pick));
  }, []);

  const activeSubject = useMemo(
    () => CURRICULUM.find((s) => s.id === activeSubjectId) ?? CURRICULUM[0],
    [activeSubjectId],
  );

  const visibleGrades = useMemo(
    () => activeGradeKey === 'all'
      ? activeSubject.grades
      : activeSubject.grades.filter((g) => g.grade === activeGradeKey),
    [activeSubject, activeGradeKey],
  );

  const handleWizardComplete = (_templateId: TemplateId) => {
    setWizardOpen(false);
    router.push('/studio');
  };

  return (
    <div className="pbs-root" style={paletteStyle}>
      <div className="pbs-page-bg" aria-hidden />
      <div className="pbs-page-noise" aria-hidden />

      <div className="pbs-content">
        <Nav onMakeGame={() => setWizardOpen(true)} />

        <Section
          label="K–12 curriculum"
          kicker={activeSubject.tone}
          title={<>Every grade, every subject, <span className="pbs-serif">one map.</span></>}
          sub={`Lesson units for Math, Science, and English — ${TOTAL_UNIT_COUNT} units across Grades K–12, sourced from Khan Academy, NGSS, and Common Core. Pick a subject, then a grade.`}
        >
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 14, marginBottom: 28,
          }}>
            {CURRICULUM.map((subject) => (
              <SubjectTab
                key={subject.id}
                subject={subject}
                active={subject.id === activeSubjectId}
                onClick={() => { setActiveSubjectId(subject.id); setActiveGradeKey('all'); }}
              />
            ))}
          </div>

          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28,
            padding: 10, borderRadius: 14,
            background: 'var(--pbs-paper)',
            border: '1.5px solid var(--pbs-line-2)',
          }}>
            <button
              type="button"
              onClick={() => setActiveGradeKey('all')}
              style={{
                padding: '7px 13px', borderRadius: 999,
                fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap',
                background: activeGradeKey === 'all' ? 'var(--pbs-ink)' : 'transparent',
                color: activeGradeKey === 'all' ? 'var(--pbs-cream)' : 'var(--pbs-ink-soft)',
                border: '1.5px solid var(--pbs-ink)',
                cursor: 'pointer',
              }}
            >
              All grades
            </button>
            {activeSubject.grades.map((grade) => (
              <GradeChip
                key={grade.grade}
                grade={grade}
                tone={activeSubject.tone}
                active={activeGradeKey === grade.grade}
                onClick={() => setActiveGradeKey(grade.grade)}
              />
            ))}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: 20,
          }}>
            {visibleGrades.map((grade) => (
              <GradeCard key={`${activeSubject.id}-${grade.grade}`} grade={grade} subject={activeSubject} />
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 42 }}>
            <Chunky tone="ink" as="a" href="/" trailing="arrow-right">
              Turn any lesson into a game
            </Chunky>
          </div>
        </Section>

        <Footer onMakeGame={() => setWizardOpen(true)} />
      </div>

      <OnboardingWizard
        open={wizardOpen}
        onComplete={handleWizardComplete}
        onClose={() => setWizardOpen(false)}
      />
    </div>
  );
}
