import { StyleSheet, View } from 'react-native'
import { colors, spacing } from '../../constants/theme'

export function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <View style={styles.row} accessibilityLabel={`Step ${current + 1} of ${total}`}>
      {Array.from({ length: total }, (_, index) => (
        <View key={index} style={[styles.dot, index <= current && styles.dotOn]} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  dot: { flex: 1, height: 3, borderRadius: 2, backgroundColor: colors.border },
  dotOn: { backgroundColor: colors.accent },
})
