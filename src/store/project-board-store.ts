import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ProjectBoard,
  MilestoneInstance,
  TaskInstance,
  TaskStatus,
  TaskOverrides,
  AIOutput,
  ActivityEntry,
  ActivityEntryType,
  Comment,
  ResourceAttachment,
  TeamMember,
  TemplateId,
  Template,
} from '@/lib/templates/types';
import { TEMPLATES } from '@/lib/templates/index';

// ─── Selectors (pure functions, no store subscription needed) ─────────────────

export function selectActiveMilestone(board: ProjectBoard): MilestoneInstance | null {
  return board.milestones.find((m) => m.id === board.activeMilestoneId) ?? null;
}

export function selectTaskInstance(board: ProjectBoard, taskInstanceId: string): TaskInstance | null {
  for (const m of board.milestones) {
    const task = m.tasks.find((t) => t.id === taskInstanceId);
    if (task) return task;
  }
  return null;
}

export function selectMilestoneProgress(milestone: MilestoneInstance): { done: number; total: number } {
  const relevant = milestone.tasks.filter((t) => t.status !== 'blocked');
  return { done: relevant.filter((t) => t.status === 'done').length, total: relevant.length };
}

export function selectBoardProgress(board: ProjectBoard): { done: number; total: number } {
  let done = 0;
  let total = 0;
  for (const m of board.milestones) {
    const p = selectMilestoneProgress(m);
    done += p.done;
    total += p.total;
  }
  return { done, total };
}

export function selectCanCompleteMilestone(board: ProjectBoard, template: Template): boolean {
  const active = selectActiveMilestone(board);
  if (!active) return false;
  const nonBlocked = active.tasks.filter((t) => t.status !== 'blocked');
  return nonBlocked.length > 0 && nonBlocked.every((t) => t.status === 'done');
}

// ─── Store ────────────────────────────────────────────────────────────────────

interface ProjectBoardState {
  board: ProjectBoard | null;
  teamMembers: TeamMember[];
  setTeamMembers: (members: TeamMember[]) => void;
  initBoard: (templateId: TemplateId, projectId: string) => void;
  updateTaskStatus: (taskInstanceId: string, status: TaskStatus) => void;
  completeCurrentMilestone: () => void;
  assignTask: (taskInstanceId: string, userId: string) => void;
  unassignTask: (taskInstanceId: string, userId: string) => void;
  setTaskAssignees: (taskInstanceId: string, assigneeIds: string[]) => void;
  addAIOutput: (taskInstanceId: string, output: AIOutput) => void;
  updateTaskNotes: (taskInstanceId: string, notes: string) => void;
  setTaskOverride: (taskInstanceId: string, patch: Partial<TaskOverrides>) => void;
  clearTaskOverride: (taskInstanceId: string, field: keyof TaskOverrides) => void;
  setTaskDueDate: (taskInstanceId: string, dueDate: string | undefined) => void;
  addComment: (taskInstanceId: string, comment: Comment) => void;
  deleteComment: (taskInstanceId: string, commentId: string) => void;
  addAttachment: (taskInstanceId: string, attachment: ResourceAttachment) => void;
  removeAttachment: (taskInstanceId: string, attachmentId: string) => void;
  updateTaskDescriptionBlocks: (taskInstanceId: string, blocks: unknown[]) => void;
  updateTaskDeliverableBlocks: (taskInstanceId: string, blocks: unknown[]) => void;
  updateTaskNoteBlocks: (taskInstanceId: string, blocks: unknown[]) => void;
  clearBoard: () => void;
}

// Helper: update a task inside the board's milestones immutably
function mapTask(
  milestones: MilestoneInstance[],
  taskInstanceId: string,
  updater: (task: TaskInstance) => TaskInstance,
): MilestoneInstance[] {
  return milestones.map((m) => ({
    ...m,
    tasks: m.tasks.map((t) => (t.id === taskInstanceId ? updater(t) : t)),
  }));
}

// Private helper — append an activity entry to a task. Called internally
// by the public actions so the activity log is populated automatically.
function appendActivity(
  milestones: MilestoneInstance[],
  taskInstanceId: string,
  type: ActivityEntryType,
  details: Record<string, string>,
  authorId = 'system',
): MilestoneInstance[] {
  const entry: ActivityEntry = {
    id: crypto.randomUUID().slice(0, 12),
    type,
    authorId,
    timestamp: new Date().toISOString(),
    details,
  };
  return mapTask(milestones, taskInstanceId, (t) => ({
    ...t,
    activityLog: [...t.activityLog, entry],
  }));
}

export const useProjectBoard = create<ProjectBoardState>()(persist((set, get) => ({
  board: null,
  teamMembers: [],
  setTeamMembers: (members) => set({ teamMembers: members }),

  initBoard(templateId, projectId) {
    const template = TEMPLATES[templateId];
    if (!template) return;

    const now = new Date().toISOString();

    const milestones: MilestoneInstance[] = template.milestones
      .sort((a, b) => a.order - b.order)
      .map((mt, milestoneIdx) => {
        const milestoneInstanceId = `${mt.id}-${crypto.randomUUID().slice(0, 8)}`;
        const isFirst = milestoneIdx === 0;
        const status = isFirst ? 'active' : 'locked';

        const tasks: TaskInstance[] = mt.tasks.map((tt) => {
          let taskStatus: TaskStatus;
          if (isFirst) {
            taskStatus = tt.blockedBy.length === 0 ? 'todo' : 'blocked';
          } else {
            taskStatus = 'blocked';
          }
          return {
            id: `${tt.id}-${crypto.randomUUID().slice(0, 8)}`,
            templateTaskId: tt.id,
            milestoneInstanceId,
            status: taskStatus,
            assigneeIds: [],
            notes: '',
            aiOutputs: [],
            comments: [],
            activityLog: [],
            attachments: [],
          };
        });

        return {
          id: milestoneInstanceId,
          templateMilestoneId: mt.id,
          status,
          tasks,
          unlockedAt: isFirst ? now : undefined,
        };
      });

    const board: ProjectBoard = {
      id: crypto.randomUUID(),
      projectId,
      templateId,
      createdAt: now,
      activeMilestoneId: milestones[0]?.id ?? null,
      milestones,
    };

    set({ board });
  },

  updateTaskStatus(taskInstanceId, status) {
    const { board } = get();
    if (!board) return;

    // Build a set of templateTaskIds that are 'done' after this update
    const allTasks = board.milestones.flatMap((m) => m.tasks);
    const doneTemplateIds = new Set(
      allTasks
        .filter((t) => (t.id === taskInstanceId ? status === 'done' : t.status === 'done'))
        .map((t) => t.templateTaskId),
    );

    // For each task, check if it should be unblocked
    const shouldUnblock = (task: TaskInstance): boolean => {
      if (task.id === taskInstanceId) return false;
      if (task.status !== 'blocked') return false;
      // Find milestone to check if it's active
      const milestone = board.milestones.find((m) => m.id === task.milestoneInstanceId);
      if (!milestone || milestone.status !== 'active') return false;
      // Find the template task to get blockedBy ids
      const template = TEMPLATES[board.templateId];
      const templateTask = template?.milestones
        .flatMap((m) => m.tasks)
        .find((t) => t.id === task.templateTaskId);
      if (!templateTask || templateTask.blockedBy.length === 0) return false;
      return templateTask.blockedBy.every((depId) => doneTemplateIds.has(depId));
    };

    const updatedMilestones = board.milestones.map((m) => ({
      ...m,
      tasks: m.tasks.map((t) => {
        if (t.id === taskInstanceId) {
          return {
            ...t,
            status,
            startedAt: status === 'in_progress' && !t.startedAt ? new Date().toISOString() : t.startedAt,
            completedAt: status === 'done' ? new Date().toISOString() : t.completedAt,
          };
        }
        if (shouldUnblock(t)) return { ...t, status: 'todo' as TaskStatus };
        return t;
      }),
    }));

    // Log activity for the status change
    const withLog = appendActivity(updatedMilestones, taskInstanceId, 'status_change', {
      from: board.milestones.flatMap((m) => m.tasks).find((t) => t.id === taskInstanceId)?.status ?? '',
      to: status,
    });
    set({ board: { ...board, milestones: withLog } });
  },

  completeCurrentMilestone() {
    const { board } = get();
    if (!board) return;
    const now = new Date().toISOString();

    const activeIdx = board.milestones.findIndex((m) => m.id === board.activeMilestoneId);
    if (activeIdx === -1) return;
    const nextIdx = activeIdx + 1;
    const hasNext = nextIdx < board.milestones.length;

    const template = TEMPLATES[board.templateId];

    const updatedMilestones = board.milestones.map((m, idx) => {
      if (idx === activeIdx) return { ...m, status: 'completed' as const, completedAt: now };
      if (idx === nextIdx) {
        const tasks = m.tasks.map((t) => {
          const templateTask = template?.milestones
            .flatMap((mt) => mt.tasks)
            .find((tt) => tt.id === t.templateTaskId);
          const isUnblocked = !templateTask || templateTask.blockedBy.length === 0;
          return { ...t, status: (isUnblocked ? 'todo' : 'blocked') as TaskStatus };
        });
        return { ...m, status: 'active' as const, tasks, unlockedAt: now };
      }
      return m;
    });

    set({
      board: {
        ...board,
        milestones: updatedMilestones,
        activeMilestoneId: hasNext ? board.milestones[nextIdx].id : null,
      },
    });
  },

  assignTask(taskInstanceId, userId) {
    const { board } = get();
    if (!board) return;
    const milestones = mapTask(board.milestones, taskInstanceId, (t) => ({
      ...t,
      assigneeIds: t.assigneeIds.includes(userId) ? t.assigneeIds : [...t.assigneeIds, userId],
    }));
    set({ board: { ...board, milestones } });
  },

  addAIOutput(taskInstanceId, output) {
    const { board } = get();
    if (!board) return;
    const milestones = mapTask(board.milestones, taskInstanceId, (t) => ({
      ...t,
      aiOutputs: [...t.aiOutputs, output],
    }));
    set({ board: { ...board, milestones } });
  },

  updateTaskNotes(taskInstanceId, notes) {
    const { board } = get();
    if (!board) return;
    const milestones = mapTask(board.milestones, taskInstanceId, (t) => ({ ...t, notes }));
    set({ board: { ...board, milestones } });
  },

  setTaskOverride(taskInstanceId, patch) {
    const { board } = get();
    if (!board) return;
    const milestones = mapTask(board.milestones, taskInstanceId, (t) => ({
      ...t,
      overrides: { ...(t.overrides ?? {}), ...patch },
    }));
    set({ board: { ...board, milestones } });
  },

  clearTaskOverride(taskInstanceId, field) {
    const { board } = get();
    if (!board) return;
    const milestones = mapTask(board.milestones, taskInstanceId, (t) => {
      if (!t.overrides) return t;
      const next = { ...t.overrides };
      delete next[field];
      return { ...t, overrides: Object.keys(next).length > 0 ? next : undefined };
    });
    set({ board: { ...board, milestones } });
  },

  unassignTask(taskInstanceId, userId) {
    const { board } = get();
    if (!board) return;
    let milestones = mapTask(board.milestones, taskInstanceId, (t) => ({
      ...t,
      assigneeIds: t.assigneeIds.filter((id) => id !== userId),
    }));
    milestones = appendActivity(milestones, taskInstanceId, 'assignee_removed', { userId });
    set({ board: { ...board, milestones } });
  },

  setTaskAssignees(taskInstanceId, assigneeIds) {
    const { board } = get();
    if (!board) return;
    const milestones = mapTask(board.milestones, taskInstanceId, (t) => ({
      ...t,
      assigneeIds,
    }));
    set({ board: { ...board, milestones } });
  },

  setTaskDueDate(taskInstanceId, dueDate) {
    const { board } = get();
    if (!board) return;
    let milestones = mapTask(board.milestones, taskInstanceId, (t) => ({ ...t, dueDate }));
    milestones = appendActivity(milestones, taskInstanceId, 'due_date_set', {
      date: dueDate ?? 'cleared',
    });
    set({ board: { ...board, milestones } });
  },

  addComment(taskInstanceId, comment) {
    const { board } = get();
    if (!board) return;
    let milestones = mapTask(board.milestones, taskInstanceId, (t) => ({
      ...t,
      comments: [...t.comments, comment],
    }));
    milestones = appendActivity(milestones, taskInstanceId, 'comment_added', {
      commentId: comment.id,
      authorId: comment.authorId,
    });
    set({ board: { ...board, milestones } });
  },

  deleteComment(taskInstanceId, commentId) {
    const { board } = get();
    if (!board) return;
    let milestones = mapTask(board.milestones, taskInstanceId, (t) => ({
      ...t,
      comments: t.comments.filter((c) => c.id !== commentId),
    }));
    milestones = appendActivity(milestones, taskInstanceId, 'comment_deleted', { commentId });
    set({ board: { ...board, milestones } });
  },

  addAttachment(taskInstanceId, attachment) {
    const { board } = get();
    if (!board) return;
    let milestones = mapTask(board.milestones, taskInstanceId, (t) => ({
      ...t,
      attachments: [...t.attachments, attachment],
    }));
    milestones = appendActivity(milestones, taskInstanceId, 'attachment_added', {
      attachmentId: attachment.id,
      type: attachment.type,
      title: attachment.title,
    });
    set({ board: { ...board, milestones } });
  },

  removeAttachment(taskInstanceId, attachmentId) {
    const { board } = get();
    if (!board) return;
    let milestones = mapTask(board.milestones, taskInstanceId, (t) => ({
      ...t,
      attachments: t.attachments.filter((a) => a.id !== attachmentId),
    }));
    milestones = appendActivity(milestones, taskInstanceId, 'attachment_removed', { attachmentId });
    set({ board: { ...board, milestones } });
  },

  updateTaskDescriptionBlocks(taskInstanceId, blocks) {
    const { board } = get();
    if (!board) return;
    const milestones = mapTask(board.milestones, taskInstanceId, (t) => ({
      ...t,
      descriptionBlocks: blocks,
    }));
    set({ board: { ...board, milestones } });
  },

  updateTaskDeliverableBlocks(taskInstanceId, blocks) {
    const { board } = get();
    if (!board) return;
    const milestones = mapTask(board.milestones, taskInstanceId, (t) => ({
      ...t,
      deliverableBlocks: blocks,
    }));
    set({ board: { ...board, milestones } });
  },

  updateTaskNoteBlocks(taskInstanceId, blocks) {
    const { board } = get();
    if (!board) return;
    const milestones = mapTask(board.milestones, taskInstanceId, (t) => ({
      ...t,
      noteBlocks: blocks,
    }));
    set({ board: { ...board, milestones } });
  },

  clearBoard() {
    set({ board: null });
  },
}), {
  name: 'problocks-project-board-v1',
  // Persist the core board + team. Skip any ephemeral state. Without this,
  // refreshing the studio would reset `board` to null and the wizard would
  // fire again, which is exactly the behavior we want to eliminate.
  partialize: (state) => ({
    board: state.board,
    teamMembers: state.teamMembers,
  }),
}));
