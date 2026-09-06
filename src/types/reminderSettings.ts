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

/** Which condition produced a given reminder — kept distinct so they never get mixed up. */
export type ReminderTriggerType = 'vip_score' | 'special_therapy'

export interface ScoreBasedIntervals {
  /** Minutes for VIP Score 0 — prototype default represents "every shift". */
  score0Minutes: number
  /** Minutes for VIP Score 1. */
  score1Minutes: number
}

/**
 * Architecture placeholder for a future "special therapy" monitoring rule
 * (concentrated fluids/electrolytes such as NaCl 3%, KCl, Ca gluconate,
 * MgSO4). Intentionally NOT wired to any automatic trigger yet — kept
 * disabled until a facility policy/source is supplied. `stageMinutes` is
 * a conceptual staged interval (e.g. 15 → 30 → hourly), not a universal
 * clinical standard.
 */
export interface SpecialTherapyMonitoringConfig {
  enabled: boolean
  stageMinutes: number[]
  note: string
}

export interface ReminderSettings {
  enabled: boolean
  defaultIntervalMinutes: number | null
  intervalUnit: ReminderIntervalUnit
  source: string | null
  clinicalStatus: ReminderClinicalStatus
  /** Optional VIP-Score-aware interval overrides for scores 0 and 1 (score >= 2 relies on the recommendation instead of a routine reminder). */
  scoreBasedIntervals?: ScoreBasedIntervals
  specialTherapyMonitoring?: SpecialTherapyMonitoringConfig
}
