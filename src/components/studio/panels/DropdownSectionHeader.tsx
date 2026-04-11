'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

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
 * Layout: [ChevronLeft] [centered icon + label + ChevronDown dropdown] [ChevronRight]
 * Clicking the center button opens a portal-style list of all sections.
 * Left/right arrows cycle prev/next.
 *
 * Copied faithfully from
 * AutoAnimation/src/components/layout/RightPanel/SectionHeaders.tsx
 * (DropdownSectionHeader, lines 156–241).
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

  return (
    <div className="flex items-center gap-1 px-3 py-2">
      <button
        onClick={goPrev}
        className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors"
        title="Previous"
        aria-label="Previous section"
      >
        <ChevronLeft size={16} />
      </button>
      <div ref={dropdownRef} className="relative flex-1 min-w-0">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[13px] font-medium text-zinc-200 hover:text-white hover:bg-white/[0.06] transition-colors"
        >
          <SectionIcon size={14} className="shrink-0 text-accent" />
          <span className="truncate">{current.label}</span>
          <ChevronDown
            size={14}
            className={cn(
              'shrink-0 text-zinc-500 transition-transform duration-200',
              dropdownOpen && 'rotate-180',
            )}
          />
        </button>
        {dropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-panel-bg border border-white/5 rounded-xl shadow-2xl py-1.5">
            {sections.map((section, i) => {
              const Icon = section.icon;
              const isActive = i === activeIndex;
              return (
                <button
                  key={section.id}
                  onClick={() => {
                    onSelect(i);
                    setDropdownOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3.5 py-2 text-left text-[13px] transition-colors',
                    isActive
                      ? 'bg-accent/10 text-accent'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06]',
                  )}
                >
                  <Icon size={15} className="shrink-0" />
                  <span className="truncate">{section.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
      <button
        onClick={goNext}
        className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors"
        title="Next"
        aria-label="Next section"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
