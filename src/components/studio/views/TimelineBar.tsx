import { Check, Lock } from 'lucide-react';
import { selectMilestoneProgress } from '@/store/project-board-store';
import type { Template, ProjectBoard, MilestoneInstance } from '@/lib/templates/types';

interface TimelineBarProps {
  template: Template;
  board: ProjectBoard;
  activeMilestoneId: string | null;
  onMilestoneClick: (milestoneTemplateId: string) => void;
}

export function TimelineBar({ template, board, activeMilestoneId, onMilestoneClick }: TimelineBarProps) {
  return (
    <div
      className="flex w-full h-16 overflow-hidden"
      style={{
        background: 'var(--pb-paper)',
        borderTop: '1.5px solid var(--pb-line-2)',
      }}
    >
      {template.milestones.map((mt, idx) => {
        const instance: MilestoneInstance | undefined = board.milestones.find(
          (m) => m.templateMilestoneId === mt.id,
        );

        const status = instance?.status ?? 'locked';
        const isActive = instance?.id === activeMilestoneId;
        const isCompleted = status === 'completed';
        const isLocked = status === 'locked';

        const progress = instance ? selectMilestoneProgress(instance) : { done: 0, total: 0 };

        const handleClick = () => {
          if (isLocked) return;
          onMilestoneClick(mt.id);
        };

        return (
          <div key={mt.id} className="flex flex-1 min-w-0">
            {/* Divider between segments (skip first) */}
            {idx > 0 && (
              <div
                className="flex-shrink-0"
                style={{ width: 1.5, height: '100%', background: 'var(--pb-line-2)' }}
              />
            )}

            <button
              type="button"
              onClick={handleClick}
              disabled={isLocked}
              title={isLocked ? mt.name : mt.description}
              className="flex-1 flex items-center gap-3 px-4 min-w-0 h-full transition-colors text-left"
              style={{
                cursor: isLocked ? 'not-allowed' : 'pointer',
                background: isActive
                  ? 'var(--pb-cream-2)'
                  : isCompleted
                    ? 'var(--pb-cream-2)'
                    : 'transparent',
                borderBottom: isActive ? `2.5px solid ${mt.color}` : '2.5px solid transparent',
                opacity: isLocked ? 0.55 : 1,
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => {
                if (!isLocked && !isActive) {
                  e.currentTarget.style.background = 'var(--pb-cream-2)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLocked && !isActive) {
                  e.currentTarget.style.background = isCompleted ? 'var(--pb-cream-2)' : 'transparent';
                }
              }}
            >
              {/* Color accent bar on left */}
              <div
                className="flex-shrink-0"
                style={{
                  width: 3,
                  height: 28,
                  borderRadius: 2,
                  background: isLocked ? 'var(--pb-line-2)' : mt.color,
                }}
              />

              {/* Name + progress */}
              <div className="flex flex-col min-w-0 flex-1">
                <span
                  className="truncate"
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: isLocked
                      ? 'var(--pb-ink-muted)'
                      : isCompleted
                        ? 'var(--pb-ink-muted)'
                        : 'var(--pb-ink)',
                  }}
                >
                  {mt.name}
                </span>
                {!isLocked && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: 'var(--pb-ink-muted)',
                    }}
                  >
                    {progress.done}/{progress.total} tasks
                  </span>
                )}
              </div>

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
            </button>
          </div>
        );
      })}
    </div>
  );
}
