import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { sleepMinutes } from '../lib/date'
import { withSampleHistory } from '../lib/sample'
import { clearState, emptyState, loadState, newId, saveState } from '../lib/storage'
import type {
  AppState,
  ExerciseEntry,
  ExerciseKind,
  Habit,
  Meal,
  Profile,
  SetEntry,
  SleepQuality,
  Targets,
  Workout,
} from '../lib/types'

interface NewWorkoutInput {
  date: string
  title: string
  planId?: string
  exercises: { name: string; kind: ExerciseKind; sets: number; reps?: number }[]
  status?: 'planned' | 'active'
}

export interface Actions {
  completeOnboarding(input: { profile: Profile; targets: Targets; habits: Omit<Habit, 'id' | 'createdAt'>[] }): void
  updateProfile(patch: Partial<Profile>): void
  updateTargets(patch: Partial<Targets>): void

  saveSleep(input: { date: string; bedTime: string; wakeTime: string; quality?: SleepQuality }): void
  deleteSleep(date: string): void

  setSteps(date: string, steps: number): void
  addWater(date: string, ml: number): void
  setWater(date: string, ml: number): void

  addMeal(date: string, meal: Omit<Meal, 'id' | 'loggedAt'>): void
  updateMeal(date: string, mealId: string, patch: Partial<Omit<Meal, 'id'>>): void
  deleteMeal(date: string, mealId: string): void

  createWorkout(input: NewWorkoutInput): string
  startWorkout(id: string): void
  completeWorkout(id: string, notes?: string): void
  deleteWorkout(id: string): void
  addExercise(workoutId: string, name: string, kind: ExerciseKind, sets?: number, reps?: number): void
  removeExercise(workoutId: string, exerciseId: string): void
  updateExercise(workoutId: string, exerciseId: string, patch: Partial<Omit<ExerciseEntry, 'id' | 'sets'>>): void
  addSet(workoutId: string, exerciseId: string): void
  updateSet(workoutId: string, exerciseId: string, setId: string, patch: Partial<Omit<SetEntry, 'id'>>): void
  removeSet(workoutId: string, exerciseId: string, setId: string): void

  addHabit(input: { name: string; emoji: string; frequency: 'daily' | 'weekly'; weeklyTarget?: number }): void
  updateHabit(id: string, patch: Partial<Omit<Habit, 'id' | 'createdAt'>>): void
  archiveHabit(id: string): void
  restoreHabit(id: string): void
  toggleHabit(date: string, habitId: string): void

  loadSampleData(): void
  resetEverything(): void
}

interface StoreValue {
  state: AppState
  actions: Actions
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadState())
  const firstRender = useRef(true)

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    saveState(state)
  }, [state])

  const update = useCallback((fn: (prev: AppState) => AppState) => setState(fn), [])

  const actions = useMemo<Actions>(() => {
    const nutritionDay = (prev: AppState, date: string) =>
      prev.nutrition[date] ?? { date, meals: [], waterMl: 0 }

    const mapWorkout = (prev: AppState, id: string, fn: (w: Workout) => Workout): AppState => ({
      ...prev,
      workouts: prev.workouts.map((w) => (w.id === id ? fn(w) : w)),
    })

    const mapExercise = (
      prev: AppState,
      workoutId: string,
      exerciseId: string,
      fn: (e: ExerciseEntry) => ExerciseEntry,
    ): AppState =>
      mapWorkout(prev, workoutId, (w) => ({
        ...w,
        exercises: w.exercises.map((e) => (e.id === exerciseId ? fn(e) : e)),
      }))

    return {
      completeOnboarding({ profile, targets, habits }) {
        const createdAt = new Date().toISOString()
        update((prev) => ({
          ...prev,
          onboarded: true,
          profile,
          targets,
          habits: habits.map((h) => ({ ...h, id: newId(), createdAt })),
        }))
      },

      updateProfile(patch) {
        update((prev) => (prev.profile ? { ...prev, profile: { ...prev.profile, ...patch } } : prev))
      },

      updateTargets(patch) {
        update((prev) => ({ ...prev, targets: { ...prev.targets, ...patch } }))
      },

      saveSleep({ date, bedTime, wakeTime, quality }) {
        update((prev) => ({
          ...prev,
          sleep: {
            ...prev.sleep,
            [date]: {
              date,
              bedTime,
              wakeTime,
              quality,
              minutes: sleepMinutes(bedTime, wakeTime),
              source: 'manual',
            },
          },
        }))
      },

      deleteSleep(date) {
        update((prev) => {
          const next = { ...prev.sleep }
          delete next[date]
          return { ...prev, sleep: next }
        })
      },

      setSteps(date, steps) {
        update((prev) => ({
          ...prev,
          activity: { ...prev.activity, [date]: { date, steps: Math.max(0, Math.round(steps)) } },
        }))
      },

      addWater(date, ml) {
        update((prev) => {
          const day = nutritionDay(prev, date)
          return {
            ...prev,
            nutrition: {
              ...prev.nutrition,
              [date]: { ...day, waterMl: Math.max(0, day.waterMl + ml) },
            },
          }
        })
      },

      setWater(date, ml) {
        update((prev) => ({
          ...prev,
          nutrition: {
            ...prev.nutrition,
            [date]: { ...nutritionDay(prev, date), waterMl: Math.max(0, Math.round(ml)) },
          },
        }))
      },

      addMeal(date, meal) {
        update((prev) => {
          const day = nutritionDay(prev, date)
          const entry: Meal = { ...meal, id: newId(), loggedAt: new Date().toISOString() }
          return {
            ...prev,
            nutrition: { ...prev.nutrition, [date]: { ...day, meals: [...day.meals, entry] } },
          }
        })
      },

      updateMeal(date, mealId, patch) {
        update((prev) => {
          const day = nutritionDay(prev, date)
          return {
            ...prev,
            nutrition: {
              ...prev.nutrition,
              [date]: {
                ...day,
                meals: day.meals.map((m) => (m.id === mealId ? { ...m, ...patch } : m)),
              },
            },
          }
        })
      },

      deleteMeal(date, mealId) {
        update((prev) => {
          const day = nutritionDay(prev, date)
          return {
            ...prev,
            nutrition: {
              ...prev.nutrition,
              [date]: { ...day, meals: day.meals.filter((m) => m.id !== mealId) },
            },
          }
        })
      },

      createWorkout({ date, title, planId, exercises, status = 'active' }) {
        const id = newId()
        update((prev) => ({
          ...prev,
          workouts: [
            ...prev.workouts,
            {
              id,
              date,
              title,
              planId,
              status,
              startedAt: status === 'active' ? new Date().toISOString() : undefined,
              exercises: exercises.map((ex) => ({
                id: newId(),
                name: ex.name,
                kind: ex.kind,
                sets: Array.from({ length: Math.max(1, ex.sets) }, () => ({
                  id: newId(),
                  reps: ex.reps,
                  done: false,
                })),
              })),
            },
          ],
        }))
        return id
      },

      startWorkout(id) {
        update((prev) =>
          mapWorkout(prev, id, (w) => ({
            ...w,
            status: 'active',
            startedAt: w.startedAt ?? new Date().toISOString(),
          })),
        )
      },

      completeWorkout(id, notes) {
        update((prev) =>
          mapWorkout(prev, id, (w) => {
            const completedAt = new Date().toISOString()
            const started = w.startedAt ? new Date(w.startedAt).getTime() : null
            const elapsed = started ? Math.round((Date.now() - started) / 60000) : null
            const fromExercises = w.exercises.reduce((sum, e) => sum + (e.durationMin ?? 0), 0)
            return {
              ...w,
              status: 'completed',
              completedAt,
              notes: notes ?? w.notes,
              durationMin:
                elapsed && elapsed > 0 && elapsed < 300 ? elapsed : fromExercises > 0 ? fromExercises : 45,
            }
          }),
        )
      },

      deleteWorkout(id) {
        update((prev) => ({ ...prev, workouts: prev.workouts.filter((w) => w.id !== id) }))
      },

      addExercise(workoutId, name, kind, sets = 3, reps) {
        update((prev) =>
          mapWorkout(prev, workoutId, (w) => ({
            ...w,
            exercises: [
              ...w.exercises,
              {
                id: newId(),
                name,
                kind,
                sets: Array.from({ length: Math.max(1, sets) }, () => ({ id: newId(), reps, done: false })),
              },
            ],
          })),
        )
      },

      removeExercise(workoutId, exerciseId) {
        update((prev) =>
          mapWorkout(prev, workoutId, (w) => ({
            ...w,
            exercises: w.exercises.filter((e) => e.id !== exerciseId),
          })),
        )
      },

      updateExercise(workoutId, exerciseId, patch) {
        update((prev) => mapExercise(prev, workoutId, exerciseId, (e) => ({ ...e, ...patch })))
      },

      addSet(workoutId, exerciseId) {
        update((prev) =>
          mapExercise(prev, workoutId, exerciseId, (e) => {
            const last = e.sets[e.sets.length - 1]
            return {
              ...e,
              sets: [
                ...e.sets,
                { id: newId(), reps: last?.reps, weightKg: last?.weightKg, done: false },
              ],
            }
          }),
        )
      },

      updateSet(workoutId, exerciseId, setId, patch) {
        update((prev) =>
          mapExercise(prev, workoutId, exerciseId, (e) => ({
            ...e,
            sets: e.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)),
          })),
        )
      },

      removeSet(workoutId, exerciseId, setId) {
        update((prev) =>
          mapExercise(prev, workoutId, exerciseId, (e) => ({
            ...e,
            sets: e.sets.filter((s) => s.id !== setId),
          })),
        )
      },

      addHabit({ name, emoji, frequency, weeklyTarget }) {
        update((prev) => ({
          ...prev,
          habits: [
            ...prev.habits,
            { id: newId(), name, emoji, frequency, weeklyTarget, createdAt: new Date().toISOString() },
          ],
        }))
      },

      updateHabit(id, patch) {
        update((prev) => ({
          ...prev,
          habits: prev.habits.map((h) => (h.id === id ? { ...h, ...patch } : h)),
        }))
      },

      archiveHabit(id) {
        update((prev) => ({
          ...prev,
          habits: prev.habits.map((h) => (h.id === id ? { ...h, archived: true } : h)),
        }))
      },

      restoreHabit(id) {
        update((prev) => ({
          ...prev,
          habits: prev.habits.map((h) => (h.id === id ? { ...h, archived: false } : h)),
        }))
      },

      toggleHabit(date, habitId) {
        update((prev) => {
          const done = prev.habitCompletions[date] ?? []
          const next = done.includes(habitId)
            ? done.filter((id) => id !== habitId)
            : [...done, habitId]
          return { ...prev, habitCompletions: { ...prev.habitCompletions, [date]: next } }
        })
      },

      loadSampleData() {
        update((prev) => withSampleHistory(prev))
      },

      resetEverything() {
        clearState()
        setState(emptyState())
      },
    }
  }, [update])

  const value = useMemo(() => ({ state, actions }), [state, actions])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>')
  return ctx
}

export function useAppState(): AppState {
  return useStore().state
}

export function useActions(): Actions {
  return useStore().actions
}
