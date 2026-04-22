import { forwardRef, type ButtonHTMLAttributes, type CSSProperties } from 'react';
import { type LucideIcon } from 'lucide-react';

export type IconButtonVariant = 'solid' | 'ghost' | 'outline';
export type IconButtonState = 'default' | 'active' | 'disabled';
export type IconButtonSize = 'sm' | 'md' | 'lg';

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  icon: LucideIcon;
  variant?: IconButtonVariant;
  state?: IconButtonState;
  size?: IconButtonSize;
  tooltip?: string;
  style?: CSSProperties;
  'aria-label'?: string;
}

/**
 * Icon-only button — canonical chunky-pastel build.
 *
 * Variant semantics on Playdemy Studio paper surfaces:
 *   - solid   = paper tile with 1.5px ink border + 0 2px 0 ink stacked shadow
 *               (the "raised" tile used for primary toolbar slots)
 *   - ghost   = transparent, picks up cream-2 + 1.5px line-2 on hover
 *               (the "quiet" tile used for close / edit / more buttons)
 *   - outline = paper tile with 1.5px line-2 border, promotes to ink border
 *               + stacked shadow on hover (the "ring" tile used on chips)
 *
 * Active state fills with the butter pastel + butter-ink border + stacked
 * shadow so selected toggles read as pressed.
 */

const SIZE_MAP: Record<IconButtonSize, { dim: number; icon: number; radius: number; boxY: number }> = {
  sm: { dim: 30, icon: 14, radius: 8,  boxY: 1.5 },
  md: { dim: 36, icon: 16, radius: 10, boxY: 2   },
  lg: { dim: 44, icon: 20, radius: 12, boxY: 2.5 },
};

function resolveStyle(
  variant: IconButtonVariant,
  state: IconButtonState,
  hover: boolean,
): CSSProperties {
  if (state === 'active') {
    return {
      background: 'var(--pb-butter)',
      color: 'var(--pb-butter-ink)',
      border: '1.5px solid var(--pb-butter-ink)',
      boxShadow: '0 2px 0 var(--pb-butter-ink)',
    };
  }
  if (state === 'disabled') {
    return {
      background: 'var(--pb-cream-2)',
      color: 'var(--pb-ink-muted)',
      border: '1.5px solid var(--pb-line-2)',
      boxShadow: 'none',
      opacity: 0.55,
    };
  }
  if (variant === 'solid') {
    return {
      background: hover ? 'var(--pb-cream-2)' : 'var(--pb-paper)',
      color: 'var(--pb-ink)',
      border: '1.5px solid var(--pb-ink)',
      boxShadow: '0 2px 0 var(--pb-ink)',
    };
  }
  if (variant === 'ghost') {
    return {
      background: hover ? 'var(--pb-cream-2)' : 'transparent',
      color: hover ? 'var(--pb-ink)' : 'var(--pb-ink-soft)',
      border: `1.5px solid ${hover ? 'var(--pb-line-2)' : 'transparent'}`,
      boxShadow: 'none',
    };
  }
  // outline
  return {
    background: 'var(--pb-paper)',
    color: hover ? 'var(--pb-ink)' : 'var(--pb-ink-soft)',
    border: `1.5px solid ${hover ? 'var(--pb-ink)' : 'var(--pb-line-2)'}`,
    boxShadow: hover ? '0 2px 0 var(--pb-ink)' : 'none',
  };
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon: Icon, variant = 'solid', state = 'default', size = 'md', tooltip, disabled, style, onMouseEnter, onMouseLeave, ...props }, ref) => {
    const effectiveState = disabled ? 'disabled' : state;
    const S = SIZE_MAP[size];
    const base = resolveStyle(variant, effectiveState, false);

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled || state === 'disabled'}
        title={tooltip}
        aria-label={props['aria-label'] ?? tooltip}
        onMouseEnter={(e) => {
          if (effectiveState === 'default') {
            const s = resolveStyle(variant, effectiveState, true);
            Object.assign(e.currentTarget.style, s);
          }
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          if (effectiveState === 'default') {
            Object.assign(e.currentTarget.style, base);
          }
          onMouseLeave?.(e);
        }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: S.dim,
          height: S.dim,
          borderRadius: S.radius,
          transition: 'background 120ms ease, color 120ms ease, border-color 120ms ease, box-shadow 120ms ease',
          cursor: effectiveState === 'disabled' ? 'not-allowed' : 'pointer',
          flexShrink: 0,
          ...base,
          ...style,
        }}
        {...props}
      >
        <Icon size={S.icon} strokeWidth={2.2} />
      </button>
    );
  },
);

IconButton.displayName = 'IconButton';
