/**
 * `status` is intentionally NOT stored on the reminder — it must always be
 * derived live from `nextMonitoringAt` vs. the current time (see
 * src/utils/reminder.ts). Storing it would risk a reminder staying
 * "overdue" after it has already been rescheduled.
 */
export type ReminderStatus = 'overdue' | 'due_soon' | 'today' | 'scheduled'

export interface Reminder {
  id: string
  patientId: string
  pivcId: string

  basedOnAssessmentId?: string

  nextMonitoringAt: string
  intervalMinutes: number

  enabled: boolean

  /**
   * Free-text provenance for the interval used, e.g. "SOP Unit X",
   * "Kebijakan fasilitas", "Pengaturan pasien", "Demo prototype".
   * `null` means no source has been configured yet.
   */
  source: string | null

  createdAt: string
  updatedAt: string
}

export type ReminderInput = Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>
