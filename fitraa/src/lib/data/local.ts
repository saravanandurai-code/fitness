import AsyncStorage from '@react-native-async-storage/async-storage'
import { DEFAULT_PREFERENCES, emptyData } from './repository'
import type { OnboardingInput, Repository, UnlockedAchievement } from './repository'
import type { Achievement, DailyLog, FitraaData, Preferences, Routine, User } from '../../types'

const STORAGE_KEY = 'fitraa.data.v1'

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

async function read(): Promise<FitraaData> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyData()
    const parsed = JSON.parse(raw) as Partial<FitraaData>
    return {
      ...emptyData(),
      ...parsed,
      logs: parsed.logs ?? [],
      achievements: parsed.achievements ?? [],
      preferences: { ...DEFAULT_PREFERENCES, ...(parsed.preferences ?? {}) },
    }
  } catch {
    return emptyData()
  }
}

async function write(data: FitraaData): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

/** Stores the whole journey on the device. No account needed. */
export const localRepository: Repository = {
  kind: 'local',

  load: read,

  async startJourney(input: OnboardingInput): Promise<FitraaData> {
    const userId = newId('user')
    const journeyId = newId('journey')
    const user: User = {
      id: userId,
      name: input.name,
      email: input.email,
      createdAt: new Date().toISOString(),
    }
    const data: FitraaData = {
      user,
      journey: {
        id: journeyId,
        userId,
        goal: input.goal,
        goalLabel: input.goalLabel,
        startDate: input.startDate,
        duration: input.duration,
        status: 'active',
      },
      routine: { id: newId('routine'), journeyId, ...input.routine },
      logs: [],
      achievements: [],
      preferences: { ...DEFAULT_PREFERENCES },
    }
    await write(data)
    return data
  },

  async saveLog(log: DailyLog): Promise<void> {
    const data = await read()
    const logs = data.logs.some((entry) => entry.date === log.date)
      ? data.logs.map((entry) => (entry.date === log.date ? log : entry))
      : [...data.logs, log]
    await write({ ...data, logs })
  },

  async saveRoutine(routine: Routine): Promise<void> {
    const data = await read()
    await write({ ...data, routine })
  },

  async saveUser(patch: Partial<Pick<User, 'name' | 'email'>>): Promise<void> {
    const data = await read()
    if (!data.user) return
    await write({ ...data, user: { ...data.user, ...patch } })
  },

  async savePreferences(preferences: Preferences): Promise<void> {
    const data = await read()
    await write({ ...data, preferences })
  },

  async saveAchievements(unlocked: UnlockedAchievement[]): Promise<void> {
    const data = await read()
    if (!data.user) return
    const existing = new Map(data.achievements.map((item) => [item.type, item]))
    for (const item of unlocked) {
      if (existing.has(item.type)) continue
      const achievement: Achievement = {
        id: newId('achv'),
        userId: data.user.id,
        type: item.type,
        unlockedAt: item.unlockedAt,
        progress: item.progress,
      }
      existing.set(item.type, achievement)
    }
    await write({ ...data, achievements: [...existing.values()] })
  },

  async deleteEverything(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEY)
  },
}
