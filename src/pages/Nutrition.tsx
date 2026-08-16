import { useMemo, useState } from 'react'
import { Card, CardTitle, Empty, Field, FieldGroup, Meter, Modal } from '../components/ui'
import { addDays, relativeDayLabel, todayISO } from '../lib/date'
import { GLASS_ML, MEAL_IDEAS } from '../lib/defaults'
import { getDaySummary } from '../lib/summary'
import { useActions, useAppState } from '../state/store'
import type { MealType } from '../lib/types'

const MEAL_TYPES: { value: MealType; label: string; emoji: string }[] = [
  { value: 'breakfast', label: 'Breakfast', emoji: '🌅' },
  { value: 'lunch', label: 'Lunch', emoji: '🍚' },
  { value: 'dinner', label: 'Dinner', emoji: '🍽' },
  { value: 'snack', label: 'Snacks', emoji: '🥜' },
]

export default function Nutrition() {
  const state = useAppState()
  const actions = useActions()
  const today = todayISO()

  const [date, setDate] = useState(today)
  const [addOpen, setAddOpen] = useState(false)
  const [mealType, setMealType] = useState<MealType>('breakfast')
  const [description, setDescription] = useState('')
  const [protein, setProtein] = useState('')
  const [calories, setCalories] = useState('')

  const summary = useMemo(() => getDaySummary(state, date, today), [state, date, today])
  const day = state.nutrition[date]
  const meals = day?.meals ?? []
  const targetGlasses = Math.max(1, Math.round(state.targets.waterMl / GLASS_ML))
  const filledGlasses = Math.min(targetGlasses, Math.round((day?.waterMl ?? 0) / GLASS_ML))

  const openAdd = (type: MealType) => {
    setMealType(type)
    setDescription('')
    setProtein('')
    setCalories('')
    setAddOpen(true)
  }

  const saveMeal = () => {
    if (!description.trim()) return
    actions.addMeal(date, {
      type: mealType,
      description: description.trim(),
      proteinG: protein ? Number(protein) : undefined,
      calories: calories ? Number(calories) : undefined,
    })
    setAddOpen(false)
  }

  return (
    <div className="stack">
      <div className="page-head row-between">
        <div>
          <h1>Nutrition</h1>
          <p className="muted small">Better choices, not perfect eating.</p>
        </div>
        <div className="day-nav">
          <button
            type="button"
            className="btn-icon"
            aria-label="Previous day"
            onClick={() => setDate(addDays(date, -1))}
          >
            ‹
          </button>
          <span className="small strong nowrap">{relativeDayLabel(date, today)}</span>
          <button
            type="button"
            className="btn-icon"
            aria-label="Next day"
            disabled={date >= today}
            onClick={() => setDate(addDays(date, 1))}
          >
            ›
          </button>
        </div>
      </div>

      <div className="tiles">
        <div className="tile" data-accent="food" style={{ cursor: 'default' }}>
          <div className="tile-head">
            <span aria-hidden="true">🥩</span> Protein
          </div>
          <div className="tile-value">
            {summary.nutrition.protein} / {summary.nutrition.proteinTarget}g
          </div>
          <div className="tile-sub">
            {summary.nutrition.protein >= summary.nutrition.proteinTarget
              ? 'Target met'
              : `${summary.nutrition.proteinTarget - summary.nutrition.protein}g to go`}
          </div>
          <Meter ratio={summary.nutrition.protein / summary.nutrition.proteinTarget} accent="var(--c-food)" />
        </div>

        <div className="tile" data-accent="water" style={{ cursor: 'default' }}>
          <div className="tile-head">
            <span aria-hidden="true">💧</span> Water
          </div>
          <div className="tile-value">
            {(summary.water.ml / 1000).toFixed(1)} / {(summary.water.target / 1000).toFixed(1)}L
          </div>
          <div className="tile-sub">
            {summary.water.glasses} of {summary.water.targetGlasses} glasses
          </div>
          <Meter ratio={summary.water.ratio} accent="var(--c-water)" />
        </div>

        <div className="tile" data-accent="food" style={{ cursor: 'default' }}>
          <div className="tile-head">
            <span aria-hidden="true">🍽</span> Meals
          </div>
          <div className="tile-value">
            {summary.nutrition.mealsLogged} / {summary.nutrition.mealTarget}
          </div>
          <div className="tile-sub">
            {summary.nutrition.calories > 0
              ? `${summary.nutrition.calories.toLocaleString()} kcal logged`
              : 'Calories optional'}
          </div>
          <Meter ratio={summary.nutrition.mealsLogged / summary.nutrition.mealTarget} accent="var(--c-food)" />
        </div>
      </div>

      <Card className="stack">
        <CardTitle
          title="Water"
          action={
            <div className="row" style={{ gap: 6 }}>
              <button
                type="button"
                className="btn-icon"
                aria-label="Remove a glass"
                onClick={() => actions.addWater(date, -GLASS_ML)}
              >
                −
              </button>
              <button
                type="button"
                className="btn-icon"
                aria-label="Add a glass"
                onClick={() => actions.addWater(date, GLASS_ML)}
              >
                +
              </button>
            </div>
          }
        />
        <div className="water-glasses">
          {Array.from({ length: targetGlasses }, (_, i) => (
            <button
              key={i}
              type="button"
              className={`glass${i < filledGlasses ? ' filled' : ''}`}
              aria-label={`Set water to ${i + 1} glass${i === 0 ? '' : 'es'}`}
              onClick={() =>
                actions.setWater(date, (i + 1 === filledGlasses ? i : i + 1) * GLASS_ML)
              }
            />
          ))}
        </div>
        <p className="small muted">
          One glass is {GLASS_ML}ml. Tap a glass to set where you are — tapping the last filled one
          removes it.
        </p>
      </Card>

      <Card className="stack">
        <CardTitle
          title="Meals"
          action={
            <button type="button" className="btn btn-sm" onClick={() => openAdd('lunch')}>
              + Log a meal
            </button>
          }
        />
        {meals.length === 0 ? (
          <Empty
            title="Nothing logged yet"
            body="Write meals in plain words — “Rice + chicken + vegetables” is enough."
          />
        ) : null}

        {MEAL_TYPES.map((type) => {
          const items = meals.filter((m) => m.type === type.value)
          if (items.length === 0) return null
          return (
            <div key={type.value} className="meal-group">
              <span className="section-label">
                {type.emoji} {type.label}
              </span>
              {items.map((meal) => (
                <div key={meal.id} className="meal-item">
                  <div>
                    <div className="small strong">{meal.description}</div>
                    <div className="tiny muted">
                      {meal.proteinG ? `${meal.proteinG}g protein` : 'protein not noted'}
                      {meal.calories ? ` · ${meal.calories} kcal` : ''}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => actions.deleteMeal(date, meal.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )
        })}

        <div className="row wrap">
          {MEAL_TYPES.map((t) => (
            <button key={t.value} type="button" className="chip" onClick={() => openAdd(t.value)}>
              {t.emoji} Add {t.label.toLowerCase()}
            </button>
          ))}
        </div>
      </Card>

      {addOpen ? (
        <Modal
          title="Log a meal"
          subtitle="Plain words are fine. Protein is optional but helps your daily picture."
          onClose={() => setAddOpen(false)}
        >
          <div className="stack">
            <FieldGroup label="Meal">
              <div className="row wrap">
                {MEAL_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    className={`chip${mealType === t.value ? ' selected' : ''}`}
                    onClick={() => setMealType(t.value)}
                  >
                    {t.emoji} {t.label}
                  </button>
                ))}
              </div>
            </FieldGroup>

            <Field label="What did you eat?">
              <input
                className="input"
                autoFocus
                value={description}
                placeholder="Rice + chicken + vegetables"
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveMeal()
                }}
              />
            </Field>

            <div className="row wrap">
              {(MEAL_IDEAS[mealType] ?? []).map((idea) => (
                <button key={idea} type="button" className="chip" onClick={() => setDescription(idea)}>
                  {idea}
                </button>
              ))}
            </div>

            <div className="field-row">
              <Field label="Protein (g)" hint="A rough estimate is fine">
                <input
                  className="input"
                  type="number"
                  inputMode="numeric"
                  value={protein}
                  placeholder="30"
                  onChange={(e) => setProtein(e.target.value)}
                />
              </Field>
              <Field label="Calories (optional)">
                <input
                  className="input"
                  type="number"
                  inputMode="numeric"
                  value={calories}
                  placeholder="600"
                  onChange={(e) => setCalories(e.target.value)}
                />
              </Field>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setAddOpen(false)}>
              Cancel
            </button>
            <button type="button" className="btn" onClick={saveMeal} disabled={!description.trim()}>
              Save meal
            </button>
          </div>
        </Modal>
      ) : null}
    </div>
  )
}
