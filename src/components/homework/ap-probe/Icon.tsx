// Inline SVG icons — just the ones the homework views use.
// Ported from the design's atoms.jsx verbatim.

import type { CSSProperties } from 'react';

export type IconName =
  | 'check'
  | 'x'
  | 'chevron-down'
  | 'chevron-left'
  | 'wand'
  | 'cube'
  | 'file'
  | 'grid'
  | 'bolt'
  | 'arrow-right';

type IconProps = {
  name: IconName;
  size?: number;
  stroke?: number;
  style?: CSSProperties;
};

export function Icon({ name, size = 16, stroke = 1.8, style }: IconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: stroke,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    style,
  };
  switch (name) {
    case 'check':
      return (
        <svg {...common}>
          <path d="M4 12l5 5L20 6" />
        </svg>
      );
    case 'x':
      return (
        <svg {...common}>
          <path d="M6 6l12 12M18 6l-12 12" />
        </svg>
      );
    case 'chevron-down':
      return (
        <svg {...common}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      );
    case 'chevron-left':
      return (
        <svg {...common}>
          <path d="M15 6l-6 6 6 6" />
        </svg>
      );
    case 'wand':
      return (
        <svg {...common}>
          <path d="M15 4V2M15 10V8M8 2l1.5 1.5M20 2l-1.5 1.5M4 20l12-12M16 8l4 4" />
        </svg>
      );
    case 'cube':
      return (
        <svg {...common}>
          <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zM3 7l9 5 9-5M12 12v10" />
        </svg>
      );
    case 'file':
      return (
        <svg {...common}>
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM14 2v6h6" />
        </svg>
      );
    case 'grid':
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      );
    case 'bolt':
      return (
        <svg {...common}>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    case 'arrow-right':
      return (
        <svg {...common}>
          <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      );
    default:
      return null;
  }
}
