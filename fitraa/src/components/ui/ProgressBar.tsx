import { StyleSheet, View } from 'react-native'
import { colors, radii } from '../../constants/theme'

interface ProgressBarProps {
  /** 0–1. */
  progress: number
  color?: string
  height?: number
  /** Splits the bar into segments, one per journey day. */
  segments?: number
}

export function ProgressBar({
  progress,
  color = colors.accent,
  height = 10,
  segments,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(1, progress))

  if (segments && segments > 0) {
    const filled = Math.round(clamped * segments)
    return (
      <View style={[styles.segmentRow, { height }]}>
        {Array.from({ length: segments }, (_, index) => (
          <View
            key={index}
            style={[
              styles.segment,
              { backgroundColor: index < filled ? color : colors.surfaceRaised },
            ]}
          />
        ))}
      </View>
    )
  }

  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      <View
        style={[
          styles.fill,
          { width: `${clamped * 100}%`, backgroundColor: color, borderRadius: height / 2 },
        ]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  track: { backgroundColor: colors.surfaceRaised, overflow: 'hidden' },
  fill: { height: '100%' },
  segmentRow: { flexDirection: 'row', gap: 3 },
  segment: { flex: 1, borderRadius: radii.sm / 2 },
})
