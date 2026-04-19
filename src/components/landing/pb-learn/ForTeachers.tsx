'use client';

import React from 'react';
import { Block, Chunky, Icon, Pill, Section } from '../pb-site/primitives';

type Tone = 'butter' | 'mint' | 'sky' | 'grape';

const SKILL_ROWS: Array<[string, number[]]> = [
  ['½ of a whole',   [3,3,3,3,3,3,3,2,3,3,2,3,3,3]],
  ['⅓ and ⅔',       [3,3,2,3,2,3,3,2,1,3,3,3,2,3]],
  ['¼ grouping',    [3,2,1,3,2,2,1,2,3,2,1,2,2,3]],
  ['add ½ + ¼',     [2,1,1,2,1,2,0,1,2,1,1,1,2,2]],
  ['compare ⅓ vs ⅖',[1,0,1,1,1,1,0,0,1,0,1,1,1,2]],
];

const CELL_COLORS = ['#f7edd4', '#ffb4a2', '#ffd84d', '#b6f0c6'];

const LEGEND: Array<[string, string]> = [
  ['#f7edd4', 'not tried'],
  ['#ffb4a2', 'struggling'],
  ['#ffd84d', 'getting it'],
  ['#b6f0c6', 'got it'],
];

const STATS: Array<[string, string]> = [['86%', 'on pace'], ['14', 'games built'], ['4.6h', 'active time']];

const BENEFITS: Array<{ tone: Tone; icon: 'compass' | 'bolt' | 'users' | 'book'; title: string; body: string }> = [
  { tone: 'butter', icon: 'compass', title: 'Maps to your curriculum', body: 'Type an objective — "identify ½, ⅓ and ¼" — and we suggest game templates that hit it. Works with CSTA, NGSS, Common Core.' },
  { tone: 'mint', icon: 'bolt', title: 'Live skill heatmap', body: 'See which students are stuck on which concept in real time. No grading pile, no waiting until Friday.' },
  { tone: 'sky', icon: 'users', title: 'Class chat, moderated', body: 'Every channel has you on it. Flagged messages, kindness nudges, and a gentle filter for outside links.' },
  { tone: 'grape', icon: 'book', title: 'Lesson authoring in English', body: 'Describe the lesson; we generate a starter world, quest list, and rubric. Edit anything before class.' },
];

export const ForTeachers = () => (
  <Section
    id="teachers"
    label="For teachers"
    kicker="sky"
    title={<>Assessments you <span className="pbs-serif">actually enjoy reading.</span></>}
    sub="A student's game is the rubric. Watch what they built, and you see what they understood."
  >
    <div className="pbs-teachers-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)', gap: 24, alignItems: 'start' }}>

      <Block tone="paper" style={{ padding: 16, overflow: 'hidden' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '6px 8px 14px', borderBottom: '1px dashed var(--pbs-line-2)',
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'var(--pbs-butter)', color: 'var(--pbs-butter-ink)',
            border: '1.5px solid var(--pbs-butter-ink)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><Icon name="book" size={14} stroke={2.2}/></div>
          <div style={{ lineHeight: 1.15 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Fractions unit · week 2</div>
            <div className="pbs-mono" style={{ fontSize: 11, color: 'var(--pbs-ink-muted)' }}>Grade 7 · 28 students</div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <Pill tone="mint">● 22 playing</Pill>
          </div>
        </div>

        <div style={{ padding: '14px 4px 6px' }}>
          <div className="pbs-mono" style={{ fontSize: 10.5, color: 'var(--pbs-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, padding: '0 6px' }}>Skill map · who gets what</div>
          <div style={{ display: 'grid', gridTemplateColumns: '100px repeat(14, 1fr)', gap: 3, padding: '0 4px' }}>
            {SKILL_ROWS.map(([skill, row]) => (
              <React.Fragment key={skill}>
                <div style={{ fontSize: 11, color: 'var(--pbs-ink-soft)', padding: '4px 6px 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{skill}</div>
                {row.map((v, j) => (
                  <div key={j} style={{ aspectRatio: '1', background: CELL_COLORS[v], border: '1px solid var(--pbs-line)', borderRadius: 4 }}/>
                ))}
              </React.Fragment>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 6px 0', fontSize: 11, color: 'var(--pbs-ink-muted)', flexWrap: 'wrap' }}>
            <span>Legend:</span>
            {LEGEND.map(([c, l]) => (
              <span key={l} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: c, border: '1px solid var(--pbs-line)' }}/> {l}
              </span>
            ))}
          </div>
        </div>

        <div style={{
          margin: '14px 4px 0', padding: '12px 14px',
          background: 'var(--pbs-coral)', border: '1.5px solid var(--pbs-coral-ink)',
          borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 999,
            background: 'var(--pbs-paper)', border: '1.5px solid var(--pbs-coral-ink)',
            color: 'var(--pbs-coral-ink)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700,
          }}>M</div>
          <div style={{ flex: 1, fontSize: 13, lineHeight: 1.45 }}>
            <strong>Mira</strong> has retried <em>½ + ¼</em> six times. Her levels skip the step where pies combine.
          </div>
          <Chunky tone="ink" style={{ padding: '6px 12px', fontSize: 12 }}>Open Mira&apos;s game</Chunky>
        </div>

        <div style={{ display: 'flex', gap: 10, padding: '14px 4px 4px', borderTop: '1px solid var(--pbs-line)', marginTop: 10 }}>
          {STATS.map(([n, l]) => (
            <div key={l} style={{ flex: 1, padding: '8px 12px', background: 'var(--pbs-cream-2)', borderRadius: 10, border: '1.5px solid var(--pbs-line)' }}>
              <div className="pbs-serif" style={{ fontSize: 22, lineHeight: 1, fontStyle: 'italic' }}>{n}</div>
              <div className="pbs-mono" style={{ fontSize: 10.5, color: 'var(--pbs-ink-muted)', marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </Block>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 8 }}>
        {BENEFITS.map((f) => (
          <Block key={f.title} tone="paper" style={{ padding: 18, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{
              flexShrink: 0,
              width: 42, height: 42, borderRadius: 12,
              background: `var(--pbs-${f.tone})`, color: `var(--pbs-${f.tone}-ink)`,
              border: `1.5px solid var(--pbs-${f.tone}-ink)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name={f.icon} size={18} stroke={2.2}/>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.015em' }}>{f.title}</div>
              <p style={{ margin: '4px 0 0', fontSize: 13.5, lineHeight: 1.5, color: 'var(--pbs-ink-soft)' }}>{f.body}</p>
            </div>
          </Block>
        ))}

        <Chunky tone="butter" trailing="arrow-right" style={{ alignSelf: 'flex-start', marginTop: 4 }}>
          Try a sample lesson
        </Chunky>
      </div>
    </div>
  </Section>
);
