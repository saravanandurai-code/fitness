import { addDays, weekdayIndex } from '../../lib/utils/date'
import type { DailyLog, Routine, TaskId } from '../../types'

export interface TaskProgress {
  id: TaskId
  /** 0–1, capped. */
  ratio: number
  done: boolean
  /**
   * False for the workout task once the week's quota is already met, so a rest
   * day never counts against the user.
   */
  required: boolean
}

export interface DayProgress {
  date: string
  tasks: Record<TaskId, TaskProgress>
  /** 0–1 across the four tasks. */
  completion: number
  /** True when every required task for the day is done. */
  isComplete: boolean
}

export function emptyLog(journeyId: string, date: string): DailyLog {
  return {
    id: `${journeyId}:${date}`,
    journeyId,
    date,
    waterAmount: 0,
    workoutCompleted: false,
    nutritionCompleted: false,
    sleepHours: null,
    completedAt: null,
  }
}

export function findLog(logs: DailyLog[], date: string): DailyLog | undefined {
  return logs.find((log) => log.date === date)
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n))

/** Monday-based start of the week containing `date`. */
export function weekStart(date: string): string {
  return addDays(date, -weekdayIndex(date))
}

/** Workouts completed in the calendar week containing `date`. */
export function workoutsInWeek(logs: DailyLog[], date: string): number {
  const start = weekStart(date)
  const end = addDays(start, 6)
  return logs.filter((log) => log.date >= start && log.date <= end && log.workoutCompleted).length
}

/**
 * Whether a workout is still owed this week. Completing the weekly quota turns
 * the remaining days into rest days rather than misses.
 */
export function isWorkoutRequired(logs: DailyLog[], routine: Routine, date: string): boolean {
  const log = findLog(logs, date)
  if (log?.workoutCompleted) return true
  const others = logs.filter((entry) => entry.date !== date)
  return workoutsInWeek(others, date) < routine.workoutDays
}

export function dayProgress(logs: DailyLog[], routine: Routine, date: string): DayProgress {
  const log = findLog(logs, date)
  const workoutRequired = isWorkoutRequired(logs, routine, date)

  const water: TaskProgress = {
    id: 'water',
    ratio: clamp01((log?.waterAmount ?? 0) / Math.max(0.1, routine.waterTarget)),
    done: (log?.waterAmount ?? 0) >= routine.waterTarget,
    required: true,
  }

  const workout: TaskProgress = {
    id: 'workout',
    ratio: log?.workoutCompleted ? 1 : workoutRequired ? 0 : 1,
    done: Boolean(log?.workoutCompleted),
    required: workoutRequired,
  }

  const nutrition: TaskProgress = {
    id: 'nutrition',
    ratio: log?.nutritionCompleted ? 1 : 0,
    done: Boolean(log?.nutritionCompleted),
    required: true,
  }

  const sleep: TaskProgress = {
    id: 'sleep',
    ratio: clamp01((log?.sleepHours ?? 0) / Math.max(0.1, routine.sleepTarget)),
    done: (log?.sleepHours ?? 0) >= routine.sleepTarget,
    required: true,
  }

  const tasks = { water, workout, nutrition, sleep }
  const values = Object.values(tasks)
  const completion = values.reduce((sum, task) => sum + task.ratio, 0) / values.length
  const isComplete = values.every((task) => task.done || !task.required)

  return { date, tasks, completion, isComplete }
}

export function isDayComplete(logs: DailyLog[], routine: Routine, date: string): boolean {
  return dayProgress(logs, routine, date).isComplete
}
