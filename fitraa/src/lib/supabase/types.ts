import type { AchievementId, GoalId, JourneyStatus, Units } from '../../types'

/** Row shapes for the tables created by schema.sql. */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          email: string | null
          daily_reminders: boolean
          units: Units
          created_at: string
        }
        Insert: {
          id: string
          name: string
          email?: string | null
          daily_reminders?: boolean
          units?: Units
        }
        Update: Partial<{
          name: string
          email: string | null
          daily_reminders: boolean
          units: Units
        }>
        Relationships: []
      }
      journeys: {
        Row: {
          id: string
          user_id: string
          goal: GoalId
          goal_label: string
          start_date: string
          duration: number
          status: JourneyStatus
          created_at: string
        }
        Insert: {
          user_id: string
          goal: GoalId
          goal_label: string
          start_date: string
          duration?: number
          status?: JourneyStatus
        }
        Update: Partial<{
          goal: GoalId
          goal_label: string
          start_date: string
          duration: number
          status: JourneyStatus
        }>
        Relationships: []
      }
      routines: {
        Row: {
          id: string
          journey_id: string
          water_target: number
          workout_days: number
          sleep_target: number
          nutrition_plan: string
        }
        Insert: {
          journey_id: string
          water_target: number
          workout_days: number
          sleep_target: number
          nutrition_plan: string
        }
        Update: Partial<{
          water_target: number
          workout_days: number
          sleep_target: number
          nutrition_plan: string
        }>
        Relationships: []
      }
      daily_logs: {
        Row: {
          id: string
          journey_id: string
          date: string
          water_amount: number
          workout_completed: boolean
          nutrition_completed: boolean
          sleep_hours: number | null
          completed_at: string | null
        }
        Insert: {
          journey_id: string
          date: string
          water_amount?: number
          workout_completed?: boolean
          nutrition_completed?: boolean
          sleep_hours?: number | null
          completed_at?: string | null
        }
        Update: Partial<{
          water_amount: number
          workout_completed: boolean
          nutrition_completed: boolean
          sleep_hours: number | null
          completed_at: string | null
        }>
        Relationships: []
      }
      achievements: {
        Row: {
          id: string
          user_id: string
          type: AchievementId
          unlocked_at: string | null
          progress: number
        }
        Insert: {
          user_id: string
          type: AchievementId
          unlocked_at?: string | null
          progress?: number
        }
        Update: Partial<{
          unlocked_at: string | null
          progress: number
        }>
        Relationships: []
      }
    }
    Views: Record<never, never>
    Functions: Record<never, never>
    Enums: Record<never, never>
    CompositeTypes: Record<never, never>
  }
}
