import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Notification, NotificationInput } from '../types/notification'

interface NotificationRow {
  id: string
  type: Notification['type']
  title: string
  message: string
  patient_id: string | null
  pivc_id: string | null
  reminder_id: string | null
  created_at: string
  read: boolean
  priority: Notification['priority']
  action_path: string | null
}

function rowToNotification(row: NotificationRow): Notification {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message,
    patientId: row.patient_id ?? undefined,
    pivcId: row.pivc_id ?? undefined,
    reminderId: row.reminder_id ?? undefined,
    createdAt: row.created_at,
    read: row.read,
    priority: row.priority,
    actionPath: row.action_path ?? undefined,
  }
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!isMounted) return
        if (error) {
          console.error('Failed to load notifications:', error)
        } else {
          setNotifications((data as NotificationRow[]).map(rowToNotification))
        }
        setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const addNotification = useCallback(async (input: NotificationInput): Promise<Notification> => {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        id: crypto.randomUUID(),
        type: input.type,
        title: input.title,
        message: input.message,
        patient_id: input.patientId ?? null,
        pivc_id: input.pivcId ?? null,
        reminder_id: input.reminderId ?? null,
        read: false,
        priority: input.priority,
        action_path: input.actionPath ?? null,
      })
      .select()
      .single()

    if (error) throw error

    const newNotification = rowToNotification(data as NotificationRow)
    setNotifications((prev) => [newNotification, ...prev])
    return newNotification
  }, [])

  /**
   * Inserts a fully-formed notification only if no notification with the
   * same id already exists. Used by the reminder-sync integration, which
   * relies on a deterministic id to stay duplicate-free — enforced here by
   * `notifications.id` being a primary key plus `ignoreDuplicates`, so no
   * pre-check against current state is needed.
   */
  const addNotificationIfNotExists = useCallback(async (notification: Notification) => {
    const { error } = await supabase
      .from('notifications')
      .upsert(
        {
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          patient_id: notification.patientId ?? null,
          pivc_id: notification.pivcId ?? null,
          reminder_id: notification.reminderId ?? null,
          created_at: notification.createdAt,
          read: notification.read,
          priority: notification.priority,
          action_path: notification.actionPath ?? null,
        },
        { onConflict: 'id', ignoreDuplicates: true },
      )
    if (error) throw error
    setNotifications((prev) => (prev.some((item) => item.id === notification.id) ? prev : [notification, ...prev]))
  }, [])

  const markAsRead = useCallback(async (id: string) => {
    const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id)
    if (error) throw error
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)))
  }, [])

  const markAllAsRead = useCallback(async () => {
    const { error } = await supabase.from('notifications').update({ read: true }).eq('read', false)
    if (error) throw error
    setNotifications((prev) => prev.map((item) => (item.read ? item : { ...item, read: true })))
  }, [])

  const removeNotification = useCallback(async (id: string) => {
    const { error } = await supabase.from('notifications').delete().eq('id', id)
    if (error) throw error
    setNotifications((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const getNotificationById = useCallback(
    (id: string) => notifications.find((item) => item.id === id),
    [notifications],
  )

  const getUnreadNotifications = useCallback(() => notifications.filter((item) => !item.read), [notifications])

  const getNotificationsByPatientId = useCallback(
    (patientId: string) => notifications.filter((item) => item.patientId === patientId),
    [notifications],
  )

  return {
    notifications,
    isLoading,
    addNotification,
    addNotificationIfNotExists,
    markAsRead,
    markAllAsRead,
    removeNotification,
    getNotificationById,
    getUnreadNotifications,
    getNotificationsByPatientId,
  }
}
