'use client';
import { useState, useMemo } from 'react';
import {
  Wrench,
  FileText,
  Paperclip,
} from 'lucide-react';
import { useProjectBoard } from '@/store/project-board-store';
import { PanelActionButton } from '@/components/ui/panel-controls';
import { PanelErrorBoundary } from '@/components/PanelErrorBoundary';
import { DropdownSectionHeader, type SectionDef } from './DropdownSectionHeader';
import {
  DetailsSection,
  ToolsSection,
  AttachmentsSection,
} from './task-sections';
import {
  resolveEffectiveTask,
  type Template,
  type ProjectBoard,
  type TaskStatus,
  type TaskOverrides,
  type ResourceAttachment,
} from '@/lib/templates/types';

// ─── Sections for DropdownSectionHeader ──────────────────────────────────────

const TASK_SECTIONS: readonly SectionDef[] = [
  { id: 'details',     icon: FileText,  label: 'Details' },
  { id: 'tools',       icon: Wrench,    label: 'AI Tools' },
  { id: 'attachments', icon: Paperclip, label: 'Resources' },
] as const;

type TaskSectionId = (typeof TASK_SECTIONS)[number]['id'];

// ─── Status helpers ──────────────────────────────────────────────────────────

const STATUS_LABEL: Record<TaskStatus, string> = {
  blocked: 'Blocked', todo: 'To Do', in_progress: 'In Progress', review: 'Review', done: 'Done',
};
const STATUS_CYCLE: TaskStatus[] = ['todo', 'in_progress', 'review', 'done'];
function nextStatus(s: TaskStatus): TaskStatus {
  if (s === 'blocked') return s;
  return STATUS_CYCLE[(STATUS_CYCLE.indexOf(s) + 1) % STATUS_CYCLE.length];
}

// Temp user id until Supabase auth is integrated
const CURRENT_USER_ID = 'local-user';

// ─── Component ───────────────────────────────────────────────────────────────

interface TaskDetailPanelProps {
  templateTaskId: string;
  template: Template;
  board: ProjectBoard;
}

export function TaskDetailPanel({ templateTaskId, template, board }: TaskDetailPanelProps) {
  const updateTaskStatus          = useProjectBoard((s) => s.updateTaskStatus);
  const setTaskOverride           = useProjectBoard((s) => s.setTaskOverride);
  const setTaskAssignees          = useProjectBoard((s) => s.setTaskAssignees);
  const setTaskDueDate            = useProjectBoard((s) => s.setTaskDueDate);
  const addAttachment             = useProjectBoard((s) => s.addAttachment);
  const removeAttachment          = useProjectBoard((s) => s.removeAttachment);
  const updateTaskDescriptionBlocks = useProjectBoard((s) => s.updateTaskDescriptionBlocks);

  const teamMembers               = useProjectBoard((s) => s.teamMembers);

  const [activeSection, setActiveSection] = useState<TaskSectionId>('details');

  // Find template task + live instance
  const templateTask = template.milestones.flatMap((m) => m.tasks).find((t) => t.id === templateTaskId);
  const taskInstance = board.milestones.flatMap((m) => m.tasks).find((t) => t.templateTaskId === templateTaskId);
  const milestoneInstance = board.milestones.find((m) => m.id === taskInstance?.milestoneInstanceId);
  const isActive = milestoneInstance?.id === board.activeMilestoneId;

  const effective = useMemo(
    () => (templateTask ? resolveEffectiveTask(templateTask, taskInstance?.overrides) : null),
    [templateTask, taskInstance?.overrides],
  );

  const blockedByTitles = useMemo(() => {
    if (!templateTask) return [];
    return templateTask.blockedBy
      .map((depId) => {
        const dep = template.milestones.flatMap((m) => m.tasks).find((t) => t.id === depId);
        if (!dep) return null;
        const depInst = board.milestones.flatMap((m) => m.tasks).find((t) => t.templateTaskId === dep.id);
        return resolveEffectiveTask(dep, depInst?.overrides).title;
      })
      .filter((v): v is string => typeof v === 'string');
  }, [templateTask, template, board]);

  if (!templateTask || !effective || !taskInstance) return null;

  const status = taskInstance.status;
  const isBlocked = status === 'blocked';
  const canAdvance = isActive && !isBlocked && status !== 'done';
  const activeIndex = TASK_SECTIONS.findIndex((s) => s.id === activeSection);

  // ─── Handlers ────────────────────────────────────────────────────────

  const handleFieldChange = <K extends keyof TaskOverrides>(field: K, value: TaskOverrides[K]) =>
    setTaskOverride(taskInstance.id, { [field]: value } as Partial<TaskOverrides>);

  const handleAddAttachment = (attachment: ResourceAttachment) =>
    addAttachment(taskInstance.id, attachment);

  return (
    <aside className="w-[300px] flex-shrink-0 h-full flex flex-col bg-zinc-900/80 backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden">
      <div className="shrink-0 border-b border-white/5">
        <DropdownSectionHeader
          sections={TASK_SECTIONS}
          activeIndex={activeIndex}
          onSelect={(i) => setActiveSection(TASK_SECTIONS[i].id as TaskSectionId)}
        />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <PanelErrorBoundary key={activeSection} panelName={`Task ${activeSection}`}>
          {activeSection === 'details' && (
            <DetailsSection
              effective={effective}
              status={status}
              dueDate={taskInstance.dueDate}
              assigneeIds={taskInstance.assigneeIds}
              teamMembers={teamMembers}
              blockedByTitles={blockedByTitles}
              onStatusChange={(s) => updateTaskStatus(taskInstance.id, s)}
              onFieldChange={handleFieldChange}
              onDueDateChange={(d) => setTaskDueDate(taskInstance.id, d)}
              onAssigneesChange={(ids) => setTaskAssignees(taskInstance.id, ids)}
            />
          )}
          {activeSection === 'tools' && (
            <ToolsSection
              tools={effective.aiTools}
              onToolsChange={(next) => setTaskOverride(taskInstance.id, { aiTools: next })}
            />
          )}
          {activeSection === 'attachments' && (
            <div className="px-4 py-4 flex flex-col gap-4">
              <AttachmentsSection
                attachments={taskInstance.attachments}
                currentUserId={CURRENT_USER_ID}
                onAddAttachment={handleAddAttachment}
                onRemoveAttachment={(aId) => removeAttachment(taskInstance.id, aId)}
              />
            </div>
          )}

        </PanelErrorBoundary>
      </div>

      <div className="shrink-0 px-4 py-3 border-t border-white/5">
        <PanelActionButton
          variant="accent"
          fullWidth
          onClick={() => updateTaskStatus(taskInstance.id, nextStatus(status))}
          disabled={!canAdvance}
        >
          {isBlocked ? 'Blocked' : status === 'done' ? 'Completed' : `Mark ${STATUS_LABEL[nextStatus(status)]}`}
        </PanelActionButton>
      </div>
    </aside>
  );
}
