import { StyleSheet, View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import type { ReactNode } from 'react'
import { colors, radii, spacing } from '../../constants/theme'

interface CardProps {
  children: ReactNode
  /** 'raised' for modals and sheets, 'outline' for quieter blocks. */
  tone?: 'default' | 'raised' | 'outline'
  padded?: boolean
  style?: StyleProp<ViewStyle>
}

export function Card({ children, tone = 'default', padded = true, style }: CardProps) {
  return (
    <View style={[styles.card, styles[tone], padded && styles.padded, style]}>{children}</View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  default: { backgroundColor: colors.surface, borderColor: colors.border },
  raised: { backgroundColor: colors.surfaceRaised, borderColor: colors.borderStrong },
  outline: { backgroundColor: 'transparent', borderColor: colors.border },
  padded: { padding: spacing.lg },
})
