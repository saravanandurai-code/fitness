import { useEffect, useRef, useState } from 'react'
import { Animated, Easing, StyleSheet, Text, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import { colors, radii, spacing, type } from '../../constants/theme'
import type { CompletionEvent } from '../../features/journey/JourneyProvider'

interface CompletionToastProps {
  event: CompletionEvent | null
  onDismiss: () => void
}

const TASK_COPY: Record<string, string> = {
  water: 'Water target hit',
  workout: 'Workout complete',
  nutrition: 'Nutrition complete',
  sleep: 'Sleep logged',
  day: 'Day complete',
}

/** Subtle, quick confirmation after a task is completed. */
export function CompletionToast({ event, onDismiss }: CompletionToastProps) {
  const [progress] = useState(() => new Animated.Value(0))
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!event) return

    void Haptics.notificationAsync(
      event.dayComplete
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Warning,
    )

    progress.setValue(0)
    Animated.timing(progress, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start()

    timeout.current = setTimeout(() => {
      Animated.timing(progress, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) onDismiss()
      })
    }, 2200)

    return () => {
      if (timeout.current) clearTimeout(timeout.current)
    }
  }, [event, progress, onDismiss])

  if (!event) return null

  const unlocked = event.unlocked[0]

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrapper,
        {
          opacity: progress,
          transform: [
            { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) },
            { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) },
          ],
        },
      ]}
    >
      <View style={styles.toast}>
        <Text style={styles.headline}>
          ✓ {unlocked ? `${unlocked.emoji} ${unlocked.title}` : TASK_COPY[event.task]}
        </Text>
        <Text style={styles.detail}>
          {unlocked ? 'Achievement unlocked' : '+1 step toward your journey'}
        </Text>
        {event.streak > 0 ? (
          <Text style={styles.streak}>🔥 {event.streak} day streak</Text>
        ) : null}
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
    bottom: 96,
    alignItems: 'center',
  },
  toast: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(204, 243, 74, 0.35)',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    gap: 2,
  },
  headline: { ...type.heading, color: colors.accent },
  detail: { ...type.caption, color: colors.textMuted, fontWeight: '500' },
  streak: { ...type.label, color: colors.flame, marginTop: spacing.xs },
})
