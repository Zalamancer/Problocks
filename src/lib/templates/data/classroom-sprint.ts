import type { Template } from '../types'
import {
  conceptMilestone,
  designMilestone,
  prototypeMilestone,
} from './classroom-sprint/milestones-early'
import {
  productionMilestone,
  shipMilestone,
} from './classroom-sprint/milestones-late'

export const classroomSprint: Template = {
  id: 'classroom-sprint',
  name: 'Classroom Sprint',
  tagline: 'Learn pro process while building your game',
  icon: '🎓',
  methodology: 'Scrum',
  teamSize: { min: 2, max: 4 },
  duration: { min: 4, max: 16, unit: 'weeks' },
  milestones: [
    conceptMilestone,
    designMilestone,
    prototypeMilestone,
    productionMilestone,
    shipMilestone,
  ],
}
