'use client';

import { useEffect, useRef, useState } from 'react';
import { useFreeform, type FreeformCharacter } from '@/store/freeform-store';

/**
 * Renders all characters onto the freeform canvas and, when `playing` is
 * true, runs the WASD/arrow-key movement loop so the first character walks
 * around and cycles its sprite frames.
 *
 * Sprite sheet convention — uniform `cols × rows` grid, where rows are:
 *   row 0 = face down  (walking toward camera)
 *   row 1 = face left
 *   row 2 = face right
 *   row 3 = face up
 *
 * Each direction animates across all `cols` frames at `fps`. Idle =
 * direction row's frame 0.
 *
 * We render a cropped slice of the full sheet using an SVG `<clipPath>`
 * + translated `<image>` (spritesheet UV hack), since SVG `<image>` has
 * no native frame-offset support.
 *
 * Edit mode: characters are picked/moved via the normal select tool by
 * clicking them. Play mode: only the active (first) character receives
 * input; others stand still on their idle frame.
 */

type Dir = 'down' | 'left' | 'right' | 'up';
const DIR_ROW: Record<Dir, number> = { down: 0, left: 1, right: 2, up: 3 };

interface RuntimeState {
  x: number;
  y: number;
  dir: Dir;
  moving: boolean;
  frame: number;
  /** Monotonic ms accumulator for frame advancement. */
  frameAccumMs: number;
}

export function CharacterLayer({ zoom }: { zoom: number }) {
  const characters = useFreeform((s) => s.characters);
  const playing = useFreeform((s) => s.playing);
  const selectedCharacterId = useFreeform((s) => s.selectedCharacterId);
  const updateCharacter = useFreeform((s) => s.updateCharacter);

  // Per-character runtime state, keyed by id. Kept in a ref + React state
  // so the render layer can reflect the current frame without tearing down
  // the whole loop on every tick.
  const runtimeRef = useRef<Map<string, RuntimeState>>(new Map());
  const [, forceTick] = useState(0);

  // Seed runtime state whenever a character is added/removed so new
  // characters show up mid-session without a reload.
  useEffect(() => {
    const rt = runtimeRef.current;
    for (const c of characters) {
      if (!rt.has(c.id)) {
        rt.set(c.id, { x: c.x, y: c.y, dir: 'down', moving: false, frame: 0, frameAccumMs: 0 });
      }
    }
    for (const id of Array.from(rt.keys())) {
      if (!characters.find((c) => c.id === id)) rt.delete(id);
    }
  }, [characters]);

  // Snapshot store positions into runtime whenever play mode (re)starts,
  // and write runtime positions back to the store when play mode ends —
  // so the player's final position isn't lost and editing resumes from
  // the current spot.
  useEffect(() => {
    const rt = runtimeRef.current;
    if (playing) {
      for (const c of characters) {
        const cur = rt.get(c.id);
        if (cur) { cur.x = c.x; cur.y = c.y; cur.frame = 0; cur.moving = false; }
      }
    } else {
      for (const c of characters) {
        const cur = rt.get(c.id);
        if (cur) updateCharacter(c.id, { x: cur.x, y: cur.y });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  // Keyboard input — tracked as a ref'd set so the rAF loop reads the
  // latest keys without re-subscribing each frame.
  const keysRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!playing) { keysRef.current.clear(); return; }
    function down(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      keysRef.current.add(e.key.toLowerCase());
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    }
    function up(e: KeyboardEvent) { keysRef.current.delete(e.key.toLowerCase()); }
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [playing]);

  // The play loop — only runs while playing. We animate the FIRST
  // character (the "player"); remaining characters stand on their idle
  // frame. A multi-character control system can come later.
  useEffect(() => {
    if (!playing) return;
    if (characters.length === 0) return;
    const playerId = characters[0].id;
    let rafId = 0;
    let lastT = performance.now();

    function tick(now: number) {
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;
      const rt = runtimeRef.current;
      const cur = rt.get(playerId);
      const char = useFreeform.getState().characters.find((c) => c.id === playerId);
      if (cur && char) {
        const keys = keysRef.current;
        let vx = 0, vy = 0;
        if (keys.has('arrowleft') || keys.has('a')) vx -= 1;
        if (keys.has('arrowright') || keys.has('d')) vx += 1;
        if (keys.has('arrowup') || keys.has('w')) vy -= 1;
        if (keys.has('arrowdown') || keys.has('s')) vy += 1;
        const mag = Math.hypot(vx, vy);
        if (mag > 0) {
          vx /= mag; vy /= mag;
          cur.x += vx * char.speed * dt;
          cur.y += vy * char.speed * dt;
          // Facing — prefer horizontal when both axes are active, since
          // that's the convention most 2D RPGs follow.
          if (Math.abs(vx) >= Math.abs(vy)) cur.dir = vx < 0 ? 'left' : 'right';
          else cur.dir = vy < 0 ? 'up' : 'down';
          cur.moving = true;
          cur.frameAccumMs += dt * 1000;
          const frameMs = 1000 / Math.max(1, char.fps);
          while (cur.frameAccumMs >= frameMs) {
            cur.frameAccumMs -= frameMs;
            cur.frame = (cur.frame + 1) % Math.max(1, char.cols);
          }
        } else {
          cur.moving = false;
          cur.frame = 0;
          cur.frameAccumMs = 0;
        }
      }
      forceTick((n) => (n + 1) & 0xffff);
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [playing, characters.length, characters]);

  if (characters.length === 0) return null;

  return (
    <g>
      <defs>
        {characters.map((c) => (
          <clipPath key={c.id} id={`char-clip-${c.id}`}>
            <rect x={-c.width / 2} y={-c.height / 2} width={c.width} height={c.height} />
          </clipPath>
        ))}
      </defs>
      {characters.map((c) => {
        const cur = runtimeRef.current.get(c.id);
        const dir: Dir = cur?.dir ?? 'down';
        const frame = cur?.frame ?? 0;
        const px = playing && cur ? cur.x : c.x;
        const py = playing && cur ? cur.y : c.y;
        const row = DIR_ROW[dir] ?? 0;
        const col = Math.max(0, Math.min(c.cols - 1, frame));
        // Full-sheet size in world units, matching one-frame = c.width/height.
        const sheetW = c.width * c.cols;
        const sheetH = c.height * c.rows;
        // Offset the image so the current frame's top-left lands on our
        // clip rect's top-left (-w/2, -h/2).
        const ix = -c.width / 2 - col * c.width;
        const iy = -c.height / 2 - row * c.height;
        const isSelected = !playing && c.id === selectedCharacterId;
        return (
          <g key={c.id} transform={`translate(${px} ${py})`} data-character-id={c.id}>
            <g clipPath={`url(#char-clip-${c.id})`}>
              <image
                href={c.src}
                x={ix}
                y={iy}
                width={sheetW}
                height={sheetH}
                preserveAspectRatio="none"
                style={{ imageRendering: 'pixelated' }}
              />
            </g>
            {/* Selection ring (edit mode only) */}
            {isSelected && (
              <rect
                x={-c.width / 2}
                y={-c.height / 2}
                width={c.width}
                height={c.height}
                fill="none"
                stroke="#10b981"
                strokeWidth={2 / zoom}
                strokeDasharray={`${4 / zoom} ${3 / zoom}`}
                vectorEffect="non-scaling-stroke"
                pointerEvents="none"
              />
            )}
          </g>
        );
      })}
    </g>
  );
}

/**
 * Hit-test a world point against characters, top-most first. Used by the
 * select tool so clicking a character picks it up just like an image.
 */
export function pickCharacter(
  wx: number,
  wy: number,
  characters: FreeformCharacter[],
): FreeformCharacter | null {
  for (let i = characters.length - 1; i >= 0; i--) {
    const c = characters[i];
    if (
      wx >= c.x - c.width / 2 && wx <= c.x + c.width / 2 &&
      wy >= c.y - c.height / 2 && wy <= c.y + c.height / 2
    ) return c;
  }
  return null;
}
