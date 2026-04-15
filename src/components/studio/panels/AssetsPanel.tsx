'use client';
import { useState, useEffect } from 'react';
import { FolderOpen, FileCode, FileText, Box, Search, Plus, Triangle, Layers, LayoutGrid, List } from 'lucide-react';
import { PanelSearchInput } from '@/components/ui';
import { useStudio } from '@/store/studio-store';
import { AssetThumbnail } from '@/components/studio/AssetThumbnail';

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
  return (
    <div className="mt-2 grid grid-cols-3 gap-x-3 gap-y-1 text-[10px] w-full text-left">
      <div>
        <span className="text-zinc-600">Tris</span>
        <span className={`ml-1 font-mono ${trisColor(asset.tris)}`}>{asset.tris.toLocaleString()}</span>
      </div>
      <div>
        <span className="text-zinc-600">Verts</span>
        <span className="ml-1 text-zinc-400 font-mono">{asset.vertices.toLocaleString()}</span>
      </div>
      <div>
        <span className="text-zinc-600">Size</span>
        <span className="ml-1 text-zinc-400 font-mono">{asset.binKB}KB</span>
      </div>
      <div>
        <span className="text-zinc-600">Mats</span>
        <span className="ml-1 text-zinc-400 font-mono">{asset.materials}</span>
      </div>
      <div>
        <span className="text-zinc-600">Tex</span>
        <span className="ml-1 text-zinc-400 font-mono">{asset.textures}</span>
      </div>
      <div>
        <span className="text-zinc-600">Cat</span>
        <span className="ml-1 text-zinc-400">{asset.cat}</span>
      </div>
      <div className="col-span-3 mt-1">
        <code className="text-[9px] text-zinc-600 select-all">
          game.loader.medieval(&apos;{asset.name}&apos;)
        </code>
      </div>
    </div>
  );
}

export function AssetsPanel() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [assets, setAssets] = useState<AssetInfo[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  const games = useStudio((s) => s.games);
  const activeGameId = useStudio((s) => s.activeGameId);
  const setActiveGameId = useStudio((s) => s.setActiveGameId);
  const openFileName = useStudio((s) => s.openFileName);
  const setOpenFileName = useStudio((s) => s.setOpenFileName);

  const activeGame = activeGameId ? games.find((g) => g.id === activeGameId) : null;

  // Load asset stats
  useEffect(() => {
    fetch('/assets/medieval/stats.json')
      .then(r => r.json())
      .then(data => setAssets(data))
      .catch(() => {});
  }, []);

  const filtered = assets.filter(a => {
    if (category !== 'all' && a.cat !== category) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const catCounts = assets.reduce((acc, a) => {
    acc[a.cat] = (acc[a.cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Code files for the active game
  const codeFiles = activeGame?.files ? Object.keys(activeGame.files).sort((a, b) => {
    if (a === 'config.js') return -1;
    if (b === 'config.js') return 1;
    return a.localeCompare(b);
  }) : [];

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="shrink-0 px-3 pt-2 pb-1 flex items-center gap-2">
        {activeGame ? (
          <>
            <span className="flex-1 text-sm font-medium text-zinc-200 truncate">{activeGame.name}</span>
            <button
              onClick={() => setActiveGameId(null)}
              className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06] transition-colors"
            >
              <Plus size={11} />
              New
            </button>
          </>
        ) : (
          <span className="text-sm text-zinc-500">No active game</span>
        )}
      </div>

      {/* Code files section */}
      {codeFiles.length > 0 && (
        <div className="shrink-0 px-3 py-1.5 border-b border-white/[0.04]">
          <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">Scripts</div>
          <div className="flex flex-wrap gap-1">
            {codeFiles.map(name => (
              <button
                key={name}
                onClick={() => setOpenFileName(openFileName === name ? null : name)}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                  openFileName === name
                    ? 'bg-accent/15 text-accent border border-accent/20'
                    : 'bg-white/[0.04] text-zinc-500 hover:text-zinc-300 border border-transparent'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search + View Toggle */}
      <div className="shrink-0 px-3 py-1.5 flex items-center gap-1.5">
        <div className="flex-1">
          <PanelSearchInput value={search} onChange={setSearch} placeholder="Search 3D assets..." />
        </div>
        <div className="flex shrink-0 rounded-md overflow-hidden border border-white/[0.06]">
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 transition-colors ${
              viewMode === 'list' ? 'bg-white/[0.1] text-zinc-200' : 'text-zinc-600 hover:text-zinc-400'
            }`}
            title="List view"
          >
            <List size={13} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 transition-colors ${
              viewMode === 'grid' ? 'bg-white/[0.1] text-zinc-200' : 'text-zinc-600 hover:text-zinc-400'
            }`}
            title="Grid view"
          >
            <LayoutGrid size={13} />
          </button>
        </div>
      </div>

      {/* Category pills */}
      <div className="shrink-0 px-3 pb-1.5 flex flex-wrap gap-1">
        {CATEGORIES.map(c => {
          const count = c.id === 'all' ? assets.length : (catCounts[c.id] || 0);
          if (c.id !== 'all' && !count) return null;
          return (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                category === c.id
                  ? 'bg-accent/15 text-accent'
                  : 'bg-white/[0.04] text-zinc-600 hover:text-zinc-400'
              }`}
            >
              {c.label} {count > 0 && <span className="text-zinc-700 ml-0.5">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Asset list / grid */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3">
        {viewMode === 'list' ? (
          <div className="flex flex-col gap-0.5">
            {filtered.map(asset => {
              const isSelected = selectedAsset === asset.name;
              return (
                <button
                  key={asset.name}
                  onClick={() => setSelectedAsset(isSelected ? null : asset.name)}
                  className={`w-full text-left px-2.5 py-2 rounded-lg transition-colors ${
                    isSelected
                      ? 'bg-accent/10 border border-accent/20'
                      : 'hover:bg-panel-surface-hover border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Box size={13} className="shrink-0 text-purple-400" />
                    <span className="flex-1 text-[12px] text-zinc-300 truncate">
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
            {filtered.map(asset => {
              const isSelected = selectedAsset === asset.name;
              return (
                <button
                  key={asset.name}
                  onClick={() => setSelectedAsset(isSelected ? null : asset.name)}
                  className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                    isSelected
                      ? 'bg-accent/10 border border-accent/20'
                      : 'bg-panel-surface hover:bg-panel-surface-hover border border-transparent'
                  }`}
                >
                  <AssetThumbnail modelName={asset.name} size={72} />
                  <span className="text-[11px] text-zinc-400 mt-1 truncate w-full text-center">
                    {asset.name.replace(/_/g, ' ')}
                  </span>
                  <span className={`text-[10px] font-mono ${trisColor(asset.tris)}`}>
                    {formatTris(asset.tris)} tris
                  </span>
                  {isSelected && (
                    <AssetExpandedStats asset={asset} />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <p className="text-xs text-zinc-600">{search ? 'No matching assets' : 'No assets loaded'}</p>
          </div>
        )}
      </div>

      {/* Footer stats */}
      <div className="shrink-0 px-3 py-2 border-t border-white/[0.04] text-[10px] text-zinc-600 flex items-center gap-3">
        <span>{filtered.length} models</span>
        <span>{filtered.reduce((s, a) => s + a.tris, 0).toLocaleString()} total tris</span>
      </div>
    </div>
  );
}
