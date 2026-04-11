import { Check, Lock, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PanelActionButton } from '@/components/ui/panel-controls'
import {
  useProjectBoard,
  selectMilestoneProgress,
  selectCanCompleteMilestone,
} from '@/store/project-board-store'
import type {
  Template,
  ProjectBoard,
  MilestoneInstance,
  TaskInstance,
  TaskStatus,
  AITool,
} from '@/lib/templates/types'

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<TaskStatus, string> = {
  blocked:     'Blocked',
  todo:        'To Do',
  in_progress: 'In Progress',
  review:      'Review',
  done:        'Done',
}

const STATUS_COLOR: Record<TaskStatus, string> = {
  blocked:     'bg-zinc-700 text-zinc-400',
  todo:        'bg-zinc-700 text-zinc-400',
  in_progress: 'bg-blue-500/20 text-blue-400',
  review:      'bg-amber-500/20 text-amber-400',
  done:        'bg-green-500/20 text-green-400',
}

const AI_TOOL_DOT: Record<AITool, string> = {
  claude:      'bg-purple-400',
  pixellab:    'bg-pink-400',
  suno:        'bg-green-400',
  elevenlabs:  'bg-blue-400',
  freepik:     'bg-yellow-400',
  meshy:       'bg-orange-400',
}

// Cycle order for manual status advancement (skip 'blocked')
const STATUS_CYCLE: TaskStatus[] = ['todo', 'in_progress', 'review', 'done']

function nextStatus(current: TaskStatus): TaskStatus {
  if (current === 'blocked') return current
  const idx = STATUS_CYCLE.indexOf(current)
  return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
}

// ─── TaskCard ─────────────────────────────────────────────────────────────────

interface TaskCardProps {
  task: TaskInstance
  template: Template
  isActiveColumn: boolean
}

function TaskCard({ task, template, isActiveColumn }: TaskCardProps) {
  const { updateTaskStatus } = useProjectBoard()

  const templateTask = template.milestones
    .flatMap((m) => m.tasks)
    .find((t) => t.id === task.templateTaskId)

  if (!templateTask) return null

  const isBlocked = task.status === 'blocked'
  const isDone = task.status === 'done'
  const canCycle = isActiveColumn && !isBlocked

  const handleClick = () => {
    if (!canCycle) return
    updateTaskStatus(task.id, nextStatus(task.status))
  }

  return (
    <div
      onClick={handleClick}
      role={canCycle ? 'button' : undefined}
      tabIndex={canCycle ? 0 : undefined}
      onKeyDown={canCycle ? (e) => e.key === 'Enter' && handleClick() : undefined}
      className={cn(
        'bg-zinc-800/80 border border-white/[0.06] rounded-lg p-3 mb-2 select-none',
        canCycle && 'cursor-pointer hover:border-white/[0.12] hover:bg-zinc-800 transition-colors',
        isBlocked && 'opacity-50',
        isDone && 'opacity-60',
      )}
    >
      {/* Title row */}
      <div className="flex items-start gap-1.5 mb-2">
        {isBlocked && <Lock size={11} className="flex-shrink-0 text-zinc-600 mt-0.5" />}
        <span
          className={cn(
            'text-sm font-medium text-zinc-200 leading-snug',
            isDone && 'line-through text-zinc-500',
          )}
        >
          {templateTask.title}
        </span>
      </div>

      {/* Bottom row: status + role + ai tools */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Status badge */}
        <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-full', STATUS_COLOR[task.status])}>
          {STATUS_LABEL[task.status]}
        </span>

        {/* Role badge */}
        <span className="text-[10px] text-zinc-500 capitalize">{templateTask.role}</span>

        {/* AI tool dots */}
        {templateTask.aiTools.length > 0 && (
          <div className="flex items-center gap-1 ml-auto">
            {templateTask.aiTools.map((tool) => (
              <span
                key={tool}
                title={tool}
                className={cn('w-2 h-2 rounded-full flex-shrink-0', AI_TOOL_DOT[tool])}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── KanbanColumn ─────────────────────────────────────────────────────────────

interface KanbanColumnProps {
  milestoneTemplate: Template['milestones'][number]
  instance: MilestoneInstance | undefined
  template: Template
  board: ProjectBoard
  isActive: boolean
}

function KanbanColumn({ milestoneTemplate: mt, instance, template, board, isActive }: KanbanColumnProps) {
  const { completeCurrentMilestone } = useProjectBoard()

  const status = instance?.status ?? 'locked'
  const isCompleted = status === 'completed'
  const isLocked = status === 'locked'
  const progress = instance ? selectMilestoneProgress(instance) : { done: 0, total: 0 }
  const canComplete = isActive && instance
    ? selectCanCompleteMilestone(board, template)
    : false

  return (
    <div className="min-w-[240px] max-w-[280px] bg-zinc-900/60 rounded-xl border border-white/[0.06] flex flex-col flex-shrink-0">
      {/* Column header */}
      <div className="px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <span
            className="text-sm font-semibold truncate"
            style={{ color: isLocked ? '#52525b' : mt.color }}
          >
            {mt.name}
          </span>

          {/* Progress pill */}
          {!isLocked && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 bg-white/[0.06] text-zinc-400 rounded-full ml-auto flex-shrink-0">
              {progress.done}/{progress.total}
            </span>
          )}

          {/* Status icon */}
          {isCompleted && <Check size={13} className="text-zinc-500 flex-shrink-0" strokeWidth={2.5} />}
          {isLocked && <Lock size={12} className="text-zinc-700 flex-shrink-0" />}
        </div>
      </div>

      {/* Cards area */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {isLocked ? (
          <p className="text-[11px] text-zinc-600 text-center py-4">Locked</p>
        ) : instance?.tasks.length === 0 ? (
          <p className="text-[11px] text-zinc-600 text-center py-4">No tasks</p>
        ) : (
          instance?.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              template={template}
              isActiveColumn={isActive}
            />
          ))
        )}
      </div>

      {/* Column footer: complete stage button */}
      {canComplete && (
        <div className="px-3 pb-3 pt-1 border-t border-white/[0.06]">
          <PanelActionButton
            variant="accent"
            onClick={completeCurrentMilestone}
            icon={ArrowRight}
            fullWidth
            size="sm"
          >
            Complete Stage
          </PanelActionButton>
        </div>
      )}
    </div>
  )
}

// ─── KanbanView ───────────────────────────────────────────────────────────────

interface KanbanViewProps {
  template: Template
  board: ProjectBoard
}

export function KanbanView({ template, board }: KanbanViewProps) {
  return (
    <div className="flex gap-3 h-full overflow-x-auto px-4 py-4 pb-5">
      {template.milestones.map((mt) => {
        const instance = board.milestones.find((m) => m.templateMilestoneId === mt.id)
        const isActive = instance?.id === board.activeMilestoneId

        return (
          <KanbanColumn
            key={mt.id}
            milestoneTemplate={mt}
            instance={instance}
            template={template}
            board={board}
            isActive={isActive}
          />
        )
      })}
    </div>
  )
}
