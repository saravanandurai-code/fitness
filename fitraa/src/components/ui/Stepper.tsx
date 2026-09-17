import { Pressable, StyleSheet, Text, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import { colors, radii, spacing, type } from '../../constants/theme'

interface StepperProps {
  value: number
  onChange: (value: number) => void
  step: number
  min: number
  max: number
  /** Unit shown after the value, e.g. "L" or "hours". */
  unit?: string
  /** Decimal places for display. */
  precision?: number
  label?: string
  icon?: string
}

/** Tap-to-adjust numeric control — no keyboard needed. */
export function Stepper({
  value,
  onChange,
  step,
  min,
  max,
  unit,
  precision = 1,
  label,
  icon,
}: StepperProps) {
  const set = (next: number) => {
    const clamped = Math.min(max, Math.max(min, Math.round(next / step) * step))
    void Haptics.selectionAsync()
    onChange(Number(clamped.toFixed(2)))
  }

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text style={styles.label}>
          {icon ? `${icon}  ` : ''}
          {label}
        </Text>
      ) : null}
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Decrease ${label ?? 'value'}`}
          onPress={() => set(value - step)}
          disabled={value <= min}
          style={({ pressed }) => [styles.button, pressed && styles.pressed, value <= min && styles.disabled]}
        >
          <Text style={styles.buttonText}>−</Text>
        </Pressable>

        <View style={styles.readout}>
          <Text style={styles.value}>{value.toFixed(precision)}</Text>
          {unit ? <Text style={styles.unit}>{unit}</Text> : null}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Increase ${label ?? 'value'}`}
          onPress={() => set(value + step)}
          disabled={value >= max}
          style={({ pressed }) => [styles.button, pressed && styles.pressed, value >= max && styles.disabled]}
        >
          <Text style={styles.buttonText}>+</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.sm },
  label: { ...type.label, color: colors.textMuted },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceSunken,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
  },
  button: {
    width: 46,
    height: 46,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.35 },
  buttonText: { color: colors.text, fontSize: 22, fontWeight: '700', lineHeight: 24 },
  readout: { flex: 1, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', gap: spacing.xs },
  value: { ...type.metric, color: colors.text },
  unit: { ...type.label, color: colors.textMuted },
})
