import { describe, expect, it } from 'vitest'
import { askCompanion, dailyRecommendation, daysSinceLastWorkout, weeklyProgressMessage } from '../advice'
import { emptyState } from '../storage'
import { getDaySummary, getWeekSummary } from '../summary'
import type { AppState } from '../types'

const TODAY = '2026-08-13'

function stateWithProfile(): AppState {
  return {
    ...emptyState(),
    onboarded: true,
    profile: {
      name: 'Alex Kim',
      goal: 'muscle',
      workSchedule: '9:00 AM – 6:00 PM',
      preferredWorkoutTime: 'Evening',
      typicalSleepTime: '23:30',
      typicalWakeTime: '07:00',
      createdAt: TODAY,
    },
    habits: [{ id: 'h1', name: 'Drink 2.5L water', emoji: '💧', frequency: 'daily', createdAt: TODAY }],
  }
}

const morning = new Date('2026-08-13T08:30:00')
const evening = new Date('2026-08-13T19:30:00')

describe('dailyRecommendation', () => {
  it('asks for last night first thing in the morning', () => {
    const state = stateWithProfile()
    const summary = getDaySummary(state, TODAY, TODAY)
    const reco = dailyRecommendation(state, summary, morning)
    expect(reco.action?.to).toBe('/sleep')
    expect(reco.headline).toMatch(/last night/i)
  })

  it('suggests taking it easy after a short night', () => {
    const state = stateWithProfile()
    state.sleep[TODAY] = { date: TODAY, bedTime: '01:30', wakeTime: '06:30', minutes: 300, source: 'manual' }
    const summary = getDaySummary(state, TODAY, TODAY)
    const reco = dailyRecommendation(state, summary, morning)
    expect(reco.headline).toMatch(/light/i)
  })

  it('never scolds when everything is on track', () => {
    const state = stateWithProfile()
    state.sleep[TODAY] = { date: TODAY, bedTime: '23:00', wakeTime: '07:00', minutes: 480, source: 'manual' }
    state.activity[TODAY] = { date: TODAY, steps: 12000 }
    state.nutrition[TODAY] = {
      date: TODAY,
      waterMl: 2500,
      meals: [
        { id: 'a', type: 'breakfast', description: 'Eggs', proteinG: 40, loggedAt: TODAY },
        { id: 'b', type: 'lunch', description: 'Chicken rice', proteinG: 45, loggedAt: TODAY },
        { id: 'c', type: 'dinner', description: 'Paneer', proteinG: 40, loggedAt: TODAY },
      ],
    }
    state.workouts = [
      { id: 'w1', date: TODAY, title: 'Upper', status: 'completed', exercises: [], durationMin: 45 },
    ]
    state.habitCompletions[TODAY] = ['h1']

    const summary = getDaySummary(state, TODAY, TODAY)
    const reco = dailyRecommendation(state, summary, evening)
    expect(reco.headline).toMatch(/doing well/i)
    expect(reco.body).not.toMatch(/fail|bad|missed/i)
  })
})

describe('askCompanion', () => {
  it('answers a missed workout without piling on guilt', () => {
    const state = stateWithProfile()
    const reply = askCompanion(state, 'I missed my workout yesterday. What should I do?', { today: TODAY })
    expect(reply.text).toMatch(/doesn't undo the week/i)
    expect(reply.text).toMatch(/Don't try to make it up/i)
  })

  it('uses tracked data when explaining tiredness and adds a medical disclaimer', () => {
    const state = stateWithProfile()
    state.sleep[TODAY] = { date: TODAY, bedTime: '01:00', wakeTime: '06:00', minutes: 300, source: 'manual' }
    state.nutrition[TODAY] = { date: TODAY, waterMl: 250, meals: [] }
    const reply = askCompanion(state, 'Why am I feeling tired?', { today: TODAY })
    expect(reply.text).toMatch(/slept/i)
    expect(reply.text).toMatch(/not medical advice/i)
  })

  it('summarises the week when asked about progress', () => {
    const state = stateWithProfile()
    state.activity[TODAY] = { date: TODAY, steps: 8000 }
    const week = getWeekSummary(state, TODAY, TODAY)
    const reply = askCompanion(state, 'How is my week going?', { today: TODAY, week })
    expect(reply.text).toMatch(/healthy day/i)
  })

  it('falls back to a data-aware summary for unrecognised questions', () => {
    const state = stateWithProfile()
    const reply = askCompanion(state, 'asdf qwerty', { today: TODAY })
    expect(reply.text).toMatch(/Alex/)
    expect(reply.followUps?.length).toBeGreaterThan(0)
  })
})

describe('daysSinceLastWorkout', () => {
  it('counts back to the most recent completed session', () => {
    const state = stateWithProfile()
    state.workouts = [
      { id: 'w1', date: '2026-08-10', title: 'Upper', status: 'completed', exercises: [] },
      { id: 'w2', date: '2026-08-11', title: 'Lower', status: 'completed', exercises: [] },
      { id: 'w3', date: '2026-08-14', title: 'Planned', status: 'planned', exercises: [] },
    ]
    expect(daysSinceLastWorkout(state, TODAY)).toBe(2)
  })

  it('returns null when nothing has been logged', () => {
    expect(daysSinceLastWorkout(stateWithProfile(), TODAY)).toBeNull()
  })
})

describe('weeklyProgressMessage', () => {
  it('frames a quieter week kindly', () => {
    const state = stateWithProfile()
    const current = getWeekSummary(state, TODAY, TODAY)
    const previous = { ...current, workouts: 4, avgSleepMinutes: 460, sleepNights: 5 }
    const message = weeklyProgressMessage({ ...current, workouts: 1 }, previous)
    expect(message.body).toMatch(/Busy weeks happen|Keep doing what fits/)
  })
})
