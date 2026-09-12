import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Reminder, ReminderInput } from '../types/reminder'
import type { ReminderTriggerType } from '../types/reminderSettings'
import { calculateNextMonitoringAt, getReminderStatus } from '../utils/reminder'

interface ReminderRow {
  id: string
  patient_id: string
  pivc_id: string
  based_on_assessment_id: string | null
  next_monitoring_at: string
  interval_minutes: number
  enabled: boolean
  source: string | null
  trigger_type: ReminderTriggerType | null
  created_at: string
  updated_at: string
}

interface ScheduleNextParams {
  patientId: string
  pivcId: string
  basedOnAssessmentId?: string
  fromAt: string
  intervalMinutes: number
  source: string | null
  triggerType?: ReminderTriggerType
}

function rowToReminder(row: ReminderRow): Reminder {
  return {
    id: row.id,
    patientId: row.patient_id,
    pivcId: row.pivc_id,
    basedOnAssessmentId: row.based_on_assessment_id ?? undefined,
    nextMonitoringAt: row.next_monitoring_at,
    intervalMinutes: row.interval_minutes,
    enabled: row.enabled,
    source: row.source,
    triggerType: row.trigger_type ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function reminderToRow(input: ReminderInput) {
  return {
    patient_id: input.patientId,
    pivc_id: input.pivcId,
    based_on_assessment_id: input.basedOnAssessmentId ?? null,
    next_monitoring_at: input.nextMonitoringAt,
    interval_minutes: input.intervalMinutes,
    enabled: input.enabled,
    source: input.source,
    trigger_type: input.triggerType ?? null,
  }
}

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    supabase
      .from('reminders')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!isMounted) return
        if (error) {
          console.error('Failed to load reminders:', error)
        } else {
          setReminders((data as ReminderRow[]).map(rowToReminder))
        }
        setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const addReminder = useCallback(async (input: ReminderInput): Promise<Reminder> => {
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('reminders')
      .insert({ id: crypto.randomUUID(), ...reminderToRow(input), created_at: now, updated_at: now })
      .select()
      .single()

    if (error) throw error

    const newReminder = rowToReminder(data as ReminderRow)
    setReminders((prev) => [newReminder, ...prev])
    return newReminder
  }, [])

  const updateReminder = useCallback(async (updated: Reminder) => {
    const { error } = await supabase
      .from('reminders')
      .update({ ...reminderToRow(updated), updated_at: new Date().toISOString() })
      .eq('id', updated.id)
    if (error) throw error
    setReminders((prev) =>
      prev.map((reminder) =>
        reminder.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : reminder,
      ),
    )
  }, [])

  const removeReminder = useCallback(async (id: string) => {
    const { error } = await supabase.from('reminders').delete().eq('id', id)
    if (error) throw error
    setReminders((prev) => prev.filter((reminder) => reminder.id !== id))
  }, [])

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
   * Upserts the single next-monitoring reminder for a PIVC episode, keyed
   * by pivcId — this is how completing a new assessment reschedules
   * monitoring without duplicating reminder records or leaving the
   * previous one incorrectly stuck as overdue. Keyed by pivc_id rather
   * than the primary key, so this is two explicit queries (find, then
   * update-or-insert) rather than a single `upsert`.
   */
  const scheduleNextForPivc = useCallback(
    async ({ patientId, pivcId, basedOnAssessmentId, fromAt, intervalMinutes, source, triggerType }: ScheduleNextParams) => {
      const nextMonitoringAt = calculateNextMonitoringAt(fromAt, intervalMinutes)
      const now = new Date().toISOString()

      const { data: existing, error: findError } = await supabase
        .from('reminders')
        .select('id')
        .eq('pivc_id', pivcId)
        .maybeSingle()
      if (findError) throw findError

      if (existing) {
        const { error } = await supabase
          .from('reminders')
          .update({
            next_monitoring_at: nextMonitoringAt,
            interval_minutes: intervalMinutes,
            based_on_assessment_id: basedOnAssessmentId ?? null,
            source,
            trigger_type: triggerType ?? null,
            enabled: true,
            updated_at: now,
          })
          .eq('id', existing.id)
        if (error) throw error

        setReminders((prev) =>
          prev.map((reminder) =>
            reminder.id === existing.id
              ? {
                  ...reminder,
                  nextMonitoringAt,
                  intervalMinutes,
                  basedOnAssessmentId,
                  source,
                  triggerType,
                  enabled: true,
                  updatedAt: now,
                }
              : reminder,
          ),
        )
        return
      }

      const { data, error } = await supabase
        .from('reminders')
        .insert({
          id: crypto.randomUUID(),
          patient_id: patientId,
          pivc_id: pivcId,
          based_on_assessment_id: basedOnAssessmentId ?? null,
          next_monitoring_at: nextMonitoringAt,
          interval_minutes: intervalMinutes,
          enabled: true,
          source,
          trigger_type: triggerType ?? null,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single()
      if (error) throw error

      setReminders((prev) => [rowToReminder(data as ReminderRow), ...prev])
    },
    [],
  )

  return {
    reminders,
    isLoading,
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
