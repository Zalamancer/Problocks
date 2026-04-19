'use client';

import { Zap } from 'lucide-react';
import type { Frq, FrqPart } from '@/lib/quiz/frq-content';

// "Real AP" briefing card — shows the verbatim AP part prompt with a
// corner chip calling out which real exam it's modeled on.

export function RealAPBriefing({ part, source }: { part: FrqPart; source: Frq['source'] }) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 14,
        background: 'var(--pb-paper)',
        border: '1.5px solid var(--pb-ink)',
        boxShadow: '0 3px 0 var(--pb-ink)',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: -10,
          left: 14,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          padding: '3px 9px',
          borderRadius: 999,
          background: 'var(--pb-coral)',
          color: 'var(--pb-coral-ink)',
          border: '1.5px solid var(--pb-coral-ink)',
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--pb-coral-ink)',
          }}
        />
        Real AP
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginTop: 4,
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--pb-ink)' }}>{part.label}</span>
        <span style={{ fontSize: 10.5, color: 'var(--pb-ink-muted)' }}>·</span>
        <span style={{ fontSize: 10.5, color: 'var(--pb-ink-muted)', fontWeight: 600 }}>
          {part.points} pt{part.points !== 1 ? 's' : ''}
        </span>
        <span style={{ flex: 1 }} />
        <span
          style={{
            fontSize: 10,
            color: 'var(--pb-ink-muted)',
            fontFamily: 'DM Mono, ui-monospace, monospace',
          }}
        >
          {source.exam} · {source.year}
        </span>
      </div>
      <div
        style={{
          marginTop: 6,
          fontSize: 14.5,
          lineHeight: 1.45,
          color: 'var(--pb-ink)',
          fontStyle: 'italic',
          fontFamily: 'Instrument Serif, Georgia, serif',
        }}
      >
        &ldquo;{part.apText}&rdquo;
      </div>
    </div>
  );
}

export function ExperimentLine({ text }: { text: string }) {
  return (
    <div
      style={{
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 11.5,
        color: 'var(--pb-ink-soft)',
        background:
          'repeating-linear-gradient(90deg, var(--pb-cream-2) 0 8px, transparent 8px 12px)',
        borderRadius: 10,
        border: '1.5px dashed var(--pb-line-2)',
      }}
    >
      <Zap size={12} strokeWidth={2.2} style={{ color: 'var(--pb-butter-ink)' }} />
      <span>
        <b style={{ color: 'var(--pb-ink)' }}>Setup:</b> {text}
      </span>
    </div>
  );
}
