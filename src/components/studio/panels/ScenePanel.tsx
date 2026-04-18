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
import { SectionLabel, type PBTone } from '@/components/ui';

// Ported from /tmp/design_bundle2/problocks/project/studio/leftpanel.jsx
// SceneTab — grouped rows with colored ToneBadge-style tiles, chunky
// cream-2 + ink selected state, and pastel category headers.

// ── Unified layer item type ─────────────────────────────────────────────
interface LayerItem {
  id: string;
  name: string;
  type: 'part' | 'floor' | 'wall' | 'script';
  icon: typeof Box;
  iconColor: string;        // part: user color hex; others: derived from category tone
  badge: string;
  visible: boolean | null;
  isSelected: boolean;
  onSelect: () => void;
  onToggleVisibility?: () => void;
  onRename?: (next: string) => void;
  onRemove?: () => void;
}

type SceneCat = 'part' | 'floor' | 'wall' | 'script';

const CATEGORY_ORDER: SceneCat[] = ['part', 'floor', 'wall', 'script'];

interface CategoryMeta {
  label: string;
  sub: string;
  icon: typeof Box;
  tone: Exclude<PBTone, 'paper' | 'ink'>;
}

const CATEGORY_META: Record<SceneCat, CategoryMeta> = {
  part:   { label: 'Workspace', sub: 'Parts in your scene', icon: Folder,                tone: 'sky'    },
  floor:  { label: 'Floors',    sub: 'Floor tiles',         icon: Square,                tone: 'butter' },
  wall:   { label: 'Walls',     sub: 'Wall edges',          icon: RectangleHorizontal,   tone: 'coral'  },
  script: { label: 'Scripts',   sub: 'Game code files',     icon: FileCode,              tone: 'mint'   },
};

const PART_TYPE_ICON: Record<PartType, typeof Box> = {
  Block: Box,
  Sphere: Circle,
  Cylinder: Cylinder,
  Wedge: Triangle,
  GLB: Box,
};

// ── Tile helpers ────────────────────────────────────────────────────────
function toneVars(tone: Exclude<PBTone, 'paper' | 'ink'>) {
  return {
    bg: `var(--pb-${tone})`,
    ink: `var(--pb-${tone}-ink)`,
  };
}

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
  const rightPanelGroup = useStudio((s) => s.rightPanelActiveGroup);
  const setRightPanelGroup = useStudio((s) => s.setRightPanelGroup);

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

    Object.entries(floors)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([key, cell]) => {
        const isSelected = buildingSelection?.kind === 'floor' && buildingSelection.key === key;
        items.push({
          id: `floor-${key}`,
          name: cell.asset,
          type: 'floor',
          icon: Square,
          iconColor: 'var(--pb-butter-ink)',
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

    Object.entries(walls)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([key, edge]) => {
        const isSelected = buildingSelection?.kind === 'wall' && buildingSelection.key === key;
        items.push({
          id: `wall-${key}`,
          name: edge.asset,
          type: 'wall',
          icon: RectangleHorizontal,
          iconColor: 'var(--pb-coral-ink)',
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
          iconColor: 'var(--pb-mint-ink)',
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
      {/* Search — cream-2 well with 1.5px line border */}
      <div className="shrink-0" style={{ padding: '10px 14px 6px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 10px',
            borderRadius: 10,
            background: 'var(--pb-cream-2)',
            border: '1.5px solid var(--pb-line-2)',
          }}
        >
          <Search size={13} strokeWidth={2.2} style={{ color: 'var(--pb-ink-muted)', flexShrink: 0 }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter scene…"
            style={{
              flex: 1,
              minWidth: 0,
              background: 'transparent',
              border: 0,
              outline: 'none',
              fontSize: 12.5,
              fontWeight: 500,
              color: 'var(--pb-ink)',
              fontFamily: 'inherit',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="Clear search"
              style={{
                width: 18,
                height: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 0,
                color: 'var(--pb-ink-muted)',
                cursor: 'pointer',
                borderRadius: 4,
              }}
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-y-auto" style={{ padding: '6px 14px 14px' }}>
        <SectionLabel
          trailing={<span style={{ color: 'var(--pb-ink-muted)' }}>{totalCount}</span>}
        >
          Scene
        </SectionLabel>

        {totalCount === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px 0',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: 'var(--pb-cream-2)',
                border: '1.5px solid var(--pb-line-2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 14,
              }}
            >
              <Layers size={24} strokeWidth={2.2} style={{ color: 'var(--pb-ink-muted)' }} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--pb-ink)', margin: 0 }}>
              Your scene is empty
            </p>
            <p style={{ fontSize: 12, color: 'var(--pb-ink-muted)', marginTop: 4 }}>
              Add parts or generate scripts to begin
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {CATEGORY_ORDER.map((cat) => {
              const items = grouped.get(cat);
              if (!items || items.length === 0) return null;
              const isCollapsed = collapsedCategories.has(cat);
              const meta = CATEGORY_META[cat];
              const tone = toneVars(meta.tone);
              const CategoryIcon = meta.icon;

              const isWorkspace = cat === 'part';
              // Workspace is its own right-panel tab now. Treat as
              // "selected" whenever the right panel is on the Workspace
              // tab — keeps the highlight in sync without the legacy
              // lightingPanelOpen flag.
              const workspaceSelected = isWorkspace && rightPanelGroup === 'workspace';
              const handleHeaderClick = () => {
                if (isWorkspace) {
                  // Click name → switch right panel to Workspace tab so
                  // lighting/atmosphere controls become visible.
                  setSelectedPart(null);
                  setBuildingSelection(null);
                  if (rightPanelGroup === 'workspace') {
                    // Toggle off → go back to Properties.
                    setRightPanelGroup('properties');
                    setLightingPanelOpen(false);
                  } else {
                    setRightPanelGroup('workspace');
                    setLightingPanelOpen(true);
                  }
                } else {
                  toggleCategory(cat);
                }
              };

              return (
                <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {/* Category header — ToneBadge tile + label + subtitle + chevron */}
                  <button
                    type="button"
                    onClick={handleHeaderClick}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 10px',
                      borderRadius: 12,
                      background: workspaceSelected ? 'var(--pb-cream-2)' : 'transparent',
                      border: 0,
                      textAlign: 'left',
                      fontFamily: 'inherit',
                      cursor: 'pointer',
                      transition: 'background 120ms ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!workspaceSelected) e.currentTarget.style.background = 'var(--pb-cream-2)';
                    }}
                    onMouseLeave={(e) => {
                      if (!workspaceSelected) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 9,
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: tone.bg,
                        color: tone.ink,
                        border: `1.5px solid ${tone.ink}`,
                      }}
                    >
                      <CategoryIcon size={14} strokeWidth={2.2} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 12.5,
                          fontWeight: 700,
                          color: 'var(--pb-ink)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {meta.label}
                      </div>
                      <div
                        style={{
                          fontSize: 10.5,
                          color: 'var(--pb-ink-muted)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {items.length} {items.length === 1 ? 'item' : 'items'} · {meta.sub}
                      </div>
                    </div>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCategory(cat);
                      }}
                      role="button"
                      aria-label={isCollapsed ? 'Expand' : 'Collapse'}
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 6,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--pb-ink-muted)',
                        flexShrink: 0,
                        cursor: 'pointer',
                      }}
                    >
                      {isCollapsed ? <ChevronRight size={14} strokeWidth={2.4} /> : <ChevronDown size={14} strokeWidth={2.4} />}
                    </span>
                  </button>

                  {!isCollapsed && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 2 }}>
                      {items.map((layer) => (
                        <LayerRow key={layer.id} layer={layer} cat={cat} />
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

// ── Individual layer row — chunky cream-2 + ink selected state ─────────
function LayerRow({ layer, cat }: { layer: LayerItem; cat: SceneCat }) {
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

  const meta = CATEGORY_META[cat];
  const tone = toneVars(meta.tone);

  // Parts render the user's actual hex color; other categories use the
  // category tone. Border is always ink-style for readability.
  const tileBg = cat === 'part' ? layer.iconColor : tone.bg;
  const tileBorder = cat === 'part' ? 'var(--pb-ink)' : tone.ink;
  const tileIconColor = cat === 'part' ? 'var(--pb-paper)' : tone.ink;

  return (
    <div
      onClick={layer.onSelect}
      onDoubleClick={startRename}
      className="group"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '7px 10px',
        borderRadius: 10,
        background: layer.isSelected ? 'var(--pb-cream-2)' : 'transparent',
        border: `1.5px solid ${layer.isSelected ? 'var(--pb-ink)' : 'transparent'}`,
        boxShadow: layer.isSelected ? '0 2px 0 var(--pb-ink)' : 'none',
        cursor: 'pointer',
        transition: 'background 120ms ease',
        contentVisibility: 'auto',
      }}
      onMouseEnter={(e) => {
        if (!layer.isSelected) e.currentTarget.style.background = 'var(--pb-cream-2)';
      }}
      onMouseLeave={(e) => {
        if (!layer.isSelected) e.currentTarget.style.background = 'transparent';
      }}
    >
      {/* Tile */}
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 7,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: tileBg,
          color: tileIconColor,
          border: `1.5px solid ${tileBorder}`,
        }}
      >
        <Icon size={14} strokeWidth={2.2} />
      </div>

      {/* Name + badge */}
      <div style={{ flex: 1, minWidth: 0 }}>
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
            autoFocus
            style={{
              width: '100%',
              fontSize: 12.5,
              fontFamily: 'inherit',
              background: 'var(--pb-paper)',
              border: '1.5px solid var(--pb-ink)',
              borderRadius: 6,
              padding: '2px 6px',
              outline: 'none',
              color: 'var(--pb-ink)',
            }}
          />
        ) : (
          <div
            style={{
              fontSize: 12.5,
              fontWeight: layer.isSelected ? 700 : 600,
              color: 'var(--pb-ink)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontFamily: cat === 'script' ? 'DM Mono, monospace' : 'inherit',
            }}
          >
            {layer.name}
          </div>
        )}
        <div
          style={{
            fontSize: 10,
            color: 'var(--pb-ink-muted)',
            marginTop: 1,
            fontFamily: 'DM Mono, monospace',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {layer.badge}
        </div>
      </div>

      {/* Action buttons (hidden until hover, except visibility-off) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexShrink: 0,
        }}
      >
        {layer.visible !== null && layer.onToggleVisibility && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              layer.onToggleVisibility!();
            }}
            className={layer.visible ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}
            title={layer.visible ? 'Hide' : 'Show'}
            aria-label={layer.visible ? 'Hide' : 'Show'}
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 0,
              color: layer.visible ? 'var(--pb-ink-soft)' : 'var(--pb-ink-muted)',
              cursor: 'pointer',
              transition: 'opacity 120ms',
            }}
          >
            {layer.visible ? <Eye size={13} /> : <EyeOff size={13} />}
          </button>
        )}
        {layer.onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              layer.onRemove!();
            }}
            className="opacity-0 group-hover:opacity-100"
            title="Remove"
            aria-label="Remove"
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 0,
              color: 'var(--pb-ink-muted)',
              cursor: 'pointer',
              transition: 'opacity 120ms, color 120ms, background 120ms',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--pb-coral-ink)';
              e.currentTarget.style.background = 'var(--pb-coral)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--pb-ink-muted)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
