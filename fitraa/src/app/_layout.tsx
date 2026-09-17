import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AuthProvider } from '../features/auth/useAuth'
import { JourneyProvider } from '../features/journey/JourneyProvider'
import { colors } from '../constants/theme'

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <JourneyProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.bg },
              animation: 'fade',
            }}
          >
            <Stack.Screen name="edit-plan" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          </Stack>
        </JourneyProvider>
      </AuthProvider>
    </SafeAreaProvider>
  )
}
