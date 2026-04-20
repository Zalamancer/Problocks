// Full-screen unboxing overlay.
// Phases:
//   idle    — box bobbing + aura pulse, user hits "Open"
//   shake   — box trembles (intensity scales with tier), 1.4s
//   crack   — lid flies off + body pop, 0.45s
//   burst   — bright flash + particle explosion, 0.9s (lid hidden)
//   reveal  — item floats up with spinning rays, rarity banner, sparkles
// Calls onClaim(item) on close so parent can add it to inventory.
'use client';

import './animations.css';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ALL_ITEMS } from '../wardrobe/catalog';
import { RARITY_COLORS, type Item, type Rarity } from '../wardrobe/types';
import { CRATE_TIERS, rollRarity, type CrateTier } from './crate-types';
import { CrateVisual } from './CrateVisual';

type Phase = 'idle' | 'shake' | 'crack' | 'burst' | 'reveal';

interface CrateUnboxingProps {
  tier: CrateTier;
  onClose: () => void;
  onClaim: (item: Item, rarity: Rarity) => void;
}

/** Pick a random item matching the rolled rarity. Falls back across rarities
 *  if the rolled one has no catalog items (shouldn't happen in practice). */
function pickItem(rarity: Rarity): Item {
  const pool = ALL_ITEMS.filter((i) => i.rarity === rarity);
  if (pool.length) return pool[Math.floor(Math.random() * pool.length)];
  // fallback: any item
  return ALL_ITEMS[Math.floor(Math.random() * ALL_ITEMS.length)];
}

export const CrateUnboxing = ({ tier, onClose, onClaim }: CrateUnboxingProps) => {
  const style = CRATE_TIERS[tier];
  const [phase, setPhase] = useState<Phase>('idle');
  const timers = useRef<number[]>([]);

  // Roll the reward exactly once when the modal mounts so the animation and
  // banner stay consistent even if the user clicks fast.
  const { item, rarity } = useMemo(() => {
    const r = rollRarity(tier);
    return { item: pickItem(r), rarity: r };
  }, [tier]);

  useEffect(() => () => {
    timers.current.forEach((t) => window.clearTimeout(t));
  }, []);

  const start = () => {
    if (phase !== 'idle') return;
    setPhase('shake');
    timers.current.push(window.setTimeout(() => setPhase('crack'), 1400));
    timers.current.push(window.setTimeout(() => setPhase('burst'), 1400 + 450));
    timers.current.push(window.setTimeout(() => setPhase('reveal'), 1400 + 450 + 500));
  };

  const handleClaim = () => {
    onClaim(item, rarity);
    onClose();
  };

  const rarityStyle = RARITY_COLORS[rarity];

  return (
    <div
      className="crate-overlay-in"
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.95) 80%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 24, padding: 24,
        animationFillMode: 'forwards',
      }}
    >
      {/* close */}
      <button onClick={onClose} style={closeBtn} aria-label="Close">×</button>

      {/* crate stage */}
      <div style={{ position: 'relative', width: 380, height: 380, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

        {/* aura (idle + shake) */}
        {(phase === 'idle' || phase === 'shake') && (
          <div
            className="crate-aura"
            style={{
              position: 'absolute', width: 280, height: 280, borderRadius: '50%',
              background: `radial-gradient(circle, ${style.glow}aa 0%, transparent 70%)`,
              filter: 'blur(20px)',
            }}
          />
        )}

        {/* spinning rays (burst + reveal) */}
        {(phase === 'burst' || phase === 'reveal') && (
          <div
            className="crate-rays"
            style={{
              position: 'absolute', width: 700, height: 700,
              background: `conic-gradient(from 0deg, transparent 0deg, ${style.glow}88 12deg, transparent 24deg, transparent 60deg, ${style.glow2 || style.glow}88 72deg, transparent 84deg, transparent 120deg, ${style.glow}88 132deg, transparent 144deg, transparent 180deg, ${style.glow2 || style.glow}88 192deg, transparent 204deg, transparent 240deg, ${style.glow}88 252deg, transparent 264deg, transparent 300deg, ${style.glow2 || style.glow}88 312deg, transparent 324deg)`,
              pointerEvents: 'none',
              opacity: 0.7,
            }}
          />
        )}

        {/* flash on burst */}
        {phase === 'burst' && (
          <div
            className="crate-flash"
            style={{
              position: 'absolute', width: 260, height: 260, borderRadius: '50%',
              background: `radial-gradient(circle, #fff 0%, ${style.glow} 40%, transparent 80%)`,
              filter: 'blur(8px)',
            }}
          />
        )}

        {/* particle burst */}
        {phase === 'burst' && <Particles color={style.glow} color2={style.glow2}/>}

        {/* crate itself (hidden once item revealed) */}
        {phase !== 'reveal' && (
          <div
            className={
              phase === 'idle' ? 'crate-bob'
              : phase === 'shake' ? 'crate-shake'
              : ''
            }
            style={{ position: 'relative', transformOrigin: 'center bottom' }}
          >
            <CrateVisual
              tier={tier}
              size={260}
              lidClassName={phase === 'crack' ? 'crate-lid' : phase === 'burst' ? 'crate-lid' : ''}
              bodyClassName={phase === 'crack' || phase === 'burst' ? 'crate-body-pop' : ''}
              lidHidden={phase === 'burst'}
            />
          </div>
        )}

        {/* revealed item */}
        {phase === 'reveal' && (
          <div
            className="crate-item-in"
            style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <div
              className="crate-item-idle"
              style={{
                width: 200, height: 200, borderRadius: 24,
                background: `linear-gradient(145deg, ${rarityStyle.bg}, #fff)`,
                border: `3px solid ${rarityStyle.ink}`,
                boxShadow: `0 0 60px ${style.glow}aa, 0 10px 0 ${rarityStyle.ink}, 0 20px 40px -10px ${rarityStyle.ink}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 96,
              }}
            >
              {categoryEmoji(item.category)}
            </div>
            <Sparkles color={style.glow}/>
          </div>
        )}
      </div>

      {/* banner */}
      {phase === 'reveal' && (
        <div className="crate-banner" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              padding: '6px 18px', borderRadius: 999,
              background: rarityStyle.bg, color: rarityStyle.ink,
              border: `2px solid ${rarityStyle.ink}`,
              fontWeight: 800, fontSize: 13, letterSpacing: '0.08em',
              textTransform: 'uppercase',
              boxShadow: `0 3px 0 ${rarityStyle.ink}`,
            }}
          >
            {rarityStyle.label}
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#fdf6e6', letterSpacing: '-0.02em', textShadow: '0 2px 20px rgba(0,0,0,0.6)' }}>
            {item.label}
          </div>
          <div style={{ fontSize: 13, color: '#c9a173', textTransform: 'capitalize' }}>
            {item.category} · {item.theme}
          </div>
        </div>
      )}

      {/* controls */}
      <div style={{ display: 'flex', gap: 12 }}>
        {phase === 'idle' && (
          <button onClick={start} style={primaryBtn(style.glow)}>
            Open {style.label}
          </button>
        )}
        {phase === 'reveal' && (
          <button onClick={handleClaim} style={primaryBtn(style.glow)}>
            Claim reward
          </button>
        )}
        {phase !== 'idle' && phase !== 'reveal' && (
          <div style={{ color: '#fdf6e6', opacity: 0.6, fontSize: 13, fontStyle: 'italic' }}>
            Opening…
          </div>
        )}
      </div>
    </div>
  );
};

/* ---------- small helpers ---------- */

function Particles({ color, color2 }: { color: string; color2?: string }) {
  // 24 particles fired in a circle with random distance
  const particles = useMemo(() => (
    Array.from({ length: 24 }).map((_, i) => {
      const angle = (i / 24) * Math.PI * 2 + Math.random() * 0.3;
      const dist = 180 + Math.random() * 120;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;
      const size = 6 + Math.random() * 10;
      const delay = Math.random() * 0.15;
      const c = Math.random() > 0.5 && color2 ? color2 : color;
      return { dx, dy, size, delay, c, key: i };
    })
  ), [color, color2]);

  return (
    <>
      {particles.map((p) => (
        <div
          key={p.key}
          className="crate-particle"
          style={{
            position: 'absolute', left: '50%', top: '50%',
            width: p.size, height: p.size, borderRadius: '50%',
            background: p.c,
            boxShadow: `0 0 12px ${p.c}`,
            transform: 'translate(-50%, -50%)',
            animationDelay: `${p.delay}s`,
            ['--crate-particle-dest' as string]: `translate(calc(-50% + ${p.dx}px), calc(-50% + ${p.dy}px))`,
          } as React.CSSProperties}
        />
      ))}
    </>
  );
}

function Sparkles({ color }: { color: string }) {
  const positions = useMemo(() => (
    Array.from({ length: 10 }).map((_, i) => ({
      key: i,
      x: -120 + Math.random() * 240,
      y: -120 + Math.random() * 240,
      size: 8 + Math.random() * 10,
      delay: Math.random() * 1.2,
    }))
  ), []);

  return (
    <>
      {positions.map((p) => (
        <div
          key={p.key}
          className="crate-sparkle"
          style={{
            position: 'absolute', left: '50%', top: '50%',
            width: p.size, height: p.size,
            transform: `translate(${p.x}px, ${p.y}px)`,
            animationDelay: `${p.delay}s`,
            pointerEvents: 'none',
          }}
        >
          <svg viewBox="0 0 20 20" width={p.size} height={p.size}>
            <polygon
              points="10,0 12,8 20,10 12,12 10,20 8,12 0,10 8,8"
              fill={color}
              style={{ filter: `drop-shadow(0 0 6px ${color})` }}
            />
          </svg>
        </div>
      ))}
    </>
  );
}

function categoryEmoji(cat: string): string {
  const map: Record<string, string> = {
    hat: '🎩', hair: '💇', face: '😊',
    shirt: '👕', pants: '👖', shoes: '👟',
    backpack: '🎒', accessory: '👓', pet: '🐾',
  };
  return map[cat] || '✨';
}

const closeBtn: React.CSSProperties = {
  position: 'absolute', top: 20, right: 20,
  width: 44, height: 44, borderRadius: '50%',
  background: 'rgba(255,255,255,0.1)', color: '#fdf6e6',
  border: '1.5px solid rgba(255,255,255,0.2)',
  fontSize: 28, fontWeight: 300,
  cursor: 'pointer', fontFamily: 'inherit',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  backdropFilter: 'blur(8px)',
};

const primaryBtn = (glow: string): React.CSSProperties => ({
  padding: '14px 28px', borderRadius: 14,
  background: 'var(--pbs-butter)', color: 'var(--pbs-butter-ink)',
  border: '1.5px solid var(--pbs-butter-ink)',
  boxShadow: `0 4px 0 var(--pbs-butter-ink), 0 0 40px ${glow}88`,
  fontSize: 16, fontWeight: 800, letterSpacing: '-0.01em',
  cursor: 'pointer', fontFamily: 'inherit',
});
