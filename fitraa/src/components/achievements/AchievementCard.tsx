import { StyleSheet, Text, View } from 'react-native'
import { ProgressBar } from '../ui/ProgressBar'
import { colors, radii, spacing, type } from '../../constants/theme'
import type { AchievementState } from '../../features/achievements/definitions'

export function AchievementCard({ achievement }: { achievement: AchievementState }) {
  const { emoji, title, description, unlocked, value, target, unit, progress } = achievement

  return (
    <View
      style={[styles.card, unlocked && styles.unlockedCard]}
      accessibilityLabel={`${title}, ${unlocked ? 'unlocked' : `${value} of ${target} ${unit}`}`}
    >
      <View style={styles.head}>
        <View style={[styles.medal, unlocked && styles.medalUnlocked]}>
          <Text style={[styles.emoji, !unlocked && styles.emojiLocked]}>{emoji}</Text>
        </View>
        <View style={styles.copy}>
          <Text style={[styles.title, unlocked && styles.titleUnlocked]}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      </View>

      {unlocked ? (
        <Text style={styles.unlockedLabel}>Unlocked</Text>
      ) : (
        <View style={styles.progress}>
          <ProgressBar progress={progress} height={6} color={colors.accentDim} />
          <Text style={styles.progressLabel}>
            {value} / {target} {unit}
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  unlockedCard: { borderColor: 'rgba(204, 243, 74, 0.34)', backgroundColor: colors.accentSoft },
  head: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  medal: {
    width: 46,
    height: 46,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceSunken,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medalUnlocked: { backgroundColor: 'rgba(204, 243, 74, 0.16)', borderColor: 'rgba(204, 243, 74, 0.4)' },
  emoji: { fontSize: 22 },
  emojiLocked: { opacity: 0.45 },
  copy: { flex: 1, gap: 2 },
  title: { ...type.heading, fontSize: 17, color: colors.textMuted },
  titleUnlocked: { color: colors.text },
  description: { ...type.caption, color: colors.textFaint, fontWeight: '500' },
  progress: { gap: spacing.sm },
  progressLabel: { ...type.caption, color: colors.textFaint },
  unlockedLabel: { ...type.caption, color: colors.accent },
})
