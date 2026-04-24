'use client';

import { useMemo, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { PanelSearchInput, PanelSelect } from '@/components/ui';
import {
  PREFAB_CATEGORIES,
  PREFAB_STYLES,
  getPrefabsForStyle,
  type PrefabCategory,
} from '@/lib/kid-style-3d/prefabs';
import { getSpawnPosition } from '@/lib/kid-style-3d/spawn-target';
import { useFreeform3D } from '@/store/freeform3d-store';

/**
 * Assets view for the 3D Freeform game system. Replaces the old bottom-
 * centre floating PrefabPalette — everything that used to live on the
 * canvas floats up here into the studio's standard left panel so the
 * visual language matches the rest of the assets browsers (Parts, 2D
 * images, GLTF models).
 *
 * Filters:
 *   - Style dropdown: picks which prefab kit is active. Today there's
 *     only 'chunky-pastel'; future kits (lowpoly / voxel / realistic)
 *     register via PREFAB_STYLES and light up automatically.
 *   - Category dropdown: Primitives / Nature / Buildings / Characters.
 *   - Search: matches against prefab label.
 *
 * Clicking a tile spawns the prefab near the viewport's current orbit
 * target (see spawn-target.ts) so repeat clicks don't stack on the same
 * point. The viewport's `FreeformView3D` registers the provider on
 * mount; if no provider is registered (panel mounted before the
 * viewport, or different game system), spawns fall back to origin.
 */
export function Freeform3DAssetsView() {
  const [search, setSearch] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [category, setCategory] = useState<'all' | PrefabCategory['id']>('all');

  // activeStyle is persisted in the freeform3d-store because the AI
  // agent also reads it to decide which prefabs to offer — keeping a
  // single source of truth avoids "panel shows X, AI generates Y".
  const activeStyle = useFreeform3D((s) => s.activeStyle);
  const setActiveStyle = useFreeform3D((s) => s.setActiveStyle);
  const addPrefab = useFreeform3D((s) => s.addPrefab);

  const hasActiveFilters = category !== 'all';

  const prefabs = useMemo(() => getPrefabsForStyle(activeStyle), [activeStyle]);

  const q = search.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      prefabs.filter((p) => {
        if (category !== 'all' && p.category !== category) return false;
        if (q && !p.label.toLowerCase().includes(q) && !p.kind.includes(q)) return false;
        return true;
      }),
    [prefabs, category, q],
  );

  // Count prefabs in each category for the dropdown label.
  const catCounts = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const p of prefabs) acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, [prefabs]);

  function handleSpawn(kind: string): void {
    const pos = getSpawnPosition();
    addPrefab(kind, pos);
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Search + filter toggle — identical rhythm to ModelsView/PartsView */}
      <div className="shrink-0 px-3 py-2 flex flex-col gap-2 [&>div]:!mb-0">
        <div className="flex items-center gap-1.5">
          <div className="flex-1 min-w-0 [&>div]:!mb-0">
            <PanelSearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search prefabs..."
            />
          </div>
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="relative shrink-0 flex items-center justify-center"
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: filtersOpen ? 'var(--pb-cream-2)' : 'var(--pb-paper)',
              border: `1.5px solid ${filtersOpen ? 'var(--pb-ink)' : 'var(--pb-line-2)'}`,
              boxShadow: filtersOpen ? '0 2px 0 var(--pb-ink)' : 'none',
              color: filtersOpen ? 'var(--pb-ink)' : 'var(--pb-ink-soft)',
              cursor: 'pointer',
              transition: 'background 120ms ease, border-color 120ms ease',
            }}
            title="Filters"
          >
            <SlidersHorizontal size={15} strokeWidth={2.2} />
            {hasActiveFilters && !filtersOpen && (
              <span
                className="absolute top-1 right-1"
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 999,
                  background: 'var(--pb-coral)',
                  border: '1px solid var(--pb-coral-ink)',
                }}
              />
            )}
          </button>
        </div>

        {/* Style filter is ALWAYS visible (not hidden behind the filters
            toggle) — it's the defining axis of what the user can build,
            and hiding it would make the feature impossible to discover. */}
        <PanelSelect
          label="Style"
          value={activeStyle}
          onChange={(v) => setActiveStyle(v as typeof activeStyle)}
          options={PREFAB_STYLES.map((s) => ({ value: s.id, label: s.label }))}
        />

        {filtersOpen && (
          <PanelSelect
            label="Category"
            value={category}
            onChange={(v) => setCategory(v as typeof category)}
            options={[
              { value: 'all', label: `All (${prefabs.length})` },
              ...PREFAB_CATEGORIES.map((c) => ({
                value: c.id,
                label: `${c.label} (${catCounts[c.id] || 0})`,
              })),
            ]}
          />
        )}
      </div>

      {/* Prefab tile grid — same card style as other views */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-3">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-xs" style={{ color: 'var(--pb-ink-muted)' }}>
              {q || hasActiveFilters ? 'No matching prefabs' : 'No prefabs in this style'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            {filtered.map((p) => (
              <button
                key={p.kind}
                type="button"
                onClick={() => handleSpawn(p.kind)}
                className="group relative flex flex-col overflow-hidden"
                style={{
                  borderRadius: 12,
                  background: 'var(--pb-paper)',
                  border: '1.5px solid var(--pb-line-2)',
                  cursor: 'pointer',
                  transition: 'border-color 120ms ease, box-shadow 120ms ease, transform 120ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--pb-butter-ink)';
                  e.currentTarget.style.boxShadow = '0 2px 0 var(--pb-butter-ink)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--pb-line-2)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                title={`${p.label} — click to add`}
              >
                <div
                  className="relative w-full aspect-square flex items-center justify-center"
                  style={{ background: 'var(--pb-cream-2)' }}
                >
                  <span style={{ fontSize: 40, lineHeight: 1 }}>{p.icon}</span>
                  <span
                    className="absolute bottom-1 left-1"
                    style={{
                      padding: '1px 6px',
                      fontSize: 9,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: 0.3,
                      borderRadius: 4,
                      background: 'var(--pb-paper)',
                      color: 'var(--pb-ink-muted)',
                      border: '1.5px solid var(--pb-line-2)',
                    }}
                  >
                    {p.category.slice(0, 4)}
                  </span>
                </div>
                <span
                  className="block w-full truncate text-left"
                  style={{
                    padding: '6px 10px',
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: 'var(--pb-ink)',
                    borderTop: '1.5px solid var(--pb-line-2)',
                  }}
                >
                  {p.label}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
