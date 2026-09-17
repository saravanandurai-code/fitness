import { useState } from 'react'
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native'
import { Screen } from '../../components/ui/Screen'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Warrior } from '../../components/ui/Warrior'
import { useAuth } from '../../features/auth/useAuth'
import { colors, spacing, type } from '../../constants/theme'

/** Only reachable when Supabase is configured. */
export default function SignIn() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    setBusy(true)
    setError(null)
    try {
      if (mode === 'sign-in') await signIn(email.trim(), password)
      else await signUp(email.trim(), password, name.trim() || 'Athlete')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Something went wrong. Try again.')
    } finally {
      setBusy(false)
    }
  }

  const canSubmit = email.trim().length > 3 && password.length >= 6

  return (
    <Screen tabBarInset={false}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.hero}>
          <Warrior size={104} />
        </View>

        <Text style={styles.title}>
          {mode === 'sign-in' ? 'Welcome back' : 'Create your account'}
        </Text>
        <Text style={styles.subtitle}>
          {mode === 'sign-in'
            ? 'Pick up your journey where you left off.'
            : 'Your journey syncs across your devices.'}
        </Text>

        <View style={styles.form}>
          {mode === 'sign-up' ? (
            <Input label="Name" value={name} onChangeText={setName} placeholder="Your name" autoCapitalize="words" />
          ) : null}
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 6 characters"
            secureTextEntry
            autoCapitalize="none"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            label={mode === 'sign-in' ? 'Sign in' : 'Create account'}
            size="lg"
            fullWidth
            loading={busy}
            disabled={!canSubmit}
            onPress={submit}
          />
          <Button
            label={mode === 'sign-in' ? 'I need an account' : 'I already have an account'}
            variant="ghost"
            fullWidth
            onPress={() => {
              setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')
              setError(null)
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.xl },
  title: { ...type.title, color: colors.text },
  subtitle: { ...type.body, color: colors.textMuted, marginTop: spacing.xs },
  form: { gap: spacing.lg, marginTop: spacing.xl },
  error: { ...type.caption, color: colors.danger, fontWeight: '600' },
})
