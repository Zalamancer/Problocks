// Full AP Probe preview page — cream backdrop with soft radial gradients,
// ProBlocks header pill (Phone/Desktop + Drill/Homework toggles + Reset),
// ChromeWindow wrapping the desktop homework or PhoneFrame with the mobile
// homework, and a footnote below. Ported from the design's app.jsx.

'use client';

import { useState } from 'react';
import { ChromeWindow } from './ChromeWindow';
import { HomeworkDesktop } from './HomeworkDesktop';
import { HomeworkMobile } from './HomeworkMobile';
import { PhoneFrame } from './PhoneFrame';
import type { FRQ } from './types';

type Surface = 'phone' | 'desktop';
type Mode = 'drill' | 'homework';

type APProbePageProps = {
  frq: FRQ;
  initialSurface?: Surface;
};

export function APProbePage({ frq, initialSurface = 'desktop' }: APProbePageProps) {
  const [surface, setSurface] = useState<Surface>(initialSurface);
  // We only ship homework — drill from the bundle is out of scope. We keep
  // the button visible for visual parity with the design but disable it.
  const mode: Mode = 'homework';

  const bgStyle = {
    position: 'fixed' as const,
    inset: 0,
    zIndex: -1,
    pointerEvents: 'none' as const,
    background:
      'radial-gradient(800px 500px at 85% -10%, #ffeabd 0%, transparent 60%),' +
      'radial-gradient(700px 400px at -10% 110%, #d7e9ff 0%, transparent 55%),' +
      '#fdf6e6',
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div style={bgStyle} />

      <div
        style={{
          minHeight: '100vh',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '28px 16px',
          color: 'var(--pb-ink)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            width: '100%',
          }}
        >
          <Header
            surface={surface}
            mode={mode}
            onSurface={setSurface}
            onReset={() => {
              /* reset is a no-op on the homework page — grading resets with a refresh. */
              if (typeof window !== 'undefined') window.location.reload();
            }}
          />

          {surface === 'desktop' ? (
            <DesktopSurface frq={frq} />
          ) : (
            <PhoneFrame label="Homework">
              <HomeworkMobile frq={frq} />
            </PhoneFrame>
          )}

          <Footnote />
        </div>
      </div>
    </div>
  );
}

function DesktopSurface({ frq }: { frq: FRQ }) {
  return (
    <div style={{ width: 'min(1200px, 100%)', margin: '0 auto' }}>
      <ChromeWindow
        tabs={[{ title: 'AP Physics · Homework' }, { title: 'Classroom dashboard' }]}
        activeIndex={0}
        url="problocks.app/homework/physics-1/cart-on-incline"
        width="100%"
        height={720}
      >
        <HomeworkDesktop frq={frq} />
      </ChromeWindow>
    </div>
  );
}

function Header({
  surface,
  mode,
  onSurface,
  onReset,
}: {
  surface: Surface;
  mode: Mode;
  onSurface: (s: Surface) => void;
  onReset: () => void;
}) {
  const serif = 'var(--font-instrument-serif), Instrument Serif, Georgia, serif';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '10px 16px',
        borderRadius: 999,
        background: 'var(--pb-paper)',
        border: '1.5px solid var(--pb-line-2)',
        boxShadow: '0 2px 0 var(--pb-line-2)',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Logo size={22} />
        <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '-0.01em' }}>
          ProBlocks
        </div>
        <span
          style={{
            fontSize: 10,
            color: 'var(--pb-ink-muted)',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          · Probe
        </span>
      </div>
      <div style={{ width: 1, height: 18, background: 'var(--pb-line-2)' }} />
      <div style={{ fontFamily: serif, fontSize: 14, fontStyle: 'italic' }}>
        AP, but tappable.
      </div>
      <div style={{ flex: 1, minWidth: 16 }} />

      <Segment
        value={surface}
        options={[
          { id: 'phone', label: 'Phone' },
          { id: 'desktop', label: 'Desktop' },
        ]}
        onChange={(v) => onSurface(v as Surface)}
      />

      <Segment
        value={mode}
        disabled
        options={[
          { id: 'drill', label: 'Drill' },
          { id: 'homework', label: 'Homework' },
        ]}
        onChange={() => {
          /* drill not implemented */
        }}
      />

      <button
        type="button"
        onClick={onReset}
        style={{
          padding: '6px 10px',
          borderRadius: 999,
          background: 'var(--pb-butter)',
          border: '1.5px solid var(--pb-butter-ink)',
          color: 'var(--pb-butter-ink)',
          boxShadow: '0 2px 0 var(--pb-butter-ink)',
          fontSize: 11,
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          cursor: 'pointer',
        }}
      >
        ↻ Reset
      </button>
    </div>
  );
}

function Segment({
  value,
  options,
  onChange,
  disabled = false,
}: {
  value: string;
  options: { id: string; label: string }[];
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 4,
        padding: 3,
        borderRadius: 999,
        background: 'var(--pb-cream-2)',
        border: '1.5px solid var(--pb-line-2)',
      }}
    >
      {options.map((o) => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => !disabled && onChange(o.id)}
            disabled={disabled}
            style={{
              padding: '4px 12px',
              borderRadius: 999,
              background: active ? 'var(--pb-ink)' : 'transparent',
              color: active ? 'var(--pb-paper)' : 'var(--pb-ink-soft)',
              border: 'none',
              fontSize: 11,
              fontWeight: 700,
              opacity: disabled ? 0.4 : 1,
              cursor: disabled ? 'default' : 'pointer',
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function Logo({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x={2.5} y={2.5} width={19} height={19} rx={5} fill="#1d1a14" />
      <rect x={5.5} y={5.5} width={6} height={6} rx={1.5} fill="#ffd84d" />
      <rect x={12.5} y={5.5} width={6} height={6} rx={1.5} fill="#ffc8e0" />
      <rect x={5.5} y={12.5} width={6} height={6} rx={1.5} fill="#b6f0c6" />
      <rect x={12.5} y={12.5} width={6} height={6} rx={1.5} fill="#b9d9ff" />
    </svg>
  );
}

function Footnote() {
  return (
    <div
      style={{
        fontSize: 10.5,
        color: 'var(--pb-ink-muted)',
        letterSpacing: '0.04em',
        textAlign: 'center',
        maxWidth: 480,
        lineHeight: 1.5,
      }}
    >
      Game surface built in a ProBlocks graph · Question content adapted from a real AP
      Physics 1 FRQ (original wording, physics-accurate) · Swap FRQs from the teacher
      dashboard
    </div>
  );
}
