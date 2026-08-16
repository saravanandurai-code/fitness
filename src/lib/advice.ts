import { addDays, formatDuration, todayISO } from './date'
import type { DaySummary, WeekSummary } from './summary'
import { getDaySummary } from './summary'
import type { AppState } from './types'

export interface Recommendation {
  headline: string
  body: string
  action?: { label: string; to: string }
}

/**
 * One short, actionable recommendation (PRD §6). Rules are ordered by "what
 * would help most right now" and stay encouraging — never scolding.
 */
export function dailyRecommendation(
  state: AppState,
  summary: DaySummary,
  now = new Date(),
): Recommendation {
  const hour = now.getHours()
  const t = state.targets
  const strengths: string[] = []
  if (summary.sleep.ratio >= 0.9) strengths.push('good sleep')
  if (summary.nutrition.ratio >= 0.8) strengths.push('solid nutrition')
  if (summary.water.ratio >= 0.8) strengths.push('good hydration')
  if (summary.steps.ratio >= 0.9) strengths.push('plenty of movement')
  if (summary.workout.status === 'completed') strengths.push('a workout done')
  const praise =
    strengths.length > 0
      ? `You have ${listPhrase(strengths)} today. `
      : ''

  if (!summary.sleep.logged && hour < 14) {
    return {
      headline: 'Start with last night',
      body: 'Add your sleep for last night so today\'s picture is complete. It takes ten seconds.',
      action: { label: 'Log sleep', to: '/sleep' },
    }
  }

  if (summary.sleep.logged && summary.sleep.minutes < t.sleepMinutes - 75) {
    const short = formatDuration(t.sleepMinutes - summary.sleep.minutes)
    return {
      headline: 'Keep today light',
      body: `You slept ${short} less than your target. Go easy on intensity, drink water through the day, and aim to be in bed a little earlier tonight.`,
      action: { label: 'See sleep', to: '/sleep' },
    }
  }

  if (summary.water.ratio < 0.5 && hour >= 12) {
    const left = Math.max(0, t.waterMl - summary.water.ml)
    return {
      headline: 'Top up your water',
      body: `${praise}You're at ${(summary.water.ml / 1000).toFixed(1)}L. Another ${(left / 1000).toFixed(1)}L across the afternoon gets you there comfortably.`,
      action: { label: 'Add water', to: '/nutrition' },
    }
  }

  const behindOnWorkouts = summary.workout.ratio < 0.8
  if (summary.workout.status === 'none' && behindOnWorkouts && hour < 20) {
    return {
      headline: 'A workout would fit well today',
      body: `${praise}You're at ${summary.workout.weekCount} of ${summary.workout.weekTarget} workouts this week. Even a 30-minute session keeps the week on track.`,
      action: { label: 'Start a workout', to: '/workout' },
    }
  }

  if (summary.workout.status === 'planned') {
    return {
      headline: 'Your workout is planned',
      body: `${praise}When you get to it, start the session so you can tick off sets as you go.`,
      action: { label: 'Open workout', to: '/workout' },
    }
  }

  if (summary.steps.ratio < 0.7) {
    const missing = Math.max(0, t.steps - summary.steps.value)
    const minutes = Math.max(10, Math.round(missing / 110 / 5) * 5)
    return {
      headline: `Try a ${minutes}-minute walk`,
      body: `${praise}You're ${missing.toLocaleString()} steps from your movement goal — a walk after work is usually the easiest way to close it.`,
      action: { label: 'Update activity', to: '/' },
    }
  }

  if (summary.nutrition.protein < t.proteinG * 0.7 && hour >= 14) {
    const gap = Math.max(0, t.proteinG - summary.nutrition.protein)
    return {
      headline: 'Add some protein tonight',
      body: `${praise}You're about ${gap}g short. Something like eggs, chicken, paneer, dal or yoghurt with dinner will cover most of it.`,
      action: { label: 'Log dinner', to: '/nutrition' },
    }
  }

  const pendingHabits = summary.habits.items.filter((i) => !i.done && !i.weekSatisfied)
  if (pendingHabits.length > 0) {
    const first = pendingHabits[0]
    return {
      headline: `One habit left: ${first.habit.name.toLowerCase()}`,
      body: `${praise}${
        pendingHabits.length === 1
          ? 'That is the last one for today.'
          : `${pendingHabits.length} habits are still open — pick the easiest one first.`
      }`,
      action: { label: 'Open habits', to: '/habits' },
    }
  }

  if (!summary.sleep.logged) {
    return {
      headline: 'Wrap up the day',
      body: `${praise}Log tonight's sleep tomorrow morning and your week will be complete.`,
      action: { label: 'Log sleep', to: '/sleep' },
    }
  }

  return {
    headline: 'You\'re doing well today',
    body: `${praise}Nothing needs your attention — keep the evening relaxed and aim for your usual bedtime.`,
  }
}

function listPhrase(items: string[]): string {
  if (items.length === 1) return items[0]
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

export interface ProgressMessage {
  headline: string
  body: string
}

export function weeklyProgressMessage(current: WeekSummary, previous: WeekSummary): ProgressMessage {
  const notes: string[] = []

  if (current.sleepNights >= 2 && previous.sleepNights >= 2) {
    const diff = current.avgSleepMinutes - previous.avgSleepMinutes
    if (Math.abs(diff) >= 15) {
      notes.push(
        diff > 0
          ? `your sleep improved by ${formatDuration(diff)} compared with last week`
          : `you slept ${formatDuration(-diff)} less on average than last week`,
      )
    }
  }

  if (current.workouts !== previous.workouts && (current.workouts > 0 || previous.workouts > 0)) {
    notes.push(
      current.workouts > previous.workouts
        ? `you trained ${current.workouts - previous.workouts} more time${current.workouts - previous.workouts > 1 ? 's' : ''}`
        : `you trained ${previous.workouts - current.workouts} fewer time${previous.workouts - current.workouts > 1 ? 's' : ''}`,
    )
  }

  if (current.habitsPossible > 0 && previous.habitsPossible > 0) {
    const diff = current.habitPercent - previous.habitPercent
    if (Math.abs(diff) >= 8) {
      notes.push(
        diff > 0
          ? `habit completion is up ${diff} points`
          : `habit completion is down ${Math.abs(diff)} points`,
      )
    }
  }

  const improving =
    current.avgScore >= previous.avgScore || current.healthyDays >= previous.healthyDays

  if (notes.length === 0) {
    return {
      headline: current.healthyDays >= 3 ? 'Steady week' : 'Early days',
      body:
        current.healthyDays >= 3
          ? `You had ${current.healthyDays} healthy days this week. Consistency like this is the whole point.`
          : 'Keep tracking for a few more days and your weekly picture will start to tell a story.',
    }
  }

  return {
    headline: improving ? 'You\'re becoming more consistent' : 'A slower week — that\'s alright',
    body: `${capitalise(listPhrase(notes))}. ${
      improving
        ? 'Keep doing what fits your routine.'
        : 'Busy weeks happen. Pick one area to protect next week and let the rest follow.'
    }`,
  }
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/* ------------------------------------------------------------------ */
/* AI Health Companion (PRD §13) — data-aware, rule based for the MVP. */
/* ------------------------------------------------------------------ */

export interface CompanionReply {
  text: string
  followUps?: string[]
}

export const COMPANION_PROMPTS = [
  'What should I do today?',
  'Should I workout today?',
  'I missed my workout yesterday. What should I do?',
  'What should I eat tonight?',
  'Why am I feeling tired?',
  'How is my week going?',
]

type Intent = 'plan' | 'workout' | 'missed' | 'food' | 'tired' | 'week' | 'sleep' | 'water' | 'unknown'

function detectIntent(question: string): Intent {
  const q = question.toLowerCase()
  const has = (...words: string[]) => words.some((w) => q.includes(w))

  if (has('miss', 'skipped', 'skip')) return 'missed'
  if (has('tired', 'exhausted', 'low energy', 'sleepy', 'drained')) return 'tired'
  if (has('eat', 'food', 'dinner', 'lunch', 'breakfast', 'protein', 'meal')) return 'food'
  if (has('water', 'hydrat', 'drink')) return 'water'
  if (has('workout', 'train', 'gym', 'exercise', 'lift', 'run')) return 'workout'
  if (has('sleep', 'bed', 'rest')) return 'sleep'
  if (has('week', 'progress', 'trend', 'doing overall')) return 'week'
  if (has('today', 'what should i do', 'plan')) return 'plan'
  return 'unknown'
}

const DISCLAIMER =
  'This is general lifestyle guidance, not medical advice.'

export function askCompanion(
  state: AppState,
  question: string,
  opts: { today?: string; week?: WeekSummary; now?: Date } = {},
): CompanionReply {
  const today = opts.today ?? todayISO()
  const now = opts.now ?? new Date()
  const summary = getDaySummary(state, today)
  const yesterday = getDaySummary(state, addDays(today, -1))
  const t = state.targets
  const name = state.profile?.name.split(' ')[0]
  const intent = detectIntent(question)

  const sleepLine = summary.sleep.logged
    ? `You slept ${formatDuration(summary.sleep.minutes)} last night`
    : yesterday.sleep.logged
      ? `Your last logged night was ${formatDuration(yesterday.sleep.minutes)}`
      : 'I don\'t have your sleep for last night yet'

  const daysSinceWorkout = daysSinceLastWorkout(state, today)

  switch (intent) {
    case 'plan': {
      const rec = dailyRecommendation(state, summary, now)
      return {
        text: [
          `${sleepLine}, and you're at ${summary.steps.value.toLocaleString()} steps with ${summary.habits.completed} of ${summary.habits.total || 0} habits done.`,
          `${rec.headline}. ${rec.body}`.replace(/\s+/g, ' ').trim(),
        ].join('\n\n'),
        followUps: ['Should I workout today?', 'What should I eat tonight?'],
      }
    }

    case 'workout': {
      if (summary.workout.status === 'completed') {
        return {
          text: `You already trained today — nice. ${sleepLine}. Keep the rest of the evening relaxed, get some protein in, and aim for your usual bedtime so tomorrow feels good too.`,
        }
      }
      const tired = summary.sleep.logged && summary.sleep.minutes < t.sleepMinutes - 90
      if (tired) {
        return {
          text: `${sleepLine}, which is below your ${formatDuration(t.sleepMinutes)} target. Training is still fine, but keep it lighter today — a shorter session or a 30–40 minute walk. You're at ${summary.workout.weekCount} of ${t.workoutsPerWeek} workouts this week, so there's room later in the week.\n\n${DISCLAIMER}`,
        }
      }
      if (daysSinceWorkout !== null && daysSinceWorkout >= 2) {
        return {
          text: `Yes — it's been ${daysSinceWorkout} days since your last session and ${sleepLine.toLowerCase()}. A 45-minute strength workout followed by a short walk would fit well. Keep the evening easy so you can get 7–8 hours tonight.`,
          followUps: ['What should I eat tonight?'],
        }
      }
      return {
        text: `You're at ${summary.workout.weekCount} of ${t.workoutsPerWeek} workouts this week and ${sleepLine.toLowerCase()}. If you have the time and energy, go ahead — otherwise a walk today and a full session tomorrow keeps the week on track either way.`,
      }
    }

    case 'missed': {
      return {
        text: `Missing one session doesn't undo the week — you're at ${summary.workout.weekCount} of ${t.workoutsPerWeek}.\n\nDon't try to make it up with a double session. Do today's workout as planned${
          summary.workout.weekCount < t.workoutsPerWeek
            ? ', and if you want, add one shorter session later in the week'
            : ''
        }. Getting back in on the next day is what actually builds consistency.`,
      }
    }

    case 'food': {
      const gap = Math.max(0, t.proteinG - summary.nutrition.protein)
      const mealsLeft = Math.max(0, t.mealsPerDay - summary.nutrition.mealsLogged)
      return {
        text: `So far today you've logged ${summary.nutrition.mealsLogged} of ${t.mealsPerDay} meals and ${summary.nutrition.protein}g of protein${
          gap > 0 ? `, about ${gap}g short of your ${t.proteinG}g target` : ' — target met'
        }.\n\n${
          gap > 0
            ? `For tonight, build the plate around a protein: chicken, fish, eggs, paneer, tofu or dal, with vegetables and a normal portion of rice or roti. That usually covers ${Math.min(gap, 35)}–40g.`
            : 'Eat something you enjoy tonight — you\'ve covered what matters today.'
        }${mealsLeft > 0 && summary.water.ratio < 0.8 ? ' A glass of water with the meal helps your hydration too.' : ''}\n\n${DISCLAIMER}`,
        followUps: ['How is my week going?'],
      }
    }

    case 'tired': {
      const reasons: string[] = []
      if (summary.sleep.logged && summary.sleep.minutes < t.sleepMinutes - 45) {
        reasons.push(`you slept ${formatDuration(t.sleepMinutes - summary.sleep.minutes)} less than your target`)
      }
      if (!summary.sleep.logged && yesterday.sleep.logged && yesterday.sleep.minutes < t.sleepMinutes - 45) {
        reasons.push('your last few nights were short')
      }
      if (summary.water.ratio < 0.5) reasons.push(`you've only had ${(summary.water.ml / 1000).toFixed(1)}L of water`)
      if (summary.nutrition.mealsLogged < 2) reasons.push('you haven\'t logged much food today')
      if (summary.sleep.entry?.quality === 'poor') reasons.push('you rated last night\'s sleep as poor')

      if (reasons.length === 0) {
        return {
          text: `Nothing obvious stands out in your data — ${sleepLine.toLowerCase()}, hydration and food look reasonable. Tiredness can also come from a heavy work day or a late finish. Try a short walk outside and an earlier bedtime tonight.\n\n${DISCLAIMER} If it keeps up, it's worth talking to a doctor.`,
        }
      }
      return {
        text: `A few things in your day might explain it: ${listPhrase(reasons)}.\n\nToday: drink a glass of water now, get something with protein in your next meal, and try to be in bed by ${state.profile?.typicalSleepTime ? formatClock(state.profile.typicalSleepTime) : 'your usual time'}. Keep any training light.\n\n${DISCLAIMER} If tiredness continues for more than a week or two, check in with a doctor.`,
      }
    }

    case 'sleep': {
      const week = opts.week
      return {
        text: `${sleepLine} against a target of ${formatDuration(t.sleepMinutes)}.${
          week && week.sleepNights >= 2
            ? ` Your average this week is ${formatDuration(week.avgSleepMinutes)} across ${week.sleepNights} logged nights.`
            : ''
        }\n\nThe thing that moves sleep most is a consistent bedtime — going to bed within about 30 minutes of the same time each night matters more than any one long night.`,
        followUps: ['How is my week going?'],
      }
    }

    case 'water': {
      return {
        text: `You're at ${(summary.water.ml / 1000).toFixed(1)}L of your ${(t.waterMl / 1000).toFixed(1)}L goal (${summary.water.glasses} of ${summary.water.targetGlasses} glasses). Keeping a bottle on your desk and refilling it after each break is usually enough to close the gap without thinking about it.`,
      }
    }

    case 'week': {
      const week = opts.week
      if (!week) {
        return { text: 'Open the Progress tab and I can walk you through your week.' }
      }
      return {
        text: `This week: ${week.workouts} workout${week.workouts === 1 ? '' : 's'}, ${
          week.sleepNights ? `${formatDuration(week.avgSleepMinutes)} average sleep` : 'no sleep logged yet'
        }, ${week.avgSteps.toLocaleString()} average steps, ${week.hydrationPercent}% hydration and ${week.habitPercent}% habit completion.\n\nYou've had ${week.healthyDays} healthy day${week.healthyDays === 1 ? '' : 's'} so far. ${
          week.healthyDays >= 4
            ? 'That is a genuinely good week — nothing to change.'
            : 'Pick the one area that feels easiest to improve and leave the rest alone.'
        }`,
      }
    }

    default: {
      const rec = dailyRecommendation(state, summary, now)
      return {
        text: `I can help with your day using what you've tracked${name ? `, ${name}` : ''} — sleep, workouts, food, water and habits.\n\nRight now: ${sleepLine.toLowerCase()}, ${summary.steps.value.toLocaleString()} steps, ${(summary.water.ml / 1000).toFixed(1)}L water and ${summary.habits.completed}/${summary.habits.total} habits done. ${rec.headline}. ${rec.body}`,
        followUps: COMPANION_PROMPTS.slice(0, 3),
      }
    }
  }
}

function formatClock(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${`${m}`.padStart(2, '0')} ${suffix}`
}

export function daysSinceLastWorkout(state: AppState, today: string): number | null {
  const completed = state.workouts
    .filter((w) => w.status === 'completed' && w.date <= today)
    .map((w) => w.date)
    .sort()
  if (completed.length === 0) return null
  const last = completed[completed.length - 1]
  let days = 0
  let cursor = today
  while (cursor > last && days < 60) {
    cursor = addDays(cursor, -1)
    days += 1
  }
  return days
}
