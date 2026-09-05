export type ReminderIntervalUnit = 'minutes' | 'hours' | 'days'

/**
 * "demo" means the interval is only a prototype placeholder, not a
 * confirmed facility/clinical configuration. "pending" means no source
 * has been supplied yet. "confirmed" means a source has been explicitly
 * entered through the settings editor — it still does NOT mean the value
 * is a universal clinical standard, only that it is a deliberate,
 * sourced, facility-specific choice.
 */
export type ReminderClinicalStatus = 'pending' | 'demo' | 'confirmed'

export interface ReminderSettings {
  enabled: boolean
  defaultIntervalMinutes: number | null
  intervalUnit: ReminderIntervalUnit
  source: string | null
  clinicalStatus: ReminderClinicalStatus
}
