import { Eye, UserX } from 'lucide-react'
import type { Patient } from '../../types/patient'
import type { Pivc } from '../../types/pivc'
import type { Reminder } from '../../types/reminder'
import { calculateAge, formatDateID, getAvatarColorClass, getInitials } from '../../utils/patient'
import { formatIntervalLabel, getReminderStatus, getTimeRemainingLabel } from '../../utils/reminder'
import ReminderStatusBadge from './ReminderStatusBadge'

export interface ReminderRow {
  reminder: Reminder
  patient: Patient
  pivc: Pivc
}

interface ReminderTableProps {
  rows: ReminderRow[]
  hasActiveFilters: boolean
  onViewDetail: (row: ReminderRow) => void
}

function ReminderIdentity({ patient }: { patient: Patient }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${getAvatarColorClass(patient.id)}`}
      >
        {getInitials(patient.name)}
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

function ScheduleCell({ reminder }: { reminder: Reminder }) {
  const status = getReminderStatus(reminder.nextMonitoringAt)
  const remaining = getTimeRemainingLabel(reminder.nextMonitoringAt)
  const scheduledDate = new Date(reminder.nextMonitoringAt)
  return (
    <div>
      <p className="font-medium text-gray-800">
        {formatDateID(reminder.nextMonitoringAt)}{' '}
        {scheduledDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
      </p>
      <p className={`text-xs ${status === 'overdue' ? 'text-red-600' : 'text-gray-500'}`}>({remaining})</p>
    </div>
  )
}

function EmptyState({ hasActiveFilters }: { hasActiveFilters: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-gray-200 bg-white py-12 text-center text-gray-500">
      <UserX size={28} className="text-gray-300" />
      {hasActiveFilters ? (
        <p>Tidak ada reminder yang cocok dengan pencarian/filter saat ini.</p>
      ) : (
        <p>Belum ada reminder monitoring yang terjadwal.</p>
      )}
    </div>
  )
}

function ReminderTable({ rows, hasActiveFilters, onViewDetail }: ReminderTableProps) {
  if (rows.length === 0) {
    return <EmptyState hasActiveFilters={hasActiveFilters} />
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-2xl border border-gray-100 bg-white md:block">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Pasien</th>
              <th className="px-4 py-3 font-medium">Ruangan/Bed</th>
              <th className="px-4 py-3 font-medium">Jadwal Berikutnya</th>
              <th className="px-4 py-3 font-medium">Interval</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map(({ reminder, patient, pivc }) => (
              <tr key={reminder.id} className="transition-colors hover:bg-gray-50">
                <td className="px-4 py-3">
                  <ReminderIdentity patient={patient} />
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {patient.room} / {patient.bed}
                </td>
                <td className="px-4 py-3">
                  <ScheduleCell reminder={reminder} />
                </td>
                <td className="px-4 py-3 text-gray-600">{formatIntervalLabel(reminder.intervalMinutes)}</td>
                <td className="px-4 py-3">
                  <ReminderStatusBadge status={getReminderStatus(reminder.nextMonitoringAt)} />
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onViewDetail({ reminder, patient, pivc })}
                    aria-label={`Lihat detail reminder ${patient.name}`}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                  >
                    <Eye size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {rows.map(({ reminder, patient, pivc }) => (
          <div key={reminder.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <ReminderIdentity patient={patient} />
              <button
                type="button"
                onClick={() => onViewDetail({ reminder, patient, pivc })}
                aria-label={`Lihat detail reminder ${patient.name}`}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
              >
                <Eye size={16} />
              </button>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 border-t border-gray-100 pt-3 text-xs text-gray-500">
              <div>
                <dt className="uppercase tracking-wide">Ruangan/Bed</dt>
                <dd className="mt-0.5 font-medium text-gray-700">
                  {patient.room} / {patient.bed}
                </dd>
              </div>
              <div>
                <dt className="uppercase tracking-wide">Interval</dt>
                <dd className="mt-0.5 font-medium text-gray-700">{formatIntervalLabel(reminder.intervalMinutes)}</dd>
              </div>
              <div className="col-span-2">
                <dt className="uppercase tracking-wide">Jadwal Berikutnya</dt>
                <dd className="mt-0.5">
                  <ScheduleCell reminder={reminder} />
                </dd>
              </div>
            </dl>
            <div className="mt-3">
              <ReminderStatusBadge status={getReminderStatus(reminder.nextMonitoringAt)} />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default ReminderTable
