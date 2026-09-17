import { addDays, journeyDay, journeyDates } from '../../lib/utils/date'
import { dayProgress, isDayComplete } from '../daily-log/progress'
import { currentStreak, longestStreak } from './streak'
import type { DailyLog, Journey, Routine, TaskId } from '../../types'

export interface TaskTally {
  id: TaskId
  done: number
  /** Days on which the task was actually expected. */
  of: number
}

export interface JourneyStats {
  /** 1-based day of the journey, clamped to its length. */
  day: number
  duration: number
  /** Days elapsed with data expected (day number, at least 1). */
  elapsed: number
  completeDays: number
  /** completeDays / elapsed, 0–1. */
  consistency: number
  currentStreak: number
  longestStreak: number
  tallies: Record<TaskId, TaskTally>
  /** Mean daily completion across elapsed days, 0–1. */
  averageCompletion: number
  isFinished: boolean
}

export function journeyStats(
  journey: Journey,
  routine: Routine,
  logs: DailyLog[],
  today: string,
): JourneyStats {
  const day = journeyDay(journey.startDate, journey.duration, today)
  const elapsed = Math.max(1, day)
  const dates = journeyDates(journey.startDate, journey.duration).filter((date) => date <= today)

  const tallies: Record<TaskId, TaskTally> = {
    water: { id: 'water', done: 0, of: 0 },
    workout: { id: 'workout', done: 0, of: 0 },
    nutrition: { id: 'nutrition', done: 0, of: 0 },
    sleep: { id: 'sleep', done: 0, of: 0 },
  }

  let completeDays = 0
  let completionSum = 0

  for (const date of dates) {
    const progress = dayProgress(logs, routine, date)
    completionSum += progress.completion
    if (progress.isComplete) completeDays += 1

    for (const task of Object.values(progress.tasks)) {
      // Rest days are not counted in the denominator for workouts.
      if (task.required) tallies[task.id].of += 1
      if (task.done) tallies[task.id].done += 1
    }
  }

  return {
    day,
    duration: journey.duration,
    elapsed,
    completeDays,
    consistency: dates.length === 0 ? 0 : completeDays / dates.length,
    currentStreak: currentStreak(logs, routine, today, journey.startDate),
    longestStreak: longestStreak(logs, routine, journey.startDate, today),
    tallies,
    averageCompletion: dates.length === 0 ? 0 : completionSum / dates.length,
    isFinished: day >= journey.duration && isDayComplete(logs, routine, today),
  }
}

/** Total litres of water logged across the journey. */
export function totalWater(logs: DailyLog[]): number {
  return logs.reduce((sum, log) => sum + log.waterAmount, 0)
}

export function workoutsCompleted(logs: DailyLog[]): number {
  return logs.filter((log) => log.workoutCompleted).length
}

export function hydrationDays(logs: DailyLog[], routine: Routine): number {
  return logs.filter((log) => log.waterAmount >= routine.waterTarget).length
}

/** Whether the journey's final day has passed. */
export function isJourneyOver(journey: Journey, today: string): boolean {
  return today > addDays(journey.startDate, journey.duration - 1)
}
