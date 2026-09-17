import { describe, expect, it } from 'vitest'
import {
  dayProgress,
  isWorkoutRequired,
  weekStart,
  workoutsInWeek,
} from '../daily-log/progress'
import { journey, log, routine, START } from './helpers'

describe('dayProgress', () => {
  it('reports an untouched day as empty', () => {
    const progress = dayProgress([], routine, START)
    expect(progress.completion).toBe(0)
    expect(progress.isComplete).toBe(false)
    expect(progress.tasks.water.done).toBe(false)
  })

  it('reaches 100% when every target is met', () => {
    const progress = dayProgress([log(START)], routine, START)
    expect(progress.completion).toBe(1)
    expect(progress.isComplete).toBe(true)
  })

  it('caps partial measures at their target', () => {
    const progress = dayProgress(
      [log(START, { waterAmount: 6, sleepHours: 12 })],
      routine,
      START,
    )
    expect(progress.tasks.water.ratio).toBe(1)
    expect(progress.tasks.sleep.ratio).toBe(1)
  })

  it('averages the four tasks', () => {
    // Water half done, workout done, nutrition done, sleep 4/8.
    const progress = dayProgress(
      [log(START, { waterAmount: 1.5, sleepHours: 4 })],
      routine,
      START,
    )
    expect(progress.completion).toBeCloseTo((0.5 + 1 + 1 + 0.5) / 4)
    expect(progress.isComplete).toBe(false)
  })
})

describe('weekly workout quota', () => {
  it('starts the week on Monday', () => {
    expect(weekStart('2026-09-13')).toBe('2026-09-07') // Sunday -> previous Monday
    expect(weekStart('2026-09-07')).toBe('2026-09-07')
  })

  it('counts only workouts inside the same week', () => {
    const logs = [
      log('2026-09-07'),
      log('2026-09-08'),
      log('2026-09-14'), // next week
    ]
    expect(workoutsInWeek(logs, '2026-09-07')).toBe(2)
    expect(workoutsInWeek(logs, '2026-09-14')).toBe(1)
  })

  it('turns the remaining days into rest days once the quota is met', () => {
    const logs = [
      log('2026-09-07'),
      log('2026-09-08'),
      log('2026-09-09'),
      log('2026-09-10'),
      log('2026-09-11'),
    ]
    // Five workouts done Mon–Fri, so Saturday owes nothing.
    expect(isWorkoutRequired(logs, routine, '2026-09-12')).toBe(false)

    const saturday = dayProgress(
      [...logs, log('2026-09-12', { workoutCompleted: false })],
      routine,
      '2026-09-12',
    )
    expect(saturday.tasks.workout.ratio).toBe(1)
    expect(saturday.tasks.workout.done).toBe(false)
    expect(saturday.isComplete).toBe(true)
  })

  it('still expects a workout when the quota is not met', () => {
    const logs = [log('2026-09-07'), log('2026-09-08')]
    expect(isWorkoutRequired(logs, routine, '2026-09-09')).toBe(true)
    const day = dayProgress(
      [...logs, log('2026-09-09', { workoutCompleted: false })],
      routine,
      '2026-09-09',
    )
    expect(day.isComplete).toBe(false)
  })
})

describe('journey shape', () => {
  it('runs for 30 days', () => {
    expect(journey.duration).toBe(30)
  })
})
