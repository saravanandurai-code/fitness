import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { repository, usesSupabase } from '../../lib/data'
import type { OnboardingInput } from '../../lib/data'
import { emptyData } from '../../lib/data/repository'
import { todayISO } from '../../lib/utils/date'
import { dayProgress, emptyLog, findLog } from '../daily-log/progress'
import type { DayProgress } from '../daily-log/progress'
import { evaluateAchievements, newlyUnlocked } from '../achievements/definitions'
import type { AchievementState } from '../achievements/definitions'
import { journeyStats } from './stats'
import type { JourneyStats } from './stats'
import { useAuth } from '../auth/useAuth'
import type { DailyLog, FitraaData, Preferences, Routine, TaskId } from '../../types'

export interface CompletionEvent {
  /** Which task the user just finished, or 'day' when the whole day closed. */
  task: TaskId | 'day'
  streak: number
  dayComplete: boolean
  unlocked: AchievementState[]
}

interface JourneyValue {
  loading: boolean
  data: FitraaData
  /** Local date the UI is treating as "today". */
  today: string
  hasJourney: boolean
  todayLog: DailyLog
  todayProgress: DayProgress | null
  stats: JourneyStats | null
  achievements: AchievementState[]
  /** Set after an action that completed something; clear it once shown. */
  lastCompletion: CompletionEvent | null
  clearCompletion(): void
  storageMode: 'local' | 'supabase'

  startJourney(input: OnboardingInput): Promise<void>
  addWater(litres: number): Promise<void>
  setWorkoutComplete(complete: boolean): Promise<void>
  setNutritionComplete(complete: boolean): Promise<void>
  logSleep(hours: number | null): Promise<void>
  updateRoutine(routine: Routine): Promise<void>
  updateName(name: string): Promise<void>
  updatePreferences(preferences: Preferences): Promise<void>
  reload(): Promise<void>
  deleteEverything(): Promise<void>
}

const JourneyContext = createContext<JourneyValue | null>(null)

export function JourneyProvider({ children }: { children: ReactNode }) {
  const { authenticated, ready } = useAuth()
  const [data, setData] = useState<FitraaData>(emptyData)
  const [loading, setLoading] = useState(true)
  const [today, setToday] = useState(todayISO)
  const [lastCompletion, setLastCompletion] = useState<CompletionEvent | null>(null)
  const dataRef = useRef(data)

  // Keep the latest snapshot available to async handlers without reading a ref
  // during render.
  useEffect(() => {
    dataRef.current = data
  }, [data])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setData(authenticated ? await repository.load() : emptyData())
    } finally {
      setLoading(false)
    }
  }, [authenticated])

  useEffect(() => {
    if (!ready) return
    void load()
  }, [ready, load])

  // Roll over to the new day without needing a restart.
  useEffect(() => {
    const interval = setInterval(() => {
      const current = todayISO()
      setToday((previous) => (previous === current ? previous : current))
    }, 60_000)
    return () => clearInterval(interval)
  }, [])

  const { journey, routine, logs } = data

  const todayLog = useMemo(
    () => (journey ? (findLog(logs, today) ?? emptyLog(journey.id, today)) : emptyLog('none', today)),
    [journey, logs, today],
  )

  const todayProgress = useMemo(
    () => (journey && routine ? dayProgress(logs, routine, today) : null),
    [journey, routine, logs, today],
  )

  const stats = useMemo(
    () => (journey && routine ? journeyStats(journey, routine, logs, today) : null),
    [journey, routine, logs, today],
  )

  const achievements = useMemo(() => {
    if (!journey || !routine) return []
    const unlockedAt = Object.fromEntries(
      data.achievements
        .filter((item) => item.unlockedAt)
        .map((item) => [item.type, item.unlockedAt as string]),
    )
    return evaluateAchievements(journey, routine, logs, today, unlockedAt)
  }, [journey, routine, logs, today, data.achievements])

  /**
   * Applies a change to today's log, persists it, and reports what the change
   * completed so the UI can celebrate it.
   */
  const applyToLog = useCallback(
    async (task: TaskId, patch: Partial<DailyLog>) => {
      const snapshot = dataRef.current
      const currentJourney = snapshot.journey
      const currentRoutine = snapshot.routine
      if (!currentJourney || !currentRoutine) return

      const before = dayProgress(snapshot.logs, currentRoutine, today)
      const beforeAchievements = achievements
      const existing = findLog(snapshot.logs, today) ?? emptyLog(currentJourney.id, today)
      const draft: DailyLog = { ...existing, ...patch }

      const nextLogs = snapshot.logs.some((log) => log.date === today)
        ? snapshot.logs.map((log) => (log.date === today ? draft : log))
        : [...snapshot.logs, draft]

      const after = dayProgress(nextLogs, currentRoutine, today)
      // Stamp the moment the day first became complete.
      if (after.isComplete && !draft.completedAt) draft.completedAt = new Date().toISOString()
      if (!after.isComplete) draft.completedAt = null

      const persistedLogs = nextLogs.map((log) => (log.date === today ? draft : log))
      setData({ ...snapshot, logs: persistedLogs })

      const afterAchievements = evaluateAchievements(
        currentJourney,
        currentRoutine,
        persistedLogs,
        today,
      )
      const unlocked = newlyUnlocked(beforeAchievements, afterAchievements)

      const taskJustDone = !before.tasks[task].done && after.tasks[task].done
      const dayJustDone = !before.isComplete && after.isComplete
      if (taskJustDone || dayJustDone || unlocked.length > 0) {
        setLastCompletion({
          task: dayJustDone ? 'day' : task,
          streak: journeyStats(currentJourney, currentRoutine, persistedLogs, today).currentStreak,
          dayComplete: after.isComplete,
          unlocked,
        })
      }

      await repository.saveLog(draft)
      if (unlocked.length > 0) {
        await repository.saveAchievements(
          unlocked.map((item) => ({
            type: item.id,
            unlockedAt: new Date().toISOString(),
            progress: 1,
          })),
        )
        setData((previous) => ({
          ...previous,
          achievements: [
            ...previous.achievements,
            ...unlocked.map((item) => ({
              id: `${item.id}:${today}`,
              userId: previous.user?.id ?? 'local',
              type: item.id,
              unlockedAt: new Date().toISOString(),
              progress: 1,
            })),
          ],
        }))
      }
    },
    [today, achievements],
  )

  const value = useMemo<JourneyValue>(
    () => ({
      loading,
      data,
      today,
      hasJourney: Boolean(journey && routine),
      todayLog,
      todayProgress,
      stats,
      achievements,
      lastCompletion,
      clearCompletion: () => setLastCompletion(null),
      storageMode: usesSupabase ? 'supabase' : 'local',

      async startJourney(input) {
        setData(await repository.startJourney(input))
      },

      async addWater(litres) {
        const next = Math.max(0, Math.round((todayLog.waterAmount + litres) * 100) / 100)
        await applyToLog('water', { waterAmount: next })
      },

      async setWorkoutComplete(complete) {
        await applyToLog('workout', { workoutCompleted: complete })
      },

      async setNutritionComplete(complete) {
        await applyToLog('nutrition', { nutritionCompleted: complete })
      },

      async logSleep(hours) {
        await applyToLog('sleep', { sleepHours: hours })
      },

      async updateRoutine(next) {
        setData((previous) => ({ ...previous, routine: next }))
        await repository.saveRoutine(next)
      },

      async updateName(name) {
        setData((previous) =>
          previous.user ? { ...previous, user: { ...previous.user, name } } : previous,
        )
        await repository.saveUser({ name })
      },

      async updatePreferences(preferences) {
        setData((previous) => ({ ...previous, preferences }))
        await repository.savePreferences(preferences)
      },

      reload: load,

      async deleteEverything() {
        await repository.deleteEverything()
        setData(emptyData())
      },
    }),
    [
      loading,
      data,
      today,
      journey,
      routine,
      todayLog,
      todayProgress,
      stats,
      achievements,
      lastCompletion,
      applyToLog,
      load,
    ],
  )

  return <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>
}

export function useJourney(): JourneyValue {
  const context = useContext(JourneyContext)
  if (!context) throw new Error('useJourney must be used inside <JourneyProvider>')
  return context
}
