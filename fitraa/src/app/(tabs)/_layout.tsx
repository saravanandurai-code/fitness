import { Redirect, Tabs } from 'expo-router'
import { StyleSheet, Text } from 'react-native'
import { useJourney } from '../../features/journey/JourneyProvider'
import { colors, layout, type } from '../../constants/theme'

const TABS = [
  { name: 'today', title: 'Today', icon: '◉' },
  { name: 'plan', title: 'Plan', icon: '◈' },
  { name: 'progress', title: 'Progress', icon: '◧' },
  { name: 'achievements', title: 'Awards', icon: '◆' },
  { name: 'profile', title: 'Profile', icon: '◍' },
] as const

export default function TabsLayout() {
  const { hasJourney, loading } = useJourney()

  // Guard direct links into the tabs before a journey exists.
  if (!loading && !hasJourney) return <Redirect href="/onboarding" />

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.bg },
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarLabelStyle: styles.label,
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color }) => <Text style={[styles.icon, { color }]}>{tab.icon}</Text>,
          }}
        />
      ))}
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surfaceSunken,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: layout.tabBarHeight,
    paddingTop: 8,
    paddingBottom: 12,
  },
  label: { ...type.caption, fontSize: 11 },
  icon: { fontSize: 17, lineHeight: 20 },
})
