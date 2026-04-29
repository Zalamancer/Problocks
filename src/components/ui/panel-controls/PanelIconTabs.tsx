import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface IconTab {
  id: string
  label: string
  icon: LucideIcon
}

interface PanelIconTabsProps {
  tabs: IconTab[]
  activeTab: string
  onChange: (id: string) => void
  className?: string
}

/**
 * Animated expanding pill tab bar — copied from AutoAnimation's MediaPanel,
 * re-skinned to the Problocks chunky-pastel palette: active pill is butter
 * yellow (`--pb-butter` / `--pb-butter-ink`) with a 1.5px chunky border and
 * 2px hard shadow; inactive tabs use the muted-ink colour and pick up the
 * cream-2 hover background.
 *
 * Active tab expands (flex: 2) to reveal the label; inactive tabs show icon
 * only (flex: 1).
 */
export function PanelIconTabs({ tabs, activeTab, onChange, className }: PanelIconTabsProps) {
  return (
    <div className={cn('shrink-0 flex items-center gap-1 px-3 py-2 border-b border-white/5', className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab
        const Icon = tab.icon
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            title={tab.label}
            style={{
              flex: isActive ? 2 : 1,
              transition:
                'flex 300ms cubic-bezier(0.25, 1, 0.5, 1), background-color 200ms, color 200ms, padding 200ms, box-shadow 200ms, border-color 200ms',
              background: isActive ? 'var(--pb-butter)' : 'transparent',
              color: isActive ? 'var(--pb-butter-ink)' : 'var(--pb-ink-muted)',
              border: isActive ? '1.5px solid var(--pb-butter-ink)' : '1.5px solid transparent',
              boxShadow: isActive ? '0 2px 0 var(--pb-butter-ink)' : 'none',
            }}
            className={cn(
              'relative h-8 rounded-lg flex items-center justify-center gap-1.5 overflow-hidden',
              isActive ? 'px-2' : 'hover:bg-[var(--pb-cream-2)] hover:text-[var(--pb-ink)]',
            )}
          >
            <Icon size={16} className="shrink-0" />
            <span
              style={{ transition: 'max-width 300ms cubic-bezier(0.25, 1, 0.5, 1) 50ms, opacity 200ms ease 60ms' }}
              className={cn(
                'text-[11px] font-medium truncate',
                isActive ? 'max-w-[80px] opacity-100' : 'max-w-0 opacity-0',
              )}
            >
              {tab.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
