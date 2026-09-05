import { useCallback } from 'react'
import notificationsSeed from '../data/notifications.json'
import type { Notification, NotificationInput } from '../types/notification'
import { useLocalStorageState } from './useLocalStorageState'

const STORAGE_KEY = 'plebitis-watch.notifications'

export function useNotifications() {
  const [notifications, setNotifications] = useLocalStorageState<Notification[]>(
    STORAGE_KEY,
    notificationsSeed as Notification[],
  )

  const addNotification = useCallback(
    (input: NotificationInput): Notification => {
      const newNotification: Notification = {
        ...input,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        read: false,
      }
      setNotifications((prev) => [newNotification, ...prev])
      return newNotification
    },
    [setNotifications],
  )

  /**
   * Inserts a fully-formed notification only if no notification with
   * the same id already exists. Used by the reminder-sync integration,
   * which relies on a deterministic id to stay duplicate-free.
   */
  const addNotificationIfNotExists = useCallback(
    (notification: Notification) => {
      setNotifications((prev) => (prev.some((item) => item.id === notification.id) ? prev : [notification, ...prev]))
    },
    [setNotifications],
  )

  const markAsRead = useCallback(
    (id: string) => {
      setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)))
    },
    [setNotifications],
  )

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((item) => (item.read ? item : { ...item, read: true })))
  }, [setNotifications])

  const removeNotification = useCallback(
    (id: string) => {
      setNotifications((prev) => prev.filter((item) => item.id !== id))
    },
    [setNotifications],
  )

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
