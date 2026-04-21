// Phone-like frame that contains the mobile homework view in the preview.
// Sized as a tablet/phablet. Ported from the design's phone.jsx.

import type { ReactNode } from 'react';

type PhoneFrameProps = {
  children: ReactNode;
  width?: number;
  height?: number;
  label?: string;
};

export function PhoneFrame({
  children,
  width = 440,
  height = 820,
  label,
}: PhoneFrameProps) {
  const mono = 'var(--font-dm-mono), DM Mono, ui-monospace, monospace';
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 14,
      }}
    >
      {label && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            borderRadius: 999,
            background: 'var(--pb-paper)',
            border: '1.5px solid var(--pb-line-2)',
            boxShadow: '0 2px 0 var(--pb-line-2)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--pb-ink-soft)',
          }}
        >
          {label}
        </div>
      )}
      <div
        style={{
          width,
          height,
          padding: 10,
          borderRadius: 46,
          background: 'var(--pb-ink)',
          boxShadow: '0 12px 30px rgba(29,26,20,0.22), inset 0 0 0 2px #2b2822',
          position: 'relative',
        }}
      >
        {/* status bar */}
        <div
          style={{
            position: 'absolute',
            top: 18,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 34px',
            color: 'var(--pb-paper)',
            fontSize: 11,
            fontWeight: 700,
            fontFamily: mono,
            zIndex: 2,
            pointerEvents: 'none',
          }}
        >
          <span>9:41</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span
              style={{
                display: 'inline-block',
                width: 14,
                height: 8,
                borderRadius: 2,
                background: 'var(--pb-paper)',
              }}
            />
            <span style={{ opacity: 0.8 }}>100%</span>
          </div>
        </div>
        {/* notch */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 110,
            height: 28,
            borderRadius: 20,
            background: '#000',
          }}
        />

        {/* screen */}
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: 38,
            overflow: 'hidden',
            background: 'var(--pb-cream, #fdf6e6)',
            position: 'relative',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
