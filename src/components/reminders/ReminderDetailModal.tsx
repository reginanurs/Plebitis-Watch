import { X } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DetailField from '../DetailField'
import type { ReminderRow } from './ReminderTable'
import ReminderStatusBadge from './ReminderStatusBadge'
import { formatDateID } from '../../utils/patient'
import { formatIntervalLabel, getReminderStatus, getTimeRemainingLabel } from '../../utils/reminder'

interface ReminderDetailModalProps {
  row: ReminderRow | null
  onClose: () => void
}

function ReminderDetailModal({ row, onClose }: ReminderDetailModalProps) {
  const navigate = useNavigate()

  useEffect(() => {
    if (!row) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [row, onClose])

  if (!row) return null

  const { reminder, patient, pivc } = row
  const status = getReminderStatus(reminder.nextMonitoringAt)
  const scheduledDate = new Date(reminder.nextMonitoringAt)

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <h2 className="text-lg font-semibold text-gray-900">Detail Reminder</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-medium text-gray-900">{patient.name}</p>
            <ReminderStatusBadge status={status} />
          </div>

          <dl className="grid grid-cols-2 gap-4">
            <DetailField label="No. Rekam Medis" value={patient.medicalRecordNumber} />
            <DetailField label="Ruangan/Bed" value={`${patient.room} / ${patient.bed}`} />
            <DetailField label="Lokasi Insersi PIVC" value={pivc.insertionSite} />
            <DetailField label="Sisi Ekstremitas" value={pivc.extremitySide} />
            <DetailField
              label="Jadwal Berikutnya"
              value={`${formatDateID(reminder.nextMonitoringAt)} ${scheduledDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`}
            />
            <DetailField label="Perkiraan" value={getTimeRemainingLabel(reminder.nextMonitoringAt)} />
            <DetailField label="Interval" value={formatIntervalLabel(reminder.intervalMinutes)} />
            <DetailField label="Sumber Interval" value={reminder.source || 'Belum dikonfigurasi'} />
            {reminder.basedOnAssessmentId && (
              <DetailField label="Berdasarkan Penilaian" value="Tersedia (lihat Hasil Penilaian)" />
            )}
          </dl>

          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={() => navigate(`/penilaian/${patient.id}`)}
              className="rounded-lg bg-teal-800 px-4 py-2 text-sm font-medium text-white hover:bg-teal-900"
            >
              Buka Penilaian VIP Score
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReminderDetailModal
