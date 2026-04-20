// Full Problocks wardrobe page — Three.js avatar stage, 12-category picker,
// filters (search / theme / rarity / owned-only), economy, presets, randomize.
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Block, Chunky, Icon, Pill } from '@/components/landing/pb-site/primitives';
import { RobloxAvatar } from '../RobloxAvatar';
import { outfitToAvatar } from './avatar-map';
import {
  CATEGORY_ICONS, CATEGORY_LABELS, ITEMS_BY_CATEGORY, ITEMS_BY_ID,
  defaultOwned, isOwned,
} from './catalog';
import { PRESETS, defaultOutfit, randomizeOutfit } from './presets';
import {
  EMOTE_LABELS, GENDER_LABELS, RARITY_COLORS, SKIN_COLORS, THEME_LABELS,
  type Category, type Emote, type Gender, type Item, type MeshCategory,
  type Outfit, type Rarity, type Theme,
} from './types';

// Two-level grouping: user clicks a group (Head / Clothes / Gear / Character)
// and the relevant sub-categories expand underneath. This keeps the 12-cat
// picker from being a wall of icons.
type Group = 'head' | 'clothes' | 'gear' | 'character';

const GROUPS: { id: Group; label: string; icon: string; categories: Category[] }[] = [
  { id: 'head',      label: 'Head',      icon: '🎩', categories: ['hat', 'hair', 'face'] },
  { id: 'clothes',   label: 'Clothes',   icon: '👕', categories: ['shirt', 'pants', 'shoes'] },
  { id: 'gear',      label: 'Gear',      icon: '🎒', categories: ['backpack', 'accessory', 'pet'] },
  { id: 'character', label: 'Character', icon: '💪', categories: ['skin', 'body', 'emote'] },
];

const GROUP_FOR_CATEGORY: Record<Category, Group> = GROUPS.reduce((acc, g) => {
  for (const c of g.categories) acc[c] = g.id;
  return acc;
}, {} as Record<Category, Group>);

// Categories the RobloxAvatar renderer actually draws. Other mesh categories
// (shoes, backpack, accessory, pet) fall back to the category emoji in tiles.
const AVATAR_RENDERED: ReadonlySet<MeshCategory> = new Set([
  'hat', 'hair', 'face', 'shirt', 'pants',
]);

const STARTING_BLOCKS = 1240;

export const Wardrobe = () => {
  const [outfit, setOutfit] = useState<Outfit>(defaultOutfit());
  const [owned, setOwned] = useState<Set<string>>(defaultOwned());
  const [blocks, setBlocks] = useState<number>(STARTING_BLOCKS);
  const [group, setGroup] = useState<Group>('head');
  const [category, setCategory] = useState<Category>('hat');
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState<Theme | 'all'>('all');
  const [rarity, setRarity] = useState<Rarity | 'all'>('all');
  const [ownedOnly, setOwnedOnly] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [savedPresets, setSavedPresets] = useState<{ id: string; label: string; outfit: Outfit }[]>([]);
  const [flash, setFlash] = useState<string | null>(null);
  // Memoize the converted outfit so RobloxAvatar's WebGL scene only rebuilds
  // when something it actually renders changes (skin/shirt/pants/face/hat/hair).
  const avatarOutfit = useMemo(() => outfitToAvatar(outfit), [outfit]);

  const showFlash = (msg: string) => {
    setFlash(msg);
    window.setTimeout(() => setFlash((f) => (f === msg ? null : f)), 1800);
  };

  const equipMesh = (item: Item) => {
    if (!isOwned(item.id, owned)) {
      if (blocks < item.cost) {
        showFlash(`Need ${item.cost - blocks} more blocks`);
        return;
      }
      setBlocks((b) => b - item.cost);
      setOwned((o) => new Set(o).add(item.id));
      showFlash(`Unlocked: ${item.label}`);
    }
    // Determine slot for each mesh category and toggle.
    setOutfit((o) => {
      const slot = item.category;
      const cur = o[slot];
      const next = { ...o };
      if (cur === item.id) {
        // Unequip → set to null (face must remain set).
        if (slot === 'face') next.face = 'face-smile';
        else (next[slot] as string | null) = null;
      } else {
        (next[slot] as string | null) = item.id;
      }
      return next;
    });
  };

  const meshItems = useMemo((): Item[] => {
    if (category === 'skin' || category === 'body' || category === 'emote') return [];
    const pool = ITEMS_BY_CATEGORY[category];
    const q = search.trim().toLowerCase();
    return pool.filter((it) => {
      if (q && !it.label.toLowerCase().includes(q)) return false;
      if (theme !== 'all' && it.theme !== theme) return false;
      if (rarity !== 'all' && it.rarity !== rarity) return false;
      if (ownedOnly && !isOwned(it.id, owned)) return false;
      return true;
    });
  }, [category, search, theme, rarity, ownedOnly, owned]);

  const applyPreset = (o: Outfit) => setOutfit({ ...o });

  const savePreset = () => {
    const label = window.prompt('Name this outfit:', `My outfit ${savedPresets.length + 1}`);
    if (!label) return;
    setSavedPresets((s) => [...s, { id: `saved-${Date.now()}`, label, outfit: { ...outfit } }]);
    showFlash('Outfit saved');
  };

  const doRandomize = () => {
    setOutfit((o) => randomizeOutfit(o, owned));
    showFlash('Randomized!');
  };

  // Reset everything to default (unlocks/blocks untouched).
  const reset = () => setOutfit(defaultOutfit());

  return (
    <div
      className="pbs-wrap"
      style={{
        padding: '20px 28px 20px',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >

      {/* Header */}
      <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, marginBottom: 18 }}>
        <div>
          <Pill tone="butter" icon="sparkle">Wardrobe</Pill>
          <h1 style={{
            margin: '10px 0 0',
            fontSize: 'clamp(30px, 3.6vw, 44px)',
            fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.02,
          }}>
            Dress your <span className="pbs-serif">block.</span>
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <BlocksChip value={blocks}/>
          <Chunky tone="butter" icon="sparkle" onClick={doRandomize}>Randomize</Chunky>
          <Chunky tone="ghost" icon="check" onClick={savePreset}>Save outfit</Chunky>
          <Chunky
            as="a"
            href="/student"
            tone="ghost"
            icon="chevron"
            onClick={(e: React.MouseEvent) => {
              // Prefer returning to the previous page (e.g. dashboard) with
              // its in-memory state intact, instead of landing on /student
              // which always boots at the auth screen.
              if (typeof window !== 'undefined' && window.history.length > 1) {
                e.preventDefault();
                window.history.back();
              }
            }}
          >Back</Chunky>
        </div>
      </div>

      <div style={{ flex: '1 1 auto', minHeight: 0, display: 'grid', gridTemplateColumns: '1fr 1.35fr', gap: 22, alignItems: 'stretch' }}>

        {/* ─── Left: avatar stage + controls + presets ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0, height: '100%', overflow: 'hidden' }}>
          <Block tone="ink" style={{ padding: 16, color: 'var(--pbs-cream)', flex: '1 1 auto', minHeight: 0, display: 'flex', flexDirection: 'column', position: 'relative' }}>
            {/* Avatar stage — takes the full card height; controls float over it */}
            <div style={{ flex: '1 1 auto', minHeight: 0, borderRadius: 14, overflow: 'visible', background: 'radial-gradient(circle at 50% 35%, #2a2720 0%, #1d1a14 70%)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RobloxAvatar size="fill" framed={false} outfit={avatarOutfit} autoRotate={autoRotate}/>
              {flash && (
                <div style={{
                  position: 'absolute', left: 0, right: 0, bottom: 14,
                  textAlign: 'center', fontSize: 13, fontWeight: 700,
                  color: 'var(--pbs-cream)', textShadow: '0 2px 4px rgba(0,0,0,0.6)',
                  pointerEvents: 'none',
                }}>{flash}</div>
              )}
            </div>
            {/* Floating controls — absolute so the avatar can render behind the
                bottom of the card; transparent row background, only the pill /
                button backgrounds themselves are visible. */}
            <div style={{
              position: 'absolute', left: 16, right: 16, bottom: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
              background: 'transparent', pointerEvents: 'none', zIndex: 2,
            }}>
              <div style={{ pointerEvents: 'auto' }}>
                <ToggleRow label="Auto-rotate" on={autoRotate} onChange={setAutoRotate}/>
              </div>
              <button onClick={reset} style={{ ...ghostBtn, pointerEvents: 'auto' }}>
                <Icon name="minus" size={13}/> Clear outfit
              </button>
            </div>
          </Block>

          <Block tone="paper" style={{ padding: 14, flex: '0 0 auto' }}>
            <SubLabel>Presets</SubLabel>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {PRESETS.map((p) => (
                <button key={p.id} onClick={() => applyPreset(p.outfit)} style={presetBtn}>
                  {p.label}
                </button>
              ))}
              {savedPresets.map((p) => (
                <button key={p.id} onClick={() => applyPreset(p.outfit)} style={{ ...presetBtn, borderStyle: 'dashed' }}>
                  {p.label}
                </button>
              ))}
            </div>
          </Block>
        </div>

        {/* ─── Right: category tabs + filters + grid ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, height: '100%' }}>

          {/* Sticky header: group tabs → sub-category tabs → filters */}
          <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 12 }}>
            {/* Unified category picker — groups on top, the active group's
                sub-categories live on the same paper surface under a hair
                divider. Reads as one tab-bar-with-subnav, not two strips. */}
            <div style={{
              background: 'var(--pbs-paper)',
              border: '1.5px solid var(--pbs-line-2)',
              borderRadius: 16,
              overflow: 'hidden',
            }}>
              {/* Groups */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: 6 }}>
                {GROUPS.map((g) => (
                  <GroupTab
                    key={g.id}
                    label={g.label}
                    icon={g.icon}
                    active={g.id === group}
                    onClick={() => {
                      setGroup(g.id);
                      // When a new group is picked, jump to its first sub-category.
                      const first = g.categories[0];
                      if (first && GROUP_FOR_CATEGORY[category] !== g.id) setCategory(first);
                    }}
                  />
                ))}
              </div>
              {/* Sub-row — lower contrast, hair divider above, tighter pills.
                  Visually nested under the groups so the hierarchy is obvious. */}
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: 4,
                padding: '6px 8px',
                borderTop: '1.5px dashed var(--pbs-line-2)',
                background: 'color-mix(in srgb, var(--pbs-paper) 60%, transparent)',
              }}>
                {GROUPS.find((g) => g.id === group)!.categories.map((c) => (
                  <CategoryTab key={c} category={c} active={c === category} onClick={() => setCategory(c)}/>
                ))}
              </div>
            </div>

            {/* Filters (only for mesh categories) */}
            {(category !== 'skin' && category !== 'body' && category !== 'emote') && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: '1 1 220px' }}>
                  <Icon name="compass" size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', opacity: 0.6 }}/>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search items…"
                    style={{
                      width: '100%', padding: '10px 12px 10px 30px',
                      borderRadius: 12, border: '1.5px solid var(--pbs-line-2)',
                      background: 'var(--pbs-paper)', fontSize: 13.5, fontFamily: 'inherit',
                      color: 'var(--pbs-ink)',
                    }}
                  />
                </div>
                <ChunkySelect
                  value={theme}
                  onChange={(v) => setTheme(v as Theme | 'all')}
                  options={[['all', 'All themes'], ...Object.entries(THEME_LABELS)]}
                />
                <ChunkySelect
                  value={rarity}
                  onChange={(v) => setRarity(v as Rarity | 'all')}
                  options={[
                    ['all', 'All rarity'],
                    ...Object.entries(RARITY_COLORS).map(([k, v]) => [k, v.label] as [string, string]),
                  ]}
                />
                <ToggleRow label="Owned only" on={ownedOnly} onChange={setOwnedOnly}/>
              </div>
            )}
          </div>

          {/* Scrollable body: grid / panels */}
          <div style={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', paddingRight: 6 }}>
            {category === 'skin' && (
              <SkinPanel outfit={outfit} onChange={(skin) => setOutfit((o) => ({ ...o, skin }))}/>
            )}
            {category === 'body' && (
              <BodyPanel
                gender={outfit.gender}
                onChange={(g) => setOutfit((o) => ({ ...o, gender: g }))}
              />
            )}
            {category === 'emote' && (
              <EmotePanel emote={outfit.emote} onChange={(e) => setOutfit((o) => ({ ...o, emote: e }))}/>
            )}

            {(category !== 'skin' && category !== 'body' && category !== 'emote') && (
              <div style={{
                display: 'grid', gap: 10,
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
              }}>
                {meshItems.map((it) => (
                  <ItemTile
                    key={it.id}
                    item={it}
                    equipped={outfit[it.category as MeshCategory] === it.id}
                    owned={isOwned(it.id, owned)}
                    canAfford={blocks >= it.cost}
                    onClick={() => equipMesh(it)}
                  />
                ))}
                {meshItems.length === 0 && (
                  <div style={{
                    gridColumn: '1 / -1', textAlign: 'center',
                    padding: 40, color: 'var(--pbs-ink-muted)', fontSize: 13,
                  }}>No items match those filters.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────── Tiles + controls ───────────

const ItemTile = ({
  item, equipped, owned, canAfford, onClick,
}: {
  item: Item;
  equipped: boolean;
  owned: boolean;
  canAfford: boolean;
  onClick: () => void;
}) => {
  const r = RARITY_COLORS[item.rarity];
  return (
    <button
      onClick={onClick}
      style={{
        position: 'relative', display: 'flex', flexDirection: 'column',
        padding: 10, gap: 8,
        background: 'var(--pbs-paper)',
        border: `2px solid ${equipped ? 'var(--pbs-ink)' : 'var(--pbs-line-2)'}`,
        borderRadius: 14,
        boxShadow: equipped ? '0 3px 0 var(--pbs-ink)' : '0 2px 0 rgba(0,0,0,0.08)',
        cursor: 'pointer', fontFamily: 'inherit', color: 'inherit',
        textAlign: 'left',
      }}
    >
      <div style={{
        aspectRatio: '1 / 1',
        borderRadius: 10,
        background: `linear-gradient(160deg, ${r.bg} 0%, var(--pbs-paper) 100%)`,
        border: `1.5px solid ${r.ink}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 32,
        overflow: 'hidden',
        position: 'relative',
      }}>
        {AVATAR_RENDERED.has(item.category) ? (
          <RobloxAvatar
            size="fill"
            framed={false}
            outfit={outfitToAvatar(previewOutfit(item))}
            autoRotate={false}
            showControls={false}
          />
        ) : (
          CATEGORY_ICONS[item.category]
        )}
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '-0.005em', lineHeight: 1.2 }}>
        {item.label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
        <span style={{
          fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
          padding: '2px 7px', borderRadius: 999,
          background: r.bg, color: r.ink, border: `1px solid ${r.ink}`,
        }}>{r.label}</span>
        {owned ? (
          <span style={{ fontSize: 10.5, color: 'var(--pbs-ink-muted)' }}>Owned</span>
        ) : (
          <span style={{
            fontSize: 11, fontWeight: 700,
            color: canAfford ? 'var(--pbs-ink)' : '#b54040',
            display: 'inline-flex', alignItems: 'center', gap: 3,
          }}>
            <Icon name="lock" size={10}/> {item.cost}
          </span>
        )}
      </div>
      {equipped && (
        <span style={{
          position: 'absolute', top: -8, right: -8,
          background: 'var(--pbs-ink)', color: 'var(--pbs-cream)',
          fontSize: 9.5, fontWeight: 800, letterSpacing: '0.08em',
          padding: '3px 7px', borderRadius: 999, border: '2px solid var(--pbs-cream)',
        }}>WORN</span>
      )}
    </button>
  );
};

const CategoryTab = ({ category, active, onClick }: { category: Category; active: boolean; onClick: () => void }) => {
  const label = category === 'skin' ? 'Skin'
    : category === 'body' ? 'Body'
    : category === 'emote' ? 'Emote'
    : CATEGORY_LABELS[category];
  const icon = category === 'skin' ? '🎨'
    : category === 'body' ? '💪'
    : category === 'emote' ? '💃'
    : CATEGORY_ICONS[category];
  // Sub-nav pill: quieter than the group tab. Active state uses butter (not
  // ink) so it reads as "selected within the active group" rather than
  // competing with the group's ink highlight above it.
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '5px 11px', borderRadius: 999,
        background: active ? 'var(--pbs-butter)' : 'transparent',
        color: active ? 'var(--pbs-butter-ink)' : 'var(--pbs-ink-muted)',
        border: `1.5px solid ${active ? 'var(--pbs-butter-ink)' : 'transparent'}`,
        fontSize: 12, fontWeight: 700,
        cursor: 'pointer', fontFamily: 'inherit',
        boxShadow: active ? '0 2px 0 var(--pbs-butter-ink)' : 'none',
      }}
    >
      <span style={{ fontSize: 13 }}>{icon}</span>{label}
    </button>
  );
};

const GroupTab = ({
  label, icon, active, onClick,
}: { label: string; icon: string; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '9px 16px', borderRadius: 999,
      background: active ? 'var(--pbs-ink)' : 'transparent',
      color: active ? 'var(--pbs-cream)' : 'var(--pbs-ink)',
      border: `1.5px solid ${active ? 'var(--pbs-ink)' : 'transparent'}`,
      fontSize: 13.5, fontWeight: 800, letterSpacing: '-0.005em',
      cursor: 'pointer', fontFamily: 'inherit',
    }}
  >
    <span style={{ fontSize: 15 }}>{icon}</span>{label}
  </button>
);

// Chunky-pastel styled dropdown — no native <select>, matches the rest of
// the wardrobe (paper surface, line-2 border, ink hover).
const ChunkySelect = ({
  value, onChange, options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);
  const current = options.find((o) => o[0] === value);
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '9px 14px', borderRadius: 12,
          border: '1.5px solid var(--pbs-line-2)',
          background: 'var(--pbs-paper)', color: 'var(--pbs-ink)',
          fontSize: 13, fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 2px 0 rgba(0,0,0,0.06)',
        }}
      >
        {current ? current[1] : ''}
        <span style={{ fontSize: 10, opacity: 0.7, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 120ms' }}>▾</span>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 50,
          minWidth: '100%', padding: 6,
          background: 'var(--pbs-paper)',
          border: '1.5px solid var(--pbs-line-2)',
          borderRadius: 12,
          boxShadow: '0 6px 0 rgba(0,0,0,0.08), 0 2px 10px rgba(0,0,0,0.06)',
          maxHeight: 260, overflowY: 'auto',
        }}>
          {options.map(([v, l]) => {
            const active = v === value;
            return (
              <button
                key={v}
                type="button"
                onClick={() => { onChange(v); setOpen(false); }}
                style={{
                  display: 'block', width: '100%', padding: '8px 10px',
                  borderRadius: 8,
                  background: active ? 'var(--pbs-ink)' : 'transparent',
                  color: active ? 'var(--pbs-cream)' : 'var(--pbs-ink)',
                  border: 'none', fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                  whiteSpace: 'nowrap',
                }}
              >
                {l}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

/** Minimal outfit with only this item equipped — used to render isolated
 *  previews inside wardrobe tiles. Matches the helper in CrateUnboxing. */
function previewOutfit(item: Item): Outfit {
  const base = defaultOutfit();
  return {
    ...base,
    hat:       item.category === 'hat'   ? item.id      : null,
    hair:      item.category === 'hair'  ? item.id      : null,
    face:      item.category === 'face'  ? item.id      : 'face-smile',
    shirt:     item.category === 'shirt' ? item.id      : null,
    pants:     item.category === 'pants' ? item.id      : null,
    shoes:     null,
    backpack:  null,
    accessory: null,
    pet:       null,
  };
}

const ToggleRow = ({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) => (
  <button
    onClick={() => onChange(!on)}
    style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '7px 12px', borderRadius: 999,
      background: on ? 'var(--pbs-butter)' : 'transparent',
      color: on ? 'var(--pbs-butter-ink)' : 'currentColor',
      border: `1.5px solid ${on ? 'var(--pbs-butter-ink)' : 'currentColor'}`,
      fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
      opacity: on ? 1 : 0.75,
    }}
  >
    <span style={{
      width: 18, height: 18, borderRadius: 999,
      border: `2px solid ${on ? 'var(--pbs-butter-ink)' : 'currentColor'}`,
      background: on ? 'var(--pbs-butter-ink)' : 'transparent',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {on && <Icon name="check" size={10} style={{ color: 'var(--pbs-butter)' }}/>}
    </span>
    {label}
  </button>
);

const BlocksChip = ({ value }: { value: number }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '8px 14px', borderRadius: 999,
    background: 'var(--pbs-mint)', color: 'var(--pbs-mint-ink)',
    border: '1.5px solid var(--pbs-mint-ink)',
    fontSize: 14, fontWeight: 800, letterSpacing: '-0.005em',
    boxShadow: '0 2px 0 var(--pbs-mint-ink)',
  }}>
    <Icon name="coin" size={16} stroke={2.4}/>
    {value.toLocaleString()} <span style={{ fontWeight: 500, fontSize: 11.5, opacity: 0.85 }}>blocks</span>
  </div>
);

// ─── Skin / Body / Emote panels ───

const SkinPanel = ({ outfit, onChange }: { outfit: Outfit; onChange: (s: string) => void }) => (
  <Block tone="paper" style={{ padding: 18 }}>
    <SubLabel>Skin tone</SubLabel>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
      {SKIN_COLORS.map((c) => {
        const active = c === outfit.skin;
        return (
          <button
            key={c}
            onClick={() => onChange(c)}
            style={{
              width: 48, height: 48, borderRadius: 14,
              background: c,
              border: `3px solid ${active ? 'var(--pbs-ink)' : 'var(--pbs-line-2)'}`,
              boxShadow: active ? '0 3px 0 var(--pbs-ink)' : '0 2px 0 rgba(0,0,0,0.08)',
              cursor: 'pointer', position: 'relative',
            }}
          >
            {active && <Icon name="check" size={18} stroke={3} style={{ color: '#fff', mixBlendMode: 'difference' }}/>}
          </button>
        );
      })}
    </div>
  </Block>
);

const BodyPanel = ({ gender, onChange }: { gender: Gender; onChange: (g: Gender) => void }) => (
  <Block tone="paper" style={{ padding: 18 }}>
    <SubLabel>Body type</SubLabel>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
      {(Object.keys(GENDER_LABELS) as Gender[]).map((g) => {
        const active = g === gender;
        return (
          <button key={g} onClick={() => onChange(g)} style={{
            padding: 14, borderRadius: 14,
            background: active ? 'var(--pbs-ink)' : 'var(--pbs-paper)',
            color: active ? 'var(--pbs-cream)' : 'var(--pbs-ink)',
            border: `2px solid ${active ? 'var(--pbs-ink)' : 'var(--pbs-line-2)'}`,
            fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          }}>{GENDER_LABELS[g]}</button>
        );
      })}
    </div>
  </Block>
);

const EmotePanel = ({ emote, onChange }: { emote: Emote; onChange: (e: Emote) => void }) => (
  <Block tone="paper" style={{ padding: 18 }}>
    <SubLabel>Emote</SubLabel>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
      {(Object.keys(EMOTE_LABELS) as Emote[]).map((e) => {
        const active = e === emote;
        return (
          <button key={e} onClick={() => onChange(e)} style={{
            padding: 14, borderRadius: 14,
            background: active ? 'var(--pbs-ink)' : 'var(--pbs-paper)',
            color: active ? 'var(--pbs-cream)' : 'var(--pbs-ink)',
            border: `2px solid ${active ? 'var(--pbs-ink)' : 'var(--pbs-line-2)'}`,
            fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          }}>{EMOTE_LABELS[e]}</button>
        );
      })}
    </div>
  </Block>
);

// ─── Little bits ───

const SubLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="pbs-mono" style={{
    fontSize: 10.5, color: 'var(--pbs-ink-muted)',
    textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10,
  }}>{children}</div>
);

const ghostBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 5,
  padding: '7px 10px', borderRadius: 10,
  background: 'transparent', color: 'var(--pbs-cream)',
  border: '1.5px solid rgba(253,246,230,0.25)',
  fontSize: 11.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
};

const presetBtn: React.CSSProperties = {
  padding: '10px 12px', borderRadius: 12,
  background: 'var(--pbs-paper)',
  border: '2px solid var(--pbs-line-2)',
  fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
  color: 'var(--pbs-ink)',
};

void ITEMS_BY_ID;
