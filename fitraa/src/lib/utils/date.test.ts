import { describe, expect, it } from 'vitest'
import {
  addDays,
  calendarWeeks,
  daysBetween,
  formatHours,
  journeyDates,
  journeyDay,
  plural,
  weekdayIndex,
} from './date'

describe('date helpers', () => {
  it('adds days across month boundaries', () => {
    expect(addDays('2026-09-30', 1)).toBe('2026-10-01')
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31')
  })

  it('measures whole days between dates', () => {
    expect(daysBetween('2026-09-07', '2026-09-10')).toBe(3)
    expect(daysBetween('2026-09-10', '2026-09-07')).toBe(-3)
  })

  it('treats Monday as the first day of the week', () => {
    expect(weekdayIndex('2026-09-07')).toBe(0)
    expect(weekdayIndex('2026-09-13')).toBe(6)
  })
})

describe('journeyDay', () => {
  it('is 1 on the start date and clamps at the end', () => {
    expect(journeyDay('2026-09-07', 30, '2026-09-07')).toBe(1)
    expect(journeyDay('2026-09-07', 30, '2026-09-20')).toBe(14)
    expect(journeyDay('2026-09-07', 30, '2026-12-01')).toBe(30)
  })

  it('is 0 before the journey begins', () => {
    expect(journeyDay('2026-09-07', 30, '2026-09-01')).toBe(0)
  })
})

describe('journeyDates', () => {
  it('returns one date per day', () => {
    const dates = journeyDates('2026-09-07', 30)
    expect(dates).toHaveLength(30)
    expect(dates[0]).toBe('2026-09-07')
    expect(dates[29]).toBe('2026-10-06')
  })
})

describe('calendarWeeks', () => {
  it('pads the first week so weekdays line up', () => {
    // 2026-09-09 is a Wednesday, so Monday and Tuesday are empty.
    const weeks = calendarWeeks('2026-09-09', 30)
    expect(weeks[0].slice(0, 2)).toEqual([null, null])
    expect(weeks[0][2]).toBe('2026-09-09')
    expect(weeks.every((week) => week.length === 7)).toBe(true)
  })

  it('keeps every journey date exactly once', () => {
    const weeks = calendarWeeks('2026-09-07', 30)
    const dates = weeks.flat().filter(Boolean)
    expect(new Set(dates).size).toBe(30)
  })
})

describe('formatHours', () => {
  it('formats hours and minutes', () => {
    expect(formatHours(7.333)).toBe('7h 20m')
    expect(formatHours(8)).toBe('8h')
    expect(formatHours(0.5)).toBe('30m')
    expect(formatHours(null)).toBe('—')
  })
})

describe('plural', () => {
  it('uses the singular for one', () => {
    expect(plural(1, 'day')).toBe('1 day')
    expect(plural(0, 'day')).toBe('0 days')
    expect(plural(12, 'day')).toBe('12 days')
  })
})
