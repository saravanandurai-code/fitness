import { describe, expect, it } from 'vitest'
import { currentStreak, longestStreak } from '../journey/streak'
import { journeyStats } from '../journey/stats'
import { evaluateAchievements } from '../achievements/definitions'
import { journey, log, routine, START } from './helpers'

const day = (offset: number) => {
  const date = new Date(2026, 8, 7 + offset) // 2026-09-07 + offset
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`
}

describe('currentStreak', () => {
  it('is zero with nothing logged', () => {
    expect(currentStreak([], routine, day(3), START)).toBe(0)
  })

  it('counts consecutive complete days ending today', () => {
    const logs = [log(day(0)), log(day(1)), log(day(2))]
    expect(currentStreak(logs, routine, day(2), START)).toBe(3)
  })

  it('survives an in-progress today by counting up to yesterday', () => {
    const logs = [log(day(0)), log(day(1)), log(day(2), { waterAmount: 0.5 })]
    expect(currentStreak(logs, routine, day(2), START)).toBe(2)
  })

  it('stops at a missed day', () => {
    const logs = [log(day(0)), log(day(2)), log(day(3))]
    expect(currentStreak(logs, routine, day(3), START)).toBe(2)
  })

  it('never looks back past the journey start', () => {
    const logs = [log(START)]
    expect(currentStreak(logs, routine, START, START)).toBe(1)
  })
})

describe('longestStreak', () => {
  it('finds the best run anywhere in the journey', () => {
    const logs = [
      log(day(0)),
      log(day(1)),
      log(day(2)),
      // day 3 missed
      log(day(4)),
      log(day(5)),
    ]
    expect(longestStreak(logs, routine, START, day(5))).toBe(3)
  })
})

describe('journeyStats', () => {
  it('counts consistency against elapsed days only', () => {
    const logs = [log(day(0)), log(day(1)), log(day(2), { nutritionCompleted: false })]
    const stats = journeyStats(journey, routine, logs, day(2))

    expect(stats.day).toBe(3)
    expect(stats.completeDays).toBe(2)
    expect(stats.consistency).toBeCloseTo(2 / 3)
    expect(stats.duration).toBe(30)
  })

  it('excludes rest days from the workout tally denominator', () => {
    // Five workouts Mon–Fri means Sat and Sun owe nothing.
    const logs = [0, 1, 2, 3, 4, 5, 6].map((offset) =>
      log(day(offset), { workoutCompleted: offset < 5 }),
    )
    const stats = journeyStats(journey, routine, logs, day(6))

    expect(stats.tallies.workout.done).toBe(5)
    expect(stats.tallies.workout.of).toBe(5)
    expect(stats.tallies.water.of).toBe(7)
  })

  it('clamps the day number to the journey length', () => {
    const stats = journeyStats(journey, routine, [], day(45))
    expect(stats.day).toBe(30)
  })
})

describe('evaluateAchievements', () => {
  it('unlocks the first day and reports progress on the rest', () => {
    const achievements = evaluateAchievements(journey, routine, [log(day(0))], day(0))
    const byId = Object.fromEntries(achievements.map((item) => [item.id, item]))

    expect(byId['first-day'].unlocked).toBe(true)
    expect(byId['streak-7'].unlocked).toBe(false)
    expect(byId['streak-7'].value).toBe(1)
    expect(byId['journey-30'].progress).toBeCloseTo(1 / 30)
  })

  it('unlocks the seven day streak and ten workouts together', () => {
    const logs = Array.from({ length: 10 }, (_, offset) => log(day(offset)))
    const achievements = evaluateAchievements(journey, routine, logs, day(9))
    const unlocked = achievements.filter((item) => item.unlocked).map((item) => item.id)

    expect(unlocked).toContain('streak-7')
    expect(unlocked).toContain('workouts-10')
    expect(unlocked).toContain('hydration-7')
    expect(unlocked).not.toContain('streak-14')
  })

  it('caps displayed values at the target', () => {
    const logs = Array.from({ length: 25 }, (_, offset) => log(day(offset)))
    const achievements = evaluateAchievements(journey, routine, logs, day(24))
    const workouts20 = achievements.find((item) => item.id === 'workouts-20')

    expect(workouts20?.value).toBe(20)
    expect(workouts20?.progress).toBe(1)
  })
})
