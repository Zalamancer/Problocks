'use client';

import { useMemo, useState } from 'react';
import { PREFABS, PREFAB_CATEGORIES } from '@/lib/kid-style-3d/prefabs';

export interface PrefabPaletteProps {
  onAdd: (kind: string) => void;
}

/**
 * Floating prefab palette for the 3D Freeform studio. Bottom-centered
 * bar with category tabs + a row of prefab tiles. Clicking a tile adds
 * a new instance at the world origin (or the hovered ground point —
 * future). Sits over the canvas so the right-hand Properties / left-
 * hand Assets global panels are free for other uses.
 *
 * Style comes from the Problocks chunky-pastel tokens via CSS vars so
 * it matches the rest of the studio without needing a full rebuild of
 * the panel-controls for floating UI.
 */
export function PrefabPalette({ onAdd }: PrefabPaletteProps) {
  const [category, setCategory] = useState<(typeof PREFAB_CATEGORIES)[number]['id']>('primitives');

  const items = useMemo(() => PREFABS.filter((p) => p.category === category), [category]);

  return (
    <div
      className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2"
      style={{ zIndex: 10 }}
    >
      <div
        className="pointer-events-auto flex flex-col items-stretch gap-2"
        style={{
          background: 'var(--pb-paper)',
          border: '1.5px solid var(--pb-line-2)',
          borderRadius: 14,
          padding: 10,
          boxShadow: '0 4px 0 var(--pb-line-2)',
          minWidth: 520,
          maxWidth: 800,
        }}
      >
        {/* Category tabs */}
        <div className="flex items-center gap-1">
          {PREFAB_CATEGORIES.map((cat) => {
            const active = cat.id === category;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className="cursor-pointer transition-colors"
                style={{
                  padding: '6px 12px',
                  fontSize: 12,
                  fontWeight: active ? 800 : 600,
                  fontFamily: 'inherit',
                  color: active ? 'var(--pb-ink)' : 'var(--pb-ink-muted)',
                  background: active ? 'var(--pb-cream-2)' : 'transparent',
                  border: '1.5px solid',
                  borderColor: active ? 'var(--pb-ink)' : 'transparent',
                  borderRadius: 9,
                  boxShadow: active ? '0 2px 0 var(--pb-ink)' : 'none',
                  letterSpacing: 0.2,
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Prefab tiles */}
        <div className="flex items-stretch gap-1.5 overflow-x-auto" style={{ scrollbarWidth: 'thin' }}>
          {items.map((p) => (
            <button
              key={p.kind}
              type="button"
              onClick={() => onAdd(p.kind)}
              title={p.label}
              className="cursor-pointer transition-colors"
              style={{
                flex: '0 0 auto',
                width: 72,
                padding: 8,
                background: 'var(--pb-paper)',
                border: '1.5px solid var(--pb-line-2)',
                borderRadius: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--pb-butter)';
                e.currentTarget.style.borderColor = 'var(--pb-butter-ink)';
                e.currentTarget.style.boxShadow = '0 2px 0 var(--pb-butter-ink)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--pb-paper)';
                e.currentTarget.style.borderColor = 'var(--pb-line-2)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span style={{ fontSize: 24, lineHeight: 1 }}>{p.icon}</span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: 'var(--pb-ink)',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  width: '100%',
                }}
              >
                {p.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
