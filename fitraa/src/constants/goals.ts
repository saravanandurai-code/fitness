import type { GoalId } from '../types'

export const GOALS: { id: GoalId; label: string; blurb: string; emoji: string }[] = [
  { id: 'strength', label: 'Build strength', blurb: 'Train hard, lift more, stay consistent.', emoji: '🏋️' },
  { id: 'fat-loss', label: 'Lose fat', blurb: 'Move daily, eat well, stay patient.', emoji: '🔥' },
  { id: 'endurance', label: 'Improve endurance', blurb: 'Go further every week.', emoji: '🏃' },
  { id: 'active', label: 'Stay active', blurb: 'Keep moving, whatever the week looks like.', emoji: '⚡' },
  { id: 'custom', label: 'Custom', blurb: 'Set your own commitment.', emoji: '✍️' },
]

export const GOAL_LABELS: Record<GoalId, string> = GOALS.reduce(
  (acc, goal) => ({ ...acc, [goal.id]: goal.label }),
  {} as Record<GoalId, string>,
)

export const JOURNEY_DURATION = 30

export const DEFAULT_ROUTINE = {
  waterTarget: 3,
  workoutDays: 5,
  sleepTarget: 8,
  nutritionPlan: 'High protein',
} as const

export const NUTRITION_PLANS = [
  'High protein',
  'Balanced',
  'Low carb',
  'Plant based',
  'Maintenance',
]
