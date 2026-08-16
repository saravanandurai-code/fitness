import { describe, expect, it } from 'vitest'
import {
  addDays,
  averageTimeOfDay,
  formatDuration,
  formatTime,
  lastNDays,
  minutesToHHMM,
  sleepMinutes,
  startOfWeek,
  weekDates,
} from '../date'

describe('sleepMinutes', () => {
  it('handles a night that crosses midnight', () => {
    expect(sleepMinutes('23:20', '07:05')).toBe(7 * 60 + 45)
  })

  it('handles a nap inside the same day', () => {
    expect(sleepMinutes('01:00', '08:30')).toBe(7 * 60 + 30)
  })

  it('treats identical times as a full day rather than zero', () => {
    expect(sleepMinutes('23:00', '23:00')).toBe(24 * 60)
  })
})

describe('formatDuration', () => {
  it('formats hours and minutes', () => {
    expect(formatDuration(465)).toBe('7h 45m')
    expect(formatDuration(480)).toBe('8h')
    expect(formatDuration(45)).toBe('45m')
    expect(formatDuration(-10)).toBe('0m')
  })
})

describe('formatTime', () => {
  it('formats 24h input as 12h', () => {
    expect(formatTime('23:30')).toBe('11:30 PM')
    expect(formatTime('00:05')).toBe('12:05 AM')
    expect(formatTime('12:00')).toBe('12:00 PM')
  })
})

describe('week helpers', () => {
  it('starts weeks on Monday', () => {
    // 2026-08-16 is a Sunday.
    expect(startOfWeek('2026-08-16')).toBe('2026-08-10')
    expect(startOfWeek('2026-08-10')).toBe('2026-08-10')
  })

  it('returns seven dates Monday first', () => {
    const dates = weekDates('2026-08-16')
    expect(dates).toHaveLength(7)
    expect(dates[0]).toBe('2026-08-10')
    expect(dates[6]).toBe('2026-08-16')
  })

  it('adds days across month boundaries', () => {
    expect(addDays('2026-08-31', 1)).toBe('2026-09-01')
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31')
  })

  it('returns the last n days ending today', () => {
    expect(lastNDays('2026-08-16', 3)).toEqual(['2026-08-14', '2026-08-15', '2026-08-16'])
  })
})

describe('averageTimeOfDay', () => {
  it('averages around midnight without wrapping to midday', () => {
    // 23:00 and 01:00 should average to midnight, not to noon.
    const avg = averageTimeOfDay([23 * 60, 1 * 60])
    expect(avg).not.toBeNull()
    expect(minutesToHHMM(avg as number)).toBe('00:00')
  })

  it('returns null with no samples', () => {
    expect(averageTimeOfDay([])).toBeNull()
  })
})
