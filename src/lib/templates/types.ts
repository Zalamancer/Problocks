export type AITool = 'claude' | 'pixellab' | 'meshy' | 'suno' | 'elevenlabs' | 'freepik'

export type TeamRole = 'designer' | 'artist' | 'programmer' | 'audio' | 'producer' | 'any'

export type TaskStatus = 'blocked' | 'todo' | 'in_progress' | 'review' | 'done'

export type MilestoneStatus = 'locked' | 'active' | 'completed'

export type TemplateId = 'game-jam' | 'solo-indie' | 'classroom-sprint' | 'studio'

export type GameGenre = 'platformer' | 'rpg' | 'puzzle' | 'shooter' | 'other'

// ─── Template (static blueprint) ──────────────────────────────────────────────

export interface TaskTemplate {
  id: string
  milestoneId: string
  title: string
  description: string
  role: TeamRole
  aiTools: AITool[]
  deliverable: string
  blockedBy: string[]       // task IDs within this template
  estimatedHours: number
  tip: string               // shown in "What is this?" panel
  exampleFromIndustry?: string
}

export interface MilestoneTemplate {
  id: string
  name: string
  order: number
  color: string             // hex — timeline segment + node accent
  description: string       // 1 sentence, shown on hover
  brief: [string, string, string]  // exactly 3 bullets shown at stage entry
  deliverable: string       // what must exist to exit this milestone
  industryNote?: string
  tasks: TaskTemplate[]
}

export interface Template {
  id: TemplateId
  name: string
  tagline: string
  icon: string
  methodology: string       // hidden metadata label
  teamSize: { min: number; max: number }
  duration: { min: number; max: number; unit: 'days' | 'weeks' | 'months' }
  milestones: MilestoneTemplate[]
}

// ─── ProjectBoard (live instance) ─────────────────────────────────────────────

export interface AIOutput {
  tool: AITool
  assetId: string
  generatedAt: string       // ISO date string
}

// ─── Team members ────────────────────────────────────────────────────────────

export interface TeamMember {
  id: string
  name: string
  avatarUrl?: string
  role: TeamRole
}

// ─── Comments ────────────────────────────────────────────────────────────────

export interface Comment {
  id: string
  authorId: string
  body: string
  createdAt: string          // ISO date string
  parentId?: string          // enables one-level threading
}

// ─── Activity log ────────────────────────────────────────────────────────────

export type ActivityEntryType =
  | 'status_change'
  | 'field_edit'
  | 'comment_added'
  | 'comment_deleted'
  | 'attachment_added'
  | 'attachment_removed'
  | 'assignee_added'
  | 'assignee_removed'
  | 'due_date_set'

export interface ActivityEntry {
  id: string
  type: ActivityEntryType
  authorId: string
  timestamp: string          // ISO date string
  details: Record<string, string>
}

// ─── Resource attachments ────────────────────────────────────────────────────

export type ResourceType = 'youtube' | 'article' | 'note' | 'pdf' | 'file'

export interface ResourceAttachment {
  id: string
  type: ResourceType
  url: string
  title: string
  description?: string
  addedAt: string            // ISO date string
  addedBy: string            // authorId
}

/** Per-instance overrides of static TaskTemplate fields. Every field is
 *  optional — an unset field falls back to the template's default. The
 *  template is never mutated; all edits land here so other boards using
 *  the same template are unaffected. */
export interface TaskOverrides {
  title?: string
  description?: string
  deliverable?: string
  role?: TeamRole
  aiTools?: AITool[]
  estimatedHours?: number
  tip?: string
  exampleFromIndustry?: string
}

export interface TaskInstance {
  id: string
  templateTaskId: string
  milestoneInstanceId: string
  status: TaskStatus
  assigneeIds: string[]
  notes: string
  aiOutputs: AIOutput[]
  /** Per-instance field overrides on top of the static template. */
  overrides?: TaskOverrides
  dueDate?: string                   // ISO date string (date-only "2026-05-01")
  comments: Comment[]
  activityLog: ActivityEntry[]
  attachments: ResourceAttachment[]
  /** BlockNote block array for rich-text description. When set, takes
   *  precedence over the plain-text overrides.description / template.description. */
  descriptionBlocks?: unknown[]
  /** BlockNote block array for the Notes section. */
  noteBlocks?: unknown[]
  startedAt?: string
  completedAt?: string
}

/** Merged view of a task: template defaults + instance overrides. Always use
 *  this when reading display fields so both kanban cards and the right panel
 *  stay in sync. */
export interface EffectiveTask {
  id: string
  title: string
  description: string
  deliverable: string
  role: TeamRole
  aiTools: AITool[]
  estimatedHours: number
  tip: string
  exampleFromIndustry?: string
  blockedBy: string[]
}

export function resolveEffectiveTask(
  template: TaskTemplate,
  overrides?: TaskOverrides,
): EffectiveTask {
  return {
    id: template.id,
    title:               overrides?.title               ?? template.title,
    description:         overrides?.description         ?? template.description,
    deliverable:         overrides?.deliverable         ?? template.deliverable,
    role:                overrides?.role                ?? template.role,
    aiTools:             overrides?.aiTools             ?? template.aiTools,
    estimatedHours:      overrides?.estimatedHours      ?? template.estimatedHours,
    tip:                 overrides?.tip                 ?? template.tip,
    exampleFromIndustry: overrides?.exampleFromIndustry ?? template.exampleFromIndustry,
    blockedBy:           template.blockedBy,
  }
}

export interface MilestoneInstance {
  id: string
  templateMilestoneId: string
  status: MilestoneStatus
  tasks: TaskInstance[]
  unlockedAt?: string
  completedAt?: string
}

export interface ProjectBoard {
  id: string
  projectId: string
  templateId: TemplateId
  createdAt: string
  activeMilestoneId: string | null
  milestones: MilestoneInstance[]
}

// ─── Onboarding ───────────────────────────────────────────────────────────────

export interface OnboardingAnswers {
  genre: GameGenre
  durationDays: number
  teamSize: number
}
