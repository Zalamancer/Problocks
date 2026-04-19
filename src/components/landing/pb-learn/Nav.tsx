'use client';

import React from 'react';
import Link from 'next/link';
import { Icon } from '../pb-site/primitives';

export const Nav = ({ onMakeGame }: { onMakeGame?: () => void }) => {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links: Array<[string, string]> = [
    ['How it works', '#learn'],
    ['Chat', '#chat'],
    ['Students', '#students'],
    ['Teachers', '#teachers'],
    ['Subjects', '#subjects'],
  ];

  return (
    <nav style={{ position: 'sticky', top: 12, zIndex: 40, padding: '0 16px' }}>
      <div className="pbs-wrap" style={{ padding: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 12, flexWrap: 'nowrap',
          padding: '8px 10px 8px 16px',
          background: scrolled ? 'rgba(255, 250, 240, 0.85)' : 'rgba(255, 250, 240, 0.6)',
          backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
          border: '1.5px solid var(--pbs-line)', borderRadius: 999,
          boxShadow: scrolled ? '0 14px 30px -18px rgba(60,40,0,0.3)' : 'none',
          transition: 'box-shadow 200ms, background 200ms',
        }}>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 0', flexShrink: 0 }}>
            <Icon name="logo-block" size={28}/>
            <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em' }}>ProBlocks</span>
            <span style={{
              marginLeft: 4, padding: '2px 8px', borderRadius: 999,
              background: 'var(--pbs-mint)', color: 'var(--pbs-mint-ink)',
              border: '1.5px solid var(--pbs-mint-ink)',
              fontSize: 10.5, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
            }}>Learn</span>
          </a>

          <div style={{ display: 'flex', alignItems: 'center', gap: 0, flexShrink: 1, minWidth: 0, overflow: 'hidden' }}>
            {links.map(([label, href]) => (
              <a key={label} href={href} style={{
                fontSize: 13.5, fontWeight: 500,
                padding: '7px 10px', borderRadius: 999,
                color: 'var(--pbs-ink-soft)', transition: 'color 120ms, background 120ms',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--pbs-ink)'; e.currentTarget.style.background = 'rgba(29,26,20,0.05)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--pbs-ink-soft)'; e.currentTarget.style.background = 'transparent'; }}
              >{label}</a>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <Link href="/studio" style={{ fontSize: 13.5, fontWeight: 500, padding: '7px 10px', color: 'var(--pbs-ink-soft)', whiteSpace: 'nowrap' }}>Log in</Link>
            <button
              type="button"
              onClick={onMakeGame}
              className="pbs-chunky pbs-chunky-butter"
              style={{ padding: '8px 14px', fontSize: 13, whiteSpace: 'nowrap' }}
            >
              Make a Game
              <Icon name="arrow-right" size={13} stroke={2.4}/>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
