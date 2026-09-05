import { Bell, Info } from 'lucide-react'
import type { Patient } from '../../types/patient'
import type { Notification } from '../../types/notification'
import { formatRelativeTimestamp } from '../../utils/datetime'
import NotificationStatusBadge from './NotificationStatusBadge'

interface NotificationItemProps {
  notification: Notification
  patient: Patient | undefined
  onOpen: (notification: Notification) => void
  onMarkAsRead: (id: string) => void
}

function NotificationItem({ notification, patient, onOpen, onMarkAsRead }: NotificationItemProps) {
  const hasMissingPatient = Boolean(notification.patientId) && !patient
  const Icon = notification.type === 'monitoring_reminder' ? Bell : Info

  return (
    <div
      className={`flex gap-3 rounded-2xl border p-4 shadow-sm ${
        notification.read ? 'border-gray-100 bg-white' : 'border-amber-100 bg-amber-50/60'
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
          notification.type === 'monitoring_reminder' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
        }`}
      >
        <Icon size={18} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <p className={`text-sm ${notification.read ? 'font-medium text-gray-800' : 'font-semibold text-gray-900'}`}>
            {!notification.read && (
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-red-500 align-middle" aria-hidden="true" />
            )}
            {notification.title}
          </p>
          <span className="shrink-0 text-xs text-gray-400">{formatRelativeTimestamp(notification.createdAt)}</span>
        </div>

        <p className="mt-1 text-sm text-gray-600">{notification.message}</p>

        {notification.patientId && (
          <p className="mt-1 text-xs text-gray-500">
            Pasien:{' '}
            {hasMissingPatient ? (
              <span className="font-medium text-red-600">Data pasien tidak ditemukan</span>
            ) : (
              <span className="font-medium text-gray-700">{patient!.name}</span>
            )}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <NotificationStatusBadge type={notification.type} priority={notification.priority} />
          <div className="flex gap-2">
            {!notification.read && (
              <button
                type="button"
                onClick={() => onMarkAsRead(notification.id)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
              >
                Tandai sudah dibaca
              </button>
            )}
            {notification.actionPath && !hasMissingPatient && (
              <button
                type="button"
                onClick={() => onOpen(notification)}
                className="rounded-lg bg-teal-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-900"
              >
                Buka
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationItem
