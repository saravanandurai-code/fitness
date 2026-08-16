import { describe, expect, it } from 'vitest'
import { sleepMinutes } from '../date'
import { emptyState } from '../storage'
import { getDaySummary, getWeekSummary, isHealthyDay } from '../summary'
import type { AppState, Workout } from '../types'

const TODAY = '2026-08-13' // a Thursday
const MONDAY = '2026-08-10'

function baseState(): AppState {
  return {
    ...emptyState(),
    onboarded: true,
    profile: {
      name: 'Test User',
      goal: 'lifestyle',
      workSchedule: '9:00 AM – 6:00 PM',
      preferredWorkoutTime: 'Evening',
      typicalSleepTime: '23:30',
      typicalWakeTime: '07:00',
      createdAt: `${TODAY}T08:00:00.000Z`,
    },
    habits: [
      { id: 'h1', name: 'Drink water', emoji: '💧', frequency: 'daily', createdAt: TODAY },
      { id: 'h2', name: 'Gym 4× per week', emoji: '🏋️', frequency: 'weekly', weeklyTarget: 4, createdAt: TODAY },
    ],
  }
}

function completedWorkout(date: string, id: string): Workout {
  return {
    id,
    date,
    title: 'Upper',
    status: 'completed',
    exercises: [],
    durationMin: 50,
  }
}

describe('getDaySummary', () => {
  it('reports an empty day as zero without crashing', () => {
    const summary = getDaySummary(baseState(), TODAY, TODAY)
    expect(summary.score).toBe(0)
    expect(summary.sleep.logged).toBe(false)
    expect(summary.habits.total).toBe(2)
    expect(summary.band.key).toBe('gentle')
  })

  it('scores a well-rounded day highly', () => {
    const state = baseState()
    state.sleep[TODAY] = {
      date: TODAY,
      bedTime: '23:00',
      wakeTime: '07:00',
      minutes: sleepMinutes('23:00', '07:00'),
      source: 'manual',
    }
    state.activity[TODAY] = { date: TODAY, steps: 9000 }
    state.nutrition[TODAY] = {
      date: TODAY,
      waterMl: 2500,
      meals: [
        { id: 'm1', type: 'breakfast', description: 'Eggs', proteinG: 30, loggedAt: TODAY },
        { id: 'm2', type: 'lunch', description: 'Rice + chicken', proteinG: 40, loggedAt: TODAY },
        { id: 'm3', type: 'dinner', description: 'Dal + roti', proteinG: 35, loggedAt: TODAY },
      ],
    }
    state.workouts = [completedWorkout(TODAY, 'w1')]
    state.habitCompletions[TODAY] = ['h1', 'h2']

    const summary = getDaySummary(state, TODAY, TODAY)
    expect(summary.score).toBeGreaterThanOrEqual(95)
    expect(summary.band.key).toBe('great')
    expect(isHealthyDay(summary)).toBe(true)
    expect(summary.water.glasses).toBe(10)
    expect(summary.nutrition.protein).toBe(105)
  })

  it('does not punish a rest day when the week is on pace', () => {
    const state = baseState()
    state.targets.workoutsPerWeek = 4
    // Three workouts by Thursday is ahead of a 4-per-week pace.
    state.workouts = [
      completedWorkout(MONDAY, 'w1'),
      completedWorkout('2026-08-11', 'w2'),
      completedWorkout('2026-08-12', 'w3'),
    ]
    const summary = getDaySummary(state, TODAY, TODAY)
    expect(summary.workout.status).toBe('none')
    expect(summary.workout.ratio).toBe(1)
  })

  it('counts a weekly habit as complete once its weekly target is met', () => {
    const state = baseState()
    for (const d of [MONDAY, '2026-08-11', '2026-08-12', TODAY]) {
      state.habitCompletions[d] = ['h2']
    }
    const summary = getDaySummary(state, TODAY, TODAY)
    const gym = summary.habits.items.find((i) => i.habit.id === 'h2')
    expect(gym?.weekCount).toBe(4)
    expect(gym?.weekSatisfied).toBe(true)

    // Once the weekly target is already met earlier in the week, the habit counts
    // as complete on days it is not ticked — no guilt for a rest day.
    state.habits = state.habits.map((h) => (h.id === 'h2' ? { ...h, weeklyTarget: 3 } : h))
    state.habitCompletions[TODAY] = []
    const next = getDaySummary(state, TODAY, TODAY)
    expect(next.habits.items.find((i) => i.habit.id === 'h2')?.weekSatisfied).toBe(true)
    expect(next.habits.completed).toBe(1)
  })

  it('excludes snacks from the meal count but keeps their protein', () => {
    const state = baseState()
    state.nutrition[TODAY] = {
      date: TODAY,
      waterMl: 0,
      meals: [
        { id: 'm1', type: 'lunch', description: 'Rice', proteinG: 20, loggedAt: TODAY },
        { id: 'm2', type: 'snack', description: 'Almonds', proteinG: 8, loggedAt: TODAY },
      ],
    }
    const summary = getDaySummary(state, TODAY, TODAY)
    expect(summary.nutrition.mealsLogged).toBe(1)
    expect(summary.nutrition.protein).toBe(28)
  })
})

describe('getWeekSummary', () => {
  it('averages only the days that have data and stops at today', () => {
    const state = baseState()
    state.sleep[MONDAY] = {
      date: MONDAY,
      bedTime: '23:00',
      wakeTime: '07:00',
      minutes: 480,
      source: 'manual',
    }
    state.sleep['2026-08-11'] = {
      date: '2026-08-11',
      bedTime: '00:00',
      wakeTime: '07:00',
      minutes: 420,
      source: 'manual',
    }
    state.activity[MONDAY] = { date: MONDAY, steps: 10000 }
    state.workouts = [completedWorkout(MONDAY, 'w1'), completedWorkout('2026-08-12', 'w2')]

    const week = getWeekSummary(state, TODAY, TODAY)
    expect(week.start).toBe(MONDAY)
    expect(week.end).toBe('2026-08-16')
    expect(week.sleepNights).toBe(2)
    expect(week.avgSleepMinutes).toBe(450)
    expect(week.avgSteps).toBe(10000)
    expect(week.workouts).toBe(2)
    // Only Mon–Thu are counted, so 4 days × 2 habits.
    expect(week.habitsPossible).toBe(8)
    expect(week.scores).toHaveLength(4)
  })

  it('measures bedtime spread across the week', () => {
    const state = baseState()
    for (const [date, bed] of [
      [MONDAY, '23:00'],
      ['2026-08-11', '23:30'],
      ['2026-08-12', '22:30'],
    ] as const) {
      state.sleep[date] = {
        date,
        bedTime: bed,
        wakeTime: '07:00',
        minutes: sleepMinutes(bed, '07:00'),
        source: 'manual',
      }
    }
    const week = getWeekSummary(state, TODAY, TODAY)
    expect(week.bedTimeSpread).toBe(20)
  })
})
