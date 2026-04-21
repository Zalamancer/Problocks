// Data table used in the homework view. Rows listed in `highlight` get a
// butter tint; everything else dims to emphasise which rows belong to the
// current part. Ported from the design's briefing.jsx.

import { Icon } from './Icon';
import type { FRQ } from './types';

type DataTableProps = {
  table: FRQ['table'];
  highlight?: number[];
  compact?: boolean;
};

export function DataTable({ table, highlight = [], compact = false }: DataTableProps) {
  const hi = new Set(highlight);
  const mono = 'var(--font-dm-mono), DM Mono, monospace';

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
        <Icon name="grid" size={11} />
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
          fontFamily: mono,
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
                  const v = r[c.key as keyof typeof r];
                  const isNum = typeof v === 'number' && c.key !== 'trial';
                  return (
                    <td
                      key={c.key}
                      style={{
                        padding: '6px 8px',
                        textAlign: 'right',
                        borderBottom: '1px solid var(--pb-line)',
                        color: i === 0 ? 'var(--pb-ink-muted)' : 'var(--pb-ink)',
                        fontWeight: on && i > 0 ? 700 : 500,
                        position: 'relative',
                      }}
                    >
                      {c.key === 'trial'
                        ? `#${v}`
                        : isNum
                        ? (v as number).toFixed(2)
                        : v}
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
