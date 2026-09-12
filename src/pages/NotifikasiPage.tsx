import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NotificationList from '../components/notifications/NotificationList'
import PageHeader from '../components/PageHeader'
import PageLoadingState from '../components/PageLoadingState'
import { usePatients } from '../hooks/usePatients'
import { useNotifications } from '../hooks/useNotifications'
import type { Notification } from '../types/notification'

type FilterKey = 'all' | 'unread' | 'read' | 'monitoring' | 'system'

const FILTER_OPTIONS: { value: FilterKey; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'unread', label: 'Belum Dibaca' },
  { value: 'read', label: 'Sudah Dibaca' },
  { value: 'monitoring', label: 'Monitoring' },
  { value: 'system', label: 'Sistem' },
]

function NotifikasiPage() {
  const { patients, isLoading: isPatientsLoading } = usePatients()
  const { notifications, markAsRead, markAllAsRead, isLoading: isNotificationsLoading } = useNotifications()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<FilterKey>('all')

  const sortedNotifications = useMemo(
    () => [...notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [notifications],
  )

  const filteredNotifications = useMemo(() => {
    switch (filter) {
      case 'unread':
        return sortedNotifications.filter((notification) => !notification.read)
      case 'read':
        return sortedNotifications.filter((notification) => notification.read)
      case 'monitoring':
        return sortedNotifications.filter((notification) => notification.type === 'monitoring_reminder')
      case 'system':
        return sortedNotifications.filter((notification) => notification.type === 'system')
      default:
        return sortedNotifications
    }
  }, [sortedNotifications, filter])

  const totalCount = notifications.length
  const unreadCount = notifications.filter((notification) => !notification.read).length

  function handleOpen(notification: Notification) {
    markAsRead(notification.id).catch((error) => console.error('Failed to mark notification as read:', error))
    if (notification.actionPath) navigate(notification.actionPath)
  }

  if (isPatientsLoading || isNotificationsLoading) return <PageLoadingState />

  return (
    <div>
      <PageHeader
        title="Notifikasi"
        description="Informasi dan pengingat pemantauan PIVC."
        showBackButton={false}
      >
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            Total: <span className="font-medium text-gray-700">{totalCount}</span> • Belum dibaca:{' '}
            <span className="font-medium text-gray-700">{unreadCount}</span>
          </p>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllAsRead().catch((error) => console.error('Failed to mark all as read:', error))}
              className="self-start rounded-lg border border-teal-700 px-4 py-2 text-sm font-medium text-teal-800 hover:bg-teal-50 sm:self-auto"
            >
              Tandai Semua Sudah Dibaca
            </button>
          )}
        </div>
      </PageHeader>

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTER_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setFilter(option.value)}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              filter === option.value
                ? 'bg-teal-800 text-white'
                : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <NotificationList
        notifications={filteredNotifications}
        patients={patients}
        hasActiveFilters={filter !== 'all'}
        onOpen={handleOpen}
        onMarkAsRead={markAsRead}
      />
    </div>
  )
}

export default NotifikasiPage
