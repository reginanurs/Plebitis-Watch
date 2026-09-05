import type { NotificationType } from '../../types/notification'

const TYPE_LABEL: Record<NotificationType, string> = {
  monitoring_reminder: 'Pengingat',
  system: 'Sistem',
}

const TYPE_CLASS: Record<NotificationType, string> = {
  monitoring_reminder: 'bg-amber-100 text-amber-700',
  system: 'bg-gray-100 text-gray-600',
}

interface NotificationStatusBadgeProps {
  type: NotificationType
  priority?: 'normal' | 'important'
}

function NotificationStatusBadge({ type, priority }: NotificationStatusBadgeProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${TYPE_CLASS[type]}`}>
        {TYPE_LABEL[type]}
      </span>
      {priority === 'important' && (
        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
          Penting
        </span>
      )}
    </div>
  )
}

export default NotificationStatusBadge
