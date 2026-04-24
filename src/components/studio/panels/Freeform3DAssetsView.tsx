'use client';

import { useEffect, useMemo, useState } from 'react';
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
import {
  PrefabThumbnail,
  getPrefabStats,
  ensurePrefabStats,
} from '@/components/studio/PrefabThumbnail';

type SortKey = 'name-asc' | 'name-desc' | 'tris-asc' | 'tris-desc' | 'verts-asc' | 'verts-desc';
type TrisRangeKey = 'any' | 'low' | 'med' | 'high' | 'vhigh' | 'extreme';
type VertsRangeKey = 'any' | 'low' | 'med' | 'high' | 'extreme';

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: 'name-asc',  label: 'Name (A → Z)' },
  { value: 'name-desc', label: 'Name (Z → A)' },
  { value: 'tris-asc',  label: 'Tris (low → high)' },
  { value: 'tris-desc', label: 'Tris (high → low)' },
  { value: 'verts-asc', label: 'Verts (low → high)' },
  { value: 'verts-desc', label: 'Verts (high → low)' },
];

const TRIS_RANGES: Record<TrisRangeKey, { label: string; min: number; max: number } | null> = {
  any: null,
  low:     { label: '≤ 100 (low-poly)', min: 0, max: 100 },
  med:     { label: '100 – 500',        min: 100, max: 500 },
  high:    { label: '500 – 1K',         min: 500, max: 1000 },
  vhigh:   { label: '1K – 2K',          min: 1000, max: 2000 },
  extreme: { label: '> 2K (high-poly)', min: 2000, max: Infinity },
};

const VERTS_RANGES: Record<VertsRangeKey, { label: string; min: number; max: number } | null> = {
  any: null,
  low:     { label: '≤ 100',    min: 0, max: 100 },
  med:     { label: '100 – 500', min: 100, max: 500 },
  high:    { label: '500 – 1K',  min: 500, max: 1000 },
  extreme: { label: '> 1K',     min: 1000, max: Infinity },
};

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sort, setSort] = useState<SortKey>('name-asc');
  const [trisRange, setTrisRange] = useState<TrisRangeKey>('any');
  const [vertsRange, setVertsRange] = useState<VertsRangeKey>('any');

  // activeStyle is persisted in the freeform3d-store because the AI
  // agent also reads it to decide which prefabs to offer — keeping a
  // single source of truth avoids "panel shows X, AI generates Y".
  const activeStyle = useFreeform3D((s) => s.activeStyle);
  const setActiveStyle = useFreeform3D((s) => s.setActiveStyle);
  const performanceMode = useFreeform3D((s) => s.performanceMode);
  const setPerformanceMode = useFreeform3D((s) => s.setPerformanceMode);
  const addPrefab = useFreeform3D((s) => s.addPrefab);

  const hasActiveFilters =
    category !== 'all' ||
    viewMode !== 'grid' ||
    sort !== 'name-asc' ||
    trisRange !== 'any' ||
    vertsRange !== 'any';

  const prefabs = useMemo(() => getPrefabsForStyle(activeStyle), [activeStyle]);

  // Warm the stats cache so sort-by-tris and tris-range filters have
  // something to work with before the user has scrolled through every
  // tile. `statsTick` bumps once per-prefab as stats land, triggering
  // a re-render so filters pick them up; see comment on ticker below.
  const [statsTick, setStatsTick] = useState(0);
  useEffect(() => {
    let cancelled = false;
    void ensurePrefabStats(prefabs.map((p) => p.kind)).then(() => {
      if (!cancelled) setStatsTick((t) => t + 1);
    });
    // Intermediate ticks — the ensure-all Promise only resolves after the
    // LAST kind renders, but the user may be looking at results while
    // earlier kinds have stats. A cheap interval for ~3 seconds catches
    // anything in-flight without running forever.
    let elapsed = 0;
    const id = window.setInterval(() => {
      elapsed += 500;
      setStatsTick((t) => t + 1);
      if (elapsed >= 3000) window.clearInterval(id);
    }, 500);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [prefabs]);

  const q = search.trim().toLowerCase();

  const filtered = useMemo(() => {
    const tr = TRIS_RANGES[trisRange];
    const vr = VERTS_RANGES[vertsRange];
    return prefabs.filter((p) => {
      if (category !== 'all' && p.category !== category) return false;
      if (q && !p.label.toLowerCase().includes(q) && !p.kind.includes(q)) return false;
      // Stat-based filters apply only when the cache has data for this
      // kind. While stats are loading the filter is permissive; once
      // statsTick increments (see ticker above) this re-evaluates.
      if (tr || vr) {
        const stats = getPrefabStats(p.kind);
        if (stats) {
          if (tr && (stats.triangles < tr.min || stats.triangles >= tr.max)) return false;
          if (vr && (stats.vertices < vr.min || stats.vertices >= vr.max)) return false;
        }
      }
      return true;
    });
  }, [prefabs, category, q, trisRange, vertsRange, statsTick]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    const tris = (k: string) => getPrefabStats(k)?.triangles ?? Number.POSITIVE_INFINITY;
    const verts = (k: string) => getPrefabStats(k)?.vertices ?? Number.POSITIVE_INFINITY;
    switch (sort) {
      case 'name-asc':  copy.sort((a, b) => a.label.localeCompare(b.label)); break;
      case 'name-desc': copy.sort((a, b) => b.label.localeCompare(a.label)); break;
      case 'tris-asc':  copy.sort((a, b) => tris(a.kind) - tris(b.kind)); break;
      case 'tris-desc': copy.sort((a, b) => tris(b.kind) - tris(a.kind)); break;
      case 'verts-asc': copy.sort((a, b) => verts(a.kind) - verts(b.kind)); break;
      case 'verts-desc': copy.sort((a, b) => verts(b.kind) - verts(a.kind)); break;
    }
    return copy;
  }, [filtered, sort, statsTick]);

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
        {/* Performance mode is also always visible. Low swaps rounded
            boxes for 8v cubes, UV spheres for 12v icosahedra, 12-sided
            cylinders for 5-sided stubs — drops plot vertex counts ~10×
            for kids on Celeron Chromebooks. Extreme turns every helper
            into a BoxGeometry for a minecraft-voxel look. Changing it
            rebuilds both the thumbnails AND any already-placed prefabs. */}
        <PanelSelect
          label="Performance"
          value={performanceMode}
          onChange={(v) => setPerformanceMode(v as typeof performanceMode)}
          options={[
            { value: 'high',    label: 'High — detailed' },
            { value: 'low',     label: 'Low — minimal verts' },
            { value: 'extreme', label: 'Extreme — cubes only' },
          ]}
        />

        {filtersOpen && (
          <>
            <PanelSelect
              label="View"
              value={viewMode}
              onChange={(v) => setViewMode(v as typeof viewMode)}
              options={[
                { value: 'grid', label: 'Grid' },
                { value: 'list', label: 'List' },
              ]}
            />
            <PanelSelect
              label="Sort by"
              value={sort}
              onChange={(v) => setSort(v as SortKey)}
              options={SORT_OPTIONS}
            />
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
            <PanelSelect
              label="Tris"
              value={trisRange}
              onChange={(v) => setTrisRange(v as TrisRangeKey)}
              options={(Object.entries(TRIS_RANGES) as Array<[TrisRangeKey, typeof TRIS_RANGES[TrisRangeKey]]>).map(
                ([k, v]) => ({ value: k, label: v ? v.label : 'Any' }),
              )}
            />
            <PanelSelect
              label="Verts"
              value={vertsRange}
              onChange={(v) => setVertsRange(v as VertsRangeKey)}
              options={(Object.entries(VERTS_RANGES) as Array<[VertsRangeKey, typeof VERTS_RANGES[VertsRangeKey]]>).map(
                ([k, v]) => ({ value: k, label: v ? v.label : 'Any' }),
              )}
            />
          </>
        )}
      </div>

      {/* Prefab list/grid — same card style as other views */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-3">
        {sorted.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-xs" style={{ color: 'var(--pb-ink-muted)' }}>
              {q || hasActiveFilters ? 'No matching prefabs' : 'No prefabs in this style'}
            </p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="flex flex-col gap-0.5">
            {sorted.map((p) => (
              <PrefabRow
                key={p.kind}
                kind={p.kind}
                label={p.label}
                category={p.category}
                onSpawn={() => handleSpawn(p.kind)}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            {sorted.map((p) => (
              <PrefabCard
                key={p.kind}
                kind={p.kind}
                label={p.label}
                category={p.category}
                onSpawn={() => handleSpawn(p.kind)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Single prefab tile with hover stats overlay. Extracted because the
    hover state needs to be per-card (state in the parent would force
    every card to re-render on any hover). */
function PrefabCard({
  kind,
  label,
  category,
  onSpawn,
}: {
  kind: string;
  label: string;
  category: PrefabCategory['id'];
  onSpawn: () => void;
}) {
  const [hover, setHover] = useState(false);
  // PrefabThumbnail populates the stats cache asynchronously on first
  // render. We poll via a tiny forceUpdate ticker while hovered so the
  // overlay switches from "…" to real numbers within a frame of the
  // render queue finishing. Only runs while hover is true, so idle
  // cards cost nothing.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!hover) return;
    if (getPrefabStats(kind)) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 120);
    return () => window.clearInterval(id);
  }, [hover, kind, tick]);

  const stats = hover ? getPrefabStats(kind) : null;

  return (
    <button
      type="button"
      onClick={onSpawn}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="group relative flex flex-col overflow-hidden"
      style={{
        borderRadius: 12,
        background: 'var(--pb-paper)',
        border: `1.5px solid ${hover ? 'var(--pb-butter-ink)' : 'var(--pb-line-2)'}`,
        boxShadow: hover ? '0 2px 0 var(--pb-butter-ink)' : 'none',
        cursor: 'pointer',
        transition: 'border-color 120ms ease, box-shadow 120ms ease',
      }}
      title={`${label} — click to add`}
    >
      <div
        className="relative w-full aspect-square"
        style={{ background: 'var(--pb-cream-2)' }}
      >
        <PrefabThumbnail kind={kind} fluid />
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
          {category.slice(0, 4)}
        </span>

        {/* Stats overlay — mirrors AssetExpandedStats in AssetsPanel so
            the 3D Freeform view has the same "what am I about to
            place" read as the medieval kit view. */}
        {hover && (
          <div
            className="absolute inset-0 flex flex-col justify-center gap-1 p-2"
            style={{
              background: 'color-mix(in srgb, var(--pb-paper) 94%, transparent)',
              fontSize: 11,
            }}
          >
            <StatRow label="Kind" value={kind} mono={false} />
            <StatRow
              label="Tris"
              value={stats ? formatCount(stats.triangles) : '…'}
              valueClass={stats ? trisColor(stats.triangles) : undefined}
            />
            <StatRow
              label="Verts"
              value={stats ? formatCount(stats.vertices) : '…'}
            />
            <StatRow
              label="Meshes"
              value={stats ? String(stats.meshes) : '…'}
            />
            <StatRow label="Cat" value={category} mono={false} />
          </div>
        )}
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
        {label}
      </span>
    </button>
  );
}

function StatRow({
  label,
  value,
  valueClass,
  mono = true,
}: {
  label: string;
  value: string;
  valueClass?: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span style={{ color: 'var(--pb-ink-muted)' }}>{label}</span>
      <span
        className={valueClass}
        style={{
          color: 'var(--pb-ink)',
          fontFamily: mono ? 'DM Mono, monospace' : 'inherit',
          fontWeight: 600,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function formatCount(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return String(n);
}

function trisColor(tris: number): string {
  if (tris <= 100) return 'text-green-400';
  if (tris <= 500) return 'text-emerald-400';
  if (tris <= 1000) return 'text-yellow-400';
  if (tris <= 2000) return 'text-orange-400';
  return 'text-red-400';
}

/** Compact list-view row matching the medieval Models view — swatch
    + label + live tris count. Clicking still spawns. */
function PrefabRow({
  kind,
  label,
  category,
  onSpawn,
}: {
  kind: string;
  label: string;
  category: PrefabCategory['id'];
  onSpawn: () => void;
}) {
  const [hover, setHover] = useState(false);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (getPrefabStats(kind)) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 200);
    const stop = window.setTimeout(() => window.clearInterval(id), 2000);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(stop);
    };
  }, [kind, tick]);
  const stats = getPrefabStats(kind);
  return (
    <button
      type="button"
      onClick={onSpawn}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="w-full text-left flex items-center gap-2"
      style={{
        padding: '9px 11px',
        borderRadius: 10,
        background: hover ? 'var(--pb-cream-2)' : 'transparent',
        border: hover ? '1.5px solid var(--pb-ink)' : '1.5px solid transparent',
        boxShadow: hover ? '0 2px 0 var(--pb-ink)' : 'none',
        cursor: 'pointer',
        transition: 'background 120ms ease',
      }}
      title={`${label} — click to add`}
    >
      <span
        className="shrink-0"
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          background: 'var(--pb-cream-2)',
          border: '1.5px solid var(--pb-line-2)',
          overflow: 'hidden',
        }}
      >
        <PrefabThumbnail kind={kind} fluid />
      </span>
      <span className="flex-1 truncate" style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--pb-ink)' }}>
        {label}
      </span>
      <span
        className="shrink-0"
        style={{
          fontSize: 9,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: 0.3,
          color: 'var(--pb-ink-muted)',
        }}
      >
        {category.slice(0, 4)}
      </span>
      <span
        className={`shrink-0 text-[10px] ${stats ? trisColor(stats.triangles) : ''}`}
        style={{ fontFamily: 'DM Mono, monospace' }}
      >
        {stats ? formatCount(stats.triangles) : '…'}
      </span>
    </button>
  );
}
