import { useEffect, useState } from 'react'
import { usePatients } from './usePatients'
import { usePivcs } from './usePivcs'
import { useReminders } from './useReminders'
import { useNotifications } from './useNotifications'
import { buildReminderNotificationId } from '../utils/notification'
import { getReminderStatus } from '../utils/reminder'

const RECHECK_INTERVAL_MS = 60_000

/**
 * Keeps the notification list in sync with reminders that need
 * attention (due soon / overdue). This does not schedule anything —
 * reminders remain the single source of truth for `nextMonitoringAt`
 * and interval. It only creates a notification the first time a
 * reminder enters a given attention state, using a deterministic id
 * (see buildReminderNotificationId) so re-running this never creates
 * duplicates.
 *
 * Runs once wherever it's mounted (the app shell) and re-evaluates
 * whenever reminder/patient/PIVC data changes, plus a light 60s
 * interval to catch reminders that become due purely from time
 * passing without any other state change.
 */
export function useReminderNotificationSync() {
  const { reminders } = useReminders()
  const { patients } = usePatients()
  const { pivcs, getPivcById } = usePivcs()
  const { addNotificationIfNotExists } = useNotifications()
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const interval = window.setInterval(() => setTick((value) => value + 1), RECHECK_INTERVAL_MS)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    for (const reminder of reminders) {
      if (!reminder.enabled) continue

      const patient = patients.find((item) => item.id === reminder.patientId)
      const pivc = getPivcById(reminder.pivcId)
      if (!patient || !pivc || pivc.status !== 'active') continue

      const status = getReminderStatus(reminder.nextMonitoringAt)
      if (status !== 'overdue' && status !== 'due_soon') continue

      addNotificationIfNotExists({
        id: buildReminderNotificationId(reminder.id, status),
        type: 'monitoring_reminder',
        title: 'Reminder PLEBITIS WATCH',
        message:
          status === 'overdue'
            ? 'Jadwal pemantauan PIVC pasien telah terlambat. Segera lakukan penilaian VIP Score.'
            : 'Waktu pemantauan PIVC pasien telah tiba.',
        patientId: reminder.patientId,
        pivcId: reminder.pivcId,
        reminderId: reminder.id,
        createdAt: new Date().toISOString(),
        read: false,
        priority: status === 'overdue' ? 'important' : 'normal',
        actionPath: `/penilaian/${reminder.patientId}`,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reminders, patients, pivcs, tick])
}
