export type NotificationType = 'monitoring_reminder' | 'system'
export type NotificationPriority = 'normal' | 'important'

export interface Notification {
  id: string

  type: NotificationType

  title: string
  message: string

  patientId?: string
  pivcId?: string
  reminderId?: string

  createdAt: string

  read: boolean

  priority: NotificationPriority

  actionPath?: string
}

export type NotificationInput = Omit<Notification, 'id' | 'createdAt' | 'read'>
