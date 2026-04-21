'use client';

// Bricks-specific left/right panels. Visually mirror the studio's
// LeftPanel / RightPanel chrome (pb-paper aside, pb-line-2 border,
// rounded-xl, 300px wide) but host the parts catalog + scheme/quality/color
// controls that normally live inside the lego-game iframe.
//
// Data flow:
//   game  →  parent : 'ready' message carries {parts, categories, colors,
//                     schemes, qualities, state}. This file renders that
//                     payload; nothing is hard-coded beyond labels.
//   panel →  game   : postMessage {source:'scratch-blocks', action: …}.
//                     The game's bridge already handles the full action
//                     surface (setTool / selectPart / setColor / setScheme /
//                     setQuality / setRotation).

import { useEffect, useMemo, useRef, useState } from 'react';
import { RotateCw, Hammer, Eraser, Blocks, Puzzle } from 'lucide-react';
import { DropdownSectionHeader, type SectionDef } from '@/components/studio/panels/DropdownSectionHeader';

export type BricksPart = { cat: string; num: string | number; name: string };
export type BricksColor = { name: string; hex: string };

export type BricksCatalog = {
  parts: BricksPart[];
  categories: string[];
  colors: BricksColor[];
  schemes: string[];
  qualities: string[];
};

export type BricksState = {
  tool: 'build' | 'delete';
  color: string | null;
  rot: number;
  scheme: string;
  quality: string;
  selectedPart: number | null;
};

type SendFn = (payload: Record<string, unknown>) => void;

// ============================ LEFT PANEL ============================
// Parts catalog: search → category tabs → part grid. First tab defaults
// to the first non-empty category in the payload.
// Left-panel sections wired to the DropdownSectionHeader. "Scratch" is a
// placeholder for a future blocks-in-panel mode; currently hosts a stub
// message so the dropdown+arrows UX is already present.
const LEFT_SECTIONS: readonly SectionDef[] = [
  { id: 'parts',   icon: Blocks, label: 'Parts'   },
  { id: 'scratch', icon: Puzzle, label: 'Scratch' },
] as const;

export function BricksLeftPanel({
  catalog,
  state,
  send,
  thumbs,
  requestThumb,
}: {
  catalog: BricksCatalog;
  state: BricksState;
  send: SendFn;
  thumbs: Record<string, string>;
  requestThumb: (partNum: string | number) => void;
}) {
  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [sectionIdx, setSectionIdx] = useState(0);

  // Categories that actually have parts in the payload (preserves source order).
  const liveCats = useMemo(() => {
    const have = new Set(catalog.parts.map((p) => p.cat));
    return catalog.categories.filter((c) => have.has(c));
  }, [catalog]);

  const cat = activeCat ?? liveCats[0] ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return catalog.parts.filter((p) => {
      if (!q && cat && p.cat !== cat) return false;
      if (!q) return true;
      return (
        String(p.num).toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.cat.toLowerCase().includes(q)
      );
    });
  }, [catalog.parts, cat, query]);

  return (
    <aside className="w-[300px] flex-shrink-0 h-full flex flex-col rounded-xl overflow-hidden"
      style={{ background: 'var(--pb-paper)', border: '1.5px solid var(--pb-line-2)' }}
    >
      <div className="shrink-0" style={{ borderBottom: '1.5px solid var(--pb-line-2)' }}>
        <DropdownSectionHeader
          sections={LEFT_SECTIONS}
          activeIndex={sectionIdx}
          onSelect={setSectionIdx}
        />
      </div>

      {LEFT_SECTIONS[sectionIdx].id === 'scratch' ? (
        <div
          className="flex-1 min-h-0 flex items-center justify-center"
          style={{ padding: 16, fontSize: 12, color: 'var(--pb-ink-muted)', textAlign: 'center' }}
        >
          Scratch blocks will live here.
        </div>
      ) : (
      <>
      <div className="shrink-0" style={{ padding: '10px 12px', borderBottom: '1.5px solid var(--pb-line-2)' }}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search parts…"
          style={{
            width: '100%', padding: '8px 10px', borderRadius: 10,
            background: 'var(--pb-paper)', border: '1.5px solid var(--pb-line-2)',
            color: 'var(--pb-ink)', fontSize: 12.5, fontFamily: 'inherit', outline: 'none',
          }}
        />
      </div>

      {/* Category tabs — hidden when searching since the list spans all cats */}
      {!query && (
        <div
          className="shrink-0"
          style={{
            display: 'flex', flexWrap: 'wrap', gap: 4, padding: '8px 10px',
            borderBottom: '1.5px solid var(--pb-line-2)',
          }}
        >
          {liveCats.map((c) => {
            const on = c === cat;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setActiveCat(c)}
                style={{
                  padding: '4px 9px', borderRadius: 8, fontSize: 11.5, fontWeight: 600,
                  fontFamily: 'inherit', cursor: 'pointer',
                  background: on ? 'var(--pb-cream-2)' : 'var(--pb-paper)',
                  border: `1.5px solid ${on ? 'var(--pb-ink)' : 'var(--pb-line-2)'}`,
                  boxShadow: on ? '0 2px 0 var(--pb-ink)' : 'none',
                  color: on ? 'var(--pb-ink)' : 'var(--pb-ink-soft)',
                }}
              >
                {c}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto" style={{ padding: '10px 10px' }}>
        {filtered.length === 0 ? (
          <div style={{ fontSize: 12, color: 'var(--pb-ink-muted)', padding: 12, textAlign: 'center' }}>
            No parts match.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
            {filtered.map((p) => {
              const selected = state.selectedPart != null && String(state.selectedPart) === String(p.num);
              return (
                <PartCard
                  key={`${p.cat}-${p.num}`}
                  part={p}
                  selected={selected}
                  thumb={thumbs[String(p.num)]}
                  requestThumb={requestThumb}
                  onSelect={() => send({ action: 'selectPart', partNum: p.num })}
                />
              );
            })}
          </div>
        )}
      </div>
      </>
      )}
    </aside>
  );
}

// Individual part tile. Uses an IntersectionObserver to lazy-request the
// 3D thumbnail from the game iframe once the card scrolls into view, then
// swaps the placeholder for the rendered PNG dataURL.
function PartCard({
  part, selected, thumb, requestThumb, onSelect,
}: {
  part: BricksPart;
  selected: boolean;
  thumb: string | undefined;
  requestThumb: (partNum: string | number) => void;
  onSelect: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const askedRef = useRef(false);

  useEffect(() => {
    if (thumb || askedRef.current) return;
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting && !askedRef.current) {
          askedRef.current = true;
          requestThumb(part.num);
          io.disconnect();
          break;
        }
      }
    }, { root: null, rootMargin: '120px' });
    io.observe(node);
    return () => io.disconnect();
  }, [thumb, part.num, requestThumb]);

  return (
    <button
      ref={ref}
      type="button"
      title={`#${part.num} — ${part.name}`}
      onClick={onSelect}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'stretch',
        gap: 4, padding: '7px 8px', borderRadius: 8, textAlign: 'left',
        background: selected ? 'var(--pb-cream-2)' : 'var(--pb-paper)',
        border: `1.5px solid ${selected ? 'var(--pb-ink)' : 'var(--pb-line-2)'}`,
        boxShadow: selected ? '0 2px 0 var(--pb-ink)' : 'none',
        color: 'var(--pb-ink)', cursor: 'pointer', fontFamily: 'inherit',
      }}
    >
      <div
        style={{
          width: '100%', aspectRatio: '1 / 1', borderRadius: 6,
          background: thumb
            ? 'transparent'
            : 'linear-gradient(160deg, var(--pb-paper), var(--pb-cream-2))',
          border: '1px solid var(--pb-line-2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {thumb && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt={part.name}
            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
          />
        )}
      </div>
      <span style={{ fontSize: 10.5, color: 'var(--pb-ink-muted)', fontWeight: 600 }}>
        #{part.num}
      </span>
      <span
        style={{
          fontSize: 11.5, fontWeight: 600, lineHeight: 1.2,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          width: '100%',
        }}
      >
        {part.name}
      </span>
    </button>
  );
}

// ============================ RIGHT PANEL ===========================
// Tool / Rotation / Scheme / Quality / Color — mirrors the in-iframe
// right dock. Color grid stays in sync with the current scheme because
// the game re-broadcasts `colors` on setScheme ack.
export function BricksRightPanel({
  catalog,
  state,
  send,
}: {
  catalog: BricksCatalog;
  state: BricksState;
  send: SendFn;
}) {
  return (
    <aside className="w-[300px] flex-shrink-0 h-full flex flex-col rounded-xl overflow-hidden"
      style={{ background: 'var(--pb-paper)', border: '1.5px solid var(--pb-line-2)' }}
    >
      <StaticHeader title="Tools" sub="Bricks Studio" />

      <div className="flex-1 min-h-0 overflow-y-auto" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Section title="Tool">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <ToggleBtn
              on={state.tool === 'build'}
              onClick={() => send({ action: 'setTool', tool: 'build' })}
              icon={<Hammer size={13} strokeWidth={2.3} />}
              label="Build"
            />
            <ToggleBtn
              on={state.tool === 'delete'}
              onClick={() => send({ action: 'setTool', tool: 'delete' })}
              icon={<Eraser size={13} strokeWidth={2.3} />}
              label="Remove"
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
            <span style={{ fontSize: 11.5, color: 'var(--pb-ink-soft)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <RotateCw size={12} strokeWidth={2.3} /> Rotate <strong style={{ color: 'var(--pb-ink)' }}>{state.rot}°</strong>
            </span>
            <button
              type="button"
              onClick={() => send({ action: 'setRotation', rot: ((state.rot + 90) % 360) })}
              style={{
                padding: '5px 12px', borderRadius: 8, fontSize: 11.5, fontWeight: 700,
                background: 'var(--pb-paper)', border: '1.5px solid var(--pb-line-2)',
                color: 'var(--pb-ink)', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              R
            </button>
          </div>
        </Section>

        <Section title="Scheme">
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(catalog.schemes.length, 1)}, 1fr)`, gap: 6 }}>
            {catalog.schemes.map((s) => (
              <ToggleBtn
                key={s}
                on={state.scheme === s}
                onClick={() => send({ action: 'setScheme', theme: s })}
                label={s.charAt(0).toUpperCase() + s.slice(1)}
              />
            ))}
          </div>
        </Section>

        <Section title="Quality">
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(catalog.qualities.length, 1)}, 1fr)`, gap: 6 }}>
            {catalog.qualities.map((q) => (
              <ToggleBtn
                key={q}
                on={state.quality === q}
                onClick={() => send({ action: 'setQuality', quality: q })}
                label={q === 'medium' ? 'Med' : q.charAt(0).toUpperCase() + q.slice(1)}
              />
            ))}
          </div>
        </Section>

        <Section title="Color">
          {catalog.colors.length === 0 ? (
            <div style={{ fontSize: 11.5, color: 'var(--pb-ink-muted)' }}>Waiting for palette…</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
              {catalog.colors.map((c) => {
                const on = (state.color || '').toLowerCase() === c.hex.toLowerCase();
                return (
                  <button
                    key={c.hex}
                    type="button"
                    title={`${c.name} (${c.hex})`}
                    onClick={() => send({ action: 'setColor', hex: c.hex.replace(/^#/, '') })}
                    style={{
                      width: '100%', aspectRatio: '1 / 1', borderRadius: 7, cursor: 'pointer',
                      background: c.hex,
                      border: `2px solid ${on ? 'var(--pb-ink)' : 'var(--pb-line-2)'}`,
                      boxShadow: on ? '0 2px 0 var(--pb-ink)' : 'none',
                      padding: 0,
                    }}
                  />
                );
              })}
            </div>
          )}
        </Section>
      </div>
    </aside>
  );
}

// ============================== helpers =============================
function StaticHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div
      className="shrink-0"
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 6, padding: '12px 14px', borderBottom: '1.5px solid var(--pb-line-2)',
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--pb-ink)', letterSpacing: 0.2 }}>{title}</span>
      {sub && (
        <span style={{ fontSize: 11, color: 'var(--pb-ink-muted)', fontWeight: 500 }}>{sub}</span>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4
        style={{
          fontSize: 11, fontWeight: 700, color: 'var(--pb-ink-muted)',
          letterSpacing: 0.6, textTransform: 'uppercase', margin: '0 0 6px 2px',
        }}
      >
        {title}
      </h4>
      {children}
    </div>
  );
}

function ToggleBtn({
  on, onClick, label, icon,
}: { on: boolean; onClick: () => void; label: string; icon?: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: 6, padding: '6px 10px', borderRadius: 8, fontSize: 11.5, fontWeight: 700,
        fontFamily: 'inherit', cursor: 'pointer',
        background: on ? 'var(--pb-cream-2)' : 'var(--pb-paper)',
        border: `1.5px solid ${on ? 'var(--pb-ink)' : 'var(--pb-line-2)'}`,
        boxShadow: on ? '0 2px 0 var(--pb-ink)' : 'none',
        color: on ? 'var(--pb-ink)' : 'var(--pb-ink-soft)',
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
