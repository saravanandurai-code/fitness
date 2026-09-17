import { useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Screen, SectionLabel } from '../../components/ui/Screen'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { CalendarGrid } from '../../components/progress/CalendarGrid'
import { useJourney } from '../../features/journey/JourneyProvider'
import { isDayComplete } from '../../features/daily-log/progress'
import { plural } from '../../lib/utils/date'
import { colors, spacing, taskColors, type } from '../../constants/theme'
import type { TaskId } from '../../types'

const TASK_META: Record<TaskId, { label: string; icon: string; color: string }> = {
  workout: { label: 'Workout', icon: '🏋️', color: taskColors.workout },
  water: { label: 'Water', icon: '💧', color: taskColors.water },
  nutrition: { label: 'Nutrition', icon: '🥗', color: taskColors.nutrition },
  sleep: { label: 'Sleep', icon: '😴', color: taskColors.sleep },
}

export default function Progress() {
  const { data, stats, today } = useJourney()
  const { journey, routine, logs } = data

  const complete = useMemo(
    () => (date: string) => (routine ? isDayComplete(logs, routine, date) : false),
    [logs, routine],
  )

  if (!journey || !routine || !stats) return null

  const consistency = Math.round(stats.consistency * 100)

  return (
    <Screen eyebrow="Your progress" title={`${journey.duration} day journey`}>
      <Card style={styles.headline}>
        <ProgressBar progress={stats.day / journey.duration} segments={journey.duration} height={14} />
        <View style={styles.headlineRow}>
          <Text style={styles.dayCount}>
            {stats.day} <Text style={styles.dayOf}>/ {journey.duration} days</Text>
          </Text>
          <Badge
            label={`${plural(stats.currentStreak, 'day')} streak`}
            icon="🔥"
            tone={stats.currentStreak > 0 ? 'flame' : 'neutral'}
          />
        </View>
      </Card>

      <View style={styles.statRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Consistency</Text>
          <Text style={styles.statValue}>{consistency}%</Text>
          <Text style={styles.statNote}>
            {stats.completeDays} of {plural(stats.elapsed, 'day')} complete
          </Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Best streak</Text>
          <Text style={styles.statValue}>{stats.longestStreak}</Text>
          <Text style={styles.statNote}>
            {stats.longestStreak === 1 ? 'day' : 'days'} in a row
          </Text>
        </Card>
      </View>

      <SectionLabel>Task completion</SectionLabel>
      <Card style={styles.tasks}>
        {(Object.keys(TASK_META) as TaskId[]).map((id) => {
          const tally = stats.tallies[id]
          const meta = TASK_META[id]
          const ratio = tally.of === 0 ? 0 : tally.done / tally.of
          return (
            <View key={id} style={styles.taskRow}>
              <Text style={styles.taskLabel}>
                {meta.icon} {meta.label}
              </Text>
              <View style={styles.taskBar}>
                <ProgressBar progress={ratio} color={meta.color} height={6} />
              </View>
              <Text style={styles.taskCount}>
                {tally.done} / {tally.of}
              </Text>
            </View>
          )
        })}
      </Card>

      <SectionLabel>Calendar</SectionLabel>
      <Card>
        <CalendarGrid
          startDate={journey.startDate}
          duration={journey.duration}
          today={today}
          isComplete={complete}
        />
      </Card>

      <Text style={styles.footnote}>
        {consistency >= 80
          ? 'You are becoming genuinely consistent. Keep the routine boring and repeatable.'
          : 'Consistency is built from ordinary days. One completed day today moves this number.'}
      </Text>
    </Screen>
  )
}

const styles = StyleSheet.create({
  headline: { gap: spacing.lg },
  headlineRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  dayCount: { ...type.title, color: colors.text },
  dayOf: { ...type.body, color: colors.textFaint },
  statRow: { flexDirection: 'row', gap: spacing.md },
  statCard: { flex: 1, gap: 4 },
  statLabel: { ...type.label, color: colors.textFaint },
  statValue: { ...type.metric, color: colors.accent },
  statNote: { ...type.caption, color: colors.textFaint, fontWeight: '500' },
  tasks: { gap: spacing.lg },
  taskRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  taskLabel: { ...type.label, color: colors.textMuted, width: 104 },
  taskBar: { flex: 1 },
  taskCount: { ...type.caption, color: colors.text, width: 52, textAlign: 'right' },
  footnote: { ...type.caption, color: colors.textFaint, fontWeight: '500' },
})
