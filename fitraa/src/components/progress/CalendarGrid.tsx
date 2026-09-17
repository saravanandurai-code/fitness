import { StyleSheet, Text, View } from 'react-native'
import { calendarWeeks, weekdayInitials } from '../../lib/utils/date'
import { colors, radii, spacing, type } from '../../constants/theme'

interface CalendarGridProps {
  startDate: string
  duration: number
  today: string
  /** Returns true when that date's routine was fully completed. */
  isComplete: (date: string) => boolean
}

export function CalendarGrid({ startDate, duration, today, isComplete }: CalendarGridProps) {
  const weeks = calendarWeeks(startDate, duration)

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        {weekdayInitials.map((initial, index) => (
          <Text key={`${initial}-${index}`} style={styles.weekday}>
            {initial}
          </Text>
        ))}
      </View>

      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} style={styles.row}>
          {week.map((date, dayIndex) => {
            if (!date) return <View key={`empty-${dayIndex}`} style={styles.cell} />

            const done = isComplete(date)
            const isToday = date === today
            const future = date > today

            return (
              <View
                key={date}
                accessibilityLabel={`${date}: ${done ? 'complete' : future ? 'upcoming' : 'missed'}`}
                style={[
                  styles.cell,
                  styles.cellFilled,
                  done && styles.cellDone,
                  isToday && styles.cellToday,
                  future && styles.cellFuture,
                ]}
              >
                <Text style={[styles.mark, done && styles.markDone, future && styles.markFuture]}>
                  {done ? '✓' : future ? '·' : '○'}
                </Text>
              </View>
            )
          })}
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm },
  weekday: { ...type.caption, color: colors.textFaint, flex: 1, textAlign: 'center' },
  cell: { flex: 1, aspectRatio: 1, borderRadius: radii.sm, alignItems: 'center', justifyContent: 'center' },
  cellFilled: { backgroundColor: colors.surfaceSunken, borderWidth: 1, borderColor: colors.border },
  cellDone: { backgroundColor: colors.accentSoft, borderColor: 'rgba(204, 243, 74, 0.4)' },
  cellToday: { borderColor: colors.accent, borderWidth: 2 },
  cellFuture: { backgroundColor: 'transparent', borderColor: colors.border },
  mark: { ...type.caption, color: colors.textFaint },
  markDone: { color: colors.accent, fontWeight: '800' },
  markFuture: { color: colors.textFaint, opacity: 0.6 },
})
