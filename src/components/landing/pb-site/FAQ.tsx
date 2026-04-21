'use client';

import React from 'react';
import { Block, Icon, Section } from './primitives';

const FAQS = [
  { q: 'Do students need to know how to code?',
    a: "Not at all. They describe what they want in plain English, and Claude generates the game. As they get curious, they can peek at the source code — it's real, readable JavaScript." },
  { q: 'Is the AI safe for kids?',
    a: 'Yes. ProBlocks uses age-gated generators, content filters, and teacher-approved publishing. You review everything before it leaves your classroom.' },
  { q: 'How does the revenue share work?',
    a: 'Every play of a published game puts credit into the class pool. 70% of gross revenue goes back to the class; they can spend it on more generator credits or cash it out at the end of term.' },
  { q: 'What devices does it work on?',
    a: "Anything with a modern browser. Chromebooks, iPads, Windows laptops, Macs — there's nothing to install." },
  { q: 'Can I use it for a specific curriculum?',
    a: 'Yes. We ship rubrics aligned to CSTA, ISTE and UK Computing, and every game produces an artifact you can grade. You can also write custom assignment templates.' },
  { q: 'What if my school blocks AI tools?',
    a: "We've worked with 40+ districts through their approval processes. Our admin console gives you audit logs, content policies and data residency controls — bring us to IT, we'll help you through it." },
];

export const FAQ = () => {
  const [open, setOpen] = React.useState(0);
  return (
    <Section
      id="faq"
      label="Questions"
      kicker="mint"
      title={<>We&apos;ve heard these <span className="pbs-serif">a lot.</span></>}
      sub="If something's missing, email hello@playdemy.app — we answer every message."
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
                  textAlign: 'left', background: 'transparent', border: 0, cursor: 'pointer',
                  font: 'inherit', color: 'inherit',
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
