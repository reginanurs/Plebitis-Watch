import { ImageOff } from 'lucide-react'
import type { Pivc } from '../../types/pivc'
import { formatDateID } from '../../utils/patient'
import { getPhoto } from '../../utils/photoStorage'
import PivcStatusBadge from './PivcStatusBadge'

interface PivcSummaryProps {
  pivc: Pivc
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-gray-800">{value}</dd>
    </div>
  )
}

function PivcSummary({ pivc }: PivcSummaryProps) {
  const photoUrl = getPhoto(pivc.initialPhotoId)

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Informasi Pemasangan PIVC</h2>
        <PivcStatusBadge status={pivc.status} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Tanggal Pemasangan" value={formatDateID(pivc.installationDate)} />
        <Field label="Waktu Pemasangan" value={pivc.installationTime} />
        <Field label="Lokasi Insersi" value={pivc.insertionSite} />
        <Field label="Sisi Ekstremitas" value={pivc.extremitySide} />
        <Field label="Jenis/Ukuran Kateter" value={pivc.catheterType} />
        <Field label="Jenis Terapi/Cairan" value={pivc.therapy} />
        <Field label="Dipasang Oleh" value={pivc.insertedBy || '-'} />
        <Field label="Tujuan Pemasangan" value={pivc.purpose || '-'} />
        <Field label="Kesulitan Pemasangan" value={pivc.insertionDifficulty ? 'Ya' : 'Tidak'} />
        <Field label="Dilakukan Perawat Lain" value={pivc.insertedByAnotherNurse ? 'Ya' : 'Tidak'} />
        <div className="sm:col-span-2 lg:col-span-3">
          <Field label="Keterangan Tambahan" value={pivc.additionalNotes || '-'} />
        </div>
      </div>

      <div className="mt-4 border-t border-gray-100 pt-4">
        <p className="mb-2 text-xs uppercase tracking-wide text-gray-400">Dokumentasi Awal</p>
        {photoUrl ? (
          <img
            src={photoUrl}
            alt="Foto awal area insersi PIVC"
            className="h-32 w-32 rounded-lg border border-gray-100 object-cover"
          />
        ) : (
          <div className="flex h-32 w-32 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-gray-200 text-gray-300">
            <ImageOff size={22} />
            <span className="text-xs">Tidak ada foto</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default PivcSummary
