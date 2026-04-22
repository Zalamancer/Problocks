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
  <label style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0, ...style }}>
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
  value, onChange, options, style, dropUp = false,
}: {
  value: string;
  onChange: (e: { target: { value: string } }) => void;
  options: Array<{ value: string; label: string; shortLabel?: string }>;
  style?: React.CSSProperties;
  dropUp?: boolean;
}) => {
  const [open, setOpen] = React.useState(false);
  const [activeIdx, setActiveIdx] = React.useState(-1);
  const wrapRef = React.useRef<HTMLDivElement | null>(null);
  const btnRef = React.useRef<HTMLButtonElement | null>(null);

  const current = options.find((o) => o.value === value) || options[0];

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const pick = (v: string) => {
    onChange({ target: { value: v } });
    setOpen(false);
    btnRef.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) { setOpen(true); return; }
      setActiveIdx((i) => (i + 1) % options.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) { setOpen(true); return; }
      setActiveIdx((i) => (i - 1 + options.length) % options.length);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!open) setOpen(true);
      else if (activeIdx >= 0) pick(options[activeIdx].value);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative', minWidth: 0, ...style }}>
      <button
        ref={btnRef}
        type="button"
        className="pbs-input-wrap"
        onClick={() => {
          setOpen((o) => !o);
          setActiveIdx(options.findIndex((o) => o.value === value));
        }}
        onKeyDown={onKeyDown}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
          width: '100%',
          minWidth: 0,
          boxSizing: 'border-box',
          padding: '11px 14px',
          background: 'var(--pbs-paper)',
          border: '1.5px solid var(--pbs-line-2)',
          borderRadius: 12,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
          fontFamily: 'inherit',
          fontSize: 14.5,
          color: 'var(--pbs-ink)',
          textAlign: 'left',
          cursor: 'pointer',
        }}
      >
        <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {current?.shortLabel ?? current?.label}
        </span>
        <Icon
          name="chevron" size={14} stroke={2.4}
          style={{ transform: `rotate(${open ? -90 : 90}deg)`, color: 'var(--pbs-ink-muted)', transition: 'transform 140ms ease' }}
        />
      </button>

      {open && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            ...(dropUp
              ? { bottom: 'calc(100% + 6px)' }
              : { top: 'calc(100% + 6px)' }),
            left: 0, right: 0,
            width: 'auto',
            minWidth: 0,
            boxSizing: 'border-box',
            zIndex: 50,
            background: 'var(--pbs-paper)',
            border: '1.5px solid var(--pbs-line-2)',
            borderRadius: 12,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 3px 0 var(--pbs-line-2)',
            overflow: 'hidden',
            maxHeight: 320,
            overflowY: 'auto',
          }}
        >
          {options.map((o, i) => {
            const active = i === activeIdx;
            const selected = o.value === value;
            return (
              <button
                key={o.value}
                type="button"
                role="option"
                aria-selected={selected}
                onMouseDown={(e) => { e.preventDefault(); pick(o.value); }}
                onMouseEnter={() => setActiveIdx(i)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                  width: '100%', textAlign: 'left',
                  minWidth: 0,
                  boxSizing: 'border-box',
                  padding: '10px 14px',
                  border: 0,
                  background: active ? 'var(--pbs-cream-2)' : 'transparent',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: 14,
                  color: 'var(--pbs-ink)',
                  borderBottom: i < options.length - 1 ? '1px solid var(--pbs-line)' : 'none',
                  fontWeight: selected ? 700 : 500,
                }}
              >
                <span style={{
                  flex: 1, minWidth: 0,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{o.label}</span>
                {selected && <Icon name="check" size={13} stroke={2.4} style={{ color: 'var(--pbs-ink)' }}/>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

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
