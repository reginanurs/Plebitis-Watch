import { useCallback, useEffect, useState } from 'react'
import reminderSettingsSeed from '../data/reminderSettings.json'
import { supabase } from '../lib/supabaseClient'
import type { ReminderSettings } from '../types/reminderSettings'

const DEFAULT_SETTINGS = reminderSettingsSeed as ReminderSettings

interface ReminderSettingsRow {
  enabled: boolean
  default_interval_minutes: number | null
  interval_unit: ReminderSettings['intervalUnit']
  source: string | null
  clinical_status: ReminderSettings['clinicalStatus']
  score_based_intervals: ReminderSettings['scoreBasedIntervals'] | null
  special_therapy_monitoring: ReminderSettings['specialTherapyMonitoring'] | null
}

function rowToSettings(row: ReminderSettingsRow): ReminderSettings {
  return {
    enabled: row.enabled,
    defaultIntervalMinutes: row.default_interval_minutes,
    intervalUnit: row.interval_unit,
    source: row.source,
    clinicalStatus: row.clinical_status,
    scoreBasedIntervals: row.score_based_intervals ?? undefined,
    specialTherapyMonitoring: row.special_therapy_monitoring ?? undefined,
  }
}

function settingsToRow(settings: ReminderSettings) {
  return {
    enabled: settings.enabled,
    default_interval_minutes: settings.defaultIntervalMinutes,
    interval_unit: settings.intervalUnit,
    source: settings.source,
    clinical_status: settings.clinicalStatus,
    score_based_intervals: settings.scoreBasedIntervals ?? null,
    special_therapy_monitoring: settings.specialTherapyMonitoring ?? null,
  }
}

/**
 * Single source of truth for the reminder interval configuration — every
 * part of the app that needs the default monitoring interval should read
 * it from here rather than hard-coding its own constant.
 *
 * `reminder_settings` is a singleton row (`id boolean primary key default
 * true`, see supabase/schema.sql), not a list — read/write always target
 * that one row (`eq('id', true)`). `settings` falls back to the local
 * seed default while loading (or if the row is somehow missing), so
 * consumers that don't explicitly gate on `isLoading` still get a safe
 * object shape instead of `null`.
 */
export function useReminderSettings() {
  const [settings, setSettings] = useState<ReminderSettings>(DEFAULT_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    supabase
      .from('reminder_settings')
      .select('*')
      .eq('id', true)
      .single()
      .then(({ data, error }) => {
        if (!isMounted) return
        if (error) {
          console.error('Failed to load reminder settings:', error)
        } else {
          setSettings(rowToSettings(data as ReminderSettingsRow))
        }
        setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const updateSettings = useCallback(async (updated: ReminderSettings) => {
    const { error } = await supabase
      .from('reminder_settings')
      .update({ ...settingsToRow(updated), updated_at: new Date().toISOString() })
      .eq('id', true)
    if (error) throw error
    setSettings(updated)
  }, [])

  return { settings, isLoading, updateSettings }
}
