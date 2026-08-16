import { useMemo, useState } from 'react'
import { Card, CardTitle, Empty, Field, FieldGroup, Modal } from '../components/ui'
import { addDays, shortDayLabel, todayISO, weekDates } from '../lib/date'
import { HABIT_EMOJIS, HABIT_LIBRARY } from '../lib/defaults'
import { activeHabits, getDaySummary } from '../lib/summary'
import { useActions, useAppState } from '../state/store'
import type { Habit } from '../lib/types'

export default function Habits() {
  const state = useAppState()
  const actions = useActions()
  const today = todayISO()

  const [editing, setEditing] = useState<Habit | 'new' | null>(null)
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🌱')
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily')
  const [weeklyTarget, setWeeklyTarget] = useState(3)

  const summary = useMemo(() => getDaySummary(state, today), [state, today])
  const yesterday = useMemo(() => getDaySummary(state, addDays(today, -1), today), [state, today])
  const habits = activeHabits(state)
  const week = weekDates(today)
  const archived = state.habits.filter((h) => h.archived)

  const weekCompleted = week
    .filter((d) => d <= today)
    .reduce((sum, d) => sum + (state.habitCompletions[d] ?? []).filter((id) => habits.some((h) => h.id === id)).length, 0)
  const weekPossible = week.filter((d) => d <= today).length * habits.length

  const openNew = () => {
    setName('')
    setEmoji('🌱')
    setFrequency('daily')
    setWeeklyTarget(3)
    setEditing('new')
  }

  const openEdit = (habit: Habit) => {
    setName(habit.name)
    setEmoji(habit.emoji)
    setFrequency(habit.frequency)
    setWeeklyTarget(habit.weeklyTarget ?? 3)
    setEditing(habit)
  }

  const save = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    const payload = {
      name: trimmed,
      emoji,
      frequency,
      weeklyTarget: frequency === 'weekly' ? weeklyTarget : undefined,
    }
    if (editing === 'new') actions.addHabit(payload)
    else if (editing) actions.updateHabit(editing.id, payload)
    setEditing(null)
  }

  const missedYesterday =
    yesterday.habits.total > 0 && yesterday.habits.completed < yesterday.habits.total

  return (
    <div className="stack">
      <div className="page-head">
        <h1>Habits</h1>
        <p className="muted small">
          Three to five things you can repeat on a normal day. Consistency, not perfection.
        </p>
      </div>

      {missedYesterday ? (
        <Card className="card-flat">
          <p className="small">
            Yesterday didn't go entirely as planned — {yesterday.habits.completed} of{' '}
            {yesterday.habits.total} done. That is completely normal. Let's get back on track today.
          </p>
        </Card>
      ) : null}

      <Card>
        <CardTitle
          title="Today"
          action={
            <span className="pill pill-brand">
              {summary.habits.completed} / {summary.habits.total}
            </span>
          }
        />
        {habits.length === 0 ? (
          <Empty
            title="No habits yet"
            body="Start with one or two. You can always add more later."
            action={
              <button type="button" className="btn btn-sm" onClick={openNew}>
                Add a habit
              </button>
            }
          />
        ) : (
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
                <div className="grow">
                  <div className="habit-name">
                    <span aria-hidden="true">{habit.emoji}</span> {habit.name}
                  </div>
                  <div className="tiny muted">
                    {habit.frequency === 'weekly'
                      ? `${weekCount}/${habit.weeklyTarget} this week${weekSatisfied ? ' · done for the week' : ''}`
                      : 'Every day'}
                  </div>
                </div>
                <div className="dots" aria-hidden="true">
                  {week.map((d) => (
                    <span
                      key={d}
                      className={`dot${(state.habitCompletions[d] ?? []).includes(habit.id) ? ' on' : ''}${
                        d === today ? ' today' : ''
                      }`}
                      title={shortDayLabel(d)}
                    />
                  ))}
                </div>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => openEdit(habit)}>
                  Edit
                </button>
              </div>
            ))}
          </div>
        )}

        {habits.length > 0 ? (
          <button type="button" className="btn btn-secondary btn-sm" style={{ marginTop: 14 }} onClick={openNew}>
            + Add habit
          </button>
        ) : null}
      </Card>

      <Card>
        <CardTitle title="This week" action={<span className="pill">{weekCompleted} / {weekPossible}</span>} />
        <div className="row wrap" style={{ gap: 10 }}>
          {week.map((d) => {
            const done = (state.habitCompletions[d] ?? []).filter((id) =>
              habits.some((h) => h.id === id),
            ).length
            const ratio = habits.length ? done / habits.length : 0
            return (
              <div key={d} className="center" style={{ width: 44 }}>
                <div
                  style={{
                    height: 44,
                    borderRadius: 12,
                    background: `color-mix(in srgb, var(--brand) ${Math.round(ratio * 82) + (d > today ? 0 : 8)}%, var(--surface-2))`,
                    border: d === today ? '2px solid var(--brand)' : '1px solid var(--line)',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: ratio > 0.55 ? '#fff' : 'var(--ink-2)',
                  }}
                  title={`${done} of ${habits.length} habits`}
                >
                  {d > today ? '·' : done}
                </div>
                <div className="tiny muted" style={{ marginTop: 4 }}>
                  {shortDayLabel(d)}
                </div>
              </div>
            )
          })}
        </div>
        <p className="small muted" style={{ marginTop: 12 }}>
          {weekPossible === 0
            ? 'Add a habit to start tracking your week.'
            : weekCompleted / weekPossible >= 0.8
              ? 'Strong week. This is the pace that actually sticks.'
              : 'Every completed habit counts. No need to make up for missed ones.'}
        </p>
      </Card>

      {archived.length > 0 ? (
        <Card>
          <CardTitle title="Paused habits" />
          {archived.map((h) => (
            <div key={h.id} className="history-item">
              <span className="small">
                <span aria-hidden="true">{h.emoji}</span> {h.name}
              </span>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => actions.restoreHabit(h.id)}>
                Bring back
              </button>
            </div>
          ))}
        </Card>
      ) : null}

      {editing ? (
        <Modal
          title={editing === 'new' ? 'New habit' : 'Edit habit'}
          subtitle="Keep it small enough that a busy day can still fit it."
          onClose={() => setEditing(null)}
        >
          <div className="stack">
            <FieldGroup label="Habit">
              <div className="row">
                <select
                  className="input"
                  style={{ width: 76 }}
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  aria-label="Habit emoji"
                >
                  {HABIT_EMOJIS.map((e) => (
                    <option key={e}>{e}</option>
                  ))}
                </select>
                <input
                  className="input"
                  autoFocus
                  value={name}
                  placeholder="Drink 2.5L water"
                  aria-label="Habit name"
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </FieldGroup>

            {editing === 'new' ? (
              <div className="row wrap">
                {HABIT_LIBRARY.slice(0, 6).map((h) => (
                  <button
                    key={h.name}
                    type="button"
                    className="chip"
                    onClick={() => {
                      setName(h.name)
                      setEmoji(h.emoji)
                      setFrequency(h.frequency)
                      if (h.weeklyTarget) setWeeklyTarget(h.weeklyTarget)
                    }}
                  >
                    {h.emoji} {h.name}
                  </button>
                ))}
              </div>
            ) : null}

            <FieldGroup label="How often?">
              <div className="row wrap">
                <button
                  type="button"
                  className={`chip${frequency === 'daily' ? ' selected' : ''}`}
                  onClick={() => setFrequency('daily')}
                >
                  Every day
                </button>
                <button
                  type="button"
                  className={`chip${frequency === 'weekly' ? ' selected' : ''}`}
                  onClick={() => setFrequency('weekly')}
                >
                  A few times a week
                </button>
              </div>
            </FieldGroup>

            {frequency === 'weekly' ? (
              <Field label={`Times per week — ${weeklyTarget}`}>
                <input
                  type="range"
                  min={1}
                  max={7}
                  value={weeklyTarget}
                  onChange={(e) => setWeeklyTarget(Number(e.target.value))}
                />
              </Field>
            ) : null}
          </div>

          <div className="modal-actions">
            {editing !== 'new' ? (
              <button
                type="button"
                className="btn btn-danger"
                style={{ marginRight: 'auto' }}
                onClick={() => {
                  actions.archiveHabit(editing.id)
                  setEditing(null)
                }}
              >
                Pause habit
              </button>
            ) : null}
            <button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>
              Cancel
            </button>
            <button type="button" className="btn" onClick={save} disabled={!name.trim()}>
              Save
            </button>
          </div>
        </Modal>
      ) : null}
    </div>
  )
}
