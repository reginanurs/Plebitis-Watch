import { AlertTriangle, CalendarCheck, Clock, Settings2, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import PageHeader from '../components/PageHeader'
import PageLoadingState from '../components/PageLoadingState'
import PatientSearchInput from '../components/patients/PatientSearchInput'
import ReminderDetailModal from '../components/reminders/ReminderDetailModal'
import ReminderSettingsDialog from '../components/reminders/ReminderSettingsDialog'
import ReminderTable, { type ReminderRow } from '../components/reminders/ReminderTable'
import Toast from '../components/Toast'
import { usePatients } from '../hooks/usePatients'
import { usePivcs } from '../hooks/usePivcs'
import { useReminders } from '../hooks/useReminders'
import { useReminderSettings } from '../hooks/useReminderSettings'
import type { ReminderStatus } from '../types/reminder'
import type { ReminderSettings } from '../types/reminderSettings'
import { formatIntervalLabel, getReminderStatus } from '../utils/reminder'

const STATUS_FILTER_OPTIONS: { value: ReminderStatus; label: string }[] = [
  { value: 'overdue', label: 'Terlambat' },
  { value: 'due_soon', label: 'Akan Jatuh Tempo' },
  { value: 'today', label: 'Hari Ini' },
  { value: 'scheduled', label: 'Terjadwal' },
]

function currentIntervalLabel(settings: ReminderSettings): string {
  if (settings.defaultIntervalMinutes === null) return 'Belum dikonfigurasi'
  const bareLabel = formatIntervalLabel(settings.defaultIntervalMinutes).replace('Setiap ', '')
  return settings.clinicalStatus === 'demo' ? `Demo — ${bareLabel}` : bareLabel
}

function ReminderPage() {
  const { patients, isLoading: isPatientsLoading } = usePatients()
  const { getPivcById, isLoading: isPivcsLoading } = usePivcs()
  const { reminders, isLoading: isRemindersLoading } = useReminders()
  const { settings, updateSettings, isLoading: isSettingsLoading } = useReminderSettings()

  const [searchTerm, setSearchTerm] = useState('')
  const [roomFilter, setRoomFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<ReminderStatus | ''>('')
  const [detailRow, setDetailRow] = useState<ReminderRow | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const validRows: ReminderRow[] = useMemo(() => {
    return reminders
      .filter((reminder) => reminder.enabled)
      .map((reminder) => {
        const patient = patients.find((item) => item.id === reminder.patientId)
        const pivc = getPivcById(reminder.pivcId)
        if (!patient || !pivc || pivc.status !== 'active') return null
        return { reminder, patient, pivc }
      })
      .filter((row): row is ReminderRow => row !== null)
  }, [reminders, patients, getPivcById])

  const roomOptions = useMemo(
    () => [...new Set(validRows.map((row) => row.patient.room))].sort((a, b) => a.localeCompare(b)),
    [validRows],
  )

  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return validRows.filter(({ reminder, patient }) => {
      const matchesSearch =
        !term ||
        [patient.name, patient.medicalRecordNumber, patient.room, patient.bed].join(' ').toLowerCase().includes(term)
      const matchesRoom = !roomFilter || patient.room === roomFilter
      const matchesStatus = !statusFilter || getReminderStatus(reminder.nextMonitoringAt) === statusFilter
      return matchesSearch && matchesRoom && matchesStatus
    })
  }, [validRows, searchTerm, roomFilter, statusFilter])

  const overdueCount = validRows.filter((row) => getReminderStatus(row.reminder.nextMonitoringAt) === 'overdue').length
  const dueSoonCount = validRows.filter((row) => getReminderStatus(row.reminder.nextMonitoringAt) === 'due_soon').length
  const todayCount = validRows.filter((row) => getReminderStatus(row.reminder.nextMonitoringAt) === 'today').length
  const totalPatientCount = new Set(validRows.map((row) => row.patient.id)).size

  async function handleSaveSettings(updated: ReminderSettings) {
    try {
      await updateSettings(updated)
      setIsSettingsOpen(false)
      setToastMessage('Pengaturan reminder berhasil disimpan.')
    } catch (error) {
      console.error('Failed to save reminder settings:', error)
      setToastMessage('Gagal menyimpan pengaturan reminder, coba lagi.')
    }
  }

  if (isPatientsLoading || isPivcsLoading || isRemindersLoading || isSettingsLoading) return <PageLoadingState />

  return (
    <div>
      <PageHeader
        title="Reminder Monitoring"
        description="Daftar pasien yang memerlukan pemantauan sesuai jadwal berikutnya."
        showBackButton={false}
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-4">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertTriangle size={18} />
          </div>
          <p className="text-2xl font-bold text-gray-900">{overdueCount}</p>
          <p className="text-xs text-gray-500">Terlambat</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <Clock size={18} />
          </div>
          <p className="text-2xl font-bold text-gray-900">{dueSoonCount}</p>
          <p className="text-xs text-gray-500">Akan Jatuh Tempo (&le; 1 jam)</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CalendarCheck size={18} />
          </div>
          <p className="text-2xl font-bold text-gray-900">{todayCount}</p>
          <p className="text-xs text-gray-500">Hari Ini</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <Users size={18} />
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalPatientCount}</p>
          <p className="text-xs text-gray-500">Total Pasien</p>
        </div>
      </div>

      {!settings.enabled && (
        <div className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          Reminder monitoring saat ini dinonaktifkan pada Pengaturan Reminder. Jadwal di bawah tetap
          ditampilkan sebagai referensi.
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <select
          value={roomFilter}
          onChange={(event) => setRoomFilter(event.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700 sm:w-48"
        >
          <option value="">Semua Ruangan</option>
          {roomOptions.map((room) => (
            <option key={room} value={room}>
              {room}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as ReminderStatus | '')}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700 sm:w-56"
        >
          <option value="">Semua Status</option>
          {STATUS_FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <PatientSearchInput value={searchTerm} onChange={setSearchTerm} />
      </div>

      <div className="mb-6">
        <ReminderTable
          rows={filteredRows}
          hasActiveFilters={Boolean(searchTerm || roomFilter || statusFilter)}
          onViewDetail={setDetailRow}
        />
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 flex items-center gap-2 font-semibold text-gray-900">
              <Settings2 size={18} />
              Pengaturan Reminder
            </p>
            <p className="text-sm text-gray-500">
              Atur interval pemantauan sesuai kebijakan dan kondisi pasien.
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Interval saat ini: {currentIntervalLabel(settings)} • Sumber interval:{' '}
              {settings.source || 'Belum dikonfigurasi'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="self-start rounded-lg border border-teal-700 px-4 py-2 text-sm font-medium text-teal-800 hover:bg-teal-50 sm:self-auto"
          >
            Ubah Pengaturan
          </button>
        </div>

        <div className="mt-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
          Interval reminder bukan standar klinis universal. Sesuaikan dengan interval yang ditetapkan
          SOP/protokol fasilitas dan kondisi klinis masing-masing pasien.
        </div>
      </div>

      <ReminderSettingsDialog
        open={isSettingsOpen}
        settings={settings}
        onSave={handleSaveSettings}
        onCancel={() => setIsSettingsOpen(false)}
      />

      <ReminderDetailModal row={detailRow} onClose={() => setDetailRow(null)} />

      {toastMessage && <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />}
    </div>
  )
}

export default ReminderPage
