import { useRouter } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'
import { Screen } from '../../components/ui/Screen'
import { Button } from '../../components/ui/Button'
import { Chip } from '../../components/ui/Chip'
import { Stepper } from '../../components/ui/Stepper'
import { StepDots } from '../../components/ui/StepDots'
import { NUTRITION_PLANS } from '../../constants/goals'
import { useOnboardingDraft } from '../../features/routine/useOnboardingDraft'
import { colors, spacing, type } from '../../constants/theme'

export default function RoutineStep() {
  const router = useRouter()
  const { draft, update } = useOnboardingDraft()

  return (
    <Screen
      tabBarInset={false}
      eyebrow="Step 3 of 4"
      title="Build your daily routine"
      subtitle="Four simple targets. Pick numbers you can hit on an ordinary day."
    >
      <StepDots total={4} current={2} />

      <Stepper
        label="Water"
        icon="💧"
        value={draft.waterTarget}
        onChange={(waterTarget) => update({ waterTarget })}
        step={0.25}
        min={0.5}
        max={6}
        unit="L"
        precision={2}
      />

      <View style={styles.block}>
        <Text style={styles.label}>🏋️  Workout</Text>
        <View style={styles.chips}>
          {[2, 3, 4, 5, 6, 7].map((days) => (
            <Chip
              key={days}
              label={`${days} / week`}
              selected={draft.workoutDays === days}
              onPress={() => update({ workoutDays: days })}
            />
          ))}
        </View>
        <Text style={styles.hint}>
          Hit this many and the rest of the week counts as rest, not a miss.
        </Text>
      </View>

      <Stepper
        label="Sleep"
        icon="😴"
        value={draft.sleepTarget}
        onChange={(sleepTarget) => update({ sleepTarget })}
        step={0.5}
        min={4}
        max={12}
        unit="hours"
      />

      <View style={styles.block}>
        <Text style={styles.label}>🥗  Nutrition</Text>
        <View style={styles.chips}>
          {NUTRITION_PLANS.map((plan) => (
            <Chip
              key={plan}
              label={plan}
              selected={draft.nutritionPlan === plan}
              onPress={() => update({ nutritionPlan: plan })}
            />
          ))}
        </View>
      </View>

      <Button
        label="Continue"
        size="lg"
        fullWidth
        onPress={() => router.push('/onboarding/start')}
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  block: { gap: spacing.md },
  label: { ...type.label, color: colors.textMuted },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  hint: { ...type.caption, color: colors.textFaint, fontWeight: '500' },
})
