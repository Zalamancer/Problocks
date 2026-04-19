'use client';

import React from 'react';
import { Block, Icon, Section } from '../pb-site/primitives';

const FAQS: Array<{ q: string; a: string }> = [
  { q: "Is this just gamified worksheets?",
    a: "No. Students actually build the world they're learning in — the game wraps the concept, it doesn't hide it. Slicing pizzas to make ⅓ IS fractions." },
  { q: "What if my kid already hates video games?",
    a: "The games are tiny — 2–5 minutes each — and they can design them however they want. Kids who hate shooters happily build cozy cat gardens that quiz them on biology." },
  { q: "How do you keep chat safe?",
    a: "Class chat is teacher-moderated. No DMs outside the class, a kindness filter softens mean messages, and Claude flags anything suspicious. You approve the full member list." },
  { q: "Do students need to read well?",
    a: "ProBlocks reads everything aloud if you want. Prompts can be spoken, hints are voiced, and Claude shows rather than tells whenever it can." },
  { q: "Is it aligned to a curriculum?",
    a: "Yes — lessons map to CSTA, NGSS, Common Core and UK Computing. Every game produces an artifact you can hand to a rubric." },
  { q: "What ages is it for?",
    a: "Built for ages 10 and up. We also have a Junior mode for grades 3–5 with bigger buttons and simpler prompts." },
];

export const FAQ = () => {
  const [open, setOpen] = React.useState(0);
  return (
    <Section
      id="faq"
      label="Questions"
      kicker="butter"
      title={<>Parents &amp; teachers <span className="pbs-serif">ask this first.</span></>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 820 }}>
        {FAQS.map((item, i) => {
          const isOpen = open === i;
          return (
            <Block key={item.q} tone={isOpen ? 'cream' : 'paper'} style={{ padding: 0, overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? -1 : i)}
                style={{
                  width: '100%', padding: '18px 22px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                  textAlign: 'left', background: 'transparent',
                  border: 0, cursor: 'pointer', color: 'inherit', fontFamily: 'inherit',
                }}>
                <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em' }}>{item.q}</span>
                <span style={{
                  flexShrink: 0, width: 28, height: 28, borderRadius: 8,
                  background: isOpen ? 'var(--pbs-ink)' : 'var(--pbs-cream-2)',
                  color: isOpen ? 'var(--pbs-cream)' : 'var(--pbs-ink)',
                  border: `1.5px solid ${isOpen ? 'var(--pbs-ink)' : 'var(--pbs-line-2)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transform: isOpen ? 'rotate(45deg)' : 'rotate(0)',
                  transition: 'transform 180ms ease',
                }}>
                  <Icon name="plus" size={14} stroke={2.4}/>
                </span>
              </button>
              {isOpen && (
                <div style={{
                  padding: '0 22px 22px',
                  fontSize: 14.5, color: 'var(--pbs-ink-soft)', lineHeight: 1.6, maxWidth: 660,
                }}>{item.a}</div>
              )}
            </Block>
          );
        })}
      </div>
    </Section>
  );
};
