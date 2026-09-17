import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { ReactNode } from 'react'
import { colors, layout, spacing, type } from '../../constants/theme'

interface ScreenProps {
  children: ReactNode
  /** Large screen title. */
  title?: string
  /** Small uppercase line above the title. */
  eyebrow?: string
  subtitle?: string
  scroll?: boolean
  /** Extra bottom padding so the tab bar never covers content. */
  tabBarInset?: boolean
}

export function Screen({
  children,
  title,
  eyebrow,
  subtitle,
  scroll = true,
  tabBarInset = true,
}: ScreenProps) {
  const header =
    title || eyebrow ? (
      <View style={styles.header}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        {title ? <Text style={styles.title}>{title}</Text> : null}
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    ) : null

  const body = (
    <>
      {header}
      {children}
    </>
  )

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {scroll ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            tabBarInset && { paddingBottom: layout.tabBarHeight + spacing.xxxl },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {body}
        </ScrollView>
      ) : (
        <View style={[styles.content, styles.flex]}>{body}</View>
      )}
    </SafeAreaView>
  )
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <Text style={styles.sectionLabel}>{children}</Text>
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  flex: { flex: 1 },
  content: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  header: { gap: spacing.xs, marginBottom: spacing.xs },
  eyebrow: { ...type.overline, color: colors.textFaint, textTransform: 'uppercase' },
  title: { ...type.title, color: colors.text },
  subtitle: { ...type.body, color: colors.textMuted },
  sectionLabel: {
    ...type.overline,
    color: colors.textFaint,
    textTransform: 'uppercase',
    marginTop: spacing.sm,
  },
})
