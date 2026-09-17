import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import * as Haptics from 'expo-haptics'
import { colors, radii, spacing, type } from '../../constants/theme'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'md' | 'lg'

interface ButtonProps {
  label: string
  /** Use when the visible label repeats elsewhere on screen, e.g. "Complete". */
  accessibilityLabel?: string
  onPress?: () => void
  variant?: Variant
  size?: Size
  disabled?: boolean
  loading?: boolean
  /** Small glyph shown before the label. */
  icon?: string
  fullWidth?: boolean
  haptic?: boolean
  style?: StyleProp<ViewStyle>
}

export function Button({
  label,
  accessibilityLabel,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  haptic = true,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={() => {
        if (haptic) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        onPress?.()
      }}
      style={({ pressed }) => [
        styles.base,
        size === 'lg' ? styles.lg : styles.md,
        styles[variant],
        fullWidth && styles.fullWidth,
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'primary' ? colors.onAccent : colors.text}
          />
        ) : (
          <>
            {icon ? <Text style={[styles.icon, textStyles[variant]]}>{icon}</Text> : null}
            <Text style={[styles.label, textStyles[variant], size === 'lg' && styles.labelLg]}>
              {label}
            </Text>
          </>
        )}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  md: { paddingVertical: 13, paddingHorizontal: spacing.xl },
  lg: { paddingVertical: 17, paddingHorizontal: spacing.xxl },
  fullWidth: { alignSelf: 'stretch' },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  primary: { backgroundColor: colors.accent },
  secondary: { backgroundColor: colors.surfaceRaised, borderColor: colors.borderStrong },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: 'transparent', borderColor: colors.danger },
  pressed: { opacity: 0.82, transform: [{ scale: 0.985 }] },
  disabled: { opacity: 0.45 },
  label: { ...type.label, fontSize: 15 },
  labelLg: { fontSize: 16 },
  icon: { fontSize: 15 },
})

const textStyles = StyleSheet.create({
  primary: { color: colors.onAccent, fontWeight: '800' },
  secondary: { color: colors.text, fontWeight: '700' },
  ghost: { color: colors.textMuted, fontWeight: '700' },
  danger: { color: colors.danger, fontWeight: '700' },
})
