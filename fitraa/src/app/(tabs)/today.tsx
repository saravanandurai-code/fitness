import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Screen, SectionLabel } from '../../components/ui/Screen'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Modal } from '../../components/ui/Modal'
import { ProgressRing } from '../../components/ui/ProgressRing'
import { Stepper } from '../../components/ui/Stepper'
import { Warrior } from '../../components/ui/Warrior'
import { TaskRow } from '../../components/today/TaskRow'
import { CompletionToast } from '../../components/today/CompletionToast'
import { useJourney } from '../../features/journey/JourneyProvider'
import { formatHours, greeting, plural } from '../../lib/utils/date'
import { colors, spacing, taskColors, type } from '../../constants/theme'

/** One tap adds a glass; the sheet covers bigger pours. */
const GLASS_LITRES = 0.25

export default function Today() {
  const {
    data,
    stats,
    todayLog,
    todayProgress,
    lastCompletion,
    clearCompletion,
    addWater,
    setWorkoutComplete,
    setNutritionComplete,
    logSleep,
  } = useJourney()

  const [waterOpen, setWaterOpen] = useState(false)
  const [sleepOpen, setSleepOpen] = useState(false)
  const [sleepDraft, setSleepDraft] = useState(todayLog.sleepHours ?? 7.5)

  const { journey, routine, user } = data
  if (!journey || !routine || !stats || !todayProgress) return null

  const percent = Math.round(todayProgress.completion * 100)
  const tasks = todayProgress.tasks
  const journeyComplete = stats.day >= journey.duration && todayProgress.isComplete

  return (
    <>
      <Screen>
        <View style={styles.head}>
          <Text style={styles.greeting}>
            {greeting()} {user?.name ? user.name.split(' ')[0] : ''} 👋
          </Text>
          <SectionLabel>Your goal</SectionLabel>
          <Text style={styles.goal}>{journey.goalLabel}</Text>
        </View>

        <Card style={styles.hero}>
          <ProgressRing progress={todayProgress.completion} size={124}>
            <Text style={styles.ringValue}>{percent}%</Text>
            <Text style={styles.ringCaption}>Today</Text>
          </ProgressRing>

          <View style={styles.heroCopy}>
            <Text style={styles.day}>
              Day {stats.day} <Text style={styles.dayOf}>of {journey.duration}</Text>
            </Text>
            <Badge
              label={`${plural(stats.currentStreak, 'day')} streak`}
              icon="🔥"
              tone={stats.currentStreak > 0 ? 'flame' : 'neutral'}
            />
            <Text style={styles.heroNote}>
              {todayProgress.isComplete
                ? 'Today is done. Rest well and come back tomorrow.'
                : 'Finish your routine to keep the streak alive.'}
            </Text>
          </View>
        </Card>

        <SectionLabel>Today</SectionLabel>

        <TaskRow
          icon="💧"
          title="Water"
          value={`${todayLog.waterAmount.toFixed(2)} / ${routine.waterTarget.toFixed(2)} L`}
          progress={tasks.water.ratio}
          color={taskColors.water}
          done={tasks.water.done}
          actionLabel="+ Add water"
          onAction={() => void addWater(GLASS_LITRES)}
          onPress={() => setWaterOpen(true)}
        />

        <TaskRow
          icon="🏋️"
          title="Workout"
          value={
            tasks.workout.done
              ? 'Completed'
              : tasks.workout.required
                ? `${routine.workoutDays} days / week`
                : 'Rest day'
          }
          progress={tasks.workout.ratio}
          color={taskColors.workout}
          done={tasks.workout.done}
          actionLabel="Complete"
          onAction={() => void setWorkoutComplete(true)}
          note={tasks.workout.required ? undefined : 'Weekly target met'}
        />

        <TaskRow
          icon="🥗"
          title="Nutrition"
          value={tasks.nutrition.done ? 'Completed' : routine.nutritionPlan}
          progress={tasks.nutrition.ratio}
          color={taskColors.nutrition}
          done={tasks.nutrition.done}
          actionLabel="Complete"
          onAction={() => void setNutritionComplete(true)}
        />

        <TaskRow
          icon="😴"
          title="Sleep"
          value={
            todayLog.sleepHours === null
              ? `Target ${routine.sleepTarget} h`
              : `${formatHours(todayLog.sleepHours)} / ${routine.sleepTarget} h`
          }
          progress={tasks.sleep.ratio}
          color={taskColors.sleep}
          done={tasks.sleep.done}
          actionLabel="Log sleep"
          onAction={() => {
            setSleepDraft(todayLog.sleepHours ?? routine.sleepTarget)
            setSleepOpen(true)
          }}
          onPress={() => {
            setSleepDraft(todayLog.sleepHours ?? routine.sleepTarget)
            setSleepOpen(true)
          }}
        />

        {journeyComplete ? (
          <Card style={styles.finale}>
            <Warrior size={96} />
            <Text style={styles.finaleTitle}>{journey.duration} days. Done.</Text>
            <Text style={styles.finaleCopy}>
              You showed up {stats.completeDays} times out of {journey.duration}. That is the whole
              point.
            </Text>
          </Card>
        ) : null}
      </Screen>

      <Modal
        visible={waterOpen}
        title="Add water"
        subtitle={`${todayLog.waterAmount.toFixed(2)} L of ${routine.waterTarget.toFixed(2)} L so far`}
        onClose={() => setWaterOpen(false)}
      >
        <View style={styles.waterButtons}>
          {[0.25, 0.5, 0.75, 1].map((litres) => (
            <Button
              key={litres}
              label={`+ ${litres.toFixed(2)} L`}
              variant="secondary"
              onPress={() => void addWater(litres)}
            />
          ))}
        </View>
        <Button
          label="Remove a glass"
          variant="ghost"
          onPress={() => void addWater(-GLASS_LITRES)}
        />
        <Button label="Done" fullWidth onPress={() => setWaterOpen(false)} />
      </Modal>

      <Modal
        visible={sleepOpen}
        title="Log sleep"
        subtitle="How long did you actually sleep last night?"
        onClose={() => setSleepOpen(false)}
      >
        <Stepper
          value={sleepDraft}
          onChange={setSleepDraft}
          step={0.25}
          min={0}
          max={14}
          unit="hours"
          precision={2}
        />
        <Button
          label="Save sleep"
          fullWidth
          onPress={() => {
            void logSleep(sleepDraft)
            setSleepOpen(false)
          }}
        />
      </Modal>

      <CompletionToast event={lastCompletion} onDismiss={clearCompletion} />
    </>
  )
}

const styles = StyleSheet.create({
  head: { gap: 2 },
  greeting: { ...type.title, color: colors.text },
  goal: { ...type.heading, color: colors.accent },
  hero: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, paddingVertical: spacing.xl },
  heroCopy: { flex: 1, gap: spacing.sm },
  ringValue: { ...type.metric, fontSize: 27, color: colors.text },
  ringCaption: { ...type.overline, color: colors.textFaint, textTransform: 'uppercase' },
  day: { ...type.heading, color: colors.text },
  dayOf: { color: colors.textFaint, fontWeight: '600' },
  heroNote: { ...type.caption, color: colors.textFaint, fontWeight: '500' },
  waterButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  finale: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  finaleTitle: { ...type.title, color: colors.accent, textAlign: 'center' },
  finaleCopy: { ...type.body, color: colors.textMuted, textAlign: 'center' },
})
