import { useMemo, useState } from 'react'
import { Card, CardTitle, Empty, Field, Modal } from '../components/ui'
import { formatDuration, relativeDayLabel, shortDayLabel, todayISO, weekDates } from '../lib/date'
import { EXERCISE_LIBRARY, WORKOUT_PLANS } from '../lib/defaults'
import { workoutsInWeek } from '../lib/summary'
import { useActions, useAppState } from '../state/store'
import type { ExerciseKind, Workout } from '../lib/types'

function setsSummary(w: Workout): string {
  const sets = w.exercises.reduce((sum, e) => sum + e.sets.filter((s) => s.done).length, 0)
  const volume = w.exercises.reduce(
    (sum, e) => sum + e.sets.reduce((s2, s) => s2 + (s.done ? (s.reps ?? 0) * (s.weightKg ?? 0) : 0), 0),
    0,
  )
  return volume > 0
    ? `${w.exercises.length} exercises · ${sets} sets · ${Math.round(volume).toLocaleString()} kg lifted`
    : `${w.exercises.length} exercises · ${sets} sets`
}

export default function WorkoutPage() {
  const state = useAppState()
  const actions = useActions()
  const today = todayISO()

  const [planPickerOpen, setPlanPickerOpen] = useState(false)
  const [exercisePickerFor, setExercisePickerFor] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [summaryFor, setSummaryFor] = useState<string | null>(null)
  const [customTitle, setCustomTitle] = useState('')

  const active = state.workouts.find((w) => w.status === 'active')
  const plannedToday = state.workouts.find((w) => w.date === today && w.status === 'planned')
  const completed = useMemo(
    () =>
      state.workouts
        .filter((w) => w.status === 'completed')
        .sort((a, b) => (a.date < b.date ? 1 : -1)),
    [state.workouts],
  )
  const thisWeek = workoutsInWeek(state, today)
  const weekDaysWithWorkout = new Set(thisWeek.map((w) => w.date))
  const summaryWorkout = summaryFor ? state.workouts.find((w) => w.id === summaryFor) : null

  const startFromPlan = (planId: string, dayIndex: number, status: 'active' | 'planned') => {
    const plan = WORKOUT_PLANS.find((p) => p.id === planId)
    if (!plan) return
    const day = plan.days[dayIndex]
    actions.createWorkout({
      date: today,
      title: `${plan.name} — ${day.title}`,
      planId: plan.id,
      exercises: day.exercises,
      status,
    })
    setPlanPickerOpen(false)
  }

  const startCustom = () => {
    actions.createWorkout({
      date: today,
      title: customTitle.trim() || 'Custom workout',
      exercises: [],
      status: 'active',
    })
    setCustomTitle('')
    setPlanPickerOpen(false)
  }

  const filteredLibrary = EXERCISE_LIBRARY.filter((e) =>
    e.name.toLowerCase().includes(search.trim().toLowerCase()),
  )

  return (
    <div className="stack">
      <div className="page-head">
        <h1>Workout</h1>
        <p className="muted small">
          Training is one part of your day. Keep the sessions simple and repeatable.
        </p>
      </div>

      {active ? (
        <ActiveSession
          workout={active}
          onAddExercise={() => setExercisePickerFor(active.id)}
          onFinish={() => {
            actions.completeWorkout(active.id)
            setSummaryFor(active.id)
          }}
        />
      ) : (
        <Card className="stack">
          <CardTitle
            title="Start a session"
            action={
              <span className="pill pill-brand">
                {thisWeek.length} / {state.targets.workoutsPerWeek} this week
              </span>
            }
          />
          {plannedToday ? (
            <div className="row-between">
              <div>
                <div className="strong">{plannedToday.title}</div>
                <div className="tiny muted">Planned for today</div>
              </div>
              <div className="row" style={{ gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => actions.deleteWorkout(plannedToday.id)}
                >
                  Remove
                </button>
                <button type="button" className="btn btn-sm" onClick={() => actions.startWorkout(plannedToday.id)}>
                  Start
                </button>
              </div>
            </div>
          ) : (
            <p className="small muted">
              Pick a plan below, or start something custom. A 30-minute session still counts.
            </p>
          )}
          <button type="button" className="btn" onClick={() => setPlanPickerOpen(true)}>
            Choose a workout
          </button>
        </Card>
      )}

      <Card>
        <CardTitle title="This week" />
        <div className="row wrap" style={{ gap: 10, marginBottom: 12 }}>
          {weekDates(today).map((d) => (
            <div key={d} className="center" style={{ width: 40 }}>
              <div
                className={`dot${weekDaysWithWorkout.has(d) ? ' on' : ''}${d === today ? ' today' : ''}`}
                style={{ width: 22, height: 22, margin: '0 auto 4px' }}
                title={weekDaysWithWorkout.has(d) ? 'Workout completed' : 'No workout'}
              />
              <div className="tiny muted">{shortDayLabel(d)}</div>
            </div>
          ))}
        </div>
        <p className="small muted">
          {thisWeek.length >= state.targets.workoutsPerWeek
            ? 'Weekly target met. Anything extra is a bonus — rest is part of the plan too.'
            : `${state.targets.workoutsPerWeek - thisWeek.length} session${
                state.targets.workoutsPerWeek - thisWeek.length === 1 ? '' : 's'
              } left to hit your usual week. There is still time.`}
        </p>
      </Card>

      <Card>
        <CardTitle
          title="Recent workouts"
          action={<span className="pill">{completed.length} total</span>}
        />
        {completed.length === 0 ? (
          <Empty
            title="No workouts logged yet"
            body="Your first session is the only hard one to log."
          />
        ) : (
          <div>
            {completed.slice(0, 8).map((w) => (
              <div key={w.id} className="history-item">
                <div>
                  <div className="strong small">{w.title}</div>
                  <div className="tiny muted">
                    {relativeDayLabel(w.date, today)} · {setsSummary(w)}
                    {w.durationMin ? ` · ${formatDuration(w.durationMin)}` : ''}
                  </div>
                </div>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSummaryFor(w.id)}>
                  View
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {planPickerOpen ? (
        <Modal
          title="Choose a workout"
          subtitle="A small set of plans to start from — you can change exercises as you go."
          onClose={() => setPlanPickerOpen(false)}
        >
          <div className="stack">
            {WORKOUT_PLANS.map((plan) => (
              <div key={plan.id} className="card card-flat stack-sm">
                <div className="strong">{plan.name}</div>
                <p className="tiny muted">{plan.description}</p>
                <div className="row wrap">
                  {plan.days.map((day, i) => (
                    <button
                      key={day.title}
                      type="button"
                      className="chip"
                      onClick={() => startFromPlan(plan.id, i, 'active')}
                    >
                      Start {day.title}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="chip"
                    onClick={() => startFromPlan(plan.id, 0, 'planned')}
                  >
                    Plan for later
                  </button>
                </div>
              </div>
            ))}

            <div className="card card-flat stack-sm">
              <div className="strong">Custom workout</div>
              <div className="row">
                <input
                  className="input"
                  placeholder="e.g. Evening gym session"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                />
                <button type="button" className="btn btn-secondary nowrap" onClick={startCustom}>
                  Start empty
                </button>
              </div>
            </div>
          </div>
        </Modal>
      ) : null}

      {exercisePickerFor ? (
        <Modal
          title="Add an exercise"
          subtitle="A curated library — enough to cover most sessions."
          onClose={() => {
            setExercisePickerFor(null)
            setSearch('')
          }}
        >
          <Field label="Search">
            <input
              className="input"
              autoFocus
              value={search}
              placeholder="Squat, row, walk…"
              onChange={(e) => setSearch(e.target.value)}
            />
          </Field>
          <div className="stack-sm" style={{ marginTop: 14 }}>
            {Object.entries(
              filteredLibrary.reduce<Record<string, typeof EXERCISE_LIBRARY>>((acc, ex) => {
                acc[ex.group] = [...(acc[ex.group] ?? []), ex]
                return acc
              }, {}),
            ).map(([group, exercises]) => (
              <div key={group}>
                <span className="section-label">{group}</span>
                <div className="row wrap" style={{ marginTop: 6 }}>
                  {exercises.map((ex) => (
                    <button
                      key={ex.name}
                      type="button"
                      className="chip"
                      onClick={() => {
                        actions.addExercise(
                          exercisePickerFor,
                          ex.name,
                          ex.kind as ExerciseKind,
                          ex.kind === 'strength' ? 3 : 1,
                          ex.kind === 'strength' ? 10 : undefined,
                        )
                        setExercisePickerFor(null)
                        setSearch('')
                      }}
                    >
                      {ex.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {filteredLibrary.length === 0 ? (
              <p className="small muted">No match. Try a shorter search.</p>
            ) : null}
          </div>
        </Modal>
      ) : null}

      {summaryWorkout ? (
        <Modal
          title="Workout summary"
          subtitle={`${summaryWorkout.title} · ${relativeDayLabel(summaryWorkout.date, today)}`}
          onClose={() => setSummaryFor(null)}
        >
          <div className="stack-sm">
            <div className="row wrap">
              <span className="pill pill-brand">{setsSummary(summaryWorkout)}</span>
              {summaryWorkout.durationMin ? (
                <span className="pill">{formatDuration(summaryWorkout.durationMin)}</span>
              ) : null}
            </div>
            {summaryWorkout.exercises.map((e) => (
              <div key={e.id} className="history-item">
                <div>
                  <div className="strong small">{e.name}</div>
                  <div className="tiny muted">
                    {e.sets.filter((s) => s.done).length} of {e.sets.length} sets
                    {e.durationMin ? ` · ${formatDuration(e.durationMin)}` : ''}
                  </div>
                </div>
                <div className="tiny muted mono-num">
                  {e.sets
                    .filter((s) => s.done)
                    .map((s) => `${s.reps ?? '—'}${s.weightKg ? `×${s.weightKg}kg` : ''}`)
                    .join(', ') || '—'}
                </div>
              </div>
            ))}
            <p className="small muted" style={{ marginTop: 8 }}>
              Logged and counted towards your week. Get some protein and water in over the next few
              hours.
            </p>
          </div>
        </Modal>
      ) : null}
    </div>
  )
}

function ActiveSession({
  workout,
  onAddExercise,
  onFinish,
}: {
  workout: Workout
  onAddExercise: () => void
  onFinish: () => void
}) {
  const actions = useActions()
  const doneSets = workout.exercises.reduce((sum, e) => sum + e.sets.filter((s) => s.done).length, 0)
  const totalSets = workout.exercises.reduce((sum, e) => sum + e.sets.length, 0)

  return (
    <Card className="stack">
      <CardTitle
        title={workout.title}
        action={
          <span className="pill pill-brand">
            In progress · {doneSets}/{totalSets} sets
          </span>
        }
      />

      {workout.exercises.length === 0 ? (
        <Empty title="No exercises yet" body="Add the first movement of the session." />
      ) : null}

      {workout.exercises.map((exercise) => (
        <div key={exercise.id} className="exercise stack-sm">
          <div className="row-between">
            <div className="strong">{exercise.name}</div>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => actions.removeExercise(workout.id, exercise.id)}
            >
              Remove
            </button>
          </div>

          {exercise.kind === 'strength' ? (
            <>
              <div className="set-grid">
                <span className="set-head">#</span>
                <span className="set-head">Reps</span>
                <span className="set-head">Weight (kg)</span>
                <span className="set-head">Done</span>
                <span />
              </div>
              {exercise.sets.map((set, i) => (
                <div className="set-grid" key={set.id}>
                  <span className="set-index">{i + 1}</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    className="input"
                    value={set.reps ?? ''}
                    placeholder="10"
                    onChange={(e) =>
                      actions.updateSet(workout.id, exercise.id, set.id, {
                        reps: e.target.value === '' ? undefined : Number(e.target.value),
                      })
                    }
                  />
                  <input
                    type="number"
                    inputMode="decimal"
                    className="input"
                    value={set.weightKg ?? ''}
                    placeholder="40"
                    onChange={(e) =>
                      actions.updateSet(workout.id, exercise.id, set.id, {
                        weightKg: e.target.value === '' ? undefined : Number(e.target.value),
                      })
                    }
                  />
                  <button
                    type="button"
                    className={`set-done${set.done ? ' on' : ''}`}
                    aria-pressed={set.done}
                    aria-label={`Mark set ${i + 1} done`}
                    onClick={() => actions.updateSet(workout.id, exercise.id, set.id, { done: !set.done })}
                  >
                    ✓
                  </button>
                  <button
                    type="button"
                    className="btn-ghost"
                    aria-label={`Remove set ${i + 1}`}
                    onClick={() => actions.removeSet(workout.id, exercise.id, set.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ alignSelf: 'flex-start' }}
                onClick={() => actions.addSet(workout.id, exercise.id)}
              >
                + Add set
              </button>
            </>
          ) : (
            <div className="row wrap">
              <div className="input-suffix">
                <input
                  type="number"
                  inputMode="numeric"
                  className="input"
                  style={{ width: 90 }}
                  value={exercise.durationMin ?? ''}
                  placeholder="20"
                  onChange={(e) =>
                    actions.updateExercise(workout.id, exercise.id, {
                      durationMin: e.target.value === '' ? undefined : Number(e.target.value),
                    })
                  }
                />
                <span className="suffix">minutes</span>
              </div>
              <button
                type="button"
                className={`set-done${exercise.sets[0]?.done ? ' on' : ''}`}
                aria-pressed={Boolean(exercise.sets[0]?.done)}
                aria-label="Mark as done"
                onClick={() =>
                  exercise.sets[0] &&
                  actions.updateSet(workout.id, exercise.id, exercise.sets[0].id, {
                    done: !exercise.sets[0].done,
                  })
                }
              >
                ✓
              </button>
            </div>
          )}
        </div>
      ))}

      <div className="row wrap" style={{ justifyContent: 'space-between' }}>
        <button type="button" className="btn btn-secondary" onClick={onAddExercise}>
          + Add exercise
        </button>
        <div className="row" style={{ gap: 8 }}>
          <button type="button" className="btn btn-ghost" onClick={() => actions.deleteWorkout(workout.id)}>
            Discard
          </button>
          <button type="button" className="btn" onClick={onFinish}>
            Complete workout
          </button>
        </div>
      </div>
    </Card>
  )
}
