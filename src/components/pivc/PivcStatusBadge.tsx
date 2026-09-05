import type { PivcStatus } from '../../types/pivc'

interface PivcStatusBadgeProps {
  status: PivcStatus
}

function PivcStatusBadge({ status }: PivcStatusBadgeProps) {
  const isActive = status === 'active'
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
        isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
      }`}
    >
      {isActive ? 'Aktif' : 'Dilepas'}
    </span>
  )
}

export default PivcStatusBadge
