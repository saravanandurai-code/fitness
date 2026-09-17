import { StyleSheet, View } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import type { ReactNode } from 'react'
import { colors } from '../../constants/theme'

interface ProgressRingProps {
  /** 0–1. */
  progress: number
  size?: number
  thickness?: number
  color?: string
  trackColor?: string
  children?: ReactNode
}

export function ProgressRing({
  progress,
  size = 132,
  thickness = 11,
  color = colors.accent,
  trackColor = colors.surfaceRaised,
  children,
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(1, progress))
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={thickness}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped)}
          fill="none"
          // Start the sweep at 12 o'clock.
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children ? <View style={styles.center}>{children}</View> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
