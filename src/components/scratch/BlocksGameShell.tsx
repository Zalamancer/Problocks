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

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { DesktopOnly } from '@/components/DesktopOnly';
import { useThemeEffect } from '@/hooks/useThemeEffect';
import {
  BricksLeftPanel,
  BricksRightPanel,
  type BricksCatalog,
  type BricksColor,
  type BricksPart,
  type BricksState,
  type LeftSection,
} from './BricksPanels';

const EMPTY_CATALOG: BricksCatalog = {
  parts: [],
  categories: [],
  colors: [],
  schemes: ['vibrant', 'classic'],
  qualities: ['high', 'medium', 'low'],
};

const INITIAL_STATE: BricksState = {
  tool: 'build',
  color: null,
  rot: 0,
  scheme: 'classic',
  quality: 'high',
  selectedPart: null,
};

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
  useThemeEffect();
  const blocksRef = useRef<HTMLIFrameElement>(null);
  const gameRef = useRef<HTMLIFrameElement>(null);
  // Read ?dev=1 from window.location on mount. Avoids pulling in
  // next/navigation's useSearchParams, which would force a Suspense
  // boundary on this otherwise-static page.
  const [devMode, setDevMode] = useState(false);
  const [lastGameEvent, setLastGameEvent] = useState<string>('');

  // Parts/colors catalog + current tool/color/rot/scheme/quality state
  // pushed from the game on 'ready' and kept live via ack messages.
  const [catalog, setCatalog] = useState<BricksCatalog>(EMPTY_CATALOG);
  const [bricksState, setBricksState] = useState<BricksState>(INITIAL_STATE);
  // Part-number → PNG dataURL, filled as the React grid scrolls and asks
  // the game for each thumbnail. Keyed by string so numeric vs string
  // partNum payloads from ack messages collide cleanly.
  const [thumbs, setThumbs] = useState<Record<string, string>>({});

  // Which left-panel section is active. Drives both the dropdown header
  // in BricksLeftPanel and the overlay positioning of the Scratch blocks
  // iframe (see scratchOverlayRect below).
  const [leftSection, setLeftSection] = useState<LeftSection>('parts');

  // Shared coordinate space for the single scratch-blocks iframe. The
  // iframe is mounted once (so the VM state persists across section
  // swaps) and absolute-positioned over whichever slot is active:
  //   leftSection === 'parts'   → partsSlotRef   (center-left column)
  //   leftSection === 'scratch' → scratchSlotRef (inside the left panel)
  const shellRootRef   = useRef<HTMLDivElement>(null);
  const partsSlotRef   = useRef<HTMLDivElement>(null);
  const scratchSlotRef = useRef<HTMLDivElement>(null);
  const [blocksRect, setBlocksRect] = useState<
    { left: number; top: number; width: number; height: number } | null
  >(null);

  // Add ?embed=1 to the game URL so it hides its in-iframe Parts/Scheme
  // docks — the outer Problocks panels own that chrome now. Purely
  // string-based so it's SSR-safe (no window reference).
  const embeddedGameSrc = useMemo(() => {
    const [pathAndQuery, hash = ''] = gameSrc.split('#');
    const [path, query = ''] = pathAndQuery.split('?');
    const params = new URLSearchParams(query);
    params.set('embed', '1');
    const qs = params.toString();
    return path + (qs ? `?${qs}` : '') + (hash ? `#${hash}` : '');
  }, [gameSrc]);

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

      // game → blocks (+ dev log) — and also mirror catalog/state into
      // the outer React panels so Parts / Scheme / Quality / Color stay
      // in sync without duplicating the data model.
      if (data.source === 'game') {
        if (blocksRef.current?.contentWindow) {
          blocksRef.current.contentWindow.postMessage(data, '*');
        }
        if (devMode) setLastGameEvent(JSON.stringify(data));

        const isFullCatalog =
          data.type === 'ready' ||
          (data.type === 'ack' && data.action === 'getCatalog');

        if (isFullCatalog) {
          const parts     = Array.isArray(data.parts)      ? (data.parts      as BricksPart[])  : [];
          const cats      = Array.isArray(data.categories) ? (data.categories as string[])      : [];
          const colors    = Array.isArray(data.colors)     ? (data.colors     as BricksColor[]) : [];
          const schemes   = Array.isArray(data.schemes)    ? (data.schemes    as string[])      : EMPTY_CATALOG.schemes;
          const qualities = Array.isArray(data.qualities)  ? (data.qualities  as string[])      : EMPTY_CATALOG.qualities;
          setCatalog({ parts, categories: cats, colors, schemes, qualities });
          const s = (data.state ?? {}) as Partial<BricksState>;
          setBricksState((prev) => ({
            ...prev,
            tool:    s.tool    ?? prev.tool,
            color:   s.color   ?? prev.color,
            rot:     s.rot     ?? prev.rot,
            scheme:  s.scheme  ?? prev.scheme,
            quality: s.quality ?? prev.quality,
          }));
        } else if (data.type === 'ack') {
          const action = data.action as string | undefined;
          if (action === 'setTool' && typeof data.tool === 'string') {
            setBricksState((p) => ({ ...p, tool: data.tool === 'delete' ? 'delete' : 'build' }));
          } else if (action === 'setColor' && typeof data.hex === 'string') {
            setBricksState((p) => ({ ...p, color: data.hex as string }));
          } else if (action === 'setRotation' && typeof data.rot === 'number') {
            setBricksState((p) => ({ ...p, rot: data.rot as number }));
          } else if (action === 'selectPart' && data.partNum != null) {
            setBricksState((p) => ({ ...p, selectedPart: Number(data.partNum) }));
          } else if (action === 'setScheme' && typeof data.theme === 'string') {
            setBricksState((p) => ({ ...p, scheme: data.theme as string }));
            if (Array.isArray(data.colors)) {
              const hexes = data.colors as string[];
              setCatalog((c) => ({
                ...c,
                // Preserve names when count matches; otherwise derive placeholder names.
                colors: hexes.map((hex, i) => ({
                  name: c.colors[i]?.name ?? hex,
                  hex,
                })),
              }));
            }
          } else if (action === 'setQuality' && typeof data.quality === 'string') {
            setBricksState((p) => ({ ...p, quality: data.quality as string }));
          } else if (action === 'getThumb' && typeof data.dataUrl === 'string' && data.partNum != null) {
            const key = String(data.partNum);
            const url = data.dataUrl as string;
            setThumbs((t) => (t[key] ? t : { ...t, [key]: url }));
          }
        }
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [devMode]);

  const send = useCallback((payload: Record<string, unknown>) => {
    const win = gameRef.current?.contentWindow;
    if (!win) return;
    win.postMessage({ source: 'scratch-blocks', ...payload }, '*');
  }, []);

  // Ask the game to render and return a PNG dataURL for `partNum`. We
  // guard duplicate requests here (in addition to the per-card askedRef)
  // so a re-render of the grid doesn't re-trigger renders already in flight.
  const pendingThumbRef = useRef<Set<string>>(new Set());
  const requestThumb = useCallback((partNum: string | number) => {
    const key = String(partNum);
    if (pendingThumbRef.current.has(key)) return;
    pendingThumbRef.current.add(key);
    send({ action: 'getThumb', partNum });
  }, [send]);

  // Pull-based catalog sync: the game's one-shot 'ready' broadcast often
  // races ahead of React's mount, and iframe `onLoad` fires inconsistently
  // under HMR. Poll `getCatalog` on mount until the React state reports
  // a non-empty parts list, then stop. 30 tries × 300ms ≈ 9 seconds.
  const gotCatalogRef = useRef(false);
  useEffect(() => {
    gotCatalogRef.current = catalog.parts.length > 0;
  }, [catalog.parts.length]);

  useEffect(() => {
    let cancelled = false;
    let tries = 0;
    const tick = () => {
      if (cancelled) return;
      if (gotCatalogRef.current) return;
      if (tries++ > 30) return;
      send({ action: 'getCatalog' });
      setTimeout(tick, 300);
    };
    // Kick off after a small delay so the iframe has a chance to register
    // its own message listener first on slow starts.
    const id = setTimeout(tick, 250);
    return () => { cancelled = true; clearTimeout(id); };
  }, [send]);

  // Keep the scratch iframe's absolute rect in sync with whichever slot
  // is currently active. Re-measures on section swap, window resize, and
  // whenever either slot changes size (e.g. left-panel Scratch tab opening
  // after a narrow-viewport layout shift). All coords are relative to
  // shellRootRef so the overlay iframe can live at that level of the tree.
  useLayoutEffect(() => {
    const shell = shellRootRef.current;
    const target = leftSection === 'scratch' ? scratchSlotRef.current : partsSlotRef.current;
    if (!shell || !target) {
      setBlocksRect(null);
      return;
    }
    const measure = () => {
      const s = shell.getBoundingClientRect();
      const t = target.getBoundingClientRect();
      setBlocksRect({
        left: t.left - s.left,
        top: t.top - s.top,
        width: t.width,
        height: t.height,
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(shell);
    ro.observe(target);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [leftSection]);

  return (
    <DesktopOnly title={`${title} is desktop-only`} description={description}>
      <div
        className="h-screen w-screen flex flex-col overflow-hidden font-sans p-1.5 gap-1.5"
        style={{ background: 'var(--panel-bg)', color: 'var(--pb-ink)' }}
      >
        <div ref={shellRootRef} className="flex-1 relative min-h-0">
          <div className="h-full flex overflow-hidden gap-1.5">
            {/* Bricks Parts catalog / Scratch slot — replaces studio's
                generic LeftPanel. When section=='scratch' the panel
                exposes scratchSlotRef and the shell overlays the blocks
                iframe there; otherwise the center-left partsSlot hosts it. */}
            <BricksLeftPanel
              catalog={catalog}
              state={bricksState}
              send={send}
              thumbs={thumbs}
              requestThumb={requestThumb}
              section={leftSection}
              onSectionChange={setLeftSection}
              scratchSlotRef={scratchSlotRef}
            />

            {/* Center — Scratch blocks slot (left) + Game iframe (right).
                The slot div collapses when the Scratch section is active
                so the game can expand to full width. */}
            <div
              className="flex-1 relative flex rounded-xl overflow-hidden min-w-0"
              style={{
                background: 'var(--pb-paper)',
                border: '1.5px solid var(--pb-line-2)',
              }}
            >
              <div
                ref={partsSlotRef}
                style={{
                  flex: leftSection === 'scratch' ? '0 0 0px' : '0 0 42%',
                  minWidth: leftSection === 'scratch' ? 0 : 360,
                  width: leftSection === 'scratch' ? 0 : undefined,
                  borderRight: leftSection === 'scratch' ? 'none' : '1.5px solid var(--pb-line-2)',
                  background: '#1e1e1e',
                  overflow: 'hidden',
                  transition: 'flex-basis 180ms ease, min-width 180ms ease',
                }}
              />
              <div style={{ flex: 1, minWidth: 0, background: '#1e1e1e' }}>
                <iframe
                  ref={gameRef}
                  src={embeddedGameSrc}
                  title={title}
                  style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
                  allow="autoplay; clipboard-read; clipboard-write"
                />
              </div>
            </div>

            {/* Bricks Tools — Tool / Rotation / Scheme / Quality / Color.
                Replaces studio's generic RightPanel so the game's right
                dock moves out of the iframe into the outer shell. */}
            <BricksRightPanel catalog={catalog} state={bricksState} send={send} />
          </div>

          {/* Single scratch-blocks iframe, absolute-positioned over the
              currently active slot. Mounted once so the VM persists when
              the user toggles between Parts and Scratch sections. */}
          <div
            aria-hidden={blocksRect == null}
            style={{
              position: 'absolute',
              pointerEvents: blocksRect ? 'auto' : 'none',
              left:   blocksRect?.left   ?? 0,
              top:    blocksRect?.top    ?? 0,
              width:  blocksRect?.width  ?? 0,
              height: blocksRect?.height ?? 0,
              background: '#1e1e1e',
              overflow: 'hidden',
              transition: 'left 180ms ease, top 180ms ease, width 180ms ease, height 180ms ease',
            }}
          >
            <iframe
              ref={blocksRef}
              src={blocksSrc}
              title="Scratch Blocks"
              style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
              allow="camera; microphone; autoplay; clipboard-read; clipboard-write"
            />
          </div>
        </div>

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
