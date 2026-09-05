import type { ReminderStatus } from '../types/reminder'

/**
 * Deterministic id for a reminder-generated notification, keyed by the
 * reminder and the schedule bucket that triggered it. Reusing this id
 * is how notification generation stays idempotent — regenerating for a
 * reminder already in the same state is a no-op, never a duplicate.
 * If the reminder later escalates to a different bucket (e.g.
 * due_soon -> overdue), a new id naturally allows one fresh notice for
 * that escalation.
 */
export function buildReminderNotificationId(reminderId: string, status: ReminderStatus): string {
  return `reminder-${reminderId}-${status}`
}
