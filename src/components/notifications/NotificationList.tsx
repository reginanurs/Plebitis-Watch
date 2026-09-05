import { BellOff } from 'lucide-react'
import type { Patient } from '../../types/patient'
import type { Notification } from '../../types/notification'
import NotificationItem from './NotificationItem'

interface NotificationListProps {
  notifications: Notification[]
  patients: Patient[]
  hasActiveFilters: boolean
  onOpen: (notification: Notification) => void
  onMarkAsRead: (id: string) => void
}

function NotificationList({ notifications, patients, hasActiveFilters, onOpen, onMarkAsRead }: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-gray-200 bg-white py-12 text-center text-gray-500">
        <BellOff size={28} className="text-gray-300" />
        {hasActiveFilters ? (
          <p>Tidak ada notifikasi yang cocok dengan filter saat ini.</p>
        ) : (
          <>
            <p className="font-medium text-gray-600">Belum ada notifikasi</p>
            <p className="text-sm text-gray-400">
              Notifikasi pengingat pemantauan PIVC akan muncul di sini saat jadwal mendekati atau
              terlambat.
            </p>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          patient={patients.find((patient) => patient.id === notification.patientId)}
          onOpen={onOpen}
          onMarkAsRead={onMarkAsRead}
        />
      ))}
    </div>
  )
}

export default NotificationList
