import { Redirect } from 'expo-router'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { useAuth } from '../features/auth/useAuth'
import { useJourney } from '../features/journey/JourneyProvider'
import { colors } from '../constants/theme'

/**
 * Entry gate: sign-in when Supabase is configured, onboarding until a journey
 * exists, otherwise straight to Today.
 */
export default function Index() {
  const { ready, authenticated, requiresAuth } = useAuth()
  const { loading, hasJourney } = useJourney()

  if (!ready || loading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color={colors.accent} />
      </View>
    )
  }

  if (requiresAuth && !authenticated) return <Redirect href="/sign-in" />
  if (!hasJourney) return <Redirect href="/onboarding" />
  return <Redirect href="/today" />
}

const styles = StyleSheet.create({
  splash: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
})
