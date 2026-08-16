import { DEFAULT_TARGETS } from './defaults'
import type { AppState } from './types'

export const STORAGE_KEY = 'sarv.state.v1'
export const STATE_VERSION = 1

export function emptyState(): AppState {
  return {
    version: STATE_VERSION,
    onboarded: false,
    profile: null,
    targets: { ...DEFAULT_TARGETS },
    sleep: {},
    nutrition: {},
    activity: {},
    workouts: [],
    habits: [],
    habitCompletions: {},
  }
}

export function loadState(): AppState {
  if (typeof localStorage === 'undefined') return emptyState()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyState()
    const parsed = JSON.parse(raw) as Partial<AppState>
    // Merge over a fresh state so missing keys from older saves are filled in.
    return {
      ...emptyState(),
      ...parsed,
      targets: { ...DEFAULT_TARGETS, ...(parsed.targets ?? {}) },
      version: STATE_VERSION,
    }
  } catch {
    return emptyState()
  }
}

export function saveState(state: AppState): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage full or blocked (private mode) — the app still works for this session.
  }
}

export function clearState(): void {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `id-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`
}
