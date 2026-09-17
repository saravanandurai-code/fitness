import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

const url = process.env.EXPO_PUBLIC_SUPABASE_URL
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

/** True when both env vars are present, i.e. the app should talk to Supabase. */
export const isSupabaseConfigured = Boolean(url && anonKey)

/**
 * Null when Supabase is not configured — the app then falls back to on-device
 * storage, so a fresh clone runs with no setup.
 */
export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured
  ? createClient<Database>(url as string, anonKey as string, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        // React Native has no URL bar to read a session back from.
        detectSessionInUrl: false,
      },
    })
  : null

export function requireSupabase(): SupabaseClient<Database> {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.',
    )
  }
  return supabase
}
