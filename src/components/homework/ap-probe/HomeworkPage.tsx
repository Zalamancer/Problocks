// Real homework page — renders HomeworkDesktop on wide viewports and
// HomeworkMobile on narrow ones. No mock browser chrome, no phone frame,
// no Phone/Desktop preview toggle — this is the production page that lives
// at a real URL (e.g. /homework/physics-1/cart-on-incline).
//
// The cream palette is pinned locally via inline CSS custom properties so
// the page always renders in cream regardless of the app-wide theme
// (dark/light/cream) — see globals.css where --pb-* vars flip per theme.

'use client';

import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HomeworkDesktop } from './HomeworkDesktop';
import { HomeworkMobile } from './HomeworkMobile';
import { TutorChatbot } from '../tutor/TutorChatbot';
import type { FRQ } from './types';

type HomeworkPageProps = {
  frq: FRQ;
  backHref?: string;
};

export function HomeworkPage({ frq, backHref = '/student' }: HomeworkPageProps) {
  const router = useRouter();
  // SSR defaults to desktop. On mount we resolve the real viewport via
  // matchMedia and swap in HomeworkMobile below the breakpoint.
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 760px)');
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  const creamPalette = {
    '--pb-cream': '#fdf6e6',
    '--pb-paper': '#fffaf0',
    '--pb-cream-2': '#f7edd4',
    '--pb-line': '#e8dcbc',
    '--pb-line-2': '#d6c896',
    '--pb-ink': '#1d1a14',
    '--pb-ink-soft': '#57524a',
    '--pb-ink-muted': '#8a8478',
    '--pb-butter': '#ffd84d',
    '--pb-butter-ink': '#6b4f00',
    '--pb-mint': '#b6f0c6',
    '--pb-mint-ink': '#0f5b2e',
    '--pb-coral': '#ffb4a2',
    '--pb-coral-ink': '#7a2a18',
    '--pb-sky': '#b9d9ff',
    '--pb-sky-ink': '#1b4a8a',
    '--pb-grape': '#dcc7ff',
    '--pb-grape-ink': '#4d2a8a',
    '--pb-pink': '#ffc8e0',
    '--pb-pink-ink': '#8a1e5c',
  } as CSSProperties;

  const handleExit = () => router.push(backHref);

  return (
    <div
      style={{
        ...creamPalette,
        height: '100vh',
        width: '100%',
        background: 'var(--pb-cream)',
        color: 'var(--pb-ink)',
        overflow: 'hidden',
      }}
    >
      {isMobile ? (
        <HomeworkMobile frq={frq} onExit={handleExit} />
      ) : (
        // Reserve 376px on the right (tutor width 340 + 18 offset + 18 gap)
        // so the right column doesn\'t slide under the chatbot.
        <div style={{ paddingRight: 376, height: '100%' }}>
          <HomeworkDesktop frq={frq} onExit={handleExit} />
        </div>
      )}
      {/* Right-rail tutor chatbot — renders on top of the homework. Hidden
          on mobile where it would overlap the sticky grade button. Once a
          real PNG rig + viseme pack lands, pass it via the `rig` prop. */}
      {!isMobile && (
        <TutorChatbot
          greeting={`Hey, I\'m your tutor for ${frq.source.title}. Ask me anything about the setup — I\'ll keep it short.`}
        />
      )}
    </div>
  );
}
