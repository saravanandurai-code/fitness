import { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Card, Field, FieldGroup } from '../components/ui'
import { formatDuration, sleepMinutes } from '../lib/date'
import {
  DEFAULT_TARGETS,
  GLASS_ML,
  GOALS,
  GOAL_TARGET_HINTS,
  HABIT_LIBRARY,
  HABIT_EMOJIS,
  suggestedHabits,
} from '../lib/defaults'
import { useActions, useAppState } from '../state/store'
import type { Goal, Habit } from '../lib/types'

type DraftHabit = Omit<Habit, 'id' | 'createdAt'>

const WORK_SCHEDULES = [
  '9:00 AM – 6:00 PM',
  '10:00 AM – 7:00 PM',
  'Shift / rotating',
  'Flexible or remote',
]

const WORKOUT_TIMES = ['Early morning', 'Lunch time', 'Evening', 'It varies']

const STEP_TITLES = ['About you', 'Your goal', 'Your routine', 'Your targets', 'Your habits']

export default function Onboarding() {
  const state = useAppState()
  const actions = useActions()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)

  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [heightCm, setHeightCm] = useState('')
  const [weightKg, setWeightKg] = useState('')

  const [goal, setGoal] = useState<Goal>('lifestyle')

  const [workSchedule, setWorkSchedule] = useState(WORK_SCHEDULES[0])
  const [workoutsPerWeek, setWorkoutsPerWeek] = useState(4)
  const [preferredWorkoutTime, setPreferredWorkoutTime] = useState(WORKOUT_TIMES[2])
  const [typicalSleepTime, setTypicalSleepTime] = useState('23:30')
  const [typicalWakeTime, setTypicalWakeTime] = useState('07:00')

  const [sleepHours, setSleepHours] = useState(8)
  const [waterMl, setWaterMl] = useState(DEFAULT_TARGETS.waterMl)
  const [steps, setSteps] = useState(DEFAULT_TARGETS.steps)
  const [proteinG, setProteinG] = useState(DEFAULT_TARGETS.proteinG)

  const [selectedHabits, setSelectedHabits] = useState<DraftHabit[] | null>(null)
  const [customHabit, setCustomHabit] = useState('')
  const [customEmoji, setCustomEmoji] = useState('🌱')

  const suggested = useMemo<DraftHabit[]>(
    () =>
      suggestedHabits(goal).map((s) => ({
        name: s.name,
        emoji: s.emoji,
        frequency: s.frequency,
        weeklyTarget: s.weeklyTarget,
      })),
    [goal],
  )

  const habits = selectedHabits ?? suggested
  const routineSleep = sleepMinutes(typicalSleepTime, typicalWakeTime)

  if (state.onboarded) return <Navigate to="/" replace />

  const applyGoal = (next: Goal) => {
    setGoal(next)
    const hint = GOAL_TARGET_HINTS[next]
    if (hint.workoutsPerWeek) setWorkoutsPerWeek(hint.workoutsPerWeek)
    if (hint.steps) setSteps(hint.steps)
    if (hint.proteinG) setProteinG(hint.proteinG)
    setSelectedHabits(null)
  }

  const toggleHabit = (h: DraftHabit) => {
    const list = habits
    const exists = list.some((x) => x.name === h.name)
    setSelectedHabits(exists ? list.filter((x) => x.name !== h.name) : [...list, h])
  }

  const addCustomHabit = () => {
    const trimmed = customHabit.trim()
    if (!trimmed) return
    setSelectedHabits([...habits, { name: trimmed, emoji: customEmoji, frequency: 'daily' }])
    setCustomHabit('')
  }

  const canContinue = step === 0 ? name.trim().length > 0 : true

  const finish = () => {
    actions.completeOnboarding({
      profile: {
        name: name.trim(),
        age: age ? Number(age) : undefined,
        gender: gender || undefined,
        heightCm: heightCm ? Number(heightCm) : undefined,
        weightKg: weightKg ? Number(weightKg) : undefined,
        goal,
        workSchedule,
        preferredWorkoutTime,
        typicalSleepTime,
        typicalWakeTime,
        createdAt: new Date().toISOString(),
      },
      targets: {
        sleepMinutes: Math.round(sleepHours * 60),
        waterMl,
        workoutsPerWeek,
        steps,
        proteinG,
        mealsPerDay: 3,
      },
      habits: habits.slice(0, 6),
    })
    navigate('/', { replace: true })
  }

  const next = () => (step === STEP_TITLES.length - 1 ? finish() : setStep(step + 1))

  return (
    <div className="onboarding">
      <div className="onboarding-inner">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            S
          </span>
          <span className="brand-name">Sarv</span>
        </div>

        <div className="steps-bar" aria-hidden="true">
          {STEP_TITLES.map((t, i) => (
            <span key={t} className={`step-dot${i <= step ? ' on' : ''}`} />
          ))}
        </div>

        <p className="section-label">
          Step {step + 1} of {STEP_TITLES.length}
        </p>
        <h1 style={{ marginBottom: 18 }}>{STEP_TITLES[step]}</h1>

        {step === 0 ? (
          <Card className="stack">
            <p className="small muted">
              Only what we need to personalise your day. Everything is optional except your name.
            </p>
            <Field label="What should we call you?">
              <input
                className="input"
                value={name}
                autoFocus
                placeholder="Your name"
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <div className="field-row">
              <Field label="Age">
                <input
                  className="input"
                  type="number"
                  inputMode="numeric"
                  value={age}
                  placeholder="28"
                  onChange={(e) => setAge(e.target.value)}
                />
              </Field>
              <Field label="Gender (optional)">
                <select className="input" value={gender} onChange={(e) => setGender(e.target.value)}>
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
                  inputMode="numeric"
                  value={heightCm}
                  placeholder="172"
                  onChange={(e) => setHeightCm(e.target.value)}
                />
              </Field>
              <Field label="Weight (kg)">
                <input
                  className="input"
                  type="number"
                  inputMode="decimal"
                  value={weightKg}
                  placeholder="70"
                  onChange={(e) => setWeightKg(e.target.value)}
                />
              </Field>
            </div>
          </Card>
        ) : null}

        {step === 1 ? (
          <div className="option-list">
            {GOALS.map((g) => (
              <button
                key={g.id}
                type="button"
                className={`option${goal === g.id ? ' selected' : ''}`}
                onClick={() => applyGoal(g.id)}
              >
                <span className="option-emoji" aria-hidden="true">
                  {g.emoji}
                </span>
                <span>
                  <span className="option-title">{g.label}</span>
                  <br />
                  <span className="option-blurb">{g.blurb}</span>
                </span>
              </button>
            ))}
          </div>
        ) : null}

        {step === 2 ? (
          <Card className="stack">
            <Field label="Typical work schedule">
              <select
                className="input"
                value={workSchedule}
                onChange={(e) => setWorkSchedule(e.target.value)}
              >
                {WORK_SCHEDULES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>

            <FieldGroup label="How often do you work out?">
              <div className="row wrap">
                {[2, 3, 4, 5, 6].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`chip${workoutsPerWeek === n ? ' selected' : ''}`}
                    onClick={() => setWorkoutsPerWeek(n)}
                  >
                    {n}× a week
                  </button>
                ))}
              </div>
            </FieldGroup>

            <FieldGroup label="Preferred workout time">
              <div className="row wrap">
                {WORKOUT_TIMES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`chip${preferredWorkoutTime === t ? ' selected' : ''}`}
                    onClick={() => setPreferredWorkoutTime(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </FieldGroup>

            <div className="field-row">
              <Field label="Usual sleep time">
                <input
                  className="input"
                  type="time"
                  value={typicalSleepTime}
                  onChange={(e) => setTypicalSleepTime(e.target.value)}
                />
              </Field>
              <Field label="Usual wake-up time">
                <input
                  className="input"
                  type="time"
                  value={typicalWakeTime}
                  onChange={(e) => setTypicalWakeTime(e.target.value)}
                />
              </Field>
            </div>
            <p className="small muted">
              That is about {formatDuration(routineSleep)} in bed on a normal night.
            </p>
          </Card>
        ) : null}

        {step === 3 ? (
          <Card className="stack">
            <p className="small muted">
              We have pre-filled these from your routine. Pick numbers you can actually hit on a
              normal week — you can change them any time.
            </p>

            <Field label={`Sleep target — ${formatDuration(sleepHours * 60)}`}>
              <input
                type="range"
                min={5}
                max={10}
                step={0.25}
                value={sleepHours}
                onChange={(e) => setSleepHours(Number(e.target.value))}
              />
            </Field>

            <Field
              label={`Water target — ${(waterMl / 1000).toFixed(1)}L`}
              hint={`About ${Math.round(waterMl / GLASS_ML)} glasses`}
            >
              <input
                type="range"
                min={1000}
                max={4000}
                step={250}
                value={waterMl}
                onChange={(e) => setWaterMl(Number(e.target.value))}
              />
            </Field>

            <Field label={`Workouts — ${workoutsPerWeek} per week`}>
              <input
                type="range"
                min={1}
                max={7}
                step={1}
                value={workoutsPerWeek}
                onChange={(e) => setWorkoutsPerWeek(Number(e.target.value))}
              />
            </Field>

            <Field label={`Daily steps — ${steps.toLocaleString()}`}>
              <input
                type="range"
                min={3000}
                max={15000}
                step={500}
                value={steps}
                onChange={(e) => setSteps(Number(e.target.value))}
              />
            </Field>

            <Field label={`Protein — ${proteinG}g a day`} hint="A rough guide, not a strict rule.">
              <input
                type="range"
                min={40}
                max={200}
                step={5}
                value={proteinG}
                onChange={(e) => setProteinG(Number(e.target.value))}
              />
            </Field>
          </Card>
        ) : null}

        {step === 4 ? (
          <Card className="stack">
            <p className="small muted">
              Pick three to five habits. Fewer, kept consistently, beats a long list you ignore.
            </p>

            <div className="option-list">
              {[...HABIT_LIBRARY.map((h) => ({
                name: h.name,
                emoji: h.emoji,
                frequency: h.frequency,
                weeklyTarget: h.weeklyTarget,
              })), ...habits.filter((h) => !HABIT_LIBRARY.some((l) => l.name === h.name))].map((h) => {
                const selected = habits.some((x) => x.name === h.name)
                return (
                  <button
                    key={h.name}
                    type="button"
                    className={`option${selected ? ' selected' : ''}`}
                    onClick={() => toggleHabit(h)}
                  >
                    <span className="option-emoji" aria-hidden="true">
                      {h.emoji}
                    </span>
                    <span className="grow">
                      <span className="option-title">{h.name}</span>
                      <br />
                      <span className="option-blurb">
                        {h.frequency === 'weekly' ? `${h.weeklyTarget}× per week` : 'Every day'}
                      </span>
                    </span>
                    <span aria-hidden="true">{selected ? '✓' : '+'}</span>
                  </button>
                )
              })}
            </div>

            <div className="stack-sm">
              <span className="label">Add your own</span>
              <div className="row">
                <select
                  className="input"
                  style={{ width: 76 }}
                  value={customEmoji}
                  onChange={(e) => setCustomEmoji(e.target.value)}
                  aria-label="Habit emoji"
                >
                  {HABIT_EMOJIS.map((e) => (
                    <option key={e}>{e}</option>
                  ))}
                </select>
                <input
                  className="input"
                  value={customHabit}
                  placeholder="e.g. Read for 15 minutes"
                  onChange={(e) => setCustomHabit(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addCustomHabit()
                    }
                  }}
                />
                <button type="button" className="btn btn-secondary" onClick={addCustomHabit}>
                  Add
                </button>
              </div>
              {habits.length > 5 ? (
                <p className="small muted">
                  That is {habits.length} habits — consider trimming to five so it stays easy.
                </p>
              ) : null}
            </div>
          </Card>
        ) : null}

        <div className="onboarding-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => (step === 0 ? navigate('/welcome') : setStep(step - 1))}
          >
            ← Back
          </button>
          <button type="button" className="btn" onClick={next} disabled={!canContinue}>
            {step === STEP_TITLES.length - 1 ? 'Start my first day' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}
