import type { ExerciseKind, Goal, Habit, Targets, WorkoutPlan } from './types'

export const GLASS_ML = 250

export const DEFAULT_TARGETS: Targets = {
  sleepMinutes: 8 * 60,
  waterMl: 2500,
  workoutsPerWeek: 4,
  steps: 8000,
  proteinG: 100,
  mealsPerDay: 3,
}

export const GOALS: { id: Goal; label: string; emoji: string; blurb: string }[] = [
  { id: 'habits', label: 'Build healthy habits', emoji: '🌱', blurb: 'Small, repeatable wins every day.' },
  { id: 'muscle', label: 'Build muscle', emoji: '🏋️', blurb: 'Train consistently and eat enough protein.' },
  { id: 'weight', label: 'Lose weight', emoji: '⚖️', blurb: 'Move more, eat a little better.' },
  { id: 'fitness', label: 'Improve fitness', emoji: '🏃', blurb: 'More energy and stamina through the week.' },
  { id: 'lifestyle', label: 'Improve overall lifestyle', emoji: '☀️', blurb: 'Balance work, rest and movement.' },
]

export const GOAL_LABEL: Record<Goal, string> = Object.fromEntries(
  GOALS.map((g) => [g.id, g.label]),
) as Record<Goal, string>

/** Goal-aware target nudges applied on top of DEFAULT_TARGETS during onboarding. */
export const GOAL_TARGET_HINTS: Record<Goal, Partial<Targets>> = {
  habits: { workoutsPerWeek: 3, steps: 8000, proteinG: 90 },
  muscle: { workoutsPerWeek: 4, steps: 7000, proteinG: 130 },
  weight: { workoutsPerWeek: 4, steps: 10000, proteinG: 110 },
  fitness: { workoutsPerWeek: 4, steps: 9000, proteinG: 100 },
  lifestyle: { workoutsPerWeek: 3, steps: 8000, proteinG: 90 },
}

export interface HabitSuggestion {
  name: string
  emoji: string
  frequency: 'daily' | 'weekly'
  weeklyTarget?: number
  goals: Goal[]
}

export const HABIT_LIBRARY: HabitSuggestion[] = [
  { name: 'Drink 2.5L water', emoji: '💧', frequency: 'daily', goals: ['habits', 'muscle', 'weight', 'fitness', 'lifestyle'] },
  { name: 'Walk 8,000 steps', emoji: '🚶', frequency: 'daily', goals: ['habits', 'weight', 'fitness', 'lifestyle'] },
  { name: 'Gym 4× per week', emoji: '🏋️', frequency: 'weekly', weeklyTarget: 4, goals: ['muscle', 'fitness', 'weight'] },
  { name: 'Sleep before 11:30 PM', emoji: '😴', frequency: 'daily', goals: ['habits', 'lifestyle', 'muscle', 'fitness'] },
  { name: 'Eat enough protein', emoji: '🥩', frequency: 'daily', goals: ['muscle', 'weight'] },
  { name: 'Take a movement break', emoji: '⏱️', frequency: 'daily', goals: ['habits', 'lifestyle'] },
  { name: 'Stretch for 10 minutes', emoji: '🧘', frequency: 'daily', goals: ['fitness', 'lifestyle', 'habits'] },
  { name: 'No screens 30 min before bed', emoji: '🌙', frequency: 'daily', goals: ['lifestyle', 'habits'] },
  { name: 'Eat a vegetable with lunch', emoji: '🥗', frequency: 'daily', goals: ['weight', 'lifestyle', 'habits'] },
]

/** 3–5 suggested habits for a goal (PRD §14, step 5). */
export function suggestedHabits(goal: Goal): HabitSuggestion[] {
  const matches = HABIT_LIBRARY.filter((h) => h.goals.includes(goal))
  const rest = HABIT_LIBRARY.filter((h) => !h.goals.includes(goal))
  return [...matches, ...rest].slice(0, 4)
}

export function habitFromSuggestion(s: HabitSuggestion, id: string, createdAt: string): Habit {
  return {
    id,
    name: s.name,
    emoji: s.emoji,
    frequency: s.frequency,
    weeklyTarget: s.weeklyTarget,
    createdAt,
  }
}

export const HABIT_EMOJIS = ['🌱', '💧', '🚶', '🏋️', '😴', '🥗', '🧘', '📚', '🧠', '☀️', '⏱️', '🥩']

/** Curated exercise library — intentionally small (PRD §7). */
export const EXERCISE_LIBRARY: { name: string; kind: ExerciseKind; group: string }[] = [
  { name: 'Barbell Squat', kind: 'strength', group: 'Legs' },
  { name: 'Goblet Squat', kind: 'strength', group: 'Legs' },
  { name: 'Romanian Deadlift', kind: 'strength', group: 'Legs' },
  { name: 'Leg Press', kind: 'strength', group: 'Legs' },
  { name: 'Lunges', kind: 'strength', group: 'Legs' },
  { name: 'Calf Raise', kind: 'strength', group: 'Legs' },
  { name: 'Bench Press', kind: 'strength', group: 'Push' },
  { name: 'Incline Dumbbell Press', kind: 'strength', group: 'Push' },
  { name: 'Overhead Press', kind: 'strength', group: 'Push' },
  { name: 'Push-ups', kind: 'strength', group: 'Push' },
  { name: 'Triceps Pushdown', kind: 'strength', group: 'Push' },
  { name: 'Lat Pulldown', kind: 'strength', group: 'Pull' },
  { name: 'Pull-ups', kind: 'strength', group: 'Pull' },
  { name: 'Barbell Row', kind: 'strength', group: 'Pull' },
  { name: 'Seated Cable Row', kind: 'strength', group: 'Pull' },
  { name: 'Face Pull', kind: 'strength', group: 'Pull' },
  { name: 'Biceps Curl', kind: 'strength', group: 'Pull' },
  { name: 'Plank', kind: 'mobility', group: 'Core' },
  { name: 'Dead Bug', kind: 'mobility', group: 'Core' },
  { name: 'Hanging Leg Raise', kind: 'strength', group: 'Core' },
  { name: 'Treadmill Run', kind: 'cardio', group: 'Cardio' },
  { name: 'Cycling', kind: 'cardio', group: 'Cardio' },
  { name: 'Rowing Machine', kind: 'cardio', group: 'Cardio' },
  { name: 'Brisk Walk', kind: 'cardio', group: 'Cardio' },
  { name: 'Skipping', kind: 'cardio', group: 'Cardio' },
  { name: 'Yoga Flow', kind: 'mobility', group: 'Mobility' },
  { name: 'Full Body Stretch', kind: 'mobility', group: 'Mobility' },
  { name: 'Hip Mobility Routine', kind: 'mobility', group: 'Mobility' },
]

export const WORKOUT_PLANS: WorkoutPlan[] = [
  {
    id: 'full-body',
    name: 'Full Body',
    description: 'Three sessions a week that hit everything. Great when your schedule is unpredictable.',
    days: [
      {
        title: 'Full Body A',
        exercises: [
          { name: 'Goblet Squat', kind: 'strength', sets: 3, reps: 10 },
          { name: 'Bench Press', kind: 'strength', sets: 3, reps: 8 },
          { name: 'Seated Cable Row', kind: 'strength', sets: 3, reps: 10 },
          { name: 'Plank', kind: 'mobility', sets: 3 },
        ],
      },
      {
        title: 'Full Body B',
        exercises: [
          { name: 'Romanian Deadlift', kind: 'strength', sets: 3, reps: 8 },
          { name: 'Overhead Press', kind: 'strength', sets: 3, reps: 8 },
          { name: 'Lat Pulldown', kind: 'strength', sets: 3, reps: 10 },
          { name: 'Dead Bug', kind: 'mobility', sets: 3 },
        ],
      },
    ],
  },
  {
    id: 'ppl',
    name: 'Push / Pull / Legs',
    description: 'A classic split for 3–6 sessions a week when you want more volume per muscle.',
    days: [
      {
        title: 'Push',
        exercises: [
          { name: 'Bench Press', kind: 'strength', sets: 4, reps: 8 },
          { name: 'Overhead Press', kind: 'strength', sets: 3, reps: 10 },
          { name: 'Incline Dumbbell Press', kind: 'strength', sets: 3, reps: 10 },
          { name: 'Triceps Pushdown', kind: 'strength', sets: 3, reps: 12 },
        ],
      },
      {
        title: 'Pull',
        exercises: [
          { name: 'Barbell Row', kind: 'strength', sets: 4, reps: 8 },
          { name: 'Lat Pulldown', kind: 'strength', sets: 3, reps: 10 },
          { name: 'Face Pull', kind: 'strength', sets: 3, reps: 15 },
          { name: 'Biceps Curl', kind: 'strength', sets: 3, reps: 12 },
        ],
      },
      {
        title: 'Legs',
        exercises: [
          { name: 'Barbell Squat', kind: 'strength', sets: 4, reps: 8 },
          { name: 'Romanian Deadlift', kind: 'strength', sets: 3, reps: 10 },
          { name: 'Leg Press', kind: 'strength', sets: 3, reps: 12 },
          { name: 'Calf Raise', kind: 'strength', sets: 3, reps: 15 },
        ],
      },
    ],
  },
  {
    id: 'upper-lower',
    name: 'Upper / Lower',
    description: 'Four balanced sessions a week. A good fit for a steady weekday routine.',
    days: [
      {
        title: 'Upper',
        exercises: [
          { name: 'Bench Press', kind: 'strength', sets: 4, reps: 8 },
          { name: 'Barbell Row', kind: 'strength', sets: 4, reps: 8 },
          { name: 'Overhead Press', kind: 'strength', sets: 3, reps: 10 },
          { name: 'Biceps Curl', kind: 'strength', sets: 3, reps: 12 },
        ],
      },
      {
        title: 'Lower',
        exercises: [
          { name: 'Barbell Squat', kind: 'strength', sets: 4, reps: 8 },
          { name: 'Romanian Deadlift', kind: 'strength', sets: 3, reps: 10 },
          { name: 'Lunges', kind: 'strength', sets: 3, reps: 12 },
          { name: 'Hanging Leg Raise', kind: 'strength', sets: 3, reps: 12 },
        ],
      },
    ],
  },
  {
    id: 'movement',
    name: 'Easy Movement',
    description: 'Walks, stretching and light cardio for busy weeks. Movement still counts.',
    days: [
      {
        title: 'Movement',
        exercises: [
          { name: 'Brisk Walk', kind: 'cardio', sets: 1 },
          { name: 'Full Body Stretch', kind: 'mobility', sets: 1 },
        ],
      },
    ],
  },
]

export const MEAL_IDEAS: Record<string, string[]> = {
  breakfast: ['Eggs + toast + fruit', 'Oats with milk and banana', 'Greek yoghurt + nuts', 'Idli with sambar'],
  lunch: ['Rice + chicken + vegetables', 'Roti + dal + salad', 'Quinoa bowl with paneer', 'Sandwich + soup'],
  dinner: ['Grilled fish + veggies', 'Chapati + sabzi + curd', 'Stir-fried tofu + rice', 'Soup + salad + eggs'],
  snack: ['Handful of almonds', 'Fruit + peanut butter', 'Protein shake', 'Roasted chana'],
}
