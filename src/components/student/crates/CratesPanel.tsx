// Grid of available crates + inventory. Clicking a crate triggers the
// unboxing overlay; claimed items are dropped into localStorage under
// `pb-unlocked` so the wardrobe picks them up.
'use client';

import React, { useEffect, useState } from 'react';
import { Icon } from '@/components/landing/pb-site/primitives';
import { RARITY_COLORS, type Item, type Rarity } from '../wardrobe/types';
import { CRATE_ORDER, CRATE_TIERS, type CrateTier } from './crate-types';
import { Crate3D } from './Crate3D';
import { CrateUnboxing } from './CrateUnboxing';

const STORAGE_KEY = 'pb-unlocked';
const INVENTORY_KEY = 'pb-crates';
const BLOCKS_KEY = 'pb-blocks';
const STARTING_BLOCKS = 2480;
const STARTING_INVENTORY: Record<CrateTier, number> = {
  paper: 3, cardboard: 2, wooden: 1, metal: 0, crystal: 0,
};

interface Reveal {
  tier: CrateTier;
  nonce: number;   // new nonce each click so CrateUnboxing remounts
}

export const CratesPanel = () => {
  const [inventory, setInventory] = useState<Record<CrateTier, number>>(STARTING_INVENTORY);
  const [blocks, setBlocks] = useState<number>(STARTING_BLOCKS);
  const [reveal, setReveal] = useState<Reveal | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Hydrate from localStorage on mount (client-only).
  useEffect(() => {
    try {
      const inv = window.localStorage.getItem(INVENTORY_KEY);
      if (inv) setInventory(JSON.parse(inv));
      const b = window.localStorage.getItem(BLOCKS_KEY);
      if (b) setBlocks(Number(b));
    } catch { /* ignore */ }
  }, []);

  const persistInventory = (next: Record<CrateTier, number>) => {
    setInventory(next);
    try { window.localStorage.setItem(INVENTORY_KEY, JSON.stringify(next)); } catch {}
  };
  const persistBlocks = (n: number) => {
    setBlocks(n);
    try { window.localStorage.setItem(BLOCKS_KEY, String(n)); } catch {}
  };

  const openCrate = (tier: CrateTier) => {
    if ((inventory[tier] || 0) <= 0) {
      showToast(`No ${CRATE_TIERS[tier].label}s in inventory`);
      return;
    }
    persistInventory({ ...inventory, [tier]: inventory[tier] - 1 });
    setReveal({ tier, nonce: Date.now() });
  };

  const buyCrate = (tier: CrateTier) => {
    const cost = CRATE_TIERS[tier].cost;
    if (blocks < cost) {
      showToast(`Need ${cost - blocks} more blocks`);
      return;
    }
    persistBlocks(blocks - cost);
    persistInventory({ ...inventory, [tier]: (inventory[tier] || 0) + 1 });
    showToast(`Bought 1 ${CRATE_TIERS[tier].label}`);
  };

  const claim = (item: Item, rarity: Rarity) => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const set: string[] = raw ? JSON.parse(raw) : [];
      if (!set.includes(item.id)) set.push(item.id);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(set));
    } catch { /* ignore */ }
    showToast(`Unlocked: ${item.label} (${RARITY_COLORS[rarity].label})`);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast((t) => (t === msg ? null : t)), 2200);
  };

  return (
    <div style={{ minHeight: '100vh', padding: '32px 28px 80px' }}>
      <div className="pbs-wrap" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div className="pbs-mono" style={{
              fontSize: 11, color: 'var(--pbs-ink-muted)',
              textTransform: 'uppercase', letterSpacing: '0.12em',
            }}>REWARDS</div>
            <h1 style={{ margin: '6px 0 0', fontSize: 44, fontWeight: 700, letterSpacing: '-0.025em' }}>
              Unbox <span className="pbs-serif">crates.</span>
            </h1>
            <p style={{ margin: '8px 0 0', color: 'var(--pbs-ink-soft)', fontSize: 14, maxWidth: 520 }}>
              Earn blocks by playing, then crack open crates for skins, clothes, and accessories.
            </p>
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 16px 8px 12px', borderRadius: 999,
            background: 'var(--pbs-mint)',
            color: 'var(--pbs-mint-ink)',
            border: '1.5px solid var(--pbs-mint-ink)',
            fontSize: 15, fontWeight: 700,
          }}>
            <Icon name="coin" size={16} stroke={2.4}/>
            {blocks.toLocaleString()}
            <span style={{ fontWeight: 500, opacity: 0.8, fontSize: 12 }}>blocks</span>
          </div>
        </div>

        {/* crate grid */}
        <div style={{
          display: 'grid', gap: 20,
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        }}>
          {CRATE_ORDER.map((tier) => (
            <CrateCard
              key={tier}
              tier={tier}
              count={inventory[tier] || 0}
              canAfford={blocks >= CRATE_TIERS[tier].cost}
              onOpen={() => openCrate(tier)}
              onBuy={() => buyCrate(tier)}
            />
          ))}
        </div>
      </div>

      {reveal && (
        <CrateUnboxing
          key={reveal.nonce}
          tier={reveal.tier}
          onClose={() => setReveal(null)}
          onClaim={claim}
        />
      )}

      {toast && (
        <div style={{
          position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          padding: '10px 18px', borderRadius: 999,
          background: 'var(--pbs-ink)', color: 'var(--pbs-cream)',
          fontSize: 13, fontWeight: 700,
          boxShadow: '0 8px 28px -8px rgba(0,0,0,0.4)',
          zIndex: 10000,
        }}>
          {toast}
        </div>
      )}
    </div>
  );
};

/* ---------- card ---------- */

interface CrateCardProps {
  tier: CrateTier;
  count: number;
  canAfford: boolean;
  onOpen: () => void;
  onBuy: () => void;
}

const CrateCard = ({ tier, count, canAfford, onOpen, onBuy }: CrateCardProps) => {
  const style = CRATE_TIERS[tier];
  const loot = style.loot;
  const topRarity = (Object.entries(loot) as [Rarity, number][])
    .sort((a, b) => b[1] - a[1])[0][0];
  const topColor = RARITY_COLORS[topRarity];

  return (
    <div style={{
      position: 'relative',
      padding: '20px 18px 18px',
      borderRadius: 'var(--pbs-radius, 18px)',
      background: 'var(--pbs-paper)',
      border: '1.5px solid var(--pbs-ink)',
      boxShadow: '0 4px 0 var(--pbs-ink)',
      display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 12,
    }}>
      {/* aura behind crate */}
      <div style={{
        position: 'relative',
        height: 190,
        borderRadius: 14,
        background: `radial-gradient(circle at 50% 55%, ${style.glow}55 0%, transparent 70%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        <div style={{ width: '100%', height: '100%' }}>
          <Crate3D tier={tier} seed={CRATE_ORDER.indexOf(tier) * 0.9}/>
        </div>
        {count > 0 && (
          <div style={{
            position: 'absolute', top: 10, right: 10,
            minWidth: 28, height: 28, padding: '0 8px',
            borderRadius: 999,
            background: 'var(--pbs-ink)', color: 'var(--pbs-cream)',
            fontSize: 13, fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            ×{count}
          </div>
        )}
      </div>

      <div>
        <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.015em' }}>{style.label}</div>
        <div style={{ fontSize: 12, color: 'var(--pbs-ink-muted)', marginTop: 2 }}>
          {style.tagline}
        </div>
      </div>

      {/* loot probability bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {(['legendary', 'epic', 'rare', 'uncommon', 'common'] as Rarity[])
          .filter((r) => loot[r] > 0)
          .map((r) => (
            <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
              <span style={{
                width: 72, color: RARITY_COLORS[r].ink,
                fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                {RARITY_COLORS[r].label}
              </span>
              <div style={{
                flex: 1, height: 6, borderRadius: 999,
                background: 'var(--pbs-line)', overflow: 'hidden',
              }}>
                <div style={{
                  width: `${loot[r] * 100}%`, height: '100%',
                  background: RARITY_COLORS[r].ink,
                }}/>
              </div>
              <span style={{ width: 34, textAlign: 'right', color: 'var(--pbs-ink-muted)' }}>
                {Math.round(loot[r] * 100)}%
              </span>
            </div>
          ))}
      </div>

      {/* best-drop hint */}
      <div style={{
        fontSize: 11, color: 'var(--pbs-ink-muted)',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        Best odds:{' '}
        <span style={{
          padding: '2px 8px', borderRadius: 999,
          background: topColor.bg, color: topColor.ink,
          border: `1px solid ${topColor.ink}`,
          fontWeight: 700, fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          {topColor.label}
        </span>
      </div>

      {/* actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={onOpen}
          disabled={count <= 0}
          style={{
            flex: 1,
            padding: '10px 14px', borderRadius: 12,
            background: count > 0 ? 'var(--pbs-ink)' : 'var(--pbs-line)',
            color: count > 0 ? 'var(--pbs-cream)' : 'var(--pbs-ink-muted)',
            border: `1.5px solid ${count > 0 ? 'var(--pbs-ink)' : 'var(--pbs-line-2)'}`,
            boxShadow: count > 0 ? `0 3px 0 var(--pbs-ink), 0 0 20px ${style.glow}66` : 'none',
            fontSize: 13, fontWeight: 800, letterSpacing: '-0.005em',
            cursor: count > 0 ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
          }}
        >
          {count > 0 ? 'Open' : 'No crates'}
        </button>
        <button
          onClick={onBuy}
          disabled={!canAfford}
          style={{
            padding: '10px 14px', borderRadius: 12,
            background: 'transparent',
            color: canAfford ? 'var(--pbs-ink)' : 'var(--pbs-ink-muted)',
            border: `1.5px solid ${canAfford ? 'var(--pbs-ink)' : 'var(--pbs-line-2)'}`,
            fontSize: 13, fontWeight: 700,
            cursor: canAfford ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}
          title={canAfford ? `Buy for ${style.cost} blocks` : `Need ${style.cost - 0} blocks`}
        >
          <Icon name="coin" size={12} stroke={2.4}/>
          {style.cost}
        </button>
      </div>
    </div>
  );
};
