import { hydrationDays, journeyStats, workoutsCompleted } from '../journey/stats'
import type { AchievementId, DailyLog, Journey, Routine } from '../../types'

export interface AchievementDefinition {
  id: AchievementId
  title: string
  description: string
  emoji: string
  /** Target used to render "12 / 30 days" style progress. */
  target: number
  unit: string
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'first-day',
    title: 'First Day',
    description: 'Complete every task in a single day.',
    emoji: '🥇',
    target: 1,
    unit: 'day',
  },
  {
    id: 'streak-7',
    title: '7 Day Streak',
    description: 'Seven complete days in a row.',
    emoji: '🔥',
    target: 7,
    unit: 'days',
  },
  {
    id: 'streak-14',
    title: '14 Day Streak',
    description: 'Two full weeks without missing.',
    emoji: '⚡',
    target: 14,
    unit: 'days',
  },
  {
    id: 'journey-30',
    title: '30 Day Warrior',
    description: 'Finish all 30 days of your journey.',
    emoji: '🏆',
    target: 30,
    unit: 'days',
  },
  {
    id: 'workouts-10',
    title: '10 Workouts',
    description: 'Log ten completed workouts.',
    emoji: '🏋️',
    target: 10,
    unit: 'workouts',
  },
  {
    id: 'workouts-20',
    title: '20 Workouts',
    description: 'Log twenty completed workouts.',
    emoji: '💪',
    target: 20,
    unit: 'workouts',
  },
  {
    id: 'hydration-7',
    title: 'Hydration Milestone',
    description: 'Hit your water target on seven days.',
    emoji: '💧',
    target: 7,
    unit: 'days',
  },
]

export interface AchievementState extends AchievementDefinition {
  /** Raw value achieved so far, capped at the target for display. */
  value: number
  /** 0–1. */
  progress: number
  unlocked: boolean
  unlockedAt: string | null
}

/**
 * Achievements are derived from the logs rather than stored as the source of
 * truth, so they can never drift out of sync with the journey.
 */
export function evaluateAchievements(
  journey: Journey,
  routine: Routine,
  logs: DailyLog[],
  today: string,
  unlockedAt: Partial<Record<AchievementId, string>> = {},
): AchievementState[] {
  const stats = journeyStats(journey, routine, logs, today)
  const workouts = workoutsCompleted(logs)
  const hydration = hydrationDays(logs, routine)

  const values: Record<AchievementId, number> = {
    'first-day': Math.min(1, stats.completeDays),
    'streak-7': stats.longestStreak,
    'streak-14': stats.longestStreak,
    'journey-30': stats.completeDays,
    'workouts-10': workouts,
    'workouts-20': workouts,
    'hydration-7': hydration,
  }

  return ACHIEVEMENTS.map((definition) => {
    const value = values[definition.id]
    const unlocked = value >= definition.target
    return {
      ...definition,
      value: Math.min(value, definition.target),
      progress: Math.max(0, Math.min(1, value / definition.target)),
      unlocked,
      unlockedAt: unlocked ? (unlockedAt[definition.id] ?? today) : null,
    }
  })
}

export function newlyUnlocked(
  before: AchievementState[],
  after: AchievementState[],
): AchievementState[] {
  const wasUnlocked = new Set(before.filter((a) => a.unlocked).map((a) => a.id))
  return after.filter((a) => a.unlocked && !wasUnlocked.has(a.id))
}
