// Roblox-style wardrobe: live-edit the student's avatar (face/hair/hat,
// shirt/pants/skin colors). Mirrors the cream pb-site theme used by the
// rest of the student app.
'use client';

import React, { useState } from 'react';
import { Block, Chunky, Icon, Pill } from '@/components/landing/pb-site/primitives';
import { RobloxAvatar, type AvatarFace, type AvatarHair, type AvatarHat, type AvatarOutfit } from './RobloxAvatar';

const FACES: { value: AvatarFace; label: string }[] = [
  { value: 'smile',   label: 'Smile' },
  { value: 'happy',   label: 'Happy' },
  { value: 'cool',    label: 'Cool' },
  { value: 'wink',    label: 'Wink' },
  { value: 'neutral', label: 'Neutral' },
];

const HAIRS: { value: AvatarHair; label: string }[] = [
  { value: 'none',  label: 'Bald' },
  { value: 'short', label: 'Short' },
  { value: 'spike', label: 'Spike' },
  { value: 'long',  label: 'Long' },
];

const HATS: { value: AvatarHat; label: string }[] = [
  { value: 'none',   label: 'None' },
  { value: 'cap',    label: 'Cap' },
  { value: 'beanie', label: 'Beanie' },
  { value: 'tophat', label: 'Top hat' },
];

const SHIRT_COLORS = ['#6fbf73', '#ffd84d', '#ff8a73', '#5fa8ff', '#c69bff', '#ff97c5', '#1d1a14', '#fdf6e6'];
const PANTS_COLORS = ['#3a3c4a', '#1d1a14', '#6b4f00', '#1b4a8a', '#7a2a18', '#0f5b2e', '#4d2a8a', '#8a1e5c'];
const SKIN_COLORS  = ['__cardboard__', '#f1d7b6', '#d8a87a', '#a06a3f', '#6f4626', '#3d2718'];
const HAIR_COLORS  = ['#3a2a1a', '#1d1a14', '#a86a2c', '#d4b081', '#ff8a73', '#5fa8ff', '#c69bff'];
const HAT_COLORS   = ['#c24949', '#1d1a14', '#ffd84d', '#5fa8ff', '#0f5b2e', '#c69bff'];

export const Wardrobe = () => {
  const [outfit, setOutfit] = useState<AvatarOutfit>({
    shirt: '#6fbf73',
    pants: '#3a3c4a',
    face: 'smile',
    hair: 'short',
    hairColor: '#3a2a1a',
    hat: 'none',
    hatColor: '#c24949',
  });

  // The avatar uses cardboard skin when `skin` is undefined. Sentinel value
  // `__cardboard__` lets us treat "cardboard" like any other swatch.
  const setSkin = (c: string) => setOutfit((o) => ({
    ...o,
    skin: c === '__cardboard__' ? undefined : c,
  }));
  const skinValue = outfit.skin ?? '__cardboard__';

  return (
    <div className="pbs-wrap" style={{ padding: '32px 28px 80px' }}>

      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <Pill tone="butter" icon="sparkle">Wardrobe</Pill>
          <h1 style={{
            margin: '12px 0 0',
            fontSize: 'clamp(34px, 4.4vw, 52px)',
            fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.02,
          }}>
            Dress your <span className="pbs-serif">block.</span>
          </h1>
        </div>
        <Chunky as="a" href="/student" tone="ghost" icon="chevron">Back</Chunky>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 24, alignItems: 'start' }}>

        {/* Live avatar preview */}
        <Block tone="ink" style={{ padding: 24, color: 'var(--pbs-cream)', position: 'sticky', top: 24 }}>
          <RobloxAvatar size="fill" outfit={outfit} />
          <div style={{ marginTop: 14, fontSize: 12, opacity: 0.7, textAlign: 'center' }}>
            Drag to spin · auto-rotates
          </div>
        </Block>

        {/* Picker columns */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Section title="Face">
            <ChipRow
              options={FACES.map((f) => ({ key: f.value, label: f.label }))}
              value={outfit.face ?? 'smile'}
              onChange={(v) => setOutfit((o) => ({ ...o, face: v as AvatarFace }))}
            />
          </Section>

          <Section title="Hair">
            <ChipRow
              options={HAIRS.map((h) => ({ key: h.value, label: h.label }))}
              value={outfit.hair ?? 'short'}
              onChange={(v) => setOutfit((o) => ({ ...o, hair: v as AvatarHair }))}
            />
            <div style={{ marginTop: 12 }}>
              <SubLabel>Hair color</SubLabel>
              <Swatches
                colors={HAIR_COLORS}
                value={outfit.hairColor ?? '#3a2a1a'}
                onChange={(c) => setOutfit((o) => ({ ...o, hairColor: c }))}
              />
            </div>
          </Section>

          <Section title="Hat">
            <ChipRow
              options={HATS.map((h) => ({ key: h.value, label: h.label }))}
              value={outfit.hat ?? 'none'}
              onChange={(v) => setOutfit((o) => ({ ...o, hat: v as AvatarHat }))}
            />
            <div style={{ marginTop: 12 }}>
              <SubLabel>Hat color</SubLabel>
              <Swatches
                colors={HAT_COLORS}
                value={outfit.hatColor ?? '#c24949'}
                onChange={(c) => setOutfit((o) => ({ ...o, hatColor: c }))}
              />
            </div>
          </Section>

          <Section title="Shirt">
            <Swatches
              colors={SHIRT_COLORS}
              value={outfit.shirt ?? '#6fbf73'}
              onChange={(c) => setOutfit((o) => ({ ...o, shirt: c }))}
            />
          </Section>

          <Section title="Pants">
            <Swatches
              colors={PANTS_COLORS}
              value={outfit.pants ?? '#3a3c4a'}
              onChange={(c) => setOutfit((o) => ({ ...o, pants: c }))}
            />
          </Section>

          <Section title="Skin">
            <Swatches
              colors={SKIN_COLORS}
              value={skinValue}
              onChange={setSkin}
              labelFor={(c) => (c === '__cardboard__' ? 'Cardboard' : undefined)}
            />
          </Section>
        </div>
      </div>
    </div>
  );
};

// ─────────────── Pieces ───────────────

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Block tone="paper" style={{ padding: 18 }}>
    <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 12 }}>
      {title}
    </div>
    {children}
  </Block>
);

const SubLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="pbs-mono" style={{
    fontSize: 10.5, color: 'var(--pbs-ink-muted)',
    textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6,
  }}>{children}</div>
);

const ChipRow = ({
  options, value, onChange,
}: {
  options: { key: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
    {options.map((o) => {
      const active = o.key === value;
      return (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          style={{
            padding: '7px 13px', borderRadius: 999,
            background: active ? 'var(--pbs-ink)' : 'var(--pbs-paper)',
            color: active ? 'var(--pbs-cream)' : 'var(--pbs-ink)',
            border: `1.5px solid ${active ? 'var(--pbs-ink)' : 'var(--pbs-line-2)'}`,
            fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >{o.label}</button>
      );
    })}
  </div>
);

const Swatches = ({
  colors, value, onChange, labelFor,
}: {
  colors: string[];
  value: string;
  onChange: (c: string) => void;
  labelFor?: (c: string) => string | undefined;
}) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
    {colors.map((c) => {
      const active = c === value;
      const label = labelFor?.(c);
      const isCardboard = c === '__cardboard__';
      return (
        <button
          key={c}
          onClick={() => onChange(c)}
          title={label || c}
          style={{
            width: 38, height: 38, borderRadius: 12,
            background: isCardboard
              ? 'repeating-linear-gradient(45deg, #d4b081 0 6px, #b88a5a 6px 12px)'
              : c,
            border: `2.5px solid ${active ? 'var(--pbs-ink)' : 'var(--pbs-line-2)'}`,
            boxShadow: active ? '0 3px 0 var(--pbs-ink)' : '0 2px 0 rgba(0,0,0,0.08)',
            cursor: 'pointer', padding: 0, position: 'relative',
          }}
        >
          {active && (
            <span style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', mixBlendMode: 'difference',
            }}>
              <Icon name="check" size={16} stroke={3}/>
            </span>
          )}
        </button>
      );
    })}
  </div>
);
