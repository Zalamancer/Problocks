// Picks Desktop vs Mobile homework layout based on viewport width.
// The design's prototype had a Phone/Desktop toggle in a mockup header —
// in a real browser we just render the layout that fits the current width.

'use client';

import { useEffect, useState } from 'react';
import { HomeworkDesktop } from './HomeworkDesktop';
import { HomeworkMobile } from './HomeworkMobile';
import type { FRQ } from './types';

const DESKTOP_MIN = 900;

type HomeworkShellProps = {
  frq: FRQ;
  onExit?: () => void;
};

export function HomeworkShell({ frq, onExit }: HomeworkShellProps) {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${DESKTOP_MIN}px)`);
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  if (isDesktop === null) {
    // Match the desktop layout on the server render so first paint doesn't flash.
    return (
      <div style={{ height: '100vh' }}>
        <HomeworkDesktop frq={frq} onExit={onExit} />
      </div>
    );
  }

  if (isDesktop) {
    return (
      <div style={{ height: '100vh' }}>
        <HomeworkDesktop frq={frq} onExit={onExit} />
      </div>
    );
  }

  return <HomeworkMobile frq={frq} onExit={onExit} />;
}
