import { useRouter } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Screen } from '../../components/ui/Screen'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { StepDots } from '../../components/ui/StepDots'
import { GOALS } from '../../constants/goals'
import { useOnboardingDraft } from '../../features/routine/useOnboardingDraft'
import { colors, radii, spacing, type } from '../../constants/theme'

export default function GoalStep() {
  const router = useRouter()
  const { draft, update } = useOnboardingDraft()
  const needsCustom = draft.goal === 'custom'
  const canContinue = !needsCustom || draft.customGoal.trim().length > 0

  return (
    <Screen
      tabBarInset={false}
      eyebrow="Step 2 of 4"
      title="What are you training for?"
      subtitle="This frames your whole journey. You can change it later."
    >
      <StepDots total={4} current={1} />

      <View style={styles.options}>
        {GOALS.map((goal) => {
          const selected = draft.goal === goal.id
          return (
            <Pressable
              key={goal.id}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => update({ goal: goal.id })}
              style={({ pressed }) => [
                styles.option,
                selected && styles.optionSelected,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.emoji}>{goal.emoji}</Text>
              <View style={styles.copy}>
                <Text style={[styles.optionTitle, selected && styles.optionTitleSelected]}>
                  {goal.label}
                </Text>
                <Text style={styles.optionBlurb}>{goal.blurb}</Text>
              </View>
              {selected ? <Text style={styles.tick}>✓</Text> : null}
            </Pressable>
          )
        })}
      </View>

      {needsCustom ? (
        <Input
          label="Your commitment"
          value={draft.customGoal}
          onChangeText={(customGoal) => update({ customGoal })}
          placeholder="e.g. Train for a half marathon"
        />
      ) : null}

      <Button
        label="Continue"
        size="lg"
        fullWidth
        disabled={!canContinue}
        onPress={() => router.push('/onboarding/routine')}
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  options: { gap: spacing.md },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionSelected: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  pressed: { opacity: 0.85 },
  emoji: { fontSize: 22 },
  copy: { flex: 1, gap: 2 },
  optionTitle: { ...type.heading, fontSize: 17, color: colors.text },
  optionTitleSelected: { color: colors.accent },
  optionBlurb: { ...type.caption, color: colors.textFaint, fontWeight: '500' },
  tick: { color: colors.accent, fontSize: 16, fontWeight: '800' },
})
