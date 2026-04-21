'use client';

// Two-pane shell: Scratch blocks-only editor on the left, game iframe on the
// right. The parent acts as a postMessage bridge so that the blocks iframe
// and the game iframe can talk to each other without knowing about one
// another directly.
//
// Wire protocol (to be expanded as the block→character mapping evolves):
//   blocks → game   : { source: 'scratch-blocks', type: '...', ... }
//   game   → blocks : { source: 'game',           type: '...', ... }
//
// The shell is game-agnostic; each game page (3D bricks, future 2D games,
// etc.) just supplies its own `gameSrc`.

import { useEffect, useRef } from 'react';
import { DesktopOnly } from '@/components/DesktopOnly';

type BlocksGameShellProps = {
  title: string;
  gameSrc: string;
  blocksSrc?: string;
  description?: string;
};

export function BlocksGameShell({
  title,
  gameSrc,
  blocksSrc = '/scratch/blocks-only.html',
  description = 'The block editor and game stage need a wider screen. Open on a laptop or desktop.',
}: BlocksGameShellProps) {
  const blocksRef = useRef<HTMLIFrameElement>(null);
  const gameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== 'object') return;

      // blocks → game
      if (data.source === 'scratch-blocks' && gameRef.current?.contentWindow) {
        gameRef.current.contentWindow.postMessage(data, '*');
        return;
      }

      // game → blocks
      if (data.source === 'game' && blocksRef.current?.contentWindow) {
        blocksRef.current.contentWindow.postMessage(data, '*');
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return (
    <DesktopOnly title={`${title} is desktop-only`} description={description}>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'grid',
          gridTemplateColumns: 'minmax(360px, 40%) 1fr',
          background: '#1e1e1e',
        }}
      >
        <iframe
          ref={blocksRef}
          src={blocksSrc}
          title="Scratch Blocks"
          style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
          allow="camera; microphone; autoplay; clipboard-read; clipboard-write"
        />
        <iframe
          ref={gameRef}
          src={gameSrc}
          title={title}
          style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
          allow="autoplay; clipboard-read; clipboard-write"
        />
      </div>
    </DesktopOnly>
  );
}
