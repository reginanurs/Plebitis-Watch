import type { ReminderStatus } from '../../types/reminder'

const STATUS_LABEL: Record<ReminderStatus, string> = {
  overdue: 'Terlambat',
  due_soon: 'Akan Jatuh Tempo',
  today: 'Hari Ini',
  scheduled: 'Terjadwal',
}

const STATUS_CLASS: Record<ReminderStatus, string> = {
  overdue: 'bg-red-100 text-red-700',
  due_soon: 'bg-amber-100 text-amber-700',
  today: 'bg-emerald-100 text-emerald-700',
  scheduled: 'bg-gray-100 text-gray-600',
}

interface ReminderStatusBadgeProps {
  status: ReminderStatus
}

function ReminderStatusBadge({ status }: ReminderStatusBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_CLASS[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  )
}

export default ReminderStatusBadge
