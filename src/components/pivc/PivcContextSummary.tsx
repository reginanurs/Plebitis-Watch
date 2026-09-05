import type { Pivc } from '../../types/pivc'
import { formatDateID } from '../../utils/patient'
import PivcStatusBadge from './PivcStatusBadge'

interface PivcContextSummaryProps {
  pivc: Pivc
  title?: string
}

function ContextField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-gray-800">{value}</dd>
    </div>
  )
}

function PivcContextSummary({ pivc, title = 'Konteks PIVC Aktif' }: PivcContextSummaryProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        <PivcStatusBadge status={pivc.status} />
      </div>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <ContextField label="Lokasi Insersi" value={pivc.insertionSite} />
        <ContextField label="Sisi Ekstremitas" value={pivc.extremitySide} />
        <ContextField label="Jenis/Ukuran Kateter" value={pivc.catheterType} />
        <ContextField label="Tanggal Pemasangan" value={formatDateID(pivc.installationDate)} />
        <ContextField label="Waktu Pemasangan" value={pivc.installationTime} />
      </dl>
    </div>
  )
}

export default PivcContextSummary
