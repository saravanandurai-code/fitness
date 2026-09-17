import type { DailyLog, Journey, Routine } from '../../types'

export const START = '2026-09-07' // a Monday

export const routine: Routine = {
  id: 'routine',
  journeyId: 'journey',
  waterTarget: 3,
  workoutDays: 5,
  sleepTarget: 8,
  nutritionPlan: 'High protein',
}

export const journey: Journey = {
  id: 'journey',
  userId: 'user',
  goal: 'strength',
  goalLabel: 'Build strength',
  startDate: START,
  duration: 30,
  status: 'active',
}

/** A log with everything met; override fields to make it partial. */
export function log(date: string, overrides: Partial<DailyLog> = {}): DailyLog {
  return {
    id: `journey:${date}`,
    journeyId: 'journey',
    date,
    waterAmount: 3,
    workoutCompleted: true,
    nutritionCompleted: true,
    sleepHours: 8,
    completedAt: `${date}T21:00:00.000Z`,
    ...overrides,
  }
}
