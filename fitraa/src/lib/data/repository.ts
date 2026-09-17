import type {
  AchievementId,
  DailyLog,
  FitraaData,
  GoalId,
  Preferences,
  Routine,
  User,
} from '../../types'

export interface OnboardingInput {
  name: string
  email: string | null
  goal: GoalId
  goalLabel: string
  startDate: string
  duration: number
  routine: Omit<Routine, 'id' | 'journeyId'>
}

export interface UnlockedAchievement {
  type: AchievementId
  unlockedAt: string
  progress: number
}

/**
 * The one seam between the app and where data lives. Two implementations ship:
 * on-device storage (default) and Supabase (when configured).
 */
export interface Repository {
  readonly kind: 'local' | 'supabase'
  load(): Promise<FitraaData>
  startJourney(input: OnboardingInput): Promise<FitraaData>
  saveLog(log: DailyLog): Promise<void>
  saveRoutine(routine: Routine): Promise<void>
  saveUser(patch: Partial<Pick<User, 'name' | 'email'>>): Promise<void>
  savePreferences(preferences: Preferences): Promise<void>
  saveAchievements(unlocked: UnlockedAchievement[]): Promise<void>
  /** Wipes every trace of the account from this device / the backend. */
  deleteEverything(): Promise<void>
}

export const DEFAULT_PREFERENCES: Preferences = {
  dailyReminders: true,
  units: 'metric',
}

export function emptyData(): FitraaData {
  return {
    user: null,
    journey: null,
    routine: null,
    logs: [],
    achievements: [],
    preferences: { ...DEFAULT_PREFERENCES },
  }
}
