// New Assignment composer — full-page, three-step layout ported from
// Claude Design bundle UEB1MU9BX2fOreOlq5ot1g (pb_teacher/new_assignment.jsx).
//
// Left column: (01) pick a shape (2×2 kind cards), (02) title + content
// (text input, topic chips, questions/time steppers, difficulty segmented,
// starter templates), (03) schedule + rules (release/due segmented,
// audience chips, Hints / Retries toggles).
// Right column: sticky preview card (themed to the topic tone) with sample
// question + an "at a glance" summary block.
// Top row: Back, Save as draft, Publish to class. onCreated(a, asDraft)
// prepends the card to the list; drafts get a "Draft" pill in the grid.
//
// CSS var names are rewritten from the design's --butter/--line-2/--ink…
// to Problocks' --pbs-butter / --pbs-line-2 / --pbs-ink tokens so the file
// drops into the existing teacher dashboard styling.
'use client';

import React, { useState } from 'react';
import { Block, Chunky, Icon, Pill } from '@/components/landing/pb-site/primitives';
import type {
  Assignment, AssignmentKind, AssignmentTopic, ClassRecord, TeacherTone,
} from './sample-data';
import { kickerSty } from './shared';

type KindDef  = { id: string; label: AssignmentKind; desc: string; icon: 'book' | 'bolt' | 'compass' | 'lock'; tone: TeacherTone };
type TopicDef = { id: AssignmentTopic; icon: 'code' | 'cube' | 'coin' | 'spark' | 'compass' | 'wand'; tone: TeacherTone };
type Diff     = 'Gentle' | 'Core' | 'Stretch' | 'Mix';

const KINDS: KindDef[] = [
  { id: 'homework', label: 'Homework',   desc: 'Async · individual pace',  icon: 'book',    tone: 'butter' },
  { id: 'live',     label: 'Live relay', desc: 'Synchronous · team play',  icon: 'bolt',    tone: 'coral'  },
  { id: 'practice', label: 'Practice',   desc: 'Untimed · infinite retry', icon: 'compass', tone: 'mint'   },
  { id: 'quiz',     label: 'Quiz',       desc: 'Timed · one attempt',      icon: 'lock',    tone: 'sky'    },
];

const TOPIC_LIST: TopicDef[] = [
  { id: 'Algebra',     icon: 'code',    tone: 'butter' },
  { id: 'Geometry',    icon: 'cube',    tone: 'mint'   },
  { id: 'Numbers',     icon: 'coin',    tone: 'sky'    },
  { id: 'Probability', icon: 'spark',   tone: 'grape'  },
  { id: 'Ratios',      icon: 'compass', tone: 'pink'   },
  { id: 'Functions',   icon: 'wand',    tone: 'coral'  },
];

const STARTERS: { title: string; topic: AssignmentTopic; qs: number; min: number; icon: string }[] = [
  { title: 'Linear Equations Relay', topic: 'Algebra',     qs: 12, min: 15, icon: 'bolt'  },
  { title: 'Slope Bakery Bonanza',   topic: 'Algebra',     qs: 10, min: 12, icon: 'music' },
  { title: 'Shapes & Area Sprint',   topic: 'Geometry',    qs: 12, min: 15, icon: 'cube'  },
  { title: 'Probability Carnival',   topic: 'Probability', qs: 10, min: 15, icon: 'spark' },
];

const RELEASE_OPTS: string[] = ['Now', 'Tomorrow', 'Monday'];
const DUE_OPTS:     string[] = ['Tomorrow', 'Fri 9pm', 'Next week'];
const DIFFS:        Diff[]   = ['Gentle', 'Core', 'Stretch', 'Mix'];

export const NewAssignment = ({
  cls, onBack, onCreated,
}: {
  cls: ClassRecord | null;
  onBack: () => void;
  onCreated: (a: Assignment, asDraft: boolean) => void;
}) => {
  const [kindId,   setKindId]   = useState<string>('homework');
  const [title,    setTitle]    = useState('');
  const [topic,    setTopic]    = useState<AssignmentTopic>('Algebra');
  const [qs,       setQs]       = useState(10);
  const [min,      setMin]      = useState(12);
  const [due,      setDue]      = useState('Tomorrow');
  const [release,  setRelease]  = useState('Now');
  const [hints,    setHints]    = useState(true);
  const [retries,  setRetries]  = useState(true);
  const [audience, setAudience] = useState<'all' | 'risk' | 'strong' | 'pick'>('all');
  const [diff,     setDiff]     = useState<Diff>('Core');

  const kindObj  = KINDS.find((k) => k.id === kindId) ?? KINDS[0];
  const topicObj = TOPIC_LIST.find((t) => t.id === topic) ?? TOPIC_LIST[0];

  const valid = title.trim().length >= 3;

  const applyStarter = (s: typeof STARTERS[number]) => {
    setTitle(s.title); setTopic(s.topic); setQs(s.qs); setMin(s.min);
  };

  const publish = (asDraft: boolean) => {
    if (!valid) return;
    const a: Assignment = {
      id: 'a' + Math.random().toString(36).slice(2, 8),
      title: title.trim() || 'Untitled assignment',
      kind:  kindObj.label,
      topic,
      tone:  topicObj.tone,
      icon:  topicObj.icon,
      due:   release === 'Now' ? due : `${release} · due ${due}`,
      avg: 0, submitted: 0, total: cls?.members ?? 28,
      questions: qs, minutes: min,
      draft: asDraft,
    };
    onCreated(a, asDraft);
  };

  return (
    <div className="pbs-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, gap: 12, flexWrap: 'wrap' }}>
        <button type="button" onClick={onBack} style={naBackBtn}>← Back to assignments</button>
        <div style={{ display: 'flex', gap: 8 }}>
          <Chunky tone="ghost"  onClick={() => publish(true)}  disabled={!valid}>Save as draft</Chunky>
          <Chunky tone="butter" icon="send" onClick={() => publish(false)} disabled={!valid}>Publish to class</Chunky>
        </div>
      </div>

      <div>
        <div className="pbs-mono" style={kickerSty}>NEW ASSIGNMENT · {cls?.name ?? 'Class'}</div>
        <h1 style={{ margin: '6px 0 0', fontSize: 'clamp(28px, 3.4vw, 42px)', fontWeight: 700, letterSpacing: '-0.025em' }}>
          What are we building today?
        </h1>
      </div>

      <div className="pb-teacher-split" style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 18, marginTop: 22, alignItems: 'start' }}>
        {/* LEFT COLUMN — editor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Step 01 — Kind */}
          <Block tone="paper" style={{ padding: 20 }}>
            <SectionHead n="01" title="Pick a shape"/>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginTop: 12 }}>
              {KINDS.map((k) => {
                const active = k.id === kindId;
                return (
                  <button key={k.id} type="button" onClick={() => setKindId(k.id)} style={kindBtn(active, k.tone)}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--pbs-paper)', border: '1.5px solid currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name={k.icon} size={18} stroke={2.2}/>
                    </div>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{k.label}</div>
                      <div style={{ fontSize: 11.5, opacity: 0.8, marginTop: 1 }}>{k.desc}</div>
                    </div>
                    {active && <Icon name="check" size={16} stroke={2.6}/>}
                  </button>
                );
              })}
            </div>
          </Block>

          {/* Step 02 — Content */}
          <Block tone="paper" style={{ padding: 20 }}>
            <SectionHead n="02" title="Title + content"/>

            <label style={naLabel}>Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Linear Equations Relay"
              style={naInput}
            />

            <label style={{ ...naLabel, marginTop: 14 }}>Topic</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
              {TOPIC_LIST.map((t) => {
                const active = t.id === topic;
                return (
                  <button key={t.id} type="button" onClick={() => setTopic(t.id)} style={topicChip(active, t.tone)}>
                    <Icon name={t.icon} size={13} stroke={2.2}/>
                    {t.id}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
              <Stepper label="Questions"  value={qs}  onChange={(v) => setQs(Math.max(1, Math.min(30, v)))}  min={1} max={30} suffix="Qs"/>
              <Stepper label="Est. time"  value={min} onChange={(v) => setMin(Math.max(5, Math.min(60, v)))} min={5} max={60} step={5} suffix="min"/>
            </div>

            <label style={{ ...naLabel, marginTop: 16 }}>Difficulty mix</label>
            <div style={{ display: 'flex', gap: 4, marginTop: 6, padding: 3, background: 'var(--pbs-cream)', border: '1.5px solid var(--pbs-line-2)', borderRadius: 12, width: 'fit-content' }}>
              {DIFFS.map((d) => (
                <button key={d} type="button" onClick={() => setDiff(d)} style={segBtn(diff === d)}>{d}</button>
              ))}
            </div>

            <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1.5px dashed var(--pbs-line-2)' }}>
              <div className="pbs-mono" style={{ fontSize: 11, letterSpacing: '0.08em', color: 'var(--pbs-ink-muted)', marginBottom: 8 }}>START FROM</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {STARTERS.map((s) => (
                  <button key={s.title} type="button" onClick={() => applyStarter(s)} style={starterBtn}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--pbs-butter)', border: '1.5px solid var(--pbs-butter-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--pbs-butter-ink)' }}>
                      <Icon name={s.icon as 'bolt'} size={14} stroke={2.2}/>
                    </div>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700 }}>{s.title}</div>
                      <div style={{ fontSize: 10.5, color: 'var(--pbs-ink-muted)' }}>{s.topic} · {s.qs} Qs · {s.min}m</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </Block>

          {/* Step 03 — Schedule + rules */}
          <Block tone="paper" style={{ padding: 20 }}>
            <SectionHead n="03" title="Schedule + rules"/>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
              <div>
                <label style={naLabel}>Release</label>
                <div style={{ display: 'flex', gap: 4, marginTop: 6, padding: 3, background: 'var(--pbs-cream)', border: '1.5px solid var(--pbs-line-2)', borderRadius: 12 }}>
                  {RELEASE_OPTS.map((r) => (
                    <button key={r} type="button" onClick={() => setRelease(r)} style={segBtn(release === r, true)}>{r}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={naLabel}>Due</label>
                <div style={{ display: 'flex', gap: 4, marginTop: 6, padding: 3, background: 'var(--pbs-cream)', border: '1.5px solid var(--pbs-line-2)', borderRadius: 12 }}>
                  {DUE_OPTS.map((r) => (
                    <button key={r} type="button" onClick={() => setDue(r)} style={segBtn(due === r, true)}>{r}</button>
                  ))}
                </div>
              </div>
            </div>

            <label style={{ ...naLabel, marginTop: 16 }}>Assign to</label>
            <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
              {([
                { id: 'all',    label: `Whole class · ${cls?.members ?? 28}` },
                { id: 'risk',   label: 'At-risk only · 3' },
                { id: 'strong', label: 'Stretch group · 7' },
                { id: 'pick',   label: 'Pick students…' },
              ] as const).map((o) => (
                <button key={o.id} type="button" onClick={() => setAudience(o.id)} style={audienceChip(audience === o.id)}>
                  {o.label}
                </button>
              ))}
            </div>

            <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Toggle label="Hints on"        sub="Scaffolded help per Q" on={hints}   setOn={setHints}/>
              <Toggle label="Retries allowed" sub="Up to 3 attempts"       on={retries} setOn={setRetries}/>
            </div>
          </Block>
        </div>

        {/* RIGHT COLUMN — preview */}
        <div style={{ position: 'sticky', top: 96, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="pbs-mono" style={{ fontSize: 10.5, letterSpacing: '0.1em', color: 'var(--pbs-ink-muted)' }}>PREVIEW CARD</div>

          <Block tone={topicObj.tone} style={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--pbs-paper)', border: '1.5px solid currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={topicObj.icon} size={20} stroke={2.2}/>
              </div>
              <Pill tone="paper">{kindObj.label}</Pill>
              <Pill tone="paper" icon="book">{topic}</Pill>
            </div>

            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', minHeight: 30 }}>
              {title.trim() || <span style={{ opacity: 0.45 }}>Title goes here</span>}
            </div>
            <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
              {release === 'Now' ? 'Releases now' : `Releases ${release}`} · due {due} · {qs} Qs · ~{min} min
            </div>

            <div style={{ marginTop: 16, padding: 12, borderRadius: 10, background: 'var(--pbs-paper)', border: '1.5px dashed currentColor' }}>
              <div className="pbs-mono" style={{ fontSize: 10.5, letterSpacing: '0.08em', opacity: 0.7 }}>
                SAMPLE QUESTION · {diff.toUpperCase()}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 6 }}>
                {sampleQuestion(topic, diff)}
              </div>
            </div>

            <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {hints   && <Pill tone="paper" icon="sparkle">Hints on</Pill>}
              {retries && <Pill tone="paper" icon="check">Retries</Pill>}
              <Pill tone="paper" icon="users">
                {audience === 'all' ? `${cls?.members ?? 28} students`
                  : audience === 'risk' ? '3 at-risk'
                  : audience === 'strong' ? '7 stretch'
                  : 'pick…'}
              </Pill>
            </div>
          </Block>

          <Block tone="cream" style={{ padding: 16 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>At a glance</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <GlanceRow k="Shape"   v={kindObj.label}/>
              <GlanceRow k="Topic"   v={topic}/>
              <GlanceRow k="Length"  v={`${qs} Qs · ${min}m`}/>
              <GlanceRow k="Mix"     v={diff}/>
              <GlanceRow k="Release" v={release}/>
              <GlanceRow k="Due"     v={due}/>
            </div>
          </Block>
        </div>
      </div>
    </div>
  );
};

// ---- internal atoms ----

const SectionHead = ({ n, title }: { n: string; title: string }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
    <span className="pbs-mono" style={{ fontSize: 11, color: 'var(--pbs-ink-muted)', letterSpacing: '0.08em' }}>{n}</span>
    <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em' }}>{title}</span>
  </div>
);

const Stepper = ({
  label, value, onChange, min, max, step = 1, suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number; max: number; step?: number;
  suffix: string;
}) => (
  <div>
    <label style={naLabel}>{label}</label>
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginTop: 6, background: 'var(--pbs-cream)', border: '1.5px solid var(--pbs-line-2)', borderRadius: 12, padding: 4, width: 'fit-content' }}>
      <button type="button" onClick={() => onChange(value - step)} style={stepBtn} disabled={value <= min}><Icon name="minus" size={14} stroke={2.4}/></button>
      <div className="pbs-mono" style={{ minWidth: 70, textAlign: 'center', fontWeight: 700, fontSize: 14 }}>{value} {suffix}</div>
      <button type="button" onClick={() => onChange(value + step)} style={stepBtn} disabled={value >= max}><Icon name="plus" size={14} stroke={2.4}/></button>
    </div>
  </div>
);

const Toggle = ({
  label, sub, on, setOn,
}: {
  label: string; sub: string; on: boolean; setOn: (v: boolean) => void;
}) => (
  <button
    type="button"
    onClick={() => setOn(!on)}
    style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: 12, borderRadius: 12,
      background: on ? 'var(--pbs-cream-2)' : 'var(--pbs-paper)',
      border: `1.5px solid ${on ? 'var(--pbs-ink)' : 'var(--pbs-line-2)'}`,
      textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', color: 'inherit',
    }}
  >
    <div style={{
      width: 34, height: 20, borderRadius: 999,
      background: on ? 'var(--pbs-ink)' : 'var(--pbs-line-2)',
      position: 'relative', transition: 'background 150ms',
    }}>
      <div style={{
        position: 'absolute', top: 2, left: on ? 16 : 2,
        width: 16, height: 16, borderRadius: '50%',
        background: on ? 'var(--pbs-butter)' : 'var(--pbs-paper)',
        transition: 'left 150ms',
      }}/>
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 12.5, fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 10.5, color: 'var(--pbs-ink-muted)' }}>{sub}</div>
    </div>
  </button>
);

const GlanceRow = ({ k, v }: { k: string; v: React.ReactNode }) => (
  <div style={{ padding: '8px 10px', borderRadius: 8, background: 'var(--pbs-paper)', border: '1.5px solid var(--pbs-line)' }}>
    <div className="pbs-mono" style={{ fontSize: 9.5, letterSpacing: '0.08em', color: 'var(--pbs-ink-muted)' }}>{k.toUpperCase()}</div>
    <div style={{ fontSize: 13, fontWeight: 700, marginTop: 1 }}>{v}</div>
  </div>
);

// Deterministic sample question per (topic, difficulty) — keeps the preview
// concrete without wiring a real question bank.
const sampleQuestion = (topic: AssignmentTopic, diff: Diff): string => {
  const bank: Record<AssignmentTopic, Record<Diff, string>> = {
    Algebra:     { Gentle: 'Solve for x:  x + 7 = 15',           Core: 'Solve: 3(x − 4) + 2x = 5x − 10',    Stretch: 'For which k does 2x + k = kx have infinite solutions?', Mix: 'Solve and check: 4x − 9 = 2x + 7' },
    Geometry:    { Gentle: 'Area of a 6×4 rectangle?',           Core: 'Find the area of a triangle, base 12, height 7.', Stretch: 'A regular hexagon has side 5. Find its area.', Mix: 'Perimeter of a semicircle with r = 3?' },
    Numbers:     { Gentle: 'Order: 0.6, 2/3, 0.58, 3/5',         Core: 'Simplify:  3/8 + 5/12',              Stretch: 'Convert 0.272727… to a fraction.',                      Mix: 'Estimate √50 to one decimal.' },
    Probability: { Gentle: 'P(heads) on a fair coin?',           Core: 'Bag: 3 red, 4 blue. P(red then blue, no replace)?', Stretch: 'Three dice — P(sum = 10)?', Mix: 'P(at least one 6 in 4 rolls)?' },
    Ratios:      { Gentle: 'Scale 3:5 → if 3 = 12, what is 5?',  Core: 'A recipe uses 2 cups flour : 3 eggs. 9 eggs needs?', Stretch: 'If a:b = 2:3 and b:c = 4:5, find a:c.', Mix: 'Convert 72 km/h to m/s.' },
    Functions:   { Gentle: 'f(x) = 2x + 1.  f(5) = ?',           Core: 'If g(x) = x² − 3, solve g(x) = 13.', Stretch: 'Find the inverse of f(x) = (x − 2)/3.',                 Mix: 'Domain of f(x) = √(x − 4)?' },
  };
  return bank[topic]?.[diff] ?? 'Sample question…';
};

// ---- styles ----

const naBackBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '7px 14px', borderRadius: 999,
  background: 'var(--pbs-paper)', border: '1.5px solid var(--pbs-line-2)',
  fontSize: 12, fontWeight: 600, color: 'var(--pbs-ink-soft)',
  cursor: 'pointer', fontFamily: 'inherit',
};

const naLabel: React.CSSProperties = {
  fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase',
  color: 'var(--pbs-ink-muted)',
  fontFamily: "'DM Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
  display: 'block',
};

const naInput: React.CSSProperties = {
  display: 'block', width: '100%', marginTop: 6,
  padding: '12px 14px', borderRadius: 12,
  border: '1.5px solid var(--pbs-line-2)', background: 'var(--pbs-cream)',
  fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em',
  outline: 'none', color: 'inherit', fontFamily: 'inherit',
};

const kindBtn = (active: boolean, tone: TeacherTone): React.CSSProperties => ({
  display: 'flex', alignItems: 'center', gap: 10,
  padding: 12, borderRadius: 14,
  background: active ? `var(--pbs-${tone})` : 'var(--pbs-cream)',
  color:      active ? `var(--pbs-${tone}-ink)` : 'var(--pbs-ink)',
  border: `1.5px solid ${active ? `var(--pbs-${tone}-ink)` : 'var(--pbs-line-2)'}`,
  boxShadow: active ? `0 3px 0 var(--pbs-${tone}-ink)` : 'none',
  textAlign: 'left', transition: 'transform 100ms',
  cursor: 'pointer', fontFamily: 'inherit',
});

const topicChip = (active: boolean, tone: TeacherTone): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '7px 11px', borderRadius: 999,
  background: active ? `var(--pbs-${tone})` : 'var(--pbs-paper)',
  color:      active ? `var(--pbs-${tone}-ink)` : 'var(--pbs-ink-soft)',
  border: `1.5px solid ${active ? `var(--pbs-${tone}-ink)` : 'var(--pbs-line-2)'}`,
  fontSize: 12, fontWeight: 600,
  cursor: 'pointer', fontFamily: 'inherit',
});

const segBtn = (active: boolean, small = false): React.CSSProperties => ({
  flex: small ? 1 : 'unset',
  padding: small ? '6px 10px' : '7px 12px',
  borderRadius: 9,
  background: active ? 'var(--pbs-ink)' : 'transparent',
  color:      active ? 'var(--pbs-cream)' : 'var(--pbs-ink-soft)',
  fontSize: 11.5, fontWeight: 600,
  border: 0, cursor: 'pointer', fontFamily: 'inherit',
});

const stepBtn: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 8,
  background: 'var(--pbs-paper)', border: '1.5px solid var(--pbs-line-2)',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', color: 'inherit',
};

const starterBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 10,
  padding: 8, borderRadius: 10,
  background: 'var(--pbs-cream)', border: '1.5px solid var(--pbs-line-2)',
  cursor: 'pointer', fontFamily: 'inherit', color: 'inherit',
};

const audienceChip = (active: boolean): React.CSSProperties => ({
  padding: '7px 12px', borderRadius: 999,
  background: active ? 'var(--pbs-ink)' : 'var(--pbs-paper)',
  color:      active ? 'var(--pbs-cream)' : 'var(--pbs-ink-soft)',
  border: `1.5px solid ${active ? 'var(--pbs-ink)' : 'var(--pbs-line-2)'}`,
  fontSize: 11.5, fontWeight: 600,
  cursor: 'pointer', fontFamily: 'inherit',
});
