'use client';

// Two-pane shell: Scratch blocks-only editor on the left, game iframe on the
// right. The parent acts as a postMessage bridge so that the blocks iframe
// and the game iframe can talk to each other without knowing about one
// another directly.
//
// Wire protocol (evolves as the block→character mapping grows):
//   blocks → game   : { source: 'scratch-blocks', action: '...', ...args }
//   game   → blocks : { source: 'game',           type:   'ack'|'error'|'ready', action, ... }
//
// The shell is game-agnostic; each game page (3D bricks, future 2D games,
// etc.) just supplies its own `gameSrc`. Append `?dev=1` to the URL to
// show a small dev toolbar that fires test commands directly at the game
// iframe — useful for proving the pipe before Scratch-side blocks exist.

import { useEffect, useRef, useState } from 'react';
import { DesktopOnly } from '@/components/DesktopOnly';

type BlocksGameShellProps = {
  title: string;
  gameSrc: string;
  blocksSrc?: string;
  description?: string;
};

type BridgeMessage = {
  source: 'scratch-blocks' | 'game';
  [key: string]: unknown;
};

export function BlocksGameShell({
  title,
  gameSrc,
  blocksSrc = '/scratch/blocks-only.html',
  description = 'The block editor and game stage need a wider screen. Open on a laptop or desktop.',
}: BlocksGameShellProps) {
  const blocksRef = useRef<HTMLIFrameElement>(null);
  const gameRef = useRef<HTMLIFrameElement>(null);
  // Read ?dev=1 from window.location on mount. Avoids pulling in
  // next/navigation's useSearchParams, which would force a Suspense
  // boundary on this otherwise-static page.
  const [devMode, setDevMode] = useState(false);
  const [lastGameEvent, setLastGameEvent] = useState<string>('');

  useEffect(() => {
    try { setDevMode(new URLSearchParams(window.location.search).get('dev') === '1'); }
    catch { /* noop */ }
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data as BridgeMessage | null | undefined;
      if (!data || typeof data !== 'object') return;

      // blocks → game
      if (data.source === 'scratch-blocks' && gameRef.current?.contentWindow) {
        gameRef.current.contentWindow.postMessage(data, '*');
        return;
      }

      // game → blocks (+ dev log)
      if (data.source === 'game') {
        if (blocksRef.current?.contentWindow) {
          blocksRef.current.contentWindow.postMessage(data, '*');
        }
        if (devMode) setLastGameEvent(JSON.stringify(data));
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [devMode]);

  const send = (payload: Record<string, unknown>) => {
    const win = gameRef.current?.contentWindow;
    if (!win) return;
    win.postMessage({ source: 'scratch-blocks', ...payload }, '*');
  };

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

        {devMode && (
          <div
            style={{
              position: 'fixed',
              bottom: 12,
              right: 12,
              zIndex: 999,
              background: 'rgba(17,17,17,0.92)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 10,
              padding: 10,
              color: '#eee',
              fontFamily: 'ui-sans-serif, system-ui',
              fontSize: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              maxWidth: 360,
            }}
          >
            <div style={{ opacity: 0.75, fontWeight: 600, letterSpacing: 0.4 }}>
              BRIDGE DEV — game ← parent
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              <DevBtn label="ping"        onClick={() => send({ action: 'ping' })} />
              <DevBtn label="tool:build"  onClick={() => send({ action: 'setTool', tool: 'build' })} />
              <DevBtn label="tool:delete" onClick={() => send({ action: 'setTool', tool: 'delete' })} />
              <DevBtn label="part 3004 (1×2)" onClick={() => send({ action: 'selectPart', partNum: 3004 })} />
              <DevBtn label="color red"   onClick={() => send({ action: 'setColor', hex: 'FF3B30' })} />
              <DevBtn label="rot 90"      onClick={() => send({ action: 'setRotation', rot: 90 })} />
              <DevBtn label="build @0,0"  onClick={() => send({ action: 'build', gx: 0, gz: 0, layer: 0 })} />
              <DevBtn label="walk +5z"    onClick={() => send({ action: 'moveCharacter', dz: 5 })} />
              <DevBtn label="turn 45°"    onClick={() => send({ action: 'turnCharacter', deg: 45 })} />
            </div>
            <div
              style={{
                marginTop: 4,
                padding: 6,
                background: 'rgba(255,255,255,0.04)',
                borderRadius: 6,
                fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                fontSize: 11,
                lineHeight: 1.4,
                wordBreak: 'break-all',
                color: '#b5ffd8',
                minHeight: 18,
              }}
            >
              {lastGameEvent || '(waiting for game reply…)'}
            </div>
          </div>
        )}
      </div>
    </DesktopOnly>
  );
}

function DevBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.14)',
        color: '#eee',
        borderRadius: 6,
        padding: '4px 8px',
        fontSize: 11,
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}
