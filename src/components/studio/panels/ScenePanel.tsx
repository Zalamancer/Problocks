'use client';
import { useMemo, useState, useCallback, useRef } from 'react';
import {
  Eye,
  EyeOff,
  Trash2,
  Box,
  Circle,
  Cylinder,
  Triangle,
  FileCode,
  Folder,
  ChevronDown,
  ChevronRight,
  Layers,
  Search,
  X,
  Square,
  RectangleHorizontal,
} from 'lucide-react';
import { useSceneStore, type PartType } from '@/store/scene-store';
import { useBuildingStore } from '@/store/building-store';
import { useStudio } from '@/store/studio-store';
import { useLightingStore } from '@/store/lighting-store';

// ── Unified layer item type ─────────────────────────────────────────────
interface LayerItem {
  id: string;
  name: string;
  type: 'part' | 'floor' | 'wall' | 'script';
  icon: typeof Box;
  iconColor: string;
  badge: string;
  visible: boolean | null;
  isSelected: boolean;
  onSelect: () => void;
  onToggleVisibility?: () => void;
  onRename?: (next: string) => void;
  onRemove?: () => void;
}

const CATEGORY_ORDER = ['part', 'floor', 'wall', 'script'] as const;

const CATEGORY_LABELS: Record<string, string> = {
  part: 'Workspace',
  floor: 'Floors',
  wall: 'Walls',
  script: 'Scripts',
};

const CATEGORY_SUBLABELS: Record<string, string> = {
  part: 'Parts in your scene',
  floor: 'Floor tiles',
  wall: 'Wall edges',
  script: 'Game code files',
};

const CATEGORY_ICONS: Record<string, typeof Box> = {
  part: Folder,
  floor: Square,
  wall: RectangleHorizontal,
  script: FileCode,
};

const CATEGORY_ICON_BG: Record<string, string> = {
  part: 'bg-blue-500/15 text-blue-300',
  floor: 'bg-amber-500/15 text-amber-300',
  wall: 'bg-rose-500/15 text-rose-300',
  script: 'bg-emerald-500/15 text-emerald-300',
};

const PART_TYPE_ICON: Record<PartType, typeof Box> = {
  Block: Box,
  Sphere: Circle,
  Cylinder: Cylinder,
  Wedge: Triangle,
  GLB: Box,
};

interface Props {
  onSelect: (id: string) => void;
}

export function ScenePanel({ onSelect }: Props) {
  const sceneObjects = useSceneStore((s) => s.sceneObjects);
  const selectedPart = useSceneStore((s) => s.selectedPart);
  const setSelectedPart = useSceneStore((s) => s.setSelectedPart);
  const updateSceneObject = useSceneStore((s) => s.updateSceneObject);
  const removePart = useSceneStore((s) => s.removePart);

  const floors = useBuildingStore((s) => s.floors);
  const walls = useBuildingStore((s) => s.walls);
  const buildingSelection = useBuildingStore((s) => s.selection);
  const setBuildingSelection = useBuildingStore((s) => s.setSelection);
  const eraseFloor = useBuildingStore((s) => s.eraseFloor);
  const eraseWall = useBuildingStore((s) => s.eraseWall);

  const games = useStudio((s) => s.games);
  const activeGameId = useStudio((s) => s.activeGameId);
  const openFileName = useStudio((s) => s.openFileName);
  const setOpenFileName = useStudio((s) => s.setOpenFileName);
  const activeGame = activeGameId ? games.find((g) => g.id === activeGameId) : null;

  const lightingPanelOpen = useLightingStore((s) => s.panelOpen);
  const setLightingPanelOpen = useLightingStore((s) => s.setPanelOpen);

  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const layers: LayerItem[] = useMemo(() => {
    const items: LayerItem[] = [];

    sceneObjects.forEach((part) => {
      items.push({
        id: `part-${part.id}`,
        name: part.name,
        type: 'part',
        icon: PART_TYPE_ICON[part.partType] ?? Box,
        iconColor: part.color,
        badge: part.partType,
        visible: part.visible,
        isSelected: selectedPart?.id === part.id,
        onSelect: () => onSelect(part.id),
        onToggleVisibility: () => updateSceneObject(part.id, { visible: !part.visible }),
        onRename: (next) => updateSceneObject(part.id, { name: next }),
        onRemove: () => removePart(part.id),
      });
    });

    // Floors (sorted by tile coords for stable order)
    Object.entries(floors)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([key, cell]) => {
        const isSelected = buildingSelection?.kind === 'floor' && buildingSelection.key === key;
        items.push({
          id: `floor-${key}`,
          name: cell.asset,
          type: 'floor',
          icon: Square,
          iconColor: '#fbbf24', // amber-400
          badge: `(${key})`,
          visible: null,
          isSelected,
          onSelect: () => {
            setBuildingSelection({ kind: 'floor', key });
            setSelectedPart(null);
          },
          onRemove: () => {
            const [x, y, z] = key.split(',').map(Number);
            eraseFloor(x, y, z);
          },
        });
      });

    // Walls
    Object.entries(walls)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([key, edge]) => {
        const isSelected = buildingSelection?.kind === 'wall' && buildingSelection.key === key;
        items.push({
          id: `wall-${key}`,
          name: edge.asset,
          type: 'wall',
          icon: RectangleHorizontal,
          iconColor: '#fb7185', // rose-400
          badge: `(${key})`,
          visible: null,
          isSelected,
          onSelect: () => {
            setBuildingSelection({ kind: 'wall', key });
            setSelectedPart(null);
          },
          onRemove: () => {
            const parts = key.split(',');
            const x = Number(parts[0]);
            const y = Number(parts[1]);
            const z = Number(parts[2]);
            const dir = parts[3] as 'N' | 'E';
            eraseWall(x, y, z, dir);
          },
        });
      });

    if (activeGame?.files) {
      const names = Object.keys(activeGame.files).sort((a, b) => {
        if (a === 'config.js') return -1;
        if (b === 'config.js') return 1;
        return a.localeCompare(b);
      });
      names.forEach((name) => {
        items.push({
          id: `script-${name}`,
          name,
          type: 'script',
          icon: FileCode,
          iconColor: '#34d399',
          badge: name.endsWith('.js') ? 'JS' : name.split('.').pop()?.toUpperCase() ?? '',
          visible: null,
          isSelected: openFileName === name,
          onSelect: () => setOpenFileName(openFileName === name ? null : name),
        });
      });
    }

    return items;
  }, [
    sceneObjects,
    selectedPart,
    floors,
    walls,
    buildingSelection,
    activeGame,
    openFileName,
    onSelect,
    updateSceneObject,
    removePart,
    setSelectedPart,
    setBuildingSelection,
    eraseFloor,
    eraseWall,
    setOpenFileName,
  ]);

  const grouped = useMemo(() => {
    const map = new Map<string, LayerItem[]>();
    const filtered = q ? layers.filter((l) => l.name.toLowerCase().includes(q)) : layers;
    for (const layer of filtered) {
      const list = map.get(layer.type) || [];
      list.push(layer);
      map.set(layer.type, list);
    }
    return map;
  }, [layers, q]);

  const totalCount = useMemo(
    () => Array.from(grouped.values()).reduce((n, list) => n + list.length, 0),
    [grouped],
  );

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="shrink-0 px-3 pt-3 pb-2">
        <div className="flex items-center gap-2.5 px-3 py-2.5 bg-zinc-800/80 rounded-xl border border-white/[0.08] focus-within:border-accent/50 focus-within:bg-zinc-800 transition-all">
          <Search size={14} className="text-zinc-400 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter scene…"
            className="flex-1 min-w-0 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-zinc-500 hover:text-zinc-200 shrink-0 p-0.5 rounded hover:bg-white/5 transition-colors"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-3">
        {totalCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800/60 ring-1 ring-white/10 flex items-center justify-center mb-4">
              <Layers size={28} className="text-zinc-500" />
            </div>
            <p className="text-base font-medium text-zinc-200">Your scene is empty</p>
            <p className="text-sm mt-1 text-zinc-500">Add parts or generate scripts to begin</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {CATEGORY_ORDER.map((cat) => {
              const items = grouped.get(cat);
              if (!items || items.length === 0) return null;
              const isCollapsed = collapsedCategories.has(cat);
              const CategoryIcon = CATEGORY_ICONS[cat] || Box;
              const iconBg = CATEGORY_ICON_BG[cat] || 'bg-zinc-700/40 text-zinc-300';

              const isWorkspace = cat === 'part';
              const workspaceSelected = isWorkspace && lightingPanelOpen;
              const handleHeaderClick = () => {
                if (isWorkspace) {
                  // Clicking "Workspace" opens the lighting panel on the right
                  // and clears any part/building selection so it wins the
                  // right-panel slot. Chevron (below) still toggles collapse.
                  setSelectedPart(null);
                  setBuildingSelection(null);
                  setLightingPanelOpen(!lightingPanelOpen);
                } else {
                  toggleCategory(cat);
                }
              };

              return (
                <div key={cat} className="flex flex-col gap-1.5">
                  {/* Category header */}
                  <div
                    onClick={handleHeaderClick}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all group ${
                      workspaceSelected ? 'bg-accent/15 shadow-sm shadow-accent/10' : 'hover:bg-zinc-800/60'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
                      <CategoryIcon size={15} />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className={`text-sm font-semibold truncate ${workspaceSelected ? 'text-white' : 'text-zinc-100'}`}>
                        {CATEGORY_LABELS[cat]}
                      </div>
                      <div className="text-xs text-zinc-500 truncate">
                        {items.length} {items.length === 1 ? 'item' : 'items'} · {CATEGORY_SUBLABELS[cat]}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCategory(cat);
                      }}
                      className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-zinc-500 group-hover:text-zinc-300 group-hover:bg-white/5 transition-colors"
                      aria-label={isCollapsed ? 'Expand' : 'Collapse'}
                    >
                      {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>

                  {/* Layer rows */}
                  {!isCollapsed && (
                    <div className="flex flex-col gap-1 pl-1">
                      {items.map((layer) => (
                        <LayerRow key={layer.id} layer={layer} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Individual layer row ─────────────────────────────────────────────────
function LayerRow({ layer }: { layer: LayerItem }) {
  const Icon = layer.icon;
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(layer.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const startRename = useCallback(() => {
    if (!layer.onRename) return;
    setRenameValue(layer.name);
    setIsRenaming(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }, [layer.name, layer.onRename]);

  const commitRename = useCallback(() => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== layer.name && layer.onRename) {
      layer.onRename(trimmed);
    }
    setIsRenaming(false);
  }, [renameValue, layer]);

  return (
    <div
      onClick={layer.onSelect}
      onDoubleClick={startRename}
      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all [content-visibility:auto] [contain-intrinsic-size:0_56px] ${
        layer.isSelected
          ? 'bg-accent/15 shadow-sm shadow-accent/10'
          : 'hover:bg-zinc-800/60'
      }`}
    >
      {/* Thumbnail / icon block */}
      {layer.type === 'part' ? (
        <div
          className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center"
          style={{ background: layer.iconColor }}
        >
          <Icon size={14} className="text-white/80 drop-shadow" />
        </div>
      ) : (
        <div
          className={`w-9 h-9 rounded-lg shrink-0 flex items-center justify-center ${
            layer.type === 'floor'
              ? 'bg-amber-500/15'
              : layer.type === 'wall'
                ? 'bg-rose-500/15'
                : 'bg-emerald-500/15'
          }`}
        >
          <Icon size={16} style={{ color: layer.iconColor }} />
        </div>
      )}

      {/* Name + badge stack */}
      <div className="flex-1 min-w-0">
        {isRenaming ? (
          <input
            ref={inputRef}
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename();
              if (e.key === 'Escape') setIsRenaming(false);
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full text-sm bg-zinc-800 border border-accent/50 rounded-md px-2 py-0.5 text-white outline-none"
            autoFocus
          />
        ) : (
          <div
            className={`text-sm truncate ${
              layer.isSelected ? 'text-white font-semibold' : 'text-zinc-100 font-medium'
            } ${layer.type === 'script' ? 'font-mono' : ''}`}
          >
            {layer.name}
          </div>
        )}
        <div className="text-xs text-zinc-500 truncate">{layer.badge}</div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1 shrink-0">
        {layer.visible !== null && layer.onToggleVisibility && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              layer.onToggleVisibility!();
            }}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              layer.visible
                ? 'text-zinc-400 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100'
                : 'text-zinc-600 hover:text-zinc-200 hover:bg-white/10 opacity-100'
            }`}
            title={layer.visible ? 'Hide' : 'Show'}
            aria-label={layer.visible ? 'Hide' : 'Show'}
          >
            {layer.visible ? <Eye size={15} /> : <EyeOff size={15} />}
          </button>
        )}
        {layer.onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              layer.onRemove!();
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-red-300 hover:bg-red-500/15 opacity-0 group-hover:opacity-100 transition-all"
            title="Remove"
            aria-label="Remove"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
