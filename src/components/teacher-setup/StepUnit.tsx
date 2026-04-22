// Step 4: drop in a starter unit.
//
// The original ported design shipped four hardcoded starter units
// (Fraction Friends / Tiny Ecosystem / Choose-Your-Own Story / Blank canvas).
// Those felt canned — every teacher saw the same fictional examples regardless
// of their subject or grade. This rewrite replaces them with:
//
//   1. Templates pulled from the `starter_units` Supabase table, filtered to
//      the teacher's (classSubject, grade). Those accumulate organically as
//      teachers generate and accept drafts.
//   2. An always-present "Draft a custom unit" card that expands into a
//      textarea + Generate button. Hits /api/starter-units/draft which calls
//      the Claude CLI and returns 3 options.
//   3. An always-present "Blank canvas" card (built-in, not database-backed).
//
// When a teacher hits "Open the classroom", ClassroomSetupApp posts the
// chosen unit to /api/starter-units so the next teacher with the same
// (subject, grade) sees it as a template.

'use client';

import React, { useEffect, useState } from 'react';
import { Icon } from '@/components/landing/pb-site/primitives';
import { StepHeader } from './form';
import type { SetupData, StarterUnit, StarterUnitIcon, StarterUnitTone } from './types';

type TemplateRow = {
  id: string;
  title: string;
  weeks: string;
  blurb: string;
  bullets: string[];
  tone: string;
  icon: string;
  usage_count: number;
};

const BLANK_CANVAS: StarterUnit = {
  id: 'blank',
  source: 'blank',
  title: 'Blank canvas',
  weeks: 'No plan',
  blurb: 'Skip the unit. Open an empty room, invent your own lessons from scratch.',
  bullets: ['Full freedom', 'Import anytime', 'AI lesson authoring'],
  tone: 'sky',
  icon: 'cube',
};

// Subject / grade presentation labels for the prompt + empty state.
const SUBJECT_LABELS: Record<string, string> = {
  math: 'Math', ela: 'English / Language Arts', science: 'Science', cs: 'Computer Science',
  social: 'Social Studies', art: 'Art', music: 'Music', lang: 'World Languages',
  pe: 'PE / Health', stem: 'STEM / STEAM', sped: 'Special Ed', other: 'Other', mixed: 'Mixed',
};
const GRADE_LABELS: Record<string, string> = {
  k2: 'K–2', '3': '3rd', '4': '4th', '5': '5th', '6': '6th', '7': '7th',
  '8': '8th', '9': '9th', '10': '10th', '11': '11th', '12': '12th',
  hs: 'High School', mix: 'mixed grades',
};

export const StepUnit = ({
  data, set,
}: {
  data: SetupData;
  set: <K extends keyof SetupData>(k: K, v: SetupData[K]) => void;
}) => {
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);

  const [describeOpen, setDescribeOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [drafting, setDrafting] = useState(false);
  const [drafts, setDrafts] = useState<StarterUnit[]>([]);
  const [draftError, setDraftError] = useState<string | null>(null);

  // Fetch matching templates whenever the subject or grade changes.
  useEffect(() => {
    let aborted = false;
    setTemplatesLoading(true);
    fetch(`/api/starter-units?subject=${encodeURIComponent(data.classSubject)}&grade=${encodeURIComponent(data.grade)}`)
      .then((r) => r.json())
      .then((json: { units?: TemplateRow[] }) => {
        if (aborted) return;
        setTemplates(Array.isArray(json.units) ? json.units : []);
      })
      .catch(() => {
        if (!aborted) setTemplates([]);
      })
      .finally(() => {
        if (!aborted) setTemplatesLoading(false);
      });
    return () => { aborted = true; };
  }, [data.classSubject, data.grade]);

  const subjectLabel = SUBJECT_LABELS[data.classSubject] ?? data.classSubject;
  const gradeLabel = GRADE_LABELS[data.grade] ?? data.grade;

  const runDraft = async () => {
    if (drafting) return;
    setDrafting(true);
    setDraftError(null);
    setDrafts([]);
    try {
      const res = await fetch('/api/starter-units/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: data.classSubject,
          grade: data.grade,
          description,
        }),
      });
      const json = (await res.json()) as { units?: Array<Omit<StarterUnit, 'id' | 'source' | 'prompt'>>; error?: string };
      if (!res.ok || !Array.isArray(json.units) || !json.units.length) {
        throw new Error(json.error || 'No drafts returned');
      }
      const mapped: StarterUnit[] = json.units.map((u, i) => ({
        id: `draft-${Date.now()}-${i}`,
        source: 'draft',
        title: u.title,
        weeks: u.weeks,
        blurb: u.blurb,
        bullets: u.bullets,
        tone: u.tone as StarterUnitTone,
        icon: u.icon as StarterUnitIcon,
        prompt: description,
      }));
      setDrafts(mapped);
    } catch (e) {
      setDraftError(e instanceof Error ? e.message : 'Failed to draft');
    } finally {
      setDrafting(false);
    }
  };

  const pickTemplate = (t: TemplateRow) => {
    set('unit', {
      id: t.id,
      source: 'template',
      title: t.title,
      weeks: t.weeks,
      blurb: t.blurb,
      bullets: t.bullets,
      tone: t.tone as StarterUnitTone,
      icon: t.icon as StarterUnitIcon,
    });
  };

  const pickDraft = (u: StarterUnit) => set('unit', u);
  const pickBlank = () => set('unit', BLANK_CANVAS);

  const hasTemplates = !templatesLoading && templates.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <StepHeader
        index={3}
        total={5}
        step={{
          title: <>Drop in a <span className="pbs-serif">starter unit.</span></>,
          sub: `A unit is a handful of playable lessons, rubrics, and a culminating project. ${
            hasTemplates
              ? `Here's what other ${subjectLabel.toLowerCase()} teachers picked for ${gradeLabel} — or draft your own.`
              : `No templates yet for ${subjectLabel} · ${gradeLabel} — you'll be the first. Describe what you want and we'll draft 3 options.`
          }`,
        }}
      />

      {/* Templates (only if any match this subject+grade) */}
      {hasTemplates && (
        <div>
          <SectionHeading label={`Picked by other ${subjectLabel.toLowerCase()} teachers`} mono/>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 10 }}>
            {templates.map((t) => (
              <UnitCard
                key={t.id}
                title={t.title}
                subtitleMono={`${subjectLabel} · ${gradeLabel} · ${t.weeks}`}
                blurb={t.blurb}
                bullets={t.bullets}
                tone={(t.tone as StarterUnitTone) || 'butter'}
                icon={(t.icon as StarterUnitIcon) || 'spark'}
                selected={data.unit?.source === 'template' && data.unit.id === t.id}
                onPick={() => pickTemplate(t)}
                badge={t.usage_count > 1 ? `${t.usage_count}× used` : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {/* Draft-your-own */}
      <DraftCard
        open={describeOpen}
        onOpenToggle={() => setDescribeOpen((o) => !o)}
        description={description}
        onDescriptionChange={setDescription}
        drafting={drafting}
        onGenerate={runDraft}
        drafts={drafts}
        onPickDraft={pickDraft}
        selectedDraftId={data.unit?.source === 'draft' ? data.unit.id : undefined}
        error={draftError}
        subjectLabel={subjectLabel}
        gradeLabel={gradeLabel}
      />

      {/* Blank canvas — always available */}
      <UnitCard
        compact
        title={BLANK_CANVAS.title}
        subtitleMono={`${BLANK_CANVAS.blurb.split('.')[0]}`}
        blurb={BLANK_CANVAS.blurb}
        bullets={BLANK_CANVAS.bullets}
        tone={BLANK_CANVAS.tone}
        icon={BLANK_CANVAS.icon}
        selected={data.unit?.source === 'blank'}
        onPick={pickBlank}
      />
    </div>
  );
};

/* --------------------------------- sub-components --------------------------------- */

const SectionHeading = ({ label, mono }: { label: string; mono?: boolean }) => (
  <div
    className={mono ? 'pbs-mono' : undefined}
    style={{
      fontSize: 11, color: 'var(--pbs-ink-muted)',
      textTransform: 'uppercase', letterSpacing: '0.1em',
    }}
  >
    {label}
  </div>
);

type CardProps = {
  title: string;
  subtitleMono?: string;
  blurb: string;
  bullets: string[];
  tone: StarterUnitTone;
  icon: StarterUnitIcon;
  selected: boolean;
  onPick: () => void;
  badge?: string;
  compact?: boolean;
};

const UnitCard = ({
  title, subtitleMono, blurb, bullets, tone, icon,
  selected, onPick, badge, compact,
}: CardProps) => (
  <button
    type="button"
    onClick={onPick}
    style={{
      textAlign: 'left',
      padding: compact ? 14 : 18,
      background: selected ? `var(--pbs-${tone})` : 'var(--pbs-paper)',
      color: selected ? `var(--pbs-${tone}-ink)` : 'var(--pbs-ink)',
      border: `1.5px solid ${selected ? `var(--pbs-${tone}-ink)` : 'var(--pbs-line)'}`,
      boxShadow: selected
        ? `0 3px 0 var(--pbs-${tone}-ink), 0 14px 30px -18px rgba(60,40,0,0.25)`
        : '0 3px 0 var(--pbs-line-2)',
      borderRadius: 18,
      cursor: 'pointer',
      transition: 'all 140ms',
      display: 'flex', flexDirection: 'column', gap: 10,
      position: 'relative',
      fontFamily: 'inherit',
      width: '100%',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: selected ? 'rgba(255,255,255,0.45)' : `var(--pbs-${tone})`,
        color: `var(--pbs-${tone}-ink)`,
        border: `1.5px solid var(--pbs-${tone}-ink)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name={icon} size={18} stroke={2.2}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.015em' }}>{title}</div>
        {subtitleMono && (
          <div
            className="pbs-mono"
            style={{
              fontSize: 11,
              color: selected ? 'inherit' : 'var(--pbs-ink-muted)',
              opacity: selected ? 0.75 : 1,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}
          >
            {subtitleMono}
          </div>
        )}
      </div>
      {badge && (
        <span className="pbs-mono" style={{
          fontSize: 10, padding: '3px 8px',
          background: selected ? 'rgba(255,255,255,0.45)' : 'var(--pbs-cream-2)',
          border: `1px solid ${selected ? `var(--pbs-${tone}-ink)` : 'var(--pbs-line-2)'}`,
          borderRadius: 999, letterSpacing: '0.04em',
        }}>{badge}</span>
      )}
      {selected && (
        <div style={{
          width: 26, height: 26, borderRadius: 999,
          background: `var(--pbs-${tone}-ink)`, color: `var(--pbs-${tone})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="check" size={14} stroke={3}/>
        </div>
      )}
    </div>
    <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: selected ? 'inherit' : 'var(--pbs-ink-soft)' }}>
      {blurb}
    </p>
    {bullets.length > 0 && (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
        {bullets.map((b) => (
          <span key={b} className="pbs-mono" style={{
            padding: '3px 9px', fontSize: 10.5,
            background: selected ? 'rgba(255,255,255,0.45)' : 'var(--pbs-cream-2)',
            border: `1px solid ${selected ? `var(--pbs-${tone}-ink)` : 'var(--pbs-line-2)'}`,
            borderRadius: 999, letterSpacing: '0.02em',
          }}>{b}</span>
        ))}
      </div>
    )}
  </button>
);

type DraftCardProps = {
  open: boolean;
  onOpenToggle: () => void;
  description: string;
  onDescriptionChange: (v: string) => void;
  drafting: boolean;
  onGenerate: () => void;
  drafts: StarterUnit[];
  onPickDraft: (u: StarterUnit) => void;
  selectedDraftId: string | undefined;
  error: string | null;
  subjectLabel: string;
  gradeLabel: string;
};

const DraftCard = ({
  open, onOpenToggle, description, onDescriptionChange,
  drafting, onGenerate, drafts, onPickDraft, selectedDraftId,
  error, subjectLabel, gradeLabel,
}: DraftCardProps) => (
  <div style={{
    background: 'var(--pbs-cream-2)',
    border: '1.5px dashed var(--pbs-line-2)',
    borderRadius: 18,
    padding: 18,
    display: 'flex', flexDirection: 'column', gap: 14,
  }}>
    <button
      type="button"
      onClick={onOpenToggle}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'transparent', border: 0, padding: 0,
        cursor: 'pointer', textAlign: 'left',
        fontFamily: 'inherit', color: 'var(--pbs-ink)',
        width: '100%',
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: 'var(--pbs-butter)', color: 'var(--pbs-butter-ink)',
        border: '1.5px solid var(--pbs-butter-ink)',
        boxShadow: '0 2px 0 var(--pbs-butter-ink)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name="wand" size={18} stroke={2.2}/>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.015em' }}>
          Draft a custom unit
        </div>
        <div className="pbs-mono" style={{ fontSize: 11, color: 'var(--pbs-ink-muted)', marginTop: 2 }}>
          Describe what you want → we&apos;ll generate 3 options in ~30 sec
        </div>
      </div>
      <Icon
        name="chevron" size={14} stroke={2.4}
        style={{ transform: `rotate(${open ? -90 : 90}deg)`, color: 'var(--pbs-ink-muted)', transition: 'transform 160ms' }}
      />
    </button>

    {open && (
      <>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder={`e.g. "4-week ${subjectLabel} unit for ${gradeLabel} where students build a game about fractions and end with a class recipe book"`}
          rows={3}
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '12px 14px',
            background: 'var(--pbs-paper)',
            border: '1.5px solid var(--pbs-line-2)',
            borderRadius: 12,
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
            fontFamily: 'inherit', fontSize: 14, color: 'var(--pbs-ink)',
            resize: 'vertical',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ fontSize: 12, color: 'var(--pbs-ink-muted)' }}>
            Leave empty and we&apos;ll pick 3 broadly-useful angles for {subjectLabel} · {gradeLabel}.
          </span>
          <button
            type="button"
            onClick={onGenerate}
            disabled={drafting}
            style={{
              padding: '10px 16px',
              background: drafting ? 'var(--pbs-line-2)' : 'var(--pbs-ink)',
              color: drafting ? 'var(--pbs-ink-muted)' : 'var(--pbs-cream)',
              border: '1.5px solid var(--pbs-ink)',
              borderRadius: 12, fontSize: 13.5, fontWeight: 600,
              boxShadow: drafting ? 'none' : '0 3px 0 #000',
              cursor: drafting ? 'not-allowed' : 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontFamily: 'inherit',
            }}
          >
            <Icon name="sparkle" size={14} stroke={2.4}/>
            {drafting ? 'Drafting…' : 'Draft 3 options'}
          </button>
        </div>

        {error && (
          <div style={{
            padding: '10px 12px',
            background: 'var(--pbs-coral)', color: 'var(--pbs-coral-ink)',
            border: '1.5px solid var(--pbs-coral-ink)',
            borderRadius: 10, fontSize: 13,
          }}>
            {error}
          </div>
        )}

        {drafts.length > 0 && (
          <div>
            <SectionHeading label="Your drafts" mono/>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 10 }}>
              {drafts.map((u) => (
                <UnitCard
                  key={u.id}
                  title={u.title}
                  subtitleMono={`${subjectLabel} · ${gradeLabel} · ${u.weeks}`}
                  blurb={u.blurb}
                  bullets={u.bullets}
                  tone={u.tone}
                  icon={u.icon}
                  selected={selectedDraftId === u.id}
                  onPick={() => onPickDraft(u)}
                />
              ))}
            </div>
          </div>
        )}
      </>
    )}
  </div>
);
