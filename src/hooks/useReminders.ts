import { useCallback } from 'react'
import remindersSeed from '../data/reminders.json'
import type { Reminder, ReminderInput } from '../types/reminder'
import { calculateNextMonitoringAt, getReminderStatus } from '../utils/reminder'
import { useLocalStorageState } from './useLocalStorageState'

const STORAGE_KEY = 'plebitis-watch.reminders'

interface ScheduleNextParams {
  patientId: string
  pivcId: string
  basedOnAssessmentId?: string
  fromAt: string
  intervalMinutes: number
  source: string | null
}

export function useReminders() {
  const [reminders, setReminders] = useLocalStorageState<Reminder[]>(STORAGE_KEY, remindersSeed as Reminder[])

  const addReminder = useCallback(
    (input: ReminderInput): Reminder => {
      const now = new Date().toISOString()
      const newReminder: Reminder = { ...input, id: crypto.randomUUID(), createdAt: now, updatedAt: now }
      setReminders((prev) => [newReminder, ...prev])
      return newReminder
    },
    [setReminders],
  )

  const updateReminder = useCallback(
    (updated: Reminder) => {
      setReminders((prev) =>
        prev.map((reminder) =>
          reminder.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : reminder,
        ),
      )
    },
    [setReminders],
  )

  const removeReminder = useCallback(
    (id: string) => {
      setReminders((prev) => prev.filter((reminder) => reminder.id !== id))
    },
    [setReminders],
  )

  const getReminderById = useCallback((id: string) => reminders.find((reminder) => reminder.id === id), [reminders])

  const getRemindersByPatientId = useCallback(
    (patientId: string) => reminders.filter((reminder) => reminder.patientId === patientId),
    [reminders],
  )

  const getRemindersByPivcId = useCallback(
    (pivcId: string) => reminders.filter((reminder) => reminder.pivcId === pivcId),
    [reminders],
  )

  const getDueReminders = useCallback(
    () => reminders.filter((reminder) => reminder.enabled && getReminderStatus(reminder.nextMonitoringAt) === 'due_soon'),
    [reminders],
  )

  const getOverdueReminders = useCallback(
    () => reminders.filter((reminder) => reminder.enabled && getReminderStatus(reminder.nextMonitoringAt) === 'overdue'),
    [reminders],
  )

  /**
   * Upserts the single next-monitoring reminder for a PIVC episode,
   * keyed by pivcId — this is how completing a new assessment
   * reschedules monitoring without duplicating reminder records or
   * leaving the previous one incorrectly stuck as overdue.
   */
  const scheduleNextForPivc = useCallback(
    ({ patientId, pivcId, basedOnAssessmentId, fromAt, intervalMinutes, source }: ScheduleNextParams) => {
      const nextMonitoringAt = calculateNextMonitoringAt(fromAt, intervalMinutes)
      const now = new Date().toISOString()

      setReminders((prev) => {
        const existingIndex = prev.findIndex((reminder) => reminder.pivcId === pivcId)
        if (existingIndex >= 0) {
          const next = [...prev]
          next[existingIndex] = {
            ...next[existingIndex],
            nextMonitoringAt,
            intervalMinutes,
            basedOnAssessmentId,
            source,
            enabled: true,
            updatedAt: now,
          }
          return next
        }

        const newReminder: Reminder = {
          id: crypto.randomUUID(),
          patientId,
          pivcId,
          basedOnAssessmentId,
          nextMonitoringAt,
          intervalMinutes,
          enabled: true,
          source,
          createdAt: now,
          updatedAt: now,
        }
        return [newReminder, ...prev]
      })
    },
    [setReminders],
  )

  return {
    reminders,
    addReminder,
    updateReminder,
    removeReminder,
    getReminderById,
    getRemindersByPatientId,
    getRemindersByPivcId,
    getDueReminders,
    getOverdueReminders,
    scheduleNextForPivc,
  }
}
