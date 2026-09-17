/** Fitraa data model (see MVP spec §9). */

export type GoalId = 'strength' | 'fat-loss' | 'endurance' | 'active' | 'custom'

export type JourneyStatus = 'active' | 'completed' | 'abandoned'

export type TaskId = 'water' | 'workout' | 'nutrition' | 'sleep'

export type Units = 'metric' | 'imperial'

export interface User {
  id: string
  name: string
  email: string | null
  createdAt: string
}

export interface Journey {
  id: string
  userId: string
  goal: GoalId
  /** Free text when goal is 'custom'. */
  goalLabel: string
  /** "YYYY-MM-DD" in the user's local time. */
  startDate: string
  /** Days in the journey — 30 for the MVP. */
  duration: number
  status: JourneyStatus
}

export interface Routine {
  id: string
  journeyId: string
  /** Litres per day. */
  waterTarget: number
  /** Workout days per week (1–7). */
  workoutDays: number
  /** Hours per night. */
  sleepTarget: number
  nutritionPlan: string
}

export interface DailyLog {
  id: string
  journeyId: string
  /** "YYYY-MM-DD" */
  date: string
  /** Litres drunk so far. */
  waterAmount: number
  workoutCompleted: boolean
  nutritionCompleted: boolean
  /** Hours slept, or null when not logged yet. */
  sleepHours: number | null
  /** Set the first time every target for the day is met. */
  completedAt: string | null
}

export type AchievementId =
  | 'first-day'
  | 'streak-7'
  | 'streak-14'
  | 'journey-30'
  | 'workouts-10'
  | 'workouts-20'
  | 'hydration-7'

export interface Achievement {
  id: string
  userId: string
  type: AchievementId
  unlockedAt: string | null
  /** 0–1 towards unlocking. */
  progress: number
}

export interface Preferences {
  dailyReminders: boolean
  units: Units
}

/** Everything the app needs in memory, loaded as one snapshot. */
export interface FitraaData {
  user: User | null
  journey: Journey | null
  routine: Routine | null
  logs: DailyLog[]
  achievements: Achievement[]
  preferences: Preferences
}
