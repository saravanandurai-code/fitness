import { Stack } from 'expo-router'
import { OnboardingDraftProvider } from '../../features/routine/useOnboardingDraft'
import { colors } from '../../constants/theme'

export default function OnboardingLayout() {
  return (
    <OnboardingDraftProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
          animation: 'slide_from_right',
        }}
      />
    </OnboardingDraftProvider>
  )
}
