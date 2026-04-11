import type { Template } from '../types'
import {
  conceptMilestone,
  preProductionMilestone,
  verticalSliceMilestone,
} from './studio/milestones-early'
import {
  alphaMilestone,
  betaMilestone,
} from './studio/milestones-mid'
import {
  goldMilestone,
  postLaunchMilestone,
} from './studio/milestones-late'

export const studio: Template = {
  id: 'studio',
  name: 'Studio',
  tagline: 'Professional pipeline from concept to live game',
  icon: '🏢',
  methodology: 'GDLC',
  teamSize: { min: 4, max: 8 },
  duration: { min: 1, max: 6, unit: 'months' },
  milestones: [
    conceptMilestone,
    preProductionMilestone,
    verticalSliceMilestone,
    alphaMilestone,
    betaMilestone,
    goldMilestone,
    postLaunchMilestone,
  ],
}
