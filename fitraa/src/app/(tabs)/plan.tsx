import { useRouter } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'
import { Screen, SectionLabel } from '../../components/ui/Screen'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { useJourney } from '../../features/journey/JourneyProvider'
import { colors, spacing, taskColors, type } from '../../constants/theme'

export default function Plan() {
  const router = useRouter()
  const { data, stats } = useJourney()
  const { journey, routine } = data
  if (!journey || !routine || !stats) return null

  return (
    <Screen eyebrow="My plan" title={journey.goalLabel}>
      <Card style={styles.overview}>
        <View style={styles.overviewItem}>
          <Text style={styles.overviewLabel}>Duration</Text>
          <Text style={styles.overviewValue}>{journey.duration} days</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.overviewItem}>
          <Text style={styles.overviewLabel}>Progress</Text>
          <Text style={styles.overviewValue}>
            Day {stats.day} / {journey.duration}
          </Text>
        </View>
      </Card>

      <SectionLabel>Daily routine</SectionLabel>

      <Card padded={false}>
        <PlanRow icon="💧" label="Water" value={`${routine.waterTarget.toFixed(2)} L`} color={taskColors.water} />
        <PlanRow
          icon="🏋️"
          label="Workout"
          value={`${routine.workoutDays} days / week`}
          color={taskColors.workout}
        />
        <PlanRow icon="🥗" label="Nutrition" value={routine.nutritionPlan} color={taskColors.nutrition} />
        <PlanRow
          icon="😴"
          label="Sleep"
          value={`${routine.sleepTarget} hours`}
          color={taskColors.sleep}
          last
        />
      </Card>

      <Button label="Edit Plan" variant="secondary" fullWidth onPress={() => router.push('/edit-plan')} />

      <Text style={styles.footnote}>
        Keep the targets realistic. A routine you can repeat on a bad day beats a perfect one you
        abandon.
      </Text>
    </Screen>
  )
}

function PlanRow({
  icon,
  label,
  value,
  color,
  last = false,
}: {
  icon: string
  label: string
  value: string
  color: string
  last?: boolean
}) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <View style={[styles.iconWrap, { borderColor: color }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  overview: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  overviewItem: { flex: 1, gap: 4 },
  overviewLabel: { ...type.label, color: colors.textFaint },
  overviewValue: { ...type.heading, color: colors.text },
  divider: { width: 1, alignSelf: 'stretch', backgroundColor: colors.border },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSunken,
  },
  icon: { fontSize: 17 },
  rowLabel: { ...type.body, color: colors.textMuted, flex: 1 },
  rowValue: { ...type.label, color: colors.text, fontWeight: '700' },
  footnote: { ...type.caption, color: colors.textFaint, fontWeight: '500' },
})
