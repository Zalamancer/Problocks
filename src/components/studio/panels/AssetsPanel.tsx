'use client';
import { useState, useEffect } from 'react';
import { Box, SlidersHorizontal, Shapes, Package, X, Star } from 'lucide-react';
import { PanelSearchInput, PanelSelect, PanelIconTabs } from '@/components/ui';
import { cn } from '@/lib/utils';
import { AssetThumbnail } from '@/components/studio/AssetThumbnail';
import { PiecePreview } from '@/components/studio/PiecePreview';
import { CustomModelThumbnail } from '@/components/studio/CustomModelThumbnail';
import { PIECES, type PieceKind } from '@/lib/building-kit';
import { useBuildingStore, type Tool } from '@/store/building-store';
import { useStudio, type AssetsTab } from '@/store/studio-store';
import { usePartStudio } from '@/store/part-studio-store';

interface AssetInfo {
  name: string;
  cat: string;
  tris: number;
  vertices: number;
  textures: number;
  materials: number;
  binKB: number;
}

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'walls', label: 'Walls' },
  { id: 'floors', label: 'Floors' },
  { id: 'roofs', label: 'Roofs' },
  { id: 'doors', label: 'Doors' },
  { id: 'windows', label: 'Windows' },
  { id: 'stairs', label: 'Stairs' },
  { id: 'props', label: 'Props' },
  { id: 'corners', label: 'Corners' },
  { id: 'overhangs', label: 'Overhangs' },
  { id: 'balconies', label: 'Balconies' },
];

const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Name (A → Z)' },
  { value: 'name-desc', label: 'Name (Z → A)' },
  { value: 'tris-asc', label: 'Tris (low → high)' },
  { value: 'tris-desc', label: 'Tris (high → low)' },
  { value: 'verts-asc', label: 'Verts (low → high)' },
  { value: 'verts-desc', label: 'Verts (high → low)' },
  { value: 'size-asc', label: 'Size (low → high)' },
  { value: 'size-desc', label: 'Size (high → low)' },
];

const TRIS_RANGES: Record<string, { label: string; min: number; max: number } | null> = {
  any: null,
  low: { label: '≤ 100 (low-poly)', min: 0, max: 100 },
  med: { label: '100 – 500', min: 100, max: 500 },
  high: { label: '500 – 1K', min: 500, max: 1000 },
  vhigh: { label: '1K – 2K', min: 1000, max: 2000 },
  extreme: { label: '> 2K (high-poly)', min: 2000, max: Infinity },
};

const VERTS_RANGES: Record<string, { label: string; min: number; max: number } | null> = {
  any: null,
  low: { label: '≤ 100', min: 0, max: 100 },
  med: { label: '100 – 500', min: 100, max: 500 },
  high: { label: '500 – 1K', min: 500, max: 1000 },
  extreme: { label: '> 1K', min: 1000, max: Infinity },
};

const SIZE_RANGES: Record<string, { label: string; min: number; max: number } | null> = {
  any: null,
  tiny: { label: '≤ 50 KB', min: 0, max: 50 },
  small: { label: '50 – 200 KB', min: 50, max: 200 },
  med: { label: '200 KB – 1 MB', min: 200, max: 1024 },
  large: { label: '> 1 MB', min: 1024, max: Infinity },
};

function formatTris(n: number): string {
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

function AssetExpandedStats({ asset }: { asset: AssetInfo }) {
  const rows: Array<{ label: string; value: string; valueClass?: string }> = [
    { label: 'Tris', value: asset.tris.toLocaleString(), valueClass: `font-mono ${trisColor(asset.tris)}` },
    { label: 'Verts', value: asset.vertices.toLocaleString(), valueClass: 'font-mono' },
    { label: 'Size', value: `${asset.binKB} KB`, valueClass: 'font-mono' },
    { label: 'Mats', value: String(asset.materials), valueClass: 'font-mono' },
    { label: 'Tex', value: String(asset.textures), valueClass: 'font-mono' },
    { label: 'Cat', value: asset.cat },
  ];
  return (
    <div className="w-full flex flex-col gap-1 text-[11px] text-left">
      {rows.map((row) => (
        <div key={row.label} className="flex items-center justify-between gap-2">
          <span style={{ color: 'var(--pb-ink-muted)' }}>{row.label}</span>
          <span className={row.valueClass} style={{ color: 'var(--pb-ink)' }}>{row.value}</span>
        </div>
      ))}
    </div>
  );
}

const ASSETS_TABS: { id: AssetsTab; label: string; icon: typeof Box }[] = [
  { id: 'models', label: 'Models', icon: Package },
  { id: 'parts',  label: 'Parts',  icon: Shapes },
];

export function AssetsPanel() {
  const tab = useStudio((s) => s.assetsActiveTab);
  const setTab = useStudio((s) => s.setAssetsActiveTab);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [assets, setAssets] = useState<AssetInfo[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sort, setSort] = useState('name-asc');
  const [trisRange, setTrisRange] = useState('any');
  const [vertsRange, setVertsRange] = useState('any');
  const [sizeRange, setSizeRange] = useState('any');

  // Non-default filter means the dot indicator is shown on the filter icon
  const hasActiveFilters =
    category !== 'all' ||
    viewMode !== 'grid' ||
    sort !== 'name-asc' ||
    trisRange !== 'any' ||
    vertsRange !== 'any' ||
    sizeRange !== 'any';

  // Load asset stats
  useEffect(() => {
    fetch('/assets/medieval/stats.json')
      .then(r => r.json())
      .then(data => setAssets(data))
      .catch(() => {});
  }, []);

  const tr = TRIS_RANGES[trisRange];
  const vr = VERTS_RANGES[vertsRange];
  const sr = SIZE_RANGES[sizeRange];

  const filtered = assets.filter(a => {
    if (category !== 'all' && a.cat !== category) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (tr && (a.tris < tr.min || a.tris >= tr.max)) return false;
    if (vr && (a.vertices < vr.min || a.vertices >= vr.max)) return false;
    if (sr && (a.binKB < sr.min || a.binKB >= sr.max)) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (sort) {
      case 'name-asc': return a.name.localeCompare(b.name);
      case 'name-desc': return b.name.localeCompare(a.name);
      case 'tris-asc': return a.tris - b.tris;
      case 'tris-desc': return b.tris - a.tris;
      case 'verts-asc': return a.vertices - b.vertices;
      case 'verts-desc': return b.vertices - a.vertices;
      case 'size-asc': return a.binKB - b.binKB;
      case 'size-desc': return b.binKB - a.binKB;
      default: return 0;
    }
  });

  const catCounts = assets.reduce((acc, a) => {
    acc[a.cat] = (acc[a.cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* White-pill sub-tabs — Models (GLTF assets) vs Parts (procedural
          building-kit pieces). Uses the same PanelIconTabs animated pill
          bar that LeftPanel uses. */}
      <PanelIconTabs
        tabs={ASSETS_TABS}
        activeTab={tab}
        onChange={(id) => setTab(id as AssetsTab)}
      />

      {tab === 'parts' ? (
        <PartsView />
      ) : (
      <>

      {/* Custom models — user-generated via Part Studio. Shown as the first
          bucket on the Models tab so the user's own assets are always on
          top of the imported medieval kit. */}
      <CustomModelsSection />

      {/* Scripts moved to Scene panel (Explorer-style, Roblox parity) */}

      {/* Search + Filter + conditional View/Category — balanced 8px rhythm */}
      <div className="shrink-0 px-3 py-2 flex flex-col gap-2 [&>div]:!mb-0">
        <div className="flex items-center gap-1.5">
          <div className="flex-1 min-w-0 [&>div]:!mb-0">
            <PanelSearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search 3D assets..."
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

        {filtersOpen && (
          <>
            <PanelSelect
              label="View"
              value={viewMode}
              onChange={(v) => setViewMode(v as 'list' | 'grid')}
              options={[
                { value: 'grid', label: 'Grid' },
                { value: 'list', label: 'List' },
              ]}
            />
            <PanelSelect
              label="Sort by"
              value={sort}
              onChange={setSort}
              options={SORT_OPTIONS}
            />
            <PanelSelect
              label="Category"
              value={category}
              onChange={setCategory}
              options={CATEGORIES
                .filter((c) => c.id === 'all' || (catCounts[c.id] || 0) > 0)
                .map((c) => ({
                  value: c.id,
                  label: c.id === 'all'
                    ? `${c.label} (${assets.length})`
                    : `${c.label} (${catCounts[c.id] || 0})`,
                }))}
            />
            <PanelSelect
              label="Tris"
              value={trisRange}
              onChange={setTrisRange}
              options={Object.entries(TRIS_RANGES).map(([k, v]) => ({
                value: k,
                label: v ? v.label : 'Any',
              }))}
            />
            <PanelSelect
              label="Verts"
              value={vertsRange}
              onChange={setVertsRange}
              options={Object.entries(VERTS_RANGES).map(([k, v]) => ({
                value: k,
                label: v ? v.label : 'Any',
              }))}
            />
            <PanelSelect
              label="File size"
              value={sizeRange}
              onChange={setSizeRange}
              options={Object.entries(SIZE_RANGES).map(([k, v]) => ({
                value: k,
                label: v ? v.label : 'Any',
              }))}
            />
          </>
        )}
      </div>

      {/* Asset list / grid */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3">
        {viewMode === 'list' ? (
          <div className="flex flex-col gap-0.5">
            {sorted.map(asset => {
              const isSelected = selectedAsset === asset.name;
              return (
                <button
                  key={asset.name}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/x-problocks-asset', asset.name);
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  onClick={() => setSelectedAsset(isSelected ? null : asset.name)}
                  className="w-full text-left [content-visibility:auto] [contain-intrinsic-size:0_44px]"
                  style={{
                    padding: '9px 11px',
                    borderRadius: 10,
                    background: isSelected ? 'var(--pb-cream-2)' : 'transparent',
                    border: isSelected ? '1.5px solid var(--pb-ink)' : '1.5px solid transparent',
                    boxShadow: isSelected ? '0 2px 0 var(--pb-ink)' : 'none',
                    cursor: 'pointer',
                    transition: 'background 120ms ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'var(--pb-cream-2)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Box size={13} strokeWidth={2.2} className="shrink-0" style={{ color: 'var(--pb-grape-ink)' }} />
                    <span className="flex-1 truncate" style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--pb-ink)' }}>
                      {asset.name.replace(/_/g, ' ')}
                    </span>
                    <span className={`shrink-0 text-[10px] font-mono ${trisColor(asset.tris)}`}>
                      {formatTris(asset.tris)}
                    </span>
                  </div>

                  {isSelected && (
                    <AssetExpandedStats asset={asset} />
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            {sorted.map(asset => {
              const isSelected = selectedAsset === asset.name;
              return (
                <button
                  key={asset.name}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/x-problocks-asset', asset.name);
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  onClick={() => setSelectedAsset(isSelected ? null : asset.name)}
                  className="group relative flex flex-col overflow-hidden [content-visibility:auto] [contain-intrinsic-size:0_160px]"
                  style={{
                    borderRadius: 12,
                    background: 'var(--pb-paper)',
                    border: `1.5px solid ${isSelected ? 'var(--pb-ink)' : 'var(--pb-line-2)'}`,
                    boxShadow: isSelected ? '0 2px 0 var(--pb-ink)' : 'none',
                    cursor: 'pointer',
                    transition: 'border-color 120ms ease',
                  }}
                >
                  <div className="relative w-full aspect-square" style={{ background: 'var(--pb-cream-2)' }}>
                    <AssetThumbnail modelName={asset.name} fluid />
                    {/* Hover overlay with extra stats */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2"
                      style={{ background: 'color-mix(in srgb, var(--pb-paper) 94%, transparent)' }}
                    >
                      <AssetExpandedStats asset={asset} />
                    </div>
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
                    {asset.name.replace(/_/g, ' ')}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {sorted.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <p className="text-xs" style={{ color: 'var(--pb-ink-muted)' }}>
              {search || hasActiveFilters ? 'No matching assets' : 'No assets loaded'}
            </p>
          </div>
        )}
      </div>
      </>
      )}

    </div>
  );
}

// ── Parts view ────────────────────────────────────────────────────────────
// Procedural building-kit pieces shown with 3D thumbnails (PiecePreview).
// Clicking a piece sets both the active tool AND the selected variant, so
// the user can immediately start placing it on the workspace canvas.

const PIECE_KIND_GROUPS: { kind: PieceKind; label: string }[] = [
  { kind: 'floor',       label: 'Floors' },
  { kind: 'wall',        label: 'Walls' },
  { kind: 'wall-window', label: 'Windows' },
  { kind: 'wall-door',   label: 'Doors' },
  { kind: 'roof',        label: 'Roofs' },
  { kind: 'roof-corner', label: 'Roof corners' },
  { kind: 'corner',      label: 'Columns' },
  { kind: 'stairs',      label: 'Stairs' },
];

const PIECE_KIND_TO_TOOL: Record<PieceKind, Tool> = {
  floor:         'floor',
  wall:          'wall',
  'wall-window': 'wall-window',
  'wall-door':   'wall-door',
  roof:          'roof',
  'roof-corner': 'roof-corner',
  corner:        'corner',
  stairs:        'stairs',
};

const PARTS_SORT_OPTIONS = [
  { value: 'default', label: 'Default (kit order)' },
  { value: 'name-asc', label: 'Name (A → Z)' },
  { value: 'name-desc', label: 'Name (Z → A)' },
];

function PartsView() {
  const [search, setSearch] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sort, setSort] = useState('default');
  const [categoryFilter, setCategoryFilter] = useState<'all' | PieceKind>('all');
  const tool = useBuildingStore((s) => s.tool);
  const setTool = useBuildingStore((s) => s.setTool);
  const selectedPiece = useBuildingStore((s) => s.selectedPiece);
  const setSelectedPiece = useBuildingStore((s) => s.setSelectedPiece);

  const hasActiveFilters =
    viewMode !== 'grid' || sort !== 'default' || categoryFilter !== 'all';

  const q = search.trim().toLowerCase();
  const matches = (label: string, id: string) =>
    !q || label.toLowerCase().includes(q) || id.toLowerCase().includes(q);

  const kindCounts = PIECES.reduce((acc, p) => {
    acc[p.kind] = (acc[p.kind] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortPieces = (pieces: typeof PIECES) => {
    if (sort === 'default') return pieces;
    const copy = [...pieces];
    if (sort === 'name-asc') copy.sort((a, b) => a.label.localeCompare(b.label));
    if (sort === 'name-desc') copy.sort((a, b) => b.label.localeCompare(a.label));
    return copy;
  };

  const visibleGroups = PIECE_KIND_GROUPS.filter(
    (g) => categoryFilter === 'all' || categoryFilter === g.kind,
  );

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="shrink-0 px-3 py-2 flex flex-col gap-2 [&>div]:!mb-0">
        <div className="flex items-center gap-1.5">
          <div className="flex-1 min-w-0 [&>div]:!mb-0">
            <PanelSearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search parts..."
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

        {filtersOpen && (
          <>
            <PanelSelect
              label="View"
              value={viewMode}
              onChange={(v) => setViewMode(v as 'grid' | 'list')}
              options={[
                { value: 'grid', label: 'Grid' },
                { value: 'list', label: 'List' },
              ]}
            />
            <PanelSelect
              label="Sort by"
              value={sort}
              onChange={setSort}
              options={PARTS_SORT_OPTIONS}
            />
            <PanelSelect
              label="Category"
              value={categoryFilter}
              onChange={(v) => setCategoryFilter(v as 'all' | PieceKind)}
              options={[
                { value: 'all', label: `All (${PIECES.length})` },
                ...PIECE_KIND_GROUPS.map((g) => ({
                  value: g.kind,
                  label: `${g.label} (${kindCounts[g.kind] || 0})`,
                })),
              ]}
            />
          </>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-3">
        {visibleGroups.map(({ kind, label }) => {
          const pieces = sortPieces(
            PIECES.filter((p) => p.kind === kind && matches(p.label, p.id)),
          );
          if (pieces.length === 0) return null;
          const activeId = selectedPiece[kind];
          const kindToolActive = tool === PIECE_KIND_TO_TOOL[kind];
          return (
            <div key={kind} className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--pb-ink-muted)',
                  }}
                >
                  {label}
                </span>
                <span style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', color: 'var(--pb-ink-muted)' }}>
                  {pieces.length}
                </span>
              </div>
              {viewMode === 'list' ? (
                <div className="flex flex-col gap-0.5">
                  {pieces.map((p) => {
                    const isSelected = kindToolActive && activeId === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          setTool(PIECE_KIND_TO_TOOL[kind]);
                          setSelectedPiece(kind, p.id);
                        }}
                        className="w-full text-left flex items-center gap-2"
                        style={{
                          padding: '9px 11px',
                          borderRadius: 10,
                          background: isSelected ? 'var(--pb-cream-2)' : 'transparent',
                          border: isSelected ? '1.5px solid var(--pb-ink)' : '1.5px solid transparent',
                          boxShadow: isSelected ? '0 2px 0 var(--pb-ink)' : 'none',
                          cursor: 'pointer',
                          transition: 'background 120ms ease',
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.background = 'var(--pb-cream-2)';
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.background = 'transparent';
                        }}
                        title={p.label}
                      >
                        <span
                          className="shrink-0"
                          style={{
                            width: 14,
                            height: 14,
                            borderRadius: 4,
                            backgroundColor: p.swatch,
                            border: '1.5px solid var(--pb-ink)',
                          }}
                        />
                        <span
                          className="flex-1 truncate"
                          style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--pb-ink)' }}
                        >
                          {p.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-1.5">
                  {pieces.map((p) => {
                    const isSelected = kindToolActive && activeId === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          setTool(PIECE_KIND_TO_TOOL[kind]);
                          setSelectedPiece(kind, p.id);
                        }}
                        className="group relative flex flex-col overflow-hidden [content-visibility:auto] [contain-intrinsic-size:0_140px]"
                        style={{
                          borderRadius: 12,
                          background: 'var(--pb-paper)',
                          border: `1.5px solid ${isSelected ? 'var(--pb-ink)' : 'var(--pb-line-2)'}`,
                          boxShadow: isSelected ? '0 2px 0 var(--pb-ink)' : 'none',
                          cursor: 'pointer',
                          transition: 'border-color 120ms ease',
                        }}
                        title={p.label}
                      >
                        <div
                          className="relative w-full aspect-square"
                          style={{ background: 'var(--pb-cream-2)' }}
                        >
                          <PiecePreview pieceId={p.id} fluid />
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
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {visibleGroups.every(
          ({ kind }) =>
            PIECES.filter((p) => p.kind === kind && matches(p.label, p.id)).length === 0,
        ) && (
          <div className="flex items-center justify-center py-8">
            <p className="text-xs" style={{ color: 'var(--pb-ink-muted)' }}>
              {q || hasActiveFilters ? 'No matching parts' : 'No parts loaded'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Custom models section ─────────────────────────────────────────────────
// Bridges the permanent Part Studio library into the existing Assets panel.
// Users who clicked "Save to Assets" in Part Studio see their generations
// here alongside the imported medieval kit.

function CustomModelsSection() {
  const savedModels = usePartStudio((s) => s.savedModels);
  const removeSavedModel = usePartStudio((s) => s.removeSavedModel);
  const [collapsed, setCollapsed] = useState(false);

  if (savedModels.length === 0) {
    return null;
  }

  return (
    <div className="shrink-0 px-3 pt-2 pb-2">
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center gap-2 mb-1.5 text-left"
        style={{ background: 'transparent', cursor: 'pointer' }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--pb-ink-muted)',
          }}
        >
          Custom
        </span>
        <span style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', color: 'var(--pb-ink-muted)' }}>
          {savedModels.length}
        </span>
        <span className="ml-auto" style={{ fontSize: 10, color: 'var(--pb-ink-muted)' }}>
          {collapsed ? 'show' : 'hide'}
        </span>
      </button>

      {!collapsed && (
        <div className="grid grid-cols-2 gap-1.5">
          {[...savedModels].reverse().map((m) => (
            <div
              key={m.id}
              className="group relative flex flex-col overflow-hidden"
              style={{
                borderRadius: 12,
                background: 'var(--pb-paper)',
                border: '1.5px solid var(--pb-line-2)',
                transition: 'border-color 120ms ease',
              }}
              title={`${m.name}\n${m.vertexCount} verts · ${m.model.parts.length} parts\n"${m.sourcePrompt}"`}
            >
              <div className="relative w-full aspect-square" style={{ background: 'var(--pb-cream-2)' }}>
                <CustomModelThumbnail model={m.model} fluid />

                {/* Rating badge */}
                <div
                  className="absolute top-1 left-1 flex items-center gap-0.5"
                  style={{
                    padding: '2px 7px',
                    height: 18,
                    borderRadius: 999,
                    background: 'var(--pb-butter)',
                    border: '1.5px solid var(--pb-butter-ink)',
                    color: 'var(--pb-butter-ink)',
                  }}
                >
                  <Star size={9} strokeWidth={2.4} fill="currentColor" />
                  <span style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', fontWeight: 700 }}>
                    {m.rating}
                  </span>
                </div>

                {/* Delete button on hover */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSavedModel(m.id);
                  }}
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  style={{
                    height: 20,
                    width: 20,
                    borderRadius: 999,
                    background: 'var(--pb-paper)',
                    border: '1.5px solid var(--pb-coral-ink)',
                    color: 'var(--pb-coral-ink)',
                    cursor: 'pointer',
                  }}
                  title="Remove"
                >
                  <X size={10} strokeWidth={2.4} />
                </button>
              </div>
              <div style={{ padding: '6px 10px', borderTop: '1.5px solid var(--pb-line-2)' }}>
                <div
                  className="truncate"
                  style={{ fontSize: 12, fontWeight: 600, color: 'var(--pb-ink)' }}
                >
                  {m.name}
                </div>
                <div
                  style={{
                    fontSize: 9.5,
                    fontFamily: 'DM Mono, monospace',
                    color: 'var(--pb-ink-muted)',
                  }}
                >
                  {m.vertexCount} verts
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
