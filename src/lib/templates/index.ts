import type { Template, TemplateId, OnboardingAnswers } from './types'
import { gameJam } from './data/game-jam'
import { soloIndie } from './data/solo-indie'
import { classroomSprint } from './data/classroom-sprint'
import { studio } from './data/studio'

// ─── Registry ─────────────────────────────────────────────────────────────────

export const TEMPLATES: Record<TemplateId, Template> = {
  'game-jam': gameJam,
  'solo-indie': soloIndie,
  'classroom-sprint': classroomSprint,
  'studio': studio,
}

// ─── Accessors ────────────────────────────────────────────────────────────────

export function getAllTemplates(): Template[] {
  return Object.values(TEMPLATES)
}

export function getTemplate(id: TemplateId): Template {
  return TEMPLATES[id]
}

// ─── Recommendation ───────────────────────────────────────────────────────────

/**
 * Routes onboarding answers to the most appropriate template.
 * Duration and team size are the primary signals; genre is a tiebreaker hint.
 *
 * Routing table:
 *   durationDays <= 7                        → game-jam
 *   teamSize === 1 AND durationDays <= 30    → solo-indie
 *   teamSize <= 3 AND durationDays <= 112    → classroom-sprint  (up to 16 weeks)
 *   durationDays >= 90 OR teamSize >= 4      → studio
 *   fallback                                 → classroom-sprint
 */
export function recommendTemplate(answers: OnboardingAnswers): TemplateId {
  const { durationDays, teamSize } = answers

  if (durationDays <= 7) {
    return 'game-jam'
  }

  if (teamSize === 1 && durationDays <= 30) {
    return 'solo-indie'
  }

  if (teamSize <= 3 && durationDays <= 112) {
    return 'classroom-sprint'
  }

  if (durationDays >= 90 || teamSize >= 4) {
    return 'studio'
  }

  return 'classroom-sprint'
}

// ─── Re-exports ───────────────────────────────────────────────────────────────

export type { Template, TemplateId, OnboardingAnswers } from './types'
export { gameJam, soloIndie, classroomSprint, studio }
