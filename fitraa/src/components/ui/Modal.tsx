import { Modal as RNModal, Pressable, StyleSheet, Text, View } from 'react-native'
import type { ReactNode } from 'react'
import { colors, radii, spacing, type } from '../../constants/theme'

interface ModalProps {
  visible: boolean
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
}

/** Bottom sheet used for quick logging actions. */
export function Modal({ visible, title, subtitle, onClose, children }: ModalProps) {
  return (
    <RNModal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />
      <View style={styles.sheet}>
        <View style={styles.grabber} />
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        <View style={styles.body}>{children}</View>
      </View>
    </RNModal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  sheet: {
    backgroundColor: colors.surfaceRaised,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderTopWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
    gap: spacing.xs,
  },
  grabber: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
    marginBottom: spacing.lg,
  },
  title: { ...type.heading, color: colors.text },
  subtitle: { ...type.body, color: colors.textMuted },
  body: { marginTop: spacing.lg, gap: spacing.lg },
})
