/** Small date helpers. All dates are handled as local-time "YYYY-MM-DD" strings. */

export function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayISO(): string {
  return toISODate(new Date())
}

export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(iso: string, days: number): string {
  const d = fromISODate(iso)
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

/** Monday-based start of the week containing `iso`. */
export function startOfWeek(iso: string): string {
  const d = fromISODate(iso)
  const dow = (d.getDay() + 6) % 7 // 0 = Monday
  return addDays(iso, -dow)
}

/** The 7 dates of the week containing `iso`, Monday first. */
export function weekDates(iso: string): string[] {
  const start = startOfWeek(iso)
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

/** The last `n` dates ending at `iso` (inclusive), oldest first. */
export function lastNDays(iso: string, n: number): string[] {
  return Array.from({ length: n }, (_, i) => addDays(iso, i - (n - 1)))
}

const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function shortDayLabel(iso: string): string {
  const d = fromISODate(iso)
  return DAY_SHORT[(d.getDay() + 6) % 7]
}

export function formatLongDate(iso: string): string {
  return fromISODate(iso).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

export function formatShortDate(iso: string): string {
  return fromISODate(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function relativeDayLabel(iso: string, today = todayISO()): string {
  if (iso === today) return 'Today'
  if (iso === addDays(today, -1)) return 'Yesterday'
  if (iso === addDays(today, 1)) return 'Tomorrow'
  return formatShortDate(iso)
}

/** "23:30" -> 1410 minutes past midnight. */
export function parseTime(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return 0
  return h * 60 + m
}

/** 1410 -> "11:30 PM" */
export function formatTime(hhmm: string): string {
  const mins = parseTime(hhmm)
  const h24 = Math.floor(mins / 60) % 24
  const m = mins % 60
  const suffix = h24 >= 12 ? 'PM' : 'AM'
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12
  return `${h12}:${`${m}`.padStart(2, '0')} ${suffix}`
}

/** Minutes slept between a bedtime and a wake time, handling the midnight wrap. */
export function sleepMinutes(bedTime: string, wakeTime: string): number {
  const bed = parseTime(bedTime)
  const wake = parseTime(wakeTime)
  const diff = wake - bed
  return diff > 0 ? diff : diff + 24 * 60
}

/** 465 -> "7h 45m" */
export function formatDuration(minutes: number): string {
  const safe = Math.max(0, Math.round(minutes))
  const h = Math.floor(safe / 60)
  const m = safe % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

/** Circular mean of times-of-day (in minutes), used for sleep-schedule consistency. */
export function averageTimeOfDay(times: number[]): number | null {
  if (times.length === 0) return null
  let x = 0
  let y = 0
  for (const t of times) {
    const angle = (t / (24 * 60)) * 2 * Math.PI
    x += Math.cos(angle)
    y += Math.sin(angle)
  }
  const mean = Math.atan2(y / times.length, x / times.length)
  const minutes = ((mean / (2 * Math.PI)) * 24 * 60 + 24 * 60) % (24 * 60)
  return Math.round(minutes)
}

export function minutesToHHMM(minutes: number): string {
  const safe = ((Math.round(minutes) % (24 * 60)) + 24 * 60) % (24 * 60)
  return `${`${Math.floor(safe / 60)}`.padStart(2, '0')}:${`${safe % 60}`.padStart(2, '0')}`
}

export function greeting(now = new Date()): string {
  const h = now.getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}
