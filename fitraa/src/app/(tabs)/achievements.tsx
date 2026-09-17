import { StyleSheet, Text, View } from 'react-native'
import { Screen, SectionLabel } from '../../components/ui/Screen'
import { Card } from '../../components/ui/Card'
import { Warrior } from '../../components/ui/Warrior'
import { AchievementCard } from '../../components/achievements/AchievementCard'
import { useJourney } from '../../features/journey/JourneyProvider'
import { colors, spacing, type } from '../../constants/theme'

export default function Achievements() {
  const { achievements } = useJourney()
  const unlocked = achievements.filter((item) => item.unlocked)
  const locked = achievements.filter((item) => !item.unlocked)

  return (
    <Screen
      eyebrow="Achievements"
      title={`${unlocked.length} of ${achievements.length} earned`}
      subtitle="Earned by showing up, not by buying anything."
    >
      {unlocked.length === 0 ? (
        <Card style={styles.empty}>
          <Warrior size={112} />
          <Text style={styles.emptyTitle}>Nothing earned yet</Text>
          <Text style={styles.emptyCopy}>
            Complete every task in a single day and your first badge is yours.
          </Text>
        </Card>
      ) : (
        <>
          <SectionLabel>Earned</SectionLabel>
          {unlocked.map((item) => (
            <AchievementCard key={item.id} achievement={item} />
          ))}
        </>
      )}

      {locked.length > 0 ? (
        <>
          <SectionLabel>In progress</SectionLabel>
          {locked.map((item) => (
            <AchievementCard key={item.id} achievement={item} />
          ))}
        </>
      ) : null}

      <View style={styles.note}>
        <Text style={styles.noteText}>
          Physical rewards are not part of this version. For now the badge is the reward.
        </Text>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  emptyTitle: { ...type.heading, color: colors.text, marginTop: spacing.sm },
  emptyCopy: { ...type.body, color: colors.textMuted, textAlign: 'center' },
  note: { marginTop: spacing.sm },
  noteText: { ...type.caption, color: colors.textFaint, fontWeight: '500' },
})
