import { GLASS_ML } from './defaults'
import {
  addDays,
  averageTimeOfDay,
  parseTime,
  startOfWeek,
  todayISO,
  weekDates,
} from './date'
import type { AppState, Habit, SleepEntry, Workout } from './types'

const clamp01 = (n: number) => Math.max(0, Math.min(1, n))

export interface ScoreComponent {
  key: 'sleep' | 'movement' | 'workout' | 'nutrition' | 'hydration' | 'habits'
  label: string
  emoji: string
  weight: number
  ratio: number
  detail: string
}

export interface HabitToday {
  habit: Habit
  done: boolean
  /** Weekly habits that already hit their weekly target count as complete. */
  weekSatisfied: boolean
  weekCount: number
}

export interface DaySummary {
  date: string
  sleep: {
    entry?: SleepEntry
    minutes: number
    target: number
    ratio: number
    logged: boolean
  }
  workout: {
    today?: Workout
    status: 'completed' | 'active' | 'planned' | 'none'
    weekCount: number
    weekTarget: number
    /** Pace-aware ratio, so rest days don't feel like failures. */
    ratio: number
  }
  steps: { value: number; target: number; ratio: number }
  water: { ml: number; target: number; glasses: number; targetGlasses: number; ratio: number }
  nutrition: {
    mealsLogged: number
    mealTarget: number
    protein: number
    proteinTarget: number
    calories: number
    ratio: number
    percent: number
  }
  habits: { items: HabitToday[]; completed: number; total: number; ratio: number }
  score: number
  components: ScoreComponent[]
  band: ScoreBand
}

export interface ScoreBand {
  key: 'great' | 'good' | 'okay' | 'gentle'
  title: string
  message: string
}

export function scoreBand(score: number, name?: string): ScoreBand {
  const who = name ? `, ${name}` : ''
  if (score >= 85) {
    return {
      key: 'great',
      title: 'Great day',
      message: `This is what a balanced day looks like${who}. Keep it easy and repeatable.`,
    }
  }
  if (score >= 70) {
    return {
      key: 'good',
      title: 'Good day',
      message: 'Solid balance today. One small win more and you are all set.',
    }
  }
  if (score >= 50) {
    return {
      key: 'okay',
      title: 'Room to improve',
      message: 'You had a busy day. A good night of sleep can help you reset tomorrow.',
    }
  }
  return {
    key: 'gentle',
    title: 'Take it easy',
    message: 'Some days are just full. Pick one small thing — water, a short walk — and call it a win.',
  }
}

export function activeHabits(state: AppState): Habit[] {
  return state.habits.filter((h) => !h.archived)
}

export function habitWeekCount(state: AppState, habitId: string, date: string): number {
  return weekDates(date).filter((d) => (state.habitCompletions[d] ?? []).includes(habitId)).length
}

export function workoutsInWeek(state: AppState, date: string): Workout[] {
  const week = new Set(weekDates(date))
  return state.workouts.filter((w) => w.status === 'completed' && week.has(w.date))
}

export function workoutForDate(state: AppState, date: string): Workout | undefined {
  const onDate = state.workouts.filter((w) => w.date === date)
  return (
    onDate.find((w) => w.status === 'active') ??
    onDate.find((w) => w.status === 'completed') ??
    onDate.find((w) => w.status === 'planned')
  )
}

export function dayProtein(state: AppState, date: string): number {
  const day = state.nutrition[date]
  if (!day) return 0
  return day.meals.reduce((sum, m) => sum + (m.proteinG ?? 0), 0)
}

export function dayCalories(state: AppState, date: string): number {
  const day = state.nutrition[date]
  if (!day) return 0
  return day.meals.reduce((sum, m) => sum + (m.calories ?? 0), 0)
}

/** How much of the weekly workout target we'd expect by this day of the week. */
function expectedWorkoutsByToday(date: string, weekTarget: number, today: string): number {
  const start = startOfWeek(date)
  const dayIndex = weekDates(date).indexOf(date)
  const isCurrentWeek = startOfWeek(today) === start
  const daysElapsed = isCurrentWeek ? dayIndex + 1 : 7
  // Assume workouts spread across the week, but never demand more than the target.
  return Math.min(weekTarget, (weekTarget * daysElapsed) / 7)
}

export function getDaySummary(state: AppState, date: string, today = todayISO()): DaySummary {
  const t = state.targets

  const sleepEntry = state.sleep[date]
  const sleepMins = sleepEntry?.minutes ?? 0
  const sleepRatio = clamp01(sleepMins / t.sleepMinutes)

  const workout = workoutForDate(state, date)
  const weekWorkouts = workoutsInWeek(state, date)
  const weekCount = weekWorkouts.length
  const expected = expectedWorkoutsByToday(date, t.workoutsPerWeek, today)
  const paceRatio = expected <= 0 ? 1 : clamp01(weekCount / expected)
  const workoutRatio = workout?.status === 'completed' ? 1 : paceRatio

  const steps = state.activity[date]?.steps ?? 0
  const stepsRatio = clamp01(steps / t.steps)

  const nutritionDay = state.nutrition[date]
  const mealsLogged = nutritionDay?.meals.filter((m) => m.type !== 'snack').length ?? 0
  const protein = dayProtein(state, date)
  const calories = dayCalories(state, date)
  const mealRatio = clamp01(mealsLogged / Math.max(1, t.mealsPerDay))
  const proteinRatio = clamp01(protein / Math.max(1, t.proteinG))
  const nutritionRatio = mealRatio * 0.5 + proteinRatio * 0.5

  const waterMl = nutritionDay?.waterMl ?? 0
  const waterRatio = clamp01(waterMl / Math.max(1, t.waterMl))

  const completedIds = state.habitCompletions[date] ?? []
  const items: HabitToday[] = activeHabits(state).map((habit) => {
    const weekCountForHabit = habitWeekCount(state, habit.id, date)
    const weekSatisfied =
      habit.frequency === 'weekly' && weekCountForHabit >= (habit.weeklyTarget ?? 1)
    return {
      habit,
      done: completedIds.includes(habit.id),
      weekSatisfied,
      weekCount: weekCountForHabit,
    }
  })
  const habitsComplete = items.filter((i) => i.done || i.weekSatisfied).length
  const habitsRatio = items.length === 0 ? 0 : habitsComplete / items.length

  const components: ScoreComponent[] = [
    {
      key: 'sleep',
      label: 'Sleep',
      emoji: '😴',
      weight: 25,
      ratio: sleepRatio,
      detail: sleepEntry ? `${Math.round(sleepMins / 6) / 10}h logged` : 'Not logged yet',
    },
    {
      key: 'movement',
      label: 'Movement',
      emoji: '🚶',
      weight: 15,
      ratio: stepsRatio,
      detail: `${steps.toLocaleString()} steps`,
    },
    {
      key: 'workout',
      label: 'Workout',
      emoji: '🏋️',
      weight: 15,
      ratio: workoutRatio,
      detail:
        workout?.status === 'completed'
          ? 'Completed today'
          : `${weekCount} of ${t.workoutsPerWeek} this week`,
    },
    {
      key: 'nutrition',
      label: 'Nutrition',
      emoji: '🥗',
      weight: 20,
      ratio: nutritionRatio,
      detail: `${mealsLogged}/${t.mealsPerDay} meals · ${protein}g protein`,
    },
    {
      key: 'hydration',
      label: 'Hydration',
      emoji: '💧',
      weight: 10,
      ratio: waterRatio,
      detail: `${(waterMl / 1000).toFixed(1)}L of ${(t.waterMl / 1000).toFixed(1)}L`,
    },
    {
      key: 'habits',
      label: 'Habits',
      emoji: '🔥',
      weight: 15,
      ratio: habitsRatio,
      detail: items.length ? `${habitsComplete} of ${items.length} done` : 'No habits yet',
    },
  ]

  const score = Math.round(components.reduce((sum, c) => sum + c.ratio * c.weight, 0))

  return {
    date,
    sleep: {
      entry: sleepEntry,
      minutes: sleepMins,
      target: t.sleepMinutes,
      ratio: sleepRatio,
      logged: Boolean(sleepEntry),
    },
    workout: {
      today: workout,
      status: workout?.status ?? 'none',
      weekCount,
      weekTarget: t.workoutsPerWeek,
      ratio: workoutRatio,
    },
    steps: { value: steps, target: t.steps, ratio: stepsRatio },
    water: {
      ml: waterMl,
      target: t.waterMl,
      glasses: Math.round(waterMl / GLASS_ML),
      targetGlasses: Math.round(t.waterMl / GLASS_ML),
      ratio: waterRatio,
    },
    nutrition: {
      mealsLogged,
      mealTarget: t.mealsPerDay,
      protein,
      proteinTarget: t.proteinG,
      calories,
      ratio: nutritionRatio,
      percent: Math.round(nutritionRatio * 100),
    },
    habits: { items, completed: habitsComplete, total: items.length, ratio: habitsRatio },
    score,
    components,
    band: scoreBand(score, state.profile?.name.split(' ')[0]),
  }
}

export interface WeekSummary {
  start: string
  end: string
  dates: string[]
  workouts: number
  workoutTarget: number
  avgSleepMinutes: number
  sleepNights: number
  avgSteps: number
  hydrationPercent: number
  habitsCompleted: number
  habitsPossible: number
  habitPercent: number
  avgScore: number
  healthyDays: number
  /** Circular mean bedtime/wake time in minutes past midnight. */
  avgBedTime: number | null
  avgWakeTime: number | null
  /** Average absolute deviation of bedtime, in minutes. Lower is more consistent. */
  bedTimeSpread: number | null
  scores: { date: string; score: number; hasData: boolean }[]
}

function meanOf(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((a, b) => a + b, 0) / values.length
}

/** A "healthy day" = at least 3 of the 5 core areas at 70%+ (PRD §21). */
export function isHealthyDay(summary: DaySummary): boolean {
  const areas = [
    summary.sleep.ratio,
    Math.max(summary.steps.ratio, summary.workout.ratio),
    summary.nutrition.ratio,
    summary.water.ratio,
    summary.habits.ratio,
  ]
  return areas.filter((r) => r >= 0.7).length >= 3
}

export function hasAnyData(state: AppState, date: string): boolean {
  return Boolean(
    state.sleep[date] ||
      state.nutrition[date]?.meals.length ||
      state.nutrition[date]?.waterMl ||
      state.activity[date]?.steps ||
      (state.habitCompletions[date] ?? []).length ||
      state.workouts.some((w) => w.date === date && w.status !== 'planned'),
  )
}

export function getWeekSummary(state: AppState, anyDateInWeek: string, today = todayISO()): WeekSummary {
  const dates = weekDates(anyDateInWeek)
  const upTo = dates.filter((d) => d <= today)
  const relevant = upTo.length ? upTo : dates

  const summaries = relevant.map((d) => getDaySummary(state, d, today))

  const sleepEntries = relevant.map((d) => state.sleep[d]).filter(Boolean) as SleepEntry[]
  const stepDays = relevant.map((d) => state.activity[d]?.steps ?? 0).filter((s) => s > 0)

  const habitsPossible = summaries.reduce((sum, s) => sum + s.habits.total, 0)
  const habitsCompleted = summaries.reduce((sum, s) => sum + s.habits.completed, 0)

  const hydrationValues = summaries.map((s) => Math.min(1, s.water.ratio))

  const bedTimes = sleepEntries.map((e) => parseTime(e.bedTime))
  const avgBed = averageTimeOfDay(bedTimes)
  const bedSpread =
    avgBed === null || bedTimes.length < 2
      ? null
      : meanOf(
          bedTimes.map((t) => {
            const diff = Math.abs(t - avgBed)
            return Math.min(diff, 24 * 60 - diff)
          }),
        )

  return {
    start: dates[0],
    end: dates[6],
    dates,
    workouts: workoutsInWeek(state, dates[0]).length,
    workoutTarget: state.targets.workoutsPerWeek,
    avgSleepMinutes: Math.round(meanOf(sleepEntries.map((e) => e.minutes))),
    sleepNights: sleepEntries.length,
    avgSteps: Math.round(meanOf(stepDays)),
    hydrationPercent: Math.round(meanOf(hydrationValues) * 100),
    habitsCompleted,
    habitsPossible,
    habitPercent: habitsPossible === 0 ? 0 : Math.round((habitsCompleted / habitsPossible) * 100),
    avgScore: Math.round(meanOf(summaries.filter((s) => hasAnyData(state, s.date)).map((s) => s.score))),
    healthyDays: summaries.filter((s) => hasAnyData(state, s.date) && isHealthyDay(s)).length,
    avgBedTime: avgBed,
    avgWakeTime: averageTimeOfDay(sleepEntries.map((e) => parseTime(e.wakeTime))),
    bedTimeSpread: bedSpread === null ? null : Math.round(bedSpread),
    scores: relevant.map((d) => ({
      date: d,
      score: getDaySummary(state, d, today).score,
      hasData: hasAnyData(state, d),
    })),
  }
}

export function previousWeekSummary(state: AppState, anyDateInWeek: string, today = todayISO()): WeekSummary {
  return getWeekSummary(state, addDays(startOfWeek(anyDateInWeek), -7), today)
}
