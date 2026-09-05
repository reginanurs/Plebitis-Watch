import { Camera, ClipboardList } from 'lucide-react'
import type { Patient } from '../../types/patient'
import type { Pivc } from '../../types/pivc'
import type { PhotoRecord } from '../../types/photo'
import type { Assessment } from '../../types/assessment'
import PivcStatusBadge from '../pivc/PivcStatusBadge'
import { calculateAge, formatDateID, getAvatarColorClass, getInitials } from '../../utils/patient'

export interface MonitoringHistoryRow {
  assessment: Assessment
  patient: Patient | undefined
  pivc: Pivc | undefined
  photo: PhotoRecord | undefined
  timestamp: number
}

interface MonitoringHistoryTableProps {
  rows: MonitoringHistoryRow[]
  hasActiveFilters: boolean
  monitoringCountByPivcId: Map<string, number>
  onViewDetail: (assessmentId: string) => void
}

function PatientCell({ patient }: { patient: Patient | undefined }) {
  if (!patient) {
    return <span className="text-sm font-medium text-red-600">Data pasien tidak ditemukan</span>
  }
  return (
    <div className="flex items-center gap-3">
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${getAvatarColorClass(patient.id)}`}
      >
        {getInitials(patient.name, 1)}
      </span>
      <div>
        <p className="font-medium text-gray-900">{patient.name}</p>
        <p className="text-xs text-gray-500">
          {patient.medicalRecordNumber} • {calculateAge(patient.dateOfBirth)} th
        </p>
      </div>
    </div>
  )
}

function PivcCell({ pivc, monitoringCount }: { pivc: Pivc | undefined; monitoringCount: number }) {
  if (!pivc) {
    return <span className="text-sm font-medium text-red-600">Data PIVC tidak ditemukan</span>
  }
  return (
    <div>
      <div className="flex items-center gap-2">
        <p className="font-medium text-gray-800">
          {pivc.insertionSite} / {pivc.extremitySide}
        </p>
        <PivcStatusBadge status={pivc.status} />
      </div>
      {monitoringCount > 1 && <p className="text-xs text-gray-400">{monitoringCount} monitoring</p>}
    </div>
  )
}

function PhotoCell({ photo }: { photo: PhotoRecord | undefined }) {
  if (!photo) return <span className="text-sm text-gray-400">—</span>
  return (
    <span className="flex items-center gap-1.5 text-sm text-teal-800">
      <Camera size={16} />
      Ada foto
    </span>
  )
}

function EmptyState({ hasActiveFilters }: { hasActiveFilters: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-gray-200 bg-white py-12 text-center text-gray-500">
      <ClipboardList size={28} className="text-gray-300" />
      {hasActiveFilters ? (
        <>
          <p className="font-medium text-gray-600">Riwayat tidak ditemukan</p>
          <p className="text-sm text-gray-400">Coba ubah kata kunci atau filter.</p>
        </>
      ) : (
        <p>Belum ada riwayat yang cocok.</p>
      )}
    </div>
  )
}

function MonitoringHistoryTable({ rows, hasActiveFilters, monitoringCountByPivcId, onViewDetail }: MonitoringHistoryTableProps) {
  if (rows.length === 0) {
    return <EmptyState hasActiveFilters={hasActiveFilters} />
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-2xl border border-gray-100 bg-white md:block">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Tanggal &amp; Waktu</th>
              <th className="px-4 py-3 font-medium">Pasien</th>
              <th className="px-4 py-3 font-medium">PIVC / Lokasi</th>
              <th className="px-4 py-3 font-medium">VIP Score</th>
              <th className="px-4 py-3 font-medium">Kategori</th>
              <th className="px-4 py-3 font-medium">Dinilai Oleh</th>
              <th className="px-4 py-3 font-medium">Foto</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map(({ assessment, patient, pivc, photo }) => (
              <tr key={assessment.id} className="transition-colors hover:bg-gray-50">
                <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                  {formatDateID(assessment.date)} {assessment.time}
                </td>
                <td className="px-4 py-3">
                  <PatientCell patient={patient} />
                </td>
                <td className="px-4 py-3">
                  <PivcCell pivc={pivc} monitoringCount={monitoringCountByPivcId.get(assessment.pivcId) ?? 1} />
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {assessment.totalScore !== null ? assessment.totalScore : 'Belum tersedia'}
                </td>
                <td className="px-4 py-3 text-gray-700">{assessment.category ?? 'Belum tersedia'}</td>
                <td className="px-4 py-3 text-gray-700">{assessment.assessedBy}</td>
                <td className="px-4 py-3">
                  <PhotoCell photo={photo} />
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onViewDetail(assessment.id)}
                    className="rounded-lg border border-teal-700 px-3 py-1.5 text-xs font-medium text-teal-800 hover:bg-teal-50"
                  >
                    Lihat Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {rows.map(({ assessment, patient, pivc, photo }) => (
          <div key={assessment.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <PatientCell patient={patient} />
              <span className="shrink-0 text-xs text-gray-400">
                {formatDateID(assessment.date)} {assessment.time}
              </span>
            </div>
            <div className="mt-3 border-t border-gray-100 pt-3">
              <PivcCell pivc={pivc} monitoringCount={monitoringCountByPivcId.get(assessment.pivcId) ?? 1} />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
              <div>
                <dt className="uppercase tracking-wide">VIP Score</dt>
                <dd className="mt-0.5 font-medium text-gray-700">
                  {assessment.totalScore !== null ? assessment.totalScore : 'Belum tersedia'}
                </dd>
              </div>
              <div>
                <dt className="uppercase tracking-wide">Kategori</dt>
                <dd className="mt-0.5 font-medium text-gray-700">{assessment.category ?? 'Belum tersedia'}</dd>
              </div>
              <div>
                <dt className="uppercase tracking-wide">Dinilai Oleh</dt>
                <dd className="mt-0.5 font-medium text-gray-700">{assessment.assessedBy}</dd>
              </div>
              <div>
                <dt className="uppercase tracking-wide">Foto</dt>
                <dd className="mt-0.5">
                  <PhotoCell photo={photo} />
                </dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={() => onViewDetail(assessment.id)}
              className="mt-3 w-full rounded-lg border border-teal-700 px-3 py-2 text-sm font-medium text-teal-800 hover:bg-teal-50"
            >
              Lihat Detail
            </button>
          </div>
        ))}
      </div>
    </>
  )
}

export default MonitoringHistoryTable
