/** Core data model for the Sarv MVP (see PRD §17). */

export type Goal =
  | 'habits'
  | 'muscle'
  | 'weight'
  | 'fitness'
  | 'lifestyle'

export type SleepQuality = 'poor' | 'okay' | 'good' | 'great'

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export type ExerciseKind = 'strength' | 'cardio' | 'mobility'

export type SleepSource = 'manual' | 'estimated'

export interface Profile {
  name: string
  age?: number
  gender?: string
  heightCm?: number
  weightKg?: number
  goal: Goal
  /** Free text, e.g. "9:00 AM - 6:00 PM" */
  workSchedule: string
  preferredWorkoutTime: string
  /** "HH:MM" 24h */
  typicalSleepTime: string
  typicalWakeTime: string
  createdAt: string
}

export interface Targets {
  sleepMinutes: number
  waterMl: number
  workoutsPerWeek: number
  steps: number
  proteinG: number
  mealsPerDay: number
}

export interface SleepEntry {
  date: string
  /** "HH:MM" the user went to bed (previous evening) */
  bedTime: string
  wakeTime: string
  minutes: number
  quality?: SleepQuality
  source: SleepSource
}

export interface Meal {
  id: string
  type: MealType
  description: string
  proteinG?: number
  calories?: number
  loggedAt: string
}

export interface DayNutrition {
  date: string
  meals: Meal[]
  waterMl: number
}

export interface SetEntry {
  id: string
  reps?: number
  weightKg?: number
  done: boolean
}

export interface ExerciseEntry {
  id: string
  name: string
  kind: ExerciseKind
  sets: SetEntry[]
  /** Used for cardio / mobility work */
  durationMin?: number
}

export type WorkoutStatus = 'planned' | 'active' | 'completed'

export interface Workout {
  id: string
  date: string
  title: string
  planId?: string
  status: WorkoutStatus
  startedAt?: string
  completedAt?: string
  durationMin?: number
  exercises: ExerciseEntry[]
  notes?: string
}

export interface WorkoutPlan {
  id: string
  name: string
  description: string
  days: { title: string; exercises: { name: string; kind: ExerciseKind; sets: number; reps?: number }[] }[]
}

export interface Habit {
  id: string
  name: string
  emoji: string
  frequency: 'daily' | 'weekly'
  /** For weekly habits: how many times per week */
  weeklyTarget?: number
  createdAt: string
  archived?: boolean
}

export interface DayActivity {
  date: string
  steps: number
}

export interface AppState {
  version: number
  onboarded: boolean
  profile: Profile | null
  targets: Targets
  sleep: Record<string, SleepEntry>
  nutrition: Record<string, DayNutrition>
  activity: Record<string, DayActivity>
  workouts: Workout[]
  habits: Habit[]
  /** date -> habit ids completed that day */
  habitCompletions: Record<string, string[]>
}
