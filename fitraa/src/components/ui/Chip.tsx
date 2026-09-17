import { Pressable, StyleSheet, Text } from 'react-native'
import * as Haptics from 'expo-haptics'
import { colors, radii, spacing, type } from '../../constants/theme'

interface ChipProps {
  label: string
  selected?: boolean
  onPress: () => void
}

export function Chip({ label, selected = false, onPress }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => {
        void Haptics.selectionAsync()
        onPress()
      }}
      style={({ pressed }) => [styles.chip, selected && styles.selected, pressed && styles.pressed]}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 9,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSunken,
  },
  selected: { backgroundColor: colors.accentSoft, borderColor: 'rgba(204, 243, 74, 0.5)' },
  pressed: { opacity: 0.75 },
  label: { ...type.label, color: colors.textMuted },
  labelSelected: { color: colors.accent, fontWeight: '800' },
})
