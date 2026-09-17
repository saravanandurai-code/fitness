import { addDays } from '../../lib/utils/date'
import { isDayComplete } from '../daily-log/progress'
import type { DailyLog, Routine } from '../../types'

/**
 * Consecutive complete days ending today. Today counts once it is complete, so
 * an in-progress day never appears to break the streak.
 */
export function currentStreak(
  logs: DailyLog[],
  routine: Routine,
  today: string,
  startDate: string,
): number {
  let streak = 0
  let cursor = isDayComplete(logs, routine, today) ? today : addDays(today, -1)

  while (cursor >= startDate) {
    if (!isDayComplete(logs, routine, cursor)) break
    streak += 1
    cursor = addDays(cursor, -1)
  }
  return streak
}

/** The best run of complete days anywhere in the journey so far. */
export function longestStreak(
  logs: DailyLog[],
  routine: Routine,
  startDate: string,
  through: string,
): number {
  let best = 0
  let run = 0
  let cursor = startDate

  while (cursor <= through) {
    if (isDayComplete(logs, routine, cursor)) {
      run += 1
      best = Math.max(best, run)
    } else {
      run = 0
    }
    cursor = addDays(cursor, 1)
  }
  return best
}
