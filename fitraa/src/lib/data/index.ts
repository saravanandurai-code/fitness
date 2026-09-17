import { isSupabaseConfigured } from '../supabase/client'
import { localRepository } from './local'
import { supabaseRepository } from './supabase'
import type { Repository } from './repository'

/**
 * Supabase when it is configured, on-device storage otherwise. Picking the
 * adapter once here keeps every screen unaware of where data lives.
 */
export const repository: Repository = isSupabaseConfigured ? supabaseRepository : localRepository

export const usesSupabase = isSupabaseConfigured

export * from './repository'
