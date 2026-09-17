import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Button } from '../ui/Button'
import { ProgressBar } from '../ui/ProgressBar'
import { colors, radii, spacing, type } from '../../constants/theme'

interface TaskRowProps {
  icon: string
  title: string
  /** The measured state, e.g. "2.1 / 3.0 L". */
  value: string
  progress: number
  color: string
  done: boolean
  actionLabel: string
  onAction: () => void
  /** Shown instead of the action when the task needs nothing today. */
  note?: string
  /** Secondary tap target on the whole row, e.g. to open a sheet. */
  onPress?: () => void
}

export function TaskRow({
  icon,
  title,
  value,
  progress,
  color,
  done,
  actionLabel,
  onAction,
  note,
  onPress,
}: TaskRowProps) {
  const content = (
    <>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { borderColor: done ? color : colors.border }]}>
          <Text style={styles.icon}>{icon}</Text>
        </View>

        <View style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          <Text style={[styles.value, done && { color }]}>{value}</Text>
        </View>

        {done ? (
          <View style={[styles.check, { backgroundColor: color }]}>
            <Text style={styles.checkMark}>✓</Text>
          </View>
        ) : note ? (
          <Text style={styles.note}>{note}</Text>
        ) : (
          <Button
            label={actionLabel}
            accessibilityLabel={`${actionLabel} ${title.toLowerCase()}`}
            variant="secondary"
            onPress={onAction}
          />
        )}
      </View>

      <ProgressBar progress={progress} color={color} height={6} />
    </>
  )

  // A row without its own tap target stays a plain View: marking a Pressable
  // disabled would also disable the action button inside it.
  if (!onPress) {
    return <View style={styles.row}>{content}</View>
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}: ${value}`}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  pressed: { opacity: 0.9 },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: radii.md,
    borderWidth: 1,
    backgroundColor: colors.surfaceSunken,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 19 },
  copy: { flex: 1, gap: 2 },
  title: { ...type.label, color: colors.textMuted },
  value: { ...type.heading, color: colors.text },
  check: {
    width: 34,
    height: 34,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: { color: colors.onAccent, fontSize: 16, fontWeight: '800' },
  note: { ...type.caption, color: colors.textFaint, maxWidth: 104, textAlign: 'right' },
})
