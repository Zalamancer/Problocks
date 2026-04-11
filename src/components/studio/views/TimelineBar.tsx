import { Check, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { selectMilestoneProgress } from '@/store/project-board-store'
import type { Template, ProjectBoard, MilestoneInstance } from '@/lib/templates/types'

interface TimelineBarProps {
  template: Template
  board: ProjectBoard
  activeMilestoneId: string | null
  onMilestoneClick: (milestoneTemplateId: string) => void
}

export function TimelineBar({ template, board, activeMilestoneId, onMilestoneClick }: TimelineBarProps) {
  return (
    <div className="flex w-full h-16 bg-zinc-900/90 backdrop-blur border-t border-white/[0.06] overflow-hidden">
      {template.milestones.map((mt, idx) => {
        // Find the MilestoneInstance that corresponds to this template milestone
        const instance: MilestoneInstance | undefined = board.milestones.find(
          (m) => m.templateMilestoneId === mt.id,
        )

        const status = instance?.status ?? 'locked'
        const isActive = instance?.id === activeMilestoneId
        const isCompleted = status === 'completed'
        const isLocked = status === 'locked'

        const progress = instance ? selectMilestoneProgress(instance) : { done: 0, total: 0 }

        const handleClick = () => {
          if (isLocked) return
          onMilestoneClick(mt.id)
        }

        return (
          <div key={mt.id} className="flex">
            {/* Divider between segments (skip first) */}
            {idx > 0 && (
              <div className="w-px h-full bg-white/[0.06] flex-shrink-0" />
            )}

            <button
              type="button"
              onClick={handleClick}
              disabled={isLocked}
              title={isLocked ? mt.name : mt.description}
              className={cn(
                'flex-1 flex items-center gap-3 px-4 min-w-0 h-full transition-colors text-left',
                isLocked
                  ? 'cursor-not-allowed'
                  : 'cursor-pointer hover:bg-white/[0.04]',
                isActive && 'bg-white/[0.06]',
                isCompleted && !isActive && 'bg-black/20',
              )}
              style={
                isActive
                  ? { borderBottom: `2px solid ${mt.color}` }
                  : undefined
              }
            >
              {/* Color accent bar on left */}
              <div
                className="w-0.5 h-7 flex-shrink-0 rounded-full"
                style={{ backgroundColor: isLocked ? '#3f3f46' : mt.color }}
              />

              {/* Name + progress */}
              <div className="flex flex-col min-w-0 flex-1">
                <span
                  className={cn(
                    'text-xs font-medium truncate',
                    isLocked ? 'text-zinc-600' : isCompleted ? 'text-zinc-500' : 'text-zinc-200',
                  )}
                >
                  {mt.name}
                </span>
                {!isLocked && (
                  <span
                    className={cn(
                      'text-[10px]',
                      isCompleted ? 'text-zinc-600' : 'text-zinc-500',
                    )}
                  >
                    {progress.done}/{progress.total} tasks
                  </span>
                )}
              </div>

              {/* Status icon */}
              {isCompleted && (
                <Check
                  size={13}
                  className="flex-shrink-0 text-zinc-500"
                  strokeWidth={2.5}
                />
              )}
              {isLocked && (
                <Lock size={12} className="flex-shrink-0 text-zinc-700" />
              )}
            </button>
          </div>
        )
      })}
    </div>
  )
}
