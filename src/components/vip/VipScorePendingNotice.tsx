import { AlertTriangle } from 'lucide-react'

interface VipScorePendingNoticeProps {
  reason: string
}

function VipScorePendingNotice({ reason }: VipScorePendingNoticeProps) {
  return (
    <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
      <AlertTriangle size={18} className="mt-0.5 shrink-0" />
      <p>{reason}</p>
    </div>
  )
}

export default VipScorePendingNotice
