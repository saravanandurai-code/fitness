import { useState } from 'react'
import { useRouter } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'
import { Screen } from '../components/ui/Screen'
import { Button } from '../components/ui/Button'
import { Chip } from '../components/ui/Chip'
import { Stepper } from '../components/ui/Stepper'
import { NUTRITION_PLANS } from '../constants/goals'
import { useJourney } from '../features/journey/JourneyProvider'
import { colors, spacing, type } from '../constants/theme'

export default function EditPlan() {
  const router = useRouter()
  const { data, updateRoutine } = useJourney()
  const routine = data.routine

  const [waterTarget, setWaterTarget] = useState(routine?.waterTarget ?? 3)
  const [workoutDays, setWorkoutDays] = useState(routine?.workoutDays ?? 5)
  const [sleepTarget, setSleepTarget] = useState(routine?.sleepTarget ?? 8)
  const [nutritionPlan, setNutritionPlan] = useState(routine?.nutritionPlan ?? 'High protein')
  const [busy, setBusy] = useState(false)

  if (!routine) return null

  const save = async () => {
    setBusy(true)
    await updateRoutine({ ...routine, waterTarget, workoutDays, sleepTarget, nutritionPlan })
    router.back()
  }

  return (
    <Screen
      tabBarInset={false}
      eyebrow="Edit plan"
      title="Adjust your routine"
      subtitle="Changing a target affects today onward — past days keep their original result."
    >
      <Stepper
        label="Water"
        icon="💧"
        value={waterTarget}
        onChange={setWaterTarget}
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
              selected={workoutDays === days}
              onPress={() => setWorkoutDays(days)}
            />
          ))}
        </View>
      </View>

      <Stepper
        label="Sleep"
        icon="😴"
        value={sleepTarget}
        onChange={setSleepTarget}
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
              selected={nutritionPlan === plan}
              onPress={() => setNutritionPlan(plan)}
            />
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        <Button label="Cancel" variant="ghost" onPress={() => router.back()} />
        <Button label="Save plan" loading={busy} onPress={save} style={styles.save} />
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  block: { gap: spacing.md },
  label: { ...type.label, color: colors.textMuted },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.sm },
  save: { flex: 1 },
})
