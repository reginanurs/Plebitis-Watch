import { useCallback } from 'react'
import reminderSettingsSeed from '../data/reminderSettings.json'
import type { ReminderSettings } from '../types/reminderSettings'
import { useLocalStorageState } from './useLocalStorageState'

const STORAGE_KEY = 'plebitis-watch.reminderSettings'

/**
 * Single source of truth for the reminder interval configuration —
 * every part of the app that needs the default monitoring interval
 * should read it from here rather than hard-coding its own constant.
 */
export function useReminderSettings() {
  const [settings, setSettings] = useLocalStorageState<ReminderSettings>(
    STORAGE_KEY,
    reminderSettingsSeed as ReminderSettings,
  )

  const updateSettings = useCallback(
    (updated: ReminderSettings) => {
      setSettings(updated)
    },
    [setSettings],
  )

  return { settings, updateSettings }
}
