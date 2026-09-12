import type { ReminderStatus } from '../types/reminder'
import type { ReminderIntervalUnit } from '../types/reminderSettings'

const DUE_SOON_WINDOW_MS = 60 * 60 * 1000

/**
 * Adds `intervalMinutes` to a base date/time to produce the next
 * monitoring timestamp. `fromAt` is a local wall-clock datetime string
 * (no timezone suffix) — `new Date(fromAt)` correctly interprets that as
 * local time per spec. The result is a real UTC ISO string, since this
 * value is persisted to a Postgres `timestamptz` column: storing a naive
 * local string there would have Postgres treat it as UTC and silently
 * shift every reminder by the local UTC offset. `Date` objects (and thus
 * `getReminderStatus`/`getTimeRemainingLabel`, which just parse this
 * string back with `new Date(...)`) represent a moment in time
 * regardless of string format, so this only changes serialization, not
 * how the value is used.
 */
export function calculateNextMonitoringAt(fromAt: string, intervalMinutes: number): string {
  const base = new Date(fromAt)
  const next = new Date(base.getTime() + intervalMinutes * 60 * 1000)
  return next.toISOString()
}

function isSameCalendarDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

/**
 * These buckets (overdue / due-soon-within-1-hour / today / scheduled)
 * are UI presentation states for organizing the reminder list — not
 * clinical classifications. They are always derived live from the
 * schedule and the current time, never stored.
 */
export function getReminderStatus(nextMonitoringAt: string, now: Date = new Date()): ReminderStatus {
  const next = new Date(nextMonitoringAt)
  const diffMs = next.getTime() - now.getTime()

  if (diffMs < 0) return 'overdue'
  if (diffMs <= DUE_SOON_WINDOW_MS) return 'due_soon'
  if (isSameCalendarDay(next, now)) return 'today'
  return 'scheduled'
}

function pluralizeMinutes(minutes: number): string {
  return `${minutes} menit`
}

function pluralizeHours(hours: number): string {
  return `${hours} jam`
}

/**
 * Human-friendly countdown/overdue text, e.g. "45 menit terlambat",
 * "30 menit lagi", "1 jam lagi". Falls back to a formatted date/time
 * for schedules more than a day away.
 */
export function getTimeRemainingLabel(nextMonitoringAt: string, now: Date = new Date()): string {
  const next = new Date(nextMonitoringAt)
  const diffMs = next.getTime() - now.getTime()
  const absMinutes = Math.round(Math.abs(diffMs) / 60000)

  if (diffMs < 0) {
    if (absMinutes < 60) return `${pluralizeMinutes(absMinutes)} terlambat`
    const hours = Math.round(absMinutes / 60)
    return `${pluralizeHours(hours)} terlambat`
  }

  if (isSameCalendarDay(next, now)) {
    if (absMinutes < 60) return `${pluralizeMinutes(absMinutes)} lagi`
    const hours = Math.round(absMinutes / 60)
    return `${pluralizeHours(hours)} lagi`
  }

  return next.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const MINUTES_PER_UNIT: Record<ReminderIntervalUnit, number> = {
  minutes: 1,
  hours: 60,
  days: 60 * 24,
}

export function convertToMinutes(value: number, unit: ReminderIntervalUnit): number {
  return Math.round(value * MINUTES_PER_UNIT[unit])
}

/** Picks the largest whole unit that evenly divides the interval, for a tidy settings display. */
export function convertFromMinutes(minutes: number): { value: number; unit: ReminderIntervalUnit } {
  if (minutes % MINUTES_PER_UNIT.days === 0) return { value: minutes / MINUTES_PER_UNIT.days, unit: 'days' }
  if (minutes % MINUTES_PER_UNIT.hours === 0) return { value: minutes / MINUTES_PER_UNIT.hours, unit: 'hours' }
  return { value: minutes, unit: 'minutes' }
}

const UNIT_LABEL: Record<ReminderIntervalUnit, (value: number) => string> = {
  minutes: (value) => `${value} menit`,
  hours: (value) => `${value} jam`,
  days: (value) => `${value} hari`,
}

/** Formats a raw minute count as "Setiap X jam/menit/hari" for display. */
export function formatIntervalLabel(intervalMinutes: number): string {
  const { value, unit } = convertFromMinutes(intervalMinutes)
  return `Setiap ${UNIT_LABEL[unit](value)}`
}
