'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Check } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface SectionDef {
  id: string;
  icon: LucideIcon;
  label: string;
}

interface DropdownSectionHeaderProps {
  sections: readonly SectionDef[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

/**
 * Shared arrow-navigable dropdown header used across right-panel contexts.
 *
 * Ported to the chunky-pastel look from
 * /tmp/design_bundle2/problocks/project/studio/leftpanel.jsx PagerBtn. Keeps
 * the same prev/center/next structure as AutoAnimation's DropdownSectionHeader
 * but swaps dark-glass chrome for paper + 1.5px ink borders + 0 2px 0 ink
 * stacked shadow when the central button is active.
 */
export function DropdownSectionHeader({
  sections,
  activeIndex,
  onSelect,
}: DropdownSectionHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const current = sections[Math.max(activeIndex, 0)];
  const SectionIcon = current.icon;

  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  const goPrev = useCallback(() => {
    onSelect(activeIndex <= 0 ? sections.length - 1 : activeIndex - 1);
  }, [activeIndex, sections.length, onSelect]);

  const goNext = useCallback(() => {
    onSelect(activeIndex >= sections.length - 1 ? 0 : activeIndex + 1);
  }, [activeIndex, sections.length, onSelect]);

  const pagerBtnStyle: React.CSSProperties = {
    width: 30,
    height: 30,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    background: 'var(--pb-paper)',
    border: '1.5px solid var(--pb-line-2)',
    color: 'var(--pb-ink-soft)',
    cursor: 'pointer',
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '10px 12px',
      }}
    >
      <button
        type="button"
        onClick={goPrev}
        style={pagerBtnStyle}
        title="Previous"
        aria-label="Previous section"
      >
        <ChevronLeft size={13} strokeWidth={2.4} />
      </button>

      <div ref={dropdownRef} style={{ flex: 1, position: 'relative', minWidth: 0 }}>
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '8px 10px',
            borderRadius: 10,
            background: dropdownOpen ? 'var(--pb-cream-2)' : 'var(--pb-paper)',
            border: `1.5px solid ${dropdownOpen ? 'var(--pb-ink)' : 'var(--pb-line-2)'}`,
            boxShadow: dropdownOpen ? '0 2px 0 var(--pb-ink)' : 'none',
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--pb-ink)',
            fontFamily: 'inherit',
            cursor: 'pointer',
            transition: 'background 120ms ease, border-color 120ms ease',
          }}
        >
          <SectionIcon size={14} strokeWidth={2.2} />
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {current.label}
          </span>
          <ChevronDown
            size={11}
            strokeWidth={2.4}
            style={{
              color: 'var(--pb-ink-muted)',
              transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.15s',
              flexShrink: 0,
            }}
          />
        </button>

        {dropdownOpen && (
          <div
            className="z-dropdown"
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              background: 'var(--pb-paper)',
              border: '1.5px solid var(--pb-ink)',
              borderRadius: 12,
              boxShadow: '0 4px 0 var(--pb-ink), 0 12px 28px rgba(29,26,20,0.12)',
              padding: 6,
            }}
          >
            {sections.map((section, i) => {
              const Icon = section.icon;
              const isActive = i === activeIndex;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => {
                    onSelect(i);
                    setDropdownOpen(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '9px 10px',
                    borderRadius: 8,
                    background: isActive ? 'var(--pb-cream-2)' : 'transparent',
                    color: isActive ? 'var(--pb-mint-ink)' : 'var(--pb-ink)',
                    fontSize: 13,
                    fontWeight: isActive ? 700 : 500,
                    fontFamily: 'inherit',
                    textAlign: 'left',
                    border: 0,
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'var(--pb-cream-2)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <Icon
                    size={15}
                    strokeWidth={2.2}
                    style={{
                      color: isActive ? 'var(--pb-mint-ink)' : 'var(--pb-ink-muted)',
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {section.label}
                  </span>
                  {isActive && (
                    <Check
                      size={12}
                      strokeWidth={2.6}
                      style={{ color: 'var(--pb-mint-ink)', flexShrink: 0 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={goNext}
        style={pagerBtnStyle}
        title="Next"
        aria-label="Next section"
      >
        <ChevronRight size={13} strokeWidth={2.4} />
      </button>
    </div>
  );
}
