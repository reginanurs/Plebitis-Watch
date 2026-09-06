import { Link, useParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import PatientContextCard from '../components/PatientContextCard'
import PivcSummary from '../components/pivc/PivcSummary'
import ReminderStatusBadge from '../components/reminders/ReminderStatusBadge'
import { usePatients } from '../hooks/usePatients'
import { usePivcs } from '../hooks/usePivcs'
import { useReminders } from '../hooks/useReminders'
import { calculatePivcDay, todayDateString } from '../utils/datetime'
import { formatDateID } from '../utils/patient'
import { getReminderStatus, getTimeRemainingLabel } from '../utils/reminder'

function PivcDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { patients } = usePatients()
  const { getPivcById } = usePivcs()
  const { getRemindersByPivcId } = useReminders()

  const pivc = id ? getPivcById(id) : undefined
  const patient = pivc ? patients.find((item) => item.id === pivc.patientId) : undefined
  const reminder = pivc ? getRemindersByPivcId(pivc.id).find((item) => item.enabled) : undefined

  if (!pivc || !patient) {
    return (
      <div>
        <PageHeader title="Data PIVC Tidak Ditemukan" description="Data pemasangan PIVC yang dicari tidak tersedia." />
        <Link
          to="/pivc"
          className="inline-flex items-center gap-2 rounded-lg border border-teal-700 px-4 py-2 text-sm font-medium text-teal-800 hover:bg-teal-50"
        >
          Kembali ke Data PIVC
        </Link>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Detail PIVC" description="Informasi lengkap pemasangan dan status PIVC pasien." />

      <div className="mb-6">
        <PatientContextCard patient={patient} />
      </div>

      {pivc.status === 'active' && (
        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-400">Lama Pemasangan</p>
          <p className="mt-0.5 text-lg font-semibold text-gray-800">
            Hari ke-{calculatePivcDay(pivc.installationDate, todayDateString())}
          </p>
        </div>
      )}

      <div className="mb-6">
        <PivcSummary pivc={pivc} />
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-base font-semibold text-gray-900">Informasi Monitoring Berikutnya</h2>
        {pivc.status !== 'active' ? (
          <p className="text-sm text-gray-500">PIVC ini sudah dilepas, tidak ada jadwal pemantauan berikutnya.</p>
        ) : reminder ? (
          <div className="flex flex-col gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <ReminderStatusBadge status={getReminderStatus(reminder.nextMonitoringAt)} />
              <span className="text-xs text-gray-400">({getTimeRemainingLabel(reminder.nextMonitoringAt)})</span>
            </div>
            <p>
              <span className="text-gray-400">Jadwal:</span> {formatDateID(reminder.nextMonitoringAt)}{' '}
              {new Date(reminder.nextMonitoringAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <Link
              to="/reminder"
              className="mt-1 inline-flex w-fit items-center gap-2 rounded-lg border border-teal-700 px-4 py-2 text-sm font-medium text-teal-800 hover:bg-teal-50"
            >
              Lihat Reminder Monitoring
            </Link>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Belum ada reminder yang dijadwalkan untuk PIVC ini.</p>
        )}
      </div>
    </div>
  )
}

export default PivcDetailPage
