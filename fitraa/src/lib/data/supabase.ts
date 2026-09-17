import { requireSupabase } from '../supabase/client'
import { DEFAULT_PREFERENCES, emptyData } from './repository'
import type { OnboardingInput, Repository, UnlockedAchievement } from './repository'
import type { Database } from '../supabase/types'
import type {
  Achievement,
  DailyLog,
  FitraaData,
  Journey,
  Preferences,
  Routine,
  User,
} from '../../types'

type Tables = Database['public']['Tables']

function toUser(row: Tables['profiles']['Row']): User {
  return { id: row.id, name: row.name, email: row.email, createdAt: row.created_at }
}

function toPreferences(row: Tables['profiles']['Row']): Preferences {
  return { dailyReminders: row.daily_reminders, units: row.units }
}

function toJourney(row: Tables['journeys']['Row']): Journey {
  return {
    id: row.id,
    userId: row.user_id,
    goal: row.goal,
    goalLabel: row.goal_label,
    startDate: row.start_date,
    duration: row.duration,
    status: row.status,
  }
}

function toRoutine(row: Tables['routines']['Row']): Routine {
  return {
    id: row.id,
    journeyId: row.journey_id,
    waterTarget: Number(row.water_target),
    workoutDays: row.workout_days,
    sleepTarget: Number(row.sleep_target),
    nutritionPlan: row.nutrition_plan,
  }
}

function toLog(row: Tables['daily_logs']['Row']): DailyLog {
  return {
    id: row.id,
    journeyId: row.journey_id,
    date: row.date,
    waterAmount: Number(row.water_amount),
    workoutCompleted: row.workout_completed,
    nutritionCompleted: row.nutrition_completed,
    sleepHours: row.sleep_hours === null ? null : Number(row.sleep_hours),
    completedAt: row.completed_at,
  }
}

function toAchievement(row: Tables['achievements']['Row']): Achievement {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    unlockedAt: row.unlocked_at,
    progress: Number(row.progress),
  }
}

async function currentUserId(): Promise<string | null> {
  const { data } = await requireSupabase().auth.getUser()
  return data.user?.id ?? null
}

/** Reads and writes the signed-in user's rows; row level security does the rest. */
export const supabaseRepository: Repository = {
  kind: 'supabase',

  async load(): Promise<FitraaData> {
    const client = requireSupabase()
    const userId = await currentUserId()
    if (!userId) return emptyData()

    const { data: profile } = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (!profile) return emptyData()

    const { data: journeyRow } = await client
      .from('journeys')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!journeyRow) {
      return {
        ...emptyData(),
        user: toUser(profile),
        preferences: toPreferences(profile),
      }
    }

    const [{ data: routineRow }, { data: logRows }, { data: achievementRows }] = await Promise.all([
      client.from('routines').select('*').eq('journey_id', journeyRow.id).maybeSingle(),
      client.from('daily_logs').select('*').eq('journey_id', journeyRow.id).order('date'),
      client.from('achievements').select('*').eq('user_id', userId),
    ])

    return {
      user: toUser(profile),
      journey: toJourney(journeyRow),
      routine: routineRow ? toRoutine(routineRow) : null,
      logs: (logRows ?? []).map(toLog),
      achievements: (achievementRows ?? []).map(toAchievement),
      preferences: toPreferences(profile),
    }
  },

  async startJourney(input: OnboardingInput): Promise<FitraaData> {
    const client = requireSupabase()
    const userId = await currentUserId()
    if (!userId) throw new Error('Sign in before starting a journey.')

    await client
      .from('profiles')
      .upsert({ id: userId, name: input.name, email: input.email })

    const { data: journeyRow, error: journeyError } = await client
      .from('journeys')
      .insert({
        user_id: userId,
        goal: input.goal,
        goal_label: input.goalLabel,
        start_date: input.startDate,
        duration: input.duration,
        status: 'active',
      })
      .select()
      .single()

    if (journeyError || !journeyRow) throw journeyError ?? new Error('Could not create journey.')

    const { error: routineError } = await client.from('routines').insert({
      journey_id: journeyRow.id,
      water_target: input.routine.waterTarget,
      workout_days: input.routine.workoutDays,
      sleep_target: input.routine.sleepTarget,
      nutrition_plan: input.routine.nutritionPlan,
    })
    if (routineError) throw routineError

    return supabaseRepository.load()
  },

  async saveLog(log: DailyLog): Promise<void> {
    const { error } = await requireSupabase()
      .from('daily_logs')
      .upsert(
        {
          journey_id: log.journeyId,
          date: log.date,
          water_amount: log.waterAmount,
          workout_completed: log.workoutCompleted,
          nutrition_completed: log.nutritionCompleted,
          sleep_hours: log.sleepHours,
          completed_at: log.completedAt,
        },
        { onConflict: 'journey_id,date' },
      )
    if (error) throw error
  },

  async saveRoutine(routine: Routine): Promise<void> {
    const { error } = await requireSupabase()
      .from('routines')
      .update({
        water_target: routine.waterTarget,
        workout_days: routine.workoutDays,
        sleep_target: routine.sleepTarget,
        nutrition_plan: routine.nutritionPlan,
      })
      .eq('journey_id', routine.journeyId)
    if (error) throw error
  },

  async saveUser(patch: Partial<Pick<User, 'name' | 'email'>>): Promise<void> {
    const userId = await currentUserId()
    if (!userId) return
    const { error } = await requireSupabase().from('profiles').update(patch).eq('id', userId)
    if (error) throw error
  },

  async savePreferences(preferences: Preferences): Promise<void> {
    const userId = await currentUserId()
    if (!userId) return
    const { error } = await requireSupabase()
      .from('profiles')
      .update({ daily_reminders: preferences.dailyReminders, units: preferences.units })
      .eq('id', userId)
    if (error) throw error
  },

  async saveAchievements(unlocked: UnlockedAchievement[]): Promise<void> {
    if (unlocked.length === 0) return
    const userId = await currentUserId()
    if (!userId) return
    const { error } = await requireSupabase()
      .from('achievements')
      .upsert(
        unlocked.map((item) => ({
          user_id: userId,
          type: item.type,
          unlocked_at: item.unlockedAt,
          progress: item.progress,
        })),
        { onConflict: 'user_id,type' },
      )
    if (error) throw error
  },

  async deleteEverything(): Promise<void> {
    const client = requireSupabase()
    const userId = await currentUserId()
    if (!userId) return
    // Cascades remove journeys, routines, logs and achievements with the profile.
    const { error } = await client.from('profiles').delete().eq('id', userId)
    if (error) throw error
    await client.auth.signOut()
  },
}

export { DEFAULT_PREFERENCES }
