import { useState } from 'react'
import { useRouter } from 'expo-router'
import { Share, StyleSheet, Switch, Text, View } from 'react-native'
import { Screen, SectionLabel } from '../../components/ui/Screen'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Chip } from '../../components/ui/Chip'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { useJourney } from '../../features/journey/JourneyProvider'
import { useAuth } from '../../features/auth/useAuth'
import { plural } from '../../lib/utils/date'
import { colors, spacing, type } from '../../constants/theme'
import type { Units } from '../../types'

export default function Profile() {
  const router = useRouter()
  const { data, stats, storageMode, updateName, updatePreferences, deleteEverything } = useJourney()
  const { requiresAuth, signOut } = useAuth()

  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(data.user?.name ?? '')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [busy, setBusy] = useState(false)

  const { user, journey, routine, preferences } = data

  const exportData = async () => {
    await Share.share({
      title: 'Fitraa data export',
      message: JSON.stringify({ user, journey, routine, logs: data.logs }, null, 2),
    })
  }

  const remove = async () => {
    setBusy(true)
    await deleteEverything()
    setConfirmDelete(false)
    setBusy(false)
    router.replace('/')
  }

  return (
    <>
      <Screen eyebrow="Your profile" title={user?.name ?? 'Athlete'}>
        <Card style={styles.identity}>
          <Avatar name={user?.name ?? 'Athlete'} />
          <View style={styles.identityCopy}>
            <Text style={styles.name}>{user?.name ?? 'Athlete'}</Text>
            <Text style={styles.email}>{user?.email ?? 'Stored on this device'}</Text>
          </View>
          <Button
            label="Edit"
            variant="secondary"
            onPress={() => {
              setNameDraft(user?.name ?? '')
              setEditingName(true)
            }}
          />
        </Card>

        <SectionLabel>Current journey</SectionLabel>
        <Card style={styles.journey}>
          <Text style={styles.journeyTitle}>{journey?.goalLabel ?? 'No journey yet'}</Text>
          {journey && stats ? (
            <Text style={styles.journeyMeta}>
              Day {stats.day} of {journey.duration} · {plural(stats.completeDays, 'day')} complete
              · {plural(stats.currentStreak, 'day')} streak
            </Text>
          ) : null}
          <Badge
            label={storageMode === 'supabase' ? 'Syncing with Supabase' : 'Saved on this device'}
            tone={storageMode === 'supabase' ? 'success' : 'neutral'}
          />
        </Card>

        <SectionLabel>Notifications</SectionLabel>
        <Card style={styles.settingRow}>
          <View style={styles.settingCopy}>
            <Text style={styles.settingLabel}>Daily reminders</Text>
            <Text style={styles.settingNote}>One quiet nudge a day, nothing more.</Text>
          </View>
          <Switch
            value={preferences.dailyReminders}
            onValueChange={(dailyReminders) =>
              void updatePreferences({ ...preferences, dailyReminders })
            }
            trackColor={{ true: colors.accentDim, false: colors.border }}
            thumbColor={preferences.dailyReminders ? colors.accent : colors.textFaint}
          />
        </Card>

        <SectionLabel>Units</SectionLabel>
        <Card style={styles.units}>
          {(
            [
              { id: 'metric' as Units, label: 'Litres · kg' },
              { id: 'imperial' as Units, label: 'Fl oz · lb' },
            ]
          ).map((option) => (
            <Chip
              key={option.id}
              label={option.label}
              selected={preferences.units === option.id}
              onPress={() => void updatePreferences({ ...preferences, units: option.id })}
            />
          ))}
        </Card>

        <SectionLabel>Data</SectionLabel>
        <Card style={styles.dataCard}>
          <Button label="Export data" variant="secondary" fullWidth onPress={exportData} />
          {requiresAuth ? (
            <Button label="Sign out" variant="ghost" fullWidth onPress={() => void signOut()} />
          ) : null}
          <Button
            label="Delete account"
            variant="danger"
            fullWidth
            onPress={() => setConfirmDelete(true)}
          />
        </Card>

        <Text style={styles.footnote}>
          Fitraa is a commitment system, not a medical product. Targets are yours to set and adjust.
        </Text>
      </Screen>

      <Modal
        visible={editingName}
        title="Your name"
        onClose={() => setEditingName(false)}
      >
        <Input value={nameDraft} onChangeText={setNameDraft} placeholder="Your name" autoCapitalize="words" />
        <Button
          label="Save"
          fullWidth
          disabled={nameDraft.trim().length === 0}
          onPress={() => {
            void updateName(nameDraft.trim())
            setEditingName(false)
          }}
        />
      </Modal>

      <Modal
        visible={confirmDelete}
        title="Delete everything?"
        subtitle="Your journey, logs and achievements are removed for good. Export first if you want a copy."
        onClose={() => setConfirmDelete(false)}
      >
        <Button label="Keep my data" variant="secondary" fullWidth onPress={() => setConfirmDelete(false)} />
        <Button label="Delete account" variant="danger" fullWidth loading={busy} onPress={remove} />
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  identityCopy: { flex: 1, gap: 2 },
  name: { ...type.heading, color: colors.text },
  email: { ...type.caption, color: colors.textFaint, fontWeight: '500' },
  journey: { gap: spacing.sm },
  journeyTitle: { ...type.heading, color: colors.accent },
  journeyMeta: { ...type.caption, color: colors.textMuted, fontWeight: '500' },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  settingCopy: { flex: 1, gap: 2 },
  settingLabel: { ...type.body, color: colors.text, fontWeight: '600' },
  settingNote: { ...type.caption, color: colors.textFaint, fontWeight: '500' },
  units: { flexDirection: 'row', gap: spacing.sm },
  dataCard: { gap: spacing.md },
  footnote: { ...type.caption, color: colors.textFaint, fontWeight: '500' },
})
