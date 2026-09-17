import { useState } from 'react'
import { useRouter } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'
import { Screen } from '../../components/ui/Screen'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Warrior } from '../../components/ui/Warrior'
import { StepDots } from '../../components/ui/StepDots'
import { GOAL_LABELS, JOURNEY_DURATION } from '../../constants/goals'
import { useOnboardingDraft } from '../../features/routine/useOnboardingDraft'
import { useJourney } from '../../features/journey/JourneyProvider'
import { todayISO } from '../../lib/utils/date'
import { colors, spacing, type } from '../../constants/theme'

export default function StartStep() {
  const router = useRouter()
  const { draft } = useOnboardingDraft()
  const { startJourney } = useJourney()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const goalLabel =
    draft.goal === 'custom' ? draft.customGoal.trim() : GOAL_LABELS[draft.goal]

  const begin = async () => {
    setBusy(true)
    setError(null)
    try {
      await startJourney({
        name: draft.name.trim(),
        email: null,
        goal: draft.goal,
        goalLabel,
        startDate: todayISO(),
        duration: JOURNEY_DURATION,
        routine: {
          waterTarget: draft.waterTarget,
          workoutDays: draft.workoutDays,
          sleepTarget: draft.sleepTarget,
          nutritionPlan: draft.nutritionPlan,
        },
      })
      router.replace('/today')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not start your journey.')
      setBusy(false)
    }
  }

  return (
    <Screen tabBarInset={false}>
      <StepDots total={4} current={3} />

      <View style={styles.hero}>
        <Warrior size={140} />
      </View>

      <Text style={styles.title}>Your {JOURNEY_DURATION}-day journey starts now.</Text>
      <Text style={styles.lines}>
        Don&apos;t chase perfection.{'\n'}Just keep showing up.
      </Text>

      <Card style={styles.summary}>
        <Row label="Goal" value={goalLabel} />
        <Row label="Duration" value={`${JOURNEY_DURATION} days`} />
        <Row label="Water" value={`${draft.waterTarget.toFixed(2)} L / day`} />
        <Row label="Workout" value={`${draft.workoutDays} days / week`} />
        <Row label="Sleep" value={`${draft.sleepTarget} hours`} />
        <Row label="Nutrition" value={draft.nutritionPlan} />
      </Card>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button label="Start Journey" size="lg" fullWidth loading={busy} onPress={begin} />
    </Screen>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginTop: spacing.md },
  title: { ...type.title, color: colors.text, marginTop: spacing.md },
  lines: { ...type.body, fontSize: 16, lineHeight: 25, color: colors.textMuted },
  summary: { gap: spacing.md, marginTop: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md },
  rowLabel: { ...type.label, color: colors.textFaint },
  rowValue: { ...type.label, color: colors.text, fontWeight: '700' },
  error: { ...type.caption, color: colors.danger, fontWeight: '600' },
})
