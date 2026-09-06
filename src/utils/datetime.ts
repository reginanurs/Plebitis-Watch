function parseDateOnly(dateStr: string): { year: number; month: number; day: number } {
  const [year, month, day] = dateStr.split('-').map(Number)
  return { year, month: month - 1, day }
}

/**
 * Day count since PIVC installation, where the installation day itself is
 * "Hari ke-1" — e.g. installed 1 Sep, referenced on 4 Sep → "Hari ke-4".
 * Compares calendar dates only (via UTC-normalized components, not local
 * `Date` getters) so it is not affected by time-of-day or timezone.
 */
export function calculatePivcDay(installationDate: string, referenceDate: string): number {
  const install = parseDateOnly(installationDate)
  const reference = parseDateOnly(referenceDate)
  const installUTC = Date.UTC(install.year, install.month, install.day)
  const referenceUTC = Date.UTC(reference.year, reference.month, reference.day)
  const diffDays = Math.round((referenceUTC - installUTC) / (24 * 60 * 60 * 1000))
  return diffDays + 1
}

export function todayDateString(): string {
  return new Date().toISOString().slice(0, 10)
}

export function nowTimeString(): string {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

function isSameCalendarDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

/**
 * Indonesian-friendly relative/absolute timestamp for notifications,
 * e.g. "5 menit yang lalu", "Hari ini, 14:30", "Kemarin, 09:15", or a
 * plain formatted date for anything older.
 */
export function formatRelativeTimestamp(iso: string, now: Date = new Date()): string {
  const date = new Date(iso)
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000)
  const timeLabel = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

  if (diffMinutes < 1) return 'Baru saja'
  if (diffMinutes < 60) return `${diffMinutes} menit yang lalu`
  if (isSameCalendarDay(date, now)) return `Hari ini, ${timeLabel}`

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (isSameCalendarDay(date, yesterday)) return `Kemarin, ${timeLabel}`

  return `${date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}, ${timeLabel}`
}

export type PeriodFilter = 'all' | 'today' | '7d' | '30d' | '90d'

/**
 * Checks whether a timestamp falls within a period bucket relative to
 * `now`, using real Date arithmetic (not formatted-string comparison).
 */
export function isWithinPeriod(timestampMs: number, period: PeriodFilter, now: Date = new Date()): boolean {
  if (period === 'all') return true

  if (period === 'today') {
    return isSameCalendarDay(new Date(timestampMs), now)
  }

  const diffMs = now.getTime() - timestampMs
  if (period === '7d') return diffMs >= 0 && diffMs <= 7 * 24 * 60 * 60 * 1000
  if (period === '30d') return diffMs >= 0 && diffMs <= 30 * 24 * 60 * 60 * 1000
  if (period === '90d') return diffMs >= 0 && diffMs <= 90 * 24 * 60 * 60 * 1000
  return true
}
