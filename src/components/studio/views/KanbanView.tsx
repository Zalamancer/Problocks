import { Check, Lock, ArrowRight } from 'lucide-react';
import { PanelActionButton } from '@/components/ui/panel-controls';
import {
  useProjectBoard,
  selectMilestoneProgress,
  selectCanCompleteMilestone,
} from '@/store/project-board-store';
import {
  resolveEffectiveTask,
  type Template,
  type ProjectBoard,
  type MilestoneInstance,
  type TaskInstance,
  type TaskStatus,
  type AITool,
} from '@/lib/templates/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<TaskStatus, string> = {
  blocked:     'Blocked',
  todo:        'To Do',
  in_progress: 'In Progress',
  review:      'Review',
  done:        'Done',
};

const STATUS_TONE: Record<TaskStatus, { bg: string; ink: string }> = {
  blocked:     { bg: 'var(--pb-cream-2)', ink: 'var(--pb-ink-muted)'  },
  todo:        { bg: 'var(--pb-cream-2)', ink: 'var(--pb-ink-muted)'  },
  in_progress: { bg: 'var(--pb-sky)',     ink: 'var(--pb-sky-ink)'    },
  review:      { bg: 'var(--pb-butter)',  ink: 'var(--pb-butter-ink)' },
  done:        { bg: 'var(--pb-mint)',    ink: 'var(--pb-mint-ink)'   },
};

const AI_TOOL_TONE: Record<AITool, { bg: string; ink: string }> = {
  claude:     { bg: 'var(--pb-grape)',  ink: 'var(--pb-grape-ink)'  },
  pixellab:   { bg: 'var(--pb-pink)',   ink: 'var(--pb-pink-ink)'   },
  suno:       { bg: 'var(--pb-mint)',   ink: 'var(--pb-mint-ink)'   },
  elevenlabs: { bg: 'var(--pb-sky)',    ink: 'var(--pb-sky-ink)'    },
  freepik:    { bg: 'var(--pb-coral)',  ink: 'var(--pb-coral-ink)'  },
  meshy:      { bg: 'var(--pb-butter)', ink: 'var(--pb-butter-ink)' },
};

// Cycle order for manual status advancement (skip 'blocked')
const STATUS_CYCLE: TaskStatus[] = ['todo', 'in_progress', 'review', 'done'];

function nextStatus(current: TaskStatus): TaskStatus {
  if (current === 'blocked') return current;
  const idx = STATUS_CYCLE.indexOf(current);
  return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
}

// ─── TaskCard ─────────────────────────────────────────────────────────────────

interface TaskCardProps {
  task: TaskInstance;
  template: Template;
  isActiveColumn: boolean;
  onTaskClick: (templateTaskId: string) => void;
}

function TaskCard({ task, template, isActiveColumn, onTaskClick }: TaskCardProps) {
  const { updateTaskStatus } = useProjectBoard();

  const templateTask = template.milestones
    .flatMap((m) => m.tasks)
    .find((t) => t.id === task.templateTaskId);

  if (!templateTask) return null;

  const effective = resolveEffectiveTask(templateTask, task.overrides);

  const isBlocked = task.status === 'blocked';
  const isDone = task.status === 'done';
  const canCycle = isActiveColumn && !isBlocked;
  const statusTone = STATUS_TONE[task.status];

  const handleClick = () => {
    onTaskClick(task.templateTaskId);
  };

  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canCycle) return;
    updateTaskStatus(task.id, nextStatus(task.status));
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      className="select-none mb-2 transition-colors"
      style={{
        background: 'var(--pb-paper)',
        border: '1.5px solid var(--pb-line-2)',
        borderRadius: 12,
        padding: 12,
        opacity: isBlocked ? 0.55 : isDone ? 0.7 : 1,
        cursor: canCycle ? 'pointer' : 'default',
      }}
      onMouseEnter={(e) => {
        if (canCycle) {
          e.currentTarget.style.borderColor = 'var(--pb-ink)';
          e.currentTarget.style.boxShadow = '0 2px 0 var(--pb-ink)';
        }
      }}
      onMouseLeave={(e) => {
        if (canCycle) {
          e.currentTarget.style.borderColor = 'var(--pb-line-2)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      {/* Title row */}
      <div className="flex items-start gap-1.5 mb-2">
        {isBlocked && (
          <Lock
            size={11}
            strokeWidth={2.4}
            className="flex-shrink-0 mt-0.5"
            style={{ color: 'var(--pb-ink-muted)' }}
          />
        )}
        <span
          className="leading-snug"
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: isDone ? 'var(--pb-ink-muted)' : 'var(--pb-ink)',
            textDecoration: isDone ? 'line-through' : 'none',
          }}
        >
          {effective.title}
        </span>
      </div>

      {/* Bottom row: status + role + ai tools */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Status badge — click cycles status */}
        <span
          onClick={handleStatusClick}
          style={{
            fontSize: 10,
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 999,
            background: statusTone.bg,
            color: statusTone.ink,
            border: `1.5px solid ${statusTone.ink}`,
            cursor: canCycle ? 'pointer' : 'default',
            opacity: canCycle ? 1 : 0.85,
          }}
        >
          {STATUS_LABEL[task.status]}
        </span>

        {/* Role badge */}
        <span
          className="capitalize"
          style={{ fontSize: 10, color: 'var(--pb-ink-muted)', fontWeight: 600 }}
        >
          {effective.role}
        </span>

        {/* AI tool dots */}
        {effective.aiTools.length > 0 && (
          <div className="flex items-center gap-1 ml-auto">
            {effective.aiTools.map((tool) => {
              const tone = AI_TOOL_TONE[tool];
              return (
                <span
                  key={tool}
                  title={tool}
                  className="flex-shrink-0"
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: 999,
                    background: tone.bg,
                    border: `1.5px solid ${tone.ink}`,
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── KanbanColumn ─────────────────────────────────────────────────────────────

interface KanbanColumnProps {
  milestoneTemplate: Template['milestones'][number];
  instance: MilestoneInstance | undefined;
  template: Template;
  board: ProjectBoard;
  isActive: boolean;
  onTaskClick: (templateTaskId: string) => void;
}

function KanbanColumn({ milestoneTemplate: mt, instance, template, board, isActive, onTaskClick }: KanbanColumnProps) {
  const { completeCurrentMilestone } = useProjectBoard();

  const status = instance?.status ?? 'locked';
  const isCompleted = status === 'completed';
  const isLocked = status === 'locked';
  const progress = instance ? selectMilestoneProgress(instance) : { done: 0, total: 0 };
  const canComplete = isActive && instance
    ? selectCanCompleteMilestone(board, template)
    : false;

  return (
    <div
      className="min-w-[240px] max-w-[280px] flex flex-col flex-shrink-0"
      style={{
        background: 'var(--pb-cream-2)',
        border: `1.5px solid ${isActive ? 'var(--pb-ink)' : 'var(--pb-line-2)'}`,
        borderRadius: 14,
        boxShadow: isActive ? '0 2px 0 var(--pb-ink)' : 'none',
        opacity: isLocked ? 0.65 : 1,
      }}
    >
      {/* Column header */}
      <div
        className="px-4 py-3"
        style={{ borderBottom: '1.5px solid var(--pb-line-2)' }}
      >
        <div className="flex items-center gap-2">
          <span
            className="truncate"
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: isLocked ? 'var(--pb-ink-muted)' : mt.color,
            }}
          >
            {mt.name}
          </span>

          {/* Progress pill */}
          {!isLocked && (
            <span
              className="ml-auto flex-shrink-0"
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 999,
                background: 'var(--pb-paper)',
                color: 'var(--pb-ink)',
                border: '1.5px solid var(--pb-line-2)',
              }}
            >
              {progress.done}/{progress.total}
            </span>
          )}

          {/* Status icon */}
          {isCompleted && (
            <Check
              size={13}
              strokeWidth={2.6}
              className="flex-shrink-0"
              style={{ color: 'var(--pb-mint-ink)' }}
            />
          )}
          {isLocked && (
            <Lock
              size={12}
              strokeWidth={2.4}
              className="flex-shrink-0"
              style={{ color: 'var(--pb-ink-muted)' }}
            />
          )}
        </div>
      </div>

      {/* Cards area */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {isLocked ? (
          <p
            className="text-center py-4 italic"
            style={{ fontSize: 11, color: 'var(--pb-ink-muted)' }}
          >
            Locked
          </p>
        ) : instance?.tasks.length === 0 ? (
          <p
            className="text-center py-4 italic"
            style={{ fontSize: 11, color: 'var(--pb-ink-muted)' }}
          >
            No tasks
          </p>
        ) : (
          instance?.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              template={template}
              isActiveColumn={isActive}
              onTaskClick={onTaskClick}
            />
          ))
        )}
      </div>

      {/* Column footer: complete stage button */}
      {canComplete && (
        <div
          className="px-3 pb-3 pt-2"
          style={{ borderTop: '1.5px solid var(--pb-line-2)' }}
        >
          <PanelActionButton
            variant="primary"
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
  );
}

// ─── KanbanView ───────────────────────────────────────────────────────────────

interface KanbanViewProps {
  template: Template;
  board: ProjectBoard;
  onTaskClick: (templateTaskId: string) => void;
}

export function KanbanView({ template, board, onTaskClick }: KanbanViewProps) {
  return (
    <div className="flex gap-3 h-full overflow-x-auto px-4 py-4 pb-5">
      {template.milestones.map((mt) => {
        const instance = board.milestones.find((m) => m.templateMilestoneId === mt.id);
        const isActive = instance?.id === board.activeMilestoneId;

        return (
          <KanbanColumn
            key={mt.id}
            milestoneTemplate={mt}
            instance={instance}
            template={template}
            board={board}
            isActive={isActive}
            onTaskClick={onTaskClick}
          />
        );
      })}
    </div>
  );
}
