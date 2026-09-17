/** Local-time date helpers. Dates are "YYYY-MM-DD" strings throughout. */

export function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, '0')
  const d = `${date.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayISO(): string {
  return toISODate(new Date())
}

export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(iso: string, days: number): string {
  const date = fromISODate(iso)
  date.setDate(date.getDate() + days)
  return toISODate(date)
}

/** Whole days from `from` to `to` (negative when `to` is earlier). */
export function daysBetween(from: string, to: string): number {
  const ms = fromISODate(to).getTime() - fromISODate(from).getTime()
  return Math.round(ms / 86_400_000)
}

/**
 * Which day of the journey a date falls on, 1-based and clamped to the journey
 * length. Dates before the start return 0.
 */
export function journeyDay(startDate: string, duration: number, on = todayISO()): number {
  const offset = daysBetween(startDate, on)
  if (offset < 0) return 0
  return Math.min(duration, offset + 1)
}

/** Every date of the journey, oldest first. */
export function journeyDates(startDate: string, duration: number): string[] {
  return Array.from({ length: duration }, (_, i) => addDays(startDate, i))
}

export function greeting(now = new Date()): string {
  const hour = now.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

/** "7h 20m" from 7.33 hours. */
export function formatHours(hours: number | null): string {
  if (hours === null) return '—'
  const total = Math.max(0, Math.round(hours * 60))
  const h = Math.floor(total / 60)
  const m = total % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

const WEEKDAY_INITIALS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export const weekdayInitials = WEEKDAY_INITIALS

/** Monday-based weekday index (0 = Monday). */
export function weekdayIndex(iso: string): number {
  return (fromISODate(iso).getDay() + 6) % 7
}

/**
 * The journey laid out as calendar weeks, Monday first. Cells before the start
 * date or after the end are null so the grid keeps its shape.
 */
export function calendarWeeks(startDate: string, duration: number): (string | null)[][] {
  const dates = journeyDates(startDate, duration)
  const weeks: (string | null)[][] = []
  let week: (string | null)[] = Array.from({ length: weekdayIndex(startDate) }, () => null)

  for (const date of dates) {
    week.push(date)
    if (week.length === 7) {
      weeks.push(week)
      week = []
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null)
    weeks.push(week)
  }
  return weeks
}

/** "1 day" / "3 days" — keeps copy from reading like a database dump. */
export function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : pluralForm}`
}
