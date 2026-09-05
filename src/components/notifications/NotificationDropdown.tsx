import { Bell, Info } from 'lucide-react'
import type { Notification } from '../../types/notification'
import { formatRelativeTimestamp } from '../../utils/datetime'

interface NotificationDropdownProps {
  isOpen: boolean
  notifications: Notification[]
  onItemClick: (notification: Notification) => void
  onMarkAllAsRead: () => void
  onViewAll: () => void
}

function NotificationDropdown({ isOpen, notifications, onItemClick, onMarkAllAsRead, onViewAll }: NotificationDropdownProps) {
  const hasUnread = notifications.some((notification) => !notification.read)

  return (
    <div
      className={`absolute right-0 top-full z-50 mt-2 w-80 origin-top-right overflow-hidden rounded-xl border border-gray-100 bg-white text-gray-800 shadow-xl transition duration-200 ease-out sm:w-96 ${
        isOpen ? 'translate-y-0 scale-100 opacity-100' : '-translate-y-1 scale-[0.98] opacity-0'
      }`}
    >
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <p className="text-sm font-semibold text-gray-900">Notifikasi</p>
        {hasUnread && (
          <button type="button" onClick={onMarkAllAsRead} className="text-xs font-medium text-teal-800 hover:underline">
            Tandai semua sudah dibaca
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-gray-400">Belum ada notifikasi</p>
        ) : (
          notifications.map((notification) => {
            const Icon = notification.type === 'monitoring_reminder' ? Bell : Info
            return (
              <button
                key={notification.id}
                type="button"
                onClick={() => onItemClick(notification)}
                className={`flex w-full items-start gap-3 border-b border-gray-50 px-4 py-3 text-left last:border-b-0 hover:bg-gray-50 ${
                  notification.read ? '' : 'bg-amber-50/60'
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    notification.type === 'monitoring_reminder'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  <Icon size={14} />
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={`block text-sm ${notification.read ? 'text-gray-700' : 'font-semibold text-gray-900'}`}
                  >
                    {notification.title}
                  </span>
                  <span className="block truncate text-xs text-gray-500">{notification.message}</span>
                  <span className="mt-0.5 block text-xs text-gray-400">
                    {formatRelativeTimestamp(notification.createdAt)}
                  </span>
                </span>
                {!notification.read && (
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500" aria-hidden="true" />
                )}
              </button>
            )
          })
        )}
      </div>

      <button
        type="button"
        onClick={onViewAll}
        className="block w-full border-t border-gray-100 px-4 py-3 text-center text-sm font-medium text-teal-800 hover:bg-teal-50"
      >
        Lihat Semua Notifikasi
      </button>
    </div>
  )
}

export default NotificationDropdown
