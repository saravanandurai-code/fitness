import { useRouter } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'
import { Screen } from '../../components/ui/Screen'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Warrior } from '../../components/ui/Warrior'
import { StepDots } from '../../components/ui/StepDots'
import { useOnboardingDraft } from '../../features/routine/useOnboardingDraft'
import { colors, spacing, type } from '../../constants/theme'

export default function Welcome() {
  const router = useRouter()
  const { draft, update } = useOnboardingDraft()

  return (
    <Screen tabBarInset={false}>
      <StepDots total={4} current={0} />

      <View style={styles.hero}>
        <Warrior size={150} />
      </View>

      <Text style={styles.title}>Welcome to Fitraa</Text>
      <Text style={styles.lines}>
        Build your routine.{'\n'}Keep your commitment.{'\n'}Become stronger.
      </Text>

      <View style={styles.form}>
        <Input
          label="What should we call you?"
          value={draft.name}
          onChangeText={(name) => update({ name })}
          placeholder="Your name"
          autoCapitalize="words"
        />
      </View>

      <Button
        label="Get Started"
        size="lg"
        fullWidth
        disabled={draft.name.trim().length === 0}
        onPress={() => router.push('/onboarding/goal')}
        style={styles.cta}
      />
      <Text style={styles.footnote}>Train. Track. Transform.</Text>
    </Screen>
  )
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginTop: spacing.lg },
  title: { ...type.display, color: colors.text, marginTop: spacing.lg },
  lines: { ...type.body, fontSize: 17, lineHeight: 27, color: colors.textMuted },
  form: { marginTop: spacing.xl },
  cta: { marginTop: spacing.xl },
  footnote: { ...type.overline, color: colors.textFaint, textAlign: 'center', textTransform: 'uppercase' },
})
