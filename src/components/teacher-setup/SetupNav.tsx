// Simplified top nav for the classroom setup flow.
// Ported from Claude Design bundle (pb_classroom_setup/nav.jsx).
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/landing/pb-site/primitives';
import { SetupHelpChat } from './SetupHelpChat';

export const SetupNav = () => {
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <>
      <nav style={{ position: 'sticky', top: 12, zIndex: 40, padding: '0 16px' }}>
        <div className="pbs-wrap" style={{ padding: 0, maxWidth: 1240, margin: '0 auto' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 12, flexWrap: 'nowrap',
            padding: '8px 10px 8px 16px',
            background: 'rgba(255, 250, 240, 0.85)',
            backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
            border: '1.5px solid var(--pbs-line)', borderRadius: 999,
            boxShadow: '0 14px 30px -18px rgba(60,40,0,0.3)',
          }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 0', flexShrink: 0 }}>
              <Icon name="logo-block" size={28}/>
              <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em' }}>Playdemy</span>
              <span style={{
                marginLeft: 4, padding: '2px 8px', borderRadius: 999,
                background: 'var(--pbs-sky)', color: 'var(--pbs-sky-ink)',
                border: '1.5px solid var(--pbs-sky-ink)',
                fontSize: 10.5, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
              }}>Set up</span>
            </Link>

            <div className="pbs-mono" style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: 11.5, color: 'var(--pbs-ink-muted)',
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              <Link href="/" style={{ color: 'var(--pbs-ink-muted)' }}>Home</Link>
              <Icon name="chevron" size={11} stroke={2.2}/>
              <span style={{ color: 'var(--pbs-ink-soft)' }}>I&apos;m a teacher</span>
              <Icon name="chevron" size={11} stroke={2.2}/>
              <span style={{ color: 'var(--pbs-ink)', fontWeight: 700 }}>Set up a classroom</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <Link href="/teacher" style={{ fontSize: 13.5, fontWeight: 500, padding: '7px 10px', color: 'var(--pbs-ink-soft)', whiteSpace: 'nowrap' }}>Save &amp; exit</Link>
              <button
                type="button"
                onClick={() => setHelpOpen((v) => !v)}
                aria-expanded={helpOpen}
                aria-label="Open setup help chat"
                style={{
                  fontSize: 13.5, fontWeight: 500, padding: '7px 12px',
                  color: 'var(--pbs-ink)', whiteSpace: 'nowrap',
                  borderRadius: 999, border: '1.5px solid var(--pbs-line-2)',
                  background: helpOpen ? 'var(--pbs-mint)' : 'transparent',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  transition: 'background 160ms',
                }}
              >
                <Icon name="smile" size={14} stroke={2.2}/>
                Need help?
              </button>
            </div>
          </div>
        </div>
      </nav>

      <SetupHelpChat open={helpOpen} onClose={() => setHelpOpen(false)}/>
    </>
  );
};
