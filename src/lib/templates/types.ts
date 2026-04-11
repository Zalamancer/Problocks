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

export interface TaskInstance {
  id: string
  templateTaskId: string
  milestoneInstanceId: string
  status: TaskStatus
  assigneeIds: string[]
  notes: string
  aiOutputs: AIOutput[]
  startedAt?: string
  completedAt?: string
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
