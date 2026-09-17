import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { DEFAULT_ROUTINE } from '../../constants/goals'
import type { GoalId } from '../../types'

export interface OnboardingDraft {
  name: string
  goal: GoalId
  customGoal: string
  waterTarget: number
  workoutDays: number
  sleepTarget: number
  nutritionPlan: string
}

interface DraftValue {
  draft: OnboardingDraft
  update(patch: Partial<OnboardingDraft>): void
}

const DraftContext = createContext<DraftValue | null>(null)

/** Holds the answers while the user moves through the four onboarding screens. */
export function OnboardingDraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<OnboardingDraft>({
    name: '',
    goal: 'strength',
    customGoal: '',
    waterTarget: DEFAULT_ROUTINE.waterTarget,
    workoutDays: DEFAULT_ROUTINE.workoutDays,
    sleepTarget: DEFAULT_ROUTINE.sleepTarget,
    nutritionPlan: DEFAULT_ROUTINE.nutritionPlan,
  })

  const value = useMemo<DraftValue>(
    () => ({
      draft,
      update: (patch) => setDraft((previous) => ({ ...previous, ...patch })),
    }),
    [draft],
  )

  return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>
}

export function useOnboardingDraft(): DraftValue {
  const context = useContext(DraftContext)
  if (!context) throw new Error('useOnboardingDraft must be used inside <OnboardingDraftProvider>')
  return context
}
