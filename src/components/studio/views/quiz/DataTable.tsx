'use client';

import { Grid } from 'lucide-react';
import type { Frq } from '@/lib/quiz/frq-content';

// AP-style data table. Highlighted rows are emphasized with a butter
// tint; non-highlighted rows are dimmed so the student's eye is pulled
// to what the current micro-question is actually about.

export function DataTable({
  table,
  highlight = [],
  compact = false,
}: {
  table: Frq['table'];
  highlight?: number[];
  compact?: boolean;
}) {
  const hi = new Set(highlight);
  return (
    <div
      style={{
        borderRadius: 12,
        overflow: 'hidden',
        border: '1.5px solid var(--pb-line-2)',
        background: 'var(--pb-paper)',
        boxShadow: '0 2px 0 var(--pb-line-2)',
      }}
    >
      <div
        style={{
          padding: '7px 12px',
          background: 'var(--pb-ink)',
          color: 'var(--pb-paper)',
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <Grid size={11} strokeWidth={2.2} />
        Data table
        {highlight.length > 0 && (
          <span style={{ marginLeft: 'auto', fontSize: 9.5, fontWeight: 700, opacity: 0.7 }}>
            {highlight.length} row{highlight.length !== 1 ? 's' : ''} in use
          </span>
        )}
      </div>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: compact ? 11 : 11.5,
          fontFamily: 'DM Mono, ui-monospace, monospace',
        }}
      >
        <thead>
          <tr style={{ background: 'var(--pb-cream-2)' }}>
            {table.columns.map((c) => (
              <th
                key={c.key}
                style={{
                  padding: '6px 8px',
                  textAlign: 'right',
                  fontWeight: 700,
                  color: 'var(--pb-ink-soft)',
                  borderBottom: '1px solid var(--pb-line-2)',
                  fontSize: 10.5,
                  letterSpacing: '0.03em',
                }}
              >
                {c.label}
                {c.unit && <span style={{ color: 'var(--pb-ink-muted)' }}> ({c.unit})</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((r) => {
            const on = hi.size === 0 || hi.has(r.trial);
            return (
              <tr
                key={r.trial}
                style={{
                  background: on ? 'rgba(255,216,77,0.22)' : 'transparent',
                  opacity: hi.size === 0 || on ? 1 : 0.38,
                  transition: 'background 0.3s, opacity 0.3s',
                }}
              >
                {table.columns.map((c, i) => {
                  const v = r[c.key];
                  const isNum = typeof v === 'number' && c.key !== 'trial';
                  return (
                    <td
                      key={c.key}
                      style={{
                        padding: '6px 8px',
                        textAlign: 'right',
                        borderBottom: '1px solid var(--pb-line-2)',
                        color: i === 0 ? 'var(--pb-ink-muted)' : 'var(--pb-ink)',
                        fontWeight: on && i > 0 ? 700 : 500,
                        position: 'relative',
                      }}
                    >
                      {c.key === 'trial'
                        ? `#${v}`
                        : isNum
                        ? (v as number).toFixed(2)
                        : (v as number)}
                      {on && i === 0 && hi.size < table.rows.length && (
                        <span
                          style={{
                            position: 'absolute',
                            left: 2,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: 3,
                            height: 14,
                            background: 'var(--pb-butter-ink)',
                            borderRadius: 2,
                          }}
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
