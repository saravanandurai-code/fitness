import { addDays, fromISODate, minutesToHHMM, sleepMinutes, todayISO } from './date'
import { WORKOUT_PLANS } from './defaults'
import { newId } from './storage'
import type { AppState, Meal, SleepQuality, Workout } from './types'

/** Small deterministic PRNG so the sample week looks the same every time. */
function makeRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

const BREAKFASTS = ['Eggs + toast + fruit', 'Oats with milk and banana', 'Greek yoghurt + nuts', 'Idli with sambar']
const LUNCHES = ['Rice + chicken + vegetables', 'Roti + dal + salad', 'Quinoa bowl with paneer', 'Rice + fish curry']
const DINNERS = ['Grilled chicken + veggies', 'Chapati + sabzi + curd', 'Stir-fried tofu + rice', 'Soup + salad + eggs']

/**
 * Fills the previous 13 days (plus part of today) with believable tracking data
 * so Progress and trends have something to show on a fresh account.
 */
export function withSampleHistory(state: AppState, today = todayISO()): AppState {
  const rand = makeRandom(20260816)
  const next: AppState = {
    ...state,
    sleep: { ...state.sleep },
    nutrition: { ...state.nutrition },
    activity: { ...state.activity },
    workouts: [...state.workouts],
    habitCompletions: { ...state.habitCompletions },
  }

  const plan = WORKOUT_PLANS.find((p) => p.id === 'upper-lower') ?? WORKOUT_PLANS[0]
  const habitIds = state.habits.filter((h) => !h.archived).map((h) => h.id)

  for (let i = 13; i >= 0; i -= 1) {
    const date = addDays(today, -i)
    const isToday = i === 0
    const dow = fromISODate(date).getDay()
    const weekend = dow === 0 || dow === 6
    // Slightly better habits in the most recent week, so trends read as improving.
    const recent = i < 7

    const bedMinutes = (recent ? 23 * 60 + 10 : 23 * 60 + 45) + Math.round((rand() - 0.5) * 50)
    const wakeMinutes = (weekend ? 8 * 60 : 7 * 60 + 5) + Math.round((rand() - 0.5) * 30)
    const bedTime = minutesToHHMM(bedMinutes)
    const wakeTime = minutesToHHMM(wakeMinutes)
    const quality: SleepQuality[] = ['okay', 'good', 'good', 'great']

    if (!isToday || new Date().getHours() >= 8) {
      next.sleep[date] = {
        date,
        bedTime,
        wakeTime,
        minutes: sleepMinutes(bedTime, wakeTime),
        quality: quality[Math.floor(rand() * quality.length)],
        source: 'manual',
      }
    }

    const baseSteps = weekend ? 6200 : 7600
    next.activity[date] = {
      date,
      steps: Math.round((baseSteps + (recent ? 900 : 0) + rand() * 3200) * (isToday ? 0.6 : 1)),
    }

    const meals: Meal[] = []
    const pushMeal = (type: Meal['type'], description: string, proteinG: number, calories: number, at: string) => {
      meals.push({ id: newId(), type, description, proteinG, calories, loggedAt: `${date}T${at}` })
    }
    pushMeal('breakfast', BREAKFASTS[Math.floor(rand() * BREAKFASTS.length)], 22 + Math.round(rand() * 8), 420, '08:15')
    pushMeal('lunch', LUNCHES[Math.floor(rand() * LUNCHES.length)], 34 + Math.round(rand() * 10), 640, '13:10')
    if (!isToday) {
      pushMeal('dinner', DINNERS[Math.floor(rand() * DINNERS.length)], 32 + Math.round(rand() * 12), 600, '20:30')
      if (rand() > 0.5) pushMeal('snack', 'Handful of almonds', 8, 180, '17:00')
    }

    next.nutrition[date] = {
      date,
      meals,
      waterMl: Math.round(((recent ? 2100 : 1750) + rand() * 500) * (isToday ? 0.7 : 1) / 250) * 250,
    }

    // 4 workouts a week on weekdays, 3 in the older week.
    const workoutDays = recent ? [1, 2, 4, 5] : [1, 3, 5]
    if (workoutDays.includes(dow) && !isToday) {
      const day = plan.days[Math.floor(rand() * plan.days.length)]
      const workout: Workout = {
        id: newId(),
        date,
        title: `${plan.name} — ${day.title}`,
        planId: plan.id,
        status: 'completed',
        startedAt: `${date}T18:05`,
        completedAt: `${date}T19:15`,
        durationMin: 60 + Math.round(rand() * 20),
        exercises: day.exercises.map((ex) => ({
          id: newId(),
          name: ex.name,
          kind: ex.kind,
          sets: Array.from({ length: ex.sets }, () => ({
            id: newId(),
            reps: ex.reps,
            weightKg: ex.kind === 'strength' ? 20 + Math.round(rand() * 6) * 5 : undefined,
            done: true,
          })),
          durationMin: ex.kind === 'strength' ? undefined : 15,
        })),
      }
      next.workouts.push(workout)
    }

    if (habitIds.length) {
      const rate = recent ? 0.85 : 0.68
      const done = habitIds.filter(() => rand() < rate)
      next.habitCompletions[date] = isToday ? done.slice(0, Math.max(1, done.length - 1)) : done
    }
  }

  return next
}
