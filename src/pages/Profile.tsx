import { useMemo, useState } from 'react'
import { Card, CardTitle, Field, Modal } from '../components/ui'
import { formatDuration, todayISO } from '../lib/date'
import { GLASS_ML, GOALS } from '../lib/defaults'
import { getDaySummary } from '../lib/summary'
import { useActions, useAppState } from '../state/store'
import type { Goal } from '../lib/types'

export default function Profile() {
  const state = useAppState()
  const actions = useActions()
  const today = todayISO()
  const profile = state.profile
  const targets = state.targets
  const summary = useMemo(() => getDaySummary(state, today), [state, today])

  const [confirmReset, setConfirmReset] = useState(false)

  if (!profile) return null

  const nudges = [
    summary.water.ratio < 0.8
      ? `💧 You've had ${(summary.water.ml / 1000).toFixed(1)}L today. Keep going toward your ${(targets.waterMl / 1000).toFixed(1)}L goal.`
      : null,
    summary.workout.status === 'none' && summary.workout.weekCount < targets.workoutsPerWeek
      ? `🏋️ ${summary.workout.weekCount} of ${targets.workoutsPerWeek} workouts this week — no rush, there's still time.`
      : null,
    !summary.sleep.logged ? '😴 Sleep for last night isn\'t logged yet.' : null,
    summary.habits.total > summary.habits.completed
      ? `🔥 ${summary.habits.total - summary.habits.completed} habit${
          summary.habits.total - summary.habits.completed === 1 ? '' : 's'
        } still open today.`
      : null,
  ].filter(Boolean) as string[]

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sarv-data-${today}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="stack">
      <div className="page-head">
        <h1>Profile</h1>
        <p className="muted small">Your routine and goals. Change these whenever life changes.</p>
      </div>

      <Card className="stack">
        <CardTitle title="About you" />
        <Field label="Name">
          <input
            className="input"
            value={profile.name}
            onChange={(e) => actions.updateProfile({ name: e.target.value })}
          />
        </Field>
        <div className="field-row">
          <Field label="Age">
            <input
              className="input"
              type="number"
              value={profile.age ?? ''}
              onChange={(e) =>
                actions.updateProfile({ age: e.target.value ? Number(e.target.value) : undefined })
              }
            />
          </Field>
          <Field label="Gender (optional)">
            <select
              className="input"
              value={profile.gender ?? ''}
              onChange={(e) => actions.updateProfile({ gender: e.target.value || undefined })}
            >
              <option value="">Prefer not to say</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </Field>
        </div>
        <div className="field-row">
          <Field label="Height (cm)">
            <input
              className="input"
              type="number"
              value={profile.heightCm ?? ''}
              onChange={(e) =>
                actions.updateProfile({ heightCm: e.target.value ? Number(e.target.value) : undefined })
              }
            />
          </Field>
          <Field label="Weight (kg)">
            <input
              className="input"
              type="number"
              value={profile.weightKg ?? ''}
              onChange={(e) =>
                actions.updateProfile({ weightKg: e.target.value ? Number(e.target.value) : undefined })
              }
            />
          </Field>
        </div>
      </Card>

      <Card className="stack">
        <CardTitle title="Your goal" />
        <div className="row wrap">
          {GOALS.map((g) => (
            <button
              key={g.id}
              type="button"
              className={`chip${profile.goal === g.id ? ' selected' : ''}`}
              onClick={() => actions.updateProfile({ goal: g.id as Goal })}
            >
              {g.emoji} {g.label}
            </button>
          ))}
        </div>
      </Card>

      <Card className="stack">
        <CardTitle title="Your routine" />
        <Field label="Typical work schedule">
          <input
            className="input"
            value={profile.workSchedule}
            onChange={(e) => actions.updateProfile({ workSchedule: e.target.value })}
          />
        </Field>
        <Field label="Preferred workout time">
          <input
            className="input"
            value={profile.preferredWorkoutTime}
            onChange={(e) => actions.updateProfile({ preferredWorkoutTime: e.target.value })}
          />
        </Field>
        <div className="field-row">
          <Field label="Usual sleep time">
            <input
              className="input"
              type="time"
              value={profile.typicalSleepTime}
              onChange={(e) => actions.updateProfile({ typicalSleepTime: e.target.value })}
            />
          </Field>
          <Field label="Usual wake-up time">
            <input
              className="input"
              type="time"
              value={profile.typicalWakeTime}
              onChange={(e) => actions.updateProfile({ typicalWakeTime: e.target.value })}
            />
          </Field>
        </div>
      </Card>

      <Card className="stack">
        <CardTitle title="Daily targets" />
        <Field label={`Sleep — ${formatDuration(targets.sleepMinutes)}`}>
          <input
            type="range"
            min={300}
            max={600}
            step={15}
            value={targets.sleepMinutes}
            onChange={(e) => actions.updateTargets({ sleepMinutes: Number(e.target.value) })}
          />
        </Field>
        <Field
          label={`Water — ${(targets.waterMl / 1000).toFixed(1)}L`}
          hint={`About ${Math.round(targets.waterMl / GLASS_ML)} glasses a day`}
        >
          <input
            type="range"
            min={1000}
            max={4000}
            step={250}
            value={targets.waterMl}
            onChange={(e) => actions.updateTargets({ waterMl: Number(e.target.value) })}
          />
        </Field>
        <Field label={`Workouts — ${targets.workoutsPerWeek} a week`}>
          <input
            type="range"
            min={1}
            max={7}
            value={targets.workoutsPerWeek}
            onChange={(e) => actions.updateTargets({ workoutsPerWeek: Number(e.target.value) })}
          />
        </Field>
        <Field label={`Steps — ${targets.steps.toLocaleString()} a day`}>
          <input
            type="range"
            min={3000}
            max={15000}
            step={500}
            value={targets.steps}
            onChange={(e) => actions.updateTargets({ steps: Number(e.target.value) })}
          />
        </Field>
        <Field label={`Protein — ${targets.proteinG}g a day`}>
          <input
            type="range"
            min={40}
            max={200}
            step={5}
            value={targets.proteinG}
            onChange={(e) => actions.updateTargets({ proteinG: Number(e.target.value) })}
          />
        </Field>
        <Field label={`Meals — ${targets.mealsPerDay} a day`}>
          <input
            type="range"
            min={2}
            max={5}
            value={targets.mealsPerDay}
            onChange={(e) => actions.updateTargets({ mealsPerDay: Number(e.target.value) })}
          />
        </Field>
      </Card>

      <Card className="stack-sm">
        <CardTitle title="Gentle nudges" action={<span className="pill">In-app only</span>} />
        {nudges.length === 0 ? (
          <p className="small muted">Nothing needs a nudge right now. Enjoy the day.</p>
        ) : (
          nudges.map((n) => (
            <p key={n} className="small">
              {n}
            </p>
          ))
        )}
        <p className="footnote" style={{ marginTop: 6 }}>
          Sarv keeps reminders minimal on purpose — a handful of quiet prompts inside the app, never
          a stream of notifications.
        </p>
      </Card>

      <Card className="stack-sm">
        <CardTitle title="Your data" />
        <p className="small muted">
          Everything you track stays in this browser. Nothing is uploaded to a server.
        </p>
        <div className="row wrap" style={{ marginTop: 6 }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={exportData}>
            Export as JSON
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={actions.loadSampleData}>
            Fill two sample weeks
          </button>
          <button type="button" className="btn btn-danger btn-sm" onClick={() => setConfirmReset(true)}>
            Reset everything
          </button>
        </div>
        <p className="footnote">
          Sample data is useful for seeing how Progress looks before you have your own history.
        </p>
      </Card>

      <p className="footnote">
        Sarv is a lifestyle companion, not a medical device. Scores, targets and suggestions are
        general guidance and should not replace advice from a qualified healthcare professional.
      </p>

      {confirmReset ? (
        <Modal
          title="Reset everything?"
          subtitle="This clears your profile, habits and all tracked history from this browser."
          onClose={() => setConfirmReset(false)}
        >
          <p className="small muted">
            You can export your data first if you'd like to keep a copy. This cannot be undone.
          </p>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setConfirmReset(false)}>
              Keep my data
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                actions.resetEverything()
                setConfirmReset(false)
              }}
            >
              Reset everything
            </button>
          </div>
        </Modal>
      ) : null}
    </div>
  )
}
