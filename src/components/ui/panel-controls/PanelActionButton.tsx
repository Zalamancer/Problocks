import { Loader2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PBButton } from '@/components/ui/pb-atoms';

/**
 * Panel footer / inline action button.
 *
 * This is a thin wrapper around the canonical `PBButton` so every panel
 * footer in the studio automatically renders in the chunky-pastel style
 * (tone bg + 1.5px ink border + stacked 0 Npx 0 ink shadow + 700 weight
 * + press animation) with NO per-call styling required.
 *
 * The prop surface is kept intentionally compatible with the older dark
 * implementation (`variant`, `loading`, `icon`, `fullWidth`, `size`, etc.)
 * so existing call sites keep working without edits.
 */
interface PanelActionButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'destructive' | 'accent';
  disabled?: boolean;
  loading?: boolean;
  icon?: LucideIcon;
  fullWidth?: boolean;
  size?: 'sm' | 'md';
  'aria-label'?: string;
}

export function PanelActionButton({
  children,
  onClick,
  variant = 'secondary',
  disabled,
  loading,
  icon,
  fullWidth,
  size = 'md',
  'aria-label': ariaLabel,
}: PanelActionButtonProps) {
  return (
    <PBButton
      variant={variant}
      size={size}
      icon={loading ? Loader2 : icon}
      disabled={disabled || loading}
      onClick={onClick}
      fullWidth={fullWidth}
      aria-label={ariaLabel}
    >
      {children}
    </PBButton>
  );
}
