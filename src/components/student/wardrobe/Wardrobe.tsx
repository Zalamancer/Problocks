// Full Problocks wardrobe page — Three.js avatar stage, 12-category picker,
// filters (search / theme / rarity / owned-only), economy, presets, randomize.
'use client';

import React, { useMemo, useState } from 'react';
import { Block, Chunky, Icon, Pill } from '@/components/landing/pb-site/primitives';
import { RobloxAvatar } from '../RobloxAvatar';
import { outfitToAvatar } from './avatar-map';
import {
  CATEGORY_ICONS, CATEGORY_LABELS, ITEMS_BY_CATEGORY, ITEMS_BY_ID,
  defaultOwned, isOwned,
} from './catalog';
import { PRESETS, defaultOutfit, randomizeOutfit } from './presets';
import {
  BODY_LABELS, EMOTE_LABELS, RARITY_COLORS, SKIN_COLORS, THEME_LABELS,
  type BodyShape, type Category, type Emote, type Item, type MeshCategory,
  type Outfit, type Rarity, type Theme,
} from './types';

const CATEGORY_ORDER: Category[] = [
  'hat', 'hair', 'face', 'shirt', 'pants', 'shoes',
  'backpack', 'accessory', 'pet',
  'skin', 'body', 'emote',
];

const STARTING_BLOCKS = 1240;

export const Wardrobe = () => {
  const [outfit, setOutfit] = useState<Outfit>(defaultOutfit());
  const [owned, setOwned] = useState<Set<string>>(defaultOwned());
  const [blocks, setBlocks] = useState<number>(STARTING_BLOCKS);
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
    <div className="pbs-wrap" style={{ padding: '28px 28px 80px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, marginBottom: 22 }}>
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
          <Chunky as="a" href="/student" tone="ghost" icon="chevron">Back</Chunky>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.35fr', gap: 22, alignItems: 'start' }}>

        {/* ─── Left: avatar stage + controls + presets ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 16 }}>
          <Block tone="ink" style={{ padding: 16, color: 'var(--pbs-cream)' }}>
            <div style={{ aspectRatio: '1 / 1.12', borderRadius: 14, overflow: 'hidden', background: 'radial-gradient(circle at 50% 35%, #2a2720 0%, #1d1a14 70%)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, gap: 8 }}>
              <ToggleRow label="Auto-rotate" on={autoRotate} onChange={setAutoRotate}/>
              <button onClick={reset} style={ghostBtn}>
                <Icon name="minus" size={13}/> Clear outfit
              </button>
            </div>
          </Block>

          <Block tone="paper" style={{ padding: 14 }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Category tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: 6, background: 'var(--pbs-paper)', border: '1.5px solid var(--pbs-line-2)', borderRadius: 14 }}>
            {CATEGORY_ORDER.map((c) => (
              <CategoryTab key={c} category={c} active={c === category} onClick={() => setCategory(c)}/>
            ))}
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
              <Select
                value={theme}
                onChange={(v) => setTheme(v as Theme | 'all')}
                options={[['all', 'All themes'], ...Object.entries(THEME_LABELS)]}
              />
              <Select
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

          {/* Grid / panel body */}
          {category === 'skin' && (
            <SkinPanel outfit={outfit} onChange={(skin) => setOutfit((o) => ({ ...o, skin }))}/>
          )}
          {category === 'body' && (
            <BodyPanel shape={outfit.bodyShape} onChange={(s) => setOutfit((o) => ({ ...o, bodyShape: s }))}/>
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
      }}>
        {CATEGORY_ICONS[item.category]}
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
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '7px 13px', borderRadius: 999,
        background: active ? 'var(--pbs-ink)' : 'transparent',
        color: active ? 'var(--pbs-cream)' : 'var(--pbs-ink)',
        border: `1.5px solid ${active ? 'var(--pbs-ink)' : 'transparent'}`,
        fontSize: 12.5, fontWeight: 700,
        cursor: 'pointer', fontFamily: 'inherit',
      }}
    >
      <span style={{ fontSize: 14 }}>{icon}</span>{label}
    </button>
  );
};

const Select = ({
  value, onChange, options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    style={{
      padding: '9px 12px', borderRadius: 12,
      border: '1.5px solid var(--pbs-line-2)',
      background: 'var(--pbs-paper)', color: 'var(--pbs-ink)',
      fontSize: 13, fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer',
    }}
  >
    {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
  </select>
);

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

const BodyPanel = ({ shape, onChange }: { shape: BodyShape; onChange: (s: BodyShape) => void }) => (
  <Block tone="paper" style={{ padding: 18 }}>
    <SubLabel>Body shape</SubLabel>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
      {(Object.keys(BODY_LABELS) as BodyShape[]).map((s) => {
        const active = s === shape;
        return (
          <button key={s} onClick={() => onChange(s)} style={{
            padding: 14, borderRadius: 14,
            background: active ? 'var(--pbs-ink)' : 'var(--pbs-paper)',
            color: active ? 'var(--pbs-cream)' : 'var(--pbs-ink)',
            border: `2px solid ${active ? 'var(--pbs-ink)' : 'var(--pbs-line-2)'}`,
            fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          }}>{BODY_LABELS[s]}</button>
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
