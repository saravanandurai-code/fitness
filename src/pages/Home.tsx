import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardTitle, Field, Meter, Modal, Ring } from '../components/ui'
import { dailyRecommendation } from '../lib/advice'
import { formatDuration, formatLongDate, greeting, todayISO } from '../lib/date'
import { GLASS_ML } from '../lib/defaults'
import { getDaySummary } from '../lib/summary'
import { useActions, useAppState } from '../state/store'

const ACCENT: Record<string, string> = {
  sleep: 'var(--c-sleep)',
  workout: 'var(--c-workout)',
  move: 'var(--c-move)',
  water: 'var(--c-water)',
  food: 'var(--c-food)',
  habit: 'var(--c-habit)',
}

export default function Home() {
  const state = useAppState()
  const actions = useActions()
  const navigate = useNavigate()
  const today = todayISO()

  const summary = useMemo(() => getDaySummary(state, today), [state, today])
  const reco = useMemo(() => dailyRecommendation(state, summary), [state, summary])

  const [stepsOpen, setStepsOpen] = useState(false)
  const [stepsDraft, setStepsDraft] = useState('')
  const [showBreakdown, setShowBreakdown] = useState(false)

  const firstName = state.profile?.name.split(' ')[0] ?? 'there'

  const openSteps = () => {
    setStepsDraft(summary.steps.value ? String(summary.steps.value) : '')
    setStepsOpen(true)
  }

  const workoutLabel =
    summary.workout.status === 'completed'
      ? 'Completed'
      : summary.workout.status === 'active'
        ? 'In progress'
        : summary.workout.status === 'planned'
          ? 'Planned'
          : 'Not planned'

  return (
    <div className="stack" style={{ gap: 18 }}>
      <div className="page-head">
        <p className="section-label">{formatLongDate(today)}</p>
        <h1>
          {greeting()}, {firstName} 👋
        </h1>
        <p className="muted small">Here is how your day is going so far.</p>
      </div>

      <section className="score-card">
        <Ring value={summary.score} caption="Today" />
        <div className="stack-sm grow">
          <h2>{summary.band.title}</h2>
          <p className="small muted">{summary.band.message}</p>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ alignSelf: 'flex-start', paddingLeft: 0 }}
            onClick={() => setShowBreakdown((v) => !v)}
          >
            {showBreakdown ? 'Hide what makes this up' : 'What makes this up?'}
          </button>
        </div>
      </section>

      {showBreakdown ? (
        <Card className="stack-sm">
          <span className="section-label">Balance across your day</span>
          {summary.components.map((c) => (
            <div key={c.key} className="stack-sm" style={{ gap: 4 }}>
              <div className="row-between small">
                <span>
                  <span aria-hidden="true">{c.emoji}</span> {c.label}
                </span>
                <span className="muted tiny">{c.detail}</span>
              </div>
              <Meter ratio={c.ratio} />
            </div>
          ))}
          <p className="footnote" style={{ marginTop: 6 }}>
            This is a guidance indicator to help you notice patterns — not a medical or scientific
            health score. A lower number just means the day was busy.
          </p>
        </Card>
      ) : null}

      <section className="reco">
        <span className="section-label">Today's suggestion</span>
        <h3 style={{ marginTop: 6 }}>{reco.headline}</h3>
        <p className="small">{reco.body}</p>
        {reco.action ? (
          <Link className="btn btn-sm" to={reco.action.to}>
            {reco.action.label}
          </Link>
        ) : null}
      </section>

      <section className="stack-sm">
        <span className="section-label">Today's health</span>
        <div className="tiles">
          <Link className="tile" data-accent="sleep" to="/sleep">
            <div className="tile-head">
              <span aria-hidden="true">😴</span> Sleep
            </div>
            <div className="tile-value">
              {summary.sleep.logged ? formatDuration(summary.sleep.minutes) : '—'}
            </div>
            <div className="tile-sub">
              {summary.sleep.logged
                ? `of ${formatDuration(summary.sleep.target)} target`
                : 'Tap to log last night'}
            </div>
            <Meter ratio={summary.sleep.ratio} accent={ACCENT.sleep} />
          </Link>

          <Link className="tile" data-accent="workout" to="/workout">
            <div className="tile-head">
              <span aria-hidden="true">🏋️</span> Workout
            </div>
            <div className="tile-value">{workoutLabel}</div>
            <div className="tile-sub">
              {summary.workout.weekCount} of {summary.workout.weekTarget} this week
            </div>
            <Meter ratio={summary.workout.ratio} accent={ACCENT.workout} />
          </Link>

          <button type="button" className="tile" data-accent="move" onClick={openSteps}>
            <div className="tile-head">
              <span aria-hidden="true">🚶</span> Activity
            </div>
            <div className="tile-value">{summary.steps.value.toLocaleString()}</div>
            <div className="tile-sub">of {summary.steps.target.toLocaleString()} steps</div>
            <Meter ratio={summary.steps.ratio} accent={ACCENT.move} />
          </button>

          <Link className="tile" data-accent="water" to="/nutrition">
            <div className="tile-head">
              <span aria-hidden="true">💧</span> Water
            </div>
            <div className="tile-value">
              {summary.water.glasses} / {summary.water.targetGlasses}
            </div>
            <div className="tile-sub">
              glasses · {(summary.water.ml / 1000).toFixed(1)}L of{' '}
              {(summary.water.target / 1000).toFixed(1)}L
            </div>
            <Meter ratio={summary.water.ratio} accent={ACCENT.water} />
          </Link>

          <Link className="tile" data-accent="food" to="/nutrition">
            <div className="tile-head">
              <span aria-hidden="true">🥗</span> Nutrition
            </div>
            <div className="tile-value">{summary.nutrition.percent}%</div>
            <div className="tile-sub">
              {summary.nutrition.mealsLogged}/{summary.nutrition.mealTarget} meals ·{' '}
              {summary.nutrition.protein}g protein
            </div>
            <Meter ratio={summary.nutrition.ratio} accent={ACCENT.food} />
          </Link>

          <Link className="tile" data-accent="habit" to="/habits">
            <div className="tile-head">
              <span aria-hidden="true">🔥</span> Habits
            </div>
            <div className="tile-value">
              {summary.habits.completed} / {summary.habits.total}
            </div>
            <div className="tile-sub">completed today</div>
            <Meter ratio={summary.habits.ratio} accent={ACCENT.habit} />
          </Link>
        </div>
      </section>

      <Card>
        <CardTitle
          title="Quick update"
          action={<span className="tiny muted">Manually tracked</span>}
        />
        <div className="row wrap">
          <button type="button" className="chip" onClick={() => actions.addWater(today, GLASS_ML)}>
            💧 + 1 glass
          </button>
          <button type="button" className="chip" onClick={() => actions.addWater(today, GLASS_ML * 2)}>
            💧 + 2 glasses
          </button>
          <button type="button" className="chip" onClick={openSteps}>
            🚶 Update steps
          </button>
          <Link className="chip" to="/sleep">
            😴 Log sleep
          </Link>
          <Link className="chip" to="/nutrition">
            🍽 Log a meal
          </Link>
          <Link className="chip" to="/workout">
            🏋️ Start workout
          </Link>
        </div>
      </Card>

      {summary.habits.total > 0 ? (
        <Card>
          <CardTitle
            title="Today's habits"
            action={
              <span className="pill">
                {summary.habits.completed} / {summary.habits.total}
              </span>
            }
          />
          <div>
            {summary.habits.items.map(({ habit, done, weekSatisfied, weekCount }) => (
              <div key={habit.id} className={`habit-row${done ? ' done' : ''}`}>
                <button
                  type="button"
                  className={`habit-check${done ? ' done' : weekSatisfied ? ' satisfied' : ''}`}
                  aria-pressed={done}
                  aria-label={`${done ? 'Undo' : 'Complete'} ${habit.name}`}
                  onClick={() => actions.toggleHabit(today, habit.id)}
                >
                  ✓
                </button>
                <span className="grow">
                  <span className="habit-name">
                    <span aria-hidden="true">{habit.emoji}</span> {habit.name}
                  </span>
                  {habit.frequency === 'weekly' ? (
                    <span className="tiny muted">
                      {' '}
                      · {weekCount}/{habit.weeklyTarget} this week
                      {weekSatisfied ? ' · done for the week' : ''}
                    </span>
                  ) : null}
                </span>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card>
          <CardTitle title="Today's habits" />
          <p className="small muted">
            You have no habits yet. Three small ones are usually enough to change a week.
          </p>
          <button type="button" className="btn btn-sm" style={{ marginTop: 10 }} onClick={() => navigate('/habits')}>
            Add habits
          </button>
        </Card>
      )}

      {stepsOpen ? (
        <Modal
          title="Update today's activity"
          subtitle="Steps are entered manually in this version."
          onClose={() => setStepsOpen(false)}
        >
          <Field label="Steps today" hint={`Goal: ${summary.steps.target.toLocaleString()} steps`}>
            <input
              className="input"
              type="number"
              inputMode="numeric"
              autoFocus
              value={stepsDraft}
              onChange={(e) => setStepsDraft(e.target.value)}
            />
          </Field>
          <div className="row wrap" style={{ marginTop: 10 }}>
            {[1000, 2000, 5000].map((n) => (
              <button
                key={n}
                type="button"
                className="chip"
                onClick={() => setStepsDraft(String((Number(stepsDraft) || 0) + n))}
              >
                +{n.toLocaleString()}
              </button>
            ))}
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setStepsOpen(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                actions.setSteps(today, Number(stepsDraft) || 0)
                setStepsOpen(false)
              }}
            >
              Save
            </button>
          </div>
        </Modal>
      ) : null}
    </div>
  )
}
