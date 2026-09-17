import { StyleSheet, Text, View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { colors, radii, spacing, type } from '../../constants/theme'

interface BadgeProps {
  label: string
  tone?: 'neutral' | 'accent' | 'flame' | 'success'
  icon?: string
  style?: StyleProp<ViewStyle>
}

export function Badge({ label, tone = 'neutral', icon, style }: BadgeProps) {
  return (
    <View style={[styles.badge, tones[tone].container, style]}>
      {icon ? <Text style={styles.icon}>{icon}</Text> : null}
      <Text style={[styles.label, tones[tone].text]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    paddingVertical: 5,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  label: { ...type.caption },
  icon: { fontSize: 12 },
})

const tones = {
  neutral: {
    container: { backgroundColor: colors.surfaceRaised, borderColor: colors.border },
    text: { color: colors.textMuted },
  },
  accent: {
    container: { backgroundColor: colors.accentSoft, borderColor: 'rgba(204, 243, 74, 0.35)' },
    text: { color: colors.accent },
  },
  flame: {
    container: { backgroundColor: colors.flameSoft, borderColor: 'rgba(255, 107, 53, 0.35)' },
    text: { color: colors.flame },
  },
  success: {
    container: { backgroundColor: 'rgba(52, 211, 153, 0.14)', borderColor: 'rgba(52, 211, 153, 0.35)' },
    text: { color: colors.success },
  },
} as const
