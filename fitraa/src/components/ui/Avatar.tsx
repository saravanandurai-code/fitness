import { StyleSheet, Text, View } from 'react-native'
import { colors, radii, type } from '../../constants/theme'

interface AvatarProps {
  name: string
  size?: number
}

export function Avatar({ name, size = 56 }: AvatarProps) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <View
      style={[styles.avatar, { width: size, height: size, borderRadius: radii.pill }]}
      accessibilityLabel={`Avatar for ${name}`}
    >
      <Text style={[styles.initials, { fontSize: size * 0.34 }]}>{initials || '·'}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: 'rgba(204, 243, 74, 0.32)',
  },
  initials: { ...type.heading, color: colors.accent },
})
