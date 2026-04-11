# Project Template Data Model

Two-layer design: **Template** (static blueprint) and **ProjectBoard** (live instance).
A template is never mutated. When a student starts a project, it's instantiated into a ProjectBoard.

---

## Layer 1 — Template (blueprint)

```typescript
// The selectable preset shown in the onboarding wizard
interface Template {
  id: string
  name: string              // "Game Jam" — student-facing, no jargon
  tagline: string           // "Ship fast, learn by doing"
  icon: string              // emoji
  methodology: string       // hidden metadata: "RAD" | "Scrum" | "GDLC" | "Kanban"
  teamSize: Range           // { min: 1, max: 4 }
  duration: DurationRange   // { min: 2, max: 7, unit: 'days' }
  stageCount: number        // shown as ■■■□□ on picker card
  milestones: MilestoneTemplate[]
}

interface Range {
  min: number
  max: number
}

interface DurationRange extends Range {
  unit: 'days' | 'weeks' | 'months'
}
```

---

## Milestone (a stage in the timeline bar)

```typescript
interface MilestoneTemplate {
  id: string
  name: string              // "Concept", "Pre-Production", "Build"
  order: number             // position in timeline
  color: string             // hex — used for timeline segment + node accent
  description: string       // shown on hover (1 sentence)
  brief: [string, string, string]  // exactly 3 bullets shown at stage entry
                            // e.g. ["Decide your core mechanic",
                            //       "Write a 1-page GDD",
                            //       "Pick your art style"]
  deliverable: string       // "A playable prototype with one level"
  industryNote?: string     // "Epic spent 6 months here before writing a line of code"
  tasks: TaskTemplate[]
}
```

---

## Task (a node on the canvas / a card on the kanban)

```typescript
interface TaskTemplate {
  id: string
  milestoneId: string
  title: string             // "Write Game Design Document"
  description: string       // 1-2 sentences, plain language
  role: TeamRole            // who typically owns this
  aiTools: AITool[]         // badge icons shown on the card
  deliverable: string       // concrete output: "1-page GDD with mechanics list"
  blockedBy: string[]       // task IDs — drives dependency edges on canvas
  estimatedHours: number    // used for scheduling, shown as effort indicator
  tip: string               // "What is this?" button content — plain explanation
  exampleFromIndustry?: string  // optional real studio example
}

type TeamRole =
  | 'designer'
  | 'artist'
  | 'programmer'
  | 'audio'
  | 'producer'
  | 'any'           // anyone on team can do it

type AITool =
  | 'claude'        // code, logic, narrative
  | 'pixellab'      // 2D sprites, pixel art
  | 'meshy'         // 3D models
  | 'suno'          // background music
  | 'elevenlabs'    // voice, SFX
  | 'freepik'       // stock art, textures
```

---

## Layer 2 — ProjectBoard (live instance)

```typescript
// Created when a student starts a project from a template
interface ProjectBoard {
  id: string
  projectId: string
  templateId: string
  createdAt: Date
  milestones: MilestoneInstance[]
}

interface MilestoneInstance {
  id: string
  templateMilestoneId: string
  status: MilestoneStatus
  unlockedAt?: Date
  completedAt?: Date
  tasks: TaskInstance[]
}

type MilestoneStatus = 'locked' | 'active' | 'completed'

interface TaskInstance {
  id: string
  templateTaskId: string
  milestoneInstanceId: string
  status: TaskStatus
  assigneeIds: string[]     // team member user IDs
  notes?: string
  aiOutputs: AIOutput[]     // assets generated for this task
  startedAt?: Date
  completedAt?: Date
}

type TaskStatus = 'blocked' | 'todo' | 'in_progress' | 'review' | 'done'

interface AIOutput {
  tool: AITool
  assetId: string           // reference to generated asset in AssetsPanel
  generatedAt: Date
}
```

---

## Onboarding routing

```typescript
interface OnboardingAnswers {
  genre: 'platformer' | 'rpg' | 'puzzle' | 'shooter' | 'other'
  durationDays: number      // slider value
  teamSize: number
}

// Primary routing logic — duration + team size drive the recommendation
function recommendTemplate(answers: OnboardingAnswers): string {
  const { durationDays, teamSize } = answers
  if (durationDays <= 7)                          return 'game-jam'
  if (teamSize === 1 && durationDays <= 30)       return 'solo-indie'
  if (teamSize <= 3 && durationDays <= 30)        return 'classroom-sprint'
  if (durationDays >= 90 || teamSize >= 4)        return 'studio'
  return 'classroom-sprint'                       // safe default
}
```

---

## The 4 templates

### `game-jam` — Game Jam
- Team: 1–4 | Duration: 2–7 days | Stages: 3
- Based on: RAD / Fast Loop
- Milestones: **Concept → Build → Ship**

### `solo-indie` — Solo Dev
- Team: 1 | Duration: 1–4 weeks | Stages: 4
- Based on: Shape Up (solo)
- Milestones: **Idea → Design → Build → Launch**

### `classroom-sprint` — Classroom Sprint
- Team: 2–4 | Duration: 4–16 weeks | Stages: 5
- Based on: Scrum / Game Sprint preset
- Milestones: **Concept → GDD → Prototype → Production → Ship**

### `studio` — Studio
- Team: 4–8 | Duration: 1–6 months | Stages: 7
- Based on: Full GDLC (Novak)
- Milestones: **Concept → Pre-Production → Prototype → Alpha → Beta → Gold → Post-Launch**

---

## Example: `classroom-sprint` template (abbreviated)

```typescript
const classroomSprint: Template = {
  id: 'classroom-sprint',
  name: 'Classroom Sprint',
  tagline: 'Learn pro process while building your game',
  icon: '🎓',
  methodology: 'Scrum',
  teamSize: { min: 2, max: 4 },
  duration: { min: 4, max: 16, unit: 'weeks' },
  stageCount: 5,
  milestones: [
    {
      id: 'concept',
      name: 'Concept',
      order: 0,
      color: '#8b5cf6',
      description: 'Define what your game is before building anything.',
      brief: [
        'Agree on your core mechanic — the one thing that makes your game fun',
        'Choose your genre, art style, and target player',
        'Write a 1-page pitch that everyone on the team can explain',
      ],
      deliverable: '1-page Game Concept document',
      industryNote: 'Naughty Dog pitches games in one sentence before writing any code.',
      tasks: [
        {
          id: 'brainstorm',
          milestoneId: 'concept',
          title: 'Brainstorm game ideas',
          description: 'Generate 5+ game ideas as a team. Pick the most fun one.',
          role: 'any',
          aiTools: ['claude'],
          deliverable: 'A list of 5 ideas with one chosen',
          blockedBy: [],
          estimatedHours: 2,
          tip: 'Write down every idea without judging them first. Quantity over quality in this step.',
          exampleFromIndustry: 'The idea for Among Us was picked from a list of rejected concepts.',
        },
        {
          id: 'write-concept-doc',
          milestoneId: 'concept',
          title: 'Write Concept Document',
          description: 'A 1-page doc: what is the game, who plays it, what makes it fun.',
          role: 'designer',
          aiTools: ['claude'],
          deliverable: '1-page Concept Document',
          blockedBy: ['brainstorm'],
          estimatedHours: 3,
          tip: 'A concept doc answers 3 questions: What do you do? Why is it fun? Who is it for?',
        },
      ],
    },
    {
      id: 'gdd',
      name: 'Design',
      order: 1,
      color: '#ec4899',
      description: 'Turn your concept into a detailed game design.',
      brief: [
        'Write your Game Design Document — the blueprint for everything',
        'Define all mechanics, levels, characters, and win/lose conditions',
        'Create mood boards and reference art for your visual style',
      ],
      deliverable: 'Game Design Document + Art Style Guide',
      tasks: [
        {
          id: 'write-gdd',
          milestoneId: 'gdd',
          title: 'Write Game Design Document',
          description: 'Full GDD: mechanics, levels, characters, UI, audio direction.',
          role: 'designer',
          aiTools: ['claude'],
          deliverable: 'GDD document',
          blockedBy: ['write-concept-doc'],
          estimatedHours: 8,
          tip: 'A GDD is a living document — it will change. Write enough to start building, not a novel.',
          exampleFromIndustry: 'Minecraft\'s original GDD was 4 pages. It grew to hundreds as the game did.',
        },
        {
          id: 'mood-board',
          milestoneId: 'gdd',
          title: 'Create art mood board',
          description: 'Collect reference images that define your visual style.',
          role: 'artist',
          aiTools: ['freepik', 'pixellab'],
          deliverable: 'Mood board with 10+ reference images',
          blockedBy: ['write-concept-doc'],
          estimatedHours: 3,
          tip: 'Find 3 games with art styles you love. Your style will be somewhere between them.',
        },
      ],
    },
    // ... prototype, production, ship milestones follow same pattern
  ],
}
```

---

## Derived views from the same data

The `ProjectBoard` + `Template` data drives three UI views with no extra data:

| View | What it shows |
|------|--------------|
| **Flowchart** | Tasks as nodes, `blockedBy` as directed edges, milestones as groups |
| **Kanban** | Milestones as columns, tasks as cards, status as column position |
| **Timeline** | Milestones as segments on bottom bar, completion % as fill |

Same data, three lenses. Switching views never loses state.
