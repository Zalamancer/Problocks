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
  GripVertical,
  Search,
  X,
} from 'lucide-react';
import { useSceneStore, type ScenePart, type PartType } from '@/store/scene-store';
import { useStudio } from '@/store/studio-store';

// ── Unified layer item type ─────────────────────────────────────────────
interface LayerItem {
  id: string;
  name: string;
  type: 'part' | 'script';
  icon: typeof Box;
  iconColor: string;
  /** Optional secondary label shown on the right (e.g. part type or "JS") */
  badge: string;
  visible: boolean | null; // null = no visibility toggle
  isSelected: boolean;
  onSelect: () => void;
  onToggleVisibility?: () => void;
  onRename?: (next: string) => void;
  onRemove?: () => void;
}

// ── Category grouping ───────────────────────────────────────────────────
const CATEGORY_ORDER = ['part', 'script'] as const;

const CATEGORY_LABELS: Record<string, string> = {
  part: 'Workspace',
  script: 'Scripts',
};

const CATEGORY_ICONS: Record<string, typeof Box> = {
  part: Folder,
  script: FileCode,
};

const CATEGORY_ICON_COLORS: Record<string, string> = {
  part: 'text-blue-400',
  script: 'text-emerald-400',
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
  // ── Scene store (parts) ──
  const sceneObjects = useSceneStore((s) => s.sceneObjects);
  const selectedPart = useSceneStore((s) => s.selectedPart);
  const updateSceneObject = useSceneStore((s) => s.updateSceneObject);
  const removePart = useSceneStore((s) => s.removePart);

  // ── Studio store (active game files = scripts) ──
  const games = useStudio((s) => s.games);
  const activeGameId = useStudio((s) => s.activeGameId);
  const openFileName = useStudio((s) => s.openFileName);
  const setOpenFileName = useStudio((s) => s.setOpenFileName);
  const activeGame = activeGameId ? games.find((g) => g.id === activeGameId) : null;

  // ── Search ──
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  // ── Collapsed categories ──
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  // ── Build unified layers list ────────────────────────────────────────
  const layers: LayerItem[] = useMemo(() => {
    const items: LayerItem[] = [];

    // Parts
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

    // Scripts (sorted, with config.js pinned first)
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
          iconColor: '#34d399', // emerald-400
          badge: name.endsWith('.js') ? 'JS' : name.split('.').pop()?.toUpperCase() ?? '',
          visible: null,
          isSelected: openFileName === name,
          onSelect: () => setOpenFileName(openFileName === name ? null : name),
        });
      });
    }

    return items;
  }, [sceneObjects, selectedPart, activeGame, openFileName, onSelect, updateSceneObject, removePart, setOpenFileName]);

  // ── Group by category ────────────────────────────────────────────────
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

  const totalCount = useMemo(() => Array.from(grouped.values()).reduce((n, list) => n + list.length, 0), [grouped]);

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="shrink-0 px-3 py-2 border-b border-white/5">
        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-zinc-800/60 rounded-lg border border-white/[0.06] focus-within:border-accent/40 transition-colors">
          <Search size={12} className="text-zinc-500 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter scene…"
            className="flex-1 min-w-0 bg-transparent text-xs text-zinc-200 placeholder:text-zinc-600 outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-zinc-600 hover:text-zinc-300 shrink-0"
              aria-label="Clear search"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {totalCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
            <GripVertical size={32} className="mb-3 opacity-40" />
            <p className="text-sm text-zinc-400">No items in scene</p>
            <p className="text-xs mt-1 text-zinc-600">Add parts or generate scripts</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {CATEGORY_ORDER.map((cat) => {
              const items = grouped.get(cat);
              if (!items || items.length === 0) return null;
              const isCollapsed = collapsedCategories.has(cat);
              const CategoryIcon = CATEGORY_ICONS[cat] || Box;
              const iconColor = CATEGORY_ICON_COLORS[cat] || 'text-zinc-400';

              return (
                <div key={cat}>
                  {/* Category header */}
                  <button
                    onClick={() => toggleCategory(cat)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/[0.03] transition-colors"
                  >
                    {isCollapsed ? (
                      <ChevronRight size={12} className="text-zinc-500 shrink-0" />
                    ) : (
                      <ChevronDown size={12} className="text-zinc-500 shrink-0" />
                    )}
                    <CategoryIcon size={12} className={`shrink-0 ${iconColor}`} />
                    <span className="flex-1 text-left">{CATEGORY_LABELS[cat]}</span>
                    <span className="text-[10px] tabular-nums text-zinc-600">{items.length}</span>
                  </button>

                  {/* Layer rows */}
                  {!isCollapsed &&
                    items.map((layer) => <LayerRow key={layer.id} layer={layer} />)}
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
      className={`group flex items-center gap-2 pl-7 pr-2 py-1.5 cursor-pointer transition-colors ${
        layer.isSelected
          ? 'bg-accent/10 border-l-2 border-accent'
          : 'hover:bg-white/[0.04] border-l-2 border-transparent'
      }`}
    >
      {/* Color swatch / icon */}
      {layer.type === 'part' ? (
        <span
          className="w-3 h-3 rounded-sm shrink-0 ring-1 ring-white/10"
          style={{ background: layer.iconColor }}
        />
      ) : (
        <Icon size={13} style={{ color: layer.iconColor }} className="shrink-0" />
      )}

      {/* Type icon (only for parts; scripts already use icon above) */}
      {layer.type === 'part' && <Icon size={11} className="shrink-0 text-zinc-500" />}

      {/* Name */}
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
          className="flex-1 min-w-0 text-xs bg-zinc-800 border border-accent/50 rounded px-1 py-0 text-white outline-none"
          autoFocus
        />
      ) : (
        <span
          className={`flex-1 min-w-0 text-xs truncate ${
            layer.isSelected ? 'text-white font-medium' : 'text-zinc-400'
          } ${layer.type === 'script' ? 'font-mono' : ''}`}
        >
          {layer.name}
        </span>
      )}

      {/* Badge */}
      <span className="text-[10px] tabular-nums text-zinc-600 shrink-0 group-hover:text-zinc-500 transition-colors">
        {layer.badge}
      </span>

      {/* Visibility toggle */}
      {layer.visible !== null && layer.onToggleVisibility && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            layer.onToggleVisibility!();
          }}
          className={`p-0.5 rounded transition-colors shrink-0 ${
            layer.visible
              ? 'text-zinc-500 hover:text-zinc-200 opacity-0 group-hover:opacity-100'
              : 'text-zinc-700 hover:text-zinc-400 opacity-100'
          }`}
          title={layer.visible ? 'Hide' : 'Show'}
          aria-label={layer.visible ? 'Hide' : 'Show'}
        >
          {layer.visible ? <Eye size={12} /> : <EyeOff size={12} />}
        </button>
      )}

      {/* Remove */}
      {layer.onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            layer.onRemove!();
          }}
          className="p-0.5 rounded text-zinc-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all shrink-0"
          title="Remove"
          aria-label="Remove"
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  );
}
