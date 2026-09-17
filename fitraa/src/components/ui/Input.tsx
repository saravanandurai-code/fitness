import { useState } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'
import type { KeyboardTypeOptions, StyleProp, ViewStyle } from 'react-native'
import { colors, radii, spacing, type } from '../../constants/theme'

interface InputProps {
  label?: string
  value: string
  onChangeText: (value: string) => void
  placeholder?: string
  keyboardType?: KeyboardTypeOptions
  secureTextEntry?: boolean
  autoCapitalize?: 'none' | 'sentences' | 'words'
  autoFocus?: boolean
  /** Unit shown inside the field, e.g. "L" or "hours". */
  suffix?: string
  hint?: string
  style?: StyleProp<ViewStyle>
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  secureTextEntry,
  autoCapitalize = 'sentences',
  autoFocus,
  suffix,
  hint,
  style,
}: InputProps) {
  const [focused, setFocused] = useState(false)

  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.field, focused && styles.fieldFocused]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textFaint}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          autoFocus={autoFocus}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={styles.input}
          accessibilityLabel={label}
        />
        {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
      </View>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.sm },
  label: { ...type.label, color: colors.textMuted },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceSunken,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
  },
  fieldFocused: { borderColor: colors.accent },
  input: { flex: 1, paddingVertical: 14, color: colors.text, ...type.body, fontSize: 16 },
  suffix: { ...type.label, color: colors.textFaint },
  hint: { ...type.caption, color: colors.textFaint, fontWeight: '500' },
})
