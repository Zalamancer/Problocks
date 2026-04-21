// Shared form primitives for the classroom setup flow.
// Ported verbatim from Claude Design bundle (pb_classroom_setup/form.jsx)
// — converted to TSX and kept inline styles so tones match the cream theme.
'use client';

import React from 'react';
import { Icon } from '@/components/landing/pb-site/primitives';

export type Tone = 'butter' | 'mint' | 'coral' | 'sky' | 'grape' | 'pink';

export const Field = ({
  label, hint, children, optional, style,
}: {
  label: React.ReactNode;
  hint?: React.ReactNode;
  children: React.ReactNode;
  optional?: boolean;
  style?: React.CSSProperties;
}) => (
  <label style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
      <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.005em' }}>{label}</span>
      {optional && (
        <span className="pbs-mono" style={{ fontSize: 10.5, color: 'var(--pbs-ink-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>optional</span>
      )}
    </div>
    {children}
    {hint && <span style={{ fontSize: 12, color: 'var(--pbs-ink-muted)', lineHeight: 1.4 }}>{hint}</span>}
  </label>
);

export const TextInput = React.forwardRef<HTMLInputElement, {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  prefix?: string;
  icon?: React.ComponentProps<typeof Icon>['name'];
  style?: React.CSSProperties;
}>(({ value, onChange, placeholder, prefix, icon, style, ...rest }, ref) => (
  <div className="pbs-input-wrap" style={{
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '11px 14px',
    background: 'var(--pbs-paper)',
    border: '1.5px solid var(--pbs-line-2)',
    borderRadius: 12,
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
    ...style,
  }}>
    {icon && <Icon name={icon} size={15} stroke={2} style={{ color: 'var(--pbs-ink-muted)' }}/>}
    {prefix && <span className="pbs-mono" style={{ fontSize: 13, color: 'var(--pbs-ink-muted)' }}>{prefix}</span>}
    <input
      ref={ref}
      className="pbs-input-el"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        flex: 1, minWidth: 0,
        border: 0, background: 'transparent',
        fontSize: 14.5, color: 'var(--pbs-ink)', fontFamily: 'inherit',
      }}
      {...rest}
    />
  </div>
));
TextInput.displayName = 'TextInput';

export const Select = ({
  value, onChange, options, style,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string; label: string }>;
  style?: React.CSSProperties;
}) => (
  <div className="pbs-input-wrap" style={{
    position: 'relative',
    padding: '11px 38px 11px 14px',
    background: 'var(--pbs-paper)',
    border: '1.5px solid var(--pbs-line-2)',
    borderRadius: 12,
    ...style,
  }}>
    <select
      className="pbs-input-el"
      value={value}
      onChange={onChange}
      style={{
        width: '100%', appearance: 'none', WebkitAppearance: 'none',
        border: 0, background: 'transparent',
        fontSize: 14.5, color: 'var(--pbs-ink)', fontFamily: 'inherit',
        cursor: 'pointer',
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
    <Icon
      name="chevron" size={14} stroke={2.4}
      style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%) rotate(90deg)', color: 'var(--pbs-ink-muted)', pointerEvents: 'none' }}
    />
  </div>
);

type ChipOption<V extends string> = {
  value: V;
  label: string;
  icon?: React.ComponentProps<typeof Icon>['name'];
  tone?: Tone;
};

export function ChipGroup<V extends string>({
  value, onChange, options, multi = false,
}: {
  value: V | V[];
  onChange: (v: V | V[]) => void;
  options: Array<ChipOption<V>>;
  multi?: boolean;
}) {
  const isSelected = (v: V) => multi ? (value as V[]).includes(v) : (value as V) === v;
  const toggle = (v: V) => {
    if (multi) {
      const arr = value as V[];
      onChange(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
    } else {
      onChange(v);
    }
  };
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map((o) => {
        const sel = isSelected(o.value);
        const tone = o.tone || 'butter';
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => toggle(o.value)}
            style={{
              padding: '9px 14px',
              borderRadius: 999,
              fontSize: 13, fontWeight: 600,
              background: sel ? `var(--pbs-${tone})` : 'var(--pbs-paper)',
              color: sel ? `var(--pbs-${tone}-ink)` : 'var(--pbs-ink-soft)',
              border: `1.5px solid ${sel ? `var(--pbs-${tone}-ink)` : 'var(--pbs-line-2)'}`,
              boxShadow: sel ? `0 2px 0 var(--pbs-${tone}-ink)` : 'none',
              transition: 'all 120ms ease',
              display: 'inline-flex', alignItems: 'center', gap: 6,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {o.icon && <Icon name={o.icon} size={13} stroke={2.2}/>}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export const StepCard = ({
  children, style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) => (
  <div style={{
    background: 'var(--pbs-paper)',
    border: '1.5px solid var(--pbs-line)',
    borderRadius: 18,
    padding: 22,
    boxShadow: '0 3px 0 var(--pbs-line-2)',
    ...style,
  }}>{children}</div>
);

export const StepHeader = ({
  step, index, total,
}: {
  step: { title: React.ReactNode; sub?: React.ReactNode };
  index: number;
  total: number;
}) => (
  <div style={{ marginBottom: 22 }}>
    <div className="pbs-mono" style={{
      fontSize: 11, color: 'var(--pbs-ink-muted)',
      textTransform: 'uppercase', letterSpacing: '0.1em',
      marginBottom: 10,
    }}>
      Step {String(index + 1).padStart(2, '0')} of {String(total).padStart(2, '0')}
    </div>
    <h1 style={{
      margin: 0,
      fontSize: 'clamp(30px, 3.6vw, 42px)',
      lineHeight: 1.04, letterSpacing: '-0.03em', fontWeight: 700,
    }}>{step.title}</h1>
    {step.sub && (
      <p style={{ margin: '10px 0 0', fontSize: 15.5, color: 'var(--pbs-ink-soft)', maxWidth: 540, lineHeight: 1.5 }}>
        {step.sub}
      </p>
    )}
  </div>
);
